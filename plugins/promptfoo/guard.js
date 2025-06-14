import { getText } from '../utils';
import { postPromptfoo } from './globals';
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = true;
    let data = null;
    try {
        const guardObject = {
            input: getText(context, eventType),
        };
        const result = await postPromptfoo('guard', guardObject, parameters.timeout);
        // For now, we only check for jailbreak
        if (result.results[0].categories.jailbreak) {
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
