# Advanced Stress Analysis Features for ML Classification

The LangGraph agent now includes comprehensive stress/calm state analysis optimized for real-time ML classification with confidence scoring.

## Stress Analysis Overview

The `StressAnalyzer` class computes semantic features directly relevant to stress vs. calm classification, going beyond raw landmarks to provide meaningful physiological and behavioral indicators.

### Key Stress Indicators Analyzed

#### 1. **Breathing Patterns** (35% weight in overall score)
- **Rate Stress**: Abnormal breathing rate (normal: 12-20 BPM)
  - Too fast (>25 BPM) = anxiety/stress
  - Too slow (<8 BPM) = depression/fatigue
- **Pattern Irregularity**: Inconsistent breathing rhythm
- **Variability**: Standard deviation of recent BPM readings
- **Trend Analysis**: 30-frame historical analysis

#### 2. **Facial Tension** (25% weight)
- **Jaw Tension**: Mouth width-to-height ratio analysis
- **Forehead Tension**: Eyebrow elevation detection
- **Mouth Compression**: Lip thickness measurement (tight lips = stress)
- **Overall Tension**: Composite facial muscle tension score

#### 3. **Eye Strain** (20% weight)
- **Eye Openness**: Vertical distance between eyelids
- **Asymmetry**: Difference between left/right eye openness
- **Baseline Deviation**: Comparison to relaxed baseline
- **Fatigue Indicators**: Reduced eye opening over time

#### 4. **Posture Stress** (15% weight)
- **Shoulder Tension**: Elevated shoulder position
- **Head Forward**: Forward head posture (common in stress)
- **Shoulder Asymmetry**: Uneven shoulder height
- **Baseline Comparison**: Deviation from relaxed posture

#### 5. **Micro-Expressions** (5% weight)
- **Mouth Curvature**: Genuine smile vs. forced expression
- **Eyebrow Concern**: Furrowed brow detection
- **Expression Authenticity**: Stress vs. genuine emotions

## Output Structure

### Comprehensive Stress Analysis Data
```json
{
  "stress_analysis": {
    "breathing_indicators": {
      "stress_level": 0.65,
      "pattern_irregularity": 0.23,
      "rate_stress": 0.78,
      "bpm": 28.5,
      "variability": 0.45
    },
    "facial_tension": {
      "overall_tension": 0.52,
      "jaw_tension": 0.41,
      "forehead_tension": 0.67,
      "mouth_compression": 0.48
    },
    "eye_strain": {
      "strain_level": 0.34,
      "left_eye_openness": 0.78,
      "right_eye_openness": 0.82,
      "asymmetry": 0.04,
      "baseline_deviation": 0.12
    },
    "posture_stress": {
      "stress_level": 0.71,
      "shoulder_tension": 0.83,
      "head_forward": 0.45,
      "shoulder_asymmetry": 0.15,
      "avg_shoulder_height": 0.234
    },
    "micro_expressions": {
      "stress_micro_expressions": 0.43,
      "smile_genuine": 0.12,
      "concern_level": 0.67,
      "mouth_curvature": -0.05
    },
    "overall_stress_score": 0.72,
    "confidence": 0.89,
    "calibrated": true
  }
}
```

## ML Classification Features

### Primary Classification Features
1. **overall_stress_score** (0.0 = calm, 1.0 = highly stressed)
2. **confidence** (algorithm confidence in the assessment)

### Detailed Feature Vector (for advanced models)
- **Breathing**: 5 features (stress_level, irregularity, rate_stress, bpm, variability)
- **Facial Tension**: 4 features (overall, jaw, forehead, mouth compression)
- **Eye Strain**: 5 features (strain_level, left/right openness, asymmetry, baseline deviation)
- **Posture**: 4 features (stress_level, shoulder tension, head forward, asymmetry)
- **Micro-expressions**: 4 features (stress expressions, smile authenticity, concern, curvature)

**Total Stress Features**: 22 semantic indicators + baseline comparisons

### Calibration System
- **Baseline Establishment**: First 10 frames establish personal baseline
- **Adaptive Thresholds**: Personalized stress thresholds based on individual patterns
- **Historical Context**: 30-frame sliding window for trend analysis

## Semantic Meaning for ML Models

### High Stress Indicators (Score > 0.7)
- **Breathing**: >25 BPM, irregular patterns
- **Facial**: Raised eyebrows, jaw tension, compressed lips
- **Eyes**: Reduced openness, asymmetry, strain
- **Posture**: Raised shoulders, forward head position
- **Expression**: Furrowed brow, forced expressions

### Calm Indicators (Score < 0.3)
- **Breathing**: 12-20 BPM, regular rhythm
- **Facial**: Relaxed jaw, normal eyebrow position
- **Eyes**: Full openness, symmetrical
- **Posture**: Relaxed shoulders, neutral head position
- **Expression**: Genuine expressions, relaxed features

### Real-time Classification
```python
# Example ML integration for stress classification
import json
import numpy as np

def classify_stress_state(landmark_file):
    with open(landmark_file, 'r') as f:
        data = json.load(f)
    
    stress_data = data.get('stress_analysis', {})
    
    if not stress_data.get('calibrated', False):
        return {"prediction": "calibrating", "confidence": 0.0}
    
    # Primary classification using overall score
    stress_score = stress_data.get('overall_stress_score', 0)
    confidence = stress_data.get('confidence', 0)
    
    # Classification thresholds
    if stress_score > 0.7:
        prediction = "stressed"
    elif stress_score > 0.4:
        prediction = "moderate"
    else:
        prediction = "calm"
    
    return {
        "prediction": prediction,
        "stress_score": stress_score,
        "confidence": confidence,
        "detailed_breakdown": {
            "breathing_stress": stress_data["breathing_indicators"]["stress_level"],
            "facial_tension": stress_data["facial_tension"]["overall_tension"],
            "eye_strain": stress_data["eye_strain"]["strain_level"],
            "posture_stress": stress_data["posture_stress"]["stress_level"]
        }
    }

# Advanced feature extraction for ML models
def extract_stress_features(landmark_file):
    with open(landmark_file, 'r') as f:
        data = json.load(f)
    
    stress_data = data.get('stress_analysis', {})
    
    # Extract all semantic stress features
    features = []
    
    # Breathing features (5)
    breathing = stress_data.get("breathing_indicators", {})
    features.extend([
        breathing.get("stress_level", 0),
        breathing.get("pattern_irregularity", 0),
        breathing.get("rate_stress", 0),
        breathing.get("bpm", 0) / 60,  # Normalize
        breathing.get("variability", 0)
    ])
    
    # Facial tension features (4)
    facial = stress_data.get("facial_tension", {})
    features.extend([
        facial.get("overall_tension", 0),
        facial.get("jaw_tension", 0),
        facial.get("forehead_tension", 0),
        facial.get("mouth_compression", 0)
    ])
    
    # Eye strain features (5)
    eyes = stress_data.get("eye_strain", {})
    features.extend([
        eyes.get("strain_level", 0),
        eyes.get("left_eye_openness", 1),
        eyes.get("right_eye_openness", 1),
        eyes.get("asymmetry", 0),
        eyes.get("baseline_deviation", 0)
    ])
    
    # Posture features (4)
    posture = stress_data.get("posture_stress", {})
    features.extend([
        posture.get("stress_level", 0),
        posture.get("shoulder_tension", 0),
        posture.get("head_forward", 0),
        posture.get("shoulder_asymmetry", 0)
    ])
    
    # Micro-expression features (4)
    micro = stress_data.get("micro_expressions", {})
    features.extend([
        micro.get("stress_micro_expressions", 0),
        micro.get("smile_genuine", 0),
        micro.get("concern_level", 0),
        micro.get("mouth_curvature", 0)
    ])
    
    return np.array(features)  # 22 semantic stress features
```

## Model Training Recommendations

### Binary Classification (Stressed vs. Calm)
- Use `overall_stress_score` with threshold at 0.5
- Weight samples by `confidence` score
- Include temporal features (trends over time)

### Multi-class Classification (Low/Med/High Stress)
- Thresholds: Low (0-0.4), Med (0.4-0.7), High (0.7-1.0)
- Use detailed breakdown for feature importance analysis

### Regression (Continuous Stress Level)
- Predict `overall_stress_score` directly
- Use all 22 semantic features for best accuracy
- Include baseline deviations for personalization

### Temporal Models (LSTM/Transformer)
- Use sliding windows of stress features
- Capture breathing pattern evolution
- Model stress onset and recovery patterns

This comprehensive stress analysis system provides semantic, physiologically-meaningful features optimized for accurate stress/calm classification with real-time confidence estimation.
