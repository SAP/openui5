/*global QUnit */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/GenericTile",
	"sap/f/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/ui/Device"
],
function (
	GridContainer,
	Core,
	GenericTile,
	Card,
	GridContainerItemLayoutData,
	Device
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		EDGE_VERSION_WITH_GRID_SUPPORT = 16;

	function isGridSupportedByBrowser() {
		return !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);
	}

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {
		// Act
		var oGrid = new GridContainer();

		// Assert
		assert.ok(oGrid.isA("sap.f.GridContainer"), "GridContainer is initialized");
		assert.strictEqual(oGrid.getSnapToRow(), false, "GridContainer spanToRow property is false");

		assert.ok(oGrid.getActiveLayoutSettings().isA("sap.f.GridContainerSettings"), false, "GridContainer spanToRow property is false");
	});

	QUnit.module("Items", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Render items", function (assert) {
		// Arrange
		this.oGrid
			.addItem(new GenericTile({id: "tile1", header: "Comulative Tools"}))
			.addItem(new GenericTile({id: "tile2", header: "Travel and Expenses"}));

		// Act
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.getDomRef(), "GridContainer is rendered");
		assert.ok(this.oGrid.$().find("#tile1").length, "Item 1 is rendered");
		assert.ok(this.oGrid.$().find("#tile2").length, "Item 2 is rendered");
	});

	QUnit.test("Items positioning", function (assert) {
		// Arrange
		this.oGrid
			.addItem(new GenericTile({
				id: "tile1",
				header: "Comulative Tools",
				layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
			}))
			.addItem(new GenericTile({
				id: "tile2",
				header: "Travel and Expenses"
			}))
			.addItem(new Card({
				id: "card1",
				height: "400px",
				layoutData: new GridContainerItemLayoutData({ columns: 4 })
			}));

		// Act
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		var $wrapper1 = this.oGrid.$().find("#tile1").parent(),
			$wrapper2 = this.oGrid.$().find("#tile2").parent(),
			$wrapper3 = this.oGrid.$().find("#card1").parent();

		if (isGridSupportedByBrowser()) {
			assert.strictEqual($wrapper1.css("grid-row-start"), "span 2", "Item 1 is positioned on 2 rows");
			assert.strictEqual($wrapper1.css("grid-column-start"), "span 2", "Item 1 is positioned on 2 columns");

			assert.strictEqual($wrapper2.css("grid-row-start"), "span 2", "Item 2 is positioned on 2 rows as specified from minRows");

			assert.strictEqual($wrapper3.css("grid-row-start"), "span 5", "Item 3 is positioned on 5 rows which was auto calculated based on it's height");
			assert.strictEqual($wrapper3.css("grid-column-start"), "span 4", "Item 3 is positioned on 4 columns");
		} else {
			// tests for ie and edge
			var cellSize = 80,
				gapSize = 16;

			// TODO extend those tests to check positioning as well
			assert.strictEqual($wrapper1.height(), 2 * cellSize + gapSize, "Item 1 is positioned on 2 rows");
			assert.strictEqual($wrapper1.width(), 2 * cellSize + gapSize, "Item 1 is positioned on 2 columns");

			assert.strictEqual($wrapper2.height(), 2 * cellSize + gapSize, "Item 2 is positioned on 2 rows as specified from minRows");

			assert.strictEqual($wrapper3.height(), 5 * cellSize + 4 * gapSize, "Item 3 is positioned on 5 rows which was auto calculated based on it's height");
			assert.strictEqual($wrapper3.width(), 4 * cellSize + 3 * gapSize, "Item 3 is positioned on 4 columns");
		}
	});

});