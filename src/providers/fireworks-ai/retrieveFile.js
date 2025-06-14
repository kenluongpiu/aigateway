import { fireworksDatasetToOpenAIFile } from './utils';
export const FireworksFileRetrieveResponseTransform = (response, responseStatus) => {
    if (responseStatus === 200) {
        return fireworksDatasetToOpenAIFile(response);
    }
    return response;
};
