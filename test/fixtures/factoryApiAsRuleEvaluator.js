'use strict';
module.exports = {
    ruleEvaluator: function ruleEvaluator(config, context, ruleEvalFnc) {
        return Object.keys(config.rules).every(function (key) {
            if (!context[key] ||
                !ruleEvalFnc(config.rules[key], context[key])) {
                return false;
            }
            return true;
        });
    }
};