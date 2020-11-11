/* global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/ActionDefinition",
	"sap/ui/integration/widgets/Card"
], function (
	Core,
	ActionDefinition,
	Card
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
			Core.applyChanges();
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
});
