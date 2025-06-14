import { BedrockErrorResponseTransform } from './chatComplete';
import { bedrockFinetuneToOpenAI } from './utils';
export const BedrockListFinetuneResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        return BedrockErrorResponseTransform(response) || response;
    }
    const records = response?.modelCustomizationJobSummaries;
    const openaiRecords = records.map(bedrockFinetuneToOpenAI);
    return {
        data: openaiRecords,
        object: 'list',
        total_count: openaiRecords.length,
        last_id: response?.nextToken,
    };
};
