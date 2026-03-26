const input = document.getElementById('need-input');
const button = document.getElementById('analyze-button');
const output = document.getElementById('result-output');
const networkUrlInput = document.getElementById('network-url');
const chatLog = document.getElementById('chat-log');

const messages = [];

function appendMessage(role, content) {
  const item = document.createElement('article');
  item.className = `message message-${role}`;
  item.textContent = content;
  chatLog.appendChild(item);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function setBusy(isBusy) {
  button.disabled = isBusy;
  button.textContent = isBusy ? 'Отправка…' : 'Отправить агенту';
}

async function sendToAgent() {
  const text = String(input.value || '').trim();
  if (!text) {
    output.textContent = JSON.stringify({ error: 'Введите сообщение для агента.' }, null, 2);
    return;
  }

  messages.push({ role: 'user', content: text });
  appendMessage('user', text);
  input.value = '';

  setBusy(true);

  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        networkUrl: networkUrlInput.value
      })
    });

    const data = await response.json();
    output.textContent = JSON.stringify(data, null, 2);

    if (!response.ok) {
      appendMessage('assistant', `Ошибка: ${data.error || 'unknown error'}`);
      return;
    }

    messages.push({ role: 'assistant', content: data.reply });
    appendMessage('assistant', data.reply);
  } catch (error) {
    const fallback = window.analyzeNeed(text);
    output.textContent = JSON.stringify(
      {
        error: 'Сеть/API недоступны, показан локальный fallback.',
        details: error.message,
        fallback
      },
      null,
      2
    );
    appendMessage('assistant', `Локальный fallback: ${fallback.summary}`);
  } finally {
    setBusy(false);
  }
}

button.addEventListener('click', sendToAgent);
input.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    sendToAgent();
  }
});
