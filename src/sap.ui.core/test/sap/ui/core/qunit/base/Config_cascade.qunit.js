/*!
 * ${copyright}
 */
/*global globalThis, QUnit */
sap.ui.define([
	"sap/base/config",
	"sap/base/Log",
	"sap/base/config/GlobalConfigurationProvider",
	"sap/ui/thirdparty/sinon"
], function (
	BaseConfiguration,
	Log,
	GlobalConfigurationProvider,
	sinon
) {
	"use strict";
	sap.ui.loader._.logger = Log.getLogger("test", 6);

	QUnit.config.reorder = false;

	QUnit.module("Base Configuration", {
		beforeEach: function() {
			BaseConfiguration._.invalidate();
		}
	});

	QUnit.test("Check getter cascade", function(assert) {
		assert.expect(10);

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamA",
			type: BaseConfiguration.Type.String,
			external: true
		}), "url", "BaseConfiguration.get for param 'sapuiParamA' returns correct value 'url'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamA",
			type: BaseConfiguration.Type.String
		}), "meta", "BaseConfiguration.get for param 'sapUiParamA' returns correct value 'meta'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamB",
			type: BaseConfiguration.Type.String,
			external: true
		}), "meta", "BaseConfiguration.get for param 'sapuiParamB' returns correct value 'meta'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamC",
			type: BaseConfiguration.Type.String,
			external: true
		}), "bootstrap", "BaseConfiguration.get for param 'sapuiParamC' returns correct value 'bootstrap'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamD",
			type: BaseConfiguration.Type.String,
			external: true
		}), "global", "BaseConfiguration.get for param 'sapuiParamD' returns correct value 'global'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiXxParamE",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xx-global", "BaseConfiguration.get for param 'sapUiXxParamE' returns correct value 'xx-global'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamE",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xx-global", "BaseConfiguration.get for param 'sapUiParamE' returns correct value 'xx-global'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiXxParamF",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xxGlobal", "BaseConfiguration.get for param 'sapUiXxParamF' returns correct value 'xxGlobal'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamF",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xxGlobal", "BaseConfiguration.get for param 'sapUiParamF' returns correct value 'xxGlobal'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sap/ui/param1",
				type: BaseConfiguration.Type.String
			});
		}, new TypeError("Invalid configuration key 'sap/ui/param1'!"), "BaseConfiguration.get with type 'string' for param 'sap/ui/param1' throws error 'Invalid configuration key 'sap/ui/param1'!'");

	});

	QUnit.test("Type Conversion: Convert all types", function(assert) {
		assert.expect(18);
		var myEnum = {
			enumKey: "enumValue"
		};

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamBoolean",
			type: BaseConfiguration.Type.Boolean,
			external: true
		}), true, "BaseConfiguration.get for param 'sapUiParamBoolean' returns correct value 'true'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamBooleanAsString",
			type: BaseConfiguration.Type.Boolean,
			external: true
		}), true, "BaseConfiguration.get for param 'sapUiParamBooleanAsString' returns correct value 'true'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamFunction",
			type: BaseConfiguration.Type.Function,
			external: true
		})(), "function", "BaseConfiguration.get for param 'sapUiParamFunction' returns correct function");
		var aFnArray = BaseConfiguration.get({
			name: "sapUiParamFunctionAsArray",
			type: BaseConfiguration.Type.FunctionArray,
			external: true
		});
		assert.strictEqual(aFnArray.length, 2, "BaseConfiguration.get for param 'sapUiParamFunctionAsArray' returns an array with 2 functions");
		assert.notStrictEqual(aFnArray[0], aFnArray[1], "Functions in array from BaseConfiguration.get for param 'sapUiParamFunctionAsArray' are different");
		assert.strictEqual(aFnArray[0](), "functionAsArray", "First function retrieved from BaseConfiguration.get for param 'sapUiParamFunctionAsArray' returns correct value");
		assert.strictEqual(aFnArray[1](), "functionAsArray", "Second function retrieved from BaseConfiguration.get for param 'sapUiParamFunctionAsArray' returns correct value");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamString",
			type: function (vValue) {
				return vValue + "ModifiedByFunction";
			},
			external: true
		}), "stringModifiedByFunction", "BaseConfiguration.get for param 'sapUiParamString' returns correct value 'stringModifiedByFunction'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamCode",
			type: BaseConfiguration.Type.Code,
			external: true
		})(), "code", "BaseConfiguration.get for param 'sapUiParamCode' returns correct function");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamCodeAsString",
			type: BaseConfiguration.Type.Code,
			external: true
		}), "codeAsString", "BaseConfiguration.get for param 'sapUiParamCodeAsString' returns correct value 'codeAsString'");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamInteger",
			type: BaseConfiguration.Type.Integer,
			external: true
		}), 5, "BaseConfiguration.get for param 'sapUiParamInteger' returns correct value '5'");
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamObject",
			type: BaseConfiguration.Type.Object,
			external: true
		}), {objectKey: "object"}, "BaseConfiguration.get for param 'sapUiParamObject' returns correct value '{objectKey: \"object\"}'");
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamObjectAsString",
			type: BaseConfiguration.Type.Object,
			external: true
		}), {objectAsStringKey: "objectAsStringValue"}, "BaseConfiguration.get for param 'sapUiParamObjectAsString' returns correct value '{objectAsStringKey: \"objectAsStringValue\"}'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamString",
			type: BaseConfiguration.Type.String,
			external: true
		}), "string", "BaseConfiguration.get for param 'sapUiParamString' returns correct value 'string'");
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamStringArray",
			type: BaseConfiguration.Type.StringArray,
			external: true
		}), ["stringArray"], "BaseConfiguration.get for param 'sapUiParamStringArray' returns correct value '[\"stringArray\"]'");
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamStringArrayAsString",
			type: BaseConfiguration.Type.StringArray,
			external: true
		}), ["stringArrayAsString", "stringArrayAsStr"], "BaseConfiguration.get for param 'sapUiParamStringArrayAsString' returns correct value '[\"stringArrayAsString\", \"stringArrayAsStr\"]'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamEnum",
			type: myEnum,
			external: true
		}), "enumValue", "BaseConfiguration.get for param 'sapUiParamEnum' returns correct value 'enumValue'");
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamNull",
			type: BaseConfiguration.Type.String,
			external: true
		}), null, "BaseConfiguration.get for param 'sapUiParamNull' returns correct value 'null'");
	});

	QUnit.test("Type Conversion: Default values", function(assert) {
		assert.expect(10);

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Boolean
		}), false, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value 'false'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Code
		}), undefined, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value 'undefined'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Integer
		}), 0, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '0'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.String
		}), "", "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '\"\"'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.StringArray
		}), [], "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '[]'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.FunctionArray
		}), [], "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '[]'");
		BaseConfiguration._.invalidate();
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Function
		}), undefined, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value 'undefined'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Object
		}), {}, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '{}'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Object,
			defaultValue: true
		}), true, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns provided default value 'true'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.Object,
			defaultValue: undefined
		}), undefined, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value 'undefined'");
	});

	QUnit.test("Type Conversion: Invalid usage of BaseConfiguration.get", function(assert) {
		assert.expect(8);
		var myEnum = {
			enumKey: "enumValue"
		};
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamInteger",
				type: BaseConfiguration.Type.StringArray,
				external: true
			});
		}, new TypeError("unsupported value"), "BaseConfiguration.get with type 'string[]' for param 'sapUiParamInteger' throws error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamStringArray",
				type: BaseConfiguration.Type.FunctionArray,
				external: true
			});
		}, new TypeError("Not a function: stringArray"), "BaseConfiguration.get with type 'function[]' for param 'sapUiParamStringArray' throws error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamString",
				type: BaseConfiguration.Type.Function,
				external: true
			});
		}, new TypeError("unsupported value"), "BaseConfiguration.get with type 'function' for param 'sapUiParamString' throws error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamInteger",
				type: BaseConfiguration.Type.Object,
				external: true
			});
		}, new TypeError("unsupported value"), "BaseConfiguration.get with type 'object' for param 'sapUiParamInteger' throws error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamInteger",
				type: "hubeldubel",
				external: true
			});
		}, new TypeError("unsupported type"), "BaseConfiguration.get with type 'hubeldubel' for param 'sapUiParamInteger' throws type error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamInteger",
				type: [],
				external: true
			});
		}, new TypeError("unsupported type"), "BaseConfiguration.get with type '[]' for param 'sapUiParamInteger' throws type error 'unsupported value'");
		assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamInteger",
				type: myEnum,
				external: true
			});
		}, new TypeError("Unsupported Enumeration value for sapUiParamInteger, valid values are: enumValue"), "BaseConfiguration.get with type 'myEnum' for param 'sapUiParamInteger' throws error 'unsupported value'");assert.throws(function () {
			BaseConfiguration.get({
				name: "sapUiParamObject",
				type: BaseConfiguration.Type.Integer,
				external: true
			});
		}, new TypeError("unsupported value"), "BaseConfiguration.get with type 'integer' for param 'sapUiParamObject' throws error 'unsupported value'");
	});

	QUnit.test("Configuration freeze", function(assert) {
		assert.expect(8);
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamD",
			type: BaseConfiguration.Type.String,
			external: true,
			freeze: true
		}), "global", "BaseConfiguration.get for param 'sapUiParamD' returns value 'global'");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamE",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xx-global", "BaseConfiguration.get for param 'paramE' returns correct value 'xx-global'");

		globalThis["sap-ui-config"]["paramD"] = "hubelDubel";
		globalThis["sap-ui-config"]["paramE"] = "hubelDubel";
		BaseConfiguration._.invalidate();

		var oLogSpy = sinon.spy(sap.ui.loader._.logger, "error");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamD",
			type: BaseConfiguration.Type.String,
			external: true
		}), "global", "BaseConfiguration.get for param 'sapUiParamD' still returns value 'global'");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamE",
			type: BaseConfiguration.Type.String,
			external: true
		}), "xx-global", "BaseConfiguration.get for param 'paramE' still returns correct value 'xx-global'");

		GlobalConfigurationProvider.freeze();
		BaseConfiguration._.invalidate();
		assert.strictEqual(oLogSpy.callCount, 1, "There should be 1 log message.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiParamD' was frozen and cannot be changed to hubelDubel!"), "Correct error message logged.");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamD",
			type: BaseConfiguration.Type.String,
			external: true
		}), "global", "After freeze: BaseConfiguration.get for param 'sapUiParamD' returns default value 'global'");

		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamE",
			type: BaseConfiguration.Type.String,
			external: true
		}), "hubelDubel", "After freeze: BaseConfiguration.get for param 'sapUiParamE' returns correct value 'hubelDubel'");
	});

	QUnit.test("Configuration write", function(assert) {
		assert.expect(5);

		var oWriteableInstance1 = BaseConfiguration.getWritableInstance();
		var oWriteableInstance2 = BaseConfiguration.getWritableInstance();

		oWriteableInstance1.set("myNewParameter", true);
		oWriteableInstance2.set("myNewParameter", false);

		assert.strictEqual(oWriteableInstance1.get({
			name: "myNewParameter",
			type: oWriteableInstance2.Type.Boolean
		}), true, "WritableInstance1.get for param 'myNewParameter' returns value 'true'");
		assert.strictEqual(oWriteableInstance2.get({
			name: "myNewParameter",
			type: oWriteableInstance2.Type.Boolean,
			defaultValue: true
		}), false, "WritableInstance2.get for param 'myNewParameter' returns value 'false'");

		oWriteableInstance1.set("sapUiParamA", "write");
		assert.strictEqual(oWriteableInstance1.get({
			name: "sapUiParamA",
			type: oWriteableInstance2.Type.String,
			external: true
		}), "write", "WritableInstance1.get for param 'sapUiParamA' returns value 'write'");
		assert.strictEqual(oWriteableInstance2.get({
			name: "sapUiParamA",
			type: oWriteableInstance2.Type.String,
			external: true
		}), "url", "WritableInstance2.get for param 'sapUiParamA' returns value 'url'");

		assert.throws(function () {
			oWriteableInstance1.set("sap-ui-param1", true);
		}, new TypeError("Invalid configuration key 'sap-ui-param1'!"), "oWriteableInstance1.set for param 'sap-ui-param1' throws error 'Invalid configuration key 'sap-ui-param1'!'");
	});
});