module.exports = function ruleEvaluator(config, context, ruleEvalFnc) {
    return Object.keys(config.rules).every(function(key) {
        if (!context.res.locals[key] || !ruleEvalFnc(config.rules[key], context.res.locals[key])) {
            return false;
        }
        return true;
    });
};