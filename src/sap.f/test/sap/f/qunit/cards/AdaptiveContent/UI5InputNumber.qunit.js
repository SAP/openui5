/*global QUnit*/

sap.ui.define([
	"sap/f/cards/AdaptiveContent",
	"sap/f/cards/adaptivecards/elements/UI5InputNumber",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
	UI5InputNumber,
	Core
) {
	"use strict";
	var DOM_RENDER_LOCATION = "qunit-fixture";

	var oManifest = {
		"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
		"type": "AdaptiveCard",
		"version": "1.0",
		"body": [
			{
				"type": "Input.Number",
				"min": -5,
				"max": 5,
				"value": "1",
				"id": "WithValue"
			},
			{
				"type": "Input.Number",
				"placeholder": "Quantity",
				"id": "ValueNotSpecified"
			}
		]
	};

	QUnit.module("UI5InputNumber", {
		beforeEach: function () {
			this.oAdaptiveContent = new AdaptiveContent();
			this.oAdaptiveContent._oCardConfig = oManifest;
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("type: Number", function (assert) {
		//Arrange
		var oNumberInput = document.getElementById("WithValue");
		var oNumInputWithoutValue = document.getElementById("ValueNotSpecified");


		//Assert
		assert.strictEqual(oNumberInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
		assert.ok(oNumberInput, "The number input is created");
		assert.strictEqual(oNumberInput.placeholder, "", "The placeholder is not specified");
		assert.strictEqual(oNumberInput.type, "Number", "The input type is number");
		assert.strictEqual(oNumberInput.value, "1", "The initial value is correct");
		assert.strictEqual(oNumInputWithoutValue.value, "", "There is no initial value set.");
		assert.strictEqual(oNumInputWithoutValue.placeholder, "Quantity", "The placeholder is correct.");
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oNumberInput = new UI5InputNumber(),
			oDomRef = oNumberInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
	});
});