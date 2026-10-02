/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/Row",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/Element",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	qutils,
	nextUIUpdate,
	RowAction,
	RowActionItem,
	Row,
	Table,
	TableUtils,
	Element,
	Device
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oRowAction = new RowAction();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	QUnit.test("getRow", function(assert) {
		const oRow = new Row();
		const oTable = new Table();

		assert.strictEqual(this.oRowAction.getRow(), null, "Returns null if there is no parent");

		oTable.addDependent(this.oRowAction);
		assert.strictEqual(this.oRowAction.getRow(), null, "Returns null if the parent is not a row");

		oRow.addDependent(this.oRowAction);
		assert.equal(this.oRowAction.getRow(), oRow, "Returns the parent row");

		oRow.destroy();
		oTable.destroy();
	});

	QUnit.test("_getSize", function(assert) {
		const oRow = new Row();
		const oTable = new Table();

		assert.strictEqual(this.oRowAction._getSize(), 3, "Returns the maximum of 3 for the row action count");

		oTable.addDependent(oRow);
		oRow.addDependent(this.oRowAction);
		assert.strictEqual(this.oRowAction._getSize(), oTable.getRowActionCount(), "Returns the row action count of the table");

		oTable.setRowActionCount(1);
		assert.strictEqual(this.oRowAction._getSize(), 1, "Returns the row action count of the table");

		oTable.setRowActionCount(4);
		assert.strictEqual(this.oRowAction._getSize(), 3, "Returns the maximum of 3 for the row action count");

		oRow.destroy();
		oTable.destroy();
	});

	QUnit.test("_getVisibleItems", function(assert) {
		this.oRowAction.addItem(new RowActionItem());
		this.oRowAction.addItem(new RowActionItem());
		this.oRowAction.addItem(new RowActionItem());

		assert.deepEqual(this.oRowAction._getVisibleItems(), this.oRowAction.getItems(), "All items visible");

		this.oRowAction.getItems()[1].setVisible(false);
		assert.deepEqual(this.oRowAction._getVisibleItems(), [this.oRowAction.getItems()[0], this.oRowAction.getItems()[2]], "Some items visible");

		this.oRowAction.getItems()[0].setVisible(false);
		this.oRowAction.getItems()[2].setVisible(false);
		assert.deepEqual(this.oRowAction._getVisibleItems(), [], "No items visible");
	});

	QUnit.test("Item.getRowAction", function(assert) {
		const oItem = new RowActionItem();
		const oRow = new Row();

		assert.strictEqual(oItem.getRowAction(), null, "Returns null if there is no parent");

		oRow.addDependent(oItem);
		assert.strictEqual(oItem.getRowAction(), null, "Returns null if the parent is not a row action");

		this.oRowAction.addDependent(oItem);
		assert.equal(oItem.getRowAction(), this.oRowAction, "Returns the parent row action");

		oItem.destroy();
		oRow.destroy();
	});

	QUnit.test("Item._getIconUri", function(assert) {
		const oItem = new RowActionItem();

		this.oRowAction.addItem(oItem);
		assert.ok(!oItem._getIconUri(), "No Icon set");

		oItem.setType("Navigation");
		assert.equal(oItem._getIconUri(), "sap-icon://navigation-right-arrow", "No Icon set but type");

		oItem.setIcon("sap-icon://search");
		assert.equal(oItem._getIconUri(), "sap-icon://search", "Custom Icon set");
	});

	QUnit.test("Item._getText", function(assert) {
		const oItem = new RowActionItem();
		const sText = TableUtils.getResourceText("TBL_ROW_ACTION_NAVIGATE");

		this.oRowAction.addItem(oItem);
		assert.ok(!oItem._getText(false), "No Text or Tooltip set (Text preferred)");
		assert.ok(!oItem._getText(true), "No Text or Tooltip set (Tooltip preferred)");

		oItem.setType("Navigation");
		assert.equal(oItem._getText(false), sText, "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), sText, "No Text or Tooltip set but type (Tooltip preferred)");

		oItem.setTooltip("TT");
		assert.equal(oItem._getText(false), "TT", "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), "TT", "No Text or Tooltip set but type (Tooltip preferred)");

		oItem.setText("T");
		assert.equal(oItem._getText(false), "T", "No Text or Tooltip set but type (Text preferred)");
		assert.equal(oItem._getText(true), "TT", "No Text or Tooltip set but type (Tooltip preferred)");
	});

	QUnit.module("Rendering", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	async function checkRendering(oRowAction, assert) {
		await nextUIUpdate();

		const aRowActionItems = oRowAction._getVisibleItems();
		const oNavigationItem = aRowActionItems.find((oItem) => oItem.getType() === "Navigation");
		// move the navigation item to the end of the array
		if (oNavigationItem) {
			aRowActionItems.push(aRowActionItems.splice(aRowActionItems.indexOf(oNavigationItem), 1)[0]);
		}

		const aChildren = oRowAction.getDomRef().children;
		assert.equal(aChildren.length, aRowActionItems.length, "Number of icons is correct");

		for (let i = 0; i < aRowActionItems.length; i++) {
			assert.ok(aChildren[i].classList.contains("sapUiTableActionIcon"), "Icon is rendered");

			let sText = aRowActionItems[i].getText();
			if (!sText) {
				if (aRowActionItems[i].getType() === "Navigation") {
					sText = TableUtils.getResourceText("TBL_ROW_ACTION_NAVIGATE");
				} else if (aRowActionItems[i].getType() === "Delete") {
					sText = TableUtils.getResourceText("TBL_ROW_ACTION_DELETE");
				}
			}
			assert.equal(aChildren[i].getAttribute("aria-label"), sText, "Aria-label is correct");
			const oTitleEl = aChildren[i].querySelector(".sapUiIconTitle");
			assert.equal(oTitleEl && oTitleEl.getAttribute("title"), sText, "Tooltip is correct");
			assert.equal(Element.closestTo(aChildren[i]).getSrc(), aRowActionItems[i]._getIconUri(), "Icon src is correct");
		}
	}

	QUnit.test("addItem / removeItem", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", text: "Delete"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.removeItem(this.oRowAction.getItems()[0]);
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("insertItem / removeAllItems", async function(assert) {
		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}), 0);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://delete", text: "Delete"}), 0);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://account", text: "Account"}), 1);
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.removeAllItems();
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("addItem / destroyItems", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.destroyItems();
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Item.setVisible", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.getItems()[0].setVisible(false);
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Item.setText", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();
		this.oRowAction.getItems()[0].setText("B");

		const aChildren = this.oRowAction.getDomRef().children;
		assert.equal(Element.closestTo(aChildren[0]).getTooltip(), "B", "Tooltip is correct");
	});

	QUnit.test("Item.setIcon", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();
		this.oRowAction.getItems()[0].setIcon("sap-icon://account");

		const aChildren = this.oRowAction.getDomRef().children;
		assert.equal(Element.closestTo(aChildren[0]).getSrc(), "sap-icon://account", "Icon src is correct");
	});

	QUnit.test("Type Navigation", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({type: "Navigation"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "Search"}));
		await checkRendering(this.oRowAction, assert);

		this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Type Delete", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		await checkRendering(this.oRowAction, assert);
	});

	QUnit.test("Overflow", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		const aChildren = oRowAction.getDomRef().children;
		const sOverflowButtonLabel = TableUtils.getResourceText("TBL_ROW_ACTION_MORE");

		assert.equal(aChildren.length, 3, "Number of icons is correct");
		assert.ok(aChildren[0].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[0].getAttribute("aria-label"), "Search", "Aria-label is correct");
		assert.equal(aChildren[0].querySelector(".sapUiIconTitle").getAttribute("title"), "Search", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[0]).getSrc(), "sap-icon://search", "Icon is correct");

		assert.ok(aChildren[1].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[1].getAttribute("aria-label"), "Delete", "Aria-label is correct");
		assert.equal(aChildren[1].querySelector(".sapUiIconTitle").getAttribute("title"), "Delete", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[1]).getSrc(), "sap-icon://delete", "Icon is correct");

		assert.ok(aChildren[2].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[2].getAttribute("aria-label"), sOverflowButtonLabel, "Aria-label is correct");
		assert.equal(aChildren[2].querySelector(".sapUiIconTitle").getAttribute("title"), sOverflowButtonLabel, "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[2]).getSrc(), "sap-icon://overflow", "Icon is correct");
		assert.equal(aChildren[2].getAttribute("aria-haspopup"), "Menu", "aria-haspopup on overflow icon");
		assert.equal(oTable._oRowActionOverflowMenu, undefined, "Menu not initialized");

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", aChildren[2]);
		await nextUIUpdate();
		assert.ok(oTable._oRowActionOverflowMenu, "Menu initialized");
		assert.ok(oTable._oRowActionOverflowMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oTable._oRowActionOverflowMenu.bOpen, "Menu is open");
		let aMenuItems = oTable._oRowActionOverflowMenu.getItems();
		assert.equal(aMenuItems.length, 2, "Menu has 2 items");
		assert.equal(aMenuItems[0].getText(), "Account", "Menu item text is correct");
		assert.equal(aMenuItems[0].getIcon(), "sap-icon://account", "Menu item icon is correct");
		assert.equal(aMenuItems[1].getText(), "Attachment", "Menu item text is correct");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://attachment", "Menu item icon is correct");

		oRowAction.addItem(new RowActionItem({type: "Navigation"}));
		await nextUIUpdate();

		assert.equal(aChildren.length, 3, "Number of icons is correct");
		assert.ok(aChildren[0].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[0].getAttribute("aria-label"), "Search", "Aria-label is correct");
		assert.equal(aChildren[0].querySelector(".sapUiIconTitle").getAttribute("title"), "Search", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[0]).getSrc(), "sap-icon://search", "Icon is correct");

		assert.ok(aChildren[1].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[1].getAttribute("aria-label"), sOverflowButtonLabel, "Aria-label is correct");
		assert.equal(aChildren[1].querySelector(".sapUiIconTitle").getAttribute("title"), sOverflowButtonLabel, "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[1]).getSrc(), "sap-icon://overflow", "Icon is correct");
		assert.equal(aChildren[1].getAttribute("aria-haspopup"), "Menu", "aria-haspopup on overflow icon");

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", aChildren[1]);
		await nextUIUpdate();
		assert.ok(oTable._oRowActionOverflowMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oTable._oRowActionOverflowMenu.bOpen, "Menu is open");
		aMenuItems = oTable._oRowActionOverflowMenu.getItems();
		assert.equal(aMenuItems.length, 3, "Menu has 3 items");
		assert.equal(aMenuItems[0].getText(), "Delete", "Menu item text is correct");
		assert.equal(aMenuItems[0].getIcon(), "sap-icon://delete", "Menu item icon is correct");
		assert.equal(aMenuItems[1].getText(), "Account", "Menu item text is correct");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://account", "Menu item icon is correct");
		assert.equal(aMenuItems[2].getText(), "Attachment", "Menu item text is correct");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://attachment", "Menu item icon is correct");

		assert.ok(aChildren[2].classList.contains("sapUiTableActionIcon"), "Icon is rendered");
		assert.equal(aChildren[2].getAttribute("aria-label"), "Details", "Aria-label is correct");
		assert.equal(aChildren[2].querySelector(".sapUiIconTitle").getAttribute("title"), "Details", "Tooltip is correct");
		assert.equal(Element.closestTo(aChildren[2]).getSrc(), "sap-icon://navigation-right-arrow", "Icon is correct");

		const oIconSearch = Element.closestTo(aChildren[0]);
		const oIconOverflow = Element.closestTo(aChildren[1]);
		const oIconDetails = Element.closestTo(aChildren[2]);
		oTable.destroy();
		assert.ok(oIconSearch.isDestroyed(), "Search icon destroyed");
		assert.ok(oIconOverflow.isDestroyed(), "Overflow icon destroyed");
		assert.ok(oIconDetails.isDestroyed(), "Details icon destroyed");
		assert.ok(oRowAction.isDestroyed(), "RowAction destroyed");
		assert.ok(oTable._oRowActionOverflowMenu.isDestroyed(), "Overflow menu destroyed");
	});

	QUnit.module("Behavior", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.oRow = new Row();
			sinon.stub(this.oRowAction, "getRow").returns(this.oRow);
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRow.destroy();
			this.oRowAction.destroy();
		}
	});

	QUnit.test("Press on first item", function(assert) {
		let oEventParams = null;
		this.oRowAction.getItems()[0].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});
		Element.closestTo(this.oRowAction.getDomRef().children[0]).firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[0], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item", function(assert) {
		let oEventParams = null;
		this.oRowAction.getItems()[1].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});
		Element.closestTo(this.oRowAction.getDomRef().children[1]).firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", oRowAction.getDomRef().children[2]);

		const oMenu = oTable._oRowActionOverflowMenu;
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.isA("sap.ui.unified.Menu"), "Menu is of type sap.ui.unified.Menu");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 items");

		let oEventParams = null;
		oRowAction.getItems()[2].attachPress((oEvent) => {
			oEventParams = oEvent.getParameters();
		});

		oMenu.getItems()[0].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, oTable.getRows()[0], "Event Parameter 'row'");
		assert.equal(oEventParams.item, oRowAction.getItems()[2], "Event Parameter 'item'");

		oTable.destroy();
	});

	QUnit.test("onKeyboardShortcut", function(assert) {
		let oEventParams1;
		let oEventParams2;
		const oRowActionItem1 = new RowActionItem("I1", {type: "Navigation", press: (oEvent) => { oEventParams1 = oEvent.getParameters(); }});
		const oRowActionItem2 = new RowActionItem("I2", {type: "Delete", press: (oEvent) => { oEventParams2 = oEvent.getParameters(); }});
		this.oRowAction.addItem(oRowActionItem1);
		this.oRowAction.addItem(oRowActionItem2);

		oRowActionItem1.onKeyboardShortcut("navigation");
		oRowActionItem2.onKeyboardShortcut("navigation");

		assert.ok(!!oEventParams1, "Press Event Triggered on navigation item");
		assert.equal(oEventParams1.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams1.item, oRowActionItem1, "Event Parameter 'item'");
		assert.notOk(!!oEventParams2, "Press Event not Triggered on deletion item");
	});

	QUnit.module("ACC", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.oRowAction.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oRowAction.destroy();
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		const oGetSizeStub = this.stub(this.oRowAction, "_getSize");

		oGetSizeStub.returns(2);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description,
			TableUtils.getResourceText("TBL_ROW_ACTION_MULTIPLE_ACTION", [2]), "ACCInfo.description: 2 Items");

		this.oRowAction.setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - invisible");

		oGetSizeStub.returns(0);
		this.oRowAction.setVisible(true);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - no Count");

		oGetSizeStub.returns(2);
		this.oRowAction.getItems()[0].setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_SINGLE_ACTION"),
			"ACCInfo.description: 2 Items - 1 invisible");

		this.oRowAction.destroyItems();
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 0 Items");
	});

	QUnit.test("Menu icon", async function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: {path: "/"},
			models: TableQUnitUtils.createJSONModel(1),
			rowActionCount: 3,
			columns: [
				TableQUnitUtils.createTextColumn({
					label: "A",
					text: "A",
					bind: true
				})
			],
			rowActionTemplate: new RowAction({
				items: [
					new RowActionItem({icon: "sap-icon://search", text: "Search"}),
					new RowActionItem({icon: "sap-icon://delete", text: "Delete"}),
					new RowActionItem({icon: "sap-icon://account", text: "Account"}),
					new RowActionItem({icon: "sap-icon://attachment", text: "Attachment"})
				]
			})
		});
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oRowAction = oTable.getRows()[0].getRowAction();
		const aChildren = oRowAction.getDomRef().children;

		assert.equal(aChildren[0].getAttribute("aria-haspopup"), undefined, "aria-haspopup on icon 0");
		assert.equal(aChildren[1].getAttribute("aria-haspopup"), undefined, "aria-haspopup on icon 1");
		assert.equal(aChildren[2].getAttribute("aria-haspopup"), "Menu", "aria-haspopup on icon 2");

		oTable.destroy();
	});
});