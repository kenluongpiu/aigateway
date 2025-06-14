import { AZURE_OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from '../openai/utils';
export const AzureOpenAIImageGenerateConfig = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    model: {
        param: 'model',
        required: true,
        default: 'dall-e-3',
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
export const AzureOpenAIImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, AZURE_OPEN_AI);
    }
    return response;
};
