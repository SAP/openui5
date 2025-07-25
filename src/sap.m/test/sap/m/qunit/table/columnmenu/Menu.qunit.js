/*global QUnit, sinon*/
sap.ui.define([
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/SegmentedButton",
	"sap/m/ComboBox",
	"sap/m/Dialog",
	"sap/m/library",
	"sap/m/IllustratedMessageType",
	"sap/m/table/columnmenu/ActionItem",
	"sap/m/table/columnmenu/Menu",
	"sap/m/table/columnmenu/QuickAction",
	"sap/m/table/columnmenu/QuickActionContainer",
	"sap/ui/Device",
	"sap/ui/core/Item",
	"sap/ui/core/Element",
	"sap/ui/core/StaticArea",
	"sap/ui/dom/containsOrEquals",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/performance/trace/FESRHelper"
], function(
	Button,
	Input,
	SegmentedButton,
	ComboBox,
	Dialog,
	library,
	IllustratedMessageType,
	ActionItem,
	Menu,
	QuickAction,
	QuickActionContainer,
	Device,
	CoreItem,
	Element,
	StaticArea,
	containsOrEquals,
	QUnitUtils,
	createAndAppendDiv,
	nextUIUpdate,
	FESRHelper
) {
	"use strict";

	createAndAppendDiv("content");

	const sText = "Test";

	function menuClosed(oMenu) {
		return new Promise((resolve) => {
			oMenu.attachEventOnce("afterClose", function() {
				resolve();
			});
		});
	}

	QUnit.module("Initialization", {
		beforeEach: async function() {
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		createMenu: function(bMultiple) {
			const aQuickActions = [];
			const aPQuickActions = [];
			const aItems = [];
			const aPItems = [];

			aQuickActions.push(new QuickAction({label: sText})); //quick action without content
			aPQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
			aItems.push(new ActionItem({label: sText}));
			aPItems.push(new ActionItem({label: sText}));

			if (bMultiple) {
				for (let i = 0; i < 2; i++) {
					aQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
					aPQuickActions.push(new QuickAction({label: sText, content: new Button({text: sText})}));
					aItems.push(new ActionItem({label: sText}));
					aPItems.push(new ActionItem({label: sText}));
				}
			}

			this.oColumnMenu = new Menu({
				quickActions: aQuickActions,
				items: aItems
			});

			aPQuickActions.forEach((oQuickAction) => this.oColumnMenu.addAggregation("_quickActions", oQuickAction));
			aPItems.forEach((oItem) => this.oColumnMenu.addAggregation("_items", oItem));
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Internal instances", function(assert) {
		this.createMenu(false);
		assert.notOk(this.oColumnMenu._oPopover, "sap.m.ResponsivePopover not created before opening");
		assert.notOk(this.oColumnMenu._oItemsContainer, "sap.m.p13n.Container not created before opening");

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu._oPopover, "sap.m.ResponsivePopover created on opening");
		assert.ok(this.oColumnMenu._oItemsContainer, "sap.m.p13n.Container created on opening");
	});

	QUnit.test("Initialize ColumnMenu with singular content", function(assert) {
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

	QUnit.test("Initialize ColumnMenu with multiple content", function(assert) {
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

	QUnit.test("ColumnMenu with hidden items if container is not yet initialized", function(assert) {
		this.oColumnMenu = new Menu({
			quickActions: [new QuickAction({label: "My Label", content: new Button({text: "My button"}), visible: false})],
			items: [
				new ActionItem({label: "My Visible and then Invisible Label", visible: true}),
				new ActionItem({label: "My Visible Label", visible: true})
			]
		});

		this.oColumnMenu.getItems()[0].setVisible(false); // set visibility of item to false, when containers are not yet initialized

		assert.ok(this.oColumnMenu, "Menu has instance");
		assert.ok(this.oColumnMenu.getQuickActions(), "Menu has quick actions");
		assert.ok(this.oColumnMenu.getItems(), "Menu has items");
		assert.ok(this.oColumnMenu.getQuickActions().length === 1, "Menu has 1 quick action");
		assert.ok(this.oColumnMenu.getItems().length === 2, "Menu has 2 items");
		assert.ok(this.oColumnMenu._getAllEffectiveItems().length === 1, "Menu has 1 visible/effective item");
	});

	QUnit.module("Destruction", {
		beforeEach: async function() {
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [new ActionItem({label: sText})]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Internal instances", function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		const oResponsivePopover = this.oColumnMenu._oPopover;
		const oItemsContainer = this.oColumnMenu._oItemsContainer;

		this.oColumnMenu.destroy();
		assert.ok(oResponsivePopover.isDestroyed(), "sap.m.ResponsivePopover destroyed");
		assert.ok(oItemsContainer.isDestroyed(), "sap.m.p13n.Container destroyed");
		assert.notOk(this.oColumnMenu._oPopover, "Reference to sap.m.ResponsivePopover cleared");
		assert.notOk(this.oColumnMenu._oItemsContainer, "Reference to sap.m.p13n.Container cleared");
	});

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oButton = new Button();
			this.oButton.placeAt("content");
			this.oButton1 = new Button();
			this.oButton1.placeAt("content");
			await nextUIUpdate();
		},
		createMenu: function(bQuickActions, bItems, bPQuickActions, bPItems) {
			const aQuickActions = bQuickActions ? [new QuickAction({label: sText, content: new Button({text: sText})})] : [];
			const aPQuickActions = bPQuickActions ? [new QuickAction({label: sText, content: new Button({text: sText})})] : [];
			const aItems = bItems ? [
				new ActionItem({label: sText, press: function() {}}),
				new ActionItem({label: sText})
			] : [];
			const aPItems = bPItems ? [new ActionItem({label: sText, content: new Button({text: sText})})] : [];

			this.oColumnMenu = new Menu({
				quickActions: aQuickActions,
				items: aItems
			});

			aPQuickActions.forEach((oQuickAction) => this.oColumnMenu.addAggregation("_quickActions", oQuickAction));
			aPItems.forEach((oItem) => this.oColumnMenu.addAggregation("_items", oItem));
		},
		afterEach: function() {
			if (this.oColumnMenu) {
				this.oColumnMenu.destroy();
			}
			this.oButton.destroy();
			this.oButton1.destroy();
		}
	});

	QUnit.test("Icons, Labels and Tooltips", async function(assert) {
		this.createMenu();
		this.oColumnMenu.setShowTableSettingsButton(true);
		this.oColumnMenu.openBy(this.oButton);

		const oHeader = this.oColumnMenu._oPopover.getCustomHeader();
		assert.equal(oHeader.getTitleControl().getText(), this.oColumnMenu._getResourceText("table.COLUMNMENU_TITLE"), "Dialog title is correct");
		const oCloseButton = oHeader.getContent()[2];
		assert.equal(oCloseButton.getIcon(), "sap-icon://decline", "Close button icon is correct");
		assert.equal(oCloseButton.getTooltip(), this.oColumnMenu._getResourceText("table.COLUMNMENU_CLOSE"), "Close button tooltip is correct");

		const oTableSettingsButton = this.oColumnMenu._oPopover.getFooter().getContent()[1];
		assert.equal(oTableSettingsButton.getIcon(), "sap-icon://action-settings", "Table settings button icon is correct");
		assert.equal(oTableSettingsButton.getText(), "", "Table settings button is icon-only button");
		assert.equal(oTableSettingsButton.getTooltip(), this.oColumnMenu._getResourceText("table.COLUMNMENU_TABLE_SETTINGS"),
					"Table settings button tooltip is correct");

		const oIllustratedMessage = this.oColumnMenu._oIllustratedMessage;
		assert.equal(oIllustratedMessage.getTitle(), this.oColumnMenu._getResourceText("table.COLUMNMENU_EMPTY"),
					"Illustrated message title is correct");
		assert.equal(oIllustratedMessage.getIllustrationType(), IllustratedMessageType.NoColumnsSet,
					"Illustrated message has correct illustration type");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.addItem(new ActionItem({label: "Action Item"}));
		this.oColumnMenu.openBy(this.oButton);
		let sActionsListTitle = this.oColumnMenu._oItemsContainer._oNavigationList.getHeaderToolbar().getTitleControl().getText();
		assert.equal(sActionsListTitle, this.oColumnMenu._getResourceText("table.COLUMNMENU_LIST_ITEMS_ONLY_TITLE"), "Items list title is correct");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.addQuickAction(new QuickAction({label: "Quick Generic Action", content: new Button({text: "Button"})}));
		this.oColumnMenu.openBy(this.oButton);
		let sGenericListTitle = this.oColumnMenu._oQuickGenericList.getHeaderToolbar().getTitleControl().getText();
		assert.equal(sGenericListTitle, this.oColumnMenu._getResourceText("table.COLUMNMENU_QUICK_GENERIC_ONLY_TITLE"),
					"Quick actions list title is correct");
		sActionsListTitle = this.oColumnMenu._oItemsContainer._oNavigationList.getHeaderToolbar().getTitleControl().getText();
		assert.equal(sActionsListTitle, this.oColumnMenu._getResourceText("table.COLUMNMENU_LIST_ITEMS_TITLE"), "Items list title is correct");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.addQuickAction(new QuickAction({label: "Quick Sort", content: new Button({text: "Button"}), category: "Sort"}));
		this.oColumnMenu.openBy(this.oButton);
		const sSortListTitle = this.oColumnMenu._oQuickSortList.getHeaderToolbar().getTitleControl().getText();
		assert.equal(sSortListTitle, this.oColumnMenu._getResourceText("table.COLUMNMENU_QUICK_SORT_TITLE"), "Quick sort list title is correct");
		sGenericListTitle = this.oColumnMenu._oQuickGenericList.getHeaderToolbar().getTitleControl().getText();
		assert.equal(sGenericListTitle, this.oColumnMenu._getResourceText("table.COLUMNMENU_QUICK_GENERIC_TITLE"),
					"Quick actions list title is correct");

	});

	QUnit.test("_getAllEffectiveQuickActions", function(assert) {
		this.createMenu(true, true, false, false);
		let aQuickActions = this.oColumnMenu._getAllEffectiveQuickActions();
		assert.equal(aQuickActions.length, 1, "QuickAction is returned as effective action");

		this.oColumnMenu.getQuickActions()[0].setVisible(false);
		aQuickActions = this.oColumnMenu._getAllEffectiveQuickActions();
		assert.equal(aQuickActions.length, 0, "No QuickAction returned for effective actions");
	});

	QUnit.test("_getAllEffectiveItems", function(assert) {
		this.createMenu(true, true, false, false);
		this.oColumnMenu.openBy(this.oButton);
		let aItems = this.oColumnMenu._getAllEffectiveItems();
		assert.equal(aItems.length, 2, "2 Items are returned as effective items");

		this.oColumnMenu.getItems()[0].setVisible(false);
		aItems = this.oColumnMenu._getAllEffectiveItems();
		assert.deepEqual(aItems, [this.oColumnMenu.getItems()[1]], "Only second item is returned as effective item");
	});

	QUnit.test("isOpen", function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		const oIsOpenSpy = sinon.spy(this.oColumnMenu._oPopover, "isOpen");
		this.oColumnMenu.isOpen();
		assert.ok(oIsOpenSpy.calledOnce, "isOpen method of the popover is called");
	});

	QUnit.test("Open popup on mobile", function(assert) {
		this.stub(Device.system, "phone").value(true);
		this.createMenu(true, true, true, true);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "Popover was opened");
		assert.ok(this.oColumnMenu._oPopover.getShowHeader(), "Header is shown on mobile");
	});

	QUnit.test("Add menu to/remove from StaticArea", function(assert) {
		this.createMenu(true, true, true, true);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "Popover was opened");
		assert.strictEqual(StaticArea.getUIArea().getContent()[0], this.oColumnMenu);
		this.oColumnMenu.close();
		assert.equal(StaticArea.getUIArea().getContent().length, 0);
	});

	QUnit.test("Quick action list and item container are created on open and destroyed on close", function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu._oQuickGenericList);
		assert.ok(this.oColumnMenu._oItemsContainer);

		const oDestroyQuickActionListSpy = sinon.spy(this.oColumnMenu._oQuickGenericList, "destroy");
		const oDestroyItemContainerSpy = sinon.spy(this.oColumnMenu._oItemsContainer, "destroy");
		this.oColumnMenu.close();
		assert.ok(oDestroyQuickActionListSpy.calledOnce);
		assert.ok(oDestroyItemContainerSpy.calledOnce);
	});

	QUnit.test("Check hidden header and footer in default view", async function(assert) {
		this.createMenu(false, true);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowHeader());
		assert.notOk(this.oColumnMenu._oItemsContainer.oLayout.getShowFooter());
	});

	QUnit.test("Check focus when control specific items are given", async function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.setShowTableSettingsButton(true);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const sId = this.oColumnMenu._getAllEffectiveQuickActions()[0].getContent()[0].sId;
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific items are given", async function(assert) {
		this.createMenu(true, true, true, false);
		this.oColumnMenu.setShowTableSettingsButton(true);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const sId = this.oColumnMenu._getAllEffectiveQuickActions()[0].getContent()[0].sId;
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only quick actions are given", async function(assert) {
		this.createMenu(true, false, true, false);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const sId = this.oColumnMenu.getAggregation("_quickActions")[0].getContent()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Check focus when only application specific quick actions are given", async function(assert) {
		this.createMenu(true, false, false, false);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const sId = this.oColumnMenu.getQuickActions()[0].getContent()[0].getId();
		assert.equal(document.activeElement.id, sId);
	});

	QUnit.test("Reusing quick actions in menus", async function(assert) {
		const oMenu = new Menu({
			quickActions: [
				new QuickAction({
					label: "A",
					content: new Button({text: "Execute A"})
				})
			]
		});
		const oMenu1 = new Menu({
			quickActions: [
				new QuickAction({
					label: "B",
					content: new Button({text: "Execute B"})
				})
			]
		});
		const oInput = new Input({value: sText});
		const oReuseQuickAction = new QuickAction({label: sText, content: oInput});

		this.oButton.attachPress(function() {
			oMenu.removeAllAggregation("_quickActions");
			oMenu.addAggregation("_quickActions", oReuseQuickAction);
			oMenu.openBy(this);
		});
		this.oButton.addDependent(oMenu);

		this.oButton1.attachPress(function() {
			oMenu1.removeAllAggregation("_quickActions");
			oMenu1.addAggregation("_quickActions", oReuseQuickAction);
			oMenu1.openBy(this);
		});
		this.oButton1.addDependent(oMenu1);
		await nextUIUpdate();

		this.oButton.firePress();
		await nextUIUpdate();
		assert.ok(oInput.getDomRef(), "Input is rendered");
		assert.ok(containsOrEquals(oMenu.getDomRef(), oInput.getDomRef()), "Input is rendered inside the first Menu");
		assert.ok(containsOrEquals(oInput.getDomRef(), document.activeElement), "Focus is on the input field");

		const oRemoveDependentSpy = sinon.spy(oMenu, "removeDependent");
		const oActionsList = oMenu._oQuickGenericList;
		oMenu.close();
		assert.ok(oRemoveDependentSpy.calledOnceWithExactly(oActionsList), "QuickActionList is removed from the menu");
		oRemoveDependentSpy.restore();
		assert.notOk(oInput.getDomRef(), "Input is not rendered");

		this.oButton1.firePress();
		await nextUIUpdate();
		assert.ok(oInput.getDomRef(), "Input is rendered");
		assert.ok(containsOrEquals(oMenu1.getDomRef(), oInput.getDomRef()), "Input is rendered inside the second Menu");
		assert.ok(containsOrEquals(oInput.getDomRef(), document.activeElement), "Focus is on the input field");
	});

	QUnit.test("Check visibility", async function(assert) {
		function getActiveItems(oColumnMenu) {
			return oColumnMenu._oItemsContainer._getNavigationList().getItems().filter(function(oItem) {
				return oItem.getVisible();
			});
		}
		// Menu has 2 Quick Actions (1 Private, 1 Public), 2 Items (both Public)
		this.createMenu(true, true, true, false);

		// Initial State
		this.oColumnMenu.openBy(this.oButton);

		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 2, "All quick actions are visible");
		assert.equal(getActiveItems(this.oColumnMenu).length, 2, "All items are visible");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// Public Quick Action hidden
		this.oColumnMenu.getQuickActions()[0].setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 1, "Only one quick action visible");

		// One item hidden
		this.oColumnMenu.getItems()[0].setVisible(false);
		assert.equal(getActiveItems(this.oColumnMenu).length, 1, "Only one item visible");

		// All items hidden
		this.oColumnMenu.getItems()[1].setVisible(false);
		assert.equal(getActiveItems(this.oColumnMenu).length, 0, "No items are visible");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// All Quick Actions hidden
		this.oColumnMenu.getAggregation("_quickActions")[0].setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		assert.notOk(this.oColumnMenu._oQuickGenericList, "No quick action list is created");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// Make 1 QuickAction and 1 item visible
		this.oColumnMenu.getItems()[0].setVisible(true);
		this.oColumnMenu.getAggregation("_quickActions")[0].setVisible(true);
		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 1, "One quick action is visible");
		assert.equal(getActiveItems(this.oColumnMenu).length, 1, "One item is visible");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// Check Visibility when using a QuickActionContainer
		const oQuickAction1 = new QuickAction({label: sText, content: new Button({text: sText})});
		const oQuickAction2 = new QuickAction({label: sText, content: new Button({text: sText})});
		const oQuickActionContainer = new QuickActionContainer({quickActions: [oQuickAction1, oQuickAction2]});
		this.oColumnMenu.addQuickAction(oQuickActionContainer);

		// Case A: Both QuickActions in the container should be visible
		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 3, "Three quick actions are visible");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// Case B: Container should not be visible
		oQuickActionContainer.setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 1, "One quick actions is visible");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		// Case C: One QuickAction in the container is hidden
		oQuickActionContainer.setVisible(true);
		oQuickAction1.setVisible(false);
		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu._oQuickGenericList.getItems().length, 2, "Two quick actions are visible");
		this.oColumnMenu.close();
	});

	QUnit.test("Add menu item", async function(assert) {
		this.createMenu(true, true, true, true);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		let aItems = this.oColumnMenu._oItemsContainer._getNavigationList().getItems();
		assert.equal(aItems.length, 3, "Menu has exactly 3 items");

		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		const oItem = new ActionItem({label: "Added Item"});
		this.oColumnMenu.addItem(oItem);
		await nextUIUpdate();
		this.oColumnMenu.openBy(this.oButton);

		aItems = this.oColumnMenu._oItemsContainer._getNavigationList().getItems();
		assert.equal(aItems.length, 4, "Menu has exactly 4 items");
		assert.equal(aItems[3].getTitle(), "Added Item");
	});

	QUnit.test("Order of quick actions", function(assert) {
		const Category = library.table.columnmenu.Category;
		const oMenu = new Menu({
			quickActions: [
				new QuickAction({label: "Custom generic action", content: new Button()}),
				new QuickAction({label: "Custom aggregate action", content: new Button(), category: Category.Aggregate}),
				new QuickAction({label: "Custom sort action", content: new Button(), category: Category.Sort}),
				new QuickActionContainer({quickActions: [
					new QuickAction({label: "Custom group action", content: new Button(), category: Category.Group}),
					new QuickAction({label: "Custom filter action", content: new Button(), category: Category.Filter})
				]})
			]
		});

		[
			new QuickAction({label: "Control generic action", content: new Button()}),
			new QuickAction({label: "Control group action", content: new Button(), category: Category.Group}),
			new QuickAction({label: "Control filter action", content: new Button(), category: Category.Filter}),
			new QuickActionContainer({quickActions: [
				new QuickAction({label: "Control aggregate action", content: new Button(), category: Category.Aggregate}),
				new QuickAction({label: "Control sort action", content: new Button(), category: Category.Sort})
			]})
		].forEach((oQuickAction) => oMenu.addAggregation("_quickActions", oQuickAction));

		const aLabelsInExpectedOrder = [
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
		oMenu.getDomRef().querySelectorAll(".sapMILILabel").forEach(function(oLabelElement, iIndex) {
			assert.equal(oLabelElement.innerText, aLabelsInExpectedOrder[iIndex], aLabelsInExpectedOrder[iIndex]);
		});

		oMenu.destroy();
	});

	QUnit.test("Illustrated Message when columnmenu is empty", async function(assert) {
		this.createMenu(false);
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const oIllustratedMessage = this.oColumnMenu._oIllustratedMessage;
		assert.ok(oIllustratedMessage, "Illustrated message is initialized");
		assert.equal(oIllustratedMessage.getTitle(), this.oColumnMenu._getResourceText("table.COLUMNMENU_EMPTY"), "Illustrated message has a title");
		assert.equal(oIllustratedMessage.getDescription(), "", "Illustrated message does not have a description");
		assert.equal(oIllustratedMessage.getIllustrationType(), library.IllustratedMessageType.NoColumnsSet, "Illustrated message has the correct illustration type");
		assert.equal(oIllustratedMessage.getIllustrationSize(), library.IllustratedMessageSize.ExtraSmall, "Illustrated message has the correct illustration size");
		assert.ok(oIllustratedMessage.getDomRef(), "Illustrated message is rendered");
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.addQuickAction(new QuickAction({label: sText, content: new Button({text: sText})}));
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		assert.notOk(this.oColumnMenu._oIllustratedMessage.getDomRef(), "Illustrated message is not rendered");
	});

	QUnit.module("Accessibility", {
		beforeEach: async function() {
			this.oColumnMenu = new Menu({
				quickActions: [
					new QuickAction({label: sText, content: new SegmentedButton()}),
					new QuickAction({label: sText, content: new Button({text: sText})})
				],
				items: [
					new ActionItem({label: sText, press: function() {}}),
					new ActionItem({label: sText})
				]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("ARIA label for quick actions", async function(assert) {
		const checkARIA = (oItem, sExpectedControl) => {
			assert.equal(oItem.getLabel(), sText, "Quick action has correct label");
			const oAssociativeControl = oItem.getContent()[0];
			assert.ok(oAssociativeControl.isA("sap.m.table.columnmenu.AssociativeControl"), "Quick action content is an AssociativeControl");

			const oControl = Element.getElementById(oAssociativeControl.getControl());
			assert.ok(oControl.isA(sExpectedControl), `Control is a ${sExpectedControl}`);

			const aAriaLabbeledBy = oControl.getAriaLabelledBy();
			assert.ok(aAriaLabbeledBy.length, "Segmented Button has aria-labelledby");

			const oLabelRef = this.oColumnMenu.getDomRef().querySelector(`#${aAriaLabbeledBy[0]}`);
			assert.equal(oLabelRef.innerText, sText, "Segmented Button references correct label");
		};

		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const aActionItems = this.oColumnMenu._oQuickGenericList.getItems();
		checkARIA(aActionItems[0], "sap.m.SegmentedButton");
		checkARIA(aActionItems[1], "sap.m.Button");
	});

	QUnit.module("Control tree", {
		beforeEach: async function() {
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [new ActionItem({label: sText})]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("Without parent", async function(assert) {
		const oStaticArea = StaticArea.getUIArea();
		const oInvalidateSpy = sinon.spy(oStaticArea, "invalidate");
		assert.notOk(this.oColumnMenu.getUIArea(), "Before opening, the menu has no connection to the UIArea");

		this.oColumnMenu.openBy(this.oButton);
		const oMenuUIArea = this.oColumnMenu.getUIArea();
		assert.ok(oMenuUIArea, "After opening, the menu has a connection to the UIArea");
		assert.equal(oMenuUIArea, this.oColumnMenu.getParent(), "After opening, the UIArea is the parent");
		assert.equal(oMenuUIArea, oStaticArea, "The menu is in the static area");

		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(oInvalidateSpy.notCalled, "The UIArea is not invalidated when the Menu opens");
	});

	QUnit.test("With parent", function(assert) {
		this.oButton.addDependent(this.oColumnMenu);
		assert.equal(this.oColumnMenu.getUIArea(), this.oButton.getUIArea(), "Before opening, the UIArea is inherited from the parent");

		this.oColumnMenu.openBy(this.oButton);
		assert.equal(this.oColumnMenu.getUIArea(), this.oButton.getUIArea(), "After opening, the UIArea is inherited from the parent");
		assert.equal(this.oColumnMenu.getParent(), this.oButton, "After opening, the parent is unchanged");
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.oColumnMenu = new Menu({
				showTableSettingsButton: true,
				items: [
					new ActionItem({
						label: "Test ActionItem"
					}),
					new ActionItem({
						label: "Test Item"
					})
				]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
		}
	});

	QUnit.test("beforeOpen", async function(assert) {
		assert.expect(4);

		this.oColumnMenu.attachBeforeOpen(function(oEvent) {
			assert.deepEqual(oEvent.getParameter("openBy"), this.oButton, "Fired with correct parameters");
		}, this);

		this.oColumnMenu.openBy(this.oButton);
		this.oColumnMenu.close();
		await menuClosed(this.oColumnMenu);

		this.oColumnMenu.openBy(this.oButton.getDomRef());
		const oOpenSpy = sinon.spy(this.oColumnMenu._oPopover, "openBy");
		this.oColumnMenu.openBy(this.oButton.getDomRef());
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is already open");
		assert.ok(oOpenSpy.notCalled, "Popover.openBy is not called");
	});

	QUnit.test("afterClose", function(assert) {
		const clock = sinon.useFakeTimers();
		const done = assert.async();

		this.oColumnMenu.attachAfterClose(function(oEvent) {
			assert.ok(oEvent.getParameters(), "Event Fired after the menu was closed");
			clock.restore();
			done();
		}, this);

		this.oColumnMenu.openBy(this.oButton);
		this.oColumnMenu.close();
		clock.tick(500);
	});

	QUnit.test("FESR registration", function(assert) {
		const oMenu = this.oColumnMenu;

		oMenu.openBy(this.oButton);

		const oSettingsButton = oMenu._oPopover.getEndButton();

		assert.equal(FESRHelper.getSemanticStepname(oSettingsButton, "press"),
			"tbl:p13n",
			"FESR is registered for the table settings button on the Menu");
	});

	QUnit.test("ActionItem press", function(assert) {
		assert.expect(4);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is open");

		const sId = this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId();
		const clock = sinon.useFakeTimers();

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
		clock.restore();
		assert.ok(this.oColumnMenu.isOpen(), "The column menu is still open because preventDefault was called in the event handler");
	});

	QUnit.module("Auto close behavior", {
		beforeEach: async function() {
			this.oColumnMenu = new Menu({
				quickActions: [
					new QuickAction({label: "test", content: new Button({text: "button"})})
				]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			this.oButton1 = new Button();
			this.oButton1.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
			this.oButton1.destroy();
		}
	});

	QUnit.test("Open popover by a control/Close when another control is clicked", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());
		assert.notOk(this.oColumnMenu._oPopover.getShowHeader());

		QUnitUtils.triggerEvent("mousedown", this.oButton1.getId());
		clock.tick(1000);
		clock.restore();
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Open popover by a control/Close when the same control is clicked", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		QUnitUtils.triggerEvent("mousedown", this.oButton.getId());
		clock.tick(1000);
		clock.restore();
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Open popover by an HTMLElement/Close when another element is clicked", function(assert) {
		const clock = sinon.useFakeTimers();
		this.oColumnMenu.openBy(this.oButton.getDomRef());
		assert.ok(this.oColumnMenu.isOpen());
		assert.notOk(this.oColumnMenu._oPopover.getShowHeader());

		QUnitUtils.triggerEvent("mousedown", "content");
		clock.tick(1000);
		clock.restore();
		assert.notOk(this.oColumnMenu.isOpen());
	});

	QUnit.test("Auto close behavior when the menu is open within a dialog", function(assert) {
		const oButton1 = new Button();
		const oButton2 = new Button();
		const oButton3 = new Button();
		const oDialog = new Dialog({
			content: [oButton1, oButton2, oButton3]
		});

		const clock = sinon.useFakeTimers();
		oDialog.open();
		clock.tick(500);
		this.oColumnMenu.openBy(oButton1);
		clock.tick(500);
		assert.ok(this.oColumnMenu.isOpen());

		this.oColumnMenu._oPopover._oControl.focus();
		assert.ok(document.activeElement.id, this.oColumnMenu._oPopover._oControl.getId());
		assert.ok(this.oColumnMenu.isOpen());

		oButton2.focus();
		clock.tick(1000);
		assert.notOk(this.oColumnMenu.isOpen());

		this.oColumnMenu.openBy(oButton2);
		clock.tick(500);
		assert.ok(this.oColumnMenu.isOpen());

		QUnitUtils.triggerEvent("mousedown", oButton3.getId());
		clock.tick(1000);
		clock.restore();
		assert.notOk(this.oColumnMenu.isOpen());

		oDialog.destroy();
		oButton1.destroy();
		oButton2.destroy();
	});

	QUnit.test("Close menu before opening by another control", function(assert) {
		const clock = sinon.useFakeTimers();
		const oCloseSpy = sinon.spy(this.oColumnMenu, "close");

		this.oColumnMenu.openBy(this.oButton);
		clock.tick(500);
		assert.ok(this.oColumnMenu.isOpen());
		assert.ok(oCloseSpy.notCalled, "Menu was not closed");

		this.oColumnMenu.openBy(this.oButton);
		clock.tick(500);
		assert.ok(this.oColumnMenu.isOpen());
		assert.ok(oCloseSpy.notCalled, "Menu was not closed");

		this.oColumnMenu.openBy(this.oButton1);
		clock.tick(500);
		assert.ok(this.oColumnMenu.isOpen());
		assert.ok(oCloseSpy.calledOnce, "Menu was closed before opening it again.");

		oCloseSpy.restore();
		clock.restore();
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.module("Item, view switch and auto-close", {
		beforeEach: async function() {
			await new Promise((resolve) => {
				sap.ui.require(["sap/m/table/columnmenu/Item"], (Item) => {
					this.oItem = new Item({label: sText, content: new Button({text: sText})});
					resolve();
				});
			});
			this.oColumnMenu = new Menu({
				quickActions: [new QuickAction({label: sText, content: new Button({text: sText})})],
				items: [this.oItem]
			});
			this.oButton = new Button();
			this.oButton.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oColumnMenu.destroy();
			this.oButton.destroy();
			this.oItem.destroy();
		}
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Item buttons", async function(assert) {
		const oMenu = this.oColumnMenu;
		const oButton = this.oButton;
		oMenu.openBy(oButton);
		await nextUIUpdate();

		// Navigate to first item
		const oItem = oMenu._getAllEffectiveItems()[0];
		const sId = oItem.getId();
		oMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		return new Promise(function(resolve) {
			oItem.attachEventOnce("confirm", function(oEvent) {
				oEvent.preventDefault();
				assert.ok("confirm event fired");
				resolve();
			});
			oMenu._oBtnOk.firePress();
		}).then(function() {
			assert.ok(oMenu.isOpen(), "default prevented");

			return new Promise(function(resolve) {
				oItem.attachEventOnce("confirm", function() {
					assert.ok("confirm event fired");
					menuClosed(oMenu).then(resolve);
				});
				oMenu._oBtnOk.firePress();
			});
		}).then(async function() {
			assert.notOk(oMenu.isOpen(), "menu is closed");

			oMenu.openBy(oButton);
			oMenu._oItemsContainer.switchView(sId);
			await nextUIUpdate();

			return new Promise(function(resolve) {
				oItem.attachEventOnce("cancel", function(oEvent) {
					oEvent.preventDefault();
					assert.ok("cancel event fired");
					resolve();
				});
				oMenu._oBtnCancel.firePress();
			});
		}).then(function() {
			assert.ok(oMenu.isOpen(), "default prevented");

			return new Promise(function(resolve) {
				oItem.attachEventOnce("cancel", function() {
					assert.ok("cancel event fired");
					menuClosed(oMenu).then(resolve);
				});
				oMenu._oBtnCancel.firePress();
			});
		}).then(async function() {
			assert.notOk(oMenu.isOpen(), "menu is closed");

			oMenu.openBy(oButton);
			oMenu._oItemsContainer.switchView(sId);
			await nextUIUpdate();

			return new Promise(function(resolve) {
				oItem.attachEventOnce("reset", function() {
					assert.ok("reset event fired");
					resolve();
				});
				oMenu._oItemsContainer.getHeader().getContentRight()[0].firePress();
			});
		});
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Check default button settings", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to first item
		const sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		assert.ok(this.oColumnMenu._oBtnOk.getVisible());
		assert.ok(this.oColumnMenu._oBtnCancel.getVisible());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());

		assert.ok(this.oColumnMenu._oBtnOk.getEnabled());
		assert.ok(this.oColumnMenu._oBtnCancel.getEnabled());
		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Switch reset button states", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to first item
		const sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		this.oItem.changeButtonSettings({
			reset: {visible: false}
		});
		await nextUIUpdate();

		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oItem.getButtonSettings()["reset"]["visible"]);

		this.oItem.changeButtonSettings({
			reset: {visible: true, enabled: false}
		});
		await nextUIUpdate();

		assert.ok(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getVisible());
		assert.notOk(this.oColumnMenu._oItemsContainer.getHeader().getContentRight()[0].getEnabled());
		assert.ok(this.oItem.getButtonSettings()["reset"]["visible"]);
		assert.notOk(this.oItem.getButtonSettings()["reset"]["enabled"]);
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Switch cancel button states", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to first item
		const sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		this.oItem.changeButtonSettings({
			cancel: {visible: false}
		});
		await nextUIUpdate();

		assert.notOk(this.oColumnMenu._oBtnCancel.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["cancel"]["visible"]);
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Switch confirm button states", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to first item
		const sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		this.oItem.changeButtonSettings({
			confirm: {visible: false}
		});
		await nextUIUpdate();

		assert.notOk(this.oColumnMenu._oBtnOk.getVisible());
		assert.notOk(this.oItem.getButtonSettings()["confirm"]["visible"]);
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("View switch event", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		const aCalls = [],
			fnViewSwitch = function(oEvt) {
				aCalls.push({source: oEvt.getParameter("source"), target: oEvt.getParameter("target")});
			},
			oSpy = this.spy(fnViewSwitch);
		this.oColumnMenu._oItemsContainer.attachEvent("afterViewSwitch", oSpy);

		const sId = this.oColumnMenu._getAllEffectiveItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		assert.equal(oSpy.callCount, 1);
		assert.equal(aCalls[0].source, "$default");
		assert.equal(aCalls[0].target, sId);
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Check focus when view is switched", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to item
		const sId = this.oColumnMenu._getAllEffectiveItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavBackBtn().getId());
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Check focus when view is switched back", async function(assert) {
		this.oColumnMenu.openBy(this.oButton);
		await nextUIUpdate();

		// Navigate to item
		const sId = this.oColumnMenu._getAllEffectiveItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		await nextUIUpdate();

		// Navigate to item
		this.oColumnMenu._oItemsContainer.switchView("$default");
		await nextUIUpdate();

		assert.equal(document.activeElement.id, this.oColumnMenu._oItemsContainer._getNavigationList().getItems()[0].getId());
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Auto close behavior when the Menu contains a control that opens a popup", function(assert) {
		const clock = sinon.useFakeTimers();
		const oComboBox = new ComboBox({
			items: [
				new CoreItem({key: "v1", text: "Value 1"}),
				new CoreItem({key: "v2", text: "Value 2"})
			]
		});

		this.oColumnMenu._getAllEffectiveItems()[0].setContent(oComboBox);

		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		const sId = this.oColumnMenu._getAllEffectiveItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		clock.tick(1000);
		oComboBox.open();
		QUnitUtils.triggerEvent("mousedown", oComboBox._getList().getItems()[0].$()[0].firstChild);
		clock.tick(1000);
		clock.restore();
		assert.ok(this.oColumnMenu.isOpen());
	});

	/**
	 * @deprecated As of version 1.132
	 */
	QUnit.test("Auto close behavior when the Menu item opens a dialog", function(assert) {
		const oButtonInsideDialog = new Button();
		const oDialog = new Dialog({
			content: [oButtonInsideDialog]
		});

		const oButtonOpenDialog = new Button({
			press: function() {
				oDialog.open();
			}
		});

		this.oColumnMenu._getAllEffectiveItems()[0].setContent(oButtonOpenDialog);

		this.oColumnMenu.addDependent(oDialog);
		this.oColumnMenu.openBy(this.oButton);
		assert.ok(this.oColumnMenu.isOpen());

		const clock = sinon.useFakeTimers();
		const sId = this.oColumnMenu.getItems()[0].getId();
		this.oColumnMenu._oItemsContainer.switchView(sId);
		clock.tick(1000);

		oButtonOpenDialog.firePress();
		clock.tick(1000);
		assert.ok(this.oColumnMenu.isOpen());
		oButtonInsideDialog.firePress();
		clock.tick(1000);
		clock.restore();
		assert.ok(this.oColumnMenu.isOpen());
		this.oColumnMenu.close();
	});
});