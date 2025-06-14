import { CohereErrorResponseTransform } from './utils';
export const CohereCancelBatchResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, gatewayRequestUrl) => {
    if (responseStatus !== 200 && 'message' in response) {
        return CohereErrorResponseTransform(response);
    }
    return {
        status: 'success',
        object: 'batch',
        id: gatewayRequestUrl?.split('/v1/batches/')?.[1]?.replace('/cancel', '') ||
            '',
    };
};
