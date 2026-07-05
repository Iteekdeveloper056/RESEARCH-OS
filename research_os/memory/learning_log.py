"""Persistent Task Learning Record store.

Records are appended as JSON Lines to ``<learning_log_dir>/learning_log.jsonl``.
This is deliberately a plain local file (no external service) so the agent
never claims a form of persistence it does not actually have, and so users
can inspect, edit, or delete the file themselves at any time.
"""
from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from research_os.config import Settings, get_settings

LEARNING_RECORD_HEADING = "Task Learning Record"


@dataclass
class LearningRecord:
    task_type: str = ""
    objective: str = ""
    approach: str = ""
    sources_or_tools: str = ""
    what_worked: str = ""
    what_did_not_work: str = ""
    errors_or_weak_assumptions: str = ""
    user_preferences_observed: str = ""
    reusable_patterns: str = ""
    recommended_improvement: str = ""
    confidence_level: str = ""
    review_date: str = field(
        default_factory=lambda: datetime.now(timezone.utc).date().isoformat()
    )
    model: str = ""
    raw_text: str = ""

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


def _log_path(settings: Settings | None = None) -> Path:
    settings = settings or get_settings()
    settings.learning_log_dir.mkdir(parents=True, exist_ok=True)
    return settings.learning_log_dir / "learning_log.jsonl"


def append_record(record: LearningRecord, settings: Settings | None = None) -> Path:
    """Append a learning record to the JSONL log and return the file path."""
    path = _log_path(settings)
    with path.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(record.to_dict(), ensure_ascii=False) + "\n")
    return path


def read_records(limit: int | None = None, settings: Settings | None = None) -> list[dict[str, Any]]:
    """Read stored learning records, most recent last (or first `limit` if given)."""
    path = _log_path(settings)
    if not path.exists():
        return []
    records = [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    if limit is not None:
        records = records[-limit:]
    return records


_FIELD_ALIASES = {
    "task type": "task_type",
    "user objective": "objective",
    "objective": "objective",
    "approach used": "approach",
    "approach": "approach",
    "sources or tools that were most useful": "sources_or_tools",
    "sources/tools": "sources_or_tools",
    "what worked": "what_worked",
    "what did not work": "what_did_not_work",
    "what did not work / did not work": "what_did_not_work",
    "errors or weak assumptions": "errors_or_weak_assumptions",
    "user preferences observed": "user_preferences_observed",
    "reusable patterns": "reusable_patterns",
    "recommended improvement for similar future tasks": "recommended_improvement",
    "recommended improvement": "recommended_improvement",
    "confidence level": "confidence_level",
    "date of review": "review_date",
    "review date": "review_date",
}


def extract_learning_record(response_text: str, model: str = "") -> LearningRecord | None:
    """Parse a '## Task Learning Record' section (if present) out of model output.

    Expected bullet format, matching the master prompt's spec:
        * Task type: ...
        * User objective: ...
        * ...
    Falls back gracefully (storing the raw block) if the model deviates from
    the exact field names.
    """
    match = re.search(
        rf"#+\s*{re.escape(LEARNING_RECORD_HEADING)}\s*\n(.+)",
        response_text,
        flags=re.IGNORECASE | re.DOTALL,
    )
    if not match:
        return None

    block = match.group(1).strip()
    record = LearningRecord(model=model, raw_text=block)

    for line in block.splitlines():
        line = line.strip().lstrip("*-").strip()
        if not line or ":" not in line:
            continue
        key, _, value = line.partition(":")
        field_name = _FIELD_ALIASES.get(key.strip().lower())
        if field_name:
            setattr(record, field_name, value.strip())

    return record
