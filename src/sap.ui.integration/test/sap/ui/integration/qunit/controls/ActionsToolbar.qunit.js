/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function(
	Core,
	Library,
	ActionDefinition,
	Host,
	Card,
	QUnitUtils,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Actions Toolbar in Card", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: "test-resources/sap/ui/integration/qunit/testResources/listCard.manifest.json"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Actions toolbar is invisible when there are no items", async function (assert) {
		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oHeader = this.oCard.getCardHeader();

		// Assert
		assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar is invisible");
	});

	QUnit.test("Actions toolbar appears when item is added before rendering", async function (assert) {
		// Act
		this.oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader();

		// Assert
		assert.ok(oHeader.getToolbar(), "There is actions toolbar");
	});

	QUnit.test("Actions toolbar appears when item is added after rendering", async function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		this.oCard.destroyActionDefinitions();

		setTimeout(async function () {
			var oHeader = this.oCard.getCardHeader();
			// Assert
			assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar should not be visible");

			// Act
			this.oCard.addActionDefinition(new ActionDefinition({
				type: "Navigation",
				text: "Text",
				icon: "sap-icon://learning-assistant"
			}));
			await nextUIUpdate();

			// Assert
			assert.ok(oHeader.getToolbar().getVisible(), "There is actions toolbar");
			assert.strictEqual(oHeader.getToolbar().getAggregation("_actionSheet").getButtons().length, 1, "There is 1 item");

			done();
		}.bind(this), 1000);
	});

	QUnit.test("Actions toolbar disappears when item is removed after rendering", async function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				icon: "sap-icon://learning-assistant"
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		setTimeout(async function () {
			// Act
			this.oCard.removeActionDefinition(oAI);
			await nextUIUpdate();
			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar is hidden");
			assert.strictEqual(oHeader.getToolbar().getAggregation("_actionSheet").getButtons().length, 0, "There are no items");

			done();
		}.bind(this), 1000);
	});

	QUnit.test("Actions toolbar disappears when destroyActions is called", async function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				icon: "sap-icon://learning-assistant"
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		setTimeout(async function () {
			// Act
			this.oCard.destroyActionDefinitions();
			await nextUIUpdate();
			var oToolbar = this.oCard.getCardHeader().getToolbar();

			// Assert
			assert.notOk(oToolbar.getVisible(), "Actions toolbar is hidden");
			assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons().length, 0, "There are no items");
			done();
		}.bind(this), 1000);
	});

	QUnit.test("Press event of Action is fired", async function (assert) {
		// Arrange
		var done = assert.async(),
			oStub = sinon.stub(),
			oAI = new ActionDefinition({
				type: "Custom",
				text: "Text",
				press: oStub
			});

		// Act 1
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oToolbar = this.oCard.getCardHeader().getToolbar();

		oToolbar.getAggregation("_actionSheet").attachAfterOpen(function () {
			// Act 3
			oToolbar.getAggregation("_actionSheet").getButtons()[0].$().trigger("tap");

			// Assert
			assert.ok(oStub.calledOnce, "Press event is fired");
			done();
		});

		// Act 2
		oToolbar._getToolbar().$().trigger("tap");
	});

	QUnit.test("Actions toolbar disappears when all items inside it become invisible", async function (assert) {
		// Arrange
		var done = assert.async(),
			oStub = sinon.stub(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				press: oStub
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		setTimeout(async function () {
			// Act
			oAI.setVisible(false);
			await nextUIUpdate();
			var oToolbar = this.oCard.getCardHeader().getToolbar();

			// Assert
			assert.notOk(oToolbar.getVisible(), "Actions toolbar is hidden");
			done();
		}.bind(this), 1000);
	});

	QUnit.test("removeActionDefinition removes button from the action sheet", async function (assert) {
		// Arrange
		var oAI = new ActionDefinition({
				type: "Navigation",
				text: "Item 1"
			}),
			oAI2 = new ActionDefinition({
				type: "Navigation",
				text: "Item 2"
			}),
			oAI3 = new ActionDefinition("cardAction", {
				type: "Navigation",
				text: "Item 3"
			});


		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.addActionDefinition(oAI2);
		this.oCard.addActionDefinition(oAI3);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oActionSheet = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet");

		// Act
		this.oCard.removeActionDefinition(oAI); // by reference
		this.oCard.removeActionDefinition(0); // by index
		this.oCard.removeActionDefinition("cardAction"); // by id

		// Assert
		assert.strictEqual(oActionSheet.getButtons().length, 0, "Buttons are also removed from the toolbar");
	});

	QUnit.test("actions aggregation is destroyed when manifest changes", async function (assert) {
		// Arrange
		var oStub = sinon.spy(Card.prototype, "destroyActionDefinitions");

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/tableCard.manifest.json");

		await nextCardReadyEvent(this.oCard);

		// Assert
		assert.ok(oStub.calledOnce, "Previous actions are destroyed");
	});

	QUnit.test("Actions toolbar item initially enabled=false", async function (assert) {
		// Arrange
		var oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				enabled: false
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		oAI.setVisible(false);

		await nextUIUpdate();

		var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

		// Assert
		assert.notOk(aButtons[0].getEnabled(), "Button in the menu is disabled");
	});

	QUnit.test("Actions toolbar item enabled=false set after rendering", async function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text"
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		setTimeout(async function () {
			// Act
			oAI.setEnabled(false);
			await nextUIUpdate();
			var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

			// Assert
			assert.notOk(aButtons[0].getEnabled(), "Button in the menu is disabled");
			done();
		}.bind(this), 500);
	});

	QUnit.test("Actions toolbar is disabled when some loading placeholder is active", async function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));

		this.oCard.attachEvent("_headerReady", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar();
			assert.notOk(oToolbar._getToolbar().getEnabled(), "Toolbar is initially disabled");
			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oToolbar = this.oCard.getCardHeader().getToolbar();
		assert.ok(oToolbar._getToolbar().getEnabled(), "Toolbar is enabled");

		this.oCard.showLoadingPlaceholders();
		await nextUIUpdate();
		assert.notOk(oToolbar._getToolbar().getEnabled(), "Toolbar is disabled");

		this.oCard.hideLoadingPlaceholders();
		await nextUIUpdate();
		assert.ok(oToolbar._getToolbar().getEnabled(), "Toolbar is enabled");
	});

	QUnit.module("Actions Toolbar in Card with Host ", {
		beforeEach: function () {
			var oManifest = {
				"sap.app": {
					"id": "test1"
				},
				"sap.card": {
					"type": "List",
					"header": {
						"title": "Header sample",
						"actions": [{
							"type": "Navigation"
						}]
					}
				}
			};
			this.oHost = new Host({
				actions: [{
					type: 'Custom',
					text: 'Host action'
				}]
			});

			this.oCard = new Card({
				manifest: oManifest,
				host: this.oHost
			});
			this.oCard.setHost(this.oHost);
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
			this.oHost.destroy();
			this.oHost = null;
		}
	});

	QUnit.test("Click on actions toolbar", async function (assert) {
		// Arrange
		var done = assert.async();

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oHeader = this.oCard.getCardHeader(),
			fnHeaderPressStub = sinon.stub(),
			oToolbar = oHeader.getToolbar();

		oHeader.attachEvent("press", function () {
			fnHeaderPressStub();
		});

		oToolbar.addEventDelegate({
			"onAfterRendering": function () {
				var oResourceBundle = Library.getResourceBundleFor("sap.ui.integration");
				var sTooltipText = oResourceBundle.getText("CARD_ACTIONS_OVERFLOW_BUTTON_TOOLTIP");
				var oButton = oToolbar.getDomRef("overflowButton");

				oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {
					// Assert
					assert.ok(oToolbar.getAggregation("_actionSheet").isOpen(), "Action sheet is opened after overflow button is pressed.");
					assert.ok(fnHeaderPressStub.notCalled, "Header press is not triggered.");
					assert.strictEqual(oButton.title, sTooltipText, "Overflow button tooltip is correctly set to string: " + sTooltipText);
					done();
				});

				// Act
				QUnitUtils.triggerEvent("tap", oButton);
			}
		});
	});

	QUnit.test("Remove action item from card by index", async function (assert) {
		// Arrange
		var oAI = new ActionDefinition({
				text: "Card action item"
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oToolbar = this.oCard.getCardHeader().getToolbar(),
			oActionSheet = oToolbar.getAggregation("_actionSheet");

		// Assert
		assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Card action item", "First button in the menu is the one added by the card");
		assert.strictEqual(oActionSheet.getButtons()[1].getText(), "Host action", "Second button in the menu is the one added by the host");

		// Act
		this.oCard.removeActionDefinition(0);

		// Assert
		assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Host action", "Action added from the host is still there");

		oAI.destroy();
	});

	QUnit.test("Action definition added by the card later should be placed before the host actions", async function (assert) {
		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var oToolbar = this.oCard.getCardHeader().getToolbar(),
			oActionSheet = oToolbar.getAggregation("_actionSheet");

		// Act
		this.oCard.addActionDefinition(new ActionDefinition({ text: "New card action item" }));

		assert.strictEqual(oActionSheet.getButtons()[0].getText(), "New card action item", "Action added by the card later should be at the top");
	});

	QUnit.module("Translation", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: "test-resources/sap/ui/integration/qunit/testResources/cardWithTranslations/manifest.json"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Action text is translated", async function (assert) {
		// Arrange
		var oAI = new ActionDefinition({
				type: "Navigation",
				text: "{i18n>translatedText}"
			});

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);
		await nextUIUpdate();

		var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

		// Assert
		assert.strictEqual(aButtons[0].getText(), this.oCard.getTranslatedText("translatedText"), "Button text is translated");
	});

	QUnit.test("Action text is translated when added later in time", async function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "{i18n>translatedText}"
			});

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		setTimeout(async function () {
			// Act
			this.oCard.addActionDefinition(oAI);
			await nextUIUpdate();
			var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

			// Assert
			assert.strictEqual(aButtons[0].getText(), this.oCard.getTranslatedText("translatedText"), "Button text is translated");

			done();
		}.bind(this), 1000);
	});

	QUnit.module("Empty header");

	var oManifest_EmptyHeader = {
		"sap.app": {
			"id": "sap.card.actionsToolbar"
		},
		"sap.card": {
			"type": "List",
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15"
						}
					]
				},
				"item": {
					"title": {
						"value": "{Name}"
					}
				}
			}
		}
	};

	QUnit.test("Actions toolbar disappears and hides the parent header when it's empty", async function (assert) {
		// Arrange
		var done = assert.async(),
			oCard = new Card({
				manifest: oManifest_EmptyHeader,
				baseUrl: "test-resources/sap/ui/integration/qunit/testResources/"
			});

		oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));

		oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(oCard);

		// Assert
		assert.notOk(oCard.getCardHeader(), "Card header shouldn't be created only to show actions toolbar header");
		assert.ok(oCard.getDomRef().classList.contains("sapFCardNoHeader"), "The card has correct CSS class");

		// Act
		oCard.destroyActionDefinitions();

		await nextUIUpdate();

		setTimeout(function () {
			// Assert
			assert.notOk(oCard.getCardHeader(), "Card header shouldn't be created only to show actions toolbar header");
			assert.ok(oCard.getDomRef().classList.contains("sapFCardNoHeader"), "The card still has correct CSS class");

			oCard.destroy();
			done();
		}, 300);
	});
});
