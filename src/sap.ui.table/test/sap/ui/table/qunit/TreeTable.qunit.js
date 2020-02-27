/*global QUnit */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/TreeTable",
	"sap/ui/table/Column",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/table/library"
], function(qutils, TableQUnitUtils, TreeTable, Column, TableUtils, JSONModel, library) {
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
				this.table.attachEventOnce("_rowsUpdated", function() {
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

	QUnit.test("Expand and collapse a row", function(assert) {
		var done = assert.async();
		var that = this;

		this.testAsync({
			act: function() {
				that.table.expand(0);
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 5, "Expanded: Row count is correct");
				assert.equal(that.table.isExpanded(0), true, "Expanded state is correct");
			}
		}).then(function() {
			that.testAsync({
				act: function() {
					that.table.collapse(0);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 3, "Collapsed: Row count is correct");
					assert.equal(that.table.isExpanded(0), false, "Expanded state is correct");
					done();
				}
			});
		});
	});

	QUnit.test("Expand and collapse a row synchronously", function(assert) {
		var done = assert.async();
		var that = this;

		this.testAsync({
			act: function() {
				that.table.setModel(new JSONModel(getData()));
				that.table.bindRows("/root");
				that.table.expand(0);
			},
			test: function() {
				assert.equal(that.table._getTotalRowCount(), 5, "Expanded: Row count is correct");
				assert.equal(that.table.isExpanded(0), true, "Expanded state is correct");
			}
		}).then(function() {
			that.testAsync({
				act: function() {
					that.table.setModel(new JSONModel(getData()));
					that.table.bindRows({
						path: "/root",
						parameters: {
							numberOfExpandedLevels: 1
						}
					});
					that.table.collapse(0);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 4, "Collapsed: Row count is correct");
					assert.equal(that.table.isExpanded(0), false, "Expanded state is correct");
					done();
				}
			});
		});
	});

	QUnit.test("Expand and collapse multiple rows", function(assert) {
		var that = this;
		var oBindingExpandSpy = this.spy(this.table.getBinding("rows"), "expand");
		var oBindingCollapseSpy = this.spy(this.table.getBinding("rows"), "collapse");

		for (var i = 3; i <= 15; i++) {
			this.table.getModel().getData().root[i] = {
				name: "item",
				description: "item description",
				0: {
					name: "subitem",
					description: "subitem description"
				}
			};
		}
		this.table.getModel().refresh();

		return new Promise(function(resolve) {
			that.table.attachEventOnce("_rowsUpdated", resolve);
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.expand([0, 1]);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 19, "Expanded: Row count is correct");
					assert.equal(that.table.isExpanded(0), true, "Expanded state of the first expanded row is correct");
					assert.equal(that.table.isExpanded(3), true, "Expanded state of the second expanded row is correct");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					that.table.collapse([0, 3]);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 16, "Collapsed: Row count is correct");
					assert.equal(that.table.isExpanded(0), false, "Expanded state of the first collapsed row is correct");
					assert.equal(that.table.isExpanded(1), false, "Expanded state of the second collapsed row is correct");
				}
			});
		}).then(function() {
			that.table.setFirstVisibleRow(4);
			return new Promise(function(resolve) {
				that.table.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oBindingExpandSpy.reset();
					that.table.expand([10, 9]);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 18, "Expanded: Row count is correct");
					assert.equal(that.table.isExpanded(9), true, "Expanded state of the first expanded row is correct");
					assert.equal(that.table.isExpanded(11), true, "Expanded state of the second expanded row is correct");
					assert.ok(oBindingExpandSpy.calledTwice, "Binding#expand was called twice");
					assert.ok(oBindingExpandSpy.getCall(0).calledWithExactly(10, true), "First call with index 10");
					assert.ok(oBindingExpandSpy.getCall(1).calledWithExactly(9, false), "Second call with index 9");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					oBindingCollapseSpy.reset();
					that.table.collapse([9, 11]);
				},
				test: function() {
					assert.equal(that.table._getTotalRowCount(), 16, "Collapsed: Row count is correct");
					assert.equal(that.table.isExpanded(9), false, "Expanded state of the first collapsed row is correct");
					assert.equal(that.table.isExpanded(10), false, "Expanded state of the second collapsed row is correct");
					assert.ok(oBindingCollapseSpy.calledTwice, "Binding#collapse was called twice");
					assert.ok(oBindingCollapseSpy.getCall(0).calledWithExactly(11, true), "First call with index 11");
					assert.ok(oBindingCollapseSpy.getCall(1).calledWithExactly(9, false), "Second call with index 9");
				}
			});
		}).then(function() {
			oBindingExpandSpy.restore();
			oBindingCollapseSpy.restore();
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

	QUnit.test("Selection Plugin", function(assert) {
		assert.ok(this.table._getSelectionPlugin().isA("sap.ui.table.plugins.BindingSelectionPlugin"), "BindingSelectionPlugin is initialized");
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

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
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

		return oTable.qunit.whenInitialRenderingFinished().then(function() {
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, true);
		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oTable.attachEvent("_rowsUpdated", function(oEvent) {
				aFiredReasons.push(oEvent.getParameter("reason"));
			});
			TableUtils.Grouping.toggleGroupHeader(oTable, 0, false);

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
		assert.deepEqual(this.table.getSelectedIndices(), [], "setSelectedIndex does not select in SelectionMode=\"None\"");

		this.table.setSelectionInterval(1, 1);
		assert.deepEqual(this.table.getSelectedIndices(), [], "setSelectionInterval does not select in SelectionMode=\"None\"");

		this.table.addSelectionInterval(1, 1);
		assert.deepEqual(this.table.getSelectedIndices(), [], "addSelectionInterval does not select in SelectionMode=\"None\"");
	});
});