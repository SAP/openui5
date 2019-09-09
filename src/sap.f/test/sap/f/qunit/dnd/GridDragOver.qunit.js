/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/f/dnd/GridDragOver",
	"sap/f/GridContainer",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/ui/Device"
], function(jQuery, createAndAppendDiv, GridDragOver, GridContainer, Text, Core, Device) {
	"use strict";

	createAndAppendDiv("content");

	QUnit.module("Initialization");

	QUnit.test("Instance", function(assert) {
		var oInstance = GridDragOver.getInstance();

		assert.ok(oInstance.isA("sap.f.dnd.GridDragOver"), "GridDragOver is initialized");
	});

	QUnit.module("Drag over grid", {
		beforeEach: function () {
			this.oGridDragOver = new GridDragOver();

			var oDropItem = new Text({text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}),
				oDragItem = new Text({text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."});

			this.oGrid = new GridContainer({
				dragDropConfig: this.oGridDropInfo,
				items: [oDropItem, oDragItem]
			});

			this.oGrid.placeAt("content");
			Core.applyChanges();

			this.oGridDragOver.setCurrentContext(
				oDragItem,
				this.oGrid,
				"items"
			);
		},
		afterEach: function () {
			this.oGridDragOver.destroy();
			this.oGrid.destroy();
		}
	});

	QUnit.test("Simulate drag over", function(assert) {
		// Arrange
		var done = assert.async(),
			oFakeEvent = new jQuery.Event("dragover"),
			oTargetControl = this.oGrid.getItems()[0],
			mTargetRect = oTargetControl.getDomRef().getBoundingClientRect();

		oFakeEvent.pageX = Math.ceil(mTargetRect.left); // use Math.ceil because on Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top);
		oFakeEvent.target = oTargetControl.getDomRef();

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// wait 250ms and handle drag over again on same place
		setTimeout(function () {
			this.oGridDragOver.handleDragOver(oFakeEvent);

			// Assert
			var mPosition = this.oGridDragOver.getSuggestedDropPosition();
			assert.ok(mPosition, "There is a suggested position after timeout");
			assert.strictEqual(mPosition.targetControl.sId, oTargetControl.sId, "The target control is correct");
			assert.strictEqual(mPosition.position, "Before", "The target position is 'Before'");

			done();
		}.bind(this), 250);
	});

	QUnit.test("Simulate drag leave", function(assert) {
		// Arrange
		var oFakeEvent = new jQuery.Event("dragleave"),
			oTargetControl = this.oGrid.getItems()[0],
			mTargetRect = oTargetControl.getDomRef().getBoundingClientRect(),
			oSpy = sinon.spy(this.oGridDragOver, "scheduleEndDrag"),
			oText = new Text({ text: "control outside the grid"});

		oText.placeAt("content");
		Core.applyChanges();

		oFakeEvent.pageX = Math.ceil(mTargetRect.left); // use Math.ceil because on Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top);

		// Act
		this.oGridDragOver._onDragLeave(oFakeEvent);

		// Assert
		assert.ok(oSpy.notCalled, "Should NOT end the drag when current position is within the container");

		// Arrange
		this.oGrid._scheduleIEPolyfill(true /* bImmediately */);
		mTargetRect = oText.getDomRef().getBoundingClientRect();
		oFakeEvent.pageX = Math.ceil(mTargetRect.left); // use Math.ceil because on Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top);

		// Act
		this.oGridDragOver._onDragLeave(oFakeEvent);

		// Assert
		assert.ok(oSpy.calledOnce, "Should end the drag when current position is outside the container");

		// Clean up
		oText.destroy();
		oSpy.restore();
	});
});