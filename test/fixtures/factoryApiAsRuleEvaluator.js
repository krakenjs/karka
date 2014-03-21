'use strict';
module.exports = {
    ruleEvaluator: function () {
        return function ruleEvaluator(config, context) {
            return (config.rules.hakunamatata === context.hakunamatata);
        };
    },

    ruleEvaluatorFalsy: function() {
        return function ruleEvaluatorFalsy() {
            return false;
        }
    }
};