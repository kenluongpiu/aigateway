import { INFERENCENET } from '../../globals';
import { chatCompleteParams, responseTransformers } from '../open-ai-base';
import { inferenceAPIConfig } from './api';
export const InferenceNetProviderConfigs = {
    chatComplete: chatCompleteParams([], { model: 'llama3' }),
    api: inferenceAPIConfig,
    responseTransforms: responseTransformers(INFERENCENET, {
        chatComplete: true,
    }),
};
