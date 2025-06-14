import { BEDROCK } from '../../globals';
import { generateInvalidProviderResponseError } from '../utils';
import { BedrockErrorResponseTransform } from './chatComplete';
export const BedrockCreateBatchConfig = {
    model: {
        param: 'modelId',
        required: true,
    },
    input_file_id: {
        param: 'inputDataConfig',
        required: true,
        transform: (params) => {
            return {
                s3InputDataConfig: {
                    s3Uri: decodeURIComponent(params.input_file_id),
                },
            };
        },
    },
    job_name: {
        param: 'jobName',
        required: true,
        default: () => {
            return `portkey-batch-job-${crypto.randomUUID()}`;
        },
    },
    output_data_config: {
        param: 'outputDataConfig',
        required: true,
        default: (params, providerOptions) => {
            const inputFileId = decodeURIComponent(params.input_file_id);
            const s3URLToContainingFolder = inputFileId.split('/').slice(0, -1).join('/') + '/';
            return {
                s3OutputDataConfig: {
                    s3Uri: s3URLToContainingFolder,
                    ...(providerOptions.awsServerSideEncryptionKMSKeyId && {
                        s3EncryptionKeyId: providerOptions.awsServerSideEncryptionKMSKeyId,
                    }),
                },
            };
        },
    },
    role_arn: {
        param: 'roleArn',
        required: true,
    },
};
export const BedrockCreateBatchResponseTransform = (response, responseStatus) => {
    if (responseStatus !== 200) {
        const errorResponse = BedrockErrorResponseTransform(response);
        if (errorResponse)
            return errorResponse;
    }
    if ('jobArn' in response) {
        return {
            id: encodeURIComponent(response.jobArn),
            object: 'batch',
        };
    }
    return generateInvalidProviderResponseError(response, BEDROCK);
};
