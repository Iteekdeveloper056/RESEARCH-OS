import pytest

from research_os.config import ConfigError, Settings


def test_require_openrouter_key_raises_when_missing():
    settings = Settings(openrouter_api_key=None)
    with pytest.raises(ConfigError):
        settings.require_openrouter_key()


def test_require_openrouter_key_returns_value_when_present():
    settings = Settings(openrouter_api_key="sk-test")
    assert settings.require_openrouter_key() == "sk-test"


def test_defaults_are_sane():
    settings = Settings(openrouter_api_key="sk-test")
    assert settings.openrouter_base_url.startswith("https://")
    assert "/" in settings.default_model
