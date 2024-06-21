/*global QUnit, sinon, oTable, oTreeTable*/

sap.ui.define([
	"sap/ui/table/qunit/TableQUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/table/utils/TableUtils",
	"sap/ui/table/Row",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/library",
	"sap/ui/core/Control",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery"
], function(
	TableQUnitUtils,
	nextUIUpdate,
	TableUtils,
	Row,
	DragDropInfo,
	CoreLibrary,
	Control,
	Device,
	jQuery
) {
	"use strict";

	const createTables = window.createTables;
	const destroyTables = window.destroyTables;
	const DropPosition = CoreLibrary.dnd.DropPosition;

	function createDragEvent(sDragEventType) {
		let oDragEvent;

		if (Device.browser.safari) {
			oDragEvent = new Event(sDragEventType, {
				bubbles: true,
				cancelable: true
			});

			oDragEvent.dataTransfer = {
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
			oDragEvent = new DragEvent(sDragEventType, {
				bubbles: true,
				cancelable: true,
				dataTransfer: new DataTransfer()
			});
		}

		return oDragEvent;
	}

	function triggerDragEvent(sType, oControl, mTestParameters) {
		const oEvent = createDragEvent(sType);
		oEvent._mTestParameters = mTestParameters;
		const oDomRef = oControl.getDomRef ? oControl.getDomRef() : oControl;
		if (oDomRef) {
			oDomRef.dispatchEvent(oEvent);
		}
	}

	QUnit.module("Lifecycle", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("Initialization", function(assert) {
		const oExtension = this.oTable._getDragAndDropExtension();
		assert.ok(oExtension, "Extension available in table");
	});

	QUnit.test("Destruction", function(assert) {
		const oExtension = this.oTable._getDragAndDropExtension();

		this.oTable.destroy();
		assert.ok(!oExtension.getTable(), "Reference to table removed");
	});

	QUnit.module("Common", {
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
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
		const oFakeEvent = {
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
		let mSessionData;
		const iOriginalPageXOffset = window.pageXOffset;
		const iOriginalPageYOffset = window.pageYOffset;

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
		const iPageYOffset = window.pageYOffset;
		const iPageXOffset = window.pageXOffset;
		const mVerticalScrollRect = this.oTable.getDomRef("table").getBoundingClientRect();
		const mHorizontalScrollRect = this.oTable.getDomRef("sapUiTableCtrlScr").getBoundingClientRect();

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
		const oFakeIndicator = jQuery("<div></div>").attr("style", "width: 0; height: 0; left: 0; right: 0");
		const oFakeEvent = {
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
		const iThreshold = 50;
		const that = this;

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
				const oScrollExtension = that.oTable._getScrollExtension();
				const oVSb = oScrollExtension.getVerticalScrollbar();
				const oHSb = oScrollExtension.getHorizontalScrollbar();
				assert.strictEqual(oVSb.scrollTop, iExpectedScrollPosition, "The vertical scroll position is correct: " + iExpectedScrollPosition);
				assert.strictEqual(oHSb.scrollLeft, iExpectedScrollPosition, "The horizontal scroll position is correct: " + iExpectedScrollPosition);
			});
		}

		function testIndicatorSize(oEvent, iExpectedWidth, iExpectedHeight, iExpectedLeft, iExpectedRight) {
			that.oDragAndDropExtension._ExtensionDelegate.ondragover.call(that.oTable, oEvent);

			const oIndicator = oEvent.dragSession.getIndicator();

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
		beforeEach: async function() {
			this.oTable = await TableQUnitUtils.createTable({
				rows: "{/}",
				models: TableQUnitUtils.createJSONModelWithEmptyRows(9),
				columns: [
					TableQUnitUtils.createTextColumn(),
					TableQUnitUtils.createTextColumn()
				],
				fixedColumnCount: 1,
				dragDropConfig: new DragDropInfo({
					sourceAggregation: "rows",
					targetAggregation: "rows"
				}),
				rowActionTemplate: TableQUnitUtils.createRowAction(null),
				rowActionCount: 1
			});

			this.oDragAndDropExtension = this.oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			await this.oTable.qunit.whenRenderingFinished();
		},
		afterEach: function() {
			this.oTable.destroy();
		}
	});

	QUnit.test("draggable attribute of row with data", function(assert) {
		const oRowDomRefs = this.oTable.getRows()[0].getDomRefs();

		assert.strictEqual(oRowDomRefs.rowScrollPart.getAttribute("draggable"), "true", "Scrollable part");
		assert.strictEqual(oRowDomRefs.rowScrollPart.getAttribute("data-sap-ui-draggable"), "true", "Scrollable part");
		assert.strictEqual(oRowDomRefs.rowFixedPart.getAttribute("draggable"), "true", "Fixed part");
		assert.strictEqual(oRowDomRefs.rowFixedPart.getAttribute("data-sap-ui-draggable"), "true", "Fixed part");
		assert.notOk(oRowDomRefs.rowHeaderPart.getAttribute("draggable"), "Row header part");
		assert.notOk(oRowDomRefs.rowHeaderPart.getAttribute("data-sap-ui-draggable"), "Row header part");
		assert.notOk(oRowDomRefs.rowActionPart.getAttribute("draggable"), "Row action part");
		assert.notOk(oRowDomRefs.rowActionPart.getAttribute("data-sap-ui-draggable"), "Row action part");
	});

	QUnit.test("draggable attribute of empty row", function(assert) {
		const oRowDomRefs = this.oTable.getRows()[9].getDomRefs();

		assert.strictEqual(oRowDomRefs.rowScrollPart.getAttribute("draggable"), "true", "Scrollable part");
		assert.strictEqual(oRowDomRefs.rowScrollPart.getAttribute("data-sap-ui-draggable"), "true", "Scrollable part");
		assert.strictEqual(oRowDomRefs.rowFixedPart.getAttribute("draggable"), "true", "Fixed part");
		assert.strictEqual(oRowDomRefs.rowFixedPart.getAttribute("data-sap-ui-draggable"), "true", "Fixed part");
		assert.notOk(oRowDomRefs.rowHeaderPart.getAttribute("draggable"), "Row header part");
		assert.notOk(oRowDomRefs.rowHeaderPart.getAttribute("data-sap-ui-draggable"), "Row header part");
		assert.notOk(oRowDomRefs.rowActionPart.getAttribute("draggable"), "Row action part");
		assert.notOk(oRowDomRefs.rowActionPart.getAttribute("data-sap-ui-draggable"), "Row action part");
	});

	QUnit.test("Draggable", async function(assert) {
		this.oTable.addEventDelegate({
			ondragstart: (oEvent) => {
				const mParams = oEvent.originalEvent._mTestParameters;
				const sMessagePrefix = mParams.sRowType + " row - " + mParams.sRowAreaType + " area: ";

				if (mParams.sRowType === "Standard") {
					assert.ok(!oEvent.isDefaultPrevented(),
						sMessagePrefix + "The default action was not prevented");
					assert.deepEqual(oEvent.dragSession.getComplexData("sap.ui.table-" + this.oTable.getId()).draggedRowContext,
						this.oTable.getContextByIndex(mParams.iRowIndex),
						sMessagePrefix + "The dragged row context was stored in the drag session");
				} else {
					assert.ok(oEvent.isDefaultPrevented(),
						sMessagePrefix + "The default action was prevented");
					assert.equal(oEvent.dragSession.getComplexData("sap.ui.table-" + this.oTable.getId()), null,
						sMessagePrefix + "No drag session data was stored in the drag session");
				}
			}
		});

		const test = (oTarget, mTestParameters) => {
			const oDragStartEvent = createDragEvent("dragstart");
			oDragStartEvent._mTestParameters = mTestParameters;
			oTarget.dispatchEvent(oDragStartEvent);
		};

		const testStandardRow = () => {
			test(this.oTable.qunit.getDataCell(0, 0).parentElement, {sRowType: "Standard", sRowAreaType: "Fixed", iRowIndex: 0});
			test(this.oTable.qunit.getDataCell(0, 1).parentElement, {sRowType: "Standard", sRowAreaType: "Scrollable", iRowIndex: 0});
		};

		const testEmptyRow = () => {
			test(this.oTable.qunit.getDataCell(-1, 0).parentElement, {sRowType: "Empty", sRowAreaType: "Fixed", iRowIndex: 9});
			test(this.oTable.qunit.getDataCell(-1, 1).parentElement, {sRowType: "Empty", sRowAreaType: "Scrollable", iRowIndex: 9});
		};

		const testGroupHeaderRow = async () => {
			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
			await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.GroupHeader, expandable: true}]);

			test(this.oTable.qunit.getDataCell(0, 0).parentElement, {sRowType: "Group header", sRowAreaType: "Fixed", iRowIndex: 0});
			test(this.oTable.qunit.getDataCell(0, 1).parentElement, {sRowType: "Group header", sRowAreaType: "Scrollable", iRowIndex: 0});

			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Flat);
			await this.oTable.qunit.whenRenderingFinished();
		};

		const testSumRow = async () => {
			await this.oTable.qunit.setRowStates([{type: Row.prototype.Type.Summary}]);
			test(this.oTable.qunit.getDataCell(0, 0).parentElement, {sRowType: "Sum", sRowAreaType: "Fixed", iRowIndex: 0});
			test(this.oTable.qunit.getDataCell(0, 1).parentElement, {sRowType: "Sum", sRowAreaType: "Scrollable", iRowIndex: 0});
		};

		await testStandardRow();
		await testEmptyRow();
		await testGroupHeaderRow();
		await testSumRow();
	});

	QUnit.test("Droppable & Drag session data", async function(assert) {
		this.oTable.addEventDelegate({
			ondragenter: async (oEvent) => {
				const mParams = oEvent.originalEvent._mTestParameters;
				const bDraggingOverItself = oEvent.dragSession.getDragControl() === oEvent.dragSession.getDropControl();
				const sDropPosition = this.oTable.getDragDropConfig()[0].getDropPosition();
				let sMessagePrefix = "[DropPosition=" + sDropPosition + "] " + mParams.sRowType + " row - ";

				if (bDraggingOverItself) {
					sMessagePrefix += " Dragging the row over its own " + mParams.sRowAreaType + " area: ";
				} else {
					sMessagePrefix += mParams.sRowAreaType + " area: ";
				}

				if ((mParams.sRowType === "Standard" && !bDraggingOverItself)
					|| (mParams.sRowType === "Empty" && sDropPosition !== DropPosition.On)) {

					assert.ok(!oEvent.isDefaultPrevented(), sMessagePrefix + "The default action was be prevented");

					const bVerticalScrollbarVisible = this.oTable._getScrollExtension().isVerticalScrollbarVisible();
					const mTableCntRect = this.oTable.getDomRef("sapUiTableCnt").getBoundingClientRect();

					if (mParams.sRowType === "Empty") {
						const oLastNonEmptyRow = this.oTable.getRows()[TableUtils.getNonEmptyRowCount(this.oTable) - 1];
						assert.strictEqual(oEvent.dragSession.getDropControl(), oLastNonEmptyRow,
							sMessagePrefix + "The drop control was set to the last non-empty row");
					}

					assert.ok(!oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was not marked as \"NonDroppable\"");

					/*
					 * Requires an UIUpdate in case the test page renders a scrollbar
					 * while the drop indicator is rendered. The scrollbar will
					 * move the qunit fixture to the left, but the drop indicator
					 * will stay at the previous position without the UIUpdate.
					 */
					await nextUIUpdate();
					assert.deepEqual(oEvent.dragSession.getIndicatorConfig(), {
						width: mTableCntRect.width - (bVerticalScrollbarVisible ? 16 : 0),
						left: mTableCntRect.left + (this.oTable._bRtlMode && bVerticalScrollbarVisible ? 16 : 0)
					}, sMessagePrefix + "The correct indicator size was stored in the drag session");
				} else {
					assert.ok(oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was marked as \"NonDroppable\"");
					assert.equal(oEvent.dragSession.getIndicatorConfig(), null,
						sMessagePrefix + "The indicator size was not stored in the drag session");
				}
			}
		});

		const test = (mTestParameters, bTestDragOverItself) => {
			const getTarget = (iRowIndex) => {
				switch (mTestParameters.sRowAreaType) {
					case "Header":
						return this.oTable.qunit.getRowHeaderCell(iRowIndex);
					case "Fixed":
						return this.oTable.getRows()[iRowIndex].getCells()[0].getDomRef();
					case "Scrollable":
						return this.oTable.getRows()[iRowIndex].getCells()[1].getDomRef();
					case "Action":
						return this.oTable.qunit.getRowActionCell(iRowIndex).querySelector(".sapUiTableActionIcon");
					default:
						return null;
				}
			};

			this.oTable.getRows()[mTestParameters.iFromRowIndex].getDomRef().dispatchEvent(createDragEvent("dragstart"));
			let oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			getTarget(mTestParameters.iToRowIndex).dispatchEvent(oDragEnterEvent);

			if (bTestDragOverItself) {
				this.oTable.getRows()[mTestParameters.iFromRowIndex].getDomRef().dispatchEvent(createDragEvent("dragstart"));
				oDragEnterEvent = createDragEvent("dragenter");
				oDragEnterEvent._mTestParameters = mTestParameters;
				getTarget(mTestParameters.iFromRowIndex).dispatchEvent(oDragEnterEvent);
			}
		};

		function testStandardRow() {
			test({sRowType: "Standard", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1}, true);
			test({sRowType: "Standard", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1}, true);
		}

		const testEmptyRow = () => {
			const sOriginalDropPosition = this.oTable.getDragDropConfig()[0].getDropPosition();

			Object.getOwnPropertyNames(DropPosition).forEach((sPropertyName) => {
				this.oTable.getDragDropConfig()[0].setDropPosition(DropPosition[sPropertyName]);
				test({sRowType: "Empty", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 9});
				test({sRowType: "Empty", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 9});
			});

			this.oTable.getDragDropConfig()[0].setDropPosition(sOriginalDropPosition);
		};

		const testGroupHeaderRow = async () => {
			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Group);
			await this.oTable.qunit.setRowStates([undefined, {type: Row.prototype.Type.GroupHeader, expandable: true}]);

			test({sRowType: "Group header", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Group header", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});

			TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Flat);
			await this.oTable.qunit.whenRenderingFinished();
		};

		const testSumRow = async () => {
			await this.oTable.qunit.setRowStates([undefined, {type: Row.prototype.Type.Summary}]);
			test({sRowType: "Sum", sRowAreaType: "Header", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Fixed", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Scrollable", iFromRowIndex: 0, iToRowIndex: 1});
			test({sRowType: "Sum", sRowAreaType: "Action", iFromRowIndex: 0, iToRowIndex: 1});
		};

		await testStandardRow();
		await testEmptyRow();
		await testGroupHeaderRow();
		await testSumRow();
	});

	QUnit.test("Droppable with empty rows aggregation (NoData not shown)", async function(assert) {
		const oOtherTable = await TableQUnitUtils.createTable({
			rows: "{/}",
			models: TableQUnitUtils.createJSONModelWithEmptyRows(9),
			columns: TableQUnitUtils.createTextColumn(),
			dragDropConfig: new DragDropInfo({
				sourceAggregation: "rows",
				targetElement: this.oTable
			})
		});

		await oOtherTable.qunit.whenRenderingFinished();

		this.oTable.addEventDelegate({
			ondragenter: (oEvent) => {
				const mParams = oEvent.originalEvent._mTestParameters;
				const sDropPosition = oOtherTable.getDragDropConfig()[0].getDropPosition();
				const sMessagePrefix = "[DropPosition=" + sDropPosition + "] " + mParams.sRowAreaType + " area: ";

				assert.ok(!oEvent.isMarked("NonDroppable"), sMessagePrefix + "The event was not marked as \"NonDroppable\"");
				assert.strictEqual(oEvent.dragSession.getDropControl(), this.oTable, sMessagePrefix + "The drop control was set to the table");
				assert.equal(oEvent.dragSession.getIndicatorConfig(), null,
					sMessagePrefix + "The indicator size was not stored in the drag session");
				}
		});

		function test(oTarget, mTestParameters) {
			oOtherTable.getRows()[0].getDomRef().dispatchEvent(createDragEvent("dragstart"));
			const oDragEnterEvent = createDragEvent("dragenter");
			oDragEnterEvent._mTestParameters = mTestParameters;
			oTarget.dispatchEvent(oDragEnterEvent);
		}

		Object.getOwnPropertyNames(DropPosition).forEach((sPropertyName) => {
			oOtherTable.getDragDropConfig()[0].setDropPosition(DropPosition[sPropertyName]);
			test(this.oTable.qunit.getRowHeaderCell(1), {sRowAreaType: "Header"});
			test(this.oTable.getRows()[1].getCells()[0].getDomRef(), {sRowAreaType: "Fixed"});
			test(this.oTable.getRows()[1].getCells()[1].getDomRef(), {sRowAreaType: "Scrollable"});
			test(this.oTable.qunit.getRowActionCell(1).querySelector(".sapUiTableActionIcon"), {sRowAreaType: "Action"});
		});

		oOtherTable.destroy();
	});

	QUnit.test("Expand rows - longdragover", async function(assert) {
		const oFakeEvent = {
			dragSession: {
				getDropControl: function() {}
			},
			target: null
		};
		const oRowExpandSpy = sinon.spy(this.oTable.getRows()[0], "expand");
		const oRowCollapseSpy = sinon.spy(this.oTable.getRows()[1], "collapse");

		TableUtils.Grouping.setHierarchyMode(this.oTable, TableUtils.Grouping.HierarchyMode.Tree);
		await this.oTable.qunit.setRowStates([
			{expandable: true},
			{expandable: true, expanded: true}
		]);

		oFakeEvent.target = this.oTable.qunit.getRowHeaderCell(0);
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.equal(oRowExpandSpy.callCount, 1, "Row header cell - Row#expand was called once on the correct row");

		oRowExpandSpy.resetHistory();
		oFakeEvent.target = this.oTable.getRows()[0].getCells()[0].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.equal(oRowExpandSpy.callCount, 1, "Data cell in fixed column - Row#expand was called once on the correct row");

		oRowExpandSpy.resetHistory();
		oFakeEvent.target = this.oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.equal(oRowExpandSpy.callCount, 1, "Data cell in scrollable column - Row#expand was called once on the correct row");

		oRowExpandSpy.resetHistory();
		oFakeEvent.target = this.oTable.qunit.getRowActionCell(0);
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.equal(oRowExpandSpy.callCount, 1, "Row action cell - Row#expand was called once on the correct row");

		oFakeEvent.target = this.oTable.getRows()[1].getCells()[0].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.equal(oRowCollapseSpy.callCount, 0, "Row#collapse was not called");

		oFakeEvent.dragSession = {
			getDropControl: () => {
				return this.oTable.getRows()[0].getCells()[1];
			}
		};
		oRowExpandSpy.resetHistory();
		oFakeEvent.target = this.oTable.getRows()[0].getCells()[1].getDomRef();
		this.oDragAndDropExtension._ExtensionDelegate.onlongdragover.call(this.oTable, oFakeEvent);
		assert.ok(oRowExpandSpy.notCalled, "If the cell content is the drop target, Row#expand is not called");
	});

	QUnit.module("Columns", {
		beforeEach: async function() {
			await createTables();

			this.oDragAndDropExtension = oTable._getDragAndDropExtension();
			this.oDragAndDropExtension._debug();

			this.oDDI = new DragDropInfo({
				sourceAggregation: "columns",
				targetAggregation: "columns",
				dropPosition: "Between"
			});

			oTable.addDragDropConfig(this.oDDI);
			await nextUIUpdate();
		},
		afterEach: function() {
			destroyTables();
			this.oDDI = null;
		}
	});

	QUnit.test("Draggable", function(assert) {
		const aColumns = oTable.getColumns();
		assert.notOk(this.oDDI.isDraggable(aColumns[1]), "Columns are not draggable by default");

		this.oDDI.bIgnoreMetadataCheck = true;
		assert.ok(this.oDDI.isDraggable(aColumns[1]), "Columns are now draggable");
	});

	QUnit.test("Droppable", function(assert) {
		const aColumns = oTable.getColumns();
		const oDragEnterEvent = {
			setMark: () => { },
			target: aColumns[0].getDomRef()
		};

		assert.notOk(this.oDDI.isDroppable(aColumns[0], oDragEnterEvent), "Columns are not droppable by default");

		this.oDDI.bIgnoreMetadataCheck = true;
		assert.ok(this.oDDI.isDroppable(aColumns[0], oDragEnterEvent), "Columns are now droppable");
	});

	QUnit.test("Indicator Size", async function(assert) {
		const aColumns = oTable.getColumns();

		this.oDDI.bIgnoreMetadataCheck = true;
		oTable.invalidate();
		await nextUIUpdate();

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
		await nextUIUpdate();

		triggerDragEvent("dragenter", aColumns[2]);
		assert.equal(
			document.querySelector(".sapUiDnDIndicator").getBoundingClientRect().height,
			oTable.getDomRef("sapUiTableCnt").getBoundingClientRect().height - 16,
			"Drop indicaator is not visible on the horizontal scrollbar"
		);

		triggerDragEvent("drop", aColumns[2]);
	});

	QUnit.test("Draggable - TreeTable case", async function(assert) {
		const fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;
		const aColumns = oTreeTable.getColumns();

		oTreeTable.addDragDropConfig(this.oDDI);
		this.oDDI.bIgnoreMetadataCheck = true;

		oTreeTable.invalidate();
		await nextUIUpdate();

		for (let i = 0; i < aColumns.length; i++) {
			const oColumnRef = aColumns[i].getDomRef();
			assert.equal(oColumnRef.getAttribute("draggable"), i === 0 ? null : "true", "Column " + i + " has correct value for draggable");
			assert.equal(oColumnRef.getAttribute("data-sap-ui-draggable"), i === 0 ? null : "true", "Column " + i + " has correct value for data-sap-ui-draggable");
		}

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTreeTable, arguments);

			const mParams = oEvent.originalEvent._mTestParameters;

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

	QUnit.test("Draggable - Fixed Columns", async function(assert) {
		const fnOriginalDragEnterHandler = this.oDragAndDropExtension._ExtensionDelegate.ondragenter;
		const aColumns = oTable.getColumns();
		oTable.setFixedColumnCount(2);

		this.oDDI.bIgnoreMetadataCheck = true;

		oTable.invalidate();
		await nextUIUpdate();

		for (let i = 0; i < aColumns.length; i++) {
			const oColumnRef = aColumns[i].getDomRef();
			assert.equal(oColumnRef.getAttribute("draggable"), i < 2 ? null : "true", "Column " + i + " has correct value for draggable");
			assert.equal(oColumnRef.getAttribute("data-sap-ui-draggable"), i < 2 ? null : "true", "Column " + i + " has correct value for data-sap-ui-draggable");
		}

		this.oDragAndDropExtension._ExtensionDelegate.ondragenter = function(oEvent) {
			fnOriginalDragEnterHandler.apply(oTable, arguments);

			const mParams = oEvent.originalEvent._mTestParameters;

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