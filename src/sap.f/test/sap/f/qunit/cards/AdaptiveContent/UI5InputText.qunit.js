/*global QUnit*/

sap.ui.define([
	"sap/f/cards/AdaptiveContent",
	"sap/f/cards/adaptivecards/elements/UI5InputText",
	"sap/ui/core/Core",
	"sap/ui/thirdparty/jquery"
],
function (
	AdaptiveContent,
	UI5InputText,
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
				"id": "TextInput",
				"type": "Input.Text",
				"maxLength": 40,
				"value": "Some text"
			},
			{
				"type": "Input.Text",
				"id": "TextArea",
				"placeholder": "Comments",
				"isMultiline": true
			},
			{
				"type": "Input.Text",
				"placeholder": "Phone",
				"style": "tel",
				"id": "TelVal",
				"value": "123456789"
			},
			{
				"type": "Input.Text",
				"placeholder": "Homepage",
				"style": "url",
				"maxLength": 0,
				"id": "UrlVal",
				"value": "https://www.google.com"
			},
			{
				"type": "Input.Text",
				"placeholder": "Email",
				"style": "email",
				"id": "EmailVal",
				"value": "123@gmail.com"
			}
		]
	};


	QUnit.module("UI5InputText", {
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

	QUnit.test("type: Text, isMultiline: false", function (assert) {
		//Arrange
		var oTextInput = document.getElementById("TextInput");


		//Assert
		assert.strictEqual(oTextInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
		assert.ok(oTextInput, "The text input is created");
		assert.strictEqual(oTextInput.placeholder, "", "The placeholder is not specified");
		assert.strictEqual(oTextInput.type, "Text", "The input type is text");
		assert.strictEqual(oTextInput.maxlength, 40, "The maximum length is set.");
		assert.strictEqual(oTextInput.value, "Some text", "The initial value is correct");
	});


	QUnit.test("type: Text, isMultiline: true", function (assert) {
		//Arrange
		var oTextArea = document.getElementById("TextArea");

		//Assert
		assert.strictEqual(oTextArea.tagName.toLowerCase(), "ui5-textarea", "ui5-textarea webcomponent is rendered");
		assert.ok(oTextArea, "The text input is created");
		assert.strictEqual(oTextArea.placeholder, "Comments", "The placeholder is mapped correctly");
		assert.strictEqual(oTextArea.maxLength, null, "The maximum length is  not specified.");
		assert.strictEqual(oTextArea.value, "", "There is no value set initially");
	});

	QUnit.test("type: Tel", function (assert) {
		//Arrange
		var oTelInput = document.getElementById("TelVal");

		//Assert
		assert.strictEqual(oTelInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
		assert.ok(oTelInput, "The text input is created");
		assert.strictEqual(oTelInput.placeholder, "Phone", "The placeholder is mapped correctly");
		assert.strictEqual(oTelInput.value, "123456789", "The initial value is correct");
		assert.strictEqual(oTelInput.type, "Tel", "Tel is the type of the input");

	});

	QUnit.test("type: Url", function (assert) {
		//Arrange
		var oUrlInput = document.getElementById("UrlVal");

		//Assert
		assert.strictEqual(oUrlInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
		assert.ok(oUrlInput, "The text input is created");
		assert.strictEqual(oUrlInput.placeholder, "Homepage", "The placeholder is mapped correctly");
		assert.strictEqual(oUrlInput.value, "https://www.google.com", "The initial value is correct");
		assert.strictEqual(oUrlInput.type, "URL", "Url is the type of the input");
	});

	QUnit.test("type: Email", function (assert) {
		//Arrange
		var oUrlInput = document.getElementById("EmailVal");

		//Assert
		assert.strictEqual(oUrlInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
		assert.ok(oUrlInput, "The text input is created");
		assert.strictEqual(oUrlInput.placeholder, "Email", "The placeholder is mapped correctly");
		assert.strictEqual(oUrlInput.value, "123@gmail.com", "The initial value is correct");
		assert.strictEqual(oUrlInput.type, "Email", "Email is the type of the input");
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oTextInput = new UI5InputText(),
			oDomRef = oTextInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
	});
});