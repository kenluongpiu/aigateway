import { generateErrorResponse } from '../utils';
import { WORKERS_AI } from '../../globals';
export const WorkersAiErrorResponseTransform = (response) => {
    if ('errors' in response) {
        return generateErrorResponse({
            message: response.errors
                ?.map((error) => `Error ${error.code}:${error.message}`)
                .join(', '),
            type: null,
            param: null,
            code: null,
        }, WORKERS_AI);
    }
    return undefined;
};
