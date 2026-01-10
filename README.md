# Planet-Sandbox

Planet Sandbox is a Godot 4.3 project set up as a starting point for a systems-driven sandbox game. The project uses the Forward+ renderer and standard (non-ECS) scene graph architecture.

## Tech stack decisions
- **Engine**: Godot 4.3 (Forward+ renderer)
- **Scripting**: GDScript
- **ECS**: Not used; relies on Godot's node/scene model

## Project layout
- `assets/` – Art, audio, and other imported resources
- `code/` – Reusable modules and data types
- `scripts/` – Gameplay scripts (entry point: `main.gd`)
- `systems/` – Higher-level systems orchestration
- `ui/` – UI scenes, themes, and scripts
- `scenes/` – Game scenes (entry scene: `main.tscn`)

## Getting started
1. Install **Godot 4.3** (standard build).
2. Open the project directory in Godot. The startup scene is `scenes/main.tscn`.
3. Run the scene to verify the project loads and prints the initialization message.

## Development workflow
- **Lint/format**: `gdformat --check scripts` and `gdlint scripts`
- **Project validation**: `godot --headless --path . --check-only`

## Continuous Integration
GitHub Actions workflow `.github/workflows/ci.yml` runs:
- `gdformat --check` for formatting validation
- `gdlint` for linting
- Headless Godot project load check (`--check-only`) to ensure the project configuration stays valid

## Licensing
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
