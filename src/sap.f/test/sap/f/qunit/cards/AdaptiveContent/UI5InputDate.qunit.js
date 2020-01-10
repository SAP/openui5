/*global QUnit*/
sap.ui.define([
	"sap/f/cards/AdaptiveContent",
	"sap/f/cards/adaptivecards/elements/UI5InputDate",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
	UI5InputDate,
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
				"type": "Input.Date",
				"id": "DateVal"
			},
			{
				"type": "Input.Date",
				"id": "DateInputWithPlaceholder",
				"placeholder": "Enter a date",
				"value": "2020-01-01"
			}
		]
	};


	QUnit.module("UI5InputDate", {
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
		var oDateInput = document.getElementById("DateVal");
		var oDateInputWithPlaceholder = document.getElementById("DateInputWithPlaceholder");

		//Assert
		assert.strictEqual(oDateInput.tagName.toLowerCase(), "ui5-datepicker", "ui5-datepicker webcomponent is rendered");
		assert.ok(oDateInput, "The date input is created");
		assert.strictEqual(oDateInput.placeholder, undefined, "There is no placeholder");
		assert.strictEqual(oDateInput.value, "", "The is no initial value set");
		assert.strictEqual(oDateInput.formatPattern, "yyyy-MM-dd", "The correct date format is used");
		assert.strictEqual(oDateInputWithPlaceholder.value, "2020-01-01", "The value is mapped correctly");
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oToggleInput = new UI5InputDate(),
			oDomRef = oToggleInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-datepicker", "ui5-datepicker webcomponent is rendered");
	});
});