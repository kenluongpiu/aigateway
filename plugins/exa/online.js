import { getCurrentContentPart, post } from '../utils';
const BASE_URL = 'https://api.exa.ai/search';
const performExaSearch = async (query, credentials, timeout, numResults = 10, includeDomains, excludeDomains) => {
    if (!query.trim())
        return { searchResults: null, data: null };
    const searchBody = {
        query,
        numResults,
        useAutoprompt: true,
        contents: {
            text: true,
        },
    };
    // Add domain filters if provided
    if (includeDomains && includeDomains.length > 0) {
        searchBody.includeDomains = includeDomains;
    }
    if (excludeDomains && excludeDomains.length > 0) {
        searchBody.excludeDomains = excludeDomains;
    }
    const options = {
        headers: {
            'x-api-key': `${credentials.apiKey}`,
            'Content-Type': 'application/json',
        },
    };
    try {
        const result = await post(BASE_URL, searchBody, options, timeout || 10000);
        if (!result.results || result.results.length === 0) {
            return { searchResults: null, data: null };
        }
        const formattedResults = result.results.map((item) => ({
            title: item.title,
            url: item.url,
            text: item.text,
            published_date: item.published_date,
        }));
        return { searchResults: formattedResults, data: result };
    }
    catch (error) {
        console.error('Error searching with Exa:', error);
        return { searchResults: null, data: { error } };
    }
};
const formatSearchResultsForPrompt = (results, prefix = '\n<web_search_context>', suffix = '\n</web_search_context>') => {
    if (!results || results.length === 0)
        return '';
    let formattedText = prefix + '\n';
    results.forEach((result, index) => {
        formattedText += `[${index + 1}] "${result.title}"\n`;
        formattedText += `URL: ${result.url}\n`;
        if (result.published_date) {
            formattedText += `Date: ${result.published_date}\n`;
        }
        formattedText += `${result.text}\n`;
    });
    formattedText += suffix;
    return formattedText;
};
const insertSearchResults = (context, searchResults) => {
    const json = context.request.json;
    const updatedJson = { ...json };
    if (context.requestType === 'chatComplete') {
        const messages = [...json.messages];
        const systemIndex = messages.findIndex((msg) => msg.role === 'system');
        if (systemIndex !== -1) {
            // Append to existing system message
            messages[systemIndex] = {
                ...messages[systemIndex],
                content: messages[systemIndex].content + searchResults,
            };
        }
        else {
            // If no system message exists, add one
            messages.unshift({
                role: 'system',
                content: searchResults,
            });
        }
        updatedJson.messages = messages;
    }
    else {
        // For completion requests, just prepend the search results
        updatedJson.prompt = searchResults + updatedJson.prompt;
    }
    return {
        request: {
            json: updatedJson,
        },
        response: {
            json: null,
        },
    };
};
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = true; // Always allow the request to continue
    let data = null;
    const transformedData = {
        request: {
            json: null,
        },
        response: {
            json: null,
        },
    };
    let transformed = false;
    try {
        // Only process before request and only for completion/chat completion
        if (eventType !== 'beforeRequestHook' ||
            (context.requestType !== 'complete' &&
                context.requestType !== 'chatComplete')) {
            return {
                error: null,
                verdict: true,
                data: null,
                transformedData,
                transformed,
            };
        }
        const { content, textArray } = getCurrentContentPart(context, eventType);
        if (!content) {
            return {
                error: { message: 'request or response json is empty' },
                verdict: true,
                data: null,
                transformedData,
                transformed,
            };
        }
        // Combine all text parts into a single query
        const combinedQuery = textArray.join(' ').trim();
        // Perform a single search with the combined text
        const result = await performExaSearch(combinedQuery, parameters.credentials, parameters.timeout, parameters.numResults || 10, parameters.includeDomains, parameters.excludeDomains);
        // Store the search metadata including sources
        data = {
            ...result?.data,
            sources: result?.searchResults?.map((r) => ({
                title: r.title,
                url: r.url,
                text: r.text,
                published_date: r.published_date,
            })),
        };
        // If search results were found, insert them according to the specified location
        if (result?.searchResults) {
            const formattedResults = formatSearchResultsForPrompt(result.searchResults, parameters.prefix, parameters.suffix);
            // Insert the search results
            const newTransformedData = insertSearchResults(context, formattedResults);
            Object.assign(transformedData, newTransformedData);
            transformed = true;
        }
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data, transformedData, transformed };
};
