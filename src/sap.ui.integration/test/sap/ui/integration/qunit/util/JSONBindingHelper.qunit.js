/*global QUnit */

sap.ui.define([
	"sap/ui/integration/util/JSONBindingHelper",
	"sap/ui/base/ManagedObject",
	"sap/ui/model/json/JSONModel"
],
function (
	JSONBindingHelper,
	ManagedObject,
	JSONModel
) {
	"use strict";

	var TestObject = ManagedObject.extend("sap.ui.integration.qunit.util.JSONBindingHelper.TestObject", {
		metadata: {
			properties: {
				"testJson": {
					"type": "string"
				}
			}
		}
	});

	QUnit.module("Static method #createJsonWithBindingInfos");

	QUnit.test("Call #createJsonWithBindingInfos without binding", function (assert) {
		var aSamples = [
			{},
			{"property": "string"},
			{"property": 1},
			{"property": 0},
			{"property": false},
			{"property": true},
			{"property": null},
			{"property": {}},
			{"property": []},
			{
				"property": {
					"nextLevel": "something"
				}
			},
			{
				"property": [
					"test1",
					"test2"
				]
			},
			{
				"property": [
					{"property": "string"},
					{"property": "string"}
				]
			}
		];

		aSamples.forEach(function (oSample, iIndex) {
			var oTestObject = new TestObject({
					"testJson": JSONBindingHelper.createJsonWithBindingInfos(oSample)
				}),
				sResult = oTestObject.getTestJson(),
				oParsedResult = JSON.parse(sResult);

			assert.deepEqual(oParsedResult, oSample, "The result is as expected for sample '" + iIndex + "'.");
		});
	});

	QUnit.test("Call #createJsonWithBindingInfos with binding", function (assert) {
		var aSamples = [
				[
					{"property": "{model>/value1}"}, // input
					{"property": "value1"} // expected output
				],
				[
					{"property": "{model>/value1} {model>/value2}"},
					{"property": "value1 value2"}
				],
				[
					{"property": "{= ${model>/value1} + ${model>/value2}}"},
					{"property": "value1value2"}
				],
				[
					{"property": "static string {model>/value1}"},
					{"property": "static string value1"}
				],
				[
					{"property": "{model>/value1} \\{escaped \\{brackets\\}\\}"},
					{"property": "value1 {escaped {brackets}}"}
				],
				[
					{"property": "symbols and expression \\{\\}\\?:!@#$%^&*()[]|/.,_=+-~`\"' {= !${model>/value1} ? '' : ${model>/value1} + '-' + ${model>/value2}}"},
					{"property": "symbols and expression {}\\?:!@#$%^&*()[]|/.,_=+-~`\"' value1-value2"}
				]
			],
			oModel = new JSONModel({
				"value1": "value1",
				"value2": "value2"
			});

		aSamples.forEach(function (aSample, iIndex) {
			var oInput = aSample[0],
				oExpectedOutput = aSample[1],
				oTestObject = new TestObject({
					"testJson": JSONBindingHelper.createJsonWithBindingInfos(oInput)
				}),
				sResult,
				oParsedResult;

			oTestObject.setModel(oModel, "model");
			oTestObject.bindObject("/");

			sResult = oTestObject.getTestJson();
			oParsedResult = JSON.parse(sResult);

			assert.deepEqual(oParsedResult, oExpectedOutput, "The result is as expected for sample '" + iIndex + "'.");
		});
	});

});