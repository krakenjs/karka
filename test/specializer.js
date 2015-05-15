var specializer = require('../lib/specializer'),
    assert = require('assert'),
    testSet = require('./fixtures/testInputs.json'),
    mocha = require('mocha');


describe('Specializer', function () {

    describe('resolve Tests', function () {
        var spcl, config, context;

        it('should test invoking module to rule Evaluate', function () {
            spcl  = specializer.create(testSet['testRequire'].config);
            assert.equal('foo/partial1', spcl.resolve('partialSamples/partial1', testSet['testRequire'].context));
        });

        it('should test invoking a factory API to rule Evaluate', function () {
            spcl = specializer.create(testSet['testExec'].config);
            assert.equal('foo/partial1', spcl.resolve('partialSamples/partial1', testSet['testExec'].context));
        });

        it('should test in res.locals to rule Evaluate', function() {
            config = testSet['testLocal'].config;
            context = testSet['testLocal'].context;
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test simple no matched specialized template case', function () {
            context.experiments = ['blah'];
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolve('partialSamples/partial1', context));

        });

        it('should test for simple matched template case', function () {
            context.experiments = ['foo'];
            assert.equal('bar/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test with complex no matched case', function () {
            config['partialSamples/partial1'][1].when.experiments = ['foo', ['bar', 'blah']],
            context.experiments = ['blue', 'yellow'];
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test for complex matched case to resolve templates', function () {
            config['partialSamples/partial1'][1].when.experiments = ['foo', ['bar', 'blah']];
            context.experiments = ['blah', 'bar'];
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test for a simple match even when a complex entry is specified in config', function () {
            context.experiments = ['foo', 'blah'];
            assert.equal('bar/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and matches', function () {
            config['partialSamples/partial1'][1].when.isMonthOfAugust = true;
            context.isMonthOfAugust = true;
            spcl = specializer.create(config);
            assert.equal('bar/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and failed to match', function () {
            config['partialSamples/partial1'][1].when.krakenIs = 'angryOctopus';
            context.krakenIs = 'happyOctopus';
            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a spec like kraken.Is.Angry.beware', function () {
            config = testSet['testComplexLocal'].config;
            context = testSet['testComplexLocal'].context;

            spcl = specializer.create(config);
            assert.equal('bal/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a spec like kraken.Is.Angry.beware and rules dont match', function () {
            config = testSet['testComplexLocal'].config;
            context = testSet['testComplexLocal'].context.kraken.is = 'happy';

            spcl = specializer.create(config);
            assert.equal('partialSamples/partial1', spcl.resolve('partialSamples/partial1', context));
        });

        it('should test when the template is not in the specialization config', function () {
            config = testSet['testComplexLocal'].config;
            context = testSet['testComplexLocal'].context.kraken.is = 'happy';

            spcl = specializer.create(config);
            assert.equal('foo', spcl.resolve('foo', context));
        });

        it('should test invoking a factory API to rule Evaluate and return falsy', function () {
            spcl = specializer.create(testSet['testExecFalsy'].config);
            assert.equal('partialSamples/partial1', spcl.resolve('partialSamples/partial1', testSet['testExecFalsy'].context));
        });

    });

    describe('resolveAll Tests', function () {
        var map,
            config = testSet['testResolveAll'].config,
            spcl;

        it('should test returning empty map when none of the templates match', function () {
            context = {
                locale: 'en_AU',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };

            spcl = specializer.create(config);
            assert.deepEqual({}, spcl.resolveAll(context));
        });
        it('should test returning a valid map when some of the templates match', function () {

            context = {
                locale: 'en_US',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };
            spcl = specializer.create(config);
            assert.deepEqual({'partialSamples/partial1':'bar/partial1','partialSamples/partial2':'bal/partial2','partialSamples/partial3':'bar/partial3'}, spcl.resolveAll(context));
        });
    });

    describe('argument validation', function () {
        it('throws when passed no arguments', function () {
            try {
                specializer.create();
                assert.fail();
            } catch (e) {
                assert.equal(e.code, 'EMISSINGARG');
            }
        });
        it('throws when passed bad arguments', function () {
            try {
                specializer.create([]);
                assert.fail();
            } catch (e) {
                assert.equal(e.code, 'EINVALIDTYPE');
            }
        });
    });

});
