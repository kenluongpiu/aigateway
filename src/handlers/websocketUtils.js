export const addListeners = (outgoingWebSocket, eventParser, server, c, sessionOptions) => {
    outgoingWebSocket.addEventListener('message', (event) => {
        server?.send(event.data);
        try {
            const parsedData = JSON.parse(event.data);
            eventParser.handleEvent(c, parsedData, sessionOptions);
        }
        catch (err) {
            console.log('outgoingWebSocket message parse error', event);
        }
    });
    outgoingWebSocket.addEventListener('close', (event) => {
        server?.close(event.code, event.reason);
    });
    outgoingWebSocket.addEventListener('error', (event) => {
        console.log('outgoingWebSocket error', event);
        server?.close();
    });
    server.addEventListener('message', (event) => {
        outgoingWebSocket?.send(event.data);
    });
    server.addEventListener('close', () => {
        outgoingWebSocket?.close();
    });
    server.addEventListener('error', (event) => {
        console.log('serverWebSocket error', event);
        outgoingWebSocket?.close();
    });
};
export const getOptionsForOutgoingConnection = async (apiConfig, providerOptions, url, c) => {
    const headers = await apiConfig.headers({
        c,
        providerOptions,
        fn: 'realtime',
        transformedRequestUrl: url,
        transformedRequestBody: {},
    });
    headers['Upgrade'] = 'websocket';
    headers['Connection'] = 'Keep-Alive';
    headers['Keep-Alive'] = 'timeout=600';
    return {
        headers,
        method: 'GET',
    };
};
export const getURLForOutgoingConnection = (apiConfig, providerOptions, gatewayRequestURL, c) => {
    const baseUrl = apiConfig.getBaseURL({
        providerOptions,
        c,
        gatewayRequestURL,
    });
    const endpoint = apiConfig.getEndpoint({
        c,
        providerOptions,
        fn: 'realtime',
        gatewayRequestBodyJSON: {},
        gatewayRequestURL: gatewayRequestURL,
    });
    return `${baseUrl}${endpoint}`;
};
