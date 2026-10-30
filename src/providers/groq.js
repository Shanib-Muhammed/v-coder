// ═══════════════════════════════════════════════════════════════
//  VCODER PROVIDER — Groq (OpenAI-compatible)
// ═══════════════════════════════════════════════════════════════

import { OpenAIProvider } from './openai.js';

export class GroqProvider extends OpenAIProvider {
  constructor(config = {}) {
    super({ ...config, baseUrl: config.baseUrl || 'https://api.groq.com/openai/v1' });
    this.name = 'Groq';
  }
}

export default GroqProvider;
