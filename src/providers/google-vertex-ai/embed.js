import { GOOGLE_VERTEX_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { GoogleErrorResponseTransform } from './utils';
import { transformEmbeddingInputs, transformEmbeddingsParameters, } from './transformGenerationConfig';
var TASK_TYPE;
(function (TASK_TYPE) {
    TASK_TYPE["RETRIEVAL_QUERY"] = "RETRIEVAL_QUERY";
    TASK_TYPE["RETRIEVAL_DOCUMENT"] = "RETRIEVAL_DOCUMENT";
    TASK_TYPE["SEMANTIC_SIMILARITY"] = "SEMANTIC_SIMILARITY";
    TASK_TYPE["CLASSIFICATION"] = "CLASSIFICATION";
    TASK_TYPE["CLUSTERING"] = "CLUSTERING";
    TASK_TYPE["QUESTION_ANSWERING"] = "QUESTION_ANSWERING";
    TASK_TYPE["FACT_VERIFICATION"] = "FACT_VERIFICATION";
    TASK_TYPE["CODE_RETRIEVAL_QUERY"] = "CODE_RETRIEVAL_QUERY";
})(TASK_TYPE || (TASK_TYPE = {}));
export const GoogleEmbedConfig = {
    input: {
        param: 'instances',
        required: true,
        transform: (params) => transformEmbeddingInputs(params),
    },
    parameters: {
        param: 'parameters',
        required: false,
    },
    dimensions: {
        param: 'parameters',
        required: false,
        transform: (params) => transformEmbeddingsParameters(params),
    },
};
export const GoogleEmbedResponseTransform = (response, responseStatus, _responseHeaders, _strictOpenAiCompliance, _gatewayRequestUrl, gatewayRequest) => {
    if (responseStatus !== 200) {
        const errorResposne = GoogleErrorResponseTransform(response);
        if (errorResposne)
            return errorResposne;
    }
    const model = gatewayRequest.model || '';
    if ('predictions' in response) {
        const data = [];
        let tokenCount = 0;
        response.predictions.forEach((prediction, index) => {
            const item = {
                object: 'embedding',
                index: index,
                ...(prediction.imageEmbedding && {
                    image_embedding: prediction.imageEmbedding,
                }),
                ...(prediction.videoEmbeddings && {
                    video_embeddings: prediction.videoEmbeddings.map((videoEmbedding, idx) => ({
                        object: 'embedding',
                        embedding: videoEmbedding.embedding,
                        index: idx,
                        start_offset: videoEmbedding.startOffsetSec,
                        end_offset: videoEmbedding.endOffsetSec,
                    })),
                }),
                ...(prediction.textEmbedding && {
                    embedding: prediction.textEmbedding,
                }),
                ...(prediction.embeddings && {
                    embedding: prediction.embeddings.values,
                }),
            };
            tokenCount += prediction?.embeddings?.statistics?.token_count || 0;
            data.push(item);
        });
        data.forEach((item, index) => {
            item.index = index;
        });
        return {
            object: 'list',
            data: data,
            model,
            usage: {
                prompt_tokens: tokenCount,
                total_tokens: tokenCount,
            },
        };
    }
    return generateInvalidProviderResponseError(response, GOOGLE_VERTEX_AI);
};
