// ================================
// APP.JS — Main application controller
// ================================

const App = {
  // State
  state: {
    currentOperator: null,        // Current operator object
    currentProfile: {},           // Discovery answers
    chatHistory: [],              // Conversation history
    currentView: 'welcome',       // Active view
    apiKeySet: false,             // Whether OpenRouter API key is set
    pastOperators: []             // Saved operators in localStorage
  },

  // ================================
  // INITIALIZATION
  // ================================

  init: function() {
    this.loadState();
    this.attachEventListeners();
    this.renderPastOperators();
    this.checkApiKey();
  },

  loadState: function() {
    // Load from localStorage
    const saved = localStorage.getItem('llm_os_builder_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state.pastOperators = parsed.pastOperators || [];
        if (parsed.currentOperator) {
          this.state.currentOperator = parsed.currentOperator;
          this.state.currentProfile = parsed.currentProfile || {};
          this.state.chatHistory = parsed.chatHistory || [];
        }
      } catch (err) {
        console.error('Failed to load state:', err);
      }
    }
  },

  saveState: function() {
    const toSave = {
      currentOperator: this.state.currentOperator,
      currentProfile: this.state.currentProfile,
      chatHistory: this.state.chatHistory,
      pastOperators: this.state.pastOperators
    };
    localStorage.setItem('llm_os_builder_state', JSON.stringify(toSave));
  },

  checkApiKey: function() {
    const key = localStorage.getItem('openrouter_api_key');
    this.state.apiKeySet = !!key;
    this.updateModelStatus();
  },

  updateModelStatus: function() {
    const status = document.getElementById('model-status');
    if (this.state.apiKeySet) {
      const model = API_CONFIG.selectedModel.split('/').pop();
      status.textContent = `✅ Connected — ${model}`;
      status.classList.add('active');
    } else {
      status.textContent = '⚠️ Set API key in Settings to use Claude';
      status.classList.remove('active');
    }
  },

  // ================================
  // EVENT LISTENERS
  // ================================

  attachEventListeners: function() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Start engagement
    document.getElementById('start-engagement-btn').addEventListener('click', () => {
      this.switchView('onboarding');
    });

    // Back buttons
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target.dataset.back;
        this.switchView(target);
      });
    });

    // Onboarding form
    document.getElementById('onboarding-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleOnboardingSubmit(e);
    });

    // Chat input
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');

    chatInput.addEventListener('input', () => {
      this.autoResize(chatInput);
      sendBtn.disabled = chatInput.value.trim().length === 0;
    });

    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          this.sendMessage();
        }
      }
    });

    sendBtn.addEventListener('click', () => {
      this.sendMessage();
    });

    // Quick actions
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Settings
    document.getElementById('settings-btn').addEventListener('click', () => {
      this.openSettings();
    });

    document.getElementById('modal-close').addEventListener('click', () => {
      this.closeModal('settings-modal');
    });

    document.getElementById('template-modal-close').addEventListener('click', () => {
      this.closeModal('template-modal');
    });

    // Save API key
    document.getElementById('api-key-input').addEventListener('change', (e) => {
      this.saveApiKey(e.target.value);
    });

    document.getElementById('model-select').addEventListener('change', (e) => {
      API_CONFIG.selectedModel = e.target.value;
      localStorage.setItem('selected_model', e.target.value);
      this.updateModelStatus();
    });

    document.getElementById('system-prompt-mode').addEventListener('change', (e) => {
      localStorage.setItem('agent_mode', e.target.value);
    });

    document.getElementById('test-connection-btn').addEventListener('click', () => {
      this.testConnection();
    });

    document.getElementById('clear-data-btn').addEventListener('click', () => {
      if (confirm('Clear ALL local data? This will delete all operators + chat history.')) {
        localStorage.clear();
        location.reload();
      }
    });

    // Profile actions
    document.getElementById('export-profile-btn')?.addEventListener('click', () => {
      this.exportProfile();
    });

    document.getElementById('copy-profile-btn')?.addEventListener('click', () => {
      this.copyProfile();
    });

    // Deliverable actions
    document.getElementById('generate-true-name-btn')?.addEventListener('click', () => {
      this.generateDeliverables();
    });

    document.getElementById('download-all-btn')?.addEventListener('click', () => {
      this.downloadAllDeliverables();
    });

    // Load saved model + mode
    const savedModel = localStorage.getItem('selected_model');
    if (savedModel) {
      API_CONFIG.selectedModel = savedModel;
      document.getElementById('model-select').value = savedModel;
    }

    const savedMode = localStorage.getItem('agent_mode');
    if (savedMode) {
      document.getElementById('system-prompt-mode').value = savedMode;
    }

    // Close modals on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
    });
  },

  // ================================
  // VIEWS
  // ================================

  switchView: function(viewName) {
    // Update nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Update views
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
      targetView.classList.add('active');
      this.state.currentView = viewName;

      // Render view content
      if (viewName === 'profile') this.renderProfile();
      if (viewName === 'deliverables') this.renderDeliverables();
      if (viewName === 'templates') this.renderTemplates();
      if (viewName === 'troubleshoot') this.renderTroubleshoot();
      if (viewName === 'chat' && this.state.currentOperator) {
        this.loadChat();
      }
    }
  },

  // ================================
  // ONBOARDING
  // ================================

  handleOnboardingSubmit: function(e) {
    const formData = new FormData(e.target);
    const operator = {
      id: 'op_' + Date.now(),
      name: document.getElementById('operator-name').value.trim(),
      business: document.getElementById('business-name').value.trim(),
      businessType: document.getElementById('business-type').value,
      stage: document.getElementById('business-stage').value,
      budget: document.getElementById('monthly-budget').value,
      createdAt: new Date().toISOString()
    };

    this.state.currentOperator = operator;
    this.state.currentProfile = {};
    this.state.chatHistory = [];

    // Save operator
    if (!this.state.pastOperators.find(o => o.id === operator.id)) {
      this.state.pastOperators.push(operator);
    }

    this.saveState();
    this.switchView('chat');
    this.initChat();
  },

  // ================================
  // CHAT
  // ================================

  initChat: function() {
    if (!this.state.currentOperator) return;

    // Set operator info
    document.getElementById('chat-operator-name').textContent = this.state.currentOperator.name;
    document.getElementById('chat-operator-business').textContent = this.state.currentOperator.business;

    // Clear messages
    document.getElementById('chat-messages').innerHTML = '';

    // If first time, send greeting
    if (this.state.chatHistory.length === 0) {
      const greeting = AGENT_CONFIG.greeting(this.state.currentOperator);
      this.addMessage('agent', greeting);
      this.state.chatHistory.push({ role: 'assistant', content: greeting });
      this.saveState();
    } else {
      // Reload existing chat
      this.state.chatHistory.forEach(msg => {
        this.addMessage(msg.role === 'user' ? 'user' : 'agent', msg.content);
      });
    }

    this.updateProgress();
  },

  loadChat: function() {
    this.initChat();
  },

  sendMessage: async function() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;

    // Add user message
    this.addMessage('user', text);
    this.state.chatHistory.push({ role: 'user', content: text });
    input.value = '';
    document.getElementById('send-btn').disabled = true;
    this.autoResize(input);

    // Show typing
    this.showTyping();

    // Call LLM
    const messages = [
      { role: 'system', content: this.buildSystemPrompt() },
      ...this.state.chatHistory.map(m => ({
        role: m.role,
        content: m.content
      }))
    ];

    const result = await callLLM(messages, {
      model: API_CONFIG.selectedModel,
      temperature: 0.7
    });

    this.hideTyping();

    if (result.success) {
      this.addMessage('agent', result.content);
      this.state.chatHistory.push({ role: 'assistant', content: result.content });

      // Try to extract profile data from response
      this.extractProfileData(result.content);

      this.saveState();
      this.updateProgress();
    } else {
      this.addMessage('agent', `⚠️ ${result.error}\n\nSet your OpenRouter API key in Settings (⚙️) to start chatting.`);
    }
  },

  buildSystemPrompt: function() {
    const op = this.state.currentOperator;
    let prompt = AGENT_CONFIG.systemPrompt;

    // Add operator context
    if (op) {
      prompt += `\n\n=== CURRENT OPERATOR ===\n`;
      prompt += `Name: ${op.name}\n`;
      prompt += `Business: ${op.business}\n`;
      prompt += `Type: ${op.businessType}\n`;
      prompt += `Stage: ${op.stage}\n`;
      prompt += `Budget: ${op.budget}\n`;
    }

    // Add profile context
    const completedFields = Object.keys(this.state.currentProfile).filter(k =>
      ProfileBuilder.fields[k] && this.state.currentProfile[k]
    );
    if (completedFields.length > 0) {
      prompt += `\n=== PROFILE DATA COLLECTED (${completedFields.length} / 38) ===\n`;
      completedFields.forEach(fieldId => {
        const fieldInfo = ProfileBuilder.fields[fieldId];
        prompt += `${fieldInfo.label}: ${this.state.currentProfile[fieldId]}\n`;
      });
    }

    return prompt;
  },

  extractProfileData: function(message) {
    // Simple heuristic — look for patterns like "**Label:** Value"
    // Real implementation would use structured JSON from agent
    const fieldPatterns = {
      'business-description': /business (?:is|in a nutshell|does)[^.]*?([^.!?]+)[.!?]/i,
      'industry-niche': /(?:industry|niche)[^.]*?([^.!?]+)[.!?]/i
    };

    // For now, no automatic extraction — operator can manually mark answers
  },

  addMessage: function(role, text) {
    const messagesDiv = document.getElementById('chat-messages');
    const msg = document.createElement('div');
    msg.className = `message ${role}`;

    const avatar = role === 'agent' ? '🌿' : '👤';
    const formattedText = this.formatMessage(text);

    msg.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <div class="message-text">${formattedText}</div>
      </div>
    `;

    messagesDiv.appendChild(msg);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  },

  formatMessage: function(text) {
    // Basic markdown rendering
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre>$1</pre>');
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  },

  showTyping: function() {
    const messagesDiv = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'message agent';
    typing.id = 'typing-indicator';
    typing.innerHTML = `
      <div class="message-avatar">🌿</div>
      <div class="message-content">
        <div class="typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesDiv.appendChild(typing);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  },

  hideTyping: function() {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
  },

  autoResize: function(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  },

  updateProgress: function() {
    const progress = ProfileBuilder.getProgress(this.state.currentProfile);
    document.getElementById('discovery-progress').style.width = progress.percentage + '%';
    document.getElementById('progress-text').textContent = `${progress.completed} / ${progress.total}`;
  },

  // ================================
  // QUICK ACTIONS
  // ================================

  handleQuickAction: async function(action) {
    const input = document.getElementById('chat-input');

    switch (action) {
      case 'start-discovery':
        input.value = "Let's start Discovery";
        document.getElementById('send-btn').disabled = false;
        this.sendMessage();
        break;

      case 'skip-to-architecture':
        input.value = "Skip to Architecture — recommend my LLM stack";
        document.getElementById('send-btn').disabled = false;
        this.sendMessage();
        break;

      case 'show-templates':
        this.switchView('templates');
        break;

      case 'export-chat':
        this.exportChat();
        break;
    }
  },

  exportChat: function() {
    if (this.state.chatHistory.length === 0) {
      alert('No chat to export yet.');
      return;
    }

    let md = `# Chat Export — ${this.state.currentOperator.business}\n`;
    md += `**Date:** ${new Date().toLocaleString()}\n\n`;

    this.state.chatHistory.forEach(msg => {
      const speaker = msg.role === 'user' ? this.state.currentOperator.name : 'Agent';
      md += `## ${speaker}\n\n${msg.content}\n\n---\n\n`;
    });

    FileGenerator.downloadFile(`chat_${this.state.currentOperator.business}_${Date.now()}.md`, md);
  },

  // ================================
  // PROFILE
  // ================================

  renderProfile: function() {
    const container = document.getElementById('profile-sections');
    container.innerHTML = ProfileBuilder.renderHTML(this.state.currentProfile);

    const actions = document.getElementById('profile-actions');
    if (Object.keys(this.state.currentProfile).length > 0) {
      actions.style.display = 'flex';
    } else {
      actions.style.display = 'none';
    }
  },

  exportProfile: function() {
    if (!this.state.currentOperator) return;
    const md = ProfileBuilder.exportMarkdown(this.state.currentProfile, this.state.currentOperator);
    FileGenerator.downloadFile(`${this.state.currentOperator.business}_profile.md`, md);
  },

  copyProfile: function() {
    if (!this.state.currentOperator) return;
    const md = ProfileBuilder.exportMarkdown(this.state.currentProfile, this.state.currentOperator);
    navigator.clipboard.writeText(md).then(() => {
      alert('Profile copied to clipboard!');
    });
  },

  // ================================
  // DELIVERABLES
  // ================================

  renderDeliverables: function() {
    const list = document.getElementById('deliverables-list');
    const progress = ProfileBuilder.getProgress(this.state.currentProfile);

    if (progress.completed < 10) {
      list.innerHTML = `
        <div class="deliverable-empty">
          <p>📦 Complete at least 10 Discovery questions before generating deliverables.</p>
          <p style="margin-top: 12px; font-size: 13px;">Current: ${progress.completed} / 38</p>
        </div>
      `;
      document.getElementById('deliverables-actions').style.display = 'none';
      return;
    }

    const industryTemplate = INDUSTRY_TEMPLATES.find(t => t.id === this.state.currentOperator.businessType);

    list.innerHTML = `
      <div class="deliverable-item">
        <div class="deliverable-icon">📋</div>
        <div class="deliverable-info">
          <div class="deliverable-name">${this.state.currentOperator.business}_TRUE_NAME.md</div>
          <div class="deliverable-desc">Brand master file — voice, compliance, frameworks</div>
        </div>
        <div class="deliverable-actions">
          <button class="btn-secondary" onclick="App.previewTrueName()">Preview</button>
          <button class="btn-secondary" onclick="App.downloadTrueName()">Download</button>
        </div>
      </div>

      <div class="deliverable-item">
        <div class="deliverable-icon">⚙️</div>
        <div class="deliverable-info">
          <div class="deliverable-name">${this.state.currentOperator.business}_TRUE_PROCESS_CONTENT.md</div>
          <div class="deliverable-desc">Content production True Process with 5 quality gates</div>
        </div>
        <div class="deliverable-actions">
          <button class="btn-secondary" onclick="App.downloadContentProcess()">Download</button>
        </div>
      </div>

      <div class="deliverable-item">
        <div class="deliverable-icon">🧩</div>
        <div class="deliverable-info">
          <div class="deliverable-name">${this.state.currentOperator.business}_SKILL.md</div>
          <div class="deliverable-desc">Portable LLM skill — drop into any Claude/ChatGPT session</div>
        </div>
        <div class="deliverable-actions">
          <button class="btn-secondary" onclick="App.downloadSkill()">Download</button>
        </div>
      </div>
    `;

    document.getElementById('deliverables-actions').style.display = 'flex';
  },

  previewTrueName: function() {
    const template = INDUSTRY_TEMPLATES.find(t => t.id === this.state.currentOperator.businessType);
    const md = FileGenerator.generateTrueName(this.state.currentOperator, this.state.currentProfile, template);
    this.showCodeModal('True Name Preview', md);
  },

  downloadTrueName: function() {
    const template = INDUSTRY_TEMPLATES.find(t => t.id === this.state.currentOperator.businessType);
    const md = FileGenerator.generateTrueName(this.state.currentOperator, this.state.currentProfile, template);
    FileGenerator.downloadFile(`${this.state.currentOperator.business}_TRUE_NAME.md`, md);
  },

  downloadContentProcess: function() {
    const md = FileGenerator.generateContentProcess(this.state.currentOperator, this.state.currentProfile);
    FileGenerator.downloadFile(`${this.state.currentOperator.business}_TRUE_PROCESS_CONTENT.md`, md);
  },

  downloadSkill: function() {
    const md = FileGenerator.generateSkill(this.state.currentOperator, this.state.currentProfile);
    FileGenerator.downloadFile(`${this.state.currentOperator.business}_SKILL.md`, md);
  },

  generateDeliverables: function() {
    const progress = ProfileBuilder.getProgress(this.state.currentProfile);
    if (progress.completed < 10) {
      alert('Complete at least 10 Discovery questions first.');
      return;
    }
    this.downloadAllDeliverables();
  },

  downloadAllDeliverables: function() {
    const template = INDUSTRY_TEMPLATES.find(t => t.id === this.state.currentOperator.businessType);
    FileGenerator.downloadAllDeliverables(this.state.currentOperator, this.state.currentProfile, template);
  },

  // ================================
  // TEMPLATES
  // ================================

  renderTemplates: function() {
    const grid = document.getElementById('templates-grid');
    grid.innerHTML = INDUSTRY_TEMPLATES.map(t => `
      <div class="template-card" onclick="App.viewTemplate('${t.id}')">
        <div class="template-icon">${t.icon}</div>
        <div class="template-name">${t.name}</div>
        <div class="template-desc">${t.description}</div>
      </div>
    `).join('');
  },

  viewTemplate: function(templateId) {
    const template = INDUSTRY_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    this.showCodeModal(template.name, template.trueNameTemplate);
  },

  // ================================
  // TROUBLESHOOT
  // ================================

  renderTroubleshoot: function() {
    const list = document.getElementById('troubleshoot-list');
    list.innerHTML = TROUBLESHOOT_ISSUES.map(issue => `
      <div class="troubleshoot-item" onclick="this.classList.toggle('open')">
        <div class="troubleshoot-header">
          <span class="troubleshoot-icon">${issue.icon}</span>
          <span class="troubleshoot-title">${issue.title}</span>
          <span class="troubleshoot-toggle">▼</span>
        </div>
        <div class="troubleshoot-content">
          <div class="troubleshoot-body">
            <h4>Symptoms</h4>
            <p>${issue.symptoms}</p>
            <h4>Fixes</h4>
            <ul>
              ${issue.fixes.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  },

  // ================================
  // SETTINGS
  // ================================

  openSettings: function() {
    const key = localStorage.getItem('openrouter_api_key') || '';
    document.getElementById('api-key-input').value = key;
    document.getElementById('settings-modal').style.display = 'flex';
  },

  closeModal: function(modalId) {
    document.getElementById(modalId).style.display = 'none';
  },

  showCodeModal: function(title, content) {
    document.getElementById('template-modal-title').textContent = title;
    document.getElementById('template-modal-content').textContent = content;
    document.getElementById('template-modal').style.display = 'flex';
  },

  saveApiKey: function(key) {
    if (key && key.trim()) {
      localStorage.setItem('openrouter_api_key', key.trim());
      this.state.apiKeySet = true;
      this.updateModelStatus();
    }
  },

  testConnection: async function() {
    const status = document.getElementById('connection-status');
    status.textContent = 'Testing...';
    status.className = 'connection-status';

    const result = await testConnection();
    status.textContent = result.message;
    status.className = `connection-status ${result.success ? 'success' : 'error'}`;
  },

  // ================================
  // PAST OPERATORS
  // ================================

  renderPastOperators: function() {
    const container = document.getElementById('past-operators');
    const list = document.getElementById('operator-list');

    if (this.state.pastOperators.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.style.display = 'block';
    list.innerHTML = this.state.pastOperators.map(op => `
      <div class="operator-item" onclick="App.loadOperator('${op.id}')">
        <div>
          <div style="font-weight: 600;">${op.business}</div>
          <div style="font-size: 13px; color: var(--text-muted);">${op.name} • ${op.businessType}</div>
        </div>
        <div style="color: var(--text-muted); font-size: 13px;">${new Date(op.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
  },

  loadOperator: function(operatorId) {
    const op = this.state.pastOperators.find(o => o.id === operatorId);
    if (!op) return;

    this.state.currentOperator = op;
    // Reload profile + chat from saved state if same operator
    const saved = localStorage.getItem('llm_os_builder_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.currentOperator && parsed.currentOperator.id === operatorId) {
        this.state.currentProfile = parsed.currentProfile || {};
        this.state.chatHistory = parsed.chatHistory || [];
      }
    }

    this.switchView('chat');
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}