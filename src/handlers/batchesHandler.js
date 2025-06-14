import { constructConfigFromRequestHeaders, tryTargetsRecursively, } from './handlerUtils';
function batchesHandler(endpoint, method) {
    async function handler(c) {
        try {
            let requestHeaders = Object.fromEntries(c.req.raw.headers);
            let request = endpoint === 'createBatch' ? await c.req.json() : {};
            const camelCaseConfig = constructConfigFromRequestHeaders(requestHeaders);
            const tryTargetsResponse = await tryTargetsRecursively(c, camelCaseConfig ?? {}, request, requestHeaders, endpoint, method, 'config');
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
export default batchesHandler;
