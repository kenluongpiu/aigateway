import { LEMONFOX_AI } from '../../globals';
import { generateErrorResponse, } from '../utils';
export const LemonfoxAIImageGenerateConfig = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    negative_prompt: {
        param: 'negative_prompt',
    },
    n: {
        param: 'n',
        max: 8,
        min: 1,
        default: 1,
    },
    response_format: {
        param: 'response_format',
        default: 'url',
    },
    size: {
        param: 'size',
    },
};
export const LemonfoxImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return generateErrorResponse({
            message: response['error'].message,
            type: response['error'].type,
            param: null,
            code: null,
        }, LEMONFOX_AI);
    }
    return response;
};
