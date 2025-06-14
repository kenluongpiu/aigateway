import { ANTHROPIC } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { AnthropicErrorResponseTransform, } from './chatComplete';
// TODO: this configuration does not enforce the maximum token limit for the input parameter. If you want to enforce this, you might need to add a custom validation function or a max property to the ParameterConfig interface, and then use it in the input configuration. However, this might be complex because the token count is not a simple length check, but depends on the specific tokenization method used by the model.
export const AnthropicCompleteConfig = {
    model: {
        param: 'model',
        default: 'claude-instant-1',
        required: true,
    },
    prompt: {
        param: 'prompt',
        transform: (params) => `\n\nHuman: ${params.prompt}\n\nAssistant:`,
        required: true,
    },
    max_tokens: {
        param: 'max_tokens_to_sample',
        required: true,
    },
    temperature: {
        param: 'temperature',
        default: 1,
        min: 0,
        max: 1,
    },
    top_p: {
        param: 'top_p',
        default: -1,
        min: -1,
    },
    top_k: {
        param: 'top_k',
        default: -1,
    },
    stop: {
        param: 'stop_sequences',
        transform: (params) => {
            if (params.stop === null) {
                return [];
            }
            return params.stop;
        },
    },
    stream: {
        param: 'stream',
        default: false,
    },
    user: {
        param: 'metadata.user_id',
    },
};
// TODO: The token calculation is wrong atm
export const AnthropicCompleteResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResposne = AnthropicErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    if ('completion' in response) {
        return {
            id: response.log_id,
            object: 'text_completion',
            created: Math.floor(Date.now() / 1000),
            model: response.model,
            provider: ANTHROPIC,
            choices: [
                {
                    text: response.completion,
                    index: 0,
                    logprobs: null,
                    finish_reason: response.stop_reason,
                },
            ],
        };
    }
    return generateInvalidProviderResponseError(response, ANTHROPIC);
};
export const AnthropicCompleteStreamChunkTransform = (responseChunk) => {
    let chunk = responseChunk.trim();
    if (chunk.startsWith('event: ping')) {
        return;
    }
    chunk = chunk.replace(/^event: completion[\r\n]*/, '');
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return chunk;
    }
    const parsedChunk = JSON.parse(chunk);
    return (`data: ${JSON.stringify({
        id: parsedChunk.log_id,
        object: 'text_completion',
        created: Math.floor(Date.now() / 1000),
        model: parsedChunk.model,
        provider: 'anthropic',
        choices: [
            {
                text: parsedChunk.completion,
                index: 0,
                logprobs: null,
                finish_reason: parsedChunk.stop_reason,
            },
        ],
    })}` + '\n\n');
};
