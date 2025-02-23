/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/Device",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/table/ColumnMenu",
	"sap/m/Label",
	"sap/ui/core/Popup",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(
	TableQUnitUtils,
	qutils,
	Device,
	Table,
	Column,
	ColumnMenu,
	Label,
	Popup,
	nextUIUpdate
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const Dock = Popup.Dock;

	/**
	 * @deprecated As of Version 1.117
	 */
	QUnit.module("Misc", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Open Menu", function(assert) {
		const oTable = window.oTable;
		const done = assert.async();
		const oColumnA = oTable.getColumns()[0];
		const oColumnB = oTable.getColumns()[1];
		const oMenuA = oColumnA.getMenu();
		const oColumnSelectSpy = sinon.spy(oTable, "fireColumnSelect");

		oColumnA.setSortProperty("A");
		oColumnB.setFilterProperty("B");
		assert.notOk(oMenuA, "column menu does not exist");

		oColumnA.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				assert.ok(oColumnSelectSpy.calledOnce, "ColumnSelect event is fired");
				const oMenuA = oColumnA.getMenu();
				assert.ok(oMenuA.isA("sap.ui.table.ColumnMenu"), "column menu is created and the menu aggregation of the column is set");
				assert.equal(oMenuA.getId(), oColumnA.getId() + "-menu", "column menu has correct id assigned");
				assert.ok(oMenuA.getDomRef(), "column menu is added to the dom");

				const oMenuOpenSpy = sinon.spy(oMenuA, "open");
				const oMenuCloseSpy = sinon.spy(oMenuA, "close");

				oColumnB._openHeaderMenu(oColumnB.getDomRef());
				assert.ok(oMenuCloseSpy.calledOnce, "other column menus are closed");

				oColumnA._openHeaderMenu(oColumnA.getDomRef());
				assert.ok(oMenuOpenSpy.calledOnceWithExactly(null, oColumnA._cellPressed, Dock.BeginTop, Dock.BeginBottom, oColumnA._cellPressed),
					"Menu#open called once with the correct parameters");
				assert.deepEqual(oMenuA, oColumnA.getMenu(), "column menu instance is reused");

				done();
			});
		});
		oColumnA._openHeaderMenu(oColumnA.getDomRef());
	});

	QUnit.test("Menu has no items", function(assert) {
		const oTable = window.oTable;
		const done = assert.async();
		const oColumn = oTable.getColumns()[0];
		const oCellDomRef = oColumn.getDomRef();
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				const oMenu = oColumn.getMenu();
				const oMenuOpenSpy = sinon.spy(oMenu, "open");
				oColumn._openHeaderMenu(oCellDomRef);
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");
				oMenuOpenSpy.resetHistory();

				oColumn.setFilterProperty(undefined);
				oColumn._openHeaderMenu(oCellDomRef);
				assert.ok(oMenuOpenSpy.notCalled, "column menu does not open because it contains no items");
				done();
			});
		});
		oColumn._openHeaderMenu(oCellDomRef);
	});

	QUnit.test("Column Header CellMenu", function(assert) {
		const oTable = window.oTable;
		const done = assert.async();
		const oColumn = oTable.getColumns()[0];
		const oCellDomRef = oColumn.getDomRef();
		const bOriginalDeviceSystemDesktop = Device.system.desktop;

		Device.system.desktop = true;
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				const oMenu = oColumn.getMenu();
				const oMenuOpenSpy = sinon.spy(oMenu, "open");
				oColumn._openHeaderMenu(oCellDomRef);
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");
				oMenuOpenSpy.resetHistory();

				Device.system.desktop = false;
				oColumn._openHeaderMenu(oCellDomRef);
				let $ColumnCellMenu = oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
				assert.ok($ColumnCellMenu.length, "cell menu is applied");
				assert.ok($ColumnCellMenu.find(".sapUiTableColDropDown").length, "cell menu contains a menu button");
				assert.ok($ColumnCellMenu.find(".sapUiTableColResizer").length, "cell menu contains a resizer button");

				oColumn._openHeaderMenu(oCellDomRef);
				$ColumnCellMenu = oTable.$().find(".sapUiTableCHT .sapUiTableCellTouchMenu");
				assert.notOk($ColumnCellMenu.length, "cell menu is removed");
				assert.ok(oMenuOpenSpy.calledOnce, "column menu opens");

				Device.system.desktop = bOriginalDeviceSystemDesktop;
				done();
			});
		});
		oColumn._openHeaderMenu(oCellDomRef);
	});

	QUnit.test("Hooks", function(assert) {
		const oTable = window.oTable;
		const done = assert.async();
		const oColumn = oTable.getColumns()[0];
		oColumn.setSortProperty("A");
		oColumn.setFilterProperty("A");

		oColumn.attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				const oMenu = oColumn.getMenu();
				const oInvalidateSpy = sinon.spy(oMenu, "_invalidate");
				const oSetFilterValueSpy = sinon.spy(oMenu, "_setFilterValue");
				const oSetFilterStateSpy = sinon.spy(oMenu, "_setFilterState");
				oColumn.setSortProperty(undefined);
				assert.ok(oInvalidateSpy.calledOnce, "column menu is invalidated");

				oColumn.setFilterValue("test");
				assert.ok(oSetFilterValueSpy.calledOnce, "_setFilterValue called once");

				oColumn.filter();
				assert.ok(oSetFilterStateSpy.calledOnce, "_setFilterState called once");

				done();
			});
		});
		oColumn._openHeaderMenu(oColumn.getDomRef());
	});

	/**
	 * @deprecated As of Version 1.117
	 */
	QUnit.module("MutliHeaders", {
		beforeEach: async function() {
			this.oTable = new Table({
				enableColumnFreeze: true,
				visibleRowCount: 3,
				columns: [
					new Column({
						headerSpan: [2, 1],
						multiLabels: [new Label({text: "Col1"}), new Label({text: "Col11"})],
						template: new Label()
					}),
					new Column({
						headerSpan: [2, 1],
						multiLabels: [new Label({text: "Col2"}), new Label({text: "Col12"})],
						template: new Label()
					}),
					new Column({
						label: new Label({text: "Col2"}),
						template: new Label()
					})
				]
			});
			this.oTable.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Open Menu", function(assert) {
		const done = assert.async();
		const aColumns = this.oTable.getColumns();
		const aColumnHeaders = document.querySelectorAll('[role="columnheader"]');

		function triggerClick(oCellDomRef) {
			qutils.triggerMouseEvent(oCellDomRef, "mousedown", null, null, null, null, 0);
			qutils.triggerMouseEvent(oCellDomRef, "click");
		}

		aColumns[0].attachEventOnce("columnMenuOpen", function() {
			TableQUnitUtils.wait(0).then(function() {
				const oMenuOpenSpy = sinon.stub(ColumnMenu.prototype, "open");

				for (let i = 0; i < 6; i++) {
					triggerClick(aColumnHeaders[i + 1]);
					if (aColumnHeaders[i + 1].getAttribute("colspan")) {
						assert.ok(oMenuOpenSpy.notCalled, "Menu#open not called because of the colspan attribute");
					} else {
						assert.ok(oMenuOpenSpy.calledOnceWithExactly(
							null, aColumns[i % 3]._cellPressed, Dock.BeginTop, Dock.BeginBottom, aColumns[i % 3]._cellPressed),
							"Menu#open called once with the correct parameters"
						);
						oMenuOpenSpy.resetHistory();
					}
				}

				done();
			});
		});
		triggerClick(aColumnHeaders[4]);
	});
});