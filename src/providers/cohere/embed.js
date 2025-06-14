import { generateErrorResponse } from '../utils';
import { COHERE } from '../../globals';
export const CohereEmbedConfig = {
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
    model: {
        param: 'model',
        default: 'embed-english-light-v2.0',
    },
    input_type: {
        param: 'input_type',
        required: false,
    },
    embedding_types: {
        param: 'embedding_types',
        required: false,
    },
    truncate: {
        param: 'truncate',
        required: false,
    },
};
export const CohereEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        return generateErrorResponse({
            message: response.message || '',
            type: null,
            param: null,
            code: null,
        }, COHERE);
    }
    return {
        object: 'list',
        data: response.embeddings.map((embedding, index) => ({
            object: 'embedding',
            embedding: embedding,
            index: index,
        })),
        model: gatewayRequest.model || '',
        usage: {
            prompt_tokens: -1,
            total_tokens: -1,
        },
    };
};
export const CohereEmbedResponseTransformBatch = (response) => {
    return {
        id: response.id,
        custom_id: response.custom_id,
        response: {
            status_code: 200,
            request_id: response.id,
            body: {
                object: 'list',
                data: [
                    {
                        object: 'embedding',
                        index: 0,
                        embedding: response.embeddings.float?.array,
                    },
                ],
                model: '',
                usage: {
                    prompt_tokens: 0,
                    total_tokens: 0,
                },
            },
        },
    };
};
