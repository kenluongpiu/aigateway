export const upstageAPIConfig = {
    getBaseURL: () => 'https://api.upstage.ai/v1/solar',
    headers({ providerOptions }) {
        const { apiKey } = providerOptions;
        return { Authorization: `Bearer ${apiKey}` };
    },
    getEndpoint({ fn }) {
        switch (fn) {
            case 'chatComplete':
                return `/chat/completions`;
            case 'embed':
                return `/embeddings`;
            default:
                return '';
        }
    },
};
