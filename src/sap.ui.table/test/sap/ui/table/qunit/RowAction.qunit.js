/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/RowAction",
	"sap/ui/table/RowActionItem",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device"
], function(qutils, RowAction, RowActionItem, Row, TableUtils, Device) {
	"use strict";

	var MENUICON = "sap-icon://overflow";
	var NAVICON = "sap-icon://navigation-right-arrow";
	var DELICON = "sap-icon://sys-cancel";

	QUnit.module("Rendering", {
		beforeEach: function() {
			this.rowAction = new RowAction();
			this.rowAction.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();

			this.iRenderCounter = 0;
			var that = this;
			var oDelegate = {
				onAfterRendering: function() {
					that.iRenderCounter++;
				}
			};

			this.rowAction.addEventDelegate(oDelegate);
			var aIcons = this.rowAction.getAggregation("_icons");
			for (var i = 0; i < aIcons.length; i++) {
				aIcons[i].addEventDelegate(oDelegate);
			}
		},
		afterEach: function() {
			this.rowAction.destroy();
			this.rowAction = null;
		}
	});

	function checkRendering(that, sText, assert, fnChanges, aExpectedIcons, aExpectedTexts) {
		that.iRenderCounter = 0;
		var bSkipRenderingCheck = fnChanges.apply(that);
		sap.ui.getCore().applyChanges();
		if (!bSkipRenderingCheck) {
			assert.equal(that.iRenderCounter, 0, "No Rerendering triggered on calling " + sText);
		}
		if (!aExpectedIcons || aExpectedIcons.length == 0) {
			var bIconsHidden = true;
			var aChildren = that.rowAction.$().children();
			for (var i = 0; i < aChildren.length; i++) {
				bIconsHidden = bIconsHidden && jQuery(aChildren[i]).hasClass("sapUiTableActionHidden");
			}
			assert.ok(bIconsHidden, "All Icons hidden");
		} else if (aExpectedIcons.length == 1) {
			assert.ok(!jQuery(that.rowAction.$().children().get(0)).hasClass("sapUiTableActionHidden"), "Icon 1 visible");
			assert.ok(jQuery(that.rowAction.$().children().get(1)).hasClass("sapUiTableActionHidden"), "Icon 2 hidden");
			assert.equal(that.rowAction.getAggregation("_icons")[0].getSrc(), aExpectedIcons[0], "Icon 1 has correct icon");
			assert.equal(that.rowAction.getAggregation("_icons")[0].getTooltip_AsString(), aExpectedTexts[0], "Icon 1 has correct tooltip");
		} else if (aExpectedIcons.length >= 2) {
			assert.ok(!jQuery(that.rowAction.$().children().get(0)).hasClass("sapUiTableActionHidden"), "Icon 1 visible");
			assert.ok(!jQuery(that.rowAction.$().children().get(1)).hasClass("sapUiTableActionHidden"), "Icon 2 visible");
			assert.equal(that.rowAction.getAggregation("_icons")[0].getSrc(), aExpectedIcons[0], "Icon 1 has correct icon");
			assert.equal(that.rowAction.getAggregation("_icons")[1].getSrc(), aExpectedIcons[1], "Icon 2 has correct icon");
			assert.equal(that.rowAction.getAggregation("_icons")[0].getTooltip_AsString(), aExpectedTexts[0], "Icon 1 has correct tooltip");
			assert.equal(that.rowAction.getAggregation("_icons")[1].getTooltip_AsString(), aExpectedTexts[1], "Icon 2 has correct tooltip");
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
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "setVisible", assert, function() {
			this.rowAction.setVisible(false);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(jQuery(this.rowAction.$()).hasClass("sapUiTableActionHidden"), "RowAction hidden");
		checkRendering(this, "setVisible", assert, function() {
			this.rowAction.setVisible(true);
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!jQuery(this.rowAction.$()).hasClass("sapUiTableActionHidden"), "RowAction visible");
	});

	QUnit.test("setTooltip", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "setTooltip", assert, function() {
			this.rowAction.setTooltip("Some Tooltip");
		}, ["sap-icon://search"], ["A"]);
		assert.equal(jQuery(this.rowAction.$()).attr("title"), "Some Tooltip", "Tooltip is set");
		checkRendering(this, "setTooltip", assert, function() {
			this.rowAction.setTooltip("");
		}, ["sap-icon://search"], ["A"]);
		assert.ok(!jQuery(this.rowAction.$()).attr("title"), "Tooltip is not set");
	});

	QUnit.test("Item.setIcon", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "Item.setIcon", assert, function() {
			this.rowAction.getItems()[0].setIcon("sap-icon://delete");
		}, ["sap-icon://delete"], ["A"]);
	});

	QUnit.test("Item.setText / Item.setTooltip", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
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
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({
				icon: "sap-icon://delete",
				tooltip: "B",
				text: "Wrong"
			}));
		}, ["sap-icon://search", "sap-icon://delete"], ["A", "B"]);
		checkRendering(this, "Item.setVisible", assert, function() {
			this.rowAction.getItems()[0].setVisible(false);
		}, ["sap-icon://delete"], ["B"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.getItems()[0].setVisible(true);
		}, ["sap-icon://search", "sap-icon://delete"], ["A", "B"]);
	});

	QUnit.test("Renderer", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "A"}));
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, ["sap-icon://search"], ["A"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://delete", tooltip: "B"}));
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, ["sap-icon://search", "sap-icon://delete"], ["A", "B"]);
		checkRendering(this, "insertItem", assert, function() {
			this.rowAction.insertItem(new RowActionItem({
				icon: "sap-icon://account",
				tooltip: "C",
				text: "Wrong"
			}), 1);
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, ["sap-icon://search", MENUICON], ["A", TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MORE")]);
		checkRendering(this, "setTooltip", assert, function() {
			this.rowAction.setTooltip("Some Tooltip");
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, ["sap-icon://search", MENUICON], ["A", TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_MORE")]);
		assert.equal(jQuery(this.rowAction.$()).attr("title"), "Some Tooltip", "Tooltip is set");
		checkRendering(this, "destroyItems", assert, function() {
			this.rowAction.destroyItems();
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, [], []);
		checkRendering(this, "setVisible", assert, function() {
			this.rowAction.setVisible(false);
			this.rowAction.invalidate(); //Force Rerendering
			sap.ui.getCore().applyChanges();
			return true;
		}, [], []);
		assert.ok(jQuery(this.rowAction.$()).hasClass("sapUiTableActionHidden"), "RowAction hidden");
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

	QUnit.test("Fixed Column Layout", function(assert) {
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({type: "Delete", text: "A"}));
		}, [DELICON], ["A"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.addItem(new RowActionItem({icon: "sap-icon://search", text: "B"}));
		}, [DELICON, "sap-icon://search"], ["A", "B"]);
		checkRendering(this, "addItem", assert, function() {
			this.rowAction.getItems()[0].setVisible(false);
		}, ["sap-icon://search"], ["B"]);
		this.rowAction._setFixedLayout(true);
		assert.ok(jQuery(this.rowAction.$().children().get(0)).hasClass("sapUiTableActionHidden"), "Icon 1 hidden");
		assert.ok(!jQuery(this.rowAction.$().children().get(1)).hasClass("sapUiTableActionHidden"), "Icon 2 visible");
		assert.equal(this.rowAction.getAggregation("_icons")[1].getSrc(), "sap-icon://search", "Icon 2 has correct icon");
		assert.equal(this.rowAction.getAggregation("_icons")[1].getTooltip_AsString(), "B", "Icon 2 has correct tooltip");
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

	QUnit.test("_getRow", function(assert) {
		var oAction = new RowAction();
		var oParent = {};
		oAction.getParent = function() {
			return oParent;
		};
		assert.equal(oAction._getRow(), null, "_getRow returns null if the parent is not a row");
		oParent = new Row();
		assert.equal(oAction._getRow(), oParent, "_getRow returns the parent row");
		oAction.destroy();
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

	QUnit.test("Press on second item (Fixed Column Layout)", function(assert) {
		var oEventParams = null;
		this.rowAction.getItems()[1].attachPress(function(oEvent) {
			oEventParams = oEvent.getParameters();
		});
		this.rowAction._setFixedLayout(true);
		this.rowAction.getItems()[0].setVisible(false);
		this.aInnerIcons[1].firePress();
		assert.ok(!!oEventParams, "Press Event Triggered");
		assert.equal(oEventParams["row"], this.row, "Event Parameter 'row'");
		assert.equal(oEventParams["item"], this.rowAction.getItems()[1], "Event Parameter 'item'");
	});

	QUnit.test("Press on menu item (click / tab)", function(assert) {
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");
		var oEventParams = null;
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
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");
		var oEventParams = null;
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
		this.rowAction.addItem(new RowActionItem({icon: "sap-icon://account", tooltip: "C"}));
		this.rowAction._setCount(1);
		assert.ok(!this.rowAction.getAggregation("_menu"), "No Menu initialized yet");
		var oEventParams = null;
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

	QUnit.test("Count", function(assert) {
		assert.equal(this.rowAction._getCount(), 2, "Initial Count");
		this.rowAction._setCount(1);
		assert.equal(this.rowAction._getCount(), 1, "Valid Count");
		this.rowAction._setCount(-1);
		assert.equal(this.rowAction._getCount(), 0, "Count too small");
		this.rowAction._setCount(3);
		assert.equal(this.rowAction._getCount(), 2, "Count too big");
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
		this.rowAction._setCount(0);
		assert.equal(this.rowAction.getAccessibilityInfo().focusable, false, "ACCInfo.focusable: 2 Items - no Count");
		assert.equal(this.rowAction.getAccessibilityInfo().enabled, false, "ACCInfo.enabled: 2 Items - no Count");
		assert.equal(this.rowAction.getAccessibilityInfo().description, TableUtils.getResourceBundle().getText("TBL_ROW_ACTION_NO_ACTION"),
			"ACCInfo.description: 2 Items - no Count");
		this.rowAction._setCount(2);
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

	QUnit.test("_setIconLabel", function(assert) {
		this.rowAction._setIconLabel("hello");
		this.rowAction._setIconLabel("hello2");
		var aIcons = this.rowAction.getAggregation("_icons");
		for (var i = 0; i < aIcons.length; i++) {
			assert.equal(aIcons[i].getAriaLabelledBy().length, 1, "Number of Labels correct for item " + i);
			assert.equal(aIcons[i].getAriaLabelledBy()[0], "hello2", "Label correct for item " + i);
		}
	});

	QUnit.test("Menu Icon", function(assert) {
		var aIcons = this.rowAction.getAggregation("_icons");
		for (var i = 0; i < aIcons.length; i++) {
			assert.ok(!aIcons[i].$().attr("aria-haspopup"), "No aria-haspopup on icon " + i);
		}
		this.rowAction.addItem(new RowActionItem({type: "Delete"}));
		assert.ok(!aIcons[0].$().attr("aria-haspopup"), "No aria-haspopup on icon 0");
		assert.equal(aIcons[1].$().attr("aria-haspopup"), "true", "aria-haspopup on icon 1");
		this.rowAction._setCount(1);
		assert.equal(aIcons[0].$().attr("aria-haspopup"), "true", "aria-haspopup on icon 0");
	});
});