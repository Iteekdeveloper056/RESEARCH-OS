"""Command-line interface for Research-OS.

Examples:
    research-os models --search claude
    research-os ask "Compare Tavily vs Serper for agent web search" --mode strategic
    research-os chat --model anthropic/claude-sonnet-4
    research-os learnings --limit 5
"""
from __future__ import annotations

import sys

import click
from rich.console import Console
from rich.markdown import Markdown
from rich.table import Table

from research_os.config import ConfigError, get_settings
from research_os.core.agent import ResearchOSAgent
from research_os.memory.learning_log import read_records
from research_os.persona import VALID_MODES
from research_os.providers.openrouter import OpenRouterClient, OpenRouterError

console = Console()


@click.group()
def cli() -> None:
    """Research-OS: the Ultimate AI Researcher & Builder, running on any OpenRouter model."""


@cli.command()
@click.option("--search", "filter_text", default=None, help="Filter models by substring.")
@click.option("--limit", default=30, show_default=True, help="Max number of models to display.")
def models(filter_text: str | None, limit: int) -> None:
    """List models currently available through the configured OpenRouter key."""
    settings = get_settings()
    try:
        client = OpenRouterClient(settings)
        catalog = client.list_models()
    except (ConfigError, OpenRouterError) as exc:
        console.print(f"[bold red]Error:[/bold red] {exc}")
        sys.exit(1)

    if filter_text:
        catalog = [m for m in catalog if filter_text.lower() in m.get("id", "").lower()]

    table = Table(title=f"OpenRouter models ({len(catalog)} shown, limit {limit})")
    table.add_column("Model ID")
    table.add_column("Context Length", justify="right")
    table.add_column("Prompt $/1M", justify="right")
    table.add_column("Completion $/1M", justify="right")

    for m in catalog[:limit]:
        pricing = m.get("pricing", {})

        def per_million(value: str | None) -> str:
            if value is None:
                return "-"
            try:
                return f"{float(value) * 1_000_000:.2f}"
            except (TypeError, ValueError):
                return "-"

        table.add_row(
            m.get("id", "?"),
            str(m.get("context_length", "-")),
            per_million(pricing.get("prompt")),
            per_million(pricing.get("completion")),
        )
    console.print(table)


@cli.command()
@click.argument("prompt")
@click.option("--model", default=None, help="OpenRouter model id, e.g. anthropic/claude-sonnet-4.")
@click.option(
    "--mode",
    type=click.Choice(VALID_MODES),
    default="auto",
    help="Force a specific response mode instead of letting the persona choose.",
)
@click.option("--no-search", is_flag=True, help="Disable the web-search tool for this question.")
@click.option("--no-learning", is_flag=True, help="Do not request/store a Task Learning Record.")
def ask(prompt: str, model: str | None, mode: str, no_search: bool, no_learning: bool) -> None:
    """Ask Research-OS a single question and print the answer."""
    agent = ResearchOSAgent(model=model, enable_search=not no_search)
    try:
        result = agent.run_turn(prompt, mode=mode, capture_learning=not no_learning)
    except (ConfigError, OpenRouterError) as exc:
        console.print(f"[bold red]Error:[/bold red] {exc}")
        sys.exit(1)

    console.print(Markdown(result.reply))
    console.print(
        f"\n[dim]model={result.chat_result.model} "
        f"search_used={result.search_context_used} "
        f"tokens={result.chat_result.usage}[/dim]"
    )
    if result.learning_record:
        console.print("[dim]Task Learning Record saved to the local learning log.[/dim]")


@cli.command()
@click.option("--model", default=None, help="OpenRouter model id to use for the whole session.")
@click.option("--no-search", is_flag=True, help="Disable the web-search tool for this session.")
def chat(model: str | None, no_search: bool) -> None:
    """Start an interactive Research-OS chat session (type /exit to quit)."""
    agent = ResearchOSAgent(model=model, enable_search=not no_search)
    console.print(
        "[bold cyan]Research-OS interactive chat.[/bold cyan] "
        "Commands: /mode <fast|tutorial|strategic|builder|onestep|auto>, /reset, /exit"
    )
    mode = "auto"
    while True:
        try:
            user_input = console.input("[bold green]you>[/bold green] ")
        except (EOFError, KeyboardInterrupt):
            console.print("\n[dim]Session ended.[/dim]")
            break

        if not user_input.strip():
            continue
        if user_input.strip() in ("/exit", "/quit"):
            break
        if user_input.strip() == "/reset":
            agent.reset()
            console.print("[dim]Conversation reset.[/dim]")
            continue
        if user_input.startswith("/mode"):
            parts = user_input.split()
            if len(parts) == 2 and parts[1] in VALID_MODES:
                mode = parts[1]
                console.print(f"[dim]Mode set to {mode}.[/dim]")
            else:
                console.print(f"[dim]Usage: /mode <{'|'.join(VALID_MODES)}>[/dim]")
            continue

        try:
            result = agent.run_turn(user_input, mode=mode)
        except (ConfigError, OpenRouterError) as exc:
            console.print(f"[bold red]Error:[/bold red] {exc}")
            continue

        console.print(Markdown(result.reply))


@cli.command()
@click.option("--limit", default=10, show_default=True, help="Number of recent records to show.")
def learnings(limit: int) -> None:
    """Show recently stored Task Learning Records."""
    records = read_records(limit=limit)
    if not records:
        console.print("[dim]No learning records stored yet.[/dim]")
        return
    for i, record in enumerate(records, start=1):
        console.print(f"[bold]{i}. {record.get('task_type') or 'Untitled task'}[/bold]")
        console.print(f"   objective: {record.get('objective')}")
        console.print(f"   worked: {record.get('what_worked')}")
        console.print(f"   improve next time: {record.get('recommended_improvement')}")
        console.print(f"   reviewed: {record.get('review_date')}\n")


def main() -> None:
    cli()


if __name__ == "__main__":
    main()
