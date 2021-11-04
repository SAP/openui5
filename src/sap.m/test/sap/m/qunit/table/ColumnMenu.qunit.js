/*global QUnit*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/m/table/ColumnMenu",
	"sap/m/table/QuickAction",
	"sap/m/table/Item",
	"sap/m/Button"
], function (QUnitUtils, ColumnMenu, QuickAction, Item, Button) {
	"use strict";
	// Test setup

	var sText = "Test";

	QUnit.module("Plain Menu", {
		beforeEach: function () {
			this.oColumnMenu = new ColumnMenu();

			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Initialize empty ColumnMenu", function (assert) {
		assert.ok(this.oColumnMenu);
	});

	QUnit.module("Complex Menu", {
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

			this.oColumnMenu = new ColumnMenu({
				quickActions: aQuickActions,
				items: aItems,
				_quickActions: aPQuickActions,
				_items: aPItems
			});
		},
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Destroy column menu and its instances", function (assert) {
		this.createMenu(false);
		this.oColumnMenu.destroy();
		assert.ok(this.oColumnMenu.isDestroyed());
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

	QUnit.module("Rendering", {
		createMenu: function (bQuickActions, bItems, bPQuickActions, bPItems) {
			var aQuickActions = [new QuickAction({label: sText, content: new Button({text: sText})})];
			var aPQuickActions = [new QuickAction({label: sText, content: new Button({text: sText})})];
			var aItems = [
				new Item({label: sText, content: new Button({text: sText})}),
				new Item({label: sText, content: new Button({text: sText})})
			];
			var aPItems = [new Item({label: sText, content: new Button({text: sText})})];

			this.oColumnMenu = new ColumnMenu({
				quickActions: bQuickActions ? aQuickActions : undefined,
				items: bItems ? aItems : undefined,
				_quickActions: bPQuickActions ? aPQuickActions : null,
				_items: bPItems ? aPItems : null
			});
		},
		beforeEach: function () {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});


	QUnit.test("Open popover", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		assert.ok(this.oColumnMenu._oPopover.isOpen());
	});

	QUnit.test("Check hidden header and footer in default view", function (assert) {
		this.createMenu(false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowHeader());
		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowFooter());
	});

	QUnit.test("View switch event", function (assert) {
		this.createMenu(false, false, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var aCalls = [],
			fnViewSwitch = function (oEvt) {
				aCalls.push({source: oEvt.getParameter("source"), target: oEvt.getParameter("target")});
			},
			oSpy = this.spy(fnViewSwitch);
		this.oColumnMenu._oItemsContainer.attachEvent("afterViewSwitch", oSpy);


		var sId = this.oColumnMenu.getAggregation("_items")[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);

		assert.equal(oSpy.callCount, 1);
		assert.equal(aCalls[0].source, "$default");
		assert.equal(aCalls[0].target, sId);
	});

	QUnit.test("Check focus when control specific items are given", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific items are given", function (assert) {
		this.createMenu(true, true, true, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only quick actions are given", function (assert) {
		this.createMenu(true, false, true, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var sId = this.oColumnMenu.getAggregation("_quickActions")[0].getContent().getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific quick actions are given", function (assert) {
		this.createMenu(true, false, false, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		var sId = this.oColumnMenu.getQuickActions()[0].getContent().getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when view is switched", function (assert) {
		this.createMenu(false, false, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to item
		var sId = this.oColumnMenu.getAggregation("_items")[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);

		sap.ui.getCore().applyChanges();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavBackBtn().getId());
	});

	QUnit.test("Check focus when view is switched back", function (assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to item
		var sId = this.oColumnMenu.getItems()[1].getId(); // Third item (Control Item, App Item, *App Item*)
		this.oColumnMenu._oItemsContainer.switchView(sId);
		sap.ui.getCore().applyChanges();

		// Navigate to item
		this.oColumnMenu._oItemsContainer.switchView("$default");
		sap.ui.getCore().applyChanges();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[2].getId());
	});

	QUnit.module("Button states", {
		beforeEach: function () {
			this.oItem = new Item({label: sText, content: new Button({text: sText})});
			this.oColumnMenu = new ColumnMenu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [this.oItem]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
			this.oItem.destroy();
		}
	});

	QUnit.test("Check default button settings", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		sap.ui.getCore().applyChanges();

		assert.ok(this.oColumnMenu._oBtnOk.getVisible());
		assert.ok(this.oColumnMenu._oBtnCancel.getVisible());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());

		assert.ok(this.oColumnMenu._oBtnOk.getEnabled());
		assert.ok(this.oColumnMenu._oBtnCancel.getEnabled());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
	});

	QUnit.test("Switch reset button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		sap.ui.getCore().applyChanges();

		this.oItem.changeButtonSettings({
			reset: {visible: false}
		});
		sap.ui.getCore().applyChanges();

		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oItem.getButtonSettings()["reset"]["visible"]);

		this.oItem.changeButtonSettings({
			reset: {visible: true, enabled: false}
		});
		sap.ui.getCore().applyChanges();

		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
		assert.ok(this.oItem.getButtonSettings()["reset"]["visible"]);
		assert.notOk(this.oItem.getButtonSettings()["reset"]["enabled"]);
	});

	QUnit.test("Switch cancel button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		sap.ui.getCore().applyChanges();

		this.oItem.changeButtonSettings({
			cancel: {visible: false}
		});
		sap.ui.getCore().applyChanges();

		assert.notOk(this.oColumnMenu._oBtnCancel.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["cancel"]["visible"]);
	});

	QUnit.test("Switch confirm button states", function (assert) {
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);

		sap.ui.getCore().applyChanges();

		// Navigate to first item
		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		sap.ui.getCore().applyChanges();

		this.oItem.changeButtonSettings({
			confirm: {visible: false}
		});
		sap.ui.getCore().applyChanges();

		assert.notOk(this.oColumnMenu._oBtnOk.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["confirm"]["visible"]);
	});
});