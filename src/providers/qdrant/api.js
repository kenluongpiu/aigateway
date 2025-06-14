const QdrantAPIConfig = {
    getBaseURL: ({ providerOptions }) => {
        return providerOptions.customHost || '';
    },
    headers: ({ providerOptions }) => {
        return { 'api-key': `Bearer ${providerOptions.apiKey}` };
    },
    getEndpoint: ({ fn }) => {
        switch (fn) {
            default:
                return '';
        }
    },
};
export default QdrantAPIConfig;
