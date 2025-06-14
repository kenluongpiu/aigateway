import { constructConfigFromRequestHeaders } from './handlerUtils';
import WebSocket from 'ws';
import Providers from '../providers';
import { RealtimeLlmEventParser } from '../services/realtimeLlmEventParser';
export async function realTimeHandlerNode(c) {
    try {
        let incomingWebsocket = null;
        const requestHeaders = Object.fromEntries(c.req.raw.headers);
        const camelCaseConfig = constructConfigFromRequestHeaders(requestHeaders);
        const provider = camelCaseConfig?.provider ?? '';
        const apiConfig = Providers[provider].api;
        const providerOptions = camelCaseConfig;
        const baseUrl = apiConfig.getBaseURL({
            providerOptions,
            c,
            gatewayRequestURL: c.req.url,
        });
        const endpoint = apiConfig.getEndpoint({
            c,
            providerOptions,
            fn: 'realtime',
            gatewayRequestBodyJSON: {},
            gatewayRequestURL: c.req.url,
        });
        let url = `${baseUrl}${endpoint}`;
        url = url.replace('https://', 'wss://');
        const headers = await apiConfig.headers({
            c,
            providerOptions,
            fn: 'realtime',
            transformedRequestUrl: url,
            transformedRequestBody: {},
        });
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
        const outgoingWebSocket = new WebSocket(url, {
            headers,
        });
        const eventParser = new RealtimeLlmEventParser();
        outgoingWebSocket.addEventListener('message', (event) => {
            incomingWebsocket?.send(event.data);
            try {
                const parsedData = JSON.parse(event.data);
                eventParser.handleEvent(c, parsedData, sessionOptions);
            }
            catch (err) {
                console.error(`eventParser.handleEvent error: ${err.message}`);
            }
        });
        outgoingWebSocket.addEventListener('close', (event) => {
            incomingWebsocket?.close(event.code, event.reason);
        });
        outgoingWebSocket.addEventListener('error', (event) => {
            console.error(`outgoingWebSocket error: ${event.message}`);
            incomingWebsocket?.close();
        });
        return {
            onOpen(evt, ws) {
                incomingWebsocket = ws;
            },
            onMessage(event) {
                outgoingWebSocket?.send(event.data);
            },
            onError(evt) {
                console.error(`incomingWebsocket error: ${evt.type}`);
                outgoingWebSocket?.close();
            },
            onClose() {
                outgoingWebSocket?.close();
            },
        };
    }
    catch (err) {
        c.set('websocketError', true);
        return {
            onOpen() { },
            onMessage() { },
            onError() { },
            onClose() { },
        };
    }
}
