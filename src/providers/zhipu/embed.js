import { ZHIPU } from '../../globals';
import { generateErrorResponse } from '../utils';
export const ZhipuEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'embedding-2',
    },
    input: {
        param: 'input',
        required: true,
    },
};
export const ZhipuEmbedResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return generateErrorResponse({
            message: response.error.message,
            type: response.error.type,
            param: response.error.param,
            code: response.error.code,
        }, ZHIPU);
    }
    return response;
};
