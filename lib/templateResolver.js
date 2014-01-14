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

		console.info('called into resolveTemplate: name ', name, ' config', config, ' context', context);
		var selectedOne,
			context = {
				experiments: context.stack.head.experiments,
				locale: context.stack.head.locale,
				device: context.stack.head.device
			},
			specializedTemplate;
		config.forEach(function(spec) {
			var result = exports.resolve(name, spec, context);
			//now we need to evaluate if this spec is
			// a better match than the previously selected One
			if (!result) return;
			if (!selectedOne) {
				selectedOne = result;
				return;
			}
			selectedOne = exports.pickBest(selectedOne, result);
		});

		specializedTemplate = (selectedOne && selectedOne.mappedDust || name);
		return specializedTemplate;
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

exports.resolve = function (name, spec, context) {

	var meta = {}, matchedExperiments = 0;
	
	//the name needs to match first
	if (name !== spec.dust) {
		return false;
	}
	meta.mappedDust = spec.mappedDust;
	meta.numDim = 0;
	meta.dim = [];


	//check if any of the locales match
	function localeMatch (element, index, array) {
		return (context.locality == element);
	}

	function deviceMatch (element, index, array) {
		return (context.device == element);
	}

	if (spec.locales && spec.locales.length > 0) {
		if(spec.locales.filter(localeMatch).length > 0) {
			++meta.numDim;
			meta.dim.push('locales');
		}
	}

	//check if any of the device types match
	if (spec.devices && spec.devices.length > 0) {
		if (spec.devices.filter(deviceMatch).length > 0) {
			++meta.numDim;
			meta.dim.push('devices');
		}
	}

	// check if any and how many of the experiments match
	if(spec.experiments && spec.experiments.length > 0) {

		matchedExperiments = _.intersection(spec.experiments, context.experiments);
		meta.numExp = matchedExperiments.length;
		meta.dim.push('experiments');
		meta.numDim += (meta.numExp > 0) ? 1:0;
	}

	return meta;
};

//function pickBest
//given two rules, it evaluates which one is the best match for resolution
//based on a set of rules 
//@input 
//	spec1Meta: meta data about how well this spec specializes the template
//  spec2Meta: same as above
//@return
//	the best matched specMeta
exports.pickBest = function (specMeta1, specMeta2) {
	var selectedOne;
	//Rule 1: the spec with more matched dimensions win
	if (specMeta1.numDim > specMeta2.numDim) {
		selectedOne = specMeta1;
	} else if (specMeta2.numDim > specMeta1.numDim) {
		selectedOne = specMeta2;
	} else {
		//Rule 2: if they both have same number of dimensions
		// that match then we have priority rules

		//pick the one with more experiments matching
		//if same number of experiments match, random select

		//@TODO MAYBE ADD MORE RULES AROUND WHICH ONE TO PICK

		selectedOne = (specMeta1.numExp && specMeta2.numExp &&
			specMeta1.numExp > specMeta2.numExp) ? specMeta1: specMeta2;
	}
	return selectedOne;
};


