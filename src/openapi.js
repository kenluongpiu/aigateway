/**
 * OpenAPI Specification for Portkey AI Gateway
 * This file defines the API documentation for all endpoints
 */
export const openApiSpec = {
    openapi: '3.0.3',
    info: {
        title: 'Portkey AI Gateway API',
        version: '1.0.0',
        description: `
# Portkey AI Gateway

A unified API for routing requests to 250+ Large Language Models (LLMs).

## Features
- **Fast**: <1ms latency with 122kb footprint
- **Reliable**: Automatic retries and fallbacks
- **Scalable**: Load balancing and conditional routing
- **Secure**: Built-in guardrails and security features
- **Multi-modal**: Support for text, vision, audio, and image models

## Authentication
All requests require proper API key authentication via the \`Authorization\` header.

## Rate Limiting
Rate limits apply based on your plan and provider limits.
    `,
        contact: {
            name: 'Portkey Support',
            url: 'https://portkey.ai',
            email: 'support@portkey.ai'
        },
        license: {
            name: 'MIT',
            url: 'https://github.com/Portkey-AI/gateway/blob/main/LICENSE'
        }
    },
    servers: [
        {
            url: 'http://localhost:8787',
            description: 'Local Development Server'
        },
        {
            url: 'https://api.portkey.ai',
            description: 'Production Server'
        }
    ],
    security: [
        {
            BearerAuth: []
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            ChatMessage: {
                type: 'object',
                properties: {
                    role: {
                        type: 'string',
                        enum: ['system', 'user', 'assistant', 'tool'],
                        description: 'Role of the message sender'
                    },
                    content: {
                        type: 'string',
                        description: 'Content of the message'
                    },
                    name: {
                        type: 'string',
                        description: 'Name of the participant (optional)'
                    }
                },
                required: ['role', 'content']
            },
            ChatCompletionRequest: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        description: 'ID of the model to use',
                        example: 'gpt-4o-mini'
                    },
                    messages: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ChatMessage' },
                        description: 'List of messages comprising the conversation'
                    },
                    max_tokens: {
                        type: 'integer',
                        minimum: 1,
                        description: 'Maximum number of tokens to generate'
                    },
                    temperature: {
                        type: 'number',
                        minimum: 0,
                        maximum: 2,
                        description: 'Sampling temperature (0-2)'
                    },
                    stream: {
                        type: 'boolean',
                        description: 'Whether to stream back partial progress'
                    }
                },
                required: ['model', 'messages']
            },
            ChatCompletionResponse: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Unique identifier for the completion'
                    },
                    object: {
                        type: 'string',
                        enum: ['chat.completion'],
                        description: 'Object type'
                    },
                    created: {
                        type: 'integer',
                        description: 'Unix timestamp of creation'
                    },
                    model: {
                        type: 'string',
                        description: 'Model used for completion'
                    },
                    choices: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                index: { type: 'integer' },
                                message: { $ref: '#/components/schemas/ChatMessage' },
                                finish_reason: {
                                    type: 'string',
                                    enum: ['stop', 'length', 'content_filter', 'tool_calls']
                                }
                            }
                        }
                    },
                    usage: {
                        type: 'object',
                        properties: {
                            prompt_tokens: { type: 'integer' },
                            completion_tokens: { type: 'integer' },
                            total_tokens: { type: 'integer' }
                        }
                    }
                }
            },
            EmbeddingRequest: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        description: 'ID of the model to use',
                        example: 'text-embedding-ada-002'
                    },
                    input: {
                        oneOf: [
                            { type: 'string' },
                            { type: 'array', items: { type: 'string' } }
                        ],
                        description: 'Input text to embed'
                    },
                    encoding_format: {
                        type: 'string',
                        enum: ['float', 'base64'],
                        description: 'Format to return embeddings in'
                    }
                },
                required: ['model', 'input']
            },
            ImageGenerationRequest: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        description: 'Model to use for image generation',
                        example: 'dall-e-3'
                    },
                    prompt: {
                        type: 'string',
                        description: 'Text description of the desired image'
                    },
                    n: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 10,
                        description: 'Number of images to generate'
                    },
                    size: {
                        type: 'string',
                        enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
                        description: 'Size of the generated images'
                    },
                    quality: {
                        type: 'string',
                        enum: ['standard', 'hd'],
                        description: 'Quality of the image'
                    }
                },
                required: ['model', 'prompt']
            },
            AudioSpeechRequest: {
                type: 'object',
                properties: {
                    model: {
                        type: 'string',
                        description: 'TTS model to use',
                        example: 'tts-1'
                    },
                    input: {
                        type: 'string',
                        description: 'Text to generate audio for'
                    },
                    voice: {
                        type: 'string',
                        enum: ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'],
                        description: 'Voice to use for generation'
                    },
                    response_format: {
                        type: 'string',
                        enum: ['mp3', 'opus', 'aac', 'flac'],
                        description: 'Audio format'
                    },
                    speed: {
                        type: 'number',
                        minimum: 0.25,
                        maximum: 4.0,
                        description: 'Speed of the generated audio'
                    }
                },
                required: ['model', 'input', 'voice']
            },
            Error: {
                type: 'object',
                properties: {
                    error: {
                        type: 'object',
                        properties: {
                            message: { type: 'string' },
                            type: { type: 'string' },
                            code: { type: 'string' }
                        }
                    }
                }
            }
        }
    },
    paths: {
        '/v1/chat/completions': {
            post: {
                tags: ['Chat'],
                summary: 'Create chat completion',
                description: 'Creates a model response for the given chat conversation.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ChatCompletionRequest' },
                            examples: {
                                'simple-chat': {
                                    summary: 'Simple chat example',
                                    value: {
                                        model: 'gpt-4o-mini',
                                        messages: [
                                            { role: 'user', content: 'Hello, how are you?' }
                                        ]
                                    }
                                },
                                'conversation': {
                                    summary: 'Multi-turn conversation',
                                    value: {
                                        model: 'gpt-4o-mini',
                                        messages: [
                                            { role: 'system', content: 'You are a helpful assistant.' },
                                            { role: 'user', content: 'What is the capital of France?' },
                                            { role: 'assistant', content: 'The capital of France is Paris.' },
                                            { role: 'user', content: 'What is its population?' }
                                        ],
                                        max_tokens: 150,
                                        temperature: 0.7
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ChatCompletionResponse' }
                            }
                        }
                    },
                    '400': {
                        description: 'Bad request',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' }
                            }
                        }
                    },
                    '401': {
                        description: 'Unauthorized',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' }
                            }
                        }
                    },
                    '429': {
                        description: 'Rate limit exceeded',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Error' }
                            }
                        }
                    }
                }
            }
        },
        '/v1/completions': {
            post: {
                tags: ['Completions'],
                summary: 'Create completion',
                description: 'Creates a completion for the provided prompt and parameters.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    model: { type: 'string', example: 'gpt-3.5-turbo-instruct' },
                                    prompt: { type: 'string', example: 'Say this is a test' },
                                    max_tokens: { type: 'integer', example: 7 },
                                    temperature: { type: 'number', example: 0 }
                                },
                                required: ['model', 'prompt']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Successful response' },
                    '400': { description: 'Bad request' },
                    '401': { description: 'Unauthorized' }
                }
            }
        },
        '/v1/embeddings': {
            post: {
                tags: ['Embeddings'],
                summary: 'Create embeddings',
                description: 'Creates an embedding vector representing the input text.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/EmbeddingRequest' },
                            examples: {
                                'single-text': {
                                    summary: 'Single text embedding',
                                    value: {
                                        model: 'text-embedding-ada-002',
                                        input: 'The quick brown fox jumps over the lazy dog'
                                    }
                                },
                                'multiple-texts': {
                                    summary: 'Multiple text embeddings',
                                    value: {
                                        model: 'text-embedding-ada-002',
                                        input: [
                                            'First text to embed',
                                            'Second text to embed',
                                            'Third text to embed'
                                        ]
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Successful response' },
                    '400': { description: 'Bad request' },
                    '401': { description: 'Unauthorized' }
                }
            }
        },
        '/v1/images/generations': {
            post: {
                tags: ['Images'],
                summary: 'Generate images',
                description: 'Creates an image given a text prompt.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/ImageGenerationRequest' },
                            examples: {
                                'simple-image': {
                                    summary: 'Simple image generation',
                                    value: {
                                        model: 'dall-e-3',
                                        prompt: 'A beautiful sunset over mountains',
                                        size: '1024x1024',
                                        quality: 'standard'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Successful response' },
                    '400': { description: 'Bad request' },
                    '401': { description: 'Unauthorized' }
                }
            }
        },
        '/v1/audio/speech': {
            post: {
                tags: ['Audio'],
                summary: 'Create speech',
                description: 'Generates audio from the input text.',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/AudioSpeechRequest' },
                            examples: {
                                'simple-speech': {
                                    summary: 'Simple text-to-speech',
                                    value: {
                                        model: 'tts-1',
                                        input: 'Hello, this is a test of the text-to-speech system.',
                                        voice: 'alloy',
                                        response_format: 'mp3'
                                    }
                                }
                            }
                        }
                    }
                },
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'audio/mpeg': {
                                schema: { type: 'string', format: 'binary' }
                            }
                        }
                    },
                    '400': { description: 'Bad request' },
                    '401': { description: 'Unauthorized' }
                }
            }
        },
        '/v1/audio/transcriptions': {
            post: {
                tags: ['Audio'],
                summary: 'Create transcription',
                description: 'Transcribes audio into the input language.',
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'Audio file to transcribe'
                                    },
                                    model: {
                                        type: 'string',
                                        example: 'whisper-1'
                                    },
                                    language: {
                                        type: 'string',
                                        description: 'Language of the input audio'
                                    },
                                    response_format: {
                                        type: 'string',
                                        enum: ['json', 'text', 'srt', 'verbose_json', 'vtt']
                                    }
                                },
                                required: ['file', 'model']
                            }
                        }
                    }
                },
                responses: {
                    '200': { description: 'Successful response' },
                    '400': { description: 'Bad request' },
                    '401': { description: 'Unauthorized' }
                }
            }
        },
        '/v1/models': {
            get: {
                tags: ['Models'],
                summary: 'List models',
                description: 'Lists the currently available models.',
                responses: {
                    '200': {
                        description: 'Successful response',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        object: { type: 'string', example: 'list' },
                                        data: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    object: { type: 'string', example: 'model' },
                                                    created: { type: 'integer' },
                                                    owned_by: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/v1/reference/models': {
            get: {
                tags: ['Reference'],
                summary: 'Get reference models',
                description: 'Returns all supported models with their capabilities.',
                responses: {
                    '200': { description: 'Successful response' }
                }
            }
        },
        '/v1/reference/providers': {
            get: {
                tags: ['Reference'],
                summary: 'Get reference providers',
                description: 'Returns all supported providers and their configurations.',
                responses: {
                    '200': { description: 'Successful response' }
                }
            }
        }
    },
    tags: [
        {
            name: 'Chat',
            description: 'Chat completion endpoints'
        },
        {
            name: 'Completions',
            description: 'Text completion endpoints'
        },
        {
            name: 'Embeddings',
            description: 'Text embedding endpoints'
        },
        {
            name: 'Images',
            description: 'Image generation endpoints'
        },
        {
            name: 'Audio',
            description: 'Audio processing endpoints'
        },
        {
            name: 'Models',
            description: 'Model management endpoints'
        },
        {
            name: 'Reference',
            description: 'Reference data endpoints'
        }
    ]
};
