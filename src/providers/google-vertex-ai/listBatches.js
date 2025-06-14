import { GOOGLE_VERTEX_AI } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { GoogleToOpenAIBatch } from './utils';
export const GoogleListBatchesResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        return generateInvalidProviderResponseError(response, GOOGLE_VERTEX_AI);
    }
    const batches = response
        .batchPredictionJobs ?? [];
    const objects = batches.map(GoogleToOpenAIBatch);
    return {
        data: objects,
        object: 'list',
        first_id: objects.at(0)?.id,
        last_id: objects.at(-1)?.id,
        has_more: !!response?.nextPageToken,
    };
};
