# Thinking UI Studio

`Thinking UI Studio` is a static frontend case study about adaptive interfaces that stay transparent, deterministic and user-controlled.

The project started as a simple name-based greeting app. It is now rebuilt into an experimental product-like workspace that:

- tracks lightweight behavior on the client
- reorders and compresses interface blocks through rule-based logic
- explains every change in a dedicated reasoning log
- lets the user undo, keep, disable or manually lock adaptations
- keeps sessions and preferences local-first with `localStorage`

The result is intentionally closer to a premium interactive portfolio piece than to a tutorial app.

## Why this is Thinking UI

The interface does not only render content. It reacts to the way the user works:

- `Scanning`: fast movement across sections and short scroll bursts can trigger compact density
- `Deep focus`: sustained attention on signal and insight cards can widen that lane and move related blocks closer
- `Exploration`: the default state keeps the surface broader and lighter
- `Decision mode`: repeated mode switching and accepted prompts can promote comparison and commitment aids

Every meaningful UI change is written to the `Interface reasoning log` with:

- what changed
- why it changed
- when it changed
- `Undo`
- `Keep`
- `Disable similar`

This avoids “smart UI magic” and keeps the system legible.

## Product concept

The app is structured as an adaptive interface lab:

- `Hero / first impression area`
- `Session composer`
- `Main adaptive workspace`
- `Signal card`
- `Insight stream`
- `Adaptive suggestions`
- `Behavioral memory`
- `Behavior panel`
- `Interface reasoning log`
- `Session history`
- `Personalization controls`
- `Quality dashboard`

The user can start a session with:

- a name
- a state or prompt
- a thinking mode: `Focus`, `Explore`, `Reflect`, `Decide`
- an intent: `Clarify`, `Sensemaking`, `Reframe`, `Commit`

## Implemented adaptation rules

The engine is fully deterministic. No ML, no backend, no hidden heuristics.

Implemented automatic rules:

- `layout.pin-history`
  If the user reopens history multiple times, history is pinned higher in the workspace.
- `layout.raise-reasoning`
  If the user repeatedly checks why the interface changed, the reasoning block is moved closer to the signal.
- `controls.reveal-advanced`
  If the user switches modes several times, advanced layout controls are revealed.
- `suggestions.raise-decision`
  If the session looks like comparison/decision work, the system promotes decision aids.
- `layout.focus-insights`
  If attention stays on signal and insights for longer, the workspace opens a wider central lane.
- `density.compact-scan`
  If the user scans quickly across sections and scrolls in short bursts, the interface compresses density.

Implemented user control flows:

- disable all automatic adaptation
- undo the latest adaptation
- keep an adaptation
- disable similar future changes
- manually pin sections
- manually switch density
- lock the current layout

## Architecture

The project stays static and GitHub Pages friendly. No server or build step is required for runtime.

### Frontend structure

- `src/index.html`
  Main adaptive studio
- `src/results.html`
  Quality dashboard for Jest JSON report
- `src/styles/main.css`
  Main visual system and responsive layout
- `src/styles/quality.css`
  Quality dashboard styling
- `src/scripts/app.js`
  App entrypoint and wiring
- `src/scripts/core/content.js`
  Modes, intents, sections and product copy config
- `src/scripts/core/profile.js`
  Session/profile generation from name, prompt, mode and intent
- `src/scripts/core/storage.js`
  Local-first persistence for history and preferences
- `src/scripts/core/behavior-tracker.js`
  Click/open/dwell/scroll/mode-switch tracking
- `src/scripts/core/state.js`
  Initial state and preference hydration
- `src/scripts/core/adaptation-engine.js`
  Deterministic rules, suggestions, explainability, undo/keep/disable
- `src/scripts/renderers/app-renderer.js`
  DOM rendering for workspace, reasoning log and controls
- `src/scripts/utils/animation.js`
  Motion helpers and reduced-motion-aware spotlight behavior
- `src/service-worker.js`
  Static asset caching
- `src/manifest.webmanifest`
  PWA base
- `tests/`
  Jest + jsdom coverage for rules, storage, profile generation and rendering

## Local-first persistence

The app uses `localStorage` for:

- session history
- preferred mode
- adaptation enabled/disabled state
- layout lock state
- pinned sections
- dismissed suggestions
- accepted suggestions
- kept adaptation rules
- disabled rule ids

## Stack

- HTML5
- CSS3
- Vanilla JavaScript
- UMD-style browser modules for static portability and Node testability
- Jest
- jsdom
- GitHub Pages
- PWA basics via `manifest.webmanifest` + `service-worker.js`

## Local run

1. Install dependencies:

```bash
npm install
```

2. Serve `src/` with any static server:

```bash
npx serve src
```

3. Open:

```text
http://localhost:3000
```

## Tests

Run test suite:

```bash
npm test
```

Generate JSON report for the quality dashboard:

```bash
npm run test:report
```

Covered areas:

- deterministic session profile generation
- storage logic
- adaptation engine rules
- explainability actions
- key rendering flows

## Deployment

The repo is configured for static deployment to GitHub Pages through GitHub Actions.

Workflow outline:

1. install dependencies
2. run tests
3. generate `src/test-results.json`
4. copy `src/` into the static Pages artifact
5. publish

Because runtime stays fully static, the deployed artifact remains portable and backend-free.

## Accessibility and UX details

Implemented basics:

- semantic sections and headings
- keyboard-focusable controls
- visible focus states
- `prefers-reduced-motion` support
- explainable adaptation instead of hidden automation
- contrast-aware glass/layer styling

## License

[MIT](LICENSE)
