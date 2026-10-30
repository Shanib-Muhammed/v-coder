// V-CODER TUI v6 â€” Full-screen terminal AI agent (figlet logo)
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import readline from 'readline';
import figlet from 'figlet';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..', '..');
dotenv.config({ path: join(ROOT, '.env') });

// â”€â”€ ANSI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const A = {
  res : '\x1b[0m',   bold: '\x1b[1m',
  red : '\x1b[38;2;220;20;60m',   bred: '\x1b[38;2;255;60;80m',
  dred: '\x1b[38;2;120;10;25m',   wht : '\x1b[38;2;225;225;225m',
  gry : '\x1b[38;2;100;100;100m', lgry: '\x1b[38;2;155;155;155m',
  grn : '\x1b[38;2;80;200;90m',   org : '\x1b[38;2;255;155;0m',
  bgs : '\x1b[48;2;16;4;4m',      bgt : '\x1b[48;2;44;5;10m',
};
const W   = () => Math.max(50, process.stdout.columns || 100);
const H   = () => Math.max(14, process.stdout.rows    || 30);
const at  = (r,c) => `\x1b[${r};${c}H`;
const clr = () => '\x1b[2K';
const wr  = (s) => process.stdout.write(s);
const altOn  = () => wr('\x1b[?1049h\x1b[2J\x1b[H');
const altOff = () => wr('\x1b[?1049l');

// â”€â”€ Generate logo using figlet â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const LOGO_LINES = figlet.textSync('V-CODER', { font: 'ANSI Shadow' })
  .split('\n').filter((l, i, arr) => i < arr.length - 1); // remove trailing blank

// â”€â”€ State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const sessions   = [{ name: 'main', messages: [], totalTokens: 0 }];
let tabIdx       = 0;
let inputBuf     = '';
let isLoading    = false;
let loadTimer    = null;
let elapsedSec   = 0;
let providerInfo = { name: 'None', model: 'none', configured: false };
let systems      = null;
const cur        = () => sessions[tabIdx];

// â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function render() {
  const w = W(), h = H();
  const B = [];
  const L = (r, txt) => B.push(at(r,1) + clr() + txt);

  // 1. TAB BAR
  let tabs = A.bgs;
  sessions.forEach((s, i) => {
    tabs += i === tabIdx
      ? A.bgt + A.red + A.bold + ` \u25b6 ${s.name} ` + A.res + A.bgs + A.gry + '\u2502'
      : A.bgs + A.gry + `  ${s.name}  \u2502`;
  });
  tabs += A.gry + '  + New tab (Ctrl+T)  |  Switch: Alt+1-9' + A.res;
  L(1, tabs);

  // 2. TOP DIVIDER
  L(2, A.dred + '\u2500'.repeat(w) + A.res);

  // 3. CHAT AREA
  const cTop = 3, cBot = h - 4;
  for (let r = cTop; r <= cBot; r++) B.push(at(r,1)+clr());

  const msgs = cur().messages;
  if (msgs.length === 0) {
    // Center logo
    const logoW  = Math.max(...LOGO_LINES.map(l=>l.length));
    const padL   = Math.max(0, Math.floor((w - logoW) / 2));
    const space  = cBot - cTop;
    const midRow = cTop + Math.max(0, Math.floor((space - LOGO_LINES.length - 3) / 2));
    LOGO_LINES.forEach((l, i) => {
      B.push(at(midRow+i, 1) + clr() + ' '.repeat(padL) + A.red + A.bold + l + A.res);
    });
    const r2 = midRow + LOGO_LINES.length + 1;
    const r3 = r2 + 1;
    if (r2 <= cBot) B.push(at(r2,1)+clr()+' '.repeat(padL)+A.gry+'v2.0  Intelligent Terminal AI Agent'+A.res);
    if (r3 <= cBot) B.push(at(r3,1)+clr()+' '.repeat(padL)+A.gry+'Type anything to start  |  /help for commands'+A.res);
  } else {
    // Render messages, auto-scroll to bottom
    const rowsFor = m => m.content.split('\n').length + 2;
    let total = 0, si = msgs.length - 1;
    while (si >= 0 && total + rowsFor(msgs[si]) <= cBot - cTop + 1) {
      total += rowsFor(msgs[si--]);
    }
    si = Math.max(0, si + 1);
    let row = cTop;
    for (let mi = si; mi < msgs.length && row <= cBot; mi++) {
      const m = msgs[mi];
      if (m.role === 'user') {
        B.push(at(row++,1)+clr()+'  '+A.red+A.bold+'You'+A.res);
        for (const l of m.content.split('\n')) {
          if (row > cBot) break;
          B.push(at(row++,1)+clr()+'  '+A.wht+l+A.res);
        }
      } else {
        const mStr = m.model  ? A.gry+'  '+m.model.split('/').pop().slice(0,26)+A.res : '';
        const tStr = m.tokens ? A.gry+'  \u25b8 '+m.tokens+' tokens'+A.res : '';
        B.push(at(row++,1)+clr()+'  '+A.bred+A.bold+'V-Coder'+A.res+mStr+tStr);
        let inCode = false;
        for (const l of m.content.split('\n')) {
          if (row > cBot) break;
          if      (l.startsWith('```'))  { inCode=!inCode; B.push(at(row++,1)+clr()+'  '+A.gry+l+A.res); }
          else if (inCode)               B.push(at(row++,1)+clr()+'  '+A.lgry+l+A.res);
          else if (l.startsWith('# '))   B.push(at(row++,1)+clr()+'  '+A.red+A.bold+l+A.res);
          else                           B.push(at(row++,1)+clr()+'  '+A.wht+l+A.res);
        }
      }
      if (row <= cBot) B.push(at(row++,1)+clr());
    }
  }

  // 4. STATUS BAR
  const model  = (providerInfo.model||'none').split('/').pop().slice(0,30);
  const dot    = providerInfo.configured ? A.grn+'\u2605' : A.org+'\u26a0';
  const totTok = cur().totalTokens;
  const tokD   = totTok > 0 ? A.gry+' \u2502 '+totTok+' tokens'+A.res : '';
  const bar    = isLoading
    ? A.org+'[\u2588\u2588\u2588\u2591\u2591\u2591\u2591\u2591\u2591\u2591]'+A.res
    : A.gry+'[\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591\u2591]'+A.res;
  const elStr  = isLoading ? A.org+elapsedSec+'s'+A.res : A.gry+'0s'+A.res;
  L(h-3, A.dred+'\u2500'.repeat(w)+A.res);
  L(h-2, ' '+dot+A.res+' '+A.red+'\u2614'+A.res+' '+A.wht+model+A.res+
         A.gry+' \u2502 ctx -- \u2502 '+A.res+bar+A.gry+' \u2502 \u23f2 '+A.res+elStr+tokD);

  // 5. INPUT
  L(h-1, A.dred+'\u2500'.repeat(w)+A.res);
  const hint = isLoading
    ? ' '+A.org+'Thinking...'+A.res
    : ' '+A.gry+'Type /help  |  Ctrl+T new tab  |  Ctrl+W close  |  Ctrl+C exit'+A.res;
  L(h, ' '+A.red+'\u276f '+A.res+A.wht+inputBuf+A.res+hint);

  B.push(at(h, 3+inputBuf.length));
  B.push('\x1b[?25h');
  wr(B.join(''));
}

// â”€â”€ Commands â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function submitInput(raw) {
  const input = raw.trim();
  if (!input) { render(); return; }
  const { pm, agent } = systems;

  const push = (content) => { cur().messages.push({ role:'assistant', content }); render(); };

  if (input==='/exit'||input==='/quit') { altOff(); wr('\n'+A.red+'Goodbye!\n\n'+A.res); process.exit(0); }
  if (input==='/clear') { cur().messages=[]; cur().totalTokens=0; render(); return; }
  if (input==='/help') { push(
    'V-Coder Commands:\n'+
    '  /clear        Clear this session\n'+
    '  /providers    List all 25 AI providers\n'+
    '  /provider X   Switch to provider X\n'+
    '  /model        List models\n'+
    '  /model X      Switch model\n'+
    '  /exit         Exit V-Coder\n\n'+
    'Keys:\n'+
    '  Ctrl+T    New tab      Ctrl+W   Close tab\n'+
    '  Alt+1-9   Switch tab   Ctrl+C   Exit'
  ); return; }
  if (input==='/providers') {
    push('All AI Providers:\n' + pm.listProviders().map(p=>
      '  '+(p.configured?'[v]':'[ ]')+' '+(p.name||p.key).padEnd(22)+(p.free?' FREE':'PAID')+(p.active?'  <-- ACTIVE':'')
    ).join('\n')); return;
  }
  if (input.startsWith('/provider ')) {
    const key = input.split(' ')[1];
    if (pm.setActiveProvider(key)) {
      try { const cp=join(ROOT,'config','default.json'); const c2=JSON.parse(readFileSync(cp,'utf-8')); c2.activeProvider=key; writeFileSync(cp,JSON.stringify(c2,null,2),'utf-8'); } catch(e){}
      providerInfo = pm.getProviderInfo();
      push('[v] Switched to '+providerInfo.name+' ('+providerInfo.model+')');
    } else push('[x] Unknown provider: '+key+'. See /providers');
    return;
  }
  if (input.startsWith('/model')) {
    const parts = input.split(' ');
    if (parts[1]) {
      if (typeof pm.setModel==='function') pm.setModel(parts[1]);
      providerInfo = pm.getProviderInfo();
      push('[v] Model: '+parts[1]);
    } else {
      const mods = typeof pm.getAvailableModels==='function' ? pm.getAvailableModels() : [];
      push('Models for '+providerInfo.name+':\n'+(mods.length?mods.map(m=>'  '+m).join('\n'):'  /model <name>')+'\nUsage: /model <name>');
    }
    return;
  }

  // Chat
  cur().messages.push({ role:'user', content:input });
  isLoading=true; elapsedSec=0;
  const t0=Date.now();
  loadTimer=setInterval(()=>{ elapsedSec=Math.floor((Date.now()-t0)/1000); render(); },400);
  render();
  try {
    const r = await agent.processMessage(input);
    clearInterval(loadTimer); isLoading=false;
    if (r.type==='response') {
      const tok=r.usage?.total_tokens||r.usage?.totalTokenCount||0;
      cur().totalTokens+=tok;
      cur().messages.push({ role:'assistant', content:r.content, model:r.model, tokens:tok||null });
    } else if (r.type==='clarification') {
      cur().messages.push({ role:'assistant', content:'Need clarification:\n'+(r.questions||[]).join('\n') });
    } else {
      cur().messages.push({ role:'assistant', content:'[!] '+(r.message||'Error') });
    }
  } catch(err) {
    clearInterval(loadTimer); isLoading=false;
    cur().messages.push({ role:'assistant', content:'[x] Error: '+err.message });
  }
  render();
}

// â”€â”€ Keyboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function setupKeys() {
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  } else {
    // Not a real terminal — use readline line-by-line fallback
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
    rl.on('line', async (line) => { inputBuf = ''; await submitInput(line); });
    rl.on('close', () => { altOff(); process.exit(0); });
    return; // skip raw key handler
  }
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', async (key) => {
    if (key==='\u0003') { altOff(); wr('\n'+A.red+'Goodbye!\n\n'+A.res); process.exit(0); }
    if (key==='\u0014') { sessions.push({ name:'chat'+sessions.length, messages:[], totalTokens:0 }); tabIdx=sessions.length-1; render(); return; }
    if (key==='\u0017') { if (sessions.length>1){sessions.splice(tabIdx,1);tabIdx=Math.min(tabIdx,sessions.length-1);}else{cur().messages=[];cur().totalTokens=0;} render(); return; }
    if (key.length===2&&key[0]==='\x1b'){ const n=parseInt(key[1]); if(!isNaN(n)&&n>=1&&n<=sessions.length){tabIdx=n-1;render();return;} }
    if (key==='\r'||key==='\n') { const l=inputBuf; inputBuf=''; if(!isLoading) await submitInput(l); return; }
    if (key==='\x7f'||key==='\b') { if(inputBuf.length>0){inputBuf=inputBuf.slice(0,-1);render();} return; }
    if (key.startsWith('\x1b')) return;
    if (!isLoading&&key>=' ') { inputBuf+=key; render(); }
  });
}

// â”€â”€ Load â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function loadSystems() {
  const cfg = JSON.parse(readFileSync(join(ROOT,'config','default.json'),'utf-8'));
  const { ProviderManager } = await import(pathToFileURL(join(ROOT,'src','providers','manager.js')).href);
  const { MemoryEngine }    = await import(pathToFileURL(join(ROOT,'src','memory','engine.js')).href);
  const { AgentEngine }     = await import(pathToFileURL(join(ROOT,'src','core','agent.js')).href);
  const { PluginManager }   = await import(pathToFileURL(join(ROOT,'src','plugins','manager.js')).href);
  const pm    = new ProviderManager(cfg);
  const mem   = new MemoryEngine(cfg.memory?.longTermMemoryPath||'.vcoder/memory');
  const plug  = new PluginManager(cfg.plugins?.directory||'.vcoder/plugins');
  const agent = new AgentEngine(pm, mem, plug);
  providerInfo = pm.getProviderInfo();
  return { pm, mem, plug, agent };
}

export async function startTUI() {
  systems = await loadSystems();
  altOn();
  // Keepalive — prevent node from exiting while waiting for input
  const keepAlive = setInterval(() => {}, 60000);
  process.stdout.on('resize', render);
  setupKeys();
  render();
}
export default { startTUI };