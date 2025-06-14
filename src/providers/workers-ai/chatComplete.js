import { WORKERS_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { WorkersAiErrorResponseTransform, } from './utils';
export const WorkersAiChatCompleteConfig = {
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
    stream: {
        param: 'stream',
        default: false,
    },
    raw: {
        param: 'raw',
    },
    max_tokens: {
        param: 'max_tokens',
    },
    max_completion_tokens: {
        param: 'max_tokens',
    },
};
// TODO: cloudflare do not return the usage
export const WorkersAiChatCompleteResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResponse = WorkersAiErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('result' in response) {
        return {
            id: Date.now().toString(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: gatewayRequest.model || '',
            provider: WORKERS_AI,
            choices: [
                {
                    message: { role: 'assistant', content: response.result.response },
                    index: 0,
                    logprobs: null,
                    finish_reason: '',
                },
            ],
        };
    }
    return generateInvalidProviderResponseError(response, WORKERS_AI);
};
export const WorkersAiChatCompleteStreamChunkTransform = (responseChunk, fallbackId, _streamState, _strictOpenAiCompliance, gatewayRequest) => {
    let chunk = responseChunk.trim();
    if (chunk.startsWith('data: [DONE]')) {
        return 'data: [DONE]\n\n';
    }
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    const parsedChunk = JSON.parse(chunk);
    return (`data: ${JSON.stringify({
        id: fallbackId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: gatewayRequest.model || '',
        provider: WORKERS_AI,
        choices: [
            {
                delta: {
                    content: parsedChunk.response,
                },
                index: 0,
                logprobs: null,
                finish_reason: null,
            },
        ],
    })}` + '\n\n');
};
