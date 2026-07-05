import responses

from research_os.tools.web_search import format_results_for_prompt, search


def test_search_reports_unavailable_without_key(fake_settings):
    outcome = search("latest gpt release date", settings=fake_settings)
    assert outcome.available is False
    assert "TAVILY_API_KEY" in outcome.message
    text = format_results_for_prompt(outcome)
    assert "unavailable" in text


@responses.activate
def test_search_parses_results_when_key_present(fake_settings):
    fake_settings.tavily_api_key = "tvly-test"
    responses.add(
        responses.POST,
        "https://api.tavily.com/search",
        json={
            "results": [
                {"title": "OpenRouter Docs", "url": "https://openrouter.ai/docs", "content": "API docs"},
            ]
        },
        status=200,
    )
    outcome = search("openrouter docs", settings=fake_settings)
    assert outcome.available is True
    assert outcome.results[0].title == "OpenRouter Docs"
    text = format_results_for_prompt(outcome)
    assert "OpenRouter Docs" in text
