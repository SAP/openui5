/* global QUnit */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/widgets/Card",
	"sap/ui/model/json/JSONModel"
], function (
	Core,
	ActionsStrip,
	Card,
	JSONModel
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Initialization of items", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("No items defined", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create(null, this.oCard);

		// Assert
		assert.notOk(oActionsStrip, "ActionsStrip is not created.");
	});

	QUnit.test("2 items defined", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create([
			{ text: "Text1" },
			{ text: "Text2" }
		], this.oCard);

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 3, "There should be 3 items added to the toolbar (including ToolbarSpacer)");
		assert.ok(oActionsStrip._getToolbar().getContent()[0].isA("sap.m.ToolbarSpacer"), "First item should be ToolbarSpacer");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Explicitly added ToolbarSpacer", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create([
			{ text: "Text1" },
			{ text: "Text2", type: "ToolbarSpacer" }
		], this.oCard);

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 2, "There should be 2 items added to the toolbar");
		assert.ok(oActionsStrip._getToolbar().getContent()[1].isA("sap.m.ToolbarSpacer"), "Second item should be ToolbarSpacer");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("type=Button", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create([
			{ text: "Text1" },
			{ text: "Text2", type: "Button" }
		], this.oCard);

		// Assert
		assert.ok(oActionsStrip._getToolbar().getContent()[1].isA("sap.m.Button"), "If no 'type' is specified, an sap.m.Button should be created");
		assert.ok(oActionsStrip._getToolbar().getContent()[2].isA("sap.m.Button"), "If 'type' is set to 'Button', an sap.m.Button should be created");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Item template", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create({
			item: {
				template: {
					text: "{text}"
				},
				path: "actionsStrip"
			}
		}, this.oCard);
		oActionsStrip.setModel(new JSONModel({
			listItems: [{
				text: "item 1",
				actionsStrip: [
					{ text: "Action 1" },
					{ text: "Action 2" }
				]
			}]
		}));
		oActionsStrip.bindObject({ path: "/listItems/0" });

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 0, "There are no items created initially");

		// Act
		oActionsStrip.onDataChanged();

		// Assert
		const aContent = oActionsStrip._getToolbar().getContent();
		assert.strictEqual(aContent.length, 3, "There are 3 items created");
		assert.ok(aContent[0].isA("sap.m.ToolbarSpacer"), "First item should be ToolbarSpacer");
		assert.strictEqual(aContent[1].getText(), "Action 1", "Property binding is correctly resolved");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Item template with absolute path", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create({
			item: {
				template: {
					text: "{text}"
				},
				path: "/genericActions"
			}
		}, this.oCard);
		oActionsStrip.setModel(new JSONModel({
			genericActions: [{
				text: "Generic action 1"
			}],
			listItems: [{
				text: "item 1",
				actionsStrip: [{
					text: "Action 1"
				}]
			}]
		}));
		oActionsStrip.bindObject({ path: "/listItems/0" });

		// Act
		oActionsStrip.onDataChanged();

		// Assert
		const aContent = oActionsStrip._getToolbar().getContent();
		assert.strictEqual(aContent[1].getText(), "Generic action 1", "Property binding is correctly resolved");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Item template when there is no data", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create({
			item: {
				template: {
					text: "{text}"
				}
			}
		}, this.oCard);
		oActionsStrip.setModel(new JSONModel());
		oActionsStrip.bindObject({ path: "/listItems/0/actionsStrip" });

		// Act
		oActionsStrip.onDataChanged();

		// Assert
		assert.strictEqual(oActionsStrip._getToolbar().getContent().length, 0, "There are no items created");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Card action is fired when button is pressed", function (assert) {
		// Arrange
		var oActionsStrip = ActionsStrip.create([
			{
				text: "Text1",
				actions: [{
					type: "Custom"
				}]
			}
		], this.oCard);
		oActionsStrip.placeAt(DOM_RENDER_LOCATION);
		oActionsStrip.enableItems();

		Core.applyChanges();
		this.oCard.attachAction(function (oEvent) {
			// Assert
			assert.ok(true, "Card action should be fired when button is pressed");

			// Clean up
			oActionsStrip.destroy();
		});

		// Act
		oActionsStrip._getToolbar().getContent()[1].$().trigger("tap");
	});

	QUnit.test("Card action is fired when button is pressed, item created from template", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create({
			item: {
				template: {
					text: "{text}",
					actions: [{
						type: "Custom",
						parameters: {
							id: "{parent>/listItemId}",
							text: "{text}"
						}
					}]
				},
				path: "actionsStrip"
			}
		}, this.oCard);
		oActionsStrip.setModel(new JSONModel({
			listItems: [{
				listItemId: "123",
				text: "item 1",
				actionsStrip: [
					{ text: "Action 1" },
					{ text: "Action 2" }
				]
			}]
		}));
		oActionsStrip.bindObject({ path: "/listItems/0" });
		oActionsStrip.placeAt(DOM_RENDER_LOCATION);
		oActionsStrip.enableItems();
		oActionsStrip.onDataChanged();

		Core.applyChanges();
		this.oCard.attachAction(function (oEvent) {
			// Assert
			assert.ok(true, "Card action should be fired when button is pressed");
			assert.strictEqual(oEvent.getParameter("parameters").text, "Action 1", "Binding to own context is correctly resolved");
			assert.strictEqual(oEvent.getParameter("parameters").id, "123", "Binding to parent context is correctly resolved");

			// Clean up
			oActionsStrip.destroy();
		});

		// Act
		oActionsStrip._getToolbar().getContent()[1].$().trigger("tap");
	});

	QUnit.module("Enabled state", {
		beforeEach: function () {
			this.oCard = new Card({
				manifest: "test-resources/sap/ui/integration/qunit/testResources/card.footer.actions.manifest.json"
			});
		},
		afterEach: function () {
			this.oCard.destroy();
			this.oCard = null;
		}
	});

	QUnit.test("Actions are disabled when some loading placeholder is active", function (assert) {
		// Arrange
		var done = assert.async(2);

		this.oCard.attachEvent("_footerReady", function () {
			var oFooter = this.oCard.getAggregation("_footer"),
				aItems = oFooter.getActionsStrip()._getToolbar().getContent();

			aItems.forEach(function (oItem, i) {
				if (oItem.getEnabled) {
					assert.notOk(oItem.getEnabled(), `Item ${i} is initially disabled`);
				}
			});

			done();
		}.bind(this));

		this.oCard.attachEvent("_ready", function () {
			var oFooter = this.oCard.getAggregation("_footer"),
				aItems = oFooter.getActionsStrip()._getToolbar().getContent();

			assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
			assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");

			this.oCard.showLoadingPlaceholders();
			Core.applyChanges();
			aItems.forEach(function (oItem) {
				if (oItem.getEnabled) {
					assert.notOk(oItem.getEnabled(), "Item is disabled after showLoadingPlaceholders()");
				}
			});

			this.oCard.hideLoadingPlaceholders();
			Core.applyChanges();
			assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
			assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
			assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");

			done();
		}.bind(this));

		this.oCard.placeAt(DOM_RENDER_LOCATION);
	});
});