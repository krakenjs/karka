'use strict';


var util = require('./util'),
    _ = require('underscore'),
    resolver = require('shortstop').create(),
    path = require('path');


function module(entry) {
    return (util.tryRequire(entry) || undefined);
}

function file(entry) {
    var filePath = path.join(process.cwd(), entry);
    return module(filePath);
}

function moduleWithApi(entry) {
    var args = entry.split('::'),
        mod = module(args[0]);

    return mod[args[1]];

}
(function setUpShortStop() {
    resolver.use('module', module);
    resolver.use('file', file);
    resolver.use('module::api', moduleWithApi);
})();


// This is the template rule parser
// Given 3 pieces of information
// 1. The name of the template
// 2. The app config for specialization
// 3. The context for that request
// The rule parser will determine which template to pick to render 
// depending on how the app has been configed.
// The rule parser has a switch case mentality.
// the first rule implementation that returns truthy will win.
// So it is the onus of the app owner to config the rules they want to favor
// for same template in the right order.

function templateResolve(config) {
    return function (name, context) {
        var resolvedSpec, selectedName = name;
        if (config[name]) {
            config[name].every(function (spec) {
                resolvedSpec = resolver.resolve(spec);
                if (resolvedSpec.use) {
                    if (resolvedSpec.use(spec, context, ruleEvaluate)) {
                        selectedName = spec.template;
                        return false;
                    }
                } else {
                    if (fallbackOnLocalContext(spec, context)) {
                        selectedName = spec.template;
                        return false;
                    }
                }
                return true;
            });
        }
        return selectedName;
    };
}

//For a [config, context] generates a JSON mapping of all
// key: template that can be specialized in that context
// value: the template that the key is mapped to in the context

function templateMap(config) {
    var resolver = templateResolve(config);
    return function (context) {
        var map = {};
        Object.keys(config).forEach(function (key) {
            var resolvedTemplate = resolver(key, context);
            if (key !== resolvedTemplate) {
                map[key] = resolvedTemplate;
            }
        });
        return map;
    };
}


// function ruleEvaluate
// given spec, context, helps determine if the context satisfies the spec

// @input:
//	spec : the spec from the specialization rules array that needs to be matched against
//	context: the context value for that specific spec in the current req context
//
// @return
// false if the template spec did not match the template name + context 
// true
// The ruleEvaluate implements the following rules for all specs.
// ['a', ['b','c'], 'd'] Will evaluate if the context values match a || [b & c] || c


function ruleEvaluate(spec, context) {
    if (!Array.isArray(spec)) {
        if (spec === context) {
            return true;
        }
        return false;
    }

    if (typeof context === 'string') {
        return (!spec.every(function (entry) {
            if (typeof entry === 'string' && entry === context) {
                return false; //break from the loop
            }
            return true;
        }));

    } else if (Array.isArray(context)) {
        return (!spec.every(function (entry) {
            if (entry instanceof Array && _.difference(entry, context).length === 0) {
                return false;
            } else if (typeof entry === 'string') {
                return (context.every(function (c) {
                    if (c === entry) {
                        return false;
                    }
                    return true;
                }));
            }
            return true;
        }));
    }
}


function fallbackOnLocalContext(config, context) {
    return Object.keys(config.rules).every(function (key) {
        if (!context[key] || !ruleEvaluate(config.rules[key], context[key])) {
            return false;
        }
        return true;
    });
}

exports.create = function (config) {
    return {
        resolver: templateResolve(config),
        mapper: templateMap(config)
    };
};