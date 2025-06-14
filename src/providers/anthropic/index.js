import AnthropicAPIConfig from './api';
import { AnthropicChatCompleteConfig, AnthropicChatCompleteResponseTransform, AnthropicChatCompleteStreamChunkTransform, } from './chatComplete';
import { AnthropicCompleteConfig, AnthropicCompleteResponseTransform, AnthropicCompleteStreamChunkTransform, } from './complete';
const AnthropicConfig = {
    complete: AnthropicCompleteConfig,
    chatComplete: AnthropicChatCompleteConfig,
    api: AnthropicAPIConfig,
    responseTransforms: {
        'stream-complete': AnthropicCompleteStreamChunkTransform,
        complete: AnthropicCompleteResponseTransform,
        chatComplete: AnthropicChatCompleteResponseTransform,
        'stream-chatComplete': AnthropicChatCompleteStreamChunkTransform,
    },
};
export default AnthropicConfig;
