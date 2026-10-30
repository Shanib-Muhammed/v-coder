// ═══════════════════════════════════════════════════════════════
//  VCODER MEMORY ENGINE — Persistent Topic & Style Memory
//  Remembers topics, adapts to user style, long-term storage
// ═══════════════════════════════════════════════════════════════

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export class MemoryEngine {
  constructor(storagePath = '.vcoder/memory') {
    this.storagePath = storagePath;
    this.conversations = [];       // Current session conversation history
    this.topics = [];              // Tracked topics across sessions
    this.userStyle = {};           // Learned user preferences/style
    this.longTermMemory = [];      // Persistent facts & context
    this.maxHistory = 100;

    this._ensureStorageDir();
    this._loadPersistentData();
  }

  _ensureStorageDir() {
    try {
      if (!existsSync(this.storagePath)) {
        mkdirSync(this.storagePath, { recursive: true });
      }
    } catch (e) { /* silent */ }
  }

  _loadPersistentData() {
    try {
      const topicsFile = join(this.storagePath, 'topics.json');
      if (existsSync(topicsFile)) {
        this.topics = JSON.parse(readFileSync(topicsFile, 'utf-8'));
      }
    } catch (e) { /* fresh start */ }

    try {
      const styleFile = join(this.storagePath, 'user_style.json');
      if (existsSync(styleFile)) {
        this.userStyle = JSON.parse(readFileSync(styleFile, 'utf-8'));
      }
    } catch (e) { /* fresh start */ }

    try {
      const memFile = join(this.storagePath, 'long_term.json');
      if (existsSync(memFile)) {
        this.longTermMemory = JSON.parse(readFileSync(memFile, 'utf-8'));
      }
    } catch (e) { /* fresh start */ }
  }

  _savePersistentData() {
    try {
      writeFileSync(
        join(this.storagePath, 'topics.json'),
        JSON.stringify(this.topics, null, 2)
      );
      writeFileSync(
        join(this.storagePath, 'user_style.json'),
        JSON.stringify(this.userStyle, null, 2)
      );
      writeFileSync(
        join(this.storagePath, 'long_term.json'),
        JSON.stringify(this.longTermMemory, null, 2)
      );
    } catch (e) { /* silent */ }
  }

  // ── Conversation Management ────────────────────────────────
  addMessage(role, content) {
    const entry = {
      role,
      content,
      timestamp: new Date().toISOString(),
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    };
    this.conversations.push(entry);

    // Trim if exceeding max
    if (this.conversations.length > this.maxHistory) {
      // Summarize old messages before dropping
      this._summarizeOldMessages();
      this.conversations = this.conversations.slice(-this.maxHistory);
    }

    return entry;
  }

  getConversationHistory() {
    return this.conversations.map(m => ({
      role: m.role,
      content: m.content
    }));
  }

  getRecentMessages(count = 20) {
    return this.conversations.slice(-count);
  }

  clearSession() {
    this.conversations = [];
  }

  // ── Topic Tracking ─────────────────────────────────────────
  trackTopic(topic, context = '') {
    const existing = this.topics.find(t => t.name.toLowerCase() === topic.toLowerCase());
    if (existing) {
      existing.lastMentioned = new Date().toISOString();
      existing.mentionCount++;
      if (context) existing.contexts.push(context);
    } else {
      this.topics.push({
        name: topic,
        firstMentioned: new Date().toISOString(),
        lastMentioned: new Date().toISOString(),
        mentionCount: 1,
        contexts: context ? [context] : [],
        resolved: false
      });
    }
    this._savePersistentData();
  }

  getActiveTopics() {
    return this.topics.filter(t => !t.resolved)
      .sort((a, b) => new Date(b.lastMentioned) - new Date(a.lastMentioned));
  }

  getCurrentTopic() {
    const active = this.getActiveTopics();
    return active.length > 0 ? active[0] : null;
  }

  resolveTopic(topicName) {
    const topic = this.topics.find(t => t.name.toLowerCase() === topicName.toLowerCase());
    if (topic) {
      topic.resolved = true;
      topic.resolvedAt = new Date().toISOString();
      this._savePersistentData();
    }
  }

  // ── User Style Adaptation ──────────────────────────────────
  analyzeAndLearnStyle(userMessage) {
    // Track message length preference
    const avgLen = this.userStyle.avgMessageLength || 0;
    const msgCount = this.userStyle.messageCount || 0;
    this.userStyle.avgMessageLength = ((avgLen * msgCount) + userMessage.length) / (msgCount + 1);
    this.userStyle.messageCount = msgCount + 1;

    // Track formality level
    const formalIndicators = ['please', 'could you', 'would you', 'kindly', 'thank you'];
    const casualIndicators = ['hey', 'yo', 'btw', 'lol', 'gonna', 'wanna'];
    let formalScore = formalIndicators.filter(w => userMessage.toLowerCase().includes(w)).length;
    let casualScore = casualIndicators.filter(w => userMessage.toLowerCase().includes(w)).length;
    
    this.userStyle.formalityScore = this.userStyle.formalityScore || 0.5;
    if (formalScore > casualScore) {
      this.userStyle.formalityScore = Math.min(1, this.userStyle.formalityScore + 0.05);
    } else if (casualScore > formalScore) {
      this.userStyle.formalityScore = Math.max(0, this.userStyle.formalityScore - 0.05);
    }

    // Track technical level
    const technicalTerms = ['function', 'class', 'api', 'database', 'algorithm', 'async', 'deploy', 'docker', 'kubernetes', 'regex', 'query', 'schema', 'middleware'];
    const techCount = technicalTerms.filter(t => userMessage.toLowerCase().includes(t)).length;
    this.userStyle.technicalLevel = this.userStyle.technicalLevel || 0.5;
    if (techCount > 0) {
      this.userStyle.technicalLevel = Math.min(1, this.userStyle.technicalLevel + 0.03 * techCount);
    }

    // Track preferred response format
    if (userMessage.includes('code') || userMessage.includes('example') || userMessage.includes('snippet')) {
      this.userStyle.prefersCodeExamples = true;
    }
    if (userMessage.includes('explain') || userMessage.includes('why') || userMessage.includes('how does')) {
      this.userStyle.prefersExplanations = true;
    }

    // Track language preferences
    const codePatterns = {
      javascript: /\b(js|javascript|node|react|vue|next|express)\b/i,
      python: /\b(python|django|flask|fastapi|pip)\b/i,
      typescript: /\b(typescript|ts|tsx)\b/i,
      rust: /\b(rust|cargo|tokio)\b/i,
      go: /\b(golang|go\s+module)\b/i,
    };
    for (const [lang, pattern] of Object.entries(codePatterns)) {
      if (pattern.test(userMessage)) {
        this.userStyle.preferredLanguages = this.userStyle.preferredLanguages || {};
        this.userStyle.preferredLanguages[lang] = (this.userStyle.preferredLanguages[lang] || 0) + 1;
      }
    }

    this._savePersistentData();
  }

  getStyleContext() {
    const style = this.userStyle;
    const parts = [];

    if (style.formalityScore !== undefined) {
      if (style.formalityScore > 0.7) parts.push('The user prefers formal, professional communication.');
      else if (style.formalityScore < 0.3) parts.push('The user prefers casual, friendly communication.');
    }
    if (style.technicalLevel !== undefined) {
      if (style.technicalLevel > 0.7) parts.push('The user is highly technical — use advanced terminology freely.');
      else if (style.technicalLevel < 0.3) parts.push('The user prefers simpler explanations — avoid excessive jargon.');
    }
    if (style.prefersCodeExamples) parts.push('The user appreciates code examples in responses.');
    if (style.prefersExplanations) parts.push('The user likes detailed explanations of concepts.');
    if (style.preferredLanguages) {
      const topLangs = Object.entries(style.preferredLanguages)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang);
      if (topLangs.length > 0) parts.push(`The user frequently works with: ${topLangs.join(', ')}.`);
    }
    if (style.avgMessageLength > 200) parts.push('The user tends to write detailed messages.');
    else if (style.avgMessageLength < 50) parts.push('The user prefers brief, concise messages.');

    return parts.join(' ');
  }

  // ── Long-term Memory ───────────────────────────────────────
  remember(fact, category = 'general') {
    this.longTermMemory.push({
      fact,
      category,
      timestamp: new Date().toISOString()
    });
    this._savePersistentData();
  }

  recall(category = null) {
    if (category) {
      return this.longTermMemory.filter(m => m.category === category);
    }
    return this.longTermMemory;
  }

  getMemoryContext() {
    const recentMemories = this.longTermMemory.slice(-20);
    if (recentMemories.length === 0) return '';
    return 'Relevant memories: ' + recentMemories.map(m => m.fact).join('; ');
  }

  _summarizeOldMessages() {
    const oldMessages = this.conversations.slice(0, 20);
    if (oldMessages.length > 0) {
      const summary = `Previous conversation covered: ${oldMessages.map(m => m.content.slice(0, 50)).join(' | ')}`;
      this.remember(summary, 'conversation_summary');
    }
  }

  // ── System Prompt Enhancement ──────────────────────────────
  getEnhancedSystemContext() {
    const parts = [];
    
    // Style context
    const styleCtx = this.getStyleContext();
    if (styleCtx) parts.push(`[User Style Profile] ${styleCtx}`);

    // Active topics
    const topics = this.getActiveTopics();
    if (topics.length > 0) {
      const topicNames = topics.slice(0, 5).map(t => t.name).join(', ');
      parts.push(`[Active Topics] The user is currently working on: ${topicNames}. Stay focused on these topics and reference them when relevant.`);
    }

    // Long-term memories
    const memCtx = this.getMemoryContext();
    if (memCtx) parts.push(`[Memory] ${memCtx}`);

    return parts.join('\n\n');
  }
}

export default MemoryEngine;
