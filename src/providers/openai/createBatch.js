import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from './utils';
export const OpenAICreateBatchConfig = {
    input_file_id: {
        param: 'input_file_id',
        required: true,
    },
    endpoint: {
        param: 'endpoint',
        required: true,
    },
    completion_window: {
        param: 'completion_window',
        default: '24h',
        required: true,
    },
    metadata: {
        param: 'metadata',
        required: false,
    },
};
export const OpenAICreateBatchResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, OPEN_AI);
    }
    return response;
};
