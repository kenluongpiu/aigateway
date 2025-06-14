import DeepSeekAPIConfig from './api';
import { DeepSeekChatCompleteConfig, DeepSeekChatCompleteResponseTransform, DeepSeekChatCompleteStreamChunkTransform, } from './chatComplete';
const DeepSeekConfig = {
    chatComplete: DeepSeekChatCompleteConfig,
    api: DeepSeekAPIConfig,
    responseTransforms: {
        chatComplete: DeepSeekChatCompleteResponseTransform,
        'stream-chatComplete': DeepSeekChatCompleteStreamChunkTransform,
    },
};
export default DeepSeekConfig;
