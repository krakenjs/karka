var karka = require('../index'),
    testSet = require('./fixtures/testInputs'),
    assert = require('assert'),
    mocha = require('mocha');

describe('Karka', function () {

    it('should create a helper object on calling karka.create', function () {
        var karkaHelper  = karka.create(testSet['testRequire'].config, function() {});
        assert.equal(typeof karkaHelper.specializer, 'object');
        assert.equal(typeof karkaHelper.specializer.resolve, 'function');
        assert.equal(typeof karkaHelper.specializer.resolveAll, 'function');
        assert.equal(typeof karkaHelper.renderer, 'function');
        assert.equal(typeof karkaHelper.renderer(function engine(){}), 'function');
    });
});
