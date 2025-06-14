import { HuggingfaceCompleteConfig, HuggingfaceCompleteResponseTransform, HuggingfaceCompleteStreamChunkTransform, } from './complete';
import HuggingfaceAPIConfig from './api';
import { HuggingfaceChatCompleteConfig, HuggingfaceChatCompleteResponseTransform, HuggingfaceChatCompleteStreamChunkTransform, } from './chatComplete';
const HuggingfaceConfig = {
    complete: HuggingfaceCompleteConfig,
    api: HuggingfaceAPIConfig,
    chatComplete: HuggingfaceChatCompleteConfig,
    responseTransforms: {
        complete: HuggingfaceCompleteResponseTransform,
        'stream-complete': HuggingfaceCompleteStreamChunkTransform,
        chatComplete: HuggingfaceChatCompleteResponseTransform,
        'stream-chatComplete': HuggingfaceChatCompleteStreamChunkTransform,
    },
};
export default HuggingfaceConfig;
