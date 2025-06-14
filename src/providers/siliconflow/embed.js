import { SILICONFLOW } from '../../globals';
import { SiliconFlowErrorResponseTransform } from './chatComplete';
// TODOS: this configuration does not enforce the maximum token limit for the input parameter. If you want to enforce this, you might need to add a custom validation function or a max property to the ParameterConfig interface, and then use it in the input configuration. However, this might be complex because the token count is not a simple length check, but depends on the specific tokenization method used by the model.
export const SiliconFlowEmbedConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'BAAI/bge-large-zh-v1.5',
    },
    input: {
        param: 'input',
        required: true,
    },
    encoding_format: {
        param: 'encoding_format',
    },
};
export const SiliconFlowEmbedResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return SiliconFlowErrorResponseTransform(response, SILICONFLOW);
    }
    return response;
};
