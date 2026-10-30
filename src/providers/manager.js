// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER MANAGER — All 25 World Providers
// ═══════════════════════════════════════════════════════════════

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..', '..');

export class ProviderManager {
  constructor(config = {}) {
    this.config = config;
    this.providers = config.providers || {};
    this.activeKey = config.activeProvider || 'groq';
    this._model = null;
  }

  getActiveProvider() {
    const p = this.providers[this.activeKey];
    if (!p) return null;
    return { key: this.activeKey, ...p, model: this._model || p.defaultModel };
  }

  getProviderInfo() {
    const p = this.providers[this.activeKey];
    if (!p) return { name: 'None', model: 'none', configured: false };
    const apiKeyEnv = p.apiKeyEnv;
    const configured = !apiKeyEnv || !!process.env[apiKeyEnv];
    return {
      key: this.activeKey,
      name: p.name,
      model: this._model || p.defaultModel,
      configured,
      free: p.free || false,
      freeNote: p.freeNote || '',
      baseUrl: p.baseUrl,
      type: p.type || 'openai-compatible',
    };
  }

  setActiveProvider(key) {
    if (!this.providers[key]) return false;
    this.activeKey = key;
    this._model = null;
    return true;
  }

  setModel(model) {
    this._model = model;
  }

  listProviders() {
    return Object.entries(this.providers).map(([key, p]) => {
      const configured = !p.apiKeyEnv || !!process.env[p.apiKeyEnv];
      return {
        key,
        name: p.name,
        models: p.models || [],
        freeModels: p.freeModels || [],
        defaultModel: p.defaultModel,
        free: p.free || false,
        freeNote: p.freeNote || '',
        configured,
        active: key === this.activeKey,
        model: key === this.activeKey ? (this._model || p.defaultModel) : p.defaultModel,
      };
    });
  }

  getAvailableModels() {
    const p = this.providers[this.activeKey];
    if (!p) return [];
    return [...(p.freeModels || []), ...(p.models || [])];
  }

  // ── Universal Chat Completion ────────────────────────────
  async chat(messages, options = {}) {
    const info = this.getProviderInfo();
    if (!info.configured && this.activeKey !== 'ollama') {
      throw new Error(`No API key for ${info.name}. Add ${this.providers[this.activeKey]?.apiKeyEnv} to your .env file.`);
    }

    const type = info.type;

    if (type === 'anthropic') {
      return this._chatAnthropic(messages, options, info);
    } else if (type === 'gemini') {
      return this._chatGemini(messages, options, info);
    } else if (type === 'ollama') {
      return this._chatOllama(messages, options, info);
    } else {
      // OpenAI-compatible (covers 20+ providers)
      return this._chatOpenAICompat(messages, options, info);
    }
  }

  async _chatOpenAICompat(messages, options, info) {
    const p = this.providers[this.activeKey];
    const apiKey = p.apiKeyEnv ? process.env[p.apiKeyEnv] : 'no-key';
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    // OpenRouter needs extra headers
    if (this.activeKey === 'openrouter') {
      headers['HTTP-Referer'] = 'https://vcoder.dev';
      headers['X-Title'] = 'Vcoder';
    }

    const body = {
      model: info.model,
      messages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
      stream: false,
    };

    const res = await fetch(`${info.baseUrl}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `${info.name} error: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
      model: data.model || info.model,
    };
  }

  async _chatAnthropic(messages, options, info) {
    const apiKey = process.env['ANTHROPIC_API_KEY'];
    const system = messages.find(m => m.role === 'system')?.content;
    const userMessages = messages.filter(m => m.role !== 'system');

    const body = {
      model: info.model,
      messages: userMessages,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature || 0.7,
    };
    if (system) body.system = system;

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Anthropic error: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.content?.[0]?.text || '',
      usage: data.usage,
      model: data.model || info.model,
    };
  }

  async _chatGemini(messages, options, info) {
    const apiKey = process.env['GEMINI_API_KEY'];
    const system = messages.find(m => m.role === 'system')?.content;
    const userMessages = messages.filter(m => m.role !== 'system');

    const contents = userMessages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const body = {
      contents,
      generationConfig: {
        maxOutputTokens: options.maxTokens || 4096,
        temperature: options.temperature || 0.7,
      },
    };
    if (system) body.systemInstruction = { parts: [{ text: system }] };

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${info.model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(60000),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini error: HTTP ${res.status}`);
    }

    const data = await res.json();
    return {
      content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      usage: data.usageMetadata,
      model: info.model,
    };
  }

  async _chatOllama(messages, options, info) {
    const res = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: info.model,
        messages,
        stream: false,
        options: { temperature: options.temperature || 0.7 },
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!res.ok) throw new Error(`Ollama error: HTTP ${res.status}. Is Ollama running? Run: ollama serve`);

    const data = await res.json();
    return {
      content: data.message?.content || '',
      usage: { total_tokens: (data.prompt_eval_count || 0) + (data.eval_count || 0) },
      model: data.model || info.model,
    };
  }
}

export default ProviderManager;
