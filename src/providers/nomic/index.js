import NomicAPIConfig from './api';
import { NomicEmbedConfig, NomicEmbedResponseTransform } from './embed';
const NomicConfig = {
    embed: NomicEmbedConfig,
    api: NomicAPIConfig,
    responseTransforms: {
        embed: NomicEmbedResponseTransform,
    },
};
export default NomicConfig;
