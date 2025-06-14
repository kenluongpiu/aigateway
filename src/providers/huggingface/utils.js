import { HUGGING_FACE } from '../../globals';
import { generateErrorResponse } from '../utils';
export const HuggingfaceErrorResponseTransform = (response, responseStatus) => {
    return generateErrorResponse({
        message: response.error,
        type: null,
        param: null,
        code: responseStatus.toString(),
    }, HUGGING_FACE);
};
