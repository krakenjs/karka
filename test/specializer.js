var specializer = require('../lib/specializer'),
    assert = require('assert'),
    testSet = require('./fixtures/testInputs.json'),
    mocha = require('mocha');


describe('Specializer', function () {

    describe('Resolve Tests', function () {
        var spcl, config, context;

        it('should test invoking module to rule Evaluate', function () {
            spcl  = specializer.create(testSet[0].config);
            assert.equal('foo/partial1', spcl.resolver('partialSamples/partial1', testSet[0].context));
        });
        it('should test invoking a file to rule Evaluate', function () {
            spcl = specializer.create(testSet[1].config);
            assert.equal('foo/partial1', spcl.resolver('partialSamples/partial1', testSet[1].context));
        });

        it('should test invoking a factory API to rule Evaluate', function () {
            spcl = specializer.create(testSet[2].config);
            assert.equal('foo/partial1', spcl.resolver('partialSamples/partial1', testSet[2].context));
        });

        it('should test in res.locals to rule Evaluate', function() {
            config = testSet[3].config;
            context = testSet[3].context;
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test simple no matched specialized template case', function () {
            context.experiments = ['blah'];
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolver('partialSamples/partial1', context));

        });

        it('should test for simple matched template case', function () {
            context.experiments = ['foo'];
            assert.equal('bar/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test with complex no matched case', function () {
            config['partialSamples/partial1'][1].rules.experiments = ['foo', ['bar', 'blah']],
            context.experiments = ['blue', 'yellow'];
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test for complex matched case to resolve templates', function () {
            config['partialSamples/partial1'][1].rules.experiments = ['foo', ['bar', 'blah']];
            context.experiments = ['blah', 'bar'];
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test for a simple match even when a complex entry is specified in config', function () {
            context.experiments = ['foo', 'blah'];
            assert.equal('bar/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and matches', function () {
            config['partialSamples/partial1'][1].rules.isMonthOfAugust = true;
            context.isMonthOfAugust = true;
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolver('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and failed to match', function () {
            config['partialSamples/partial1'][1].rules.krakenIs = 'angryOctopus';
            context.krakenIs = 'happyOctopus';
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolver('partialSamples/partial1', context));
        });

    });

    describe('Map Tests', function () {
        var map,
            config = testSet[4].config,
            spcl;

        it('should test returning empty map when none of the templates match', function () {
            context = {
                locale: 'en_AU',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };

            spcl = specializer.create(config);
            assert.deepEqual({}, spcl.mapper(context));
        });
        it('should test returning a valid map when some of the templates match', function () {

            context = {
                locale: 'en_US',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };
            spcl = specializer.create(config);
            assert.deepEqual({'partialSamples/partial1':'bar/partial1','partialSamples/partial2':'bal/partial2','partialSamples/partial3':'bar/partial3'}, spcl.mapper(context));
        });
    });
});