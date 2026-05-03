export interface VeniceAiRateLimitsResponse {
    data: {
        accessPermitted: boolean;
        apiTier: { id: string; isCharged: boolean };
        balances: Record<string, number>;
        keyExpiration: string | null;
        nextEpochBegins: string;
        rateLimits: {
            apiModelId: string;
            rateLimits: { amount: number; type: string }[];
        }[];
    };
}