/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/BindingHelper",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel",
	"sap/m/HBox",
	"sap/ui/core/date/UI5Date"
],
function (
	BindingHelper,
	ManagedObject,
	JSONModel,
	HBox,
	UI5Date
) {
	"use strict";

	QUnit.module("Static method #createBindingInfos");

	QUnit.test("Call #createBindingInfos with values, that don't contain binding", function (assert) {
		// arrange
		var oEmptyObj = {},
			oObj = {
				key: 1
			},
			aEmptyArr = [],
			aArr = [
				"someValue"
			];

		// assert
		assert.strictEqual(BindingHelper.createBindingInfos(null), null, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(undefined), undefined, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(false), false, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(true), true, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(0), 0, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(1), 1, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos(42), 42, "Should preserve value if it doesn't contain binding.");
		assert.strictEqual(BindingHelper.createBindingInfos("string that doesn't contain binding"), "string that doesn't contain binding", "Should preserve value if it doesn't contain binding.");
		assert.notStrictEqual(BindingHelper.createBindingInfos(oEmptyObj), oEmptyObj, "Should return new object.");
		assert.notStrictEqual(BindingHelper.createBindingInfos(oObj), oObj, "Should return new object.");
		assert.deepEqual(BindingHelper.createBindingInfos(oObj), oObj, "New object should be copy of the old object.");
		assert.notStrictEqual(BindingHelper.createBindingInfos(aEmptyArr), aEmptyArr, "Should return new array.");
		assert.notStrictEqual(BindingHelper.createBindingInfos(aArr), aArr, "Should return new array.");
		assert.deepEqual(BindingHelper.createBindingInfos(aArr), aArr, "New array should be copy of the old array.");
	});

	QUnit.test("Call #createBindingInfos with simple 'string' that contains binding", function (assert) {
		// arrange
		var sValue = "{simpleBinding}",
			vBindingInfo = BindingHelper.createBindingInfos(sValue);

		// assert
		assert.strictEqual(typeof vBindingInfo, "object", "String with binding syntax should be successfully parsed.");
		assert.ok(vBindingInfo.hasOwnProperty("path"), "Valid binding infos should contain 'path' property.");
	});

	QUnit.test("Call #createBindingInfos with 'string' that contains binding and free text", function (assert) {
		// arrange
		var sValue = "{simpleBinding} with some free text",
			vBindingInfo = BindingHelper.createBindingInfos(sValue);

		// assert
		assert.strictEqual(typeof vBindingInfo, "object", "String with binding syntax should be successfully parsed.");
		assert.ok(vBindingInfo.hasOwnProperty("parts"), "Valid binding infos should contain 'path' property.");
		assert.ok(vBindingInfo.hasOwnProperty("formatter"), "Valid binding infos should contain 'formatter' property.");
	});

	QUnit.test("Call #createBindingInfos with 'array'", function (assert) {
		// arrange
		var aArr = [
				"{simpleBinding}",
				"{simpleBinding} with some free text",
				"noBindingText"
			],
			vBindingInfo = BindingHelper.createBindingInfos(aArr);

		// assert
		assert.ok(Array.isArray(vBindingInfo), "Array should be returned.");
		assert.notStrictEqual(aArr, vBindingInfo, "New array should be returned.");
		assert.strictEqual(aArr[0], "{simpleBinding}", "The real array should NOT be modified.");
		assert.strictEqual(aArr[1], "{simpleBinding} with some free text", "The real array should NOT be modified.");
		assert.strictEqual(aArr[2], "noBindingText", "The real array should NOT be modified.");
		assert.ok(vBindingInfo[0].hasOwnProperty("path"), "Valid binding infos should contain 'path' property.");
		assert.ok(vBindingInfo[1].hasOwnProperty("parts"), "Valid binding infos should contain 'parts' property.");
		assert.ok(vBindingInfo[1].hasOwnProperty("formatter"), "Valid binding infos should contain 'formatter' property.");
		assert.strictEqual(vBindingInfo[2], "noBindingText", "Should preserve value if it doesn't contain binding");
	});

	QUnit.test("Call #createBindingInfos with 'object'", function (assert) {
		// arrange
		var oObj = {
				key1: "{simpleBinding}",
				key2: "{simpleBinding} with some free text",
				key3: "noBindingText"
			},
			vBindingInfo = BindingHelper.createBindingInfos(oObj);

		// assert
		assert.strictEqual(typeof vBindingInfo, "object", "Parsing 'object' with binding infos should also return an 'object'.");
		assert.notStrictEqual(oObj, vBindingInfo, "Should return new 'object'");
		assert.strictEqual(oObj['key1'], "{simpleBinding}", "The real object should NOT be modified.");
		assert.strictEqual(oObj['key2'], "{simpleBinding} with some free text", "The real object should NOT be modified.");
		assert.strictEqual(oObj['key3'], "noBindingText", "The real object should NOT be modified.");
		assert.ok(vBindingInfo['key1'].hasOwnProperty("path"), "Valid binding infos should contain 'path' property.");
		assert.ok(vBindingInfo['key2'].hasOwnProperty("parts"), "Valid binding infos should contain 'parts' property.");
		assert.ok(vBindingInfo['key2'].hasOwnProperty("formatter"), "Valid binding infos should contain 'formatter' property.");
		assert.strictEqual(vBindingInfo['key3'], "noBindingText", "Should preserve value if it doesn't contain binding");
	});

	QUnit.test("Call #createBindingInfos with object containing instances of Date", function (assert) {
		// Arrange
		var oData = {
			value: UI5Date.getInstance()
		};
		var vBindingInfo = BindingHelper.createBindingInfos(oData);

		// Assert
		assert.strictEqual(vBindingInfo.value, oData.value, "Date instance is not modified");
	});

	QUnit.module("Static method #formattedProperty'");

	QUnit.test("Call #formattedProperty with 'string'", function (assert) {
		// arrange
		var sValue = "this is some text",
			fnFormatter = function (sValue) {
				return sValue.toUpperCase();
			},
			oBindingInfo = BindingHelper.formattedProperty(sValue, fnFormatter);

		// assert
		assert.strictEqual(typeof oBindingInfo,"object", "Should have created binding info object");
		assert.strictEqual(oBindingInfo.value, sValue, "Binding info is static");
		assert.strictEqual(oBindingInfo.formatter, fnFormatter, "Formatter is attached to the static binding info");
	});

	QUnit.test("Call #formattedProperty with binding info 'object'", function (assert) {
		// arrange
		var oValue = BindingHelper.createBindingInfos("{bindingSyntax}"),
			fnFormatter = function (sValue) {
				return sValue.toUpperCase();
			},
			oBindingInfo = BindingHelper.formattedProperty(oValue, fnFormatter);

		// assert
		assert.notStrictEqual(oBindingInfo, oValue, "Should return new object - binding info.");
		assert.ok(oBindingInfo.hasOwnProperty("formatter"), "The new binding info should have attached formatter.");
		assert.strictEqual(oBindingInfo.formatter, fnFormatter,"The formatter should be the passed formatter.");
	});

	QUnit.test("Call #formattedProperty with multiple arguments - parts, given as 'array'", function (assert) {
		// arrange
		var aValues = [
				"{firstTextWithBindingOnly}",
				"second text with no binding",
				"third text {with some binding}"
			],
			aParts = BindingHelper.createBindingInfos(aValues),
			fnFormatter = function (sFirstValue, sSecondValue, sThirdValue) {
				return sFirstValue + sSecondValue + sThirdValue;
			},
			oBindingInfo = BindingHelper.formattedProperty(aParts, fnFormatter);
		// assert
		assert.strictEqual(typeof oBindingInfo, "object", "Should return new object - binding info.");
		assert.ok(oBindingInfo.hasOwnProperty("parts"), "The new binding info should have 'parts'.");
		assert.deepEqual(aParts[0], oBindingInfo.parts[0], "Objects in the new binding info 'parts' should be as given.");
		assert.deepEqual(typeof oBindingInfo.parts[0], "object", "Strings in the new binding info 'parts' should be returned as objects.");
		assert.ok(oBindingInfo.hasOwnProperty("formatter"), "The new binding info should have attached formatter.");
		assert.strictEqual(oBindingInfo.formatter, fnFormatter,"The formatter should be the passed formatter.");
		assert.strictEqual(oBindingInfo.parts[1].value, "second text with no binding", "Plain strings should return always with key 'value' and value the string itself.");
	});

	QUnit.test("Call #formattedProperty with binding info 'object' and complex binding", function (assert) {
		// arrange
		var oValue = BindingHelper.createBindingInfos("{./images/}"),
			fnFormatter = function (sValue) {
				return sValue.toLowerCase() + ".jpg";
			},
			fnOtherFormatter = function (sValue) {
				return sValue.toUpperCase() + "IMAGE";
			};
		oValue.formatter = fnOtherFormatter;
		var oBindingInfo = BindingHelper.formattedProperty(oValue, fnFormatter);

		//Act
		var formattedProperty = fnFormatter(fnOtherFormatter(oValue.path));
		var bindingHelperFormattedProperty = oBindingInfo.formatter(oValue.path);

		// assert
		assert.strictEqual(formattedProperty, bindingHelperFormattedProperty,"The formatter should be the passed formatter.");
	});

	QUnit.test("#formattedProperty should NOT return Promise", function (assert) {
		// arrange
		var fnFormatter = function () {
			return Promise.resolve();
		};

		// act
		var oBindingInfo = BindingHelper.formattedProperty("primitiveValue", fnFormatter);

		// assert
		assert.notOk(oBindingInfo instanceof Promise, "Returned value shouldn't be Promise");
	});

	QUnit.module("Static method #escapeCardSyntax");

	QUnit.test("Call #escapeCardSyntax with different values", function (assert) {
		// arrange
		var oTestObject = {key: "property"},
			aValuesList = [
			// input, expected output
			[undefined, undefined],
			[null, null],
			[oTestObject, oTestObject],
			["", ""],
			["{property}", "{property}"],
			["{= ${property}}", "{= ${property}}"],

			// the following should be escaped
			["{{parameters.something}}", "\\{\\{parameters.something\\}\\}"],
			["{{dataSources.something}}", "\\{\\{dataSources.something\\}\\}"],
			["{{destinations.something}}", "\\{\\{destinations.something\\}\\}"],
			["text {{parameters.something}} text {property} text", "text \\{\\{parameters.something\\}\\} text {property} text"],
			["text {{parameters.something}} text {{parameters.somethingelse}} text", "text \\{\\{parameters.something\\}\\} text \\{\\{parameters.somethingelse\\}\\} text"],
			["{{destination.myDestination}}/{property}/{{parameters.something}}", "\\{\\{destination.myDestination\\}\\}/{property}/\\{\\{parameters.something\\}\\}"]
		];

		aValuesList.forEach(function (aValue) {
			var vInput = aValue[0],
				vExpectedOutput = aValue[1];

			// assert
			assert.strictEqual(BindingHelper.escapeCardPlaceholders(vInput), vExpectedOutput, "Escaping is correct for '" + vInput + "'.");
		});
	});

	QUnit.test("Call #extractBindingInfo with string which contains a placeholder", function (assert) {
		// arrange
		var vInput = "{{parameters.something}}",
			vExpectedOutput = "{{parameters.something}}";

		// assert
		assert.strictEqual(BindingHelper.extractBindingInfo(vInput), vExpectedOutput, "Binding info is correct for '" + vInput + "'.");
	});

	QUnit.test("Call #extractBindingInfo with a placeholder and a binding", function (assert) {
		// arrange
		var vInput = "{{parameters.something}}/{boundProperty}",
			vOutput;

		// act
		vOutput = BindingHelper.extractBindingInfo(vInput);

		// assert
		assert.ok(vOutput.parts, "The output is binding info.");
		assert.strictEqual(vOutput.formatter.textFragments.join(""), "{{parameters.something}}/0", "The card placeholder is unchanged.");
	});

	QUnit.test("#createBindingInfos called with a placeholder should result in escaped placeholder", function (assert) {
		var sInput = "Some binding {{parameters.city}} with parameter",
			sExpected = "Some binding \\{\\{parameters.city\\}\\} with parameter";

		assert.strictEqual(BindingHelper.createBindingInfos(sInput), sExpected, "The binding info shouldn't unescaped placeholders");
	});

	QUnit.test("#createBindingInfos should escape parameters and dataSources syntax", function (assert) {
		var sInput = "Parameter {{parameters.city}}, data source {{dataSources.source}}",
			sExpected = "Parameter \\{\\{parameters.city\\}\\}, data source \\{\\{dataSources.source\\}\\}";

		assert.strictEqual(BindingHelper.createBindingInfos(sInput), sExpected, "The binding info contains escaped placeholders");
	});

	QUnit.test("#createBindingInfos should NOT escape destinations syntax", function (assert) {
		var sInput = "Destination {{destinations.city}}",
			sExpected = "Destination {{destinations.city}}";

		assert.strictEqual(BindingHelper.createBindingInfos(sInput), sExpected, "Destinations syntax is not escaped");
	});

	QUnit.module("Static method #prependRelativePaths'");

	QUnit.test("#prependRelativePaths doesn't change primitive types", function (assert) {
		// arrange
		var sInput = "should not get modified";

		// assert
		assert.strictEqual(BindingHelper.prependRelativePaths(sInput, ""), sInput, "Parameter should not be modified.");
	});

	QUnit.test("#prependRelativePath returns copy of the object", function (assert) {
		// arrange
		var oBindingInfo = {};

		// assert
		assert.notStrictEqual(BindingHelper.prependRelativePaths(oBindingInfo, ""), oBindingInfo, "Parameter should be cloned.");
	});

	QUnit.test("Absolute paths are NOT be prepended", function (assert) {
		// arrange
		var oBindingInfo = {
			path: "/absolute"
		};

		// act
		var oRes = BindingHelper.prependRelativePaths(oBindingInfo, "/root");

		// assert
		assert.strictEqual(oRes.path, oBindingInfo.path, "Absolute path should NOT be prepended.");
	});

	QUnit.test("Relative paths are prepended", function (assert) {
		// arrange
		var oBindingInfo = {
			path: "relative"
		};

		// act
		var oRes = BindingHelper.prependRelativePaths(oBindingInfo, "/root");

		// assert
		assert.strictEqual(oRes.path, "/root/" + oBindingInfo.path, "Relative path should be prepended.");
	});

	QUnit.test("'parts' of the binding info are also processed", function (assert) {
		// arrange
		var oSpy = sinon.spy(BindingHelper, "prependRelativePaths");
		var oBindingInfo = {
			parts: [
				{ path: "path1" },
				{ path: "path2" }
			],
			formatter: function () {}
		};

		// act
		BindingHelper.prependRelativePaths(oBindingInfo, "/root");

		// assert
		assert.strictEqual(oSpy.callCount, 3, "The binding info and all 'parts' inside it should be processed.");

		// clean up
		oSpy.restore();
	});

	QUnit.test("Call #prependRelativePaths with 'array' of binding infos", function (assert) {
		// arrange
		var oSpy = sinon.spy(BindingHelper, "prependRelativePaths");
		var aValues = [
			{
				path: "1"
			},
			{
				path: "2"
			}
		];

		// act
		var aResult = BindingHelper.prependRelativePaths(aValues, "/items");

		// assert
		assert.strictEqual(oSpy.callCount, 3, "All values of the given array should be processed.");
		assert.strictEqual(aResult[0].path, "/items/1", "First binding info path is correctly prepended.");
		assert.strictEqual(aResult[1].path, "/items/2", "Second binding info path is correctly prepended.");

		// clean up
		oSpy.restore();
	});

	QUnit.test("prependRelativePaths should process objects and arrays in depth", function (assert) {
		// arrange
		var oSpy = sinon.spy(BindingHelper, "prependRelativePaths");
		var oValue = {
			a: {
				path: "path1"
			},
			b: {
				b1: {
					path: "path2"
				}
			},
			c: [
				{
					path: "path3"
				},
				{
					c1: [
						{
							path: "path4"
						}
					]
				}
			]
		};

		// act
		var oResult = BindingHelper.prependRelativePaths(oValue, "/items");

		// assert
		assert.strictEqual(oSpy.callCount, 9, "All values should be processed.");
		assert.strictEqual(oResult.a.path, "/items/path1", "First binding info path is correctly prepended.");
		assert.strictEqual(oResult.b.b1.path, "/items/path2", "Second binding info path is correctly prepended.");
		assert.strictEqual(oResult.c[0].path, "/items/path3", "Third binding info path is correctly prepended.");
		assert.strictEqual(oResult.c[1].c1[0].path, "/items/path4", "Fourth binding info path is correctly prepended.");

		// clean up
		oSpy.restore();
	});

	QUnit.module("Static method #propagateModels");

	QUnit.test("Copying models", function (assert) {
		// arrange
		var oSource = new ManagedObject(),
			oTarget = new ManagedObject(),
			oModel1 = new JSONModel(),
			oModel2 = new JSONModel(),
			oModel3 = new JSONModel();

		oSource.setModel(oModel1);
		oSource.setModel(oModel2, "model2");
		oSource.setModel(oModel3, "model3");

		// act
		BindingHelper.propagateModels(oSource, oTarget);

		// assert
		assert.strictEqual(oTarget.getModel(), oModel1, "Model 1 is copied.");
		assert.strictEqual(oTarget.getModel("model2"), oModel2, "Model 2 is copied.");
		assert.strictEqual(oTarget.getModel("model3"), oModel3, "Model 3 is copied.");
	});

	QUnit.test("Copying default models", function (assert) {
		// arrange
		var oSource = new ManagedObject(),
			oTarget = new ManagedObject(),
			oModel = new JSONModel(),
			oModelFilters = new JSONModel(),
			oModelParameters = new JSONModel(),
			oModelContext = new JSONModel(),
			oModelI18n = new JSONModel();

		oSource.setModel(oModel);
		oSource.setModel(oModelFilters, "filters");
		oSource.setModel(oModelParameters, "parameters");
		oSource.setModel(oModelContext, "context");
		oSource.setModel(oModelI18n, "i18n");

		// act
		BindingHelper.propagateModels(oSource, oTarget);

		// assert
		assert.strictEqual(oTarget.getModel(), oModel, "Default model is copied.");
		assert.strictEqual(oTarget.getModel("filters"), oModelFilters, "Filters model is copied.");
		assert.strictEqual(oTarget.getModel("parameters"), oModelParameters, "Parameters model is copied.");
		assert.strictEqual(oTarget.getModel("context"), oModelContext, "Context model is copied.");
		assert.strictEqual(oTarget.getModel("i18n"), oModelI18n, "I18n model is copied.");
	});

	QUnit.test("Copying models which are propagated from parent to child", function (assert) {
		// arrange
		var oSource = new HBox(),
			oSourceParent = new HBox({
				items: [oSource]
			}),
			oTarget = new ManagedObject(),
			oModel = new JSONModel(),
			oModelI18n = new JSONModel(),
			oModelParameters = new JSONModel();

		// set models on the parent
		oSourceParent.setModel(oModel);
		oSourceParent.setModel(oModelI18n, "i18n");

		// set models on the child
		oSource.setModel(oModelParameters, "parameters");

		// act - copy models from child to the target
		BindingHelper.propagateModels(oSource, oTarget);

		// assert
		assert.strictEqual(oTarget.getModel(), oModel, "Default model is copied.");
		assert.strictEqual(oTarget.getModel("i18n"), oModelI18n, "I18n model is copied.");
		assert.strictEqual(oTarget.getModel("parameters"), oModelParameters, "Parameters model is copied.");
	});

	QUnit.module("Is binding info");

	QUnit.test("Correct binding infos", function (assert) {
		// Arrange
		var aSamples = [
			{
				path: "something/something"
			},
			{
				parts: [
					"something/something",
					"something/something"
				],
				formatter: function () {}
			},
			{
				parts: [
					"something/something",
					"something/something"
				],
				binding: {}
			}
		];

		aSamples.forEach(function (oSample) {
			// Assert
			assert.strictEqual(BindingHelper.isBindingInfo(oSample), true, "Object is binding info.");
		});
	});

	QUnit.test("Not binding infos", function (assert) {
		// Arrange
		var aSamples = [
			{},
			{
				test: "test"
			}
		];

		aSamples.forEach(function (oSample) {
			// Assert
			assert.strictEqual(BindingHelper.isBindingInfo(oSample), false, "Object is not a binding info.");
		});
	});

});