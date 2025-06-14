import { FireworksAIErrorResponseTransform, } from './chatComplete';
import { fireworksDatasetToOpenAIFile } from './utils';
export const FireworksFileListResponseTransform = (response, responseStatus) => {
    if (responseStatus === 200) {
        const datasets = response.datasets;
        const records = datasets.map(fireworksDatasetToOpenAIFile);
        return {
            object: 'list',
            data: records,
            last_id: records.at(-1)?.id,
            has_more: response.totalSize > response.datasets.length,
            total: response.totalSize,
        };
    }
    return FireworksAIErrorResponseTransform(response);
};
