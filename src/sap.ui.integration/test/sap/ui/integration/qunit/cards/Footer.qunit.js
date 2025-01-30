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

	QUnit.module("Footer close button", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt("qunit-fixture");
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Hiding close button from header", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
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

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), false, "Close Button is not visible");
		assert.strictEqual(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), null, "Close Button is not in DOM");
	});

	QUnit.test("Hiding close button from footer", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
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
								"manifest": "./snackManifest2.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), false, "Close Button is not visible");
		assert.strictEqual(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), null, "Close Button is not in DOM");
	});

	QUnit.test("Footer is not created if the only configuration it has is to hide the close button", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
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
								"manifest": "./snackManifest3.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter(), null, "Footer is not created");
	});

	QUnit.test("Close button is visible by default", async function (assert) {
		const oManifest = {
			"sap.app": {
				"id": "card.test.sample.bitetosnacUrlmanifest.bite",
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
								"manifest": "./snackManifest4.json"
							}
						}]
					}]
				}
			}
		};

		this.oCard.setManifest(oManifest);
		await nextCardReadyEvent(this.oCard);

		const oActionsStrip = this.oCard.getAggregation("_footer").getActionsStrip(),
			aButtons = oActionsStrip._getToolbar().getContent();

		aButtons[1].firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oSnackCard = oDialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		const sFooterId = oSnackCard.getCardFooter().getId();

		//Assert
		assert.strictEqual(oSnackCard.getCardFooter().getShowCloseButton(), true, "Close Button is visible");
		assert.ok(oSnackCard.getCardFooter().getDomRef().querySelector("#" + sFooterId + "-closeBtn"), "Close Button is rendered in DOM");
	});
});