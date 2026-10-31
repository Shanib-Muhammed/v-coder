# V-Coder Android implementation plan

## Product decisions

- Android first; keep Expo/React Native code portable to iOS.
- Cloud execution only. The phone is the control surface, never the code execution host.
- Autonomous agent with approval gates for destructive or externally visible actions.
- Public source repository.
- Full-stack web applications as the initial builder target.
- No V-Coder subscription requirement. Users may bring API keys or use genuinely free provider quotas. Cloud compute and third-party API usage are not magically free.

## System architecture

```
Android app (Expo)
  | HTTPS + streaming events
  v
V-Coder API / Auth middleware
  |-- Supabase Auth (Google identity)
  |-- Project/session service (Postgres)
  |-- Provider gateway (BYOK + free model catalog)
  |-- Durable agent orchestrator
  |     |-- planner / task state
  |     |-- tool policy + approval gate
  |     |-- sandbox manager
  |     |-- browser test runner
  |     '-- event stream
  |-- GitHub integration
  |-- Supabase project integration
  '-- Vercel deployment integration

Per-project isolated cloud sandbox:
  workspace files + terminal + package manager + dev server + preview URL
```

## Required onboarding gates

A user can browse the app before setup, but cannot start a build until all five required items are complete:

1. Google account authenticated with V-Coder.
2. GitHub connected by OAuth.
3. Supabase connected by OAuth/API credentials supported by the integration.
4. Vercel connected by OAuth.
5. At least one AI provider configured (BYOK or supported free model).

Connection status must be persisted server-side and revalidated before sensitive operations. Never treat a UI toggle as proof of authorization.

## Milestones and acceptance criteria

### M0 — Android app foundation
- Expo Router app, TypeScript strict mode.
- Home, Projects, Editor, Connect and Profile surfaces.
- Prompt composer, navigation and empty/loading/error states.
- Android build and device smoke test.

### M1 — Identity and onboarding
- Supabase Auth Google OAuth using PKCE and deep links.
- Server-side profile provisioning and session refresh.
- Connection checklist with real provider status.
- Disconnect/revoke flows and clear error handling.

### M2 — AI provider gateway
- Provider adapter interface with model discovery, chat/stream, tool-call normalization and usage metadata.
- BYOK secret submission to backend; encrypt at rest, redact logs, support rotation/deletion.
- Catalog distinguishes free-tier eligible, paid, local endpoint and unknown pricing.
- Never promise unlimited free usage; enforce provider quotas and show estimates.

### M3 — Autonomous coding runtime
- Durable task records and resumable agent runs.
- Explicit typed tools: inspect_files, read_file, write_file, apply_patch, run_command, install_package, start_dev_server, get_preview, run_tests, git_status, git_commit, github_push, deploy_vercel.
- Planner creates a task plan; agent executes steps and reports progress events.
- Permission policy: allow safe workspace reads/writes and bounded tests; require approval for destructive shell operations, secret access, external publishing, billing-impacting actions and production deployments.
- Cancellation, timeout, retries, idempotency and resource budgets.

### M4 — Cloud sandbox and preview
- One isolated ephemeral/persistent workspace per project.
- CPU, memory, disk, process, wall-clock and network egress limits.
- Non-root execution, read-only base image, workspace-only write access.
- Per-task credentials scoped and short-lived.
- Preview exposed through signed, expiring URLs; no direct public port exposure.
- Stream terminal output and agent events to the mobile app.

### M5 — Integrations
- GitHub: list repos, create repo, branch, commit, push, pull and inspect diffs.
- Supabase: project selection and safe schema operations; destructive migrations require approval.
- Vercel: project linking, preview deployment, production deployment with explicit approval, deployment status and logs.
- OAuth tokens stored only server-side, least privilege, disconnect revokes local tokens.

### M6 — Quality and release
- Unit/integration/e2e tests, dependency scanning, secret scanning and sandbox escape review.
- Android accessibility, small-screen layout, keyboard handling and offline/reconnect behavior.
- Crash reporting with sensitive data redaction.
- EAS build profiles, signed Android App Bundle and Play Console release checklist.

## Core data model (initial)

- profiles(id, display_name, avatar_url, created_at)
- connections(id, user_id, provider, status, encrypted_secret_ref, scopes, connected_at, revoked_at)
- ai_providers(id, user_id, provider, display_name, model_id, secret_ref, pricing_class, enabled)
- projects(id, user_id, name, description, repository_id, vercel_project_id, sandbox_id, created_at, updated_at)
- agent_sessions(id, project_id, user_id, status, selected_model, created_at)
- agent_tasks(id, session_id, status, plan_json, current_step, budget_json, started_at, completed_at)
- agent_events(id, task_id, sequence, event_type, payload_redacted, created_at)
- approvals(id, task_id, tool_name, input_summary, status, decided_at)
- usage_records(id, user_id, provider, model_id, input_tokens, output_tokens, estimated_cost, created_at)

Apply row-level security to user-owned records. Service-role access is backend-only.

## API surface (proposed)

- POST /v1/projects
- GET /v1/projects
- POST /v1/projects/:id/tasks
- GET /v1/tasks/:id
- POST /v1/tasks/:id/cancel
- GET /v1/tasks/:id/events (SSE)
- POST /v1/approvals/:id/decision
- GET /v1/connections
- POST /v1/connections/:provider/start
- POST /v1/providers
- GET /v1/providers/catalog
- POST /v1/projects/:id/deployments

## Definition of a usable first release

A signed-in user can connect the five required services, create a React/Next.js project, ask the AI agent to build a small full-stack app, see streamed progress, preview it on-device, push source to GitHub and deploy a preview on Vercel. All secrets stay server-side and the sandbox is isolated.
