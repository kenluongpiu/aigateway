import TritonAPIConfig from './api';
import { TritonCompleteConfig, TritonCompleteResponseTransform, } from './complete';
const TritonConfig = {
    api: TritonAPIConfig,
    complete: TritonCompleteConfig,
    responseTransforms: {
        complete: TritonCompleteResponseTransform,
    },
};
export default TritonConfig;
