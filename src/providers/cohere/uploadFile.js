import { COHERE } from '../../globals';
import { getFormdataToFormdataStreamTransformer } from '../../handlers/streamHandlerUtils';
import { generateInvalidProviderResponseError } from '../utils';
import { CohereErrorResponseTransform } from './utils';
const CohereFileUploadFieldsMapping = {
    file: 'file',
};
export const CohereBatchRequestRowTransform = (row) => {
    return {
        custom_id: row.custom_id,
        text: row.body.input,
        id: crypto.randomUUID(),
    };
};
export const CohereUploadFileRequestTransform = (requestBody, requestHeaders) => {
    const transformStream = getFormdataToFormdataStreamTransformer(requestHeaders, CohereBatchRequestRowTransform, CohereFileUploadFieldsMapping);
    return requestBody.pipeThrough(transformStream);
};
export const CohereUploadFileResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'message' in response) {
        return CohereErrorResponseTransform(response);
    }
    else if ('id' in response) {
        return {
            id: response.id,
            object: 'file',
            created_at: Math.floor(Date.now() / 1000),
            filename: '',
            purpose: '',
            status: 'uploaded',
        };
    }
    return generateInvalidProviderResponseError(response, COHERE);
};
