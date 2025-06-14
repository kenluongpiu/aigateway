import { FIREWORKS_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { FireworksAIErrorResponseTransform, } from './chatComplete';
export const FireworksAIImageGenerateConfig = {
    prompt: {
        param: 'text_prompts',
        required: true,
        transform: (params) => {
            return [
                {
                    text: params.prompt,
                    weight: 1,
                },
            ];
        },
    },
    model: {
        param: 'model',
        required: true,
        default: 'stable-diffusion-xl-1024-v1-0',
    },
    size: [
        {
            param: 'height',
            transform: (params) => parseInt(params.size.toLowerCase().split('x')[1]),
            min: 512,
            max: 1024,
            default: 1024,
        },
        {
            param: 'width',
            transform: (params) => parseInt(params.size.toLowerCase().split('x')[0]),
            min: 512,
            max: 1024,
            default: 1024,
        },
    ],
    cfg_scale: {
        param: 'cfg_scale',
        default: 7,
    },
    sampler: {
        param: 'sampler',
    },
    n: {
        param: 'samples',
        min: 1,
        max: 10,
        default: 1,
    },
    seed: {
        param: 'seed',
        min: 0,
        max: 4294967295,
    },
    steps: {
        param: 'steps',
        min: 10,
        max: 150,
        default: 50,
    },
    safety_check: {
        param: 'safety_check',
    },
    lora_adapter_name: {
        param: 'lora_adapter_name',
    },
    lora_weight_filename: {
        param: 'lora_weight_filename',
    },
};
export const FireworksAIImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus != 200) {
        return FireworksAIErrorResponseTransform(response);
    }
    if (response instanceof Array) {
        return {
            created: Math.floor(Date.now() / 1000), // Corrected method call
            data: response?.map((r) => ({
                b64_json: r.base64,
                seed: r.seed,
                finishReason: r.finishReason,
            })), // Corrected object creation within map
            provider: FIREWORKS_AI,
        };
    }
    return generateInvalidProviderResponseError(response, FIREWORKS_AI);
};
