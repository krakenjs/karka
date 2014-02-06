'use strict';
var specializer = require('./lib/specializer'),
    dust = require('dustjs-linkedin');

exports.create = function (config) {
    var mapper = init(config);
    return Object.create({
        templateResolver: specializer.templateResolve(config),
        templateMapper: function setSpecializationContext (req, res, next) {
            var context = {
                req: req,
                res: res
            };
            res.locals({
                _specialization: mapper(context)
            });
            next();
        }
    });
};

exports.setSpecializationWrapperForEngine = function(config, engine) {
    var mapper = init(config);
    setUpDustOnLoadContext();
    return function(file, options, callback) {
        //generate the specialization map
        options._specialization =  mapper(options);

        engine.apply(null, arguments);
    }
}

function init(config) {
    specializer.setUpShortStop();
    return specializer.templateMap(config);
}

function setUpDustOnLoadContext() {
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