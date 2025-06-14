import { STABILITY_AI } from '../../globals';
import { generateErrorResponse, generateInvalidProviderResponseError, } from '../utils';
export const StabilityAIImageGenerateV2Config = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    negative_prompt: {
        param: 'negative_prompt',
        required: false,
    },
    aspect_ratio: {
        param: 'aspect_ratio',
        required: false,
    },
    seed: {
        param: 'seed',
        required: false,
    },
    style_preset: {
        param: 'style_preset',
        required: false,
    },
    mode: {
        param: 'mode',
        required: false,
    },
    output_format: {
        param: 'output_format',
        required: false,
    },
    image: {
        param: 'image',
        required: false,
    },
    strength: {
        param: 'strength',
        required: false,
    },
};
var StabilityAIIMageGenerateV2FinishReason;
(function (StabilityAIIMageGenerateV2FinishReason) {
    StabilityAIIMageGenerateV2FinishReason["CONTENT_FILTERED"] = "CONTENT_FILTERED";
    StabilityAIIMageGenerateV2FinishReason["SUCCESS"] = "SUCCESS";
})(StabilityAIIMageGenerateV2FinishReason || (StabilityAIIMageGenerateV2FinishReason = {}));
export const StabilityAIImageGenerateV2ResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'errors' in response) {
        return generateErrorResponse({
            message: response.errors.join(', '),
            type: response.name,
            param: response.id,
            code: null,
        }, STABILITY_AI);
    }
    if ('image' in response) {
        return {
            created: Math.floor(Date.now() / 1000),
            data: [
                {
                    b64_json: response.image,
                },
            ],
            provider: STABILITY_AI,
        };
    }
    return generateInvalidProviderResponseError(response, STABILITY_AI);
};
