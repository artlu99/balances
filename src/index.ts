import { Hono } from "hono";
import type { Context } from "hono";
import { fetcher } from "itty-fetcher";
import { getStakedDiemBalance, getUsdcBalance } from "./rpc";
import type { VeniceAiRateLimitsResponse } from "./types";

const ACCOUNT_PAIRS = [
  { veniceKey: "VENICE_AI_1", walletKey: "WALLET_ADDRESS_1" },
  { veniceKey: "VENICE_AI_2", walletKey: "WALLET_ADDRESS_2" },
] as const;

const api = (apiKey: string) =>
  fetcher({
    base: "https://api.venice.ai/api",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

function fail(c: Context, err: unknown, step: string) {
  const e = err && typeof err === "object" ? (err as Record<string, unknown>) : null;
  const status =
    e && typeof e.status === "number" && e.status >= 400 ? e.status : 500;
  return c.json({ error: errorMessage(err), step }, status);
}

const app = new Hono<{ Bindings: Env }>();

function errorMessage(err: unknown) {
  const e = err && typeof err === "object" ? (err as Record<string, unknown>) : null;
  return String(
    e?.error ?? e?.shortMessage ?? e?.message ??
      (err instanceof Error ? err.message : err ?? "Request failed"),
  );
}

async function fetchVeniceAccount(
  env: Env,
  pair: (typeof ACCOUNT_PAIRS)[number],
) {
  const apiKey = env[pair.veniceKey];
  const wallet = env[pair.walletKey];
  const keyHint = (apiKey ?? "").slice(-4);
  const walletHint = wallet
    ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}`
    : "";

  let res: VeniceAiRateLimitsResponse;
  try {
    res = await api(apiKey).get<VeniceAiRateLimitsResponse>(
      "/v1/api_keys/rate_limits",
    );
  } catch (err) {
    return { ok: false as const, keyHint, walletHint, error: errorMessage(err), step: "venice-ai-api" };
  }

  try {
    const stakedDiem = await getStakedDiemBalance(env, wallet);
    return {
      ok: true as const,
      keyHint,
      walletHint,
      diem: Number(res.data.balances.DIEM),
      stakedDiem,
      accessPermitted: res.data.accessPermitted,
      keyExpiration: res.data.keyExpiration,
      nextEpochBegins: res.data.nextEpochBegins,
    };
  } catch (err) {
    return { ok: false as const, keyHint, walletHint, error: errorMessage(err), step: "staked-diem-rpc" };
  }
}

app.get("/venice-ai", async (c) => {
  const accounts = await Promise.all(
    ACCOUNT_PAIRS.map((pair) => fetchVeniceAccount(c.env, pair)),
  );
  return c.json({ accounts });
});

app.get("/topup", async (c) => {
  try {
    const balance = await getUsdcBalance(c.env, c.env.TOPUP_ADDRESS);
    return c.json({
      balance: Math.round(balance * 1000) / 1000,
      topupAddress: c.env.TOPUP_ADDRESS,
    });
  } catch (err) {
    return fail(c, err, "usdc-rpc");
  }
});

export default app;
