/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/mdc/table/menu/GroupHeaderRowContextMenu",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/TableDelegate",
	"sap/ui/mdc/table/utils/Personalization",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/core/Lib"
], function(
	GroupHeaderRowContextMenu,
	Table,
	TableDelegate,
	PersonalizationUtils,
	Menu,
	MenuItem,
	Lib
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oContextMenu = new GroupHeaderRowContextMenu();
		},
		afterEach: function() {
			this.oContextMenu.destroy();
		}
	});

	QUnit.test("#initContent", function(assert) {
		const oTable = new Table();

		assert.notOk(this.oContextMenu.getMenu(), "Content not initialized initially");

		this.oContextMenu.initContent(oTable, {groupLevel: 1});
		assert.ok(this.oContextMenu.getMenu().isA("sap.m.Menu"), "sap.m.Menu", "sap.m.Menu created");

		oTable.destroy();
	});

	QUnit.test("#isEmpty", function(assert) {
		const oMenu = new Menu();

		assert.ok(this.oContextMenu.isEmpty(), "Empty initially");

		this.oContextMenu.setMenu(oMenu);
		assert.ok(this.oContextMenu.isEmpty(), "Empty menu");

		oMenu.addItem(new MenuItem({visible: false}));
		assert.ok(this.oContextMenu.isEmpty(), "Invisible menu item");

		oMenu.getItems()[0].setVisible(true);
		assert.notOk(this.oContextMenu.isEmpty(), "Visible menu item");
	});

	QUnit.test("#openAsContextMenu", function(assert) {
		const oMenu = new Menu();
		const oEvent = "event argument";
		const oElement = "element argument";

		this.oContextMenu.setMenu(oMenu);
		this.stub(oMenu, "openAsContextMenu");

		this.oContextMenu.openAsContextMenu(oEvent, oElement);
		assert.ok(oMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oElement), "Menu#openAsContextMenu call");
	});

	QUnit.test("#close", function(assert) {
		const oMenu = new Menu();

		this.oContextMenu.setMenu(oMenu);
		this.stub(oMenu, "close");

		this.oContextMenu.close();
		assert.ok(oMenu.close.calledOnceWithExactly(), "Menu#close call");
	});

	QUnit.test("#invalidate", function(assert) {
		const oTable = new Table({
			dependents: this.oContextMenu
		});

		this.spy(oTable, "invalidate");
		this.oContextMenu.invalidate();
		assert.notOk(oTable.invalidate.called, "Table#invalidate call");

		oTable.destroy();
	});

	QUnit.module("Menu items", {
		beforeEach: async function() {
			this.oContextMenu = new GroupHeaderRowContextMenu();
			this.stub(TableDelegate, "getSupportedFeatures").returns({
				p13nModes: ["Group"]
			});
			this.oTable = new Table({
				delegate: {
					name: "sap/ui/mdc/TableDelegate"
				},
				dependents: this.oContextMenu
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Ungroup item", function(assert) {
		this.oContextMenu.initContent(this.oTable, {groupLevel: 1});

		const oUngroupItem = this.oContextMenu.getMenu().getItems()[0];
		const oUngroupLevelItem = oUngroupItem.getItems()[0];
		const oUngroupAllItem = oUngroupItem.getItems()[1];
		const oResourceBundle = Lib.getResourceBundleFor("sap.ui.mdc");

		assert.notOk(oUngroupItem.getVisible(), "Visible; p13nMode 'Group' not active");
		assert.strictEqual(oUngroupItem.getText(), oResourceBundle.getText("table.TBL_UNGROUP"), "Text");
		assert.strictEqual(oUngroupItem.getItems().length, 2, "Submenu items");
		assert.strictEqual(oUngroupLevelItem.getText(), oResourceBundle.getText("table.TBL_UNGROUP_LEVEL"), "Ungroup Level text");
		assert.strictEqual(oUngroupAllItem.getText(), oResourceBundle.getText("table.TBL_UNGROUP_ALL"), "Ungroup All text");

		this.oTable.setP13nMode(["Group"]);
		assert.ok(oUngroupItem.getVisible(), "Visible; p13nMode 'Group' active");

		this.oTable.setP13nMode();
		assert.notOk(oUngroupItem.getVisible(), "Visible; p13nMode 'Group' not active");

		this.oTable.setGroupConditions({
			groupLevels: [
				{name: "myGroupedProperty"},
				{name: "myOtherGroupedProperty"}
			]
		});
		this.stub(PersonalizationUtils, "createGroupChange");
		this.stub(PersonalizationUtils, "createClearGroupsChange");

		oUngroupLevelItem.firePress();
		assert.equal(PersonalizationUtils.createGroupChange.callCount, 1, "PersonalizationUtils.createGroupChange call");
		sinon.assert.calledWithExactly(PersonalizationUtils.createGroupChange, this.oTable, {propertyKey: "myGroupedProperty"});

		PersonalizationUtils.createGroupChange.resetHistory();
		this.oContextMenu.initContent(this.oTable, {groupLevel: 2});
		oUngroupLevelItem.firePress();
		assert.equal(PersonalizationUtils.createGroupChange.callCount, 1, "PersonalizationUtils.createGroupChange call");
		sinon.assert.calledWithExactly(PersonalizationUtils.createGroupChange, this.oTable, {propertyKey: "myOtherGroupedProperty"});

		oUngroupAllItem.firePress();
		assert.equal(PersonalizationUtils.createClearGroupsChange.callCount, 1, "PersonalizationUtils.createClearGroupsChange call");
		sinon.assert.calledWithExactly(PersonalizationUtils.createClearGroupsChange, this.oTable);
	});
});