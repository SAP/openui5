/*global QUnit */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TableUtils",
	"sap/ui/model/json/JSONModel"
], function(qutils, TableUtils, JSONModel) {
	"use strict";

	var TABLESETTINGS = window.TABLESETTINGS;
	var oTable;
	var oModel = new JSONModel();
	oModel.setData({modelData: TABLESETTINGS.listTestData});

	function createTable() {
		function createColumns(oTable) {

			// 1st column with multilabels
			oTable.addColumn(new sap.ui.table.Column({
				multiLabels: [
					new sap.m.Text({text: "Row:1, Column:1 with a long description"}),
					new sap.m.Text({text: "Row:2, Column:1"})
				],
				headerSpan: [3, 1],
				template: new sap.m.Text({text: "{lastName}"}),
				sortProperty: "lastName",
				filterProperty: "lastName",
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			// 2nd column with multilabels
			oTable.addColumn(new sap.ui.table.Column({
				multiLabels: [
					new sap.m.Text({text: "Row:1, Column:2 with a long description"}),
					new sap.m.Text({text: "Row:2, Column:2"})
				],
				headerSpan: [1, 2, 1],
				template: new sap.m.Label({text: "{name}"}),
				sortProperty: "name",
				filterProperty: "name",
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			// 3rd column with multilabels
			oTable.addColumn(new sap.ui.table.Column({
				multiLabels: [
					new sap.m.Label({text: "Row:1, Column:3 - long text"}),
					new sap.m.Text({text: "Row:2, Column:3"})
				],
				template: new sap.m.ObjectStatus({text: "{objStatusText}", state: "{objStatusState}"}),
				sortProperty: "objStatusState",
				filterProperty: "objStatusState",
				width: "100px",
				flexible: true,
				autoResizable: true,
				resizable: true
			}));

			// Other columns
			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.m.Label({text: "Icon"}),
				headerSpan: "2",
				template: new sap.ui.core.Icon({src: "sap-icon://account", decorative: false}),
				hAlign: sap.ui.core.HorizontalAlign.Center,
				width: "100px",
				flexible: true,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.m.Label({text: "m.Checkbox"}),
				template: new sap.m.CheckBox({selected: "{checked}", text: "{lastName}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.m.Label({text: "m.Link"}),
				template: new sap.m.CheckBox({selected: "{checked}", text: "{lastName}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));

			oTable.addColumn(new sap.ui.table.Column({
				label: new sap.m.Label({text: "unified.Currency"}),
				template: new sap.ui.unified.Currency({value: "{money}", currency: "{currency}"}),
				width: "100px",
				flexible: false,
				autoResizable: true,
				resizable: true
			}));
		}

		oTable = new sap.ui.table.Table();
		oTable.setTitle("Table 1");
		oTable.setFooter("Footer");
		oTable.setSelectionMode(sap.ui.table.SelectionMode.MultiToggle);
		oTable.setEnableColumnFreeze(true);
		oTable.setShowColumnVisibilityMenu(true);
		oTable.setColumnHeaderVisible(true);
		createColumns(oTable);
		oTable.setModel(oModel);
		oTable.bindRows("/modelData");

		oTable.placeAt("content");
		sap.ui.getCore().applyChanges();
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
		var colSpan = parseInt(oTable.$().find("td[data-sap-ui-colindex=\"" + oColumn.getIndex() + "\"]")[iRow].getAttribute("colspan") || 1, 10);
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			var aCols = oTable.getColumns();
			aCols[2].setVisible(true);
			aCols[4].setVisible(true);
			sap.ui.getCore().applyChanges();
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
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
		}
	});

	QUnit.test("Fixed column count with multiheaders", function(assert) {
		assert.strictEqual(oTable.getFixedColumnCount(), 3, "Multi headers influence fixed column count");
	});

	QUnit.test("Fixed column count with multiheaders and hidden columns", function(assert) {
		oTable.getColumns()[1].setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oTable.getFixedColumnCount(), 3, "Hidden columns do not influence fixed column count");
	});

	QUnit.test("Unfreeze menu with multiheaders", function(assert) {
		function hasFreezeMenuItem(iCol, unfreeze) {
			var menu = oTable.getColumns()[iCol].getMenu();
			menu.destroyAggregation("items", true);
			menu._addFreezeMenuItem();
			return menu.getItems()[0].getText() == TableUtils.getResourceBundle().getText(unfreeze ? "TBL_UNFREEZE" : "TBL_FREEZE");
		}

		assert.ok(hasFreezeMenuItem(0, true), "Column 0 has Unfreeze menu");
		assert.ok(hasFreezeMenuItem(1, true), "Column 1 has Unfreeze menu");
		assert.ok(hasFreezeMenuItem(2, true), "Column 2 has Unfreeze menu");

		// set a single header column as the last fixed
		oTable.setFixedColumnCount(6);
		sap.ui.getCore().applyChanges();

		assert.ok(hasFreezeMenuItem(0, false), "Column 0 has Freeze menu");
		assert.ok(hasFreezeMenuItem(5, true), "Column 5 has Unfreeze menu");
	});
});