'use strict';


var util = require('./util'),
	_ = require('underscore');

// This is the template rule parser
// Given 3 pieces of information
// 1. The name of the template
// 2. The app config for specialization
// 3. The context for that request
// The rule parser will determine which template to pick to render 
// depending on how the app has been configed.


exports.create =  function (config) {
	return function(name, context) {
		var matchedSpec, module;
		if(config[name]) {
			config[name].every(function(spec) {
				module = (spec.module) ? util.tryRequire(spec.module) : undefined;
				if (module) {
					if (spec.api) {
						if (module[spec.api](spec, context, exports.ruleEvaluate)) {
							name = spec.template;
							return false;
						}
					} else {
						if (module(spec, context, exports.ruleEvaluate)) {
							name = spec.template;
							return false;
						}
					}
				} else {			
					if (fallbackOnLocalContext(spec, context)) {
						name = spec.template;
						return false;
					}
				}
				return true;
			});
		}
		return name;
	};
};

//function resolve 
// given name, spec, context, helps determine if the spec could be a possible template resolution rule
// for the given template and also meta data about how many rules qualify
//@input: 
//	name : name of template that needs to be verified for specialization
//	spec : the spec from the specialization array that needs to be matched against
//	context: the context in which that specific request is being made, that needs to be checked against the spec
//
//@return
// false if the template spec did not match the template name + context 
// object if the template spec matched some criterions with name+ context
// {
//		mappedDust: <templateName>,
//		numDim: 1 || 2 || 3, //number of dimensions that matched for the <spec,context>
//		dim: {}, //the name of the dimensions that matched for the <spec, context>
//		numExp: <> //number of experiences (if more than one) that matched for <spec ,context>
//	}
// this meta data is then used to figure out which spec fits the best

exports.ruleEvaluate = function (spec, context) {

	if (!Array.isArray(spec)) {
		//we donot know how to handle this, as it is not per spec
		return false;
	}

	if (typeof context === 'string') {
		return (!spec.every(function(entry) {
			if (typeof entry === 'string' && entry == context) {
				return false; //break from the loop
			}
			return true;
		}));

	} else if (Array.isArray(context)) {
		return (!spec.every(function(entry) {
			if (entry instanceof Array && _.difference(entry,context).length === 0) {
				return false;
			}
			return true;
		}));
	}
};

function fallbackOnLocalContext(config, context) {
	return Object.keys(config.rules).every(function(key) {
		if (!(context.stack.head[key] || exports.ruleEvaluate(config.rules.key, context.stack.head[key]))) {
			return false;
		}
		return true;
	});
}