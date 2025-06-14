import { NOMIC } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const NomicEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'nomic-embed-text-v1',
    },
    input: {
        param: 'texts',
        required: true,
        transform: (params) => {
            if (Array.isArray(params.input)) {
                return params.input;
            }
            return [params.input];
        },
    },
    task_type: {
        param: 'task_type',
    },
};
export const NomicErrorResponseTransform = (response) => {
    let firstError;
    let errorField = null;
    let errorMessage;
    let errorType = null;
    if (Array.isArray(response.detail)) {
        [firstError] = response.detail;
        errorField = firstError?.loc?.join('.') ?? '';
        errorMessage = firstError.msg;
        errorType = firstError.type;
    }
    else {
        errorMessage = response.detail;
    }
    return generateErrorResponse({
        message: `${errorField ? `${errorField}: ` : ''}${errorMessage}`,
        type: errorType,
        param: null,
        code: null,
    }, NOMIC);
};
export const NomicEmbedResponseTransform = (response, responseStatus) => {
    if ('detail' in response &&
        responseStatus !== 200 &&
        response.detail.length) {
        return NomicErrorResponseTransform(response);
    }
    if ('embeddings' in response) {
        return {
            object: 'list',
            data: response.embeddings.map((d, index) => ({
                object: 'embedding',
                embedding: d,
                index: index,
            })),
            model: response.model,
            usage: {
                prompt_tokens: response.usage.prompt_tokens,
                total_tokens: response.usage.total_tokens,
            },
            provider: NOMIC,
        };
    }
    return generateInvalidProviderResponseError(response, NOMIC);
};
