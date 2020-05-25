/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/Table",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device"
], function(TableQUnitUtils, qutils, RowAction, RowActionItem, Table, Row, TableUtils, Device) {
	"use strict";

	var MENUICON = "sap-icon://overflow";
	var NAVICON = "sap-icon://navigation-right-arrow";
	var DELICON = "sap-icon://sys-cancel";

	QUnit.module("API", {
		beforeEach: function() {
			this.rowAction = new RowAction();
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.rowAction.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.rowAction.destroy();
			this.rowAction = null;
		}
	});

	QUnit.test("getRow", function(assert) {
		var oAction = new RowAction();
		var oParent = {};

		oAction.getParent = function() {return oParent;};
		assert.strictEqual(oAction.getRow(), null, "_getRow returns null if the parent is not a row");

		oParent = new Row();
		assert.equal(oAction.getRow(), oParent, "_getRow returns the parent row");

		oParent.destroy();
		oAction.destroy();
	});

	QUnit.test("getTable", function(assert) {
		var oAction = new RowAction();
		var oTable = new Table();
		var oParent = {};
		var oGrandParent = oTable;

		oAction.getParent = function() {return oParent;};
		oParent.getParent = function() {return oGrandParent;};
		assert.strictEqual(oAction.getTable(), null, "getTable returns null if the parent is not a row");

		oParent = new Row();
		oParent.getParent = function() {return oGrandParent;};
		oGrandParent = {};
		assert.strictEqual(oAction.getTable(), null, "getTable returns null if the grand parent is not a table");

		oGrandParent = oTable;
		assert.equal(oAction.getTable(), oTable, "getTable returns the grand parent table");

		oParent.destroy();
		oGrandParent.destroy();
		oAction.destroy();
	});

	QUnit.test("Item._getIcon", function(assert) {
		var oItem = new RowActionItem();
		this.rowAction.addItem(oItem);
		assert.ok(!oItem._getIcon(), "No Icon set");
		oItem.setType("Navigation");
		assert.equal(oItem._getIcon(), "sap-icon://navigation-right-arrow", "No Icon set but type");
		oItem.setIcon("sap-icon://search");
		assert.equal(oItem._getIcon(), "sap-icon://search", "Custom Icon set");
	});

	QUnit.test("Item._getText", function(assert) {
		var oItem = new RowActionItem();
		this.rowAction.addItem(oItem);
		assert.ok(!oItem._getText(false), "No Text or Tooltip set (Text preferred)");
		assert.ok(!oItem._getText(true), "No Text or Tooltip set (Tooltip preferred)");
		oItem.setType("Navigation");
		var sText = TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE");
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
		beforeEach: function() {
			this.rowAction = new RowAction();
			this.rowAction.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.rowAction.destroy();
			this.rowAction = null;
		}
	});

	function checkRendering(that, sText, assert, fnChanges, aExpectedIcons, aExpectedTexts) {
		fnChanges.apply(that);
		sap.ui.getCore().applyChanges();

		var aChildren = that.rowAction.getDomRef().children;

		if (!aExpectedIcons || aExpectedIcons.length === 0) {
			var bIconsHidden = true;
			for (var i = 0; i < aChildren.length; i++) {
				bIconsHidden = bIconsHidden && aChildren[i].classList.contains("sapUiTableActionHidden");
			}
			assert.ok(bIconsHidden, "All Icons hidden");
		} else if (aExpectedIcons.length === 1) {
			var aItems = that.rowAction.getItems();
			var iVisibleIndex = aItems[0].getVisible() ? 0 : 1;
			var iHiddenIndex = iVisibleIndex === 0 ? 1 : 0;
			var oVisibleIcon = that.rowAction.getAggregation("_icons")[iVisibleIndex];
			assert.ok(!aChildren[iVisibleIndex].classList.contains("sapUiTableActionHidden"), "The correct icon is visible");
			assert.ok(aChildren[iHiddenIndex].classList.contains("sapUiTableActionHidden"), "The correct icon is hidden");
			assert.equal(oVisibleIcon.getSrc(), aExpectedIcons[0], "Visible icon has correct src");
			assert.equal(oVisibleIcon.getTooltip_AsString(), aExpectedTexts[0], "Visible icon has correct tooltip");
		} else if (aExpectedIcons.length === 2) {
			var aIcons = that.rowAction.getAggregation("_icons");
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

	QUnit.test("addItem / removeItem", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "removeItem", assert, function() {
			this.rowAction.removeItem(this.rowAction.getItems()[0]);
		}, [], []);
	});

	QUnit.test("insertItem / removeAllItems", function(assert) {
		checkRendering(this, "insertItem", assert, function() {
			this.rowAction.insertItem(new RowActionItem({icon: "sap-icon://search", text: "A"}), 0);
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "insertItem", assert, function() {
			this.rowAction.insertItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}), 0);
		}, ["sap-icon://delete", "sap-icon://search"], ["B", "A"]);
		checkRendering(this, "insertItem", assert, function() {
			this.rowAction.insertItem(new RowActionItem({
				icon: "sap-icon://account",
				tooltip: "C",
				text: "Wrong"
			}), 1);
		}, ["sap-icon://delete", MENUICON], ["B", TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MORE")]);
		checkRendering(this, "removeAllItems", assert, function() {
			this.rowAction.removeAllItems();
		}, [], []);
	});

	QUnit.test("addItem / destroyItems", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "destroyItems", assert, function() {
			this.rowAction.destroyItems();
		}, [], []);
	});

	QUnit.test("setVisible", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		sap.ui.getCore().applyChanges();

		checkRendering(this, "setVisible", assert, function() {
			this.rowAction.setVisible(false);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(this.rowAction.getDomRef().classList.contains("sapUiTableActionHidden"), "RowAction hidden");
		checkRendering(this, "setVisible", assert, function() {
			this.rowAction.setVisible(true);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!this.rowAction.getDomRef().classList.contains("sapUiTableActionHidden"), "RowAction visible");
	});

	QUnit.test("setTooltip", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		sap.ui.getCore().applyChanges();

		checkRendering(this, "setTooltip", assert, function() {
			this.rowAction.setTooltip("Some Tooltip");
		}, ["sap-icon://search"], ["A"]);
		assert.equal(this.rowAction.getDomRef().getAttribute("title"), "Some Tooltip", "Tooltip is set");
		checkRendering(this, "setTooltip", assert, function() {
			this.rowAction.setTooltip("");
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!this.rowAction.getDomRef().getAttribute("title"), "Tooltip is not set");
	});

	QUnit.test("Item.setIcon", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		sap.ui.getCore().applyChanges();

		checkRendering(this, "Item.setIcon", assert, function() {
			this.rowAction.getItems()[0].setIcon("sap-icon://delete");
		}, ["sap-icon://delete"], ["A"]);
	});

	QUnit.test("Item.setText / Item.setTooltip", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		sap.ui.getCore().applyChanges();

		checkRendering(this, "Item.setText", assert, function() {
			this.rowAction.getItems()[0].setText("Some Text");
		}, ["sap-icon://search"], ["Some Text"]);
		checkRendering(this, "Item.setTooltip", assert, function() {
			this.rowAction.getItems()[0].setTooltip("Some Other Text");
		}, ["sap-icon://search"], ["Some Other Text"]);
		checkRendering(this, "Item.setTooltip", assert, function() {
			this.rowAction.getItems()[0].setTooltip("");
		}, ["sap-icon://search"], ["Some Text"]);
	});

	QUnit.test("Item.setVisible", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		this.rowAction.addItem(new RowActionItem({
			icon: "sap-icon://delete",
			tooltip: "B",
			text: "Wrong"
		}));
		sap.ui.getCore().applyChanges();

		checkRendering(this, "Item.setVisible", assert, function() {
			this.rowAction.getItems()[0].setVisible(false);
		}, ["sap-icon://delete"], ["B"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.getItems()[0].setVisible(true);
		}, ["sap-icon://search", "sap-icon://delete"], ["A", "B"]);
	});

	QUnit.test("Type Navigation", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({type: "Navigation"}));
		}, [NAVICON], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE")]);
		checkRendering(this, "setIcon", assert, function() {
			this.rowAction.getItems()[0].setIcon("sap-icon://account");
		}, ["sap-icon://account"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NAVIGATE")]);
	});

	QUnit.test("Type Delete", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({type: "Delete"}));
		}, [DELICON], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_DELETE")]);
		checkRendering(this, "setIcon", assert, function() {
			this.rowAction.getItems()[0].setIcon("sap-icon://account");
		}, ["sap-icon://account"], [TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_DELETE")]);
	});

	QUnit.test("Non-fixed column layout", function(assert) {
		this.rowAction._bFixedLayout = false;
		this.rowAction.addItem(new RowActionItem({type: "Delete", text: "A"}));
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "B"}));
		this.rowAction.getItems()[0].setVisible(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!this.rowAction.getDomRef().children[0].classList.contains("sapUiTableActionHidden"), "Icon 1 visible");
		assert.ok(this.rowAction.getDomRef().children[1].classList.contains("sapUiTableActionHidden"), "Icon 2 hidden");
		assert.equal(this.rowAction.getAggregation("_icons")[0].getSrc(), "sap-icon://search", "Icon 1 has correct icon");
		assert.equal(this.rowAction.getAggregation("_icons")[0].getTooltip_AsString(), "B", "Icon 1 has correct tooltip");
	});

	QUnit.module("Behavior", {
		beforeEach: function() {
			var that = this;
			this.rowAction = new RowAction();
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.rowAction.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			this.row = {};
			this.rowAction._getRow = function() {
				return that.row;
			};

			this.aInnerIcons = this.rowAction.getAggregation("_icons");
		},
		afterEach: function() {
			this.rowAction.destroy();
			this.rowAction = null;
		}
	});

	QUnit.test("Press on first item", function(assert) {
		var oEventParams = null;
		this.rowAction.getItems()[0].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.aInnerIcons[0].firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[0], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item", function(assert) {
		var oEventParams = null;
		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.aInnerIcons[1].firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on second item (non-fixed column layout)", function(assert) {
		var oEventParams = null;

		this.rowAction._bFixedLayout = false;
		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.rowAction.getItems()[0].setVisible(false);
		sap.ui.getCore().applyChanges();

		this.aInnerIcons[0].firePress();

		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item (click / tab)", function(assert) {
		var oEventParams = null;

		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		sap.ui.getCore().applyChanges();

		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		qutils.triggerEvent(Device.support.touch && !Device.system.desktop ? "tap" : "click", this.aInnerIcons[1].getDomRef());
		assert.ok(!oEventParams, "Press Event Not Triggered");

		var oMenu = this.rowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 Items");

		oMenu.getItems()[0].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item (enter)", function(assert) {
		var oEventParams = null;

		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		sap.ui.getCore().applyChanges();

		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		qutils.triggerKeyup(this.aInnerIcons[1].getDomRef(), "ENTER");
		assert.ok(!oEventParams, "Press Event Not Triggered");

		var oMenu = this.rowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 2, "Menu has 2 Items");

		oMenu.getItems()[0].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item with count 1", function(assert) {
		var oEventParams = null;

		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		this.rowAction._getSize = function() {return 1;};
		sap.ui.getCore().applyChanges();

		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");

		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});

		this.aInnerIcons[0].firePress();
		assert.ok(!oEventParams, "Press Event Not Triggered");

		var oMenu = this.rowAction.getAggregation("_menu");
		assert.ok(oMenu, "Menu initialized");
		assert.ok(oMenu.bOpen, "Menu is open");
		assert.equal(oMenu.getItems().length, 3, "Menu has 3 Items");

		oMenu.getItems()[1].fireSelect();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.module("ACC", {
		beforeEach: function() {
			this.rowAction = new RowAction();
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.rowAction.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.rowAction.destroy();
			this.rowAction = null;
		}
	});

	QUnit.test("getAccessibilityInfo", function(assert) {
		TableUtils.getResourceBundle(); // Make sure the resource bundle is available and ready for use.

		assert.equal(this.rowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MULTIPLE_ACTION", [2]),
			"ACCInfo.description: 2 Items");
		this.rowAction.setVisible(false);
		assert.equal(this.rowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - invisible");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - invisible");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - invisible");
		this.rowAction.setVisible(true);
		this.rowAction._getSize = function() {return 0;};
		assert.equal(this.rowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - no Count");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - no Count");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - no Count");
		this.rowAction._getSize = function() {return 2;};
		this.rowAction.getItems()[0].setVisible(false);
		assert.equal(this.rowAction.getAccessibilityInfo().focusable, true, "ACCInfo.focusable: 2 Items - 1 invisible");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, true, "ACCInfo.enabled: 2 Items - 1 invisible");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_SINGLE_ACTION"),
			"ACCInfo.description: 2 Items - 1 invisible");
		this.rowAction.destroyItems();
		assert.equal(this.rowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 0 Items");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 0 Items");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 0 Items");
	});

	QUnit.test("Icon label", function(assert) {
		var oTableDummy = {
			getId: function() {return "table";},
			getRowActionCount: function() {return 2;}
		};
		var aIcons = this.rowAction.getAggregation("_icons");

		this.rowAction.getTable = function() {return oTableDummy;};
		this.rowAction.rerender();

		for (var i = 0; i < aIcons.length; i++) {
			assert.equal(aIcons[i].getAriaLabelledBy().length, 1, "Number of Labels correct for item " + i);
			assert.equal(aIcons[i].getAriaLabelledBy()[0], "table-rowacthdr", "Label correct for item " + i);
		}
	});

	QUnit.test("Menu icon", function(assert) {
		var aIcons = this.rowAction.getAggregation("_icons");

		for (var i = 0; i < aIcons.length; i++) {
			assert.ok(!aIcons[i].getDomRef().getAttribute("aria-haspopup"), "No aria-haspopup on icon " + i);
		}

		this.rowAction.addItem(new RowActionItem({type: "Delete"}));
		sap.ui.getCore().applyChanges();

		assert.ok(!aIcons[0].getDomRef().getAttribute("aria-haspopup"), "No aria-haspopup on icon 0");
		assert.equal(aIcons[1].getDomRef().getAttribute("aria-haspopup"), "true", "aria-haspopup on icon 1");

		this.rowAction._getSize = function() {return 1;};
		this.rowAction.rerender();
		assert.equal(aIcons[0].getDomRef().getAttribute("aria-haspopup"), "true", "aria-haspopup on icon 0");
	});
});