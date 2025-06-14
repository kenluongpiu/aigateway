const NCompassApiConfig = {
    getBaseURL: () => 'https://api.ncompass.tech/v1',
    headers: ({ providerOptions }) => {
        return {
            Authorization: `Bearer ${providerOptions.apiKey}`,
        };
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
export default NCompassApiConfig;
