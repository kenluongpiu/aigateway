import PalmApiConfig from './api';
import { PalmChatCompleteConfig, PalmChatCompleteResponseTransform, } from './chatComplete';
import { PalmCompleteConfig, PalmCompleteResponseTransform } from './complete';
import { PalmEmbedConfig, PalmEmbedResponseTransform } from './embed';
const PalmAIConfig = {
    complete: PalmCompleteConfig,
    embed: PalmEmbedConfig,
    api: PalmApiConfig,
    chatComplete: PalmChatCompleteConfig,
    responseTransforms: {
        complete: PalmCompleteResponseTransform,
        chatComplete: PalmChatCompleteResponseTransform,
        embed: PalmEmbedResponseTransform,
    },
};
export default PalmAIConfig;
