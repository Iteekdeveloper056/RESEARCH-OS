/* Research OS — Application Logic */

const STORAGE_KEYS = {
  apiKey: 'openrouter_api_key',
  defaultAgent: 'research_os_default_agent',
  autoSave: 'research_os_auto_save',
  systemPrompt: 'research_os_system_prompt',
  currentModel: 'research_os_current_model',
  results: 'research_os_results',
  activity: 'research_os_activity'
};

const AGENTS = {
  business: {
    icon: '💼',
    title: 'Business Research',
    subtitle: 'Market analysis, industry trends, and business intelligence',
    systemPrompt: 'You are a business research analyst. Provide thorough market analysis, industry trends, competitive landscapes, and actionable business intelligence. Cite key data points and structure findings clearly.'
  },
  software: {
    icon: '💻',
    title: 'Software & Tech',
    subtitle: 'Technology stack analysis, frameworks, and architecture research',
    systemPrompt: 'You are a software and technology research specialist. Analyze tech stacks, compare frameworks, evaluate architectures, and deliver clear technical recommendations with pros and cons.'
  },
  ai: {
    icon: '🤖',
    title: 'AI Tools & Trends',
    subtitle: 'AI model comparisons, tool evaluations, and emerging trends',
    systemPrompt: 'You are an AI tools and trends researcher. Compare models and tools, evaluate capabilities, track emerging technologies, and summarize implications for practitioners.'
  },
  sales: {
    icon: '📈',
    title: 'Sales Intelligence',
    subtitle: 'Lead research, prospect profiling, and pipeline strategy',
    systemPrompt: 'You are a sales intelligence analyst. Research prospects, profile leads, analyze sales strategies, and provide actionable pipeline insights with clear next steps.'
  },
  marketing: {
    icon: '🎯',
    title: 'Marketing Research',
    subtitle: 'Campaign analysis, audience insights, and brand positioning',
    systemPrompt: 'You are a marketing research specialist. Analyze campaigns, audience segments, content strategies, and brand positioning with data-driven recommendations.'
  },
  competition: {
    icon: '⚔️',
    title: 'Competition Analysis',
    subtitle: 'Competitor profiling, SWOT analysis, and strategic benchmarking',
    systemPrompt: 'You are a competitive intelligence analyst. Profile competitors, conduct SWOT analysis, benchmark market positioning, and deliver strategic insights.'
  }
};

const MODELS = {
  auto: {
    label: 'Auto Router',
    openRouterId: null
  },
  claude: {
    label: 'Claude Sonnet 4.6',
    openRouterId: 'anthropic/claude-sonnet-4'
  },
  'claude-opus': {
    label: 'Claude Opus 4.5',
    openRouterId: 'anthropic/claude-opus-4'
  },
  glm: {
    label: 'GLM 4.7',
    openRouterId: 'z-ai/glm-4.7'
  },
  'glm-flash': {
    label: 'GLM 4.7 Flash',
    openRouterId: 'z-ai/glm-4.7-flash'
  },
  deepseek: {
    label: 'DeepSeek V4',
    openRouterId: 'deepseek/deepseek-v3.2'
  }
};

const DEPTH_CONFIG = {
  'Quick Scan': { maxTokens: 800, temperature: 0.5, autoModel: 'glm-flash' },
  'Standard': { maxTokens: 1500, temperature: 0.6, autoModel: 'glm' },
  'Deep Dive': { maxTokens: 3000, temperature: 0.7, autoModel: 'claude' },
  'Comprehensive': { maxTokens: 6000, temperature: 0.7, autoModel: 'claude-opus' }
};

const FORMAT_INSTRUCTIONS = {
  'Summary': 'Format the response as a concise executive summary (3–5 paragraphs).',
  'Report': 'Format the response as a structured research report with clear sections and headings.',
  'Bullet Points': 'Format the response as organized bullet points with sub-bullets where helpful.',
  'Table': 'Format key findings in markdown tables where appropriate, with a brief intro and conclusion.'
};

const state = {
  currentAgent: localStorage.getItem(STORAGE_KEYS.defaultAgent) || 'business',
  currentModel: localStorage.getItem(STORAGE_KEYS.currentModel) || 'auto',
  apiKey: localStorage.getItem(STORAGE_KEYS.apiKey) || '',
  autoSave: localStorage.getItem(STORAGE_KEYS.autoSave) !== 'false',
  systemPrompt: localStorage.getItem(STORAGE_KEYS.systemPrompt) || '',
  isResearching: false,
  results: loadJSON(STORAGE_KEYS.results, [])
};

/* ── Utilities ── */

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function persistState() {
  if (state.autoSave) {
    localStorage.setItem(STORAGE_KEYS.results, JSON.stringify(state.results));
  }
}

function $(id) {
  return document.getElementById(id);
}

function $$(selector) {
  return document.querySelectorAll(selector);
}

/* ── UI Updates ── */

function updateAgentUI() {
  const agent = AGENTS[state.currentAgent];
  if (!agent) return;

  $('page-title').textContent = `${agent.icon} ${agent.title}`;
  $('page-subtitle').textContent = agent.subtitle;

  $$('.nav-item[data-agent]').forEach((el) => {
    el.classList.toggle('active', el.dataset.agent === state.currentAgent);
  });

  $$('.agent-card[data-agent]').forEach((el) => {
    el.classList.toggle('active', el.dataset.agent === state.currentAgent);
  });
}

function updateModelUI() {
  const model = MODELS[state.currentModel];
  if (!model) return;

  $('router-badge-label').textContent = model.label;
  $('model-select').value = state.currentModel;

  $$('.model-card[data-model]').forEach((el) => {
    el.classList.toggle('selected', el.dataset.model === state.currentModel);
  });
}

function updateConnectionStatus() {
  const footer = $('connection-status');
  const label = $('connection-label');
  const connected = Boolean(state.apiKey);

  footer.classList.toggle('disconnected', !connected);
  label.textContent = connected ? 'OpenRouter Connected' : 'OpenRouter Not Connected';
}

function setResearching(active) {
  state.isResearching = active;
  const btn = $('btn-run');
  const dots = $('loading-dots');
  const placeholderText = $('results-placeholder-text');
  const placeholderIcon = document.querySelector('.results-placeholder-icon');

  btn.disabled = active;
  btn.textContent = active ? '⏳ Researching…' : '▶ Run Research';

  if (active) {
    dots.style.display = 'flex';
    placeholderText.textContent = 'Researching…';
    if (placeholderIcon) placeholderIcon.style.display = 'none';
  } else {
    dots.style.display = 'none';
    if (placeholderIcon) placeholderIcon.style.display = '';
  }
}

function renderResults(entry) {
  const area = $('results-area');

  if (!entry) {
    area.classList.remove('has-results');
    area.innerHTML = `
      <div class="results-placeholder" id="results-placeholder">
        <span class="results-placeholder-icon">🔍</span>
        <span id="results-placeholder-text">Ready to Research</span>
        <div class="loading-dots" style="display: none;" id="loading-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    return;
  }

  area.classList.add('has-results');
  area.innerHTML = `
    <div class="results-meta">
      <span>Agent: <strong>${escapeHtml(AGENTS[entry.agent]?.title || entry.agent)}</strong></span>
      <span>Model: <strong>${escapeHtml(entry.modelLabel)}</strong></span>
      <span>Depth: <strong>${escapeHtml(entry.depth)}</strong></span>
      <span>Time: <strong>${entry.duration}s</strong></span>
    </div>
    <div class="results-content">${escapeHtml(entry.content)}</div>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function logActivity(message) {
  const logs = loadJSON(STORAGE_KEYS.activity, []);
  logs.unshift({ message, timestamp: new Date().toISOString() });
  if (logs.length > 50) logs.length = 50;
  localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(logs));
}

/* ── Agent Selection ── */

function selectAgent(agent) {
  if (!AGENTS[agent] || state.isResearching) return;

  state.currentAgent = agent;
  updateAgentUI();

  const sidebar = $('sidebar');
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('open');
  }

  showToast(`Switched to ${AGENTS[agent].title}`);
}

/* ── Model Router ── */

function selectModel(modelId) {
  if (!MODELS[modelId] || state.isResearching) return;

  state.currentModel = modelId;
  localStorage.setItem(STORAGE_KEYS.currentModel, modelId);
  updateModelUI();
  showToast(`Model set to ${MODELS[modelId].label}`);
}

function toggleRouterPanel() {
  const panel = $('router-panel');
  const overlay = $('router-overlay');
  const isOpen = panel.classList.contains('open');

  panel.classList.toggle('open', !isOpen);
  overlay.classList.toggle('open', !isOpen);
}

/* ── Settings ── */

function toggleSettings() {
  const modal = $('settings-modal');
  const isOpen = modal.classList.contains('open');

  if (!isOpen) {
    $('api-key').value = state.apiKey;
    $('default-agent').value = state.currentAgent;
    $('auto-save').checked = state.autoSave;
    $('system-prompt').value = state.systemPrompt;
  }

  modal.classList.toggle('open', !isOpen);
}

function closeSettingsOnOverlay(event) {
  if (event.target.id === 'settings-modal') {
    toggleSettings();
  }
}

function saveSettings() {
  const apiKey = $('api-key').value.trim();
  const defaultAgent = $('default-agent').value;
  const autoSave = $('auto-save').checked;
  const systemPrompt = $('system-prompt').value.trim();

  state.apiKey = apiKey;
  state.autoSave = autoSave;
  state.systemPrompt = systemPrompt;

  localStorage.setItem(STORAGE_KEYS.apiKey, apiKey);
  localStorage.setItem(STORAGE_KEYS.defaultAgent, defaultAgent);
  localStorage.setItem(STORAGE_KEYS.autoSave, String(autoSave));
  localStorage.setItem(STORAGE_KEYS.systemPrompt, systemPrompt);

  if (defaultAgent !== state.currentAgent) {
    state.currentAgent = defaultAgent;
    updateAgentUI();
  }

  updateConnectionStatus();
  toggleSettings();
  showToast('Settings saved');
  logActivity('Settings updated');
}

/* ── Auto Router ── */

function resolveModel(depth) {
  if (state.currentModel !== 'auto') {
    return state.currentModel;
  }
  const depthKey = $('depth-select').value;
  return DEPTH_CONFIG[depthKey]?.autoModel || 'glm';
}

function getOpenRouterModelId(modelKey) {
  return MODELS[modelKey]?.openRouterId || MODELS.glm.openRouterId;
}

function buildSystemPrompt() {
  const agent = AGENTS[state.currentAgent];
  const parts = [];

  if (state.systemPrompt) {
    parts.push(state.systemPrompt);
  }

  if (agent?.systemPrompt) {
    parts.push(agent.systemPrompt);
  }

  const format = $('format-select').value;
  if (FORMAT_INSTRUCTIONS[format]) {
    parts.push(FORMAT_INSTRUCTIONS[format]);
  }

  return parts.join('\n\n');
}

function buildUserPrompt(query) {
  const depth = $('depth-select').value;
  const format = $('format-select').value;

  return `Research Query: ${query}

Depth: ${depth}
Output Format: ${format}

Provide a thorough, well-researched response. Be specific, analytical, and actionable.`;
}

/* ── OpenRouter API ── */

async function callOpenRouter(query) {
  const depthKey = $('depth-select').value;
  const depthConfig = DEPTH_CONFIG[depthKey] || DEPTH_CONFIG['Standard'];
  const resolvedModel = resolveModel(depthKey);
  const modelId = getOpenRouterModelId(resolvedModel);

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${state.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'Research OS'
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: buildUserPrompt(query) }
      ],
      max_tokens: depthConfig.maxTokens,
      temperature: depthConfig.temperature
    })
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No response content received');
  }

  return {
    content,
    modelKey: resolvedModel,
    modelLabel: MODELS[resolvedModel]?.label || resolvedModel,
    modelId
  };
}

/* ── Run Research ── */

async function runResearch() {
  if (state.isResearching) return;

  const query = $('query-input').value.trim();

  if (!query) {
    showToast('Please enter a research query');
    return;
  }

  if (!state.apiKey) {
    showToast('Add your OpenRouter API key in Settings');
    toggleSettings();
    return;
  }

  const startTime = performance.now();
  setResearching(true);

  try {
    const result = await callOpenRouter(query);
    const duration = ((performance.now() - startTime) / 1000).toFixed(1);

    const entry = {
      id: Date.now(),
      agent: state.currentAgent,
      query,
      content: result.content,
      model: result.modelKey,
      modelLabel: result.modelLabel,
      modelId: result.modelId,
      depth: $('depth-select').value,
      format: $('format-select').value,
      duration,
      timestamp: new Date().toISOString()
    };

    state.results.unshift(entry);
    if (state.results.length > 20) state.results.length = 20;
    persistState();
    renderResults(entry);

    logActivity(`Research completed: ${AGENTS[state.currentAgent].title} — ${result.modelLabel}`);
    showToast(`Research complete (${duration}s)`);
  } catch (err) {
    console.error('Research error:', err);
    setResearching(false);
    renderResults(null);
    $('results-placeholder-text').textContent = 'Research failed';
    showToast(err.message || 'Research failed');
    logActivity(`Research failed: ${err.message}`);
    return;
  }

  setResearching(false);
}

/* ── Toast Notifications ── */

function showToast(message, duration = 3500) {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ── Event Listeners ── */

function initEventListeners() {
  $('model-select').addEventListener('change', (e) => {
    selectModel(e.target.value);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const routerPanel = $('router-panel');
      const settingsModal = $('settings-modal');

      if (routerPanel.classList.contains('open')) {
        toggleRouterPanel();
      }
      if (settingsModal.classList.contains('open')) {
        toggleSettings();
      }
    }
  });

  $('router-panel').addEventListener('click', (e) => e.stopPropagation());
}

/* ── Init ── */

function init() {
  if (!AGENTS[state.currentAgent]) {
    state.currentAgent = 'business';
  }

  if (!MODELS[state.currentModel]) {
    state.currentModel = 'auto';
  }

  updateAgentUI();
  updateModelUI();
  updateConnectionStatus();
  initEventListeners();

  if (state.results.length > 0) {
    renderResults(state.results[0]);
  }
}

document.addEventListener('DOMContentLoaded', init);
