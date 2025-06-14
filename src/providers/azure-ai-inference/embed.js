import { OpenAIErrorResponseTransform } from '../openai/utils';
export const AzureAIInferenceEmbedConfig = {
    model: {
        param: 'model',
        required: false,
    },
    input: {
        param: 'input',
        required: true,
    },
    user: {
        param: 'user',
    },
};
export const AzureAIInferenceEmbedResponseTransform = (provider) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            return OpenAIErrorResponseTransform(response, provider);
        }
        return { ...response, provider: provider };
    };
    return transformer;
};
