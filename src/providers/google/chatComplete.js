import { GOOGLE } from '../../globals';
import { SYSTEM_MESSAGE_ROLES, MESSAGE_ROLES, } from '../../types/requestBody';
import { buildGoogleSearchRetrievalTool } from '../google-vertex-ai/chatComplete';
import { derefer, getMimeType, recursivelyDeleteUnsupportedParameters, transformVertexLogprobs, } from '../google-vertex-ai/utils';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
const transformGenerationConfig = (params) => {
    const generationConfig = {};
    if (params['temperature']) {
        generationConfig['temperature'] = params['temperature'];
    }
    if (params['top_p']) {
        generationConfig['topP'] = params['top_p'];
    }
    if (params['top_k']) {
        generationConfig['topK'] = params['top_k'];
    }
    if (params['max_tokens']) {
        generationConfig['maxOutputTokens'] = params['max_tokens'];
    }
    if (params['max_completion_tokens']) {
        generationConfig['maxOutputTokens'] = params['max_completion_tokens'];
    }
    if (params['stop']) {
        generationConfig['stopSequences'] = params['stop'];
    }
    if (params?.response_format?.type === 'json_object') {
        generationConfig['responseMimeType'] = 'application/json';
    }
    if (params['logprobs']) {
        generationConfig['responseLogprobs'] = params['logprobs'];
    }
    if (params['top_logprobs']) {
        generationConfig['logprobs'] = params['top_logprobs']; // range 1-5, openai supports 1-20
    }
    if (params?.response_format?.type === 'json_schema') {
        generationConfig['responseMimeType'] = 'application/json';
        recursivelyDeleteUnsupportedParameters(params?.response_format?.json_schema?.schema);
        let schema = params?.response_format?.json_schema?.schema ??
            params?.response_format?.json_schema;
        if (Object.keys(schema).includes('$defs')) {
            schema = derefer(schema);
            delete schema['$defs'];
        }
        generationConfig['responseSchema'] = schema;
    }
    if (params?.thinking) {
        const thinkingConfig = {};
        thinkingConfig['include_thoughts'] = true;
        thinkingConfig['thinking_budget'] = params.thinking.budget_tokens;
        generationConfig['thinking_config'] = thinkingConfig;
    }
    return generationConfig;
};
// models for which systemInstruction is not supported
export const SYSTEM_INSTRUCTION_DISABLED_MODELS = [
    'gemini-1.0-pro',
    'gemini-1.0-pro-001',
    'gemini-1.0-pro-latest',
    'gemini-1.0-pro-vision-latest',
    'gemini-pro',
    'gemini-pro-vision',
];
export const transformOpenAIRoleToGoogleRole = (role) => {
    switch (role) {
        case 'assistant':
            return 'model';
        case 'tool':
            return 'function';
        case 'developer':
            return 'system';
        default:
            return role;
    }
};
export const transformToolChoiceForGemini = (tool_choice) => {
    if (typeof tool_choice === 'object' && tool_choice.type === 'function')
        return 'ANY';
    if (typeof tool_choice === 'string') {
        switch (tool_choice) {
            case 'auto':
                return 'AUTO';
            case 'none':
                return 'NONE';
            case 'required':
                return 'ANY';
        }
    }
    return undefined;
};
// TODOS: this configuration does not enforce the maximum token limit for the input parameter. If you want to enforce this, you might need to add a custom validation function or a max property to the ParameterConfig interface, and then use it in the input configuration. However, this might be complex because the token count is not a simple length check, but depends on the specific tokenization method used by the model.
export const GoogleChatCompleteConfig = {
    model: {
        param: 'model',
        required: true,
        default: 'gemini-1.5-pro',
    },
    messages: [
        {
            param: 'contents',
            default: '',
            transform: (params) => {
                let lastRole;
                const messages = [];
                params.messages?.forEach((message) => {
                    // From gemini-1.5 onwards, systemInstruction is supported
                    // Skipping system message and sending it in systemInstruction for gemini 1.5 models
                    if (SYSTEM_MESSAGE_ROLES.includes(message.role) &&
                        !SYSTEM_INSTRUCTION_DISABLED_MODELS.includes(params.model))
                        return;
                    const role = transformOpenAIRoleToGoogleRole(message.role);
                    let parts = [];
                    if (message.role === 'assistant' && message.tool_calls) {
                        message.tool_calls.forEach((tool_call) => {
                            parts.push({
                                functionCall: {
                                    name: tool_call.function.name,
                                    args: JSON.parse(tool_call.function.arguments),
                                },
                            });
                        });
                    }
                    else if (message.role === 'tool' &&
                        typeof message.content === 'string') {
                        parts.push({
                            functionResponse: {
                                name: message.name ?? 'gateway-tool-filler-name',
                                response: {
                                    content: message.content,
                                },
                            },
                        });
                    }
                    else if (message.content && typeof message.content === 'object') {
                        message.content.forEach((c) => {
                            if (c.type === 'text') {
                                parts.push({
                                    text: c.text,
                                });
                            }
                            if (c.type === 'image_url') {
                                const { url, mime_type: passedMimeType } = c.image_url || {};
                                if (!url)
                                    return;
                                if (url.startsWith('data:')) {
                                    const [mimeTypeWithPrefix, base64Image] = url.split(';base64,');
                                    const mimeType = mimeTypeWithPrefix.split(':')[1];
                                    parts.push({
                                        inlineData: {
                                            mimeType: mimeType,
                                            data: base64Image,
                                        },
                                    });
                                }
                                else if (url.startsWith('gs://') ||
                                    url.startsWith('https://') ||
                                    url.startsWith('http://')) {
                                    parts.push({
                                        fileData: {
                                            mimeType: passedMimeType || getMimeType(url),
                                            fileUri: url,
                                        },
                                    });
                                }
                                else {
                                    // NOTE: This block is kept to maintain backward compatibility
                                    // Earlier we were assuming that all images will be base64 with image/jpeg mimeType
                                    parts.push({
                                        inlineData: {
                                            mimeType: 'image/jpeg',
                                            data: c.image_url?.url,
                                        },
                                    });
                                }
                            }
                        });
                    }
                    else if (typeof message.content === 'string') {
                        parts.push({
                            text: message.content,
                        });
                    }
                    // @NOTE: This takes care of the "Please ensure that multiturn requests alternate between user and model."
                    // error that occurs when we have multiple user messages in a row.
                    const shouldCombineMessages = lastRole === role && !params.model?.includes('vision');
                    if (shouldCombineMessages) {
                        messages[messages.length - 1].parts.push(...parts);
                    }
                    else {
                        messages.push({ role, parts });
                    }
                    lastRole = role;
                });
                return messages;
            },
        },
        {
            param: 'systemInstruction',
            default: '',
            transform: (params) => {
                // systemInstruction is only supported from gemini 1.5 models
                if (SYSTEM_INSTRUCTION_DISABLED_MODELS.includes(params.model))
                    return;
                const firstMessage = params.messages?.[0] || null;
                if (!firstMessage)
                    return;
                if (SYSTEM_MESSAGE_ROLES.includes(firstMessage.role) &&
                    typeof firstMessage.content === 'string') {
                    return {
                        parts: [
                            {
                                text: firstMessage.content,
                            },
                        ],
                        role: 'system',
                    };
                }
                if (SYSTEM_MESSAGE_ROLES.includes(firstMessage.role) &&
                    typeof firstMessage.content === 'object' &&
                    firstMessage.content?.[0]?.text) {
                    return {
                        parts: [
                            {
                                text: firstMessage.content?.[0].text,
                            },
                        ],
                        role: 'system',
                    };
                }
                return;
            },
        },
    ],
    temperature: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    top_p: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    top_k: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    max_tokens: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    max_completion_tokens: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    stop: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    response_format: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    logprobs: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    top_logprobs: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
    tools: {
        param: 'tools',
        default: '',
        transform: (params) => {
            const functionDeclarations = [];
            const tools = [];
            params.tools?.forEach((tool) => {
                if (tool.type === 'function') {
                    // these are not supported by google
                    recursivelyDeleteUnsupportedParameters(tool.function?.parameters);
                    delete tool.function?.strict;
                    if (['googleSearch', 'google_search'].includes(tool.function.name)) {
                        tools.push({ googleSearch: {} });
                    }
                    else if (['googleSearchRetrieval', 'google_search_retrieval'].includes(tool.function.name)) {
                        tools.push(buildGoogleSearchRetrievalTool(tool));
                    }
                    else {
                        functionDeclarations.push(tool.function);
                    }
                }
            });
            if (functionDeclarations.length) {
                tools.push({ functionDeclarations });
            }
            return tools;
        },
    },
    tool_choice: {
        param: 'tool_config',
        default: '',
        transform: (params) => {
            if (params.tool_choice) {
                const allowedFunctionNames = [];
                if (typeof params.tool_choice === 'object' &&
                    params.tool_choice.type === 'function') {
                    allowedFunctionNames.push(params.tool_choice.function.name);
                }
                const toolConfig = {
                    function_calling_config: {
                        mode: transformToolChoiceForGemini(params.tool_choice),
                    },
                };
                if (allowedFunctionNames.length > 0) {
                    toolConfig.function_calling_config.allowed_function_names =
                        allowedFunctionNames;
                }
                return toolConfig;
            }
        },
    },
    thinking: {
        param: 'generationConfig',
        transform: (params) => transformGenerationConfig(params),
    },
};
export const GoogleErrorResponseTransform = (response, provider = GOOGLE) => {
    if ('error' in response) {
        return generateErrorResponse({
            message: response.error.message ?? '',
            type: response.error.status ?? null,
            param: null,
            code: response.error.code ?? null,
        }, provider);
    }
    return undefined;
};
export const GoogleChatCompleteResponseTransform = (response, responseStatus, _responseHeaders, strictOpenAiCompliance) => {
    if (responseStatus !== 200) {
        const errorResponse = GoogleErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('candidates' in response) {
        return {
            id: 'portkey-' + crypto.randomUUID(),
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: response.modelVersion,
            provider: 'google',
            choices: response.candidates?.map((generation, idx) => {
                // transform tool calls and content by iterating over the content parts
                let toolCalls = [];
                let content;
                for (const part of generation.content?.parts ?? []) {
                    if (part.functionCall) {
                        toolCalls.push({
                            id: 'portkey-' + crypto.randomUUID(),
                            type: 'function',
                            function: {
                                name: part.functionCall.name,
                                arguments: JSON.stringify(part.functionCall.args),
                            },
                        });
                    }
                    else if (part.text) {
                        // if content is already set to the chain of thought message and the user requires both the CoT message and the completion, we need to append the completion to the CoT message
                        if (content?.length && !strictOpenAiCompliance) {
                            content += '\r\n\r\n' + part.text;
                        }
                        else {
                            // if content is already set to CoT, but user requires only the completion, we need to set content to the completion
                            content = part.text;
                        }
                    }
                }
                const message = {
                    role: MESSAGE_ROLES.ASSISTANT,
                    ...(toolCalls.length && { tool_calls: toolCalls }),
                    ...(content && { content }),
                };
                const logprobsContent = transformVertexLogprobs(generation);
                let logprobs;
                if (logprobsContent) {
                    logprobs = {
                        content: logprobsContent,
                    };
                }
                return {
                    message: message,
                    logprobs,
                    index: generation.index ?? idx,
                    finish_reason: generation.finishReason,
                    ...(!strictOpenAiCompliance && generation.groundingMetadata
                        ? { groundingMetadata: generation.groundingMetadata }
                        : {}),
                };
            }) ?? [],
            usage: {
                prompt_tokens: response.usageMetadata.promptTokenCount,
                completion_tokens: response.usageMetadata.candidatesTokenCount,
                total_tokens: response.usageMetadata.totalTokenCount,
            },
        };
    }
    return generateInvalidProviderResponseError(response, GOOGLE);
};
export const GoogleChatCompleteStreamChunkTransform = (responseChunk, fallbackId, streamState, strictOpenAiCompliance) => {
    streamState.containsChainOfThoughtMessage =
        streamState?.containsChainOfThoughtMessage ?? false;
    let chunk = responseChunk.trim();
    if (chunk.startsWith('[')) {
        chunk = chunk.slice(1);
    }
    if (chunk.endsWith(',')) {
        chunk = chunk.slice(0, chunk.length - 1);
    }
    if (chunk.endsWith(']')) {
        chunk = chunk.slice(0, chunk.length - 2);
    }
    chunk = chunk.replace(/^data: /, '');
    chunk = chunk.trim();
    if (chunk === '[DONE]') {
        return `data: ${chunk}\n\n`;
    }
    const parsedChunk = JSON.parse(chunk);
    let usageMetadata;
    if (parsedChunk.usageMetadata) {
        usageMetadata = {
            prompt_tokens: parsedChunk.usageMetadata.promptTokenCount,
            completion_tokens: parsedChunk.usageMetadata.candidatesTokenCount,
            total_tokens: parsedChunk.usageMetadata.totalTokenCount,
        };
    }
    return (`data: ${JSON.stringify({
        id: fallbackId,
        object: 'chat.completion.chunk',
        created: Math.floor(Date.now() / 1000),
        model: parsedChunk.modelVersion,
        provider: 'google',
        choices: parsedChunk.candidates?.map((generation, index) => {
            let message = { role: 'assistant', content: '' };
            if (generation.content?.parts[0]?.text) {
                if (generation.content.parts[0].thought)
                    streamState.containsChainOfThoughtMessage = true;
                let content = strictOpenAiCompliance &&
                    streamState.containsChainOfThoughtMessage
                    ? ''
                    : generation.content.parts[0]?.text;
                if (generation.content.parts[1]?.text) {
                    if (strictOpenAiCompliance)
                        content = generation.content.parts[1].text;
                    else
                        content += '\r\n\r\n' + generation.content.parts[1]?.text;
                    streamState.containsChainOfThoughtMessage = false;
                }
                else if (streamState.containsChainOfThoughtMessage &&
                    !generation.content.parts[0]?.thought) {
                    if (strictOpenAiCompliance)
                        content = generation.content.parts[0].text;
                    else
                        content = '\r\n\r\n' + content;
                    streamState.containsChainOfThoughtMessage = false;
                }
                message = {
                    role: 'assistant',
                    content,
                };
            }
            else if (generation.content.parts[0]?.functionCall) {
                message = {
                    role: 'assistant',
                    tool_calls: generation.content.parts.map((part, idx) => {
                        if (part.functionCall) {
                            return {
                                index: idx,
                                id: 'portkey-' + crypto.randomUUID(),
                                type: 'function',
                                function: {
                                    name: part.functionCall.name,
                                    arguments: JSON.stringify(part.functionCall.args),
                                },
                            };
                        }
                    }),
                };
            }
            return {
                delta: message,
                index: generation.index ?? index,
                finish_reason: generation.finishReason,
                ...(!strictOpenAiCompliance && generation.groundingMetadata
                    ? { groundingMetadata: generation.groundingMetadata }
                    : {}),
            };
        }) ?? [],
        ...(parsedChunk.usageMetadata?.candidatesTokenCount && {
            usage: usageMetadata,
        }),
    })}` + '\n\n');
};
