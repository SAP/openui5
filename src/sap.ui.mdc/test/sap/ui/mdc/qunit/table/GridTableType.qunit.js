/* global QUnit, sinon */

sap.ui.define([
	"./QUnitUtils",
	"sap/ui/mdc/Table",
	"sap/ui/mdc/table/Column",
	"sap/ui/mdc/table/GridTableType",
	"sap/ui/mdc/table/RowSettings",
	"sap/ui/mdc/table/RowActionItem",
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
	RowCountMode,
	RowActionType,
	Text,
	JSONModel
) {
	"use strict";

	const sDelegatePath = "test-resources/sap/ui/mdc/delegates/TableDelegate";

	QUnit.module("Inner table settings", {
		beforeEach: async function() {
			this.oTable = new Table({
				type: new GridTableType()
			});
			await this.oTable.initialized();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Control types", async function(assert) {
		await this.oTable.initialized();
		assert.ok(this.oTable._oTable.isA("sap.ui.table.Table"), "Inner table type is sap.ui.table.Table");
	});

	QUnit.test("Default settings", function(assert) {
		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionMode(), "None", "selectionMode");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 100, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Auto"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getMinRowCount(), 10, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 0, "fixedColumnCount");
	});

	QUnit.test("Initial settings", async function(assert) {
		this.oTable.destroy();
		this.oTable = new Table({
			type: new GridTableType({
				rowCountMode: RowCountMode.Fixed,
				rowCount: 12,
				fixedColumnCount: 1
			}),
			threshold: 30,
			selectionMode: "SingleMaster"
		});
		await this.oTable.initialized();

		const oInnerTable = this.oTable._oTable;

		assert.equal(oInnerTable.getEnableColumnReordering(), false, "enableColumnReordering");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "selectionBehavior");
		assert.equal(oInnerTable.getThreshold(), 30, "threshold");
		assert.deepEqual(oInnerTable.getAriaLabelledBy(), [this.oTable._oTitle.getId()], "ariaLabelledBy");
		assert.deepEqual(oInnerTable.getExtension(), [this.oTable._oToolbar], "extension");
		assert.equal(oInnerTable.getEnableBusyIndicator(), true, "enableBusyIndicator");
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "rowMode");
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "rowMode.minRowCount");
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "fixedColumnCount");
	});

	QUnit.test("Change settings", function(assert) {
		const oType = this.oTable.getType();
		const oInnerTable = this.oTable._oTable;

		this.oTable.setThreshold(30);
		assert.equal(oInnerTable.getThreshold(), 30, "Table.threshold=30: threshold");

		oType.setRowCountMode(RowCountMode.Fixed);
		assert.equal(oInnerTable.getRowMode().isA("sap.ui.table.rowmodes.Fixed"), true, "Type.rowCountMode=Fixed: rowMode");

		oType.setRowCount(12);
		assert.equal(oInnerTable.getRowMode().getRowCount(), 12, "Type.rowCount=12: rowMode.minRowCount");

		oType.setFixedColumnCount(1);
		assert.equal(oInnerTable.getFixedColumnCount(), 1, "Type.fixedColumnCount=1: fixedColumnCount");

		this.oTable.setSelectionMode("SingleMaster");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowOnly", "Table.selectionMode=SingleMaster: selectionBehavior");

		this.oTable.setSelectionMode("Multi");
		assert.equal(oInnerTable.getSelectionBehavior(), "RowSelector", "Table.selectionMode=MultiToggle: selectionBehavior");
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

	QUnit.test("setScrollThreshold", async function(assert) {
		const oMdcTable = this.createTable({
			type: new GridTableType({ scrollThreshold: 200 })
		});

		await oMdcTable.initialized();

		const oInnerTable = oMdcTable._oTable;
		const oTableType = oMdcTable.getType();
		const setThresholdSpy = sinon.spy(oTableType, "setScrollThreshold");
		const invalidateSpy = sinon.spy(oMdcTable, "invalidate");

		oTableType.setScrollThreshold(25);

		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
		assert.ok(setThresholdSpy.returned(oTableType), "Correct return value");
		assert.equal(oInnerTable.getScrollThreshold(), oTableType.getScrollThreshold(), "Inner table has correct scrollThreshold");

		oTableType.setScrollThreshold(-1);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue, "scrollThreshold is reset to default");

		oTableType.setScrollThreshold(50);
		assert.equal(oInnerTable.getScrollThreshold(), 50, "scrollThreshold is set correctly");

		oTableType.setScrollThreshold(undefined);
		assert.equal(oInnerTable.getScrollThreshold(), oInnerTable.getMetadata().getProperty("scrollThreshold").defaultValue, "scrollThreshold is reset to default");
		assert.ok(invalidateSpy.notCalled, "Invalidation not called");
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