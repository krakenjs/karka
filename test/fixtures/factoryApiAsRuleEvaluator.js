'use strict';
module.exports = {
    ruleEvaluator: function () {
        return function ruleEvaluator(config, context) {
            return (config.when.hakunamatata === context.hakunamatata);
        };
    },

    ruleEvaluatorFalsy: function () {
        return function ruleEvaluatorFalsy() {
            return false;
        };
    }
};