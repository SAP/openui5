/* global QUnit, sinon */

sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Lib",
	"sap/ui/integration/library",
	"sap/ui/integration/widgets/Card",
	"sap/ui/test/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Log,
	Lib,
	library,
	Card,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const CardBlockingMessageType = library.CardBlockingMessageType;
	const oResourceBundle = Lib.getResourceBundleFor("sap.ui.integration");

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
			const sBaseUrl = "ShowHideCardActionsFakeUrl/";
			this.sManifestUrl = sBaseUrl + "manifest.json";
			this.oManifest = {
				"sap.app": {
					"id": "test.card.main.card",
					"type": "card"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"childCards": {
							"childCard1": {
								"manifest": "snackManifest.json"
							}
						},
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
						"title": "Some Title",
						"actions": [{
							"type": "ShowCard",
							"parameters": {
								"childCardKey": "childCard1",
								"parameters": {
									"test": "{parameters>/test/value}"
								},
								"width": "420px",
								"data": {
									"personalInfoData": "{/info}"
								}
							}
						}]
					},
					"content": {
						"groups": [{
							"items": [{
								"value": "Lorem ipsum dolor sit."
							}]
						}]
					}
				}
			};

			this.oSnackManifest = {
				"sap.app": {
					"id": "test.snackCard"
				},
				"sap.card": {
					"type": "Object",
					"configuration": {
						"parameters": {
							"test": {}
						}
					},
					"header": {
						"data": {
							"path": "personalInfoData>/"
						},
						"title": "{personalInfoData>firstName}",
						"subtitle": "Complete your time recording {personalInfoData>email}",
						"closeButton": {
							"visible": false
						}
					},
					"content": {
						"groups": [
							{
								"alignment": "Stretch",
								"items": [
									{
										"value": "Lorem ipsum."
									}
								]
							}
						]
					},
					"footer": {
						"actionsStrip": [
							{
								"text": "Approve",
								"buttonType": "Accept",
								"actions": [
									{
										"type": "HideCard"
									}
								]
							},
							{
								"text": "Reject",
								"buttonType": "Reject",
								"actions": [
									{
										"type": "HideCard"
									}
								]
							}
						]
					}
				}
			};

			this.oCard = new Card({
				baseUrl: sBaseUrl
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.xhr.useFilters = true;
			this.oServer.xhr.addFilter(function(sMethod, sUrl) {
				return !sUrl.includes(sBaseUrl);
			});

			this.oServer.respondWith("GET", new RegExp(sBaseUrl + "\.*manifest\.json.*"), (oXhr) => {
				oXhr.respond(
					200,
					{ "Content-Type": "application/json" },
					JSON.stringify(this.oManifest)
				);
			});

			this.oServer.respondWith("GET", new RegExp(sBaseUrl + "\.*snackManifest\.json.*"), (oXhr) => {
				oXhr.respond(
					200,
					{ "Content-Type": "application/json" },
					JSON.stringify(this.oSnackManifest)
				);
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oServer.restore();
			this.oServer.xhr.useFilters = false;
		}
	});

	QUnit.test("Open and close card", async function (assert) {
		// Arrange
		const done = assert.async();

		this.oCard.setManifest(this.sManifestUrl);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		let oDialog = this.oCard.getDependents()[0];

		// Assert
		assert.notOk(oDialog, "Child card dialog is not available yet");

		// Act
		this.oCard.getCardHeader().firePress();

		oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];

		// Assert
		assert.ok(oChildCard, "Child card is available, 'ShowCard' action is working");
		assert.ok(oChildCard.isA("sap.ui.integration.widgets.Card"), "Card is of correct type");

		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oChildCard.getCombinedParameters().test, this.oCard.getCombinedParameters().test, "Parameters are transferred from main to child card");
		assert.strictEqual(oChildCard.getWidth(), "100%", "The width of the child card is the default width of 100%");
		assert.strictEqual(oDialog.getContentWidth(), "420px", "The width is applied to the dialog content");
		assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Donna", "Data is transferred between cards properly");
		assert.strictEqual(oChildCard.getCardHeader().getProperty("headingLevel"), "H1", "When card is in a dialog aria-level should be set to 1");

		const oChildCardActionStrip = oChildCard.getAggregation("_footer").getActionsStrip(),
			aChildCardButtons = oChildCardActionStrip._getToolbar().getContent();

		// Act
		aChildCardButtons[1].firePress();

		oDialog.attachAfterClose(() => {
			// Assert
			assert.ok(oChildCard.isDestroyed(), "Child card is not destroyed, 'HideCard' action is working");
			done();
		});
	});

	QUnit.test("Open card which key doesn't exist", async function (assert) {
		// Arrange
		const oSpy = this.spy(Log, "error");

		this.oCard.setManifest({
			"sap.app": {
				"id": "test.card.main.card",
				"type": "card"
			},
			"sap.card": {
				"type": "Object",
				"header": {
					"title": "Some Title",
					"actions": [{
						"type": "ShowCard",
						"parameters": {
							"childCardKey": "childCard1"
						}
					}]
				},
				"content": {
					"groups": [{
						"items": [{
							"value": "Lorem ipsum dolor sit."
						}]
					}]
				}
			}
		});

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this.oCard.getCardHeader().firePress();

		// Assert
		const oDialog = this.oCard.getDependents()[0];
		assert.notOk(oDialog, "No dialog is opened when child card key doesn't exist.");
		assert.ok(oSpy.calledWith("'ShowCard' action cannot find a child card with key 'childCard1'.", null, "sap.ui.integration.widgets.Card"), "Error logged for missing child card key");
	});

	QUnit.test("Open card using data binding for key", async function (assert) {
		// Arrange
		this.oManifest["sap.card"].data.json.childCardKey = "childCard1";
		this.oManifest["sap.card"].header.actions[0].parameters.childCardKey = "{/childCardKey}";
		this.oCard.setManifest(this.oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this.oCard.getCardHeader().firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];

		// Assert
		assert.ok(oChildCard, "Child card is available, 'ShowCard' action is working");

		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Donna", "Data is transferred between cards properly");
	});

	QUnit.test("Open card that references one of its ancestor as child card", async function (assert) {
		// Arrange
		const oLogSpy = this.spy(Log, "error");
		this.oSnackManifest["sap.card"].configuration = {
			childCards: {
				childCard1: {
					manifest: "manifest.json"
				}
			}
		};
		this.oCard.setManifest("ShowHideCardActionsFakeUrl/manifest.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this.oCard.getCardHeader().firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];

		// Assert
		assert.ok(oChildCard, "Child card is available, 'ShowCard' action is working");

		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		const oBlockingMessage = oChildCard.getBlockingMessage();

		// Assert
		assert.strictEqual(oBlockingMessage.type, CardBlockingMessageType.Error, "Data is transferred between cards properly");
		assert.strictEqual(oBlockingMessage.title, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"), "Blocking message title is correct");
		assert.strictEqual(oBlockingMessage.description, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"), "Blocking message description is correct");
		assert.ok(
			oLogSpy.calledWith(
				oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
				sinon.match((oError) => {
					return oError.message === "One of the card's ancestors, or the card itself, is set as its child, which is not allowed. Remove child with manifest 'manifest.json' from the child cards configuration.";
				}),
				"sap.ui.integration.widgets.Card"
			),
			"Error is logged"
		);
	});

	QUnit.test("Open card that references itself as child card", async function (assert) {
		// Arrange
		const oLogSpy = this.spy(Log, "error");
		this.oSnackManifest["sap.card"].configuration = {
			childCards: {
				childCard1: {
					manifest: "snackManifest.json"
				}
			}
		};
		this.oCard.setManifest("ShowHideCardActionsFakeUrl/manifest.json");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act
		this.oCard.getCardHeader().firePress();

		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];

		// Assert
		assert.ok(oChildCard, "Child card is available, 'ShowCard' action is working");

		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		const oBlockingMessage = oChildCard.getBlockingMessage();

		// Assert
		assert.strictEqual(oBlockingMessage.type, CardBlockingMessageType.Error, "Data is transferred between cards properly");
		assert.strictEqual(oBlockingMessage.title, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"), "Blocking message title is correct");
		assert.strictEqual(oBlockingMessage.description, oResourceBundle.getText("CARD_ERROR_CONFIGURATION_DESCRIPTION"), "Blocking message description is correct");
		assert.ok(
			oLogSpy.calledWith(
				oResourceBundle.getText("CARD_ERROR_CONFIGURATION_TITLE"),
				sinon.match((oError) => {
					return oError.message === "One of the card's ancestors, or the card itself, is set as its child, which is not allowed. Remove child with manifest 'snackManifest.json' from the child cards configuration.";
				}),
				"sap.ui.integration.widgets.Card"
			),
			"Error is logged"
		);
	});

	QUnit.module("Show/Hide Card Actions using deprecated manifest property", {
		beforeEach: function () {
			this.oBiteManifestWithUrl = {
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

			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Open and close details card using 'manifest' property (deprecated)", async function (assert) {
		// Arrange
		const done = assert.async();
		const oSpy = this.spy(Log, "warning");

		this.oCard.setManifest(this.oBiteManifestWithUrl);

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
		assert.ok(
			oSpy.calledWith(
				"'ShowCard' action uses deprecated 'manifest' property. Use 'childCardKey' instead. It must refer to a child card registered in sap.card/configuration/childCards.",
				null,
				"sap.ui.integration.widgets.Card"
			),
			"Warning logged for deprecated 'manifest' property"
		);

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
		assert.strictEqual(oSnackCard.getCardHeader().getProperty("headingLevel"), "H1", "When card is in a dialog aria-level should be set to 1");

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
		assert.strictEqual(oSnackCard.getCardHeader().getProperty("headingLevel"), "H1", "When card is in a dialog aria-level should be set to 1");

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
		this.oCard.setManifest(this.oBiteManifestWithUrl);

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
		assert.ok(oDialog.isDestroyed(), "Dialog should be destroyed");
	});

	QUnit.module("Show/Hide Card Actions - Multiple levels of child cards", {
		beforeEach: function () {
			this.oCard = new Card();
			this.oCard.placeAt(DOM_RENDER_LOCATION);

			this.oServer = sinon.createFakeServer({
				autoRespond: true,
				respondImmediately: true
			});

			this.oServer.respondWith("GET", /test-resources\/sap\/ui\/integration\/qunit\/testResources\/snackManifest\.json.*/, (oXhr) => {
				const iLevel = parseInt(oXhr.url.match(/Manifest\.json(\d+)/)[1]);
				const iNextLevel = iLevel + 1;

				oXhr.respond(
					200,
					{ "Content-Type": "application/json" },
					JSON.stringify({
						"sap.app": {
							"id": "card.level" + iLevel,
							"type": "card"
						},
						"sap.card": {
							"type": "Object",
							"configuration": {
								"childCards": {
									"childCard": {
										"manifest": "test-resources/sap/ui/integration/qunit/testResources/snackManifest.json" + iNextLevel
									}
								}
							},
							"header": {
								"title": "Level " + iLevel,
								"actions": [{
									"type": "ShowCard",
									"parameters": {
										"childCardKey": "childCard"
									}
								}]
							},
							"content": {
								"groups": [{
									"items": [{
										"value": "Child card content"
									}]
								}]
							}
						}
					})
				);
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oServer.restore();
		}
	});

	QUnit.test("Opening multiple levels of child cards", async function (assert) {
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/snackManifest.json0");

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act - Open first child card
		this.oCard.getCardHeader().firePress();
		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];
		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		// Assert
		assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Level 1", "First child card is opened with correct title");

		// Act - Open second child card
		oChildCard.getCardHeader().firePress();

		const oSecondDialog = oChildCard.getDependents()[0];
		const oSecondChildCard = oSecondDialog.getContent()[0];

		await Promise.all([
			nextCardReadyEvent(oSecondChildCard),
			new Promise((resolve) => { oSecondDialog.attachAfterOpen(resolve); })
		]);

		// Assert
		assert.strictEqual(oSecondChildCard.getCardHeader().getTitle(), "Level 2", "Second child card is opened with correct title");
	});

	QUnit.test("Setting 'manifestChanges' to nested cards", async function (assert) {
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/snackManifest.json0");
		this.oCard.setManifestChanges([{
			"/sap.card/header/title": "Updated Title",
			"/sap.card/configuration/childCards/childCard/_manifestChanges": {
				"/sap.card/header/title": "Updated Child Card Title",
				"/sap.card/configuration/childCards/childCard/_manifestChanges": {
					"/sap.card/header/title": "Updated Grandchild Card Title"
				}
			}
		}]);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act - Open first child card
		this.oCard.getCardHeader().firePress();
		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];
		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		// Assert
		assert.deepEqual(oChildCard.getManifestChanges(), [{
			"/sap.card/header/title": "Updated Child Card Title",
			"/sap.card/configuration/childCards/childCard/_manifestChanges": {
				"/sap.card/header/title": "Updated Grandchild Card Title"
			}
		}], "Child card has correct manifest changes");

		// Act - Open second child card
		oChildCard.getCardHeader().firePress();

		const oSecondDialog = oChildCard.getDependents()[0];
		const oSecondChildCard = oSecondDialog.getContent()[0];

		await Promise.all([
			nextCardReadyEvent(oSecondChildCard),
			new Promise((resolve) => { oSecondDialog.attachAfterOpen(resolve); })
		]);

		// Assert
		assert.deepEqual(oSecondChildCard.getManifestChanges(), [{
			"/sap.card/header/title": "Updated Grandchild Card Title"
		}], "Second child card has correct manifest changes");
	});

	QUnit.test("Setting 'manifestChanges' to nested cards using private '_manifestChanges' property", async function (assert) {
		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/snackManifest.json0");
		await nextCardReadyEvent(this.oCard);

		const oManifest = this.oCard.getManifestEntry("/");
		oManifest["sap.card"].configuration.childCards.childCard._manifestChanges = [{
			"/sap.card/header/title": "Updated Child Card Title",
			"/sap.card/configuration/childCards/childCard/_manifestChanges": {
				"/sap.card/header/title": "Updated Grandchild Card Title"
			}
		}];
		this.oCard.setManifest(oManifest);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		// Act - Open first child card
		this.oCard.getCardHeader().firePress();
		const oDialog = this.oCard.getDependents()[0];
		const oChildCard = oDialog.getContent()[0];
		await Promise.all([
			nextCardReadyEvent(oChildCard),
			new Promise((resolve) => { oDialog.attachAfterOpen(resolve); })
		]);
		await nextUIUpdate();

		// Assert
		assert.deepEqual(oChildCard.getManifestChanges(), [{
			"/sap.card/header/title": "Updated Child Card Title",
			"/sap.card/configuration/childCards/childCard/_manifestChanges": {
				"/sap.card/header/title": "Updated Grandchild Card Title"
			}
		}], "Child card has correct manifest changes");
		assert.strictEqual(oChildCard.getCardHeader().getTitle(), "Updated Child Card Title", "Manifest change for child card title is applied");

		// Act - Open second child card
		oChildCard.getCardHeader().firePress();

		const oSecondDialog = oChildCard.getDependents()[0];
		const oSecondChildCard = oSecondDialog.getContent()[0];

		await Promise.all([
			nextCardReadyEvent(oSecondChildCard),
			new Promise((resolve) => { oSecondDialog.attachAfterOpen(resolve); })
		]);

		// Assert
		assert.deepEqual(oSecondChildCard.getManifestChanges(), [{
			"/sap.card/header/title": "Updated Grandchild Card Title"
		}], "Second child card has correct manifest changes");
		assert.strictEqual(oSecondChildCard.getCardHeader().getTitle(), "Updated Grandchild Card Title", "Manifest change for grandchild card title is applied");
	});

	QUnit.module("Show/Hide cardChild card's bindings", {
		beforeEach: function () {
			this.oCard = new Card({
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/",
				manifest: {
					"sap.app": {
						"id": "main"
					},
					"sap.card": {
						"type": "Object",
						"configuration": {
							"childCards": {
								"snackCard": {
									"manifest": "./childCardBindingErrorManifest.json"
								}
							}
						},
						"header": {
							"title": "Open Child Card",
							"actions": [
								{
									"type": "ShowCard",
									"parameters": {
										"childCardKey": "snackCard"
									}
								}
							]
						},
						"content": {
							"groups": []
						}
					}
				}
			});
			this.oCard.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Child card's bindings", async function (assert) {
		const done = assert.async();
		var oLogSpy = this.spy(Log, "error");

		await nextCardReadyEvent(this.oCard);

		const header = this.oCard.getCardHeader();
		header.firePress();

		await nextUIUpdate();

		const dialog = this.oCard.getDependents()[0];
		const oSnackCard = dialog.getContent()[0];

		await nextCardReadyEvent(oSnackCard);

		oSnackCard.hide();

		dialog.attachAfterClose(() => {
			assert.ok(oSnackCard.isDestroyed(), "Child card is destroyed after close");
			assert.notOk(oLogSpy.callCount, "Error message should not be logged");

			oLogSpy.restore();

			done();
		});
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
