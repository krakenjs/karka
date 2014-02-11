'use strict';
var spclizer = require('./lib/specializer'),
    dust = require('dustjs-linkedin');

exports.create = function (config) {
    var specializer = spclizer.create(config);
    return {
        specializer: specializer,
        renderer:  getSpclWrapper(config, specializer.resolveAll)
    };
};

function getSpclWrapper (config, mapper) {
    return function (engine) {
        setupDustOnLoad();
        return function(file, options, callback) {
            //generate the specialization map
            options._specialization =  mapper(options);
            engine.apply(null, arguments);
        };
    }
}

function setupDustOnLoad() {
    var originalOnLoad = dust.onLoad,
        specialization,
        mappedName;
    dust.onLoad = function onLoad (name, context, cb) {
        specialization = (typeof context.get === 'function' && context.get('_specialization')) || context._specialization;
        mappedName = (specialization && specialization[name] || name);
        originalOnLoad(mappedName, context, function(err, data) {
            if (!err && mappedName !== name && typeof data === 'string') {
                //this is a workaround, since adaro is not aware of the mapped name up the chain
                //we find the dust.register line and replace the mappedName of template with original name
                data = data.replace(mappedName, name);
            }
            cb(err, data);
        });
    }
}