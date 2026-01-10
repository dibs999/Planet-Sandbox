"""Core simulation engine for Planet Sandbox."""
from __future__ import annotations

import random
from dataclasses import dataclass
from typing import Dict


@dataclass
class GameState:
    """Represents the current status of the player's colony."""

    name: str
    funds: int
    minerals: int
    research: int
    colonists: int
    colonist_target: int
    max_turns: int
    description: str = ""
    turn: int = 1
    morale: int = 5
    storm_risk: int = 0

    def is_victory(self) -> bool:
        return self.colonists >= self.colonist_target

    def is_defeat(self) -> bool:
        return self.turn > self.max_turns or self.funds < 0


class GameEngine:
    """Game logic for both sandbox and career modes."""

    ACTIONS: Dict[str, str] = {
        "mine": "Baue Mineralien ab und steigere Vorräte.",
        "research": "Investiere in Forschung, um bessere Kolonien zu errichten.",
        "settle": "Setze neue Kolonisten ein, kostet Mineralien und Forschung.",
        "trade": "Führe Handel durch, um zusätzliche Mittel zu erhalten.",
        "rest": "Lass eine Runde verstreichen, um Moral zu regenerieren.",
    }

    def __init__(self, state: GameState) -> None:
        self.state = state

    def available_actions(self) -> Dict[str, str]:
        return self.ACTIONS

    def advance_turn(self) -> None:
        self.state.turn += 1
        self.state.morale = max(0, min(10, self.state.morale))

        if self.state.storm_risk:
            if random.randint(1, 6) <= self.state.storm_risk:
                penalty = random.randint(1, 4)
                self.state.funds -= penalty
                self.state.minerals = max(0, self.state.minerals - penalty)
                self.state.morale = max(0, self.state.morale - 1)
                print("⚠️ Ein Sturm hat Teile deiner Infrastruktur beschädigt!")
            self.state.storm_risk = max(0, self.state.storm_risk - 1)

    def perform_action(self, action: str) -> str:
        action = action.lower().strip()
        if action not in self.ACTIONS:
            raise ValueError(f"Unbekannte Aktion: {action}")

        handler = getattr(self, f"_handle_{action}")
        result = handler()
        self.advance_turn()
        return result

    # --- Action handlers -------------------------------------------------
    def _handle_mine(self) -> str:
        cost = 3
        if self.state.funds < cost:
            return "Nicht genug Credits für den Bergbau." 
        self.state.funds -= cost
        mined = 4
        self.state.minerals += mined
        self.state.morale = min(10, self.state.morale + 1)
        return f"Bergbau erfolgreich! +{mined} Mineralien."

    def _handle_research(self) -> str:
        cost = 5
        if self.state.funds < cost:
            return "Dir fehlen Credits für Forschung." 
        self.state.funds -= cost
        gained = 2
        self.state.research += gained
        self.state.morale = min(10, self.state.morale + 1)
        return f"Forschung abgeschlossen! +{gained} Forschungspunkte."

    def _handle_settle(self) -> str:
        required_minerals = 5
        required_research = 2
        if self.state.minerals < required_minerals:
            return "Zu wenig Mineralien, um neue Module zu bauen."
        if self.state.research < required_research:
            return "Zu wenig Forschungspunkte für nachhaltige Kolonien."
        self.state.minerals -= required_minerals
        self.state.research -= required_research
        settlers = 3
        self.state.colonists += settlers
        self.state.funds -= 2
        self.state.morale = min(10, self.state.morale + 2)
        return f"{settlers} neue Kolonisten sind angekommen!"

    def _handle_trade(self) -> str:
        profit = 6
        self.state.funds += profit
        self.state.morale = max(0, self.state.morale - 1)
        self.state.storm_risk = min(3, self.state.storm_risk + 1)
        return "Handel abgeschlossen, aber erhöhte Sturmgefahr!"

    def _handle_rest(self) -> str:
        self.state.morale = min(10, self.state.morale + 2)
        return "Crew ruht sich aus. Moral steigt."

    # --- Rendering -------------------------------------------------------
    def render_state(self) -> str:
        remaining_turns = max(0, self.state.max_turns - self.state.turn + 1)
        return (
            f"\n=== {self.state.name} | Runde {self.state.turn} ===\n"
            f"Beschreibung: {self.state.description or 'Keine'}\n"
            f"Ziel: {self.state.colonists}/{self.state.colonist_target} Kolonisten\n"
            f"Credits: {self.state.funds} | Mineralien: {self.state.minerals} | "
            f"Forschung: {self.state.research} | Moral: {self.state.morale}\n"
            f"Sturmgefahr: {self.state.storm_risk}/3 | Verbleibende Runden: {remaining_turns}\n"
        )

    def outcome(self) -> str:
        if self.state.is_victory():
            return "Mission erfüllt! Die Kolonie floriert."
        if self.state.is_defeat():
            return "Mission gescheitert. Die Ressourcen sind erschöpft."
        return "Mission abgebrochen."


def run_interactive_session(engine: GameEngine) -> None:
    """CLI helper that runs an interactive session until victory or defeat."""

    print(engine.render_state())
    while not (engine.state.is_victory() or engine.state.is_defeat()):
        print("Wähle eine Aktion:")
        for key, description in engine.available_actions().items():
            print(f" - {key}: {description}")
        choice = input("> ").strip().lower()
        if choice in {"quit", "exit"}:
            print("Mission beendet.")
            return
        try:
            result = engine.perform_action(choice)
        except ValueError as exc:  # Invalid action
            print(exc)
            continue
        print(result)
        print(engine.render_state())

    print(engine.outcome())
