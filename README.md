# blago-agent

`blago-agent` is a small GitHub Pages demo for BLAGO's core idea: coordinate human needs with simple agent logic.

## Project goal

Build an open system for coordinating human needs.

The current version stays intentionally small:

- one input for a need
- one action button
- one analysis function
- one structured output for the next agent step

## Main concepts

- **need** — the human request or problem to describe
- **agent** — the role that receives and processes the need
- **solution** — the next practical action to propose
- **coordination** — how the need moves to the next responsible actor

## Modular structure

- `index.html` — the page shell
- `style.css` — minimal presentation
- `app.js` — UI events and rendering
- `index.js` — small analysis module shared by browser and Node.js
- `package.json` — metadata and a basic check

## How it works

1. A person enters a need.
2. `analyzeNeed(text)` normalizes the text.
3. The function returns a simple object with `need`, `agent`, `solution`, and `coordination`.
4. The page prints that object as JSON.

## Local use

Open `index.html` in a browser, or publish the repository with GitHub Pages.

Run the Node.js check:

```bash
npm test
```
