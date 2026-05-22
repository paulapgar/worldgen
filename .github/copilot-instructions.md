# Copilot Instructions — Excalibur Projects

Purpose: brief, repo-level guidance for the coding assistant. Keep edits small, ask clarifying questions for risky changes, and prefer convention-preserving fixes.

## TypeScript Best Practices
- Prefer explicit types and avoid `any` unless temporary; use `unknown` when appropriate.
- Enable and respect strict compiler options (`strict`, `noImplicitAny`, `strictNullChecks`).
- Use `const`/`let` correctly; prefer `readonly` for immutable fields.
- Add explicit return types for exported functions and public methods.
- Prefer small, focused functions and single-responsibility classes.
- Use named interfaces/types for complex shapes and re-use them across files.
- Run linters/formatters and keep code style consistent with existing files.

## Excalibur Awareness
- This project uses Excalibur.js; prefer consulting the official docs first: https://excaliburjs.com/docs/
- When changing engine behavior, check `src/main.ts`, `src/resources.ts`, and scene/actor files (`src/*.ts`).
- Prefer to use methods and properties of the Excalibur built-in classes, such as Actor, when adding code to modify the behavior or state of the Actor.
- Avoid editing compiled or distribution files in `dist/` — change source `src/` files instead.

## Excalibur Source
- https://github.com/excaliburjs/Excalibur — consult the repository for implementation details of the engine itself.

## Testing & Running
- Assume the app is already running and rerunning after changes are saved.  Do not ask to launch or restart the app.

## Editing Guidelines for the Assistant
- Make minimal, well-scoped changes with clear commit messages.
- If a change touches Excalibur integration (loader, engine options, lifecycle hooks), suggest how to verify it (which file to open, which page to refresh, or which test to run).
- When uncertain, ask a single focused question before proceeding.
