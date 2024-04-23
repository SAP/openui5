/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"./TestControl",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/ElementMetadata",
	"sap/base/Log",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(jQuery, TestControl, DropInfo, ManagedObject, ElementMetadata, Log, nextUIUpdate) {
	"use strict";

	QUnit.module("");

	QUnit.test("Default values", function(assert) {
		var oDropInfo = new DropInfo();
		assert.strictEqual(oDropInfo.getTargetAggregation(), "", "Default value of targetAggregation is correct");
		assert.strictEqual(oDropInfo.getGroupName(), "", "Default value of targetAggregation is correct");
		assert.strictEqual(oDropInfo.getDropEffect(), "Move", "Default value of dropEffect is correct");
		assert.strictEqual(oDropInfo.getDropPosition(), "On", "Default value of dropPosition is correct");
		assert.strictEqual(oDropInfo.getDropLayout(), "Default", "Default value of dropLayout is correct");
		assert.strictEqual(oDropInfo.getEnabled(), true, "Default value of enabled is correct");
		assert.strictEqual(oDropInfo.isDraggable(), false, "DropInfo is not draggable.");
		oDropInfo.destroy();
	});

	QUnit.test("invalidation", function(assert) {
		var oDropInfo = new DropInfo();
		var fnInvalidateSpy = this.spy(oDropInfo, "invalidate");

		oDropInfo.setEnabled(false);
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for enabled property");

		oDropInfo.setGroupName("abc");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for groupName property");

		oDropInfo.setTargetAggregation("items");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for targetAggregation property");

		oDropInfo.setDropEffect("Copy");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for dropEffect property");

		oDropInfo.setDropPosition("Between");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for dropPosition property");

		oDropInfo.setDropLayout("Horizontal");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for dropLayout property");

		oDropInfo.destroy();
	});

	QUnit.test("TemporaryDropPosition", function(assert) {
		var oDropInfo = new DropInfo();
		oDropInfo.sTemporaryDropPosition = "Between";

		assert.strictEqual(oDropInfo.getDropPosition(), "On", "Public API returns the correct DropPosition value");
		assert.strictEqual(oDropInfo.getDropPosition(true), "Between", "Temporary DropPosition is returned when 1st param is true");

		oDropInfo.destroy();
	});

	QUnit.test("getDropLayout", function(assert) {
		var oDropInfo = new DropInfo({
			targetAggregation: "test"
		});
		var oControl = new TestControl({
			dragDropConfig: oDropInfo
		});

		assert.strictEqual(oDropInfo.getDropLayout(true), "Horizontal", "Default value is taken from metadata.dnd.layout");

		oDropInfo.setDropLayout("Vertical");
		assert.strictEqual(oDropInfo.getDropLayout(), "Vertical", "Public API returned the control value");
		assert.strictEqual(oDropInfo.getDropLayout(true), "Vertical", "Nothing to detect property value is returned");

		oControl.destroy();
	});

	QUnit.test("isDroppable - An unrelated element", function(assert) {
		var oDropInfo = new DropInfo();
		var oManagedObject = new ManagedObject();

		assert.notOk(oDropInfo.isDroppable(undefined), "Not droppable: Drag target is not specified");
		assert.notOk(oDropInfo.isDroppable(oManagedObject), "Not droppable: Drag target is not an instanceof Element");

		oManagedObject.destroy();
		oDropInfo.destroy();
	});

	QUnit.test("isDroppable - Test control not known to the DropInfo", function(assert) {
		var oDropInfo = new DropInfo();
		var oControl = new TestControl();

		assert.notOk(oDropInfo.isDroppable(oControl), "Not droppable: The drop target is not known");

		oDropInfo.destroy();
		oControl.destroy();
	});

	QUnit.test("isDroppable - The control itself", function(assert) {
		var oDropInfo = new DropInfo();
		var oControl = new TestControl({
			dragDropConfig: oDropInfo
		});

		assert.ok(oDropInfo.isDroppable(oControl), "Droppable: The drop target is the control itself");

		oDropInfo.setTargetAggregation("children");
		assert.notOk(oDropInfo.isDroppable(oControl), "Not Droppable: targetAggregation is defined");

		oControl.destroy();
	});

	QUnit.test("isDroppable - Aggregated child element", function(assert) {
		var oDropInfo = new DropInfo({
			targetAggregation: "children"
		});
		var oControl = new TestControl();
		var oParent = new TestControl({
			dragDropConfig: oDropInfo,
			children: oControl
		});

		assert.ok(oDropInfo.isDroppable(oControl), "Droppable: Child control is in the defined targetAggregation");

		oDropInfo.setTargetAggregation("thereIsNoSuchAnAggregationName");
		assert.notOk(oDropInfo.isDroppable(oControl), "Not Droppable: Child control is not in the defined targetAggregation");

		oParent.destroy();
	});

	QUnit.test("isDroppable - Empty Aggregation", async function(assert) {
		var oDropInfo = new DropInfo({
			targetAggregation: "children"
		});
		var oControl = new TestControl({
			dragDropConfig: oDropInfo
		});
		var oEvent = new jQuery.Event("dragenter");

		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		oEvent.target = oControl.getDomRef("children");
		assert.notOk(oDropInfo.isDroppable(oControl, oEvent), "Not Droppable: event target is the defined targetAggregation DOM");
		assert.strictEqual(oEvent.getMark("DragWithin"), undefined, "Event is not marked as found aggregation name");

		oEvent.target = oControl.getDomRef("children").firstChild;
		assert.ok(oDropInfo.isDroppable(oControl, oEvent), "Droppable: event target is in the defined targetAggregation DOM");
		assert.strictEqual(oEvent.getMark("DragWithin"), "children", "Event is not marked for the found aggregation name");

		oEvent.target = oControl.getDomRef("title");
		assert.notOk(oDropInfo.isDroppable(oControl, oEvent), "Not Droppable: event target is in the valid targetAggregation DOM");

		oEvent.target = oControl.getDomRef();
		assert.notOk(oDropInfo.isDroppable(oControl, oEvent), "Not Droppable: targetAggregation is defined control self is not the drop target.");

		oControl.destroy();
	});

	QUnit.test("isDroppable - Enabled", function(assert) {
		var oDropInfo = new DropInfo({
			enabled: false
		});
		var oControl = new TestControl({
			dragDropConfig: oDropInfo
		});

		assert.notOk(oDropInfo.isDroppable(oControl), "Not droppable: DropInfo is not enabled");

		oDropInfo.setEnabled(true);
		assert.ok(oDropInfo.isDroppable(oControl), "Droppable: DropInfo is enabled and drop target is the control itself");

		oControl.destroy();
	});

	QUnit.test("isDroppable - metadata disallows", function(assert) {
		var oDropInfo = new DropInfo();
		var oChild = new TestControl();
		var oParent = new TestControl({
			dragDropConfig: oDropInfo,
			children: oChild
		});

		var fnLogSpy = this.spy(Log, "warning");
		this.stub(ElementMetadata.prototype, "getDragDropInfo").returns({droppable: false});
		assert.notOk(oDropInfo.isDroppable(oParent), "Not droppable: Element metadata does not allow droppping");
		assert.strictEqual(fnLogSpy.callCount, 1, "Not droppable is logged");

		oDropInfo.setTargetAggregation("children");
		assert.notOk(oDropInfo.isDroppable(oChild), "Not droppable: Aggregation metadata does not allow dropping");
		assert.strictEqual(fnLogSpy.callCount, 2, "Not droppable is logged again");

		oDropInfo.bIgnoreMetadataCheck = true;
		assert.ok(oDropInfo.isDroppable(oChild), "Droppable: private flag ignores metadata check");

		oParent.destroy();
	});

	QUnit.test("fireDragEnter - invalid parameters", function(assert) {
		var oDragEnterEvent = new jQuery.Event("dragenter");
		var fnDragEnterSpy = this.spy();
		var oDropInfo = new DropInfo({
			dragEnter: fnDragEnterSpy
		});

		oDropInfo.fireDragEnter();
		assert.ok(fnDragEnterSpy.notCalled, "dragEnter event is not fired, there is no parameter");

		oDropInfo.fireDragEnter(oDragEnterEvent);
		assert.ok(fnDragEnterSpy.notCalled, "dragEnter event is not fired, dragSession does not exist");

		oDropInfo.destroy();
	});

	QUnit.test("fireDragEnter - event parameters", function(assert) {
		var fnDragEnterSpy = this.spy(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters.dragSession, "dragSession exists");
			assert.strictEqual(mParameters.target, oControl, "target is valid");
			assert.strictEqual(mParameters.browserEvent, oDragEnterEvent.originalEvent, "browserEvent is valid");
			assert.strictEqual(mParameters.dropPosition, "On", "dropPosition is valid");
		});
		var oDropInfo = new DropInfo({
			dragEnter: fnDragEnterSpy
		});
		var oControl = new TestControl({
			title: "Control",
			dragDropConfig: oDropInfo
		});
		var oDragEnterEvent = new jQuery.Event("dragstart");
		oDragEnterEvent.dragSession = {
			getDropControl: function() {
				return oControl;
			},
			getDropPosition: function() {
				return "On";
			}
		};

		var bEventValue = oDropInfo.fireDragEnter(oDragEnterEvent);
		assert.ok(fnDragEnterSpy.calledOnce, "dragEnter event is fired once");
		assert.ok(bEventValue, "dragEnter event is returned true");

		oDropInfo.detachDragEnter(fnDragEnterSpy);
		oDropInfo.attachDragEnter(function(oEvent) {
			oEvent.preventDefault();
		});

		bEventValue = oDropInfo.fireDragEnter(oDragEnterEvent);
		assert.notOk(bEventValue, "default is prevented for dragEnter event");

		oControl.destroy();
	});

	QUnit.test("fireDragOver - invalid parameters", function(assert) {
		var oDragOverEvent = new jQuery.Event("dragover");
		var fnDragOverSpy = this.spy();
		var oDropInfo = new DropInfo({
			dragOver: fnDragOverSpy
		});

		oDropInfo.fireDragOver();
		assert.ok(fnDragOverSpy.notCalled, "dragOver event is not fired, there is no parameter");

		oDropInfo.fireDragOver(oDragOverEvent);
		assert.ok(fnDragOverSpy.notCalled, "dragOver event is not fired, dragSession does not exist");

		oDropInfo.destroy();
	});

	QUnit.test("fireDragOver - event parameters", function(assert) {
		var fnDragOverSpy = this.spy(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters.dragSession, "dragSession exists");
			assert.strictEqual(mParameters.target, oControl, "target is valid");
			assert.strictEqual(mParameters.dropPosition, "On", "dropPosition is valid");
			assert.strictEqual(mParameters.browserEvent, oDragOverEvent.originalEvent, "browserEvent is valid");
		});
		var oDropInfo = new DropInfo({
			dragOver: fnDragOverSpy
		});
		var oControl = new TestControl({
			title: "Control",
			dragDropConfig: oDropInfo
		});
		var oDragOverEvent = new jQuery.Event("dragstart");
		oDragOverEvent.dragSession = {
			getDropControl: function() {
				return oControl;
			},
			getDropPosition: function() {
				return "On";
			}
		};

		var bEventValue = oDropInfo.fireDragOver(oDragOverEvent);
		assert.ok(fnDragOverSpy.calledOnce, "DragOver event is fired once");
		assert.ok(bEventValue, "DragOver event is returned true");

		oDropInfo.detachDragOver(fnDragOverSpy);
		oDropInfo.attachDragOver(function(oEvent) {
			oEvent.preventDefault();
		});

		bEventValue = oDropInfo.fireDragOver(oDragOverEvent);
		assert.notOk(bEventValue, "default is prevented for dragOver event");

		oControl.destroy();
	});

	QUnit.test("fireDrop - invalid parameters", function(assert) {
		var oDropEvent = new jQuery.Event("drop");
		var fnDropSpy = this.spy();
		var oDropInfo = new DropInfo({
			drop: fnDropSpy
		});

		oDropInfo.fireDrop();
		assert.ok(fnDropSpy.notCalled, "drop event is not fired, there is no parameter");

		oDropInfo.fireDrop(oDropEvent);
		assert.ok(fnDropSpy.notCalled, "drop event is not fired, dragSession does not exist");

		oDropInfo.destroy();
	});

	QUnit.test("fireDrop - event parameters", function(assert) {
		var fnDropSpy = this.spy(function(oEvent) {
			var mParameters = oEvent.getParameters();
			assert.ok(mParameters.dragSession, "dragSession exists");
			assert.strictEqual(mParameters.browserEvent, oDropEvent.originalEvent, "browserEvent is valid");
			assert.strictEqual(mParameters.draggedControl, oControl, "draggedControl is valid");
			assert.strictEqual(mParameters.draggedControl, oControl, "droppedControl is valid");
			assert.strictEqual(mParameters.dropPosition, "On", "dropPosition is valid");
		});
		var oDropInfo = new DropInfo({
			drop: fnDropSpy
		});
		var oControl = new TestControl({
			title: "Control",
			dragDropConfig: oDropInfo
		});
		var oDropEvent = new jQuery.Event("dragstart");
		oDropEvent.dragSession = {
			getDropControl: function() {
				return oControl;
			},
			getDragControl: function() {
				return oControl;
			},
			getDropPosition: function() {
				return oDropInfo.getDropPosition();
			}
		};

		oDropInfo.fireDrop(oDropEvent);
		assert.ok(fnDropSpy.calledOnce, "drop event is fired once");

		oControl.destroy();
	});

});