import { GoogleErrorResponseTransform } from './utils';
export const GoogleRetrieveFileContentResponseTransform = (response, status) => {
    if (status !== 200) {
        return GoogleErrorResponseTransform(response) || response;
    }
    return response;
};
