import { GOOGLE_VERTEX_AI } from '../../globals';
import { GoogleToOpenAIFinetune, transformVertexFinetune } from './utils';
export const GoogleVertexFinetuneConfig = {
    model: {
        param: 'baseModel',
        required: true,
    },
    training_file: {
        param: 'supervisedTuningSpec',
        required: true,
        transform: transformVertexFinetune,
    },
    suffix: {
        param: 'tunedModelDisplayName',
        required: true,
    },
    validation_file: {
        param: 'supervisedTuningSpec',
        required: false,
        transform: transformVertexFinetune,
    },
    method: {
        param: 'supervisedTuningSpec',
        required: false,
        transform: transformVertexFinetune,
    },
    hyperparameters: {
        param: 'supervisedTuningSpec',
        required: false,
        transform: transformVertexFinetune,
    },
};
export const GoogleFinetuneCreateResponseTransform = (input, status) => {
    if (status !== 200) {
        return { ...input, provider: GOOGLE_VERTEX_AI };
    }
    return GoogleToOpenAIFinetune(input);
};
