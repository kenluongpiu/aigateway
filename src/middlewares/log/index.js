import { getRuntimeKey } from 'hono/adapter';
let logId = 0;
const MAX_RESPONSE_LENGTH = 100000;
// Map to store all connected log clients
const logClients = new Map();
const addLogClient = (clientId, client) => {
    logClients.set(clientId, client);
    // console.log(
    //   `New client ${clientId} connected. Total clients: ${logClients.size}`
    // );
};
const removeLogClient = (clientId) => {
    logClients.delete(clientId);
    // console.log(
    //   `Client ${clientId} disconnected. Total clients: ${logClients.size}`
    // );
};
const broadcastLog = async (log) => {
    const message = {
        data: log,
        event: 'log',
        id: String(logId++),
    };
    const deadClients = [];
    // Run all sends in parallel
    await Promise.all(Array.from(logClients.entries()).map(async ([id, client]) => {
        try {
            await Promise.race([
                client.sendLog(message),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Send timeout')), 1000)),
            ]);
        }
        catch (error) {
            console.error(`Failed to send log to client ${id}:`, error.message);
            deadClients.push(id);
        }
    }));
    // Remove dead clients after iteration
    deadClients.forEach((id) => {
        removeLogClient(id);
    });
};
async function processLog(c, start) {
    const ms = Date.now() - start;
    if (!c.req.url.includes('/v1/'))
        return;
    const requestOptionsArray = c.get('requestOptions');
    if (!requestOptionsArray?.length) {
        return;
    }
    try {
        const response = requestOptionsArray[0].requestParams.stream
            ? { message: 'The response was a stream.' }
            : await c.res.clone().json();
        const responseString = JSON.stringify(response);
        if (responseString.length > MAX_RESPONSE_LENGTH) {
            requestOptionsArray[0].response =
                responseString.substring(0, MAX_RESPONSE_LENGTH) + '...';
        }
        else {
            requestOptionsArray[0].response = response;
        }
    }
    catch (error) {
        console.error('Error processing log:', error);
    }
    await broadcastLog(JSON.stringify({
        time: new Date().toLocaleString(),
        method: c.req.method,
        endpoint: c.req.url.split(':8787')[1],
        status: c.res.status,
        duration: ms,
        requestOptions: requestOptionsArray,
    }));
}
export const logger = () => {
    return async (c, next) => {
        c.set('addLogClient', addLogClient);
        c.set('removeLogClient', removeLogClient);
        const start = Date.now();
        await next();
        const runtime = getRuntimeKey();
        if (runtime == 'workerd') {
            c.executionCtx.waitUntil(processLog(c, start));
        }
        else if (['node', 'bun', 'deno'].includes(runtime)) {
            processLog(c, start).then().catch(console.error);
        }
    };
};
