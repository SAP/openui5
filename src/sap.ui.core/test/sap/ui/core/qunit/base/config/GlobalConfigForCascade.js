/* global globalThis */
(function () {
    "use strict";

    globalThis["sap-ui-config"] = {
        "paramA": "global",
        "paramB": "global",
        "paramC": "global",
        "paramD": "global",
        "xx-paramE": "xx-global",
        "xxParamF": "xxGlobal",
        "paramBoolean": "true",
        "paramBooleanAsString": "X",
        "paramFunction": function () {
            return "function";
        },
        "paramFunctionAsArray": [function () {
            return "functionAsArray";
        }, function () {
            return "functionAsArray";
        }],
        "paramCode": function () {
            return "code";
        },
        "paramCodeAsString": "codeAsString",
        "paramObject": {
            objectKey: "object"
        },
        "paramObjectAsString": "{\"objectAsStringKey\": \"objectAsStringValue\"}",
        "paramString": "string",
        "paramStringArray": ["stringArray"],
        "paramStringArrayAsString": "stringArrayAsString,stringArrayAsStr",
        "paramInteger": 5,
        "paramNull": null,
        "paramEnum": "enumValue"
    };
})();