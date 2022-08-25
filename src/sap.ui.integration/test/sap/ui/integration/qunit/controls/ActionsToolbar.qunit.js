/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/Host",
	"sap/ui/integration/widgets/Card",
	"sap/ui/qunit/QUnitUtils"
], function (
	Core,
	ActionDefinition,
	Host,
	Card,
	QUnitUtils
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

	QUnit.test("Actions toolbar is invisible when there are no items", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar is invisible");

			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar appears when item is added before rendering", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader();

			// Assert
			assert.ok(oHeader.getToolbar(), "There is actions toolbar");

			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar appears when item is added after rendering", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			this.oCard.destroyActionDefinitions();

			setTimeout(function () {
				var oHeader = this.oCard.getCardHeader();
				// Assert
				assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar should not be visible");

				// Act 2
				this.oCard.addActionDefinition(new ActionDefinition({
					type: "Navigation",
					text: "Text",
					icon: "sap-icon://learning-assistant"
				}));
				Core.applyChanges();

				// Assert
				assert.ok(oHeader.getToolbar().getVisible(), "There is actions toolbar");
				assert.strictEqual(oHeader.getToolbar().getAggregation("_actionSheet").getButtons().length, 1, "There is 1 item");

				done();
			}.bind(this), 1000);
		}.bind(this));

		// Act 1
		this.oCard.addActionDefinition(new ActionDefinition({
			type: "Navigation",
			text: "Text",
			icon: "sap-icon://learning-assistant"
		}));
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar disappears when item is removed after rendering", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				icon: "sap-icon://learning-assistant"
			});

		this.oCard.attachEvent("_ready", function () {
			setTimeout(function () {
				// Act
				this.oCard.removeActionDefinition(oAI);
				Core.applyChanges();
				var oHeader = this.oCard.getCardHeader();

				// Assert
				assert.notOk(oHeader.getToolbar().getVisible(), "Actions toolbar is hidden");
				assert.strictEqual(oHeader.getToolbar().getAggregation("_actionSheet").getButtons().length, 0, "There are no items");

				done();
			}.bind(this), 1000);
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar disappears when destroyActions is called", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				icon: "sap-icon://learning-assistant"
			});

		this.oCard.attachEvent("_ready", function () {
			setTimeout(function () {
				// Act
				this.oCard.destroyActionDefinitions();
				Core.applyChanges();
				var oToolbar = this.oCard.getCardHeader().getToolbar();

				// Assert
				assert.notOk(oToolbar.getVisible(), "Actions toolbar is hidden");
				assert.strictEqual(oToolbar.getAggregation("_actionSheet").getButtons().length, 0, "There are no items");
				done();
			}.bind(this), 1000);
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Press event of Action is fired", function (assert) {
		// Arrange
		var done = assert.async(),
			oStub = sinon.stub(),
			oAI = new ActionDefinition({
				type: "Custom",
				text: "Text",
				press: oStub
			});

		this.oCard.attachEvent("_ready", function () {
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
		}.bind(this));

		// Act 1
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar disappears when all items inside it become invisible", function (assert) {
		// Arrange
		var done = assert.async(),
			oStub = sinon.stub(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				press: oStub
			});

		this.oCard.attachEvent("_ready", function () {
			setTimeout(function () {
				// Act
				oAI.setVisible(false);
				Core.applyChanges();
				var oToolbar = this.oCard.getCardHeader().getToolbar();

				// Assert
				assert.notOk(oToolbar.getVisible(), "Actions toolbar is hidden");
				done();
			}.bind(this), 1000);
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("removeActionDefinition removes button from the action sheet", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
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

		this.oCard.attachEvent("_ready", function () {
			var oActionSheet = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet");

			// Act
			this.oCard.removeActionDefinition(oAI); // by reference
			this.oCard.removeActionDefinition(0); // by index
			this.oCard.removeActionDefinition("cardAction"); // by id

			// Assert
			assert.strictEqual(oActionSheet.getButtons().length, 0, "Buttons are also removed from the toolbar");
			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.addActionDefinition(oAI2);
		this.oCard.addActionDefinition(oAI3);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("actions aggregation is destroyed when manifest changes", function (assert) {
		// Arrange
		var done = assert.async(),
			oStub = sinon.spy(Card.prototype, "destroyActionDefinitions");

		this.oCard.attachEventOnce("_ready", function () {
			this.oCard.attachEventOnce("_ready", function () {
				// Assert
				assert.ok(oStub.calledOnce, "Previous actions are destroyed");
				done();
			});

			// Act 2
			this.oCard.setManifest("test-resources/sap/ui/integration/qunit/testResources/tableCard.manifest.json");
		}.bind(this));

		// Act 1
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar item initially enabled=false", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text",
				enabled: false
			});

		this.oCard.attachEvent("_ready", function () {
			// Act
			oAI.setVisible(false);
			Core.applyChanges();
			var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

			// Assert
			assert.notOk(aButtons[0].getEnabled(), "Button in the menu is disabled");
			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar item enabled=false set after rendering", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "Text"
			});

		this.oCard.attachEventOnce("_ready", function () {
			setTimeout(function () {
				// Act
				oAI.setEnabled(false);
				Core.applyChanges();
				var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

				// Assert
				assert.notOk(aButtons[0].getEnabled(), "Button in the menu is disabled");
				done();
			}.bind(this), 500);
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Actions toolbar is disabled when some loading placeholder is active", function (assert) {
		// Arrange
		var done = assert.async(2);

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

		this.oCard.attachEvent("_ready", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar();
			assert.ok(oToolbar._getToolbar().getEnabled(), "Toolbar is enabled");

			this.oCard.showLoadingPlaceholders();
			Core.applyChanges();
			assert.notOk(oToolbar._getToolbar().getEnabled(), "Toolbar is disabled");

			this.oCard.hideLoadingPlaceholders();
			Core.applyChanges();
			assert.ok(oToolbar._getToolbar().getEnabled(), "Toolbar is enabled");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Click on actions toolbar", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oHeader = this.oCard.getCardHeader(),
				fnHeaderPressStub = sinon.stub(),
				oToolbar = oHeader.getToolbar();

			oHeader.attachEvent("press", function () {
				fnHeaderPressStub();
			});

			oToolbar.addEventDelegate({
				"onAfterRendering": function () {
					var oButton = oToolbar.getDomRef("overflowButton");

					oToolbar.getAggregation("_actionSheet").attachEvent("afterOpen", function () {
						// Assert
						assert.ok(oToolbar.getAggregation("_actionSheet").isOpen(), "Action sheet is opened after overflow button is pressed.");
						assert.ok(fnHeaderPressStub.notCalled, "Header press is not triggered.");
						done();
					});

					// Act
					QUnitUtils.triggerEvent("tap", oButton);
					Core.applyChanges();
				}
			});
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Remove action item from card by index", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				text: "Card action item"
			});

		this.oCard.attachEvent("_ready", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar(),
				oActionSheet = oToolbar.getAggregation("_actionSheet");
			Core.applyChanges();
			assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Card action item", "First button in the menu is the one added by the card");
			assert.strictEqual(oActionSheet.getButtons()[1].getText(), "Host action", "Second button in the menu is the one added by the host");

			// Act
			this.oCard.removeActionDefinition(0);

			assert.strictEqual(oActionSheet.getButtons()[0].getText(), "Host action", "Action added from the host is still there");

			oAI.destroy();
			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action definition added by the card later should be placed before the host actions", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			var oToolbar = this.oCard.getCardHeader().getToolbar(),
				oActionSheet = oToolbar.getAggregation("_actionSheet");
			Core.applyChanges();

			// Act
			this.oCard.addActionDefinition(new ActionDefinition({ text: "New card action item" }));

			assert.strictEqual(oActionSheet.getButtons()[0].getText(), "New card action item", "Action added by the card later should be at the top");
			assert.strictEqual(oActionSheet.getButtons()[1].getText(), "Host action", "Host action should be after the card actions");

			done();
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Action text is translated", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "{i18n>translatedText}"
			});

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();
			var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

			// Assert
			assert.strictEqual(aButtons[0].getText(), this.oCard.getTranslatedText("translatedText"), "Button text is translated");

			done();
		}.bind(this));

		// Act
		this.oCard.addActionDefinition(oAI);
		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});

	QUnit.test("Action text is translated when added later in time", function (assert) {
		// Arrange
		var done = assert.async(),
			oAI = new ActionDefinition({
				type: "Navigation",
				text: "{i18n>translatedText}"
			});

		this.oCard.attachEvent("_ready", function () {
			setTimeout(function () {
				// Act
				this.oCard.addActionDefinition(oAI);
				Core.applyChanges();
				var aButtons = this.oCard.getCardHeader().getToolbar().getAggregation("_actionSheet").getButtons();

				// Assert
				assert.strictEqual(aButtons[0].getText(), this.oCard.getTranslatedText("translatedText"), "Button text is translated");

				done();
			}.bind(this), 1000);
		}.bind(this));

		// Act
		this.oCard.placeAt(DOM_RENDER_LOCATION);
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

	QUnit.test("Actions toolbar disappears and hides the parent header when it's empty", function (assert) {
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
		Core.applyChanges();

		oCard.attachEventOnce("_ready", function () {
			// Assert
			assert.notOk(oCard.getCardHeader(), "Card header shouldn't be created only to show actions toolbar header");
			assert.ok(oCard.getDomRef().classList.contains("sapFCardNoHeader"), "The card has correct CSS class");

			// Act
			oCard.destroyActionDefinitions();
			Core.applyChanges();

			setTimeout(function () {
				// Assert
				assert.notOk(oCard.getCardHeader(), "Card header shouldn't be created only to show actions toolbar header");
				assert.ok(oCard.getDomRef().classList.contains("sapFCardNoHeader"), "The card still has correct CSS class");

				oCard.destroy();
				done();
			}, 300);
		});
	});
});
