/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/integration/util/BindingHelper"
],
function (
	BindingHelper
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

	QUnit.module("Static method #formattedProperty'");

	QUnit.test("Call #formattedProperty with 'string'", function (assert) {
		// arrange
		var sValue = "this is some text",
			fnFormatter = function (sValue) {
				return sValue.toUpperCase();
			},
			vFormattedValue = BindingHelper.formattedProperty(sValue, fnFormatter);

		// assert
		assert.strictEqual(vFormattedValue, sValue.toUpperCase(), "Should have properly formatted the value if it is plain string.");
	});

	QUnit.test("Call #formattedProperty with binding info 'object'", function (assert) {
		// arrange
		var oValue = BindingHelper.createBindingInfos("{bindingSyntax}"),
			fnFormatter = function (sValue) {
				return sValue.toUpperCase();
			},
			vFormattedValue = BindingHelper.formattedProperty(oValue, fnFormatter);

		// assert
		assert.notStrictEqual(vFormattedValue, oValue, "Should return new object - binding info.");
		assert.ok(vFormattedValue.hasOwnProperty("formatter"), "The new binding info should have attached formatter.");
		assert.strictEqual(vFormattedValue.formatter, fnFormatter,"The formatter should be the passed formatter.");
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
			vFormattedValue = BindingHelper.formattedProperty(aParts, fnFormatter);
		// assert
		assert.strictEqual(typeof vFormattedValue, "object", "Should return new object - binding info.");
		assert.ok(vFormattedValue.hasOwnProperty("parts"), "The new binding info should have 'parts'.");
		assert.deepEqual(aParts[0], vFormattedValue.parts[0], "Objects in the new binding info 'parts' should be as given.");
		assert.deepEqual(typeof vFormattedValue.parts[0], "object", "Strings in the new binding info 'parts' should be returned as objects.");
		assert.ok(vFormattedValue.hasOwnProperty("formatter"), "The new binding info should have attached formatter.");
		assert.strictEqual(vFormattedValue.formatter, fnFormatter,"The formatter should be the passed formatter.");
		assert.strictEqual(vFormattedValue.parts[1].value, "second text with no binding", "Plain strings should return always with key 'value' and value the string itself.");
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
		var vFormattedValue = BindingHelper.formattedProperty(oValue, fnFormatter);

		//Act
		var formattedProperty = fnFormatter(fnOtherFormatter(oValue.path));
		var bindingHelperFormattedProperty = vFormattedValue.formatter(oValue.path);

		// assert
		assert.strictEqual(formattedProperty, bindingHelperFormattedProperty,"The formatter should be the passed formatter.");
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
			]
		};

		// act
		BindingHelper.prependRelativePaths(oBindingInfo, "/root");

		// assert
		assert.strictEqual(oSpy.callCount, 3, "The binding info and all 'parts' inside it should be processed.");

		// clean up
		oSpy.restore();
	});

});