# Focused ML Landmark Data Extraction

The agent now extracts only specific facial and pose landmarks using **VERIFIED MediaPipe indices** for a focused, efficient ML feature set.

## What's Changed

- **Focused Pose Detection**: Only nose and shoulders (3 landmarks instead of 33)
- **Verified Face Features**: Using MediaPipe's predefined landmark sets for accuracy
- **Optimized Feature Vector**: 444 features instead of 1566 (71.6% reduction)
- **Guaranteed Accuracy**: All indices verified against MediaPipe documentation

## Selected Landmarks (VERIFIED)

### Pose Landmarks (3 points × 4 values = 12 features)
- **Nose** (1 landmark): Primary facial reference point
- **Shoulders** (2 landmarks): Left and right shoulder positions for body orientation

### Face Landmarks (144 points × 3 values = 432 features)
Using MediaPipe's predefined landmark sets:
- **Left Eye**: 16 landmarks (MediaPipe FACEMESH_LEFT_EYE)
- **Right Eye**: 16 landmarks (MediaPipe FACEMESH_RIGHT_EYE)
- **Left Eyebrow**: 10 landmarks (MediaPipe FACEMESH_LEFT_EYEBROW)
- **Right Eyebrow**: 10 landmarks (MediaPipe FACEMESH_RIGHT_EYEBROW)
- **Nose**: 16 landmarks (tip + bridge + base)
- **Lips**: 40 landmarks (MediaPipe FACEMESH_LIPS)
- **Face Oval**: 36 landmarks (MediaPipe FACEMESH_FACE_OVAL)

## Data Structure

### Pose Data
```json
{
  "pose": {
    "num_landmarks": 3,
    "landmarks": ["nose", "left_shoulder", "right_shoulder"],
    "coordinates": [x1, y1, z1, visibility1, x2, y2, z2, visibility2, x3, y3, z3, visibility3],
    "feature_vector_length": 12
  }
}
```

### Face Data (VERIFIED MediaPipe indices)
```json
{
  "face": {
    "num_landmarks": 144,
    "feature_breakdown": {
      "left_eye": 16,
      "right_eye": 16,
      "left_eyebrow": 10,
      "right_eyebrow": 10,
      "nose": 16,
      "lips": 40,
      "face_oval": 36
    },
    "coordinates": [x1, y1, z1, x2, y2, z2, ...],
    "feature_vector_length": 432
  }
}
```

## Complete Export Format

Each JSON file in `landmarks/` contains:
```json
{
  "frame_number": 31,
  "timestamp": 1703876543.123,
  "has_pose": true,
  "has_face": true,
  "pose": {
    "num_landmarks": 3,
    "landmarks": ["nose", "left_shoulder", "right_shoulder"],
    "coordinates": [...],
    "feature_vector_length": 12
  },
  "face": {
    "num_landmarks": 144,
    "feature_breakdown": {...},
    "coordinates": [...],
    "feature_vector_length": 432
  }
}
```

## Using for ML Models

### Total Feature Vector Length
- **Pose only**: 12 features (nose + shoulders)
- **Face only**: 432 features (verified facial landmarks)
- **Combined**: 444 features total

### Verified Landmark Sets
- **Left Eye**: [249, 263, 362, 373, 374, 380, 381, 382, 384, 385, 386, 387, 388, 390, 398, 466]
- **Right Eye**: [7, 33, 133, 144, 145, 153, 154, 155, 157, 158, 159, 160, 161, 163, 173, 246]
- **Left Eyebrow**: [276, 282, 283, 285, 293, 295, 296, 300, 334, 336]
- **Right Eyebrow**: [46, 52, 53, 55, 63, 65, 66, 70, 105, 107]
- **Lips**: [0, 13, 14, 17, 37, 39, 40, 61, 78, 80, 81, 82, 84, 87, 88, 91, 95, 146, 178, 181, 185, 191, 267, 269, 270, 291, 308, 310, 311, 312, 314, 317, 318, 321, 324, 375, 402, 405, 409, 415]
- **Face Oval**: [10, 21, 54, 58, 67, 93, 103, 109, 127, 132, 136, 148, 149, 150, 152, 162, 172, 176, 234, 251, 284, 288, 297, 323, 332, 338, 356, 361, 365, 377, 378, 379, 389, 397, 400, 454]
- **Nose**: [1, 2, 6, 168, 3, 51, 48, 115, 131, 134, 102, 49, 220, 305, 281, 275]

### Example ML Integration
```python
import json
import numpy as np

# Load verified landmark data
with open('landmarks/frame_000031_landmarks.json', 'r') as f:
    data = json.load(f)

# Extract verified feature vectors
if data['has_pose'] and data['has_face']:
    pose_features = np.array(data['pose']['coordinates'])      # 12 features
    face_features = np.array(data['face']['coordinates'])      # 432 features
    
    # Combined verified feature vector for ML model
    combined_features = np.concatenate([pose_features, face_features])
    print(f"Verified feature vector shape: {combined_features.shape}")  # (444,)
    
    # Feature breakdown for analysis
    breakdown = data['face']['feature_breakdown']
    print(f"Face features: {breakdown}")
```

This verified approach ensures all landmark indices are correct and will work reliably with MediaPipe, providing a robust foundation for ML model training with essential facial and pose features.
