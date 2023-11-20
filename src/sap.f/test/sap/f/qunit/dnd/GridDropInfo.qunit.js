/*global QUnit*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/dnd/DropInfo",
	"sap/f/dnd/GridDropInfo",
	"sap/f/dnd/GridDragOver",
	"sap/f/GridContainer",
	"sap/f/GridList",
	"sap/m/CustomListItem",
	"sap/m/Text",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/Core"
], function(jQuery, DropInfo, GridDropInfo, GridDragOver, GridContainer, GridList, CustomListItem, Text, ManagedObject, Core) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	function createFakeEvent(sType) {
		var oEvent = new jQuery.Event(sType);

		oEvent.originalEvent = {};
		oEvent.pageX = 0;
		oEvent.pageY = 0;

		return oEvent;
	}

	QUnit.module("Initialization");

	QUnit.test("Initialization", function(assert) {
		var oGridDropInfo = new GridDropInfo();

		assert.ok(oGridDropInfo.isA("sap.f.dnd.GridDropInfo"), "GridDropInfo is initialized");
		oGridDropInfo.destroy();
	});

	QUnit.module("Fallback to DropInfo when not enhanced", {
		beforeEach: function () {
			this.oGridDropInfo = new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "On", // will not enhance, fallback to DropInfo
				dropLayout: "Horizontal"
			});
			this.oGrid = new GridContainer({
				dragDropConfig: this.oGridDropInfo
			});
		},
		afterEach: function () {
			this.oGridDropInfo.destroy();
			this.oGrid.destroy();
		}
	});

	QUnit.test("When not enhanced, fallback to DropInfo", function(assert) {
		var fnIsDroppableSpy = this.spy(DropInfo.prototype, "isDroppable"),
			fnFireDragEnterSpy = this.spy(DropInfo.prototype, "fireDragEnter"),
			fnFireDragOverSpy = this.spy(DropInfo.prototype, "fireDragOver"),
			fnFireDropSpy = this.spy(DropInfo.prototype, "fireDrop"),
			oTestControl = new Text(),
			oFakeEvent = createFakeEvent("dragover");

		this.oGridDropInfo.isDroppable(oTestControl, oFakeEvent);
		assert.ok(fnIsDroppableSpy.called, "DropInfo isDroppable is called");

		this.oGridDropInfo.fireDragEnter(oFakeEvent);
		assert.ok(fnFireDragEnterSpy.called, "DropInfo fireDragEnter is called");

		this.oGridDropInfo.fireDragOver(oFakeEvent);
		assert.ok(fnFireDragOverSpy.called, "DropInfo fireDragOver is called");

		this.oGridDropInfo.fireDrop(oFakeEvent);
		assert.ok(fnFireDropSpy.called, "DropInfo fireDrop is called");
	});

	QUnit.module("Integration in GridContainer", {
		beforeEach: function () {
			this.oGridDropInfo = new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal"
			});
			this.oGrid = new GridContainer({
				dragDropConfig: this.oGridDropInfo
			});
		},
		afterEach: function () {
			this.oGridDropInfo.destroy();
			this.oGrid.destroy();
		}
	});

	QUnit.test("isDroppable should be false for unknown controls", function(assert) {
		var oFakeEvent = createFakeEvent("dragover");

		assert.notOk(this.oGridDropInfo.isDroppable(new ManagedObject(), oFakeEvent), "Not droppable on control which is unknown to the grid drop info");
	});

	QUnit.test("isDroppable on correct parent control", function(assert) {
		var oFakeEvent = createFakeEvent("dragover");
		assert.ok(this.oGridDropInfo.isDroppable(this.oGrid, oFakeEvent), "Droppable when whole parent should be droppable");

		this.oGridDropInfo.setEnabled(false);
		assert.notOk(this.oGridDropInfo.isDroppable(this.oGrid, oFakeEvent), "Not droppable when not enabled");
	});

	QUnit.module("Target aggregation in List", {
		beforeEach: function () {
			this.oGridDropInfo = new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal"
			});

			this.oGridList = new GridList({
				dragDropConfig: this.oGridDropInfo
			});
		},
		afterEach: function () {
			this.oGridDropInfo.destroy();
			this.oGridList.destroy();
		}
	});

	QUnit.test("isDroppable", function(assert) {
		var oTestControl = new CustomListItem(),
			oFakeEvent = createFakeEvent("dragover");

		this.oGridList.addItem(oTestControl);
		this.oGridList.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		assert.notOk(this.oGridDropInfo.isDroppable(this.oGridList, oFakeEvent), "Not droppable outside the target aggregation");

		oFakeEvent.target = oTestControl.getDomRef();
		assert.ok(this.oGridDropInfo.isDroppable(oTestControl, oFakeEvent), "Droppable when inside the target aggregation dom ref");
	});

	QUnit.module("Events", {
		beforeEach: function () {
			var oDropItem = new Text(),
				oDragItem = new Text();

			this.oGridDropInfo = new GridDropInfo({
				targetAggregation: "items",
				dropPosition: "Between",
				dropLayout: "Horizontal"
			});
			this.oGrid = new GridContainer({
				dragDropConfig: this.oGridDropInfo,
				items: [oDropItem, oDragItem]
			});

			this.oFakeSession = {
				getDropControl: function() {
					return oDropItem;
				},
				getDragControl: function() {
					return oDragItem;
				},
				setIndicatorConfig: this.stub(),
				setDropControl: this.stub(),
				getDropPosition: this.stub(),
				getIndicator: this.stub()
			};

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGridDropInfo.destroy();
			this.oGrid.destroy();
		}
	});

	QUnit.test("fireDragEnter", function(assert) {
		// Arrange
		var oFakeEvent = createFakeEvent("dragenter"),
			fnStub = this.stub(),
			gridDragOver = GridDragOver.getInstance(),
			attachDragOverSpy = this.spy(gridDragOver, "handleDragOver");

		oFakeEvent.dragSession = this.oFakeSession;

		this.oGridDropInfo.attachDragEnter(function (oEvent) {
			fnStub(oEvent);
		});

		// Act
		this.oGridDropInfo.fireDragEnter(oFakeEvent);

		// Assert
		assert.ok(fnStub.called, "Drag enter is called");

		assert.ok(attachDragOverSpy.called, "'gridDragOver.handleDragOver' is called");
	});

	QUnit.test("fireDragEnter - preventDefault", function(assert) {

		// Arrange
		var oFakeEvent = createFakeEvent("dragenter"),
			fnStub = this.stub(),
			gridDragOver = GridDragOver.getInstance(),
			attachDragOverSpy = this.spy(gridDragOver, "handleDragOver");

		oFakeEvent.dragSession = this.oFakeSession;

		this.oGridDropInfo.attachDragEnter(function (oEvent) {
			fnStub(oEvent);

			oEvent.preventDefault();
		});

		// Act
		this.oGridDropInfo.fireDragEnter(oFakeEvent);

		// Assert
		assert.ok(fnStub.called, "Drag enter is called");

		assert.notOk(attachDragOverSpy.called, "'gridDragOver.handleDragOver' is not called");
	});

	QUnit.test("fireDragOver", function(assert) {
		// Arrange
		var oFakeEvent = createFakeEvent("dragover"),
			fnStub = this.stub();

		oFakeEvent.dragSession = this.oFakeSession;

		this.oGridDropInfo.attachDragOver(function (oEvent) {
			fnStub(oEvent);
		});

		// Act
		this.oGridDropInfo.fireDragOver(oFakeEvent);

		// Assert
		assert.ok(fnStub.called, "Drag over is called");
	});

	QUnit.test("fireDrop", function(assert) {
		// Arrange
		var oFakeEvent = createFakeEvent("drop"),
			fnStub = this.stub();

		oFakeEvent.dragSession = this.oFakeSession;

		this.oGridDropInfo.attachDrop(function (oEvent) {
			fnStub(oEvent);
		});

		// Act
		this.oGridDropInfo.fireDrop(oFakeEvent);

		// Assert
		assert.ok(fnStub.called, "Drop is called");
	});
});