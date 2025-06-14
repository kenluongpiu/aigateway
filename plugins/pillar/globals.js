import { post } from '../utils';
export const PILLAR_BASE_URL = 'https://api.pillarseclabs.com/api/v1';
export const postPillar = async (endpoint, credentials, data, timeout) => {
    const options = {
        headers: {
            Authorization: `Bearer ${credentials.apiKey}`,
        },
    };
    switch (endpoint) {
        case 'scanPrompt':
            return post(`${PILLAR_BASE_URL}/scan/prompt`, data, options, timeout);
        case 'scanResponse':
            return post(`${PILLAR_BASE_URL}/scan/response`, data, options, timeout);
        default:
            throw new Error(`Unknown Pillar endpoint: ${endpoint}`);
    }
};
