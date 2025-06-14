import { GOOGLE } from '../../globals';
import { GoogleErrorResponseTransform, } from './chatComplete';
import { generateInvalidProviderResponseError } from '../utils';
export const GoogleEmbedConfig = {
    input: {
        param: 'content',
        required: true,
        transform: (params) => {
            const parts = [];
            if (Array.isArray(params.input)) {
                params.input.forEach((i) => {
                    parts.push({
                        text: i,
                    });
                });
            }
            else {
                parts.push({
                    text: params.input,
                });
            }
            return {
                parts,
            };
        },
    },
    model: {
        param: 'model',
        required: true,
        default: 'embedding-001',
    },
};
export const GoogleEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResposne = GoogleErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    const model = gatewayRequest.model || '';
    if ('embedding' in response) {
        return {
            object: 'list',
            data: [
                {
                    object: 'embedding',
                    embedding: response.embedding.values,
                    index: 0,
                },
            ],
            model,
            usage: {
                prompt_tokens: -1,
                total_tokens: -1,
            },
        };
    }
    return generateInvalidProviderResponseError(response, GOOGLE);
};
