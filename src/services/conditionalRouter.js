import { StrategyModes } from '../types/requestBody';
var Operator;
(function (Operator) {
    // Comparison Operators
    Operator["Equal"] = "$eq";
    Operator["NotEqual"] = "$ne";
    Operator["GreaterThan"] = "$gt";
    Operator["GreaterThanOrEqual"] = "$gte";
    Operator["LessThan"] = "$lt";
    Operator["LessThanOrEqual"] = "$lte";
    Operator["In"] = "$in";
    Operator["NotIn"] = "$nin";
    Operator["Regex"] = "$regex";
    // Logical Operators
    Operator["And"] = "$and";
    Operator["Or"] = "$or";
})(Operator || (Operator = {}));
export class ConditionalRouter {
    config;
    context;
    constructor(config, context) {
        this.config = config;
        this.context = context;
        if (this.config.strategy?.mode !== StrategyModes.CONDITIONAL) {
            throw new Error('Unsupported strategy mode');
        }
    }
    resolveTarget() {
        if (!this.config.strategy?.conditions) {
            throw new Error('No conditions passed in the query router');
        }
        for (const condition of this.config.strategy.conditions) {
            if (this.evaluateQuery(condition.query)) {
                const targetName = condition.then;
                return this.findTarget(targetName);
            }
        }
        // If no conditions matched and a default is specified, return the default target
        if (this.config.strategy.default) {
            return this.findTarget(this.config.strategy.default);
        }
        throw new Error('Query router did not resolve to any valid target');
    }
    evaluateQuery(query) {
        for (const [key, value] of Object.entries(query)) {
            if (key === Operator.Or && Array.isArray(value)) {
                return value.some((subCondition) => this.evaluateQuery(subCondition));
            }
            if (key === Operator.And && Array.isArray(value)) {
                return value.every((subCondition) => this.evaluateQuery(subCondition));
            }
            const contextValue = this.getContextValue(key);
            if (typeof value === 'object' && value !== null) {
                if (!this.evaluateOperator(value, contextValue)) {
                    return false;
                }
            }
            else if (contextValue !== value) {
                return false;
            }
        }
        return true;
    }
    evaluateOperator(operator, value) {
        for (const [op, compareValue] of Object.entries(operator)) {
            switch (op) {
                case Operator.Equal:
                    if (value !== compareValue)
                        return false;
                    break;
                case Operator.NotEqual:
                    if (value === compareValue)
                        return false;
                    break;
                case Operator.GreaterThan:
                    if (!(parseFloat(value) > parseFloat(compareValue)))
                        return false;
                    break;
                case Operator.GreaterThanOrEqual:
                    if (!(parseFloat(value) >= parseFloat(compareValue)))
                        return false;
                    break;
                case Operator.LessThan:
                    if (!(parseFloat(value) < parseFloat(compareValue)))
                        return false;
                    break;
                case Operator.LessThanOrEqual:
                    if (!(parseFloat(value) <= parseFloat(compareValue)))
                        return false;
                    break;
                case Operator.In:
                    if (!Array.isArray(compareValue) || !compareValue.includes(value))
                        return false;
                    break;
                case Operator.NotIn:
                    if (!Array.isArray(compareValue) || compareValue.includes(value))
                        return false;
                    break;
                case Operator.Regex:
                    try {
                        const regex = new RegExp(compareValue);
                        return regex.test(value);
                    }
                    catch (e) {
                        return false;
                    }
                default:
                    throw new Error(`Unsupported operator used in the query router: ${op}`);
            }
        }
        return true;
    }
    findTarget(name) {
        const index = this.config.targets?.findIndex((target) => target.name === name) ?? -1;
        if (index === -1) {
            throw new Error(`Invalid target name found in the query router: ${name}`);
        }
        return {
            ...this.config.targets?.[index],
            index,
        };
    }
    getContextValue(key) {
        const parts = key.split('.');
        let value = this.context;
        value = value[parts[0]]?.[parts[1]];
        return value;
    }
}
