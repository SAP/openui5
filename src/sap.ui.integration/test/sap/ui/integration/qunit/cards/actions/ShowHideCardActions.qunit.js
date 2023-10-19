/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/widgets/Card"
], function (
	Core,
	Card
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";

	const oBiteManifestWithUrl = {
		"sap.app": {
			"id": "card.explorer.sample.bitetosnacUrlmanifestk.bite",
			"type": "card"
		},
		"sap.ui": {
			"technology": "UI5",
			"icons": {
				"icon": "sap-icon://switch-classes"
			}
		},
		"sap.card": {
			"type": "Object",
			"configuration": {
				"parameters": {
					"test": {
						"value": "test"
					}
				}
			},
			"data": {
				"json": {
					"info": {
						"firstName": "Donna",
						"email": "mail@mycompany.com"
					}
				}
			},
			"header": {
				"title": "Some Title"
			},
			"content": {
				"groups": [{
					"items": [{
						"value": "Lorem ipsum dolor sit."
					}]
				}]
			},
			"footer": {
				"actionsStrip": [{
					"text": "Review",
					"actions": [{
						"type": "ShowCard",
						"parameters": {
							"width": "320px",
							"data": {
								"personalInfoData": "{/info}"
							},
							"parameters": {
								"test": "{parameters>/test/value}"
							},
							"manifest": "./snackManifest.json"
						}
					}]
				}]
			}
		}
	};

	QUnit.module("Show/Hide Card Actions", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Open and close details card", function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.attachEvent("_ready", () => {
			Core.applyChanges();

			const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip();
			const aButtons = oActionsStrip._getToolbar().getContent();
			let oDialog = this.oCard.getDependents()[0];

			// Assert
			assert.notOk(oDialog, "Child card dialog is not available yet");

			// Act
			aButtons[1].firePress();
			oDialog = this.oCard.getDependents()[0];

			// Assert
			const oSnackCard = oDialog.getContent()[0];
			assert.ok(oSnackCard, "Child card is available, 'showCard' action is working");
			assert.ok(oSnackCard.isA("sap.ui.integration.widgets.Card"), "Card is correctly found");

			Promise.all([
				new Promise((resolve) => { oSnackCard.attachEventOnce("_ready", resolve); }),
				new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
			]).then(() => {
				Core.applyChanges();

				//Assert
				assert.strictEqual(oSnackCard.getCombinedParameters().test, this.oCard.getCombinedParameters().test, "Parameters are transferred between cards");
				assert.strictEqual(oSnackCard.getWidth(), "320px", "The width is transferred between cards properly");
				assert.strictEqual(oSnackCard.getCardHeader().getTitle(), "Donna", "Data is transferred between cards properly");

				const oSnackCardActionStrip = oSnackCard.getAggregation("_footer").getActionsStrip(),
					aSnackCardButtons = oSnackCardActionStrip._getToolbar().getContent();

				// Act
				aSnackCardButtons[1].firePress();
			});

			oDialog.attachAfterClose(() => {
				// Assert
				assert.ok(oSnackCard.isDestroyed(), "Child card is not destroyed, 'hideCard' action is working");
				done();
			});
		});

		this.oCard.setManifest(oBiteManifestWithUrl);
	});

	QUnit.test("Destroy main card while details card is opened", function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.attachEvent("_ready", () => {
			Core.applyChanges();

			const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip();
			const aButtons = oActionsStrip._getToolbar().getContent();

			// Act
			aButtons[1].firePress();
			const oDialog = this.oCard.getDependents()[0];
			const oSnackCard = oDialog.getContent()[0];

			oSnackCard.attachEventOnce("_ready", () => {
				Core.applyChanges();
				//Assert

				// Act
				this.oCard.destroy();

				// Assert
				assert.ok(oSnackCard.isDestroyed(), "Child card should be destroyed");
				assert.ok(oDialog.isDestroyed(),  "Dialog should be destroyed");

				done();
			});
		});

		this.oCard.setManifest(oBiteManifestWithUrl);
	});

	QUnit.test("Hiding close button", function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.attachEvent("_ready", () => {
			const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
				aButtons = oActionsStrip._getToolbar().getContent();

			aButtons[1].firePress();

			const oSnackCard = this.oCard.getDependents()[0].getContent()[0];

			oSnackCard.attachEventOnce("_ready", function () {
				//Assert
				assert.strictEqual(oSnackCard.getCardHeader().getToolbar().getVisible(), false, "Close Button is not visible");
				assert.strictEqual(oSnackCard.getCardHeader().getDomRef().querySelector("sapMBtn"), null, "Close Button is not in DOM");

				done();
			});
		});

		this.oCard.setManifest(oBiteManifestWithUrl);
	});

	QUnit.module("Show/Hide Card Actions - Resizing", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Open resizable dialog", function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.attachEvent("_ready", () => {
			Core.applyChanges();

			const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip();
			const aButtons = oActionsStrip._getToolbar().getContent();

			// Act
			aButtons[1].firePress();
			const oDialog = this.oCard.getDependents()[0];

			oDialog.attachAfterOpen(() => {
				// Assert
				assert.ok(oDialog.getResizable(), "Resizing should be enabled");

				done();
			});
		});

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.cardActions.showCard.resizing",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"configuration": {
					"parameters": {
						"enableResizing": {
							"value": true
						}
					}
				},
				"header": {
					"title": "Some Title"
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				},
				"footer": {
					"actionsStrip": [{
						"text": "Review",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"manifest": "./snackManifest.json",
								"resizable": "{parameters>/enableResizing/value}"
							}
						}]
					}]
				}
			}
		});
	});

});
