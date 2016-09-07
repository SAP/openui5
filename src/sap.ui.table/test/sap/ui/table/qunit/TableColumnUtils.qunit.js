
//************************************************************************
// Helper Functions
//************************************************************************

jQuery.sap.require("sap.ui.table.TableUtils");
var ColumnUtils = sap.ui.table.TableUtils.ColumnUtils;
var TableUtils = sap.ui.table.TableUtils;


//************************************************************************
// Test Code
//************************************************************************

QUnit.module("Misc", {
	setup: function() {
		this.oTable = new sap.ui.table.Table();
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
					aParents.push({column: oColumnMap[k].parents[i].column.getId(), level: oColumnMap[k].parents[i].level});
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

		this.fnColumnBoundariesToId = function (mBoundaries) {
			if (mBoundaries.startColumn) {
				mBoundaries.startColumn = mBoundaries.startColumn.getId();
			}

			if (mBoundaries.endColumn) {
				mBoundaries.endColumn = mBoundaries.endColumn.getId();
			}

			return mBoundaries;
		}
	},
	teardown: function () {
		this.oTable.destroy();
	}
});

QUnit.test("Connection to TableUtils", function(assert) {
	assert.ok(!!sap.ui.table.TableUtils.ColumnUtils, "ColumnUtils namespace available");
	assert.ok(sap.ui.table.TableUtils.ColumnUtils.TableUtils === sap.ui.table.TableUtils, "Dependency forwarding of TableUtils correct");
});

QUnit.test("No Header Spans", function(assert) {
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: 1, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: 1, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: 1, template: new sap.ui.core.Control()}));

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
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c1", endIndex: 0}, "ColumnBoundaries OK");
	assert.strictEqual(ColumnUtils.getColumnBoundaries(this.oTable, "unknownColumnID"), undefined, "Wrong column ID");
});

QUnit.test("Header Spans", function(assert) {
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: 2, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: 1, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: 1, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c4", {headerSpan: 3, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c5", {headerSpan: 1, template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c6", {headerSpan: 1, template: new sap.ui.core.Control()}));

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
	assert.deepEqual(aChildren, [{column: "c5", level: 0}, {column: "c6", level: 0}], "c5 and c6 are children of c4");

	var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c1"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c2", endIndex: 1}, "ColumnBoundaries c1 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c2", endIndex: 1}, "ColumnBoundaries c2 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c3"));
	assert.deepEqual(aBoundaries, {startColumn: "c3", startIndex: 2, endColumn: "c3", endIndex: 2}, "ColumnBoundaries c3 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c4"));
	assert.deepEqual(aBoundaries, {startColumn: "c4", startIndex: 3, endColumn: "c6", endIndex: 5}, "ColumnBoundaries c4 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c5"));
	assert.deepEqual(aBoundaries, {startColumn: "c4", startIndex: 3, endColumn: "c6", endIndex: 5}, "ColumnBoundaries c5 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c6"));
	assert.deepEqual(aBoundaries, {startColumn: "c4", startIndex: 3, endColumn: "c6", endIndex: 5}, "ColumnBoundaries c6 OK");
});

QUnit.test("Header Spans with Multi-Headers", function(assert) {
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: [2, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: [1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: [1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));

	// strip returned data to minimum for better analysis
	var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

	var oExpectedColumnMap = {
		c1: {id: "c1", levelInfo: [{spannedColumns: ["c2"]}, {spannedColumns: []}], parents: []},
		c2: {id: "c2", levelInfo: [{spannedColumns: []}, {spannedColumns: []}], parents: [{column: "c1", level: 0}]},
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
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: [3, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: [1, 2, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: [1, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));

	// strip returned data to minimum for better analysis
	var oColumnMap = this.fnColumnMapToMinimum(ColumnUtils._getColumnMap(this.oTable));

	var oExpectedColumnMap = {
		c1: {id: "c1", levelInfo: [{spannedColumns: ["c2", "c3"]}, {spannedColumns: []}, {spannedColumns: []}], parents: []},
		c2: {id: "c2", levelInfo: [{spannedColumns: []}, {spannedColumns: ["c3"]}, {spannedColumns: []}], parents: [{column: "c1", level: 0}]},
		c3: {id: "c3", levelInfo: [{spannedColumns: []}, {spannedColumns: []}, {spannedColumns: []}], parents: [{column: "c1", level: 0}, {column: "c2", level: 1}]}
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
	assert.deepEqual(aChildren, [{column: "c2", level: 0}, {column: "c3", level: 0}], "c2 and c3 are children of c1");

	aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2"));
	assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

	aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2", 0));
	assert.deepEqual(aChildren, [], "c2 has no children at level 0");

	aChildren = this.fnColumnArrayToIdArray(ColumnUtils.getChildrenSpannedColumns(this.oTable, "c2", 1));
	assert.deepEqual(aChildren, [{column: "c3", level: 1}], "c3 is child of c2 at level 1");

	var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c3", endIndex: 2}, "ColumnBoundaries c2 OK");
});

QUnit.test("Header Spans with Multi-Headers, Odd Setup", function(assert) {
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: [1, 1, 3], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: [2, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: [1, 2, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c4", {headerSpan: [1, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c5", {headerSpan: [1, 2, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c6", {headerSpan: [1, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));

	var aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c1"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c4", endIndex: 3}, "ColumnBoundaries c1 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c2"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c4", endIndex: 3}, "ColumnBoundaries c2 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c3"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c4", endIndex: 3}, "ColumnBoundaries c3 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c4"));
	assert.deepEqual(aBoundaries, {startColumn: "c1", startIndex: 0, endColumn: "c4", endIndex: 3}, "ColumnBoundaries c4 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c5"));
	assert.deepEqual(aBoundaries, {startColumn: "c5", startIndex: 4, endColumn: "c6", endIndex: 5}, "ColumnBoundaries c5 OK");

	aBoundaries = this.fnColumnBoundariesToId(ColumnUtils.getColumnBoundaries(this.oTable, "c6"));
	assert.deepEqual(aBoundaries, {startColumn: "c5", startIndex: 4, endColumn: "c6", endIndex: 5}, "ColumnBoundaries c6 OK");
});

QUnit.test("getHeaderSpan", function(assert) {
	this.oTable.addColumn(new sap.ui.table.Column("c1", {headerSpan: [3, 1, 1], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c2", {headerSpan: [1, 2], multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c3", {headerSpan: 1, multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c4", {headerSpan: 2, multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));
	this.oTable.addColumn(new sap.ui.table.Column("c5", {headerSpan: 1, multiLabels: [new sap.ui.core.Control(), new sap.ui.core.Control()], template: new sap.ui.core.Control()}));

	var aColumns = this.oTable.getColumns();
	assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 0), 3, "Span OK for c1, level 0");
	assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 1), 1, "Span OK for c1, level 1");
	assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 2), 1, "Span OK for c1, level 2");
	assert.equal(ColumnUtils.getHeaderSpan(aColumns[0], 3), 3, "Span OK for c1, level 3, Level too high");

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