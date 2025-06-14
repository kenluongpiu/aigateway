import MonsterAPIApiConfig from './api';
import { MonsterAPIChatCompleteConfig, MonsterAPIChatCompleteResponseTransform, } from './chatComplete';
const MonsterAPIConfig = {
    api: MonsterAPIApiConfig,
    chatComplete: MonsterAPIChatCompleteConfig,
    responseTransforms: {
        chatComplete: MonsterAPIChatCompleteResponseTransform,
    },
};
export default MonsterAPIConfig;
