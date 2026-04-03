# FocusBoard

FocusBoard is a frontend-only decision-support workspace that helps turn a messy question into a structured recommendation through calm information design, deterministic adaptive suggestions, and local-first state.

## Problem Statement

A lot of complex decisions begin the same way: too much context, too many competing options, and no obvious next step. Most tools either stay too generic, become glorified note pages, or jump straight into “smart” automation that feels opaque and disorienting.

FocusBoard explores a different product angle:

- keep the workspace stable
- make reasoning legible
- assist the user with lightweight recommendations
- avoid surprise-driven adaptive UI

The goal is not to automate the decision. The goal is to help the user structure it well enough to make one confidently.

## Product Concept

FocusBoard is positioned as an explainable decision-support workspace.

It is designed for scenarios like:

- evaluating product directions
- comparing strategic options
- making a career or hiring decision
- reviewing long AI-generated answers
- organizing reasoning before committing to a path

The product flow is intentionally simple:

1. Start a session with a title, decision question, priorities, constraints, and desired output.
2. Work inside a stable three-panel workspace.
3. Receive low-risk, reversible suggestions based on lightweight behavioral signals.
4. Finish with a summary view that packages the decision, rationale, and adaptive history.

## Key UX Principles

- Stability first: the workspace should feel predictable and calm.
- Suggestions, not surprises: adaptive behavior recommends actions instead of aggressively reshaping the interface.
- Explainability: every suggestion is written in plain product language and states why it appeared.
- Reversibility: applied suggestions can be undone.
- Low cognitive load: the UI reduces complexity instead of performing for novelty.
- One clear flow: the next meaningful step should stay visible.
- Portfolio quality: the product story, UI, and code all need to feel believable and publicly showcaseable.

## Feature Overview

### Session setup

- Minimal start screen with editable decision brief
- Preset templates with realistic seeded scenarios
- Product strategy, career decision, UX review, compare-options, and open-exploration examples

### Main workspace

- Left brief panel for session context
- Center analysis column for summary, insights, options, tradeoffs, risks, recommendation, and notes
- Right decision rail for shortlist, rationale, final decision, and next step
- Suggestion rail with apply, dismiss, disable-similar, and undo support
- Stable layout controls for density, compare mode, criteria highlighting, pinning insights, and freezing the layout

### Session summary

- Review-ready summary state
- Brief recap, key insights, recommendation, final rationale, and next step
- Accepted, dismissed, and disabled suggestion history
- Saved workspace preferences and learned tendencies

## Adaptive Logic

FocusBoard does not use ML, a backend, or hidden heuristics.

The adaptive layer is deterministic and intentionally modest:

1. A behavior tracker records lightweight signals:
   - scroll bursts
   - section dwell time
   - repeated section reopen actions
   - compare actions
   - note edits
   - layout toggles

2. Selectors derive soft working states such as:
   - scanning
   - reviewing
   - comparing
   - deciding
   - finalizing

3. A rules engine evaluates a small catalog of suggestions, including:
   - pin insights
   - compact density
   - open compare mode
   - collapse supporting details
   - highlight decision criteria
   - freeze layout
   - surface the recommendation block
   - generate a decision summary

4. A suggestion manager prevents duplicate spam and keeps the system legible through explicit statuses:
   - pending
   - applied
   - dismissed
   - disabled

The key product principle is that behavior affects recommendations, not chaotic auto-layout changes.

## Architecture Overview

The app is built with:

- React
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Framer Motion
- Lucide icons
- Vitest

The codebase is organized around product slices instead of a single UI folder:

```text
src/
  app/
    providers/
    store/
  entities/
    behavior/
    session/
    suggestion/
  features/
    decision-panel/
    preferences/
    session-start/
    suggestions/
    summary/
    workspace/
  shared/
    config/
    hooks/
    lib/
    types/
    ui/
  pages/
```

Important implementation choices:

- Typed domain models define the session, workspace state, behavior signals, suggestions, and decision artifacts.
- Seeded templates provide credible product-like content without relying on placeholder copy.
- The Zustand store persists key state to `localStorage` so the app feels local-first and complete.
- Suggestion application is modeled as deterministic state mutation with undo snapshots.
- The interface intentionally favors composable cards and focused components over a single oversized page file.

## Why This Project Is Interesting

FocusBoard is meant to demonstrate more than UI polish.

It shows:

- product framing and positioning
- information architecture for complex decisions
- explainable adaptive interface design
- deterministic interaction modeling
- local-first state design
- professional frontend structure with readable, typed logic

This makes it a strong portfolio case because it sits at the intersection of product thinking, frontend architecture, UX systems, and practical implementation detail.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Possible Future Improvements

- richer per-section editing for insights, options, tradeoffs, and risks
- lightweight export to PDF or shareable decision brief
- session history across multiple saved boards
- keyboard command palette for advanced users
- stronger analytics around decision criteria weighting
- optional theming or workspace presets for different decision styles

## Portfolio Readiness

This project is intentionally designed to be easy to review.

A hiring manager, product lead, or engineering reviewer should be able to understand:

1. what the product is
2. why it exists
3. how the adaptive layer works
4. why the implementation is careful rather than gimmicky

That combination of clarity, restraint, and execution quality is the point of FocusBoard.
