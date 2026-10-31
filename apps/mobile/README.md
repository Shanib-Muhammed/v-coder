# V-Coder Mobile (Android-first)

Expo + React Native application for V-Coder. The app is designed Android-first and keeps the architecture portable to iOS.

## Requirements

- Node.js 20.19.4+
- npm
- Expo Go for a quick preview, or an Android emulator/device

## Run locally

```bash
cd apps/mobile
npm install
npx expo start
```

Press `a` to open an Android emulator, or scan the QR code with Expo Go.

## Current milestone

This is the first mobile UI foundation:
- Dark Liquid Glass-inspired design system
- Home, Projects, Editor, Connect and Profile sections
- Prompt composer and starter project cards
- Integration checklist for Google, GitHub, Supabase, Vercel and an AI provider
- Mobile-first navigation and cloud-workspace concept

**Not yet connected:** Authentication, OAuth, provider API calls, cloud sandboxes, persistent projects, real code execution and deployment. The current screen is a frontend foundation, not a functioning coding agent. These require the backend milestones below.

## Planned architecture

- Expo / React Native + TypeScript
- Supabase Auth for V-Coder accounts and Google OAuth
- Supabase Postgres for users, projects, sessions and usage metadata
- Backend provider gateway for BYOK and supported free models
- Durable agent orchestration for long-running autonomous coding tasks
- Isolated cloud sandbox per project for shell, package installation and preview
- GitHub OAuth/API for repository operations
- Vercel API for deployments

## Security requirements

- Never ship provider keys, GitHub tokens, Supabase service-role keys or Vercel tokens in the mobile bundle.
- Store OAuth credentials server-side in encrypted secret storage.
- Run generated code only in isolated sandboxes with resource limits and network controls.
- Require explicit confirmation for destructive operations, public deployments and secret access.
- Keep audit events for tool calls and agent actions.

## Roadmap

1. Mobile foundation (this milestone)
2. Supabase schema, Google sign-in and onboarding connection state
3. Provider registry, BYOK vault and free-model discovery
4. Agent runtime, task queue and sandbox lifecycle
5. File tree, terminal streaming and live preview
6. GitHub repository sync and Vercel deployment
7. Evals, abuse controls, telemetry and Android release pipeline
