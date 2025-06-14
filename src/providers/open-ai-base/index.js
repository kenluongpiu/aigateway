import { OPEN_AI } from '../../globals';
import { OpenAIErrorResponseTransform } from '../openai/utils';
import { OpenAICreateModelResponseConfig } from './createModelResponse';
const excludeObjectKeys = (keyList, object) => {
    if (keyList) {
        keyList.forEach((excludeKey) => {
            if (Object.hasOwn(object, excludeKey)) {
                delete object[excludeKey];
            }
        });
    }
};
/**
 *
 * @param exclude List of string that we should exclude from open-ai default paramters
 * @param defaultValues Default values specific to the provider for params
 * @param extra Extra parameters type of ProviderConfig should extend to support the provider
 * @returns {ProviderConfig}
 */
export const chatCompleteParams = (exclude, defaultValues, extra) => {
    const baseParams = {
        model: {
            param: 'model',
            required: true,
            ...(defaultValues?.model && { default: defaultValues.model }),
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
        functions: {
            param: 'functions',
        },
        function_call: {
            param: 'function_call',
        },
        max_tokens: {
            param: 'max_tokens',
            ...(defaultValues?.max_tokens && { default: defaultValues.max_tokens }),
            min: 0,
        },
        temperature: {
            param: 'temperature',
            ...(defaultValues?.temperature && { default: defaultValues.temperature }),
            min: 0,
            max: 2,
        },
        top_p: {
            param: 'top_p',
            ...(defaultValues?.top_p && { default: defaultValues.top_p }),
            min: 0,
            max: 1,
        },
        n: {
            param: 'n',
            default: 1,
        },
        stream: {
            param: 'stream',
            ...(defaultValues?.stream && { default: defaultValues.stream }),
        },
        presence_penalty: {
            param: 'presence_penalty',
            min: -2,
            max: 2,
        },
        frequency_penalty: {
            param: 'frequency_penalty',
            min: -2,
            max: 2,
        },
        logit_bias: {
            param: 'logit_bias',
        },
        user: {
            param: 'user',
        },
        seed: {
            param: 'seed',
        },
        tools: {
            param: 'tools',
        },
        tool_choice: {
            param: 'tool_choice',
        },
        response_format: {
            param: 'response_format',
        },
        logprobs: {
            param: 'logprobs',
            ...(defaultValues?.logprobs && { default: defaultValues?.logprobs }),
        },
        stream_options: {
            param: 'stream_options',
        },
    };
    // Exclude params that are not needed.
    excludeObjectKeys(exclude, baseParams);
    return { ...baseParams, ...(extra ?? {}) };
};
/**
 *
 * @param exclude List of string that we should exclude from open-ai default paramters
 * @param defaultValues Default values specific to the provider for params
 * @param extra Extra parameters type of ProviderConfig should extend to support the provider
 * @returns {ProviderConfig}
 */
export const completeParams = (exclude, defaultValues, extra) => {
    const baseParams = {
        model: {
            param: 'model',
            required: true,
            ...(defaultValues?.model && { default: defaultValues.model }),
        },
        prompt: {
            param: 'prompt',
            default: '',
        },
        max_tokens: {
            param: 'max_tokens',
            ...(defaultValues?.max_tokens && { default: defaultValues.max_tokens }),
            min: 0,
        },
        temperature: {
            param: 'temperature',
            ...(defaultValues?.temperature && { default: defaultValues.temperature }),
            min: 0,
            max: 2,
        },
        top_p: {
            param: 'top_p',
            ...(defaultValues?.top_p && { default: defaultValues.top_p }),
            min: 0,
            max: 1,
        },
        n: {
            param: 'n',
            default: 1,
        },
        stream: {
            param: 'stream',
            ...(defaultValues?.stream && { default: defaultValues.stream }),
        },
        logprobs: {
            param: 'logprobs',
            max: 5,
        },
        echo: {
            param: 'echo',
            default: false,
        },
        stop: {
            param: 'stop',
        },
        presence_penalty: {
            param: 'presence_penalty',
            min: -2,
            max: 2,
        },
        frequency_penalty: {
            param: 'frequency_penalty',
            min: -2,
            max: 2,
        },
        best_of: {
            param: 'best_of',
        },
        logit_bias: {
            param: 'logit_bias',
        },
        user: {
            param: 'user',
        },
        seed: {
            param: 'seed',
        },
        suffix: {
            param: 'suffix',
        },
    };
    excludeObjectKeys(exclude, baseParams);
    return { ...baseParams, ...(extra ?? {}) };
};
export const embedParams = (exclude, defaultValues, extra) => {
    const baseParams = {
        model: {
            param: 'model',
            required: true,
            ...(defaultValues?.model && { default: defaultValues.model }),
        },
        input: {
            param: 'input',
            required: true,
        },
        encoding_format: {
            param: 'encoding_format',
        },
        dimensions: {
            param: 'dimensions',
        },
        user: {
            param: 'user',
        },
    };
    excludeObjectKeys(exclude, baseParams);
    return { ...baseParams, ...(extra ?? {}) };
};
export const createSpeechParams = (exclude, defaultValues, extra) => {
    const baseParams = {
        model: {
            param: 'model',
            required: true,
            default: 'tts-1',
        },
        input: {
            param: 'input',
            required: true,
        },
        voice: {
            param: 'voice',
            required: true,
            default: 'alloy',
        },
        response_format: {
            param: 'response_format',
            required: false,
            default: 'mp3',
        },
        speed: {
            param: 'speed',
            required: false,
            default: 1,
        },
    };
    excludeObjectKeys(exclude, baseParams);
    return { ...baseParams, ...(extra ?? {}) };
};
export const createModelResponseParams = (exclude, defaultValues = {}, extra) => {
    const baseParams = {
        ...OpenAICreateModelResponseConfig,
    };
    excludeObjectKeys(exclude, baseParams);
    // Object.keys(defaultValues).forEach((key) => {
    //   if (Object.hasOwn(baseParams, key) && !Array.isArray(baseParams[key])) {
    //     baseParams[key].default = defaultValues[key];
    //   }
    // });
    return { ...baseParams, ...(extra ?? {}) };
};
const EmbedResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            return OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
const CompleteResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(errorResponse, true);
            }
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
const CreateSpeechResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(errorResponse, true);
            }
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
const ChatCompleteResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(response, true);
            }
            return errorResponse;
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
export const OpenAICreateModelResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(response, true);
            }
            return errorResponse;
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
export const OpenAIGetModelResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(response, true);
            }
            return errorResponse;
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
export const OpenAIDeleteModelResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(response, true);
            }
            return errorResponse;
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
export const OpenAIListInputItemsResponseTransformer = (provider, customTransformer) => {
    const transformer = (response, responseStatus) => {
        if (responseStatus !== 200 && 'error' in response) {
            const errorResponse = OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
            if (customTransformer) {
                return customTransformer(response, true);
            }
            return errorResponse;
        }
        if (customTransformer) {
            return customTransformer(response);
        }
        Object.defineProperty(response, 'provider', {
            value: provider,
            enumerable: true,
        });
        return response;
    };
    return transformer;
};
/**
 *
 * @param provider Provider value
 * @param options Enable transformer functions to specific task (complete, chatComplete or embed)
 * @returns
 */
export const responseTransformers = (provider, options) => {
    const transformers = {
        complete: null,
        chatComplete: null,
        embed: null,
        createSpeech: null,
    };
    if (options.embed) {
        transformers.embed = EmbedResponseTransformer(provider, typeof options.embed === 'function' ? options.embed : undefined);
    }
    if (options.complete) {
        transformers.complete = CompleteResponseTransformer(provider, typeof options.complete === 'function' ? options.complete : undefined);
    }
    if (options.chatComplete) {
        transformers.chatComplete = ChatCompleteResponseTransformer(provider, typeof options.chatComplete === 'function'
            ? options.chatComplete
            : undefined);
    }
    if (options.createSpeech) {
        transformers.createSpeech = CreateSpeechResponseTransformer(provider, typeof options.createSpeech === 'function'
            ? options.createSpeech
            : undefined);
    }
    return transformers;
};
export const OpenAIResponseTransform = (response, responseStatus, provider) => {
    if (responseStatus !== 200 && 'error' in response) {
        return OpenAIErrorResponseTransform(response, provider ?? OPEN_AI);
    }
    return response;
};
