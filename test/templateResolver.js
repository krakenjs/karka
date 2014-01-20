var templateResolver = require('../lib/templateResolver'),
	assert = require('assert'),
	mocha = require('mocha');

describe('karka', function () {

    describe('Rule Evaluator', function () {

        it('should test for simple no match case', function () {
            var config = ['foo', 'bar'],
				context = 'blah';
				
            assert.equal(false, templateResolver.ruleEvaluate(config, context));
        });

		it('should test for simple matched case', function () {
            var config = ['foo', 'bar'],
				context = 'bar';
				
            assert.equal(true, templateResolver.ruleEvaluate(config, context));
        });

        it('should test for match case', function () {
            var config = ['foo'],
				context = ['foo'];
				
            assert.equal(true, templateResolver.ruleEvaluate(config, context));
        });

        it('should test for has complex but match simple entry case', function () {
            var config = ['foo', ['bar', 'blah']],
                context = ['foo', 'blah'];
                
            assert.equal(true, templateResolver.ruleEvaluate(config, context));
        });

        it('should test for complex matched case', function () {
            var config = ['foo', ['bar', 'blah']],
				context = ['blah', 'bar'];
				
            assert.equal(true, templateResolver.ruleEvaluate(config, context));
        });

        it('should test with simple no match case', function () {
            var config = ['foo', 'bar', 'blah'],
                context = ['blue', 'yellow'];
                
            assert.equal(false, templateResolver.ruleEvaluate(config, context));
        });

        it('should test with complex no matched case', function () {
            var config = ['foo', ['bar', 'blah']],
                context = ['blue', 'yellow'];
                
            assert.equal(false, templateResolver.ruleEvaluate(config, context));
        });

        it('should test negative cases where config is a string (not per spec)', function () {
            var config = 'foo',
				context = 'blah';
				
            assert.equal(false, templateResolver.ruleEvaluate(config, context));
        });
    
	});
	describe('Resolve', function () {
        var config , context, resolve;

        it('should test invoking module to rule Evaluate', function () {
            context = {}; //we dont test context in this test
            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'foo/partial1',
                        module: '../test/fixtures/moduleAsRuleEvaluator',
                        rules: {}//we dont test context in this test
                    }
                ]
            };
            resolve = templateResolver.create(config);
            assert.equal('foo/partial1', resolve('partialSamples/partial1', context));
        });
        it('should test invoking factory method on module to rule Evaluate', function () {
            context = {}; //we dont test context in this test
            config = {
                'partialSamples/partial1' : [
                    {
                        template: 'bar/partial1',
                        module: '../test/fixtures/factoryApiAsRuleEvaluator',
                        api: 'ruleEvaluator',
                        rules: {}//we dont test context in this test
                    }
                ]
            };
            resolve = templateResolver.create(config);
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
            };
            context = {
                stack: {
                    head: {
                        locale: 'es_US',
                        device: 'tablet',
                        experiments: ['foo']
                    }
                }
            };
            resolve = templateResolver.create(config);
            assert.equal('bar/partial1', resolve('partialSamples/partial1', context));
        });
	});
});