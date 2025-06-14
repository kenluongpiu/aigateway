export const AzureTransformFinetuneBody = (body) => {
    const _body = { ...body };
    if (_body.method && !_body.hyperparameters) {
        const hyperparameters = _body.method[_body.method.type]?.hyperparameters ?? {};
        _body.hyperparameters = { ...hyperparameters };
        delete _body.method;
    }
    return {
        ..._body,
    };
};
