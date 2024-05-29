/* global QUnit, sinon */

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
	"sap/ui/mdc/enums/TableType",
	"sap/ui/mdc/enums/TableRowCountMode",
	"sap/ui/mdc/enums/TableRowActionType",
	"sap/m/Text",
	"sap/ui/model/json/JSONModel"
], function(
	TableQUnitUtils,
	Table,
	Column,
	GridTableType,
	RowSettings,
	RowActionItem,
	TableType,
	RowCountMode,
	RowActionType,
	Text,
	JSONModel
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table initialization", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function() {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType()
			});
			return this.oTable;
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("Shorthand type='GridTable'", function(assert) {
		const oTable = new Table({type: TableType.Table});

		return oTable.initialized().then(function() {
			assert.ok(oTable._getType().isA("sap.ui.mdc.table.GridTableType"), "Default type instance is a sap.ui.mdc.table.GridTableType");
			assert.ok(oTable._oTable.isA("sap.ui.table.Table"), "Is a sap.ui.table.Table");
		}).finally(function() {
			oTable.destroy();
		});
	});

	QUnit.module("API", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: function(mSettings) {
			this.destroyTable();
			this.oTable = new Table(Object.assign({
				type: new GridTableType()
			}, mSettings));
			return this.oTable;
		},
		initTable: function() {
			this.createTable().initialized();
		},
		destroyTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		}
	});

	QUnit.test("fixedColumnCount property", function(assert) {
		const oTable = this.createTable({
			type: new GridTableType({fixedColumnCount: 1})
		});

		return oTable.initialized().then(function() {
			assert.equal(oTable.getType().getFixedColumnCount(), 1, "fixedColumnCount for type is set to 1");
			assert.equal(oTable._oTable.getFixedColumnCount(), 1, "Inner table has a fixed column count of 1");

			oTable.getType().setFixedColumnCount(2);

			assert.equal(oTable.getType().getFixedColumnCount(), 2, "fixedColumnCount for type is set to 2");
			assert.equal(oTable._oTable.getFixedColumnCount(), 2, "Inner table has a fixed column count of 2");

			oTable.getType().setFixedColumnCount(0);

			assert.equal(oTable.getType().getFixedColumnCount(), 0, "fixedColumnCount for type is set to 0");
			assert.equal(oTable._oTable.getFixedColumnCount(), 0, "Inner table has a fixed column count of 0");
		});
	});

	QUnit.test("#getTableStyleClasses", function(assert) {
		const oTable = this.createTable();

		assert.deepEqual(oTable.getType().getTableStyleClasses(), ["sapUiMdcTableFitContainer"], "RowCountMode Auto");

		oTable.getType().setRowCountMode(RowCountMode.Fixed);
		assert.deepEqual(oTable.getType().getTableStyleClasses(), [], "RowCountMode Fixed");
	});

	QUnit.module("Row settings", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
		},
		destroyTable: function() {
			this.oTable?.destroy();
		},
		assertRowActionValues: function(oItem, sType, sText, sIcon, bVisible) {
			QUnit.assert.strictEqual(oItem.getType(), sType, "Row action 'type' property");
			QUnit.assert.notOk(oItem.isBound("type"), "'type' binding");
			QUnit.assert.strictEqual(oItem.getText(), sText, "Row action 'text' property");
			QUnit.assert.notOk(oItem.isBound("text"), "'text' binding");
			QUnit.assert.strictEqual(oItem.getIcon(), sIcon, "Row action 'icon' property");
			QUnit.assert.notOk(oItem.isBound("icon"), "'icon' binding");
			QUnit.assert.strictEqual(oItem.getVisible(), bVisible, "Row action 'visible' property");
			QUnit.assert.notOk(oItem.isBound("visible"), "'visible' binding");
		},
		assertRowActionBindingInfos: function(oItem) {
			["type", "text", "icon", "visible"].forEach(function(sProperty) {
				QUnit.assert.deepEqual({
					model: oItem.getBindingInfo(sProperty).parts[0].model,
					path: oItem.getBindingInfo(sProperty).parts[0].path
				}, {
					model: "namedModel",
					path: sProperty
				}, sProperty + " binding");
			});
		}
	});

	QUnit.test("Row actions with default settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem()
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Custom", "", "", true);
	});

	QUnit.test("Row actions with static settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: RowActionType.Navigation,
						text: "My custom action",
						icon: "sap-icon://accept",
						visible: false
					}),
					new RowActionItem({
						text: "My other custom action",
						icon: "sap-icon://decline"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 2, "Inner row action item count");
		this.assertRowActionValues(oInnerRowAction.getItems()[0], "Navigation", "My custom action", "sap-icon://accept", false);
		this.assertRowActionValues(oInnerRowAction.getItems()[1], "Custom", "My other custom action", "sap-icon://decline", true);
	});

	QUnit.test("Row actions with bound settings", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				]
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 1, "Inner row action item count");
		this.assertRowActionBindingInfos(oInnerRowAction.getItems()[0]);
	});

	QUnit.test("Bound row actions", async function (assert) {
		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: {
					path: "namedModel>/testPath",
					template: new RowActionItem({
						type: "{namedModel>type}",
						text: "{namedModel>text}",
						icon: "{namedModel>icon}",
						visible: "{namedModel>visible}"
					})
				}
			})
		});

		const oInnerRowAction = this.oTable._oTable.getRowActionTemplate();

		assert.ok(oInnerRowAction, "Inner row action template exists");
		assert.equal(oInnerRowAction.getItems().length, 0, "Inner row action item count");
		assert.deepEqual({
			model: this.oTable._oTable.getRowActionTemplate().getBindingInfo("items").model,
			path: this.oTable._oTable.getRowActionTemplate().getBindingInfo("items").path
		}, {
			model: "namedModel",
			path: "/testPath"
		}, "'items' binding");
		this.assertRowActionBindingInfos(oInnerRowAction.getBindingInfo("items").template);
	});

	QUnit.test("press' event", async function(assert) {
		const oPress = sinon.spy();

		await this.createTable({
			rowSettings: new RowSettings({
				rowActions: [
					new RowActionItem({
						id: "myRowActionitem",
						type: RowActionType.Navigation,
						press: (oEvent) => {
							oPress(oEvent.getParameters());
						}
					}),
					new RowActionItem({
						id: "myOtherRowActionitem",
						type: RowActionType.Navigation,
						press: (oEvent) => {
							oPress(oEvent.getParameters());
						}
					})
				]
			})
		});

		await new Promise((resolve) => {
			this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
		});

		this.oTable._oTable.getRows()[1].getRowAction().$("icon0").trigger("click");
		assert.ok(oPress.calledOnceWithExactly({
			id: "myRowActionitem",
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'press' event handler called with the correct parameters");

		oPress.resetHistory();
		this.oTable._oTable.getRows()[2].getRowAction().$("icon1").trigger("click");
		assert.ok(oPress.calledOnceWithExactly({
			id: "myOtherRowActionitem",
			bindingContext: this.oTable._oTable.getRows()[2].getBindingContext("namedModel")
		}), "'press' event handler called with the correct parameters");
	});

	QUnit.module("Events", {
		afterEach: function() {
			this.destroyTable();
		},
		createTable: async function(mSettings) {
			this.destroyTable();
			this.oTable = new Table({
				type: new GridTableType(),
				delegate: {
					name: sDelegatePath,
					payload: {
						collectionPath: "namedModel>/testPath"
					}
				},
				columns: new Column({
					id: "foo0",
					header: "Test0",
					template: new Text({
						text: "template0"
					})
				}),
				models: {
					namedModel: new JSONModel({
						testPath: new Array(3).fill({})
					})
				},
				...mSettings
			});
			this.oTable.placeAt("qunit-fixture");
			await TableQUnitUtils.waitForBinding(this.oTable);
			await new Promise((resolve) => {
				this.oTable._oTable.attachEventOnce("rowsUpdated", resolve);
			});
		},
		destroyTable: function() {
			this.oTable?.destroy();
		}
	});

	QUnit.test("Table 'rowPress' event listener attached on init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable({
			rowPress: (oEvent) => {
				oRowPress(oEvent.getParameters());
			}
		});

		this.oTable._oTable.getRows()[1].getCells()[0].$().trigger("tap");
		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});

	QUnit.test("Table 'rowPress' event listener attached after init", async function(assert) {
		const oRowPress = sinon.spy();

		await this.createTable();
		await new Promise((resolve) => {
			this.oTable.attachEventOnce("rowPress", (oEvent) => {
				oRowPress(oEvent.getParameters());
				resolve();
			});
			this.oTable._oTable.getRows()[1].getCells()[0].$().trigger("tap");
		});

		assert.ok(oRowPress.calledOnceWithExactly({
			id: this.oTable.getId(),
			bindingContext: this.oTable._oTable.getRows()[1].getBindingContext("namedModel")
		}), "'rowPress' event handler called with the correct parameters");
	});
});