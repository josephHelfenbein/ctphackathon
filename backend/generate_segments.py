"""Generate a segments CSV for labeling exported windows.

Use when you ran a controlled session with known ordered phases (e.g., baseline -> task -> recovery).

Example:
  python backend/generate_segments.py \
      --subject S01 --session SES01 \
      --start-time 1755805200 \
      --phases baseline:calm:120 task:stressed:180 recovery:calm:120 \
      --out data/segments.csv

Each phase spec: <phase_name>:<segment_label>:<duration_seconds>

If you don't know exact epoch start time, capture it right when you begin recording:
  date +%s   (macOS/Linux shell)
OR inside Python:
  import time; print(int(time.time()))

Output columns: subject_id,session_id,segment_start,segment_end,segment_label,phase
"""
from __future__ import annotations

import argparse
import csv
import time
from pathlib import Path


def parse_args():
    p = argparse.ArgumentParser(description="Generate segment label CSV")
    p.add_argument("--subject", required=True, help="Subject ID, e.g. S01")
    p.add_argument("--session", required=True, help="Session ID, e.g. SES01")
    p.add_argument("--start-time", type=float, help="Epoch seconds when recording began; default now()")
    p.add_argument("--phases", nargs='+', required=True, help="List of phase specs phase:label:seconds")
    p.add_argument("--out", default="data/segments.csv", help="Output CSV path")
    return p.parse_args()


def parse_phase(spec: str):
    parts = spec.split(":")
    if len(parts) != 3:
        raise ValueError(f"Bad phase spec '{spec}' (expected phase:label:seconds)")
    phase, label, seconds = parts[0], parts[1], float(parts[2])
    return phase, label, seconds


def main():
    args = parse_args()
    start = args.start_time or time.time()
    t = start
    rows = []
    for spec in args.phases:
        phase, label, dur = parse_phase(spec)
        row = {
            "subject_id": args.subject,
            "session_id": args.session,
            "segment_start": t,
            "segment_end": t + dur,
            "segment_label": label,
            "phase": phase,
        }
        rows.append(row)
        t += dur

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)

    total_time = rows[-1]["segment_end"] - rows[0]["segment_start"]
    print(f"Wrote {len(rows)} segments -> {out_path} (total scheduled {total_time:.0f}s)")


if __name__ == "__main__":  # pragma: no cover
    main()
