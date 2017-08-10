sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/dnd/DragDropInfo",
	"sap/ui/core/Element",
	"sap/ui/base/Object"
], function(jQuery, DragDropInfo, Element, BaseObject) {
	"use strict";

	/*global QUnit,sinon*/

	var oFakeEvent = {
		dragSession: "dragSession",
		originalEvent: "originalEvent"
	};

	QUnit.module("Basic", {
		beforeEach: function() {
			this.oDragDropInfo = new DragDropInfo();
		},
		afterEach: function() {
			this.oDragDropInfo.destroy();
		}
	});

	QUnit.test("Default values", function(assert) {
		assert.strictEqual(this.oDragDropInfo.getSourceAggregation(), "", "Default value for \"sourceAggregation\" is correct");
		assert.strictEqual(this.oDragDropInfo.getTargetAggregation(), "", "Default value for \"targetAggregation\" is correct");
		assert.strictEqual(this.oDragDropInfo.getDropEffect(), "Move", "Default value for \"dropEffect\" is correct");
		assert.strictEqual(this.oDragDropInfo.getDropPosition(), "On", "Default value for \"dropPosition\" is correct");
	});

	QUnit.module("IDragInfo", {
		beforeEach: function() {
			this.oDragDropInfo = new DragDropInfo();

			this.oDragDropInfoParent = new Element();
			this.oDragDropInfo.getParent = function() {
				return this.oDragDropInfoParent;
			}.bind(this);
		},
		afterEach: function() {
			this.oDragDropInfo.destroy();
			this.oDragDropInfoParent.destroy();
		}
	});

	QUnit.test("isDraggable - The element itself (parent of the DragInfo)", function(assert) {
		var oDragTarget = this.oDragDropInfoParent;

		assert.ok(this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Draggable: The element itself without a source aggregation defined");

		assert.ok(this.oDragDropInfo.isDraggable(oDragTarget), "Not Draggable: No event object");

		this.oDragDropInfo.setSourceAggregation("dummy");
		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: The element itself with a source aggregation defined");
	});

	QUnit.test("isDraggable - A first level aggregated child element", function(assert) {
		var oDragTarget = new Element();

		oDragTarget.getParent = function() {
			return this.oDragDropInfoParent;
		}.bind(this);
		oDragTarget.sParentAggregationName = "aggregation";

		this.oDragDropInfo.setSourceAggregation("aggregation");
		assert.ok(this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Draggable: A child element which is in the defined source aggregation");

		assert.ok(this.oDragDropInfo.isDraggable(oDragTarget), "Not Draggable: No event object");

		this.oDragDropInfo.setSourceAggregation("anotherAggregation");
		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: A child element which is not in the defined source aggregation");

		this.oDragDropInfo.setSourceAggregation(null);
		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: A child element without a source aggregation defined");
	});

	QUnit.test("isDraggable - A second level aggregated child element", function(assert) {
		var oDirectChild = new Element();
		var oDragTarget = new Element();

		oDirectChild.getParent = function() {
			return this.oDragDropInfoParent;
		}.bind(this);
		oDirectChild.sParentAggregationName = "firstLevelAggregation";

		oDragTarget.getParent = function() {
			return oDirectChild;
		};
		oDragTarget.sParentAggregationName = "secondLevelAggregation";

		this.oDragDropInfo.setSourceAggregation("firstLevelAggregation");
		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: Source aggregation is the first level aggregation");

		this.oDragDropInfo.setSourceAggregation("secondLevelAggregation");
		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: Source aggregation is the second level aggregation");
	});

	QUnit.test("isDraggable - An unrelated element", function(assert) {
		var oDragTarget = new Element();
		var oAnotherParent = new Element();

		oDragTarget.getParent = function() {
			return oAnotherParent;
		};

		assert.ok(!this.oDragDropInfo.isDraggable(oDragTarget, oFakeEvent),
			"Not draggable: An unrelated element (not the element itself, or one of its child elements)");
	});

	QUnit.test("isDraggable - Invalid drag targets", function(assert) {
		assert.ok(!this.oDragDropInfo.isDraggable(undefined, oFakeEvent),
			"Not draggable: No drag target specified");
		assert.ok(!this.oDragDropInfo.isDraggable(new BaseObject(), oFakeEvent),
			"Not draggable: Not an instance of sap.ui.core.Element");
	});

	QUnit.test("fireDragStart", function(assert) {
		var oDragStartEventSpy = sinon.spy(function(oEvent) {
			oDragStartEventSpy._oEventParameters = oEvent.mParameters;
		});
		var oDragStartTargetElement = new Element();

		function assertDragStartEventParameters(oDragDropInfo, oDragTarget) {
			var mExpectedEventParameters = {
				id: oDragDropInfo.getId(),
				target: oDragTarget,
				dragSession: oFakeEvent.dragSession,
				browserEvent: oFakeEvent.originalEvent
			};

			assert.deepEqual(oDragStartEventSpy._oEventParameters, mExpectedEventParameters,
				"The dragStart event was called with the correct parameters");
			delete oDragStartEventSpy._oEventParameters;
		}

		this.oDragDropInfo.attachEvent("dragStart", oDragStartEventSpy);

		this.oDragDropInfo.fireDragStart(oFakeEvent, oDragStartTargetElement);
		assert.ok(oDragStartEventSpy.calledOnce, "The dragStart event was called once");
		assertDragStartEventParameters(this.oDragDropInfo, oDragStartTargetElement);

		oDragStartEventSpy.reset();
		this.oDragDropInfo.fireDragStart(oFakeEvent);
		assert.ok(oDragStartEventSpy.calledOnce, "The dragStart event was called once");
		assertDragStartEventParameters(this.oDragDropInfo, undefined);
	});

	QUnit.module("IDropInfo", {
		beforeEach: function() {
			this.oDragDropInfo = new DragDropInfo();

			this.oDragDropInfoParent = new Element();
			this.oDragDropInfo.getParent = function() {
				return this.oDragDropInfoParent;
			}.bind(this);
		},
		afterEach: function() {
			this.oDragDropInfo.destroy();
		}
	});

	QUnit.test("isDroppable - The element itself (parent of the DropInfo)", function(assert) {
		var oDropTarget;
		var oParentDomRef = document.createElement("div");
		var oChildDomRef = oParentDomRef.appendChild(document.createElement("p"));

		oDropTarget = this.oDragDropInfoParent;
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: The element itself without a target aggregation defined - not rendered");

		oDropTarget.getDomRef = function() {
			return oParentDomRef;
		};
		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: The element itself without a target aggregation defined");

		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget), "Not Draggable: No event object");

		this.oDragDropInfoParent.getDomRef = function() {
			return oParentDomRef;
		};
		oDropTarget = new sap.ui.core.Element();
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The element itself without a target aggregation defined, if the drop target is a child - child not rendered");

		oDropTarget.getDomRef = function() {
			return oChildDomRef;
		};
		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: The element itself without a target aggregation defined, if the drop target is a child");

		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget), "Not Draggable: No event object");

		this.oDragDropInfo.setTargetAggregation("aggregation");
		oDropTarget = this.oDragDropInfoParent;
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The element itself with a target aggregation defined");
	});

	QUnit.test("isDroppable - The target element", function(assert) {
		var oTargetElement = new sap.ui.core.Element();
		var oDropTarget;
		var oParentDomRef = document.createElement("div");
		var oChildDomRef = oParentDomRef.appendChild(document.createElement("p"));

		this.oDragDropInfo.setTargetElement("doesnotexist");
		oDropTarget = this.oDragDropInfoParent;
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The target element does not exist");

		this.oDragDropInfo.setTargetElement(oTargetElement);
		oDropTarget = oTargetElement;
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The target element without a target aggregation defined - not rendered");

		oDropTarget.getDomRef = function() {
			return oParentDomRef;
		};
		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: The target element without a target aggregation defined");

		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget), "Not Draggable: No event object");

		oTargetElement.getDomRef = function() {
			return oParentDomRef;
		};
		oDropTarget = new sap.ui.core.Element();
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The target element without a target aggregation defined, if the drop target is a child - child not rendered");

		oDropTarget.getDomRef = function() {
			return oChildDomRef;
		};
		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: The target element without a target aggregation defined, if the drop target is a child");

		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget), "Not Draggable: No event object");

		this.oDragDropInfo.setTargetAggregation("aggregation");
		oDropTarget = oTargetElement;
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: The target element with a target aggregation defined");
	});

	QUnit.test("isDroppable - A first level aggregated child element", function(assert) {
		var oDropTarget = new Element();

		oDropTarget.getParent = function() {
			return this.oDragDropInfoParent;
		}.bind(this);
		oDropTarget.sParentAggregationName = "aggregation";

		this.oDragDropInfo.setTargetAggregation("aggregation");
		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Droppable: A child element which is in the defined target aggregation");

		assert.ok(this.oDragDropInfo.isDroppable(oDropTarget), "Not Draggable: No event object");

		this.oDragDropInfo.setTargetAggregation("anotherAggregation");
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: A child element which is not in the defined target aggregation");

		this.oDragDropInfo.setTargetAggregation(null);
		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: A child element without a target aggregation defined");
	});

	QUnit.test("isDroppable - A second level aggregated child element", function(assert) {
		var oDirectChild = new Element();
		var oDragTarget = new Element();

		oDirectChild.getParent = function() {
			return this.oDragDropInfoParent;
		}.bind(this);
		oDirectChild.sParentAggregationName = "firstLevelAggregation";

		oDragTarget.getParent = function() {
			return oDirectChild;
		};
		oDragTarget.sParentAggregationName = "secondLevelAggregation";

		this.oDragDropInfo.setTargetAggregation("firstLevelAggregation");
		assert.ok(!this.oDragDropInfo.isDroppable(oDragTarget, oFakeEvent),
			"Not droppable: Source aggregation is the first level aggregation");

		this.oDragDropInfo.setTargetAggregation("secondLevelAggregation");
		assert.ok(!this.oDragDropInfo.isDroppable(oDragTarget, oFakeEvent),
			"Not droppable: Source aggregation is the second level aggregation");
	});

	QUnit.test("isDroppable - An unrelated element", function(assert) {
		var oDropTarget = new Element();
		var oAnotherParent = new Element();

		oDropTarget.getParent = function() {
			return oAnotherParent;
		};

		assert.ok(!this.oDragDropInfo.isDroppable(oDropTarget, oFakeEvent),
			"Not droppable: An unrelated element (not the element itself, or one of its child elements)");
	});

	QUnit.test("isDroppable - Invalid drop targets", function(assert) {
		assert.ok(!this.oDragDropInfo.isDroppable(undefined, oFakeEvent),
			"Not droppable: No drop target specified");
		assert.ok(!this.oDragDropInfo.isDroppable(new BaseObject(), oFakeEvent),
			"Not droppable: Not an instance of sap.ui.core.Element");
	});

	QUnit.test("fireDragEnter", function(assert) {
		var oDragEnterEventSpy = sinon.spy(function(oEvent) {
			oDragEnterEventSpy._oEventParameters = oEvent.mParameters;
		});
		var oDragEnterTargetElement = new Element();

		function assertDragEnterEventParameters(oDragDropInfo, oDropTarget) {
			var mExpectedEventParameters = {
				id: oDragDropInfo.getId(),
				target: oDropTarget,
				dragSession: oFakeEvent.dragSession,
				browserEvent: oFakeEvent.originalEvent
			};

			assert.deepEqual(oDragEnterEventSpy._oEventParameters, mExpectedEventParameters,
				"The dragEnter event was called with the correct parameters");
			delete oDragEnterEventSpy._oEventParameters;
		}

		this.oDragDropInfo.attachEvent("dragEnter", oDragEnterEventSpy);

		this.oDragDropInfo.fireDragEnter(oFakeEvent, oDragEnterTargetElement);
		assert.ok(oDragEnterEventSpy.calledOnce, "The dragEnter event was called once");
		assertDragEnterEventParameters(this.oDragDropInfo, oDragEnterTargetElement);

		oDragEnterEventSpy.reset();
		this.oDragDropInfo.fireDragEnter(oFakeEvent);
		assert.ok(oDragEnterEventSpy.calledOnce, "The dragEnter event was called once");
		assertDragEnterEventParameters(this.oDragDropInfo, undefined);
	});
});