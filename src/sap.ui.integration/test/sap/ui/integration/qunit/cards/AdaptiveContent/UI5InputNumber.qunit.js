/*global QUnit*/

sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputNumber",
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
				"value": 1,
				"label": "Number",
				"isRequired": true,
				"errorMessage": "Error",
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
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("type: Number", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oNumberInput = document.querySelector("#WithValue ui5-step-input");
			var oLabel = document.querySelector("#WithValue ui5-label");
			var oNumInputWithoutValue = document.querySelector("#ValueNotSpecified ui5-step-input");
			var oValueStateMessage = document.querySelector("#WithValue div[slot]");


			//Assert
			assert.strictEqual(oNumberInput.tagName.toLowerCase(), "ui5-step-input", "ui5-step-input webcomponent is rendered");
			assert.ok(oNumberInput, "The number input is created");
			assert.strictEqual(oNumberInput.placeholder, "", "The placeholder is not specified");
			assert.strictEqual(oNumberInput.value, 1, "The initial value is correct");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Number", "Label text is correctly mapped");
			assert.ok(oNumberInput.required, "required attribute is set on the ui5-select");
			assert.strictEqual(oNumberInput.getAttribute("accessible-name-ref"), oLabel.id, "accessibleNameRef refers to the id of the label");
			assert.strictEqual(oNumInputWithoutValue.getAttribute("value"), null, "There is no initial value set.");
			assert.strictEqual(oNumInputWithoutValue.placeholder, "Quantity", "The placeholder is correct.");
			assert.strictEqual(oValueStateMessage.getAttribute("slot"), "valueStateMessage", "valueStateMessage is rendered");
			assert.strictEqual(oValueStateMessage.innerText, "Error", "valueStateMessage is set correctly");

			done();
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oNumberInput = new UI5InputNumber(),
			oDomRef = oNumberInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-step-input", "ui5-step-input webcomponent is rendered");
	});
});