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

	QUnit.module("#fireDnD - different DropInfo and DragInfo properties", {
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

	QUnit.test("#fireDnD when the item is draggable and the container is droppable", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

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
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.called, "Drop event is fired");
	});

	QUnit.test("#fireDnD when the item and the container are NOT draggable (no DragInfo)", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

		// Don't add DragInfo in order to make the container not draggable

		this.oGrid.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: oSpy
		}));

		// Act
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.test("#fireDnD when the item and the container are NOT draggable (DragInfo 'enabled=false')", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

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
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.test("#fireDnD when dragged item has different 'groupName' than the dropped item", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

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
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");
	});

	QUnit.module("#fireDnD between 2 containers");

	QUnit.test("#fireDnD when the drag and drop containers are different", function (assert) {
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
			}),
			oDropConfig = {
				grid: oDropContainer,
				item: oDroppedControl,
				dropPosition: "Before"
			};

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnD(oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oDropSpy1.notCalled, "Drop event is NOT fired on the wrong container");
		assert.ok(oDropSpy2.called, "Drop event is fired on the correct container");

		// Clean up
		oDragContainer.destroy();
		oDropContainer.destroy();
	});

	QUnit.test("#fireDnD when the drop container doesn't allow dropping", function (assert) {
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
			}),
			oDropConfig = {
				grid: oDropContainer,
				item: oDroppedControl,
				dropPosition: "Before"
			};

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnD(oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is NOT fired");

		// Clean up
		oDragContainer.destroy();
		oDropContainer.destroy();
	});

	QUnit.test("Simulate Keyboard Drag&Drop into an empty container", function (assert) {

		// Arrange
		var oDropSpy1 = sinon.spy(),
			oDropSpy2 = sinon.spy(),
			oDraggedControl = new Text({
				text: "Text 1"
			}),
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
			oDropContainer = new GridContainer({
				items: [], // no items, it should be empty
				dragDropConfig: [
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: oDropSpy2
					})
				]
			}),
			oDropConfig = {
				grid: oDropContainer,
				item: null,
				dropPosition: "Before"
			};

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnD(oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oDropSpy1.notCalled, "Drop event is NOT fired on the wrong container");
		assert.ok(oDropSpy2.called, "Drop event is fired on the correct container");

		// Clean up
		oDragContainer.destroy();
		oDropContainer.destroy();
	});

	QUnit.module("#fireDnD - preventDefault on different events", {
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
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

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
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is not fired");
	});

	QUnit.test("'preventDefault' called on 'dragEnter' event of DropInfo", function (assert) {
		// Arrange
		var oSpy = sinon.spy(),
			oDropConfig = {
				grid: this.oGrid,
				item: this.oDroppedControl,
				dropPosition: "Before"
			};

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
		GridKeyboardDragAndDrop.fireDnD(this.oDraggedControl, [oDropConfig], createFakeKeydownEvent());

		// Assert
		assert.ok(oSpy.notCalled, "Drop event is not fired");
	});

	QUnit.module("#fireDnD between multiple containers with different 'groupName'");

	QUnit.test("#fireDnD skips drop containers with different 'groupName'", function (assert) {
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
						dropLayout: "Horizontal"
					})
				]
			}),
			oDropContainer1 = new GridContainer({
				dragDropConfig: [
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						groupName: "DifferentGroup",
						drop: oDropSpy1
					})
				]
			}),
			oDroppedControl = new Text(),
			oDropContainer2 = new GridContainer({
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
			}),
			aDropConfigs = [
				{
					grid: oDropContainer1,
					item: oDroppedControl,
					dropPosition: "Before"
				},
				{
					grid: oDropContainer2,
					item: oDroppedControl,
					dropPosition: "Before"
				}
			];

		oDragContainer.placeAt(DOM_RENDER_LOCATION);
		oDropContainer1.placeAt(DOM_RENDER_LOCATION);
		oDropContainer2.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		GridKeyboardDragAndDrop.fireDnD(oDraggedControl, aDropConfigs, createFakeKeydownEvent());

		// Assert
		assert.ok(oDropSpy1.notCalled, "Drop event is NOT fired on the first container (with different 'groupName')");
		assert.ok(oDropSpy2.called, "Drop event is fired on the second container");

		// Clean up
		oDragContainer.destroy();
		oDropContainer1.destroy();
		oDropContainer2.destroy();
	});

});