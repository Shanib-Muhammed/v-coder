# V-Coder — Intelligent Terminal AI Agent

```
 __   __       ___  ___  ____  ___  ____
 \ \ / /      / __\/ _ \|  _ \| __||  _ \
  \ V /  ___  | |  | | | | | | | _| | |_) |
   \_/  |___| | |__| |_| | |_| | |___\  __/
               \____\___/|____/|____| |_|
```

> **V-Coder** is a full-featured AI coding assistant that lives in your terminal.
> Connect to 25+ AI providers (including many free ones), chat, write code, manage files — all from a beautiful full-screen terminal UI.

---

## Features

- **Full-screen TUI** — OpenCode-style interface with tabs, status bar, and clean input area
- **25+ AI Providers** — OpenRouter, Groq, Gemini, Anthropic, OpenAI, Mistral, Cerebras, Ollama, and more
- **Free models** — Many providers have free tiers (no credit card needed)
- **Web Dashboard** — Beautiful web UI at `localhost:3000`
- **Multi-tab sessions** — Multiple chat sessions in one terminal
- **Memory system** — Remembers your coding style, topics, and preferences
- **Plugin system** — Extend with custom commands
- **Blood red theme** — Stunning dark red aesthetic

---

## Quick Start

### Requirements
- [Node.js](https://nodejs.org/) 18 or newer
- An API key from any supported provider (or [Ollama](https://ollama.com/) for fully local use)

### 1. Clone and install
```bash
git clone https://github.com/Shanib-Muhammed/v-coder.git
cd v-coder
npm install
npm link
```

### 2. Start V-Coder
```bash
vcoder
```
The first run opens a setup wizard to pick a provider and save your API key.

### 3. Web dashboard (optional)
```bash
vcoder dashboard
```
Opens at [http://localhost:3000](http://localhost:3000).

---

## Terminal Commands

| Command | Description |
|---------|-------------|
| `/help` | Show all commands |
| `/provider X` | Switch to provider X |
| `/providers` | List all 25 AI providers |
| `/model X` | Switch AI model |
| `/clear` | Clear current session |
| `/exit` | Exit V-Coder |

## Keyboard Shortcuts (Terminal UI)

| Key | Action |
|-----|--------|
| `Ctrl+T` | Open new tab (new chat session) |
| `Ctrl+W` | Close current tab |
| `Alt+1-9` | Switch to tab by number |
| `Ctrl+C` | Exit V-Coder |
| `Enter` | Send message |
| `Backspace` | Delete character |

---

## AI Providers

### FREE (no credit card needed)
| Provider | Free Models |
|----------|-------------|
| **Ollama** | Any local model (no internet needed) |
| **OpenRouter** | Many `:free` models including Llama 3.3 70B |
| **Groq** | Llama 3.3, Mixtral (fast!) |
| **Google Gemini** | Gemini 1.5 Flash |
| **Cerebras** | Llama 3.1 70B |
| **Mistral** | Mistral Tiny |

### PAID (with API key)
| Provider | Models |
|----------|--------|
| **OpenAI** | GPT-4o, GPT-4 Turbo |
| **Anthropic** | Claude 3.5 Sonnet |
| **Cohere** | Command R+ |
| **Together AI** | 50+ open models |
| ... and 15+ more |

---

## Setup API Keys

Add API keys to your `.env` file in the vcoder folder:

```env
OPENROUTER_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
```

Get free API keys:
- **OpenRouter**: https://openrouter.ai (best free option — many models)
- **Groq**: https://console.groq.com (fastest free inference)
- **Gemini**: https://aistudio.google.com
- **Cerebras**: https://cloud.cerebras.ai

---

## Web Dashboard

Run `vcoder dashboard` to open the web interface at `http://localhost:3000`

Features:
- Chat with AI in browser
- Switch providers and models
- View memory and conversation history
- Manage settings

---

## Project Structure

```
vcoder/
  bin/
    vcoder.js          # CLI entry point
  src/
    ui/
      tui.js           # Full-screen terminal TUI
    dashboard/
      server.js        # Express web server
      public/
        index.html     # Dashboard UI
        style.css      # Blood red theme
        app.js         # Dashboard logic
    core/
      agent.js         # AI agent engine
      commands.js      # Command handler
    providers/
      manager.js       # Provider management
    memory/
      engine.js        # Memory & style learning
    plugins/
      manager.js       # Plugin system
  config/
    default.json       # Provider configuration
  .env                 # API keys (create this)
  package.json
```

---

## Requirements

- **Node.js** v18+ (v22 recommended)
- **npm** v8+
- **Windows / macOS / Linux**
- A terminal that supports ANSI colors (PowerShell, Windows Terminal, iTerm2, etc.)

---

## Tips

- Type `/providers` to see all 25 providers with their status
- Use `Ctrl+T` to open multiple chat sessions (tabs) at once
- The memory system learns your coding style over time
- Run `vcoder dashboard` for a nice web UI if you prefer browser
- Ollama (local AI) works with no internet and no API key

---

## License

MIT License — Free to use, modify, and distribute.

---

*Built with* ❤️ *and* 🩸 *— V-Coder Team*