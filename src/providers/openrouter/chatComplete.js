import { OPENROUTER } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const OpenrouterChatCompleteConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'openrouter/auto',
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
    modalities: {
        param: 'modalities',
    },
    reasoning: {
        param: 'reasoning',
    },
    top_p: {
        param: 'top_p',
        default: 1,
        min: 0,
        max: 1,
    },
    tools: {
        param: 'tools',
    },
    tool_choice: {
        param: 'tool_choice',
    },
    transforms: {
        param: 'transforms',
    },
    provider: {
        param: 'provider',
    },
    models: {
        param: 'models',
    },
    usage: {
        param: 'usage',
    },
    stream: {
        param: 'stream',
        default: false,
    },
    response_format: {
        param: 'response_format',
    },
};
export const OpenrouterChatCompleteResponseTransform = (response, responseStatus, _responseHeaders, strictOpenAiCompliance, _gatewayRequestUrl, _gatewayRequest) => {
    if ('message' in response && responseStatus !== 200) {
        return generateErrorResponse({
            message: response.message,
            type: response.type,
            param: response.param,
            code: response.code,
        }, OPENROUTER);
    }
    if ('choices' in response) {
        return {
            id: response.id,
            object: response.object,
            created: response.created,
            model: response.model,
            provider: OPENROUTER,
            choices: response.choices.map((c) => {
                const content_blocks = [];
                if (!strictOpenAiCompliance) {
                    if (c.message.reasoning) {
                        content_blocks.push({
                            type: 'thinking',
                            thinking: c.message.reasoning,
                        });
                    }
                    content_blocks.push({
                        type: 'text',
                        text: c.message.content,
                    });
                }
                return {
                    index: c.index,
                    message: {
                        role: c.message.role,
                        content: c.message.content,
                        ...(content_blocks.length && { content_blocks }),
                        ...(c.message.tool_calls && { tool_calls: c.message.tool_calls }),
                    },
                    finish_reason: c.finish_reason,
                };
            }),
            usage: response.usage,
        };
    }
    return generateInvalidProviderResponseError(response, OPENROUTER);
};
export const OpenrouterChatCompleteStreamChunkTransform = (responseChunk, fallbackId, _streamState, strictOpenAiCompliance, gatewayRequest) => {
    let chunk = responseChunk.trim();
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return `data: ${chunk}\n\n`;
    }
    if (chunk.includes('OPENROUTER PROCESSING')) {
        chunk = JSON.stringify({
            id: `${Date.now()}`,
            model: gatewayRequest.model || '',
            object: 'chat.completion.chunk',
            created: Date.now(),
            choices: [
                {
                    index: 0,
                    delta: { role: 'assistant', content: '' },
                    finish_reason: null,
                },
            ],
        });
    }
    const parsedChunk = JSON.parse(chunk);
    const content_blocks = [];
    if (!strictOpenAiCompliance) {
        // add the reasoning first
        if (parsedChunk.choices?.[0]?.delta?.reasoning) {
            content_blocks.push({
                index: parsedChunk.choices?.[0]?.index,
                delta: {
                    thinking: parsedChunk.choices?.[0]?.delta?.reasoning,
                },
            });
        }
        // then add the content
        if (parsedChunk.choices?.[0]?.delta?.content) {
            content_blocks.push({
                index: parsedChunk.choices?.[0]?.index,
                delta: {
                    text: parsedChunk.choices?.[0]?.delta?.content,
                },
            });
        }
    }
    return (`data: ${JSON.stringify({
        id: parsedChunk.id,
        object: parsedChunk.object,
        created: parsedChunk.created,
        model: parsedChunk.model,
        provider: OPENROUTER,
        choices: [
            {
                index: parsedChunk.choices?.[0]?.index,
                delta: {
                    ...parsedChunk.choices?.[0]?.delta,
                    ...(content_blocks.length && { content_blocks }),
                },
                finish_reason: parsedChunk.choices?.[0]?.finish_reason,
            },
        ],
        ...(parsedChunk.usage && { usage: parsedChunk.usage }),
    })}` + '\n\n');
};
