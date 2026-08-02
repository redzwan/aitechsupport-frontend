# AiChatSupport Frontend Context
- Language: TypeScript
- Framework: Next.js 15/16 (App Router)
- Styling: Tailwind CSS

## Domain
Dashboard for the support-chatbot SaaS: sign up, create a bot, manage its
knowledge base, connect WhatsApp, watch conversations (with human handoff),
see analytics, manage Billplz billing. Talks to the FastAPI backend over REST.

## Development Rules
- Use Server Components by default. Use 'use client' only when interaction is required.
- Follow the component-per-feature pattern (e.g., `components/bot/BotCard.tsx`).
- Tailwind: use responsive prefixes (md:, lg:) for all layouts.
- API: use the wrappers in `src/lib/api.ts`; base URL comes from NEXT_PUBLIC_API_URL.

## Commands
- Dev Server: `npm run dev`  (port 3200 via root .claude/launch.json)
- Build: `npm run build`
- Lint: `npm run lint`
