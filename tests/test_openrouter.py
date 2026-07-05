import pytest
import responses

from research_os.providers.openrouter import OpenRouterClient, OpenRouterError


@responses.activate
def test_list_models_returns_catalog(fake_settings):
    responses.add(
        responses.GET,
        "https://openrouter.test/api/v1/models",
        json={"data": [{"id": "openai/gpt-5.2"}, {"id": "anthropic/claude-sonnet-4"}]},
        status=200,
    )
    client = OpenRouterClient(fake_settings)
    models = client.list_models()
    assert [m["id"] for m in models] == ["openai/gpt-5.2", "anthropic/claude-sonnet-4"]

    sent_auth = responses.calls[0].request.headers["Authorization"]
    assert sent_auth == "Bearer test-key-123"


@responses.activate
def test_chat_completion_parses_content(fake_settings):
    responses.add(
        responses.POST,
        "https://openrouter.test/api/v1/chat/completions",
        json={
            "model": "openai/gpt-5.2",
            "choices": [
                {"message": {"content": "hello there"}, "finish_reason": "stop"}
            ],
            "usage": {"total_tokens": 12},
        },
        status=200,
    )
    client = OpenRouterClient(fake_settings)
    result = client.chat_completion(messages=[{"role": "user", "content": "hi"}])
    assert result.content == "hello there"
    assert result.finish_reason == "stop"
    assert result.usage == {"total_tokens": 12}


@responses.activate
def test_chat_completion_raises_on_http_error(fake_settings):
    responses.add(
        responses.POST,
        "https://openrouter.test/api/v1/chat/completions",
        json={"error": {"message": "invalid model"}},
        status=400,
    )
    client = OpenRouterClient(fake_settings)
    with pytest.raises(OpenRouterError):
        client.chat_completion(messages=[{"role": "user", "content": "hi"}])


@responses.activate
def test_chat_completion_raises_on_malformed_body(fake_settings):
    responses.add(
        responses.POST,
        "https://openrouter.test/api/v1/chat/completions",
        json={"unexpected": "shape"},
        status=200,
    )
    client = OpenRouterClient(fake_settings)
    with pytest.raises(OpenRouterError):
        client.chat_completion(messages=[{"role": "user", "content": "hi"}])
