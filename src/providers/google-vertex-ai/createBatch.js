import { getModelAndProvider, GoogleToOpenAIBatch } from './utils';
export const GoogleBatchCreateConfig = {
    model: {
        param: 'model',
        required: true,
        transform: (params) => {
            const { model, provider } = getModelAndProvider(params.model);
            return `publishers/${provider}/models/${model}`;
        },
    },
    input_file_id: {
        param: 'inputConfig',
        required: true,
        transform: (params) => {
            return {
                instancesFormat: 'jsonl',
                gcsSource: {
                    uris: decodeURIComponent(params.input_file_id),
                },
            };
        },
    },
    output_data_config: {
        param: 'outputConfig',
        required: true,
        transform: (params) => {
            const providedOutputFile = decodeURIComponent(params?.['output_data_config'] ?? '');
            return {
                predictionsFormat: 'jsonl',
                gcsDestination: {
                    outputUriPrefix: providedOutputFile,
                },
            };
        },
        default: (params) => {
            const inputFileId = decodeURIComponent(params.input_file_id);
            const gcsURLToContainingFolder = inputFileId.split('/').slice(0, -1).join('/') + '/';
            return {
                predictionsFormat: 'jsonl',
                gcsDestination: {
                    outputUriPrefix: gcsURLToContainingFolder,
                },
            };
        },
    },
    job_name: {
        param: 'displayName',
        required: true,
        default: () => {
            return crypto.randomUUID();
        },
    },
};
export const GoogleBatchCreateResponseTransform = (response, responseStatus) => {
    if (responseStatus === 200) {
        return GoogleToOpenAIBatch(response);
    }
    return response;
};
