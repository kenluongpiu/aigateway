import { WORKERS_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { WorkersAiErrorResponseTransform, } from './utils';
export const WorkersAiCompleteConfig = {
    prompt: {
        param: 'prompt',
        transform: (params) => `\n\nHuman: ${params.prompt}\n\nAssistant:`,
        required: true,
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
};
export const WorkersAiCompleteResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResponse = WorkersAiErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('result' in response) {
        return {
            id: Date.now().toString(),
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: gatewayRequest.model || '',
            provider: WORKERS_AI,
            choices: [
                {
                    text: response.result.response,
                    index: 0,
                    logprobs: null,
                    finish_reason: '',
                },
            ],
        };
    }
    return generateInvalidProviderResponseError(response, WORKERS_AI);
};
export const WorkersAiCompleteStreamChunkTransform = (responseChunk, fallbackId, _streamState, strictOpenAiCompliance, gatewayRequest) => {
    let chunk = responseChunk.trim();
    if (chunk.startsWith('data: [DONE]')) {
        return 'data: [DONE]\n\n';
    }
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    const parsedChunk = JSON.parse(chunk);
    return (`data: ${JSON.stringify({
        id: fallbackId,
        object: 'text_completion',
        created: Math.floor(Date.now() / 1000),
        model: gatewayRequest.model || '',
        provider: WORKERS_AI,
        choices: [
            {
                text: parsedChunk.response,
                index: 0,
                logprobs: null,
                finish_reason: '',
            },
        ],
    })}` + '\n\n');
};
