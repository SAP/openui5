/* global QUnit */

sap.ui.define([
	"sap/ui/integration/cards/Footer",
	"sap/ui/integration/widgets/Card",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Footer,
	Card,
	nextCardReadyEvent
) {
	"use strict";

	QUnit.module("Footer", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oFooter = new Footer({
				card: this.oCard
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oFooter.destroy();
		}
	});

	QUnit.test("#_hasBinding when there is no binding", function (assert) {
		// Arrange
		this.oFooter.setConfiguration({
			actionsStrip: [
				{
					text: "Text without binding"
				}
			]
		});

		// Assert
		assert.notOk(this.oFooter._hasBinding(), "Check for bindings should be negative");
	});

	QUnit.test("#_hasBinding when there is binding", function (assert) {
		// Arrange
		this.oFooter.setConfiguration({
			actionsStrip: [
				{
					text: "{someBindingPath}"
				}
			]
		});

		// Assert
		assert.ok(this.oFooter._hasBinding(), "Check for bindings should be positive");
	});

	QUnit.module("Footer actions strip", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Create actions strip with template", async function (assert) {
		const oManifest = {
			"sap.card": {
				"type": "List",
				"data": {
					"json": {
						"actions": [{
							"text": "Action 1"
						}, {
							"text": "Action 2"
						}]
					}
				},
				"content": {
					"item": {}
				},
				"footer": {
					"actionsStrip": {
						"item": {
							"template": {
								"text": "{text}"
							},
							"path": "actions"
						}
					}
				}
			}
		};

		this.oCard.setManifest(oManifest);
		this.oCard.startManifestProcessing();

		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getCardFooter().getActionsStrip(),
			aItems = oActionsStrip._getToolbar().getContent();

		assert.strictEqual(aItems[1].getText(), "Action 1", "Action text is correct");
		assert.strictEqual(aItems[2].getText(), "Action 2", "Action text is correct");
	});
});