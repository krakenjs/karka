'use strict';
exports.resolveTemplate =  function (name, rules, context) {
	console.info('called into resolveTemplate: name ', name, ' rules', rules, ' context', context);
	/*if (name === 'test') {
		return 'exp1_exp2_test';
	} else if (name === 'index') {
		return 'blah_index';
	}*/
	return name;
};