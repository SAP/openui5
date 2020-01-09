/*global QUnit*/

sap.ui.define([
	"sap/f/cards/AdaptiveContent",
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
				"title": "Action.Submit"
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
			}
		]
	};


	QUnit.module("ActionRender", {
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

	QUnit.test("ui5-button should be rendered", function (assert) {
		//Arrange
		var aButtons = document.getElementsByClassName("ac-pushButton"),
			oSubmitAction = aButtons[0],
			oShowCardAction = aButtons[1];

		//Assert
		assert.strictEqual(aButtons.length, 2, "Two buttons have to be rendered");

		for (var i = 0; i < aButtons.length; i++) {
			assert.strictEqual(aButtons[i].tagName.toLowerCase(), "ui5-button", "ui5-button webcomponent has to be rendered for an action button");
		}

		assert.strictEqual(oSubmitAction.getAttribute('aria-label'), 'Action.Submit', "Button for submit action");
		assert.strictEqual(oShowCardAction.getAttribute('aria-label'), 'Action.ShowCard', "Button for show card action");
	});
});
