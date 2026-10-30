// ═══════════════════════════════════════════════════════════════
//  VCODER AGENT ENGINE — Core AI Brain
// ═══════════════════════════════════════════════════════════════

export class AgentEngine {
  constructor(providerManager, memory, pluginManager) {
    this.providers = providerManager;
    this.memory = memory;
    this.plugins = pluginManager;
  }

  async processMessage(userInput) {
    // Store in memory
    this.memory.addMessage('user', userInput);

    // Analyze for topics, style
    this.memory.analyzeAndLearnStyle(userInput);

    // Check if needs clarification
    const needsClarification = this._needsClarification(userInput);
    if (needsClarification) {
      const questions = this._generateClarificationQuestions(userInput);
      return { type: 'clarification', questions };
    }

    // Build messages for AI
    const systemPrompt = this._buildSystemPrompt();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...this.memory.getRecentMessages(20),
    ];

    // Call AI
    const result = await this.providers.chat(messages);

    // Store response
    this.memory.addMessage('assistant', result.content);
    // fact extraction handled by memory;

    return {
      type: 'response',
      content: result.content,
      usage: result.usage,
      model: result.model,
    };
  }

  _buildSystemPrompt() {
    const styleCtx = this.memory.getStyleContext();
    const topic = this.memory.getCurrentTopic();
    const memories = this.memory.recall();

    let prompt = `You are Vcoder, an expert AI coding assistant. You are intelligent, precise, and helpful.

Your core behaviors:
- Analyze requests carefully before responding
- Write clean, production-quality code
- Explain your reasoning clearly
- Ask for clarification when genuinely needed
- Remember context from previous messages
`;

    if (topic) {
      prompt += `\nCurrent topic: ${topic.name} (${topic.mentionCount} mentions)\n`;
    }

    if (styleCtx) {
      prompt += `\nUser style: ${styleCtx}\n`;
    }

    if (memories.length > 0) {
      prompt += `\nKnown facts about user:\n${memories.slice(0, 5).map(m => `- ${m.content}`).join('\n')}\n`;
    }

    return prompt;
  }

  _needsClarification(input) {
    if (input.length < 5) return false;
    const vague = ['help', 'fix', 'make', 'do it', 'okay', 'continue', 'yes', 'no', 'ok'];
    const lower = input.toLowerCase().trim();
    return vague.includes(lower);
  }

  _generateClarificationQuestions(input) {
    return [
      `What specifically would you like me to ${input.toLowerCase()}?`,
      'Can you share more context about what you need?',
    ];
  }
}

export default AgentEngine;
