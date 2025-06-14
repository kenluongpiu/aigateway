import DeepbricksAPIConfig from './api';
import { DeepbricksChatCompleteConfig, DeepbricksChatCompleteResponseTransform, } from './chatComplete';
import { DeepbricksImageGenerateConfig, DeepbricksImageGenerateResponseTransform, } from './imageGenerate';
const DeepbricksConfig = {
    api: DeepbricksAPIConfig,
    chatComplete: DeepbricksChatCompleteConfig,
    imageGenerate: DeepbricksImageGenerateConfig,
    responseTransforms: {
        chatComplete: DeepbricksChatCompleteResponseTransform,
        imageGenerate: DeepbricksImageGenerateResponseTransform,
    },
};
export default DeepbricksConfig;
