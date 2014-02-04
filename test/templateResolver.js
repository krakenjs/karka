var specializer = require('../lib/specializer'),
    assert = require('assert'),
    mocha = require('mocha');

describe('karka', function () {

    describe('Resolve Tests', function () {
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

        it('should test simple no matched specialized template case', function () {
            context.experiments = ['blah'];
            resolve = specializer.templateResolve(config);
            assert.equal('partialSamples/partial1', resolve('partialSamples/partial1', context));

        });

        it('should test for simple matched template case', function () {
            context.experiments = ['foo'];
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });

        it('should test with complex no matched case', function () {
            config['partialSamples/partial1'][1].rules.experiments = ['foo', ['bar', 'blah']],
                context.experiments = ['blue', 'yellow'];
            resolve = specializer.templateResolve(config);
            assert.equal('partialSamples/partial1', resolve('partialSamples/partial1', context));
        });

        it('should test for complex matched case to resolve templates', function () {
            config['partialSamples/partial1'][1].rules.experiments = ['foo', ['bar', 'blah']];
            context.experiments = ['blah', 'bar'];
            resolve = specializer.templateResolve(config);
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });

        it('should test for a simple match even when a complex entry is specified in config', function () {
            context.experiments = ['foo', 'blah'];
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and matches', function () {
            config['partialSamples/partial1'][1].rules.isMonthOfAugust = true;
            context.isMonthOfAugust = true;
            resolve = specializer.templateResolve(config);
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });

        it('should test cases where config is a non array and failed to match', function () {
            config['partialSamples/partial1'][1].rules.krakenIs = 'angryOctopus';
            context.krakenIs = 'happyOctopus';
            resolve = specializer.templateResolve(config);
            assert.equal('partialSamples/partial1', resolve('partialSamples/partial1', context));
        });

    });

    describe('Map Tests', function () {
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