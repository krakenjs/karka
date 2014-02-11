'use strict';
module.exports = function ruleEvaluator(config, context) {
    return (config.rules.hakunamatata === context.hakunamatata);
};