import PredibaseAPIConfig from './api';
import { PredibaseChatCompleteConfig, PredibaseChatCompleteResponseTransform, PredibaseChatCompleteStreamChunkTransform, } from './chatComplete';
const PredibaseConfig = {
    chatComplete: PredibaseChatCompleteConfig,
    api: PredibaseAPIConfig,
    responseTransforms: {
        chatComplete: PredibaseChatCompleteResponseTransform,
        'stream-chatComplete': PredibaseChatCompleteStreamChunkTransform,
    },
};
export default PredibaseConfig;
