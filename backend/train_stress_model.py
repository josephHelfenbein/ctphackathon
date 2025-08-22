"""Train baseline stress classifier from labeled window dataset.

Steps:
 1. Load labeled dataset (parquet or csv) produced by ingest_label_windows.py
 2. Filter to rows with label in {calm, stressed}
 3. Encode label -> binary (calm=0, stressed=1)
 4. Select feature columns (exclude meta + label columns)
 5. Impute remaining NaNs using median (already mostly handled)
 6. GroupKFold CV by subject_id to avoid leakage.
 7. Train RandomForest (robust, no scaling) + compute OOF metrics.
 8. Save model + metadata (feature list, medians) to backend/models/

Usage:
  python backend/train_stress_model.py --data-file data/dataset.parquet --out-dir backend/models

Optional:
  python backend/train_stress_model.py --data-file data/dataset.parquet --model lightgbm

(This script currently only implements RandomForest; LightGBM can be added later.)
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import List

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score, f1_score, balanced_accuracy_score
from sklearn.model_selection import GroupKFold
from joblib import dump

CALM_LABELS = {"calm", "baseline"}
STRESSED_LABELS = {"stressed", "stress", "task"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Train stress classifier")
    p.add_argument("--data-file", required=True,
                   help="Labeled dataset (parquet or csv)")
    p.add_argument("--out-dir", default="backend/models",
                   help="Output directory for model + metadata")
    p.add_argument("--min-confidence", type=float, default=0.6,
                   help="Minimum label_confidence to include")
    p.add_argument("--n-estimators", type=int, default=400)
    p.add_argument("--random-state", type=int, default=42)
    return p.parse_args()


def load_dataset(path: str) -> pd.DataFrame:
    p = Path(path)
    if not p.exists():
        raise SystemExit(f"Dataset not found: {p}")
    if p.suffix.lower() == ".parquet":
        return pd.read_parquet(p)
    return pd.read_csv(p)


def map_labels(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    norm_labels = []
    for v in df["label"].astype(str):
        lv = v.lower()
        if lv in CALM_LABELS:
            norm_labels.append("calm")
        elif lv in STRESSED_LABELS:
            norm_labels.append("stressed")
        else:
            norm_labels.append("other")
    df["label_norm"] = norm_labels
    return df


def select_features(df: pd.DataFrame) -> List[str]:
    exclude_prefixes = [
        "behavioral_patterns.status",  # status markers
    ]
    exclude_exact = {"label", "label_norm", "segment_label", "original_segment_label", "label_source", "label_confidence",
                     "subject_id", "session_id", "window_id", "timestamp_start", "timestamp_end", "window_mid_timestamp"}
    feats = []
    for c in df.columns:
        if c in exclude_exact:
            continue
        if any(c.startswith(pref) for pref in exclude_prefixes):
            continue
        if df[c].dtype.kind in "biufc":  # numeric
            feats.append(c)
    return sorted(feats)


def main():
    args = parse_args()
    df = load_dataset(args.data_file)

    if "label" not in df.columns or "label_confidence" not in df.columns:
        raise SystemExit(
            "Dataset missing required columns 'label' and 'label_confidence'")
    if "subject_id" not in df.columns:
        raise SystemExit("Dataset missing 'subject_id'")

    df = map_labels(df)
    before_filter = len(df)
    df = df[(df.label_confidence >= args.min_confidence)
            & (df.label_norm.isin(["calm", "stressed"]))]
    after_filter = len(df)

    if after_filter < 30:
        raise SystemExit(
            f"Too few samples after filtering (have {after_filter})")

    df["y"] = (df.label_norm == "stressed").astype(int)

    features = select_features(df)
    if not features:
        raise SystemExit("No numeric features selected")

    # Impute medians
    medians = df[features].median()
    X = df[features].fillna(medians).values
    y = df["y"].values
    groups = df["subject_id"].astype(str).values
    rf = RandomForestClassifier(
        n_estimators=args.n_estimators,
        max_depth=None,
        min_samples_leaf=3,
        class_weight="balanced",
        n_jobs=-1,
        random_state=args.random_state,
    )
    if "split" in df.columns and set(df["split"]) == {"train", "test"}:
        # Use train/test split from dataset
        train_idx = df["split"] == "train"
        test_idx = df["split"] == "test"
        rf.fit(X[train_idx], y[train_idx])
        proba = rf.predict_proba(X[test_idx])[:, 1]
        auc = roc_auc_score(y[test_idx], proba)
        bal = balanced_accuracy_score(y[test_idx], (proba > 0.5).astype(int))
        f1 = f1_score(y[test_idx], (proba > 0.5).astype(int))
        print(f"Test AUC={auc:.3f} BalAcc={bal:.3f} F1={f1:.3f}")
        overall_auc = auc
        overall_bal = bal
        overall_f1 = f1
    elif len(set(groups)) > 1:
        # Use GroupKFold CV if multiple subjects
        gkf = GroupKFold(n_splits=min(5, len(set(groups))))
        oof = np.zeros(len(df))
        for fold, (tr, va) in enumerate(gkf.split(X, y, groups)):
            rf.fit(X[tr], y[tr])
            proba = rf.predict_proba(X[va])[:, 1]
            oof[va] = proba
            auc = roc_auc_score(y[va], proba)
            bal = balanced_accuracy_score(y[va], (proba > 0.5).astype(int))
            f1 = f1_score(y[va], (proba > 0.5).astype(int))
            print(f"Fold {fold} AUC={auc:.3f} BalAcc={bal:.3f} F1={f1:.3f}")
        overall_auc = roc_auc_score(y, oof)
        overall_bal = balanced_accuracy_score(y, (oof > 0.5).astype(int))
        overall_f1 = f1_score(y, (oof > 0.5).astype(int))
        print(f"OOF AUC={overall_auc:.3f} BalAcc={overall_bal:.3f} F1={overall_f1:.3f}")
        # Fit final model
        rf.fit(X, y)
    else:
        # Only one subject, no CV possible
        rf.fit(X, y)
        proba = rf.predict_proba(X)[:, 1]
        auc = roc_auc_score(y, proba)
        bal = balanced_accuracy_score(y, (proba > 0.5).astype(int))
        f1 = f1_score(y, (proba > 0.5).astype(int))
        print(f"Single subject: AUC={auc:.3f} BalAcc={bal:.3f} F1={f1:.3f}")
        overall_auc = auc
        overall_bal = bal
        overall_f1 = f1

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    dump(rf, out_dir / "stress_rf.joblib")

    meta = {
        "features": features,
        "medians": medians.to_dict(),
        "model_type": "RandomForestClassifier",
        "version": "0.1.0",
        "training_samples": int(len(df)),
        "metrics": {
            "oof_auc": float(overall_auc),
            "oof_balanced_accuracy": float(overall_bal),
            "oof_f1": float(overall_f1)
        }
    }
    with open(out_dir / "model_metadata.json", "w") as f:
        json.dump(meta, f, indent=2)
    print(f"Saved model + metadata to {out_dir}")


if __name__ == "__main__":  # pragma: no cover
    main()
