import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from '../openai/utils';
export const AzureOpenAICreateTranslationResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, OPEN_AI);
    }
    return response;
};
