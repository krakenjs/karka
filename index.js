'use strict';
var specializer = require('./lib/specializer');

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
