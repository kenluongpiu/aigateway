const PerplexityAIApiConfig = {
    getBaseURL: () => 'https://api.perplexity.ai',
    headers: ({ providerOptions }) => {
        return { Authorization: `Bearer ${providerOptions.apiKey}` };
    },
    getEndpoint: ({ fn }) => {
        switch (fn) {
            case 'chatComplete':
                return '/chat/completions';
            default:
                return '';
        }
    },
};
export default PerplexityAIApiConfig;
