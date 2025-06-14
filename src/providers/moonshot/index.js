import MoonshotAPIConfig from './api';
import { MoonshotChatCompleteConfig, MoonshotChatCompleteResponseTransform, MoonshotChatCompleteStreamChunkTransform, } from './chatComplete';
const MoonshotConfig = {
    chatComplete: MoonshotChatCompleteConfig,
    api: MoonshotAPIConfig,
    responseTransforms: {
        chatComplete: MoonshotChatCompleteResponseTransform,
        'stream-chatComplete': MoonshotChatCompleteStreamChunkTransform,
    },
};
export default MoonshotConfig;
