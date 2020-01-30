/*global QUnit */

sap.ui.define([
	"sap/f/cards/BindingHelper"
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
		assert.strictEqual(BindingHelper.createBindingInfos(true), true, "Should preserve value if it doesn't contain binding.");
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
		assert.deepEqual(aParts, vFormattedValue.parts, "The new binding info 'parts' should be as given.");
		assert.ok(vFormattedValue.hasOwnProperty("formatter"), "The new binding info should have attached formatter.");
		assert.strictEqual(vFormattedValue.formatter, fnFormatter,"The formatter should be the passed formatter.");
		assert.strictEqual(vFormattedValue.parts[1], "second text with no binding", "Plain strings should NOT generate something different than string.");
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
});