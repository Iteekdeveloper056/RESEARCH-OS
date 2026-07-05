"""Thin client for the OpenRouter unified LLM API.

OpenRouter (https://openrouter.ai) exposes an OpenAI-compatible API that
routes a single API key to 300+ hosted models across OpenAI, Anthropic,
Google, Meta, Mistral, DeepSeek, xAI, and other providers. This client is
deliberately dependency-light (``requests`` only) so it is easy to audit.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable

import requests

from research_os.config import ConfigError, Settings, get_settings


class OpenRouterError(RuntimeError):
    """Raised when the OpenRouter API returns an error response."""


@dataclass
class ChatResult:
    content: str
    model: str
    finish_reason: str | None
    usage: dict[str, Any]
    raw: dict[str, Any]


class OpenRouterClient:
    """Minimal synchronous wrapper around the OpenRouter chat + models endpoints."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()

    def _headers(self) -> dict[str, str]:
        api_key = self.settings.require_openrouter_key()
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": self.settings.site_url,
            "X-Title": self.settings.site_title,
        }

    def list_models(self) -> list[dict[str, Any]]:
        """Return the catalog of models currently available through OpenRouter."""
        url = f"{self.settings.openrouter_base_url}/models"
        response = requests.get(
            url, headers=self._headers(), timeout=self.settings.request_timeout
        )
        self._raise_for_status(response)
        return response.json().get("data", [])

    def chat_completion(
        self,
        messages: Iterable[dict[str, str]],
        model: str | None = None,
        temperature: float = 0.4,
        max_tokens: int | None = None,
        extra_body: dict[str, Any] | None = None,
    ) -> ChatResult:
        """Send a chat completion request and return the parsed result."""
        url = f"{self.settings.openrouter_base_url}/chat/completions"
        payload: dict[str, Any] = {
            "model": model or self.settings.default_model,
            "messages": list(messages),
            "temperature": temperature,
        }
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
        if extra_body:
            payload.update(extra_body)

        response = requests.post(
            url,
            headers=self._headers(),
            json=payload,
            timeout=self.settings.request_timeout,
        )
        self._raise_for_status(response)
        data = response.json()

        try:
            choice = data["choices"][0]
            content = choice["message"]["content"]
            finish_reason = choice.get("finish_reason")
        except (KeyError, IndexError) as exc:
            raise OpenRouterError(f"Unexpected OpenRouter response shape: {data}") from exc

        return ChatResult(
            content=content,
            model=data.get("model", payload["model"]),
            finish_reason=finish_reason,
            usage=data.get("usage", {}),
            raw=data,
        )

    @staticmethod
    def _raise_for_status(response: requests.Response) -> None:
        if response.ok:
            return
        try:
            detail = response.json()
        except ValueError:
            detail = response.text
        raise OpenRouterError(
            f"OpenRouter request failed ({response.status_code}): {detail}"
        )


__all__ = ["OpenRouterClient", "OpenRouterError", "ChatResult", "ConfigError"]
