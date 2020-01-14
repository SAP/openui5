/*global QUnit, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/m/Label",
	"sap/m/HBox"
], function(TableQUnitUtils, qutils, TableUtils, Table, Column, Control, Device, Label, HBox) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;

	// Shortcuts
	var ColumnUtils = TableUtils.Column;
	var TestControl = TableQUnitUtils.getTestControl();

	//************************************************************************
	// Test Code
	//************************************************************************

	QUnit.module("Misc", {
		beforeEach: function() {
			this.oTable = new Table();
			this.fnColumnMapToMinimum = function(oColumnMap) {
				var oMinColumnMap = {};
				var i;
				for (var k in oColumnMap) {
					if (!oColumnMap.hasOwnProperty(k)) {
						continue;
					}
					var aLevelInfo = [];
					var aParents = [];
					for (i = 0; i < oColumnMap[k].levelInfo.length; i++) {
						var aSpannedColumns = [];
						var oLevelInfo = oColumnMap[k].levelInfo[i];

						for (var j = 0; j < oLevelInfo.spannedColumns.length; j++) {
							aSpannedColumns.push(oLevelInfo.spannedColumns[j].getId());
						}
						aLevelInfo.push({spannedColumns: aSpannedColumns});
					}

					for (i = 0; i < oColumnMap[k].parents.length; i++) {
						aParents.push({
							column: oColumnMap[k].parents[i].column.getId(),
							level: oColumnMap[k].parents[i].level
						});
					}
					oMinColumnMap[k] = {id: oColumnMap[k].id, levelInfo: aLevelInfo, parents: aParents};
				}
				return oMinColumnMap;
			};

			this.fnColumnArrayToIdArray = function(aColumns) {
				var aColumnIDs = [];
				for (var i = 0; i < aColumns.length; i++) {
					aColumnIDs.push({column: aColumns[i].column.getId(), level: aColumns[i].level});
				}
				return aColumnIDs;
			};

			this.fnColumnBoundariesToId = function(mBoundaries) {
				if (mBoundaries.startColumn) {
					mBoundaries.startColumn = mBoundaries.startColumn.getId();
				}

				if (mBoundaries.endColumn) {
					mBoundaries.endColumn = mBoundaries.endColumn.getId();
				}

				return mBoundaries;
			};
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Column, "ColumnUtils namespace available");
		assert.ok(TableUtils.Column.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.test("No Header Spans", function(assert) {
		this.oTable.addColumn(new Column("c1", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c2", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c3", {headerSpan: 1, template: new Control()}));

		// strip returned data to minimum for better analysis
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		var oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: []}], parents: []},
			c2: {id: "c2", levelInfo: [{spannedColumns: []}], parents: []},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}], parents: []}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");
		assert.deepEqual(ColumnUtils.getParentSpannedColumns(this.oTable, "c1"), [], "No parents");
		assert.deepEqual(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c1"), [], "No children");
		assert.strictEqual(ColumnUtils.getChildrenSpannedColumns(this.oTable, "unknownColumnID"), undefined, "Wrong column ID");

		var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c1",
			endIndex: 0
		}, "ColumnBoundaries OK");
		assert.strictEqual(ColumnUtils.getColumnBoundaries(this.oTable, "unknownColumnID"), undefined, "Wrong column ID");
	});

	QUnit.test("Header Spans", function(assert) {
		this.oTable.addColumn(new Column("c1", {headerSpan: 2, template: new Control()}));
		this.oTable.addColumn(new Column("c2", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c3", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c4", {headerSpan: 3, template: new Control()}));
		this.oTable.addColumn(new Column("c5", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c6", {headerSpan: 1, template: new Control()}));

		// strip returned data to minimum for better analysis
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		var oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: ["c2"]}], parents: []},
			c2: {id: "c2", levelInfo: [{spannedColumns: []}], parents: [{column: "c1", level: 0}]},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}], parents: []},
			c4: {id: "c4", levelInfo: [{spannedColumns: ["c5", "c6"]}], parents: []},
			c5: {id: "c5", levelInfo: [{spannedColumns: []}], parents: [{column: "c4", level: 0}]},
			c6: {id: "c6", levelInfo: [{spannedColumns: []}], parents: [{column: "c4", level: 0}]}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");

		var aParents;
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aParents, [], "No parents");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2"));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c3"));
		assert.deepEqual(aParents, [], "No parents");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c4"));
		assert.deepEqual(aParents, [], "No parents");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c5"));
		assert.deepEqual(aParents, [{column: "c4", level: 0}], "Parent is c4");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c6"));
		assert.deepEqual(aParents, [{column: "c4", level: 0}], "Parent is c4");

		var aColumns = this.oTable.getColumns();
		assert.equal(ColumnUtils.getMaxHeaderSpan(aColumns[0]), 2, "MaxHeaderSpan for column c1 is 2");
		assert.equal(ColumnUtils.hasHeaderSpan(aColumns[0]), true, "c1 has headerSpan");

		assert.equal(ColumnUtils.getMaxHeaderSpan(aColumns[1]), 1, "MaxHeaderSpan for column c2 is 1");
		assert.equal(ColumnUtils.hasHeaderSpan(aColumns[1]), false, "c2 has no headerSpan");

		var aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aChildren, [{column: "c2", level: 0}], "c2 is child of c1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c4"));
		assert.deepEqual(aChildren, [
			{column: "c5", level: 0}, {
				column: "c6",
				level: 0
			}
		], "c5 and c6 are children of c4");

		var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c2",
			endIndex: 1
		}, "ColumnBoundaries c1 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c2",
			endIndex: 1
		}, "ColumnBoundaries c2 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c3"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c3",
			startIndex: 2,
			endColumn: "c3",
			endIndex: 2
		}, "ColumnBoundaries c3 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c4"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c4",
			startIndex: 3,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c4 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c5"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c4",
			startIndex: 3,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c5 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c6"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c4",
			startIndex: 3,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c6 OK");
	});

	QUnit.test("Header Spans with Multi-Headers", function(assert) {
		this.oTable.addColumn(new Column("c1", {
			headerSpan: [2, 1],
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c2", {
			headerSpan: [1, 1],
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c3", {
			headerSpan: [1, 1],
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));

		// strip returned data to minimum for better analysis
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		var oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: ["c2"]}, {spannedColumns: []}], parents: []},
			c2: {
				id: "c2",
				levelInfo: [{spannedColumns: []}, {spannedColumns: []}],
				parents: [{column: "c1", level: 0}]
			},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}, {spannedColumns: []}], parents: []}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");
		var aParents;
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aParents, [], "No parents");
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2"));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1");
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c3"));
		assert.deepEqual(aParents, [], "No parents");

		// test with level-parameter
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2", 0));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1 at level 0");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2", 1));
		assert.deepEqual(aParents, [], "No parents at level 1");

		assert.strictEqual(ColumnUtils.getParentSpannedColumns(this.oTable, "unknownColumnID", 1), undefined, "unknown column ID");
	});

	QUnit.test("Header Spans with Multi-Headers", function(assert) {
		this.oTable.addColumn(new Column("c1", {
			headerSpan: [3, 1, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c2", {
			headerSpan: [1, 2, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c3", {
			headerSpan: [1, 1, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));

		// strip returned data to minimum for better analysis
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		var oExpectedColumnMap = {
			c1: {
				id: "c1",
				levelInfo: [{spannedColumns: ["c2", "c3"]}, {spannedColumns: []}, {spannedColumns: []}],
				parents: []
			},
			c2: {
				id: "c2",
				levelInfo: [{spannedColumns: []}, {spannedColumns: ["c3"]}, {spannedColumns: []}],
				parents: [{column: "c1", level: 0}]
			},
			c3: {
				id: "c3",
				levelInfo: [{spannedColumns: []}, {spannedColumns: []}, {spannedColumns: []}],
				parents: [{column: "c1", level: 0}, {column: "c2", level: 1}]
			}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");
		var aParents;
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aParents, [], "No parents");
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2"));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1");
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c3"));
		assert.deepEqual(aParents, [{column: "c1", level: 0}, {column: "c2", level: 1}], "c1 and c2 are parents of c3");

		// test with level-parameter
		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2", 0));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1 at level 0");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c2", 1));
		assert.deepEqual(aParents, [], "No parents at level 1");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c3", 0));
		assert.deepEqual(aParents, [{column: "c1", level: 0}], "Parent is c1 at level 0");

		aParents = this.fnColumnArrayToIdArray(ColumnUtils.getParentSpannedColumns(this.oTable, "c3", 1));
		assert.deepEqual(aParents, [{column: "c2", level: 1}], "Parent c2 at level 1");

		var aColumns = this.oTable.getColumns();
		assert.equal(ColumnUtils.getMaxHeaderSpan(aColumns[0]), 3, "MaxHeaderSpan for column c1 is 3");
		assert.equal(ColumnUtils.getMaxHeaderSpan(aColumns[1]), 2, "MaxHeaderSpan for column c2 is 2");
		assert.equal(ColumnUtils.getMaxHeaderSpan(aColumns[2]), 1, "MaxHeaderSpan for column c3 is 1");

		assert.equal(ColumnUtils.hasHeaderSpan(aColumns[0]), true, "c1 has headerSpan");
		assert.equal(ColumnUtils.hasHeaderSpan(aColumns[1]), true, "c2 has headerSpan");
		assert.equal(ColumnUtils.hasHeaderSpan(aColumns[2]), false, "c3 has headerSpan");

		var aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aChildren, [
			{column: "c2", level: 0}, {
				column: "c3",
				level: 0
			}
		], "c2 and c3 are children of c1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2"));
		assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2", 0));
		assert.deepEqual(aChildren, [], "c2 has no children at level 0");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2", 1));
		assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

		var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c3",
			endIndex: 2
		}, "ColumnBoundaries c2 OK");
	});

	QUnit.test("Header Spans with Multi-Headers, Odd Setup", function(assert) {
		this.oTable.addColumn(new Column("c1", {
			headerSpan: [1, 1, 3],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c2", {
			headerSpan: [2, 1, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c3", {
			headerSpan: [1, 2, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c4", {
			headerSpan: [1, 1, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c5", {
			headerSpan: [1, 2, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c6", {
			headerSpan: [1, 1, 1],
			multiLabels: [new Control(), new Control(), new Control()],
			template: new Control()
		}));

		var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c1 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c2 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c3"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c3 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c4"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c4 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c5"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c5",
			startIndex: 4,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c5 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c6"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c5",
			startIndex: 4,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c6 OK");
	});

	QUnit.test("getHeaderSpan", function(assert) {
		this.oTable.addColumn(new Column("c1", {
			headerSpan: [3, 1, 1],
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c2", {
			headerSpan: [1, 2],
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c3", {
			headerSpan: 1,
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c4", {
			headerSpan: 2,
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));
		this.oTable.addColumn(new Column("c5", {
			headerSpan: 1,
			multiLabels: [new Control(), new Control()],
			template: new Control()
		}));

		var aColumns = this.oTable.getColumns();
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 0), 3, "Span OK for c1, level 0");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 1), 1, "Span OK for c1, level 1");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 2), 1, "Span OK for c1, level 2");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 3), 1, "Span OK for c1, level 3, Level too high");

		assert.equal(ColumnUtils.getHeaderSpan(aColumns[1], 0), 1, "Span OK for c2, level 0");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[1], 1), 2, "Span OK for c2, level 1");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[1], 2), 1, "Span OK for c2, level 2, Level too high");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[1], 3), 1, "Span OK for c2, level 3, Level too high");

		assert.equal(ColumnUtils.getHeaderSpan(aColumns[2]), 1, "Span OK for c3, level undefined");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[2], 0), 1, "Span OK for c3, level 0");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[2], 1), 1, "Span OK for c3, level 1");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[2], 2), 1, "Span OK for c3, level 2, Level too high");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[2], 3), 1, "Span OK for c3, level 3, Level too high");

		assert.equal(ColumnUtils.getHeaderSpan(aColumns[3]), 2, "Span OK for c4, level undefined");
		assert.equal(ColumnUtils.getHeaderSpan(aColumns[3], 0), 2, "Span OK for c4, level 0");
	});

	QUnit.module("ColumnMove", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("isColumnMovable()", function(assert) {
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[0]), "Fixed Column");
		assert.ok(ColumnUtils.isColumnMovable(oTable.getColumns()[1]), "Non-Fixed Column");
		assert.ok(ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "Non-Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[0]), "First column in TreeTable");
		assert.ok(ColumnUtils.isColumnMovable(oTreeTable.getColumns()[2]), "Other column in TreeTable");

		oTable.setEnableColumnReordering(false);
		oTreeTable.setEnableColumnReordering(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[0]), "ColumnReordering Disabled: Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "ColumnReordering Disabled: Non-Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[0]), "ColumnReordering Disabled: First column in TreeTable");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[2]), "ColumnReordering Disabled: Other column in TreeTable");

		oTable.setEnableColumnReordering(true);
		oTreeTable.setEnableColumnReordering(true);
		oTable.getColumns()[1].setHeaderSpan(2);
		sap.ui.getCore().applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[1]), "Spanning Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "Spanned Column");

		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		sap.ui.getCore().applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[1]), "Spanning Column (Multi Header)");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "Spanned Column (Multi Header)");
	});

	QUnit.test("isColumnMovableTo()", function(assert) {
		var oColumn = oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		var bExpect;
		var i;

		oTable.setEnableColumnReordering(false);
		sap.ui.getCore().applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = false;
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.setEnableColumnReordering(true);
		sap.ui.getCore().applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.getColumns()[3].setHeaderSpan(2);
		sap.ui.getCore().applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1 || i == 4) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.getColumns()[3].setHeaderSpan([2, 1]);
		oTable.getColumns()[3].addMultiLabel(new TestControl());
		oTable.getColumns()[3].addMultiLabel(new TestControl());
		sap.ui.getCore().applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1 || i == 4) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.getColumns()[1].setHeaderSpan(2);
		oTable.getColumns()[3].setHeaderSpan(1);
		oTable.getColumns()[3].destroyMultiLabels();
		sap.ui.getCore().applyChanges();

		oColumn = oTable.getColumns()[4];

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1 || i == 2) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}
	});

	QUnit.test("moveColumnTo() - Do a move", function(assert) {
		assert.expect(4);

		var oColumn = oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		oTable.attachColumnMove(function(oEvent) {
			assert.equal(oEvent.getParameter("newPos"), 3, "Correct Index in event parameter");
			assert.ok(oEvent.getParameter("column") === oColumn, "Correct Column in event parameter");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		sap.ui.getCore().applyChanges();

		assert.equal(oTable.indexOfColumn(oColumn), 3, "Correct Index after move.");
	});

	QUnit.test("moveColumnTo() - Column not movable", function(assert) {
		assert.expect(2);

		var oColumn = oTable.getColumns()[0];
		assert.ok(!ColumnUtils.isColumnMovable(oColumn), "Ensure column is not movable");

		oTable.attachColumnMove(function(oEvent) {
			assert.ok(false, "No event was triggered");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		sap.ui.getCore().applyChanges();

		assert.equal(oTable.indexOfColumn(oColumn), 0, "Correct Index after move.");
	});

	QUnit.test("moveColumnTo() - Move to current position", function(assert) {
		assert.expect(2);

		var oColumn = oTable.getColumns()[4];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		oTable.attachColumnMove(function(oEvent) {
			assert.ok(false, "No event was triggered");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		sap.ui.getCore().applyChanges();

		assert.equal(oTable.indexOfColumn(oColumn), 4, "Correct Index after move.");
	});

	QUnit.test("moveColumnTo() - Prevent movement", function(assert) {
		assert.expect(4);

		var oColumn = oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		oTable.attachColumnMove(function(oEvent) {
			assert.equal(oEvent.getParameter("newPos"), 3, "Correct Index in event parameter");
			assert.ok(oEvent.getParameter("column") === oColumn, "Correct Column in event parameter");
			oEvent.preventDefault();
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		sap.ui.getCore().applyChanges();

		assert.equal(oTable.indexOfColumn(oColumn), 2, "Correct Index after move.");
	});

	QUnit.module("Column Widths", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("getMinColumnWidth", function(assert) {
		var bDesktop = Device.system.desktop;
		Device.system.desktop = true;
		assert.equal(ColumnUtils.getMinColumnWidth(), 48, "Desktop column width");
		ColumnUtils._iColMinWidth = null;
		Device.system.desktop = false;
		assert.equal(ColumnUtils.getMinColumnWidth(), 88, "Mobile column width");
		Device.system.desktop = bDesktop;
	});

	QUnit.test("resizeColumn", function(assert) {
		oTable.setFixedColumnCount(0);
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_1_1"}));
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_2_1"}));
		oTable.getColumns()[0].addMultiLabel(new TestControl({text: "a_3_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_1_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_1"}));
		oTable.getColumns()[1].addMultiLabel(new TestControl({text: "a_2_2"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_1_1"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_2"}));
		oTable.getColumns()[2].addMultiLabel(new TestControl({text: "a_3_3"}));
		oTable.getColumns()[0].setHeaderSpan([3, 2, 1]);
		sap.ui.getCore().applyChanges();

		var aVisibleColumns = oTable._getVisibleColumns();

		var aOriginalColumnWidths = [];
		for (var i = 0; i < aVisibleColumns.length; i++) {
			var oColumn = aVisibleColumns[i];
			aOriginalColumnWidths.push(parseInt(oColumn.getWidth(), 10));
		}

		function assertUnchanged(aExcludedColumns) {
			for (var i = 0; i < aVisibleColumns.length; i++) {
				if (aExcludedColumns && aExcludedColumns.indexOf(i) !== -1) {
					continue;
				}
				var oColumn = aVisibleColumns[i];
				assert.strictEqual(parseInt(oColumn.getWidth(), 10), aOriginalColumnWidths[i],
					"Column " + (i + 1) + " has its original width of " + aOriginalColumnWidths[i] + "px");
			}
		}

		function assertColumnWidth(iColumnIndex, iWidth) {
			var iActualColumnWidth = parseInt(aVisibleColumns[iColumnIndex].getWidth(), 10);
			assert.strictEqual(iActualColumnWidth, iWidth,
				"Column " + (iColumnIndex + 1) + " width is " + iActualColumnWidth + "px and should be " + iWidth + "px");
		}

		// Invalid input should not change the column widths.
		ColumnUtils.resizeColumn();
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, 1);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns.length, 1);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, -1, 1);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, 0, 0);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, 0, -1);
		assertUnchanged();

		// Column 4
		ColumnUtils.resizeColumn(oTable, 3, 150, false);
		assertColumnWidth(3, 150);
		assertUnchanged([3]);
		ColumnUtils.resizeColumn(oTable, 3, aOriginalColumnWidths[3], false);
		assertUnchanged();

		// Column 1 to 3
		ColumnUtils.resizeColumn(oTable, 0, 434, false, 3);
		var iNewWidth = Math.round(434 / 3);
		assertColumnWidth(0, iNewWidth);
		assertColumnWidth(1, iNewWidth);
		assertColumnWidth(2, iNewWidth);
		assertUnchanged([0, 1, 2]);
		ColumnUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
		assertUnchanged();

		// Column 1 to 3 - Column 2 not resizable
		aVisibleColumns[1].setResizable(false);
		ColumnUtils.resizeColumn(oTable, 0, 100, false, 3);
		assertColumnWidth(0, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(2, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([0, 2]);
		ColumnUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0], false);
		ColumnUtils.resizeColumn(oTable, 2, aOriginalColumnWidths[2], false);
		assertUnchanged();
		aVisibleColumns[1].setResizable(true);

		// Column 2 - Not resizable
		aVisibleColumns[1].setResizable(false);
		ColumnUtils.resizeColumn(oTable, 1, 50, false);
		assertUnchanged();
		aVisibleColumns[1].setResizable(true);

		// Invalid span values default to 1
		ColumnUtils.resizeColumn(oTable, oTable.columnCount - 1, 150, false, 2);
		assertColumnWidth(oTable.columnCount - 1, 150);
		assertUnchanged([oTable.columnCount - 1]);
		ColumnUtils.resizeColumn(oTable, oTable.columnCount - 1, aOriginalColumnWidths[oTable.columnCount - 1], false, 0);
		assertUnchanged();

		// Do not decrease column width below the minimum column width value.
		ColumnUtils.resizeColumn(oTable, 1, 1, false);
		assertColumnWidth(1, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([1]);
		ColumnUtils.resizeColumn(oTable, 1, aOriginalColumnWidths[1], false);
		assertUnchanged();

		ColumnUtils.resizeColumn(oTable, 0, 1, false, 3);
		assertColumnWidth(0, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(1, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(2, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([0, 1, 2]);
		ColumnUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
		assertUnchanged();

		// Fire the ColumnResize event.
		var oColumnResizeHandler = this.spy();
		oTable.attachColumnResize(oColumnResizeHandler);
		ColumnUtils.resizeColumn(oTable, 0, 250);
		assertColumnWidth(0, 250);
		assertUnchanged([0]);
		assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");
		oTable.detachColumnResize(oColumnResizeHandler);

		// Fire the ColumnResize event and prevent execution of the default action.
		oColumnResizeHandler = this.spy(function(oEvent) {
			oEvent.preventDefault();
		});
		oTable.attachColumnResize(oColumnResizeHandler);
		ColumnUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0]);
		assertColumnWidth(0, 250);
		assertUnchanged([0]);
		assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");

		// Do not fire the event.
		oColumnResizeHandler.reset();
		ColumnUtils.resizeColumn(oTable, 0, aOriginalColumnWidths[0], false);
		assertUnchanged();
		assert.ok(oColumnResizeHandler.notCalled, "ColumnResize handler was not called");
	});

	QUnit.test("getColumnWidth", function(assert) {
		var aVisibleColumns = oTable._getVisibleColumns();
		var iColumnWidth;

		assert.strictEqual(ColumnUtils.getColumnWidth(), null, "Returned null: No parameters passed");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable), null, "Returned null: No column index specified");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, -1), null, "Returned null: Column index out of bound");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, oTable.getColumns().length), null, "Returned null: Column index out of bound");

		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 0), 100, "Returned 100");

		aVisibleColumns[1].setWidth("123px");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 1), 123, "Returned 123");

		aVisibleColumns[2].setWidth("2em");
		var i2emInPixel = oTable._CSSSizeToPixel("2em");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 2), i2emInPixel, "Returned 2em in pixels: " + i2emInPixel);

		aVisibleColumns[3].setVisible(false);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 100, "Returned 100: Column is not visible and width set to 100px");

		aVisibleColumns[3].setWidth("");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"\"");

		aVisibleColumns[3].setWidth("auto");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"auto\"");

		aVisibleColumns[3].setWidth("10%");
		sap.ui.getCore().applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"10%\"");

		aVisibleColumns[4].setWidth("");
		sap.ui.getCore().applyChanges();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"\"");

		aVisibleColumns[4].setWidth("auto");
		sap.ui.getCore().applyChanges();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"auto\"");

		aVisibleColumns[4].setWidth("10%");
		sap.ui.getCore().applyChanges();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case of a column width specified in percentage");
	});

	QUnit.module("Fixed Columns", {
		beforeEach: function() {
			createTables();
			oTable.setFixedColumnCount(0);
			this.aColumns = oTable.getColumns();
			for (var i = 0; i < this.aColumns.length; i++) {
				this.aColumns[i].setVisible(true);
				this.aColumns[i].setWidth("100px");
			}
			oTable.setWidth(((this.aColumns.length * 100) + 200) + "px");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			this.aColumns = null;
			destroyTables();
		}
	});

	QUnit.test("getFixedColumnCount", function(assert) {
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable), 0, "Property: No fixed Columns");
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable, true), 0, "Computed: No fixed Columns");

		oTable.setFixedColumnCount(2);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable), 2, "Property: 2 fixed Columns");
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable, true), 2, "Computed: 2 fixed Columns");

		this.aColumns[0].setVisible(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable), 2, "Property: 2 fixed Columns");
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable, true), 1, "Computed: 1 fixed Columns");

		oTable.setFixedColumnCount(this.aColumns.length);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable), this.aColumns.length, "Property: " + this.aColumns.length + " fixed Columns");
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable, true), this.aColumns.length - 1, "Computed: " + (this.aColumns.length - 1)
																									+ " fixed Columns");

		oTable.setWidth((this.aColumns.length * 100 - 200) + "px");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable), 0, "Property: 0 fixed Columns");
		assert.strictEqual(ColumnUtils.getFixedColumnCount(oTable, true), 0, "Computed: 0 fixed Columns");
	});

	QUnit.test("getHeaderText", function(assert){
		assert.strictEqual(ColumnUtils.getColumnWidth(), null, "Returned null: No parameters passed");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable), null, "Returned null: No column index specified");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, -1), null, "Returned null: Column index out of bound");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, oTable.getColumns().length), null, "Returned null: Column index out of bound");

		oTable.removeAllColumns();
		oTable.addColumn(new Column("c1"));
		oTable.addColumn(new Column("c2", {
			label: new HBox(),
			headerSpan: [1, 1]
		}));
		oTable.addColumn(new Column("c3", {
			label: "Label1",
			headerSpan: [2, 1]
		}));
		oTable.addColumn(new Column("c4", {
			label: "Label2",
			headerSpan: [1, 1],
			multiLabels: [new Label({text: "Column2Label1"}), new Label({text: "Column2Label2"})]
		}));
		oTable.addColumn(new Column("c5", {
			label: "Label3",
			headerSpan: [1, 1],
			multiLabels: [new Label({text: "Column3Label1"}), new Label({text: "Column3Label2"})],
			name: "Name"
		}));

		assert.strictEqual(ColumnUtils.getHeaderText(oTable, 0), "", "name, multiLabels, label are not set -> returned empty string");
		assert.strictEqual(ColumnUtils.getHeaderText(oTable, 1), "",
			"name, multiLabels are not set, label is set to a control that doesn't implement the #getText method -> returned empty string");
		assert.strictEqual(ColumnUtils.getHeaderText(oTable, 2), "Label1", "name and multiLabels are not set -> returned the label text");
		assert.strictEqual(ColumnUtils.getHeaderText(oTable, 3), "Column2Label2",
			"multiLabels and label are set -> returned the correct multiLabel text");
		assert.strictEqual(ColumnUtils.getHeaderText(oTable, 4), "Name", "name, multiLabels, label are set -> returned the name");
	});
});