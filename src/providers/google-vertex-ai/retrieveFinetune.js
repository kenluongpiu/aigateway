import { GoogleToOpenAIFinetune } from './utils';
export const GoogleFinetuneRetrieveResponseTransform = (response, status) => {
    if (status !== 200) {
        return response;
    }
    return GoogleToOpenAIFinetune(response);
};
