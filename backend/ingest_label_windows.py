"""Ingest exported ML window JSON files and assign stress labels.

Labeling protocol (phase 1):
 1. Segment-based labels (baseline=calm, stress_task=stressed, recovery=calm)
 2. Optional self-report overrides (Likert 1-5) every few minutes:
       1-2 -> calm (0)
       4-5 -> stressed (1)
       3   -> ignored (no override)
 3. If a self-report within ±60s of window midpoint differs from segment label, override
    and set label_source='self_report'. Store both original_segment_label and final label.
 4. Confidence defaults to 1.0; lowered to 0.7 if overridden or missing self-report when expected.

Inputs:
  * Window JSON files produced by agent (`backend/ml_training_data/window_XXXXXX_ml_features.json`).
  * Segments file (CSV or JSON lines) with columns:
        subject_id,session_id,segment_start,segment_end,segment_label
    Times are epoch seconds consistent with agent timestamps.
  * Optional self-reports CSV with columns:
        subject_id,session_id,timestamp,self_report

Outputs:
  * A flattened Parquet (or CSV) dataset with one row per window including labels.
  * Summary stats printed to stdout.

Usage examples:
  python ingest_label_windows.py --segments-file data/segments.csv \
     --windows-dir backend/ml_training_data --out-file data/dataset.parquet

  python ingest_label_windows.py --segments-file data/segments.csv \
     --self-reports-file data/self_reports.csv --out-file data/dataset.parquet

Assumptions:
  * All windows belong to one subject/session unless meta enrichment file provided.
  * If subject/session not embedded in window file name, you can pass --subject-id / --session-id.
"""


from __future__ import annotations

import argparse
import json
import os
from pathlib import Path
from typing import Dict, Any, List, Tuple, Optional

import numpy as np
import pandas as pd


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Ingest and label stress windows")
    p.add_argument("--windows-dir", default="backend/ml_training_data",
                   help="Directory containing window_*.json files")
    p.add_argument("--segments-file", required=False,
                   help="CSV or JSON lines file with segment definitions (required unless --infer-label-from-dir)")
    p.add_argument("--self-reports-file",
                   help="Optional CSV with self reports (subject_id,session_id,timestamp,self_report)")
    p.add_argument("--out-file", default="data/dataset.parquet",
                   help="Output dataset file (parquet or csv)")
    p.add_argument("--subject-id", help="Fallback subject_id if not derivable")
    p.add_argument("--session-id", help="Fallback session_id if not derivable")
    p.add_argument("--override-window-meta", action="store_true",
                   help="Force use of provided subject/session IDs even if present in data")
    p.add_argument("--report-window-midpoint", action="store_true",
                   help="Print each window midpoint + assigned label (debug)")
    p.add_argument("--recursive", action="store_true", help="Recursively scan subfolders for window JSON files")
    p.add_argument("--infer-label-from-dir", action="store_true", help="Infer label from parent directory name (calm/stressed)")
    return p.parse_args()


def load_segments(path: str) -> pd.DataFrame:
    ext = Path(path).suffix.lower()
    if ext in (".csv", ".tsv"):
        sep = "," if ext == ".csv" else "\t"
        df = pd.read_csv(path, sep=sep)
    else:
        # Assume JSON lines
        rows = []
        with open(path) as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                rows.append(json.loads(line))
        df = pd.DataFrame(rows)
    required = {"subject_id", "session_id",
                "segment_start", "segment_end", "segment_label"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Segments file missing columns: {missing}")
    return df


def load_self_reports(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    required = {"subject_id", "session_id", "timestamp", "self_report"}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Self-reports file missing columns: {missing}")
    return df


def flatten_window(d: Dict[str, Any]) -> Dict[str, Any]:
    flat: Dict[str, Any] = {}
    for k, v in d.items():
        if isinstance(v, dict):
            for sk, sv in v.items():
                # second level dict
                if isinstance(sv, dict):
                    for sk2, sv2 in sv.items():
                        flat[f"{k}.{sk}.{sk2}"] = sv2
                else:
                    flat[f"{k}.{sk}"] = sv
        else:
            flat[k] = v
    return flat


def assign_segment_label(mid_ts: float, segments: pd.DataFrame, subject_id: str, session_id: str) -> Tuple[Optional[str], Optional[str]]:
    segs = segments[(segments.subject_id == subject_id) & (segments.session_id == session_id) &
                    (segments.segment_start <= mid_ts) & (segments.segment_end >= mid_ts)]
    if segs.empty:
        return None, None
    # If overlapping, pick shortest segment (more specific)
    segs = segs.assign(length=segs.segment_end -
                       segs.segment_start).sort_values("length")
    row = segs.iloc[0]
    return row.segment_label, row.get("phase", None)


def map_self_report(val: float) -> Optional[str]:
    try:
        v = float(val)
    except Exception:
        return None
    if v <= 2:
        return "calm"
    if v >= 4:
        return "stressed"
    return None  # 3 ignored


def find_self_report_override(mid_ts: float, reports: pd.DataFrame, subject_id: str, session_id: str, window: float = 60.0) -> Optional[str]:
    subset = reports[(reports.subject_id == subject_id) &
                     (reports.session_id == session_id)]
    if subset.empty:
        return None
    subset = subset.assign(dist=(subset.timestamp - mid_ts).abs())
    close = subset[subset.dist <= window].sort_values("dist")
    if close.empty:
        return None
    mapped = map_self_report(close.iloc[0].self_report)
    return mapped


def main():

    args = parse_args()
    windows_dir = Path(args.windows_dir)
    if not windows_dir.exists():
        raise SystemExit(f"Windows directory not found: {windows_dir}")

    # Folder-based labeling mode
    if args.infer_label_from_dir:
        # Don't require segments file in this mode
        # Recursively scan for window_*.json files
        files = list(windows_dir.rglob("window_*_ml_features.json")) if args.recursive else list(windows_dir.glob("window_*_ml_features.json"))
        if not files:
            print("No window JSON files found.")
            return
        rows: List[Dict[str, Any]] = []
        for fp in files:
            try:
                with open(fp) as f:
                    data = json.load(f)
            except Exception as e:
                print(f"Skip {fp.name}: read error {e}")
                continue
            flat = flatten_window(data)
            # Parse subject_id from filename if not provided
            if args.subject_id:
                subject_id = args.subject_id
            else:
                import re
                match = re.search(r'window_(\d+)', fp.name)
                if match:
                    subject_id = int(str(match.group(1))[0])
                else:
                    subject_id = flat.get("subject_id", "S1")
            session_id = args.session_id or flat.get("session_id", "SES1")
            if args.override_window_meta:
                flat["subject_id"] = subject_id
                flat["session_id"] = session_id
            else:
                flat.setdefault("subject_id", subject_id)
                flat.setdefault("session_id", session_id)
            ts_start = flat.get("timestamp_start")
            ts_end = flat.get("timestamp_end")
            if ts_start is None or ts_end is None:
                print(f"Skip {fp.name}: missing timestamps")
                continue
            mid_ts = (ts_start + ts_end) / 2
            flat["window_mid_timestamp"] = mid_ts
            # Infer label from parent directory name
            parent_name = fp.parent.name.lower()
            if parent_name in ("calm", "stressed"):
                flat["label"] = parent_name
                flat["label_source"] = "dir_name"
                flat["label_confidence"] = 1.0
                flat["original_segment_label"] = None
            else:
                flat["label"] = None
                flat["label_source"] = "dir_name"
                flat["label_confidence"] = 0.0
                flat["original_segment_label"] = None
            if args.report_window_midpoint:
                print(f"Window {flat.get('window_id')} mid={mid_ts:.1f} label={flat['label']} source=dir_name")
            rows.append(flat)
        if not rows:
            print("No valid windows processed.")
            return
        df = pd.DataFrame(rows)
    # Basic cleaning: replace NaN/inf in numeric columns
    num_cols = df.select_dtypes(include=["float", "int"]).columns
    df[num_cols] = df[num_cols].replace([np.inf, -np.inf], np.nan)
    df[num_cols] = df[num_cols].fillna(df[num_cols].median(numeric_only=True))

    # Add reproducible random train/test split (80/20)
    np.random.seed(42)
    df['split'] = np.where(np.random.rand(len(df)) < 0.8, 'train', 'test')
    out_path = Path(args.out_file)
    # If not absolute, make it relative to current working directory
    if not out_path.is_absolute():
        # If running from backend/, default to backend/data/
        cwd = Path.cwd()
        if cwd.name == "backend":
            out_path = cwd / "data" / out_path.name if out_path.parent == Path('.') else cwd / out_path
        else:
            out_path = cwd / out_path
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if out_path.suffix.lower() == ".parquet":
        df.to_parquet(out_path, index=False)
    else:
        df.to_csv(out_path, index=False)
        # Summary
        total = len(df)
        labeled = df["label"].notna().sum()
        print(f"Saved dataset -> {out_path} ({total} windows, {labeled} labeled, {labeled/total:.1%} coverage)")
        print("Label counts:\n", df["label"].value_counts(dropna=False))
        print("Sources:\n", df["label_source"].value_counts())
        print("Mean confidence:", df["label_confidence"].mean().round(3))
        return

    # Default: segment/self-report labeling
    if not args.infer_label_from_dir:
        if not args.segments_file:
            raise SystemExit("--segments-file is required unless --infer-label-from-dir is set")
        segments = load_segments(args.segments_file)
        reports = load_self_reports(args.self_reports_file) if args.self_reports_file else None
        rows: List[Dict[str, Any]] = []
        files = sorted(windows_dir.glob("window_*_ml_features.json"))
        if not files:
            print("No window JSON files found.")
            return
        for fp in files:
            try:
                with open(fp) as f:
                    data = json.load(f)
            except Exception as e:
                print(f"Skip {fp.name}: read error {e}")
                continue
            flat = flatten_window(data)
            # Meta inference: attempt to extract subject/session from file name patterns if present later
            if args.subject_id:
                subject_id = args.subject_id
            else:
                import re
                match = re.search(r'window_(\d+)', fp.name)
                if match:
                    subject_id = int(str(match.group(1))[0])
                else:
                    subject_id = flat.get("subject_id", "S1")
            session_id = args.session_id or flat.get("session_id", "SES1")
            if args.override_window_meta:
                flat["subject_id"] = subject_id
                flat["session_id"] = session_id
            else:
                flat.setdefault("subject_id", subject_id)
                flat.setdefault("session_id", session_id)
            ts_start = flat.get("timestamp_start")
            ts_end = flat.get("timestamp_end")
            if ts_start is None or ts_end is None:
                print(f"Skip {fp.name}: missing timestamps")
                continue
            mid_ts = (ts_start + ts_end) / 2
            flat["window_mid_timestamp"] = mid_ts
            seg_label, seg_phase = assign_segment_label(mid_ts, segments, flat["subject_id"], flat["session_id"])
            flat["segment_label"] = seg_label
            if seg_phase is not None:
                flat["segment_phase"] = seg_phase
            final_label = seg_label
            label_source = "segment"
            label_confidence = 1.0 if seg_label else 0.0
            if reports is not None:
                override = find_self_report_override(mid_ts, reports, flat["subject_id"], flat["session_id"])
                if override is not None and seg_label is not None and override != seg_label:
                    final_label = override
                    label_source = "self_report_override"
                    label_confidence = 0.7
                elif override is not None and seg_label is None:
                    final_label = override
                    label_source = "self_report_only"
                    label_confidence = 0.8
                elif override is None and seg_label is not None:
                    # expected a report? If any reports exist for that session at all, down-weight slightly
                    if not reports[reports.session_id == flat["session_id"]].empty:
                        label_confidence = 0.9
            flat["label"] = final_label
            flat["label_source"] = label_source
            flat["label_confidence"] = label_confidence
            flat["original_segment_label"] = seg_label
            if args.report_window_midpoint:
                print(f"Window {flat.get('window_id')} mid={mid_ts:.1f} label={final_label} source={label_source}")
            rows.append(flat)
        if not rows:
            print("No valid windows processed.")
            return
        df = pd.DataFrame(rows)
        # Basic cleaning: replace NaN/inf in numeric columns
        num_cols = df.select_dtypes(include=["float", "int"]).columns
        df[num_cols] = df[num_cols].replace([np.inf, -np.inf], np.nan)
        df[num_cols] = df[num_cols].fillna(df[num_cols].median(numeric_only=True))
        out_path = Path(args.out_file)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        if out_path.suffix.lower() == ".parquet":
            df.to_parquet(out_path, index=False)
        else:
            df.to_csv(out_path, index=False)
        # Summary
        total = len(df)
        labeled = df["label"].notna().sum()
        print(f"Saved dataset -> {out_path} ({total} windows, {labeled} labeled, {labeled/total:.1%} coverage)")
        print("Label counts:\n", df["label"].value_counts(dropna=False))
        print("Sources:\n", df["label_source"].value_counts())
        print("Mean confidence:", df["label_confidence"].mean().round(3))


if __name__ == "__main__":  # pragma: no cover
    main()
