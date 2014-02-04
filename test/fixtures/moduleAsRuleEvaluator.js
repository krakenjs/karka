'use strict';
module.exports = function ruleEvaluator(config, context, ruleEvalFnc) {
    return Object.keys(config.rules).every(function (key) {
        if (!context[key] || !ruleEvalFnc(config.rules[key], context[key])) {
            return false;
        }
        return true;
    });
};