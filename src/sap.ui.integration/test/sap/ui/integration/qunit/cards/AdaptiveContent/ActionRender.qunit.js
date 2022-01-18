/*global QUnit*/

sap.ui.define([
	"sap/ui/integration/cards/AdaptiveContent",
	"sap/ui/core/Core"
],
function (
	AdaptiveContent,
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
				"id": "TextInput",
				"type": "Input.Text",
				"maxLength": 40,
				"value": "Some text"
			}
		],
		"actions": [
			{
				"type": "Action.Submit",
				"title": "Action.Submit",
				"style": "positive"
			},
			{
				"type": "Action.ShowCard",
				"title": "Action.ShowCard",
				"card": {
					"type": "AdaptiveCard",
					"body": [
						{
							"type": "Input.Date",
							"id": "dueDate"
						}
					],
					"actions": [
						{
						"type": "Action.Submit",
						"title": "OK"
						}
					]
				}
			},
			{
				"type": "Action.Submit",
				"title": "Negative Action",
				"style": "destructive"
			}
		]
	};


	QUnit.module("ActionRender", {
		beforeEach: function () {
			this.oAdaptiveContent = new AdaptiveContent();
			this.oAdaptiveContent._oCardConfig = oManifest;
		},
		afterEach: function () {
			this.oAdaptiveContent.destroy();
			this.oAdaptiveContent = null;
		}
	});

	QUnit.test("ui5-button should be rendered", function (assert) {
		//Arrange
		var done = assert.async(),
			oCardManifestStub = {
				get: function () { return false; }
			};

		this.oAdaptiveContent.loadDependencies(oCardManifestStub).then(function () {
			this.oAdaptiveContent.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			var aButtons = document.getElementsByClassName("ac-pushButton"),
				oSubmitAction = aButtons[0],
				oShowCardAction = aButtons[1],
				oNegativeAction = aButtons[2];

			//Assert
			assert.strictEqual(aButtons.length, 3, "Three buttons have to be rendered");

			for (var i = 0; i < aButtons.length; i++) {
				assert.strictEqual(aButtons[i].tagName.toLowerCase(), "ui5-button", "ui5-button webcomponent has to be rendered for an action button");
			}

			assert.strictEqual(oSubmitAction.getAttribute('aria-label'), 'Action.Submit', "Button for submit action");
			assert.strictEqual(oShowCardAction.getAttribute('aria-label'), 'Action.ShowCard', "Button for show card action");

			// Style property assertions
			assert.strictEqual(oShowCardAction.getAttribute('design'), null, "Action with style 'default' correctly mapped to ui5-button with design 'Default'");
			assert.strictEqual(oSubmitAction.getAttribute('design'), 'Positive', "Action with style 'positive' correctly mapped to ui5-button with design 'Positive'");
			assert.strictEqual(oNegativeAction.getAttribute('design'), 'Negative', "Action with style 'destructive' correctly mapped to ui5-button with design 'Negative'");
			done();
		}.bind(this));
	});
});
