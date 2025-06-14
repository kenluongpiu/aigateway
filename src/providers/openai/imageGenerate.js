import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from './utils';
export const OpenAIImageGenerateConfig = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    model: {
        param: 'model',
        required: true,
        default: 'dall-e-2',
    },
    n: {
        param: 'n',
        min: 1,
        max: 10,
    },
    quality: {
        param: 'quality',
    },
    response_format: {
        param: 'response_format',
    },
    size: {
        param: 'size',
    },
    style: {
        param: 'style',
    },
    user: {
        param: 'user',
    },
};
export const OpenAIImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, OPEN_AI);
    }
    return response;
};
