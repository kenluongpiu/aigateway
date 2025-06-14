import JinaAPIConfig from './api';
import { JinaEmbedConfig, JinaEmbedResponseTransform } from './embed';
const JinaConfig = {
    embed: JinaEmbedConfig,
    api: JinaAPIConfig,
    responseTransforms: {
        embed: JinaEmbedResponseTransform,
    },
};
export default JinaConfig;
