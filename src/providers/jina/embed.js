import { JINA } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const JinaEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'jina-embeddings-v2-base-en',
    },
    input: {
        param: 'input',
        default: '',
    },
    encoding_format: {
        param: 'encoding_format',
    },
};
export const JinaEmbedResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'detail' in response) {
        return generateErrorResponse({
            message: response.detail,
            type: null,
            param: null,
            code: null,
        }, JINA);
    }
    if ('data' in response) {
        return {
            object: response.object,
            data: response.data.map((d) => ({
                object: d.object,
                index: d.index,
                embedding: d.embedding,
            })),
            provider: JINA,
            model: response.model,
            usage: {
                prompt_tokens: response.usage?.prompt_tokens,
                total_tokens: response.usage?.total_tokens,
            },
        };
    }
    return generateInvalidProviderResponseError(response, JINA);
};
