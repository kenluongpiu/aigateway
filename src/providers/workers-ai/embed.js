import { WORKERS_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { WorkersAiErrorResponseTransform, } from './utils';
export const WorkersAiEmbedConfig = {
    input: {
        param: 'text',
        required: true,
        transform: (params) => {
            if (Array.isArray(params.input)) {
                return params.input;
            }
            else {
                return [params.input];
            }
        },
    },
};
export const WorkersAiEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResponse = WorkersAiErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    const model = gatewayRequest.model || '';
    if ('result' in response) {
        return {
            object: 'list',
            data: response.result.data.map((embedding, index) => ({
                object: 'embedding',
                embedding: embedding,
                index: index,
            })),
            model,
            usage: {
                prompt_tokens: -1,
                total_tokens: -1,
            },
        };
    }
    return generateInvalidProviderResponseError(response, WORKERS_AI);
};
