// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — Ollama (Local Models)
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

export class OllamaProvider extends BaseProvider {
  constructor(config = {}) {
    super('Ollama (Local)', config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434/api';
  }

  isConfigured() {
    return true; // Ollama doesn't need an API key
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens || 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error (${response.status}): Is Ollama running? Start with: ollama serve`);
    }

    const data = await response.json();
    return {
      content: data.message?.content || '',
      model: data.model,
      finishReason: data.done ? 'stop' : 'length',
    };
  }

  async *streamChat(messages, options = {}) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model || this.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: true,
        options: {
          temperature: options.temperature ?? 0.7,
          num_predict: options.maxTokens || 4096,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama Error (${response.status}): Is Ollama running?`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const data = JSON.parse(line);
          if (data.message?.content) yield data.message.content;
        } catch (e) { /* skip */ }
      }
    }
  }

  async listModels() {
    try {
      const response = await fetch(`http://localhost:11434/api/tags`);
      if (!response.ok) return [];
      const data = await response.json();
      return data.models?.map(m => m.name) || [];
    } catch {
      return [];
    }
  }
}

export default OllamaProvider;
