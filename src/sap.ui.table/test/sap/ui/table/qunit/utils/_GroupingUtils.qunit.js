/*global QUnit, sinon, oTable, oTreeTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/Table",
	"sap/ui/table/TreeTable",
	"sap/ui/table/AnalyticalTable",
	"sap/ui/table/Row"
], function(TableQUnitUtils, TableUtils, Device, Table, TreeTable, AnalyticalTable, Row) {
	"use strict";

	// mapping of global function calls
	var oModel = window.oModel;
	var aFields = window.aFields;
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var getCell = window.getCell;
	var getColumnHeader = window.getColumnHeader;
	var getRowHeader = window.getRowHeader;
	var getRowAction = window.getRowAction;
	var getSelectAll = window.getSelectAll;
	var iNumberOfRows = window.iNumberOfRows;
	var initRowActions = window.initRowActions;
	var fakeSumRow = window.fakeSumRow;
	var fakeGroupRow = window.fakeGroupRow;

	// Shortcuts
	var Grouping = TableUtils.Grouping;

	QUnit.module("Misc", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Connection to TableUtils", function(assert) {
		assert.ok(!!TableUtils.Grouping, "Grouping namespace available");
		assert.ok(TableUtils.Grouping.TableUtils === TableUtils, "Dependency forwarding of TableUtils correct");
	});

	QUnit.module("Expand/Collapse", {
		beforeEach: function() {
			createTables();

			var oData = oTreeTable.getModel().getData();
			oData.tree.rows[2].rows[0].rows = [{A: "ASUB3_0", B: "BSUB3_0", C: "CSUB3_0", D: "DSUB3_0", E: "ESUB3_0"}];
			oTreeTable.getModel().setData(oData);

			oTreeTable.setVisibleRowCount(5);
			sap.ui.getCore().applyChanges();

			this.oBinding = oTreeTable.getBinding("rows");
			this.oExpandSpy = sinon.spy(this.oBinding, "expand");
			this.oCollapseSpy = sinon.spy(this.oBinding, "collapse");
			this.oToggleIndexSpy = sinon.spy(this.oBinding, "toggleIndex");
			this.oChangeEventSpy = sinon.spy();

			this.oBinding.attachChange(this.oChangeEventSpy);
		},
		afterEach: function() {
			destroyTables();
		},
		test: function(sMessage, oTestConfig, assert) {
			if (oTestConfig.prepare != null) {
				oTestConfig.prepare();
			}
			this.oExpandSpy.reset();
			this.oCollapseSpy.reset();
			this.oToggleIndexSpy.reset();
			this.oChangeEventSpy.reset();

			var bReturnValue = Grouping.toggleGroupHeader(oTreeTable, oTestConfig.indices, oTestConfig.expand);
			var mOperations = [];

			this.oExpandSpy.getCalls().forEach(function(oCall) {
				mOperations.push({operation: "expand", index: oCall.args[0], suppressChange: oCall.args[1]});
			});
			this.oCollapseSpy.getCalls().forEach(function(oCall) {
				mOperations.push({operation: "collapse", index: oCall.args[0], suppressChange: oCall.args[1]});
			});
			this.oToggleIndexSpy.getCalls().forEach(function(oCall) {
				// The binding calls expand/collapse inside toggleIndex. As these methods where not called by the table they should be ignored.
				mOperations = mOperations.filter(function(mOperation) {
					return !(mOperation.operation !== "toggle" && mOperation.index === oCall.args[0]);
				});

				mOperations.push({operation: "toggle", index: oCall.args[0]});
			});

			assert.strictEqual(bReturnValue, oTestConfig.expectedReturnValue, sMessage + ": Return value is correct");

			if (oTestConfig.expectedReturnValue != null) {
				assert.deepEqual(mOperations, oTestConfig.expectedOperations, sMessage + ": Operations were performed correctly");
				assert.ok(this.oChangeEventSpy.calledOnce, sMessage + ": Change event was fired once");
			} else {
				assert.deepEqual(mOperations, [], sMessage + ": No operations performed");
				assert.ok(this.oChangeEventSpy.notCalled, sMessage + ": Change event was not fired");
			}
		}
	});

	QUnit.test("Expand", function(assert) {
		[0, [0]].forEach(function(vIndexParameter) {
			this.test("Expand a collapsed row", {
				prepare: function() {
					oTreeTable.collapse(0);
					},
				indices: vIndexParameter,
				expand: true,
				expectedReturnValue: true,
				expectedOperations: [
					{operation: "expand", index: 0, suppressChange: false}
				]
			}, assert);
			this.test("Expand an expanded row", {
				indices: vIndexParameter,
				expand: true,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		[1, [1]].forEach(function(vIndexParameter) {
			this.test("Expand a leaf", {
				prepare: function() {
					oTreeTable.expand(0);
				},
				indices: vIndexParameter,
				expand: true,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		this.test("Expand multiple rows", {
			prepare: function() {
				/* Create the following state:
				 * 0 - Collapsed
				 * 1 - Expanded
				 * 2 -   Leaf
				 * 3 - Collapsed
				 * 4 - Collapsed
				 */
				oTreeTable.collapseAll();
				oTreeTable.expand(1);
			},
			indices: [1, 0, 3, -1, 2, 4, this.oBinding.getLength()],
			expand: true,
			expectedReturnValue: true,
			expectedOperations: [
				{operation: "expand", index: 4, suppressChange: true},
				{operation: "expand", index: 3, suppressChange: true},
				{operation: "expand", index: 0, suppressChange: false}
			]
		}, assert);
	});

	QUnit.test("Collapse", function(assert) {
		[0, [0]].forEach(function(vIndexParameter) {
			this.test("Collapse an expanded row", {
				prepare: function() {
					oTreeTable.expand(0);
				},
				indices: vIndexParameter,
				expand: false,
				expectedReturnValue: false,
				expectedOperations: [
					{operation: "collapse", index: 0, suppressChange: false}
				]
			}, assert);
			this.test("Collapse a collapsed row", {
				indices: vIndexParameter,
				expand: false,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		[1, [1]].forEach(function(vIndexParameter) {
			this.test("Collapse a leaf", {
				prepare: function() {
					oTreeTable.expand(0);
				},
				indices: vIndexParameter,
				expand: false,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		this.test("Collapse multiple rows", {
			prepare: function() {
				/* Create the following state:
				 * 0 - Collapsed
				 * 1 - Expanded
				 * 2 -   Leaf
				 * 3 - Expanded
				 * 4 -   Expanded
				 */
				oTreeTable.collapseAll();
				oTreeTable.expand(2);
				oTreeTable.expand(3);
				oTreeTable.expand(1);
			},
			indices: [1, 2, -1, 3, 0, 4, this.oBinding.getLength()],
			expand: false,
			expectedReturnValue: false,
			expectedOperations: [
				{operation: "collapse", index: 4, suppressChange: true},
				{operation: "collapse", index: 3, suppressChange: true},
				{operation: "collapse", index: 1, suppressChange: false}
			]
		}, assert);
	});

	QUnit.test("Toggle", function(assert) {
		[0, [0]].forEach(function(vIndexParameter) {
			this.test("Toggle a collapsed row", {
				prepare: function() {
					oTreeTable.getBinding("rows").collapse(0);
					},
				indices: vIndexParameter,
				expectedReturnValue: true,
				expectedOperations: [
					{operation: "toggle", index: 0}
				]
			}, assert);
			this.test("Toggle an expanded row", {
				indices: vIndexParameter,
				expectedReturnValue: false,
				expectedOperations: [
					{operation: "toggle", index: 0}
				]
			}, assert);
		}.bind(this));

		[1, [1]].forEach(function(vIndexParameter) {
			this.test("Toggle a leaf", {
				prepare: function() {
					oTreeTable.getBinding("rows").expand(0);
				},
				indices: vIndexParameter,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		this.test("Toggle multiple rows", {
			indices: [1, 2, 3],
			expectedReturnValue: null
		}, assert);
	});

	QUnit.test("Invalid parameters", function(assert) {
		[-1, [-1]].forEach(function(vIndexParameter) {
			this.test("Expand index < 0", {
				indices: vIndexParameter,
				expand: true,
				expectedReturnValue: null
			}, assert);
			this.test("Collapse index < 0", {
				indices: vIndexParameter,
				expand: false,
				expectedReturnValue: null
			}, assert);
			this.test("Toggle index < 0", {
				indices: vIndexParameter,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		var iTotalRowCount = this.oBinding.getLength();
		[iTotalRowCount, [iTotalRowCount]].forEach(function(vIndexParameter) {
			this.test("Expand index > maximum row index", {
				indices: vIndexParameter,
				expand: true,
				expectedReturnValue: null
			}, assert);
			this.test("Collapse index > maximum row index", {
				indices: vIndexParameter,
				expand: false,
				expectedReturnValue: null
			}, assert);
			this.test("Toggle index > maximum row index", {
				indices: vIndexParameter,
				expectedReturnValue: null
			}, assert);
		}.bind(this));

		delete oTreeTable.getBinding("rows").expand;
		this.test("The binding does not support expand/collapse", {
			indices: 0,
			expand: true,
			expectedReturnValue: null
		}, assert);

		oTreeTable.unbindRows();
		this.test("The rows are not bound", {
			indices: 0,
			expand: true,
			expectedReturnValue: null
		}, assert);

		window.oTreeTable = null;
		this.test("No table instance was passed", {
			indices: 0,
			expand: true,
			expectedReturnValue: null
		}, assert);
	});

	QUnit.test("toggleGroupHeaderByRef", function(assert) {
		var oToggleOpenStateEventSpy = sinon.spy(function(oEvent) {
			oToggleOpenStateEventSpy._mEventParameters = oEvent.mParameters;
		});
		oTreeTable.attachToggleOpenState(oToggleOpenStateEventSpy);

		function checkExpanded(sType, bExpectExpanded) {
			assert.equal(oTreeTable.getBinding("rows").isExpanded(0), bExpectExpanded,
				sType + ": First row " + (bExpectExpanded ? "" : "not ") + "expanded");
		}

		function doToggle(sType, sText, oRef, bForceExpand, bExpectExpanded, bExpectChange) {
			var iIndex = -1;
			var bExpanded = false;
			var bCalled = false;

			var fOnGroupHeaderChanged = oTreeTable._onGroupHeaderChanged;
			oTreeTable._onGroupHeaderChanged = function(iRowIndex, bIsExpanded) {
				iIndex = iRowIndex;
				bExpanded = bIsExpanded;
				bCalled = true;
				fOnGroupHeaderChanged.apply(oTreeTable, arguments);
			};

			var bRes = Grouping.toggleGroupHeaderByRef(oTreeTable, oRef, bForceExpand);

			assert.ok(bExpectChange && bRes || !bExpectChange && !bRes, sType + ": " + sText);

			if (bExpectChange) {
				assert.ok(bCalled, sType + ": _onGroupHeaderChanged called");
				assert.ok(bExpectExpanded === bExpanded, sType + ": _onGroupHeaderChanged provides correct expand state");
				assert.ok(iIndex == 0, sType + ": _onGroupHeaderChanged provides correct index");

				assert.ok(oToggleOpenStateEventSpy.calledOnce, "The toggleOpenState event was called once");
				assert.deepEqual(oToggleOpenStateEventSpy._mEventParameters, {
					id: oTreeTable.getId(),
					rowIndex: iIndex,
					rowContext: oTreeTable.getContextByIndex(iIndex),
					expanded: bExpanded
				}, "The toggleOpenState event was called with the correct parameters");
			} else {
				assert.ok(!bCalled, sType + ": _onGroupHeaderChanged not called");
				assert.ok(oToggleOpenStateEventSpy.notCalled, "The toggleOpenState event was not called");
			}

			checkExpanded(sType, bExpectExpanded);

			oToggleOpenStateEventSpy.reset();
		}

		function testWithValidDomRef(sType, oRef) {
			assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), sType + ": First row not expanded yet");
			doToggle(sType, "Nothing changed when force collapse", oRef, false, false, false);
			doToggle(sType, "Change when force expand", oRef, true, true, true);
			doToggle(sType, "Nothing changed when force expand again", oRef, true, true, false);
			doToggle(sType, "Changed when force collapse", oRef, false, false, true);
			doToggle(sType, "Change when toggle", oRef, null, true, true);
			doToggle(sType, "Change when toggle", oRef, null, false, true);
		}

		testWithValidDomRef("TreeIcon", jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"));

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		testWithValidDomRef("GroupIcon", jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"));

		doToggle("Wrong DomRef", "", oTreeTable.$(), true, false, false);
		doToggle("Wrong DomRef", "", oTreeTable.$(), false, false, false);
		doToggle("Wrong DomRef", "", oTreeTable.$(), null, false, false);
	});

	QUnit.module("Determine row type", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("isInSummaryRow", function(assert) {
		initRowActions(oTable, 1, 1);

		fakeSumRow(0);

		assert.ok(TableUtils.Grouping.isInSummaryRow(getCell(0, 0)), "DATACELL in sum row");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(getCell(1, 0)), "DATACELL in normal row");

		assert.ok(TableUtils.Grouping.isInSummaryRow(getRowHeader(0)), "ROWHEADER in sum row");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowHeader(1)), "ROWHEADER in normal row");

		assert.ok(TableUtils.Grouping.isInSummaryRow(getRowAction(0)), "ROWACTION in sum row");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(getRowAction(1)), "ROWACTION in normal row");

		assert.ok(!TableUtils.Grouping.isInSummaryRow(getColumnHeader(0)), "COLUMNHEADER");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(getSelectAll()), "COLUMNROWHEADER");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(null), "null");
		assert.ok(!TableUtils.Grouping.isInSummaryRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
	});

	QUnit.test("isInGroupHeaderRow", function(assert) {
		initRowActions(oTable, 1, 1);

		fakeGroupRow(0);

		assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getCell(0, 0)), "DATACELL in group row");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getCell(1, 0)), "DATACELL in normal row");

		assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(0)), "ROWHEADER in group row");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowHeader(1)), "ROWHEADER in normal row");

		assert.ok(TableUtils.Grouping.isInGroupHeaderRow(getRowAction(0)), "ROWACTION in group row");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getRowAction(1)), "ROWACTION in normal row");

		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getColumnHeader(0)), "COLUMNHEADER");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(getSelectAll()), "COLUMNROWHEADER");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(null), "null");
		assert.ok(!TableUtils.Grouping.isInGroupHeaderRow(jQuery.sap.domById("outerelement")), "Foreign DOM");
	});

	QUnit.module("Grouping Modes", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Mode Accessors", function(assert) {
		var oTbl = {};

		assert.ok(!Grouping.isGroupMode(oTbl), "Initial: No Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "Initial: No Tree Mode");
		assert.ok(!Grouping.getModeCssClass(oTbl), "Initial: No Mode Css Class");

		Grouping.setGroupMode(oTbl);

		assert.ok(Grouping.isGroupMode(oTbl), "Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "No Tree Mode");
		assert.strictEqual(Grouping.getModeCssClass(oTbl), "sapUiTableGroupMode", "Group Mode Css Class");

		Grouping.setTreeMode(oTbl);

		assert.ok(!Grouping.isGroupMode(oTbl), "No Group Mode");
		assert.ok(Grouping.isTreeMode(oTbl), "Tree Mode");
		assert.strictEqual(Grouping.getModeCssClass(oTbl), "sapUiTableTreeMode", "Tree Mode Css Class");

		Grouping.clearMode(oTbl);

		assert.ok(!Grouping.isGroupMode(oTbl), "Clear: No Group Mode");
		assert.ok(!Grouping.isTreeMode(oTbl), "Clear: No Tree Mode");
		assert.ok(!Grouping.getModeCssClass(oTbl), "Clear: No Mode Css Class");
	});

	QUnit.test("Table default modes", function(assert) {
		assert.ok(!Grouping.isGroupMode(oTable), "No Group Mode in sap.ui.table.Table");
		assert.ok(!Grouping.isTreeMode(oTable), "No Tree Mode in sap.ui.table.Table");

		var oColumn = oTable.getColumns()[0];
		oColumn.setSortProperty(aFields[0]);
		oTable.setEnableGrouping(true);
		oTable.setGroupBy(oColumn);
		sap.ui.getCore().applyChanges();

		assert.ok(Grouping.isGroupMode(oTable), "Group Mode in sap.ui.table.Table (in experimental Group mode)");
		assert.ok(!Grouping.isTreeMode(oTable), "No Tree Mode in sap.ui.table.Table (in experimental Group mode)");

		assert.ok(!Grouping.isGroupMode(oTreeTable), "No Group Mode in sap.ui.table.TreeTable");
		assert.ok(Grouping.isTreeMode(oTreeTable), "Tree Mode in sap.ui.table.TreeTable");

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		assert.ok(Grouping.isGroupMode(oTreeTable), "Group Mode in sap.ui.table.TreeTable (when useGroupMode=true)");
		assert.ok(!Grouping.isTreeMode(oTreeTable), "No Tree Mode in sap.ui.table.TreeTable (when useGroupMode=true)");

		var oAnaTable = new AnalyticalTable();

		assert.ok(Grouping.isGroupMode(oAnaTable), "Group Mode in sap.ui.table.AnalyticalTable");
		assert.ok(!Grouping.isTreeMode(oAnaTable), "No Tree Mode in sap.ui.table.AnalyticalTable");
	});

	QUnit.module("Rendering", {
		beforeEach: function() {
			createTables();
			oTreeTable.setVisibleRowCount(12);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("showGroupMenuButton", function(assert) {
		var bOrigDesktop = Device.system.desktop;

		Device.system.desktop = false;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / no desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / no desktop");
		assert.ok(Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / no desktop");

		sap.ui.Device.system.desktop = true;
		assert.ok(!Grouping.showGroupMenuButton(new Table()), "sap.ui.table.Table / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new TreeTable()), "sap.ui.table.TreeTable / desktop");
		assert.ok(!Grouping.showGroupMenuButton(new AnalyticalTable()), "sap.ui.table.AnalyticalTable / desktop");

		Device.system.desktop = bOrigDesktop;
	});

	QUnit.test("calcGroupIndent", function(assert) {
		var oRow = new Row();
		var oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 12, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 24, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 32, "Level 4");

		oRowGetLevel.returns(5);
		assert.strictEqual(Grouping.calcGroupIndent(oRow), 40, "Level 4");
	});

	QUnit.test("calcTreeIndent", function(assert) {
		var oRow = new Row();
		var oRowGetLevel = sinon.stub(oRow, "getLevel");

		oRowGetLevel.returns(1);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 0, "Level 1");

		oRowGetLevel.returns(2);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 17, "Level 2");

		oRowGetLevel.returns(3);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 34, "Level 3");

		oRowGetLevel.returns(4);
		assert.strictEqual(Grouping.calcTreeIndent(oRow), 51, "Level 4");
	});

	QUnit.test("Tree Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-col0").find(".sapUiTableTreeIcon");
				var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
				assert.equal($Icon.length, 1, "Tree Icon Available in first column - row " + (i + 1));
				var sClass = "sapUiTableTreeIconNodeClosed";
				var iLevel = 1;
				if (bSecondPass) {
					if (i === 0) {
						sClass = "sapUiTableTreeIconNodeOpen";
					} else if (i === 1) {
						sClass = "sapUiTableTreeIconLeaf";
						iLevel = 2;
					} else if (i === iCount - 1) {
						sClass = "sapUiTableTreeIconLeaf";
						iLevel = 0; // empty row
					}
				} else if (i === iCount - 1) {
					sClass = "sapUiTableTreeIconLeaf";
					iLevel = 0; // empty row
				}
				assert.ok($Icon.hasClass(sClass), "Icon has correct expand state: " + sClass);
				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var $Icon = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-col0").find(".sapUiTableTreeIcon");
						var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeOpen"), "No state class on icon after unbind: sapUiTableTreeIconNodeOpen");
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconLeaf"), "No state class on icon after unbind: sapUiTableTreeIconLeaf");
						assert.ok(!$Icon.hasClass("sapUiTableTreeIconNodeClosed"),
							"No state class on icon after unbind: sapUiTableTreeIconNodeClosed");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + (i + 1) + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + (i + 1) + " has no level in dom.");
					}
					done();
				};

				oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
			}
		};

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		Grouping.toggleGroupHeaderByRef(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rows-row0-col0").find(".sapUiTableTreeIcon"), true);
	});

	QUnit.test("Group Mode", function(assert) {
		var done = assert.async();
		var bSecondPass = false;

		assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows, "Row count before expand");
		assert.ok(!oTreeTable.getBinding("rows").isExpanded(0), "!Expanded");

		var fnHandler = function() {
			var iCount = iNumberOfRows + 1;

			if (bSecondPass) {
				iCount++;
				assert.ok(oTreeTable.getBinding("rows").isExpanded(0), "Expanded");
				assert.equal(oTreeTable._getTotalRowCount(), iNumberOfRows + 1, "Row count after expand");
			}

			for (var i = 0; i < iCount; i++) {
				var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
				var $RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i).parent();
				var $GroupHdr = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i + "-groupHeader");
				var iLevel = 1;
				var bExpectGroupHeaderClass = true;
				var bExpectExpanded = false;
				if (bSecondPass && i === 1) {
					bExpectGroupHeaderClass = false;
					iLevel = 2;
				} else if (bSecondPass && i === 0) {
					bExpectExpanded = true;
				} else if (i === iCount - 1) {
					bExpectGroupHeaderClass = false;
					iLevel = 0; // empty row
				}
				assert.ok($Row.hasClass("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass || !$Row.hasClass("sapUiTableGroupHeaderRow")
						  && !bExpectGroupHeaderClass, "Row " + (i + 1) + " is Group Header");
				assert.ok($RowHdr.hasClass("sapUiTableGroupHeaderRow") && bExpectGroupHeaderClass || !$RowHdr.hasClass("sapUiTableGroupHeaderRow")
						  && !bExpectGroupHeaderClass, "Row Header " + (i + 1) + " is Group Header");
				if (bExpectExpanded) {
					assert.ok($GroupHdr.hasClass("sapUiTableGroupIconOpen"), "Header has correct expand state");
				} else if (bExpectGroupHeaderClass) {
					assert.ok($GroupHdr.hasClass("sapUiTableGroupIconClosed"), "Header has correct expand state");
				} else {
					assert.ok(!$GroupHdr.hasClass("sapUiTableGroupIconClosed") && !$GroupHdr.hasClass("sapUiTableGroupIconOpen"),
						"Header has correct expand state");
				}

				assert.equal($Row.data("sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in data.");
				assert.equal($Row.attr("data-sap-ui-level"), iLevel, "Row " + (i + 1) + " has correct level in dom.");
			}

			if (bSecondPass) {
				var fnUnbindHandler = function() {
					for (var i = 0; i < 12; i++) {
						var $Row = jQuery.sap.byId(oTreeTable.getId() + "-rows-row" + i);
						assert.ok(!$Row.hasClass("sapUiTableGroupHeaderRow"), "No group headers any more after unbind");
						assert.ok(!$Row.data("sap-ui-level"), "Row " + i + " has no level in data.");
						assert.ok(!$Row.attr("data-sap-ui-level"), "Row " + i + " has no level in dom.");
					}
					done();
				};

				oTreeTable.attachEventOnce("_rowsUpdated", fnUnbindHandler);
				oTreeTable.unbindRows();
			}
		};

		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		fnHandler();

		bSecondPass = true;
		oTreeTable.attachEventOnce("_rowsUpdated", fnHandler);
		Grouping.toggleGroupHeaderByRef(oTreeTable, jQuery.sap.byId(oTreeTable.getId() + "-rowsel0"), true);
	});

	QUnit.test("GroupMenuButton", function(assert) {
		var i;
		var $RowHdr;
		var $Button;
		oTreeTable.setUseGroupMode(true);
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			$RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
			$Button = $RowHdr.find(".sapUiTableGroupMenuButton");
			assert.equal($Button.length, 0, "Row Header " + i + " has no GroupMenuButton");
		}

		sinon.stub(TableUtils.Grouping, "showGroupMenuButton").returns(true);
		oTreeTable.invalidate();
		sap.ui.getCore().applyChanges();

		for (i = 0; i < 12; i++) {
			$RowHdr = jQuery.sap.byId(oTreeTable.getId() + "-rowsel" + i);
			$Button = $RowHdr.find(".sapUiTableGroupMenuButton");
			assert.equal($Button.length, 1, "Row Header " + i + " has GroupMenuButton");
		}

		TableUtils.Grouping.showGroupMenuButton.restore();
	});

	QUnit.module("sap.ui.table.Table: Experimental Grouping", {
		beforeEach: function() {
			createTables();
			var oData = oModel.getData();
			for (var i = 0; i < iNumberOfRows; i++) {
				oData.rows[i][aFields[0]] = i < 4 ? "A" : "B";
			}
			oModel.setData(oData);
			oTable.getColumns()[0].setSortProperty(aFields[0]);
			oTable.setVisibleRowCount(12);
			oTable.setFixedColumnCount(0);
			oTable.setEnableGrouping(true);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
		},
		testAsync: function(mTestConfig) {
			return new Promise(function(resolve) {
				var oOnAfterRenderingDelegate = {
					onAfterRendering: onAfterRendering
				};

				function onRowsUpdated() {
					if (Device.browser.msie) {
						/* BCP: 1780405070 */
						window.setTimeout(function() {
							mTestConfig.test();
							resolve();
						}, 1000);
					} else {
						mTestConfig.test();
						resolve();
					}
				}

				function onAfterRendering() {
					oTable.removeEventDelegate(oOnAfterRenderingDelegate);
					oTable.attachEventOnce("_rowsUpdated", onRowsUpdated);
				}

				if (mTestConfig.onAfterRendering) {
					oTable.addEventDelegate(oOnAfterRenderingDelegate);
				} else {
					oTable.attachEventOnce("_rowsUpdated", onRowsUpdated);
				}

				mTestConfig.act();
			});
		}
	});

	QUnit.test("Activate Grouping", function(assert) {
		var done = assert.async();
		var oBinding = oTable.getBinding("rows");

		assert.equal(oBinding.getLength(), 8, "Row count before Grouping");

		var fnHandler = function() {
			for (var i = 0; i < iNumberOfRows + 2; i++) {
				if (i == 0 || i == 5) {
					assert.ok(getRowHeader(i).parent().hasClass("sapUiTableGroupHeaderRow"), "Row " + i + " is group header");
				} else {
					assert.ok(!getRowHeader(i).parent().hasClass("sapUiTableGroupHeaderRow"), "Row " + i + " is no group header");
				}
			}

			assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");
			done();
		};

		var fnHandlerProxy = function() {
			oTable.attachEventOnce("_rowsUpdated", fnHandler);
		};

		oTable.attachEventOnce("_rowsUpdated", fnHandlerProxy);

		oTable.setGroupBy(oTable.getColumns()[0]);
	});

	QUnit.test("Collapse / Expand", function(assert) {
		var done = assert.async();
		var oBinding = oTable.getBinding("rows");
		var that = this;

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before Grouping");

		this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after Grouping");
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0), false);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after Collapse");
					assert.ok(!oBinding.isExpanded(0), "!Expanded");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0), true);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after Expand");
					assert.ok(oBinding.isExpanded(0), "Expanded");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0));
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 6, "Row count after Toggle");
					assert.ok(!oBinding.isExpanded(0), "!Expanded");
				}
			});
		}).then(function() {
			return that.testAsync({
				act: function() {
					Grouping.toggleGroupHeaderByRef(oTable, getRowHeader(0));
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 10, "Row count after Toggle");
					assert.ok(oBinding.isExpanded(0), "Expanded");
				}
			});
		}).then(done);
	});

	QUnit.test("Reset Grouping", function(assert) {
		var done = assert.async();
		var that = this;

		assert.equal(oTable._getTotalRowCount(), 8, "Row count before grouping");

		this.testAsync({
			act: function() {
				oTable.setGroupBy(oTable.getColumns()[0]);
			},
			test: function() {
				assert.equal(oTable._getTotalRowCount(), 10, "Row count after grouping");
			},
			onAfterRendering: true
		}).then(function() {
			return that.testAsync({
				act: function() {
					oTable.setEnableGrouping(false);
				},
				test: function() {
					assert.equal(oTable._getTotalRowCount(), 8, "Row count after reset grouping");
				}
			});
		}).then(done);
	});
});