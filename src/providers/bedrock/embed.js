import { BEDROCK } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { BedrockErrorResponseTransform } from './chatComplete';
export const BedrockCohereEmbedConfig = {
    input: {
        param: 'texts',
        required: true,
        transform: (params) => {
            if (Array.isArray(params.input)) {
                return params.input;
            }
            else {
                return [params.input];
            }
        },
    },
    input_type: {
        param: 'input_type',
        required: true,
    },
    truncate: {
        param: 'truncate',
    },
};
export const BedrockTitanEmbedConfig = {
    input: {
        param: 'inputText',
        required: true,
    },
};
export const BedrockTitanEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResposne = BedrockErrorResponseTransform(response);
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
                    embedding: response.embedding,
                    index: 0,
                },
            ],
            provider: BEDROCK,
            model,
            usage: {
                prompt_tokens: response.inputTextTokenCount,
                total_tokens: response.inputTextTokenCount,
            },
        };
    }
    return generateInvalidProviderResponseError(response, BEDROCK);
};
export const BedrockCohereEmbedResponseTransform = (response, responseStatus, responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResposne = BedrockErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    const model = gatewayRequest.model || '';
    if ('embeddings' in response) {
        return {
            object: 'list',
            data: response.embeddings.map((embedding, index) => ({
                object: 'embedding',
                embedding: embedding,
                index: index,
            })),
            provider: BEDROCK,
            model,
            usage: {
                prompt_tokens: Number(responseHeaders.get('X-Amzn-Bedrock-Input-Token-Count')) || -1,
                total_tokens: Number(responseHeaders.get('X-Amzn-Bedrock-Input-Token-Count')) || -1,
            },
        };
    }
    return generateInvalidProviderResponseError(response, BEDROCK);
};
