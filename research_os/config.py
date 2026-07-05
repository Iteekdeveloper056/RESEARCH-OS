"""Runtime configuration for Research-OS.

All secrets are read from environment variables (optionally loaded from a
local ``.env`` file for development). Nothing sensitive is ever hard-coded.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except ImportError:  # pragma: no cover - dotenv is an optional convenience
    pass

DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
DEFAULT_MODEL = "openai/gpt-5.2"
DEFAULT_TIMEOUT_SECONDS = 60
DEFAULT_LEARNING_LOG_DIR = Path.home() / ".research_os"


class ConfigError(RuntimeError):
    """Raised when required configuration (usually a secret) is missing."""


@dataclass
class Settings:
    openrouter_api_key: str | None = field(
        default_factory=lambda: os.getenv("OPENROUTER_API_KEY")
    )
    openrouter_base_url: str = field(
        default_factory=lambda: os.getenv(
            "OPENROUTER_BASE_URL", DEFAULT_OPENROUTER_BASE_URL
        )
    )
    default_model: str = field(
        default_factory=lambda: os.getenv("RESEARCH_OS_DEFAULT_MODEL", DEFAULT_MODEL)
    )
    tavily_api_key: str | None = field(
        default_factory=lambda: os.getenv("TAVILY_API_KEY")
    )
    site_url: str = field(
        default_factory=lambda: os.getenv("RESEARCH_OS_SITE_URL", "https://local.research-os")
    )
    site_title: str = field(
        default_factory=lambda: os.getenv("RESEARCH_OS_SITE_TITLE", "Research-OS")
    )
    learning_log_dir: Path = field(
        default_factory=lambda: Path(
            os.getenv("RESEARCH_OS_HOME", str(DEFAULT_LEARNING_LOG_DIR))
        )
    )
    request_timeout: int = field(
        default_factory=lambda: int(
            os.getenv("RESEARCH_OS_TIMEOUT", str(DEFAULT_TIMEOUT_SECONDS))
        )
    )

    def require_openrouter_key(self) -> str:
        if not self.openrouter_api_key:
            raise ConfigError(
                "OPENROUTER_API_KEY is not set. Add it as an environment variable "
                "(or a Cursor Cloud Agent secret / local .env file) before calling "
                "any OpenRouter-backed model. See README.md for setup instructions."
            )
        return self.openrouter_api_key


def get_settings() -> Settings:
    """Return a fresh Settings instance built from the current environment.

    A fresh instance (rather than a cached singleton) keeps tests and
    interactive sessions free of stale environment-variable state.
    """
    return Settings()
