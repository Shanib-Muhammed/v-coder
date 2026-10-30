#!/usr/bin/env node
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { existsSync }    from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname  = dirname(__filename);
const ROOT       = join(__dirname, '..');
const args       = process.argv.slice(2);
const command    = args[0] || 'chat';

// Convert Windows path -> file:// URL for ESM dynamic imports
function toURL(p) { return pathToFileURL(p).href; }

function setupNeeded() {
  const marker  = join(ROOT, '.vcoder', '.setup-complete');
  const envFile = join(ROOT, '.env');
  return !existsSync(marker) && !existsSync(envFile);
}

async function main() {

  // â”€â”€ DASHBOARD ONLY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (['dashboard','dash','web','ui'].includes(command)) {
    const { startDashboard } = await import(toURL(join(ROOT, 'src', 'dashboard', 'server.js')));
    await startDashboard();
    return;
  }

  // â”€â”€ FORCE SETUP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (['onboard','setup'].includes(command)) {
    const { unlinkSync, existsSync: ex } = await import('fs');
    const marker = join(ROOT, '.vcoder', '.setup-complete');
    if (ex(marker)) unlinkSync(marker);
    const { runSetupWizard } = await import(toURL(join(ROOT, 'src', 'core', 'setup.js')));
    await runSetupWizard(ROOT);
    return;
  }

  // â”€â”€ STATUS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (command === 'status') {
    const dotenv = await import('dotenv');
    dotenv.config({ path: join(ROOT, '.env') });
    const { readFileSync, existsSync: ex } = await import('fs');
    const chalk  = (await import('chalk')).default;
    const red    = chalk.hex('#DC143C');
    const dim    = chalk.hex('#666666');
    const white  = chalk.hex('#E8E8E8');
    const green  = chalk.hex('#4CAF50');
    const cp     = join(ROOT, 'config', 'default.json');
    console.log('');
    console.log(red.bold('  âš¡ Vcoder Status'));
    console.log(dim('  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•'));
    if (ex(cp)) {
      const cfg     = JSON.parse(readFileSync(cp, 'utf-8'));
      const provKey = cfg.activeProvider || 'groq';
      const prov    = cfg.providers?.[provKey] || {};
      const hasKey  = !prov.apiKeyEnv || !!process.env[prov.apiKeyEnv];
      console.log(red('  Provider  : ') + white(prov.name || provKey) + (hasKey ? green(' âœ”') : dim(' âœ– no key')));
      console.log(red('  Theme     : ') + white('Blood Red ðŸ©¸'));
      console.log(red('  Pet       : ') + white(`${cfg.pet?.name || 'Pixel'} (${cfg.pet?.type || 'fox'})`));
      console.log(red('  Dashboard : ') + white('vcoder dashboard  â†’  http://localhost:3000'));
      console.log(red('  Setup     : ') + (setupNeeded() ? dim('Pending â€” run vcoder') : green('Complete âœ”')));
    } else {
      console.log(dim('  Not configured. Run: vcoder'));
    }
    console.log('');
    return;
  }

  // â”€â”€ PROVIDERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (command === 'providers') {
    const dotenv = await import('dotenv');
    dotenv.config({ path: join(ROOT, '.env') });
    const { readFileSync, existsSync: ex } = await import('fs');
    const chalk  = (await import('chalk')).default;
    const red    = chalk.hex('#DC143C');
    const dim    = chalk.hex('#666666');
    const white  = chalk.hex('#E8E8E8');
    const green  = chalk.hex('#4CAF50');
    const orange = chalk.hex('#FF9800');
    const cp     = join(ROOT, 'config', 'default.json');
    if (!ex(cp)) { console.log('  Run vcoder first.'); return; }
    const cfg       = JSON.parse(readFileSync(cp, 'utf-8'));
    const providers = cfg.providers || {};
    const activeKey = cfg.activeProvider || 'groq';
    console.log('');
    console.log(red.bold('  âš¡ All AI Providers â€” Vcoder v2.0'));
    console.log(dim('  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•'));
    for (const [key, p] of Object.entries(providers)) {
      const hasKey    = !p.apiKeyEnv || !!process.env[p.apiKeyEnv];
      const freeLabel = p.free ? green('[FREE]') : orange('[PAID]');
      const status    = hasKey ? green('âœ”') : dim('âœ–');
      const active    = key === activeKey ? red(' â—€ ACTIVE') : '';
      console.log(`  ${status} ${white((p.name||key).padEnd(22))} ${freeLabel}${active}`);
      if (p.freeNote) console.log(dim(`      â”” ${p.freeNote}`));
    }
    const freeCount = Object.values(providers).filter(p => p.free).length;
    console.log(dim('  â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•'));
    console.log(green(`  ${freeCount} FREE`) + white(` â€¢ ${Object.keys(providers).length} total providers`));
    console.log('');
    return;
  }

  // â”€â”€ HELP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (['help','--help','-h'].includes(command)) {
    const chalk = (await import('chalk')).default;
    const red   = chalk.hex('#DC143C');
    const white = chalk.hex('#E8E8E8');
    const dim   = chalk.hex('#666666');
    console.log('');
    console.log(red.bold('  âš¡ Vcoder v2.0'));
    console.log('');
    console.log(white('  Usage:'));
    console.log(`  ${red('vcoder')}              ${dim('Terminal chat (first-time setup runs once)')}`);
    console.log(`  ${red('vcoder dashboard')}    ${dim('Open web dashboard â†’ http://localhost:3000')}`);
    console.log(`  ${red('vcoder onboard')}      ${dim('Re-run setup wizard')}`);
    console.log(`  ${red('vcoder status')}       ${dim('Show current config')}`);
    console.log(`  ${red('vcoder providers')}    ${dim('List all 25 AI providers')}`);
    console.log('');
    return;
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  //  TERMINAL CHAT  (default: vcoder with no args)
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const dotenv = await import('dotenv');
  dotenv.config({ path: join(ROOT, '.env') });

  // First-time setup â€” runs ONCE, never again
  if (setupNeeded()) {
    const { runSetupWizard } = await import(toURL(join(ROOT, 'src', 'core', 'setup.js')));
    await runSetupWizard(ROOT);
    dotenv.config({ path: join(ROOT, '.env'), override: true });
  }

  // Launch terminal chat
  const { startTUI } = await import(toURL(join(ROOT, 'src', 'ui', 'tui.js'))); await startTUI();
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});