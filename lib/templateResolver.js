'use strict';


var util = require('./util');

// This is the template rule parser
// Given 3 pieces of information
// 1. The name of the template
// 2. The app config for specialization
// 3. The context for that request
// This rule parser will determine which template to pick to render 
// depending on how the app has been configed.


exports.resolveTemplate =  function (name, config, context) {
	console.info('called into resolveTemplate: name ', name, ' config', config, ' context', context);
	var configExperiments = config.experimentation,
		experimentations = context.stack.head.experiments,
		locals = context.get('context'),
		//locality would be like 'en-US','en_US','en'
		locality = locals && locals.locality,
		configLocale = config.locales,
		root,
		pair;
	
	//CASE 1:
	//checking experimentation specialization

	if (experimentations && configExperiments) {

		//TODO does not solve for multiple experiments having
		// the same template specialized
		// WHAT DO WE DO IF THIS HAPPENS ?

		Object.keys(experimentations).forEach(function(exp) {
			var dust = configExperiments[exp].dust;
			if (dust && dust[name]) {
				console.info('found dust in the exp list');
				root = (configExperiments[exp].root) + '/' || '' ;
				name = root + dust[name];
			}
		});
	}

	//CASE 2:
	//checking locale specialization

    console.info('********** locals:' + locality);
    if (locality && configLocale) {
		pair = util.parseLangTag(locality); //returns pair.country and pair.language
    }


	//TODO figure out checking hybrids
	console.info('name returned:', name);
	return name;
};