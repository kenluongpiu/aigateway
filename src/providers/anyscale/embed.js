import { ANYSCALE } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { AnyscaleErrorResponseTransform, } from './chatComplete';
export const AnyscaleEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'thenlper/gte-large',
    },
    input: {
        param: 'input',
        default: '',
    },
    user: {
        param: 'user',
    },
};
export const AnyscaleEmbedResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResposne = AnyscaleErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    if ('data' in response) {
        return {
            object: response.object,
            data: response.data,
            model: response.model,
            usage: response.usage,
        };
    }
    return generateInvalidProviderResponseError(response, ANYSCALE);
};
