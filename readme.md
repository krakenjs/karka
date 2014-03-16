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
        ]
    },
    context = {
        "hakunamatata": "It-Means-No-Worries"
    },
    spcl  = karka.create(config),
    mappedName = spcl.resolve('foo', context);

    \\mappedName = 'bar'

```



