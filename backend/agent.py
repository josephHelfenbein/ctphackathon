import asyncio
import json
import os
import sys
import time
from typing import Dict, Any, Optional, List
import cv2
import numpy as np
import mediapipe as mp
from langgraph.graph import StateGraph
from typing_extensions import TypedDict
mp_pose = mp.solutions.pose
mp_face_mesh = mp.solutions.face_mesh
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles


class AgentState(TypedDict):
    frame: Optional[np.ndarray]
    pose_landmarks: Optional[Any]
    face_landmarks: Optional[Any]
    frame_count: int
    last_detection_time: float
    status: str
    landmark_data: Optional[Dict[str, Any]]

def load_latest_frame() -> Optional[np.ndarray]:
    """Load the latest frame from WebRTC pipeline."""
    frame_path = os.path.join(os.path.dirname(__file__), "frames", "latest_frame.jpg")
    if not os.path.exists(frame_path):
        frames_dir = os.path.join(os.path.dirname(__file__), "frames")
        if not os.path.exists(frames_dir):
            print(f"⚠️ Frames directory doesn't exist: {frames_dir}")
        else:
            files = os.listdir(frames_dir)
            print(f"⚠️ Frame file not found. Files in frames/: {files}")
        return None
    
    try:
        frame = cv2.imread(frame_path)
        if frame is not None:
            mtime = os.path.getmtime(frame_path)
            current_time = time.time()
            age = current_time - mtime
            if age > 5:
                print(f"⚠️ Frame is {age:.1f}s old, may be stale")
        return frame
    except Exception as e:
        print(f"⚠️ Failed to load frame: {e}")
        return None


def capture_frame_node(state: AgentState) -> AgentState:
    """Node: Capture the latest frame from WebRTC."""
    frame = load_latest_frame()
    
    if frame is not None:
        state["frame"] = frame
        state["frame_count"] = state.get("frame_count", 0) + 1
        state["status"] = "frame_captured"
        if state["frame_count"] % 30 == 1:
            print(f"📸 Processing frame #{state['frame_count']}")
    else:
        state["status"] = "no_frame"
        if state.get("frame_count", 0) % 50 == 0:
            print("⚠️ No frame available")
    
    return state


def detect_pose_node(state: AgentState) -> AgentState:
    """Node: Detect pose and face landmarks using MediaPipe for ML models."""
    frame = state.get("frame")
    
    if frame is None:
        state["status"] = "no_frame"
        return state
    
    try:
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        landmark_data = {
            "pose_landmarks": None,
            "face_landmarks": None,
            "timestamp": time.time()
        }
        
        with mp_pose.Pose(
            static_image_mode=False,
            model_complexity=1,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as pose:
            pose_results = pose.process(rgb_frame)
            
            if pose_results.pose_landmarks:
                state["pose_landmarks"] = pose_results.pose_landmarks
                
                landmarks = pose_results.pose_landmarks.landmark
                selected_pose_coords = []
                
                nose = landmarks[mp_pose.PoseLandmark.NOSE]
                selected_pose_coords.extend([nose.x, nose.y, nose.z, nose.visibility])
                
                left_shoulder = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER]
                selected_pose_coords.extend([left_shoulder.x, left_shoulder.y, left_shoulder.z, left_shoulder.visibility])
                
                right_shoulder = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER]
                selected_pose_coords.extend([right_shoulder.x, right_shoulder.y, right_shoulder.z, right_shoulder.visibility])
                
                landmark_data["pose_landmarks"] = {
                    "coordinates": selected_pose_coords,
                    "num_landmarks": 3,
                    "landmarks": ["nose", "left_shoulder", "right_shoulder"]
                }
        
        with mp_face_mesh.FaceMesh(
            static_image_mode=False,
            max_num_faces=1,
            refine_landmarks=True,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5
        ) as face_mesh:
            face_results = face_mesh.process(rgb_frame)
            
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
                print(f"🎯 FOCUSED ML LANDMARKS - {' + '.join(status_msg)}")
                if has_pose:
                    coords = landmark_data['pose_landmarks']['coordinates']
                    nose_x, nose_y = coords[0], coords[1]
                    print(f"   Sample pose: nose=({nose_x:.3f}, {nose_y:.3f})")
                
                if has_face:
                    total_features = landmark_data['face_landmarks']['feature_vector_length']
                    breakdown = landmark_data['face_landmarks']['feature_breakdown']
                    print(f"   Face features: {total_features} coords from {sum(breakdown.values())} landmarks")
                
        else:
            state["pose_landmarks"] = None
            state["face_landmarks"] = None
            state["status"] = "no_landmarks"
            frame_count = state.get("frame_count", 0)
            if frame_count % 60 == 0:
                print("� No landmarks detected")
                
    except Exception as e:
        print(f"❌ LANDMARK DETECTION ERROR: {e}")
        state["status"] = "error"
        state["pose_landmarks"] = None
        state["face_landmarks"] = None
        state["landmark_data"] = None
    
    return state

def export_landmark_data_node(state: AgentState) -> AgentState:
    """Node: Export landmark data in ML-ready format."""
    landmark_data = state.get("landmark_data")
    
    if not landmark_data:
        state["status"] = "no_export"
        return state
    
    try:
        frame_count = state.get("frame_count", 0)
        
        if frame_count % 30 == 1 and (landmark_data.get("pose_landmarks") or landmark_data.get("face_landmarks")):
            export_data = {
                "frame_number": frame_count,
                "timestamp": landmark_data["timestamp"],
                "has_pose": landmark_data["pose_landmarks"] is not None,
                "has_face": landmark_data["face_landmarks"] is not None
            }
            
            if landmark_data["pose_landmarks"]:
                export_data["pose"] = {
                    "num_landmarks": landmark_data["pose_landmarks"]["num_landmarks"],
                    "landmarks": landmark_data["pose_landmarks"]["landmarks"],
                    "coordinates": landmark_data["pose_landmarks"]["coordinates"],
                    "feature_vector_length": len(landmark_data["pose_landmarks"]["coordinates"])
                }
            
            if landmark_data["face_landmarks"]:
                export_data["face"] = {
                    "num_landmarks": landmark_data["face_landmarks"]["num_landmarks"],
                    "feature_breakdown": landmark_data["face_landmarks"]["feature_breakdown"],
                    "coordinates": landmark_data["face_landmarks"]["coordinates"],
                    "feature_vector_length": landmark_data["face_landmarks"]["feature_vector_length"]
                }
            landmarks_dir = os.path.join(os.path.dirname(__file__), "landmarks")
            os.makedirs(landmarks_dir, exist_ok=True)
            
            export_file = os.path.join(landmarks_dir, f"frame_{frame_count:06d}_landmarks.json")
            with open(export_file, 'w') as f:
                json.dump(export_data, f, indent=2)
            
            print(f"💾 FOCUSED ML DATA EXPORTED - Frame {frame_count}")
            total_features = 0
            feature_breakdown = []
            if export_data.get("pose"):
                pose_features = export_data["pose"]["feature_vector_length"]
                total_features += pose_features
                feature_breakdown.append(f"Pose: {pose_features} ({export_data['pose']['num_landmarks']} landmarks)")
            if export_data.get("face"):
                face_features = export_data["face"]["feature_vector_length"]
                total_features += face_features
                face_breakdown = export_data["face"]["feature_breakdown"]
                feature_breakdown.append(f"Face: {face_features} ({sum(face_breakdown.values())} landmarks)")
            print(f"   {' + '.join(feature_breakdown)}")
            print(f"   Total feature vector length: {total_features}")
            print(f"   Saved to: landmarks/frame_{frame_count:06d}_landmarks.json")
            
            state["status"] = "data_exported"
        else:
            state["status"] = "export_skipped"
            
    except Exception as e:
        print(f"❌ LANDMARK EXPORT ERROR: {e}")
        state["status"] = "export_error"
    
    return state

def should_continue(state: AgentState) -> str:
    """Conditional edge: Determine next action based on state."""
    status = state.get("status", "")
    
    if status == "no_frame":
        return "wait"
    elif status in ["frame_captured", "landmarks_detected", "no_landmarks", "data_exported", "export_skipped"]:
        return "continue"
    else:
        return "wait"

def wait_node(state: AgentState) -> AgentState:
    """Node: Wait before next frame capture."""
    time.sleep(0.5)
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
        "frame_count": 0,
        "last_detection_time": 0.0,
        "status": "starting"
    }
    
    try:
        print("🔄 Agent running... (Ctrl+C to stop)")
        
        config = {"recursion_limit": 1000}
        
        for state in agent.stream(initial_state, config=config):
            time.sleep(0.01)
            
    except KeyboardInterrupt:
        print("\n⏹️ Agent stopped by user")
    except Exception as e:
        print(f"❌ Agent error: {e}")
    finally:
        print("🏁 Agent shutdown complete")


if __name__ == "__main__":
    main()
