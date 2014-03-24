A Simple Rule Parsing module [![Build Status](https://travis-ci.org/paypal/kraken-js.png)](https://travis-ci.org/pvenkatakrishnan/karka)
============================

Given a rule in a specified format, the context (in which the rule matching is invoked), this module will resolve a key to a value if the context satisifes the rules.

A simple usage:

```javascript
var karka = require('karka'),
    config = {
        'foo' : [
            {
                'is': 'bar',
                'when': {
                    'hakunamatata': 'It-Means-No-Worries'
                }
            }
        ],
        'ying': [
            {
                'is': 'yang',
                'when': {
                    'secret': 'There-Is-None'
                }
            }

        ]
    },
    context = {
        'hakunamatata': 'It-Means-No-Worries',
        'secret': 'There-Is-None'
    },
    spcl  = karka.create(config),

    //mappedName = 'bar'
    mappedName = spcl.resolve('foo', context),

    //maps = {'foo': 'bar', 'ying': 'yang'}
    maps = spcl.resolveAll(context);
```

As you can see a single key like 'foo' can be mapped to an array of possible matches, each with their own rule set.
The first spec that has all rules satisfied the context will be picked. Simply put it matches with a swtich case mentality. SO it is important to remember to place the one with highest specifity on the top of the array.

##### Different ways to specify the config resolution:
The above example assumes that the rule values are directly available in the context object.
But fear not there are multiple ways the rules can be resolved.

* If you would like to specify a module/file that custom implements the rule resolution (that can be resolved using require):
```javascript
var config = {
    'foo' : [
        {
            'is': 'bar',
            'when': {
                'hakunamatata': 'It-Means-No-Worries'
            },
            'use': 'require:./I/am/a/file'
        }
    ]
};

//(or)

var config = {
    'foo' : [
        {
            'is': 'bar',
            'when': {
                'hakunamatata': 'It-Means-No-Worries'
            },
            'use': 'require:I-am-a-module'
        }
    ]
};

```
* If you would like to specify a factory method in a module/file that does the rule resolution:
```javascript
var config = {
    'foo' : [
        {
            'is': 'bar',
            'when': {
                'hakunamatata': 'It-Means-No-Worries'
            },
            'use':'exec:./I/am/a/file#ruleEvaluator'
        }
    ]
};
```
##### Different ways to specify the context in config:
* To specify the context in a nested object under the context object:
```javascript
var config = {
        'ying' : [
            {
                'is': 'yang',
                'when': {
                    'state.of.mind.is': 'peaceful'
                }
            }
        ]
    },
    context  = {
        'state': {
            'of': {
                'mind': {
                    'is': 'peaceful'
                }
            }
        }
    }
```
* To specify multiple rules to be satisfied
```javascript
var config = {
        'ying' : [
            {
                'is': 'yang',
                'when': {
                    'state.of.mind.is': 'peaceful',
                    'state.of.body.is': 'active',
                    'mood.is': 'happy'
                }
            }
        ]
    };
```
* To specify multiple values for a rule in the config and want at least one value matched in your context
```javascript
var config = {
        'ying' : [
            {
                'is': 'yang',
                'when': {
                    'state.of.mind': 'peaceful',
                    'state.of.body': 'active'
                    'mood': ['happy', 'elated', 'ecstatic', 'jubilant']
                }
            }
        ]
    },
    context  = {
        'state': {
            'of': {
                'mind': 'peaceful'
            }
        },
        'state': {
            'of': {
                'body': 'active'
            }
        },
        'mood': 'jubilant'
    };

    //if mood in context matches at least one of the moods in config along with other rules, the rule is a match
    //ying maps to yang when:
        //state.of.mind = 'peaceful'
        //AND
        //state.of.body = 'active'
        //AND
        //mood = 'happy' OR 'elated' OR 'ecstatic' OR 'jubilant'
```


* To have multiple values for a rule in the config and you want to specify a complex and/or rule to match against your context
```javascript
var config = {
        'ying' : [
            {
                'is': 'yang',
                'when': {
                    'state.of.mind': 'peaceful',
                    'state.of.body': 'active',
                    'mood': [['happy', 'calm'], 'joyous']
                }
            },
            {
                'is': 'bong',
                'when' : {
                    'state.of.mind': 'peaceful',
                    'state.of.body': 'active'
                    'mood': [['jubilant', 'outrageous'],['ecstatic', 'crazy']]
                }
            }
        ]
    },
    context  = {
        'state': {
            'of': {
                'mind': 'peaceful'
            }
        },
        'state': {
            'of': {
                'body': 'active'
            }
        },
        'mood': ['jubilant', 'outrageous']
    };

    //In the above case context matches the rule that maps 'ying' to 'bong'
    //What the above config means is:
    //'ying' will resolve to 'yang' when
            //state.of.mind = peaceful
            //AND
            //state.of.body = 'active'
            //AND
            //mood = ('happy' AND 'calm') OR 'joyous
    //'ying will resolve to 'bong' when
            //state.of.mind = peaceful
            //AND
            //state.of.body = 'active'
            //AND
            //mood = ('jubilant' AND 'outrageous') OR ('ecstatic' AND 'crazy')
```
