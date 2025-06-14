import LingyiAPIConfig from './api';
import { LingyiChatCompleteConfig, LingyiChatCompleteResponseTransform, LingyiChatCompleteStreamChunkTransform, } from './chatComplete';
const LingyiConfig = {
    chatComplete: LingyiChatCompleteConfig,
    api: LingyiAPIConfig,
    responseTransforms: {
        chatComplete: LingyiChatCompleteResponseTransform,
        'stream-chatComplete': LingyiChatCompleteStreamChunkTransform,
    },
};
export default LingyiConfig;
