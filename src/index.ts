import { Hono } from "hono";
import type { Context } from "hono";
import { fetcher } from "itty-fetcher";
import { getStakedDiemBalance, getUsdcBalance } from "./rpc";
import type { VeniceAiRateLimitsResponse } from "./types";

const api = (env: Env) =>
  fetcher({
    base: "https://api.venice.ai/api",
    headers: {
      Authorization: `Bearer ${env.VENICE_AI}`,
    },
  });

function fail(c: Context, err: unknown, step: string) {
  const e = err && typeof err === "object" ? (err as Record<string, unknown>) : null;
  const status =
    e && typeof e.status === "number" && e.status >= 400 ? e.status : 500;
  const message = String(
    e?.error ?? e?.shortMessage ?? e?.message ??
      (err instanceof Error ? err.message : err ?? "Request failed"),
  );
  return c.json({ error: message, step }, status);
}

const app = new Hono<{ Bindings: Env }>();

app.get("/venice-ai", async (c) => {
  let res: VeniceAiRateLimitsResponse;
  try {
    res = await api(c.env).get<VeniceAiRateLimitsResponse>(
      "/v1/api_keys/rate_limits",
    );
  } catch (err) {
    return fail(c, err, "venice-ai-api");
  }

  try {
    const stakedDiem = await getStakedDiemBalance(c.env, c.env.WALLET_ADDRESS);
    return c.json({
      diem: Number(res.data.balances.DIEM),
      stakedDiem,
      accessPermitted: res.data.accessPermitted,
      keyExpiration: res.data.keyExpiration,
      nextEpochBegins: res.data.nextEpochBegins,
      keyHint: (c.env.VENICE_AI ?? "").slice(-4),
    });
  } catch (err) {
    return fail(c, err, "staked-diem-rpc");
  }
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
