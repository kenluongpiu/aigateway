import { getText } from '../utils';
import { postPillar } from './globals';
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = false;
    let data = null;
    if (parameters.scanners.length === 0) {
        return { error: { message: 'No scanners specified' }, verdict: true, data };
    }
    let scannerObject = {};
    parameters.scanners.forEach((scanner) => {
        scannerObject[scanner] = true;
    });
    try {
        let scanPromptObject = {
            message: getText(context, eventType),
            scanners: scannerObject,
        };
        const result = await postPillar('scanPrompt', parameters.credentials, scanPromptObject, parameters.timeout);
        // result is an object with the following structure:
        // {
        //   "pii": false,
        // 	"prompt_injection": false,
        //   "secrets": null,
        //   "toxic_language": null,
        //   "invisible_characters": null
        // }
        // if any of the scanners found something, we will return a verdict of false
        // ignore null values - they're counted as true as well
        // attach the result object as data
        for (const key in result) {
            if (result[key] !== null &&
                result[key] !== false &&
                [
                    'pii',
                    'prompt_injection',
                    'secrets',
                    'toxic_language',
                    'invisible_characters',
                ].includes(key)) {
                verdict = false;
                break;
            }
            verdict = true;
        }
        data = result;
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
