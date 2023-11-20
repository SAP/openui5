/*global QUnit */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Column",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/Table",
	"sap/ui/table/library",
	"sap/ui/core/library",
	"sap/ui/core/Core"
], function(TableQUnitUtils, TableUtils, Column, JSONModel, Table, tableLibrary, coreLibrary, oCore) {
	"use strict";

	var TestControl = TableQUnitUtils.TestControl;

	var aData = [];
	for (var i = 0; i < 10; i++) {
		aData.push({text: "" + i});
	}

	var oTable;
	var oModel = new JSONModel();
	oModel.setData({modelData: aData});

	function createTable() {
		function createColumns(oTable) {

			// 1st column with multilabels
			oTable.addColumn(new Column({
				multiLabels: [
					new TestControl({text: "Row:1, Column:1 with a long description"}),
					new TestControl({text: "Row:2, Column:1"})
				],
				headerSpan: [3, 1],
				template: new TestControl({text: "{text}"}),
				sortProperty: "text",
				filterProperty: "text",
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			// 2nd column with multilabels
			oTable.addColumn(new Column({
				multiLabels: [
					new TestControl({text: "Row:1, Column:2 with a long description"}),
					new TestControl({text: "Row:2, Column:2"})
				],
				headerSpan: [1, 2, 1],
				template: new TestControl({text: "{text}"}),
				sortProperty: "text",
				filterProperty: "text",
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			// 3rd column with multilabels
			oTable.addColumn(new Column({
				multiLabels: [
					new TestControl({text: "Row:1, Column:3 - long text"}),
					new TestControl({text: "Row:2, Column:3"})
				],
				template: new TestControl({text: "{text}"}),
				sortProperty: "text",
				filterProperty: "text",
				width: "100px",
				flexible: true,
				autoResizable: true,
				resizable: true
			}));

			// Other columns
			oTable.addColumn(new Column({
				label: new TestControl({text: "Header"}),
				headerSpan: "2",
				template: new TestControl({text: "{text}"}),
				hAlign: coreLibrary.HorizontalAlign.Center,
				width: "100px",
				flexible: true,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new Column({
				label: new TestControl({text: "Some Header"}),
				template: new TestControl({text: "{text}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new Column({
				label: new TestControl({text: "Some other header"}),
				template: new TestControl({text: "{text}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new Column({
				label: new TestControl({text: "Just another header"}),
				template: new TestControl({text: "{text}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));
		}

		oTable = new Table();
		oTable.setTitle("Table 1");
		oTable.setFooter("Footer");
		oTable.setSelectionMode(tableLibrary.SelectionMode.MultiToggle);
		oTable.setEnableColumnFreeze(true);
		/**
		 * @deprecated As of Version 1.117
		 */
		oTable.setShowColumnVisibilityMenu(true);
		oTable.setColumnHeaderVisible(true);
		createColumns(oTable);
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		oTable.placeAt("content");
		oCore.applyChanges();
	}

	QUnit.module("Rendering", {
		beforeEach: function() {
			createTable();
		},
		afterEach: function() {
		}
	});

	function checkSpan(iCol, iRow, assert, span) {
		var oColumn = oTable.getColumns()[iCol];
		var colSpan = parseInt(oTable.$().find("td[data-sap-ui-colindex=\"" + oColumn.getIndex() + "\"]")[iRow].getAttribute("colspan") || 1);
		span = span || TableUtils.Column.getHeaderSpan(oColumn, iRow);
		assert.strictEqual(colSpan, span, "Col:" + iCol + ", Row: " + iRow + " - Header has correct span");
	}

	QUnit.test("Check column spans", function(assert) {
		oTable.getColumns().forEach(function(oColumn, iCol) {
			[0, 1].forEach(function(iRow) {
				checkSpan(iCol, iRow, assert);
			});
		});
	});

	QUnit.module("Hidden columns with span", {
		beforeEach: function() {
			var aCols = oTable.getColumns();
			aCols[2].setVisible(false);
			aCols[4].setVisible(false);
			oCore.applyChanges();
		},
		afterEach: function() {
			var aCols = oTable.getColumns();
			aCols[2].setVisible(true);
			aCols[4].setVisible(true);
			oCore.applyChanges();
		}
	});

	QUnit.test("Column spans over hidden columns", function(assert) {
		checkSpan(0, 0, assert, 2);
		checkSpan(0, 1, assert, 1);
		checkSpan(1, 1, assert, 1);
		checkSpan(3, 0, assert, 1);
	});

	QUnit.module("Fixed columns", {
		beforeEach: function() {
			oTable.setFixedColumnCount(1);
			oCore.applyChanges();
		},
		afterEach: function() {
		}
	});

	QUnit.test("Fixed column count with multiheaders", function(assert) {
		assert.strictEqual(oTable.getComputedFixedColumnCount(), 3, "Multi headers influence fixed column count");
	});

	QUnit.test("Fixed column count with multiheaders and hidden columns", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		oCore.applyChanges();
		assert.strictEqual(oTable.getComputedFixedColumnCount(), 3, "Hidden columns do not influence fixed column count");
	});
});