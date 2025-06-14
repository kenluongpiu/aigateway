import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from './utils';
export const OpenAICreateFinetuneConfig = {
    model: {
        param: 'model',
        required: true,
    },
    suffix: {
        param: 'suffix',
        required: true,
    },
    hyperparameters: {
        param: 'hyperparameters',
        required: false,
    },
    training_file: {
        param: 'training_file',
        required: true,
    },
    validation_file: {
        param: 'validation_file',
        required: false,
    },
    integrations: {
        param: 'integrations',
        required: false,
    },
    seed: {
        param: 'seed',
        required: false,
    },
    method: {
        param: 'method',
        required: false,
    },
};
export const OpenAIFinetuneResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, OPEN_AI);
    }
    return response;
};
