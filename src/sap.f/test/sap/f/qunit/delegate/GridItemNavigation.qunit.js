/*global QUnit, sinon */

sap.ui.define([
	"sap/f/delegate/GridItemNavigation",
	"sap/f/GridContainer",
	"sap/f/GridNavigationMatrix",
	"sap/m/GenericTile",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function (
	GridItemNavigation,
	GridContainer,
	GridNavigationMatrix,
	GenericTile,
	Core,
	KeyCodes,
	jQuery
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

	QUnit.module("Focus", {
		beforeEach: function () {
			/* TODO replace with display: grid after the end of support for Internet Explorer */
			this.$grid = jQuery(
				"<div style='width: 250px;'>" +
					"<div style='display: inline-block; width: 120px; height: 80px;'> item1 </div>" +
					"<div style='display: inline-block; width: 120px' height: 80px;'> item2 </div>" +
					"<div style='display: inline-block; width: 120px' height: 80px;'> item3 </div>" +
					"<div style='display: inline-block; width: 120px' height: 80px;'> item4 </div>" +
				"</div>"
			);

			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			this.oItemNavigation = new GridItemNavigation();
			this.oItemNavigation.setRootDomRef(this.$grid[0]);
			this.oItemNavigation.setItemDomRefs(this.$grid.children().get());
			sinon.stub(this.oItemNavigation, "_getGridInstance").callsFake(function () {
				return {
					getNavigationMatrix: function () {
						return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
							gap: 8,
							columns: ["120px", "120px"],
							rows: ["80px", "80px"]
						});
					}.bind(this)
				};
			}.bind(this));
		},
		afterEach: function () {
			this.$grid.detach();
			this.oItemNavigation._getGridInstance.restore();
		}
	});

	QUnit.test("Focus position is restored when item is tapped", function (assert) {
		// act
		this.oItemNavigation.onsapnext({
			target: this.$grid.children()[0],
			preventDefault: function () {},
			keyCode: KeyCodes.ARROW_DOWN
		});

		// assert
		assert.ok(this.oItemNavigation._mCurrentPosition, "Position is set");

		// act
		this.oItemNavigation.ontap();

		// assert
		assert.notOk(this.oItemNavigation._mCurrentPosition, "Position is reset after tapping on item");
	});

	QUnit.module("Focus when grid doesn't have navigation matrix yet (theme not loaded)", {
		beforeEach: function () {
			this.$grid = jQuery(
				"<div>" +
					"<div> item1 </div>" +
				"</div>"
			);

			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			this.oItemNavigation = new GridItemNavigation();
			this.oItemNavigation.setRootDomRef(this.$grid[0]);
			sinon.stub(this.oItemNavigation, "_getGridInstance").callsFake(function () {
				return {
					getNavigationMatrix: function () {
						return null;
					}
				};
			});
		},
		afterEach: function () {
			this.$grid.detach();
			this.oItemNavigation._getGridInstance.restore();
		}
	});

	QUnit.test("Initial focus", function (assert) {
		this.oItemNavigation.onfocusin({
			target: this.$grid.get(0),
			preventDefault: function () {},
			stopPropagation: function () {}
		});

		assert.ok(true, "There is no attempt to access 'null' matrix (no error thrown)");
	});
});
