export const createDefaultHeaders = (provider, authorization) => {
    return {
        'x-portkey-provider': provider,
        Authorization: authorization,
        'Content-Type': 'application/json',
    };
};
