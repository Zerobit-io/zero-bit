# ZeroBit — Stellar P2P Marketplace

A decentralized peer-to-peer marketplace built on the **Stellar blockchain**. Every deal is protected by a trustless escrow contract powered by the [TrustlessWork](https://trustlesswork.com) SDK — no middlemen, near-zero fees, full on-chain transparency.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Security Notes](#security-notes)
- [Contributing](#contributing)

---

## Overview

ZeroBit lets buyers and sellers trade directly — goods, services, rentals, and more. When a buyer places an order, funds are locked in a Stellar escrow contract. The seller delivers, the buyer confirms, and funds release automatically. No trust required.

**Core flow:**

```
Buyer places order → Funds locked in Stellar escrow
Seller delivers   → Buyer confirms receipt
Escrow releases   → Seller paid instantly on-chain
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Browser (Next.js 14)                     │
│          Firebase Auth · Apollo Client · Zustand            │
└──────────────┬──────────────────────┬───────────────────────┘
               │ GraphQL (JWT auth)   │ REST
               ▼                      ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  Hasura GraphQL      │   │  Express API  (port 3000)    │
│  (port 8080)         │   │  POST /api/auth/sync-user    │
│  Auto-gen CRUD API   │   │  POST /api/escrow/deploy     │
└──────────┬───────────┘   └──────────┬───────────────────┘
           │ SQL                       │ TrustlessWork SDK
           ▼                           ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│  PostgreSQL          │   │  Stellar Blockchain          │
│  (port 5433)         │   │  TrustlessWork API           │
└──────────────────────┘   └──────────────────────────────┘
```

**Key design decisions:**
- Hasura acts as the GraphQL middleware — auto-generates a full CRUD API from PostgreSQL tables
- The Express API handles operations that require server-side secrets (TrustlessWork API key, Hasura admin secret)
- Firebase handles authentication — JWTs are passed to Hasura for row-level security
- The frontend never holds secrets — all sensitive keys live in the API service

---

## Project Structure

```
zerobit/
├── apps/
│   ├── frontend/                      # Next.js 14 App Router · port 3001
│   │   └── src/
│   │       ├── app/                   # Pages and API routes
│   │       │   ├── api/escrow/        # Server: deploy escrow
│   │       │   ├── helper/            # Server: send signed XDR
│   │       │   ├── webhooks/          # Server: TrustlessWork webhook
│   │       │   ├── dashboard/         # Protected dashboard pages
│   │       │   ├── login/             # Auth pages
│   │       │   └── register/
│   │       ├── components/
│   │       │   ├── auth/              # Login, Register, wallet modals
│   │       │   ├── dashboard/         # Dashboard UI components
│   │       │   ├── escrow/            # Escrow flow components
│   │       │   ├── landing/           # Landing page + intro animation
│   │       │   ├── layouts/           # Header, Sidebar
│   │       │   └── ui/                # shadcn/ui primitives
│   │       ├── config/
│   │       │   └── apollo.ts          # Apollo Client (JWT auth, no secrets)
│   │       ├── core/store/
│   │       │   └── data.ts            # Zustand global auth state
│   │       ├── graphql/queries/       # Apollo query definitions
│   │       ├── lib/
│   │       │   ├── firebase.ts        # Firebase Auth init
│   │       │   ├── utils.ts           # Shared utilities
│   │       │   ├── walletconnect.ts   # WalletConnect setup
│   │       │   └── server/            # Server-side only (never in browser)
│   │       │       ├── hasura.ts      # Hasura admin mutations
│   │       │       └── trustlesswork.ts # TrustlessWork API wrapper
│   │       ├── lib/
│   │       │   └── trustlesswork-errors.ts # Error extraction utility
│   │       ├── middleware.ts          # Auth guard for /dashboard routes
│   │       ├── providers/             # React context providers
│   │       └── types/                 # Global TypeScript declarations
│   │
│   └── api/                           # Express REST API · port 3000
│       └── src/
│           ├── index.js               # Server entry point
│           ├── lib/
│           │   └── trustlesswork.js   # TrustlessWork SDK wrapper
│           └── routes/
│               ├── auth/              # POST /api/auth/sync-user
│               └── escrow/            # POST /api/escrow/deploy
│
├── packages/
│   ├── types/                         # @zerobit-wallet/types (shared TS types)
│   └── graphql/                       # @zerobit-wallet/graphql (codegen output)
│
├── services/
│   └── webhook/                       # Firebase Auth sync webhook (Docker)
│
├── infra/
│   └── hasura/                        # Hasura metadata, migrations, seeds
│       ├── docker-compose.yml
│       ├── migrations/
│       ├── metadata/
│       └── seeds/
│
├── package.json                       # Root workspace (Turborepo)
└── pnpm-workspace.yaml
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui |
| Blockchain | Stellar Network, TrustlessWork SDK |
| Wallets | Stellar Freighter, MetaMask, WalletConnect |
| Auth | Firebase Authentication (JWT) |
| API | Node.js, Express |
| GraphQL | Hasura, Apollo Client, graphql-codegen |
| Database | PostgreSQL (via Hasura) |
| State | Zustand |
| Package Manager | pnpm (workspaces) |
| Build System | Turborepo |
| Infrastructure | Docker Compose |

---

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- pnpm >= 11 — `npm install -g pnpm`
- Docker + Docker Compose (for Hasura + PostgreSQL)

### 1. Clone

```bash
git clone https://github.com/your-org/zerobit.git
cd zerobit
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/api/.env.example       apps/api/.env
```

Fill in the values — see [Environment Variables](#environment-variables).

### 4. Start infrastructure

```bash
cd infra/hasura
docker compose up -d
```

Hasura console: [http://localhost:8080](http://localhost:8080)

### 5. Start all dev servers

```bash
pnpm dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3001 |
| API | http://localhost:3000 |
| Hasura Console | http://localhost:8080 |

---

## Environment Variables

### `apps/frontend/.env.local`

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | ✅ | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Firebase messaging sender |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `NEXT_PUBLIC_HASURA_GRAPHQL_URL` | ✅ | Hasura GraphQL endpoint (public) |
| `NEXT_PUBLIC_BACKEND_URL` | ✅ | Express API base URL |
| `NEXT_PUBLIC_PLATFORM_ADDRESS` | ✅ | Stellar platform wallet address |
| `NEXT_PUBLIC_USDC_ADDRESS` | ✅ | USDC asset address on Stellar |

### `apps/api/.env`

| Variable | Required | Description |
|---|---|---|
| `PORT` | — | API port (default: 3000) |
| `FIREBASE_PROJECT_ID` | ✅ | Used for JWT validation |
| `HASURA_GRAPHQL_URL` | ✅ | Hasura endpoint (internal) |
| `HASURA_ADMIN_SECRET` | ✅ | Hasura admin secret — **server only** |
| `TRUSTLESS_WORK_BASE_URL` | ✅ | TrustlessWork API base URL |
| `TRUSTLESS_WORK_API_KEY` | ✅ | TrustlessWork API key — **server only** |
| `TRUSTLESS_WORK_WEBHOOK_SECRET` | ✅ | Webhook HMAC secret |

---

## Available Scripts

Run from the **repo root** unless noted.

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps in parallel (Turborepo) |
| `pnpm build` | Production build of all apps |
| `pnpm lint` | Lint all packages |
| `pnpm codegen` | Regenerate GraphQL types from Hasura schema |
| `pnpm --filter @zerobit-wallet/web dev` | Frontend only |
| `pnpm --filter @zerobit-wallet/api dev` | API only |

---

## API Reference

### `POST /api/auth/sync-user`

Verifies a Firebase ID token and upserts the user into the database.

**Headers:** `Authorization: Bearer <firebase_id_token>`

**Body:**
```json
{
  "first_name": "Alice",
  "last_name": "Smith",
  "phone_number": "88001234",
  "country_code": "+1",
  "location": "us"
}
```

**Response:** `200 { success: true, user: { id, email } }`

---

### `POST /api/escrow/deploy`

Deploys a new single-release Stellar escrow contract via TrustlessWork.

**Body:**
```json
{
  "apartmentId": "uuid",
  "tenantAddress": "G...",
  "ownerAddress": "G...",
  "amount": 100
}
```

**Response:** `200 { contractId, unsignedXDR, engagementId, status }`

---

## Security Notes

| Issue | Status |
|---|---|
| Hasura admin secret removed from `NEXT_PUBLIC_*` | ✅ Fixed |
| Firebase JWT validated with Google JWKS | ✅ Improved |
| Server-side secrets isolated to `lib/server/` | ✅ Fixed |
| TrustlessWork API key is server-only | ✅ Fixed |
| Webhook HMAC signature verification | ✅ Already implemented |
| Full RS256 JWT verification (firebase-admin) | ⚠️ Recommended for production |

---

## Contributing

1. Fork and create a branch: `git checkout -b feat/your-feature`
2. Make changes following existing code style
3. Run `pnpm lint` before committing
4. Open a pull request — keep titles under 70 characters

---

<div align="center">
  Built on Stellar · Powered by TrustlessWork · ZeroBit © 2025
</div>
