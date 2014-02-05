'use strict';
var specializer = require('./lib/specializer'),
    dust = require('dustjs-linkedin');

exports.create = function (config) {
    var mapper = specializer.templateMap(config);
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
    var mapper = specializer.templateMap(config);
    setUpDustOnLoadContext();
    return function(file, options, callback) {
        //generate the specialization map
        options._specialization =  mapper(options);

        engine.apply(null, arguments);
    }
}


function setUpDustOnLoadContext() {
    var originalOnLoad = dust.onLoad,
        specialization,
        mappedName;
    dust.onLoad = function onLoad (name, context, cb) {
        specialization = (typeof context.get === 'function' && context.get('_specialization')) || context._specialization;
        mappedName = (specialization && specialization[name] || name);
        originalOnLoad(mappedName, context, cb);
    }
}