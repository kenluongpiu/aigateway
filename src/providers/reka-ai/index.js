import RekaAIApiConfig from './api';
import { RekaAIChatCompleteConfig, RekaAIChatCompleteResponseTransform, } from './chatComplete';
const RekaAIConfig = {
    chatComplete: RekaAIChatCompleteConfig,
    api: RekaAIApiConfig,
    responseTransforms: {
        chatComplete: RekaAIChatCompleteResponseTransform,
    },
};
export default RekaAIConfig;
