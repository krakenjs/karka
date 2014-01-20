module.exports = function ruleEvaluator(config, context, ruleEvalFnc) {
	return Object.keys(config.rules).every(function(key) {
		if (!context.stack.head[key] || !ruleEvalFnc(config.rules[key], context.stack.head[key])) {
			return false;
		}
		return true;
	});
};