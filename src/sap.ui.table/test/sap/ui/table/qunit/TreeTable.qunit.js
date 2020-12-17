/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/library"
], function(TableQUnitUtils, TreeTable, Column, TableUtils, JSONModel, library) {
	"use strict";

	// Shortcuts
	var SelectionMode = library.SelectionMode;

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
			this.table = createTable();
		},
		afterEach: function() {
			destroyTable(this.table);
		},
		testAsync: function(mTestConfig) {
			return new Promise(function(resolve) {
				this.table.attachEventOnce("rowsUpdated", function() {
					mTestConfig.test();
					resolve();
				});
				mTestConfig.act();
			}.bind(this));
		}
	});

	QUnit.test("Initial", function(assert) {
		assert.equal(this.table._getTotalRowCount(), 3, "Initial row count is correct");
	});

	QUnit.test("ExpandFirstLevel", function(assert) {
		var done = assert.async();
		var that = this;

		// check the behavior of the expand first level property (only used initially)
		this.testAsync({
			act: function() {
				that.table.setExpandFirstLevel(true);
				that.table.unbindRows().bindRows("/root");
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 6, "ExpandFirstLevel=true: Row count is correct");
			}
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.setExpandFirstLevel(false);
					that.table.unbindRows().bindRows("/root");
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "ExpandFirstLevel=false: Row count is correct");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.setExpandFirstLevel(true);
					that.table.setModel(new JSONModel(getData()));
					that.table.unbindRows().bindRows({
						path: "/root",
						parameters: {
							numberOfExpandedLevels: 0,
							rootLevel: 1,
							collapseRecursive: false
						}
					});
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "ExpandFirstLevel=true and numberOfExpandedLevels=0: Row count is correct");
					assert.equal(that.table.isExpanded(0), false, "Expanded state is correct");
					assert.equal(that.table.getBindingInfo("rows").parameters.rootLevel, 1, "rootLevel is correct");
					assert.equal(that.table.getBindingInfo("rows").parameters.collapseRecursive, false, "collapseRecursive is correct");
					done();
				}
			});
		});
	});

	QUnit.test("Insert and remove a row", function(assert) {
		var done = assert.async();
		var that = this;
		var oData = that.table.getModel().getData();

		this.testAsync({
			act: function() {
				oData.root[3] = {
					name: "new item",
					description: "new item description"
				};
				that.table.getModel().setData(oData);
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 4, "Row inserted: Row count is correct");
			}
		}).then(function() {
			that.testAsync({
				act: function() {
					delete oData.root[3];
					that.table.getModel().setData(oData);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "Row removed: Row count is correct");
					done();
				}
			});
		});
	});

	QUnit.test("Insert a child row", function(assert) {
		var done = assert.async();
		var that = this;
		var oData = this.table.getModel().getData();

		this.testAsync({
			act: function() {
				oData.root[2] = {
					0: {
						name: "new child item",
						description: "new child item description"
					}
				};
				that.table.getModel().setData(oData);
				that.table.expand(2);
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 4, "Child row inserted and parent row expanded: Row count is correct");
				assert.equal(that.table.isExpanded(2), true, "Expanded state is correct!");
				done();
			}
		});
	});

	QUnit.test("Add and remove a filter", function(assert) {
		var done = assert.async();
		var that = this;

		this.testAsync({
			act: function() {
				that.table.filter(that.table.getColumns()[0], "subitem1-1");
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 1, "Filter added: Row count is correct");
			}
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.filter(that.table.getColumns()[0], "");
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "Filter removed: Row count is correct");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.expand(0);
					that.table.expand(1);
					that.table.filter(that.table.getColumns()[0], "subsubitem1-1-1");
					that.table.filter(that.table.getColumns()[0], "");
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 7, "Expanded first node and its first child node: Row count is correct");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.filter(that.table.getColumns()[0], "subsubitem1-1-1");
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "Filter added: Row count is correct");
				}
			});
		}).then(function() {
			that.testAsync({
				act: function() {
					that.table.filter(that.table.getColumns()[0], "");
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 7, "Filter removed: Row count is correct");
					done();
				}
			});
		});
	});

	QUnit.test("Bind rows", function(assert) {
		var oInnerBindRows = this.spy(TreeTable.prototype, "_bindRows");

		/*eslint-disable no-new */
		new TreeTable({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});
		/*eslint-enable no-new */

		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");

		oInnerBindRows.restore();
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

		var oBinding = this.table.getBinding();
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
		jQuery(oTable.getDomRef("selall")).trigger("click");
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).trigger("click");

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("click");
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("click");

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

			oTable.attachEventOnce("rowsUpdated", function() {
				assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

				/*eslint-disable max-nested-callbacks */
				oTable.attachEventOnce("rowsUpdated", function() {
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
		oTable.$("selall").trigger("click");
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

	QUnit.test("Selection Plugin", function(assert) {
		assert.ok(this.table._getSelectionPlugin().isA("sap.ui.table.plugins.BindingSelection"), "BindingSelection plugin is initialized");
	});

	QUnit.module("Event: _rowsUpdated", {
		afterEach: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}
		},
		createTable: function() {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = TableQUnitUtils.createTable(TreeTable, {
				rows: "{/root}",
				models: new JSONModel(getData()),
				columns: [
					new Column({label: "Name", template: "name", filterProperty: "name"}),
					new Column({label: "Description", template: "description"})
				]
			});

			return this.oTable;
		},
		checkRowsUpdated: function(assert, aActualReasons, aExpectedReasons) {
			var that = this;

			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.deepEqual(aActualReasons, aExpectedReasons,
						"VisibleRowCountMode: " + that.oTable.getVisibleRowCountMode() + " - "
						+ (aExpectedReasons.length > 0
						   ? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
						   : "The event _rowsUpdated has not been fired")
					);

					resolve();
				}, 250);
			});
		}
	});

	QUnit.test("_rowsUpdated - Expand", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTable();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});
			oTable.getRows()[0].expand();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Expand
			]);
		});
	});

	QUnit.test("_rowsUpdated - Collapse", function(assert) {
		var aFiredReasons = [];
		var that = this;
		var oTable = this.createTable();

		return oTable.qunit.whenRenderingFinished().then(function() {
			oTable.getRows()[0].expand();
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});
			oTable.getRows()[0].collapse();

			return that.checkRowsUpdated(assert, aFiredReasons, [
				TableUtils.RowsUpdateReason.Collapse
			]);
		});
	});

	QUnit.module("Selection", {
		beforeEach: function() {
			this.table = createTable();
		},
		afterEach: function() {
			destroyTable(this.table);
		}
	});

	QUnit.test("SelectionMode = None", function(assert) {
		this.table.setSelectionMode(SelectionMode.None);

		this.table.setSelectedIndex(1);
		assert.deepEqual(this.table.getSelectedIndices(), [], "setSelectedIndex does not select");

		this.table.setSelectionInterval(1, 1);
		assert.deepEqual(this.table.getSelectedIndices(), [], "setSelectionInterval does not select");

		this.table.addSelectionInterval(1, 1);
		assert.deepEqual(this.table.getSelectedIndices(), [], "addSelectionInterval does not select");
	});

	QUnit.test("SelectionMode = Single (collapseRecursive=true)", function(assert) {
		this.table.setSelectionMode(SelectionMode.Single);
		this.table.expand(0);

		this.table.setSelectedIndex(1);
		assert.deepEqual(this.table.getSelectedIndex(), 1, "setSelectedIndex(1) - getSelectedIndex returns 1");
		assert.deepEqual(this.table.getSelectedIndices(), [1], "setSelectedIndex(1) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "setSelectedIndex(1) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "setSelectedIndex(1) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "setSelectedIndex(1) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "setSelectedIndex(1) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "setSelectedIndex(1) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		assert.deepEqual(this.table.getSelectedIndex(), -1, "collapse(0) - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0) - isIndexSelected(2) returns false");

		this.table.expand(0);
		assert.deepEqual(this.table.getSelectedIndex(), -1, "expand(0) - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "expand(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "expand(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "expand(0) - isIndexSelected(4) returns false");

		this.table.addSelectionInterval(1, 2);
		assert.deepEqual(this.table.getSelectedIndex(), 2, "addSelectionInterval(1, 2) - getSelectedIndex returns 2");
		assert.deepEqual(this.table.getSelectedIndices(), [2], "addSelectionInterval(1, 2) - getSelectedIndices returns [2]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "addSelectionInterval(1, 2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "addSelectionInterval(1, 2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "addSelectionInterval(1, 2) - isIndexSelected(2) returns true");
		assert.deepEqual(this.table.isIndexSelected(3), false, "addSelectionInterval(1, 2) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "addSelectionInterval(1, 2) - isIndexSelected(4) returns false");

		this.table.clearSelection();
		assert.deepEqual(this.table.getSelectedIndex(), -1, "clearSelection() - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "clearSelection() - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "clearSelection() - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "clearSelection() - isIndexSelected(4) returns false");
	});

	QUnit.test("SelectionMode = Single (collapseRecursive=false)", function(assert) {
		var bBindingInfo = this.table.getBindingInfo("rows");

		bBindingInfo.parameters.collapseRecursive = false;
		this.table.bindRows(bBindingInfo);
		this.table.setSelectionMode(SelectionMode.Single);
		this.table.expand(0);

		this.table.setSelectedIndex(1);
		assert.deepEqual(this.table.getSelectedIndex(), 1, "setSelectedIndex(1) - getSelectedIndex returns 1");
		assert.deepEqual(this.table.getSelectedIndices(), [1], "setSelectedIndex(1) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "setSelectedIndex(1) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "setSelectedIndex(1) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "setSelectedIndex(1) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "setSelectedIndex(1) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "setSelectedIndex(1) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		assert.deepEqual(this.table.getSelectedIndex(), -1, "collapse(0) - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "collapse(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "collapse(0) - isIndexSelected(4) returns false");

		this.table.expand(0);
		assert.deepEqual(this.table.getSelectedIndex(), 1, "expand(0) - getSelectedIndex returns 1");
		assert.deepEqual(this.table.getSelectedIndices(), [1], "expand(0) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "expand(0) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "expand(0) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		this.table.setSelectedIndex(2);
		assert.deepEqual(this.table.getSelectedIndex(), 2, "collapse(0), setSelectedIndex(2) - getSelectedIndex returns 1");
		assert.deepEqual(this.table.getSelectedIndices(), [2], "collapse(0), setSelectedIndex(2) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), setSelectedIndex(2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), setSelectedIndex(2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "collapse(0), setSelectedIndex(2) - isIndexSelected(2) returns true");

		this.table.expand(0);
		assert.deepEqual(this.table.getSelectedIndex(), 4, "expand(0) - getSelectedIndex returns 4");
		assert.deepEqual(this.table.getSelectedIndices(), [4], "expand(0) - getSelectedIndices returns [4]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "expand(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), true, "expand(0) - isIndexSelected(4) returns true");

		this.table.addSelectionInterval(1, 2);
		assert.deepEqual(this.table.getSelectedIndex(), 2, "addSelectionInterval(1, 2) - getSelectedIndex returns 2");
		assert.deepEqual(this.table.getSelectedIndices(), [2], "addSelectionInterval(1, 2) - getSelectedIndices returns [2]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "addSelectionInterval(1, 2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "addSelectionInterval(1, 2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "addSelectionInterval(1, 2) - isIndexSelected(2) returns true");
		assert.deepEqual(this.table.isIndexSelected(3), false, "addSelectionInterval(1, 2) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "addSelectionInterval(1, 2) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		this.table.clearSelection();
		assert.deepEqual(this.table.getSelectedIndex(), -1, "collapse(0), clearSelection() - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0), clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0), clearSelection() - isIndexSelected(2) returns false");

		this.table.expand(0);
		assert.deepEqual(this.table.getSelectedIndex(), -1, "collapse(0), clearSelection() - getSelectedIndex returns -1");
		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0), clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0), clearSelection() - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "collapse(0), clearSelection() - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "collapse(0), clearSelection() - isIndexSelected(4) returns false");
	});

	QUnit.module("Expand/Collapse", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable(TreeTable, {
				rows: {path: "/"},
				models: new TableQUnitUtils.createJSONModel(8),
				visibleRowCount: 5
			});
			var oBinding = this.oTable.getBinding();

			this.oBindingExpandSpy = sinon.spy(oBinding, "expand");
			this.oBindingCollapseSpy = sinon.spy(oBinding, "collapse");
			this.oChangeEventSpy = sinon.spy();
			oBinding.attachChange(this.oChangeEventSpy);

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		},
		test: function(sMessage, oTestConfig, assert) {
			var mOperations = [];

			if (oTestConfig.prepare != null) {
				oTestConfig.prepare();
			}

			this.oBindingExpandSpy.reset();
			this.oBindingCollapseSpy.reset();
			this.oChangeEventSpy.reset();

			if (oTestConfig.expand === true) {
				this.oTable.expand(oTestConfig.indices);
			} else {
				this.oTable.collapse(oTestConfig.indices);
			}

			this.oBindingExpandSpy.getCalls().forEach(function(oCall) {
				mOperations.push({operation: "expand", index: oCall.args[0], suppressChange: oCall.args[1]});
			});
			this.oBindingCollapseSpy.getCalls().forEach(function(oCall) {
				mOperations.push({operation: "collapse", index: oCall.args[0], suppressChange: oCall.args[1]});
			});

			if (oTestConfig.expectedOperations && oTestConfig.expectedOperations.length > 0) {
				assert.deepEqual(mOperations, oTestConfig.expectedOperations, sMessage + ": Operations were performed correctly");
				assert.ok(this.oChangeEventSpy.calledOnce, sMessage + ": Change event was fired once");
			} else {
				assert.deepEqual(mOperations, [], sMessage + ": No operations performed");
				assert.ok(this.oChangeEventSpy.notCalled, sMessage + ": Change event was not fired");
			}
		}
	});

	QUnit.test("#expand", function(assert) {
		var that = this;

		[0, [0]].forEach(function(vIndexParameter) {
			that.test("Expand a collapsed row", {
				prepare: function() {
					that.oTable.collapse(0);
				},
				indices: vIndexParameter,
				expand: true,
				expectedOperations: [
					{operation: "expand", index: 0, suppressChange: false}
				]
			}, assert);
			that.test("Expand an expanded row", {
				indices: vIndexParameter,
				expand: true
			}, assert);
		});

		[1, [1]].forEach(function(vIndexParameter) {
			that.test("Expand a leaf", {
				prepare: function() {
					that.oTable.expand(0);
				},
				indices: vIndexParameter,
				expand: true
			}, assert);
		});

		this.test("Expand multiple rows", {
			prepare: function() {
				/* Create the following state:
				 * 0 - Collapsed
				 * 1 - Expanded
				 * 2 -   Leaf
				 * 3 - Collapsed
				 * 4 - Collapsed
				 */
				that.oTable.collapseAll();
				that.oTable.expand(1);
			},
			indices: [1, 0, 3, -1, 2, 4, that.oTable._getTotalRowCount()],
			expand: true,
			expectedOperations: [
				{operation: "expand", index: 4, suppressChange: true},
				{operation: "expand", index: 3, suppressChange: true},
				{operation: "expand", index: 0, suppressChange: false}
			]
		}, assert);
	});

	QUnit.test("#collapse", function(assert) {
		var that = this;

		[0, [0]].forEach(function(vIndexParameter) {
			that.test("Collapse an expanded row", {
				prepare: function() {
					that.oTable.expand(0);
				},
				indices: vIndexParameter,
				expand: false,
				expectedOperations: [
					{operation: "collapse", index: 0, suppressChange: false}
				]
			}, assert);
			that.test("Collapse a collapsed row", {
				indices: vIndexParameter,
				expand: false
			}, assert);
		});

		[1, [1]].forEach(function(vIndexParameter) {
			that.test("Collapse a leaf", {
				prepare: function() {
					that.oTable.expand(0);
				},
				indices: vIndexParameter,
				expand: false
			}, assert);
		});

		this.test("Collapse multiple rows", {
			prepare: function() {
				/* Create the following state:
				 * 0 - Collapsed
				 * 1 - Expanded
				 * 2 -   Leaf
				 * 3 - Expanded
				 * 4 -   Expanded
				 */
				that.oTable.getModel().setData([{}, {}, {children: {children: {}}}], true);
				that.oTable.collapseAll();
				that.oTable.expand(2);
				that.oTable.expand(3);
				that.oTable.expand(1);
			},
			indices: [1, 2, -1, 3, 0, 4, that.oTable._getTotalRowCount()],
			expand: false,
			expectedOperations: [
				{operation: "collapse", index: 4, suppressChange: true},
				{operation: "collapse", index: 3, suppressChange: true},
				{operation: "collapse", index: 1, suppressChange: false}
			]
		}, assert);
	});

	QUnit.test("#expand/#collapse with invalid parameters", function(assert) {
		var that = this;

		[-1, [-1]].forEach(function(vIndexParameter) {
			that.test("Expand index < 0", {
				indices: vIndexParameter,
				expand: true
			}, assert);
			that.test("Collapse index < 0", {
				indices: vIndexParameter,
				expand: false
			}, assert);
		});

		var iTotalRowCount = this.oTable._getTotalRowCount();
		[iTotalRowCount, [iTotalRowCount]].forEach(function(vIndexParameter) {
			that.test("Expand index > maximum row index", {
				indices: vIndexParameter,
				expand: true
			}, assert);
			that.test("Collapse index > maximum row index", {
				indices: vIndexParameter,
				expand: false
			}, assert);
		});
	});

	QUnit.test("Row#expand", function(assert) {
		this.oTable.getRows()[0].expand();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(this.oTable._getTotalRowCount(), 9, "Expanded: Total row count");
			assert.ok(this.oTable.isExpanded(0), "Expanded: Expanded state");
		}.bind(this));
	});

	QUnit.test("Row#collapse", function(assert) {
		var that = this;

		this.oTable.getRows()[0].expand();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oTable.getRows()[0].collapse();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 8, "Collapsed: Total row count");
			assert.notOk(that.oTable.isExpanded(0), "Collapsed: Expanded state");
		});
	});

	QUnit.test("Row#toggleExpandedState", function(assert) {
		var that = this;

		this.oTable.getRows()[0].toggleExpandedState();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 9, "Expanded: Total row count");
			assert.ok(that.oTable.isExpanded(0), "Expanded: Expanded state");
			that.oTable.getRows()[0].toggleExpandedState();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 8, "Collapsed: Total row count");
			assert.notOk(that.oTable.isExpanded(0), "Collapsed: Expanded state");
		});
	});

	QUnit.test("Result of expand/collapse a single row", function(assert) {
		var that = this;

		this.oTable.expand(0);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 9, "Expanded: Total row count");
			assert.ok(that.oTable.isExpanded(0), "Expanded: Expanded state");
			that.oTable.collapse(0);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 8, "Collapsed: Total row count");
			assert.notOk(that.oTable.isExpanded(0), "Collapsed: Expanded state");
		});
	});

	QUnit.test("Result of expand/collapse a single row synchronously after bind", function(assert) {
		var that = this;

		this.oTable.bindRows(this.oTable.getBindingInfo("rows"));
		this.oTable.expand(0);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 9, "Expanded: Total row count");
			assert.ok(that.oTable.isExpanded(0), "Expanded: Expanded state");

			that.oTable.bindRows({
				path: "/",
				parameters: {
					numberOfExpandedLevels: 1
				}
			});
			that.oTable.collapse(0);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 15, "Collapsed: Total row count");
			assert.notOk(that.oTable.isExpanded(0), "Collapsed: Expanded state");
		});
	});

	QUnit.test("Result of expand/collapse multiple rows", function(assert) {
		var that = this;

		this.oTable.expand([0, 1]);

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			assert.equal(that.oTable._getTotalRowCount(), 10, "Expanded: Total row count");
			assert.equal(that.oTable.isExpanded(0), true, "Expanded state of the first expanded row");
			assert.equal(that.oTable.isExpanded(2), true, "Expanded state of the second expanded row");

			that.oTable.collapse([0, 2]);
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.equal(that.oTable._getTotalRowCount(), 8, "Collapsed: Total row count");
			assert.equal(that.oTable.isExpanded(0), false, "Expanded state of the first collapsed row");
			assert.equal(that.oTable.isExpanded(1), false, "Expanded state of the second collapsed row");
		});
	});
});