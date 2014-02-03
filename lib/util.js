"use strict";
exports.tryRequire = function tryRequire(moduleName, fallback) {
    var result;
    try {
        result = moduleName && require(moduleName);
    } catch (err) {
        // noop
    }
    return result || fallback;
};