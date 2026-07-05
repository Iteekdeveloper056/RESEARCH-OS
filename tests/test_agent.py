import responses

from research_os.core.agent import ResearchOSAgent


def _mock_chat(content: str):
    responses.add(
        responses.POST,
        "https://openrouter.test/api/v1/chat/completions",
        json={
            "model": "openai/gpt-5.2",
            "choices": [{"message": {"content": content}, "finish_reason": "stop"}],
            "usage": {"total_tokens": 42},
        },
        status=200,
    )


@responses.activate
def test_run_turn_injects_system_prompt_and_returns_reply(fake_settings):
    _mock_chat("Sure, here's the plan.\n\n## Task Learning Record\n* Task type: Planning")
    agent = ResearchOSAgent(settings=fake_settings, enable_search=False)

    result = agent.run_turn("Help me plan a launch", mode="strategic")

    assert result.reply.startswith("Sure, here's the plan.")
    assert agent.history[0]["role"] == "system"
    assert "Ultimate AI Researcher" in agent.history[0]["content"]
    sent_body = responses.calls[0].request.body
    assert b"strategic" in sent_body or b"Strategic" in sent_body
    assert result.learning_record is not None
    assert result.learning_record.task_type == "Planning"


@responses.activate
def test_run_turn_triggers_search_context_for_time_sensitive_query(fake_settings):
    _mock_chat("Answer without live search since no key configured.")
    agent = ResearchOSAgent(settings=fake_settings, enable_search=True)

    result = agent.run_turn("What is the latest pricing for this API?", capture_learning=False)

    assert result.search_context_used is False
    sent_body = responses.calls[0].request.body.decode()
    assert "web search unavailable" in sent_body


@responses.activate
def test_reset_clears_history_back_to_system_prompt(fake_settings):
    _mock_chat("ok")
    agent = ResearchOSAgent(settings=fake_settings, enable_search=False)
    agent.run_turn("hello", capture_learning=False)
    assert len(agent.history) == 3

    agent.reset()
    assert len(agent.history) == 1
    assert agent.history[0]["role"] == "system"
