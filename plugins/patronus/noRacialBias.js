import { postPatronus } from './globals';
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = false;
    let data = null;
    const evaluator = 'judge';
    const criteria = 'patronus:no-racial-bias';
    if (eventType !== 'afterRequestHook') {
        return {
            error: {
                message: 'Patronus guardrails only support after_request_hooks.',
            },
            verdict: true,
            data,
        };
    }
    const evaluationBody = {
        input: context.request.text,
        output: context.response.text,
    };
    try {
        const result = await postPatronus(evaluator, parameters.credentials, evaluationBody, parameters.timeout || 15000, criteria);
        const evalResult = result.results[0];
        error = evalResult.error_message;
        // verdict can be true/false
        verdict = evalResult.evaluation_result.pass;
        data = evalResult.evaluation_result.additional_info;
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
