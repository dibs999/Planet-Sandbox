# Planet Sandbox

Ein textbasiertes Strategiespiel, das zwei Modi bereitstellt:

- **Karriere-Modus**: Spiele eine Kampagne mit drei Missionen, die jeweils eigene Ziele und Ressourcen bereitstellen.
- **Sandbox-Modus**: Konfiguriere dein eigenes Szenario mit benutzerdefinierten Parametern.

## Voraussetzungen

- Python 3.9 oder höher

## Installation

```
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
```

Das Projekt hat keine externen Abhängigkeiten.

## Spiel starten

Karriere-Modus:

```
python main.py --mode career
```

Sandbox-Modus:

```
python main.py --mode sandbox --name "Test" --target 20 --funds 40 --minerals 10 --research 3 --turns 25
```

Während des Spiels wirst du nach Aktionen gefragt. Zur Verfügung stehen **mine**, **research**, **settle**, **trade** und **rest**. Tippe `quit`, um das Spiel zu verlassen.
