import { post } from '../utils';
export const handler = async (context, parameters) => {
    let error = null;
    let verdict = false;
    let data = null;
    try {
        let url = parameters.logURL;
        let headers = parameters?.headers
            ? JSON.parse(parameters.headers)
            : {};
        // log the request
        await post(url, context, { headers }, parameters.timeout || 3000);
        verdict = true;
        data = { message: `Logged the request to ${url}` };
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
