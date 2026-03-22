function normalizeText(text) {
  return String(text || '').trim();
}

function createEmptyNeed() {
  return {
    need: '',
    agent: 'listener',
    solution: 'Awaiting a clear need.',
    coordination: 'No coordination started.',
    needDetected: false,
    summary: 'No need provided.'
  };
}

function createNeedAnalysis(need) {
  return {
    need,
    agent: 'listener',
    solution: 'Collect context and propose the next simple action.',
    coordination: 'Share the need with the next responsible agent or person.',
    needDetected: true,
    summary: `Need detected: ${need}`
  };
}

function analyzeNeed(text) {
  const normalized = normalizeText(text);

  if (!normalized) {
    return createEmptyNeed();
  }

  return createNeedAnalysis(normalized);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeNeed };
}

if (typeof window !== 'undefined') {
  window.analyzeNeed = analyzeNeed;
}
