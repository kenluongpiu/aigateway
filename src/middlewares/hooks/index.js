import { HookType, } from './types';
import { plugins } from '../../../plugins';
import { HOOKS_EVENT_TYPE_PRESETS } from './globals';
export class HookSpan {
    context;
    beforeRequestHooks;
    afterRequestHooks;
    hooksResult;
    parentHookSpanId;
    id;
    constructor(requestParams, metadata, provider, isStreamingRequest, beforeRequestHooks, afterRequestHooks, parentHookSpanId, requestType, requestHeaders) {
        this.context = this.createContext(requestParams, metadata, provider, isStreamingRequest, requestType, requestHeaders);
        this.beforeRequestHooks = this.initializeHooks(beforeRequestHooks, 'beforeRequestHook');
        this.afterRequestHooks = this.initializeHooks(afterRequestHooks, 'afterRequestHook');
        this.parentHookSpanId = parentHookSpanId;
        this.hooksResult = {
            beforeRequestHooksResult: [],
            afterRequestHooksResult: [],
        };
        this.id = crypto.randomUUID();
    }
    createContext(requestParams, metadata, provider, isStreamingRequest, requestType, requestHeaders) {
        const requestText = this.extractRequestText(requestParams);
        return {
            request: {
                json: requestParams,
                text: requestText,
                isStreamingRequest,
                isTransformed: false,
                headers: requestHeaders,
            },
            response: {
                json: {},
                text: '',
                statusCode: null,
                isTransformed: false,
            },
            provider,
            requestType,
            metadata,
        };
    }
    extractRequestText(requestParams) {
        if (requestParams?.prompt) {
            return requestParams.prompt;
        }
        else if (requestParams?.messages?.length) {
            const lastMessage = requestParams.messages[requestParams.messages.length - 1];
            const concatenatedText = Array.isArray(lastMessage.content)
                ? lastMessage.content
                    .map((contentPart) => contentPart.text)
                    .join('\n')
                : '';
            return concatenatedText || lastMessage.content;
        }
        else if (requestParams?.input) {
            return Array.isArray(requestParams.input)
                ? requestParams.input.join('\n')
                : requestParams.input;
        }
        return '';
    }
    initializeHooks(hooks, eventType) {
        return hooks.map((hook) => ({ ...hook, eventType }));
    }
    setContextResponse(responseJSON, responseStatus) {
        const responseText = this.extractResponseText(responseJSON);
        this.context.response = {
            json: responseJSON,
            text: responseText,
            statusCode: responseStatus,
            isTransformed: this.context.response.isTransformed || false,
        };
    }
    setContextAfterTransform(responseJson, requestJson) {
        if (responseJson) {
            this.context.response.json = responseJson;
            this.context.response.text = this.extractResponseText(responseJson);
            this.context.response.isTransformed = true;
        }
        if (requestJson) {
            this.context.request.json = requestJson;
            this.context.request.text = this.extractRequestText(requestJson);
            this.context.request.isTransformed = true;
        }
    }
    extractResponseText(responseJSON) {
        if (responseJSON?.choices?.length) {
            const choice = responseJSON.choices[0];
            if (choice.text) {
                return choice.text;
            }
            else if (choice?.message?.content) {
                return choice.message.content.text || choice.message.content;
            }
        }
        return '';
    }
    addHookResult(eventType, result) {
        if (eventType === 'beforeRequestHook') {
            this.hooksResult.beforeRequestHooksResult.push(result);
        }
        else if (eventType === 'afterRequestHook') {
            this.hooksResult.afterRequestHooksResult.push(result);
        }
    }
    resetHookResult(eventType) {
        if (eventType === 'beforeRequestHook') {
            this.hooksResult.beforeRequestHooksResult = [];
        }
        else if (eventType === 'afterRequestHook') {
            this.hooksResult.afterRequestHooksResult = [];
        }
    }
    getContext() {
        return this.context;
    }
    getBeforeRequestHooks() {
        return this.beforeRequestHooks;
    }
    getAfterRequestHooks() {
        return this.afterRequestHooks;
    }
    getParentHookSpanId() {
        return this.parentHookSpanId;
    }
    getHooksResult() {
        return this.hooksResult;
    }
}
export class HooksManager {
    spans = {};
    plugins;
    constructor() {
        this.plugins = plugins;
    }
    createSpan(requestParams, metadata, provider, isStreamingRequest, beforeRequestHooks, afterRequestHooks, parentHookSpanId, requestType, requestHeaders) {
        const span = new HookSpan(requestParams, metadata, provider, isStreamingRequest, beforeRequestHooks, afterRequestHooks, parentHookSpanId, requestType, requestHeaders);
        this.spans[span.id] = span;
        return span;
    }
    setSpanContextResponse(spanId, responseJson, responseStatusCode) {
        const span = this.getSpan(spanId);
        span.setContextResponse(responseJson, responseStatusCode);
    }
    async executeHooks(spanId, eventTypePresets, options) {
        const span = this.getSpan(spanId);
        const hooksToExecute = this.getHooksToExecute(span, eventTypePresets);
        if (hooksToExecute.length === 0) {
            return { results: [], shouldDeny: false };
        }
        try {
            const results = await Promise.all(hooksToExecute.map((hook) => this.executeEachHook(spanId, hook, options)));
            const shouldDeny = results.some((result, index) => !result.verdict && hooksToExecute[index].deny && !result.skipped);
            return { results, shouldDeny };
        }
        catch (err) {
            console.error(`Error executing hooks:`, err);
            return { results: [], shouldDeny: false };
        }
    }
    getSpan(spanId) {
        const span = this.spans[spanId] || {};
        return span;
    }
    async executeFunction(context, check, eventType, options) {
        const [source, fn] = check.id.split('.');
        const createdAt = new Date();
        try {
            const result = await this.plugins[source][fn](context, check.parameters, eventType, options);
            return {
                transformedData: result.transformedData,
                data: result.data || null,
                verdict: result.verdict,
                id: check.id,
                error: result.error
                    ? { name: result.error.name, message: result.error.message }
                    : undefined,
                execution_time: new Date().getTime() - createdAt.getTime(),
                transformed: result.transformed || false,
                created_at: createdAt,
                log: result.log || null,
            };
        }
        catch (err) {
            console.error(`Error executing check "${check.id}":`, err);
            return {
                error: {
                    name: 'Check error',
                    message: 'Error executing check',
                },
                verdict: false,
                data: null,
                id: check.id,
                execution_time: new Date().getTime() - createdAt.getTime(),
                created_at: createdAt,
            };
        }
    }
    async executeEachHook(spanId, hook, options) {
        const span = this.getSpan(spanId);
        let hookResult = { id: hook.id, type: hook.type };
        let checkResults = [];
        const createdAt = new Date();
        if (this.shouldSkipHook(span, hook)) {
            return { ...hookResult, skipped: true };
        }
        if (hook.type === HookType.MUTATOR && hook.checks) {
            for (const check of hook.checks) {
                const result = await this.executeFunction(span.getContext(), check, hook.eventType, options);
                if (result.transformedData &&
                    (result.transformedData.response.json ||
                        result.transformedData.request.json)) {
                    span.setContextAfterTransform(result.transformedData.response.json, result.transformedData.request.json);
                }
                delete result.transformedData;
                checkResults.push(result);
            }
        }
        if (hook.type === HookType.GUARDRAIL && hook.checks) {
            checkResults = await Promise.all(hook.checks
                .filter((check) => check.is_enabled !== false)
                .map((check) => this.executeFunction(span.getContext(), check, hook.eventType, options)));
            checkResults.forEach((checkResult) => {
                if (checkResult.transformedData &&
                    (checkResult.transformedData.response.json ||
                        checkResult.transformedData.request.json)) {
                    span.setContextAfterTransform(checkResult.transformedData.response.json, checkResult.transformedData.request.json);
                }
                delete checkResult.transformedData;
            });
        }
        hookResult = {
            verdict: checkResults.every((result) => result.verdict || result.error),
            id: hook.id,
            transformed: checkResults.some((result) => result.transformed),
            checks: checkResults,
            feedback: this.createFeedbackObject(checkResults, hook.onFail, hook.onSuccess),
            execution_time: new Date().getTime() - createdAt.getTime(),
            async: hook.async || false,
            type: hook.type,
            created_at: createdAt,
        };
        if (hook.deny && !hookResult.verdict) {
            hookResult.deny = true;
        }
        else {
            hookResult.deny = false;
        }
        span.addHookResult(hook.eventType, hookResult);
        return hookResult;
    }
    shouldSkipHook(span, hook) {
        const context = span.getContext();
        return (!['chatComplete', 'complete', 'embed'].includes(context.requestType) ||
            (context.requestType === 'embed' &&
                hook.eventType !== 'beforeRequestHook') ||
            (context.requestType === 'embed' && hook.type === HookType.MUTATOR) ||
            (hook.eventType === 'afterRequestHook' &&
                context.response.statusCode !== 200) ||
            (hook.eventType === 'afterRequestHook' &&
                context.request.isStreamingRequest &&
                !context.response.text) ||
            (hook.eventType === 'beforeRequestHook' &&
                span.getParentHookSpanId() !== null) ||
            (hook.type === HookType.MUTATOR && !!hook.async));
    }
    createFeedbackObject(results, onFail, onSuccess) {
        const verdict = results.every((result) => result.verdict || result.error);
        const feedbackConfig = verdict ? onSuccess?.feedback : onFail?.feedback;
        if (!feedbackConfig) {
            return null;
        }
        return {
            value: feedbackConfig.value,
            weight: feedbackConfig.weight,
            metadata: {
                ...feedbackConfig.metadata,
                successfulChecks: this.getCheckIds(results, true),
                failedChecks: this.getCheckIds(results, false, false),
                erroredChecks: this.getCheckIds(results, false, true),
            },
        };
    }
    getCheckIds(results, successful, errored = false) {
        return results
            .filter((result) => successful
            ? result.verdict === true
            : result.verdict === false && errored === !!result.error)
            .map((result) => result.id)
            .join(', ');
    }
    getHooksToExecute(span, eventTypePresets) {
        const hooksToExecute = [];
        if (eventTypePresets.includes(HOOKS_EVENT_TYPE_PRESETS.ASYNC_BEFORE_REQUEST_HOOK)) {
            hooksToExecute.push(...span.getBeforeRequestHooks().filter((h) => h.async));
        }
        if (eventTypePresets.includes(HOOKS_EVENT_TYPE_PRESETS.SYNC_BEFORE_REQUEST_HOOK)) {
            hooksToExecute.push(...span.getBeforeRequestHooks().filter((h) => !h.async));
        }
        if (eventTypePresets.includes(HOOKS_EVENT_TYPE_PRESETS.ASYNC_AFTER_REQUEST_HOOK)) {
            hooksToExecute.push(...span.getAfterRequestHooks().filter((h) => h.async));
        }
        if (eventTypePresets.includes(HOOKS_EVENT_TYPE_PRESETS.SYNC_AFTER_REQUEST_HOOK)) {
            hooksToExecute.push(...span.getAfterRequestHooks().filter((h) => !h.async));
        }
        return hooksToExecute;
    }
}
export const hooks = (c, next) => {
    const hooksManager = new HooksManager();
    c.set('hooksManager', hooksManager);
    c.set('executeHooks', hooksManager.executeHooks.bind(hooksManager));
    return next();
};
