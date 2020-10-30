/*global QUnit, sinon */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/GenericTile",
	"sap/ui/qunit/QUnitUtils",
	"sap/m/Button"
],
function (
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
});
