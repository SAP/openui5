/*global QUnit, sinon*/

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/f/dnd/GridDragOver",
	"sap/f/GridContainer",
	"sap/f/GridContainerSettings",
	"sap/m/Text",
	"sap/ui/core/Core",
	"sap/base/Log"
], function(
	jQuery,
	createAndAppendDiv,
	GridDragOver,
	GridContainer,
	GridContainerSettings,
	Text,
	Core,
	Log
) {
	"use strict";

	createAndAppendDiv("content");

	createAndAppendDiv("fakeDnDIndicator");

	function createFakeDragOverEvent(oTargetControl) {
		var oFakeEvent = new jQuery.Event("dragover"),
			mTargetRect = oTargetControl.getDomRef().getBoundingClientRect();

		oFakeEvent.pageX = Math.ceil(mTargetRect.left + window.pageXOffset); // use Math.ceil because on Microsoft Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top + window.pageYOffset);
		oFakeEvent.target = oTargetControl.getDomRef();

		return oFakeEvent;
	}

	function createFakeDragSession() {
		return {
			setIndicatorConfig: function (oConfig) {
				this._indicatorConfig = oConfig;
			},
			getIndicatorConfig: function (oConfig) {
				return this._indicatorConfig;
			},
			getIndicator: function (oConfig) {
				return document.getElementById("fakeDnDIndicator");
			}
		};
	}

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

			this.fakeDragSession = createFakeDragSession();

			this.oGridDragOver.setCurrentContext(
				oDragItem,
				this.oGrid,
				"items",
				this.fakeDragSession
			);

			document.body.style.height = "2000px";
			window.scrollTo(0, 200);
		},
		afterEach: function () {
			this.oGridDragOver.destroy();
			this.oGrid.destroy();

			document.body.style.height = "";
			window.scrollTo(0, 0);
		}
	});

	QUnit.test("Simulate drag over", function(assert) {
		// Arrange
		var oTargetControl = this.oGrid.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl),
			mCoreIndicatorStyle;

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// wait 250ms and handle drag over again on same place
		this.clock.tick(250);

		this.oGridDragOver.handleDragOver(oFakeEvent);

		// Assert
		var mPosition = this.oGridDragOver.getSuggestedDropPosition();
		assert.ok(mPosition, "There is a suggested position after timeout");
		assert.strictEqual(mPosition.targetControl.sId, oTargetControl.sId, "The target control is correct");
		assert.strictEqual(mPosition.position, "Before", "The target position is 'Before'");
		assert.strictEqual(this.oGridDragOver._iDragFromIndex, 0, "The target index is correct.");

		// Assert if the default core DnD indicator is hidden
		mCoreIndicatorStyle = this.fakeDragSession.getIndicator().style;
		assert.strictEqual(mCoreIndicatorStyle.visibility, "hidden", "The default core indicator is hidden.");
		assert.strictEqual(mCoreIndicatorStyle.position, "relative", "The default core indicator has position:relative.");
	});

	QUnit.test("Simulate drag leave", function(assert) {
		// Arrange
		var oFakeEvent = new jQuery.Event("dragleave"),
			oTargetControl = this.oGrid.getItems()[0],
			mTargetRect = oTargetControl.getDomRef().getBoundingClientRect(),
			oSpy = sinon.spy(this.oGridDragOver, "scheduleEndDrag"),
			oText = new Text({ text: "control outside the grid"}),
			mCoreIndicatorStyle;

		oText.placeAt("content");
		Core.applyChanges();

		oFakeEvent.pageX = Math.ceil(mTargetRect.left + window.pageXOffset); // use Math.ceil because on Microsoft Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top + window.pageYOffset);

		// Act
		this.oGridDragOver._onDragLeave(oFakeEvent);

		// Assert
		assert.ok(oSpy.notCalled, "Should NOT end the drag when current position is within the container");

		// Arrange
		this.oGrid._scheduleIEPolyfill(true /* bImmediately */);
		mTargetRect = oText.getDomRef().getBoundingClientRect();
		oFakeEvent.pageX = Math.ceil(mTargetRect.left); // use Math.ceil because on Microsoft Edge sometimes the coordinates are fractions
		oFakeEvent.pageY = Math.ceil(mTargetRect.top);

		// Act
		this.oGridDragOver._onDragLeave(oFakeEvent);

		// Assert
		assert.ok(oSpy.calledOnce, "Should end the drag when current position is outside the container");

		// Assert if the default core DnD indicator is restored
		mCoreIndicatorStyle = this.fakeDragSession.getIndicator().style;
		assert.strictEqual(mCoreIndicatorStyle.visibility, "visible", "The default core indicator is restored to visible.");
		assert.strictEqual(mCoreIndicatorStyle.position, "absolute", "The default core indicator has position:absolute.");

		// Clean up
		oText.destroy();
		oSpy.restore();
	});

	QUnit.test("Simulate drag over interrupted by invalidation", function(assert) {
		// Arrange
		var $grid = this.oGrid.$(),
			oTargetControl = this.oGrid.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl);

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);
		this.clock.tick(250); // wait 250ms and handle drag over again on same place
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// Assert
		assert.ok($grid.find(".sapUiDnDGridIndicator").length, "The indicator is shown inside the grid.");

		// Act
		this.oGrid.invalidate();
		Core.applyChanges();

		// Assert
		assert.ok($grid.find(".sapUiDnDGridIndicator").length, "The indicator is restored after invalidation.");
	});

	QUnit.module("Drag over with custom drop indicator size", {
		beforeEach: function () {
			this.oGridDragOver = new GridDragOver();

			var oDropItem = new Text({text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."});

			this.oDragItem = new Text({text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."});

			this.oGrid = new GridContainer({
				layout: new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "10px"}),
				items: [oDropItem] // drop item is part of the grid, drag item is not
			});

			this.oGrid.placeAt("content");
			this.oDragItem.placeAt("content");
			Core.applyChanges();

			this.fakeDragSession = createFakeDragSession();

			this.oGridDragOver.setCurrentContext(
				this.oDragItem,
				this.oGrid,
				"items",
				this.fakeDragSession
			);
		},
		afterEach: function () {
			this.oGridDragOver.destroy();
			this.oGrid.destroy();
			this.oDragItem.destroy();
		}
	});

	QUnit.test("Set invalid size", function(assert) {
		// Arrange
		var fnErrorSpy = sinon.spy(Log, "error");

		// Act
		this.oGridDragOver.setDropIndicatorSize({
			invalid: "invalid"
		});

		// Assert
		assert.ok(fnErrorSpy.calledOnce, "An error is logged.");
		assert.strictEqual(this.oGridDragOver._mDropIndicatorSize, null, "The indicator is not set.");

		fnErrorSpy.restore();
	});

	QUnit.test("Set indicator size", function(assert) {
		// Arrange
		var oTargetControl = this.oGrid.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl);

		// Act
		this.oGridDragOver.setDropIndicatorSize({
			rows: 3,
			columns: 5
		});
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// wait 250ms and handle drag over again on same place
		this.clock.tick(250);
		this.oGridDragOver.handleDragOver(oFakeEvent);

		Core.applyChanges();
		this.clock.tick(500);

		// Assert
		var $indicator = jQuery(".sapUiDnDGridIndicator"),
			iExpectedWidth = 5 * 80 + 4 * 10, // 5 columns and 4 gaps
			iExpectedHeight = 3 * 80 + 2 * 10; // 3 rows and 2 gaps

		assert.strictEqual($indicator.outerWidth(), iExpectedWidth, "The indicator has the expected width.");
		assert.strictEqual($indicator.outerHeight(), iExpectedHeight, "The indicator has the expected height.");
	});

	QUnit.module("Drag between two Grid containers", {
		beforeEach: function () {
			this.oGridDragOver = new GridDragOver();

			var oDropItem = new Text({text: "Item content"});

			this.oGrid1 = new GridContainer("dragContainer", {
				layout: new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "10px"}),
				items: [
					new Text({text: "Drag container - item 1"}),
					new Text("dragContainer_item2", {text: "Drag container - item 2"})
				]
			});

			this.oGrid2 = new GridContainer({
				layout: new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "10px"}),
				items: [oDropItem]
			});

			this.oGrid1.placeAt("content");
			this.oGrid2.placeAt("content");
			Core.applyChanges();

			this.fakeDragSession = createFakeDragSession();

			this.oGridDragOver.setCurrentContext(
				this.oGrid1.getItems()[0],
				this.oGrid2,
				"items",
				this.fakeDragSession
			);
		},
		afterEach: function () {
			this.oGridDragOver.destroy();
			this.oGrid1.destroy();
			this.oGrid2.destroy();
		}
	});

	QUnit.test("Check if the dragged keeps its original place", function(assert) {
		// Arrange
		var oTargetControl = this.oGrid2.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl);

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// wait 250ms and handle drag over again on same place
		this.clock.tick(250);
		this.oGridDragOver.handleDragOver(oFakeEvent);

		Core.applyChanges();
		this.clock.tick(500);

		assert.strictEqual(jQuery("#dragContainer").outerHeight(), 80, "The drag container has the expected height.");
		assert.strictEqual(jQuery("#dragContainer .sapMText")[0].style.display, "none", "The drag element is hidden.");
	});

	QUnit.test("Check if the dragged keeps its original place when polyfill is used", function(assert) {
		// Arrange
		var oTargetControl = this.oGrid2.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl);

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);
		var oSecondItemWrapper = jQuery("#dragContainer_item2").parent(),
			sSecondItemLeftPosition = oSecondItemWrapper.css("left");

		// wait 250ms and handle drag over again on same place
		this.clock.tick(250);
		this.oGridDragOver.handleDragOver(oFakeEvent);

		Core.applyChanges();
		this.clock.tick(500);

		var sSecondItemLeftPositionAfterDrag = oSecondItemWrapper.css("left");

		assert.strictEqual(sSecondItemLeftPositionAfterDrag, sSecondItemLeftPosition, "The second item wrapper didn't shrink while dragging the item to the other container.");
	});

	QUnit.test("Drag over an empty grid", function(assert) {
		// Arrange
		var oTargetControl = this.oGrid1.getItems()[0],
			oFakeEvent = createFakeDragOverEvent(oTargetControl);

		this.oGrid2.destroyItems();

		// Act
		this.oGridDragOver.handleDragOver(oFakeEvent);

		// wait 250ms and handle drag over again on same place
		this.clock.tick(250);

		this.oGridDragOver.handleDragOver(oFakeEvent);

		var mSuggestedPosition = this.oGridDragOver.getSuggestedDropPosition();

		assert.ok(mSuggestedPosition, "There is a suggested drop position.");
		assert.strictEqual(mSuggestedPosition.targetControl, null, "The target of the drop position is null.");
		assert.strictEqual(mSuggestedPosition.position, "After", "The drop position is 'After'.");
	});
});