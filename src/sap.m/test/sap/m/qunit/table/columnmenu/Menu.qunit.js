/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/Item",
	"sap/m/Button",
	"sap/ui/core/Core",
	"sap/ui/layout/GridData"
], function (QUnitUtils, Menu, QuickAction, Item, Button, oCore, GridData) {
	"use strict";
	// Test setup

	var sText = "Test";

	QUnit.module("Initialization", {
		createMenu: function (bMultiple) {
			var aQuickActions = [];
			var aPQuickActions = [];
			var aItems = [];
			var aPItems = [];

			aQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
			aPQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
			aItems.push(new Item({label: sText, content: new Button({text: sText})}));
			aPItems.push(new Item({label: sText, content: new Button({text: sText})}));

			if (bMultiple) {
				for (var i = 0; i < 2; i++) {
					aQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
					aPQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
					aItems.push(new Item({label: sText, content: new Button({text: sText})}));
					aPItems.push(new Item({label: sText, content: new Button({text: sText})}));
				}
			}

			this.oColumnMenu = new Menu({
				quickActions: aQuickActions,
				items: aItems,
				_quickActions: aPQuickActions,
				_items: aPItems
			});
		},
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Internal instances", function (assert) {
		this.createMenu(false);
		assert.notOk(this.oColumnMenu._oPopover, "sap.m.ResponsivePopover not created before opening");
		assert.notOk(this.oColumnMenu._oItemsContainer, "sap.m.p13n.Container not created before opening");

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu._oPopover, "sap.m.ResponsivePopover created on opening");
		assert.ok(this.oColumnMenu._oItemsContainer, "sap.m.p13n.Container created on opening");
	});

	QUnit.test("Initialize ColumnMenu with singular content", function (assert) {
		this.createMenu(false);
		this.oColumnMenu.openBy(this.oButton);

		assert.ok(this.oColumnMenu);
		assert.ok(this.oColumnMenu.getQuickActions());
		assert.ok(this.oColumnMenu.getItems());
		assert.ok(this.oColumnMenu.getAggregation("_quickActions"));
		assert.ok(this.oColumnMenu.getAggregation("_items"));
		assert.ok(this.oColumnMenu.getQuickActions().length === 1);
		assert.ok(this.oColumnMenu.getItems().length === 1);
		assert.ok(this.oColumnMenu.getAggregation("_quickActions").length === 1);
		assert.ok(this.oColumnMenu.getAggregation("_items").length === 1);
	});

	QUnit.test("Initialize ColumnMenu with multiple content", function (assert) {
		this.createMenu(true);
		this.oColumnMenu.openBy(this.oButton);

		assert.ok(this.oColumnMenu);
		assert.ok(this.oColumnMenu.getQuickActions());
		assert.ok(this.oColumnMenu.getItems());
		assert.ok(this.oColumnMenu.getAggregation("_quickActions"));
		assert.ok(this.oColumnMenu.getAggregation("_items"));
		assert.ok(this.oColumnMenu.getQuickActions().length === 3);
		assert.ok(this.oColumnMenu.getItems().length === 3);
		assert.ok(this.oColumnMenu.getAggregation("_quickActions").length === 3);
		assert.ok(this.oColumnMenu.getAggregation("_items").length === 3);
	});

	QUnit.module("Destruction", {
		beforeEach: function() {
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [new Item({label: sText, content: new Button({text: sText})})],
				_quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				_items: [new Item({label: sText, content: new Button({text: sText})})]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Internal instances", function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		var oResponsivePopover = this.oColumnMenu._oPopover;
		var oItemsContainer = this.oColumnMenu._oItemsContainer;

		this.oColumnMenu.destroy();
		assert.ok(oResponsivePopover.isDestroyed(), "sap.m.ResponsivePopover destroyed");
		assert.ok(oItemsContainer.isDestroyed(), "sap.m.p13n.Container destroyed");
		assert.notOk(this.oColumnMenu._oPopover, "Reference to sap.m.ResponsivePopover cleared");
		assert.notOk(this.oColumnMenu._oItemsContainer, "Reference to sap.m.p13n.Container cleared");
	});

	QUnit.module("Rendering", {
		createMenu: function (bQuickActions, bItems, bPQuickActions, bPItems) {
			var aQuickActions = [new QuickAction({label: sText, content: new Button({text: sText})})];
			var aPQuickActions = [new QuickAction({label: sText, content: new Button({text: sText})})];
			var aItems = [
				new Item({label: sText, content: new Button({text: sText})}),
				new Item({label: sText, content: new Button({text: sText})})
			];
			var aPItems = [new Item({label: sText, content: new Button({text: sText})})];

			this.oColumnMenu = new Menu({
				quickActions: bQuickActions ? aQuickActions : undefined,
				items: bItems ? aItems : undefined,
				_quickActions: bPQuickActions ? aPQuickActions : null,
				_items: bPItems ? aPItems : null
			});
		},
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Open popover by a control", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu._oPopover.isOpen());
	});

	QUnit.test("Open popover by an HTMLElement", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton.getDomRef());
		assert.ok(this.oColumnMenu._oPopover.isOpen());
	});

	QUnit.test("Check hidden header and footer in default view", function (assert) {
		this.createMenu(false);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowHeader());
		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowFooter());
	});

	QUnit.test("View switch event", function (assert) {
		this.createMenu(false, false, true, true);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		var aCalls = [],
			fnViewSwitch = function (oEvt) {
				aCalls.push({source: oEvt.getParameter("source"), target: oEvt.getParameter("target")});
			},
			oSpy = this.spy(fnViewSwitch);
		this.oColumnMenu._oItemsContainer.attachEvent("afterViewSwitch", oSpy);

		var sId = this.oColumnMenu.getAggregation("_items")[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		this.clock.tick(500);

		assert.equal(oSpy.callCount, 1);
		assert.equal(aCalls[0].source, "$default");
		assert.equal(aCalls[0].target, sId);
	});

	QUnit.test("Check focus when control specific items are given", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);
		oCore.applyChanges();

		var sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific items are given", function (assert) {
		this.createMenu(true, true, true, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);
		oCore.applyChanges();

		var sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only quick actions are given", function (assert) {
		this.createMenu(true, false, true, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);
		oCore.applyChanges();

		var sId = this.oColumnMenu.getAggregation("_quickActions")[0].getContent()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific quick actions are given", function (assert) {
		this.createMenu(true, false, false, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);
		oCore.applyChanges();

		var sId = this.oColumnMenu.getQuickActions()[0].getContent()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when view is switched", function (assert) {
		this.createMenu(false, false, true, true);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to item
		var sId = this.oColumnMenu.getAggregation("_items")[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		this.clock.tick(500);
		oCore.applyChanges();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavBackBtn().getId());
	});

	QUnit.test("Check focus when view is switched back", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to item
		var sId = this.oColumnMenu.getItems()[1].getId(); // Third item (Control Item, App Item, *App Item*)
		this.oColumnMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		// Navigate to item
		this.oColumnMenu._oItemsContainer.switchView("$default");
		oCore.applyChanges();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[2].getId());
	});

	QUnit.module("Button states", {
		beforeEach: function () {
			this.oItem = new Item({label: sText, content: new Button({text: sText})});
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [this.oItem]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
			this.oItem.destroy();
		}
	});

	QUnit.test("Check default button settings", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		assert.ok(this.oColumnMenu._oBtnOk.getVisible());
		assert.ok(this.oColumnMenu._oBtnCancel.getVisible());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());

		assert.ok(this.oColumnMenu._oBtnOk.getEnabled());
		assert.ok(this.oColumnMenu._oBtnCancel.getEnabled());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
	});

	QUnit.test("Switch reset button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		this.oItem.changeButtonSettings({
			reset: {visible: false}
		});
		oCore.applyChanges();

		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oItem.getButtonSettings()["reset"]["visible"]);

		this.oItem.changeButtonSettings({
			reset: {visible: true, enabled: false}
		});
		oCore.applyChanges();

		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
		assert.ok(this.oItem.getButtonSettings()["reset"]["visible"]);
		assert.notOk(this.oItem.getButtonSettings()["reset"]["enabled"]);
	});

	QUnit.test("Switch cancel button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		this.oItem.changeButtonSettings({
			cancel: {visible: false}
		});
		oCore.applyChanges();

		assert.notOk(this.oColumnMenu._oBtnCancel.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["cancel"]["visible"]);
	});

	QUnit.test("Switch confirm button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		this.oItem.changeButtonSettings({
			confirm: {visible: false}
		});
		oCore.applyChanges();

		assert.notOk(this.oColumnMenu._oBtnOk.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["confirm"]["visible"]);
	});

	QUnit.module("Control tree", {
		beforeEach: function () {
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [new Item({label: sText, content: new Button({text: sText})})],
				_quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				_items: [new Item({label: sText, content: new Button({text: sText})})]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Without parent", function (assert) {
		assert.notOk(this.oColumnMenu.getUIArea(), "Before opening, the menu has no connection to the UIArea");

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.getUIArea(), "After opening, the menu has a connection to the UIArea");
		assert.equal(this.oColumnMenu.getUIArea(), this.oColumnMenu.getParent(), "After opening, the UIArea is the parent");
	});

	QUnit.test("With parent", function (assert) {
		this.oButton.addDependent(this.oColumnMenu);
		assert.equal(this.oColumnMenu.getUIArea(), this.oButton.getUIArea(), "Before opening, the UIArea is inherited from the parent");

		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu.getUIArea(), this.oButton.getUIArea(), "After opening, the UIArea is inherited from the parent");
		assert.equal(this.oColumnMenu.getParent(), this.oButton, "After opening, the parent is unchanged");
	});

	QUnit.module("Quick Action Container", {
		beforeEach: function () {
			this.oColumnMenu = new Menu({
				quickActions: [
					new QuickAction({
						label: sText,
						content: new Button({
							text: sText,
							layoutData: new GridData({spanS: 2, spanM: 2, spanL: 2, spanXL: 2})
						})
					}),
					new QuickAction({
						label: sText,
						content: new Button({text: sText})
					})
				],
				items: [new Item({label: sText, content: new Button({text: sText})})],
				_quickActions: [
					new QuickAction({label: sText, content: [new Button({text: sText + "1"}), new Button({text: sText + "2"})]}),
					new QuickAction({label: sText, content: [
						new Button({text: sText + "1"}),
						new Button({text: sText + "2"}),
						new Button({text: sText + "3"})
					]})
				],
				_items: [new Item({label: sText, content: new Button({text: sText})})]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Check form content", function (assert) {
		var oControl;
		this.oColumnMenu.openBy(this.oButton);

		var oContainer = this.oColumnMenu._oForm.getFormContainers()[0];
		var aFormElements = oContainer.getFormElements();

		// First Quick Action, expected S(6), M(4)
		assert.equal(aFormElements[0].getLabel().getText(), sText, "First Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[0].getFields()[0].getControl());
		assert.equal(aFormElements[0].getFields()[0].getLayoutData().getSpanS(), 6, "Span S is set correctly to 6");
		assert.equal(aFormElements[0].getFields()[0].getLayoutData().getSpanM(), 4, "Span M is set correctly to 4");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "1", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[0].getFields()[1].getControl());
		assert.equal(aFormElements[0].getFields()[1].getLayoutData().getSpanS(), 6, "Span S is set correctly to 6");
		assert.equal(aFormElements[0].getFields()[1].getLayoutData().getSpanM(), 4, "Span M is set correctly to 4");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "2", "Correct button with correct button text");

		// Second Quick Action, expected S(12), M(2)
		assert.equal(aFormElements[1].getLabel().getText(), sText, "Second Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[0].getControl());
		assert.equal(aFormElements[1].getFields()[0].getLayoutData().getSpanS(), 12, "Span S is set correctly to 12");
		assert.equal(aFormElements[1].getFields()[0].getLayoutData().getSpanM(), 2, "Span M is set correctly to 2");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "1", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[1].getControl());
		assert.equal(aFormElements[1].getFields()[1].getLayoutData().getSpanS(), 12, "Span S is set correctly to 12");
		assert.equal(aFormElements[1].getFields()[1].getLayoutData().getSpanM(), 2, "Span M is set correctly to 2");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "2", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[2].getControl());
		assert.equal(aFormElements[1].getFields()[2].getLayoutData().getSpanS(), 12, "Span S is set correctly to 12");
		assert.equal(aFormElements[1].getFields()[2].getLayoutData().getSpanM(), 2, "Span M is set correctly to 2");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "3", "Correct button with correct button text");

		// Third QuickAction, expected custom S(2), M(2)
		assert.equal(aFormElements[2].getLabel().getText(), sText, "Third Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[2].getFields()[0].getControl());
		assert.equal(aFormElements[2].getFields()[0].getLayoutData().getSpanS(), 2, "Span S is set correctly to 2");
		assert.equal(aFormElements[2].getFields()[0].getLayoutData().getSpanM(), 2, "Span M is set correctly to 2");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText, "Correct button with correct button text");

		// Fourth QuickAction, expected S(12), M(8)
		assert.equal(aFormElements[3].getLabel().getText(), sText, "Fourth Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[3].getFields()[0].getControl());
		assert.equal(aFormElements[3].getFields()[0].getLayoutData().getSpanS(), 12, "Span S is set correctly to 12");
		assert.equal(aFormElements[3].getFields()[0].getLayoutData().getSpanM(), 8, "Span M is set correctly to 8");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText, "Correct button with correct button text");
	});
});