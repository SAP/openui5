sap.ui.define([
    "sap/m/Text",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/m/plugins/PluginBase",
	"sap/m/plugins/ContextMenuSetting",
	"sap/ui/model/json/JSONModel",
	"sap/m/List",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/ui/unified/Menu",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(Text, Table, Column, ColumnListItem, GridTable, GridColumn, MDCTable, MDCColumn, PluginBase, ContextMenuSetting, JSONModel, List, Menu, MenuItem, UnifiedMenu, nextUIUpdate, jQuery) {

	"use strict";
	/*global QUnit */

	var aData = [];
	for (var i = 0; i < 25; i++) {
		aData.push({
			id: i,
			name: "name" + i,
			color: "color" + (i % 10)
		});
	}

	var oJSONModel = new JSONModel(aData);

	function createResponsiveTable(mSettings) {
		mSettings = Object.assign({
			growing: true,
			growingThreshold: 10,
			mode: "MultiSelect",
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new Column({
					header: new Text({ text: sKey })
				});
			}),
			items: {
				path: "/",
				template: new ColumnListItem({
					cells: Object.keys(aData[0]).map(function(sKey) {
						return new Text({
							text: "{" + sKey + "}"
						});
					})
				})
			},
			models: oJSONModel
		}, mSettings);

		var oTable = new Table(mSettings);
		oTable.placeAt("qunit-fixture");
		return oTable;
	}

	function createGridTable(mSettings) {
		mSettings = Object.assign({
			columns: Object.keys(aData[0]).map(function(sKey) {
				return new GridColumn({
					label: new Text({ text: sKey }),
					template: new Text({ text: "{" + sKey + "}", wrapping: false })
				});
			}),
			rows: { path: "/" },
			models: oJSONModel
		}, mSettings);

		var oTable = new GridTable(mSettings);
		oTable.placeAt("qunit-fixture");
		return oTable;
	}


	QUnit.module("API", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("findOn", function(assert) {
		const oSetting = new ContextMenuSetting();
		this.oTable.addDependent(oSetting);
		assert.ok(ContextMenuSetting.findOn(this.oTable) === oSetting, "Plugin found via ContextMenuSetting.findOn");
	});

	QUnit.test("isApplicable", function(assert) {
		const oSetting = new ContextMenuSetting();
		this.oTable.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on ResponsiveTable");
		const oList = new List();
		oList.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on List");
		const oText = new Text();
		assert.throws(function() {
			oText.addDependent(oSetting);
		}, "Plugin is not applicable on Text");
		const oTable = createGridTable();
		oTable.addDependent(oSetting);
		assert.ok(oSetting.isApplicable(), "Plugin is applicable on GridTable");

		oText.destroy();
		oList.destroy();
		oTable.destroy();
	});

	QUnit.test("Monkey Patch", function(assert) {
		const foo = function() {};
		let oMenu = this.oTable.getContextMenu();
		oMenu.openAsContextMenu = foo;
		const oSetting = new ContextMenuSetting();
		let count = 0;

		const check = (bIsPatched) => {
			count++;
			if (bIsPatched) {
				assert.ok(oMenu.openAsContextMenu != foo, count + ": Menu has monkey patched openAsContextMenu function");
				assert.ok(oSetting._original_openAsContextMenu === foo, count + ": Original function stored");
			} else {
				assert.ok(oMenu.openAsContextMenu === foo, count + ": Menu has original openAsContextMenu function");
				assert.ok(!oSetting._original_openAsContextMenu, count + ": No function stored");
			}
		};

		check(false);
		this.oTable.addDependent(oSetting);
		check(true);
		oSetting.setEnabled(false);
		check(false);
		oSetting.setEnabled(true);
		check(true);
		this.oTable.removeAllDependents();
		check(false);
		this.oTable.setContextMenu(null);
		this.oTable.addDependent(oSetting);
		check(false);
		this.oTable.setContextMenu(oMenu);
		check(true);
		this.oTable.setContextMenu(null);
		check(false);
		oMenu.destroy();
		oMenu = new UnifiedMenu();
		oMenu.openAsContextMenu = foo;
		this.oTable.setContextMenu(oMenu);
		check(false);
		oMenu.destroy();
		oMenu = new Menu();
		oMenu.openAsContextMenu = foo;
		this.oTable.setContextMenu(oMenu);
		check(true);
		oSetting.destroy();
		check(false);
	});

	QUnit.module("ResponsiveTable", {
		beforeEach: async function() {
			this.oTable = createResponsiveTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});

			this.triggerContextMenuOnItem = (assert, iIndex) => {
				const oItem = this.oTable.getItems()[iIndex];
				oItem.focus();
				oItem.$().trigger("contextmenu");
				assert.ok(this.oTable.getContextMenu().isOpen(), "Context menu is open");
				return oItem;
			};

			this.checkNoStyleClassOnItems = (assert) => {
				this.oTable.getItems().forEach((oItem) => {
					assert.notOk(oItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Items does not have style class for opacity");
				});
			};

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scope Default", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Default"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Scope Selection", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);

		this.oTable.getItems().forEach((oListItem) => {
			if (oListItem.getSelected()) {
				assert.notOk(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Selected Items does not have style class for opacity");
			} else {
				assert.ok(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Not Selected Items have style class for opacity");
			}
		});
		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);

		const oItem = this.triggerContextMenuOnItem(assert, 1);

		this.oTable.getItems().forEach((oListItem) => {
			if (oListItem.getId() === oItem.getId()) {
				assert.notOk(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Clicked Item does not have style class for opacity");
			} else {
				assert.ok(oListItem.hasStyleClass("sapMContextMenuSettingContentOpacity"), "Other Item have style class for opacity");
			}
		});

		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Using other Menu than sap.m.Menu", function(assert) {
		this.oTable.getContextMenu().destroy();
		this.oTable.setContextMenu(new UnifiedMenu());

		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.getItems()[0].setSelected(true);
		this.oTable.getItems()[2].setSelected(true);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
		this.triggerContextMenuOnItem(assert, 1);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});


	QUnit.module("GridTable", {
		beforeEach: async function() {
			this.oTable = createGridTable({
				contextMenu: new Menu({
					items: [
						new MenuItem({text: "Item"})
					]
				})
			});

			this.triggerContextMenuOnItem = (assert, iIndex) => {
				const oCell = this.oTable.getRows()[iIndex].getDomRef("col" + iIndex);
				oCell.focus();
				jQuery(oCell).trigger("contextmenu");
				assert.ok(this.oTable.getContextMenu().isOpen(), "Context menu is open");
			};

			this.checkNoStyleClassOnItems = (assert) => {
				this.oTable.getRows().forEach((oRow) => {
					assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Selected Items do not have style class for opacity");
				});
			};

			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Scope Default", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Default"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Scope Selection", function(assert) {
		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);

		this.oTable.getRows().forEach((oRow) => {
			if (this.oTable._getSelectionPlugin().isSelected(oRow)) {
				assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Selected Items does not have style class for opacity");
			} else {

				assert.ok(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Not Selected Items have style class for opacity");
			}
		});
		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);

		this.triggerContextMenuOnItem(assert, 1);

		this.oTable.getRows().forEach((oRow) => {
			if (oRow.getId() === this.oTable.getRows()[1].getId()) {
				assert.notOk(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Clicked Item does not have style class for opacity");
			} else {
				assert.ok(oRow.getDomRef().classList.value.includes("sapMContextMenuSettingContentOpacity"), "Other Item have style class for opacity");
			}
		});

		this.oTable.getContextMenu().close();

		this.checkNoStyleClassOnItems(assert);
	});

	QUnit.test("Using other Menu than sap.m.Menu", function(assert) {
		this.oTable.getContextMenu().destroy();
		this.oTable.setContextMenu(new UnifiedMenu());

		this.oTable.addDependent(new ContextMenuSetting({scope: "Selection"}));
		this.oTable.addSelectionInterval(0, 0);
		this.oTable.addSelectionInterval(2, 2);

		this.triggerContextMenuOnItem(assert, 0);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
		this.triggerContextMenuOnItem(assert, 1);
		this.checkNoStyleClassOnItems(assert);
		this.oTable.getContextMenu().close();
		this.checkNoStyleClassOnItems(assert);
	});

});