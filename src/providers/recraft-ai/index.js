import RecraftAIAPIConfig from './api';
import { RecraftAIImageGenerateConfig, RecraftAIImageGenerateResponseTransform, } from './imageGenerate';
const RecraftAIConfig = {
    imageGenerate: RecraftAIImageGenerateConfig,
    api: RecraftAIAPIConfig,
    responseTransforms: {
        imageGenerate: RecraftAIImageGenerateResponseTransform,
    },
};
export default RecraftAIConfig;
