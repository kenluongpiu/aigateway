import { VOYAGE } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const VoyageEmbedConfig = {
    model: {
        param: 'model',
        required: true,
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
    input_type: {
        param: 'input_type',
        required: false,
        default: null,
    },
    truncation: {
        param: 'truncation',
        required: false,
        default: true,
    },
    encoding_format: {
        param: 'encoding_format',
        required: false,
        default: null,
    },
};
export const VoyageErrorResponseTransform = (response) => {
    let errorField = null;
    let errorMessage = response.detail;
    let errorType = 'Invalid Request';
    return generateErrorResponse({
        message: `${errorField ? `${errorField}: ` : ''}${errorMessage}`,
        type: errorType,
        param: null,
        code: null,
    }, VOYAGE);
};
export const VoyageEmbedResponseTransform = (response, responseStatus) => {
    if ('detail' in response && responseStatus !== 200) {
        return VoyageErrorResponseTransform(response);
    }
    if ('data' in response) {
        return {
            object: 'list',
            data: response.data,
            model: response.model,
            usage: {
                prompt_tokens: response.usage.total_tokens,
                total_tokens: response.usage.total_tokens,
            },
            provider: VOYAGE,
        };
    }
    return generateInvalidProviderResponseError(response, VOYAGE);
};
