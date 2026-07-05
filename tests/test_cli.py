import responses
from click.testing import CliRunner

from research_os.cli import cli


def _env(tmp_path, monkeypatch):
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-key-123")
    monkeypatch.setenv("OPENROUTER_BASE_URL", "https://openrouter.test/api/v1")
    monkeypatch.setenv("RESEARCH_OS_HOME", str(tmp_path))
    monkeypatch.delenv("TAVILY_API_KEY", raising=False)


@responses.activate
def test_cli_models_lists_catalog(tmp_path, monkeypatch):
    _env(tmp_path, monkeypatch)
    responses.add(
        responses.GET,
        "https://openrouter.test/api/v1/models",
        json={
            "data": [
                {
                    "id": "openai/gpt-5.2",
                    "context_length": 400000,
                    "pricing": {"prompt": "0.000002", "completion": "0.000008"},
                }
            ]
        },
        status=200,
    )
    runner = CliRunner()
    result = runner.invoke(cli, ["models"])
    assert result.exit_code == 0
    assert "openai/gpt-5.2" in result.output


def test_cli_models_errors_cleanly_without_key(tmp_path, monkeypatch):
    monkeypatch.delenv("OPENROUTER_API_KEY", raising=False)
    monkeypatch.setenv("RESEARCH_OS_HOME", str(tmp_path))
    runner = CliRunner()
    result = runner.invoke(cli, ["models"])
    assert result.exit_code == 1
    assert "OPENROUTER_API_KEY" in result.output


@responses.activate
def test_cli_ask_prints_reply_and_saves_learning(tmp_path, monkeypatch):
    _env(tmp_path, monkeypatch)
    responses.add(
        responses.POST,
        "https://openrouter.test/api/v1/chat/completions",
        json={
            "model": "openai/gpt-5.2",
            "choices": [
                {
                    "message": {
                        "content": "Here is the plan.\n\n## Task Learning Record\n* Task type: Planning"
                    },
                    "finish_reason": "stop",
                }
            ],
            "usage": {"total_tokens": 10},
        },
        status=200,
    )
    runner = CliRunner()
    result = runner.invoke(cli, ["ask", "Plan my launch", "--mode", "strategic"])
    assert result.exit_code == 0
    assert "Here is the plan." in result.output
    assert "Task Learning Record saved" in result.output

    learnings_result = runner.invoke(cli, ["learnings"])
    assert learnings_result.exit_code == 0
    assert "Planning" in learnings_result.output


def test_cli_learnings_empty(tmp_path, monkeypatch):
    monkeypatch.setenv("RESEARCH_OS_HOME", str(tmp_path))
    runner = CliRunner()
    result = runner.invoke(cli, ["learnings"])
    assert result.exit_code == 0
    assert "No learning records stored yet." in result.output
