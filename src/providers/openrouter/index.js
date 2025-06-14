import OpenrouterAPIConfig from './api';
import { OpenrouterChatCompleteConfig, OpenrouterChatCompleteResponseTransform, OpenrouterChatCompleteStreamChunkTransform, } from './chatComplete';
const OpenrouterConfig = {
    chatComplete: OpenrouterChatCompleteConfig,
    api: OpenrouterAPIConfig,
    responseTransforms: {
        chatComplete: OpenrouterChatCompleteResponseTransform,
        'stream-chatComplete': OpenrouterChatCompleteStreamChunkTransform,
    },
};
export default OpenrouterConfig;
