var karka = require('../index'),
    testSet = require('./fixtures/testInputs'),
    assert = require('assert'),
    mocha = require('mocha');

describe('Karka', function () {

    it('should create a helper object on calling karka.create', function () {
        var karkaHelper  = karka.create(testSet['testRequire'].config, function() {});
        assert.equal(typeof karkaHelper, 'object');
        assert.equal(typeof karkaHelper.resolve, 'function');
        assert.equal(typeof karkaHelper.resolveAll, 'function');
    });
});
