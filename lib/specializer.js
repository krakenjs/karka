/*───────────────────────────────────────────────────────────────────────────*\
 │  Copyright (C) 2014 eBay Software Foundation                                │
 │                                                                             │
 │hh ,'""`.                                                                    │
 │  / _  _ \  Licensed under the Apache License, Version 2.0 (the "License");  │
 │  |(@)(@)|  you may not use this file except in compliance with the License. │
 │  )  __  (  You may obtain a copy of the License at                          │
 │ /,'))((`.\                                                                  │
 │(( ((  )) ))    http://www.apache.org/licenses/LICENSE-2.0                   │
 │ `\ `)(' /'                                                                  │
 │                                                                             │
 │   Unless required by applicable law or agreed to in writing, software       │
 │   distributed under the License is distributed on an "AS IS" BASIS,         │
 │   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  │
 │   See the License for the specific language governing permissions and       │
 │   limitations under the License.                                            │
 \*───────────────────────────────────────────────────────────────────────────*/

'use strict';


var resolver = require('shortstop').create(),
    handlers = require('shortstop-handlers');

var validate = require('aproba');

(function setUpShortStop() {
    resolver.use('require', handlers.require());
    resolver.use('exec',   handlers.exec());
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
    validate('O', arguments);
    return function (name, context) {
        var resolvedSpec, selectedName = name;
        if (config[name]) {
            config[name].every(function (spec) {

                resolvedSpec = resolver.resolve(spec);
                if (resolvedSpec.use) {
                    if (resolvedSpec.use(spec, context)) {
                        selectedName = spec.is;
                        return false;
                    }
                } else {
                    if (fallbackOnLocalContext(spec, context)) {
                        selectedName = spec.is;
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
    validate('O', arguments);
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

    if (Array.isArray(context)) {
        return (!spec.every(function (entry) {
            if (entry instanceof Array && difference(entry, context).length === 0) {
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
    } else {
        return (!spec.every(function (entry) {
            if (entry === context) {
                return false; //break from the loop
            }
            return true;
        }));
    }
}


function fallbackOnLocalContext(config, context) {

    return Object.keys(config.when).every(function (key) {
        var props = key.split('.'),
            val = context;

        props.every(function (entry) {
            val = val[entry] ? val[entry] : undefined;
            return ((val) ? true : false);
        });

        if (!val || !ruleEvaluate(config.when[key], val)) {
            return false;
        }
        return true;
    });
}

function difference(arr1, arr2) {
    return arr1.filter(function (entry) {
        return (arr2.indexOf(entry) === -1);
    });
}

exports.create = function (config) {
    return {
        resolve: templateResolve(config),
        resolveAll: templateMap(config)
    };
};