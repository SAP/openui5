/* global globalThis */
(function () {
    "use strict";
    globalThis["sap-ui-config"] = {
        "hubelDubel": "value1", // valid
        "hubeldubel": "value2", // valid
        "fooBar": "value3", // valid
        "FooBar": "value4",// duplicate
        "foobar": "value5", // valid
        "foo-bar": "value6", // duplicate
        "5ooBar": "value7", // valid
        "sap-ui-fooBar": "value8", // valid
        "sapUiFooBar": "value9", // duplicate
        "sap.foo.bar": "value10", // valid
        "xxBarFoo": "value11", // valid
        "xx-farBoo": "value12", // valid
        "sap/foo/bar": "value13", // invalid
        "sap-ushell-foo-bar": "value14", // valid but sap-ui- prefixed
        "initialFalsyValue": false, // valid
        "initial-falsy-value": false // duplicate
    };
})();