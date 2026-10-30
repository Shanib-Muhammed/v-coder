// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  VCODER â€” Intelligent Terminal AI Agent
//  Main Entry Point
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//
//  âš¡ Multi-provider AI    ðŸ¾ Pet companion
//  ðŸ§  Persistent memory    ðŸŽ¨ Beautiful themes
//  ðŸ”Œ Plugin system        ðŸ“Œ Topic tracking
//  ðŸŽ¯ Style adaptation     ðŸ’¬ Smart clarification
//
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Resolve __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// â”€â”€ Import Core Modules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { ProviderManager } from './providers/manager.js';
import { MemoryEngine } from './memory/engine.js';
import { PluginManager } from './plugins/manager.js';
import { AgentEngine } from './core/agent.js';
import { CommandHandler } from './core/commands.js';
import { UIRenderer } from './ui/renderer.js';
import { PetCompanion } from './pets/companion.js';
import { setTheme, getTheme } from './style/theme.js';
import { needsSetup, runSetupWizard } from './core/setup.js';

// â”€â”€ Main Application â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function main() {

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  FIRST-RUN SETUP WIZARD (like OpenClaw / Hermes)
  //  Runs only on first launch when no .env exists
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  if (needsSetup(PROJECT_ROOT)) {
    await runSetupWizard(PROJECT_ROOT);
  }

  // Load environment variables (after setup may have created .env)
  dotenv.config({ path: join(PROJECT_ROOT, '.env') });

  // â”€â”€ Load Configuration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let config = {};
  try {
    const configPath = join(PROJECT_ROOT, 'config', 'default.json');
    if (existsSync(configPath)) {
      config = JSON.parse(readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {
    // Use defaults
  }

  // â”€â”€ Initialize Systems â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const pet = new PetCompanion(
    config.pet?.type || 'fox',
    config.pet?.name || 'Pixel'
  );

  const showPet = config.pet?.enabled !== false;
  const ui = new UIRenderer(showPet ? pet : null);
  const memory = new MemoryEngine(config.memory?.longTermMemoryPath || '.vcoder/memory');
  const providerManager = new ProviderManager(config);
  const pluginManager = new PluginManager(config.plugins?.directory || '.vcoder/plugins');
  const agent = new AgentEngine(providerManager, memory, pluginManager);
  const commandHandler = new CommandHandler(agent, ui, memory, providerManager, pluginManager, pet);

  // Set theme
  if (config.ui?.theme) {
    setTheme(config.ui.theme);
  }

  // Register built-in plugins
  const builtins = PluginManager.getBuiltinPlugins();
  for (const [, plugin] of Object.entries(builtins)) {
    pluginManager.register(plugin);
  }

  // â”€â”€ Render Splash Screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  ui.renderBanner();
  ui.renderWelcome(providerManager.getProviderInfo());

  // â”€â”€ Create readline interface â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ui.getPromptPrefix(),
    terminal: true,
  });

  // â”€â”€ Handle line input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  rl.on('line', async (line) => {
    const input = line.trim();

    // Skip empty input
    if (!input) {
      rl.prompt();
      return;
    }

    // Handle slash commands
    if (input.startsWith('/')) {
      const result = await commandHandler.handle(input);

      if (result.action === 'exit') {
        ui.renderGoodbye();
        rl.close();
        process.exit(0);
      }

      if (result.action === 'unknown') {
        ui.renderWarning(`Unknown command: ${result.command}. Type /help for available commands.`);
      }

      // Show status bar after command
      const topic = memory.getCurrentTopic();
      ui.renderStatusBar(
        providerManager.getProviderInfo(),
        topic?.name || null
      );

      rl.prompt();
      return;
    }

    // â”€â”€ Process AI Chat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    pet.interact();

    // Check if provider is configured
    const providerInfo = providerManager.getProviderInfo();
    if (!providerInfo.configured) {
      ui.renderError(
        `No API key configured for ${providerInfo.name}`,
        'Type /provider to pick a provider and enter your API key now!\n  Free providers with no key needed: Ollama (local)'
      );
      rl.prompt();
      return;
    }

    // Show user message
    ui.renderUserMessage(input);

    // Process with AI
    try {
      ui.startSpinner('Thinking...');

      const result = await agent.processMessage(input);

      ui.stopSpinner(result.type !== 'error');

      switch (result.type) {
        case 'response':
          ui.renderAssistantMessage(result.content);
          if (result.usage) {
            const theme = getTheme();
            const tokens = result.usage.total_tokens || result.usage.totalTokenCount || '?';
            console.log(theme.dim(`  ðŸ“Š Tokens: ${tokens} | Model: ${result.model || providerInfo.model}`));
          }
          break;

        case 'clarification':
          ui.renderClarification(result.questions.join('\n'));
          break;

        case 'error':
          ui.renderError(result.message);
          break;
      }
    } catch (error) {
      ui.stopSpinner(false, 'Failed');
      ui.renderError(error.message);
    }

    // Show status bar
    const topic = memory.getCurrentTopic();
    ui.renderStatusBar(
      providerManager.getProviderInfo(),
      topic?.name || null
    );

    rl.prompt();
  });

  // Handle close
  rl.on('close', () => {
    ui.renderGoodbye();
    process.exit(0);
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('');
    ui.renderGoodbye();
    process.exit(0);
  });

  // Start the prompt
  rl.prompt();
}

// â”€â”€ Launch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
main().catch(error => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
