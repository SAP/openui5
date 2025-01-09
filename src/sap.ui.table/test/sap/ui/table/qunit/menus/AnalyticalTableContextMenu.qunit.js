/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/menus/AnalyticalTableContextMenu",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils"
], function(
	TableQUnitUtils,
	AnalyticalTableContextMenu,
	AnalyticalTable,
	Row,
	TableUtils
) {
	"use strict";

	QUnit.module("Menu items", {
		beforeEach: function() {
			this.oContextMenu = new AnalyticalTableContextMenu();
			this.oTable = new AnalyticalTable();
			this.oRow = new Row();
			this.oContextMenu.setParent(this.oTable);
		},
		afterEach: function() {
			this.oContextMenu.destroy();
			this.oTable.destroy();
			this.oRow.destroy();
		}
	});

	QUnit.test("Group header row", function(assert) {
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);

		const aMenuItems = this.oContextMenu.getMenu().getItems();
		assert.equal(aMenuItems.length, 6, "Menu items");

		assert.equal(aMenuItems[0].getText(), TableUtils.getResourceText("TBL_UNGROUP"), "Ungroup; Text");
		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[0].getEnabled(), true, "Ungroup; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_LEVEL"), "Ungroup level; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getVisible(), true, "Ungroup level; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getEnabled(), true, "Ungroup level; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_ALL"), "Ungroup all; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getVisible(), true, "Ungroup all; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getEnabled(), true, "Ungroup all; Enabled");

		assert.equal(aMenuItems[1].getText(), TableUtils.getResourceText("TBL_COLLAPSE"), "Collapse; Text");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[1].getEnabled(), true, "Collapse; Enabled");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://collapse-all", "Collapse; Icon");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"), "Collapse level; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getVisible(), true, "Collapse level; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getEnabled(), true, "Collapse level; Enabled");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_ALL"), "Collapse all; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getVisible(), true, "Collapse all; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getEnabled(), true, "Collapse all; Enabled");

		assert.equal(aMenuItems[2].getText(), TableUtils.getResourceText("TBL_EXPAND"), "Expand; Text");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[2].getEnabled(), true, "Expand; Enabled");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://expand-all", "Expand; Icon");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_EXPAND_LEVEL"), "Expand level; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getVisible(), true, "Expand level; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getEnabled(), true, "Expand level; Enabled");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_EXPAND_ALL"), "Expand all; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getVisible(), true, "Expand all; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getEnabled(), true, "Expand all; Enabled");

		assert.equal(aMenuItems[3].getText(), TableUtils.getResourceText("TBL_SHOW_COLUMN"), "Show column");
		assert.equal(aMenuItems[3].getVisible(), true, "Show column; Visible");
		assert.equal(aMenuItems[3].getEnabled(), true, "Show column; Enabled");

		assert.equal(aMenuItems[4].getText(), TableUtils.getResourceText("TBL_MOVE"), "Move group; Text");
		assert.equal(aMenuItems[4].getVisible(), true, "Move group; Visible");
		assert.equal(aMenuItems[4].getEnabled(), true, "Move group; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_MOVE_UP"), "Move group one level up; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getVisible(), true, "Move group one level up; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getEnabled(), true, "Move group one level up; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getIcon(), "sap-icon://arrow-top", "Move group one level up; Icon");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_MOVE_DOWN"), "Move group one level down; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getVisible(), true, "Move group one level down; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getEnabled(), true, "Move group one level down; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getIcon(), "sap-icon://arrow-bottom", "Move group one level down; Icon");

		assert.equal(aMenuItems[5].getText(), TableUtils.getResourceText("TBL_SORT"), "Sort; Text");
		assert.equal(aMenuItems[5].getVisible(), true, "Sort; Visible");
		assert.equal(aMenuItems[5].getEnabled(), true, "Sort; Enabled");
		assert.equal(aMenuItems[5].getIcon(), "sap-icon://sort", "Sort; Icon");
	});

	QUnit.test("Group header row; Basic menu items", function(assert) {
		this.oTable.setProperty("extendedGroupHeaderMenu", false);
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);

		const aMenuItems = this.oContextMenu.getMenu().getItems();
		assert.equal(aMenuItems.length, 6, "Menu items");

		assert.equal(aMenuItems[0].getText(), TableUtils.getResourceText("TBL_UNGROUP"), "Ungroup; Text");
		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[0].getEnabled(), true, "Ungroup; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_LEVEL"), "Ungroup level; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getVisible(), true, "Ungroup level; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[0].getEnabled(), true, "Ungroup level; Enabled");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_UNGROUP_ALL"), "Ungroup all; Text");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getVisible(), true, "Ungroup all; Visible");
		assert.equal(aMenuItems[0].getSubmenu().getItems()[1].getEnabled(), true, "Ungroup all; Enabled");

		assert.equal(aMenuItems[1].getText(), TableUtils.getResourceText("TBL_COLLAPSE"), "Collapse; Text");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[1].getEnabled(), true, "Collapse; Enabled");
		assert.equal(aMenuItems[1].getIcon(), "sap-icon://collapse-all", "Collapse; Icon");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_LEVEL"), "Collapse level; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getVisible(), true, "Collapse level; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[0].getEnabled(), true, "Collapse level; Enabled");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_COLLAPSE_ALL"), "Collapse all; Text");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getVisible(), true, "Collapse all; Visible");
		assert.equal(aMenuItems[1].getSubmenu().getItems()[1].getEnabled(), true, "Collapse all; Enabled");

		assert.equal(aMenuItems[2].getText(), TableUtils.getResourceText("TBL_EXPAND"), "Expand; Text");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[2].getEnabled(), true, "Expand; Enabled");
		assert.equal(aMenuItems[2].getIcon(), "sap-icon://expand-all", "Expand; Icon");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_EXPAND_LEVEL"), "Expand level; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getVisible(), true, "Expand level; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[0].getEnabled(), true, "Expand level; Enabled");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_EXPAND_ALL"), "Expand all; Text");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getVisible(), true, "Expand all; Visible");
		assert.equal(aMenuItems[2].getSubmenu().getItems()[1].getEnabled(), true, "Expand all; Enabled");

		assert.equal(aMenuItems[3].getText(), TableUtils.getResourceText("TBL_SHOW_COLUMN"), "Show column");
		assert.equal(aMenuItems[3].getVisible(), false, "Show column; Visible");
		assert.equal(aMenuItems[3].getEnabled(), true, "Show column; Enabled");

		assert.equal(aMenuItems[4].getText(), TableUtils.getResourceText("TBL_MOVE"), "Move group; Text");
		assert.equal(aMenuItems[4].getVisible(), false, "Move group; Visible");
		assert.equal(aMenuItems[4].getEnabled(), true, "Move group; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getText(),
			TableUtils.getResourceText("TBL_MOVE_UP"), "Move group one level up; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getVisible(), true, "Move group one level up; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getEnabled(), true, "Move group one level up; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[0].getIcon(), "sap-icon://arrow-top", "Move group one level up; Icon");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getText(),
			TableUtils.getResourceText("TBL_MOVE_DOWN"), "Move group one level down; Text");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getVisible(), true, "Move group one level down; Visible");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getEnabled(), true, "Move group one level down; Enabled");
		assert.equal(aMenuItems[4].getSubmenu().getItems()[1].getIcon(), "sap-icon://arrow-bottom", "Move group one level down; Icon");

		assert.equal(aMenuItems[5].getText(), TableUtils.getResourceText("TBL_SORT"), "Sort; Text");
		assert.equal(aMenuItems[5].getVisible(), false, "Sort; Visible");
		assert.equal(aMenuItems[5].getEnabled(), true, "Sort; Enabled");
		assert.equal(aMenuItems[5].getIcon(), "sap-icon://sort", "Sort; Icon");

		this.oTable.setProperty("extendedGroupHeaderMenu", true);
		this.oContextMenu.initContent(this.oRow);

		assert.equal(aMenuItems[0].getVisible(), true, "Ungroup; Visible");
		assert.equal(aMenuItems[1].getVisible(), true, "Collapse; Visible");
		assert.equal(aMenuItems[2].getVisible(), true, "Expand; Visible");
		assert.equal(aMenuItems[3].getVisible(), true, "Show column; Visible");
		assert.equal(aMenuItems[4].getVisible(), true, "Move group; Visible");
		assert.equal(aMenuItems[5].getVisible(), true, "Sort; Visible");
	});

	QUnit.test("Standard row", function(assert) {
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 0, "Menu items");
	});

	QUnit.test("Summary row", function(assert) {
		sinon.stub(this.oRow, "isSummary").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 0, "Menu items");
	});

	QUnit.test("Standard row after group header row", function(assert) {
		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Group header row");

		this.oRow.isGroupHeader.restore();
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Standard row");

		this.oContextMenu.getMenu().getItems().forEach((oItem) => {
			assert.equal(oItem.getVisible(), false, "Menu item visibility; " + oItem.getText());
		});

		sinon.stub(this.oRow, "isGroupHeader").returns(true);
		this.oContextMenu.initContent(this.oRow);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 6, "Menu items; Group header row");

		this.oContextMenu.getMenu().getItems().forEach((oItem) => {
			assert.equal(oItem.getVisible(), true, "Menu item visibility; " + oItem.getText());
		});
	});
});