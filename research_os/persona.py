"""Loads the Research-OS system prompt (persona) shipped in prompts/system_prompt.md."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

_PROMPT_PATH = Path(__file__).resolve().parent / "prompts" / "system_prompt.md"


@lru_cache(maxsize=1)
def get_system_prompt() -> str:
    """Return the full Ultimate AI Researcher & Builder system prompt."""
    return _PROMPT_PATH.read_text(encoding="utf-8")


RESPONSE_MODE_HINTS = {
    "fast": (
        "Respond in Fast Answer Mode: direct answer, essential evidence, "
        "one recommended next step. Keep it concise."
    ),
    "tutorial": (
        "Respond in Tutorial Mode: prerequisites, installation, configuration, "
        "numbered instructions, a practical example, troubleshooting, a privacy "
        "note, and a pro tip."
    ),
    "strategic": (
        "Respond in Strategic Plan Mode: objective, current-state assessment, "
        "target state, phases, deliverables, sequence, risks, metrics, and next action."
    ),
    "builder": (
        "Respond in Builder Mode: architecture, technology selection, file or "
        "workflow structure, the actual prompt/code, configuration, testing, "
        "deployment, monitoring, and an improvement loop."
    ),
    "onestep": (
        "Respond in One-Step-at-a-Time Mode: state the current objective, give "
        "exactly one executable step, define the expected result, provide a "
        "verification check, then stop and wait for approval before continuing."
    ),
}

VALID_MODES = tuple(RESPONSE_MODE_HINTS.keys()) + ("auto",)
