// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — OpenRouter (Multi-model gateway)
// ═══════════════════════════════════════════════════════════════

import { OpenAIProvider } from './openai.js';

export class OpenRouterProvider extends OpenAIProvider {
  constructor(config = {}) {
    super({ ...config, baseUrl: config.baseUrl || 'https://openrouter.ai/api/v1' });
    this.name = 'OpenRouter';
  }

  async chat(messages, options = {}) {
    // OpenRouter needs extra headers
    const origFetch = global.fetch;
    const baseUrl = this.baseUrl;
    const apiKey = this.apiKey;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://vcoder.dev',
        'X-Title': 'Vcoder AI Agent',
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens || 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter Error (${response.status}): ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
      finishReason: data.choices[0]?.finish_reason,
    };
  }
}

export default OpenRouterProvider;
