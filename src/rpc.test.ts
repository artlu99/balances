import { describe, expect, test } from "bun:test";
import { getStakedDiemBalance, getUsdcBalance } from "./rpc";

const env: Env = {
  VENICE_AI_1: "test",
  VENICE_AI_2: "test",
  ASSETS: {
    fetch: async () => new Response("test"),
    connect: (async () => {
      throw new Error("ASSETS.connect is not used in this test");
    }) as unknown as Env["ASSETS"]["connect"],
  },
	RPC_URL: "https://evm.stupidtech.net",
	WALLET_ADDRESS_1: "0x094f1608960A3cb06346cFd55B10b3cEc4f72c78",
	WALLET_ADDRESS_2: "0x511AffbF7AfDF2488Fb1CbA6e5d19508CfF2e4A5",
	TOPUP_ADDRESS: "0xAa591218305E621D8A128309e655A91e49A87a92",
} ;

describe("getStakedDiemBalance", () => {
	test("staked DIEM balance > 0.50", async () => {
		const balance = await getStakedDiemBalance(env, env.WALLET_ADDRESS_1);
		expect(balance).toBeGreaterThan(0.5);
	});
});

describe("getUsdcBalance", () => {
	test("USDC balance is a non-negative number", async () => {
		const balance = await getUsdcBalance(env, env.TOPUP_ADDRESS);
		expect(balance).toBeGreaterThanOrEqual(0);
	});
});
