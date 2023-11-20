/*global QUnit, sinon, oTable, oTreeTable*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/Core"
], function(TableQUnitUtils, TableUtils, DragDropInfo, CoreLibrary, Control, Device, jQuery, oCore) {
	"use strict";

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

		if (Device.browser.safari) {
			oJQueryDragEvent.originalEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});

			oJQueryDragEvent.originalEvent.dataTransfer = {
				dropEffect: "none",
				effectAllowed: "none",
				files: [],
				items: [],
				types: [],
				setDragImage: function() {},
				setData: function() {},
				getData: function() {}
			};
		} else {
			oJQueryDragEvent.originalEvent = new DragEvent(sDragEventType, {
				bubbles: true,
				cancelable: true,
				dataTransfer: new DataTransfer()
			});
		}

		return oJQueryDragEvent;
	}

	function triggerDragEvent(sType, oControl, mTestParameters) {
		var oEvent = createDragEvent(sType);
		oEvent._mTestParameters = mTestParameters;
		var oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			jQuery(oDomRef).trigger(oEvent);
		}
	}

	QUnit.module("Lifecycle", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		var oExtension = this.oTable._getDragAndDropExtension();
		assert.ok(oExtension, "Extension available in table");
	});

	QUnit.test("Destruction", function(assert) {
		var oExtension = this.oTable._getDragAndDropExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Common", {
		beforeEach: function() {
			this.oTable = TableQUnitUtils.createTable({
				columns: TableQUnitUtils.createTextColumn().setWidth("2000px"),
				rows: {path: "/"},
				models: TableQUnitUtils.createJSONModelWithEmptyRows(100)
			});

			this.oDragAndDropExtension = this.oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			return this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
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
		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + this.oTable.getId(), {
			persistent: "i should still exist after dragenter"
		});

		window.pageYOffset = 123;
		window.pageXOffset = 321;

		// Test without a drop control in the drag session.
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(this.oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + this.oTable.getId());
		assert.equal(mSessionData.verticalScrollEdge, null, "No drop control: No vertical scroll edge stored");
		assert.equal(mSessionData.horizontalScrollEdge, null, "No drop control: No horizontal scroll edge stored");
		assert.strictEqual(mSessionData.persistent, "i should still exist after dragenter",
			"No drop control: Other session data was not manipulated");

		// Test the session data added by the table in dragenter.
		oFakeEvent.dragSession.dropControl = new Control();
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter.call(this.oTable, oFakeEvent);

		mSessionData = oFakeEvent.dragSession.getComplexData("sap.ui.table-" + this.oTable.getId());
		var iPageYOffset = window.pageYOffset;
		var iPageXOffset = window.pageXOffset;
		var mVerticalScrollRect = this.oTable.getDomRef("table").getBoundingClientRect();
		var mHorizontalScrollRect = this.oTable.getDomRef("sapUiTableCtrlScr").getBoundingClientRect();

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
		window.pageXOffset = iOriginalPageXOffset;
		window.pageYOffset = iOriginalPageYOffset;
	});

	QUnit.test("Scrolling & Indicator size - dragover", function(assert) {
		var oFakeIndicator = jQuery("<div></div>").attr("style", "width: 0; height: 0; left: 0; right: 0");
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
		var iThreshold = 50;
		var that = this;

		function testScrolling(oEvent, iPageY, iPageX, iExpectedScrollPosition) {
			oEvent.pageY = iPageY;
			oEvent.pageX = iPageX;

			// Multiple dragover events must not increase the scroll speed.
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oFakeEvent);
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oFakeEvent);
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oFakeEvent);
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oFakeEvent);

			return Promise.race([
				that.oTable.qunit.whenVSbScrolled(),
				new Promise(function(resolve) {
					setTimeout(resolve, 500);
				})
			]).then(that.oTable.qunit.whenRenderingFinished).then(function() {
				var oScrollExtension = that.oTable._getScrollExtension();
				var oVSb = oScrollExtension.getVerticalScrollbar();
				var oHSb = oScrollExtension.getHorizontalScrollbar();
				assert.strictEqual(oVSb.scrollTop, iExpectedScrollPosition, "The vertical scroll position is correct: " + iExpectedScrollPosition);
				assert.strictEqual(oHSb.scrollLeft, iExpectedScrollPosition, "The horizontal scroll position is correct: " + iExpectedScrollPosition);
			});
		}

		function testIndicatorSize(oEvent, iExpectedWidth, iExpectedHeight, iExpectedLeft, iExpectedRight) {
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oEvent);

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

		oFakeEvent.dragSession.setComplexData("sap.ui.table-" + this.oTable.getId(), {
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
		return testScrolling(oFakeEvent, 300 - iThreshold - 1, 600 - iThreshold - 1, 0).then(function() {
			return testScrolling(oFakeEvent, 300, 600, 25);
		}).then(function() {
			return testScrolling(oFakeEvent, 300 + iThreshold, 600 + iThreshold, 75);
		}).then(function() {
			return testScrolling(oFakeEvent, 300 + iThreshold + 1, 600 + iThreshold + 1, 75);

			// Scroll up and to the left simultaneously.
		}).then(function() {
			return testScrolling(oFakeEvent, 600 + iThreshold + 1, 300 + iThreshold + 1, 75);
		}).then(function() {
			return testScrolling(oFakeEvent, 600 + iThreshold, 300 + iThreshold, 73);
		}).then(function() {
			return testScrolling(oFakeEvent, 600, 300, 48);
		}).then(function() {
			return testScrolling(oFakeEvent, 600 - iThreshold - 1, 300 - iThreshold - 1, 48);
		}).then(function() {
			return testScrolling(oFakeEvent, 600 - iThreshold, 300 - iThreshold, 0);
		}).then(function() {
			// If the drop target is the table, no scrolling should be performed.
			oFakeEvent.dragSession.dropControl = that.oTable;
			return testScrolling(oFakeEvent, 300 - iThreshold, 600 - iThreshold, 0);
		}).then(function() {
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

	QUnit.test("draggable attribute of row with data", function(assert) {
		assert.strictEqual(getRowHeader(0)[0].getAttribute("draggable"), null,
			"Row header does not have a draggable attribute");
		assert.strictEqual(getCell(0, 0).parent()[0].getAttribute("draggable"), "true",
			"Row in the fixed column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 0).parent()[0].getAttribute("data-sap-ui-draggable"), "true",
			"Row in the fixed column area does have a data-sap-ui-draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 1).parent()[0].getAttribute("draggable"), "true",
			"Row in the scrollable column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 1).parent()[0].getAttribute("data-sap-ui-draggable"), "true",
			"Row in the scrollable column area does have a data-sap-ui-draggable attribute with value \"true\"");
		assert.strictEqual(getRowAction(0)[0].getAttribute("draggable"), null,
			"Row action does not have a draggable attribute");
	});

	QUnit.test("draggable attribute of empty row", function(assert) {
		oTable.setShowNoData(false);
		oTable.unbindRows();
		oCore.applyChanges();

		assert.strictEqual(getRowHeader(0)[0].getAttribute("draggable"), null,
			"Row header does not have a draggable attribute");
		assert.strictEqual(getCell(0, 0).parent()[0].getAttribute("draggable"), "true",
			"Row in the fixed column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 0).parent()[0].getAttribute("data-sap-ui-draggable"), "true",
			"Row in the fixed column area does have a data-sap-ui-draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 1).parent()[0].getAttribute("draggable"), "true",
			"Row in the scrollable column area does have a draggable attribute with value \"true\"");
		assert.strictEqual(getCell(0, 1).parent()[0].getAttribute("data-sap-ui-draggable"), "true",
			"Row in the scrollable column area does have a data-sap-ui-draggable attribute with value \"true\"");
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
			sinon.stub(oTable.getRows()[0], "isEmpty").returns(true);

			test(getCell(0, 0).parent(), {sRowType: "Empty", sRowAreaType: "Fixed", iRowIndex: 0});
			test(getCell(0, 1).parent(), {sRowType: "Empty", sRowAreaType: "Scrollable", iRowIndex: 0});

			oTable.getRows()[0].isEmpty.restore();
		}

		function testGroupHeaderRow() {
			return fakeGroupRow(0).then(function() {
				test(getCell(0, 0).parent(), {sRowType: "Group header", sRowAreaType: "Fixed", iRowIndex: 0});
				test(getCell(0, 1).parent(), {sRowType: "Group header", sRowAreaType: "Scrollable", iRowIndex: 0});
			});
		}

		function testSumRow() {
			return fakeSumRow(0).then(function() {
				test(getCell(0, 0).parent(), {sRowType: "Sum", sRowAreaType: "Fixed", iRowIndex: 0});
				test(getCell(0, 1).parent(), {sRowType: "Sum", sRowAreaType: "Scrollable", iRowIndex: 0});
			});
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
					var oLastNonEmptyRow = this.getRows()[TableUtils.getNonEmptyRowCount(this) - 1];
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
			var iOriginalRowCount = oTable.getRowMode().getRowCount();

			oTable.getRowMode().setRowCount(10);
			oCore.applyChanges();

			Object.getOwnPropertyNames(DropPosition).forEach(function(sPropertyName) {
				oTable.getDragDropConfig()[0].setDropPosition(DropPosition[sPropertyName]);
				test({sRowType: "Empty", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 9});
			});

			// Restore
			oTable.getDragDropConfig()[0].setDropPosition(sOriginalDropPosition);
			oTable.getRowMode().setRowCount(iOriginalRowCount);
			oCore.applyChanges();
		}

		function testGroupHeaderRow() {
			return fakeGroupRow(1).then(function() {
				test({sRowType: "Group header", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Group header", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Group header", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Group header", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});
			});
		}

		function testSumRow() {
			return fakeSumRow(1).then(function() {
				test({sRowType: "Sum", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Sum", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Sum", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
				test({sRowType: "Sum", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});
			});
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
		oTable.getRowMode().setRowCount(2);
		oTable.setShowNoData(false);
		oCore.applyChanges();
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
		var oRow1ExpandSpy = sinon.spy(oTable.getRows()[0], "expand");
		var oRow2ExpandSpy = sinon.spy(oTable.getRows()[1], "expand");
		var oRow3ExpandSpy = sinon.spy(oTable.getRows()[2], "expand");

		oFakeEvent.target = getRowHeader(0)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.equal(oRow1ExpandSpy.callCount, 1, "Row header cell - Row#expand was called once on the correct row");

		oFakeEvent.target = oTable.getRows()[1].getCells()[0].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.equal(oRow2ExpandSpy.callCount, 1, "Data cell in fixed column - Row#expand was called once on the correct row");

		oRow1ExpandSpy.resetHistory();
		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.equal(oRow1ExpandSpy.callCount, 1, "Data cell in scrollable column - Row#expand was called once on the correct row");

		oFakeEvent.target = getRowAction(2)[0];
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.equal(oRow3ExpandSpy.callCount, 1, "Row action cell - Row#expand was called once on the correct row");

		oFakeEvent.dragSession = {
			getDropControl: function() {
				return oTable.getRows()[0].getCells()[1];
			}
		};
		oRow1ExpandSpy.resetHistory();
		oFakeEvent.target = oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(oTable, oFakeEvent);
		assert.ok(oRow1ExpandSpy.notCalled, "If the cell content is the drop target, Row#expand is not called");
	});

	QUnit.module("Columns", {
		beforeEach: function() {
			createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			this.oDDI = new DragDropInfo({
				sourceAggregation: "columns",
				targetAggregation: "columns",
				dropPosition: "Between"
			});

			oTable.addDragDropConfig(this.oDDI);
			oCore.applyChanges();
		},
		afterEach: function() {
			destroyTables();
			this.oDDI = null;
		}
	});

	QUnit.test("Draggable", function(assert) {
		var aColumns = oTable.getColumns();
		assert.notOk(this.oDDI.isDraggable(aColumns[1]), "Columns are not draggable by default");

		this.oDDI.bIgnoreMetadataCheck = true;
		assert.ok(this.oDDI.isDraggable(aColumns[1]), "Columns are now draggable");
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
		oTable.invalidate();
		oCore.applyChanges();

		// move non-fixed columns
		triggerDragEvent("dragstart", aColumns[1]);
		triggerDragEvent("dragenter", aColumns[2]);
		assert.equal(
			document.querySelector(".sapUiDnDIndicator").getBoundingClientRect().height,
			oTable.getDomRef("sapUiTableCnt").getBoundingClientRect().height,
			"Drop indicaator's height is set to Table height"
		);

		// force horizontal scrolling
		aColumns[2].setWidth("5000px");
		oCore.applyChanges();

		triggerDragEvent("dragenter", aColumns[2]);
		assert.equal(
			document.querySelector(".sapUiDnDIndicator").getBoundingClientRect().height,
			oTable.getDomRef("sapUiTableCnt").getBoundingClientRect().height - 16,
			"Drop indicaator is not visible on the horizontal scrollbar"
		);

		triggerDragEvent("drop", aColumns[2]);
	});

	QUnit.test("Draggable - TreeTable case", function(assert) {
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;
		var aColumns = oTreeTable.getColumns();

		oTreeTable.addDragDropConfig(this.oDDI);
		this.oDDI.bIgnoreMetadataCheck = true;

		oTreeTable.invalidate();
		oCore.applyChanges();

		for (var i = 0; i < aColumns.length; i++) {
			var oColumnRef = aColumns[i].getDomRef();
			assert.equal(oColumnRef.getAttribute("draggable"), i == 0 ? null : "true", "Column " + i + " has correct value for draggable");
			assert.equal(oColumnRef.getAttribute("data-sap-ui-draggable"), i == 0 ? null : "true", "Column " + i + " has correct value for data-sap-ui-draggable");
		}

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTreeTable, arguments);

			var mParams = oEvent._mTestParameters;

			if (mParams.bShouldMove) {
				assert.notOk(oEvent.isMarked("NonDroppable"), "Column movable: Event is not marked as NonDroppable");
			} else {
				assert.ok(oEvent.isMarked("NonDroppable"), "Column not movable: Event is marked as NonDroppable");
			}
		};

		triggerDragEvent("dragstart", aColumns[1]);
		triggerDragEvent("dragenter", aColumns[0], {bShouldMove: false});

		triggerDragEvent("dragstart", aColumns[1]);
		triggerDragEvent("dragenter", aColumns[2], {bShouldMove: true});

		triggerDragEvent("drop", aColumns[2]);
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});

	QUnit.test("Draggable - Fixed Columns", function(assert) {
		var fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;
		var aColumns = oTable.getColumns();
		oTable.setFixedColumnCount(2);

		this.oDDI.bIgnoreMetadataCheck = true;

		oTable.invalidate();
		oCore.applyChanges();

		for (var i = 0; i < aColumns.length; i++) {
			var oColumnRef = aColumns[i].getDomRef();
			assert.equal(oColumnRef.getAttribute("draggable"), i < 2 ? null : "true", "Column " + i + " has correct value for draggable");
			assert.equal(oColumnRef.getAttribute("data-sap-ui-draggable"), i < 2 ? null : "true", "Column " + i + " has correct value for data-sap-ui-draggable");
		}

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTable, arguments);

			var mParams = oEvent._mTestParameters;

			if (mParams.bShouldMove) {
				assert.notOk(oEvent.isMarked("NonDroppable"), "Column movable: Event is not marked as NonDroppable");
			} else {
				assert.ok(oEvent.isMarked("NonDroppable"), "Column not movable: Event is marked as NonDroppable");
			}
		};

		triggerDragEvent("dragstart", aColumns[2]);
		triggerDragEvent("dragenter", aColumns[1], {bShouldMove: false});

		triggerDragEvent("dragstart", aColumns[2]);
		triggerDragEvent("dragenter", aColumns[0], {bShouldMove: false});

		triggerDragEvent("dragstart", aColumns[2]);
		triggerDragEvent("dragenter", aColumns[3], {bShouldMove: true});

		triggerDragEvent("drop", aColumns[2]);
		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = fnOriginalDragEnterHandler;
	});
});