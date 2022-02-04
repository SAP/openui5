/*global QUnit*/
sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputDate",
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
				"id": "DateVal",
				"label": "Date",
				"isRequired": true,
				"errorMessage": "Error"
			},
			{
				"type": "Input.Date",
				"id": "DateInputWithPlaceholder",
				"placeholder": "Enter a date",
				"value": "2020-01-01",
				"min": "2017-01-01",
				"max": "2022-01-01"
			}
		]
	};


	QUnit.module("UI5InputDate", {
		beforeEach: function () {
			this.oAdaptiveContent = new AdaptiveContent();
			this.oAdaptiveContent._oCardConfig = oManifest;
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("Properties mapping", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			//Arrange
			var oDateInput = document.querySelector("#DateVal ui5-date-picker");
			var oLabel = document.querySelector("#DateVal ui5-label");
			var oDateInputWithPlaceholder = document.querySelector("#DateInputWithPlaceholder ui5-date-picker");
			var oValueStateMessage = document.querySelector("#DateVal div[slot]");


			//Assert
			assert.strictEqual(oDateInput.tagName.toLowerCase(), "ui5-date-picker", "ui5-date-picker webcomponent is rendered");
			assert.ok(oDateInput, "The date input is created");
			assert.strictEqual(oDateInput.placeholder, undefined, "There is no placeholder");
			assert.strictEqual(oDateInput.value, "", "The is no initial value set");
			assert.strictEqual(oDateInput.formatPattern, "yyyy-MM-dd", "The correct date format is used");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Date", "Label text is correctly mapped");
			assert.ok(oDateInput.required, "required attribute is set");
			assert.strictEqual(oDateInput.getAttribute("accessible-name-ref"), oLabel.id, "accessibleNameRef refers to the id of the label");
			assert.strictEqual(oDateInputWithPlaceholder.value, "2020-01-01", "The value is mapped correctly");
			assert.strictEqual(oDateInputWithPlaceholder.minDate, "2017-01-01", "The minimum date available for selection is correct");
			assert.strictEqual(oDateInputWithPlaceholder.maxDate, "2022-01-01", "The maximum date available for selection is correct");
			assert.notOk(oDateInputWithPlaceholder.required, "required attribute should not be set");
			assert.strictEqual(oValueStateMessage.getAttribute("slot"), "valueStateMessage", "valueStateMessage is rendered");
			assert.strictEqual(oValueStateMessage.innerText, "Error", "valueStateMessage is set correctly");

			done();
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oToggleInput = new UI5InputDate(),
			oDomRef = oToggleInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-date-picker", "ui5-date-picker webcomponent is rendered");
	});
});