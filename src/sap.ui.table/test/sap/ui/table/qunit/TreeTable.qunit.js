/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TreeTable,
	Column,
	FixedRowMode,
	TableUtils,
	library,
	JSONModel,
	jQuery
) {
	"use strict";

	const SelectionMode = library.SelectionMode;

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

	async function createTable() {
		const oModel = new JSONModel();
		oModel.setData(getData());

		const oTable = new TreeTable({
			columns: [
				new Column({label: "Name", template: "name", filterProperty: "name"}),
				new Column({label: "Description", template: "description"})
			]
		});
		oTable.bindRows("/root");
		oTable.setModel(oModel);

		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		return oTable;
	}

	async function destroyTable(oTable) {
		oTable.destroy();
		await nextUIUpdate();
	}

	// *************************************************************************
	// QUNIT TEST CODE
	// *************************************************************************

	QUnit.module("Basic checks", {
		beforeEach: async function() {
			this.table = await createTable();
		},
		afterEach: async function() {
			await destroyTable(this.table);
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

	QUnit.test("Insert and remove a row", function(assert) {
		const done = assert.async();
		const that = this;
		const oData = that.table.getModel().getData();

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
		const done = assert.async();
		const that = this;
		const oData = this.table.getModel().getData();

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
		const done = assert.async();
		const that = this;

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
		const oInnerBindRows = this.spy(TreeTable.prototype, "_bindRows");
		const oTable = new TreeTable({
			rows: {path: "/modelData"},
			columns: [new Column()]
		});

		assert.ok(oInnerBindRows.calledOnce, "_bindRows was called");

		oInnerBindRows.restore();
		oTable.destroy();
	});

	QUnit.test("Binding events", function(assert) {
		const oChangeSpy = this.spy();
		const oDataRequestedSpy = this.spy();
		const oDataReceivedSpy = this.spy();

		this.table.bindRows({
			path: "/root",
			events: {
				change: oChangeSpy,
				dataRequested: oDataRequestedSpy,
				dataReceived: oDataReceivedSpy
			}
		});

		const oBinding = this.table.getBinding();
		oBinding.fireEvent("dataRequested");
		oBinding.fireEvent("dataReceived");

		assert.ok(oChangeSpy.calledOnce, "The original change event listener was called once");
		assert.ok(oDataRequestedSpy.calledOnce, "The original dataRequested event listener was called once");
		assert.ok(oDataReceivedSpy.calledOnce, "The original dataReceived event listener was called once");
	});

	QUnit.test("Hierarchy modes", async function(assert) {
		function assertMode(oTable, sExpectedMode, sMessage) {
			sMessage = "Table is in mode '" + sExpectedMode + "'" + (sMessage ? " - " + sMessage : "");
			assert.strictEqual(TableUtils.Grouping.getHierarchyMode(oTable), sExpectedMode, sMessage);
		}

		assertMode(this.table, TableUtils.Grouping.HierarchyMode.Tree, "Initial");

		this.table.setUseFlatMode(true);
		await nextUIUpdate();
		assertMode(this.table, TableUtils.Grouping.HierarchyMode.Flat, "Enabled flat mode");

		this.table.setUseGroupMode(true);
		await nextUIUpdate();
		assertMode(this.table, TableUtils.Grouping.HierarchyMode.GroupedTree, "Enabled group mode when flat mode is enabled");

		this.table.setUseGroupMode(false);
		assertMode(this.table, TableUtils.Grouping.HierarchyMode.Flat, "Disabled group mode when flat mode is enabled");

		this.table.setUseFlatMode(false);
		assertMode(this.table, TableUtils.Grouping.HierarchyMode.Tree, "Disabled flat mode");

		this.table.setUseGroupMode(true);
		this.table.setUseFlatMode(true);
		assertMode(this.table, TableUtils.Grouping.HierarchyMode.GroupedTree, "Enabled flat mode when group mode is enabled");
	});

	QUnit.module("Events", {
		beforeEach: async function() {
			this.table = await createTable();
		},
		afterEach: async function() {
			await destroyTable(this.table);
		}
	});

	QUnit.test("RowSelectionChange", function(assert) {
		assert.expect(42);
		const oTable = this.table;
		let sTestCase = "";
		const fnHandler = function(oEvent) {
			switch (sTestCase) {
				case "userSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 0, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(0), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "userClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), true, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					break;
				case "APISelectAll":
					assert.equal(oEvent.getParameter("selectAll"), true, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), 2, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), oTable.getContextByIndex(2), sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) { return i; }),
						sTestCase + ": Parameter rowIndices correct");
					assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");
					break;
				case "APIClearSelectAll":
					assert.equal(oEvent.getParameter("selectAll"), undefined, sTestCase + ": Parameter selectAll correct");
					assert.equal(oEvent.getParameter("userInteraction"), false, sTestCase + ": Parameter userInteraction correct");
					assert.equal(oEvent.getParameter("rowIndex"), -1, sTestCase + ": Parameter rowIndex correct");
					assert.equal(oEvent.getParameter("rowContext"), undefined, sTestCase + ": Parameter rowContext correct");
					assert.deepEqual(oEvent.getParameter("rowIndices"), Array.apply(0, new Array(3)).map(function(c, i) { return i; }),
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
		jQuery(oTable.getDomRef("selall")).trigger("tap");
		sTestCase = "userClearSelectAll";
		jQuery(oTable.getDomRef("selall")).trigger("tap");

		sTestCase = "APISelectAll";
		oTable.selectAll();
		sTestCase = "APIClearSelectAll";
		oTable.clearSelection();

		sTestCase = "userSetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("tap");
		sTestCase = "userUnsetSelectedIndex";
		jQuery("#" + oTable.getId() + "-rowsel0").trigger("tap");

		sTestCase = "APISetSelectedIndex";
		oTable.setSelectedIndex(0);
	});

	QUnit.test("Select All on Binding Change", function(assert) {
		assert.expect(4);
		const done = assert.async();
		let oModel;
		const oTable = this.table;

		oTable.attachRowSelectionChange(function() {
			assert.ok(!oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is checked.");

			oTable.attachEventOnce("rowsUpdated", function() {
				assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");

				oTable.attachEventOnce("rowsUpdated", function() {
					assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
					done();
				});

				oModel.setData(getData());
			});

			oModel = new JSONModel();
			oModel.setData({});
			oTable.setModel(oModel);
			oTable.bindRows("/root");
		});

		assert.ok(oTable.$("selall").hasClass("sapUiTableSelAll"), "Select all icon is not checked.");
		oTable.$("selall").trigger("tap");
	});

	QUnit.test("TreeTable + JSONModel: Select entries synchronously", function(assert) {
		const oTable = this.table;

		oTable.setModel(new JSONModel(getData()));
		oTable.bindRows("/root");

		// synchronously select one entry after setting the model & binding the table
		oTable.setSelectedIndex(0);

		oTable.expand(0);

		oTable.addSelectionInterval(1, 1);
		oTable.addSelectionInterval(3, 3);

		assert.deepEqual(oTable.getSelectedIndices(), [0, 1, 3], "Selected indices array is correct");
		const oBinding = oTable.getBinding();
		assert.ok(oBinding.getSelectedNodesCount() === 3, "# of selected nodes is correct");

		// test clear selection
		oTable.clearSelection();

		assert.deepEqual(oTable.getSelectedIndices(), [], "Selected indices array is correct");
		assert.ok(oBinding.getSelectedNodesCount() === 0, "# of selected nodes is correct");
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
		createTable: async function() {
			if (this.oTable) {
				this.oTable.destroy();
			}

			this.oTable = await TableQUnitUtils.createTable(TreeTable, {
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
			return new Promise(function(resolve) {
				setTimeout(function() {
					assert.deepEqual(aActualReasons, aExpectedReasons,
						aExpectedReasons.length > 0
						   ? "The event _rowsUpdated has been fired in order with reasons: " + aExpectedReasons.join(", ")
						   : "The event _rowsUpdated has not been fired"
					);

					resolve();
				}, 250);
			});
		}
	});

	QUnit.test("_rowsUpdated - Expand", async function(assert) {
		const aFiredReasons = [];
		const that = this;
		const oTable = await this.createTable();

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

	QUnit.test("_rowsUpdated - Collapse", async function(assert) {
		const aFiredReasons = [];
		const that = this;
		const oTable = await this.createTable();

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
		beforeEach: async function() {
			this.table = await createTable();
		},
		afterEach: async function() {
			await destroyTable(this.table);
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

		assert.deepEqual(this.table.getSelectedIndices(), [1], "setSelectedIndex(1) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "setSelectedIndex(1) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "setSelectedIndex(1) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "setSelectedIndex(1) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "setSelectedIndex(1) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "setSelectedIndex(1) - isIndexSelected(4) returns false");

		this.table.collapse(0);

		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0) - isIndexSelected(2) returns false");

		this.table.expand(0);

		assert.deepEqual(this.table.getSelectedIndices(), [], "expand(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "expand(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "expand(0) - isIndexSelected(4) returns false");

		this.table.addSelectionInterval(1, 2);

		assert.deepEqual(this.table.getSelectedIndices(), [2], "addSelectionInterval(1, 2) - getSelectedIndices returns [2]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "addSelectionInterval(1, 2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "addSelectionInterval(1, 2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "addSelectionInterval(1, 2) - isIndexSelected(2) returns true");
		assert.deepEqual(this.table.isIndexSelected(3), false, "addSelectionInterval(1, 2) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "addSelectionInterval(1, 2) - isIndexSelected(4) returns false");

		this.table.clearSelection();

		assert.deepEqual(this.table.getSelectedIndices(), [], "clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "clearSelection() - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "clearSelection() - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "clearSelection() - isIndexSelected(4) returns false");
	});

	QUnit.test("SelectionMode = Single (collapseRecursive=false)", function(assert) {
		const bBindingInfo = this.table.getBindingInfo("rows");

		bBindingInfo.parameters.collapseRecursive = false;
		this.table.bindRows(bBindingInfo);
		this.table.setSelectionMode(SelectionMode.Single);
		this.table.expand(0);

		this.table.setSelectedIndex(1);

		assert.deepEqual(this.table.getSelectedIndices(), [1], "setSelectedIndex(1) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "setSelectedIndex(1) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "setSelectedIndex(1) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "setSelectedIndex(1) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "setSelectedIndex(1) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "setSelectedIndex(1) - isIndexSelected(4) returns false");

		this.table.collapse(0);

		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0) - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "collapse(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "collapse(0) - isIndexSelected(4) returns false");

		this.table.expand(0);

		assert.deepEqual(this.table.getSelectedIndices(), [1], "expand(0) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), true, "expand(0) - isIndexSelected(1) returns true");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "expand(0) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		this.table.setSelectedIndex(2);

		assert.deepEqual(this.table.getSelectedIndices(), [2], "collapse(0), setSelectedIndex(2) - getSelectedIndices returns [1]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), setSelectedIndex(2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), setSelectedIndex(2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "collapse(0), setSelectedIndex(2) - isIndexSelected(2) returns true");

		this.table.expand(0);

		assert.deepEqual(this.table.getSelectedIndices(), [4], "expand(0) - getSelectedIndices returns [4]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "expand(0) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "expand(0) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "expand(0) - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "expand(0) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), true, "expand(0) - isIndexSelected(4) returns true");

		this.table.addSelectionInterval(1, 2);

		assert.deepEqual(this.table.getSelectedIndices(), [2], "addSelectionInterval(1, 2) - getSelectedIndices returns [2]");
		assert.deepEqual(this.table.isIndexSelected(0), false, "addSelectionInterval(1, 2) - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "addSelectionInterval(1, 2) - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), true, "addSelectionInterval(1, 2) - isIndexSelected(2) returns true");
		assert.deepEqual(this.table.isIndexSelected(3), false, "addSelectionInterval(1, 2) - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "addSelectionInterval(1, 2) - isIndexSelected(4) returns false");

		this.table.collapse(0);
		this.table.clearSelection();

		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0), clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0), clearSelection() - isIndexSelected(2) returns false");

		this.table.expand(0);

		assert.deepEqual(this.table.getSelectedIndices(), [], "collapse(0), clearSelection() - getSelectedIndices returns []");
		assert.deepEqual(this.table.isIndexSelected(0), false, "collapse(0), clearSelection() - isIndexSelected(0) returns false");
		assert.deepEqual(this.table.isIndexSelected(1), false, "collapse(0), clearSelection() - isIndexSelected(1) returns false");
		assert.deepEqual(this.table.isIndexSelected(2), false, "collapse(0), clearSelection() - isIndexSelected(2) returns false");
		assert.deepEqual(this.table.isIndexSelected(3), false, "collapse(0), clearSelection() - isIndexSelected(3) returns false");
		assert.deepEqual(this.table.isIndexSelected(4), false, "collapse(0), clearSelection() - isIndexSelected(4) returns false");
	});

	QUnit.module("Expand/Collapse", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable(TreeTable, {
				rows: {path: "/"},
				models: new TableQUnitUtils.createJSONModel(8),
				rowMode: new FixedRowMode({rowCount: 5})
			});
			const oBinding = this.oTable.getBinding();

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
			const mOperations = [];

			if (oTestConfig.prepare != null) {
				oTestConfig.prepare();
			}

			this.oBindingExpandSpy.resetHistory();
			this.oBindingCollapseSpy.resetHistory();
			this.oChangeEventSpy.resetHistory();

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
		const that = this;

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
		const that = this;

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
		const that = this;

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

		const iTotalRowCount = this.oTable._getTotalRowCount();
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
		const that = this;

		this.oTable.getRows()[0].expand();

		return this.oTable.qunit.whenRenderingFinished().then(function() {
			that.oTable.getRows()[0].collapse();
		}).then(this.oTable.qunit.whenRenderingFinished).then(function() {
			assert.strictEqual(that.oTable._getTotalRowCount(), 8, "Collapsed: Total row count");
			assert.notOk(that.oTable.isExpanded(0), "Collapsed: Expanded state");
		});
	});

	QUnit.test("Row#toggleExpandedState", function(assert) {
		const that = this;

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
		const that = this;

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
		const that = this;

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
		const that = this;

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

	QUnit.module("TreeBindingProxy", {
		beforeEach: function() {
			this.oTable = new TreeTable();
			this.oProxy = this.oTable._oProxy;
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Proxy Initialisation", function(assert) {
		const oTable = new TreeTable();
		assert.ok(oTable._oProxy, "TreeTable has a proxy object");
		assert.equal(oTable._oProxy._sAggregation, "rows", "Proxy has correct aggregation");
		assert.equal(oTable._oProxy._oControl, oTable, "Proxy has correct control associated");
		oTable.destroy();
	});

	QUnit.test("#isTreeBinding", function(assert) {
		const fnBindingInfoStub = sinon.stub(this.oTable, "getBindingInfo");
		const fnGetModelStub = sinon.stub(this.oTable, "getModel");
		const fnIsTreeBindingSpy = sinon.spy(this.oProxy, "isTreeBinding");

		fnBindingInfoStub.returns({model: "undefined"});
		fnGetModelStub.returns({
			isA: function(sName) {
				return false;
			}
		});

		assert.ok(this.oTable.isTreeBinding(), "TreeTable has a tree binding");
		assert.ok(fnIsTreeBindingSpy.calledOnce, "Proxy function is called");

		fnGetModelStub.returns({
			isA: function(sName) {
				return true;
			}
		});

		assert.notOk(this.oTable.isTreeBinding(), "TreeTable has no tree binding");
		assert.ok(fnIsTreeBindingSpy.calledTwice, "Proxy function is called");

		fnBindingInfoStub.restore();
		fnGetModelStub.restore();
		fnIsTreeBindingSpy.restore();
	});

	QUnit.test("Correct Proxy Calls", function(assert) {
		// Initialise spies
		const fnGetContextsSpy = sinon.spy(this.oProxy, "getContexts");
		const fnExpandSpy = sinon.spy(this.oProxy, "expand");
		const fnCollapseSpy = sinon.spy(this.oProxy, "collapse");
		const fnExpandToLevelSpy = sinon.spy(this.oProxy, "expandToLevel");
		const fnCollapseAllSpy = sinon.spy(this.oProxy, "collapseAll");
		const fnIsExpandedSpy = sinon.spy(this.oProxy, "isExpanded");
		const fnGetContextByIndexSpy = sinon.spy(this.oProxy, "getContextByIndex");

		// Stub oTable.getBinding
		const fnGetBinding = sinon.stub(this.oTable, "getBinding");
		fnGetBinding.returns({
			getMetadata: function() {
				return {
					getName: function() {
						return undefined;
					}
				};
			}
		});

		// _getContexts
		assert.equal(this.oTable._getContexts(0).length, 0, "TreeTable has no contexts");
		assert.ok(fnGetContextsSpy.calledOnce, "proxy#getContexts was called");

		// expand
		this.oTable.expand(0);
		assert.ok(fnExpandSpy.called, "proxy#expand was called");

		// collapse
		this.oTable.collapse(0);
		assert.ok(fnCollapseSpy.called, "proxy#collapse was called");

		// expandToLevel
		this.oTable.expandToLevel(0);
		assert.ok(fnExpandToLevelSpy.called, "proxy#expandToLevel was called");

		// collapseAll
		this.oTable.collapseAll();
		assert.ok(fnCollapseAllSpy.called, "proxy#collapseAll was called");

		// isExpanded
		this.oTable.isExpanded(0);
		assert.ok(fnIsExpandedSpy.called, "proxy#isExpanded was called");

		// getContextByIndex
		this.oTable.getContextByIndex(0);
		assert.ok(fnGetContextByIndexSpy.called, "proxy#getContextByIndex was called");

		// Restore spies and stubs
		fnGetContextsSpy.restore();
		fnExpandSpy.restore();
		fnCollapseSpy.restore();
		fnExpandToLevelSpy.restore();
		fnCollapseAllSpy.restore();
		fnIsExpandedSpy.restore();
		fnGetContextByIndexSpy.restore();

		fnGetBinding.restore();
	});
});