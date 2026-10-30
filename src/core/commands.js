// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  VCODER COMMAND HANDLER â€” Slash Command Processor
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import inquirer from 'inquirer';
import { writeFileSync, unlinkSync, existsSync } from 'fs';
import { join } from 'path';
import { setTheme, THEMES, getThemeName } from '../style/theme.js';
import { PetCompanion } from '../pets/companion.js';

export class CommandHandler {
  constructor(agent, ui, memory, providerManager, pluginManager, pet) {
    this.agent = agent;
    this.ui = ui;
    this.memory = memory;
    this.providers = providerManager;
    this.plugins = pluginManager;
    this.pet = pet;
  }

  async handle(input) {
    const parts = input.trim().split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    switch (command) {
      case '/help':
        return this._handleHelp();
      case '/provider':
        return await this._handleProvider(args);
      case '/model':
        return await this._handleModel(args);
      case '/providers':
        return this._handleListProviders();
      case '/topic':
        return this._handleTopic(args);
      case '/topics':
        return this._handleTopics();
      case '/memory':
        return this._handleMemory();
      case '/clear':
        return this._handleClear();
      case '/pet':
        return await this._handlePet(args);
      case '/theme':
        return await this._handleTheme(args);
      case '/plugins':
        return this._handlePlugins();
      case '/style':
        return this._handleStyle();
      case '/export':
        return this._handleExport();
      case '/setup':
        return this._handleSetup();
      case '/status':
        return this._handleStatus();
      case '/reset':
        return await this._handleReset();
      case '/exit':
      case '/quit':
      case '/bye':
        return { action: 'exit' };
      default:
        return { action: 'unknown', command };
    }
  }

  _handleHelp() {
    const pluginCommands = this.plugins.getAllCommands();
    this.ui.renderHelp(pluginCommands);
    return { action: 'handled' };
  }

  
async _handleProvider(args) {
    // Load full config to read providers list
    const { readFileSync, writeFileSync, existsSync, mkdirSync, appendFileSync } = await import('fs');
    const { join: pjoin } = await import('path');
    const { fileURLToPath } = await import('url');
    const root = pjoin(fileURLToPath(import.meta.url), '..', '..', '..');

    const configPath = pjoin(root, 'config', 'default.json');
    const envPath    = pjoin(root, '.env');
    const cfg = JSON.parse(readFileSync(configPath, 'utf-8'));
    const allProviders = cfg.providers || {};

    let selectedKey = args;

    if (!selectedKey) {
      // Build choices with free/paid/configured labels
      const choices = Object.entries(allProviders).map(([key, p]) => {
        const isActive = key === (cfg.activeProvider || 'groq');
        const configured = !p.apiKeyEnv || !!process.env[p.apiKeyEnv];
        const freeLabel  = p.free ? ' [FREE]' : '';
        const keyLabel   = !p.apiKeyEnv ? ' [NO KEY NEEDED]' : (configured ? ' [KEY SET âœ”]' : ' [NEEDS KEY]');
        return {
          name: `${isActive ? 'â–¸ ' : '  '}${(p.name||key).padEnd(22)}${freeLabel}${keyLabel}`,
          value: key,
        };
      });

      const { selected } = await inquirer.prompt([{
        type: 'list',
        name: 'selected',
        message: 'Select AI provider:',
        choices,
        pageSize: 20,
      }]);
      selectedKey = selected;
    }

    const prov = allProviders[selectedKey];
    if (!prov) {
      this.ui.renderError(`Unknown provider: ${selectedKey}`);
      return { action: 'handled' };
    }

    // If provider needs an API key and it's not set, ask for it NOW
    if (prov.apiKeyEnv && !process.env[prov.apiKeyEnv]) {
      console.log('');
      console.log(`  \x1b[38;2;220;20;60m${prov.name} needs an API key.\x1b[0m`);
      if (prov.free) {
        console.log(`  \x1b[38;2;76;175;80mâœ¦ ${prov.freeNote || 'Free tier available!'}\x1b[0m`);
      }
      console.log(`  \x1b[38;2;102;102;102mGet your key from the provider website.\x1b[0m`);
      console.log('');

      const { enterKey } = await inquirer.prompt([{
        type: 'confirm',
        name: 'enterKey',
        message: `Do you have an API key for ${prov.name}?`,
        default: true,
      }]);

      if (enterKey) {
        const { apiKey } = await inquirer.prompt([{
          type: 'password',
          name: 'apiKey',
          message: `Enter your ${prov.name} API key:`,
          mask: '*',
          validate: v => v.trim().length > 0 ? true : 'API key cannot be empty',
        }]);

        // Save to .env file
        const keyLine = `\n${prov.apiKeyEnv}=${apiKey.trim()}`;
        appendFileSync(envPath, keyLine, 'utf-8');

        // Set in current process env so it works immediately
        process.env[prov.apiKeyEnv] = apiKey.trim();

        this.ui.renderSuccess(`API key saved! ${prov.apiKeyEnv} added to .env`);
      } else {
        // Skip â€” provider won't work but let them switch anyway
        console.log('  \x1b[38;2;102;102;102mNo key entered. You can add it later to .env\x1b[0m');
      }
    }

    // Switch provider in memory
    this.providers.setActiveProvider(selectedKey);

    // Persist to config/default.json so it survives restart
    cfg.activeProvider = selectedKey;
    writeFileSync(configPath, JSON.stringify(cfg, null, 2), 'utf-8');

    const info = this.providers.getProviderInfo();
    this.ui.renderSuccess(`Switched to ${info.name} (${info.model})`);
    return { action: 'handled' };
  }

  async _handleModel(args) {
    if (args) {
      this.providers.setModel(args);
      this.ui.renderSuccess(`Model set to: ${args}`);
    } else {
      const info = this.providers.getProviderInfo();
      const models = this.providers.getAvailableModels();

      if (models.length === 0) {
        this.ui.renderWarning('No models listed for this provider. Type the model name directly: /model <name>');
        return { action: 'handled' };
      }

      const { selected } = await inquirer.prompt([{
        type: 'list',
        name: 'selected',
        message: `Select model for ${info.name}:`,
        choices: models.map(m => ({
          name: m === info.model ? `â— ${m}` : `  ${m}`,
          value: m,
        })),
      }]);
      this.providers.setModel(selected);
      this.ui.renderSuccess(`Model set to: ${selected}`);
    }
    return { action: 'handled' };
  }

  _handleListProviders() {
    const providers = this.providers.listProviders();
    console.log('');
    for (const p of providers) {
      const status = p.configured ? 'âœ” Configured' : 'âœ– Not configured';
      const active = p.active ? ' (ACTIVE)' : '';
      console.log(`  ${p.active ? 'â—' : 'â—‹'} ${p.name}${active} â€” ${status}`);
      console.log(`    Model: ${p.model}`);
      console.log(`    Available: ${p.models.join(', ')}`);
      console.log('');
    }
    return { action: 'handled' };
  }

  _handleTopic(args) {
    if (args) {
      this.memory.trackTopic(args);
      this.ui.renderSuccess(`Topic set: ${args}`);
    } else {
      const topic = this.memory.getCurrentTopic();
      if (topic) {
        this.ui.renderInfo('Current Topic', `ðŸ“Œ ${topic.name}\nFirst mentioned: ${topic.firstMentioned}\nMentions: ${topic.mentionCount}`);
      } else {
        this.ui.renderInfo('Topic', 'No active topic. Start chatting and topics will be detected automatically, or use /topic <name> to set one.');
      }
    }
    return { action: 'handled' };
  }

  _handleTopics() {
    const topics = this.memory.getActiveTopics();
    if (topics.length === 0) {
      this.ui.renderInfo('Topics', 'No topics tracked yet. Topics are automatically detected from your conversations.');
      return { action: 'handled' };
    }
    console.log('');
    console.log('  ðŸ“Œ Active Topics:');
    for (const topic of topics) {
      console.log(`    â€¢ ${topic.name} (mentioned ${topic.mentionCount}x)`);
    }
    console.log('');
    return { action: 'handled' };
  }

  _handleMemory() {
    const topics = this.memory.getActiveTopics();
    const style = this.memory.userStyle;
    const memories = this.memory.longTermMemory;
    const history = this.memory.conversations;

    const info = [
      `Session messages: ${history.length}`,
      `Active topics: ${topics.length}`,
      `Long-term memories: ${memories.length}`,
      `Messages analyzed: ${style.messageCount || 0}`,
      `Formality: ${((style.formalityScore || 0.5) * 100).toFixed(0)}%`,
      `Technical level: ${((style.technicalLevel || 0.5) * 100).toFixed(0)}%`,
    ].join('\n');

    this.ui.renderInfo('Memory Status', info);
    return { action: 'handled' };
  }

  _handleClear() {
    this.memory.clearSession();
    this.ui.renderSuccess('Conversation history cleared');
    return { action: 'handled' };
  }

  async _handlePet(args) {
    if (args === 'off') {
      this.ui.pet = null;
      this.ui.renderSuccess('Pet hidden');
      return { action: 'handled' };
    }

    if (args && PetCompanion.getAvailableTypes().includes(args)) {
      this.pet.setType(args);
      this.ui.renderSuccess(`Pet changed to: ${args}`);
      console.log(this.pet.render());
      return { action: 'handled' };
    }

    const types = PetCompanion.getAvailableTypes();
    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Choose your pet companion:',
      choices: [
        ...types.map(t => ({ name: `${t === this.pet.type ? 'â— ' : '  '}${t}`, value: t })),
        { name: '  Hide pet', value: 'off' },
      ],
    }]);

    if (selected === 'off') {
      this.ui.pet = null;
      this.ui.renderSuccess('Pet hidden');
    } else {
      this.pet.setType(selected);
      this.ui.pet = this.pet;
      this.ui.renderSuccess(`Pet changed to: ${selected}`);
      console.log(this.pet.render());
    }
    return { action: 'handled' };
  }

  async _handleTheme(args) {
    if (args && THEMES[args]) {
      setTheme(args);
      this.ui.renderSuccess(`Theme changed to: ${THEMES[args].name}`);
      return { action: 'handled' };
    }

    const themeNames = Object.entries(THEMES);
    const currentTheme = getThemeName();
    const { selected } = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: 'Select theme:',
      choices: themeNames.map(([key, t]) => ({
        name: `${key === currentTheme ? 'â— ' : '  '}${t.name}`,
        value: key,
      })),
    }]);
    setTheme(selected);
    this.ui.renderSuccess(`Theme changed to: ${THEMES[selected].name}`);
    return { action: 'handled' };
  }

  _handlePlugins() {
    const plugins = this.plugins.listPlugins();
    if (plugins.length === 0) {
      this.ui.renderInfo('Plugins', 'No plugins installed. Place plugins in .vcoder/plugins/ directory.');
      return { action: 'handled' };
    }
    console.log('');
    console.log('  ðŸ”Œ Installed Plugins:');
    for (const p of plugins) {
      console.log(`    ${p.enabled ? 'â—' : 'â—‹'} ${p.name} v${p.version} â€” ${p.description}`);
      if (p.commands.length > 0) {
        console.log(`      Commands: ${p.commands.join(', ')}`);
      }
    }
    console.log('');
    return { action: 'handled' };
  }

  _handleStyle() {
    const styleCtx = this.memory.getStyleContext();
    if (!styleCtx) {
      this.ui.renderInfo('User Style', 'Not enough data yet. Keep chatting and I will learn your preferences!');
    } else {
      this.ui.renderInfo('Learned User Style', styleCtx);
    }
    return { action: 'handled' };
  }

  _handleExport() {
    const history = this.memory.conversations;
    if (history.length === 0) {
      this.ui.renderWarning('No conversation to export');
      return { action: 'handled' };
    }
    const filename = `vcoder_export_${Date.now()}.json`;
    try {
      writeFileSync(filename, JSON.stringify(history, null, 2));
      this.ui.renderSuccess(`Exported to: ${filename}`);
    } catch (e) {
      this.ui.renderError(`Export failed: ${e.message}`);
    }
    return { action: 'handled' };
  }

  _handleSetup() {
    // Delete setup marker so wizard runs again on next start
    const markerPath = join(process.cwd(), '.vcoder', '.setup-complete');
    try {
      if (existsSync(markerPath)) unlinkSync(markerPath);
    } catch { /* ignore */ }
    this.ui.renderInfo('Setup', 'Setup wizard will run on next start.\nRestart Vcoder to re-run the setup wizard.');
    return { action: 'handled' };
  }

  _handleStatus() {
    const providerInfo = this.providers.getProviderInfo();
    const topic = this.memory.getCurrentTopic();
    const style = this.memory.userStyle;
    const history = this.memory.conversations;

    const lines = [
      `Provider  : ${providerInfo.name} ${providerInfo.configured ? 'âœ”' : 'âœ–'}`,
      `Model     : ${providerInfo.model}`,
      `Theme     : ${getThemeName()}`,
      `Pet       : ${this.pet?.name || 'disabled'} (${this.pet?.type || 'none'})`,
      `Topic     : ${topic?.name || 'none'}`,
      `Messages  : ${history.length}`,
      `Style     : formality ${((style.formalityScore || 0.5) * 100).toFixed(0)}% | tech ${((style.technicalLevel || 0.5) * 100).toFixed(0)}%`,
    ];

    this.ui.renderInfo('Vcoder Status', lines.join('\n'));
    return { action: 'handled' };
  }

  async _handleReset() {
    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: 'This will reset all settings, memory, and conversation. Are you sure?',
      default: false,
    }]);
    if (confirm) {
      this.memory.clearSession();
      this.memory.topics = [];
      this.memory.userStyle = {};
      this.memory.longTermMemory = [];
      this.memory._savePersistentData();
      this.ui.renderSuccess('All settings reset');
    }
    return { action: 'handled' };
  }
}

export default CommandHandler;
