import { getText, post } from '../utils';
export const mistralGuardrailHandler = async (context, parameters, eventType, _options) => {
    let error = null;
    let verdict = true;
    let data = null;
    const creds = parameters.credentials;
    if (!creds.apiKey) {
        return {
            error: 'Mistral API key not provided.',
            verdict: false,
            data: null,
        };
    }
    let model = 'mistral-moderation-latest';
    if (parameters.model) {
        // Model can be passed dynamically
        model = parameters.model;
    }
    const checks = parameters.categories;
    const text = getText(context, eventType);
    const messages = eventType === 'beforeRequestHook'
        ? context.request?.json?.messages
        : context.response?.json?.messages;
    // should contain text or should contain messages array
    if ((!text && !Array.isArray(messages)) ||
        (Array.isArray(messages) && messages.length === 0)) {
        return {
            error: 'Mistral: Invalid Request body',
            verdict: false,
            data: null,
        };
    }
    // Use conversation guardrail if it's a chatcomplete and before hook
    const shouldUseConversation = eventType === 'beforeRequestHook' && context.requestType === 'chatComplete';
    const url = shouldUseConversation
        ? 'https://api.mistral.ai/v1/chat/moderations'
        : 'https://api.mistral.ai/v1/moderations';
    try {
        const request = await post(url, {
            model: model,
            ...(!shouldUseConversation && { input: [text] }),
            ...(shouldUseConversation && { input: [messages] }),
        }, {
            headers: {
                Authorization: `Bearer ${creds.apiKey}`,
                'Content-Type': 'application/json',
            },
        }, parameters.timeout);
        const categories = request.results[0]?.categories ?? {};
        const categoriesFlagged = Object.keys(categories).filter((category) => {
            if (checks.includes(category) &&
                !!categories[category]) {
                return true;
            }
            return false;
        });
        if (categoriesFlagged.length > 0) {
            verdict = false;
            data = { flagged_categories: categoriesFlagged };
        }
    }
    catch (err) {
        error = err;
        verdict = true;
    }
    return { error, verdict, data };
};
