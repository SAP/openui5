/*global QUnit */

sap.ui.define([
	"sap/f/delegate/GridContainerItemNavigation",
	"sap/f/GridContainer",
	"sap/m/GenericTile",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/m/Button"
],
function (
	GridContainerItemNavigation,
	GridContainer,
	GenericTile,
	QUnitUtils,
	nextUIUpdate,
	Button
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Focus handling", {
		beforeEach: async function () {
			this.oGrid = new GridContainer({
				items: [
					new GenericTile({ header: "Tile 1" }),
					new GenericTile({ header: "Tile 2" })
				]
			});
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			await nextUIUpdate();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Item should not be explicitly focused while dragged", async function (assert) {
		// Arrange
		var oGrid = this.oGrid,
			oButton = new Button({}),
			oItem = oGrid.getItems()[0],
			oItemWrapper,
			oItemWrapperFocusSpy;

		oButton.placeAt(DOM_RENDER_LOCATION);
		await nextUIUpdate();

		oItemWrapper = oItem.getDomRef().parentElement;
		oItemWrapperFocusSpy = this.spy(oItemWrapper, "focus");

		// Act - simulate sequence of events during drag and drop
		QUnitUtils.triggerMouseEvent(oItem.getFocusDomRef(), "mousedown");
		oItem.$().trigger("focus");
		oButton.$().trigger("focus"); // simulates focus leave while dragging is performed
		oItem.$().trigger("focus");

		// Assert
		assert.ok(oItemWrapperFocusSpy.notCalled, "The item is not explicitly focused while mouse is still down.");
	});
});
