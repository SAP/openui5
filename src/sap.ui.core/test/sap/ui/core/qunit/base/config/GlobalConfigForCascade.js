/* global globalThis */
(function () {
    "use strict";

    globalThis["sap-ui-config"] = {
        "param-a": "global",
        "param-b": "global",
        "param-c": "global",
        "param-d": "global",
        "xx-param-e": "xx-global",
        "xxParamF": "xxGlobal",
        "param-g": "global",
        "param-h": "global",
        "param-boolean": "true",
        "param-boolean-as-string": "X",
        "param-function": function () {
            return "function";
        },
        "param-function-as-array": [function () {
            return "functionAsArray";
        }, function () {
            return "functionAsArray";
        }],
        "param-code": function () {
            return "code";
        },
        "param-code-as-string": "codeAsString",
        "param-object": {
            objectKey: "object"
        },
        "param-merged-object": {
            objectKeyGlobal: "globalObject"
        },
        "param-object-as-string": "{\"objectAsStringKey\": \"objectAsStringValue\"}",
        "param-string": "string",
        "param-string-array": ["stringArray"],
        "param-string-array-as-string": "stringArrayAsString,stringArrayAsStr",
        "param-integer": 5,
        "param-null": null,
        "param-enum": "enumValue",
        "paramlowercase": "lowercase"
    };
})();