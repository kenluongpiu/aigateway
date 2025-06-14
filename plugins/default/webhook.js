import { post } from '../utils';
function parseHeaders(headers) {
    try {
        if (typeof headers === 'object' && headers !== null) {
            return headers;
        }
        if (typeof headers === 'string') {
            try {
                const parsed = JSON.parse(headers);
                return parsed;
            }
            catch {
                throw new Error('Invalid headers format');
            }
        }
        return {};
    }
    catch (error) {
        throw error;
    }
}
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = false;
    let data = null;
    const transformedData = {
        request: {
            json: null,
            text: null,
        },
        response: {
            json: null,
            text: null,
        },
    };
    let transformed = false;
    try {
        const url = parameters.webhookURL;
        if (!url) {
            throw new Error('Missing webhook URL');
        }
        // Validate URL format
        try {
            new URL(url);
        }
        catch {
            throw new Error('Invalid webhook URL format');
        }
        let headers;
        try {
            headers = parseHeaders(parameters.headers);
        }
        catch (e) {
            throw new Error(`Failed to parse headers: ${e.message}`);
        }
        const requestBody = {
            ...context,
            // Setting headers to undefined to avoid passing sensitive information to the webhook endpoint.
            // This can later be controlled through parameters.
            request: { ...context.request, headers: undefined },
            eventType,
        };
        const response = await post(url, requestBody, { headers }, parameters.timeout || 3000);
        verdict = response.verdict;
        if (response.transformedData?.request?.json &&
            eventType === 'beforeRequestHook') {
            transformedData.request.json = response.transformedData.request.json;
            transformed = true;
        }
        if (response.transformedData?.response?.json &&
            eventType === 'afterRequestHook') {
            transformedData.response.json = response.transformedData.response.json;
            transformed = true;
        }
        data = {
            verdict,
            explanation: verdict
                ? 'Webhook request succeeded'
                : 'Webhook request failed',
            webhookUrl: url,
            responseData: response.data,
            requestContext: {
                headers,
                timeout: 3000,
            },
        };
    }
    catch (e) {
        error = e;
        delete error.stack;
        data = {
            explanation: `Webhook error: ${e.message}`,
            webhookUrl: parameters.webhookURL || 'No URL provided',
            requestContext: {
                headers: parameters.headers || {},
                timeout: 3000,
            },
        };
    }
    return { error, verdict, data, transformedData, transformed };
};
