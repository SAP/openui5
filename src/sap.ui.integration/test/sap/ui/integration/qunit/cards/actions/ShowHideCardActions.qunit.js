/* global QUnit */

sap.ui.define([
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Card,
	nextUIUpdate,
	nextCardReadyEvent
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
							"width": "420px",
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

	const oBiteManifestWithUrlAndPaginator = {
		"sap.app": {
			"id": "card.explorer.sample.biteToSnackUrlManifestPaginator.bite",
			"type": "card"
		},
		"sap.ui": {
			"technology": "UI5",
			"icons": {
				"icon": "sap-icon://switch-classes"
			}
		},
		"sap.card": {
			"type": "List",
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
				"item": {
					"title": "Lorem ipsum dolor sit."
				}
			},
			"footer": {
				"paginator": {
					"pageSize": 5
				},
				"actionsStrip": [{
					"text": "Review",
					"actions": [{
						"type": "ShowCard",
						"parameters": {
							"width": "420px",
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

	QUnit.test("Open and close details card", async function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.setManifest(oBiteManifestWithUrl);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

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

		await Promise.all([
			nextCardReadyEvent(oSnackCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oSnackCard.getCombinedParameters().test, this.oCard.getCombinedParameters().test, "Parameters are transferred between cards");
		assert.strictEqual(oSnackCard.getWidth(), "100%", "The width of the child card is the default width of 100%");
		assert.strictEqual(oDialog.getContentWidth(), "420px", "The width is applied to the dialog content");
		assert.strictEqual(oSnackCard.getCardHeader().getTitle(), "Donna", "Data is transferred between cards properly");
		assert.strictEqual(oSnackCard.getCardHeader().getProperty("headingLevel"), "1", "When card is in a dialog aria-level should be set to 1");

		const oSnackCardActionStrip = oSnackCard.getAggregation("_footer").getActionsStrip(),
			aSnackCardButtons = oSnackCardActionStrip._getToolbar().getContent();

		// Act
		aSnackCardButtons[1].firePress();

		oDialog.attachAfterClose(() => {
			// Assert
			assert.ok(oSnackCard.isDestroyed(), "Child card is not destroyed, 'hideCard' action is working");
			done();
		});
	});

	QUnit.test("Open and close details card with paginator", async function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.setManifest(oBiteManifestWithUrlAndPaginator);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip();
		const aButtons = oActionsStrip._getToolbar().getContent();
		let oDialog = this.oCard.getDependents()[0];

		// Act
		aButtons[1].firePress();
		oDialog = this.oCard.getDependents()[0];

		const oSnackCard = oDialog.getContent()[0];

		await Promise.all([
			nextCardReadyEvent(oSnackCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		//Assert
		assert.strictEqual(oSnackCard.getCombinedParameters().test, this.oCard.getCombinedParameters().test, "Parameters are transferred between cards");
		assert.strictEqual(oSnackCard.getCardHeader().getTitle(), "Donna", "Data is transferred between cards properly");
		assert.strictEqual(oSnackCard.getCardHeader().getProperty("headingLevel"), "1", "When card is in a dialog aria-level should be set to 1");

		const oSnackCardActionStrip = oSnackCard.getAggregation("_footer").getActionsStrip(),
			aSnackCardButtons = oSnackCardActionStrip._getToolbar().getContent();

		// Act
		aSnackCardButtons[1].firePress();

		oDialog.attachAfterClose(() => {
			// Assert
			assert.ok(oSnackCard.isDestroyed(), "Child card is not destroyed, 'hideCard' action is working");
			done();
		});
	});

	QUnit.test("Destroy main card while details card is opened", async function (assert) {
		// Arrange
		this.oCard.setManifest(oBiteManifestWithUrl);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip();
		const aButtons = oActionsStrip._getToolbar().getContent();

		// Act
		aButtons[1].firePress();
		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		// Act
		this.oCard.destroy();

		// Assert
		assert.ok(oSnackCard.isDestroyed(), "Child card should be destroyed");
		assert.ok(oDialog.isDestroyed(),  "Dialog should be destroyed");
	});

	QUnit.test("Hiding close button", async function (assert) {
		this.oCard.setManifest(oBiteManifestWithUrl);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		//Assert
		assert.strictEqual(oDialog.getCustomHeader().getToolbar().getVisible(), false, "Close Button is not visible");
		assert.strictEqual(oDialog.getCustomHeader().getDomRef().querySelector("sapMBtn"), null, "Close Button is not in DOM");
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

	QUnit.test("Open resizable dialog", async function (assert) {
		// Arrange
		const done = assert.async();

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

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

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
});
