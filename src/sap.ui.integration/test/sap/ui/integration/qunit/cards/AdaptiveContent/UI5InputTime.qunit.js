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

	var iTimeoutLength = 750;

	var ValueState = {
		None: "None",
		Error: "Error"
	};

	function fireChangeEvent(oDomRef) {
		var oEvent = new Event("change");
		oDomRef.dispatchEvent(oEvent);
	}

	var oManifest = {
		"$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
		"type": "AdaptiveCard",
		"version": "1.0",
		"body": [
			{
				"type": "Input.Time",
				"id": "TimeVal"
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
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oTimeInput = document.getElementById("TimeVal");
			var oTimeInputWithMinMaxValues = document.getElementById("TimeInputWithMinMaxValues");

			//Assert
			assert.strictEqual(oTimeInput.tagName.toLowerCase(), "ui5-timepicker", "ui5-timepicker webcomponent is rendered");
			assert.ok(oTimeInput, "The time input is created");
			assert.strictEqual(oTimeInput.value, "", "There is no initial value set");
			assert.strictEqual(oTimeInput.formatPattern, "HH:mm", "The formatPattern should be HH:mm");
			assert.strictEqual(oTimeInputWithMinMaxValues.value, "15:30", "The value is mapped correctly");

			setTimeout(function () {
				assert.strictEqual(oTimeInput.valueState, ValueState.None, "We don't show error when the initial value is empty string");

				done();
			}, iTimeoutLength);
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oToggleInput = new UI5InputTime(),
			oDomRef = oToggleInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-timepicker", "ui5-timepicker webcomponent is rendered");
	});


	QUnit.module("Validations - Min and Max properties", {
		beforeEach: function () {
			this.oAdaptiveContent = new AdaptiveContent();
			this.oAdaptiveContent._oCardConfig = oManifest;
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("Min value validation", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			setTimeout(function() {
				//Arrange
				var oTimeInputWithMinMaxValues = document.getElementById("TimeInputWithMinMaxValues");

				//Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value bigger than min value should be valid and value state should be None.");
				// Act
				oTimeInputWithMinMaxValues.value = "11:00";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.Error, "The value should be invalid when it is less than min property and value state should be Error.");

				// Act
				oTimeInputWithMinMaxValues.value = "12:00";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value should be valid when it is equal to min property and value state should be None.");

				done();
			}, iTimeoutLength);
		}.bind(this));
	});

	QUnit.test("Max value validation", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			setTimeout(function () {
				//Arrange
				var oTimeInputWithMinMaxValues = document.getElementById("TimeInputWithMinMaxValues");

				//Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value less than max value should be valid and value state should be None.");

				// Act
				oTimeInputWithMinMaxValues.value = "18:00";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.Error, "The value should be invalid when it is bigger than max property and value state should be Error.");

				// Act
				oTimeInputWithMinMaxValues.value = "17:00";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value should be valid when it is equal to max property and value state should be None.");

				done();
			}, iTimeoutLength);
		}.bind(this));
	});

	QUnit.test("Check if the value is valid time in HH:mm format", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			setTimeout(function () {
				//Arrange
				var oTimeInputWithMinMaxValues = document.getElementById("TimeInputWithMinMaxValues");

				//Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value is valid and value state should be None.");

				// Act
				oTimeInputWithMinMaxValues.value = "ssss";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.Error, "The value is not valid and value state should be Error.");

				// Act
				oTimeInputWithMinMaxValues.value = "";
				fireChangeEvent(oTimeInputWithMinMaxValues);

				// Assert
				assert.strictEqual(oTimeInputWithMinMaxValues.valueState, ValueState.None, "The value should be valid when it is empty string and value state should be None.");

				done();
			}, iTimeoutLength);
		}.bind(this));
	});

	QUnit.test("Check if the min value is bigger than max value", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			setTimeout(function () {
				//Arrange
				var TimeInputWithWrongMinMaxValues = document.getElementById("TimeInputWithWrongMinMaxValues");

				// Assert
				assert.strictEqual(TimeInputWithWrongMinMaxValues.valueState, ValueState.Error, "The min value is bigger than max value and value state should be Error.");

				done();
			}, iTimeoutLength);
		}.bind(this));
	});
});