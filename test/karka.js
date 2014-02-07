var karka = require('../index'),
    testSet = require('./fixtures/testInputs'),
    assert = require('assert'),
    mocha = require('mocha');

describe('Karka', function () {

    it('should create a helper object on calling karka.create', function () {
        var karkaHelper  = karka.create(testSet[0].config, function() {});
        console.info(karkaHelper);
        assert.equal(typeof karkaHelper.specializer, 'object');
        assert.equal(typeof karkaHelper.specializer.resolver, 'function');
        assert.equal(typeof karkaHelper.specializer.mapper, 'function');
        assert.equal(typeof karkaHelper.renderer, 'function');
    });
});
