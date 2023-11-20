/*global QUnit, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/core/Core"
], function(TableQUnitUtils, TableUtils, Table, Column, Control, Device, oCore) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;

	// Shortcuts
	var ColumnUtils = TableUtils.Column;
	var TestControl = TableQUnitUtils.TestControl;

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
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils.getColumnMap(this.oTable));

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
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils.getColumnMap(this.oTable));

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
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils.getColumnMap(this.oTable));

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
		var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils.getColumnMap(this.oTable));

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
		oCore.applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[0]), "ColumnReordering Disabled: Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "ColumnReordering Disabled: Non-Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[0]), "ColumnReordering Disabled: First column in TreeTable");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[2]), "ColumnReordering Disabled: Other column in TreeTable");

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[0], true), "ColumnReordering Disabled, but ignored: Fixed Column");
		assert.ok(ColumnUtils.isColumnMovable(oTable.getColumns()[1], true), "ColumnReordering Disabled, but ignored: Non-Fixed Column");
		assert.ok(ColumnUtils.isColumnMovable(oTable.getColumns()[2], true), "ColumnReordering Disabled, but ignored: Non-Fixed Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTreeTable.getColumns()[0], true), "ColumnReordering Disabled, but ignored: First column in TreeTable");
		assert.ok(ColumnUtils.isColumnMovable(oTreeTable.getColumns()[2], true), "ColumnReordering Disabled, but ignored: Other column in TreeTable");

		oTable.setEnableColumnReordering(true);
		oTreeTable.setEnableColumnReordering(true);
		oTable.getColumns()[1].setHeaderSpan(2);
		oCore.applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[1]), "Spanning Column");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "Spanned Column");

		oTable.getColumns()[1].setHeaderSpan([2, 1]);
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oTable.getColumns()[1].addMultiLabel(new TestControl());
		oCore.applyChanges();

		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[1]), "Spanning Column (Multi Header)");
		assert.ok(!ColumnUtils.isColumnMovable(oTable.getColumns()[2]), "Spanned Column (Multi Header)");
	});

	QUnit.test("isColumnMovableTo()", function(assert) {
		var oColumn = oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		var bExpect;
		var i;

		oTable.setEnableColumnReordering(false);
		oCore.applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = false;
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i, true) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.setEnableColumnReordering(true);
		oCore.applyChanges();

		for (i = -1; i <= oTable.getColumns().length + 2; i++) {
			bExpect = true;
			if (i < 1) {
				bExpect = false;
			}
			assert.ok(ColumnUtils.isColumnMovableTo(oColumn, i) === bExpect, "Move to index " + i + (bExpect ? "" : " not") + " possible");
		}

		oTable.getColumns()[3].setHeaderSpan(2);
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

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
		oCore.applyChanges();

		var aVisibleColumns = oTable._getVisibleColumns();

		var aOriginalColumnWidths = [];
		for (var i = 0; i < aVisibleColumns.length; i++) {
			var oColumn = aVisibleColumns[i];
			aOriginalColumnWidths.push(parseInt(oColumn.getWidth()));
		}

		function assertUnchanged(aExcludedColumns) {
			for (var i = 0; i < aVisibleColumns.length; i++) {
				if (aExcludedColumns && aExcludedColumns.indexOf(i) !== -1) {
					continue;
				}
				var oColumn = aVisibleColumns[i];
				assert.strictEqual(parseInt(oColumn.getWidth()), aOriginalColumnWidths[i],
					"Column " + (i + 1) + " has its original width of " + aOriginalColumnWidths[i] + "px");
			}
		}

		function assertColumnWidth(iColumnIndex, iWidth) {
			var iActualColumnWidth = parseInt(aVisibleColumns[iColumnIndex].getWidth());
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
		oColumnResizeHandler.resetHistory();
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

		aVisibleColumns[2].setWidth("2rem");
		var i2emInPixel = TableUtils.convertCSSSizeToPixel("2rem");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 2), i2emInPixel, "Returned 2em in pixels: " + i2emInPixel);

		aVisibleColumns[3].setVisible(false);
		oCore.applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 100, "Returned 100: Column is not visible and width set to 100px");

		aVisibleColumns[3].setWidth("");
		oCore.applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"\"");

		aVisibleColumns[3].setWidth("auto");
		oCore.applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"auto\"");

		aVisibleColumns[3].setWidth("10%");
		oCore.applyChanges();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"10%\"");

		aVisibleColumns[4].setWidth("");
		oCore.applyChanges();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"\"");

		aVisibleColumns[4].setWidth("auto");
		oCore.applyChanges();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"auto\"");

		aVisibleColumns[4].setWidth("10%");
		oCore.applyChanges();
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
			oCore.applyChanges();
		},
		afterEach: function() {
			this.aColumns = null;
			destroyTables();
		}
	});

	QUnit.test("getHeaderText", function(assert) {
		assert.strictEqual(ColumnUtils.getColumnWidth(), null, "Returned null: No parameters passed");

		oTable.removeAllColumns();
		oTable.addColumn(new Column());
		oTable.addColumn(new Column({
			label: new TableQUnitUtils.HeightTestControl(), // has no text property
			headerSpan: [1, 1]
		}));
		oTable.addColumn(new Column({
			label: "Label1",
			headerSpan: [2, 1]
		}));
		oTable.addColumn(new Column({
			label: "Label2",
			headerSpan: [1, 1],
			multiLabels: [new TableQUnitUtils.TestControl({text: "Column2Label1"}), new TableQUnitUtils.TestControl({text: "Column2Label2"})]
		}));
		oTable.addColumn(new Column({
			label: "Label3",
			headerSpan: [1, 1],
			multiLabels: [new TableQUnitUtils.TestControl({text: "Column3Label1"}), new TableQUnitUtils.TestControl({text: "Column3Label2"})],
			name: "Name"
		}));

		var aColumns = oTable.getColumns();

		assert.strictEqual(ColumnUtils.getHeaderText(aColumns[0]), "", "name, multiLabels, label are not set -> returned empty string");
		assert.strictEqual(ColumnUtils.getHeaderText(aColumns[1]), "",
			"name, multiLabels are not set, label is set to a control that doesn't implement the #getText method -> returned empty string");
		assert.strictEqual(ColumnUtils.getHeaderText(aColumns[2]), "Label1", "name and multiLabels are not set -> returned the label text");
		assert.strictEqual(ColumnUtils.getHeaderText(aColumns[3]), "Column2Label2",
			"multiLabels and label are set -> returned the correct multiLabel text");
		assert.strictEqual(ColumnUtils.getHeaderText(aColumns[4]), "Name", "name, multiLabels, label are set -> returned the name");
	});

	QUnit.test("getHeaderLabel", function(assert) {
		assert.strictEqual(ColumnUtils.getColumnWidth(), null, "Returned null: No parameters passed");

		var oLabelA = new TableQUnitUtils.HeightTestControl(),
			oLabelB = new TableQUnitUtils.TestControl({text: "Column2Label1"}),
			oLabelC = new TableQUnitUtils.TestControl({text: "Column2Label2"}),
			oLabelD = new TableQUnitUtils.TestControl({text: "Column3Label1"}),
			oLabelE = new TableQUnitUtils.TestControl({text: "Column3Label2"});

		oTable.removeAllColumns();
		oTable.addColumn(new Column());
		oTable.addColumn(new Column({
			label: oLabelA, // has no text property
			headerSpan: [1, 1]
		}));
		oTable.addColumn(new Column({
			label: "Label1",
			headerSpan: [2, 1]
		}));
		oTable.addColumn(new Column({
			label: "Label2",
			headerSpan: [1, 1],
			multiLabels: [oLabelB, oLabelC]
		}));
		oTable.addColumn(new Column({
			label: "Label3",
			headerSpan: [1, 1],
			multiLabels: [oLabelD, oLabelE],
			name: "Name"
		}));

		var aColumns = oTable.getColumns();

		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[0]), null, "name, multiLabels, label are not set -> returned null");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[1]), oLabelA,
			"name, multiLabels are not set, label is set to a control that doesn't implement the #getText method -> returned label instance A");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[2]).getText(), "Label1",
			"name and multiLabels are not set -> returned the default label instance");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[3]), oLabelC,
			"multiLabels and label are set -> returned the correct label instance C");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[4]), oLabelE, "name, multiLabels, label are set -> returned the label instance E");
	});
});