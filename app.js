const agentMemory = {
  project: 'BLAGO',
  principles: [
    'All users are equal',
    'Transparency and fairness',
    'Open collaboration',
    'Focus on well-being'
  ],
  interactions: []
};

const HF_MODEL_URL = 'https://api-inference.huggingface.co/models/gpt2';
const TOKEN_STORAGE_KEY = 'blago-hf-token';

function getToken() {
  const tokenEl = document.getElementById('token');
  const token = tokenEl.value.trim();

  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    return token;
  }

  return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
}

function restoreToken() {
  const tokenEl = document.getElementById('token');
  const savedToken = localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  tokenEl.value = savedToken;
}

async function callLLM(prompt) {
  const token = getToken();

  if (!token) {
    return 'Add your Hugging Face API token in the field above to enable live responses.';
  }

  const response = await fetch(HF_MODEL_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) {
    return 'Sorry, I could not reach the model right now.';
  }

  const data = await response.json();
  return data[0]?.generated_text || 'Sorry, I could not generate a response.';
}

async function agentReply(input) {
  agentMemory.interactions.push({ input, timestamp: new Date().toISOString() });

  const prompt = `
You are the BLAGO Agent, the personal human assistant.
Project principles: ${agentMemory.principles.join(', ')}
User said: "${input}"
Respond helpfully, clearly, and in context of BLAGO.
`;

  const text = await callLLM(prompt);
  return { text };
}

async function send() {
  const inputEl = document.getElementById('input');
  const chatEl = document.getElementById('chat');

  const userText = inputEl.value.trim();
  if (!userText) {
    return;
  }

  const userMsg = document.createElement('div');
  userMsg.className = 'message user';
  userMsg.textContent = `You: ${userText}`;
  chatEl.appendChild(userMsg);

  inputEl.value = '';

  const response = await agentReply(userText);

  const agentMsg = document.createElement('div');
  agentMsg.className = 'message agent';
  agentMsg.textContent = `Agent: ${response.text}`;
  chatEl.appendChild(agentMsg);

  chatEl.scrollTop = chatEl.scrollHeight;
}

restoreToken();
