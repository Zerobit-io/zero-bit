# Contributing to ZeroBit

Thank you for your interest in contributing to ZeroBit — the Stellar P2P Marketplace. Every contribution matters, whether it is a bug fix, a new feature, documentation, or a test.

---

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/zero-bit.git`
3. Install dependencies: `pnpm install`
4. Copy env files: `cp apps/frontend/.env.example apps/frontend/.env.local` and `cp apps/api/.env.example apps/api/.env`
5. Start infrastructure: `cd infra/hasura && docker compose up -d`
6. Start dev servers: `pnpm dev`

---

## How to Contribute

- Browse [open issues](https://github.com/Zerobit-io/zero-bit/issues)
- Issues tagged `good first issue` are beginner-friendly
- Issues tagged `help wanted` are open for anyone to pick up
- Comment on an issue before starting work so we can assign it to you

## Pull Request Process

1. Create a branch from `main`: `git checkout -b feat/your-feature`
2. Make your changes following the existing code style
3. Run `pnpm lint` and fix any issues
4. Open a pull request with a clear title and description
5. Link the issue your PR resolves using `Closes #issue-number`

## Branch Naming

- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation only
- `test/` — tests only
- `chore/` — maintenance tasks

## Code Style

- TypeScript for all frontend and shared code
- ESLint config is already set up — run `pnpm lint` before committing
- Keep components small and focused
- Server-side secrets must never use the `NEXT_PUBLIC_` prefix

## Commit Messages

Use clear, descriptive commit messages:

```
feat: add seller profile page
fix: correct escrow status update on webhook
docs: update env variable reference in README
test: add unit tests for trustlesswork-errors utility
```

## Need Help?

Open a [GitHub Discussion](https://github.com/Zerobit-io/zero-bit/discussions) or join our [Discord](https://discord.gg/zerobit).

---

Built on Stellar. Powered by the community.
