import { GOOGLE_VERTEX_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { GoogleErrorResponseTransform } from './utils';
const transformParams = (params) => {
    const config = {};
    if (params['n']) {
        config['sampleCount'] = params['n'];
    }
    if (params['quality']) {
        let quality;
        if (typeof params['quality'] === 'number') {
            quality = params['quality'];
        }
        else {
            if (params['quality'] === 'hd') {
                quality = 100;
            }
            else {
                quality = 75;
            }
        }
        if (config['outputOptions']) {
            config['outputOptions']['compressionQuality'] = quality;
        }
        else {
            config['outputOptions'] = { compressionQuality: quality };
        }
    }
    if (params['style']) {
        config['sampleImageStyle'] = params['style'];
    }
    if (params['aspectRatio']) {
        config['aspectRatio'] = params['aspectRatio'];
    }
    if (params['seed']) {
        config['seed'] = params['seed'];
    }
    if (params['negativePrompt']) {
        config['negativePrompt'] = params['negativePrompt'];
    }
    if (params['personGeneration']) {
        config['personGeneration'] = params['personGeneration'];
    }
    if (params['safetySetting']) {
        config['safetySetting'] = params['safetySetting'];
    }
    if (params['addWatermark']) {
        config['addWatermark'] = params['addWatermark'];
    }
    if (params['mimeType']) {
        if (config['outputOptions']) {
            config['outputOptions']['mimeType'] = params['mimeType'];
        }
        else {
            config['outputOptions'] = { mimeType: params['mimeType'] };
        }
    }
    return config;
};
export const GoogleImageGenConfig = {
    prompt: {
        param: 'instances',
        required: true,
        transform: (params) => {
            const instances = Array();
            if (Array.isArray(params.prompt)) {
                params.prompt.forEach((text) => {
                    instances.push({
                        prompt: text,
                    });
                });
            }
            else {
                instances.push({
                    prompt: params.prompt,
                });
            }
            return instances;
        },
    },
    n: {
        param: 'parameters',
        min: 1,
        max: 8,
        transform: transformParams,
    },
    quality: {
        param: 'parameters',
        transform: transformParams,
    },
    style: {
        param: 'parameters',
        transform: transformParams,
    },
    aspectRatio: {
        param: 'parameters',
        transform: transformParams,
    },
    seed: {
        param: 'parameters',
        transform: transformParams,
    },
    negativePrompt: {
        param: 'parameters',
        transform: transformParams,
    },
    personGeneration: {
        param: 'parameters',
        transform: transformParams,
    },
    safetySetting: {
        param: 'parameters',
        transform: transformParams,
    },
    addWatermark: {
        param: 'parameters',
        transform: transformParams,
    },
    mimeType: {
        param: 'parameters',
        transform: transformParams,
    },
};
export const GoogleImageGenResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResposne = GoogleErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    if ('predictions' in response) {
        return {
            created: Math.floor(Date.now() / 1000),
            data: response.predictions.map((generation) => ({
                b64_json: generation.bytesBase64Encoded,
            })),
            provider: GOOGLE_VERTEX_AI,
        };
    }
    return generateInvalidProviderResponseError(response, GOOGLE_VERTEX_AI);
};
