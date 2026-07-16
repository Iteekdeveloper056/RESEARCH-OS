// ================================
// API INTEGRATION — OpenRouter routing
// ================================

const API_CONFIG = {
  // OpenRouter is vendor-neutral — single API, many models
  baseUrl: "https://openrouter.ai/api/v1/chat/completions",

  // Default models per task type (tested + cost-optimized)
  models: {
    primary: "anthropic/claude-sonnet-4.6",    // Voice-critical, QA, complex
    fast: "anthropic/claude-haiku-4.5",         // Bulk drafts, fast iteration
    premium: "anthropic/claude-opus-4.1",       // Highest quality, expensive
    budget: "deepseek/deepseek-v4-flash",       // Cheap bulk drafts
    local: "ollama/llama-3.1-8b",               // Local free (if user has Ollama)
    variations: "meta-llama/llama-3.3-70b"      // Alternative perspective
  },

  // Routing logic — picks model based on task
  route: function(taskType = "general") {
    const routes = {
      "voice-critical": this.models.primary,
      "complex-architecture": this.models.primary,
      "bulk-drafts": this.models.fast,
      "high-volume-cheap": this.models.budget,
      "template-fill": this.models.fast,
      "variation": this.models.variations,
      "premium": this.models.premium,
      "general": this.models.primary
    };
    return routes[taskType] || this.models.primary;
  },

  // Default model selection
  selectedModel: "anthropic/claude-sonnet-4.6"
};

// ================================
// API CALL HANDLER
// ================================

async function callLLM(messages, options = {}) {
  const apiKey = localStorage.getItem("openrouter_api_key");

  if (!apiKey) {
    return {
      success: false,
      error: "No API key set. Open Settings (⚙️) to add your OpenRouter API key.",
      needsKey: true
    };
  }

  const model = options.model || API_CONFIG.selectedModel;
  const temperature = options.temperature !== undefined ? options.temperature : 0.7;
  const maxTokens = options.maxTokens || 4096;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000);

  try {
    const response = await fetch(API_CONFIG.baseUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-OpenRouter-Title": "LLM OS Builder App"
      },
      signal: options.signal || controller.signal,
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMessage = errorBody.error?.message || `Request failed with status ${response.status}`;
      return {
        success: false,
        status: response.status,
        error: errorMessage
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return {
        success: false,
        status: 500,
        error: "The model returned an empty response. Please retry or choose another model."
      };
    }

    return {
      success: true,
      content: content,
      model: data.model,
      usage: data.usage
    };
  } catch (err) {
    const timedOut = err.name === "AbortError";
    return {
      success: false,
      status: timedOut ? 408 : "network",
      error: timedOut
        ? "The request timed out. Please retry or choose a faster model."
        : `Network error: ${err.message}. Check your connection and API key.`
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ================================
// TEST CONNECTION
// ================================

async function testConnection() {
  const apiKey = localStorage.getItem("openrouter_api_key");
  if (!apiKey) {
    return { success: false, message: "No API key set" };
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        message: `✅ Connected — ${data.data?.label || 'Active'}`
      };
    } else {
      return {
        success: false,
        message: `❌ Invalid API key (${response.status})`
      };
    }
  } catch (err) {
    return {
      success: false,
      message: `❌ Connection failed: ${err.message}`
    };
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
  window.callLLM = callLLM;
  window.testConnection = testConnection;
}