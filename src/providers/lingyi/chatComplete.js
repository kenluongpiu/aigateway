import { LINGYI } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const LingyiChatCompleteConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'yi-34b-chat-0205',
    },
    messages: {
        param: 'messages',
        default: '',
        transform: (params) => {
            return params.messages?.map((message) => {
                if (message.role === 'developer')
                    return { ...message, role: 'system' };
                return message;
            });
        },
    },
    max_tokens: {
        param: 'max_tokens',
        default: 100,
        min: 0,
    },
    max_completion_tokens: {
        param: 'max_tokens',
        default: 100,
        min: 0,
    },
    temperature: {
        param: 'temperature',
        default: 1,
        min: 0,
        max: 2,
    },
    top_p: {
        param: 'top_p',
        default: 1,
        min: 0,
        max: 1,
    },
    stream: {
        param: 'stream',
        default: false,
    },
};
export const LingyiChatCompleteResponseTransform = (response, responseStatus) => {
    if ('message' in response && responseStatus !== 200) {
        return generateErrorResponse({
            message: response.message,
            type: response.type,
            param: response.param,
            code: response.code,
        }, LINGYI);
    }
    if ('choices' in response) {
        return {
            id: response.id,
            object: response.object,
            created: response.created,
            model: response.model,
            provider: LINGYI,
            choices: response.choices.map((c) => ({
                index: c.index,
                message: {
                    role: c.message.role,
                    content: c.message.content,
                },
                finish_reason: c.finish_reason,
            })),
            usage: {
                prompt_tokens: response.usage?.prompt_tokens,
                completion_tokens: response.usage?.completion_tokens,
                total_tokens: response.usage?.total_tokens,
            },
        };
    }
    return generateInvalidProviderResponseError(response, LINGYI);
};
export const LingyiChatCompleteStreamChunkTransform = (responseChunk) => {
    let chunk = responseChunk.trim();
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return `data: ${chunk}\n\n`;
    }
    const parsedChunk = JSON.parse(chunk);
    return (`data: ${JSON.stringify({
        id: parsedChunk.id,
        object: parsedChunk.object,
        created: parsedChunk.created,
        model: parsedChunk.model,
        provider: LINGYI,
        choices: [
            {
                index: parsedChunk.choices[0].index,
                delta: parsedChunk.choices[0].delta,
                finish_reason: parsedChunk.choices[0].finish_reason,
            },
        ],
    })}` + '\n\n');
};
