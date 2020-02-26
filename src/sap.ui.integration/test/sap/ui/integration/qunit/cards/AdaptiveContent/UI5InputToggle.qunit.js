/*global QUnit*/
sap.ui.define([
	"sap/f/cards/AdaptiveContent",
	"sap/f/cards/adaptivecards/elements/UI5InputToggle",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
	UI5InputToggle,
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
				"type": "Input.Toggle",
				"title": "Unchecked toggle input with value 'Truethy value' when checked and 'Falsy value' when not",
				"id": "ValueOffValueOn",
				"value": "true",
				"valueOff": "Falsy value",
				"valueOn": "Truthy value"
			},
			{
				"type": "Input.Toggle",
				"id": "Checked",
				"wrap": true,
				"value": "true",
				"valueOn": "true"
			}
		]
	};


	QUnit.module("UI5InputToggle", {
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

	QUnit.test("Properties mapping", function (assert) {
		//Arrange
		var oUncheckedToggleInput = document.getElementById("ValueOffValueOn"),
			oCheckedToggleInput = document.getElementById("Checked");

		//Assert
		assert.strictEqual(oUncheckedToggleInput.tagName.toLowerCase(), "ui5-checkbox", "ui5-checkbox webcomponent is rendered");
		assert.ok(oUncheckedToggleInput, "The toggle input is created");
		assert.strictEqual(oUncheckedToggleInput.text, "Unchecked toggle input with value 'Truethy value' when checked and 'Falsy value' when not", "The title is mapped correctly");
		assert.strictEqual(oUncheckedToggleInput.checked, false, "The checkbox is not checked, since value is different from valueOn.");
		assert.strictEqual(oUncheckedToggleInput.wrap, false, "Wrapping is not set initally, so the text should truncate at some point.");
		assert.strictEqual(oCheckedToggleInput.wrap, true, "The checkbox label should wrap at some point.");
		assert.strictEqual(oCheckedToggleInput.checked, true, "The checkbox is not checked, since value is the same as valueOn.");
		assert.strictEqual(oCheckedToggleInput.text, "", "There is no text set initially.");
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oToggleInput = new UI5InputToggle(),
			oDomRef = oToggleInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-checkbox", "ui5-checkbox webcomponent is rendered");
	});
});