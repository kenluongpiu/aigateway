const AI21APIConfig = {
    getBaseURL: () => 'https://api.ai21.com/studio/v1',
    headers: ({ providerOptions }) => {
        const headers = {
            Authorization: `Bearer ${providerOptions.apiKey}`,
        };
        return headers;
    },
    getEndpoint: ({ fn, gatewayRequestBodyJSON }) => {
        const { model } = gatewayRequestBodyJSON;
        switch (fn) {
            case 'complete': {
                return `/${model}/complete`;
            }
            case 'chatComplete': {
                return `/${model}/chat`;
            }
            case 'embed': {
                return `/embed`;
            }
            default:
                return '';
        }
    },
};
export default AI21APIConfig;
