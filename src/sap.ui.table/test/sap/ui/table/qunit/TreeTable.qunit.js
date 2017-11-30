/*global QUnit, sinon */

sap.ui.require([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/TableUtils",
	"sap/ui/model/json/JSONModel"
], function(qutils, TreeTable, Column, TableUtils, JSONModel) {
	"use strict";

	function getData() {
		return {
			root: {
				0: {
					name: "item1",
					description: "item1 description",
					0: {
						name: "subitem1-1",
						description: "subitem1-1 description",
						0: {
							name: "subsubitem1-1-1",
							description: "subsubitem1-1-1 description"
						},
						1: {
							name: "subsubitem1-1-2",
							description: "subsubitem1-1-2 description"
						}
					},
					1: {
						name: "subitem1-2",
						description: "subitem1-2 description",
						0: {
							name: "subsubitem1-2-1",
							description: "subsubitem1-2-1 description"
						}
					}

				},
				1: {
					name: "item2",
					description: "item2 description",
					0: {
						name: "subitem2-1",
						description: "subitem2-1 description"
					}
				},
				2: {
					name: "item3",
					description: "item3 description"
				}
			}
		};
	}

	function createTable() {
		var oModel = new JSONModel();
		oModel.setData(getData());

		var oTable = new TreeTable({
			columns: [
				new Column({label: "Name", template: "name", filterProperty: "name"}),
				new Column({label: "Description", template: "description"})
			]
		});
		oTable.bindRows("/root");
		oTable.setModel(oModel);

		oTable.placeAt("qunit-fixture");
		sap.ui.getCore().applyChanges();
		return oTable;
	}

	function destroyTable(oTable) {
		oTable.destroy();
		sap.ui.getCore().applyChanges();
	}

	// *************************************************************************
	// QUNIT TEST CODE
	// *************************************************************************

	QUnit.module("Basic checks", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			this.table = createTable();
		},
		afterEach: function() {
			this.clock.restore();
			destroyTable(this.table);
		}
	});

	QUnit.test("Initial", function(assert) {
		assert.equal(this.table._getTotalRowCount(), 3, "Initial row count is correct");
	});

	QUnit.test("ExpandFirstLevel", function(assert) {
		// check the behavior of the expand first level property (only used initially)
		this.table.setExpandFirstLevel(true);
		this.table.unbindRows().bindRows("/root");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 6, "ExpandFirstLevel=true: Row count is correct");

		this.table.setExpandFirstLevel(false);
		this.table.unbindRows().bindRows("/root");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "ExpandFirstLevel=false: Row count is correct");
	});

	QUnit.test("Expand and collapse a row", function(assert) {
		this.table.expand(0);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 5, "Expanded: Row count is correct");
		assert.equal(this.table.isExpanded(0), true, "Expanded state is correct");

		this.table.collapse(0);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "Collapsed: Row count is correct");
		assert.equal(this.table.isExpanded(0), false, "Expanded state is correct");
	});

	QUnit.test("Expand and collapse a row synchronously", function(assert) {
		this.table.setModel(new JSONModel(getData()));
		this.table.bindRows("/root");

		this.table.expand(0);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 5, "Expanded: Row count is correct");
		assert.equal(this.table.isExpanded(0), true, "Expanded state is correct");

		this.table.setModel(new JSONModel(getData()));
		this.table.bindRows({
			path: "/root",
			parameters: {
				numberOfExpandedLevels: 1
			}
		});

		this.table.collapse(0);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 4, "Collapsed: Row count is correct");
		assert.equal(this.table.isExpanded(0), false, "Expanded state is correct");
	});

	QUnit.test("Expand and collapse multiple rows", function(assert) {
		this.table.expand([0, 1]);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 6, "Expanded: Row count is correct");
		assert.equal(this.table.isExpanded(0), true, "Expanded state of the first expanded row is correct");
		assert.equal(this.table.isExpanded(3), true, "Expanded state of the first expanded row is correct");

		this.table.collapse([0, 3]);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "Collapsed: Row count is correct");
		assert.equal(this.table.isExpanded(0), false, "Expanded state of the first collapsed row is correct");
		assert.equal(this.table.isExpanded(1), false, "Expanded state of the first collapsed row is correct");
	});

	QUnit.test("Insert and remove a row", function(assert) {
		var oData = this.table.getModel().getData();

		oData.root[3] = {
			name: "new item",
			description: "new item description"
		};
		this.table.getModel().setData(oData);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 4, "Row inserted: Row count is correct");

		delete oData.root[3];
		this.table.getModel().setData(oData);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "Row removed: Row count is correct");
	});

	QUnit.test("Insert a child row", function(assert) {
		var oData = this.table.getModel().getData();

		oData.root[2] = {
			0: {
				name: "new child item",
				description: "new child item description"
			}
		};
		this.table.getModel().setData(oData);
		this.table.expand(2);
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 4, "Child row inserted and parent row expanded: Row count is correct");
		assert.equal(this.table.isExpanded(2), true, "Expanded state is correct!");
	});

	QUnit.test("Add and remove a filter", function(assert) {
		this.table.filter(this.table.getColumns()[0], "subitem1-1");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 1, "Filter added: Row count is correct");

		this.table.filter(this.table.getColumns()[0], "");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "Filter removed: Row count is correct");

		this.table.expand(0);
		this.table.expand(1);
		this.table.filter(this.table.getColumns()[0], "subsubitem1-1-1");
		this.table.filter(this.table.getColumns()[0], "");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 7, "Expanded first node and its first child node: Row count is correct");

		this.table.filter(this.table.getColumns()[0], "subsubitem1-1-1");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 3, "Filter added: Row count is correct");

		this.table.filter(this.table.getColumns()[0], "");
		this.clock.tick(50);
		assert.equal(this.table._getTotalRowCount(), 7, "Filter removed: Row count is correct");
	});

	QUnit.test("Bind rows", function(assert) {
		var spy = this.spy(TreeTable.prototype, "bindRows");

		/*eslint-disable no-new */
		new TreeTable({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});
		/*eslint-enable no-new */

		assert.ok(spy.calledOnce, "bindRows was called");
	});

	QUnit.test("Binding events", function(assert) {
		var oChangeSpy = this.spy();
		var oDataRequestedSpy = this.spy();
		var oDataReceivedSpy = this.spy();

		this.table.bindRows({
			path: "/root",
			events: {
				change: oChangeSpy,
				dataRequested: oDataRequestedSpy,
				dataReceived: oDataReceivedSpy
			}
		});

		var oBinding = this.table.getBinding("rows");
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");

		assert.ok(oChangeSpy.calledOnce, "The original change event listener was called once");
		assert.ok(oDataRequestedSpy.calledOnce, "The original dataRequested event listener was called once");
		assert.ok(oDataReceivedSpy.calledOnce, "The original dataReceived event listener was called once");
	});

	QUnit.test("Flat mode", function(assert) {
		assert.ok(this.table.$().find(".sapUiTableTreeIcon").length > 0, "Tree Icons available in TreeMode");
		assert.ok(!this.table._bFlatMode, "Flat Mode not set");

		this.table.setUseFlatMode(true);
		sap.ui.getCore().applyChanges();

		assert.ok(this.table.$().find(".sapUiTableTreeIcon").length == 0, "Tree Icons not available in FlatMode");
		assert.ok(this.table._bFlatMode, "Flat Mode set");
	});

	QUnit.module("Events", {
		beforeEach: function() {
			this.table = createTable();
		},
		afterEach: function() {
			destroyTable(this.table);
		},
		checkRowsUpdated: function(assert, aActualReasons, aExpectedReasons) {
			var oTreeTable = this.table;

			return new Promise(function(resolve) {
				window.setTimeout(function() {
					assert.deepEqual(aActualReasons, aExpectedReasons,
						"VisibleRowCountMode: " + oTreeTable.getVisibleRowCountMode() + " - "
						+ (aExpectedReasons.length > 0
						? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
						: "The event _rowsUpdated has not been fired")
					);

					resolve();
				}, 100);
			});
		}
	});

	QUnit.test("RowSelectionChange", function(assert) {
		assert.expect(42);
		var oTable = this.table;
		var sTestCase = "";
		var fnHandler = function(oEvent) {
			switch (sTestCase) {
				case "userSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "userClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 2, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(2), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "APIClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) {return i;}),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "userSetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "userUnsetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISetSelectedIndex":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), [0], sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				default:
			}
		};

		oTable.attachRowSelectionChange(fnHandler);

		sTestCase = "userSelectAll";
		jQuery(oTable.getDomRef("selall")).click();
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).click();

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").click();
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").click();

		sTestCase = "APISetSelectedIndex";
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Select All on Binding Change", function(assert) {
		assert.expect(4);
		var done = assert.async();
		var oModel;
		var oTable = this.table;

		oTable.attachRowSelectionChange(function() {
			assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");

			oTable.attachEventOnce("_rowsUpdated", function() {
				assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

				/*eslint-disable max-nested-callbacks */
				oTable.attachEventOnce("_rowsUpdated", function() {
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					done();
				});
				/*eslint-enable max-nested-callbacks */

				oModel.setData(getData());
			});

			oModel = new JSONModel();
			oModel.setData({});
			oTable.setModel(oModel);
			oTable.bindRows("/root");
		});

		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
		oTable.$("selall").click();
	});

	QUnit.test("TreeTable + JSONModel: Select entries synchronously", function(assert) {
		assert.expect(6);
		var oModel;
		var oTable = this.table;

		oModel = new JSONModel();
		oModel.setData(getData());
		oTable.setModel(oModel);
		oTable.bindRows("/root");

		// synchronously select one entry after setting the model & binding the table
		oTable.setSelectedIndex(0);

		oTable.expand(0);

		oTable.addSelectionInterval(1, 1);
		oTable.addSelectionInterval(3, 3);

		assert.ok(oTable.getSelectedIndex() == 3, "LeadIndex 0 is selected");
		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 3], "Selected indices array is correct");
		var oBinding = oTable.getBinding();
		assert.ok(oBinding.getSelectedNodesCount() == 3, "# of selected nodes is correct");

		// test clear selection
		oTable.clearSelection();

		assert.ok(oTable.getSelectedIndex() == -1, "LeadIndex is removed");
		assert.deepEqual(oTable.getSelectedIndices(), [], "Selected indices array is correct");
		assert.ok(oBinding.getSelectedNodesCount() == 0, "# of selected nodes is correct");
	});

	QUnit.test("_rowsUpdated - Expand", function(assert) {
		var done = assert.async();
		var oTable = this.table;
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

		window.setTimeout(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Expand
			]).then(function() {
				done();
			});
		}, 0);
	});

	QUnit.test("_rowsUpdated - Collapse", function(assert) {
		var done = assert.async();
		var oTable = this.table;
		var aFiredReasons = [];
		var that = this;

		oTable.attachEvent("_rowsUpdated", function(oEvent) {
			aFiredReasons.push(oEvent.getParameter("reason"));
		});

		TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);

		window.setTimeout(function() {
			aFiredReasons = [];
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

			that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Collapse
			]).then(function() {
				done();
			});
		}, 0);
	});
});