import { DEEPBRICKS } from '../../globals';
import { DeepbricksErrorResponseTransform } from './chatComplete';
export const DeepbricksImageGenerateConfig = {
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
export const DeepbricksImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return DeepbricksErrorResponseTransform(response, DEEPBRICKS);
    }
    return response;
};
