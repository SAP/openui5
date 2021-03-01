/*global QUnit, sinon */

sap.ui.define([
	"sap/f/delegate/GridItemNavigation",
	"sap/f/GridContainer",
	"sap/f/GridNavigationMatrix",
	"sap/f/library",
	"sap/m/GenericTile",
	"sap/ui/core/Core",
	"sap/ui/events/KeyCodes",
	"sap/ui/thirdparty/jquery"
], function (
	GridItemNavigation,
	GridContainer,
	GridNavigationMatrix,
	fLibrary,
	GenericTile,
	Core,
	KeyCodes,
	jQuery
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture";
	var NavigationDirection = fLibrary.NavigationDirection;
	var EMPTY_CELL = GridNavigationMatrix.EMPTY_CELL;

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

	QUnit.test("No error when matrix can't be calculated", function (assert) {
		// Arrange
		var fnThemeAppliedFake = sinon.stub(Core, "isThemeApplied").returns(false),
			oGrid = this.oGrid,
			$itemWrapper = jQuery(oGrid.getItems()[0].getDomRef().parentElement),
			oFakeEvent = new jQuery.Event("keydown", {
				keyCode: KeyCodes.ARROW_LEFT
			});

		$itemWrapper.trigger(oFakeEvent);

		// Assert
		assert.ok(true, "There is no error if events are called before rendering or before theme is applied.");

		// Clean up
		fnThemeAppliedFake.restore();
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

	QUnit.module("#focusItemByDirection", {
		beforeEach: function () {
			this.$grid = jQuery(
				"<div></div>"
			);

			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			this.oItemNavigation = new GridItemNavigation();
			this.oItemNavigation.setRootDomRef(this.$grid[0]);
		},
		afterEach: function () {
			this.$grid.detach();
		}
	});

	QUnit.test("DOWN direction. Search column when there are no rows", function (assert) {
		// arrange
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [],
					rows: [] // no rows
				});
			}.bind(this)
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Down, null, 1);

		// assert
		assert.ok(true, "There is no error when there are no rows");
	});

	QUnit.test("DOWN direction. Search column out of range", function (assert) {
		// arrange
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [], // no columns
					rows: ["120px"]
				});
			}.bind(this)
		};
		var iOutOfRange = 100000;

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Down, null, iOutOfRange);

		// assert
		assert.ok(true, "There is no attempt to access column" + iOutOfRange + ". No error thrown");
	});

	QUnit.test("UP direction. Search column when there are no rows", function (assert) {
		// arrange
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [],
					rows: [] // no rows
				});
			}.bind(this)
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Up, null, 1);

		// assert
		assert.ok(true, "There is no error when there are no rows");
	});

	QUnit.test("UP direction. Search column out of range", function (assert) {
		// arrange
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [], // no columns
					rows: ["120px"]
				});
			}.bind(this)
		};
		var iOutOfRange = 0;

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Up, null, iOutOfRange);

		// assert
		assert.ok(true, "There is no attempt to access row " + iOutOfRange + ". No error thrown");
	});

	QUnit.test("DOWN direction. Row found is correct", function (assert) {
		// arrange
		var oFakeItem = document.createElement("div");
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return [
					[oFakeItem],
					[EMPTY_CELL]
				];
			}
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Down, null, 0);

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
	});

	QUnit.test("DOWN direction. Row found is correct when there are empty cells", function (assert) {
		// arrange
		var oFakeItem = document.createElement("div");
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return [
					[EMPTY_CELL],
					[EMPTY_CELL],
					[EMPTY_CELL],
					[oFakeItem],
					[EMPTY_CELL]
				];
			}
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Down, null, 0);

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 3, "Row index is correct");
	});

	QUnit.test("UP direction. Row found is correct", function (assert) {
		// arrange
		var oFakeItem = document.createElement("div");
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return [
					[EMPTY_CELL],
					[oFakeItem]
				];
			}
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Up, null, 0);

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
	});

	QUnit.test("UP direction. Row found is correct when there are empty cells", function (assert) {
		// arrange
		var oFakeItem = document.createElement("div");
		var oFakeGrid = {
			getNavigationMatrix: function () {
				return [
					[EMPTY_CELL],
					[oFakeItem],
					[oFakeItem],
					[EMPTY_CELL],
					[EMPTY_CELL]
				];
			}
		};

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Up, null, 0);

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
	});
});
