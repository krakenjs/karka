A Simple Rule Parsing module [![Build Status](https://travis-ci.org/paypal/kraken-js.png)](https://travis-ci.org/pvenkatakrishnan/karka)
============================

Given a rule in a specified format, the context (in which the rule matching is invoked), this module will resolve a key to a value if the context satisifes the rules.

A simple usage:

```javascript
var karka = require('karka'),
    config = {
        "foo" : [
            {
                "template": "bar",
                "rules": {
                    "hakunamatata": "It-Means-No-Worries"
                }
            }
        ],
        "ying": [
            {
                "template": "yang",
                "rules": {
                    "secret": "There-Is-None"
                }
            }

        ]
    },
    context = {
        "hakunamatata": "It-Means-No-Worries",
        "secret": "There-Is-None"
    },
    spcl  = karka.create(config),

    \\mappedName = 'bar'
    mappedName = spcl.resolve('foo', context),

    \\maps = {'foo': 'bar', 'ying': 'yang'}
    maps = spcl.resolveAll(context);
```

##### Different ways to specify the config resolution:
The above example assumes that the rule values are directly available in the context object. But fear not there are multiple ways the rules can be resolved.

* If you would like to specify a module/file that custom implements the rule resolution (that can be resolved using require):
```javascript
```

* If you would like to specify a factory method in a module/file that does the rule resolution:
```javascript
```


##### Different ways to specify the context in config:

* If you would like to specify the context in a nested object under the context objext:
```javascript
```

* If you would like to have multiple values for a rule in the config and want at least one value matched in your context
```javascript
```

* If you would like to have multiple values for a rule in the config and you want to specify a complex and/or rule to match against your context
```javascript
```