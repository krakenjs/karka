'use strict';
var specializer = require('./lib/specializer');


function isExpress(obj) {
    return typeof obj === 'function' && obj.handle && obj.set;
}

exports.create = function (app, config) {

	if (!isExpress(app)) {
        config = app;
        app = undefined;
    }

	return Object.create({
        templateResolver: specializer.templateResolve(config),
        templateMapper: specializer.templateMap(config)
    });
};


