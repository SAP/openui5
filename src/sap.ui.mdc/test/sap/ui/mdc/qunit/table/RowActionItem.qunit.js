/* global QUnit */

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/core/Lib",
	"sap/ui/core/Core",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/ResponsiveTableType",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableRowAction",
	"sap/ui/mdc/table/Column",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel"
], function(
	TableQUnitUtils,
	Library,
	Core,
	Table,
	GridTableType,
	ResponsiveTableType,
	RowSettings,
	RowActionItem,
	TableRowAction,
	Column,
	Text,
	JSONModel
) {
	"use strict";

	const oUITableResourceBundle = Library.getResourceBundleFor("sap.ui.table");
	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("RowActionItem usage", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function(mSettings) {
			this.destroyTable();

			const mDefaultSettings = {
				type: new GridTableType()
			};
			this.oTable = new Table(Object.assign(mDefaultSettings, mSettings));
			this.oTable.placeAt("qunit-fixture");
			Core.applyChanges();

			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("GridTableType - Item with all properties set", function(assert) {
		this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: TableRowAction.Navigation,
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: true
					})
				]
			})
		});

		return this.oTable._fullyInitialized().then(() => {
			const oInnerTable = this.oTable._oTable;
			assert.ok(oInnerTable.isA("sap.ui.table.Table"), "Is a sap.ui.table.Table");

			const oRowAction = oInnerTable.getRowActionTemplate();
			assert.ok(oRowAction, "Row action exists");
			assert.equal(oRowAction.getItems().length, 1, "Row action has exactly one item");

			const oRowActionItem = oRowAction.getItems()[0];
			assert.equal(oRowActionItem.getType(), "Navigation", "Type of item is correct");
			assert.equal(oRowActionItem.getText(), "My custom action", "Text is correct");
			assert.equal(oRowActionItem._getText(), "My custom action", "Internal text is correct");
			assert.equal(oRowActionItem.getIcon(), "sap-icon://accept", "Icon URL is correct");
			assert.equal(oRowActionItem._getIcon(), "sap-icon://accept", "Internal icon URL is correct");
		});
	});

	QUnit.test("GridTableType - Item with Navigation type only", function(assert) {
		this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: TableRowAction.Navigation
					})
				]
			})
		});

		return this.oTable._fullyInitialized().then(() => {
			const oInnerTable = this.oTable._oTable;
			assert.ok(oInnerTable.isA("sap.ui.table.Table"), "Is a sap.ui.table.Table");

			const oRowAction = oInnerTable.getRowActionTemplate();
			assert.ok(oRowAction, "Row action exists");
			assert.equal(oRowAction.getItems().length, 1, "Row action has exactly one item");

			const oRowActionItem = oRowAction.getItems()[0];
			assert.equal(oRowActionItem.getType(), "Navigation", "Type of item is correct");
			assert.equal(oRowActionItem.getText(), "", "No public text set");
			assert.equal(oRowActionItem._getText(), oUITableResourceBundle.getText("TBL_ROW_ACTION_NAVIGATE"), "Internal text is correctly set to 'Details'");
			assert.equal(oRowActionItem.getIcon(), "", "Public icon URL is not set");
			assert.equal(oRowActionItem._getIcon(), "sap-icon://navigation-right-arrow", "Internal icon URL is correctly set to 'navigation-right-arrow'");
		});
	});

	QUnit.test("ResponsiveTableType - Item with Navigation type only", function(assert) {
		this.createTable({
			delegate: {
				name: sDelegatePath,
				payload: {
					collectionPath: "/testPath"
				}
			},
			columns: [
				new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				new Column({
					id: "foo1",
					header: "Test1",
					template: new Text({
						text: "template1"
					})
				})

			],
			models: new JSONModel({
				testPath: new Array(10).fill({})
			}),
			type: new ResponsiveTableType(),
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: TableRowAction.Navigation
					})
				]
			})
		});
		Core.applyChanges();

		return TableQUnitUtils.waitForBinding(this.oTable).then(() => {
			const oInnerTable = this.oTable._oTable;
			assert.ok(oInnerTable.isA("sap.m.Table"), "Is a sap.m.Table");

			assert.ok(oInnerTable.getItems().length > 0, "Table has items");
			assert.equal(oInnerTable.getItems()[0].getType(), "Navigation", "Type of item is navigation");
		});
	});

});