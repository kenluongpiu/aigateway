import VoyageAPIConfig from './api';
import { VoyageEmbedConfig, VoyageEmbedResponseTransform } from './embed';
const VoyageConfig = {
    embed: VoyageEmbedConfig,
    api: VoyageAPIConfig,
    responseTransforms: {
        embed: VoyageEmbedResponseTransform,
    },
};
export default VoyageConfig;
