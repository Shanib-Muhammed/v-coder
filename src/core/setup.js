// ═══════════════════════════════════════════════════════════════
//  VCODER FIRST-RUN SETUP WIZARD
//  Interactive onboarding experience like OpenClaw & Hermes
//  Runs on first launch or when no configuration is found
// ═══════════════════════════════════════════════════════════════

import chalk from 'chalk';
import inquirer from 'inquirer';
import gradientString from 'gradient-string';
import figlet from 'figlet';
import ora from 'ora';
import boxen from 'boxen';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { PetCompanion } from '../pets/companion.js';

// ── Utility: Animated delay ──────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Utility: Type-writer effect ──────────────────────────────
async function typewriter(text, speed = 30) {
  for (const char of text) {
    process.stdout.write(char);
    await delay(speed);
  }
  console.log('');
}

// ── Utility: Clear screen ────────────────────────────────────
function clearScreen() {
  process.stdout.write('\x1B[2J\x1B[0f');
}

// ── Check if setup is needed ─────────────────────────────────
export function needsSetup(projectRoot) {
  const envPath = join(projectRoot, '.env');
  const setupMarker = join(projectRoot, '.vcoder', '.setup-complete');
  return !existsSync(envPath) && !existsSync(setupMarker);
}

// ── Main Setup Wizard ────────────────────────────────────────
export async function runSetupWizard(projectRoot) {
  const neonCyan = chalk.hex('#00F0FF');
  const hotPink = chalk.hex('#FF2D6A');
  const purple = chalk.hex('#B537F2');
  const gold = chalk.hex('#FFD700');
  const green = chalk.hex('#39FF14');
  const dimGray = chalk.hex('#6B7280');
  const white = chalk.hex('#E5E7EB');
  const gradient = gradientString('#00F0FF', '#B537F2', '#FF2D6A');

  clearScreen();

  // ═══════════════════════════════════════════════════════════
  //  STEP 0: Welcome Animation
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log('');

  // Animated loading bar
  const loadingChars = '▓░';
  process.stdout.write('  ');
  for (let i = 0; i < 40; i++) {
    process.stdout.write(neonCyan('▓'));
    await delay(25);
  }
  console.log('');
  console.log('');

  // Figlet banner
  let banner;
  try {
    banner = figlet.textSync('VCODER', { font: 'ANSI Shadow', horizontalLayout: 'fitted' });
  } catch {
    banner = figlet.textSync('VCODER', { font: 'Standard' });
  }
  console.log(gradient(banner));
  console.log('');

  await typewriter(neonCyan('  ⚡ Welcome to Vcoder — Your Intelligent Terminal AI Agent'), 25);
  console.log('');
  await delay(500);

  console.log(boxen(
    white.bold('First-Time Setup Wizard\n\n') +
    dimGray('This wizard will help you configure Vcoder in just a few steps:\n\n') +
    neonCyan('  1.') + white(' Choose your AI provider\n') +
    neonCyan('  2.') + white(' Enter your API key\n') +
    neonCyan('  3.') + white(' Select a model\n') +
    neonCyan('  4.') + white(' Pick your pet companion\n') +
    neonCyan('  5.') + white(' Choose a theme\n') +
    neonCyan('  6.') + white(' Test connection\n\n') +
    dimGray('Takes about 2 minutes. Let\'s go! 🚀'),
    {
      padding: 1,
      margin: { left: 2 },
      borderColor: '#00F0FF',
      borderStyle: 'round',
      title: '⚡ Setup',
      titleAlignment: 'center',
    }
  ));
  console.log('');

  const { startSetup } = await inquirer.prompt([{
    type: 'confirm',
    name: 'startSetup',
    message: neonCyan('Ready to set up Vcoder?'),
    default: true,
  }]);

  if (!startSetup) {
    console.log(dimGray('\n  Setup skipped. Run Vcoder again to set up later.\n'));
    process.exit(0);
  }

  clearScreen();

  // ═══════════════════════════════════════════════════════════
  //  STEP 1: Choose AI Provider
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 1 / 6 ') + white.bold('— Choose Your AI Provider'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  const providers = [
    {
      name: neonCyan('◆ OpenAI') + dimGray('          — GPT-4o, o1-preview, GPT-4-Turbo') + '\n' +
            dimGray('                        Best overall quality. Requires API key from platform.openai.com'),
      value: 'openai',
      short: 'OpenAI',
    },
    {
      name: purple('◆ Anthropic') + dimGray('       — Claude Sonnet 4, Opus 4, Haiku') + '\n' +
            dimGray('                        Excellent for code. Get key from console.anthropic.com'),
      value: 'anthropic',
      short: 'Anthropic',
    },
    {
      name: chalk.hex('#4285F4')('◆ Google Gemini') + dimGray('   — Gemini 2.0 Flash, Pro') + '\n' +
            dimGray('                        Fast & free tier available. Get key from aistudio.google.com'),
      value: 'gemini',
      short: 'Google Gemini',
    },
    {
      name: chalk.hex('#F55036')('◆ Groq') + dimGray('            — Llama 3.3 70B, Mixtral (FAST!)') + '\n' +
            dimGray('                        Ultra-fast inference. Free tier at console.groq.com'),
      value: 'groq',
      short: 'Groq',
    },
    {
      name: green('◆ Ollama') + dimGray('          — Local models (Llama, CodeLlama, Mistral)') + '\n' +
            dimGray('                        100% free, runs locally. Install from ollama.ai'),
      value: 'ollama',
      short: 'Ollama (Local)',
    },
    {
      name: gold('◆ OpenRouter') + dimGray('      — 100+ models from all providers') + '\n' +
            dimGray('                        Gateway to every model. Get key from openrouter.ai'),
      value: 'openrouter',
      short: 'OpenRouter',
    },
  ];

  const { provider } = await inquirer.prompt([{
    type: 'list',
    name: 'provider',
    message: neonCyan('Select your primary AI provider:'),
    choices: providers,
    pageSize: 15,
  }]);

  console.log(green(`\n  ✔ Selected: ${provider}\n`));
  await delay(300);

  // ═══════════════════════════════════════════════════════════
  //  STEP 2: API Key Configuration
  // ═══════════════════════════════════════════════════════════
  clearScreen();
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 2 / 6 ') + white.bold('— API Key Configuration'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  let apiKey = '';
  const envVarMap = {
    openai: { env: 'OPENAI_API_KEY', url: 'https://platform.openai.com/api-keys', prefix: 'sk-' },
    anthropic: { env: 'ANTHROPIC_API_KEY', url: 'https://console.anthropic.com/settings/keys', prefix: 'sk-ant-' },
    gemini: { env: 'GEMINI_API_KEY', url: 'https://aistudio.google.com/apikey', prefix: 'AI' },
    groq: { env: 'GROQ_API_KEY', url: 'https://console.groq.com/keys', prefix: 'gsk_' },
    ollama: { env: null, url: 'https://ollama.ai', prefix: null },
    openrouter: { env: 'OPENROUTER_API_KEY', url: 'https://openrouter.ai/keys', prefix: 'sk-or-' },
  };

  const providerInfo = envVarMap[provider];

  if (provider === 'ollama') {
    console.log(boxen(
      green.bold('🟢 Ollama — No API Key Required!\n\n') +
      white('Ollama runs AI models locally on your machine.\n\n') +
      neonCyan('Setup steps:\n') +
      white('  1. Download & install Ollama from ') + chalk.underline('https://ollama.ai') + '\n' +
      white('  2. Open a terminal and run: ') + neonCyan('ollama pull llama3.2') + '\n' +
      white('  3. Start the server: ') + neonCyan('ollama serve') + '\n\n' +
      dimGray('Vcoder will connect to Ollama at localhost:11434'),
      {
        padding: 1,
        margin: { left: 2 },
        borderColor: 'green',
        borderStyle: 'round',
      }
    ));

    const { ollamaReady } = await inquirer.prompt([{
      type: 'confirm',
      name: 'ollamaReady',
      message: 'Is Ollama installed and running?',
      default: true,
    }]);

    if (!ollamaReady) {
      console.log(dimGray('\n  No problem! Install Ollama later and run Vcoder again.\n'));
    }
  } else {
    console.log(boxen(
      neonCyan.bold(`🔑 ${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key\n\n`) +
      white('Get your API key from:\n') +
      chalk.underline.hex('#00F0FF')(providerInfo.url) + '\n\n' +
      dimGray(`Your key should start with: ${providerInfo.prefix || 'varies'}\n`) +
      dimGray('The key will be stored locally in .env (never shared)'),
      {
        padding: 1,
        margin: { left: 2 },
        borderColor: '#00F0FF',
        borderStyle: 'round',
      }
    ));
    console.log('');

    const { key } = await inquirer.prompt([{
      type: 'password',
      name: 'key',
      message: neonCyan(`Enter your ${provider} API key:`),
      mask: '●',
      validate: (input) => {
        if (!input || input.trim().length < 10) {
          return 'Please enter a valid API key (at least 10 characters)';
        }
        return true;
      },
    }]);

    apiKey = key.trim();
    console.log(green('\n  ✔ API key saved securely\n'));
  }

  await delay(300);

  // ═══════════════════════════════════════════════════════════
  //  STEP 3: Model Selection
  // ═══════════════════════════════════════════════════════════
  clearScreen();
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 3 / 6 ') + white.bold('— Select Default Model'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  const modelMap = {
    openai: [
      { name: green('★ ') + white('gpt-4o') + dimGray(' — Best quality, multimodal (Recommended)'), value: 'gpt-4o', short: 'gpt-4o' },
      { name: '  ' + white('gpt-4o-mini') + dimGray(' — Fast & cheap, great for most tasks'), value: 'gpt-4o-mini', short: 'gpt-4o-mini' },
      { name: '  ' + white('gpt-4-turbo') + dimGray(' — Powerful, 128K context'), value: 'gpt-4-turbo', short: 'gpt-4-turbo' },
      { name: '  ' + white('o1-preview') + dimGray(' — Advanced reasoning (slower)'), value: 'o1-preview', short: 'o1-preview' },
      { name: '  ' + white('o1-mini') + dimGray(' — Fast reasoning'), value: 'o1-mini', short: 'o1-mini' },
    ],
    anthropic: [
      { name: green('★ ') + white('claude-sonnet-4-20250514') + dimGray(' — Best balance (Recommended)'), value: 'claude-sonnet-4-20250514', short: 'claude-sonnet-4' },
      { name: '  ' + white('claude-opus-4-20250514') + dimGray(' — Most capable, premium'), value: 'claude-opus-4-20250514', short: 'claude-opus-4' },
      { name: '  ' + white('claude-3-haiku-20240307') + dimGray(' — Fastest, cheapest'), value: 'claude-3-haiku-20240307', short: 'claude-3-haiku' },
    ],
    gemini: [
      { name: green('★ ') + white('gemini-2.0-flash') + dimGray(' — Fast & capable (Recommended)'), value: 'gemini-2.0-flash', short: 'gemini-2.0-flash' },
      { name: '  ' + white('gemini-2.0-pro') + dimGray(' — Most capable Gemini'), value: 'gemini-2.0-pro', short: 'gemini-2.0-pro' },
      { name: '  ' + white('gemini-1.5-pro') + dimGray(' — 1M token context'), value: 'gemini-1.5-pro', short: 'gemini-1.5-pro' },
    ],
    groq: [
      { name: green('★ ') + white('llama-3.3-70b-versatile') + dimGray(' — Best quality (Recommended)'), value: 'llama-3.3-70b-versatile', short: 'llama-3.3-70b' },
      { name: '  ' + white('mixtral-8x7b-32768') + dimGray(' — Fast mixture-of-experts'), value: 'mixtral-8x7b-32768', short: 'mixtral-8x7b' },
      { name: '  ' + white('gemma2-9b-it') + dimGray(' — Lightweight Google model'), value: 'gemma2-9b-it', short: 'gemma2-9b' },
    ],
    ollama: [
      { name: green('★ ') + white('llama3.2') + dimGray(' — Great all-around (Recommended)'), value: 'llama3.2', short: 'llama3.2' },
      { name: '  ' + white('codellama') + dimGray(' — Optimized for code'), value: 'codellama', short: 'codellama' },
      { name: '  ' + white('mistral') + dimGray(' — Fast & capable'), value: 'mistral', short: 'mistral' },
      { name: '  ' + white('deepseek-coder-v2') + dimGray(' — Excellent for coding'), value: 'deepseek-coder-v2', short: 'deepseek-coder-v2' },
    ],
    openrouter: [
      { name: green('★ ') + white('anthropic/claude-sonnet-4-20250514') + dimGray(' — Best balance'), value: 'anthropic/claude-sonnet-4-20250514', short: 'claude-sonnet-4' },
      { name: '  ' + white('openai/gpt-4o') + dimGray(' — GPT-4o via OpenRouter'), value: 'openai/gpt-4o', short: 'gpt-4o' },
      { name: '  ' + white('google/gemini-2.0-flash-001') + dimGray(' — Gemini via OpenRouter'), value: 'google/gemini-2.0-flash-001', short: 'gemini-flash' },
    ],
  };

  const { model } = await inquirer.prompt([{
    type: 'list',
    name: 'model',
    message: neonCyan('Select your default AI model:'),
    choices: modelMap[provider] || [{ name: 'default', value: 'default' }],
    pageSize: 10,
  }]);

  console.log(green(`\n  ✔ Model: ${model}\n`));
  await delay(300);

  // ═══════════════════════════════════════════════════════════
  //  STEP 4: Pet Selection
  // ═══════════════════════════════════════════════════════════
  clearScreen();
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 4 / 6 ') + white.bold('— Choose Your Pet Companion'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');
  console.log(dimGray('  Your pet companion lives in the terminal and reacts to your coding!'));
  console.log('');

  // Show pet previews
  const petTypes = ['fox', 'cat', 'robot'];
  const petPreviews = {
    fox: [
      '     /\\_/\\  ',
      '    ( o.o ) ',
      '     > ^ <  ',
      '    /|   |\\',
      '   (_|   |_)',
    ],
    cat: [
      '    /\\_/\\  ',
      '   ( o.o ) ',
      '   (> ^ <) ',
      '    |   |  ',
      '    (u u)  ',
    ],
    robot: [
      '   ┌───┐  ',
      '   │ ◉ ◉│  ',
      '   │ ─── │  ',
      '   └─┬─┘  ',
      '     │▓│   ',
      '    ═╧═  ',
    ],
  };

  // Display all pets side by side
  console.log(gold('  🦊 Fox') + '              ' + purple('🐱 Cat') + '              ' + neonCyan('🤖 Robot'));
  console.log(dimGray('  ─────────────────────────────────────────────────'));
  const maxLines = 6;
  for (let i = 0; i < maxLines; i++) {
    const foxLine = (petPreviews.fox[i] || '             ').padEnd(18);
    const catLine = (petPreviews.cat[i] || '             ').padEnd(18);
    const robotLine = petPreviews.robot[i] || '';
    console.log(gold('  ' + foxLine) + purple(catLine) + neonCyan(robotLine));
  }
  console.log('');

  const { petType } = await inquirer.prompt([{
    type: 'list',
    name: 'petType',
    message: neonCyan('Choose your pet:'),
    choices: [
      { name: gold('🦊 Fox') + dimGray(' — Clever & curious'), value: 'fox' },
      { name: purple('🐱 Cat') + dimGray(' — Cool & independent'), value: 'cat' },
      { name: neonCyan('🤖 Robot') + dimGray(' — Techy & precise'), value: 'robot' },
      { name: dimGray('   No pet'), value: 'none' },
    ],
  }]);

  let petName = 'Pixel';
  if (petType !== 'none') {
    const defaultNames = { fox: 'Pixel', cat: 'Byte', robot: 'Circuit' };
    const { name } = await inquirer.prompt([{
      type: 'input',
      name: 'name',
      message: neonCyan('Name your pet:'),
      default: defaultNames[petType],
    }]);
    petName = name.trim() || defaultNames[petType];
    console.log(green(`\n  ✔ Meet ${petName} the ${petType}! 🎉\n`));
  } else {
    console.log(dimGray('\n  No pet selected. You can enable one later with /pet\n'));
  }

  await delay(300);

  // ═══════════════════════════════════════════════════════════
  //  STEP 5: Theme Selection
  // ═══════════════════════════════════════════════════════════
  clearScreen();
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 5 / 6 ') + white.bold('— Choose Your Theme'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  // Theme previews
  console.log(neonCyan('  ┌─ Cyberpunk ─────────────────┐'));
  console.log(neonCyan('  │') + chalk.hex('#00F0FF')(' ⚡ Neon cyan ') + chalk.hex('#B537F2')('+ Electric purple') + neonCyan(' │'));
  console.log(neonCyan('  │') + chalk.hex('#FF2D6A')(' Hot pink ') + chalk.hex('#39FF14')('+ Matrix green   ') + neonCyan('  │'));
  console.log(neonCyan('  └─────────────────────────────┘'));
  console.log('');
  console.log(chalk.hex('#7C3AED')('  ┌─ Midnight ──────────────────┐'));
  console.log(chalk.hex('#7C3AED')('  │') + chalk.hex('#7C3AED')(' Deep violet ') + chalk.hex('#EC4899')('+ Soft pink    ') + chalk.hex('#7C3AED')(' │'));
  console.log(chalk.hex('#7C3AED')('  │') + chalk.hex('#06B6D4')(' Cool cyan ') + chalk.hex('#10B981')('+ Emerald       ') + chalk.hex('#7C3AED')('  │'));
  console.log(chalk.hex('#7C3AED')('  └─────────────────────────────┘'));
  console.log('');
  console.log(chalk.hex('#22D3EE')('  ┌─ Aurora ────────────────────┐'));
  console.log(chalk.hex('#22D3EE')('  │') + chalk.hex('#22D3EE')(' Cyan breeze ') + chalk.hex('#A78BFA')('+ Lavender    ') + chalk.hex('#22D3EE')(' │'));
  console.log(chalk.hex('#22D3EE')('  │') + chalk.hex('#34D399')(' Mint green ') + chalk.hex('#FBBF24')('+ Warm gold   ') + chalk.hex('#22D3EE')('  │'));
  console.log(chalk.hex('#22D3EE')('  └─────────────────────────────┘'));
  console.log('');

  const { theme } = await inquirer.prompt([{
    type: 'list',
    name: 'theme',
    message: neonCyan('Select your terminal theme:'),
    choices: [
      { name: chalk.hex('#00F0FF')('⚡ Cyberpunk') + dimGray(' — Neon & futuristic'), value: 'cyberpunk' },
      { name: chalk.hex('#7C3AED')('🌙 Midnight') + dimGray(' — Deep & elegant'), value: 'midnight' },
      { name: chalk.hex('#22D3EE')('🌌 Aurora') + dimGray(' — Cool & serene'), value: 'aurora' },
    ],
  }]);

  console.log(green(`\n  ✔ Theme: ${theme}\n`));
  await delay(300);

  // ═══════════════════════════════════════════════════════════
  //  STEP 6: Test Connection & Save
  // ═══════════════════════════════════════════════════════════
  clearScreen();
  console.log('');
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log(neonCyan.bold('  STEP 6 / 6 ') + white.bold('— Testing Connection'));
  console.log(gradient('  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
  console.log('');

  // Save .env file
  const spinner1 = ora({ text: neonCyan(' Saving configuration...'), spinner: 'dots12', color: 'cyan', prefixText: '  ' }).start();
  await delay(800);

  const envContent = buildEnvFile(provider, apiKey);
  writeFileSync(join(projectRoot, '.env'), envContent);
  spinner1.succeed(green(' Configuration saved to .env'));

  // Save config
  const spinner2 = ora({ text: neonCyan(' Updating config...'), spinner: 'dots12', color: 'cyan', prefixText: '  ' }).start();
  await delay(500);

  const configContent = buildConfig(provider, model, petType, petName, theme);
  writeFileSync(join(projectRoot, 'config', 'default.json'), JSON.stringify(configContent, null, 2));
  spinner2.succeed(green(' Config updated'));

  // Mark setup as complete
  const vcoderDir = join(projectRoot, '.vcoder');
  if (!existsSync(vcoderDir)) mkdirSync(vcoderDir, { recursive: true });
  writeFileSync(join(vcoderDir, '.setup-complete'), new Date().toISOString());

  // Test API connection
  if (provider !== 'ollama' && apiKey) {
    const spinner3 = ora({ text: neonCyan(` Testing ${provider} API connection...`), spinner: 'dots12', color: 'cyan', prefixText: '  ' }).start();

    try {
      const testResult = await testConnection(provider, apiKey, model);
      if (testResult.success) {
        spinner3.succeed(green(` Connected to ${provider} successfully! ✨`));
        if (testResult.message) {
          console.log(dimGray(`    Response: "${testResult.message.slice(0, 80)}..."`));
        }
      } else {
        spinner3.warn(gold(` Connection test had issues: ${testResult.error}`));
        console.log(dimGray('    Don\'t worry — you can fix the API key later in .env'));
      }
    } catch (e) {
      spinner3.warn(gold(` Could not verify connection: ${e.message}`));
      console.log(dimGray('    The API key has been saved. Connection will be tested when you chat.'));
    }
  } else if (provider === 'ollama') {
    const spinner3 = ora({ text: neonCyan(' Checking Ollama server...'), spinner: 'dots12', color: 'cyan', prefixText: '  ' }).start();
    try {
      const res = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        const models = data.models?.map(m => m.name) || [];
        spinner3.succeed(green(` Ollama is running! Found ${models.length} model(s)`));
        if (models.length > 0) {
          console.log(dimGray(`    Available: ${models.slice(0, 5).join(', ')}`));
        }
      } else {
        spinner3.warn(gold(' Ollama server responded but returned an error'));
      }
    } catch {
      spinner3.warn(gold(' Ollama not detected. Start it with: ollama serve'));
    }
  }

  await delay(500);

  // ═══════════════════════════════════════════════════════════
  //  SETUP COMPLETE — Summary
  // ═══════════════════════════════════════════════════════════
  console.log('');
  console.log('');

  const summaryParts = [
    green.bold('✨ Setup Complete!\n'),
    '',
    white.bold('Your Configuration:'),
    '',
    neonCyan('  Provider : ') + white(provider),
    neonCyan('  Model    : ') + white(model),
    neonCyan('  Theme    : ') + white(theme),
    petType !== 'none'
      ? neonCyan('  Pet      : ') + white(`${petName} the ${petType}`)
      : neonCyan('  Pet      : ') + dimGray('disabled'),
    '',
    dimGray('  Config : config/default.json'),
    dimGray('  API Key: .env'),
    dimGray('  Memory : .vcoder/memory/'),
  ].join('\n');

  console.log(boxen(summaryParts, {
    padding: 1,
    margin: { left: 2 },
    borderColor: 'green',
    borderStyle: 'double',
    title: '⚡ Vcoder Ready',
    titleAlignment: 'center',
  }));

  console.log('');

  // Show pet one last time
  if (petType !== 'none') {
    const pet = new PetCompanion(petType, petName);
    pet.setMood('happy');
    console.log(pet.render());
    console.log(gold(`  ${petName} is excited to code with you! ✨`));
  }

  console.log('');
  await typewriter(neonCyan('  Starting Vcoder...'), 40);
  console.log('');
  await delay(500);

  return {
    provider,
    apiKey,
    model,
    petType,
    petName,
    theme,
  };
}

// ── Build .env file content ──────────────────────────────────
function buildEnvFile(provider, apiKey) {
  const lines = [
    '# ╔══════════════════════════════════════════════════════════════╗',
    '# ║              VCODER CONFIGURATION — Auto-generated           ║',
    '# ╚══════════════════════════════════════════════════════════════╝',
    '',
  ];

  const envMap = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    gemini: 'GEMINI_API_KEY',
    groq: 'GROQ_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
  };

  // Write the active key
  if (envMap[provider] && apiKey) {
    lines.push(`${envMap[provider]}=${apiKey}`);
  }

  // Write placeholders for others
  for (const [p, env] of Object.entries(envMap)) {
    if (p !== provider) {
      lines.push(`# ${env}=your_key_here`);
    }
  }

  lines.push('');
  lines.push(`VCODER_DEFAULT_PROVIDER=${provider}`);
  lines.push('');

  return lines.join('\n');
}

// ── Build config ─────────────────────────────────────────────
function buildConfig(provider, model, petType, petName, theme) {
  return {
    activeProvider: provider,
    providers: {
      openai: { name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'o1-preview', 'o1-mini'], defaultModel: 'gpt-4o', apiKeyEnv: 'OPENAI_API_KEY' },
      anthropic: { name: 'Anthropic', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-sonnet-4-20250514', 'claude-opus-4-20250514', 'claude-3-haiku-20240307'], defaultModel: 'claude-sonnet-4-20250514', apiKeyEnv: 'ANTHROPIC_API_KEY' },
      gemini: { name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta', models: ['gemini-2.0-flash', 'gemini-2.0-pro', 'gemini-1.5-pro'], defaultModel: 'gemini-2.0-flash', apiKeyEnv: 'GEMINI_API_KEY' },
      groq: { name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', models: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768', 'gemma2-9b-it'], defaultModel: 'llama-3.3-70b-versatile', apiKeyEnv: 'GROQ_API_KEY' },
      ollama: { name: 'Ollama (Local)', baseUrl: 'http://localhost:11434/api', models: ['llama3.2', 'codellama', 'mistral', 'deepseek-coder-v2'], defaultModel: 'llama3.2', apiKeyEnv: null },
      openrouter: { name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', models: ['anthropic/claude-sonnet-4-20250514', 'openai/gpt-4o', 'google/gemini-2.0-flash-001'], defaultModel: 'anthropic/claude-sonnet-4-20250514', apiKeyEnv: 'OPENROUTER_API_KEY' },
    },
    memory: { maxConversationHistory: 100, topicPersistence: true, styleAdaptation: true, longTermMemoryPath: '.vcoder/memory' },
    pet: { enabled: petType !== 'none', type: petType !== 'none' ? petType : 'fox', name: petName },
    ui: { theme, showPet: petType !== 'none', markdownRendering: true, animatedSpinners: true },
    plugins: { directory: '.vcoder/plugins', enabled: [] },
  };
}

// ── Test API connection ──────────────────────────────────────
async function testConnection(provider, apiKey, model) {
  try {
    const testMessage = 'Respond with exactly: "Hello from Vcoder!" — nothing else.';

    if (provider === 'openai' || provider === 'groq') {
      const baseUrl = provider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://api.openai.com/v1';
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: testMessage }], max_tokens: 20 }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, message: data.choices?.[0]?.message?.content || '' };
    }

    if (provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: testMessage }], max_tokens: 20 }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, message: data.content?.[0]?.text || '' };
    }

    if (provider === 'gemini') {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: testMessage }] }], generationConfig: { maxOutputTokens: 20 } }),
          signal: AbortSignal.timeout(15000),
        }
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, message: data.candidates?.[0]?.content?.parts?.[0]?.text || '' };
    }

    if (provider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}`, 'HTTP-Referer': 'https://vcoder.dev' },
        body: JSON.stringify({ model, messages: [{ role: 'user', content: testMessage }], max_tokens: 20 }),
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: err.error?.message || `HTTP ${res.status}` };
      }
      const data = await res.json();
      return { success: true, message: data.choices?.[0]?.message?.content || '' };
    }

    return { success: true, message: 'Skipped test for this provider' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export default { needsSetup, runSetupWizard };
