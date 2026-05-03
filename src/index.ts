import { Hono } from "hono";
import { fetcher } from "itty-fetcher";
import type { VeniceAiRateLimitsResponse } from "./types";

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
  return c.json({
    diem: Number(res.data.balances.DIEM),
    accessPermitted: res.data.accessPermitted,
    keyExpiration: res.data.keyExpiration,
    nextEpochBegins: res.data.nextEpochBegins,
  });
});

export default app;
