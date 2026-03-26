# blago-agent

`blago-agent` is a lightweight web resource for BLAGO: users can chat with an AI agent, optionally attach context from a public URL, and receive structured responses.

## What is implemented

- Browser UI with a chat log and technical response panel.
- Server API endpoint `POST /api/agent`.
- Optional network context fetch from `networkUrl`.
- OpenAI mode (if `OPENAI_API_KEY` is set) and local fallback mode.

## Project structure

- `index.html` — web page shell (chat + inputs)
- `style.css` — UI styles
- `app.js` — browser-side chat logic
- `index.js` — local analysis fallback utility
- `server.js` — API server and AI-agent orchestration
- `package.json` — scripts and dependencies

## Quick start

```bash
npm install
npm start
```

Open: `http://localhost:3000`

## API

### `POST /api/agent`

Request body:

```json
{
  "messages": [
    { "role": "user", "content": "Собери краткий план действий" }
  ],
  "networkUrl": "https://example.com"
}
```

Response body:

```json
{
  "reply": "...",
  "mode": "openai | fallback",
  "model": "...",
  "usedNetwork": true,
  "networkSnippet": "..."
}
```

## Environment variables

- `PORT` — server port (default `3000`)
- `OPENAI_API_KEY` — enables real AI replies via OpenAI API
- `OPENAI_MODEL` — model name (default `gpt-4.1-mini`)

If `OPENAI_API_KEY` is not set, the server returns a deterministic local fallback response.
