// ═══════════════════════════════════════════════════════════════
//  VCODER PLUGIN SYSTEM — Extensible Plugin Architecture
//  Connect databases, tools, services, and custom extensions
// ═══════════════════════════════════════════════════════════════

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export class PluginManager {
  constructor(pluginDir = '.vcoder/plugins') {
    this.pluginDir = pluginDir;
    this.plugins = new Map();
    this.hooks = new Map();
  }

  // ── Plugin Registration ────────────────────────────────────
  register(plugin) {
    if (!plugin.name || !plugin.version) {
      throw new Error('Plugin must have a name and version.');
    }

    this.plugins.set(plugin.name, {
      ...plugin,
      enabled: true,
      registeredAt: new Date().toISOString(),
    });

    // Register hooks
    if (plugin.hooks) {
      for (const [hookName, handler] of Object.entries(plugin.hooks)) {
        if (!this.hooks.has(hookName)) {
          this.hooks.set(hookName, []);
        }
        this.hooks.get(hookName).push({
          pluginName: plugin.name,
          handler,
        });
      }
    }

    return true;
  }

  unregister(pluginName) {
    this.plugins.delete(pluginName);
    // Remove associated hooks
    for (const [hookName, handlers] of this.hooks.entries()) {
      this.hooks.set(hookName, handlers.filter(h => h.pluginName !== pluginName));
    }
  }

  // ── Hook System ────────────────────────────────────────────
  async executeHook(hookName, context = {}) {
    const handlers = this.hooks.get(hookName) || [];
    const results = [];

    for (const { pluginName, handler } of handlers) {
      try {
        const result = await handler(context);
        results.push({ pluginName, result, success: true });
      } catch (error) {
        results.push({ pluginName, error: error.message, success: false });
      }
    }

    return results;
  }

  // ── Built-in Plugin Templates ──────────────────────────────
  static getBuiltinPlugins() {
    return {
      fileSystem: {
        name: 'file-system',
        version: '1.0.0',
        description: 'Read, write, and manage files in the workspace',
        commands: {
          '/read': 'Read file contents',
          '/write': 'Write content to a file',
          '/ls': 'List directory contents',
          '/find': 'Search for files by pattern',
        },
        hooks: {
          'before:chat': async (ctx) => {
            // Could inject file context into the prompt
            return ctx;
          },
        },
      },
      shell: {
        name: 'shell',
        version: '1.0.0',
        description: 'Execute shell commands safely',
        commands: {
          '/exec': 'Execute a shell command',
          '/shell': 'Open interactive shell mode',
        },
      },
      git: {
        name: 'git',
        version: '1.0.0',
        description: 'Git version control integration',
        commands: {
          '/git': 'Execute git commands',
          '/diff': 'Show git diff',
          '/commit': 'Create a git commit',
          '/log': 'Show git log',
        },
      },
      database: {
        name: 'database',
        version: '1.0.0',
        description: 'Connect to and query databases (SQLite, PostgreSQL, MySQL)',
        commands: {
          '/db-connect': 'Connect to a database',
          '/db-query': 'Execute a SQL query',
          '/db-schema': 'Show database schema',
        },
      },
      search: {
        name: 'web-search',
        version: '1.0.0',
        description: 'Search the web for information',
        commands: {
          '/search': 'Search the web',
          '/browse': 'Browse a URL',
        },
      },
    };
  }

  // ── Plugin Discovery ───────────────────────────────────────
  async discoverPlugins() {
    const discovered = [];

    try {
      if (existsSync(this.pluginDir)) {
        const entries = readdirSync(this.pluginDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const manifestPath = join(this.pluginDir, entry.name, 'plugin.json');
            if (existsSync(manifestPath)) {
              try {
                const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
                discovered.push({ ...manifest, path: join(this.pluginDir, entry.name) });
              } catch (e) { /* skip invalid plugins */ }
            }
          }
        }
      }
    } catch (e) { /* silent */ }

    return discovered;
  }

  // ── Status ─────────────────────────────────────────────────
  listPlugins() {
    return Array.from(this.plugins.entries()).map(([name, plugin]) => ({
      name,
      version: plugin.version,
      description: plugin.description,
      enabled: plugin.enabled,
      commands: plugin.commands ? Object.keys(plugin.commands) : [],
    }));
  }

  getPlugin(name) {
    return this.plugins.get(name);
  }

  enablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) plugin.enabled = true;
  }

  disablePlugin(name) {
    const plugin = this.plugins.get(name);
    if (plugin) plugin.enabled = false;
  }

  getAllCommands() {
    const commands = {};
    for (const [, plugin] of this.plugins) {
      if (plugin.enabled && plugin.commands) {
        Object.assign(commands, plugin.commands);
      }
    }
    return commands;
  }
}

export default PluginManager;
