/*global QUnit, sinon, oTable, oTreeTable*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/library",
	"sap/ui/Device",
	"sap/ui/core/Control"
], function(TableQUnitUtils, TableUtils, DragDropInfo, CoreLibrary, Device, Control) {
	"use strict";

	// mapping of globals
	var createTables = window.createTables;
	var destroyTables = window.destroyTables;
	var initRowActions = window.initRowActions;
	var getRowHeader = window.getRowHeader;
	var getCell = window.getCell;
	var getRowAction = window.getRowAction;
	var fakeGroupRow = window.fakeGroupRow;
	var fakeSumRow = window.fakeSumRow;

	var DropPosition = CoreLibrary.dnd.DropPosition;

	function createDragEvent(sDragEventType) {
		var oJQueryDragEvent = jQuery.Event(sDragEventType);
		var oNativeDragEvent;

		if (typeof Event === "function") {
			oNativeDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});
		} else { // IE, PhantomJS
			oNativeDragEvent = document.createEvent("Event");
			oNativeDragEvent.initEvent(sDragEventType, true, true);
		}

		// Fake the DataTransfer object. This is the only cross-browser solution.
		oNativeDragEvent.dataTransfer = {
			dropEffect: "none",
			effectAllowed: "none",
			files: [],
			items: [],
			types: [],
			setDragImage: function() {},
			setData: function() {},
			getData: function() {}
		};

		oJQueryDragEvent.originalEvent = oNativeDragEvent;

		return oJQueryDragEvent;
	}

	function triggerDragEvent(sType, oControl) {
		var oEvent = createDragEvent(sType);
		var oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oEvent);
		}
	}

	QUnit.module("Common", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("Drag session data", function(assert) {
		var oFakeEvent = {
			dragSession: {
				mData: {},
				setComplexData: function(sId, oData) {
					this.mData[sId] = oData;
				},
				getComplexData: function(sId) {
					return this.mData[sId];
				},
				getDragControl: function() {
					return this.dragControl;
				},
				getDropControl: function() {
					return this.dropControl;
				}
			}
		};
		var mSessionData;
		var iOriginalPageXOffset = window.pageXOffset;
		var iOriginalPageYOffset = window.pageYOffset;

		// Prepare for all tests.
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			persistent: "i should still exist after dragenter"
		});

		if (!Device.browser.msie) {
			window.pageYOffset = 123;
			window.pageXOffset = 321;
		}

		// Test without a drop control in the drag session.
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId());
		assert.equal(mSessionData.verticalScrollEdge, null, "No drop control: No vertical scroll edge stored");
		assert.equal(mSessionData.horizontalScrollEdge, null, "No drop control: No horizontal scroll edge stored");
		assert.strictEqual(mSessionData.persistent, "i should still exist after dragenter",
			"No drop control: Other session data was not manipulated");

		// Test the session data added by the table in dragenter.
		oFakeEvent.dragSession.dropControl = new Control();
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId());
		var iPageYOffset = window.pageYOffset;
		var iPageXOffset = window.pageXOffset;
		var mVerticalScrollRect = oTable.getDomRef("table").getBoundingClientRect();
		var mHorizontalScrollRect = oTable.getDomRef("sapUiTableCtrlScr").getBoundingClientRect();

		assert.deepEqual(mSessionData.verticalScrollEdge, {
			bottom: mVerticalScrollRect.bottom + iPageYOffset,
			top: mVerticalScrollRect.top + iPageYOffset
		}, "The vertical scroll edge is stored in the drag session");

		assert.deepEqual(mSessionData.horizontalScrollEdge, {
			left: mHorizontalScrollRect.left + iPageXOffset,
			right: mHorizontalScrollRect.right + iPageXOffset
		}, "The horizontal scroll edge is stored in the drag session");

		assert.strictEqual(mSessionData.persistent, "i should still exist after dragenter",
			"Other session data was not manipulated");

		// Restore
		if (!Device.browser.msie) {
			window.pageXOffset = iOriginalPageXOffset;
			window.pageYOffset = iOriginalPageYOffset;
		}
	});

	QUnit.test("Scrolling & Indicator size - dragover", function(assert) {
		// Increase a column width to be able to test horizontal scrolling.
		oTable.getColumns()[1].setWidth("3000px");
		sap.ui.getCore().applyChanges();

		var oFakeIndicator = jQuery("<div style='width: 0; height: 0; left: 0; right: 0'></div>");
		var oFakeEvent = {
			dragSession: {
				mData: {},
				mConfig: {},
				setComplexData: function(sId, oData) {
					this.mData[sId] = oData;
				},
				getComplexData: function(sId) {
					return this.mData[sId];
				},
				getIndicator: function() {
					return oFakeIndicator[0];
				},
				getDropControl: function() {
					return this.dropControl;
				},
				setIndicatorConfig: function(mConfig) {
					this.mConfig = mConfig || {};
					if (this.dropControl) {
						oFakeIndicator.css(this.mConfig);
					}
				},
				getIndicatorConfig: function(mConfig) {
					return this.mConfig;
				}
			}
		};
		var oVSb = oTable._getScrollExtension().getVerticalScrollbar();
		var oHSb = oTable._getScrollExtension().getHorizontalScrollbar();
		var iScrollDistance = 32;
		var iThreshold = 50;
		var that = this;

		function testScrolling(oEvent, iPageY, iPageX, iExpectedScrollPosition) {
			oEvent.pageY = iPageY;
			oEvent.pageX = iPageX;

			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(oTable, oFakeEvent);

			assert.strictEqual(oVSb.scrollTop, iExpectedScrollPosition, "The vertical scroll position is correct");
			assert.strictEqual(oHSb.scrollLeft, iExpectedScrollPosition, "The horizontal scroll position is correct");
		}

		function testIndicatorSize(oEvent, iExpectedWidth, iExpectedHeight, iExpectedLeft, iExpectedRight) {
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(oTable, oEvent);

			var oIndicator = oEvent.dragSession.getIndicator();

			assert.strictEqual(oIndicator.style.width, iExpectedWidth + "px",
				"The style \"width\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.height, iExpectedHeight + "px",
				"The style \"height\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.left, iExpectedLeft + "px",
				"The style \"left\" of the indicator has the expected value");
			assert.strictEqual(oIndicator.style.right, iExpectedRight + "px",
				"The style \"right\" of the indicator has the expected value");
		}

		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + oTable.getId(), {
			verticalScrollEdge: {
				top: 600,
				bottom: 300
			},
			horizontalScrollEdge: {
				left: 300,
				right: 600
			}
		});

		// Scroll down and to the right simultaneously.
		testScrolling(oFakeEvent, 300 - iThreshold, 600 - iThreshold, iScrollDistance);
		testScrolling(oFakeEvent, 300 - iThreshold - 1, 600 - iThreshold - 1, iScrollDistance);
		testScrolling(oFakeEvent, 300, 600, iScrollDistance * 2);
		testScrolling(oFakeEvent, 300 + iThreshold, 600 + iThreshold, iScrollDistance * 3);
		testScrolling(oFakeEvent, 300 + iThreshold + 1, 600 + iThreshold + 1, iScrollDistance * 3);

		// Scroll up and to the left simultaneously.
		testScrolling(oFakeEvent, 600 + iThreshold + 1, 300 + iThreshold + 1, iScrollDistance * 3);
		testScrolling(oFakeEvent, 600 + iThreshold, 300 + iThreshold, iScrollDistance * 2);
		testScrolling(oFakeEvent, 600, 300, iScrollDistance);
		testScrolling(oFakeEvent, 600 - iThreshold - 1, 300 - iThreshold - 1, iScrollDistance);
		testScrolling(oFakeEvent, 600 - iThreshold, 300 - iThreshold, 0);

		// If the drop target is the table, no scrolling should be performed.
		oFakeEvent.dragSession.dropControl = oTable;
		testScrolling(oFakeEvent, 300 - iThreshold, 600 - iThreshold, 0);

		/* Resize and reposition the indicator */

		// If there is no drop target, there is no need to modify the indicator.
		oFakeEvent.dragSession.dropControl = null;
		oFakeEvent.dragSession.setIndicatorConfig({
			width: 500
		});
		testIndicatorSize(oFakeEvent, 0, 0, 0, 0);

		// If there is an indicator size in the drag session, the indicator should be modified accordingly.
		oFakeEvent.dragSession.dropControl = "a control which needs indicator modification";
		oFakeEvent.dragSession.setIndicatorConfig({
			width: 500,
			height: 50,
			left: 33,
			right: 222
		});
		testIndicatorSize(oFakeEvent, 500, 50, 33, 222);

		// Not all controls need indicator modifications, so there might be no indicator size. In this case the indicator should not be modified.
		oFakeEvent.dragSession.setIndicatorConfig();
		testIndicatorSize(oFakeEvent, 500, 50, 33, 222);
	});

	QUnit.module("Rows", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			oTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "rows",
				targetAggregation: "rows"
			}));

			initRowActions(oTable, 1, 1);

			oTreeTable.addDragDropConfig(new DragDropInfo({
				sourceAggregation: "rows",
				targetAggregation: "rows",
				targetElement: oTable
			}));
		},
		afterEach: function() {
			destroyTables();
		}
	});

	QUnit.test("draggable attribute", function(assert) {
		assert.strictEqual(getRowHeader(0)[0].getAttribute("draggable"), null,
			"Row header does not have a draggable attribute");
		assert.strictEqual(getCell(0, 0).parent()[0].getAttribute("draggable"), "true",
			"Row in the fixed column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 1).parent()[0].getAttribute("draggable"), "true",
			"Row in the scrollable column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getRowAction(0)[0].getAttribute("draggable"), null,
			"Row action does not have a draggable attribute");
	});

	QUnit.test("Draggable", function(assert) {
		var fnOriginalDragStartHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragstart;

		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = function(oEvent) {
			fnOriginalDragStartHandler.apply(oTable, arguments);

			var mParams = oEvent._mTestParameters;
			var sMessagePrefix = mParams.sRowType + " row - " + mParams.sRowAreaType + " area: ";

			if (mParams.sRowType === "Standard") {
				assert.ok(!oEvent.isDefaultPrevented(),
					sMessagePrefix + "The default action was not prevented");
				assert.deepEqual(oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId()).draggedRowContext,
					oTable.getContextByIndex(mParams.iRowIndex),
					sMessagePrefix + "The dragged row context was stored in the drag session");
			} else {
				assert.ok(oEvent.isDefaultPrevented(),
					sMessagePrefix + "The default action was prevented");
				assert.equal(oEvent.dragSession.getComplexData("sap.ui.table-" + oTable.getId()), null,
					sMessagePrefix + "No drag session data was stored in the drag session");
			}
		};

		function test($Target, mTestParameters) {
			var oDragStartEvent = createDragEvent("dragstart");
			oDragStartEvent._mTestParameters = mTestParameters;
			$Target.trigger(oDragStartEvent);
		}

		function testStandardRow() {
			test(getCell(0, 0).parent(), {sRowType: "Standard", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Standard", sRowAreaType: "Scrollable", iRowIndex: 0});
		}

		function testEmptyRow() {
			sinon.stub(oTable, "getContextByIndex", function(iIndex) {
				if (iIndex === 0) {
					return null;
				}
				return oTable.constructor.prototype.getContextByIndex.apply(oTable, arguments);
			});

			test(getCell(0, 0).parent(), {sRowType: "Empty", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Empty", sRowAreaType: "Scrollable", iRowIndex: 0});

			oTable.getContextByIndex.restore();
		}

		function testGroupHeaderRow() {
			fakeGroupRow(0);

			test(getCell(0, 0).parent(), {sRowType: "Group header", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Group header", sRowAreaType: "Scrollable", iRowIndex: 0});
		}

		function testSumRow() {
			fakeSumRow(0);

			test(getCell(0, 0).parent(), {sRowType: "Sum", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Sum", sRowAreaType: "Scrollable", iRowIndex: 0});
		}

		testStandardRow();
		testEmptyRow();
		testGroupHeaderRow();
		testSumRow();

		// Restore
		this.oDragAndDropExtension._ExtensionDelegate.ondragstart = fnOriginalDragStartHandler;
	});

	QUnit.test("Droppable & Drag session data", function(assert) {
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTable, arguments);

			var mParams = oEvent._mTestParameters;
			var bDraggingOverItself = oEvent.dragSession.getDragControl() === oEvent.dragSession.getDropControl();
			var sDropPosition = oTable.getDragDropConfig()[0].getDropPosition();
			var sMessagePrefix = "[DropPosition=" + sDropPosition + "] " + mParams.sRowType + " row - ";

			if (bDraggingOverItself) {
				sMessagePrefix += " Dragging the row over its own " + mParams.sRowAreaType + " area: ";
			} else {
				sMessagePrefix += mParams.sRowAreaType + " area: ";
			}

			if ((mParams.sRowType === "Standard" && !bDraggingOverItself)
				|| (mParams.sRowType === "Empty" && sDropPosition !== DropPosition.On)) {

				assert.ok(!oEvent.isDefaultPrevented(), sMessagePrefix + "The default action was be prevented");

				var bVerticalScrollbarVisible = oTable._getScrollExtension().isVerticalScrollbarVisible();
				var mTableCntRect = oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();

				if (mParams.sRowType === "Empty") {
					var oLastNonEmptyRow = this.getRows()[TableUtils.getNonEmptyVisibleRowCount(this) - 1];
					assert.strictEqual(oEvent.dragSession.getDropControl(), oLastNonEmptyRow,
						sMessagePrefix + "The drop control was set to the last non-empty row");
				}

				assert.ok(!oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was not marked as \"NonDroppable\"");
				assert.deepEqual(oEvent.dragSession.getIndicatorConfig(), {
					width: mTableCntRect.width - (bVerticalScrollbarVisible ? 16 : 0),
					left: mTableCntRect.left + (oTable._bRtlMode && bVerticalScrollbarVisible ? 16 : 0)
				}, sMessagePrefix + "The correct indicator size was stored in the drag session");
			} else {
				assert.ok(oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was marked as \"NonDroppable\"");
				assert.equal(oEvent.dragSession.getIndicatorConfig(), null,
					sMessagePrefix + "The indicator size was not stored in the drag session");
			}
		};

		function test(mTestParameters, bTestDragOverItself) {
			function getTarget(iRowIndex) {
				switch (mTestParameters.sRowAreaType) {
					case "Header":
						return getRowHeader(iRowIndex);
					case "Fixed":
						return oTable.getRows()[iRowIndex].getCells()[0].$();
					case "Scrollable":
						return oTable.getRows()[iRowIndex].getCells()[1].$();
					case "Action":
						return getRowAction(iRowIndex).find(".sapUiTableActionIcon").first();
					default:
						return null;
				}
			}

			oTable.getRows()[mTestParameters.iFromRowIndex].$().trigger(createDragEvent("dragstart"));
			var oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			getTarget(mTestParameters.iToRowIndex).trigger(oDragEnterEvent);

			if (bTestDragOverItself) {
				oTable.getRows()[mTestParameters.iFromRowIndex].$().trigger(createDragEvent("dragstart"));
				oDragEnterEvent = createDragEvent("dragenter");
				oDragEnterEvent._mTestParameters = mTestParameters;
				getTarget(mTestParameters.iFromRowIndex).trigger(oDragEnterEvent);
			}
		}

		function testStandardRow() {
			test({sRowType: "Standard", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1}, true);
		}

		function testEmptyRow() {
			var sOriginalDropPosition = oTable.getDragDropConfig()[0].getDropPosition();
			var iVisibleRowCount = oTable.getVisibleRowCount();

			oTable.setVisibleRowCount(10);
			sap.ui.getCore().applyChanges();

			Object.getOwnPropertyNames(DropPosition).forEach(function(sPropertyName) {
				oTable.getDragDropConfig()[0].setDropPosition(DropPosition[sPropertyName]);
				test({sRowType: "Empty", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 9});
			});

			// Restore
			oTable.getDragDropConfig()[0].setDropPosition(sOriginalDropPosition);
			oTable.setVisibleRowCount(iVisibleRowCount);
			sap.ui.getCore().applyChanges();
		}

		function testGroupHeaderRow() {
			fakeGroupRow(1);

			test({sRowType: "Group header", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});
		}

		function testSumRow() {
			fakeSumRow(1);

			test({sRowType: "Sum", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});
		}

		testStandardRow();
		testEmptyRow();
		testGroupHeaderRow();
		testSumRow();

		// Restore
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});

	QUnit.test("Droppable with empty rows aggregation (NoData not shown)", function(assert) {
		var oClock = sinon.useFakeTimers();
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTable, arguments);

			var mParams = oEvent._mTestParameters;
			var sDropPosition = oTreeTable.getDragDropConfig()[0].getDropPosition();
			var sMessagePrefix = "[DropPosition=" + sDropPosition + "] " + mParams.sRowAreaType + " area: ";

			assert.ok(!oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was not marked as \"NonDroppable\"");
			assert.strictEqual(oEvent.dragSession.getDropControl(), oTable, sMessagePrefix + "The drop control was set to the table");
			assert.equal(oEvent.dragSession.getIndicatorConfig(), null,
				sMessagePrefix + "The indicator size was not stored in the drag session");
		};

		function test($Target, mTestParameters) {
			oTreeTable.getRows()[0].$().trigger(createDragEvent("dragstart"));
			var oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			$Target.trigger(oDragEnterEvent);
		}

		oTable.unbindRows();
		oTable.setVisibleRowCount(2);
		oTable.setShowNoData(false);
		sap.ui.getCore().applyChanges();
		oClock.tick(50);

		Object.getOwnPropertyNames(DropPosition).forEach(function(sPropertyName) {
			oTreeTable.getDragDropConfig()[0].setDropPosition(DropPosition[sPropertyName]);
			test(getRowHeader(1), {sRowAreaType: "Header"});
			test(oTable.getRows()[1].getCells()[0].$(), {sRowAreaType: "Fixed"});
			test(oTable.getRows()[1].getCells()[1].$(), {sRowAreaType: "Scrollable"});
			test(getRowAction(1).find(".sapUiTableActionIcon").first(), {sRowAreaType: "Action"});
		});

		// Restore
		oClock.restore();
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});

	QUnit.test("Expand rows - longdragover", function(assert) {
		var oFakeEvent = {
			dragSession: {
				getDropControl: function() {}
			},
			target: null
		};
		var oToggleGroupHeaderSpy = sinon.spy(TableUtils.Grouping, "toggleGroupHeader");

		oFakeEvent.target = getRowHeader(0)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 0, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = oTable.getRows()[1].getCells()[0].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 1, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 0, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.target = getRowAction(2)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.calledWith(oTable, 2, true), "TableUtils.Grouping.ToggleGroupHeader was called with the correct arguments");
		oToggleGroupHeaderSpy.reset();

		oFakeEvent.dragSession = {
			getDropControl: function() {
				return oTable.getRows()[0].getCells()[1];
			}
		};
		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oToggleGroupHeaderSpy.notCalled, "TableUtils.Grouping.ToggleGroupHeader was not called");

		oToggleGroupHeaderSpy.restore();
	});

	QUnit.module("Columns", {
		beforeEach: function() {
			createTables();

			this.oDDI = new DragDropInfo({
				sourceAggregation: "columns",
				targetAggregation: "columns",
				dropPosition: "Between"
			});

			oTable.addDragDropConfig(this.oDDI);
			sap.ui.getCore().applyChanges();
		},
		afterEach: function() {
			destroyTables();
			this.oDDI = null;
		}
	});

	QUnit.test("Draggable", function(assert) {
		var aColumns = oTable.getColumns();
		assert.notOk(this.oDDI.isDraggable(aColumns[0]), "Columns are not draggable by default");

		this.oDDI.bIgnoreMetadataCheck = true;
		assert.ok(this.oDDI.isDraggable(aColumns[0]), "Columns are now draggable");
	});

	QUnit.test("Droppable", function(assert) {
		var aColumns = oTable.getColumns();
		var oDragEnterEvent = createDragEvent("dragenter");
		oDragEnterEvent.target = aColumns[0].getDomRef();
		assert.notOk(this.oDDI.isDroppable(aColumns[0], oDragEnterEvent), "Columns are not droppable by default");

		this.oDDI.bIgnoreMetadataCheck = true;
		assert.ok(this.oDDI.isDroppable(aColumns[0], oDragEnterEvent), "Columns are now droppable");
	});

	QUnit.test("Indicator Size", function(assert) {
		var aColumns = oTable.getColumns();

		this.oDDI.bIgnoreMetadataCheck = true;
		oTable.rerender();

		triggerDragEvent("dragstart", aColumns[0]);
		triggerDragEvent("dragenter", aColumns[1]);
		assert.equal(
			document.querySelector(".sapUiDnDIndicator").getBoundingClientRect().height,
			oTable.getDomRef("sapUiTableCnt").getBoundingClientRect().height,
			"Drop indicaator's height is set to Table height"
		);

		// force horizontal scrolling
		aColumns[2].setWidth("5000px");
		sap.ui.getCore().applyChanges();

		triggerDragEvent("dragenter", aColumns[2]);
		assert.equal(
			document.querySelector(".sapUiDnDIndicator").getBoundingClientRect().height,
			oTable.getDomRef("sapUiTableCnt").getBoundingClientRect().height - 16,
			"Drop indicaator is not visible on the horizontal scrollbar"
		);

		triggerDragEvent("drop", aColumns[2]);
	});
});