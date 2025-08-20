# Simple wrapper to load the trained model and run predictions.
import os, json
import numpy as np
import joblib

HERE = os.path.dirname(__file__)
MODEL_PATH = os.path.join(HERE, "stress_model.pkl")
FEATURES_PATH = os.path.join(HERE, "feature_names.json")

_model = None
_feature_names = None

def load():
    global _model, _feature_names
    if _model is None:
        _model = joblib.load(MODEL_PATH)
    if _feature_names is None:
        with open(FEATURES_PATH) as f:
            _feature_names = json.load(f)
    return _model, _feature_names

def predict(features):
    """
    features: list or 1D np.array of shape (n_features,)
    Returns: (class_id, probs_list)
    class_id ∈ {0: calm, 1: mild, 2: stressed}
    """
    model, names = load()
    print(type(model))
    x = np.array(features, dtype=float).reshape(1, -1)
    probs = model.predict_proba(x)[0].tolist()
    class_id = int(np.argmax(probs))
    return class_id, probs

if __name__ == "__main__":
    demo = [0.25, 0.22, 14, 15, 0.18, 0.20, 0.15, 0.90]  
    cid, p = predict(demo)
    print("Demo input:", demo)
    print("Predicted class:", cid, "(0=calm,1=mild,2=stressed)")
    print("Probabilities:", p)