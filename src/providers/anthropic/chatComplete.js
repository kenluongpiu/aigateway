import { ANTHROPIC, fileExtensionMimeTypeMap } from '../../globals';
import { SYSTEM_MESSAGE_ROLES, } from '../../types/requestBody';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
const transformAssistantMessage = (msg) => {
    let transformedContent = [];
    let inputContent = msg.content_blocks ?? msg.content;
    const containsToolCalls = msg.tool_calls && msg.tool_calls.length;
    if (inputContent && typeof inputContent === 'string') {
        transformedContent.push({
            type: 'text',
            text: inputContent,
        });
    }
    else if (inputContent &&
        typeof inputContent === 'object' &&
        inputContent.length) {
        inputContent.forEach((item) => {
            if (item.type !== 'tool_use') {
                transformedContent.push(item);
            }
        });
    }
    if (containsToolCalls) {
        msg.tool_calls.forEach((toolCall) => {
            transformedContent.push({
                type: 'tool_use',
                name: toolCall.function.name,
                id: toolCall.id,
                input: JSON.parse(toolCall.function.arguments),
            });
        });
    }
    return {
        role: msg.role,
        content: transformedContent,
    };
};
const transformToolMessage = (msg) => {
    const tool_use_id = msg.tool_call_id ?? '';
    return {
        role: 'user',
        content: [
            {
                type: 'tool_result',
                tool_use_id,
                content: msg.content,
            },
        ],
    };
};
const transformAndAppendImageContentItem = (item, transformedMessage) => {
    if (!item?.image_url?.url || typeof transformedMessage.content === 'string')
        return;
    const url = item.image_url.url;
    const isBase64EncodedImage = url.startsWith('data:');
    if (!isBase64EncodedImage) {
        transformedMessage.content.push({
            type: 'image',
            source: {
                type: 'url',
                url,
            },
        });
    }
    else {
        const parts = url.split(';');
        if (parts.length === 2) {
            const base64ImageParts = parts[1].split(',');
            const base64Image = base64ImageParts[1];
            const mediaTypeParts = parts[0].split(':');
            if (mediaTypeParts.length === 2 && base64Image) {
                const mediaType = mediaTypeParts[1];
                transformedMessage.content.push({
                    type: mediaType === fileExtensionMimeTypeMap.pdf ? 'document' : 'image',
                    source: {
                        type: 'base64',
                        media_type: mediaType,
                        data: base64Image,
                    },
                    ...(item.cache_control && {
                        cache_control: { type: 'ephemeral' },
                    }),
                });
            }
        }
    }
};
const transformAndAppendFileContentItem = (item, transformedMessage) => {
    const mimeType = item.file?.mime_type ||
        fileExtensionMimeTypeMap.pdf;
    if (item.file?.file_url) {
        transformedMessage.content.push({
            type: 'document',
            source: {
                type: 'url',
                url: item.file.file_url,
            },
        });
    }
    else if (item.file?.file_data) {
        const contentType = mimeType === fileExtensionMimeTypeMap.txt ? 'text' : 'base64';
        transformedMessage.content.push({
            type: 'document',
            source: {
                type: contentType,
                data: item.file.file_data,
                media_type: mimeType,
            },
        });
    }
};
export const AnthropicChatCompleteConfig = {
    model: {
        param: 'model',
        default: 'claude-2.1',
        required: true,
    },
    messages: [
        {
            param: 'messages',
            required: true,
            transform: (params) => {
                let messages = [];
                // Transform the chat messages into a simple prompt
                if (!!params.messages) {
                    params.messages.forEach((msg) => {
                        if (SYSTEM_MESSAGE_ROLES.includes(msg.role))
                            return;
                        if (msg.role === 'assistant') {
                            messages.push(transformAssistantMessage(msg));
                        }
                        else if (msg.content &&
                            typeof msg.content === 'object' &&
                            msg.content.length) {
                            const transformedMessage = {
                                role: msg.role,
                                content: [],
                            };
                            msg.content.forEach((item) => {
                                if (item.type === 'text') {
                                    transformedMessage.content.push({
                                        type: item.type,
                                        text: item.text,
                                        ...(item.cache_control && {
                                            cache_control: { type: 'ephemeral' },
                                        }),
                                    });
                                }
                                else if (item.type === 'image_url') {
                                    transformAndAppendImageContentItem(item, transformedMessage);
                                }
                                else if (item.type === 'file') {
                                    transformAndAppendFileContentItem(item, transformedMessage);
                                }
                            });
                            messages.push(transformedMessage);
                        }
                        else if (msg.role === 'tool') {
                            // even though anthropic supports images in tool results, openai doesn't support it yet
                            messages.push(transformToolMessage(msg));
                        }
                        else {
                            messages.push({
                                role: msg.role,
                                content: msg.content,
                            });
                        }
                    });
                }
                return messages;
            },
        },
        {
            param: 'system',
            required: false,
            transform: (params) => {
                let systemMessages = [];
                // Transform the chat messages into a simple prompt
                if (!!params.messages) {
                    params.messages.forEach((msg) => {
                        if (SYSTEM_MESSAGE_ROLES.includes(msg.role) &&
                            msg.content &&
                            typeof msg.content === 'object' &&
                            msg.content[0].text) {
                            msg.content.forEach((_msg) => {
                                systemMessages.push({
                                    text: _msg.text,
                                    type: 'text',
                                    ...(_msg?.cache_control && {
                                        cache_control: { type: 'ephemeral' },
                                    }),
                                });
                            });
                        }
                        else if (SYSTEM_MESSAGE_ROLES.includes(msg.role) &&
                            typeof msg.content === 'string') {
                            systemMessages.push({
                                text: msg.content,
                                type: 'text',
                            });
                        }
                    });
                }
                return systemMessages;
            },
        },
    ],
    tools: {
        param: 'tools',
        required: false,
        transform: (params) => {
            let tools = [];
            if (params.tools) {
                params.tools.forEach((tool) => {
                    if (tool.function) {
                        tools.push({
                            name: tool.function.name,
                            description: tool.function?.description || '',
                            input_schema: {
                                type: tool.function.parameters?.type || 'object',
                                properties: tool.function.parameters?.properties || {},
                                required: tool.function.parameters?.required || [],
                            },
                            ...(tool.cache_control && {
                                cache_control: { type: 'ephemeral' },
                            }),
                        });
                    }
                });
            }
            return tools;
        },
    },
    // None is not supported by Anthropic, defaults to auto
    tool_choice: {
        param: 'tool_choice',
        required: false,
        transform: (params) => {
            if (params.tool_choice) {
                if (typeof params.tool_choice === 'string') {
                    if (params.tool_choice === 'required')
                        return { type: 'any' };
                    else if (params.tool_choice === 'auto')
                        return { type: 'auto' };
                }
                else if (typeof params.tool_choice === 'object') {
                    return { type: 'tool', name: params.tool_choice.function.name };
                }
            }
            return null;
        },
    },
    max_tokens: {
        param: 'max_tokens',
        required: true,
    },
    max_completion_tokens: {
        param: 'max_tokens',
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
    },
    stream: {
        param: 'stream',
        default: false,
    },
    user: {
        param: 'metadata.user_id',
    },
    thinking: {
        param: 'thinking',
        required: false,
    },
};
export const AnthropicErrorResponseTransform = (response) => {
    if ('error' in response) {
        return generateErrorResponse({
            message: response.error?.message,
            type: response.error?.type,
            param: null,
            code: null,
        }, ANTHROPIC);
    }
    return undefined;
};
// TODO: The token calculation is wrong atm
export const AnthropicChatCompleteResponseTransform = (response, responseStatus, _responseHeaders, strictOpenAiCompliance) => {
    if (responseStatus !== 200) {
        const errorResposne = AnthropicErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    if ('content' in response) {
        const { input_tokens = 0, output_tokens = 0, cache_creation_input_tokens, cache_read_input_tokens, } = response?.usage;
        const shouldSendCacheUsage = cache_creation_input_tokens || cache_read_input_tokens;
        let content = '';
        response.content.forEach((item) => {
            if (item.type === 'text') {
                content += item.text;
            }
        });
        let toolCalls = [];
        response.content.forEach((item) => {
            if (item.type === 'tool_use') {
                toolCalls.push({
                    id: item.id,
                    type: 'function',
                    function: {
                        name: item.name,
                        arguments: JSON.stringify(item.input),
                    },
                });
            }
        });
        return {
            id: response.id,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: response.model,
            provider: ANTHROPIC,
            choices: [
                {
                    message: {
                        role: 'assistant',
                        content,
                        ...(!strictOpenAiCompliance && {
                            content_blocks: response.content.filter((item) => item.type !== 'tool_use'),
                        }),
                        tool_calls: toolCalls.length ? toolCalls : undefined,
                    },
                    index: 0,
                    logprobs: null,
                    finish_reason: response.stop_reason,
                },
            ],
            usage: {
                prompt_tokens: input_tokens,
                completion_tokens: output_tokens,
                total_tokens: input_tokens +
                    output_tokens +
                    (cache_creation_input_tokens ?? 0) +
                    (cache_read_input_tokens ?? 0),
                ...(shouldSendCacheUsage && {
                    cache_read_input_tokens: cache_read_input_tokens,
                    cache_creation_input_tokens: cache_creation_input_tokens,
                }),
            },
        };
    }
    return generateInvalidProviderResponseError(response, ANTHROPIC);
};
export const AnthropicChatCompleteStreamChunkTransform = (responseChunk, fallbackId, streamState, strictOpenAiCompliance) => {
    let chunk = responseChunk.trim();
    if (chunk.startsWith('event: ping') ||
        chunk.startsWith('event: content_block_stop')) {
        return;
    }
    if (chunk.startsWith('event: message_stop')) {
        return 'data: [DONE]\n\n';
    }
    chunk = chunk.replace(/^event: content_block_delta[\r\n]*/, '');
    chunk = chunk.replace(/^event: content_block_start[\r\n]*/, '');
    chunk = chunk.replace(/^event: message_delta[\r\n]*/, '');
    chunk = chunk.replace(/^event: message_start[\r\n]*/, '');
    chunk = chunk.replace(/^event: error[\r\n]*/, '');
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    const parsedChunk = JSON.parse(chunk);
    if (parsedChunk.type === 'error' && parsedChunk.error) {
        return (`data: ${JSON.stringify({
            id: fallbackId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: '',
            provider: ANTHROPIC,
            choices: [
                {
                    finish_reason: parsedChunk.error.type,
                    delta: {
                        content: '',
                    },
                },
            ],
        })}` +
            '\n\n' +
            'data: [DONE]\n\n');
    }
    const shouldSendCacheUsage = parsedChunk.message?.usage?.cache_read_input_tokens ||
        parsedChunk.message?.usage?.cache_creation_input_tokens;
    if (parsedChunk.type === 'message_start' && parsedChunk.message?.usage) {
        streamState.model = parsedChunk?.message?.model ?? '';
        streamState.usage = {
            prompt_tokens: parsedChunk.message?.usage?.input_tokens,
            ...(shouldSendCacheUsage && {
                cache_read_input_tokens: parsedChunk.message?.usage?.cache_read_input_tokens,
                cache_creation_input_tokens: parsedChunk.message?.usage?.cache_creation_input_tokens,
            }),
        };
        return (`data: ${JSON.stringify({
            id: fallbackId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: streamState.model,
            provider: ANTHROPIC,
            choices: [
                {
                    delta: {
                        content: '',
                    },
                    index: 0,
                    logprobs: null,
                    finish_reason: null,
                },
            ],
        })}` + '\n\n');
    }
    if (parsedChunk.type === 'message_delta' && parsedChunk.usage) {
        const totalTokens = (streamState?.usage?.prompt_tokens ?? 0) +
            (streamState?.usage?.cache_creation_input_tokens ?? 0) +
            (streamState?.usage?.cache_read_input_tokens ?? 0) +
            (parsedChunk.usage.output_tokens ?? 0);
        return (`data: ${JSON.stringify({
            id: fallbackId,
            object: 'chat.completion.chunk',
            created: Math.floor(Date.now() / 1000),
            model: streamState.model,
            provider: ANTHROPIC,
            choices: [
                {
                    index: 0,
                    delta: {},
                    finish_reason: parsedChunk.delta?.stop_reason,
                },
            ],
            usage: {
                completion_tokens: parsedChunk.usage?.output_tokens,
                ...streamState.usage,
                total_tokens: totalTokens,
            },
        })}` + '\n\n');
    }
    const toolCalls = [];
    const isToolBlockStart = parsedChunk.type === 'content_block_start' &&
        parsedChunk.content_block?.type === 'tool_use';
    if (isToolBlockStart) {
        streamState.toolIndex = streamState.toolIndex
            ? streamState.toolIndex + 1
            : 0;
    }
    const isToolBlockDelta = parsedChunk.type === 'content_block_delta' &&
        parsedChunk.delta?.partial_json != undefined;
    if (isToolBlockStart && parsedChunk.content_block) {
        toolCalls.push({
            index: streamState.toolIndex,
            id: parsedChunk.content_block.id,
            type: 'function',
            function: {
                name: parsedChunk.content_block.name,
                arguments: '',
            },
        });
    }
    else if (isToolBlockDelta) {
        toolCalls.push({
            index: streamState.toolIndex,
            function: {
                arguments: parsedChunk.delta.partial_json,
            },
        });
    }
    const content = parsedChunk.delta?.text;
    const contentBlockObject = {
        index: parsedChunk.index,
        delta: parsedChunk.delta ?? parsedChunk.content_block ?? {},
    };
    delete contentBlockObject.delta.type;
    return (`data: ${JSON.stringify({
        id: fallbackId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: streamState.model,
        provider: ANTHROPIC,
        choices: [
            {
                delta: {
                    content,
                    tool_calls: toolCalls.length ? toolCalls : undefined,
                    ...(!strictOpenAiCompliance &&
                        !toolCalls.length && {
                        content_blocks: [contentBlockObject],
                    }),
                },
                index: 0,
                logprobs: null,
                finish_reason: parsedChunk.delta?.stop_reason ?? null,
            },
        ],
    })}` + '\n\n');
};
