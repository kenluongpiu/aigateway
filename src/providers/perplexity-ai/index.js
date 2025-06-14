import PerplexityAIApiConfig from './api';
import { PerplexityAIChatCompleteConfig, PerplexityAIChatCompleteResponseTransform, PerplexityAIChatCompleteStreamChunkTransform, } from './chatComplete';
const PerplexityAIConfig = {
    chatComplete: PerplexityAIChatCompleteConfig,
    api: PerplexityAIApiConfig,
    responseTransforms: {
        chatComplete: PerplexityAIChatCompleteResponseTransform,
        'stream-chatComplete': PerplexityAIChatCompleteStreamChunkTransform,
    },
};
export default PerplexityAIConfig;
