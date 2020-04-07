/*global QUnit*/

sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputChoiceSet",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
],
function (
	AdaptiveContent,
	UI5InputChoiceSet,
	Core,
	jQuery
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
				"type": "Input.ChoiceSet",
				"id": "CompactSelectValWithPlaceholder",
				"style": "compact",
				"placeholder": "Enter a value",
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
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("style: compact, isMultiSelect: false", function (assert) {
		//Arrange
		var oSelect = document.getElementById("CompactSelectValWithValue"),
			oSelect1 = document.getElementById("CompactSelectValWithPlaceholder"),
			oPlaceholder = oSelect1.firstChild,
			aOptions = oSelect.children,
			oSelectedOption = aOptions[1],
			iCount = oSelect.childElementCount;

		//Assert
		assert.strictEqual(oSelect.tagName.toLowerCase(), "ui5-select", "ui5-select webcomponent is rendered");
		assert.ok(oSelect.hasAttribute("ac-select"), "ac-select attribute is set");
		//There is always one more option, since the first one is used for placeholder or to simulate an empty value.
		assert.strictEqual(iCount, 4, "There are three choices");
		assert.strictEqual(oSelect.firstChild.textContent, "", "The first choice is empty and is used for placeholder");
		assert.ok(oSelectedOption.selected, "The correct option is selected");
		assert.strictEqual(oSelectedOption.innerHTML, "Red", "The choice title is mapped correctly");
		assert.strictEqual(oSelectedOption.value, "1", "The choice value is mapped correctly");
		assert.strictEqual(oPlaceholder.tagName.toLowerCase(), "ui5-option", "the placeholder is rendered as ui5-option web component");
		assert.strictEqual(oPlaceholder.textContent, "Enter a value", "the placeholder is not set initially, so an option with empty value is rendered");

		for (var i = 0; i < aOptions.length; i++) {
			var oOption = aOptions[i];
			assert.strictEqual(oOption.tagName.toLowerCase(), "ui5-option", "ui5-option web component is used for the choices");
		}
	});

	QUnit.test("style: expanded, isMultiSelect: false", function (assert) {
		//Arrange
		var oRBContainer = document.getElementById("SingleSelectVal"),
			aRadioButtons = oRBContainer.children,
			aToggleInputs = this.oAdaptiveContent.adaptiveCardInstance._items[4]._toggleInputs,
			oSelectedRB = aRadioButtons[1];

		//Assert
		assert.strictEqual(oRBContainer.tagName.toLowerCase(), "div", "a container is rendered");
		assert.ok(oSelectedRB.selected, "The correct option is selected");
		assert.strictEqual(oSelectedRB.text, "Green", "The choice title is mapped correctly");
		assert.strictEqual(oSelectedRB.value, "2", "The choice value is mapped correctly");
		assert.ok(aToggleInputs.length === aRadioButtons.length, "The options are correctly mapped");


		for (var i = 0; i < aRadioButtons.length; i++) {
			var oRB = aRadioButtons[i];
			assert.strictEqual(oRB.tagName.toLowerCase(), "ui5-radiobutton", "the container contains only ui5-radiobutton web components");
			assert.ok(oRB.wrap, "The long text should wrap at some point");

		}
	});

	QUnit.test("isMultiSelect: true", function (assert) {
		//Arrange
		var oCBContainer = document.getElementById("MultiSelectVal"),
			aCheckBoxs = oCBContainer.children,
			aToggleInputs = this.oAdaptiveContent.adaptiveCardInstance._items[6]._toggleInputs,
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

		for (var i = 0; i < aCheckBoxs.length; i++) {
			var oCB = aCheckBoxs[i];
			assert.strictEqual(oCB.tagName.toLowerCase(), "ui5-checkbox", "the container contains only ui5-checkbox web components");
			assert.ok(oCB.wrap, "The long text should wrap at some point");
		}
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oChoiceSet = new UI5InputChoiceSet(),
			oDomRef = oChoiceSet.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "div", "container is rendered");
	});
});