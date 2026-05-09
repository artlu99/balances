import { createPublicClient, http, parseAbi } from "viem";
import { base } from "viem/chains";

const DIEM_TOKEN = {
	contractAddress: "0xf4d97f2da56e8c3098f3a8d538db630a2606a024" as const,
	decimals: 18,
};

const USDC_TOKEN = {
	contractAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const,
	decimals: 6,
};

const rpc = (env: Env) =>
	createPublicClient({
		chain: base,
		transport: http(`${env.RPC_URL}/v1/base`),
	});

export const getDiemBalance = async (env: Env, walletAddress: string) => {
	const client = rpc(env);
	const balance = await client.readContract({
		address: DIEM_TOKEN.contractAddress,
		abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
		functionName: "balanceOf",
		args: [walletAddress as `0x${string}`],
	});
	return Number(balance) / 10 ** DIEM_TOKEN.decimals;
};

export const getStakedDiemBalance = async (env: Env, walletAddress: string) => {
	const client = rpc(env);
	const amountStaked = await client.readContract({
		address: DIEM_TOKEN.contractAddress,
		abi: parseAbi(["function stakedInfos(address) view returns (uint256)"]),
		functionName: "stakedInfos",
		args: [walletAddress as `0x${string}`],
	});
	return Number(amountStaked) / 10 ** DIEM_TOKEN.decimals;
};

export const getUsdcBalance = async (env: Env, walletAddress: string) => {
	const client = rpc(env);
	const balance = await client.readContract({
		address: USDC_TOKEN.contractAddress,
		abi: parseAbi(["function balanceOf(address) view returns (uint256)"]),
		functionName: "balanceOf",
		args: [walletAddress as `0x${string}`],
	});
	return Number(balance) / 10 ** USDC_TOKEN.decimals;
};
