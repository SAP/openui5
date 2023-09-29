/*global QUnit, sinon*/
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickActionContainer",
	"sap/m/table/columnmenu/Item",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/Button",
	"sap/m/ComboBox",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/ui/base/Event",
	"sap/ui/core/Item",
	"sap/ui/core/Core",
	"sap/ui/core/StaticArea",
	"sap/ui/layout/GridData",
	"sap/ui/Device",
	"sap/ui/dom/containsOrEquals"
], function(
	QUnitUtils,
	createAndAppendDiv,
	Menu,
	QuickAction,
	QuickActionContainer,
	Item,
	ActionItem,
	Button,
	ComboBox,
	Dialog,
	library,
	Event,
	CoreItem,
	oCore,
	StaticArea,
	GridData,
	Device,
	containsOrEquals
) {
	"use strict";
	// Test setup

	createAndAppendDiv("content");

	var sText = "Test";

	QUnit.module("Initialization", {
		createMenu: function (bMultiple) {
			var aQuickActions = [];
			var aPQuickActions = [];
			var aItems = [];
			var aPItems = [];

			aQuickActions.push(new QuickAction({label: sText})); //quick action without content
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
				new ActionItem({label: sText, press: function() {}}),
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
			this.oButton.placeAt("content");
			this.oButton1 = new Button();
			this.oButton1.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			if (this.oColumnMenu) {
				this.oColumnMenu.destroy();
			}
			this.oButton.destroy();
			this.oButton1.destroy();
		}
	});

	QUnit.test("_getAllEffectiveQuickActions", function(assert) {
		this.createMenu(true, true, false, false);
		var aQuickActions = this.oColumnMenu._getAllEffectiveQuickActions();
		assert.equal(aQuickActions.length, 1, "QuickAction is returned as effective action");

		this.oColumnMenu.getQuickActions()[0].setVisible(false);
		aQuickActions = this.oColumnMenu._getAllEffectiveQuickActions();
		assert.equal(aQuickActions.length, 0, "No QuickAction returned for effective actions");
	});

	QUnit.test("_getAllEffectiveItems", function(assert) {
		this.createMenu(true, true, false, false);
		this.oColumnMenu.openBy(this.oButton);
		var aItems = this.oColumnMenu._getAllEffectiveItems();
		assert.equal(aItems.length, 2, "2 Items are returned as effective items");

		this.oColumnMenu.getItems()[0].setVisible(false);
		aItems = this.oColumnMenu._getAllEffectiveItems();
		assert.deepEqual(aItems, [this.oColumnMenu.getItems()[1]], "Only second item is returned as effective item");
	});

	QUnit.test("isOpen", function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		var oIsOpenSpy = sinon.spy(this.oColumnMenu._oPopover, "isOpen");
		this.oColumnMenu.isOpen();
		assert.ok(oIsOpenSpy.calledOnce, "isOpen method of the popover is called");
	});

	QUnit.test("Open popup on mobile", function (assert) {
		this.stub(Device.system, "phone").value(true);
		this.createMenu(true, true, true, true);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "Popover was opened");
		assert.ok(this.oColumnMenu._oPopover.getShowHeader(), "Header is shown on mobile");
	});

	QUnit.test("Form containers and item container are created on open and destroyed on close", function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length);
		assert.ok(this.oColumnMenu._oItemsContainer);

		var oDestroyFormElementsSpy = sinon.spy(this.oColumnMenu._oQuickActionContainer, "destroyFormContainers");
		var oDestroyItemContainerSpy = sinon.spy(this.oColumnMenu._oItemsContainer, "destroy");
		this.oColumnMenu.close();
		assert.ok(oDestroyFormElementsSpy.calledOnce);
		assert.ok(oDestroyItemContainerSpy.calledOnce);
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

		var sId = this.oColumnMenu._getAllEffectiveQuickActions()[0].getContent()[0].sId;
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific items are given", function (assert) {
		this.createMenu(true, true, true, false);
		this.oColumnMenu.openBy(this.oButton);
		this.clock.tick(500);
		oCore.applyChanges();

		var sId = this.oColumnMenu._getAllEffectiveQuickActions()[0].getContent()[0].sId;
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

	QUnit.test("Check focus when quick actions are reused in menus", function(assert) {
		var clock = sinon.useFakeTimers();
		var oMenu = new Menu({
			quickActions: [
				new QuickAction({
					label: "A",
					content: new Button({text: "Execute A"})
				})
			]
		});
		var oMenu1 = new Menu({
			quickActions: [
				new QuickAction({
					label: "B",
					content: new Button({text: "Execute B"})
				})
			]
		});
		var oReuseQuickAction = new QuickAction({label: sText, content: new Button({text: sText})});
		var oReuseQuickActionContainer = new QuickActionContainer();

		this.oButton.attachPress(function() {
			oMenu.removeAllAggregation("_quickActions");
			oReuseQuickActionContainer.addQuickAction(oReuseQuickAction);
			oMenu.addAggregation("_quickActions", oReuseQuickActionContainer);
			oMenu.openBy(this);
		});
		this.oButton.addDependent(oMenu);

		this.oButton1.attachPress(function () {
			oMenu1.removeAllAggregation("_quickActions");
			oReuseQuickActionContainer.addQuickAction(oReuseQuickAction);
			oMenu1.addAggregation("_quickActions", oReuseQuickActionContainer);
			oMenu1.openBy(this);
		});
		this.oButton1.addDependent(oMenu1);
		oCore.applyChanges();

		this.oButton.firePress();
		clock.tick(1000);
		assert.ok(containsOrEquals(oMenu.getDomRef(), document.activeElement));

		this.oButton1.firePress();
		clock.tick(1000);
		assert.ok(containsOrEquals(oMenu1.getDomRef(), document.activeElement));
	});

	QUnit.test("Check visibility", function (assert) {
		var clock = sinon.useFakeTimers();
		function getActiveItems(oColumnMenu) {
			return oColumnMenu._oItemsContainer._getNavigationList().getItems().filter(function (oItem) {
				return oItem.getVisible();
			});
		}
		// Menu has 2 Quick Actions (1 Private, 1 Public), 2 Items (both Public)
		this.createMenu(true, true, true, false);

		// Initial State
		this.oColumnMenu.openBy(this.oButton);

		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 2, "All quick actions are visible");
		assert.equal(getActiveItems(this.oColumnMenu).length, 2, "All items are visible");

		// Public Quick Action hidden
		this.oColumnMenu.getQuickActions()[0].setVisible(false);
		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 1, "Only one quick action visible");

		// One item hidden
		this.oColumnMenu.getItems()[0].setVisible(false);
		assert.equal(getActiveItems(this.oColumnMenu).length, 1, "Only one item visible");

		// All items hidden
		this.oColumnMenu.getItems()[1].setVisible(false);
		assert.equal(getActiveItems(this.oColumnMenu).length, 0, "No items are visible");

		// All Quick Actions hidden
		this.oColumnMenu.getAggregation("_quickActions")[0].setVisible(false);
		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 0, "No quick actions are in the form");
		assert.notOk(document.getElementById(this.oColumnMenu.getId() + "-quickActions"), "Quick Actions Container is not rendered");

		// Make 1 QuickAction and 1 item visible
		this.oColumnMenu.getItems()[0].setVisible(true);
		this.oColumnMenu.getAggregation("_quickActions")[0].setVisible(true);
		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 1, "One quick action is visible");
		assert.equal(getActiveItems(this.oColumnMenu).length, 1, "One item is visible");

		this.oColumnMenu.close();
		clock.tick(500);

		// Check Visibility when using a QuickActionContainer
		var oQuickAction1 = new QuickAction({label: sText, content: new Button({text: sText})});
		var oQuickAction2 = new QuickAction({label: sText, content: new Button({text: sText})});
		var oQuickActionContainer = new QuickActionContainer({quickActions: [oQuickAction1, oQuickAction2]});
		this.oColumnMenu.addQuickAction(oQuickActionContainer);

		// Case A: Both QuickActions in the container should be visible
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 3, "Three quick actions are visible");

		this.oColumnMenu.close();

		// Case B: Container should not be visible
		oQuickActionContainer.setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 1, "One quick actions is visible");

		this.oColumnMenu.close();

		// Case C: One QuickAction in the container is hidden
		oQuickActionContainer.setVisible(true);
		oQuickAction1.setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		assert.equal(this.oColumnMenu._oQuickActionContainer.getFormContainers()[0].getFormElements().length, 2, "Two quick actions are visible");
	});

	QUnit.test("Add menu item", function (assert) {
		var clock = sinon.useFakeTimers();
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		var aItems = this.oColumnMenu._oItemsContainer._getNavigationList().getItems();
		assert.equal(aItems.length, 3, "Menu has exactly 3 items");

		this.oColumnMenu.close();
		clock.tick(500);

		var oItem = new Item({label: "Added Item", content: new Button({text: "Added Button"})});
		this.oColumnMenu.addItem(oItem);
		oCore.applyChanges();
		this.oColumnMenu.openBy(this.oButton);

		aItems = this.oColumnMenu._oItemsContainer._getNavigationList().getItems();
		assert.equal(aItems.length, 4, "Menu has exactly 4 items");
		assert.equal(aItems[3].getTitle(), "Added Item");
	});

	QUnit.test("Order of quick actions", function(assert) {
		var Category = library.table.columnmenu.Category;
		var oMenu = new Menu({
			quickActions: [
				new QuickAction({label: "Custom generic action", content: new Button()}),
				new QuickAction({label: "Custom aggregate action", content: new Button(), category: Category.Aggregate}),
				new QuickAction({label: "Custom sort action", content: new Button(), category: Category.Sort}),
				new QuickActionContainer({quickActions: [
					new QuickAction({label: "Custom group action", content: new Button(), category: Category.Group}),
					new QuickAction({label: "Custom filter action", content: new Button(), category: Category.Filter})
				]})
			],
			_quickActions: [
				new QuickAction({label: "Control generic action", content: new Button()}),
				new QuickAction({label: "Control group action", content: new Button(), category: Category.Group}),
				new QuickAction({label: "Control filter action", content: new Button(), category: Category.Filter}),
				new QuickActionContainer({quickActions: [
					new QuickAction({label: "Control aggregate action", content: new Button(), category: Category.Aggregate}),
					new QuickAction({label: "Control sort action", content: new Button(), category: Category.Sort})
				]})
			]
		});
		var aLabelsInExpectedOrder = [
			"Control sort action",
			"Custom sort action",
			"Control filter action",
			"Custom filter action",
			"Control group action",
			"Custom group action",
			"Control aggregate action",
			"Custom aggregate action",
			"Control generic action",
			"Custom generic action"
		];

		oMenu.openBy(this.oButton);
		oMenu.getDomRef().querySelectorAll(".sapMTCMenuQALabel").forEach(function(oLabelElement, iIndex) {
			assert.equal(oLabelElement.innerText, aLabelsInExpectedOrder[iIndex], aLabelsInExpectedOrder[iIndex]);
		});

		oMenu.destroy();
	});

	QUnit.test("Accessibility", function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		oCore.applyChanges();

		var oMenu = this.oColumnMenu;

		assert.equal(oMenu._oPopover.getAriaLabelledBy(), oMenu.getId() + "-menuDescription",
			"The popover is associated to the Menu description via aria-labelledby");
		assert.equal(document.getElementById(oMenu.getId() + "-menuDescription").innerText,
			oMenu._getResourceText("table.COLUMNMENU_TITLE"), "Menu description text is correct");

		assert.equal(oMenu._oQuickActionContainer.getAriaLabelledBy(), oMenu.getId() + "-actionContainerDescription",
			"The QuickActions section is associated to the Action container description via aria-labelledby");
		assert.equal(document.getElementById(oMenu.getId() + "-actionContainerDescription").innerText,
			oMenu._getResourceText("table.COLUMNMENU_ACTION_CONTAINER_DESC"), "Action container description text is correct");

		assert.equal(oMenu._oItemsContainer._getNavigationList().getAriaLabelledBy(), oMenu.getId() + "-itemContainerDescription",
			"The Items section is associated to the Item container description via aria-labelledby");
		assert.equal(document.getElementById(oMenu.getId() + "-itemContainerDescription").innerText,
			oMenu._getResourceText("table.COLUMNMENU_ITEM_CONTAINER_DESC"), "Item container description text is correct");

		var oFormElements = oMenu._oQuickActionContainer.getFormContainers()[0].getFormElements();
		var sControlId, oControl;
		for (var i = 0; i < oFormElements.length; i++) {
			sControlId = oFormElements[i].getFields()[0].getControl();
			oControl = document.getElementById(sControlId);
			assert.ok(oControl.getAttribute("aria-labelledby").includes(oFormElements[i].getLabelControl().getId()),
				"aria-labelledby is correct");
		}
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
		var oStaticArea = StaticArea.getUIArea();
		var oInvalidateSpy = sinon.spy(oStaticArea, "invalidate");
		assert.notOk(this.oColumnMenu.getUIArea(), "Before opening, the menu has no connection to the UIArea");

		this.oColumnMenu.openBy(this.oButton);
		var oMenuUIArea = this.oColumnMenu.getUIArea();
		assert.ok(oMenuUIArea, "After opening, the menu has a connection to the UIArea");
		assert.equal(oMenuUIArea, this.oColumnMenu.getParent(), "After opening, the UIArea is the parent");
		assert.equal(oMenuUIArea, oStaticArea, "The menu is in the static area");

		this.oColumnMenu.close();
		this.clock.tick(500);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(oInvalidateSpy.notCalled, "The UIArea is not invalidated when the Menu opens");
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
					}),
					new QuickAction({
						label: sText,
						content: new Button({text: sText}),
						visible: false
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
		var clock = sinon.useFakeTimers();
		var oControl;
		this.oColumnMenu.openBy(this.oButton);

		var oContainer = this.oColumnMenu._oQuickActionContainer.getFormContainers()[0];
		var aFormElements = oContainer.getFormElements();

		assert.equal(aFormElements.length, 4, "Form has only four Quick Action elements, as the last one is not visible");

		// First Quick Action, expected S(6), M(4)
		assert.equal(aFormElements[0].getLabel().getText(), sText, "First Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[0].getFields()[0].getControl());
		assert.equal(aFormElements[0].getFields()[0].getLayoutData().getSpan(), "L4 M4 S6", "Span is set correctly to 'L4 M4 S6'");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "1", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[0].getFields()[1].getControl());
		assert.equal(aFormElements[0].getFields()[1].getLayoutData().getSpan(), "L4 M4 S6", "Span is set correctly to 'L4 M4 S6'");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "2", "Correct button with correct button text");

		// Second Quick Action, expected S(12), M(2)
		assert.equal(aFormElements[1].getLabel().getText(), sText, "Second Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[0].getControl());
		assert.equal(aFormElements[1].getFields()[0].getLayoutData().getSpan(), "L4 M4 S6", "Span is set correctly to 'L4 M4 S6'");
		assert.ok(!aFormElements[1].getFields()[0].getLayoutData().getIndent(), "No Indent is set");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "1", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[1].getControl());
		assert.equal(aFormElements[1].getFields()[1].getLayoutData().getSpan(), "L4 M4 S6", "Span is set correctly to 'L4 M4 S6'");
		assert.ok(!aFormElements[1].getFields()[1].getLayoutData().getIndent(), "No Indent is set");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText + "2", "Correct button with correct button text");
		oControl = sap.ui.getCore().byId(aFormElements[1].getFields()[2].getControl());
		assert.equal(aFormElements[1].getFields()[2].getLayoutData().getSpan(), "L4 M4 S6", "Span is set correctly to 'L4 M4 S6'");
		assert.equal(aFormElements[1].getFields()[2].getLayoutData().getIndent(), "L4 M4 S0", "Indent is set correctly to 'L4 M4 S0'");
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
		assert.equal(aFormElements[3].getFields()[0].getLayoutData().getSpan(), "L8 M8 S12", "Span is set correctly to 'L8 M8 S12'");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), sText, "Correct button with correct button text");

		this.oColumnMenu.close();
		clock.tick(500);
		this.oColumnMenu.addQuickAction(new QuickAction({label: "Added Action", content: [new Button({text: "Button Added"})]}));
		oCore.applyChanges();

		this.oColumnMenu.openBy(this.oButton);

		oContainer = this.oColumnMenu._oQuickActionContainer.getFormContainers()[0];
		aFormElements = oContainer.getFormElements();

		// Check if added quick action is rendered
		assert.equal(aFormElements[4].getLabel().getText(), "Added Action", "Added Quick Action has correct label");
		oControl = sap.ui.getCore().byId(aFormElements[4].getFields()[0].getControl());
		assert.equal(aFormElements[4].getFields()[0].getLayoutData().getSpan(), "L8 M8 S12", "Span is set correctly to 'L8 M8 S12'");
		assert.ok(oControl.isA("sap.m.Button"), "Control is a button");
		assert.equal(oControl.getText(), "Button Added", "Correct button with correct button text");
	});

	QUnit.module("Events", {
		beforeEach: function () {
			this.oColumnMenu = new Menu({
				items: [
					new ActionItem({
						label: "Test ActionItem"
					}),
					new Item({
						label: "Test Item"
					})
				]
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

	QUnit.test("beforeOpen", function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(4);

		this.oColumnMenu.attachBeforeOpen(function(oEvent) {
			assert.deepEqual(oEvent.getParameter("openBy"), this.oButton, "Fired with correct parameters");
		}, this);

		this.oColumnMenu.openBy(this.oButton);
		this.oColumnMenu.close();
		clock.tick(500);

		this.oColumnMenu.openBy(this.oButton.getDomRef());
		var oOpenSpy = sinon.spy(this.oColumnMenu._oPopover, "openBy");
		this.oColumnMenu.openBy(this.oButton.getDomRef());
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is already open");
		assert.ok(!oOpenSpy.called, "Popover.openBy is not called");
	});

	QUnit.test("afterClose", function(assert) {
		var clock = sinon.useFakeTimers();
		var done = assert.async();

		this.oColumnMenu.attachAfterClose(function(oEvent) {
			assert.ok(oEvent.getParameters(), "Event Fired after the menu was closed");
			done();
		}, this);

		this.oColumnMenu.openBy(this.oButton);
		this.oColumnMenu.close();
		clock.tick(500);
	});

	QUnit.test("ActionItem press", function(assert) {
		var clock = sinon.useFakeTimers();
		assert.expect(4);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is open");

		var sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		QUnitUtils.triggerEvent("mousedown", sId);
		QUnitUtils.triggerEvent("mouseup", sId);
		QUnitUtils.triggerEvent("click", sId);

		clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen(), "When ActionItem is pressed, the column menu closes");

		this.oColumnMenu._getAllEffectiveItems()[0].attachPress(function(oEvent) {
			oEvent.preventDefault();
		});

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is open");

		QUnitUtils.triggerEvent("mousedown", sId);
		QUnitUtils.triggerEvent("mouseup", sId);
		QUnitUtils.triggerEvent("click", sId);

		clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is still open because preventDefault was called in the event handler");
	});

	QUnit.test("Item buttons", function (assert) {
		var clock = sinon.useFakeTimers();
		var oMenu = this.oColumnMenu;
		var oButton = this.oButton;
		oMenu.openBy(oButton);
		oCore.applyChanges();

		// Navigate to first item
		var oItem = oMenu.getItems()[1];
		var sId = oItem.getId();
		oMenu._oItemsContainer.switchView(sId);
		oCore.applyChanges();

		return new Promise(function(resolve) {
			oItem.attachEventOnce("confirm", function(oEvent) {
				oEvent.preventDefault();
				assert.ok("confirm event fired");
				resolve();
			});
			oMenu._oBtnOk.firePress();
		}).then(function() {
			clock.tick(500);
			assert.ok(oMenu.isOpen(), "default prevented");

			return new Promise(function (resolve) {
				oItem.attachEventOnce("confirm", function () {
					assert.ok("confirm event fired");
					resolve();
				});
				oMenu._oBtnOk.firePress();
			});
		}).then(function() {
			clock.tick(500);
			assert.notOk(oMenu.isOpen(), "menu is closed");

			oMenu.openBy(oButton);
			oMenu._oItemsContainer.switchView(sId);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oItem.attachEventOnce("cancel", function(oEvent) {
					oEvent.preventDefault();
					assert.ok("cancel event fired");
					resolve();
				});
				oMenu._oBtnCancel.firePress();
			});
		}).then(function() {
			clock.tick(500);
			assert.ok(oMenu.isOpen(), "default prevented");

			return new Promise(function (resolve) {
				oItem.attachEventOnce("cancel", function () {
					assert.ok("cancel event fired");
					resolve();
				});
				oMenu._oBtnCancel.firePress();
			});
		}).then(function () {
			clock.tick(500);
			assert.notOk(oMenu.isOpen(), "menu is closed");

			oMenu.openBy(oButton);
			oMenu._oItemsContainer.switchView(sId);
			oCore.applyChanges();

			return new Promise(function(resolve) {
				oItem.attachEventOnce("reset", function() {
					assert.ok("reset event fired");
					resolve();
				});
				oMenu._oItemsContainer.getHeader().getContentRight()[0].firePress();
			});
		});
	});

	QUnit.module("Auto close behavior", {
		beforeEach: function () {
			this.oColumnMenu = new Menu({
				quickActions: [
					new QuickAction({label: "test", content: new Button({text: "button"})})
				]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			this.oButton1 = new Button();
			this.oButton1.placeAt("content");
			oCore.applyChanges();
		},
		afterEach: function () {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
			this.oButton1.destroy();
		}
	});

	QUnit.test("Open popover by a control/Close when another control is clicked", function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());
		assert.notOk(this.oColumnMenu._oPopover.getShowHeader());

		QUnitUtils.triggerEvent("mousedown", this.oButton1.getId());
		this.clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Open popover by a control/Close when the same control is clicked", function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		QUnitUtils.triggerEvent("mousedown", this.oButton.getId());
		this.clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Open popover by an HTMLElement/Close when another element is clicked", function(assert) {
		this.oColumnMenu.openBy(this.oButton.getDomRef());
		assert.ok(this.oColumnMenu.isOpen());
		assert.notOk(this.oColumnMenu._oPopover.getShowHeader());

		QUnitUtils.triggerEvent("mousedown", "content");
		this.clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Auto close behavior when the menu is open within a dialog", function(assert) {
		var oButton1 = new Button();
		var oButton2 = new Button();
		var oDialog = new Dialog({
			content: [oButton1, oButton2]
		});

		oDialog.placeAt("content");
		oCore.applyChanges();

		oDialog.open();
		this.oColumnMenu.openBy(oButton1);
		this.clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen());

		this.oColumnMenu._oPopover._oControl.focus();
		assert.ok(document.activeElement.id, this.oColumnMenu._oPopover._oControl.getId());
		assert.ok(this.oColumnMenu.isOpen());

		oButton2.focus();
		this.clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen());

		oDialog.destroy();
		oButton1.destroy();
		oButton2.destroy();
	});

	QUnit.test("Auto close behavior when the Menu contains a control that opens a popup", function(assert) {
		var oComboBox = new ComboBox({
			items: [
				new CoreItem({key: "v1", text: "Value 1"}),
				new CoreItem({key: "v2", text: "Value 2"})
			]
		});

		this.oColumnMenu.addItem(
			new Item({
				label: "test item",
				content: oComboBox
			})
		);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		this.clock.tick(1000);

		oComboBox.open();
		QUnitUtils.triggerEvent("mousedown", oComboBox._getList().getItems()[0].$()[0].firstChild);
		this.clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen());
	});

	QUnit.test("Auto close behavior when the Menu item opens a dialog", function(assert) {
		var oButtonInsideDialog = new Button();
		var oDialog = new Dialog({
			content: [oButtonInsideDialog]
		});

		var oButtonOpenDialog = new Button({
			press: function() {
				oDialog.open();
			}
		});

		this.oColumnMenu.addItem(
			new Item({
				label: "test item",
				content: oButtonOpenDialog
			})
		);

		this.oColumnMenu.addDependent(oDialog);
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		var sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		this.clock.tick(1000);

		oButtonOpenDialog.firePress();
		this.clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen());
		oButtonInsideDialog.firePress();
		this.clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen());
		this.oColumnMenu.close();
	});
});