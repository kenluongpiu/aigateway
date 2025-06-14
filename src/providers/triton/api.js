const TritonAPIConfig = {
    headers: () => {
        return {};
    },
    getBaseURL: ({ providerOptions }) => {
        return providerOptions.customHost ?? '';
    },
    getEndpoint: ({ fn, providerOptions }) => {
        let mappedFn = fn;
        switch (mappedFn) {
            case 'complete': {
                return `/generate`;
            }
            default:
                return '';
        }
    },
};
export default TritonAPIConfig;
