import { TOGETHER_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { TogetherAIErrorResponseTransform, } from './chatComplete';
export const TogetherAIEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'mistral-embed',
    },
    input: {
        param: 'input',
        required: true,
        transform: (params) => {
            if (Array.isArray(params.input)) {
                return params.input;
            }
            return [params.input];
        },
    },
};
export const TogetherAIEmbedResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResponse = TogetherAIErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('data' in response) {
        return {
            object: response.object,
            data: response.data.map((d) => ({
                object: d.object,
                embedding: d.embedding,
                index: d.index,
            })),
            model: response.model,
            usage: {
                prompt_tokens: 0,
                total_tokens: 0,
            },
            provider: TOGETHER_AI,
        };
    }
    return generateInvalidProviderResponseError(response, TOGETHER_AI);
};
