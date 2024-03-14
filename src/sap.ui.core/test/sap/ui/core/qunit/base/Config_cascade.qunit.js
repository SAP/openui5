/*!
 * ${copyright}
 */
/*global QUnit */
QUnit.config.autostart = false;
QUnit.config.reorder = false;

sap.ui.require([
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
		/**
		 * @deprecated
		 */
		assert.expect(20);

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
		/**
		 * @deprecated
		 */
		assert.strictEqual(BaseConfiguration.get({
			name: "sapUiParamCode",
			type: BaseConfiguration.Type.Code,
			external: true
		})(), "code", "BaseConfiguration.get for param 'sapUiParamCode' returns correct function");
		/**
		 * @deprecated
		 */
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
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamMergedObject",
			type: BaseConfiguration.Type.Object,
			external: true
		}), {objectKeyUrl: "urlObject"}, "BaseConfiguration.get for param 'sapUiParamMergedObject' returns correct value '{objectKeyUrl: \"urlObject\"}'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamMergedObject",
			type: BaseConfiguration.Type.MergedObject,
			external: true
		}), {
			objectKeyGlobal: "globalObject",
			objectKeyBootstrap: "bootstrapObject",
			objectKeyMeta: "metaObject",
			objectKeyUrl: "urlObject"
		}, "BaseConfiguration.get for param 'sapUiParamMergedObject' returns correct value '{objectKeyGlobal: \"globalObject\",objectKeyBootstrap: \"bootstrapObject\",objectKeyMeta: \"metaObject\",objectKeyUrl: \"urlObject\"}'");
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
		assert.expect(13);

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
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.MergedObject
		}), {}, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value '{}'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.MergedObject,
			defaultValue: true
		}), true, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns provided default value 'true'");
		BaseConfiguration._.invalidate();
		assert.deepEqual(BaseConfiguration.get({
			name: "sapUiParamDoesNotExist",
			type: BaseConfiguration.Type.MergedObject,
			defaultValue: undefined
		}), undefined, "BaseConfiguration.get for param 'sapUiParamDoesNotExist' returns correct value 'undefined'");
	});

	QUnit.test("Type Conversion: Invalid usage of BaseConfiguration.get", function(assert) {
		assert.expect(9);
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
				type: BaseConfiguration.Type.MergedObject,
				external: true
			});
		}, new TypeError("unsupported value"), "BaseConfiguration.get with type 'mergedObject' for param 'sapUiParamInteger' throws error 'unsupported value'");
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
		assert.expect(87);
		var oGlobalProviderGetSpy = sinon.spy(GlobalConfigurationProvider, "get");
		var oWritableBootInstance = BaseConfiguration.getWritableBootInstance();

		// BaseConfiguration and WritableBootInstance use both the identical get function, therefore
		// the result should be always the same, but the first call could be either answered by cache
		// or by provider whether the second call must always be answered by cache.
		function assertBaseConfigGet(sName, vResult, sMessage, bFreeze) {
			assert.strictEqual(oWritableBootInstance.get({
				name: sName,
				type: BaseConfiguration.Type.String,
				external: true,
				freeze: bFreeze
			}), vResult, "WritableBootInstance: " + sMessage);
			assert.strictEqual(BaseConfiguration.get({
				name: sName,
				type: BaseConfiguration.Type.String,
				external: true
			}), vResult, "BaseConfiguration: " + sMessage);
		}
		// Params provided and changed via globalThis['sap-ui-config']
		assertBaseConfigGet("sapUiParamD", "global", "get: for param 'sapUiParamD' returns value 'global'", true);
		assertBaseConfigGet("sapUiXxParamE", "xx-global", "get: for param 'xxParamE' returns correct value 'xx-global'");
		// Params provided via globalThis['sap-ui-config'] and changed via WritableBootInstance.set
		assertBaseConfigGet("sapUiParamG", "global", "get: for param 'paramG' returns correct value 'global'", true);
		assertBaseConfigGet("sapUiParamH", "global", "get: for param 'paramH' returns correct value 'global'");
		// Params not provided at all and changed via WritableBootInstance.set
		assertBaseConfigGet("sapUiNotProvidedParamA", "", "get: for param 'notProvidedParamA' returns correct value ''", true);
		assertBaseConfigGet("sapUiNotProvidedParamB", "", "get: for param 'notProvidedParamB' returns correct value ''");
		// Params not provided at all and changed via WritableBootInstance.set and globalThis['sap-ui-config']
		assertBaseConfigGet("sapUiNotProvidedParamC", "", "get: for param 'notProvidedParamC' returns correct value ''", true);
		assertBaseConfigGet("sapUiNotProvidedParamD", "", "get: for param 'notProvidedParamD' returns correct value ''");

		// Param is provided via globalThis['sap-ui-config'] in lowercase and the param should not become frozen
		assertBaseConfigGet("sapUiParamLowercase", "lowercase", "get: for param 'paramlowercase' returns correct value 'lowercase'");

		assert.strictEqual(oGlobalProviderGetSpy.callCount, 13, "No entries in cache. All 'get' calls to the provider, eigth regular and four times for the 'xx'-fallback. BaseConfiguration already reads from cache within 'assertBaseConfigGet'.");
		assert.ok(oGlobalProviderGetSpy.getCall(0).calledWithExactly("sapUiParamD", true), "1st call was for 'sapUiParamD' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(1).calledWithExactly("sapUiXxParamE", undefined), "2nd call was for 'sapUiXxParamE' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(2).calledWithExactly("sapUiParamG", true), "3rd call was for 'sapUiParamG' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(3).calledWithExactly("sapUiParamH", undefined), "4th call was for 'sapUiParamH' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(4).calledWithExactly("sapUiNotProvidedParamA", true), "5th call was for 'sapUiNotProvidedParamA' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(5).calledWithExactly("sapUiXxNotProvidedParamA", true), "6th call was for 'sapUiXxNotProvidedParamA' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(6).calledWithExactly("sapUiNotProvidedParamB", undefined), "7th call was for 'sapUiNotProvidedParamB' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(7).calledWithExactly("sapUiXxNotProvidedParamB", undefined), "8th call was for 'sapUiXxNotProvidedParamB' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(8).calledWithExactly("sapUiNotProvidedParamC", true), "9th call was for 'sapUiNotProvidedParamC' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(9).calledWithExactly("sapUiXxNotProvidedParamC", true), "10th call was for 'sapUiXxNotProvidedParamC' with additional parameter freeze 'true'.");
		assert.ok(oGlobalProviderGetSpy.getCall(10).calledWithExactly("sapUiNotProvidedParamD", undefined), "11th call was for 'sapUiNotProvidedParamD' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(11).calledWithExactly("sapUiXxNotProvidedParamD", undefined), "12th call was for 'sapUiXxNotProvidedParamD' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(12).calledWithExactly("sapUiParamLowercase", undefined), "12th call was for 'sapUiParamLowercase' with additional parameter freeze 'undefined'.");
		oGlobalProviderGetSpy.reset();

		var oLogSpy = sinon.spy(sap.ui.loader._.logger, "error");

		// Change some parameter using the globalThis['sap-ui-config'] object
		globalThis["sap-ui-config"]["param-d"] = "hubelDubel";
		globalThis["sap-ui-config"]["xx-param-e"] = "hubelDubel";
		globalThis["sap-ui-config"]["not-provided-param-c"] = "hubelDubel";
		globalThis["sap-ui-config"]["not-provided-param-d"] = "hubelDubel";

		// Change some parameter using WritableBootInstance.set
		oWritableBootInstance.set("sapUiParamG", "HubelDubel");
		oWritableBootInstance.set("sapUiParamH", "HubelDubel");
		oWritableBootInstance.set("sapUiNotProvidedParamA", "HubelDubel");
		oWritableBootInstance.set("sapUiNotProvidedParamB", "HubelDubel");
		oWritableBootInstance.set("sapUiNotProvidedParamC", "HubelDubel");
		oWritableBootInstance.set("sapUiNotProvidedParamD", "HubelDubel");
		assert.strictEqual(oLogSpy.callCount, 3, "There should be 3 log messages.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiParamG' was frozen and cannot be changed to HubelDubel!"), "Correct error message logged.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiNotProvidedParamA' was frozen and cannot be changed to HubelDubel!"), "Correct error message logged.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiNotProvidedParamC' was frozen and cannot be changed to HubelDubel!"), "Correct error message logged.");
		oLogSpy.reset();

		assertBaseConfigGet("sapUiParamD", "global", "BaseConfiguration.get for param 'sapUiParamD' still returns value 'global'");
		assertBaseConfigGet("sapUiXxParamE", "xx-global", "BaseConfiguration.get for param 'paramE' still returns correct value 'xx-global'");
		assertBaseConfigGet("sapUiParamG", "global", "BaseConfiguration.get for param 'paramG' returns correct value 'global'");
		assertBaseConfigGet("sapUiParamH", "HubelDubel", "BaseConfiguration.get for param 'paramH' returns correct value 'HubelDubel'");
		assertBaseConfigGet("sapUiNotProvidedParamA", "", "BaseConfiguration.get for param 'notProvidedParamA' returns correct value ''");
		assertBaseConfigGet("sapUiNotProvidedParamB", "HubelDubel", "BaseConfiguration.get for param 'notProvidedParamB' returns correct value 'HubelDubel'");
		assertBaseConfigGet("sapUiNotProvidedParamC", "", "BaseConfiguration.get for param 'notProvidedParamC' returns correct value ''");
		assertBaseConfigGet("sapUiNotProvidedParamD", "HubelDubel", "BaseConfiguration.get for param 'notProvidedParamD' returns correct value 'HubelDubel'");

		assert.strictEqual(oGlobalProviderGetSpy.callCount, 10, "All entries were cached, but WriteabelConfig.set clears the cache. There are only two 'xx'-fallback because 'sapUiParamG' and 'sapUiParamH' are not evaluated before freeze of provider.");
		oGlobalProviderGetSpy.reset();

		GlobalConfigurationProvider.freeze();
		// Set after freeze should not change any parameter
		oWritableBootInstance.set("sapUiParamLowercase", "HubelDubel");
		assert.strictEqual(oLogSpy.callCount, 3, "There should be 3 log messages.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiParamD' was frozen and cannot be changed to hubelDubel!"), "Correct error message logged.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiNotProvidedParamC' was frozen and cannot be changed to hubelDubel!"), "Correct error message logged.");
		assert.ok(oLogSpy.calledWith("Configuration option 'sapUiParamLowercase' was frozen and cannot be changed to HubelDubel!"), "Correct error message logged.");
		oLogSpy.reset();

		assertBaseConfigGet("sapUiParamD", "global", "get (after freeze): for param 'sapUiParamD' returns default value 'global'");
		assertBaseConfigGet("sapUiXxParamE", "hubelDubel", "get (after freeze): for param 'sapUiParamE' returns correct value 'hubelDubel'");
		assertBaseConfigGet("sapUiParamG", "global", "get (after freeze): for param 'sapUiParamG' returns correct value 'hubelDubel'");
		assertBaseConfigGet("sapUiParamH", "HubelDubel", "get (after freeze): for param 'sapUiParamH' returns correct value 'HubelDubel'");
		assertBaseConfigGet("sapUiNotProvidedParamA", "", "get (after freeze): for param 'sapUiNotProvidedParamA' returns correct value ''");
		assertBaseConfigGet("sapUiNotProvidedParamB", "HubelDubel", "get (after freeze): for param 'sapUiNotProvidedParamB' returns correct value 'HubelDubel'");
		assertBaseConfigGet("sapUiNotProvidedParamC", "", "get (after freeze): for param 'sapUiNotProvidedParamC' returns correct value ''");
		assertBaseConfigGet("sapUiNotProvidedParamD", "HubelDubel", "get (after freeze): for param 'sapUiNotProvidedParamD' returns correct value 'HubelDubel'");
		assertBaseConfigGet("sapUiParamLowercase", "lowercase", "get (after freeze): for param 'sapUiParamLowercase' returns correct value 'lowercase'");

		assert.strictEqual(oGlobalProviderGetSpy.callCount, 11, "The cache should be emtpy again after freeze. There are two 'xx'-fallback calls because frozen value of 'sapUiNotProvidedParamA' and 'sapUiNotProvidedParamC' is 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(0).calledWithExactly("sapUiParamD", undefined), "1st call was for 'sapUiParamD' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(1).calledWithExactly("sapUiXxParamE", undefined), "2nd call was for 'sapUiXxParamE' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(2).calledWithExactly("sapUiParamG", undefined), "3rd call was for 'sapUiParamG' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(3).calledWithExactly("sapUiParamH", undefined), "4th call was for 'sapUiParamH' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(4).calledWithExactly("sapUiNotProvidedParamA", undefined), "5th call was for 'sapUiNotProvidedParamA' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(5).calledWithExactly("sapUiXxNotProvidedParamA", undefined), "6th call was for 'sapUiXxNotProvidedParamA' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(6).calledWithExactly("sapUiNotProvidedParamB", undefined), "7th call was for 'sapUiNotProvidedParamB' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(7).calledWithExactly("sapUiNotProvidedParamC", undefined), "8th call was for 'sapUiNotProvidedParamC' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(8).calledWithExactly("sapUiXxNotProvidedParamC", undefined), "9th call was for 'sapUiXxNotProvidedParamC' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(9).calledWithExactly("sapUiNotProvidedParamD", undefined), "10th call was for 'sapUiNotProvidedParamD' with additional parameter freeze 'undefined'.");
		assert.ok(oGlobalProviderGetSpy.getCall(10).calledWithExactly("sapUiParamLowercase", undefined), "11th call was for 'sapUiParamLowercase' with additional parameter freeze 'undefined'.");

		oGlobalProviderGetSpy.restore();
		oLogSpy.restore();
	});

	QUnit.test("Configuration write", function(assert) {
		assert.expect(5);

		var oWritableInstance1 = BaseConfiguration.getWritableInstance();
		var oWritableInstance2 = BaseConfiguration.getWritableInstance();

		oWritableInstance1.set("myNewParameter", true);
		oWritableInstance2.set("myNewParameter", false);

		assert.strictEqual(oWritableInstance1.get({
			name: "myNewParameter",
			type: oWritableInstance2.Type.Boolean
		}), true, "WritableInstance1.get for param 'myNewParameter' returns value 'true'");
		assert.strictEqual(oWritableInstance2.get({
			name: "myNewParameter",
			type: oWritableInstance2.Type.Boolean,
			defaultValue: true
		}), false, "WritableInstance2.get for param 'myNewParameter' returns value 'false'");

		oWritableInstance1.set("sapUiParamA", "write");
		assert.strictEqual(oWritableInstance1.get({
			name: "sapUiParamA",
			type: oWritableInstance2.Type.String,
			external: true
		}), "write", "WritableInstance1.get for param 'sapUiParamA' returns value 'write'");
		assert.strictEqual(oWritableInstance2.get({
			name: "sapUiParamA",
			type: oWritableInstance2.Type.String,
			external: true
		}), "url", "WritableInstance2.get for param 'sapUiParamA' returns value 'url'");

		assert.throws(function () {
			oWritableInstance1.set("sap-ui-param1", true);
		}, new TypeError("Invalid configuration key 'sap-ui-param1'!"), "oWritableInstance1.set for param 'sap-ui-param1' throws error 'Invalid configuration key 'sap-ui-param1'!'");
	});

	QUnit.start();
});