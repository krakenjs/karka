'use strict';
module.exports = function ruleEvaluator(config, context) {
    return (config.when.hakunamatata === context.hakunamatata);
};