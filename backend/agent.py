import os
os.environ['GLOG_minloglevel'] = '4'
os.environ['GLOG_v'] = '-1'
os.environ['GLOG_logtostderr'] = '0'
os.environ['GLOG_stderrthreshold'] = '4'
os.environ['GLOG_alsologtostderr'] = '0'
os.environ['GLOG_colorlogtostderr'] = '0'
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '4'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'
os.environ['TF_DETERMINISTIC_OPS'] = '1'
os.environ['AUTOGRAPH_VERBOSITY'] = '0'
os.environ['TF_AUTOGRAPH_VERBOSITY'] = '0'
os.environ['CUDA_VISIBLE_DEVICES'] = ''
os.environ['MEDIAPIPE_DISABLE_GPU'] = '1'
os.environ['MEDIAPIPE_DISABLE_LOG'] = '1'

import asyncio
import json
import sys
import contextlib
from io import StringIO

@contextlib.contextmanager
def suppress_stderr():
    """Aggressively suppress stderr at OS level to hide MediaPipe C++ logs"""
    import os
    import sys
    
    original_stderr_fd = os.dup(sys.stderr.fileno())
    
    try:
        devnull = os.open(os.devnull, os.O_WRONLY)
        os.dup2(devnull, sys.stderr.fileno())
        os.close(devnull)
        
        yield
        
    finally:
        os.dup2(original_stderr_fd, sys.stderr.fileno())
        os.close(original_stderr_fd)
import time
import logging
from typing import Dict, Any, Optional, List, Tuple
from collections import deque
from scipy import signal
import cv2
import numpy as np
import mediapipe as mp
from langgraph.graph import StateGraph
from typing_extensions import TypedDict

logging.getLogger('mediapipe').setLevel(logging.CRITICAL)
logging.getLogger('tensorflow').setLevel(logging.CRITICAL)
logging.getLogger('absl').setLevel(logging.CRITICAL)
logging.getLogger('absl.logging').setLevel(logging.CRITICAL)
logging.getLogger('tensorflow.lite').setLevel(logging.CRITICAL)
logging.getLogger('tensorflow.python').setLevel(logging.CRITICAL)
logging.getLogger('mediapipe.python').setLevel(logging.CRITICAL)
logging.getLogger('mediapipe.framework').setLevel(logging.CRITICAL)
logging.getLogger('mediapipe.calculators').setLevel(logging.CRITICAL)

import warnings
warnings.filterwarnings('ignore', category=UserWarning, module='tensorflow')
warnings.filterwarnings('ignore', category=FutureWarning, module='tensorflow')

try:
    import tensorflow as tf
    tf.get_logger().setLevel('FATAL')
    tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.FATAL)
    tf.autograph.set_verbosity(0)
except ImportError:
    pass

def completely_silence_mediapipe():
    """Aggressively suppress all MediaPipe/TensorFlow logging at the C++ level"""
    try:
        import absl.logging
        absl.logging.set_verbosity(absl.logging.FATAL)
        absl.logging.set_stderrthreshold(absl.logging.FATAL)
        
        import tensorflow as tf
        tf.get_logger().disabled = True
        tf.compat.v1.logging.set_verbosity(tf.compat.v1.logging.FATAL)
        
        import sys
        import os
        
        class NullLogger:
            def write(self, x): pass
            def flush(self): pass
        
        original_stderr = sys.stderr
        sys.stderr = NullLogger()
        
        return original_stderr
    except Exception:
        return None

with suppress_stderr():
    mp_pose = mp.solutions.pose
    mp_face_mesh = mp.solutions.face_mesh
    mp_drawing = mp.solutions.drawing_utils
    mp_drawing_styles = mp.solutions.drawing_styles


class BreathingTracker:
    """
    Highly sensitive breathing detection using both head and shoulder movements.
    Designed to detect even subtle breathing patterns with multiple signal sources.
    """
    
    def __init__(self, 
                 fps: float = 30.0,
                 window_seconds: float = 5.0,
                 min_amplitude: float = 0.0001,     # Very low threshold for subtle movements
                 min_cycle_time: float = 1.0,       # Minimum 1 second per breath cycle (60 BPM max)
                 max_cycle_time: float = 8.0,       # Maximum 8 seconds per breath cycle (7.5 BPM min)
                 smoothing_window: int = 3):
        self.fps = fps
        self.window_seconds = window_seconds
        self.window_frames = int(window_seconds * fps)
        self.min_amplitude = min_amplitude
        self.min_cycle_time = min_cycle_time
        self.max_cycle_time = max_cycle_time
        self.smoothing_window = smoothing_window
        
        # Data storage for multiple signals
        self.timestamps = deque(maxlen=self.window_frames * 2)
        self.head_y = deque(maxlen=self.window_frames * 2)
        self.shoulder_y = deque(maxlen=self.window_frames * 2)
        self.torso_center_y = deque(maxlen=self.window_frames * 2)
        self.combined_signal = deque(maxlen=self.window_frames * 2)
        
        # Peak detection for breathing cycles
        self.peaks = deque(maxlen=50)
        self.valleys = deque(maxlen=50)
        self.last_peak_time = 0.0
        self.last_valley_time = 0.0
        
        # Calibration and baselines
        self.calibration_frames = 0
        self.calibration_target = int(2 * fps)  # 2 seconds to calibrate
        self.is_calibrated = False
        self.baseline_head_y = None
        self.baseline_shoulder_y = None
        self.signal_range = 0.001  # Adaptive signal range
        
        # Current state
        self.current_bpm = 0.0
        self.confidence = 0.0
        self.movement_direction = 0  # -1 down, 0 neutral, 1 up
        
    def update(self, timestamp: float, nose: Tuple[float, float, float],
               left_shoulder: Tuple[float, float, float], 
               right_shoulder: Tuple[float, float, float]) -> Dict[str, Any]:
        """
        Process head and shoulder landmarks for breathing detection.
        
        Args:
            timestamp: Current timestamp in seconds
            nose: (x, y, z) coordinates of nose (head proxy)
            left_shoulder: (x, y, z) coordinates of left shoulder
            right_shoulder: (x, y, z) coordinates of right shoulder
            
        Returns:
            Dictionary with breathing metrics
        """
        # Calculate key points
        head_y = nose[1]  # Y-coordinate of head
        shoulder_midpoint_y = (left_shoulder[1] + right_shoulder[1]) / 2
        torso_center_y = (head_y + shoulder_midpoint_y) / 2
        
        # Store data
        self.timestamps.append(timestamp)
        self.head_y.append(head_y)
        self.shoulder_y.append(shoulder_midpoint_y)
        self.torso_center_y.append(torso_center_y)
        
        # Calibration phase
        if not self.is_calibrated:
            self.calibration_frames += 1
            if self.baseline_head_y is None:
                self.baseline_head_y = head_y
                self.baseline_shoulder_y = shoulder_midpoint_y
            else:
                # Update baselines
                alpha = 0.1
                self.baseline_head_y = (1 - alpha) * self.baseline_head_y + alpha * head_y
                self.baseline_shoulder_y = (1 - alpha) * self.baseline_shoulder_y + alpha * shoulder_midpoint_y
            
            if self.calibration_frames >= self.calibration_target:
                self.is_calibrated = True
                print(f"🫁 Breathing tracker calibrated with baselines: head={self.baseline_head_y:.4f}, shoulder={self.baseline_shoulder_y:.4f}")
            
            return {
                "bpm": 0.0,
                "confidence": 0.0,
                "calibrated": False,
                "status": "calibrating"
            }
        
        # Create combined breathing signal from multiple sources
        head_deviation = head_y - self.baseline_head_y
        shoulder_deviation = shoulder_midpoint_y - self.baseline_shoulder_y
        
        # Weight head movement more as it's typically more pronounced during breathing
        combined_signal = 0.7 * head_deviation + 0.3 * shoulder_deviation
        self.combined_signal.append(combined_signal)
        
        # Need enough data points for analysis
        if len(self.combined_signal) < 30:  # 1 second at 30 fps
            return {
                "bpm": 0.0,
                "confidence": 0.0,
                "calibrated": True,
                "status": "insufficient_data"
            }
        
        # Smooth the signal
        smoothed_signal = self._smooth_signal(list(self.combined_signal)[-30:])  # Last 1 second
        
        # Detect peaks and valleys for breathing cycles
        self._detect_breathing_cycles(timestamp, smoothed_signal[-1] if smoothed_signal else 0)
        
        # Calculate BPM from recent breathing cycles
        bpm, confidence = self._calculate_bpm(timestamp)
        
        self.current_bpm = bpm
        self.confidence = confidence
        
        return {
            "bpm": round(bpm, 1),
            "confidence": round(confidence, 3),
            "calibrated": True,
            "status": "active",
            "debug": {
                "head_y": round(head_y, 4),
                "shoulder_y": round(shoulder_midpoint_y, 4),
                "head_deviation": round(head_deviation, 4),
                "shoulder_deviation": round(shoulder_deviation, 4),
                "combined_signal": round(combined_signal, 4),
                "recent_peaks": len(self.peaks),
                "recent_valleys": len(self.valleys)
            }
        }
    
    def _smooth_signal(self, signal: List[float]) -> List[float]:
        """Apply simple moving average smoothing."""
        if len(signal) < self.smoothing_window:
            return signal
        
        smoothed = []
        for i in range(len(signal)):
            start_idx = max(0, i - self.smoothing_window + 1)
            end_idx = i + 1
            window_values = signal[start_idx:end_idx]
            smoothed.append(sum(window_values) / len(window_values))
        
        return smoothed
    
    def _detect_breathing_cycles(self, timestamp: float, current_signal: float):
        """Detect peaks and valleys in the breathing signal."""
        if len(self.combined_signal) < 3:
            return
        
        # Get recent signal values
        signals = list(self.combined_signal)[-3:]
        
        # Check for peak (local maximum)
        if len(signals) >= 3 and signals[1] > signals[0] and signals[1] > signals[2]:
            # Ensure minimum time between peaks and sufficient amplitude
            if (timestamp - self.last_peak_time > self.min_cycle_time / 2 and 
                abs(signals[1]) > self.min_amplitude):
                self.peaks.append({"time": timestamp, "value": signals[1]})
                self.last_peak_time = timestamp
                self.movement_direction = -1  # Start of exhale
        
        # Check for valley (local minimum)
        elif len(signals) >= 3 and signals[1] < signals[0] and signals[1] < signals[2]:
            # Ensure minimum time between valleys and sufficient amplitude
            if (timestamp - self.last_valley_time > self.min_cycle_time / 2 and 
                abs(signals[1]) > self.min_amplitude):
                self.valleys.append({"time": timestamp, "value": signals[1]})
                self.last_valley_time = timestamp
                self.movement_direction = 1  # Start of inhale
    
    def _calculate_bpm(self, timestamp: float) -> Tuple[float, float]:
        """Calculate breathing rate from recent peaks and valleys."""
        # Filter recent peaks and valleys (within window)
        recent_peaks = [p for p in self.peaks if timestamp - p["time"] <= self.window_seconds]
        recent_valleys = [v for v in self.valleys if timestamp - v["time"] <= self.window_seconds]
        
        # Need at least 2 complete cycles (2 peaks and 2 valleys)
        if len(recent_peaks) < 2 or len(recent_valleys) < 2:
            return 0.0, 0.0
        
        # Calculate cycle times from peaks
        peak_times = [p["time"] for p in recent_peaks]
        peak_intervals = [peak_times[i] - peak_times[i-1] for i in range(1, len(peak_times))]
        
        # Calculate cycle times from valleys
        valley_times = [v["time"] for v in recent_valleys]
        valley_intervals = [valley_times[i] - valley_times[i-1] for i in range(1, len(valley_times))]
        
        # Combine intervals and filter valid ones
        all_intervals = peak_intervals + valley_intervals
        valid_intervals = [interval for interval in all_intervals 
                          if self.min_cycle_time <= interval <= self.max_cycle_time]
        
        if not valid_intervals:
            return 0.0, 0.0
        
        # Calculate average cycle time and convert to BPM
        avg_cycle_time = sum(valid_intervals) / len(valid_intervals)
        bpm = 60.0 / avg_cycle_time
        
        # Calculate confidence based on consistency of intervals
        if len(valid_intervals) > 1:
            interval_std = (sum((x - avg_cycle_time) ** 2 for x in valid_intervals) / len(valid_intervals)) ** 0.5
            consistency = max(0, 1 - (interval_std / avg_cycle_time))
            data_completeness = min(1.0, len(valid_intervals) / 3)  # Prefer 3+ intervals
            confidence = consistency * data_completeness
        else:
            confidence = 0.3  # Low confidence with single interval
        
        return bpm, confidence
        

class MLDataAggregator:
    """
    Aggregate physiological and behavioral data over time windows for ML training.
    Reduces dimensionality and focuses on meaningful patterns.
    """
    
    def __init__(self, window_seconds=5, fps=30.0):
        self.window_seconds = window_seconds
        self.window_size = int(window_seconds * fps)  # Still use for maxlen, but not for export trigger
        self.data_buffer = deque(maxlen=self.window_size)
        self.export_counter = 0
        self.last_export_time = None
        
    def add_frame_data(self, frame_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Add frame data and return aggregated features if window is complete."""
        import time
        current_time = time.time()
        
        self.data_buffer.append(frame_data)
        
        # Time-based export: check if enough time has passed since last export
        if self.last_export_time is None:
            self.last_export_time = current_time
            
        time_since_export = current_time - self.last_export_time
        
        # Export if we have enough data AND enough time has passed
        if len(self.data_buffer) >= 30 and time_since_export >= self.window_seconds:
            aggregated = self._aggregate_window()
            self.export_counter += 1
            self.last_export_time = current_time
            
            return aggregated
        return None
    
    def _aggregate_window(self) -> Dict[str, Any]:
        """Aggregate data from the current window into ML features."""
        breathing_data = []
        facial_features = []
        eye_features = []
        posture_features = []
        
        for frame in self.data_buffer:
            ml_features = frame.get("ml_features", {})
            if ml_features and (ml_features.get("calibrated", False) or 
                              ml_features.get("breathing_features", {}).get("bpm", 0) > 0):
                breathing_data.append(ml_features.get("breathing_features", {}))
                facial_features.append(ml_features.get("facial_features", {}))
                eye_features.append(ml_features.get("eye_features", {}))
                posture_features.append(ml_features.get("posture_features", {}))
        
        if len(breathing_data) < len(self.data_buffer) * 0.1:
            return {"status": "insufficient_data", "valid_frames": len(breathing_data), "total_frames": len(self.data_buffer)}
        
        aggregated = {
            "window_id": self.export_counter,
            "timestamp_start": self.data_buffer[0]["timestamp"],
            "timestamp_end": self.data_buffer[-1]["timestamp"],
            "duration_seconds": self.data_buffer[-1]["timestamp"] - self.data_buffer[0]["timestamp"],
            "frame_count": len(self.data_buffer),
            "valid_frames": len(breathing_data),
            
            "breathing_analysis": self._aggregate_breathing(breathing_data),
            "facial_analysis": self._aggregate_facial(facial_features),
            "eye_analysis": self._aggregate_eye(eye_features),
            "posture_analysis": self._aggregate_posture(posture_features),
            "behavioral_patterns": self._analyze_behavioral_patterns(
                breathing_data, facial_features, eye_features, posture_features
            )
        }
        
        return aggregated
    
    def _aggregate_breathing(self, breathing_data: List[Dict]) -> Dict[str, float]:
        """Aggregate breathing patterns over the time window."""
        if not breathing_data:
            return {}
            
        bpm_values = [b.get("bpm", 0) for b in breathing_data if b.get("bpm", 0) > 0]
        confidence_values = [b.get("confidence", 0) for b in breathing_data]
        variability_values = [b.get("variability", 0) for b in breathing_data]
        
        if not bpm_values:
            return {"status": "no_breathing_data"}
        
        return {
            "mean_bpm": np.mean(bpm_values),
            "median_bpm": np.median(bpm_values),
            "mode_bpm": self._calculate_mode(bpm_values),
            "bpm_std": np.std(bpm_values),
            "bpm_range": max(bpm_values) - min(bpm_values),
            "bpm_iqr": np.percentile(bpm_values, 75) - np.percentile(bpm_values, 25),
            "mean_confidence": np.mean(confidence_values),
            "confidence_stability": 1.0 - np.std(confidence_values),
            "mean_variability": np.mean(variability_values),
            "bpm_trend": self._calculate_trend(bpm_values),
            "bpm_acceleration": self._calculate_acceleration(bpm_values),
            "max_bpm": max(bpm_values),
            "min_bpm": min(bpm_values),
            "bpm_spikes": len([b for b in bpm_values if b > np.mean(bpm_values) + 2*np.std(bpm_values)]),
            "time_slow_breathing": len([b for b in bpm_values if b < 12]) / len(bpm_values),
            "time_normal_breathing": len([b for b in bpm_values if 12 <= b <= 20]) / len(bpm_values),
            "time_fast_breathing": len([b for b in bpm_values if b > 20]) / len(bpm_values)
        }
    
    def _aggregate_facial(self, facial_data: List[Dict]) -> Dict[str, float]:
        """Aggregate facial expression patterns."""
        if not facial_data:
            return {}
            
        jaw_width = [f.get("jaw_width", 0) for f in facial_data if f.get("jaw_width", 0) > 0]
        mouth_curvature = [f.get("mouth_curvature", 0) for f in facial_data]
        eyebrow_height = [f.get("eyebrow_height", 0) for f in facial_data if f.get("eyebrow_height", 0) > 0]
        
        if not jaw_width:
            return {"status": "no_facial_data"}
        
        return {
            "mean_jaw_width": np.mean(jaw_width),
            "jaw_width_std": np.std(jaw_width),
            "jaw_tension_episodes": len([j for j in jaw_width if j < np.mean(jaw_width) - np.std(jaw_width)]),
            "mean_mouth_curvature": np.mean(mouth_curvature),
            "smile_frequency": len([m for m in mouth_curvature if m > 0.01]) / len(mouth_curvature),
            "frown_frequency": len([m for m in mouth_curvature if m < -0.01]) / len(mouth_curvature),
            "expression_stability": 1.0 - np.std(mouth_curvature),
            "mean_eyebrow_height": np.mean(eyebrow_height) if eyebrow_height else 0.0,
            "eyebrow_height_std": np.std(eyebrow_height) if eyebrow_height else 0.0,
            "eyebrow_tension_episodes": len([e for e in eyebrow_height if e < 0.3]) if eyebrow_height else 0,
            "facial_movement_intensity": self._calculate_movement_intensity(facial_data),
            "facial_stability_score": self._calculate_facial_stability(facial_data)
        }
    
    def _aggregate_eye(self, eye_data: List[Dict]) -> Dict[str, float]:
        """Aggregate eye behavior patterns."""
        if not eye_data:
            return {}
            
        left_openness = [e.get("left_eye_openness", 1.0) for e in eye_data]
        right_openness = [e.get("right_eye_openness", 1.0) for e in eye_data]
        asymmetry = [e.get("eye_asymmetry", 0.0) for e in eye_data]
        
        return {
            "mean_eye_openness": np.mean([(l + r) / 2 for l, r in zip(left_openness, right_openness)]),
            "eye_openness_std": np.std([(l + r) / 2 for l, r in zip(left_openness, right_openness)]),
            "low_openness_episodes": len([o for o in left_openness if o < 0.02]),
            "blink_frequency": self._estimate_blink_frequency(left_openness),
            "mean_asymmetry": np.mean(asymmetry),
            "high_asymmetry_episodes": len([a for a in asymmetry if a > 0.05]),
            "eye_fatigue_trend": self._calculate_trend([(l + r) / 2 for l, r in zip(left_openness, right_openness)]),
            "eye_stability": 1.0 - np.std(asymmetry),
            "sustained_attention_score": self._calculate_attention_score(left_openness, right_openness)
        }
    
    def _aggregate_posture(self, posture_data: List[Dict]) -> Dict[str, float]:
        """Aggregate posture patterns."""
        if not posture_data:
            return {}
            
        shoulder_height = [p.get("shoulder_height_avg", 0) for p in posture_data if p.get("shoulder_height_avg", 0) > 0]
        shoulder_asymmetry = [p.get("shoulder_asymmetry", 0) for p in posture_data]
        head_distance = [p.get("head_shoulder_distance", 0) for p in posture_data if p.get("head_shoulder_distance", 0) > 0]
        
        if not shoulder_height:
            return {"status": "no_posture_data"}
        
        return {
            "mean_shoulder_height": np.mean(shoulder_height),
            "shoulder_height_std": np.std(shoulder_height),
            "shoulder_tension_trend": self._calculate_trend(shoulder_height),
            "mean_shoulder_asymmetry": np.mean(shoulder_asymmetry),
            "high_asymmetry_episodes": len([a for a in shoulder_asymmetry if a > 0.03]),
            "mean_head_distance": np.mean(head_distance) if head_distance else 0.0,
            "head_forward_episodes": len([h for h in head_distance if h < 0.1]) if head_distance else 0,
            "posture_stability": self._calculate_posture_stability(posture_data),
            "movement_intensity": self._calculate_movement_intensity(posture_data)
        }
    
    def _analyze_behavioral_patterns(self, breathing_data: List[Dict], facial_data: List[Dict], 
                                   eye_data: List[Dict], posture_data: List[Dict]) -> Dict[str, float]:
        """Analyze cross-feature behavioral patterns."""
        if not breathing_data or not facial_data:
            return {}
        bpm_series = [b.get("bpm", 0) for b in breathing_data if b.get("bpm", 0) > 0]
        jaw_series = [f.get("jaw_width", 0) for f in facial_data if f.get("jaw_width", 0) > 0]
        eye_series = [(e.get("left_eye_openness", 1) + e.get("right_eye_openness", 1)) / 2 for e in eye_data]
        
        min_length = min(len(bpm_series), len(jaw_series), len(eye_series))
        if min_length < 5:
            return {"status": "insufficient_data_for_correlation"}
        bpm_series = bpm_series[:min_length]
        jaw_series = jaw_series[:min_length]
        eye_series = eye_series[:min_length]
        
        return {
            "breathing_jaw_correlation": np.corrcoef(bpm_series, jaw_series)[0, 1] if len(bpm_series) > 1 else 0.0,
            "breathing_eye_correlation": np.corrcoef(bpm_series, eye_series)[0, 1] if len(bpm_series) > 1 else 0.0,
            "jaw_eye_correlation": np.corrcoef(jaw_series, eye_series)[0, 1] if len(jaw_series) > 1 else 0.0,
            "physiological_coherence": self._calculate_coherence(bpm_series, jaw_series, eye_series),
            "stress_response_coordination": self._calculate_stress_coordination(breathing_data, facial_data, eye_data),
            "behavioral_volatility": self._calculate_overall_volatility(bpm_series, jaw_series, eye_series)
        }
    
    def _calculate_mode(self, values: List[float]) -> float:
        """Calculate approximate mode for continuous data."""
        if not values:
            return 0.0
        hist, bins = np.histogram(values, bins=10)
        mode_bin = bins[np.argmax(hist)]
        return mode_bin
    
    def _calculate_trend(self, values: List[float]) -> float:
        """Calculate linear trend slope."""
        if len(values) < 3:
            return 0.0
        x = np.arange(len(values))
        slope, _ = np.polyfit(x, values, 1)
        return slope
    
    def _calculate_acceleration(self, values: List[float]) -> float:
        """Calculate acceleration (second derivative)."""
        if len(values) < 3:
            return 0.0
        diff1 = np.diff(values)
        diff2 = np.diff(diff1)
        return np.mean(diff2)
    
    def _calculate_movement_intensity(self, data: List[Dict]) -> float:
        """Calculate overall movement intensity."""
        if len(data) < 2:
            return 0.0
        intensity = 0.0
        feature_count = 0
        for key in data[0].keys():
            if isinstance(data[0][key], (int, float)):
                values = [d.get(key, 0) for d in data]
                intensity += np.sum(np.abs(np.diff(values)))
                feature_count += 1
        return intensity / feature_count if feature_count > 0 else 0.0
    
    def _calculate_facial_stability(self, facial_data: List[Dict]) -> float:
        """Calculate facial expression stability."""
        if len(facial_data) < 2:
            return 1.0
        stabilities = []
        for key in ["jaw_width", "mouth_curvature", "eyebrow_height"]:
            values = [f.get(key, 0) for f in facial_data if f.get(key, 0) > 0]
            if len(values) > 1:
                stability = 1.0 / (1.0 + np.std(values))
                stabilities.append(stability)
        return np.mean(stabilities) if stabilities else 1.0
    
    def _estimate_blink_frequency(self, openness_values: List[float]) -> float:
        """Estimate blink frequency from eye openness."""
        if len(openness_values) < 10:
            return 0.0
        blinks = 0
        threshold = 0.01
        for i in range(1, len(openness_values)):
            if openness_values[i-1] > threshold and openness_values[i] <= threshold:
                blinks += 1
        duration_minutes = len(openness_values) / (30.0 * 60.0)
        return blinks / duration_minutes if duration_minutes > 0 else 0.0
    
    def _calculate_attention_score(self, left_openness: List[float], right_openness: List[float]) -> float:
        """Calculate sustained attention score."""
        if not left_openness or not right_openness:
            return 0.0
        avg_openness = np.mean([(l + r) / 2 for l, r in zip(left_openness, right_openness)])
        openness_consistency = 1.0 - np.std([(l + r) / 2 for l, r in zip(left_openness, right_openness)])
        symmetry_score = 1.0 - np.mean([abs(l - r) for l, r in zip(left_openness, right_openness)])
        return (avg_openness + openness_consistency + symmetry_score) / 3
    
    def _calculate_posture_stability(self, posture_data: List[Dict]) -> float:
        """Calculate overall posture stability."""
        if len(posture_data) < 2:
            return 1.0
        shoulder_values = [p.get("shoulder_height_avg", 0) for p in posture_data if p.get("shoulder_height_avg", 0) > 0]
        if len(shoulder_values) < 2:
            return 1.0
        return 1.0 / (1.0 + np.std(shoulder_values))
    
    def _calculate_coherence(self, series1: List[float], series2: List[float], series3: List[float]) -> float:
        """Calculate physiological coherence between different signals."""
        if len(series1) < 3 or len(series2) < 3 or len(series3) < 3:
            return 0.0
        corr1 = abs(np.corrcoef(series1, series2)[0, 1]) if not np.isnan(np.corrcoef(series1, series2)[0, 1]) else 0.0
        corr2 = abs(np.corrcoef(series1, series3)[0, 1]) if not np.isnan(np.corrcoef(series1, series3)[0, 1]) else 0.0
        corr3 = abs(np.corrcoef(series2, series3)[0, 1]) if not np.isnan(np.corrcoef(series2, series3)[0, 1]) else 0.0
        return (corr1 + corr2 + corr3) / 3
    
    def _calculate_stress_coordination(self, breathing_data: List[Dict], facial_data: List[Dict], eye_data: List[Dict]) -> float:
        """Calculate coordination of stress responses across modalities."""
        stress_moments = []
        for i in range(min(len(breathing_data), len(facial_data), len(eye_data))):
            b = breathing_data[i]
            f = facial_data[i]  
            e = eye_data[i]
            breathing_stress = 1 if b.get("bpm", 0) > 24 else 0
            facial_stress = 1 if f.get("jaw_width", 0) < 0.08 else 0  
            eye_stress = 1 if e.get("avg_eye_openness", 1) < 0.02 else 0
            
            stress_moments.append(breathing_stress + facial_stress + eye_stress)
        
        if not stress_moments:
            return 0.0
        
        coordinated_moments = len([s for s in stress_moments if s >= 2])
        return coordinated_moments / len(stress_moments)
    
    def _calculate_overall_volatility(self, series1: List[float], series2: List[float], series3: List[float]) -> float:
        """Calculate overall behavioral volatility."""
        volatilities = []
        for series in [series1, series2, series3]:
            if len(series) > 1:
                volatility = np.std(np.diff(series))
                volatilities.append(volatility)
        return np.mean(volatilities) if volatilities else 0.0


class FeatureExtractor:
    """
    Extract semantic features from landmarks for ML training.
    Provides meaningful measurements without rule-based classification.
    """
    
    def __init__(self):
        self.breathing_history = deque(maxlen=30)
        self.facial_history = deque(maxlen=30)
        self.eye_history = deque(maxlen=30)
        self.posture_history = deque(maxlen=30)
        
        self.baseline_samples = 0
        self.baseline_target = 10
        self.baseline_breathing_bpm = None
        self.baseline_eye_openness = None
        self.baseline_shoulder_height = None
        self.baseline_jaw_width = None
        
    def extract_features(self, landmark_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract comprehensive features for ML training.
        Returns measurements without classification.
        """
        pose_data = landmark_data.get("pose_landmarks")
        face_data = landmark_data.get("face_landmarks") 
        breathing_data = landmark_data.get("breathing", {})
        
        features = {
            "breathing_features": self._extract_breathing_features(breathing_data),
            "facial_features": self._extract_facial_features(face_data),
            "eye_features": self._extract_eye_features(face_data),
            "posture_features": self._extract_posture_features(pose_data),
            "temporal_features": self._extract_temporal_features(),
            "calibrated": self.baseline_samples >= self.baseline_target
        }
        
        self._update_history(features)
        
        return features
    
    def _extract_breathing_features(self, breathing_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract breathing measurements for ML training."""
        if not breathing_data.get("calibrated", False):
            return {"bpm": 0.0, "confidence": 0.0, "pattern_stability": 0.0, "rate_deviation": 0.0}
            
        bpm = breathing_data.get("bpm", 0)
        confidence = breathing_data.get("confidence", 0)
        
        if self.baseline_breathing_bpm:
            rate_deviation = abs(bpm - self.baseline_breathing_bpm) / self.baseline_breathing_bpm
        else:
            rate_deviation = 0.0
        pattern_stability = confidence
        self.breathing_history.append({"bpm": bpm, "confidence": confidence})
        variability = self._compute_breathing_variability()
        
        return {
            "bpm": bpm,
            "confidence": confidence,
            "pattern_stability": pattern_stability,
            "rate_deviation": rate_deviation,
            "variability": variability,
            "baseline_bpm": self.baseline_breathing_bpm or 0.0
        }
    
    def _extract_facial_features(self, face_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract facial measurements for ML training."""
        if not face_data or not face_data.get("coordinates"):
            return {"jaw_width": 0.0, "jaw_height": 0.0, "mouth_area": 0.0, "eyebrow_height": 0.0, 
                   "eyebrow_distance": 0.0, "lip_thickness": 0.0, "mouth_curvature": 0.0}
            
        coords = face_data["coordinates"]
        breakdown = face_data.get("feature_breakdown", {})
        
        features = self._extract_facial_landmarks(coords, breakdown)
        jaw_width, jaw_height = self._measure_jaw(features.get("lips", []))
        mouth_area = jaw_width * jaw_height
        eyebrow_height = self._measure_eyebrow_height(
            features.get("left_eyebrow", []), 
            features.get("right_eyebrow", [])
        )
        eyebrow_distance = self._measure_eyebrow_distance(
            features.get("left_eyebrow", []), 
            features.get("right_eyebrow", [])
        )
        
        lip_thickness = self._measure_lip_thickness(features.get("lips", []))
        mouth_curvature = self._measure_mouth_curvature(features.get("lips", []))
        
        jaw_width_deviation = 0.0
        if self.baseline_jaw_width:
            jaw_width_deviation = abs(jaw_width - self.baseline_jaw_width) / self.baseline_jaw_width
        
        return {
            "jaw_width": jaw_width,
            "jaw_height": jaw_height,
            "mouth_area": mouth_area,
            "eyebrow_height": eyebrow_height,
            "eyebrow_distance": eyebrow_distance,
            "lip_thickness": lip_thickness,
            "mouth_curvature": mouth_curvature,
            "jaw_width_deviation": jaw_width_deviation,
            "baseline_jaw_width": self.baseline_jaw_width or 0.0
        }
    
    def _extract_eye_features(self, face_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract eye measurements for ML training."""
        if not face_data or not face_data.get("coordinates"):
            return {"left_eye_openness": 1.0, "right_eye_openness": 1.0, "eye_asymmetry": 0.0, 
                   "avg_eye_openness": 1.0, "openness_deviation": 0.0}
            
        coords = face_data["coordinates"]
        breakdown = face_data.get("feature_breakdown", {})
        features = self._extract_facial_landmarks(coords, breakdown)
        
        left_openness = self._measure_eye_openness(features.get("left_eye", []))
        right_openness = self._measure_eye_openness(features.get("right_eye", []))
        avg_openness = (left_openness + right_openness) / 2
        
        eye_asymmetry = abs(left_openness - right_openness)
        
        openness_deviation = 0.0
        if self.baseline_eye_openness:
            openness_deviation = abs(avg_openness - self.baseline_eye_openness) / self.baseline_eye_openness
        
        return {
            "left_eye_openness": left_openness,
            "right_eye_openness": right_openness,
            "eye_asymmetry": eye_asymmetry,
            "avg_eye_openness": avg_openness,
            "openness_deviation": openness_deviation,
            "baseline_eye_openness": self.baseline_eye_openness or 0.0
        }
    
    def _extract_posture_features(self, pose_data: Dict[str, Any]) -> Dict[str, float]:
        """Extract posture measurements for ML training."""
        if not pose_data or not pose_data.get("coordinates"):
            return {"shoulder_height_avg": 0.0, "shoulder_asymmetry": 0.0, "head_shoulder_distance": 0.0, 
                   "shoulder_height_deviation": 0.0}
            
        coords = pose_data["coordinates"]
        
        nose_y = coords[1]
        left_shoulder_x, left_shoulder_y = coords[4], coords[5]
        right_shoulder_x, right_shoulder_y = coords[8], coords[9]
        
        avg_shoulder_height = (left_shoulder_y + right_shoulder_y) / 2
        shoulder_asymmetry = abs(left_shoulder_y - right_shoulder_y)
        head_shoulder_distance = abs(nose_y - avg_shoulder_height)
        
        shoulder_height_deviation = 0.0
        if self.baseline_shoulder_height:
            shoulder_height_deviation = abs(avg_shoulder_height - self.baseline_shoulder_height) / self.baseline_shoulder_height
        
        return {
            "shoulder_height_avg": avg_shoulder_height,
            "shoulder_asymmetry": shoulder_asymmetry,
            "head_shoulder_distance": head_shoulder_distance,
            "shoulder_height_deviation": shoulder_height_deviation,
            "baseline_shoulder_height": self.baseline_shoulder_height or 0.0,
            "left_shoulder_height": left_shoulder_y,
            "right_shoulder_height": right_shoulder_y
        }
    
    def _extract_temporal_features(self) -> Dict[str, float]:
        """Extract temporal/trend features from history."""
        breathing_trend = self._compute_breathing_trend()
        facial_stability = self._compute_facial_stability()
        eye_trend = self._compute_eye_trend()
        posture_stability = self._compute_posture_stability()
        
        return {
            "breathing_trend": breathing_trend,
            "facial_stability": facial_stability,
            "eye_trend": eye_trend,
            "posture_stability": posture_stability
        }
    
    def _extract_facial_landmarks(self, coords: List[float], breakdown: Dict[str, int]) -> Dict[str, List[Tuple[float, float, float]]]:
        """Extract organized facial feature coordinates."""
        features = {}
        offset = 0
        
        for feature_name, count in breakdown.items():
            feature_coords = []
            for i in range(count):
                idx = offset + i * 3
                if idx + 2 < len(coords):
                    feature_coords.append((coords[idx], coords[idx + 1], coords[idx + 2]))
            features[feature_name] = feature_coords
            offset += count * 3
            
        return features
    
    def _measure_eye_openness(self, eye_coords: List[Tuple[float, float, float]]) -> float:
        """Measure eye openness ratio."""
        if len(eye_coords) < 6:
            return 1.0
            
        top_points = sorted(eye_coords, key=lambda p: p[1])[:3]
        bottom_points = sorted(eye_coords, key=lambda p: p[1], reverse=True)[:3]
        
        avg_top_y = sum(p[1] for p in top_points) / len(top_points)
        avg_bottom_y = sum(p[1] for p in bottom_points) / len(bottom_points)
        
        return max(0.0, avg_bottom_y - avg_top_y)
    
    def _measure_jaw(self, lip_coords: List[Tuple[float, float, float]]) -> Tuple[float, float]:
        """Measure jaw width and height."""
        if len(lip_coords) < 4:
            return 0.0, 0.0
            
        left_most = min(lip_coords, key=lambda p: p[0])
        right_most = max(lip_coords, key=lambda p: p[0])
        top_most = min(lip_coords, key=lambda p: p[1])
        bottom_most = max(lip_coords, key=lambda p: p[1])
        
        width = right_most[0] - left_most[0]
        height = bottom_most[1] - top_most[1]
        
        return width, height
    
    def _measure_eyebrow_height(self, left_brow: List[Tuple[float, float, float]], 
                               right_brow: List[Tuple[float, float, float]]) -> float:
        """Measure average eyebrow height."""
        if len(left_brow) < 3 or len(right_brow) < 3:
            return 0.0
            
        left_avg_y = sum(p[1] for p in left_brow) / len(left_brow)
        right_avg_y = sum(p[1] for p in right_brow) / len(right_brow)
        
        return (left_avg_y + right_avg_y) / 2
    
    def _measure_eyebrow_distance(self, left_brow: List[Tuple[float, float, float]], 
                                 right_brow: List[Tuple[float, float, float]]) -> float:
        """Measure distance between eyebrows."""
        if len(left_brow) < 3 or len(right_brow) < 3:
            return 0.0
            
        left_inner = min(left_brow, key=lambda p: abs(p[0] - 0.5))
        right_inner = min(right_brow, key=lambda p: abs(p[0] - 0.5))
        
        return abs(right_inner[0] - left_inner[0])
    
    def _measure_lip_thickness(self, lip_coords: List[Tuple[float, float, float]]) -> float:
        """Measure lip thickness."""
        if len(lip_coords) < 8:
            return 0.0
            
        center_y = sum(p[1] for p in lip_coords) / len(lip_coords)
        upper_lip = [p for p in lip_coords if p[1] < center_y]
        lower_lip = [p for p in lip_coords if p[1] >= center_y]
        
        if len(upper_lip) == 0 or len(lower_lip) == 0:
            return 0.0
            
        avg_upper_y = sum(p[1] for p in upper_lip) / len(upper_lip)
        avg_lower_y = sum(p[1] for p in lower_lip) / len(lower_lip)
        
        return avg_lower_y - avg_upper_y
    
    def _measure_mouth_curvature(self, lip_coords: List[Tuple[float, float, float]]) -> float:
        """Measure mouth curvature (positive = upward, negative = downward)."""
        if len(lip_coords) < 6:
            return 0.0
            
        left_corner = min(lip_coords, key=lambda p: p[0])
        right_corner = max(lip_coords, key=lambda p: p[0])
        center_y = sum(p[1] for p in lip_coords) / len(lip_coords)
        
        corner_avg_y = (left_corner[1] + right_corner[1]) / 2
        
        return center_y - corner_avg_y
    
    def _compute_breathing_variability(self) -> float:
        """Compute breathing variability from recent history."""
        if len(self.breathing_history) < 5:
            return 0.0
            
        bpm_values = [b["bpm"] for b in self.breathing_history if b["bpm"] > 0]
        if len(bpm_values) < 3:
            return 0.0
            
        mean_bpm = sum(bpm_values) / len(bpm_values)
        variance = sum((bpm - mean_bpm) ** 2 for bpm in bpm_values) / len(bpm_values)
        
        return variance ** 0.5
    
    def _compute_breathing_trend(self) -> float:
        """Compute breathing rate trend over time."""
        if len(self.breathing_history) < 10:
            return 0.0
            
        bpm_values = [b["bpm"] for b in self.breathing_history if b["bpm"] > 0]
        if len(bpm_values) < 5:
            return 0.0
            
        mid = len(bpm_values) // 2
        first_half_avg = sum(bpm_values[:mid]) / mid
        second_half_avg = sum(bpm_values[mid:]) / (len(bpm_values) - mid)
        
        return second_half_avg - first_half_avg
    
    def _compute_facial_stability(self) -> float:
        """Compute facial feature stability over time."""
        if len(self.facial_history) < 5:
            return 1.0
            
        jaw_widths = [f.get("jaw_width", 0) for f in self.facial_history if f.get("jaw_width", 0) > 0]
        if len(jaw_widths) < 3:
            return 1.0
            
        mean_width = sum(jaw_widths) / len(jaw_widths)
        variance = sum((w - mean_width) ** 2 for w in jaw_widths) / len(jaw_widths)
        
        return 1.0 / (1.0 + variance * 100)
    
    def _compute_eye_trend(self) -> float:
        """Compute eye openness trend over time."""
        if len(self.eye_history) < 10:
            return 0.0
            
        openness_values = [e.get("avg_eye_openness", 1.0) for e in self.eye_history]
        if len(openness_values) < 5:
            return 0.0
            
        mid = len(openness_values) // 2
        first_half_avg = sum(openness_values[:mid]) / mid
        second_half_avg = sum(openness_values[mid:]) / (len(openness_values) - mid)
        
        return second_half_avg - first_half_avg
    
    def _compute_posture_stability(self) -> float:
        """Compute posture stability over time."""
        if len(self.posture_history) < 5:
            return 1.0
            
        shoulder_heights = [p.get("shoulder_height_avg", 0) for p in self.posture_history if p.get("shoulder_height_avg", 0) > 0]
        if len(shoulder_heights) < 3:
            return 1.0
            
        mean_height = sum(shoulder_heights) / len(shoulder_heights)
        variance = sum((h - mean_height) ** 2 for h in shoulder_heights) / len(shoulder_heights)
        
        return 1.0 / (1.0 + variance * 1000)
    
    def _update_history(self, features: Dict[str, Any]):
        """Update historical data for temporal features."""
        self.facial_history.append(features["facial_features"])
        self.eye_history.append(features["eye_features"])
        self.posture_history.append(features["posture_features"])
        
        if self.baseline_samples < self.baseline_target:
            self._update_baseline(features)
            self.baseline_samples += 1
    
    def _update_baseline(self, features: Dict[str, Any]):
        """Update baseline measurements during calibration."""
        breathing = features["breathing_features"]
        if breathing.get("bpm", 0) > 0:
            if self.baseline_breathing_bpm is None:
                self.baseline_breathing_bpm = breathing["bpm"]
            else:
                self.baseline_breathing_bpm = 0.9 * self.baseline_breathing_bpm + 0.1 * breathing["bpm"]
        
        eye_features = features["eye_features"]
        avg_openness = eye_features["avg_eye_openness"]
        if self.baseline_eye_openness is None:
            self.baseline_eye_openness = avg_openness
        else:
            self.baseline_eye_openness = 0.9 * self.baseline_eye_openness + 0.1 * avg_openness
            
        posture = features["posture_features"]
        if posture.get("shoulder_height_avg", 0) > 0:
            if self.baseline_shoulder_height is None:
                self.baseline_shoulder_height = posture["shoulder_height_avg"]
            else:
                self.baseline_shoulder_height = 0.9 * self.baseline_shoulder_height + 0.1 * posture["shoulder_height_avg"]
                
        facial = features["facial_features"]
        if facial.get("jaw_width", 0) > 0:
            if self.baseline_jaw_width is None:
                self.baseline_jaw_width = facial["jaw_width"]
            else:
                self.baseline_jaw_width = 0.9 * self.baseline_jaw_width + 0.1 * facial["jaw_width"]


class AgentState(TypedDict):
    frame: Optional[np.ndarray]
    pose_landmarks: Optional[Any]
    face_landmarks: Optional[Any]
    frame_count: int
    last_detection_time: float
    status: str
    landmark_data: Optional[Dict[str, Any]]
    breathing_tracker: Optional[Any]
    feature_extractor: Optional[Any]
    ml_aggregator: Optional[Any]

def load_latest_frame() -> Optional[np.ndarray]:
    """Load the latest frame with corruption protection and multiple attempts."""
    frame_dir = os.path.join(os.path.dirname(__file__), "frames")
    frame_path = os.path.join(frame_dir, "latest_frame.jpg")
    
    # Try multiple times with small delays to avoid race conditions
    for attempt in range(3):
        try:
            # Check if file exists and has reasonable size (> 1KB to avoid partial writes)
            if os.path.exists(frame_path):
                file_size = os.path.getsize(frame_path)
                if file_size > 1024:  # At least 1KB for a valid JPEG
                    frame = cv2.imread(frame_path, cv2.IMREAD_COLOR)
                    if frame is not None and frame.size > 0:
                        return frame
            
            # Small delay before retry to let WebRTC finish writing
            if attempt < 2:
                time.sleep(0.001)
                
        except Exception as e:
            if attempt == 2:  # Only log on final attempt
                if not hasattr(load_latest_frame, 'error_count'):
                    load_latest_frame.error_count = 0
                load_latest_frame.error_count += 1
                
                if load_latest_frame.error_count % 50 == 1:
                    print(f"⚠️ Failed to load frame after {attempt+1} attempts: {e}")
    
    return None


def capture_frame_node(state: AgentState) -> AgentState:
    """Node: Capture the latest frame from WebRTC."""
    frame = load_latest_frame()
    
    if frame is not None:
        state["frame"] = frame
        state["frame_count"] = state.get("frame_count", 0) + 1
        state["status"] = "frame_captured"
        # Print processing message every 10 frames to monitor actual frame rate
        if state["frame_count"] % 10 == 1:
            print(f"📸 Processing frame #{state['frame_count']}")
    else:
        state["status"] = "no_frame"
        if state.get("frame_count", 0) % 50 == 0:
            print("⚠️ No frame available")
    
    return state


def detect_pose_node(state: AgentState) -> AgentState:
    """Node: Detect pose and face landmarks using MediaPipe for ML models with stress analysis."""
    frame = state.get("frame")
    
    # Initialize components once and reuse them
    if state["breathing_tracker"] is None:
        state["breathing_tracker"] = BreathingTracker(fps=30.0)
    if state["feature_extractor"] is None:
        state["feature_extractor"] = FeatureExtractor()
    if state["ml_aggregator"] is None:
        state["ml_aggregator"] = MLDataAggregator(window_seconds=5, fps=30.0)
    
    # Initialize MediaPipe models once for performance
    if "pose_model" not in state:
        with suppress_stderr():
            state["pose_model"] = mp_pose.Pose(
                static_image_mode=False,
                model_complexity=0,  # Fastest model
                enable_segmentation=False,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
    
    if "face_model" not in state:
        with suppress_stderr():
            state["face_model"] = mp_face_mesh.FaceMesh(
                static_image_mode=False,
                max_num_faces=1,
                refine_landmarks=True,
                min_detection_confidence=0.5,
                min_tracking_confidence=0.5
            )
    
    if frame is None:
        state["status"] = "no_frame"
        return state

    try:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        landmark_data = {
            "pose_landmarks": None,
            "face_landmarks": None,
            "breathing": {"bpm": 0.0, "confidence": 0.0, "calibrated": False},
            "stress_analysis": {},
            "timestamp": time.time()
        }
        
        # Use pre-initialized models for much better performance
        pose_detected = False
        shoulder_visibility = {"left": 0.0, "right": 0.0}
        
        with suppress_stderr():
            pose_results = state["pose_model"].process(rgb_frame)
            
            if pose_results.pose_landmarks:
                pose_detected = True
                state["pose_landmarks"] = pose_results.pose_landmarks
                
                landmarks = pose_results.pose_landmarks.landmark
                selected_pose_coords = []
                
                nose = landmarks[mp_pose.PoseLandmark.NOSE]
                selected_pose_coords.extend([nose.x, nose.y, nose.z, nose.visibility])
                
                left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
                selected_pose_coords.extend([left_shoulder.x, left_shoulder.y, left_shoulder.z, left_shoulder.visibility])
                shoulder_visibility["left"] = left_shoulder.visibility
                
                right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
                selected_pose_coords.extend([right_shoulder.x, right_shoulder.y, right_shoulder.z, right_shoulder.visibility])
                shoulder_visibility["right"] = right_shoulder.visibility
                
                landmark_data["pose_landmarks"] = {
                    "coordinates": selected_pose_coords,
                    "num_landmarks": 3,
                    "landmarks": ["nose", "left_shoulder", "right_shoulder"]
                }
                
                # Log MediaPipe detection quality every 20 frames
                if state["frame_count"] % 20 == 1:
                    print(f"🤖 MediaPipe Detection - Frame #{state['frame_count']}: "
                          f"Pose detected: {pose_detected}, "
                          f"Left shoulder vis: {shoulder_visibility['left']:.3f}, "
                          f"Right shoulder vis: {shoulder_visibility['right']:.3f}")
                    print(f"   Shoulder positions: L=({left_shoulder.x:.3f},{left_shoulder.y:.3f},{left_shoulder.z:.3f}), "
                          f"R=({right_shoulder.x:.3f},{right_shoulder.y:.3f},{right_shoulder.z:.3f})")
                
                breathing_result = state["breathing_tracker"].update(
                    timestamp=landmark_data["timestamp"],
                    nose=(nose.x, nose.y, nose.z),
                    left_shoulder=(left_shoulder.x, left_shoulder.y, left_shoulder.z),
                    right_shoulder=(right_shoulder.x, right_shoulder.y, right_shoulder.z)
                )
                
                # Debug breathing detection issues
                if state["frame_count"] % 30 == 1:
                    bpm = breathing_result.get("bpm", 0)
                    confidence = breathing_result.get("confidence", 0)
                    status = breathing_result.get("status", "unknown")
                    calibrated = breathing_result.get("calibrated", False)
                    
                    print(f"🫁 Breathing Debug - Frame #{state['frame_count']}: "
                          f"BPM={bpm:.1f}, conf={confidence:.3f}, status={status}, calibrated={calibrated}")
                    
                    if "debug" in breathing_result:
                        debug_info = breathing_result["debug"]
                        print(f"   Debug: velocity={debug_info.get('current_velocity', 0):.4f}, "
                              f"threshold={debug_info.get('amplitude_threshold', 0):.4f}, "
                              f"rejected: amp={debug_info.get('rejected_amplitude', 0)}, "
                              f"refract={debug_info.get('rejected_refractory', 0)}, "
                              f"move={debug_info.get('rejected_movement', 0)}")
                
                landmark_data["breathing"] = breathing_result
            else:
                # Log when pose detection fails
                if state["frame_count"] % 50 == 1:
                    print(f"❌ MediaPipe Pose Detection FAILED - Frame #{state['frame_count']}: No pose landmarks detected")
        
        with suppress_stderr():
            face_results = state["face_model"].process(rgb_frame)
            
            if face_results.multi_face_landmarks:
                state["face_landmarks"] = face_results.multi_face_landmarks[0]
                face_landmarks = face_results.multi_face_landmarks[0]
                
                selected_face_coords = []
                
                left_eye_indices = [249, 263, 362, 373, 374, 380, 381, 382, 384, 385, 386, 387, 388, 390, 398, 466]
                right_eye_indices = [7, 33, 133, 144, 145, 153, 154, 155, 157, 158, 159, 160, 161, 163, 173, 246]
                left_eyebrow_indices = [276, 282, 283, 285, 293, 295, 296, 300, 334, 336]
                right_eyebrow_indices = [46, 52, 53, 55, 63, 65, 66, 70, 105, 107]
                lips_indices = [0, 13, 14, 17, 37, 39, 40, 61, 78, 80, 81, 82, 84, 87, 88, 91, 95, 146, 178, 181, 185, 191, 267, 269, 270, 291, 308, 310, 311, 312, 314, 317, 318, 321, 324, 375, 402, 405, 409, 415]
                face_oval_indices = [10, 21, 54, 58, 67, 93, 103, 109, 127, 132, 136, 148, 149, 150, 152, 162, 172, 176, 234, 251, 284, 288, 297, 323, 332, 338, 356, 361, 365, 377, 378, 379, 389, 397, 400, 454]
                nose_indices = [1, 2, 6, 168, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 281, 275]
                
                def extract_landmark_coords(indices):
                    coords = []
                    for idx in indices:
                        if idx < len(face_landmarks.landmark):
                            lm = face_landmarks.landmark[idx]
                            coords.extend([lm.x, lm.y, lm.z])
                    return coords, len(indices)
                
                left_eye_coords, left_eye_count = extract_landmark_coords(left_eye_indices)
                right_eye_coords, right_eye_count = extract_landmark_coords(right_eye_indices)
                left_eyebrow_coords, left_eyebrow_count = extract_landmark_coords(left_eyebrow_indices)
                right_eyebrow_coords, right_eyebrow_count = extract_landmark_coords(right_eyebrow_indices)
                nose_coords, nose_count = extract_landmark_coords(nose_indices)
                lips_coords, lips_count = extract_landmark_coords(lips_indices)
                face_oval_coords, face_oval_count = extract_landmark_coords(face_oval_indices)
                
                selected_face_coords.extend(left_eye_coords)
                selected_face_coords.extend(right_eye_coords)
                selected_face_coords.extend(left_eyebrow_coords)
                selected_face_coords.extend(right_eyebrow_coords)
                selected_face_coords.extend(nose_coords)
                selected_face_coords.extend(lips_coords)
                selected_face_coords.extend(face_oval_coords)
                
                total_face_landmarks = (left_eye_count + right_eye_count + left_eyebrow_count + 
                                      right_eyebrow_count + nose_count + lips_count + face_oval_count)
                
                landmark_data["face_landmarks"] = {
                    "coordinates": selected_face_coords,
                    "num_landmarks": total_face_landmarks,
                    "feature_breakdown": {
                        "left_eye": left_eye_count,
                        "right_eye": right_eye_count,
                        "left_eyebrow": left_eyebrow_count,
                        "right_eyebrow": right_eyebrow_count,
                        "nose": nose_count,
                        "lips": lips_count,
                        "face_oval": face_oval_count
                    },
                    "feature_vector_length": len(selected_face_coords)
                }
        
        state["landmark_data"] = landmark_data
        
        ml_features = state["feature_extractor"].extract_features(landmark_data)
        landmark_data["ml_features"] = ml_features
        
        has_pose = landmark_data["pose_landmarks"] is not None
        has_face = landmark_data["face_landmarks"] is not None
        
        if has_pose or has_face:
            state["last_detection_time"] = time.time()
            state["status"] = "landmarks_detected"
            
            frame_count = state.get("frame_count", 0)
            if frame_count % 60 == 1:
                status_msg = []
                if has_pose:
                    status_msg.append(f"Pose({landmark_data['pose_landmarks']['num_landmarks']} pts: nose+shoulders)")
                if has_face:
                    status_msg.append(f"Face({landmark_data['face_landmarks']['num_landmarks']} pts: eyes+eyebrows+nose+lips+oval)")
                
                breathing = landmark_data.get("breathing", {})
                if breathing.get("calibrated"):
                    bpm = breathing.get("bpm", 0)
                    confidence = breathing.get("confidence", 0)
                    status_msg.append(f"Breathing({bpm:.1f}bpm, conf:{confidence:.2f})")
                else:
                    breath_status = breathing.get("status", "init")
                    status_msg.append(f"Breathing({breath_status})")
                
                stress_analysis = landmark_data.get("stress_analysis", {})
                if stress_analysis.get("calibrated", False):
                    stress_score = stress_analysis.get("overall_stress_score", 0)
                    stress_conf = stress_analysis.get("confidence", 0)
                    stress_level = "HIGH" if stress_score > 0.7 else "MED" if stress_score > 0.4 else "LOW"
                    status_msg.append(f"Stress({stress_level}:{stress_score:.2f}, conf:{stress_conf:.2f})")
                else:
                    status_msg.append("Stress(calibrating)")
                
                print(f"🎯 FOCUSED ML LANDMARKS + STRESS ANALYSIS - {' + '.join(status_msg)}")
                if has_pose:
                    coords = landmark_data['pose_landmarks']['coordinates']
                    nose_x, nose_y = coords[0], coords[1]
                    print(f"   Sample pose: nose=({nose_x:.3f}, {nose_y:.3f})")
                
                if has_face:
                    total_features = landmark_data['face_landmarks']['feature_vector_length']
                    breakdown = landmark_data['face_landmarks']['feature_breakdown']
                    print(f"   Face features: {total_features} coords from {sum(breakdown.values())} landmarks")
                
                if stress_analysis.get("calibrated", False):
                    breathing_stress = stress_analysis["breathing_indicators"]["stress_level"]
                    facial_tension = stress_analysis["facial_tension"]["overall_tension"]
                    eye_strain = stress_analysis["eye_strain"]["strain_level"]
                    posture_stress = stress_analysis["posture_stress"]["stress_level"]
                    print(f"   Stress breakdown: Breathing:{breathing_stress:.2f} Facial:{facial_tension:.2f} Eyes:{eye_strain:.2f} Posture:{posture_stress:.2f}")
                
        else:
            state["pose_landmarks"] = None
            state["face_landmarks"] = None
            state["status"] = "no_landmarks"
            frame_count = state.get("frame_count", 0)
            if frame_count % 60 == 0:
                print("� No landmarks detected")
        
        if not hasattr(detect_pose_node, 'detection_stats'):
            detect_pose_node.detection_stats = {"pose_success": 0, "face_success": 0, "total_frames": 0}
        
        detect_pose_node.detection_stats["total_frames"] += 1
        if has_pose:
            detect_pose_node.detection_stats["pose_success"] += 1
        if has_face:
            detect_pose_node.detection_stats["face_success"] += 1
        
        if state.get("frame_count", 0) % 100 == 0:
            stats = detect_pose_node.detection_stats
            pose_rate = (stats["pose_success"] / stats["total_frames"]) * 100 if stats["total_frames"] > 0 else 0
            face_rate = (stats["face_success"] / stats["total_frames"]) * 100 if stats["total_frames"] > 0 else 0
            print(f"📊 Detection Success Rates (last 100 frames): Pose={pose_rate:.1f}%, Face={face_rate:.1f}%")
            detect_pose_node.detection_stats = {"pose_success": 0, "face_success": 0, "total_frames": 0}
                
    except Exception as e:
        print(f"❌ LANDMARK DETECTION ERROR: {e}")
        state["status"] = "error"
        state["pose_landmarks"] = None
        state["face_landmarks"] = None
        state["landmark_data"] = None
    
    return state

def export_landmark_data_node(state: AgentState) -> AgentState:
    """Node: Export aggregated ML data over time windows."""
    frame_count = state.get("frame_count", 0)
    timestamp = time.time()
    landmark_data = state.get("landmark_data")
    has_landmarks = landmark_data is not None
    
    try:
        aggregated_data = state["ml_aggregator"].add_frame_data({
            "timestamp": timestamp,
            "ml_features": landmark_data.get("ml_features", {}) if has_landmarks else {},
            "breathing": landmark_data.get("breathing", {}) if has_landmarks else {},
            "has_pose": landmark_data.get("pose_landmarks") is not None if has_landmarks else False,
            "has_face": landmark_data.get("face_landmarks") is not None if has_landmarks else False
        })
        
        if aggregated_data and aggregated_data.get("status") != "insufficient_data":
            landmarks_dir = os.path.join(os.path.dirname(__file__), "ml_training_data")
            os.makedirs(landmarks_dir, exist_ok=True)
            
            window_id = aggregated_data["window_id"]
            export_file = os.path.join(landmarks_dir, f"window_{window_id:06d}_ml_features.json")
            
            with open(export_file, 'w') as f:
                json.dump(aggregated_data, f, indent=2)
            
            print(f"🎯 ML TRAINING WINDOW EXPORTED - Window {window_id}")
            print(f"   Duration: {aggregated_data['duration_seconds']:.1f}s ({aggregated_data['valid_frames']}/{aggregated_data['frame_count']} valid frames)")
            
            breathing = aggregated_data.get("breathing_analysis", {})
            if breathing.get("mean_bpm"):
                print(f"   Breathing: {breathing['mean_bpm']:.1f}±{breathing.get('bpm_std', 0):.1f} BPM, trend: {breathing.get('bpm_trend', 0):+.1f}")
            
            facial = aggregated_data.get("facial_analysis", {})
            if facial.get("mean_jaw_width"):
                print(f"   Facial: jaw tension episodes: {facial.get('jaw_tension_episodes', 0)}, stability: {facial.get('facial_stability_score', 0):.2f}")
            
            eye = aggregated_data.get("eye_analysis", {})
            if eye.get("mean_eye_openness"):
                print(f"   Eyes: openness: {eye['mean_eye_openness']:.3f}, blink freq: {eye.get('blink_frequency', 0):.1f}/min")
            
            behavioral = aggregated_data.get("behavioral_patterns", {})
            if behavioral.get("physiological_coherence"):
                print(f"   Patterns: coherence: {behavioral['physiological_coherence']:.2f}, volatility: {behavioral.get('behavioral_volatility', 0):.3f}")
            
            print(f"   📁 Saved to: ml_training_data/window_{window_id:06d}_ml_features.json")
            
            state["status"] = "window_exported"
        else:
            state["status"] = "accumulating_data"
            
    except Exception as e:
        print(f"❌ ML DATA AGGREGATION ERROR: {e}")
        state["status"] = "export_error"
    
    return state

def should_continue(state: AgentState) -> str:
    """Conditional edge: Determine next action based on state."""
    status = state.get("status", "")
    
    if status == "no_frame":
        frame_count = state.get("frame_count", 0)
        if frame_count > 0:
            return "continue" 
        else:
            return "wait"
    elif status in ["frame_captured", "landmarks_detected", "no_landmarks", "data_exported", "export_skipped", "accumulating_data", "window_exported"]:
        return "continue"
    else:
        return "continue"

def wait_node(state: AgentState) -> AgentState:
    """Node: Minimal wait to prevent CPU spinning."""
    time.sleep(0.001)
    state["status"] = "waiting"
    return state


def create_agent_graph():
    """Create the LangGraph workflow."""
    workflow = StateGraph(AgentState)
    workflow.add_node("capture_frame", capture_frame_node)
    workflow.add_node("detect_pose", detect_pose_node)
    workflow.add_node("export_landmarks", export_landmark_data_node)
    workflow.add_node("wait", wait_node)
    
    workflow.add_edge("__start__", "capture_frame")
    
    workflow.add_conditional_edges(
        "capture_frame",
        should_continue,
        {
            "continue": "detect_pose",
            "wait": "wait"
        }
    )
    
    workflow.add_edge("detect_pose", "export_landmarks")
    workflow.add_edge("export_landmarks", "capture_frame")
    workflow.add_edge("wait", "capture_frame")
    
    return workflow.compile()


def main():
    """Main agent loop."""
    print("🚀 Starting MediaPipe LangGraph Agent")
    webrtc_status_path = os.path.join(os.path.dirname(__file__), "frames", "webrtc_ready")
    
    print("⏳ Waiting for WebRTC to be ready...")
    while not os.path.exists(webrtc_status_path):
        time.sleep(0.5)
    
    print("✅ WebRTC ready, starting pose detection")
    agent = create_agent_graph()
    initial_state: AgentState = {
        "frame": None,
        "pose_landmarks": None,
        "face_landmarks": None,
        "frame_count": 0,
        "last_detection_time": 0.0,
        "status": "starting",
        "landmark_data": None,
        "breathing_tracker": None,
        "feature_extractor": None,
        "ml_aggregator": None
    }
    
    try:
        print("🔄 Agent running... (Ctrl+C to stop)")
        
        config = {"recursion_limit": 1000}
        
        consecutive_errors = 0
        max_consecutive_errors = 10
        
        for state in agent.stream(initial_state, config=config):
            try:
                consecutive_errors = 0
                time.sleep(0.001)
                
            except Exception as e:
                consecutive_errors += 1
                print(f"⚠️ Agent iteration error #{consecutive_errors}: {e}")
                
                if consecutive_errors >= max_consecutive_errors:
                    print(f"❌ Too many consecutive errors ({consecutive_errors}), stopping agent")
                    break
                time.sleep(0.1)
                continue
            
    except KeyboardInterrupt:
        print("\n⏹️ Agent stopped by user")
    except Exception as e:
        print(f"❌ Agent fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("🏁 Agent shutdown complete")


if __name__ == "__main__":
    main()
