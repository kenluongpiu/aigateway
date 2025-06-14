import { getText, post } from '../utils';
export const SYDEGUARD_URL = 'https://guard.sydelabs.ai/api/v1/guard/generate-score';
export const fetchSydeGuard = async (credentials, data, timeout) => {
    const options = {
        headers: {
            'x-api-key': credentials.apiKey,
        },
    };
    return post(SYDEGUARD_URL, data, options, timeout);
};
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = false;
    let data = null;
    try {
        // Get the text from the request or response
        const text = getText(context, eventType);
        // Get data from the relevant tool
        const result = await fetchSydeGuard(parameters.credentials, {
            prompt: text,
        }, parameters.timeout);
        // Result example:
        // {
        //   "error": null,
        //   "id": "661f5105dc31c4f221fde9e5",
        //   "score": 0.6135944724082947,
        //   "category_scores": [
        //     {
        //       "error": null,
        //       "category": "EVASION",
        //       "score": 0.0007834434509277344,
        //       "risk": false
        //     },
        //     {
        //       "error": null,
        //       "category": "PROMPT_INJECT",
        //       "score": 0.8399999737739563,
        //       "risk": true
        //     },
        //     {
        //       "error": null,
        //       "category": "TOXIC",
        //       "score": 1,
        //       "risk": true
        //     }
        //   ],
        //   "overall_risk": true
        // }
        if (!result?.category_scores) {
            error = new Error('No category scores found in the result');
        }
        else {
            // convert the category scores array into an object and category as key and score as value
            let scores = {}; // Initialize scores as an empty object
            result.category_scores.forEach((obj) => {
                scores[obj.category] = obj.score;
            });
            if (scores['PROMPT_INJECT'] > parameters.prompt_injection_threshold ||
                scores['TOXIC'] > parameters.toxicity_threshold ||
                scores['EVASION'] > parameters.evasion_threshold) {
                verdict = false;
            }
            else {
                verdict = true;
            }
            data = result;
        }
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
