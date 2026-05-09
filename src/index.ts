import { Hono } from "hono";
import { fetcher } from "itty-fetcher";
import type { VeniceAiRateLimitsResponse } from "./types";
import { getStakedDiemBalance, getUsdcBalance } from "./rpc";

const api = (env: Env) =>
  fetcher({
    base: "https://api.venice.ai/api",
    headers: {
      Authorization: `Bearer ${env.VENICE_AI}`,
    },
  });

const app = new Hono<{ Bindings: Env }>();

app.get("/venice-ai", async (c) => {
  const res = await api(c.env).get<VeniceAiRateLimitsResponse>(
    "/v1/api_keys/rate_limits",
  );
  const diemBalance = await getStakedDiemBalance(c.env, c.env.WALLET_ADDRESS);
  return c.json({
    diem: Number(res.data.balances.DIEM),
    stakedDiem: diemBalance,
    accessPermitted: res.data.accessPermitted,
    keyExpiration: res.data.keyExpiration,
    nextEpochBegins: res.data.nextEpochBegins,
    keyHint: (c.env.VENICE_AI ?? "").slice(-4),
  });
});

app.get("/topup", async (c) => {
  const balance = await getUsdcBalance(c.env, c.env.TOPUP_ADDRESS);
  return c.json({ balance: Math.round(balance * 1000) / 1000, topupAddress: c.env.TOPUP_ADDRESS });
});

export default app;
