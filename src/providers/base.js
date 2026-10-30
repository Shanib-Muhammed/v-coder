// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — Base Provider Interface
// ═══════════════════════════════════════════════════════════════

export class BaseProvider {
  constructor(name, config = {}) {
    this.name = name;
    this.config = config;
    this.apiKey = null;
    this.baseUrl = config.baseUrl || '';
    this.model = config.defaultModel || '';
  }

  setApiKey(key) {
    this.apiKey = key;
  }

  setModel(model) {
    this.model = model;
  }

  async chat(messages, options = {}) {
    throw new Error(`chat() not implemented for provider: ${this.name}`);
  }

  async streamChat(messages, options = {}) {
    throw new Error(`streamChat() not implemented for provider: ${this.name}`);
  }

  isConfigured() {
    return !!this.apiKey || this.name === 'Ollama (Local)';
  }

  getAvailableModels() {
    return this.config.models || [];
  }
}

export default BaseProvider;
