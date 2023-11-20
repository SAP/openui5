/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	'./TestControl',
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ElementMetadata",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(jQuery, TestControl, DragInfo, ManagedObject, ElementMetadata, Log, nextUIUpdate) {
	"use strict";

	QUnit.module("");

	QUnit.test("Default values", function(assert) {
		var oDragInfo = new DragInfo();
		assert.strictEqual(oDragInfo.getSourceAggregation(), "", "Default value of sourceAggregation is correct");
		assert.strictEqual(oDragInfo.getGroupName(), "", "Default value of targetAggregation  is correct");
		assert.strictEqual(oDragInfo.getEnabled(), true, "Default value of enabled is correct");
		assert.strictEqual(oDragInfo.isDroppable(), false, "DragInfo is not droppable.");
		oDragInfo.destroy();
	});

	QUnit.test("invalidation", function(assert) {
		var oDragInfo = new DragInfo();
		var fnInvalidateSpy = this.spy(oDragInfo, "invalidate");

		oDragInfo.setGroupName("abc");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for groupName property");

		oDragInfo.setEnabled(false);
		assert.strictEqual(fnInvalidateSpy.callCount, 1, "Invalidation has happened for enabled property");

		oDragInfo.destroy();
	});

	QUnit.test("isDraggable - An unrelated element", function(assert) {
		var oDragInfo = new DragInfo();
		var oManagedObject = new ManagedObject();

		assert.notOk(oDragInfo.isDraggable(undefined), "Not draggable: Drag target is not specified");
		assert.notOk(oDragInfo.isDraggable(oManagedObject), "Not draggable: Drag target is not an instanceof Element");

		oManagedObject.destroy();
		oDragInfo.destroy();
	});

	QUnit.test("isDraggable - Test control not known to the DragInfo", function(assert) {
		var oDragInfo = new DragInfo();
		var oControl = new TestControl();

		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: The drag source is not known");

		oDragInfo.destroy();
		oControl.destroy();
	});

	QUnit.test("isDraggable - The control itself", function(assert) {
		var oDragInfo = new DragInfo();
		var oControl = new TestControl({
			dragDropConfig: oDragInfo
		});

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable: The drag source is the control itself");

		oControl.isDragAllowed = function() { assert.equal(arguments[0], oDragInfo); return false; };
		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: oControl.isDragAllowed method did not permit");
		delete oControl.isDragAllowed;

		oDragInfo.setSourceAggregation("children");
		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: sourceAggregation is defined");

		oControl.destroy();
	});

	QUnit.test("isDraggable - Aggregated child element", async function(assert) {
		var oDragInfo = new DragInfo({
			sourceAggregation: "children"
		});
		var oControl = new TestControl();
		var oParent = new TestControl({
			dragDropConfig: oDragInfo,
			children: oControl
		});

		oParent.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable: Child control is in the defined sourceAggregation");
		assert.ok(oControl.getDomRef().draggable, "Dom Draggable: Child control is in the defined sourceAggregation");

		oControl.isDragAllowed = function() { assert.equal(arguments[0], oDragInfo); return false; };
		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: oControl.isDragAllowed method did not permit");
		oControl.invalidate();
		await nextUIUpdate();
		assert.notOk(oControl.getDomRef().draggable, "Dom Not Draggable: oControl.isDragAllowed method did not permit");
		delete oControl.isDragAllowed;

		oDragInfo.setSourceAggregation("thereIsNoSuchAnAggregationName");
		await nextUIUpdate();

		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: Child control is not in the defined sourceAggregation");
		assert.notOk(oControl.getDomRef().draggable, "Dom Not Draggable: Child control is not in the defined sourceAggregation");

		oDragInfo.setSourceAggregation("children");
		await nextUIUpdate();

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable Again: Child control is in the defined sourceAggregation");
		assert.ok(oControl.getDomRef().draggable, "Dom Draggable Again: Child control is in the defined sourceAggregation");

		oDragInfo.setEnabled(false);
		await nextUIUpdate();

		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: DragInfo is disabled");
		assert.notOk(oControl.getDomRef().draggable, "Dom Not Draggable: DragInfo is disabled");

		oDragInfo.setEnabled(true);
		await nextUIUpdate();

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable: DragInfo is enabled");
		assert.ok(oControl.getDomRef().draggable, "Dom Draggable: DragInfo is enabled");

		oDragInfo.setSourceAggregation();
		await nextUIUpdate();

		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: sourceAggregation is empty");
		assert.notOk(oControl.getDomRef().draggable, "Dom Not Draggable: sourceAggregation is empty");
		assert.ok(oDragInfo.isDraggable(oParent), "Parent Draggable: sourceAggregation is empty");
		assert.ok(oParent.getDomRef().draggable, "Parent Dom Draggable: sourceAggregation is empty");

		oParent.destroy();
	});

	QUnit.test("isDraggable - Enabled", async function(assert) {
		var oDragInfo = new DragInfo({
			enabled: false
		});
		var oControl = new TestControl({
			dragDropConfig: oDragInfo
		});

		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oDragInfo.isDraggable(oControl), "Not draggable: DragInfo is not enabled");
		assert.notOk(oControl.getDomRef().draggable, "Dom Not draggable: DragInfo is not enabled");

		oDragInfo.setEnabled(true);
		await nextUIUpdate();

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable: DragInfo is enabled and drag source is the control itself");
		assert.ok(oControl.getDomRef().draggable, "Dom Draggable: DragInfo is enabled and drag source is the control itself");

		oControl.destroy();
	});

	QUnit.test("isDraggable - metadata disallows", function(assert) {
		var oDragInfo = new DragInfo();
		var oChild = new TestControl();
		var oParent = new TestControl({
			dragDropConfig: oDragInfo,
			children: oChild
		});

		var fnLogSpy = this.spy(Log, "warning");
		this.stub(ElementMetadata.prototype, "getDragDropInfo").returns({draggable: false});
		assert.notOk(oDragInfo.isDraggable(oParent), "Not draggable: Element metadata does not allow dragging");
		assert.strictEqual(fnLogSpy.callCount, 1, "Not draggable is logged");

		oDragInfo.setSourceAggregation("children");
		assert.notOk(oDragInfo.isDraggable(oChild), "Not draggable: Aggregation metadata does not allow dragging");
		assert.strictEqual(fnLogSpy.callCount, 2, "Not draggable is logged again");

		oDragInfo.bIgnoreMetadataCheck = true;
		assert.ok(oDragInfo.isDraggable(oChild), "Draggable: private flag ignores metadata check");

		oParent.destroy();
	});

	QUnit.test("fireDragStart - invalid parameters", function(assert) {
		var oDragStartEvent = new jQuery.Event("dragstart");
		var fnDragStartSpy = this.spy();
		var oDragInfo = new DragInfo({
			dragStart: fnDragStartSpy
		});

		oDragInfo.fireDragStart();
		assert.ok(fnDragStartSpy.notCalled, "dragStart event is not fired, there is no parameter");

		oDragInfo.fireDragStart(oDragStartEvent);
		assert.ok(fnDragStartSpy.notCalled, "dragStart event is not fired, dragSession does not exist");

		oDragInfo.destroy();
	});

	QUnit.test("fireDragStart - event parameters", function(assert) {
		var fnDragStartSpy = this.spy(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters.dragSession, "dragSession exists");
			assert.strictEqual(mParameters.target, oControl, "target is valid");
			assert.strictEqual(mParameters.browserEvent, oDragStartEvent.originalEvent, "browserEvent is valid");
		});
		var oDragInfo = new DragInfo({
			dragStart: fnDragStartSpy
		});
		var oControl = new TestControl({
			title: "Control",
			dragDropConfig: oDragInfo
		});
		var oDragStartEvent = new jQuery.Event("dragstart");
		oDragStartEvent.dragSession = {
			getDragControl: function() {
				return oControl;
			}
		};

		var bEventValue = oDragInfo.fireDragStart(oDragStartEvent);
		assert.ok(fnDragStartSpy.calledOnce, "dragStart event is fired once");
		assert.ok(bEventValue, "dragStart event is returned true");

		oDragInfo.detachDragStart(fnDragStartSpy);
		oDragInfo.attachDragStart(function(oEvent) {
			oEvent.preventDefault();
		});

		bEventValue = oDragInfo.fireDragStart(oDragStartEvent);
		assert.notOk(bEventValue, "default is prevented for dragStart event");

		oControl.destroy();
	});

	QUnit.test("fireDragEnd - invalid parameters", function(assert) {
		var oDragEndEvent = new jQuery.Event("dragstart");
		var fnDragEndSpy = this.spy();
		var oDragInfo = new DragInfo({
			dragEnd: fnDragEndSpy
		});

		oDragInfo.fireDragEnd();
		assert.ok(fnDragEndSpy.notCalled, "dragEnd event is not fired, there is no parameter");

		oDragInfo.fireDragEnd(oDragEndEvent);
		assert.ok(fnDragEndSpy.notCalled, "dragEnd event is not fired, dragSession does not exist");

		oDragInfo.destroy();
	});

	QUnit.test("fireDragEnd - event parameters", function(assert) {
		var fnDragEndSpy = this.spy(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters.dragSession, "dragSession exists");
			assert.strictEqual(mParameters.target, oControl, "target is valid");
			assert.strictEqual(mParameters.browserEvent, oDragEndEvent.originalEvent, "browserEvent is valid");
		});
		var oDragInfo = new DragInfo({
			dragEnd: fnDragEndSpy
		});
		var oControl = new TestControl({
			title: "Control",
			dragDropConfig: oDragInfo
		});
		var oDragEndEvent = new jQuery.Event("dragend");
		oDragEndEvent.dragSession = {
			getDragControl: function() {
				return oControl;
			}
		};

		var bEventValue = oDragInfo.fireDragEnd(oDragEndEvent);
		assert.ok(fnDragEndSpy.calledOnce, "dragEnd event is fired once");
		assert.ok(bEventValue, "dragEnd event is returned true");

		oControl.destroy();
	});

});