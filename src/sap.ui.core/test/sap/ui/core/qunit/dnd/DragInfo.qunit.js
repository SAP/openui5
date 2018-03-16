sap.ui.define([
	"jquery.sap.global",
	'test/TestControl',
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/base/ManagedObject"
], function(jQuery, TestControl, DragInfo, ManagedObject) {
	"use strict";

	/*global QUnit,sinon*/

	QUnit.test("Default values", function(assert) {
		var oDragInfo = new DragInfo();
		assert.strictEqual(oDragInfo.getSourceAggregation(), "", "Default value of sourceAggregation is correct");
		assert.strictEqual(oDragInfo.getGroupName(), "", "Default value of targetAggregation  is correct");
		assert.strictEqual(oDragInfo.isDroppable(), false, "DragInfo is not droppable.");
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

		oDragInfo.setSourceAggregation("children");
		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: sourceAggregation is defined");

		oControl.destroy();
	});

	QUnit.test("isDraggable - Aggregated child element", function(assert) {
		var oDragInfo = new DragInfo({
			sourceAggregation: "children"
		});
		var oControl = new TestControl();
		var oParent = new TestControl({
			dragDropConfig: oDragInfo,
			children: oControl
		});

		assert.ok(oDragInfo.isDraggable(oControl), "Draggable: Child control is in the defined sourceAggregation");

		oDragInfo.setSourceAggregation("thereIsNoSuchAnAggregationName");
		assert.notOk(oDragInfo.isDraggable(oControl), "Not Draggable: Child control is not in the defined sourceAggregation");

		oParent.destroy();
	});

	QUnit.test("fireDragStart - invalid parameters", function(assert) {
		var oDragStartEvent = new jQuery.Event("dragstart");
		var fnDragStartSpy = sinon.spy();
		var oDragInfo = new DragInfo({
			dragStart: fnDragStartSpy
		});

		oDragInfo.fireDragStart();
		assert.ok(fnDragStartSpy.notCalled, "dragStart event is not fired, there is no parameter");

		oDragInfo.fireDragStart(oDragStartEvent);
		assert.ok(fnDragStartSpy.notCalled, "dragStart event is not fired, dragSession does not exist");

		oDragInfo.destroy();
	})

	QUnit.test("fireDragStart - event parameters", function(assert) {
		var fnDragStartSpy = sinon.spy(function(oEvent) {
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

});