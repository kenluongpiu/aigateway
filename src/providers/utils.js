export const generateInvalidProviderResponseError = (response, provider) => {
    return {
        error: {
            message: `Invalid response received from ${provider}: ${JSON.stringify(response)}`,
            type: null,
            param: null,
            code: null,
        },
        provider: provider,
    };
};
export const generateErrorResponse = ({ message, type, param, code }, provider) => {
    return {
        error: {
            message: `${provider} error: ${message}`,
            type: type ?? null,
            param: param ?? null,
            code: code ?? null,
        },
        provider: provider,
    };
};
export function splitString(input, separator) {
    const sepIndex = input.indexOf(separator);
    if (sepIndex === -1) {
        return {
            before: input,
            after: '',
        };
    }
    return {
        before: input.substring(0, sepIndex),
        after: input.substring(sepIndex + 1),
    };
}
