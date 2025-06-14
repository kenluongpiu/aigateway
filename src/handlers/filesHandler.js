import { constructConfigFromRequestHeaders, tryTargetsRecursively, } from './handlerUtils';
function filesHandler(endpoint, method) {
    async function handler(c) {
        try {
            const requestHeaders = Object.fromEntries(c.req.raw.headers);
            const camelCaseConfig = constructConfigFromRequestHeaders(requestHeaders);
            let body = {};
            if (c.req.raw.body instanceof ReadableStream) {
                body = c.req.raw.body;
            }
            const tryTargetsResponse = await tryTargetsRecursively(c, camelCaseConfig ?? {}, body, requestHeaders, endpoint, method, 'config');
            return tryTargetsResponse;
        }
        catch (err) {
            console.error({ message: `${endpoint} error ${err.message}` });
            return new Response(JSON.stringify({
                status: 'failure',
                message: 'Something went wrong',
            }), {
                status: 500,
                headers: {
                    'content-type': 'application/json',
                },
            });
        }
    }
    return handler;
}
export default filesHandler;
