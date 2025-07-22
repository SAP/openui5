/*global QUnit, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Table",
	"sap/ui/table/Column",
	"sap/ui/core/Control",
	"sap/ui/Device"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	Table,
	Column,
	Control,
	Device
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const ColumnUtils = TableUtils.Column;
	const TestControl = TableQUnitUtils.TestControl;

	QUnit.module("Misc", {
		beforeEach: function() {
			this.oTable = new Table();
			this.fnColumnMapToMinimum = function(oColumnMap) {
				const oMinColumnMap = {};
				let i;
				for (const k in oColumnMap) {
					if (!oColumnMap.hasOwnProperty(k)) {
						continue;
					}
					const aLevelInfo = [];
					const aParents = [];
					for (i = 0; i < oColumnMap[k].levelInfo.length; i++) {
						const aSpannedColumns = [];
						const oLevelInfo = oColumnMap[k].levelInfo[i];

						for (let j = 0; j < oLevelInfo.spannedColumns.length; j++) {
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
				const aColumnIDs = [];
				for (let i = 0; i < aColumns.length; i++) {
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
		const oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		const oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: []}], parents: []},
			c2: {id: "c2", levelInfo: [{spannedColumns: []}], parents: []},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}], parents: []}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");
		assert.deepEqual(ColumnUtils.getParentSpannedColumns(this.oTable, "c1"), [], "No parents");
		assert.deepEqual(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c1"), [], "No children");
		assert.strictEqual(ColumnUtils._getChildrenSpannedColumns(this.oTable, "unknownColumnID"), undefined, "Wrong column ID");

		const aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c1",
			endIndex: 0
		}, "ColumnBoundaries OK");
		assert.strictEqual(ColumnUtils._getColumnBoundaries(this.oTable, "unknownColumnID"), undefined, "Wrong column ID");
	});

	QUnit.test("Header Spans", function(assert) {
		this.oTable.addColumn(new Column("c1", {headerSpan: 2, template: new Control()}));
		this.oTable.addColumn(new Column("c2", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c3", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c4", {headerSpan: 3, template: new Control()}));
		this.oTable.addColumn(new Column("c5", {headerSpan: 1, template: new Control()}));
		this.oTable.addColumn(new Column("c6", {headerSpan: 1, template: new Control()}));

		// strip returned data to minimum for better analysis
		const oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		const oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: ["c2"]}], parents: []},
			c2: {id: "c2", levelInfo: [{spannedColumns: []}], parents: [{column: "c1", level: 0}]},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}], parents: []},
			c4: {id: "c4", levelInfo: [{spannedColumns: ["c5", "c6"]}], parents: []},
			c5: {id: "c5", levelInfo: [{spannedColumns: []}], parents: [{column: "c4", level: 0}]},
			c6: {id: "c6", levelInfo: [{spannedColumns: []}], parents: [{column: "c4", level: 0}]}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");

		let aParents;
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

		const aColumns = this.oTable.getColumns();
		assert.equal(ColumnUtils._getMaxHeaderSpan(aColumns[0]), 2, "MaxHeaderSpan for column c1 is 2");
		assert.equal(ColumnUtils._hasHeaderSpan(aColumns[0]), true, "c1 has headerSpan");

		assert.equal(ColumnUtils._getMaxHeaderSpan(aColumns[1]), 1, "MaxHeaderSpan for column c2 is 1");
		assert.equal(ColumnUtils._hasHeaderSpan(aColumns[1]), false, "c2 has no headerSpan");

		let aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aChildren, [{column: "c2", level: 0}], "c2 is child of c1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c4"));
		assert.deepEqual(aChildren, [
			{column: "c5", level: 0}, {
				column: "c6",
				level: 0
			}
		], "c5 and c6 are children of c4");

		let aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c2",
			endIndex: 1
		}, "ColumnBoundaries c1 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c2"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c2",
			endIndex: 1
		}, "ColumnBoundaries c2 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c3"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c3",
			startIndex: 2,
			endColumn: "c3",
			endIndex: 2
		}, "ColumnBoundaries c3 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c4"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c4",
			startIndex: 3,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c4 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c5"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c4",
			startIndex: 3,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c5 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c6"));
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
		const oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		const oExpectedColumnMap = {
			c1: {id: "c1", levelInfo: [{spannedColumns: ["c2"]}, {spannedColumns: []}], parents: []},
			c2: {
				id: "c2",
				levelInfo: [{spannedColumns: []}, {spannedColumns: []}],
				parents: [{column: "c1", level: 0}]
			},
			c3: {id: "c3", levelInfo: [{spannedColumns: []}, {spannedColumns: []}], parents: []}
		};
		assert.deepEqual(oColumnMap, oExpectedColumnMap, "ColumnMap OK");
		let aParents;
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
		const oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

		const oExpectedColumnMap = {
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
		let aParents;
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

		const aColumns = this.oTable.getColumns();
		assert.equal(ColumnUtils._getMaxHeaderSpan(aColumns[0]), 3, "MaxHeaderSpan for column c1 is 3");
		assert.equal(ColumnUtils._getMaxHeaderSpan(aColumns[1]), 2, "MaxHeaderSpan for column c2 is 2");
		assert.equal(ColumnUtils._getMaxHeaderSpan(aColumns[2]), 1, "MaxHeaderSpan for column c3 is 1");

		assert.equal(ColumnUtils._hasHeaderSpan(aColumns[0]), true, "c1 has headerSpan");
		assert.equal(ColumnUtils._hasHeaderSpan(aColumns[1]), true, "c2 has headerSpan");
		assert.equal(ColumnUtils._hasHeaderSpan(aColumns[2]), false, "c3 has headerSpan");

		let aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c1"));
		assert.deepEqual(aChildren, [
			{column: "c2", level: 0}, {
				column: "c3",
				level: 0
			}
		], "c2 and c3 are children of c1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c2"));
		assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c2", 0));
		assert.deepEqual(aChildren, [], "c2 has no children at level 0");

		aChildren = this.fnColumnArrayToIdArray(ColumnUtils._getChildrenSpannedColumns(this.oTable, "c2", 1));
		assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

		const aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c2"));
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

		let aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c1"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c1 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c2"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c2 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c3"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c3 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c4"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c1",
			startIndex: 0,
			endColumn: "c4",
			endIndex: 3
		}, "ColumnBoundaries c4 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c5"));
		assert.deepEqual(aBoundaries, {
			startColumn: "c5",
			startIndex: 4,
			endColumn: "c6",
			endIndex: 5
		}, "ColumnBoundaries c5 OK");

		aBoundaries = this.fnColumnBoundariesToId(ColumnUtils._getColumnBoundaries(this.oTable, "c6"));
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

		const aColumns = this.oTable.getColumns();
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

	QUnit.module("Move columns", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: [
					new Column({template: new TestControl()}),
					new Column({template: new TestControl()}),
					new Column({template: new TestControl()}),
					new Column({template: new TestControl()}),
					new Column({template: new TestControl()})
				],
				enableColumnReordering: true,
				fixedColumnCount: 1
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("isColumnMovable", function(assert) {
		const aColumns = this.oTable.getColumns();

		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[0]), false, "Fixed Column");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1]), true, "Non-Fixed Column");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[2]), true, "Non-Fixed Column");

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[0]), false, "First column in tree mode");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1]), true, "Other column in tree mode");
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Flat);

		this.oTable.setEnableColumnReordering(false);
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[0]), false, "Column reordering disabled: Fixed Column");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1]), false, "Column reordering disabled: Non-Fixed Column");

		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[0], true), false, "Column reordering disabled, but ignored: Fixed Column");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1], true), true, "Column reordering disabled, but ignored: Non-Fixed Column");

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[0], true), false,
			"ColumnReordering Disabled, but ignored: First column in tree mode");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1], true), true,
			"Colum reordering disabled, but ignored: Other column in tree mode");
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Flat);

		this.oTable.setEnableColumnReordering(true);
		aColumns[1].setHeaderSpan(2);
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1]), false, "Spanning Column");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[2]), false, "Spanned Column");

		aColumns[1].setHeaderSpan([2, 1]);
		aColumns[1].addMultiLabel(new TestControl());
		aColumns[1].addMultiLabel(new TestControl());

		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[1]), false, "Spanning Column (Multi Header)");
		assert.strictEqual(ColumnUtils.isColumnMovable(aColumns[2]), false, "Spanned Column (Multi Header)");

		this.oTable.setFixedColumnCount(0);
		this.oTable.insertColumn(new Column(), 0);
		assert.strictEqual(ColumnUtils.isColumnMovable(this.oTable.getColumns()[1]), true, "First visible column. First column is invisible");

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		assert.strictEqual(ColumnUtils.isColumnMovable(this.oTable.getColumns()[1]), false,
			"First visible column in tree mode. First column is invisible");
	});

	QUnit.test("isColumnMovableTo", function(assert) {
		const aColumns = this.oTable.getColumns();
		const oColumn = aColumns[2];

		for (let i = -1; i <= aColumns.length + 2; i++) {
			assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, i), i >= 1, "Move to index " + i);
		}

		this.oTable.setEnableColumnReordering(false);
		for (let i = -1; i <= aColumns.length + 2; i++) {
			assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, i), false, "Column reordering disabled: Move to index " + i);
			assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, i, true), i >= 1,
				"Column reordering disabled, but ignored: Move to index " + i);
		}

		this.oTable.setEnableColumnReordering(true);
		aColumns[3].setHeaderSpan(2);
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 3), true, "Move before span");
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 4), false, "Move inside span");
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 5), true, "Move after span");

		aColumns[3].setHeaderSpan([2, 1]);
		aColumns[3].addMultiLabel(new TestControl());
		aColumns[3].addMultiLabel(new TestControl());
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 3), true, "Move before span (Multi Header)");
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 4), false, "Move inside span (Multi Header)");
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 5), true, "Move after span (Multi Header)");

		aColumns[3].setHeaderSpan(1);
		aColumns[3].destroyMultiLabels();
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 3), true, "Move before span of 1");
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 4), true, "Move after span of 1");

		this.oTable.setFixedColumnCount(0);
		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 0), false, "Move to index 0 in tree mode");

		this.oTable.insertColumn(new Column(), 0);
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 0), false, "Move to index 0 in tree mode with invisible first column");

		this.oTable.insertColumn(new Column(), 0);
		assert.strictEqual(ColumnUtils.isColumnMovableTo(oColumn, 1), false,
			"Move to index 1 in tree mode with 2 invisible columns at the beginning");
	});

	QUnit.test("moveColumnTo - Do a move", function(assert) {
		assert.expect(4);

		const oColumn = this.oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Ensure column is movable");

		this.oTable.attachColumnMove(function(oEvent) {
			assert.equal(oEvent.getParameter("newPos"), 3, "Correct Index in event parameter");
			assert.ok(oEvent.getParameter("column") === oColumn, "Correct Column in event parameter");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		assert.equal(this.oTable.indexOfColumn(oColumn), 3, "Correct Index after move");
	});

	QUnit.test("moveColumnTo - Column not movable", function(assert) {
		assert.expect(2);

		const oColumn = this.oTable.getColumns()[0];
		assert.ok(!ColumnUtils.isColumnMovable(oColumn), "Column is not movable");

		this.oTable.attachColumnMove(function(oEvent) {
			assert.ok(false, "No event was triggered");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		assert.equal(this.oTable.indexOfColumn(oColumn), 0, "Correct Index after move");
	});

	QUnit.test("moveColumnTo - Move to current position", function(assert) {
		assert.expect(2);

		const oColumn = this.oTable.getColumns()[4];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Column is movable");

		this.oTable.attachColumnMove(function(oEvent) {
			assert.ok(false, "No event was triggered");
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		assert.equal(this.oTable.indexOfColumn(oColumn), 4, "Correct Index after move.");
	});

	QUnit.test("moveColumnTo - Prevent movement", function(assert) {
		assert.expect(4);

		const oColumn = this.oTable.getColumns()[2];
		assert.ok(ColumnUtils.isColumnMovable(oColumn), "Column is movable");

		this.oTable.attachColumnMove(function(oEvent) {
			assert.equal(oEvent.getParameter("newPos"), 3, "Correct Index in event parameter");
			assert.ok(oEvent.getParameter("column") === oColumn, "Correct Column in event parameter");
			oEvent.preventDefault();
		});

		ColumnUtils.moveColumnTo(oColumn, 4);
		assert.equal(this.oTable.indexOfColumn(oColumn), 2, "Correct Index after move.");
	});

	QUnit.module("Column Widths", {
		beforeEach: async function() {
			await createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("getMinColumnWidth", function(assert) {
		const bDesktop = Device.system.desktop;
		Device.system.desktop = true;
		assert.equal(ColumnUtils.getMinColumnWidth(), 48, "Desktop column width");
		Device.system.desktop = false;
		assert.equal(ColumnUtils.getMinColumnWidth(), 88, "Mobile column width");
		Device.system.desktop = bDesktop;
	});

	QUnit.test("resizeColumn", async function(assert) {
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
		await nextUIUpdate();

		const aVisibleColumns = oTable._getVisibleColumns();

		const aOriginalColumnWidths = [];
		for (let i = 0; i < aVisibleColumns.length; i++) {
			const oColumn = aVisibleColumns[i];
			aOriginalColumnWidths.push(parseInt(oColumn.getWidth()));
		}

		function assertUnchanged(aExcludedColumns) {
			for (let i = 0; i < aVisibleColumns.length; i++) {
				if (aExcludedColumns && aExcludedColumns.indexOf(i) !== -1) {
					continue;
				}
				const oColumn = aVisibleColumns[i];
				assert.strictEqual(parseInt(oColumn.getWidth()), aOriginalColumnWidths[i],
					"Column " + (i + 1) + " has its original width of " + aOriginalColumnWidths[i] + "px");
			}
		}

		function assertColumnWidth(iColumnIndex, iWidth) {
			const iActualColumnWidth = parseInt(aVisibleColumns[iColumnIndex].getWidth());
			assert.strictEqual(iActualColumnWidth, iWidth,
				"Column " + (iColumnIndex + 1) + " width is " + iActualColumnWidth + "px and should be " + iWidth + "px");
		}

		// Invalid input should not change the column widths.
		ColumnUtils.resizeColumn();
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[1]);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[aVisibleColumns.length], 1);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[-1], 1);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], 0);
		assertUnchanged();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], -1);
		assertUnchanged();

		// Column 4
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[3], 150, false);
		assertColumnWidth(3, 150);
		assertUnchanged([3]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[3], aOriginalColumnWidths[3], false);
		assertUnchanged();

		// Column 1 to 3
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], 434, false, 3);
		const iNewWidth = Math.round(434 / 3);
		assertColumnWidth(0, iNewWidth);
		assertColumnWidth(1, iNewWidth);
		assertColumnWidth(2, iNewWidth);
		assertUnchanged([0, 1, 2]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0],
			aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
		assertUnchanged();

		// Column 1 to 3 - Column 2 not resizable
		aVisibleColumns[1].setResizable(false);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], 100, false, 3);
		assertColumnWidth(0, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(2, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([0, 2]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], aOriginalColumnWidths[0], false);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[2], aOriginalColumnWidths[2], false);
		assertUnchanged();
		aVisibleColumns[1].setResizable(true);

		// Column 2 - Not resizable
		aVisibleColumns[1].setResizable(false);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[1], 50, false);
		assertUnchanged();
		aVisibleColumns[1].setResizable(true);

		// Invalid span values default to 1
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[aVisibleColumns.length - 1], 150, false, 2);
		assertColumnWidth(oTable.columnCount - 1, 150);
		assertUnchanged([oTable.columnCount - 1]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[aVisibleColumns.length - 1], aOriginalColumnWidths[oTable.columnCount - 1], false, 0);
		assertUnchanged();

		// Do not decrease column width below the minimum column width value.
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[1], 1, false);
		assertColumnWidth(1, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([1]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[1], aOriginalColumnWidths[1], false);
		assertUnchanged();

		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], 1, false, 3);
		assertColumnWidth(0, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(1, TableUtils.Column.getMinColumnWidth());
		assertColumnWidth(2, TableUtils.Column.getMinColumnWidth());
		assertUnchanged([0, 1, 2]);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0],
			aOriginalColumnWidths[0] + aOriginalColumnWidths[1] + aOriginalColumnWidths[2], false, 3);
		assertUnchanged();

		// Fire the ColumnResize event.
		let oColumnResizeHandler = this.spy();
		oTable.attachColumnResize(oColumnResizeHandler);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], 250);
		assertColumnWidth(0, 250);
		assertUnchanged([0]);
		assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");
		oTable.detachColumnResize(oColumnResizeHandler);

		// Fire the ColumnResize event and prevent execution of the default action.
		oColumnResizeHandler = this.spy(function(oEvent) {
			oEvent.preventDefault();
		});
		oTable.attachColumnResize(oColumnResizeHandler);
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], aOriginalColumnWidths[0]);
		assertColumnWidth(0, 250);
		assertUnchanged([0]);
		assert.ok(oColumnResizeHandler.called, "ColumnResize handler was called");

		// Do not fire the event.
		oColumnResizeHandler.resetHistory();
		ColumnUtils.resizeColumn(oTable, aVisibleColumns[0], aOriginalColumnWidths[0], false);
		assertUnchanged();
		assert.ok(oColumnResizeHandler.notCalled, "ColumnResize handler was not called");
	});

	QUnit.test("getColumnWidth", async function(assert) {
		const aVisibleColumns = oTable._getVisibleColumns();
		let iColumnWidth;

		assert.strictEqual(ColumnUtils.getColumnWidth(), null, "Returned null: No parameters passed");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable), null, "Returned null: No column index specified");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, -1), null, "Returned null: Column index out of bound");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, oTable.getColumns().length), null, "Returned null: Column index out of bound");

		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 0), 100, "Returned 100");

		aVisibleColumns[1].setWidth("123px");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 1), 123, "Returned 123");

		aVisibleColumns[2].setWidth("2rem");
		const i2emInPixel = TableUtils.convertCSSSizeToPixel("2rem");
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 2), i2emInPixel, "Returned 2em in pixels: " + i2emInPixel);

		aVisibleColumns[3].setVisible(false);
		await nextUIUpdate();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 100, "Returned 100: Column is not visible and width set to 100px");

		aVisibleColumns[3].setWidth("");
		await nextUIUpdate();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"\"");

		aVisibleColumns[3].setWidth("auto");
		await nextUIUpdate();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"auto\"");

		aVisibleColumns[3].setWidth("10%");
		await nextUIUpdate();
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 3), 0, "Returned 0: Column is not visible and width is set to \"10%\"");

		aVisibleColumns[4].setWidth("");
		await nextUIUpdate();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"\"");

		aVisibleColumns[4].setWidth("auto");
		await nextUIUpdate();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case the column width was set to \"auto\"");

		aVisibleColumns[4].setWidth("10%");
		await nextUIUpdate();
		iColumnWidth = aVisibleColumns[4].getDomRef().offsetWidth;
		assert.strictEqual(ColumnUtils.getColumnWidth(oTable, 4), iColumnWidth,
			"The width in pixels was correctly retrieved from the DOM in case of a column width specified in percentage");
	});

	QUnit.module("Fixed Columns", {
		beforeEach: async function() {
			await createTables();
			oTable.setFixedColumnCount(0);
			this.aColumns = oTable.getColumns();
			for (let i = 0; i < this.aColumns.length; i++) {
				this.aColumns[i].setVisible(true);
				this.aColumns[i].setWidth("100px");
			}
			oTable.setWidth(((this.aColumns.length * 100) + 200) + "px");
			await nextUIUpdate();
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
			multiLabels: [new TestControl({text: "Column2Label1"}), new TestControl({text: "Column2Label2"})]
		}));
		oTable.addColumn(new Column({
			label: "Label3",
			headerSpan: [1, 1],
			multiLabels: [new TestControl({text: "Column3Label1"}), new TestControl({text: "Column3Label2"})],
			name: "Name"
		}));

		const aColumns = oTable.getColumns();

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

		const oLabelA = new TableQUnitUtils.HeightTestControl();
		const oLabelB = new TestControl({text: "Column2Label1"});
		const oLabelC = new TestControl({text: "Column2Label2"});
		const oLabelD = new TestControl({text: "Column3Label1"});
		const oLabelE = new TestControl({text: "Column3Label2"});

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

		const aColumns = oTable.getColumns();

		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[0]), null, "name, multiLabels, label are not set -> returned null");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[1]), oLabelA,
			"name, multiLabels are not set, label is set to a control that doesn't implement the #getText method -> returned label instance A");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[2]).getText(), "Label1",
			"name and multiLabels are not set -> returned the default label instance");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[3]), oLabelC,
			"multiLabels and label are set -> returned the correct label instance C");
		assert.strictEqual(ColumnUtils.getHeaderLabel(aColumns[4]), oLabelE, "name, multiLabels, label are set -> returned the label instance E");
	});

	QUnit.test("_getVisibleColumnsInSpan", function(assert) {
		const oLabelA = new TestControl({text: "Column1Label1"});
		const oLabelB = new TestControl({text: "Column2Label1"});
		const oLabelC = new TestControl({text: "Column3Label2"});
		const oLabelD = new TestControl({text: "Column4Label1"});
		const oLabelE = new TestControl({text: "Column4Label2"});

		oTable.removeAllColumns();
		oTable.addColumn(new Column({
			label: oLabelA
		}));

		oTable.addColumn(new Column({
			label: oLabelB
		}));

		oTable.addColumn(new Column({
			label: "Label2",
			headerSpan: [2],
			multiLabels: [oLabelE, oLabelC]
		}));

		oTable.addColumn(new Column({
			label: "Label3",
			multiLabels: [oLabelE, oLabelD]
		}));

		let aVisibleColumns = ColumnUtils._getVisibleColumnsInSpan(oTable, 2, 2);
		assert.strictEqual(aVisibleColumns.length, 2, "Columns in span at column 3: 2");

		aVisibleColumns = ColumnUtils._getVisibleColumnsInSpan(oTable, 3, 2);
		assert.strictEqual(aVisibleColumns.length, 1, "Columns in span at column 4: 1");

		aVisibleColumns = ColumnUtils._getVisibleColumnsInSpan(oTable, 5, 5);
		assert.strictEqual(aVisibleColumns, false, "_getVisibleColumnsInSpan returns false due of exiding index of available columns");
	});
});