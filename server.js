const path = require('path');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4.1-mini';
const MAX_CHARS = 4000;

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

function clampText(value) {
  return String(value || '').slice(0, MAX_CHARS).trim();
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      role: item.role === 'assistant' ? 'assistant' : 'user',
      content: clampText(item.content)
    }))
    .filter((item) => item.content.length > 0)
    .slice(-12);
}

function summarizeNetworkText(text) {
  const compact = String(text || '').replace(/\s+/g, ' ').trim();
  if (!compact) {
    return 'No readable content returned from URL.';
  }

  return compact.slice(0, 900);
}

function canUseNetwork(urlText) {
  try {
    const parsed = new URL(urlText);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchNetworkSnippet(urlText) {
  if (!canUseNetwork(urlText)) {
    throw new Error('Provide a valid http/https URL in networkUrl.');
  }

  const response = await fetch(urlText, {
    method: 'GET',
    headers: { 'User-Agent': 'blago-agent/1.0' }
  });

  if (!response.ok) {
    throw new Error(`Network request failed with status ${response.status}.`);
  }

  const body = await response.text();
  return summarizeNetworkText(body);
}

async function callOpenAI(messages, networkSnippet) {
  const system = [
    'You are BLAGO network agent.',
    'Give concise, actionable answers in the user language.',
    'If network snippet is provided, use it as a source context.'
  ].join(' ');

  const preparedMessages = [
    { role: 'system', content: system },
    ...messages
  ];

  if (networkSnippet) {
    preparedMessages.push({
      role: 'system',
      content: `Network context:\n${networkSnippet}`
    });
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      temperature: 0.3,
      messages: preparedMessages
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText.slice(0, 250)}`);
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content?.trim();

  return reply || 'Model returned an empty response.';
}

function localFallback(messages, networkSnippet) {
  const lastUser = [...messages].reverse().find((msg) => msg.role === 'user');
  const summary = lastUser?.content || 'No user message provided.';

  const parts = [
    'Local fallback mode is active (OPENAI_API_KEY is not configured).',
    `User intent: ${summary}`
  ];

  if (networkSnippet) {
    parts.push(`Network snippet: ${networkSnippet.slice(0, 280)}`);
  }

  parts.push('Next step: configure OPENAI_API_KEY to enable full AI agent responses.');
  return parts.join('\n\n');
}

app.post('/api/agent', async (req, res) => {
  try {
    const messages = sanitizeMessages(req.body?.messages);
    const networkUrl = clampText(req.body?.networkUrl);

    if (!messages.length) {
      return res.status(400).json({ error: 'messages must contain at least one user entry.' });
    }

    let networkSnippet = '';
    if (networkUrl) {
      networkSnippet = await fetchNetworkSnippet(networkUrl);
    }

    const reply = OPENAI_API_KEY
      ? await callOpenAI(messages, networkSnippet)
      : localFallback(messages, networkSnippet);

    return res.json({
      reply,
      mode: OPENAI_API_KEY ? 'openai' : 'fallback',
      model: OPENAI_API_KEY ? OPENAI_MODEL : 'local-fallback',
      usedNetwork: Boolean(networkSnippet),
      networkSnippet
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unexpected error.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'blago-agent', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`blago-agent server listening on http://localhost:${PORT}`);
});
