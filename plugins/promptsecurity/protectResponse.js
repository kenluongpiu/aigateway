import { getText } from '../utils';
import { promptSecurityProtectApi } from './shared';
export const handler = async (context, parameters, eventType) => {
    let error = null;
    let verdict = false;
    let data = null;
    try {
        let scanResponseObject = { response: getText(context, eventType) };
        data = await promptSecurityProtectApi(parameters.credentials, scanResponseObject);
        data = data.result.response;
        verdict = data.passed;
    }
    catch (e) {
        delete e.stack;
        error = e;
    }
    return { error, verdict, data };
};
