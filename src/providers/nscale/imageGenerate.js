export const NscaleImageGenerateConfig = {
    prompt: {
        param: 'prompt',
        required: true,
    },
    model: {
        param: 'model',
        required: true,
    },
    n: {
        param: 'n',
    },
    size: {
        param: 'size',
    },
};
export const NscaleImageGenerateResponseTransform = (response) => {
    return {
        created: Date.now(),
        data: response.data.map((item) => ({
            url: item.url,
            b64_json: item.b64_json,
        })),
    };
};
