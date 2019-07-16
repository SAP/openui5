/*global QUnit, sinon, oTable */

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/TableExtension",
	"sap/ui/table/TableUtils",
	"sap/ui/Device",
	"sap/ui/table/library"
], function(TableQUnitUtils, TableExtension, TableUtils, Device, tableLibrary) {
	"use strict";

	// mapping of global function calls
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;

	QUnit.module("Initialization", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("_init", function(assert) {
		var done = assert.async();

		assert.expect(6);

		oTable._enableSynchronization().then(function(oSyncInterface) {
			var oExtension = oTable._getSyncExtension();

			assert.ok(oExtension != null, "SyncExtension available");
			assert.ok(oSyncInterface != null && oExtension.getInterface() === oSyncInterface, "Promise resolved with the SyncExtension interface");
			assert.notStrictEqual(oSyncInterface, oExtension, "The interface is not the extension itself");

			var iCount = 0;
			for (var i = 0; i < oTable.aDelegates.length; i++) {
				if (oTable.aDelegates[i].oDelegate === oExtension._delegate) {
					iCount++;
				}
			}
			assert.ok(iCount == 1, "Sync Delegate registered");

			done();
		});

		// The SyncExtension should be loaded asynchronously on demand.
		assert.strictEqual(undefined, oTable._getSyncExtension, "Before initialization, the extension getter does not exist");
		assert.ok(!TableExtension.isEnrichedWith(oTable, "sap.ui.table.TableSyncExtension"),
			"Before initialization, the table is not enriched with the SyncExtension");
	});

	QUnit.test("_debug", function(assert) {
		return oTable._enableSynchronization().then(function() {
			var oSyncExtension = oTable._getSyncExtension();
			assert.strictEqual(oSyncExtension._debug, undefined, "The SyncExtension has no _debug method");
		});
	});

	QUnit.module("Destruction", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("destroy", function(assert) {
		return oTable._enableSynchronization().then(function() {
			var oExtension = oTable._getSyncExtension();
			oTable.destroy();
			assert.equal(oExtension.getTable(), null, "Table cleared");
			assert.equal(oExtension._delegate, null, "Delegate cleared");
		});
	});

	QUnit.module("Synchronization hooks", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		},
		whenRowsUpdated: function(oTable) {
			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", function() {
					resolve();
				});
			});
		}
	});

	QUnit.test("No sync when initializing synchronization", function(assert) {
		return oTable._enableSynchronization().then(function(oSyncInterface) {
			oSyncInterface.rowCount = sinon.spy();
			oSyncInterface.rowSelection = sinon.spy();
			oSyncInterface.rowHover = sinon.spy();
			oSyncInterface.rowHeights = sinon.spy();
			oSyncInterface.innerVerticalScrollPosition = sinon.spy();
			oSyncInterface.layout = sinon.spy();

			assert.ok(oSyncInterface.rowCount.notCalled, "The row count was not synced");
			assert.ok(oSyncInterface.rowSelection.notCalled, "The row selection was not synced");
			assert.ok(oSyncInterface.rowHover.notCalled, "The row hover state was not synced");
			assert.ok(oSyncInterface.rowHeights.notCalled, "The row heights were not synced");
			assert.ok(oSyncInterface.innerVerticalScrollPosition.notCalled, "The inner vertical scroll position was not synced");
			assert.ok(oSyncInterface.layout.notCalled, "The layout was not synced");
		});
	});

	QUnit.test("Sync row count", function(assert) {
		var whenRowsUpdated = null;
		var oSyncInterface;
		var iAutoModeRowCount;
		var that = this;

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.rowCount = sinon.spy();

			oTable.setVisibleRowCount(4);
			assert.ok(oSyncInterface.rowCount.calledWithExactly(4), "Row count changed: The correct row count was synced");
			oTable.setVisibleRowCount(4);
			assert.ok(oSyncInterface.rowCount.calledWithExactly(4), "Row count not changed (but setter called): The correct row count was synced");
			assert.strictEqual(oSyncInterface.rowCount.callCount, 2, "The row count was synced 2 times");
			oSyncInterface.rowCount.reset();

			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.setVisibleRowCountMode(tableLibrary.VisibleRowCountMode.Auto);
			sap.ui.getCore().applyChanges();

		}).then(whenRowsUpdated).then(function() {
			iAutoModeRowCount = oTable.getRows().length;
			assert.ok(oSyncInterface.rowCount.calledWithExactly(iAutoModeRowCount),
				"Switched to VisibleRowCountMode=Auto: The correct row count was synced");
			assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
			oSyncInterface.rowCount.reset();

			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable._bVariableRowHeightEnabled = true;
			oTable.invalidate();
			sap.ui.getCore().applyChanges();

		}).then(whenRowsUpdated).then(function() {
			assert.ok(oSyncInterface.rowCount.calledWithExactly(iAutoModeRowCount + 1),
				"Variable row heights enabled: The correct row count was synced");
			assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
			oSyncInterface.rowCount.reset();

		}).then(function() {
			oTable.setVisibleRowCount(oTable.getVisibleRowCount() + 1);
			assert.ok(oSyncInterface.rowCount.notCalled, "Row count setter called in VisibleRowCountMode=Auto: The row count was not synced");

		}).then(function() {
			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.unbindRows();
			assert.ok(oSyncInterface.rowCount.getCall(0).calledWithExactly(0), "Unbind rows: The correct row count was synced");
			assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "Unbind rows: The row count was synced once");
			oSyncInterface.rowCount.reset();

		}).then(whenRowsUpdated).then(function() {
			oTable.bindRows({path: "/rows"});
		}).then(whenRowsUpdated).then(function() {
			assert.ok(oSyncInterface.rowCount.calledWithExactly(iAutoModeRowCount + 1), "Bind rows: The correct row count was synced");
			assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
		});
	});

	QUnit.test("Sync row selection", function(assert) {
		var whenRowsUpdated = null;
		var oSyncInterface;
		var that = this;

		oTable.clearSelection();

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.rowSelection = sinon.spy();

			oTable.setSelectedIndex(0);
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, true), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, false), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.reset();

		}).then(function() {
			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.unbindRows(); // No Binding, no rows, no selection.
			oTable.setSelectedIndex(1);
			assert.ok(oSyncInterface.rowSelection.notCalled, "No rows: The row selection was not synced");

		}).then(whenRowsUpdated).then(function() {
			oTable.setSelectedIndex(2);
			assert.ok(oSyncInterface.rowSelection.notCalled, "No rows: The row selection was not synced");

		}).then(function() {
			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.bindRows({path: "/rows"});
			oTable.setSelectedIndex(0);

		}).then(whenRowsUpdated).then(function() {
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, true), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, false), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.reset();

		}).then(function() {
			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.setFirstVisibleRow(1);
			oTable.setSelectedIndex(2);

			// After the selection update triggered by #setSelectedIndex.
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, false), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, true), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.reset();

		}).then(whenRowsUpdated).then(function() {
			// After the rows update triggered by #setFirstVisibleRow.
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, false), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, true), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.reset();

		}).then(function() {
			oTable.setSelectedIndex(2); // No change of selection.
			assert.ok(oSyncInterface.rowSelection.notCalled, "No selection change: The row selection was not synced");

		}).then(function() {
			oTable.addSelectionInterval(3, 3);
			oTable.clearSelection();

			if (oSyncInterface.rowSelection.callCount === 6) {
				assert.ok(true, "The row selection was synced 2 times for all 3 rows");
				// addSelectionInterval
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, false), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, true), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, true), "The correct selection state of row 3 was synced");
				// clearSelection
				assert.ok(oSyncInterface.rowSelection.getCall(3).calledWithExactly(0, false), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(4).calledWithExactly(1, false), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(5).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "The row selection should have been synced 2 times for all 3 rows");
			}
		});
	});

	QUnit.test("Sync row hover", function(assert) {
		return oTable._enableSynchronization().then(function(oSyncInterface) {
			oSyncInterface.rowHover = sinon.spy();

			oTable.setFirstVisibleRow(1);
			oTable.getRows()[0]._setHovered(true);
			oTable.getRows()[0]._setHovered(false);

			if (oSyncInterface.rowHover.callCount === 2) {
				assert.ok(true, "The row hover state was synced 2 times");
				assert.ok(oSyncInterface.rowHover.getCall(0).calledWithExactly(0, true), "Hovering of the row was synced");
				assert.ok(oSyncInterface.rowHover.getCall(1).calledWithExactly(0, false), "Unhovering of the row was synced");
			} else {
				assert.ok(false, "The row hover state should have been synced 2 times");
			}
		});
	});

	QUnit.test("Sync row heights", function(assert) {
		var whenRowsUpdated = null;
		var oSyncInterface;
		var that = this;

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.rowHeights = sinon.spy();

			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable.invalidate();
			sap.ui.getCore().applyChanges();

		}).then(whenRowsUpdated).then(function() {
			var iHeight = TableUtils.DefaultRowHeight.sapUiSizeCozy;
			if (oSyncInterface.rowHeights.callCount === 2) {
				assert.ok(true, "The row heights were synced 2 times");
				assert.ok(oSyncInterface.rowHeights.getCall(0).calledWithExactly([iHeight, iHeight, iHeight]),
					"The row heights were correctly synced");
				assert.ok(oSyncInterface.rowHeights.getCall(1).calledWithExactly([iHeight, iHeight, iHeight]),
					"The row heights were correctly synced");
			} else {
				assert.ok(false, "The row heights should have been synced 2 times");
			}
		});
	});

	QUnit.test("Sync inner vertical scroll position", function(assert) {
		var whenRowsUpdated = null;
		var oSyncInterface;
		var that = this;

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.innerVerticalScrollPosition = sinon.spy();

			whenRowsUpdated = that.whenRowsUpdated(oTable);
			oTable._bVariableRowHeightEnabled = true;
			oTable.invalidate();
			sap.ui.getCore().applyChanges();

		}).then(whenRowsUpdated).then(function() {
			oTable.getDomRef("tableCCnt").scrollTop = 23;
			return new Promise(function(resolve) {
				window.setTimeout(resolve, 0);
			});

		}).then(function() {
			assert.ok(oSyncInterface.innerVerticalScrollPosition.calledWithExactly(23), "The inner vertical scroll position was correctly synced");
			assert.strictEqual(oSyncInterface.innerVerticalScrollPosition.callCount, 1, "The inner vertical scroll position was synced once");
		});
	});

	QUnit.test("Sync layout", function(assert) {
		var afterRendering = null;
		var oSyncInterface;

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.layout = sinon.spy();

			afterRendering = function() {
				return new Promise(function(resolve) {
					oTable.addEventDelegate({
						onAfterRendering: function() {
							window.setTimeout(resolve, 0);
						}
					});
				});
			};
			oTable.invalidate();
			sap.ui.getCore().applyChanges();

		}).then(afterRendering).then(function() {
			assert.ok(oSyncInterface.layout.calledWithExactly({
				top: oTable.getDomRef("sapUiTableCnt").offsetTop,
				headerHeight: oTable.getDomRef().querySelector(".sapUiTableColHdrCnt").getBoundingClientRect().height,
				contentHeight: oTable.getDomRef("tableCCnt").getBoundingClientRect().height
			}), "The layout information was correctly synced");
			assert.strictEqual(oSyncInterface.layout.callCount, 1, "The layout information was synced once");
		});
	});

	QUnit.module("Synchronization methods", {
		beforeEach: function() {
			createTables();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Sync row selection", function(assert) {
		oTable.clearSelection();

		return oTable._enableSynchronization().then(function(oSyncInterface) {
			oTable.setFirstVisibleRow(1);
			oSyncInterface.syncRowSelection(1, true);
			assert.deepEqual(oTable.getSelectedIndices(), [2], "The correct index was selected");

			oSyncInterface.syncRowSelection(1, true);
			assert.deepEqual(oTable.getSelectedIndices(), [2], "The selection should not change, if the same row is selected again");

			oTable.setFirstVisibleRow(0);
			oSyncInterface.syncRowSelection(2, false);
			assert.deepEqual(oTable.getSelectedIndices(), [], "The correct index was deselected");

			oTable.setSelectionMode(tableLibrary.SelectionMode.None);
			oSyncInterface.syncRowSelection(0, true);
			assert.deepEqual(oTable.getSelectedIndices(), [], "SelectionMode=None: No selection was performed");
		});
	});

	QUnit.test("Sync row hover", function(assert) {
		function isRowHovered(iIndex) {
			return oTable.getRows()[iIndex].getDomRef().classList.contains("sapUiTableRowHvr");
		}

		return oTable._enableSynchronization().then(function(oSyncInterface) {
			oTable.setFirstVisibleRow(1);
			oSyncInterface.syncRowHover(1, true);
			assert.ok(!isRowHovered(0), "The first rendered row is not hovered");
			assert.ok(isRowHovered(1), "The second rendered row is hovered");
			assert.ok(!isRowHovered(2), "The third rendered row is not hovered");

			oSyncInterface.syncRowHover(2, true);
			assert.ok(!isRowHovered(0), "The first rendered row is not hovered");
			assert.ok(isRowHovered(1), "The second rendered row is hovered");
			assert.ok(isRowHovered(2), "The third rendered row is hovered");

			oSyncInterface.syncRowHover(1, false);
			assert.ok(!isRowHovered(0), "The first rendered row is not hovered");
			assert.ok(!isRowHovered(1), "The second rendered row is not hovered");
			assert.ok(isRowHovered(2), "The third rendered row is hovered");
		});
	});

	QUnit.test("Register vertical scrolling", function(assert) {
		var Div1 = document.createElement("div");
		var Div2 = document.createElement("div");
		var Div3 = document.createElement("div");
		var iBaseRowHeight = oTable._getBaseRowHeight();
		var bOriginalPointerSupport = Device.support.pointer;
		var bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		function createWheelEvent(iScrollDelta, bHorizontal) {
			var oWheelEvent;

			if (typeof window.WheelEvent === "function") {
				oWheelEvent = new window.WheelEvent("wheel", {
					deltaX: bHorizontal ? iScrollDelta : 0,
					deltaY: bHorizontal ? 0 : iScrollDelta,
					deltaMode: 0,
					shiftKey: bHorizontal,
					bubbles: true,
					cancelable: true
				});
			} else { // IE
				oWheelEvent = document.createEvent("Event");
				oWheelEvent.deltaX = bHorizontal ? iScrollDelta : 0;
				oWheelEvent.deltaY = bHorizontal ? 0 : iScrollDelta;
				oWheelEvent.deltaMode = 0;
				oWheelEvent.shiftKey = bHorizontal;
				oWheelEvent.initEvent("wheel", true, true);
			}

			return oWheelEvent;
		}

		function createTouchStartEvent(oTargetElement) {
			var oTouchStartEvent;

			if (typeof window.Touch === "function") {
				var oTouchObject = new window.Touch({
					identifier: Date.now(),
					target: oTargetElement,
					pageX: 0,
					pageY: 0
				});

				oTouchStartEvent = new window.TouchEvent("touchstart", {
					bubbles: true,
					cancelable: true,
					touches: [oTouchObject]
				});
			} else { // Firefox, Edge, IE, PhantomJS
				oTouchStartEvent = document.createEvent("Event");
				oTouchStartEvent.touches = [
					{
						pageX: 0,
						pageY: 0
					}
				];
				oTouchStartEvent.initEvent("touchstart", true, true);
			}

			return oTouchStartEvent;
		}

		function createTouchMoveEvent(oTargetElement, iScrollDelta, bHorizontal) {
			var oTouchMoveEvent;

			iScrollDelta *= -1;

			if (typeof window.Touch === "function") {
				var oTouchObject = new window.Touch({
					identifier: Date.now(),
					target: oTargetElement,
					pageX: bHorizontal ? iScrollDelta : 0,
					pageY: bHorizontal ? 0 : iScrollDelta
				});

				oTouchMoveEvent = new window.TouchEvent("touchmove", {
					bubbles: true,
					cancelable: true,
					touches: [oTouchObject]
				});
			} else { // Firefox, Edge, IE, PhantomJS
				oTouchMoveEvent = document.createEvent("Event");
				oTouchMoveEvent.touches = [
					{
						pageX: bHorizontal ? iScrollDelta : 0,
						pageY: bHorizontal ? 0 : iScrollDelta
					}
				];
				oTouchMoveEvent.initEvent("touchmove", true, true);
			}

			return oTouchMoveEvent;
		}

		function scrollWithMouseWheel(oTargetElement, iScrollDelta) {
			oTargetElement.dispatchEvent(createWheelEvent(iScrollDelta, true));
			oTargetElement.dispatchEvent(createWheelEvent(iScrollDelta, false));
		}

		function scrollWithTouch(oTargetElement, iScrollDelta) {
			oTargetElement.dispatchEvent(createTouchStartEvent(oTargetElement));
			oTargetElement.dispatchEvent(createTouchMoveEvent(oTargetElement, iScrollDelta, true));
			oTargetElement.dispatchEvent(createTouchStartEvent(oTargetElement));
			oTargetElement.dispatchEvent(createTouchMoveEvent(oTargetElement, iScrollDelta, false));
		}

		function wait() {
			return new Promise(function(resolve) {
				setTimeout(resolve, 100);
			});
		}

		function assertScrollPositions(iVerticalScrollPosition) {
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();

			assert.strictEqual(oVSb.scrollTop, iVerticalScrollPosition, "The vertical scroll position is correct");
			assert.strictEqual(oHSb.scrollLeft, 0, "The horizontal scroll position is correct");
		}

		function resetScrollPositions() {
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();

			oVSb.scrollTop = 0;
			oHSb.scrollLeft = 0;
		}

		oTable.setFirstVisibleRow(0);

		return new Promise(function(resolve) {
			oTable.attachEventOnce("_rowsUpdated", resolve);
		}).then(function() {
			return oTable._enableSynchronization();
		}).then(function(oSyncInterface) {
			oSyncInterface.registerVerticalScrolling({
				wheelAreas: [Div1, Div2],
				touchAreas: [Div1, Div3]
			});
		}).then(function() {
			scrollWithMouseWheel(Div1, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(iBaseRowHeight);
		}).then(resetScrollPositions).then(wait).then(function() {
			scrollWithMouseWheel(Div2, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(iBaseRowHeight);
		}).then(resetScrollPositions).then(wait).then(function() {
			scrollWithMouseWheel(Div3, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(0);
		}).then(resetScrollPositions).then(wait).then(function() {
			scrollWithTouch(Div1, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(iBaseRowHeight);
		}).then(resetScrollPositions).then(wait).then(function() {
			scrollWithTouch(Div2, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(0);
		}).then(resetScrollPositions).then(wait).then(function() {
			scrollWithTouch(Div3, iBaseRowHeight);
		}).then(wait).then(function() {
			assertScrollPositions(iBaseRowHeight);
		}).then(function() {
			Device.support.pointer = bOriginalPointerSupport;
			Device.support.touch = bOriginalTouchSupport;
		});
	});

	QUnit.test("Place vertical scrollbar at", function(assert) {
		var Div = document.createElement("div");
		var oInternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
		var sInternalVSbId = oInternalVSb.getAttribute("id");
		var oTableInvalidate = sinon.spy(oTable, "invalidate");
		var oSyncInterface;

		Div.appendChild(document.createElement("div"));
		Div.appendChild(document.createElement("div"));
		document.getElementById("qunit-fixture").appendChild(Div);

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;

			// The table will be invalidated.
			oSyncInterface.placeVerticalScrollbarAt(Div);

			assert.ok(oTableInvalidate.calledOnce, "The table was invalidated");
			assert.strictEqual(Div.childElementCount, 1, "The container contains only one element");
			oTableInvalidate.reset();

			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});
		}).then(function() {
			var oExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			var sExternalVSbId = oExternalVSb.getAttribute("id");
			var oDomRef = oTable.getDomRef();

			assert.notEqual(oExternalVSb, oInternalVSb, "The new external and the old internal scrollbars are different elements");
			assert.strictEqual(sExternalVSbId, sInternalVSbId, "The external scrollbar has the same id as the old internal scrollbar");
			assert.equal(Div.firstElementChild, oExternalVSb, "The external scrollbar is placed in the correct container");
			assert.equal(oDomRef.querySelector(sInternalVSbId), null, "The table's DOM does not contain the vertical scrollbar");
			assert.ok(!oDomRef.classList.contains("sapUiTableVScr"), "The table's element does not contain the 'sapUiTableVScr' CSS class");

			// Invalidate the table and remove the external scrollbar from DOM. This simulates the situation where the parent of the table was
			// invalidated. The user of the synchronization is supposed to call placeVerticalScrollbarAt again in onAfterRendering. The table should
			// still have the reference to the external scrollbar in this situation and insert it back into the DOM.
			oTable.invalidate();
			oTableInvalidate.reset();
			Div.removeChild(oExternalVSb);

			sap.ui.getCore().applyChanges();

			return new Promise(function(resolve) {
				oTable.attachEventOnce("_rowsUpdated", resolve);
			});

		}).then(function() {
			var oExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			oSyncInterface.placeVerticalScrollbarAt(Div);

			assert.ok(oTableInvalidate.notCalled, "The table was not invalidated");
			assert.equal(Div.firstElementChild, oExternalVSb, "The external scrollbar is placed in the correct container");

			// Scroll the external scrollbar.
			oExternalVSb.scrollTop = oTable._getBaseRowHeight() * 2;
			return new Promise(function(resolve) {
				window.setTimeout(resolve, 100);
			});

		}).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 2, "Scrolling the external scrollbar correctly changes the table's first visible row");

			var oOldExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			Div.removeChild(oOldExternalVSb);
			oSyncInterface.placeVerticalScrollbarAt(Div);

			assert.ok(oTableInvalidate.notCalled, "The table was not invalidated");
			assert.equal(Div.firstElementChild, oOldExternalVSb, "The new external and the old external scrollbars are the same elements");

			return new Promise(function(resolve) {
				window.setTimeout(resolve, 100);
			});

		}).then(function() {
			var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			assert.strictEqual(oVSb.scrollTop, oTable._getBaseRowHeight() * 2, "The scrollbar has the correct scroll position");

			document.getElementById("qunit-fixture").removeChild(Div);
		});
	});

	QUnit.test("Render horizontal scrollbar", function(assert) {
		var Div = document.createElement("div");

		Div.style.width = "0px";
		document.getElementById("qunit-fixture").appendChild(Div);

		return oTable._enableSynchronization().then(function(oSyncInterface) {
			var oRenderManager = sap.ui.getCore().createRenderManager();
			oSyncInterface.renderHorizontalScrollbar(oRenderManager, "hsbid", 100);
			oRenderManager.flush(Div);

			var oHSb = Div.firstElementChild;
			assert.strictEqual(Div.childElementCount, 1, "One element was rendered");
			assert.strictEqual(oHSb.getAttribute("id"), "hsbid", "The rendered element has the correct id");
			assert.strictEqual(oHSb.scrollWidth - oHSb.clientWidth, 100, "The rendered element has the correct scroll range");

			document.getElementById("qunit-fixture").removeChild(Div);
		});
	});
});