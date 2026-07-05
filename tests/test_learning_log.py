from research_os.memory.learning_log import (
    LearningRecord,
    append_record,
    extract_learning_record,
    read_records,
)

SAMPLE_RESPONSE = """Here is your answer.

## Task Learning Record
* Task type: AI tool discovery
* User objective: Find a unified LLM API
* Approach used: Compared OpenRouter vs direct provider SDKs
* Sources or tools that were most useful: OpenRouter docs
* What worked: Single API key across many providers
* What did not work: N/A
* Errors or weak assumptions: None identified
* User preferences observed: Prefers open standards
* Reusable patterns: OpenAI-compatible base_url swap
* Recommended improvement: Cache the model catalog locally
* Confidence level: High
* Date of review: 2026-07-05
"""


def test_extract_learning_record_parses_fields():
    record = extract_learning_record(SAMPLE_RESPONSE, model="openai/gpt-5.2")
    assert record is not None
    assert record.task_type == "AI tool discovery"
    assert record.objective == "Find a unified LLM API"
    assert record.recommended_improvement == "Cache the model catalog locally"
    assert record.model == "openai/gpt-5.2"


def test_extract_learning_record_returns_none_without_section():
    assert extract_learning_record("just a plain answer, no record") is None


def test_append_and_read_records_roundtrip(fake_settings):
    record = LearningRecord(task_type="Research", objective="Test roundtrip")
    append_record(record, settings=fake_settings)
    append_record(LearningRecord(task_type="Second", objective="Another"), settings=fake_settings)

    records = read_records(settings=fake_settings)
    assert len(records) == 2
    assert records[0]["task_type"] == "Research"

    limited = read_records(limit=1, settings=fake_settings)
    assert len(limited) == 1
    assert limited[0]["task_type"] == "Second"
