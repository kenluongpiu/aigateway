import { BedrockErrorResponseTransform } from './chatComplete';
import { populateHyperParameters } from './utils';
export const BedrockCreateFinetuneConfig = {
    model: {
        param: 'baseModelIdentifier',
        required: true,
    },
    suffix: {
        param: 'customModelName',
        required: true,
    },
    hyperparameters: {
        param: 'hyperParameters',
        required: false,
        transform: (value) => {
            const hyperParameters = populateHyperParameters(value);
            const epochCount = hyperParameters.n_epochs;
            const learningRateMultiplier = hyperParameters.learning_rate_multiplier;
            const batchSize = hyperParameters.batch_size;
            return {
                epochCount: epochCount ? String(epochCount) : undefined,
                learningRateMultiplier: learningRateMultiplier
                    ? String(learningRateMultiplier)
                    : undefined,
                batchSize: batchSize ? String(batchSize) : undefined,
            };
        },
    },
    training_file: {
        param: 'trainingDataConfig',
        required: true,
        transform: (value) => {
            return {
                s3Uri: decodeURIComponent(value.training_file),
            };
        },
    },
    validation_file: {
        param: 'validationDataConfig',
        required: false,
        transform: (value) => {
            if (!value.validation_file) {
                return undefined;
            }
            return {
                s3Uri: decodeURIComponent(value.validation_file),
            };
        },
    },
    output_file: {
        param: 'outputDataConfig',
        required: true,
        default: (value) => {
            const trainingFile = decodeURIComponent(value.training_file);
            const uri = trainingFile.substring(0, trainingFile.lastIndexOf('/') + 1) +
                value.suffix;
            return {
                s3Uri: uri,
            };
        },
    },
    job_name: {
        param: 'jobName',
        required: true,
        default: (value) => {
            return value.job_name ?? `portkey-finetune-${crypto.randomUUID()}`;
        },
    },
    role_arn: {
        param: 'roleArn',
        required: true,
    },
    customization_type: {
        param: 'customizationType',
        required: true,
        default: 'FINE_TUNING',
    },
};
const OK_STATUS = [200, 201];
export const BedrockCreateFinetuneResponseTransform = (response, responseStatus) => {
    Response;
    if (!OK_STATUS.includes(responseStatus) || 'error' in response) {
        return (BedrockErrorResponseTransform(response) ||
            response);
    }
    return { id: encodeURIComponent(response.jobArn) };
};
