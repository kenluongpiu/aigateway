import { MISTRAL_AI } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const MistralAIEmbedConfig = {
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
export const MistralAIEmbedResponseTransform = (response, responseStatus) => {
    if ('message' in response && responseStatus !== 200) {
        return generateErrorResponse({
            message: response.message,
            type: response.type,
            param: response.param,
            code: response.code,
        }, MISTRAL_AI);
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
                prompt_tokens: response.usage.prompt_tokens,
                total_tokens: response.usage.total_tokens,
            },
            provider: MISTRAL_AI,
        };
    }
    return generateInvalidProviderResponseError(response, MISTRAL_AI);
};
