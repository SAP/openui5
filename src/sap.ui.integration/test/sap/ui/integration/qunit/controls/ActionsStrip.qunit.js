/* global QUnit */

sap.ui.define([
	"sap/ui/integration/controls/ActionsStrip",
	"sap/ui/integration/widgets/Card",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/library",
	"sap/ui/qunit/utils/nextUIUpdate",
	"qunit/testResources/nextCardReadyEvent"
], function (
	ActionsStrip,
	Card,
	JSONModel,
	coreLibrary,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	const AriaHasPopup = coreLibrary.aria.HasPopup;

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

	QUnit.test("No items defined with empty array", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create([], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		// Assert
		assert.strictEqual(aItems.length, 0, "ActionsStrip toolbar has 0 items.");
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
		const oActionsStrip = ActionsStrip.create([
			{ text: "Text1" },
			{ text: "Text2", type: "Button" },
			{ text: "Text3", type: "Button", icon: "sap-icon://email" },
			{ text: "Text4", tooltip: "Text4 and long explanation", type: "Button", icon: "sap-icon://email", preferIcon: true },
			{ text: "Text5", type: "Button", icon: "sap-icon://email", preferIcon: true },
			{ tooltip: "Text6 and long explanation", type: "Button", icon: "sap-icon://email", preferIcon: true },
			{ tooltip: "Text7", type: "Button", icon: "sap-icon://email" }
		], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		// Assert
		assert.ok(aItems[1].isA("sap.m.Button"), "If no 'type' is specified, an sap.m.Button should be created");
		assert.ok(aItems[2].isA("sap.m.Button"), "If 'type' is set to 'Button', an sap.m.Button should be created");
		assert.ok(aItems[3].isA("sap.m.Button"), "If button has icon and text - a sap.m.Button is created");

		assert.ok(aItems[4].isA("sap.m.OverflowToolbarButton"), "If button has preferIcon=true - a sap.m.OverflowToolbarButton is created");
		assert.strictEqual(aItems[4].getText(), "Text4", "Button with icon has the correct text");
		assert.strictEqual(aItems[4].getTooltip(), "Text4 and long explanation", "Button with icon has the correct tooltip");

		assert.strictEqual(aItems[5].getTooltip(), "Text5", "Button with icon uses the text as tooltip if tooltip is empty");
		assert.strictEqual(aItems[6].getText(), "Text6 and long explanation", "Button with icon uses the tooltip as text if text is empty");

		assert.ok(aItems[7].isA("sap.m.OverflowToolbarButton"), "If button has icon and no text - a sap.m.OverflowToolbarButton is created");
		assert.strictEqual(aItems[7].getText(), "Text7", "If button has icon and no text - the tooltip is used for text");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("type=Link", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create([
			{ text: "Text", type: "Link" },
			{ text: "Text", type: "Link", "icon": "sap-icon://email" }
		], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		// Assert
		assert.ok(aItems[1].isA("sap.m.Link"), "If type is Link we create sap.m.Link");
		assert.strictEqual(aItems[2].getIcon(), "sap-icon://email", "Link with icon works correctly");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Automatic ariaHasPopup", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create([
			{ text: "Item"},
			{ text: "Item", type: "Button", actions: [ { type: "ShowCard"}] },
			{ text: "Item", type: "Link", actions: [ { type: "ShowCard"}] },
			{ text: "Item", actions: [ { type: "Navigation"}] },
			{ text: "Item", ariaHasPopup: AriaHasPopup.None, actions: [ { type: "ShowCard"}] },
			{ text: "Item", ariaHasPopup: AriaHasPopup.Grid, actions: [ { type: "ShowCard"}] },
			{ text: "Item", ariaHasPopup: AriaHasPopup.Dialog }
		], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		// Assert
		assert.strictEqual(aItems[1].getAriaHasPopup(), AriaHasPopup.None, "Item with hasAriaPopup=None when no actions");

		assert.strictEqual(aItems[2].getAriaHasPopup(), AriaHasPopup.Dialog, "Button with hasAriaPopup=Dialog when action ShowCard");
		assert.strictEqual(aItems[3].getAriaHasPopup(), AriaHasPopup.Dialog, "Link with hasAriaPopup=Dialog when action ShowCard");

		assert.strictEqual(aItems[4].getAriaHasPopup(), AriaHasPopup.None, "Item with hasAriaPopup=None when action Navigation");
		assert.strictEqual(aItems[5].getAriaHasPopup(), AriaHasPopup.None, "Item with hasAriaPopup=None explicitly set by property, ignoring ShowCard");
		assert.strictEqual(aItems[6].getAriaHasPopup(), AriaHasPopup.Grid, "Item with hasAriaPopup=Grid explicitly set by property, ignoring ShowCard");
		assert.strictEqual(aItems[7].getAriaHasPopup(), AriaHasPopup.Dialog, "Item with hasAriaPopup=Dialog explicitly set by property");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("type=Label", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create([
			{ text: "Text1", type: "Label"}
		], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		// Assert
		assert.ok(aItems[1].isA("sap.m.Label"), "If 'type' is set to 'Label', an sap.m.Label should be created");
		assert.strictEqual(aItems[1].getText(), "Text1", "The label text is correct");

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

	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oCard = new Card();
		},
		afterEach: function () {
			this.oCard.destroy();
		}
	});

	QUnit.test("Buttons with disabled/enabled state", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create([
			{
				text: "Button1",
				actions: [{
					type: "Custom"
				}]
			},
			{
				text: "Button2",
				actions: [{
					enabled: false,
					type: "Custom"
				}]
			},
			{
				text: "Button3",
				actions: [{
					enabled: true,
					type: "Custom"
				}]
			},
			{
				text: "Button4"
			}
		], this.oCard);

		const aItems = oActionsStrip._getToolbar().getContent();

		assert.ok(aItems[1].getEnabled(), "Item with action is enabled.");
		assert.notOk(aItems[2].getEnabled(), "Item with action with enabled:false is disabled.");
		assert.ok(aItems[3].getEnabled(), "Item with action with enabled:true is enabled.");
		assert.ok(aItems[4].getEnabled(), "Item without action action is enabled.");

		oActionsStrip.disableItems();

		assert.notOk(aItems[1].getEnabled(), "Item with action is disabled after disableItems().");
		assert.notOk(aItems[2].getEnabled(), "Item with action with enabled:false is disabled after disableItems().");
		assert.notOk(aItems[3].getEnabled(), "Item with action with enabled:true is disabled after disableItems().");
		assert.notOk(aItems[4].getEnabled(), "Item without action is disabled after disableItems().");

		oActionsStrip.enableItems();

		assert.ok(aItems[1].getEnabled(), "Item with action is enabled after enableItems().");
		assert.notOk(aItems[2].getEnabled(), "Item with action with enabled:false is disabled after enableItems().");
		assert.ok(aItems[3].getEnabled(), "Item with action with enabled:true is enabled after enableItems().");
		assert.ok(aItems[4].getEnabled(), "Item without action is enabled after enableItems().");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("ActionStrip with initial disabled buttons", function (assert) {
		// Arrange
		const oActionsStrip = ActionsStrip.create(
			[
				{
					text: "Button1",
					actions: [{
						type: "Custom"
					}]
				},
				{
					text: "Button2",
					actions: [{
						enabled: false,
						type: "Custom"
					}]
				},
				{
					text: "Button3",
					actions: [{
						enabled: true,
						type: "Custom"
					}]
				},
				{
					text: "Button4"
				}
			],
			this.oCard,
			true
		);

		const aItems = oActionsStrip._getToolbar().getContent();

		assert.notOk(aItems[1].getEnabled(), "Item with action is disabled initially.");
		assert.notOk(aItems[2].getEnabled(), "Item with action with enabled:false is disabled initially.");
		assert.notOk(aItems[3].getEnabled(), "Item with action with enabled:true is disabled initially.");
		assert.ok(aItems[4].getEnabled(), "Item without action is still enabled initially.");

		oActionsStrip.enableItems();

		assert.ok(aItems[1].getEnabled(), "Item with action is enabled after enableItems().");
		assert.notOk(aItems[2].getEnabled(), "Item with action with enabled:false is disabled after enableItems().");
		assert.ok(aItems[3].getEnabled(), "Item with action with enabled:true is enabled after enableItems().");
		assert.ok(aItems[4].getEnabled(), "Item without action is enabled after enableItems().");

		// Clean up
		oActionsStrip.destroy();
	});

	QUnit.test("Card action is fired when button is pressed", async function (assert) {
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

		await nextUIUpdate();
		this.oCard.attachAction(function (oEvent) {
			// Assert
			assert.ok(true, "Card action should be fired when button is pressed");

			// Clean up
			oActionsStrip.destroy();
		});

		// Act
		oActionsStrip._getToolbar().getContent()[1].$().trigger("tap");
	});

	QUnit.test("Card action is fired when button is pressed, item created from template", async function (assert) {
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

		await nextUIUpdate();
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

	QUnit.test("Actions are disabled when some loading placeholder is active", async function (assert) {
		// Arrange
		var done = assert.async();

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

		this.oCard.placeAt(DOM_RENDER_LOCATION);

		await nextCardReadyEvent(this.oCard);

		var oFooter = this.oCard.getAggregation("_footer"),
			aItems = oFooter.getActionsStrip()._getToolbar().getContent();

		assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
		assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
		assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
		assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");

		this.oCard.showLoadingPlaceholders();
		await nextUIUpdate();

		aItems.forEach(function (oItem) {
			if (oItem.getEnabled) {
				assert.notOk(oItem.getEnabled(), "Item is disabled after showLoadingPlaceholders()");
			}
		});

		this.oCard.hideLoadingPlaceholders();
		await nextUIUpdate();

		assert.notOk(aItems[1].getEnabled(), "Enabled value is correct");
		assert.ok(aItems[2].getEnabled(), "Enabled value is correct");
		assert.ok(aItems[3].getEnabled(), "Enabled value is correct");
		assert.notOk(aItems[4].getEnabled(), "Enabled value is correct");
	});
});