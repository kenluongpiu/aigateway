import { OLLAMA } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
// TODOS: this configuration does not enforce the maximum token limit for the input parameter. If you want to enforce this, you might need to add a custom validation function or a max property to the ParameterConfig interface, and then use it in the input configuration. However, this might be complex because the token count is not a simple length check, but depends on the specific tokenization method used by the model.
export const OllamaEmbedConfig = {
    model: {
        param: 'model',
    },
    input: {
        param: 'prompt',
        required: true,
    },
};
export const OllamaEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if ('error' in response) {
        return generateErrorResponse({ message: response.error, type: null, param: null, code: null }, OLLAMA);
    }
    const model = response.model || gatewayRequest.model || '';
    if ('embedding' in response) {
        return {
            object: 'list',
            data: [
                {
                    object: 'embedding',
                    embedding: response.embedding,
                    index: 0,
                },
            ],
            model,
            usage: {
                prompt_tokens: -1,
                total_tokens: -1,
            },
        };
    }
    return generateInvalidProviderResponseError(response, OLLAMA);
};
