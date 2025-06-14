import { UPSTAGE } from '../../globals';
import { chatCompleteParams, embedParams, responseTransformers, } from '../open-ai-base';
import { upstageAPIConfig } from './api';
export const UpstageConfig = {
    chatComplete: chatCompleteParams([], { model: 'solar-pro' }),
    embed: embedParams([], { model: 'solar-embedding-1-large-query' }),
    api: upstageAPIConfig,
    responseTransforms: responseTransformers(UPSTAGE, {
        chatComplete: true,
        embed: true,
    }),
};
