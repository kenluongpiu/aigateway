import { SILICONFLOW } from '../../globals';
import { SiliconFlowErrorResponseTransform } from './chatComplete';
export const SiliconFlowImageGenerateConfig = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    size: {
        param: 'image_size',
        default: '',
    },
    num_inference_steps: {
        param: 'num_inference_steps',
        default: 20,
    },
    batch_size: {
        param: 'batch_size',
        default: 1,
    },
    guidance_scale: {
        param: 'guidance_scale',
        default: 7.5,
    },
};
export const SiliconFlowImageGenerateResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200 && 'error' in response) {
        return SiliconFlowErrorResponseTransform(response, SILICONFLOW);
    }
    return response;
};
