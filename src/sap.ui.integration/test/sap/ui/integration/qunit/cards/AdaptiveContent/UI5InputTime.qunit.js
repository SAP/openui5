/*global QUnit */
sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputTime",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
	UI5InputTime,
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
				"type": "Input.Time",
				"id": "TimeVal",
				"label": "Time",
				"isRequired": true,
				"errorMessage": "Error"
			},
			{
				"type": "Input.Time",
				"id": "TimeInputWithMinMaxValues",
				"value": "15:30",
				"min": "12:00",
				"max": "17:00"
			},
			{
				"type": "Input.Time",
				"id": "TimeInputWithWrongMinMaxValues",
				"value": "12:30",
				"min": "13:00",
				"max": "12:00"
			}
		]
	};


	QUnit.module("UI5InputTime", {
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
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oTimeInput = document.querySelector("#TimeVal ui5-time-picker");
			var oLabel = document.querySelector("#TimeVal ui5-label");
			var oTimeInputWithMinMaxValues = document.querySelector("#TimeInputWithMinMaxValues ui5-time-picker");
			var oValueStateMessage = document.querySelector("#TimeVal div[slot]");

			//Assert
			assert.strictEqual(oTimeInput.tagName.toLowerCase(), "ui5-time-picker", "ui5-time-picker webcomponent is rendered");
			assert.ok(oTimeInput, "The time input is created");
			assert.strictEqual(oTimeInput.value, "", "There is no initial value set");
			assert.strictEqual(oTimeInput.formatPattern, "HH:mm", "The formatPattern should be HH:mm");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Time", "Label text is correctly mapped");
			assert.ok(oTimeInput.required, "required attribute is set");
			assert.strictEqual(oTimeInput.getAttribute("aria-labelledby"), oLabel.id, "aria-labelledby refers to the id of the label");
			assert.strictEqual(oTimeInputWithMinMaxValues.value, "15:30", "The value is mapped correctly");
			assert.notOk(oTimeInputWithMinMaxValues.required, "required attribute should not be set");
			assert.strictEqual(oValueStateMessage.getAttribute("slot"), "valueStateMessage", "valueStateMessage is rendered");
			assert.strictEqual(oValueStateMessage.innerText, "Error", "valueStateMessage is set correctly");

			done();
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oToggleInput = new UI5InputTime(),
			oDomRef = oToggleInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-time-picker", "ui5-time-picker webcomponent is rendered");
	});
});