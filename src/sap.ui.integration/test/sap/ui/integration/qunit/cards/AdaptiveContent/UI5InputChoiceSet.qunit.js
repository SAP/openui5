/*global QUnit*/

sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputChoiceSet",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
	UI5InputChoiceSet,
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
				"type": "TextBlock",
				"text": "style: compact, isMultiSelect: false"
			},
			{
				"type": "Input.ChoiceSet",
				"id": "CompactSelectValWithValue",
				"label": "Select",
				"isRequired": true,
				"style": "compact",
				"value": "1",
				"choices": [
					{
					"title": "Red",
					"value": "1"
					},
					{
					"title": "Green",
					"value": "2"
					},
					{
					"title": "Blue",
					"value": "3"
					}
				]
			},
			{
				"type": "TextBlock",
				"text": "style: expanded, isMultiSelect: false"
			},
			{
				"type": "Input.ChoiceSet",
				"id": "SingleSelectVal",
				"style": "expanded",
				"label": "Radiobuttons",
				"isRequired": true,
				"wrap": true,
				"value": "2",
				"choices": [
					{
					"title": "Red",
					"value": "1"
					},
					{
					"title": "Green",
					"value": "2"
					},
					{
					"title": "Blue",
					"value": "3"
					}
				]
			},
			{
				"type": "TextBlock",
				"text": "isMultiSelect: true"
			},
			{
				"type": "Input.ChoiceSet",
				"id": "MultiSelectVal",
				"label": "Checkboxes",
				"isRequired": true,
				"isMultiSelect": true,
				"value": "1,3",
				"wrap": true,
				"choices": [
					{
					"title": "Red",
					"value": "1"
					},
					{
					"title": "Green",
					"value": "2"
					},
					{
					"title": "Blue",
					"value": "3"
					}
				]
			}
		]
	};


	QUnit.module("UI5InputChoiseSet", {
		beforeEach: function () {
			this.oAdaptiveContent = new AdaptiveContent();
			this.oAdaptiveContent._oCardConfig = oManifest;
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("style: compact, isMultiSelect: false", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oSelect = document.querySelector("#CompactSelectValWithValue ui5-select"),
				oLabel = document.querySelector("#CompactSelectValWithValue ui5-label"),
				aOptions = oSelect.children,
				oSelectedOption = aOptions[0],
				iCount = oSelect.childElementCount;

			//Assert
			assert.strictEqual(oSelect.tagName.toLowerCase(), "ui5-select", "ui5-select webcomponent is rendered");
			assert.strictEqual(iCount, 3, "There are three choices");
			assert.ok(oSelectedOption.selected, "The correct option is selected");
			assert.strictEqual(oSelectedOption.innerHTML, "Red", "The choice title is mapped correctly");
			assert.strictEqual(oSelectedOption.value, "1", "The choice value is mapped correctly");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Select", "Label text is correctly mapped");
			assert.ok(oSelect.required, "required attribute is set on the ui5-select");
			assert.strictEqual(oSelect.getAttribute("accessible-name-ref"), oLabel.id, "accessibleNameRef refers to the id of the label");

			for (var i = 0; i < aOptions.length; i++) {
				var oOption = aOptions[i];
				assert.strictEqual(oOption.tagName.toLowerCase(), "ui5-option", "ui5-option web component is used for the choices");
			}

			done();
		}.bind(this));
	});

	QUnit.test("style: expanded, isMultiSelect: false", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oRBContainer = document.querySelector("#SingleSelectVal .sapFCardAdaptiveContentChoiceSetWrapper"),
				oLabel = document.querySelector("#SingleSelectVal ui5-label"),
				aRadioButtons = oRBContainer.children,
				aToggleInputs = this.oAdaptiveContent.adaptiveCardInstance._items[3]._toggleInputs,
				oSelectedRB = aRadioButtons[1];

			//Assert
			assert.strictEqual(oRBContainer.tagName.toLowerCase(), "div", "a container is rendered");
			assert.ok(oSelectedRB.checked, "The correct option is selected");
			assert.strictEqual(oSelectedRB.text, "Green", "The choice title is mapped correctly");
			assert.strictEqual(oSelectedRB.value, "2", "The choice value is mapped correctly");
			assert.ok(aToggleInputs.length === aRadioButtons.length, "The options are correctly mapped");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Radiobuttons", "Label text is correctly mapped");
			assert.ok(oRBContainer.getAttribute("aria-required"), "aria-required attribute is set on the wrapper");
			assert.ok(oRBContainer.getAttribute("role"), "radiogroup", "role is set on the wrapper");
			assert.strictEqual(oRBContainer.getAttribute("aria-labelledby"), oLabel.id, "aria-labelledby refers to the id of the label");


			for (var i = 0; i < aRadioButtons.length; i++) {
				var oRB = aRadioButtons[i];
				assert.strictEqual(oRB.tagName.toLowerCase(), "ui5-radio-button", "the container contains only ui5-radio-button web components");
				assert.strictEqual(oRB.wrappingType, "Normal", "The long text should wrap at some point");
			}

			done();
		}.bind(this));
	});

	QUnit.test("isMultiSelect: true", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
			var oCBContainer = document.querySelector("#MultiSelectVal .sapFCardAdaptiveContentChoiceSetWrapper"),
				oLabel = document.querySelector("#MultiSelectVal ui5-label"),
				aCheckBoxs = oCBContainer.children,
				aToggleInputs = this.oAdaptiveContent.adaptiveCardInstance._items[5]._toggleInputs,
				oFirstCheckedCB = aCheckBoxs[0],
				oSecondCheckedCB = aCheckBoxs[2];

			//Assert
			assert.strictEqual(oCBContainer.tagName.toLowerCase(), "div", "a container is rendered");
			assert.ok(aToggleInputs.length === aCheckBoxs.length, "The options are correctly mapped");
			assert.ok(oFirstCheckedCB.checked && oSecondCheckedCB.checked, "The correct options are checked");
			assert.notOk(aCheckBoxs[1].checked, "The second option is not checked");
			assert.strictEqual(oFirstCheckedCB.text, "Red", "The choice title is mapped correctly");
			assert.strictEqual(oFirstCheckedCB.value, "1", "The choice value is mapped correctly");
			assert.strictEqual(oSecondCheckedCB.text, "Blue", "The choice title is mapped correctly");
			assert.strictEqual(oSecondCheckedCB.value, "3", "The choice value is mapped correctly");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Checkboxes", "Label text is correctly mapped");
			assert.ok(oCBContainer.getAttribute("aria-describedby"), "aria-describedby attribute is set on the wrapper");
			assert.ok(oCBContainer.getAttribute("role"), "group", "role is set on the wrapper");
			assert.strictEqual(oCBContainer.getAttribute("aria-labelledby"), oLabel.id, "aria-labelledby refers to the id of the label");

			for (var i = 0; i < aCheckBoxs.length; i++) {
				var oCB = aCheckBoxs[i];
				assert.strictEqual(oCB.tagName.toLowerCase(), "ui5-checkbox", "the container contains only ui5-checkbox web components");
				assert.strictEqual(oCB.wrappingType, "Normal", "The long text should wrap at some point");
			}

			done();
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oChoiceSet = new UI5InputChoiceSet(),
			oDomRef = oChoiceSet.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-select", "container is rendered");
	});
});