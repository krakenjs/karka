var templateResolver = require('../lib/templateResolver'),
	assert = require('assert'),
	mocha = require('mocha');

describe('karka', function () {

    describe('resolve', function () {

        it('should test for simple dust no match case', function () {
            var config = {
					'dust': 'mapMe',
					'mappedDust': 'iAmMapped',
					'experiments': ['foo', 'bar']
				},
				context = {
					experiments: ['foo']
				},
				name = 'notMe',
				result;
            assert.equal(false, templateResolver.resolve(name, config, context));
        });

        it('should test for dust with matching locale and device in context', function () {
            var config = {
					'dust': 'mapMe',
					'mappedDust': 'iAmMapped',
					//'experiments': ['foo', 'bar'],
					'locales': ['US_es', 'DE_de'],
					'devices': ['mobile', 'tablet', 'web']
				},
				context = {
					locale: ['DE_de'],
					device: 'mobile'
				},
				name = 'mapMe',
				result;
			result = templateResolver.resolve(name, config, context);
            assert.equal('object', typeof(result));
            assert.equal(result.mappedDust, config.mappedDust);
            assert.equal(result.numDim, 2);
        });

        it('should test for dust with matching experiments, locale and device in context', function () {
            var config = {
					'dust': 'mapMe',
					'mappedDust': 'iAmMappedWithAll',
					'experiments': ['foo', 'bar', 'baz', 'blah'],
					'locales': ['US_es', 'DE_de'],
					'devices': ['mobile', 'tablet', 'web']
				},
				context = {
					locale: ['DE_de'],
					device: 'mobile',
					experiments: ['foo', 'baz']
				},
				name = 'mapMe',
				result;
			result = templateResolver.resolve(name, config, context);
			console.info('result:', result);
            assert.equal('object', typeof(result));
            assert.equal(result.mappedDust, config.mappedDust);
            assert.equal(result.numDim, 3);
        });
    });

	
    describe('pickBest', function () {
		it('should test when spec 1 has more dim matches', function () {
            var meta1 = {
					mappedDust: 'iAmMapped1',
					numDim: 3,
					dim: [ 'locales', 'devices', 'experiments' ],
					numExp: 3
				},
				meta2 = {
					mappedDust: 'iAmMapped2',
					numDim: 2,
					dim: [ 'locales', 'devices'],
					numExp: 2
				};
            assert.equal(meta1, templateResolver.pickBest(meta1, meta2));
        });

        it('should test when spec 2 has more dim matches', function () {
            var meta1 = {
					mappedDust: 'iAmMapped1',
					numDim: 1,
					dim: [ 'experiments'],
					numExp: 1
				},
				meta2 = {
					mappedDust: 'iAmMapped2',
					numDim: 2,
					dim: [ 'locales', 'experiments'],
					numExp: 2
				};
            assert.equal(meta2, templateResolver.pickBest(meta1, meta2));
        });

        it('should test when both specs have same number of exp matches', function () {
            var meta1 = {
					mappedDust: 'iAmMapped1',
					numDim: 2,
					dim: [ 'experiments', 'locales'],
					numExp: 2
				},
				meta2 = {
					mappedDust: 'iAmMapped2',
					numDim: 2,
					dim: [ 'experiments', 'devices'],
					numExp: 2
				};
            assert.equal(meta1, templateResolver.pickBest(meta1, meta2));
        });
    });

    describe('resolveTemplate', function() {

    });
});