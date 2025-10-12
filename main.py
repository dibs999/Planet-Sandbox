"""Command line entry point for the Planet Sandbox project."""
from __future__ import annotations

import argparse

from planet_sandbox.engine import GameEngine, run_interactive_session
from planet_sandbox.game_modes import CareerMode, SandboxMode


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Planet Sandbox Textabenteuer")
    parser.add_argument(
        "--mode",
        choices=["career", "sandbox"],
        default="career",
        help="Wähle zwischen Karriere- oder Sandboxmodus.",
    )
    parser.add_argument("--name", default="Benutzerdefiniertes Habitat", help="Name für Sandbox-Szenario")
    parser.add_argument("--target", type=int, default=15, help="Kolonistenziel im Sandboxmodus")
    parser.add_argument("--funds", type=int, default=35, help="Startcredits im Sandboxmodus")
    parser.add_argument("--minerals", type=int, default=8, help="Startmineralien im Sandboxmodus")
    parser.add_argument("--research", type=int, default=1, help="Startforschung im Sandboxmodus")
    parser.add_argument("--turns", type=int, default=20, help="Maximale Rundenzahl im Sandboxmodus")
    parser.add_argument(
        "--description",
        default="Eine freie Mission mit selbst festgelegten Parametern.",
        help="Beschreibung des Sandbox-Szenarios.",
    )
    return parser


def run_career_mode() -> None:
    career = CareerMode.default()
    for level_number, level in enumerate(career, start=1):
        print("\n" + "#" * 72)
        print(f"Karriere-Level {level_number}: {level.title}")
        print(level.briefing)
        if level.advice:
            print(f"Tipp: {level.advice}")
        engine = GameEngine(level.config.to_state())
        run_interactive_session(engine)
        if not engine.state.is_victory():
            print("Karriere-Modus endet hier. Versuche es erneut!")
            return
        if level.on_complete is not None:
            level.on_complete(engine.state)
    print("\nGlückwunsch! Du hast alle Missionen des Karriere-Modus abgeschlossen.")


def run_sandbox_mode(args: argparse.Namespace) -> None:
    sandbox = SandboxMode.from_user_input(
        name=args.name,
        colonist_target=args.target,
        starting_funds=args.funds,
        starting_minerals=args.minerals,
        starting_research=args.research,
        max_turns=args.turns,
        description=args.description,
    )
    engine = GameEngine(sandbox.config.to_state())
    run_interactive_session(engine)


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    if args.mode == "career":
        run_career_mode()
    else:
        run_sandbox_mode(args)


if __name__ == "__main__":
    main()
