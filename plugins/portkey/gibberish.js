import { getText } from '../utils';
import { PORTKEY_ENDPOINTS, fetchPortkey } from './globals';
export const handler = async (context, parameters, eventType, options) => {
    let error = null;
    let verdict = false;
    let data = null;
    try {
        const text = getText(context, eventType);
        const not = parameters.not || false;
        const response = await fetchPortkey(options?.env || {}, PORTKEY_ENDPOINTS.GIBBERISH, parameters.credentials, { input: text }, parameters.timeout);
        const isClean = response[0][0].label === 'clean';
        verdict = not ? !isClean : isClean;
        data = {
            verdict,
            not,
            explanation: verdict
                ? not
                    ? 'The text is gibberish as expected.'
                    : 'The text is not gibberish.'
                : not
                    ? 'The text is not gibberish when it should be.'
                    : 'The text appears to be gibberish.',
            analysis: response[0],
            textExcerpt: text.length > 100 ? text.slice(0, 100) + '...' : text,
        };
    }
    catch (e) {
        error = e;
        const text = getText(context, eventType);
        data = {
            explanation: `An error occurred while checking for gibberish: ${error.message}`,
            not: parameters.not || false,
            textExcerpt: text
                ? text.length > 100
                    ? text.slice(0, 100) + '...'
                    : text
                : 'No text available',
        };
    }
    return { error, verdict, data };
};
