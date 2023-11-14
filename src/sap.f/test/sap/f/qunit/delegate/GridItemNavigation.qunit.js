/*global QUnit */

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

	const DOM_RENDER_LOCATION = "qunit-fixture";
	const NavigationDirection = fLibrary.NavigationDirection;
	const EMPTY_CELL = GridNavigationMatrix.EMPTY_CELL;

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

	QUnit.test("Scrolling is prevented when navigating with keyboard", function (assert) {
		// Arrange
		const $itemWrapper = jQuery(this.oGrid.getItems()[0].getDomRef().parentElement);

		[
			KeyCodes.ARROW_DOWN,
			KeyCodes.ARROW_UP,
			KeyCodes.ARROW_LEFT,
			KeyCodes.ARROW_RIGHT,
			KeyCodes.PAGE_DOWN,
			KeyCodes.PAGE_UP
		].forEach(function (iKeyCode) {
			const oFakeEvent = new jQuery.Event("keydown", {
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
		const oGrid = this.oGrid,
			$itemWrapper = jQuery(oGrid.getItems()[0].getDomRef().parentElement),
			oFakeEvent = new jQuery.Event("keydown", {
				keyCode: KeyCodes.ARROW_LEFT
			});

		this.stub(Core, "isThemeApplied").returns(false);

		$itemWrapper.trigger(oFakeEvent);

		// Assert
		assert.ok(true, "There is no error if events are called before rendering or before theme is applied.");
	});

	QUnit.module("Focus", {
		beforeEach: function () {
			this.$grid = jQuery(`
				<div>
					<div> item1 </div>
					<div> item2 </div>
					<div> item3 </div>
					<div> item4 </div>
				</div>
			`).css({
				display: "grid",
				gridTemplateColumns: "repeat(2, 120px)",
				gridTemplateRows: "80px",
				gridGap: "8px"
			});

			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			this.oItemNavigation = new GridItemNavigation();
			this.oItemNavigation.setRootDomRef(this.$grid[0]);
			this.oItemNavigation.setItemDomRefs(this.$grid.children().get());
			this.stub(this.oItemNavigation, "_getGridInstance").callsFake(function () {
				return {
					getNavigationMatrix: function () {
						return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
							gap: 8,
							columns: this.$grid.css("gridTemplateColumns").split(/\s+/),
							rows: this.$grid.css("gridTemplateRows").split(/\s+/)
						});
					}.bind(this)
				};
			}.bind(this));
		},
		afterEach: function () {
			this.$grid.detach();
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
			this.stub(this.oItemNavigation, "_getGridInstance").callsFake(function () {
				return {
					getNavigationMatrix: function () {
						return null;
					}
				};
			});
		},
		afterEach: function () {
			this.$grid.detach();
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

	QUnit.module("Keyboard Navigation", {
		beforeEach: function () {
			this.$grid = jQuery(`
				<div>
					<div>item1</div>
					<div>item2</div>
					<div>item3</div>
					<div>item4</div>
					<div>item5</div>
					<div>item6</div>
					<div>item7</div>
					<div>item8</div>
					<div>item9</div>
				</div>
			`);

			this.$grid.appendTo("#" + DOM_RENDER_LOCATION);
			this.oItemNavigation = new GridItemNavigation();
			this.oItemNavigation.setRootDomRef(this.$grid[0]);
			this.oItemNavigation.setItemDomRefs(this.$grid.children().get());
			this.oBorderReachedSpy = this.spy();
			this.stub(this.oItemNavigation, "_getGridInstance").callsFake(function () {
				return {
					getNavigationMatrix: function () {
						return this.oNavigationMatrix;
					}.bind(this),
					onItemNavigationBorderReached: this.oBorderReachedSpy
				};
			}.bind(this));
		},
		afterEach: function () {
			this.$grid.detach();
		}
	});

	QUnit.test("Keyboard Navigation: PAGE_DOWN ", function (assert) {
		// arrange
		const [oItem1, oItem2] = this.$grid.children().get();

		this.oNavigationMatrix = [
				[oItem1],
				[EMPTY_CELL],
				[oItem2]
			];

		// act
		this.oItemNavigation.onsappagedown(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_DOWN,
			target: oItem1
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 2, "Row index is correct");
		assert.ok(this.oBorderReachedSpy.notCalled, "Border reached event is NOT fired");

		// act
		this.oItemNavigation.onsappagedown(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_DOWN,
			target: oItem2
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 2, "Row index is correct");
		assert.ok(this.oBorderReachedSpy.called, "Border reached event is fired");
		assert.strictEqual(this.oBorderReachedSpy.args[0][0].direction, NavigationDirection.Down, "Border reached direction is correct");
	});

	QUnit.test("Keyboard Navigation: PAGE_DOWN when the last item is empty cell", function (assert) {
		// arrange
		const [oItem1, oItem2] = this.$grid.children().get();

		this.oNavigationMatrix = [
				[oItem1],
				[oItem2],
				[EMPTY_CELL]
			];

		// act
		this.oItemNavigation.onsappagedown(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_DOWN,
			target: oItem1
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
	});

	QUnit.test("Keyboard Navigation: PAGE_UP ", function (assert) {
		// arrange
		const [oItem1, oItem2] = this.$grid.children().get();
		this.oNavigationMatrix = [
				[oItem1],
				[EMPTY_CELL],
				[oItem2]
			];
		this.oItemNavigation.onsappagedown(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_DOWN,
			target: oItem1
		}));

		// act
		this.oItemNavigation.onsappageup(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_UP,
			target: oItem2
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
		assert.ok(this.oBorderReachedSpy.notCalled, "Border reached event is NOT fired");

		// act
		this.oItemNavigation.onsappageup(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_UP,
			target: oItem1
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
		assert.ok(this.oBorderReachedSpy.called, "Border reached event is fired");
		assert.strictEqual(this.oBorderReachedSpy.args[0][0].direction, NavigationDirection.Up, "Border reached direction is correct");
	});

	QUnit.test("Keyboard Navigation: Arrows ", function (assert) {
		// arrange
		const [oItem1, oItem2, oItem3, oItem4, oItem5, oItem6, oItem7, oItem8, oItem9] = this.$grid.children().get();

		this.oNavigationMatrix = [
				[oItem1, oItem2, oItem3],
				[oItem4, oItem5, oItem6],
				[oItem7, oItem8, oItem9]
			];

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_RIGHT,
			target: oItem1
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 1, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_RIGHT,
			target: oItem2
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 2, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_DOWN,
			target: oItem3
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 2, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_DOWN,
			target: oItem6
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 2, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 2, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_LEFT,
			target: oItem9
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 2, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 1, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_LEFT,
			target: oItem8
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 2, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 0, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_UP,
			target: oItem7
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 0, "Column index is correct");

		// act
		this.oItemNavigation._moveFocus(new jQuery.Event("keydown", {
			keyCode: KeyCodes.ARROW_UP,
			target: oItem4
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 0, "Row index is correct");
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.column, 0, "Column index is correct");
	});

	QUnit.test("Keyboard Navigation: PAGE_UP when the first item is empty cell ", function (assert) {
		// arrange
		const [oItem1, oItem2] = this.$grid.children().get();
		this.oNavigationMatrix = [
				[EMPTY_CELL],
				[oItem1],
				[oItem2]
			];
		this.oItemNavigation.onsappagedown(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_DOWN,
			target: oItem1
		}));

		// act
		this.oItemNavigation.onsappageup(new jQuery.Event("keydown", {
			keyCode: KeyCodes.PAGE_UP,
			target: oItem2
		}));

		// assert
		assert.strictEqual(this.oItemNavigation._mCurrentPosition.row, 1, "Row index is correct");
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
		const oFakeGrid = {
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
		const oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [], // no columns
					rows: ["120px"]
				});
			}.bind(this)
		};
		const iOutOfRange = 100000;

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Down, null, iOutOfRange);

		// assert
		assert.ok(true, "There is no attempt to access column" + iOutOfRange + ". No error thrown");
	});

	QUnit.test("UP direction. Search column when there are no rows", function (assert) {
		// arrange
		const oFakeGrid = {
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
		const oFakeGrid = {
			getNavigationMatrix: function () {
				return GridNavigationMatrix.create(this.$grid[0], this.$grid.children().get(), {
					gap: 8,
					columns: [], // no columns
					rows: ["120px"]
				});
			}.bind(this)
		};
		const iOutOfRange = 0;

		// act
		this.oItemNavigation.focusItemByDirection(oFakeGrid, NavigationDirection.Up, null, iOutOfRange);

		// assert
		assert.ok(true, "There is no attempt to access row " + iOutOfRange + ". No error thrown");
	});

	QUnit.test("DOWN direction. Row found is correct", function (assert) {
		// arrange
		const oFakeItem = document.createElement("div");
		const oFakeGrid = {
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
		const oFakeItem = document.createElement("div");
		const oFakeGrid = {
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
		const oFakeItem = document.createElement("div");
		const oFakeGrid = {
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
		const oFakeItem = document.createElement("div");
		const oFakeGrid = {
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
