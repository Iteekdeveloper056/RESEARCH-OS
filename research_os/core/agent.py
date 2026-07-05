"""Orchestrates a single Research-OS turn: persona + optional web search
context + response-mode instructions -> OpenRouter chat completion ->
optional Task Learning Record capture.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from research_os.config import Settings, get_settings
from research_os.memory.learning_log import LearningRecord, append_record, extract_learning_record
from research_os.persona import RESPONSE_MODE_HINTS, get_system_prompt
from research_os.providers.openrouter import ChatResult, OpenRouterClient
from research_os.tools.web_search import format_results_for_prompt, search

RESEARCH_TRIGGER_KEYWORDS = (
    "latest",
    "current",
    "price",
    "pricing",
    "version",
    "release",
    "news",
    "today",
    "2026",
    "compare",
    "vs",
    "best",
    "new",
)


@dataclass
class TurnResult:
    reply: str
    chat_result: ChatResult
    learning_record: LearningRecord | None
    search_context_used: bool


@dataclass
class ResearchOSAgent:
    """Stateful conversational wrapper around the persona + OpenRouter model."""

    model: str | None = None
    enable_search: bool = True
    settings: Settings = field(default_factory=get_settings)
    history: list[dict[str, str]] = field(default_factory=list)
    client: OpenRouterClient = field(init=False)

    def __post_init__(self) -> None:
        self.client = OpenRouterClient(self.settings)
        if not self.history:
            self.history.append({"role": "system", "content": get_system_prompt()})

    def _should_search(self, user_input: str) -> bool:
        if not self.enable_search:
            return False
        lowered = user_input.lower()
        return any(keyword in lowered for keyword in RESEARCH_TRIGGER_KEYWORDS)

    def run_turn(
        self,
        user_input: str,
        mode: str = "auto",
        capture_learning: bool = True,
        force_search: bool | None = None,
    ) -> TurnResult:
        """Run one conversational turn and return the assistant's reply."""
        should_search = force_search if force_search is not None else self._should_search(user_input)
        search_context_used = False
        augmented_input = user_input

        if should_search:
            outcome = search(user_input, settings=self.settings)
            search_context_used = outcome.available
            augmented_input = (
                f"{user_input}\n\n---\n"
                f"[Tool: web_search]\n{format_results_for_prompt(outcome)}\n---"
            )

        mode_hint = RESPONSE_MODE_HINTS.get(mode)
        if mode_hint:
            augmented_input = f"{augmented_input}\n\n(Response mode instruction: {mode_hint})"

        if capture_learning:
            augmented_input += (
                "\n\n(End your answer with a '## Task Learning Record' section using "
                "the bullet fields defined in the system prompt's learning loop.)"
            )

        self.history.append({"role": "user", "content": augmented_input})
        chat_result = self.client.chat_completion(
            messages=self.history, model=self.model or self.settings.default_model
        )
        self.history.append({"role": "assistant", "content": chat_result.content})

        learning_record = None
        if capture_learning:
            learning_record = extract_learning_record(chat_result.content, model=chat_result.model)
            if learning_record:
                append_record(learning_record, settings=self.settings)

        return TurnResult(
            reply=chat_result.content,
            chat_result=chat_result,
            learning_record=learning_record,
            search_context_used=search_context_used,
        )

    def reset(self) -> None:
        self.history = [{"role": "system", "content": get_system_prompt()}]
