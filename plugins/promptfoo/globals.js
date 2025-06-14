import { post } from '../utils';
export const PROMPTFOO_BASE_URL = 'https://api.promptfoo.dev/v1';
export const postPromptfoo = async (endpoint, data, timeout) => {
    const options = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    switch (endpoint) {
        case 'guard':
            return post(`${PROMPTFOO_BASE_URL}/guard`, data, options, timeout);
        case 'pii':
            return post(`${PROMPTFOO_BASE_URL}/pii`, data, options, timeout);
        case 'harm':
            return post(`${PROMPTFOO_BASE_URL}/harm`, data, options, timeout);
        default:
            throw new Error(`Unknown Promptfoo endpoint: ${endpoint}`);
    }
};
