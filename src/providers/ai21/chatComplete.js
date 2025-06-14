import { AI21 } from '../../globals';
import { SYSTEM_MESSAGE_ROLES } from '../../types/requestBody';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const AI21ChatCompleteConfig = {
    messages: [
        {
            param: 'messages',
            required: true,
            transform: (params) => {
                let inputMessages = [];
                if (params.messages?.[0]?.role &&
                    SYSTEM_MESSAGE_ROLES.includes(params.messages?.[0]?.role)) {
                    inputMessages = params.messages.slice(1);
                }
                else if (params.messages) {
                    inputMessages = params.messages;
                }
                return inputMessages.map((msg) => ({
                    text: msg.content,
                    role: msg.role,
                }));
            },
        },
        {
            param: 'system',
            required: false,
            transform: (params) => {
                if (params.messages?.[0]?.role &&
                    SYSTEM_MESSAGE_ROLES.includes(params.messages?.[0]?.role)) {
                    return params.messages?.[0].content;
                }
            },
        },
    ],
    n: {
        param: 'numResults',
        default: 1,
    },
    max_tokens: {
        param: 'maxTokens',
        default: 16,
    },
    max_completion_tokens: {
        param: 'maxTokens',
        default: 16,
    },
    minTokens: {
        param: 'minTokens',
        default: 0,
    },
    temperature: {
        param: 'temperature',
        default: 0.7,
        min: 0,
        max: 1,
    },
    top_p: {
        param: 'topP',
        default: 1,
    },
    top_k: {
        param: 'topKReturn',
        default: 0,
    },
    stop: {
        param: 'stopSequences',
    },
    presence_penalty: {
        param: 'presencePenalty',
        transform: (params) => {
            return {
                scale: params.presence_penalty,
            };
        },
    },
    frequency_penalty: {
        param: 'frequencyPenalty',
        transform: (params) => {
            return {
                scale: params.frequency_penalty,
            };
        },
    },
    countPenalty: {
        param: 'countPenalty',
    },
    frequencyPenalty: {
        param: 'frequencyPenalty',
    },
    presencePenalty: {
        param: 'presencePenalty',
    },
};
export const AI21ErrorResponseTransform = (response) => {
    if ('detail' in response) {
        return generateErrorResponse({ message: response.detail, type: null, param: null, code: null }, AI21);
    }
    return undefined;
};
export const AI21ChatCompleteResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResposne = AI21ErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    if ('outputs' in response) {
        return {
            id: response.id,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: '',
            provider: AI21,
            choices: response.outputs.map((o, index) => ({
                message: {
                    role: 'assistant',
                    content: o.text,
                },
                index: index,
                logprobs: null,
                finish_reason: o.finishReason?.reason,
            })),
        };
    }
    return generateInvalidProviderResponseError(response, AI21);
};
