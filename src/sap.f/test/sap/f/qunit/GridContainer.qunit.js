/*global QUnit, sinon */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/GenericTile",
	"sap/f/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/f/GridContainerSettings",
	"sap/ui/Device"
],
function (
	GridContainer,
	Core,
	GenericTile,
	Card,
	GridContainerItemLayoutData,
	GridContainerSettings,
	Device
) {
	"use strict";

	var DOM_RENDER_LOCATION = "qunit-fixture",
		EDGE_VERSION_WITH_GRID_SUPPORT = 16,
		bIsGridSupported = !Device.browser.msie && !(Device.browser.edge && Device.browser.version < EDGE_VERSION_WITH_GRID_SUPPORT);

	/**
	 * Test if grid settings are applied to the grid in DOM
	 *
	 * @param {sap.f.GridContainer} oGrid The grid
	 * @param {sap.f.GridContainerSettings} oSettings Expected settings
	 * @param {string} sLayout Layout under test
	 * @param {Assert} assert Assert
	 */
	function assertGridSettings(oGrid, oSettings, sLayout, assert) {
		var oGridStyle = oGrid.getDomRef().style,
			expectedColumnsTemplate = "repeat(" + (oSettings.getColumns() || "auto-fill") + ", " + oSettings.getColumnSize() + ")";

		if (bIsGridSupported) {
			assert.strictEqual(oGridStyle.getPropertyValue("grid-template-columns"), expectedColumnsTemplate, "Grid has expected column template settings for layout '" + sLayout + "'");
			assert.strictEqual(oGridStyle.getPropertyValue("grid-auto-rows"), oSettings.getRowSize(), "Grid has expected row size for '" + sLayout + "'");

			// test row-gap and column-gap, because grid-gap can not be tested directly
			assert.strictEqual(oGridStyle.getPropertyValue("row-gap"), oSettings.getGap(), "Grid has expected row gap for '" + sLayout + "'");
			assert.strictEqual(oGridStyle.getPropertyValue("column-gap"), oSettings.getGap(), "Grid has expected column gap for '" + sLayout + "'");
		} else {
			assert.strictEqual(oGrid.getActiveLayoutSettings(), oSettings, "Grid has expected settings for '" + sLayout + "'");
		}
	}

	/**
	 * Calculates expected top and left for the given item, relative to the previous item.
	 * To be used for IE and Edge tests
	 *
	 * @param {jQuery} $grid The grid
	 * @param {jQuery} $item The item to be tested
	 * @param {jQuery} $previousItem The previous item. Null if there is no previous item.
	 * @param {Number} iGapSize Gap size
	 * @returns {Object} Object containing expected top and left position
	 */
	function calcExpectedPosition($grid, $item, $previousItem, iGapSize) {
		// tests for ie and edge
		var iPrevBottom = 0,
			iPrevRight = 0,
			iExpectedTop = 0,
			iExpectedLeft = 0;

		// assert that the current grid item is positioned well relative to the last grid item
		if ($previousItem) {
			iPrevBottom = parseInt($previousItem.css("top")) + $previousItem.height();
			iPrevRight = parseInt($previousItem.css("left")) + $previousItem.width();

			if (iPrevRight + iGapSize + $item.width() > $grid.width()) {
				iExpectedTop = iPrevBottom + iGapSize;
				iExpectedLeft = 0;
			} else {
				iExpectedTop = parseInt($previousItem.css("top"));
				iExpectedLeft = iPrevRight + iGapSize;
			}
		}

		return {
			"top": iExpectedTop,
			"left": iExpectedLeft
		};
	}

	QUnit.module("Init");

	QUnit.test("Initialization", function (assert) {
		// Act
		var oGrid = new GridContainer();

		// Assert
		assert.ok(oGrid.isA("sap.f.GridContainer"), "GridContainer is initialized");
		assert.strictEqual(oGrid.getSnapToRow(), false, "GridContainer snapToRow property is false");

		assert.ok(oGrid.getActiveLayoutSettings().isA("sap.f.GridContainerSettings"), true, "GridContainer has default layout settings");
	});

	QUnit.module("Properties", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Snap to row", function (assert) {
		// Arrange
		this.oGrid.setSnapToRow(true);

		// Act
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.$().hasClass("sapFGridContainerSnapToRow"), "Has class sapFGridContainerSnapToRow when snapToRow is true");
	});

	QUnit.test("Height and width", function (assert) {
		// Arrange
		this.oGrid.setWidth("100px");
		this.oGrid.setHeight("100px");

		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().width(), 100, "Width is as expected");
		assert.strictEqual(this.oGrid.$().height(), 100, "Heioght is as expected");
	});

	QUnit.test("Tooltip", function (assert) {
		// Arrange
		var sExample = "Some tooltip";
		this.oGrid.setTooltip(sExample);

		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().attr("title"), sExample, "The grid has the expected tooltip");
	});

	QUnit.module("Items", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
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
		Core.applyChanges();

		// Assert
		assert.ok(this.oGrid.getDomRef(), "GridContainer is rendered");
		assert.ok(this.oGrid.$().find("#tile1").length, "Item 1 is rendered");
		assert.ok(this.oGrid.$().find("#tile2").length, "Item 2 is rendered");
	});

	QUnit.test("Add/remove items", function (assert) {
		// Arrange
		var oItem = new GenericTile({id: "tile1", header: "Comulative Tools"});

		// Act
		this.oGrid.addItem(oItem);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().find("#tile1").length, 1, "Item 1 is rendered");

		// Act
		this.oGrid.removeItem(oItem);
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().find("#tile1").length, 0, "Item 1 is not rendered inside the grid");

		oItem.destroy();
	});

	QUnit.test("Items positioning", function (assert) {
		// Arrange
		var aExamples = [
			{
				expectedRows: 2,
				expectedColumns: 2,
				item: new GenericTile({
					layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
				})
			},
			{
				expectedRows: 5,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ columns: 4 })
				})
			},
			{
				expectedRows: 5,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 4 })
				})
			},
			{
				expectedRows: 2,
				expectedColumns: 4,
				item: new Card({
					height: "400px",
					layoutData: new GridContainerItemLayoutData({ rows: 2, columns: 4 })
				})
			}
		];

		aExamples.forEach(function (oExample) {
			this.oGrid.addItem(oExample.item);
		}.bind(this));

		// Act
		Core.applyChanges();

		// Assert
		var $previousGridItem;
		aExamples.forEach(function (oExample, iInd) {
			var $gridItem = oExample.item.$().parent();

			if (bIsGridSupported) {
				assert.strictEqual($gridItem.css("grid-row-start"), "span " + oExample.expectedRows, "Item " + iInd + " rows are as expected");
				assert.strictEqual($gridItem.css("grid-column-start"), "span " + oExample.expectedColumns, "Item " + iInd + " columns are as expected");
			} else {
				// tests for ie and edge
				var iCellSize = 80,
					iGapSize = 16;

				var mExpected = calcExpectedPosition(this.oGrid.$(), $gridItem, $previousGridItem, iGapSize);
				assert.strictEqual($gridItem.css("top"), mExpected.top + "px", "Item " + iInd + " top position is as expected");
				assert.strictEqual($gridItem.css("left"), mExpected.left + "px", "Item " + iInd + " left position is as expected");

				assert.strictEqual($gridItem.height(), oExample.expectedRows * (iCellSize + iGapSize) - iGapSize, "Item " + iInd + " height is as expected");
				assert.strictEqual($gridItem.width(), oExample.expectedColumns * (iCellSize + iGapSize) - iGapSize, "Item " + iInd + " width is as expected");
			}

			$previousGridItem = $gridItem;
		}.bind(this));
	});

	QUnit.module("Layout settings", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Custom layout settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px"});
		this.oGrid.setAggregation("layout", oSettings);

		// Act
		Core.applyChanges();

		// Assert
		assertGridSettings(this.oGrid, oSettings, "layout", assert);
	});

	QUnit.test("Breakpoints", function (assert) {
		// Arrange
		var mTestSettings = {
				"layoutXL": new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px"}),
				"layoutL": new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "16px"}),
				"layoutM": new GridContainerSettings({rowSize: "60px", columnSize: "60px", gap: "8px"}),
				"layoutS": new GridContainerSettings({rowSize: "40px", columnSize: "40px", gap: "4px"})
			},
			oGetCurrentRangeStub = sinon.stub(Device.media, 'getCurrentRange');

		for (var sLayout in mTestSettings) {
			this.oGrid.setAggregation(sLayout, mTestSettings[sLayout]);
		}

		// Act & Assert
		["Phone", "Tablet", "Desktop", "LargeDesktop"].forEach(function (sRangeName) {

			// Act
			oGetCurrentRangeStub.returns({name: sRangeName});
			this.oGrid._resize(); // TODO fire resize or fire Device.media sizeChanged
			Core.applyChanges();

			// Assert
			var sLayoutName = GridContainer.mSizeLayouts[sRangeName];
			assertGridSettings(this.oGrid, mTestSettings[sLayoutName], sLayoutName, assert);

		}.bind(this));

		oGetCurrentRangeStub.restore();
	});
});