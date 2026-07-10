# AiTechSupport — Frontend (Next.js)

Dashboard for the support-chatbot SaaS. Businesses configure bots, manage
knowledge bases, connect WhatsApp, monitor conversations, and manage billing.

## Local setup
```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8100
npm run dev                  # http://localhost:3200
```

## Stack
- Next.js App Router + TypeScript + Tailwind CSS
- REST client in `src/lib/api.ts` (axios), JWT auth

## Deployment
VPS (srv1275698, user `realestate`) behind nginx, run via `node server.js` as a
systemd service, deployed with a `~/deploy-frontend.sh` git-pull + build + restart
script — same pattern as Realesta. Domain: `aitechsupport.my`.

See `../PROJECT_STATE.md` for the phased roadmap.
