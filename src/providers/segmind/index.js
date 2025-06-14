import SegmindAIAPIConfig from './api';
import { SegmindImageGenerateConfig, SegmindImageGenerateResponseTransform, } from './imageGenerate';
const SegmindConfig = {
    api: SegmindAIAPIConfig,
    imageGenerate: SegmindImageGenerateConfig,
    responseTransforms: {
        imageGenerate: SegmindImageGenerateResponseTransform,
    },
};
export default SegmindConfig;
