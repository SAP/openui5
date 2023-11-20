/*global QUnit,sinon*/
sap.ui.define([
	"./TestControl",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/core/dnd/DropInfo",
	"sap/ui/core/dnd/DragDropInfo",
	"./DragInfo.qunit",
	"./DropInfo.qunit"
], function(TestControl, DragInfo, DropInfo, DragDropInfo) {
	"use strict";

	QUnit.test("Basics", function(assert) {
		var oDragDropInfo = new DragDropInfo();

		assert.strictEqual(oDragDropInfo.getSourceAggregation(), "", "Default value of sourceAggregation is correct");
		assert.ok(oDragDropInfo instanceof DropInfo, "DragDropInfo is an instance of DropInfo");

		assert.ok(Object.keys(DragInfo.prototype).every(function(sMethod) {
			return DragDropInfo.prototype[sMethod];
		}), "All DragInfo methods are implemented by DragDropInfo");

		oDragDropInfo.setGroupName("Something");
		assert.strictEqual(oDragDropInfo.getGroupName(), "", "groupName property cannot be set on DragDropInfo");

		oDragDropInfo.destroy();
	});

	QUnit.test("invalidation", function(assert) {
		var oDragDropInfo = new DragDropInfo();
		var fnInvalidateSpy = sinon.spy(oDragDropInfo, "invalidate");

		oDragDropInfo.setGroupName("abc");
		assert.strictEqual(fnInvalidateSpy.callCount, 0, "Invalidation has not happened for groupName property");

		oDragDropInfo.setEnabled(false);
		assert.strictEqual(fnInvalidateSpy.callCount, 1, "Invalidation has happened for enabled property");

		oDragDropInfo.destroy();
	});

	QUnit.test("isDroppable - targetElement itself", function(assert) {
		var oControl = new TestControl();
		var oDragDropInfo = new DragDropInfo({
			targetElement: oControl
		});

		assert.ok(oDragDropInfo.isDroppable(oControl), "Droppable: The drop target is the targetElement itself");

		oDragDropInfo.setTargetAggregation("children");
		assert.notOk(oDragDropInfo.isDroppable(oControl), "Not Droppable: targetAggregation is defined");

		oControl.destroy();
	});

	QUnit.test("isDroppable - Aggregated child of targetElement", function(assert) {
		var oControl = new TestControl();
		var oParent = new TestControl({
			children: oControl
		});
		var oDragDropInfo = new DragDropInfo({
			targetAggregation: "children",
			targetElement: oParent
		});

		assert.ok(oDragDropInfo.isDroppable(oControl), "Droppable: Child control is in the defined targetAggregation of targetElement");

		oDragDropInfo.setTargetAggregation("thereIsNoSuchAnAggregationName");
		assert.notOk(oDragDropInfo.isDroppable(oControl), "Not Droppable: Child control is not in the defined targetAggregation of targetElement");

		oParent.destroy();
	});

	QUnit.test("isDroppable - invalid targetElement", function(assert) {
		var oControl = new TestControl();
		var oDragDropInfo = new DragDropInfo({
			targetElement: "doesNotExist"
		});
		/*var oParent =*/ new TestControl({
			children: oControl,
			dragDropConfig: oDragDropInfo
		});

		assert.notOk(oDragDropInfo.isDroppable(oControl), "Not Droppable: targetElement does not exist");

		oControl.destroy();
	});
});