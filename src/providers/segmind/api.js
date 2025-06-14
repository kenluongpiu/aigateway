const SegmindAIAPIConfig = {
    getBaseURL: () => 'https://api.segmind.com/v1',
    headers: ({ providerOptions }) => {
        return { 'x-api-key': `${providerOptions.apiKey}` };
    },
    getEndpoint: ({ gatewayRequestBodyJSON }) => {
        return `/${gatewayRequestBodyJSON.model}`;
    },
};
export default SegmindAIAPIConfig;
