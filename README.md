# SDLC & ADLC Field Guide

An interactive learning page for product managers about how software and AI agents get built. It follows one wealth-management feature, built two ways:

- **Portfolio summary**: a fixed screen that shows a client's holdings, built with the software development life cycle (SDLC).
- **Portfolio assistant**: an AI agent that answers a wealth manager's free-form questions about a client's portfolio, built with the agent development life cycle (ADLC).

**Live site:** https://lalwalataukir.github.io/aldc-sldc/

## What's in the guide

The page opens on a landing page with the running example, the three modules with your reading progress, and a search bar. Search (press `/` or Ctrl/Cmd+K) finds any stage, section or glossary term across all modules and highlights the match on the page.

The three modules each sit on their own tab and can be read on their own.

| Module | What it covers |
| --- | --- |
| 1 · SDLC | Planning to maintenance, one section per stage. Waterfall, Agile, Scrum and Kanban. The four kinds of test. Staging, feature flags, rollbacks, bug triage and versioning. Tools by stage. A clickable lifecycle wheel with scripted failures, a 5-question quiz and a cheat sheet. |
| 2 · ADLC | Problem framing to monitoring, one section per stage. Evaluation in depth, agent-specific risks, operating after launch, and tools by stage. A clickable loop diagram, a simulated agent trace you can step through, a quiz and a cheat sheet. |
| 3 · SDLC vs ADLC | Two lifecycles as parallel tracks you can click, a nine-row comparison table, what stays the same and what changes for the PM, a decision guide with three wealth-management scenarios, common mistakes, and a combined cheat sheet. |

Every technical term is defined in plain language the first time it appears in each module. Every section ends with a "What a PM should remember" line. The page works on phones and in both light and dark themes.

The client (the Mehta family), all rupee figures, timings and costs are illustrative. The agent trace is a scripted simulation; no real AI model or data service is used.

## Repository layout

```
design-system/        Agent Field Guides design system: tokens, component CSS, component docs
sdlc-adlc-guide/
  src/                Page source: shell, styles, content per module, glossary, interactions
  build.py            Builds index.html from src/ and the design system
  index.html          The built, self-contained page (committed, served by Pages)
index.html            Redirects the site root to sdlc-adlc-guide/
```

Module content lives in `src/sdlc.js`, `src/adlc.js` and `src/compare.js`. Glossary definitions live in `src/terms.js`. Mark a term in content as `[[key]]` or `[[key|shown text]]`.

## Build

The build uses only Python 3's standard library. It inlines `design-system/tokens.json` and `design-system/components/bundle.css` into the page, so the guide stays in step with the design system.

```bash
python3 sdlc-adlc-guide/build.py
```

## Deploy

GitHub Pages serves this repository from the `main` branch root. To publish a change, rebuild the page, then commit and push `sdlc-adlc-guide/index.html` along with your source changes. The site updates within a few minutes.

## Credits

The design system is copied from [lalwalataukir/how-ai-agents-work](https://github.com/lalwalataukir/how-ai-agents-work/tree/main/design-system). This is an independent explainer and is not affiliated with Atlassian, Figma, GitHub, Sentry, LangChain, LangGraph, Langfuse or any model provider.
