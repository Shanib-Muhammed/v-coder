// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  VCODER WEB DASHBOARD SERVER
//  Can be run standalone: vcoder dashboard
//  Or forked by vcoder (auto-start mode)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..', '..');

dotenv.config({ path: join(ROOT, '.env') });

const PORT = parseInt(process.env.VCODER_DASHBOARD_PORT || '3000', 10);

// â”€â”€ Load config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
let config = {};
try {
  const cp = join(ROOT, 'config', 'default.json');
  if (existsSync(cp)) config = JSON.parse(readFileSync(cp, 'utf-8'));
} catch (e) {}

// â”€â”€ Import core modules â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { ProviderManager } from '../providers/manager.js';
import { MemoryEngine }    from '../memory/engine.js';
import { AgentEngine }     from '../core/agent.js';
import { PluginManager }   from '../plugins/manager.js';

const providerManager = new ProviderManager(config);
const memory          = new MemoryEngine(config.memory?.longTermMemoryPath || '.vcoder/memory');
const pluginManager   = new PluginManager(config.plugins?.directory || '.vcoder/plugins');
const agent           = new AgentEngine(providerManager, memory, pluginManager);

// â”€â”€ Express app â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const app    = express();
const server = createServer(app);
const wss    = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// â”€â”€ API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
app.get('/api/status', (req, res) => {
  res.json({
    version: '2.0.0',
    provider: providerManager.getProviderInfo(),
    providers: providerManager.listProviders(),
    topic: memory.getCurrentTopic(),
    topics: memory.getActiveTopics(),
    style: memory.userStyle,
    sessionMessages: memory.conversations.length,
    memories: memory.longTermMemory?.length || 0,
    config: { pet: config.pet, theme: config.ui?.theme },
  });
});

app.get('/api/providers', (req, res) => {
  const list = providerManager.listProviders();
  const info = providerManager.getProviderInfo();
  const obj  = {};
  (list||[]).forEach(p => { obj[p.key||p.id||p.name] = p; });
  res.json({ providers: obj, active: info?.key || info?.id || '' });
});

app.post('/api/provider', (req, res) => {
  const { provider, model } = req.body;
  if (providerManager.setActiveProvider(provider)) {
    if (model) providerManager.setModel(model);
    res.json({ success: true, provider: providerManager.getProviderInfo() });
  } else {
    res.status(400).json({ error: `Unknown provider: ${provider}` });
  }
});

app.get('/api/history', (req, res) => {
  res.json(memory.getRecentMessages?.(50) || memory.conversations?.slice(-50) || []);
});

// Save API key to .env and reload
app.post('/api/save-key', async (req, res) => {
  const { provider, envVar, apiKey } = req.body;
  if (!envVar || !apiKey) return res.status(400).json({ error: 'Missing envVar or apiKey' });
  try {
    const envPath = join(ROOT, '.env');
    const { readFileSync: rf, writeFileSync: wf, existsSync: ex } = await import('fs');
    let content = ex(envPath) ? rf(envPath, 'utf-8') : '';
    // Remove existing line for this var
    const lines = content.split('\n').filter(l => !l.startsWith(envVar + '='));
    lines.push(envVar + '=' + apiKey);
    wf(envPath, lines.join('\n'), 'utf-8');
    // Set in process.env right now
    process.env[envVar] = apiKey;
    // Re-init provider manager to pick up new key
    providerManager.reloadEnv?.();
    res.json({ success: true });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

// Get models for a specific provider
app.get('/api/models/:provider', (req, res) => {
  const list = providerManager.listProviders();
  const prov = list.find(p => p.key === req.params.provider || p.id === req.params.provider || p.name === req.params.provider);
  res.json({ models: prov?.models || [], current: prov?.model || '' });
});

app.get('/api/memory', (req, res) => {
  res.json({
    topics:    memory.getActiveTopics?.() || [],
    style:     memory.getStyleContext?.() || null,
    memories:  memory.recall?.() || [],
    sessionCount: memory.conversations?.length || 0,
  });
});

// â”€â”€ WebSocket â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'Connected to Vcoder v2.0' }));

  ws.on('message', async (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type !== 'chat') return;

      try {
        const result = await agent.processMessage(msg.content);
        if (result.type === 'response') {
          const tok = result.usage?.total_tokens || result.usage?.totalTokenCount || 0;
          ws.send(JSON.stringify({ type: 'response', content: result.content, usage: result.usage, model: result.model, tokens: tok }));
        } else if (result.type === 'clarification') {
          ws.send(JSON.stringify({ type: 'clarification', questions: result.questions }));
        } else {
          ws.send(JSON.stringify({ type: 'error', message: result.message || 'Unknown error' }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: err.message }));
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
    }
  });
});

// â”€â”€ Start â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export async function startDashboard() {
  return new Promise((resolve) => {
    server.listen(PORT, async () => {
      const chalk = (await import('chalk')).default;
      const red   = chalk.hex('#DC143C');
      const dim   = chalk.hex('#666666');
      const white = chalk.hex('#E8E8E8');
      const green = chalk.hex('#4CAF50');

      console.log('');
      console.log(red.bold('  âš¡ Vcoder Dashboard'));
      console.log(dim('  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•'));
      console.log(white('  URL   : ') + red.underline(`http://localhost:${PORT}`));
      console.log(white('  Status: ') + green('Running'));
      console.log(dim('  Press Ctrl+C to stop'));
      console.log('');

      // Auto-open browser
      try {
        const { default: open } = await import('open');
        await open(`http://localhost:${PORT}`);
      } catch (e) { /* ignore */ }

      resolve();
    });
  });
}

// â”€â”€ If run directly: node src/dashboard/server.js â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const isMain = process.argv[1] &&
  (fileURLToPath(import.meta.url) === process.argv[1] ||
   process.argv[1].endsWith('server.js'));

if (isMain) {
  startDashboard().catch(err => {
    console.error('Dashboard failed:', err.message);
    process.exit(1);
  });
}

export default { startDashboard };
