/*global QUnit, sinon*/

sap.ui.define([
	"sap/f/dnd/GridDropInfo",
	"sap/f/dnd/GridKeyboardDragAndDrop",
	"sap/f/GridContainer",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/core/dnd/DragInfo",
	"sap/ui/thirdparty/jquery"
], function(
	GridDropInfo,
	GridKeyboardDragAndDrop,
	GridContainer,
	Text,
	Core,
	DragInfo,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	function createFakeKeydownEvent (sType) {
		var oEvent = new jQuery.Event("sapincreasemodifiers");

		oEvent.originalEvent = new jQuery.Event("keydown");

		return oEvent;
	}

	QUnit.module("#fireDnDByKeyboard - different DropInfo and DragInfo properties", {
		beforeEach: function () {
			this.oGrid = new GridContainer({
				items: [
					this.oDraggedControl = new Text({ text: "item1" }),
					this.oDroppedControl = new Text({ text: "item2" }),
					new Text({ text: "item3" }),
					new Text({ text: "item4" })
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			this.oGrid = null;
			this.oDraggedControl = null;
			this.oDroppedControl = null;
		}
	});

	QUnit.test("#fireDnDByKeyboard when the item is draggable and  the container is droppable", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		this.oGrid.addDragDropConfig(new DragInfo({
			sourceAggregation: "items"
		}));

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.called, "Drop event is fired");
	});

	QUnit.test("#fireDnDByKeyboard when the item and the container are NOT draggable (no DragInfo)", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		// Don't add DragInfo in order to make the container not draggable

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.test("#fireDnDByKeyboard when the item and the container are NOT draggable (DragInfo 'enabled=false')", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		this.oGrid.addDragDropConfig(new DragInfo({
			sourceAggregation: "items",
			enabled: false
		}));

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.test("#fireDnDByKeyboard when dragged item has different 'groupName' than the dropped item", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		this.oGrid.addDragDropConfig(new DragInfo({
			sourceAggregation: "items",
			groupName: "Group 1"
		}));

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			groupName: "Group 2",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.module("fireDnDByKeyboard between 2 containers");

	QUnit.test("#fireDnDByKeyboard when the drag and drop containers are different", function (assert) {
		// Arrange
		var oDropSpy1 = sinon.spy(),
			oDropSpy2 = sinon.spy(),
			oDraggedControl = new Text({ text: "item1" }),
			oDragContainer = new GridContainer({
				items: [
					oDraggedControl
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					}),
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: oDropSpy1
					})
				]
			}),
			oDroppedControl = new Text(),
			oDropContainer = new GridContainer({
				items: [
					oDroppedControl
				],
				dragDropConfig: [
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: oDropSpy2
					})
				]
			});

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(oDraggedControl, oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oDropSpy1.notCalled, "Drop event is NOT fired on the wrong container");
		assert.ok(oDropSpy2.called, "Drop event is fired on the correct container");

		// Clean up
		oDragContainer.destroy();
		oDropContainer.destroy();
	});

	QUnit.test("#fireDnDByKeyboard when the drop container doesn't allow dropping", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDraggedControl = new Text({ text: "item1" }),
			oDragContainer = new GridContainer({
				items: [
					oDraggedControl
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					}),
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal"
					})
				]
			}),
			oDroppedControl = new Text(),
			oDropContainer = new GridContainer({
				items: [
					oDroppedControl
				],
				dragDropConfig: [
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: oSpy,
						enabled: false
					})
				]
			});

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(oDraggedControl, oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");

		// Clean up
		oDragContainer.destroy();
		oDropContainer.destroy();
	});

	QUnit.module("#fireDnDByKeyboard - preventDefault on different events", {
		beforeEach: function () {
			this.oGrid = new GridContainer({
				items: [
					this.oDraggedControl = new Text({ text: "item1" }),
					this.oDroppedControl = new Text({ text: "item2" }),
					new Text({ text: "item3" }),
					new Text({ text: "item4" })
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			this.oGrid = null;
			this.oDraggedControl = null;
			this.oDroppedControl = null;
		}
	});

	QUnit.test("'preventDefault' called on 'dragStart' event of DragInfo", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		this.oGrid.addDragDropConfig(new DragInfo({
			sourceAggregation: "items",
			dragStart: function (oEvent) {
				oEvent.preventDefault();
			}
		}));

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is not fired");
	});

	QUnit.test("'preventDefault' called on 'dragEnter' event of DropInfo", function (assert) {
		// Arrange
		var oSpy = sinon.spy();

		this.oGrid.addDragDropConfig(new DragInfo({
			sourceAggregation: "items"
		}));

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			dragEnter: function (oEvent) {
				oEvent.preventDefault();
			},
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnDByKeyboard(this.oDraggedControl, this.oDroppedControl, "Before", createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is not fired");
	});

});