import { generateInvalidProviderResponseError } from '../utils';
import { TRITON } from '../../globals';
import { generateErrorResponse } from '../utils';
export const TritonCompleteConfig = {
    prompt: {
        param: 'text_input',
        required: true,
    },
    max_tokens: {
        param: 'max_tokens',
        default: 100,
        required: true,
    },
    temperature: {
        param: 'temperature',
        default: 0.7,
        min: 0,
        max: 1,
        required: true,
    },
    top_p: {
        param: 'top_p',
        default: 0.7,
        required: true,
    },
    top_k: {
        param: 'top_k',
        default: 50,
        required: true,
    },
    stop: {
        param: 'stop_words',
    },
    bad_words: {
        param: 'bad_words',
    },
};
const TritonErrorResponseTransform = (response) => {
    if ('error' in response) {
        return generateErrorResponse({ message: response.error, type: null, param: null, code: null }, TRITON);
    }
    return undefined;
};
export const TritonCompleteResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResponse = TritonErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('text_output' in response) {
        return {
            id: crypto.randomUUID(),
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: response.model_name,
            provider: TRITON,
            choices: [
                {
                    text: response.text_output,
                    index: 0,
                    logprobs: null,
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: -1,
                completion_tokens: -1,
                total_tokens: -1,
            },
        };
    }
    return generateInvalidProviderResponseError(response, TRITON);
};
