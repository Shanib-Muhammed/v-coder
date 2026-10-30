// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — Google Gemini
// ═══════════════════════════════════════════════════════════════

import { BaseProvider } from './base.js';

export class GeminiProvider extends BaseProvider {
  constructor(config = {}) {
    super('Google Gemini', config);
    this.baseUrl = config.baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
  }

  _convertMessages(messages) {
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));
    return { systemInstruction: systemMsg ? { parts: [{ text: systemMsg.content }] } : undefined, contents: chatMessages };
  }

  async chat(messages, options = {}) {
    const model = options.model || this.model;
    const { systemInstruction, contents } = this._convertMessages(messages);

    const body = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens || 4096,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error (${response.status}): ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
    return {
      content,
      usage: data.usageMetadata,
      model,
      finishReason: data.candidates?.[0]?.finishReason,
    };
  }

  async *streamChat(messages, options = {}) {
    const model = options.model || this.model;
    const { systemInstruction, contents } = this._convertMessages(messages);

    const body = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        maxOutputTokens: options.maxTokens || 4096,
      },
    };
    if (systemInstruction) body.systemInstruction = systemInstruction;

    const response = await fetch(
      `${this.baseUrl}/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Gemini API Error (${response.status}): ${error.error?.message || response.statusText}`);
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
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch (e) { /* skip */ }
      }
    }
  }
}

export default GeminiProvider;
