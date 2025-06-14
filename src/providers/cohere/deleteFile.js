import { CohereErrorResponseTransform } from './utils';
export const CohereDeleteFileResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, gatewayRequestUrl) => {
    if (responseStatus !== 200 && 'message' in response) {
        return CohereErrorResponseTransform(response);
    }
    const id = gatewayRequestUrl.split('/').pop() || '';
    return {
        object: 'file',
        deleted: true,
        id,
    };
};
