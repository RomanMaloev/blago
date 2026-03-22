const input = document.getElementById('need-input');
const button = document.getElementById('analyze-button');
const output = document.getElementById('result-output');

function renderResult() {
  const result = window.analyzeNeed(input.value);
  output.textContent = JSON.stringify(result, null, 2);
}

button.addEventListener('click', renderResult);
input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    renderResult();
  }
});
