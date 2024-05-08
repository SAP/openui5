/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/Row",
	"sap/ui/table/Table",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device"
], function(
	qutils,
	nextUIUpdate,
	RowAction,
	RowActionItem,
	Row,
	Table,
	TableUtils,
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

		assert.strictEqual(this.oRowAction._getSize(), 2, "Returns 2 if not in a table");

		oTable.addDependent(oRow);
		oRow.addDependent(this.oRowAction);
		assert.strictEqual(this.oRowAction._getSize(), oTable.getRowActionCount(), "Returns the row action count of the table");

		oTable.setRowActionCount(1);
		assert.strictEqual(this.oRowAction._getSize(), 1, "Returns the row action count of the table");

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

	QUnit.test("Item._getIcon", function(assert) {
		const oItem = new RowActionItem();

		this.oRowAction.addItem(oItem);
		assert.ok(!oItem._getIcon(), "No Icon set");

		oItem.setType("Navigation");
		assert.equal(oItem._getIcon(), "sap-icon://navigation-right-arrow", "No Icon set but type");

		oItem.setIcon("sap-icon://search");
		assert.equal(oItem._getIcon(), "sap-icon://search", "Custom Icon set");
	});

	QUnit.test("Item._getText", function(assert) {
		const oItem = new RowActionItem();
		const sText = TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE");

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

	async function checkRendering(oTestContext, assert, fnChanges, aExpectedIcons, aExpectedTexts) {
		fnChanges.apply(oTestContext);
		await nextUIUpdate();

		const aChildren = oTestContext.oRowAction.getDomRef().children;

		aExpectedIcons = aExpectedIcons.map(function(sIcon) {
			if (sIcon.startsWith("sap-icon://")) {
				return sIcon;
			} else {
				return "sap-icon://" + TableUtils.ThemeParameters[sIcon];
			}
		});

		if (aExpectedIcons.length === 0) {
			let bIconsHidden = true;
			for (let i = 0; i < aChildren.length; i++) {
				bIconsHidden = bIconsHidden && aChildren[i].classList.contains("sapUiTableActionHidden");
			}
			assert.ok(bIconsHidden, "All Icons hidden");
		} else if (aExpectedIcons.length === 1) {
			const aItems = oTestContext.oRowAction.getItems();
			const iVisibleIndex = aItems[0].getVisible() ? 0 : 1;
			const iHiddenIndex = iVisibleIndex === 0 ? 1 : 0;
			const oVisibleIcon = oTestContext.oRowAction.getAggregation("_icons")[iVisibleIndex];
			assert.ok(!aChildren[iVisibleIndex].classList.contains("sapUiTableActionHidden"), "The correct icon is visible");
			assert.ok(aChildren[iHiddenIndex].classList.contains("sapUiTableActionHidden"), "The correct icon is hidden");
			assert.equal(oVisibleIcon.getSrc(), aExpectedIcons[0], "Visible icon has correct src");
			assert.equal(oVisibleIcon.getTooltip_AsString(), aExpectedTexts[0], "Visible icon has correct tooltip");
		} else if (aExpectedIcons.length === 2) {
			const aIcons = oTestContext.oRowAction.getAggregation("_icons");
			assert.ok(!aChildren[0].classList.contains("sapUiTableActionHidden"), "Icon 1 visible");
			assert.ok(!aChildren[1].classList.contains("sapUiTableActionHidden"), "Icon 2 visible");
			assert.equal(aIcons[0].getSrc(), aExpectedIcons[0], "Icon 1 has correct src");
			assert.equal(aIcons[1].getSrc(), aExpectedIcons[1], "Icon 2 has correct src");
			assert.equal(aIcons[0].getTooltip_AsString(), aExpectedTexts[0], "Icon 1 has correct tooltip");
			assert.equal(aIcons[1].getTooltip_AsString(), aExpectedTexts[1], "Icon 2 has correct tooltip");
		} else {
			throw new Error("Don't expect too many icons!");
		}
	}

	QUnit.test("addItem / removeItem", async function(assert) {
		await checkRendering(this, assert, function() {
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.removeItem(this.oRowAction.getItems()[0]);
		}, [], []);
	});

	QUnit.test("insertItem / removeAllItems", async function(assert) {
		await checkRendering(this, assert, function() {
			this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://search", text: "A"}), 0);
		}, ["sap-icon://search"], ["A"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.insertItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}), 0);
		}, ["sap-icon://delete", "sap-icon://search"], ["B", "A"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.insertItem(new RowActionItem({
				icon: "sap-icon://account",
				tooltip: "C",
				text: "Wrong"
			}), 1);
		}, ["sap-icon://delete", "sap-icon://overflow"], ["B", TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MORE")]);
		await checkRendering(this, assert, function() {
			this.oRowAction.removeAllItems();
		}, [], []);
	});

	QUnit.test("addItem / destroyItems", async function(assert) {
		await checkRendering(this, assert, function() {
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.destroyItems();
		}, [], []);
	});

	QUnit.test("setVisible", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();

		await checkRendering(this, assert, function() {
			this.oRowAction.setVisible(false);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(this.oRowAction.getDomRef().classList.contains("sapUiTableActionHidden"), "RowAction hidden");
		await checkRendering(this, assert, function() {
			this.oRowAction.setVisible(true);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!this.oRowAction.getDomRef().classList.contains("sapUiTableActionHidden"), "RowAction visible");
	});

	QUnit.test("setTooltip", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();

		await checkRendering(this, assert, function() {
			this.oRowAction.setTooltip("Some Tooltip");
		}, ["sap-icon://search"], ["A"]);
		assert.equal(this.oRowAction.getDomRef().getAttribute("title"), "Some Tooltip", "Tooltip is set");
		await checkRendering(this, assert, function() {
			this.oRowAction.setTooltip("");
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!this.oRowAction.getDomRef().getAttribute("title"), "Tooltip is not set");
	});

	QUnit.test("Item.setIcon", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();

		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setIcon("sap-icon://delete");
		}, ["sap-icon://delete"], ["A"]);
	});

	QUnit.test("Item.setText / Item.setTooltip", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		await nextUIUpdate();

		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setText("Some Text");
		}, ["sap-icon://search"], ["Some Text"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setTooltip("Some Other Text");
		}, ["sap-icon://search"], ["Some Other Text"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setTooltip("");
		}, ["sap-icon://search"], ["Some Text"]);
	});

	QUnit.test("Item.setVisible", async function(assert) {
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		this.oRowAction.addItem(new RowActionItem({
			icon: "sap-icon://delete",
			tooltip: "B",
			text: "Wrong"
		}));
		await nextUIUpdate();

		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setVisible(false);
		}, ["sap-icon://delete"], ["B"]);
		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setVisible(true);
		}, ["sap-icon://search", "sap-icon://delete"], ["A", "B"]);
	});

	QUnit.test("Type Navigation", async function(assert) {
		await checkRendering(this, assert, function() {
			this.oRowAction.addItem(new RowActionItem({type: "Navigation"}));
		}, ["navigationIcon"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE")]);
		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setIcon("sap-icon://account");
		}, ["sap-icon://account"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE")]);
	});

	QUnit.test("Type Delete", async function(assert) {
		await checkRendering(this, assert, function() {
			this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		}, ["deleteIcon"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_DELETE")]);
		await checkRendering(this, assert, function() {
			this.oRowAction.getItems()[0].setIcon("sap-icon://account");
		}, ["sap-icon://account"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_DELETE")]);
	});

	QUnit.test("Non-fixed column layout", async function(assert) {
		this.oRowAction._bFixedLayout = false;
		this.oRowAction.addItem(new RowActionItem({type: "Delete", text: "A"}));
		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "B"}));
		this.oRowAction.getItems()[0].setVisible(false);
		await nextUIUpdate();

		assert.ok(!this.oRowAction.getDomRef().children[0].classList.contains("sapUiTableActionHidden"), "Icon 1 visible");
		assert.ok(this.oRowAction.getDomRef().children[1].classList.contains("sapUiTableActionHidden"), "Icon 2 hidden");
		assert.equal(this.oRowAction.getAggregation("_icons")[0].getSrc(), "sap-icon://search", "Icon 1 has correct icon");
		assert.equal(this.oRowAction.getAggregation("_icons")[0].getTooltip_AsString(), "B", "Icon 1 has correct tooltip");
	});

	QUnit.module("Behavior", {
		beforeEach: async function() {
			this.oRowAction = new RowAction();
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.oRow = new Row();
			sinon.stub(this.oRowAction, "getRow").returns(this.oRow);
			this.aInnerIcons = this.oRowAction.getAggregation("_icons");
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
		this.oRowAction.getItems()[0].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.aInnerIcons[0].firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[0], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item", function(assert) {
		let oEventParams = null;
		this.oRowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.aInnerIcons[1].firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item (non-fixed column layout)", async function(assert) {
		let oEventParams = null;

		this.oRowAction._bFixedLayout = false;
		this.oRowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.oRowAction.getItems()[0].setVisible(false);
		await nextUIUpdate();

		this.aInnerIcons[0].firePress();

		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item (click / tab)", async function(assert) {
		let oEventParams = null;

		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		await nextUIUpdate();

		assert.ok(!this.oRowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.oRowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", this.aInnerIcons[1].getDomRef());
		assert.ok(!oEventParams, "Press Event Not Triggered");

		const oMenu = this.oRowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 Items");

		oMenu.getItems()[0].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item (enter)", async function(assert) {
		let oEventParams = null;

		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		await nextUIUpdate();

		assert.ok(!this.oRowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.oRowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		qutils.triggerKeydown(this.aInnerIcons[1].getDomRef(), "ENTER");
		assert.ok(!oEventParams, "Press Event Not Triggered");

		const oMenu = this.oRowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 Items");

		oMenu.getItems()[0].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item with count 1", async function(assert) {
		let oEventParams = null;

		this.stub(this.oRowAction, "_getSize").returns(1);

		this.oRowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		await nextUIUpdate();

		assert.ok(!this.oRowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.oRowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		this.aInnerIcons[0].firePress();
		assert.ok(!oEventParams, "Press Event Not Triggered");

		const oMenu = this.oRowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 3, "Menu has 3 Items");

		oMenu.getItems()[1].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams.row, this.oRow, "Event Parameter 'row'");
		assert.equal(oEventParams.item, this.oRowAction.getItems()[1], "Event Parameter 'item'");
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

		TableUtils.getResourceBundle(); // Make sure the resource bundle is available and ready for use.

		oGetSizeStub.returns(2);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description,
			TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MULTIPLE_ACTION", [2]), "ACCInfo.description: 2 Items");

		this.oRowAction.setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - invisible");

		oGetSizeStub.returns(0);
		this.oRowAction.setVisible(true);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - no Count");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - no Count");

		oGetSizeStub.returns(2);
		this.oRowAction.getItems()[0].setVisible(false);
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items - 1 invisible");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_SINGLE_ACTION"),
			"ACCInfo.description: 2 Items - 1 invisible");

		this.oRowAction.destroyItems();
		assert.equal(this.oRowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 0 Items");
		assert.equal(this.oRowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 0 Items");
	});

	QUnit.test("Icon label", async function(assert) {
		const oRow = new Row();
		const oTable = new Table("table", {
			rowActionCount: 1
		});
		const aIcons = this.oRowAction.getAggregation("_icons");

		oTable.addDependent(oRow);
		this.stub(this.oRowAction, "getRow").returns(oRow);
		this.oRowAction.invalidate();
		await nextUIUpdate();

		for (let i = 0; i < aIcons.length; i++) {
			assert.equal(aIcons[i].getAriaLabelledBy().length, 1, "Number of Labels correct for item " + i);
			assert.equal(aIcons[i].getAriaLabelledBy()[0], oTable.getId() + "-rowacthdr", "Label correct for item " + i);
		}
	});

	QUnit.test("Menu icon", async function(assert) {
		const aIcons = this.oRowAction.getAggregation("_icons");

		for (let i = 0; i < aIcons.length; i++) {
			assert.ok(!aIcons[i].getDomRef().getAttribute("aria-haspopup"), "No aria-haspopup on icon " + i);
		}

		this.oRowAction.addItem(new RowActionItem({type: "Delete"}));
		await nextUIUpdate();

		assert.ok(!aIcons[0].getDomRef().getAttribute("aria-haspopup"), "No aria-haspopup on icon 0");
		assert.equal(aIcons[1].getDomRef().getAttribute("aria-haspopup"), "menu", "aria-haspopup on icon 1");

		this.stub(this.oRowAction, "_getSize").returns(1);
		this.oRowAction.invalidate();
		await nextUIUpdate();
		assert.equal(aIcons[0].getDomRef().getAttribute("aria-haspopup"), "menu", "aria-haspopup on icon 0");
	});
});