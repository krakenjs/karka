var specializer = require('../lib/specializer'),
    assert = require('assert'),
    mocha = require('mocha');

describe('karka', function () {

    describe('Rule Evaluator', function () {

        it('should test for simple no match case', function () {
            var config = ['foo', 'bar'],
                context = 'blah';

            assert.equal(false, specializer.ruleEvaluate(config, context));
        });

        it('should test for simple matched case', function () {
            var config = ['foo', 'bar'],
                context = 'bar';

            assert.equal(true, specializer.ruleEvaluate(config, context));
        });

        it('should test for match case', function () {
            var config = ['foo'],
                context = ['foo'];

            assert.equal(true, specializer.ruleEvaluate(config, context));
        });

        it('should test for has complex but match simple entry case', function () {
            var config = ['foo', ['bar', 'blah']],
                context = ['foo', 'blah'];

            assert.equal(true, specializer.ruleEvaluate(config, context));
        });

        it('should test for complex matched case', function () {
            var config = ['foo', ['bar', 'blah']],
                context = ['blah', 'bar'];

            assert.equal(true, specializer.ruleEvaluate(config, context));
        });

        it('should test with simple no match case', function () {
            var config = ['foo', 'bar', 'blah'],
                context = ['blue', 'yellow'];

            assert.equal(false, specializer.ruleEvaluate(config, context));
        });

        it('should test with complex no matched case', function () {
            var config = ['foo', ['bar', 'blah']],
                context = ['blue', 'yellow'];

            assert.equal(false, specializer.ruleEvaluate(config, context));
        });

        it('should test negative cases where config is a string (not per spec)', function () {
            var config = 'foo',
                context = 'blah';

            assert.equal(false, specializer.ruleEvaluate(config, context));
        });

    });
    describe('Resolve', function () {
        var config,
            context = {
                locale: 'es_US',
                device: 'tablet',
                experiments: ['foo']
            },
            resolve;

        it('should test invoking module to rule Evaluate', function () {

            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'foo/partial1',
                        module: '../test/fixtures/moduleAsRuleEvaluator',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    }
                ]
            };
            resolve = specializer.templateResolve(config);
            assert.equal('foo/partial1', resolve('partialSamples/partial1', context));
        });
        it('should test invoking factory method on module to rule Evaluate', function () {

            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'bar/partial1',
                        module: '../test/fixtures/factoryApiAsRuleEvaluator',
                        api: 'ruleEvaluator',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    }
                ]
            };
            resolve = specializer.templateResolve(config);
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });
        it('should test in res.locals to rule Evaluate', function() {
            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'bal/partial1',
                        rules: {
                            locale: ['de_DE'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    },
                    {
                        template: 'bar/partial1',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    }
                ]
            },
            resolve = specializer.templateResolve(config);
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });
    });

    describe('Map', function () {
        var map,
            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'bal/partial1',
                        rules: {
                            locale: ['de_DE'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    },
                    {
                        template: 'bar/partial1',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    }
                ],
                'partialSamples/partial2' : [
                    {
                        template: 'bal/partial2',
                        rules: {
                            locale: ['de_DE', 'es_US', 'en_US'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    },
                    {
                        template: 'bar/partial2',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            experiments: [['bar', 'bal']],
                            device: ['tablet', 'mobile']
                        }
                    }
                ],
                'partialSamples/partial3': [
                    {
                        template: 'bal/partial3',
                        rules: {
                            locale: ['de_DE'],
                            experiments: ['foo'],
                            device: ['tablet']
                        }
                    },
                    {
                        template: 'bar/partial3',
                        rules: {
                            locale: ['en_US', 'es_US'],
                            device: ['tablet']
                        }
                    }
                ]
            },
            mapper;

        it('should test returning empty map when none of the templates match', function () {
            context = {
                locale: 'en_AU',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };

            mapper = specializer.templateMap(config);
            assert.deepEqual({}, mapper(context));
        });
        it('should test returning a valid map when some of the templates match', function () {

            context = {
                locale: 'en_US',
                device: 'tablet',
                experiments: ['foo', 'bar']
            };
            mapper = specializer.templateMap(config);
            assert.deepEqual({"partialSamples/partial1":"bar/partial1","partialSamples/partial2":"bal/partial2","partialSamples/partial3":"bar/partial3"}, mapper(context));
        });
    });
});