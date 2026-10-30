// VCODER UI RENDERER - Blood Red Theme (ASCII-safe)
import chalk from 'chalk';
import { getTheme } from '../style/theme.js';

const RED    = '#DC143C';
const DIM    = '#666666';
const WHITE  = '#E8E8E8';
const GREEN  = '#4CAF50';
const ORANGE = '#FF9800';

export class UIRenderer {
  constructor(pet = null) {
    this.pet = pet;
    this.separator = '='.repeat(60);
  }

  renderBanner() {
    const r = chalk.hex(RED).bold;
    const d = chalk.hex(DIM);
    console.log('');
    console.log(r([
      '\u2588\u2588\u2557   \u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2557 \u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2588\u2588\u2588\u2588\u2557 ',
      '\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557\u2588\u2588\u2554\u2550\u2550\u2550\u2550\u255d\u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557',
      '\u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2588\u2588\u2588\u2557  \u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d',
      '\u255a\u2588\u2588\u2557 \u2588\u2588\u2554\u255d\u2588\u2588\u2551     \u2588\u2588\u2551   \u2588\u2588\u2551\u2588\u2588\u2551  \u2588\u2588\u2551\u2588\u2588\u2554\u2550\u2550\u255d  \u2588\u2588\u2554\u2550\u2550\u2588\u2588\u2557',
      ' \u255a\u2588\u2588\u2588\u2588\u2554\u255d \u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u255a\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2554\u255d\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2557\u2588\u2588\u2551  \u2588\u2588\u2551',
      '  \u255a\u2550\u2550\u2550\u255d   \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u255d \u255a\u2550\u2550\u2550\u2550\u2550\u2550\u255d\u255a\u2550\u255d  \u255a\u2550\u255d',
    ].join('\n')));
    console.log('');
    console.log(chalk.hex(RED).bold('  *** Vcoder v2.0') + d('  Intelligent Terminal AI Agent'));
    console.log('');
  }

  renderWelcome(providerInfo) {
    if (this.pet) {
      console.log(chalk.hex(RED)(this.pet.render()));
      console.log(chalk.hex(DIM)('  ' + this.pet.getStatusMessage()));
    }
    console.log('');
    console.log(chalk.hex(RED)('  ' + '='.repeat(60)));
    console.log('');
    if (!providerInfo.configured) {
      console.log(chalk.hex(ORANGE)('  [!] No key for ' + providerInfo.name + ' - type /provider to switch'));
      console.log(chalk.hex(DIM)  ('      Free options: Ollama (no key) | Groq / Gemini (free tier)'));
    } else {
      console.log(chalk.hex(GREEN)('  [v] Connected: ' + providerInfo.name + ' (' + providerInfo.model + ')'));
    }
    console.log('');
    console.log(chalk.hex(DIM)('  Type /help for commands, or just start chatting!'));
    console.log('');
  }

  renderStatusBar(providerInfo, topic = null) {
    const dot  = providerInfo.configured ? chalk.hex(GREEN)('[+]') : chalk.hex(ORANGE)('[!]');
    const name = chalk.hex(WHITE)(providerInfo.name || 'None');
    const model = chalk.hex(DIM)(' | ' + (providerInfo.model || 'none'));
    const topicStr = topic ? chalk.hex(RED)(' | # ' + topic) : '';
    console.log('');
    console.log('  ' + dot + ' ' + name + model + topicStr);
    console.log('');
  }

  renderError(message, details = '') {
    console.log('');
    console.log(chalk.hex(RED)('  +' + '-'.repeat(60) + '+'));
    console.log(chalk.hex(RED)('  |  [x] Error') + ' '.repeat(47) + chalk.hex(RED)('|'));
    console.log(chalk.hex(RED)('  |') + ' '.repeat(62) + chalk.hex(RED)('|'));
    const msgLine = '  |   ' + message;
    console.log(chalk.hex(WHITE)(msgLine.padEnd(63)) + chalk.hex(RED)('|'));
    if (details) {
      console.log(chalk.hex(RED)('  |') + ' '.repeat(62) + chalk.hex(RED)('|'));
      details.split('\n').forEach(line => {
        const dl = '  |   ' + line;
        console.log(chalk.hex(DIM)(dl.padEnd(63)) + chalk.hex(RED)('|'));
      });
    }
    console.log(chalk.hex(RED)('  |') + ' '.repeat(62) + chalk.hex(RED)('|'));
    console.log(chalk.hex(RED)('  +' + '-'.repeat(60) + '+'));
    if (this.pet) console.log(chalk.hex(DIM)('  ' + this.pet.getStatusMessage()));
    console.log('');
  }

  renderSuccess(message) {
    console.log('');
    console.log(chalk.hex(GREEN)('  [v] ' + message));
    console.log('');
  }

  renderWarning(message) {
    console.log('');
    console.log(chalk.hex(ORANGE)('  [!] ' + message));
    console.log('');
  }

  renderInfo(title, content) {
    console.log('');
    console.log(chalk.hex(RED).bold('  >> ' + title));
    console.log(chalk.hex(DIM)('  ' + '-'.repeat(40)));
    content.split('\n').forEach(line => {
      console.log(chalk.hex(WHITE)('  ' + line));
    });
    console.log('');
  }

  renderResponse(content, meta = {}) {
    console.log('');
    const lines = content.split('\n');
    lines.forEach(line => {
      // Code blocks â€” dim
      if (line.startsWith('```') || line.startsWith('    ')) {
        console.log(chalk.hex(DIM)('  ' + line));
      } else if (line.startsWith('#')) {
        console.log(chalk.hex(RED).bold('  ' + line));
      } else {
        console.log(chalk.hex(WHITE)('  ' + line));
      }
    });
    if (meta.model) {
      const tokens = meta.usage?.total_tokens || meta.usage?.totalTokenCount || '';
      console.log('');
      console.log(chalk.hex(DIM)('  -- ' + meta.model.split('/').pop() + (tokens ? ' | ' + tokens + ' tokens' : '')));
    }
    console.log('');
  }

  renderHelp(pluginCommands = {}) {
    console.log('');
    console.log(chalk.hex(RED).bold('  *** Vcoder Commands'));
    console.log(chalk.hex(DIM)('  ' + '-'.repeat(40)));
    console.log('');

    const builtins = [
      ['/help',      'Show this help menu'],
      ['/provider',  'Switch AI provider (asks for API key if needed)'],
      ['/model',     'Switch AI model'],
      ['/providers', 'List all 25 AI providers'],
      ['/topic',     'Show or set current topic'],
      ['/topics',    'List all tracked topics'],
      ['/memory',    'Show memory & style info'],
      ['/clear',     'Clear conversation history'],
      ['/pet',       'Change or interact with your pet'],
      ['/theme',     'Switch terminal theme'],
      ['/plugins',   'List installed plugins'],
      ['/style',     'Show learned user style'],
      ['/export',    'Export conversation'],
      ['/reset',     'Reset all settings'],
      ['/exit',      'Exit Vcoder'],
      ['/read',      'Read file contents'],
      ['/write',     'Write content to a file'],
      ['/ls',        'List directory contents'],
      ['/find',      'Search for files'],
      ['/exec',      'Execute a shell command'],
      ['/shell',     'Open interactive shell mode'],
      ['/git',       'Execute git commands'],
      ['/diff',      'Show git diff'],
      ['/commit',    'Create a git commit'],
      ['/log',       'Show git log'],
      ['/db-connect','Connect to a database'],
      ['/db-query',  'Execute a SQL query'],
      ['/db-schema', 'Show database schema'],
      ['/search',    'Search the web'],
      ['/browse',    'Browse a URL'],
    ];

    builtins.forEach(([cmd, desc]) => {
      console.log('  ' + chalk.hex(RED)(cmd.padEnd(16)) + chalk.hex(DIM)(desc));
    });

    if (Object.keys(pluginCommands).length > 0) {
      console.log('');
      console.log(chalk.hex(RED).bold('  --- Plugin Commands ---'));
      Object.entries(pluginCommands).forEach(([cmd, desc]) => {
        console.log('  ' + chalk.hex(RED)(cmd.padEnd(16)) + chalk.hex(DIM)(desc));
      });
    }

    console.log('');
    console.log(chalk.hex(DIM)('  Type anything else to chat with the AI'));
    console.log('');
  }

  renderGoodbye() {
    if (this.pet) {
      console.log('');
      console.log(chalk.hex(DIM)(this.pet.render()));
    }
    console.log('');
    console.log(chalk.hex(RED)('  Goodbye! Vcoder signing off.'));
    console.log(chalk.hex(DIM)('  Your conversation and memory have been saved.'));
    console.log('');
  }

  getPromptPrefix() {
    return chalk.hex(RED)('  > ');
  }

  renderUserMessage(message) {
    console.log('');
    console.log(chalk.hex('#DC143C')('  You:'));
    message.split('\n').forEach(line => {
      console.log(chalk.hex('#E8E8E8')('  ' + line));
    });
    console.log('');
  }

  renderAssistantMessage(content) {
    console.log('');
    console.log(chalk.hex('#DC143C')('  Vcoder:'));
    const lines = content.split('\n');
    let inCodeBlock = false;
    lines.forEach(line => {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        console.log(chalk.hex('#666666')('  ' + line));
      } else if (inCodeBlock) {
        console.log(chalk.hex('#999999')('  ' + line));
      } else if (line.startsWith('# ')) {
        console.log(chalk.hex('#DC143C').bold('  ' + line));
      } else if (line.startsWith('## ') || line.startsWith('### ')) {
        console.log(chalk.hex('#DC143C')('  ' + line));
      } else if (line.match(/^\s*[-*+] /)) {
        console.log(chalk.hex('#E8E8E8')('  ' + line));
      } else if (line.match(/^\s*\d+\. /)) {
        console.log(chalk.hex('#E8E8E8')('  ' + line));
      } else {
        console.log(chalk.hex('#E8E8E8')('  ' + line));
      }
    });
    console.log('');
  }

  renderClarification(questions) {
    console.log('');
    console.log(chalk.hex('#FF9800')('  [?] Need clarification:'));
    questions.split('\n').forEach(q => {
      if (q.trim()) console.log(chalk.hex('#E8E8E8')('    - ' + q.trim()));
    });
    console.log('');
  }

  startSpinner(message = 'Thinking...') {
    if (this._spinner) return;
    const frames = ['-', '\\', '|', '/'];
    let i = 0;
    process.stdout.write('\n  ');
    this._spinner = setInterval(() => {
      process.stdout.write('\r  ' + chalk.hex('#DC143C')(frames[i % frames.length]) + ' ' + chalk.hex('#666666')(message));
      i++;
    }, 100);
  }

  stopSpinner(success = true, msg = '') {
    if (this._spinner) {
      clearInterval(this._spinner);
      this._spinner = null;
      process.stdout.write('\r' + ' '.repeat(60) + '\r');
    }
  }
}
