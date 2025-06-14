import { getText } from '../utils';
import { postPromptfoo } from './globals';
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = true;
    let data = null;
    try {
        const harmObject = {
            input: getText(context, eventType),
        };
        const result = await postPromptfoo('harm', harmObject, parameters.timeout);
        // If any harm category is flagged, set verdict to false
        if (result.results[0].flagged) {
            verdict = false;
        }
        data = result.results[0];
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
