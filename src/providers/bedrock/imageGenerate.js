import { BEDROCK } from '../../globals';
import { StabilityAIImageGenerateV2Config } from '../stability-ai/imageGenerateV2';
import { generateInvalidProviderResponseError } from '../utils';
import { BedrockErrorResponseTransform } from './chatComplete';
export const BedrockStabilityAIImageGenerateV1Config = {
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
    n: {
        param: 'samples',
        min: 1,
        max: 10,
    },
    size: [
        {
            param: 'height',
            transform: (params) => parseInt(params.size.toLowerCase().split('x')[1]),
            min: 320,
        },
        {
            param: 'width',
            transform: (params) => parseInt(params.size.toLowerCase().split('x')[0]),
            min: 320,
        },
    ],
    style: {
        param: 'style_preset',
    },
};
export const BedrockStabilityAIImageGenerateV1ResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResponse = BedrockErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('artifacts' in response) {
        return {
            created: Math.floor(Date.now() / 1000),
            data: response.artifacts.map((art) => ({ b64_json: art.base64 })),
            provider: BEDROCK,
        };
    }
    return generateInvalidProviderResponseError(response, BEDROCK);
};
export const BedrockStabilityAIImageGenerateV2Config = StabilityAIImageGenerateV2Config;
export const BedrockStabilityAIImageGenerateV2ResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResponse = BedrockErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('images' in response) {
        return {
            created: Math.floor(Date.now() / 1000),
            data: response.images.map((image) => ({ b64_json: image })),
            provider: BEDROCK,
        };
    }
    return generateInvalidProviderResponseError(response, BEDROCK);
};
