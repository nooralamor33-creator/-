# وصلة (Wasla)

تطبيق اجتماعي عربي متكامل — مساحة شخصية دافئة للتواصل بين المستخدمين.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/arabic-app run dev` — run the frontend (port 25188)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS (Arabic RTL, Tajawal font)
- Backend: Express 5 + Socket.io
- Storage: JSON files (no SQL, no external services)
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/api-client-react/src/generated/` — generated React Query hooks
- `lib/api-zod/src/generated/` — generated Zod schemas
- `artifacts/arabic-app/src/` — React frontend (RTL Arabic)
- `artifacts/api-server/src/` — Express backend
- `artifacts/api-server/src/lib/storage.ts` — JSON file storage layer
- `artifacts/api-server/data/` — JSON data files (created at runtime)

## Architecture decisions

- **JSON file storage**: `data/data.json` for users list, `data/user_{id}.json` per-user data (friends, sessions), `data/messages_{id1}_{id2}.json` per conversation, `data/groups.json`, `data/posts.json`, `data/gifts.json`
- **No SQL**: Deliberately avoids any database dependency for simplicity and Render compatibility
- **Session auth**: Bearer token (UUID sessionId) stored in localStorage, sent as Authorization header
- **8-digit user IDs**: Unique numeric IDs for human-readable user lookup
- **Socket.io path**: `/api/socket.io` — must be listed in artifact.toml paths
- **Base64 media**: Images and videos stored as base64 strings in JSON files (suitable for small files)
- **JSON limit**: Express configured with `50mb` limit to allow base64 media uploads

## Product

- نظام حسابات: تسجيل دخول وإنشاء حساب بـ ID فريد من 8 أرقام
- شريط تنقل سفلي: أنا، المجموعات، المنشورات، المحادثات
- نظام أصدقاء: بحث وإضافة عبر الـ ID
- رسائل فورية: نصوص وصور وفيديو مع Socket.io
- مجموعات: إنشاء وإدارة مع تمييز الأدوار (مالك/عضو)
- منشورات: feed عام مع إعجابات
- نقاط وهدايا: تبادل الهدايا بين المستخدمين

## User preferences

- تطبيق عربي RTL بالكامل
- تصميم iOS Clean & Minimalist
- خلفية تدرج مائي متحرك (Watery Gradient Animation)
- Mobile-First (max-width: 430px)
- تخزين JSON فقط، بدون SQL أو خدمات خارجية

## Gotchas

- `data/` folder is created at runtime in `artifacts/api-server/data/` — must exist or server creates it
- Base64 images can be large — keep uploads reasonable in size
- Socket.io path is `/api/socket.io` — the proxy routes `/api` to the API server
- Session tokens are UUIDs stored in `data/sessions.json` — clearing this file logs everyone out

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
