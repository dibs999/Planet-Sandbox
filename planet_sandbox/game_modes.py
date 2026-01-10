"""Game mode definitions for the Planet Sandbox project."""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import Callable, Dict, Iterable, List, Optional


@dataclass
class GameConfig:
    """Configuration describing the resources for a scenario."""

    name: str
    starting_funds: int = 30
    starting_minerals: int = 5
    starting_research: int = 0
    colonist_target: int = 10
    max_turns: int = 20
    description: str = ""

    def to_state(self) -> "GameState":
        """Create an initial :class:`GameState` for the configuration."""

        from .engine import GameState

        return GameState(
            name=self.name,
            funds=self.starting_funds,
            minerals=self.starting_minerals,
            research=self.starting_research,
            colonists=0,
            colonist_target=self.colonist_target,
            max_turns=self.max_turns,
            description=self.description,
        )


@dataclass
class CareerLevel:
    """Represents a single level in the career mode."""

    title: str
    config: GameConfig
    briefing: str
    advice: Optional[str] = None
    on_complete: Optional[Callable[["GameState"], None]] = None

    def __post_init__(self) -> None:
        if not self.briefing:
            raise ValueError("Career levels must provide a briefing for the player.")


@dataclass
class CareerMode:
    """Sequence of career levels for the player to tackle."""

    levels: List[CareerLevel] = field(default_factory=list)

    def __iter__(self) -> Iterable[CareerLevel]:
        return iter(self.levels)

    @classmethod
    def default(cls) -> "CareerMode":
        """Return a default set of levels with increasing complexity."""

        return cls(
            levels=[
                CareerLevel(
                    title="Orbital Outpost",
                    briefing=(
                        "Errichte eine stabile Orbitalstation und empfange die ersten Kolonisten. "
                        "Ein sanfter Einstieg in die Missionen des Planetensandkastens."
                    ),
                    advice="Priorisiere Forschung früh, damit du bessere Siedlungsstrukturen erhältst.",
                    config=GameConfig(
                        name="Orbitale Versorgungsstation",
                        starting_funds=35,
                        starting_minerals=8,
                        colonist_target=12,
                        max_turns=18,
                        description="Baue eine Forschungsstation im Orbit und docke Versorgungsschiffe an.",
                    ),
                ),
                CareerLevel(
                    title="Eisige Täler",
                    briefing=(
                        "Kolonisiere das polare Tal eines Mondes. Nutze Eisreserven, um Sauerstoff zu gewinnen."
                    ),
                    advice="Baue früh Förderanlagen, um genug Mineralien für Kuppeln zu sammeln.",
                    config=GameConfig(
                        name="Glaziales Habitat",
                        starting_funds=40,
                        starting_minerals=6,
                        starting_research=2,
                        colonist_target=18,
                        max_turns=22,
                        description="Ein lebensfeindlicher Mond mit reichlich Eisvorkommen.",
                    ),
                ),
                CareerLevel(
                    title="Sturmsaison",
                    briefing=(
                        "Widerstehe meterologen Extrembedingungen und führe die Kolonie durch einen Sturmzyklus."
                    ),
                    advice="Halte Reserven bereit, denn Stürme erhöhen die Unterhaltskosten.",
                    config=GameConfig(
                        name="Sturmtanz",
                        starting_funds=45,
                        starting_minerals=10,
                        starting_research=4,
                        colonist_target=24,
                        max_turns=24,
                        description="Ein Planet mit häufigen Staubstürmen, die Infrastruktur beschädigen können.",
                    ),
                ),
            ]
        )


@dataclass
class SandboxMode:
    """Sandbox configuration allowing the player to tailor the scenario."""

    config: GameConfig

    @classmethod
    def from_user_input(
        cls,
        *,
        name: str,
        colonist_target: int,
        starting_funds: int,
        starting_minerals: int,
        starting_research: int,
        max_turns: int,
        description: str = "",
    ) -> "SandboxMode":
        config = GameConfig(
            name=name,
            colonist_target=colonist_target,
            starting_funds=starting_funds,
            starting_minerals=starting_minerals,
            starting_research=starting_research,
            max_turns=max_turns,
            description=description,
        )
        return cls(config=config)


# Circular import guard: `GameState` is defined in engine.py, but type-checkers
# benefit from the forward references above.
