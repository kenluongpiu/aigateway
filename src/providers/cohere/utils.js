import { COHERE } from '../../globals';
import { generateErrorResponse } from '../utils';
export const CohereErrorResponseTransform = (response) => {
    return generateErrorResponse({
        message: response.message,
        type: null,
        param: null,
        code: null,
    }, COHERE);
};
