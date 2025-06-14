import { LEPTON } from '../../globals';
import { OpenAIErrorResponseTransform } from '../openai/utils';
export const LeptonCreateTranscriptionResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, LEPTON);
    }
    Object.defineProperty(response, 'provider', {
        value: LEPTON,
        enumerable: true,
    });
    return response;
};
