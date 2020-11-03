/*global QUnit */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/m/GenericTile",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes"
], function (
	GridContainer,
	GenericTile,
	Core,
	KeyCodes
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";

	QUnit.module("Events", {
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

	QUnit.test("Scrolling is prevented when navigating with arrow keys", function (assert) {
		// Arrange
		var $itemWrapper = jQuery(this.oGrid.getItems()[0].getDomRef().parentElement);

		[
			KeyCodes.ARROW_DOWN,
			KeyCodes.ARROW_UP,
			KeyCodes.ARROW_LEFT,
			KeyCodes.ARROW_RIGHT
		].forEach(function (iKeyCode) {
			var oFakeEvent = new jQuery.Event("keydown", {
				keyCode: iKeyCode
			});

			// Act
			$itemWrapper.trigger(oFakeEvent);

			// Assert
			assert.ok(oFakeEvent.isDefaultPrevented(), "Default action (scroll) is prevented for event with keycode: " + iKeyCode);
		});

	});
});
