import { BedrockErrorResponseTransform } from './chatComplete';
export const BedrockCancelBatchResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, gatewayRequestUrl) => {
    if (responseStatus !== 200) {
        const errorResponse = BedrockErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    const batchId = decodeURIComponent(gatewayRequestUrl.split('/v1/batches/')[1].split('/')[0]);
    return {
        status: 'success',
        object: 'batch',
        id: batchId,
    };
};
