// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — Anthropic (Claude)
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

export class AnthropicProvider extends BaseProvider {
  constructor(config = {}) {
    super('Anthropic', config);
    this.baseUrl = config.baseUrl || 'https://api.anthropic.com/v1';
  }

  async chat(messages, options = {}) {
    // Anthropic uses a different message format — separate system from messages
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const body = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 4096,
      messages: chatMessages,
    };
    if (systemMsg) body.system = systemMsg.content;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API Error (${response.status}): ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.content?.map(c => c.text).join('') || '';
    return {
      content,
      usage: data.usage,
      model: data.model,
      finishReason: data.stop_reason,
    };
  }

  async *streamChat(messages, options = {}) {
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const body = {
      model: options.model || this.model,
      max_tokens: options.maxTokens || 4096,
      messages: chatMessages,
      stream: true,
    };
    if (systemMsg) body.system = systemMsg.content;

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API Error (${response.status}): ${error.error?.message || response.statusText}`);
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
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        try {
          const data = JSON.parse(trimmed.slice(6));
          if (data.type === 'content_block_delta' && data.delta?.text) {
            yield data.delta.text;
          }
        } catch (e) { /* skip */ }
      }
    }
  }
}

export default AnthropicProvider;
