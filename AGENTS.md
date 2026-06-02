## Commands

- `bun dev` — local dev server (Wrangler)
- `bun run deploy` — deploy with minification
- `bun types` — regenerate `worker-configuration.d.ts` after changing `wrangler.jsonc` bindings
- `bun test` — run tests
- No lint or typecheck scripts are configured

## Key facts

- **Package manager:** Bun (`bun.lock` is gitignored)
- **Entry point:** `src/index.ts` (exports a Hono app with two API routes: `/venice-ai` and `/topup`)
- **Generated file:** `worker-configuration.d.ts` is gitignored and defines the global `Env` type; run `bun types` to regenerate after changing `wrangler.jsonc` bindings
- **Env vars:** `VENICE_AI`, `RPC_URL`, `WALLET_ADDRESS`, `TOPUP_ADDRESS` — set in `.dev.vars` locally (see `.dev.vars.example`); `RPC_URL` must be a Base chain RPC endpoint
- **Frontend:** `public/index.html` is a single vanilla HTML file with Alpine.js and Day.js loaded from CDN — no build/bundle step
- **On-chain reads:** `src/rpc.ts` uses viem to read token balances (DIEM, USDC) from Base chain contracts
- **TypeScript:** strict mode, ESNext target, `nodejs_compat` compatibility flag

## Tests

- `bun test` (uses `bun:test`)
- Tests in `src/rpc.test.ts` are **integration tests** that call real RPC endpoints — they require network access and valid `RPC_URL`/`WALLET_ADDRESS`/`TOPUP_ADDRESS` env vars

