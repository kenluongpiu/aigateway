import { generateErrorResponse } from '../utils';
export const OpenAIErrorResponseTransform = (response, provider) => {
    return generateErrorResponse({
        ...response.error,
    }, provider);
};
