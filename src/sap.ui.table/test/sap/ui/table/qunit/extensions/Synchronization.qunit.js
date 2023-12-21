/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/core/RenderManager",
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/extensions/ExtensionBase",
	"sap/ui/table/rowmodes/Type",
	"sap/ui/table/rowmodes/Fixed",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/library",
	"sap/ui/Device"
], function(
	RenderManager,
	TableQUnitUtils,
	ExtensionBase,
	RowModeType,
	FixedRowMode,
	TableUtils,
	library,
	Device
) {
	"use strict";

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		// The synchronization extension should be loaded asynchronously on demand.
		assert.strictEqual(undefined, this.oTable._getSyncExtension, "Before initialization, the extension getter does not exist");
		assert.ok(!ExtensionBase.isEnrichedWith(this.oTable, "sap.ui.table.extensions.Synchronization"),
			"Before initialization, the table is not enriched with the synchronization extension");

		return this.oTable._enableSynchronization().then((oSyncInterface) => {
			const oExtension = this.oTable._getSyncExtension();
			let iDelegateCount = 0;

			assert.ok(oExtension, "Extension available in table");
			assert.ok(oSyncInterface != null && oExtension.getInterface() === oSyncInterface,
				"Promise resolved with the synchronization extension interface");
			assert.notStrictEqual(oSyncInterface, oExtension, "The interface is not the extension itself");

			for (let i = 0; i < this.oTable.aDelegates.length; i++) {
				if (this.oTable.aDelegates[i].oDelegate === oExtension._delegate) {
					iDelegateCount++;
				}
			}

			assert.equal(iDelegateCount, 1, "Sync Delegate registered");
		});
	});

	QUnit.test("Destruction", function(assert) {
		return this.oTable._enableSynchronization().then(() => {
			const oExtension = this.oTable._getSyncExtension();

			this.oTable.destroy();
			assert.ok(!oExtension.getTable(), "Reference to table removed");
			assert.ok(!oExtension._delegate, "Delegate cleared");
		});
	});

	QUnit.module("Synchronization hooks", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("No sync when initializing synchronization", function(assert) {
		const oTable = this.oTable;
		let oSyncInterface;

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;
			oSyncInterface.rowCount = sinon.spy();
			oSyncInterface.rowSelection = sinon.spy();
			oSyncInterface.rowHover = sinon.spy();
			oSyncInterface.rowHeights = sinon.spy();
			oSyncInterface.innerVerticalScrollPosition = sinon.spy();
			oSyncInterface.layout = sinon.spy();
		}).then(TableQUnitUtils.$wait(0)).then(function() {
			assert.ok(oSyncInterface.rowCount.notCalled, "The row count was not synced");
			assert.ok(oSyncInterface.rowSelection.notCalled, "The row selection was not synced");
			assert.ok(oSyncInterface.rowHover.notCalled, "The row hover state was not synced");
			assert.ok(oSyncInterface.rowHeights.notCalled, "The row heights were not synced");
			assert.ok(oSyncInterface.innerVerticalScrollPosition.notCalled, "The inner vertical scroll position was not synced");
			assert.ok(oSyncInterface.layout.notCalled, "The layout was not synced");
		});
	});

	QUnit.test("Sync row count", async function(assert) {
		const oSyncInterface = await this.oTable._enableSynchronization();

		oSyncInterface.rowCount = sinon.spy();

		this.oTable.getRowMode().setRowCount(4);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oSyncInterface.rowCount.calledWithExactly(4), "Row count changed: The correct row count was synced");
		assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
		oSyncInterface.rowCount.resetHistory();

		this.oTable.getRowMode().setRowCount(4);
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oSyncInterface.rowCount.notCalled, "Row count not changed (but setter called): The row count was not synced");
		oSyncInterface.rowCount.resetHistory();

		this.oTable.setRowMode(RowModeType.Auto);
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oSyncInterface.rowCount.calledWithExactly(0), "Switched to row mode Auto: A count of 0 was synced");
		assert.ok(oSyncInterface.rowCount.calledWithExactly(this.oTable.getRows().length),
			"Switched to row mode Auto: The correct row count was synced");
		assert.strictEqual(oSyncInterface.rowCount.callCount, 2, "The row count was synced 2 times");
		oSyncInterface.rowCount.resetHistory();

		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();

		assert.ok(oSyncInterface.rowCount.calledWithExactly(this.oTable.getRows().length),
			"Variable row heights enabled: The correct row count was synced");
		assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
		oSyncInterface.rowCount.resetHistory();

		this.oTable.unbindRows();
		assert.ok(oSyncInterface.rowCount.getCall(0).calledWithExactly(0), "Unbind rows: The correct row count was synced");
		assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "Unbind rows: The row count was synced once");
		oSyncInterface.rowCount.resetHistory();

		await this.oTable.qunit.whenRenderingFinished();
		this.oTable.bindRows({path: "/"});
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oSyncInterface.rowCount.calledWithExactly(this.oTable.getRows().length), "Bind rows: The correct row count was synced");
		assert.strictEqual(oSyncInterface.rowCount.callCount, 1, "The row count was synced once");
	});

	QUnit.test("Sync row selection", function(assert) {
		const oTable = this.oTable;
		let oSyncInterface;

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
			oSyncInterface.rowSelection.resetHistory();

		}).then(function() {
			oTable.unbindRows(); // No Binding, no rows, no selection.
			oTable.setSelectedIndex(1);
			assert.ok(oSyncInterface.rowSelection.notCalled, "No rows: The row selection was not synced");

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			oTable.setSelectedIndex(2);
			assert.ok(oSyncInterface.rowSelection.notCalled, "No rows: The row selection was not synced");

		}).then(function() {
			oTable.bindRows({path: "/"});
			oTable.setSelectedIndex(0);

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, true), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, false), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.resetHistory();

		}).then(function() {
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
			oSyncInterface.rowSelection.resetHistory();

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			// After the rows update triggered by #setFirstVisibleRow.
			if (oSyncInterface.rowSelection.callCount === 3) {
				assert.ok(true, "Selection changed: The selection of all 3 rows was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(0).calledWithExactly(0, false), "The correct selection state of row 1 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(1).calledWithExactly(1, true), "The correct selection state of row 2 was synced");
				assert.ok(oSyncInterface.rowSelection.getCall(2).calledWithExactly(2, false), "The correct selection state of row 3 was synced");
			} else {
				assert.ok(false, "Selection changed: The selection of all 3 rows should have been synced");
			}
			oSyncInterface.rowSelection.resetHistory();

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
		const oTable = this.oTable;

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

	QUnit.test("Sync row heights", async function(assert) {
		const oSyncInterface = await this.oTable._enableSynchronization();
		const iRowHeight = TableUtils.DefaultRowHeight.sapUiSizeCozy;

		oSyncInterface.rowHeights = sinon.spy();

		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();

		assert.equal(oSyncInterface.rowHeights.callCount, 2, "The row heights were synced 2 times");
		assert.ok(oSyncInterface.rowHeights.getCall(0).calledWithExactly([iRowHeight, iRowHeight, iRowHeight]),
			"The row heights were correctly synced");
		assert.ok(oSyncInterface.rowHeights.getCall(1).calledWithExactly([iRowHeight, iRowHeight, iRowHeight]),
			"The row heights were correctly synced");
	});

	QUnit.test("Sync inner vertical scroll position", async function(assert) {
		const oSyncInterface = await this.oTable._enableSynchronization();

		oSyncInterface.innerVerticalScrollPosition = sinon.spy();

		this.oTable._bVariableRowHeightEnabled = true;
		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oSyncInterface.innerVerticalScrollPosition.calledWithExactly(0),
			"After rendering: The inner vertical scroll position was correctly synced");
		assert.strictEqual(oSyncInterface.innerVerticalScrollPosition.callCount, 1,
			"After rendering: The inner vertical scroll position was synced once");
		oSyncInterface.innerVerticalScrollPosition.resetHistory();

		await Promise.all([
			this.oTable.qunit.scrollVSbTo(23),
			this.oTable.qunit.whenViewportScrolled()
		]);
		assert.ok(oSyncInterface.innerVerticalScrollPosition.calledWithExactly(23),
			"After scrolling: The inner vertical scroll position was correctly synced");
		assert.strictEqual(oSyncInterface.innerVerticalScrollPosition.callCount, 1,
			"After scrolling: The inner vertical scroll position was synced once");
	});

	QUnit.test("Sync layout", async function(assert) {
		const oSyncInterface = await this.oTable._enableSynchronization();

		oSyncInterface.layout = sinon.spy();

		this.oTable.invalidate();
		await this.oTable.qunit.whenRenderingFinished();
		assert.ok(oSyncInterface.layout.calledWithExactly({
			top: this.oTable.getDomRef("sapUiTableCnt").offsetTop,
			headerHeight: this.oTable.getDomRef().querySelector(".sapUiTableColHdrCnt").getBoundingClientRect().height,
			contentHeight: this.oTable.getDomRef("tableCCnt").getBoundingClientRect().height
		}), "The layout information was correctly synced");
		assert.strictEqual(oSyncInterface.layout.callCount, 1, "The layout information was synced once");
	});

	QUnit.module("Synchronization methods", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				rowMode: new FixedRowMode({
					rowCount: 3
				}),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(10)
			});
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Sync row selection", function(assert) {
		const oTable = this.oTable;

		return oTable._enableSynchronization().then(function(oSyncInterface) {
			oTable.setFirstVisibleRow(1);
			oSyncInterface.syncRowSelection(1, true);
			assert.deepEqual(oTable.getSelectedIndices(), [2], "The correct index was selected");

			oSyncInterface.syncRowSelection(1, true);
			assert.deepEqual(oTable.getSelectedIndices(), [2], "The selection should not change, if the same row is selected again");

			oTable.setFirstVisibleRow(0);
			oSyncInterface.syncRowSelection(2, false);
			assert.deepEqual(oTable.getSelectedIndices(), [], "The correct index was deselected");

			oTable.setSelectionMode(library.SelectionMode.None);
			oSyncInterface.syncRowSelection(0, true);
			assert.deepEqual(oTable.getSelectedIndices(), [], "SelectionMode=None: No selection was performed");
		});
	});

	QUnit.test("Sync row hover", function(assert) {
		const oTable = this.oTable;

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
		const oTable = this.oTable;
		let oSynchronizationInterface;
		const Div1 = document.createElement("div");
		const Div2 = document.createElement("div");
		const Div3 = document.createElement("div");
		const iBaseRowHeight = oTable._getBaseRowHeight();
		const bOriginalPointerSupport = Device.support.pointer;
		const bOriginalTouchSupport = Device.support.touch;

		Device.support.pointer = false;
		Device.support.touch = true;

		function createWheelEvent(iScrollDelta, bHorizontal) {
			return new window.WheelEvent("wheel", {
				deltaX: bHorizontal ? iScrollDelta : 0,
				deltaY: bHorizontal ? 0 : iScrollDelta,
				deltaMode: 0,
				shiftKey: bHorizontal,
				bubbles: true,
				cancelable: true
			});
		}

		function createTouchStartEvent(oTargetElement) {
			return TableQUnitUtils.createTouchEvent("touchstart", {
				touches: [
					TableQUnitUtils.createTouchObject({
						target: oTargetElement,
						identifier: Date.now(),
						pageX: 0,
						pageY: 0
					})
				]
			});
		}

		function createTouchMoveEvent(oTargetElement, iScrollDelta, bHorizontal) {
			iScrollDelta *= -1;

			return TableQUnitUtils.createTouchEvent("touchmove", {
				touches: [
					TableQUnitUtils.createTouchObject({
						target: oTargetElement,
						identifier: Date.now(),
						pageX: bHorizontal ? iScrollDelta : 0,
						pageY: bHorizontal ? 0 : iScrollDelta
					})
				]
			});
		}

		function scrollWithMouseWheel(oTargetElement, iScrollDelta) {
			return function() {
				oTargetElement.dispatchEvent(createWheelEvent(iScrollDelta, true));
				oTargetElement.dispatchEvent(createWheelEvent(iScrollDelta, false));

				return TableQUnitUtils.wait(100);
			};
		}

		function scrollWithTouch(oTargetElement, iScrollDelta) {
			return function() {
				oTargetElement.dispatchEvent(createTouchStartEvent(oTargetElement));
				oTargetElement.dispatchEvent(createTouchMoveEvent(oTargetElement, iScrollDelta, true));
				oTargetElement.dispatchEvent(createTouchStartEvent(oTargetElement));
				oTargetElement.dispatchEvent(createTouchMoveEvent(oTargetElement, iScrollDelta, false));

				return TableQUnitUtils.wait(100);
			};
		}

		function assertScrollPositions(iVerticalScrollPosition) {
			return function() {
				const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
				const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();

				assert.strictEqual(oVSb.scrollTop, iVerticalScrollPosition, "The vertical scroll position is correct");
				assert.strictEqual(oHSb.scrollLeft, 0, "The horizontal scroll position is correct");
			};
		}

		function resetScrollPositions() {
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			const oHSb = oTable._getScrollExtension().getHorizontalScrollbar();

			oVSb.scrollTop = 0;
			oHSb.scrollLeft = 0;

			return TableQUnitUtils.wait(100);
		}

		return oTable
			.qunit.whenRenderingFinished()
			.then(function() {
				return oTable._enableSynchronization().then(function(oSyncInterface) {
					oSynchronizationInterface = oSyncInterface;

					// Should not throw an error
					oSynchronizationInterface.registerVerticalScrolling();
					oSynchronizationInterface.registerVerticalScrolling({});
					oSynchronizationInterface.registerVerticalScrolling({wheelAreas: undefined});

					oSynchronizationInterface.registerVerticalScrolling({
						wheelAreas: [Div1, Div2],
						touchAreas: [Div1, Div3]
					});
				});
			})
			.then(scrollWithMouseWheel(Div1, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(scrollWithMouseWheel(Div2, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(scrollWithMouseWheel(Div3, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(scrollWithTouch(Div1, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(scrollWithTouch(Div2, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(scrollWithTouch(Div3, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(function() {
				oSynchronizationInterface.registerVerticalScrolling({
					wheelAreas: [Div1],
					touchAreas: [Div3]
				});
			})
			.then(scrollWithMouseWheel(Div1, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(scrollWithMouseWheel(Div2, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(scrollWithTouch(Div1, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(scrollWithTouch(Div3, iBaseRowHeight)).then(assertScrollPositions(iBaseRowHeight)).then(resetScrollPositions)
			.then(function() {
				oSynchronizationInterface.deregisterVerticalScrolling();
			})
			.then(scrollWithMouseWheel(Div1, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(scrollWithTouch(Div3, iBaseRowHeight)).then(assertScrollPositions(0)).then(resetScrollPositions)
			.then(function() {
				Device.support.pointer = bOriginalPointerSupport;
				Device.support.touch = bOriginalTouchSupport;
			});
	});

	QUnit.skip("Place vertical scrollbar at", function(assert) {
		const oTable = this.oTable;
		const Div = document.createElement("div");
		const oInternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
		const sInternalVSbId = oInternalVSb.getAttribute("id");
		let oExternalVSbContainer;
		const oTableInvalidate = sinon.spy(oTable, "invalidate");
		let oSyncInterface;

		Div.appendChild(document.createElement("div"));
		Div.appendChild(document.createElement("div"));
		document.getElementById("qunit-fixture").appendChild(Div);

		return oTable._enableSynchronization().then(function(_oSyncInterface) {
			oSyncInterface = _oSyncInterface;

			// The table will be invalidated.
			oSyncInterface.placeVerticalScrollbarAt(Div);
			oExternalVSbContainer = Div.firstChild;

			assert.ok(oTableInvalidate.calledOnce, "The table was invalidated");
			assert.strictEqual(Div.childElementCount, 1, "The container contains only one element");
			oTableInvalidate.resetHistory();

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			const oExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			const sExternalVSbId = oExternalVSb.getAttribute("id");
			const oDomRef = oTable.getDomRef();

			assert.notEqual(oExternalVSb, oInternalVSb, "The new external and the old internal scrollbars are different elements");
			assert.strictEqual(sExternalVSbId, sInternalVSbId, "The external scrollbar has the same id as the old internal scrollbar");
			assert.ok(Div.contains(oExternalVSb), "The external scrollbar is placed in the correct container");
			assert.equal(oDomRef.querySelector(sInternalVSbId), null, "The table's DOM does not contain the vertical scrollbar");
			assert.ok(!oDomRef.classList.contains("sapUiTableVScr"), "The table's element does not contain the 'sapUiTableVScr' CSS class");

			// Invalidate the table and remove the external scrollbar from DOM. This simulates the situation where the parent of the table was
			// invalidated. The user of the synchronization is supposed to call placeVerticalScrollbarAt again in onAfterRendering. The table should
			// still have the reference to the external scrollbar in this situation and insert it back into the DOM.
			oTable.invalidate();
			oTableInvalidate.resetHistory();
			Div.firstChild.remove();

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			const oExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			oSyncInterface.placeVerticalScrollbarAt(Div);

			assert.ok(oTableInvalidate.notCalled, "Insert existing scrollbar back into DOM: The table was not invalidated");
			assert.equal(Div.firstChild, oExternalVSbContainer, "Insert existing scrollbar back into DOM: Same element was inserted");
			assert.ok(Div.contains(oExternalVSb), "Insert existing scrollbar back into DOM: External scrollbar is placed in the correct container");

		}).then(oTable.qunit.whenRenderingFinished).then(function() {
			const oExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();

			// Scroll the external scrollbar.
			oExternalVSb.scrollTop = oTable._getBaseRowHeight() * 2;

		}).then(oTable.qunit.whenNextRowsUpdated).then(function() {
			assert.strictEqual(oTable.getFirstVisibleRow(), 2, "Scrolling the external scrollbar correctly changes the table's first visible row");

			const oOldExternalVSb = oTable._getScrollExtension().getVerticalScrollbar();
			Div.firstChild.remove();
			oSyncInterface.placeVerticalScrollbarAt(Div);

			assert.ok(oTableInvalidate.notCalled, "The table was not invalidated");
			assert.ok(Div.contains(oOldExternalVSb), "The new external and the old external scrollbars are the same elements");

		}).then(TableQUnitUtils.$wait(100)).then(function() {
			const oVSb = oTable._getScrollExtension().getVerticalScrollbar();
			assert.strictEqual(oVSb.scrollTop, oTable._getBaseRowHeight() * 2, "The scrollbar has the correct scroll position");

			Div.remove();
		});
	});

	QUnit.test("Render horizontal scrollbar", function(assert) {
		const oTable = this.oTable;
		const Div = document.createElement("div");

		Div.style.width = "0px";
		document.getElementById("qunit-fixture").appendChild(Div);

		return oTable._enableSynchronization().then(function(oSyncInterface) {
			const oRenderManager = new RenderManager().getInterface();
			oSyncInterface.renderHorizontalScrollbar(oRenderManager, "hsbid", 100);
			oRenderManager.flush(Div);

			const oHSb = Div.firstElementChild;
			assert.strictEqual(Div.childElementCount, 1, "One element was rendered");
			assert.strictEqual(oHSb.getAttribute("id"), "hsbid", "The rendered element has the correct id");
			assert.strictEqual(oHSb.scrollWidth - oHSb.clientWidth, 100, "The rendered element has the correct scroll range");

			document.getElementById("qunit-fixture").removeChild(Div);
		});
	});
});