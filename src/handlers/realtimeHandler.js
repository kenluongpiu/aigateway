import { constructConfigFromRequestHeaders } from './handlerUtils';
import Providers from '../providers';
import { addListeners, getOptionsForOutgoingConnection, getURLForOutgoingConnection, } from './websocketUtils';
import { RealtimeLlmEventParser } from '../services/realtimeLlmEventParser';
const getOutgoingWebSocket = async (url, options) => {
    let outgoingWebSocket = null;
    try {
        let response = await fetch(url, options);
        outgoingWebSocket = response.webSocket;
    }
    catch (error) {
        console.log(error);
    }
    if (!outgoingWebSocket) {
        throw new Error('WebSocket connection failed');
    }
    outgoingWebSocket.accept();
    return outgoingWebSocket;
};
export async function realTimeHandler(c) {
    try {
        const requestHeaders = Object.fromEntries(c.req.raw.headers);
        const providerOptions = constructConfigFromRequestHeaders(requestHeaders);
        const provider = providerOptions.provider ?? '';
        const apiConfig = Providers[provider].api;
        const url = getURLForOutgoingConnection(apiConfig, providerOptions, c.req.url, c);
        const options = await getOptionsForOutgoingConnection(apiConfig, providerOptions, url, c);
        const sessionOptions = {
            id: crypto.randomUUID(),
            providerOptions: {
                ...providerOptions,
                requestURL: url,
                rubeusURL: 'realtime',
            },
            requestHeaders,
            requestParams: {},
        };
        const webSocketPair = new WebSocketPair();
        const client = webSocketPair[0];
        const server = webSocketPair[1];
        server.accept();
        let outgoingWebSocket = await getOutgoingWebSocket(url, options);
        const eventParser = new RealtimeLlmEventParser();
        addListeners(outgoingWebSocket, eventParser, server, c, sessionOptions);
        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }
    catch (err) {
        console.log('realtimeHandler error', err.message);
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
