/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/menus/ContextMenu",
	"sap/ui/table/Row",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/unified/Menu",
	"sap/ui/unified/MenuItem"
], function(
	TableQUnitUtils,
	ContextMenu,
	Row,
	TableUtils,
	Menu,
	MenuItem
) {
	"use strict";

	QUnit.module("API", {
		beforeEach: function() {
			this.oContextMenu = new ContextMenu();
		},
		afterEach: function() {
			this.oContextMenu.destroy();
		}
	});

	QUnit.test("#getTable", function(assert) {
		const oTable = TableQUnitUtils.createTable();

		assert.strictEqual(this.oContextMenu.getTable(), null, "Table is not the parent");

		oTable.addDependent(this.oContextMenu);
		assert.strictEqual(this.oContextMenu.getTable(), oTable, "Table is the parent");

		oTable.destroy();
	});

	QUnit.test("#initContent", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(1),
			columns: [TableQUnitUtils.createTextColumn()],
			dependents: this.oContextMenu
		});

		const oRow = oTable.getRows()[0];
		const oColumn = oTable.getColumns()[0];

		assert.notOk(this.oContextMenu.getMenu(), "Content not initialized initially");

		this.oContextMenu.initContent(oRow, oColumn);
		assert.ok(TableUtils.isA(this.oContextMenu.getMenu(), "sap.ui.unified.Menu", "sap.ui.unified.Menu created"));

		oTable.removeDependent(this.oContextMenu);
		assert.throws(() => {
			this.oContextMenu.initContent(oRow, oColumn);
		}, "Table is not the parent");

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

	QUnit.test("#open", function(assert) {
		const oMenu = new Menu();
		const oEvent = "event argument";
		const oElement = "element argument";

		this.oContextMenu.setMenu(oMenu);
		this.stub(oMenu, "openAsContextMenu");

		this.oContextMenu.open(oEvent, oElement);
		assert.ok(oMenu.openAsContextMenu.calledOnceWithExactly(oEvent, oElement), "Menu#open call");
	});

	QUnit.test("#close", function(assert) {
		const oMenu = new Menu();

		this.oContextMenu.setMenu(oMenu);
		this.stub(oMenu, "close");

		this.oContextMenu.close();
		assert.ok(oMenu.close.calledOnceWithExactly(), "Menu#close call");
	});

	QUnit.test("#invalidate", function(assert) {
		const oTable = TableQUnitUtils.createTable({
			dependents: this.oContextMenu
		});

		this.spy(oTable, "invalidate");
		this.oContextMenu.invalidate();
		assert.notOk(oTable.invalidate.called, "Menu#invalidate call");

		oTable.destroy();
	});

	QUnit.module("Menu items", {
		beforeEach: async function() {
			this.oContextMenu = new ContextMenu();
			this.oTable = TableQUnitUtils.createTable({
				dependents: this.oContextMenu,
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(3),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn()
				]
			});
			this.oTable.qunit.setRowStates([{
				type: Row.prototype.Type.Standard
			}, {
				type: Row.prototype.Type.GroupHeader
			}, {
				type: Row.prototype.Type.Summary
			}]);
			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Cell filter disabled", function(assert) {
		this.oContextMenu.initContent(this.oTable.getRows()[0], this.oTable.getColumns()[0]);
		assert.equal(this.oContextMenu.getMenu().getItems().length, 0, "No menu items");
	});

	QUnit.test("Cell filter enabled", function(assert) {
		const test = (iRowIndex, iColumnIndex, sElementName, ShouldHaveCellFilter = false) => {
			const oRow = this.oTable.getRows()[iRowIndex];
			const oColumn = this.oTable.getColumns()[iColumnIndex];

			this.oContextMenu.initContent(oRow, oColumn);

			const oItem = this.oContextMenu.getMenu().getItems()[0];

			if (ShouldHaveCellFilter) {
				assert.equal(oItem.getText(), TableUtils.getResourceText("TBL_FILTER"), sElementName + ": Menu item text");
				assert.ok(oItem.getVisible(), sElementName + ": Menu item visibility");
			} else {
				assert.notOk(oItem.getVisible(), sElementName + ": Menu item visibility");
			}
		};

		this.oTable.setEnableCellFilter(true);
		this.oTable.getColumns()[0].setFilterProperty("name");

		test(0, 0, "Cell in filterable column", true);
		test(0, 1, "Cell in non-filterable column");
		test(0, 0, "Cell in filterable column", true);
		test(1, 0, "Cell in group header row");
		test(2, 0, "Cell in summary row");
		test(0, "Cell without relation to a column in the columns aggregation");
	});

	QUnit.test("Cell filter; Default filter", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oColumn = this.oTable.getColumns()[0];

		this.spy(this.oTable, "filter");
		this.oTable.setEnableCellFilter(true);
		oColumn.setFilterProperty("name");
		oRow.getBindingContext().setProperty("name", "name_0");

		this.oContextMenu.initContent(oRow, oColumn);
		this.oContextMenu.getMenu().getItems()[0].fireSelect();
		assert.ok(this.oTable.filter.calledOnceWithExactly(oColumn, "name_0"), "Table#filter call");
	});

	QUnit.test("Cell filter; Custom filter", function(assert) {
		const oRow = this.oTable.getRows()[0];
		const oColumn = this.oTable.getColumns()[0];
		let mParameters;

		this.spy(this.oTable, "filter");
		this.oTable.setEnableCellFilter(true);
		this.oTable.setEnableCustomFilter(true);
		this.oTable.attachCustomFilter((oEvent) => {
			mParameters = oEvent.getParameters();
		});
		oColumn.setFilterProperty("name");
		oRow.getBindingContext().setProperty("name", "name_0");

		this.oContextMenu.initContent(oRow, oColumn);
		this.oContextMenu.getMenu().getItems()[0].fireSelect();
		assert.deepEqual(mParameters, {
			column: oColumn,
			value: "name_0",
			id: this.oTable.getId()
		}, "customFilter event handler");
		assert.notOk(this.oTable.filter.called, "Table#filter call");
	});
});