import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from './utils';
export const OpenAIFileUploadRequestTransform = (requestBody) => {
    return requestBody;
};
export const OpenAIUploadFileResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, OPEN_AI);
    }
    return response;
};
