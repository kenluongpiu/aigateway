import { PALM } from '../../globals';
import { GoogleErrorResponseTransform, } from '../google/chatComplete';
import { generateInvalidProviderResponseError } from '../utils';
export const PalmEmbedConfig = {
    input: {
        param: 'text',
        required: true,
    },
    model: {
        param: 'model',
        default: 'models/embedding-gecko-001',
    },
};
export const PalmEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResponse = GoogleErrorResponseTransform(response, PALM);
        if (errorResponse)
            return errorResponse;
    }
    const model = gatewayRequest.model || '';
    if ('embedding' in response) {
        return {
            object: 'list',
            data: [
                {
                    object: 'embedding',
                    embedding: response.embedding.value,
                    index: 0,
                },
            ],
            model,
            usage: {
                prompt_tokens: -1,
                total_tokens: -1,
            },
            provider: PALM,
        };
    }
    return generateInvalidProviderResponseError(response, PALM);
};
