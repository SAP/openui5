/*global QUnit, sinon */

sap.ui.define([
	"sap/f/delegate/GridContainerItemNavigation",
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/GenericTile",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Button"
],
function (
	GridContainerItemNavigation,
	GridContainer,
	Core,
	GenericTile,
	QUnitUtils,
	Button
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Focus handling", {
		beforeEach: function () {
			this.oGrid = new GridContainer({
				items: [
					new GenericTile({ header: "Tile 1" }),
					new GenericTile({ header: "Tile 2" })
				]
			});
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Item should not be explicitly focused while dragged", function (assert) {
		// Arrange
		var oGrid = this.oGrid,
			oButton = new Button({}),
			oItem = oGrid.getItems()[0],
			oItemWrapper,
			oItemWrapperFocusSpy;

		oButton.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		oItemWrapper = oItem.getDomRef().parentElement;
		oItemWrapperFocusSpy = sinon.spy(oItemWrapper, "focus");

		// Act - simulate sequence of events during drag and drop
		QUnitUtils.triggerMouseEvent(oItem.getFocusDomRef(), "mousedown");
		oItem.$().trigger("focus");
		oButton.$().trigger("focus"); // simulates focus leave while dragging is performed
		oItem.$().trigger("focus");

		// Assert
		assert.ok(oItemWrapperFocusSpy.notCalled, "The item is not explicitly focused while mouse is still down.");

		oItemWrapperFocusSpy.restore();
	});

	QUnit.module("Mouse down check");

	QUnit.test("IsMouseDown flag is released after mouseup, drop and dragend", function (assert) {
		// Arrange
		var oNavigation = new GridContainerItemNavigation();

		// Assert
		assert.notOk(oNavigation._bIsMouseDown, "IsMouseDown flag is false initially.");

		QUnitUtils.triggerEvent("mousedown", oNavigation);
		assert.ok(oNavigation._bIsMouseDown, "IsMouseDown flag is true after mouse down event.");

		["mouseup", "drop", "dragend"].forEach(function (sEvent) {
			QUnitUtils.triggerEvent("mousedown", oNavigation);
			QUnitUtils.triggerEvent(sEvent, oNavigation);
			assert.notOk(oNavigation._bIsMouseDown, "IsMouseDown flag is false after " + sEvent);
		});
	});
});
