// GoogleToOpenAIBatch
import { GoogleToOpenAIBatch } from './utils';
export const GoogleRetrieveBatchResponseTransform = (response, status) => {
    if (status !== 200) {
        return response;
    }
    return GoogleToOpenAIBatch(response);
};
