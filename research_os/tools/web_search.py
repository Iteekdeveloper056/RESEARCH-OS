"""Pluggable web-search tool used to satisfy the persona's "research before
assuming" principle.

Only Tavily (https://tavily.com) is wired up by default because it has a
simple REST API well suited for LLM agents, but the interface is generic
enough to add other providers later. When no search API key is configured,
:func:`search` returns an explicit "unavailable" result instead of silently
fabricating results, so the agent can honestly disclose the limitation.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

import requests

from research_os.config import Settings, get_settings

TAVILY_ENDPOINT = "https://api.tavily.com/search"


@dataclass
class SearchResultItem:
    title: str
    url: str
    snippet: str


@dataclass
class SearchOutcome:
    available: bool
    query: str
    results: list[SearchResultItem] = field(default_factory=list)
    message: str = ""


def search(
    query: str, max_results: int = 5, settings: Settings | None = None
) -> SearchOutcome:
    """Run a web search if a search provider is configured, else report that."""
    settings = settings or get_settings()

    if not settings.tavily_api_key:
        return SearchOutcome(
            available=False,
            query=query,
            results=[],
            message=(
                "No web-search provider is configured (TAVILY_API_KEY is unset), "
                "so this answer relies on model knowledge only and may be out of "
                "date. Configure TAVILY_API_KEY to enable live verification."
            ),
        )

    payload: dict[str, Any] = {
        "api_key": settings.tavily_api_key,
        "query": query,
        "max_results": max_results,
    }
    response = requests.post(TAVILY_ENDPOINT, json=payload, timeout=settings.request_timeout)
    response.raise_for_status()
    data = response.json()

    results = [
        SearchResultItem(
            title=item.get("title", ""),
            url=item.get("url", ""),
            snippet=item.get("content", ""),
        )
        for item in data.get("results", [])[:max_results]
    ]
    return SearchOutcome(available=True, query=query, results=results, message="ok")


def format_results_for_prompt(outcome: SearchOutcome) -> str:
    """Render a SearchOutcome as plain text suitable for injecting into a prompt."""
    if not outcome.available:
        return f"[web search unavailable] {outcome.message}"
    if not outcome.results:
        return f"[web search returned no results for: {outcome.query}]"

    lines = [f"Web search results for: {outcome.query}"]
    for i, item in enumerate(outcome.results, start=1):
        lines.append(f"{i}. {item.title} ({item.url})\n   {item.snippet}")
    return "\n".join(lines)
