import { BedrockErrorResponseTransform } from './chatComplete';
import { bedrockFinetuneToOpenAI } from './utils';
export const BedrockFinetuneResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        return BedrockErrorResponseTransform(response) || response;
    }
    return bedrockFinetuneToOpenAI(response);
};
