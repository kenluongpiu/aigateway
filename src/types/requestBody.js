export var StrategyModes;
(function (StrategyModes) {
    StrategyModes["LOADBALANCE"] = "loadbalance";
    StrategyModes["FALLBACK"] = "fallback";
    StrategyModes["SINGLE"] = "single";
    StrategyModes["CONDITIONAL"] = "conditional";
})(StrategyModes || (StrategyModes = {}));
export var MESSAGE_ROLES;
(function (MESSAGE_ROLES) {
    MESSAGE_ROLES["SYSTEM"] = "system";
    MESSAGE_ROLES["USER"] = "user";
    MESSAGE_ROLES["ASSISTANT"] = "assistant";
    MESSAGE_ROLES["FUNCTION"] = "function";
    MESSAGE_ROLES["TOOL"] = "tool";
    MESSAGE_ROLES["DEVELOPER"] = "developer";
})(MESSAGE_ROLES || (MESSAGE_ROLES = {}));
export const SYSTEM_MESSAGE_ROLES = ['system', 'developer'];
