import { MONSTERAPI } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const MonsterAPIChatCompleteConfig = {
    top_k: {
        param: 'top_k',
        min: 1,
        max: 20,
    },
    top_p: {
        param: 'top_p',
        min: 0,
        max: 1,
    },
    temperature: {
        param: 'temperature',
        min: 0,
        max: 1,
    },
    max_length: {
        param: 'max_length',
        min: 1,
        max: 2048,
    },
    repetition_penalty: {
        param: 'repetition_penalty',
        min: 0,
    },
    beam_size: {
        param: 'beam_size',
        min: 1,
    },
    model: {
        param: 'model',
        required: true,
        default: 'mistralai/Mistral-7B-Instruct-v0.2',
    },
    messages: {
        param: 'messages',
        required: true,
        default: [],
        transform: (params) => {
            return params.messages?.map((message) => {
                if (message.role === 'developer')
                    return { ...message, role: 'system' };
                return message;
            });
        },
    },
};
export const MonsterAPIChatCompleteResponseTransform = (response, responseStatus) => {
    if ('error' in response) {
        return generateErrorResponse({
            message: response.error.message,
            type: response.error.type,
            param: null,
            code: response.error.code.toString(),
        }, MONSTERAPI);
    }
    if ('choices' in response) {
        return {
            ...response,
            provider: MONSTERAPI,
        };
    }
    return generateInvalidProviderResponseError(response, MONSTERAPI);
};
