import OpenAIAPIConfig from './api';
// Return a ReadableStream containing batches output data
export const OpenAIGetBatchOutputRequestHandler = async ({ c, providerOptions, requestURL, }) => {
    // get batch details which has ouptut file id
    // get file content as ReadableStream
    // return file content
    const baseUrl = OpenAIAPIConfig.getBaseURL({
        providerOptions,
        fn: 'retrieveBatch',
        c,
        gatewayRequestURL: requestURL,
    });
    const batchId = requestURL.split('/v1/batches/')[1].replace('/output', '');
    const retrieveBatchURL = `${baseUrl}/batches/${batchId}`;
    const retrieveBatchesHeaders = await OpenAIAPIConfig.headers({
        c,
        providerOptions,
        fn: 'retrieveBatch',
        transformedRequestBody: {},
        transformedRequestUrl: retrieveBatchURL,
        gatewayRequestBody: {},
    });
    const retrieveBatchesResponse = await fetch(retrieveBatchURL, {
        method: 'GET',
        headers: retrieveBatchesHeaders,
    });
    const batchDetails = await retrieveBatchesResponse.json();
    const outputFileId = batchDetails.output_file_id;
    if (!outputFileId) {
        const errors = batchDetails.errors;
        if (errors) {
            return new Response(JSON.stringify(errors), {
                status: 200,
            });
        }
    }
    const retrieveFileContentURL = `${baseUrl}/files/${outputFileId}/content`;
    const retrieveFileContentHeaders = await OpenAIAPIConfig.headers({
        c,
        providerOptions,
        fn: 'retrieveFileContent',
        transformedRequestBody: {},
        transformedRequestUrl: retrieveFileContentURL,
        gatewayRequestBody: {},
    });
    const response = fetch(retrieveFileContentURL, {
        method: 'GET',
        headers: retrieveFileContentHeaders,
    });
    return response;
};
export const BatchOutputResponseTransform = async (response) => {
    return response;
};
