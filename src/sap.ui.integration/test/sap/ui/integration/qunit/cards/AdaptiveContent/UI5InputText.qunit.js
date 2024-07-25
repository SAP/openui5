/*global QUnit*/

sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/integration/cards/adaptivecards/elements/UI5InputText",
	"sap/ui/qunit/utils/nextUIUpdate"
],
function (
	AdaptiveContent,
	UI5InputText,
	nextUIUpdate
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
				"label": "Text",
				"isRequired": true,
				"errorMessage": "Error",
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
			this.oAdaptiveContent = new AdaptiveContent({
				configuration: oManifest
			});
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("type: Text, isMultiline: false", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(async function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			var oTextInput = document.querySelector("#TextInput ui5-input");
			var oLabel = document.querySelector("#TextInput ui5-label");
			var oValueStateMessage = document.querySelector("#TextInput div[slot]");

			//Assert
			assert.strictEqual(oTextInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
			assert.ok(oTextInput, "The text input is created");
			assert.strictEqual(oTextInput.placeholder, "", "The placeholder is not specified");
			assert.strictEqual(oTextInput.type, "Text", "The input type is text");
			assert.strictEqual(oTextInput.maxlength, 40, "The maximum length is set.");
			assert.strictEqual(oTextInput.value, "Some text", "The initial value is correct");
			assert.strictEqual(oLabel.tagName.toLowerCase(), "ui5-label", "ui5-label webcomponent is rendered");
			assert.strictEqual(oLabel.textContent, "Text", "Label text is correctly mapped");
			assert.ok(oTextInput.required, "required attribute is set");
			assert.strictEqual(oTextInput.getAttribute("accessible-name-ref"), oLabel.id, "accessibleNameRef refers to the id of the label");
			assert.strictEqual(oValueStateMessage.getAttribute("slot"), "valueStateMessage", "valueStateMessage is rendered");
			assert.strictEqual(oValueStateMessage.innerText, "Error", "valueStateMessage is set correctly");

			done();
		}.bind(this));
	});


	QUnit.test("type: Text, isMultiline: true", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(async function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			var oTextArea = document.querySelector("#TextArea ui5-textarea");

			//Assert
			assert.strictEqual(oTextArea.tagName.toLowerCase(), "ui5-textarea", "ui5-textarea webcomponent is rendered");
			assert.ok(oTextArea, "The text input is created");
			assert.strictEqual(oTextArea.placeholder, "Comments", "The placeholder is mapped correctly");
			assert.notOk(oTextArea.maxlength, "The maximum length is  not specified.");
			assert.strictEqual(oTextArea.value, "", "There is no value set initially");
			assert.notOk(oTextArea.required, "required attribute should not be set");

			done();
		}.bind(this));
	});

	QUnit.test("type: Tel", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(async function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			var oTelInput = document.querySelector("#TelVal ui5-input");

			//Assert
			assert.strictEqual(oTelInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
			assert.ok(oTelInput, "The text input is created");
			assert.strictEqual(oTelInput.placeholder, "Phone", "The placeholder is mapped correctly");
			assert.strictEqual(oTelInput.value, "123456789", "The initial value is correct");
			assert.strictEqual(oTelInput.type, "Tel", "Tel is the type of the input");

			done();
		}.bind(this));
	});

	QUnit.test("type: Url", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(async function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			var oUrlInput = document.querySelector("#UrlVal ui5-input");

			//Assert
			assert.strictEqual(oUrlInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
			assert.ok(oUrlInput, "The text input is created");
			assert.strictEqual(oUrlInput.placeholder, "Homepage", "The placeholder is mapped correctly");
			assert.strictEqual(oUrlInput.value, "https://www.google.com", "The initial value is correct");
			assert.strictEqual(oUrlInput.type, "URL", "Url is the type of the input");

			done();
		}.bind(this));
	});

	QUnit.test("type: Email", function (assert) {
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(async function () {
			//Arrange
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
			var oUrlInput = document.querySelector("#EmailVal ui5-input");

			//Assert
			assert.strictEqual(oUrlInput.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
			assert.ok(oUrlInput, "The text input is created");
			assert.strictEqual(oUrlInput.placeholder, "Email", "The placeholder is mapped correctly");
			assert.strictEqual(oUrlInput.value, "123@gmail.com", "The initial value is correct");
			assert.strictEqual(oUrlInput.type, "Email", "Email is the type of the input");

			done();
		}.bind(this));
	});

	QUnit.test("internalRender", function (assert) {
		//Arrange
		var oTextInput = new UI5InputText(),
			oDomRef = oTextInput.internalRender();

		//Assert
		assert.strictEqual(oDomRef.tagName.toLowerCase(), "ui5-input", "ui5-input webcomponent is rendered");
	});
});