/*global QUnit, sinon */

sap.ui.define([
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/m/Panel",
	"sap/m/GenericTile",
	"sap/f/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/f/GridContainerSettings",
	"sap/ui/Device",
	"sap/base/Log"
],
function (
	GridContainer,
	Core,
	Panel,
	GenericTile,
	Card,
	GridContainerItemLayoutData,
	GridContainerSettings,
	Device,
	Log
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
			sColumnsTemplate,
			sExpectedColumnsTemplate,
			sColumnSize = oSettings.getColumnSize(),
			sMinColumnSize = oSettings.getMinColumnSize(),
			sMaxColumnSize = oSettings.getMaxColumnSize(),
			bColumnsDoMatch;

		if (!bIsGridSupported) {
			// simplified test for IE
			assert.strictEqual(oGrid.getActiveLayoutSettings(), oSettings, "Grid has expected settings for '" + sLayout + "'");
			return;
		}

		// compare columns template
		sColumnsTemplate = oGridStyle.getPropertyValue("grid-template-columns");

		if (sMinColumnSize && sMaxColumnSize) {
			sColumnSize = "minmax(" + sMinColumnSize + ", " + sMaxColumnSize + ")";
		}
		sExpectedColumnsTemplate = "repeat(" + (oSettings.getColumns() || "auto-fill") + ", " + sColumnSize + ")";

		bColumnsDoMatch = sColumnsTemplate === sExpectedColumnsTemplate;

		if (!bColumnsDoMatch && oSettings.getColumns()) {
			// try with computed css which looks like "80px 80px 80px ..."
			sExpectedColumnsTemplate = (sColumnSize + " ").repeat(oSettings.getColumns()).trim();
			bColumnsDoMatch = sColumnsTemplate === sExpectedColumnsTemplate;
		}
		assert.ok(bColumnsDoMatch, "Grid has expected column template settings for layout '" + sLayout + "'");

		// compare rows
		assert.strictEqual(oGridStyle.getPropertyValue("grid-auto-rows"), oSettings.getRowSize(), "Grid has expected row size for '" + sLayout + "'");

		// test row-gap and column-gap, because grid-gap can not be tested directly
		assert.strictEqual(oGridStyle.getPropertyValue("grid-row-gap") || oGridStyle.getPropertyValue("row-gap"), oSettings.getGap(), "Grid has expected row gap for '" + sLayout + "'");
		assert.strictEqual(oGridStyle.getPropertyValue("grid-column-gap") || oGridStyle.getPropertyValue("column-gap"), oSettings.getGap(), "Grid has expected column gap for '" + sLayout + "'");
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
		assert.strictEqual(oGrid.getContainerQuery(), false, "GridContainer containerQuery property is false");
		assert.strictEqual(oGrid.getSnapToRow(), false, "GridContainer snapToRow property is false");
		assert.strictEqual(oGrid.getAllowDenseFill(), false, "GridContainer allowDenseFill property is false");
		assert.strictEqual(oGrid.getInlineBlockLayout(), false, "GridContainer inlineBlockLayout property is false");

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

	QUnit.test("Width", function (assert) {
		// Arrange
		this.oGrid.setWidth("100px");

		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().width(), 100, "Width is as expected");
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

	QUnit.test("Allow dense fill", function (assert) {
		// Arrange
		this.oGrid.setAllowDenseFill(true);

		// Act
		Core.applyChanges();

		// Assert
		if (bIsGridSupported) {
			assert.ok(this.oGrid.$().hasClass("sapFGridContainerDenseFill"), "The grid has class 'sapFGridContainerDenseFill' when allowDenseFill is true");
		} else {
			assert.expect(0);
		}
	});

	QUnit.test("Inline block layout", function (assert) {
		// Arrange
		var oTile = new GenericTile({
			layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
		});
		this.oGrid.addItem(oTile);
		this.oGrid.setInlineBlockLayout(true);

		// Act
		Core.applyChanges();

		// Assert
		if (bIsGridSupported) {
			assert.strictEqual(this.oGrid.$().css("grid-auto-rows"), "min-content", "The grid has 'grid-auto-rows:min-content', when inlineBlockLayout is true");
			assert.strictEqual(oTile.$().parent().css("grid-row-start"), "span 1", "The grid items have row span 1");
		} else {
			assert.expect(0);
		}
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

	QUnit.test("Insert items when not rendered", function (assert) {
		// Arrange
		var oItem = new GenericTile({id: "tile1", header: "Comulative Tools"});

		// Act
		this.oGrid.insertItem(oItem, 0);

		// Assert
		assert.strictEqual(this.oGrid.getItems().length, 1, "There is 1 item");

		// Act
		this.oGrid.removeItem(oItem);

		// Assert
		assert.strictEqual(this.oGrid.getItems().length, 0, "There are 0 items");

		oItem.destroy();
	});

	QUnit.test("Insert items when rendered", function (assert) {
		// Arrange
		Core.applyChanges(); // render the grid

		var $grid,
			oItem1 = new GenericTile({id: "tile1", header: "Comulative Tools"}),
			oItem2 = new GenericTile({id: "tile2", header: "Travel and Expenses"}),
			oItem3 = new GenericTile({id: "tile3", header: "Tools", layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })});

		// Act
		this.oGrid.insertItem(oItem1, -1);
		this.oGrid.insertItem(oItem2, 5000);
		this.oGrid.insertItem(oItem3, 1);
		Core.applyChanges();

		// Assert
		$grid = this.oGrid.$();
		assert.strictEqual($grid.find("#tile1").length, 1, "Item 1 is inserted with index which is out of range");
		assert.strictEqual($grid.find("#tile2").length, 1, "Item 2 is inserted with index which is out of range");
		assert.strictEqual($grid.find("#tile3").length, 1, "Item 3 is inserted with index 1");
		assert.strictEqual($grid.find("#tile3").parent().index(), 1, "Item 3 is inserted on correct location");

		oItem1.destroy();
		oItem2.destroy();
		oItem3.destroy();
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

	QUnit.test("Visible/Invisible items", function (assert) {
		// Arrange
		var oVisibleItem = new GenericTile({id: "tile1", header: "Comulative Tools"}),
			oInvisibleItem = new GenericTile({id: "tile2", header: "Comulative Tools", visible: false});

		// Act
		this.oGrid.addItem(oVisibleItem);
		this.oGrid.addItem(oInvisibleItem);
		Core.applyChanges();

		var aWrappers = this.oGrid.$().children();
		Core.applyChanges();

		// Assert
		assert.ok(aWrappers[0].offsetWidth > 0, "Initially visible item wrapper should take width.");
		assert.notOk(aWrappers[1].offsetWidth > 0, "Initially invisible item wrapper should NOT take any width.");

		// Act
		oInvisibleItem.setVisible(true);
		Core.applyChanges();

		// Assert
		assert.ok(aWrappers[0].offsetWidth > 0, "Wrapper of visible item should take width.");
		assert.ok(aWrappers[1].offsetWidth > 0, "When item is turned to visible, its wrapper should take width.");

		// Act
		oVisibleItem.setVisible(false);
		Core.applyChanges();

		// Assert
		assert.notOk(aWrappers[0].offsetWidth > 0, "When item is turned to invisible, its wrapper should NOT take width.");
		assert.ok(aWrappers[1].offsetWidth > 0, "Wrapper of visible item should take width.");
	});

	if (bIsGridSupported) {
		QUnit.test("Item with more columns than the grid with columns auto-fill", function (assert) {
			// Arrange
			var oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 6 })
			});
			this.oGrid.addItem(oItem);

			// Act
			this.oGrid.setWidth("370px"); // place for 4 columns
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-column-start"), "span 4", "Item has 4 columns as expected");
		});

		QUnit.test("Item with more columns than the grid with defined columns count", function (assert) {
			// Arrange
			var oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 6 })
			});
			this.oGrid.addItem(oItem);

			// Act
			this.oGrid.setLayout(new GridContainerSettings({ columns: 4 })); // explicitly set 4 columns
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-column-start"), "span 4", "Item has 4 columns as expected");
		});

		QUnit.test("Item resize", function (assert) {
			// Arrange
			var oItem = new Card();
			this.oGrid.addItem(oItem);
			Core.applyChanges();

			// Act
			oItem.setHeight("400px");
			Core.applyChanges();

			// Assert
			assert.strictEqual(oItem.$().parent().css("grid-row-start"), "span 5", "Item has 5 rows after resize");
		});
	}

	QUnit.test("Item height should be no less than the minRows", function (assert) {
		// Arrange
		var oItem1 = new Card({
				layoutData: new GridContainerItemLayoutData({minRows: 4})
			}),
			oItem2 = new GenericTile({
				layoutData: new GridContainerItemLayoutData({minRows: 4})
			}),
			iExpectedHeight = 4 * 80 + 3 * 10; // 4 rows and 3 gaps

		// Act
		this.oGrid.setLayout(new GridContainerSettings({ rowSize: "80px", gap: "10px" }));
		this.oGrid.addItem(oItem1);
		this.oGrid.addItem(oItem2);
		Core.applyChanges();

		// Assert
		assert.strictEqual(oItem1.$().parent().height(), iExpectedHeight, "Card height is equal to minRows.");
		assert.strictEqual(oItem1.$().parent().height(), iExpectedHeight, "Tile height is equal to minRows.");
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

	QUnit.module("Layout settings basics");

	QUnit.test("Initialization and default settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings();

		// Assert
		assert.ok(oSettings.isA("sap.f.GridContainerSettings"), "GridContainerSettings is initialized");
		assert.strictEqual(oSettings.getColumns(), undefined, "No default columns count");
		assert.strictEqual(oSettings.getColumnSize(), "80px", "Default column size is '80px'");
		assert.strictEqual(oSettings.getRowSize(), "80px", "Default row size is '80px'");
		assert.strictEqual(oSettings.getGap(), "16px", "Default gap size is '16px'");
	});

	QUnit.test("Parse 'rem' settings to 'px'", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columnSize: "10rem", rowSize: "5.5rem", gap: "0.5rem"});

		// Assert
		assert.strictEqual(oSettings.getColumnSizeInPx(), 160, "Column size in 'px' is 160");
		assert.strictEqual(oSettings.getRowSizeInPx(), 88, "Row size in 'px' is 88");
		assert.strictEqual(oSettings.getGapInPx(), 8, "Gap size in 'px' is 8");
	});

	QUnit.test("Parse edge cases for settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({rowSize: "5in", gap: "0"}),
			fnLogErrorSpy = sinon.spy(Log, "error");

		// Assert
		assert.ok(isNaN(oSettings.getRowSizeInPx()), "Row size of '5in' can not be parsed and results in NaN");
		assert.ok(fnLogErrorSpy.calledOnce, "An error was logged about that row size '5in' can not be converted to 'px'");
		assert.strictEqual(oSettings.getGapInPx(), 0, "Gap size of 0 is 0 in 'px'");

		fnLogErrorSpy.restore();
	});

	QUnit.module("Layout settings & breakpoints", {
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

	QUnit.test("Layout settings with breathing", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columns: 10, rowSize: "90px", minColumnSize: "90px", maxColumnSize: "150px", gap: "20px"});
		this.oGrid.setAggregation("layout", oSettings);

		// Act
		Core.applyChanges();

		// Assert
		assertGridSettings(this.oGrid, oSettings, "layout", assert);
	});

	QUnit.test("Item width when we have breathing", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columns: 1, rowSize: "80px", minColumnSize: "80px", maxColumnSize: "150px", gap: "16px"}),
			oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 1 })
			});

		this.oGrid.setAggregation("layout", oSettings);
		this.oGrid.addItem(oItem);

		// Act
		Core.applyChanges();

		// Assert
		var $itemWrapper = oItem.$().parent();

		if (bIsGridSupported) {
			assert.strictEqual($itemWrapper.width(), 150, "Item width is stretched to max column size when there is space.");
			this.oGrid.$().width("80px");
			assert.strictEqual($itemWrapper.width(), 80, "Item width is equal to min column size when there is not enough space.");
		} else {
			// on IE we fallback to min column size for now
			assert.strictEqual($itemWrapper.width(), 80, "Item width is equal to min column size for IE.");
		}
	});

	QUnit.test("If breakpoint XS is not defined, fallback to S", function (assert) {
		// Arrange
		var oLayoutS = new GridContainerSettings({rowSize: "40px", columnSize: "40px", gap: "4px"});
		this.oGrid.setAggregation("layoutS", oLayoutS);
		this.oGrid.setContainerQuery(true);
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act
		this.oGrid.$().width("350px");
		Core.applyChanges();
		this.clock.tick(500);

		// Assert
		assertGridSettings(this.oGrid, oLayoutS, "layoutS", assert);
	});

	QUnit.module("Layout breakpoints", {
		beforeEach: function () {
			this.oGrid = new GridContainer();

			// prepare settings for each layout
			this.mTestSettings = {
				"layoutXL": new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px", columns: 14 }),
				"layoutL": new GridContainerSettings({rowSize: "80px", columnSize: "80px", gap: "16px", columns: 10 }),
				"layoutM": new GridContainerSettings({rowSize: "60px", columnSize: "60px", gap: "8px", columns: 6}),
				"layoutS": new GridContainerSettings({rowSize: "40px", columnSize: "40px", gap: "4px", columns: 4}),
				"layoutXS": new GridContainerSettings({rowSize: "20px", columnSize: "20px", gap: "2px", columns: 4})
			};
			for (var sLayout in this.mTestSettings) {
				this.oGrid.setAggregation(sLayout, this.mTestSettings[sLayout]);
			}

			this.mLayouts = {
				"300px": "layoutXS",
				"500px": "layoutS",
				"700px": "layoutM",
				"1200px": "layoutL",
				"1600px": "layoutXL"
			};

			// listen for layout change event
			this.oLayoutChangeStub = sinon.stub();
			this.oGrid.attachLayoutChange(function (oEvent) {
				this.oLayoutChangeStub(oEvent.getParameter("layout"));
			}.bind(this));
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Breakpoints", function (assert) {
		// Arrange
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		var sLayoutName,
			iOriginalWidth = Device.resize.width;

		for (var sWidth in this.mLayouts) {

			// Act
			Device.resize.width = parseInt(sWidth);
			this.oGrid._resize();

			// Assert
			sLayoutName = this.mLayouts[sWidth];
			assertGridSettings(this.oGrid, this.mTestSettings[sLayoutName], sLayoutName, assert);
			assert.ok(this.oLayoutChangeStub.calledWith(sLayoutName), "Layout change event was called for layout " + sLayoutName);
			this.oLayoutChangeStub.reset();
		}

		Device.resize.width = iOriginalWidth;
	});

	QUnit.test("Breakpoints when containerQuery is true", function (assert) {
		// Arrange
		this.oGrid.setContainerQuery(true);

		// Using an actual control here as the IE polyfill
		// does its calculations based on actual existing elements
		var oTile = new GenericTile({
			header: "tile"
		});
		this.oGrid.addItem(oTile);

		var oContainer = new Panel({content: this.oGrid});
		oContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Act & Assert
		var sLayoutName;

		for (var sWidth in this.mLayouts) {

			// Act
			oContainer.$().width(sWidth);
			Core.applyChanges();
			this.clock.tick(500);

			// Assert
			sLayoutName = this.mLayouts[sWidth];
			assertGridSettings(this.oGrid, this.mTestSettings[sLayoutName], sLayoutName, assert);
			assert.ok(this.oLayoutChangeStub.calledWith(sLayoutName), "Layout change event was called for layout " + sLayoutName);
			this.oLayoutChangeStub.reset();
		}

		oContainer.destroy();
	});

	QUnit.test("Should not trigger layout change when container hides", function (assert) {
		// Arrange
		var oContainer = new Panel({ content: this.oGrid }),
			fnLayoutChangeSpy = sinon.stub();

		this.oGrid.setWidth("100%");
		this.oGrid.setContainerQuery(true);

		oContainer.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		this.oGrid.attachLayoutChange(fnLayoutChangeSpy);

		// Act
		oContainer.$().hide();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(fnLayoutChangeSpy.called, false, "Layout change is not called when container hides.");

		// Clean up
		oContainer.destroy();
	});

	if (!bIsGridSupported) {
		QUnit.test("Should not throw error if destroyed when polyfill is scheduled", function (assert) {
			// Arrange
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();

			// Act
			this.oGrid._scheduleIEPolyfill();
			this.oGrid.destroy();
			this.clock.tick(500);

			// Assert
			assert.ok(true, "There is no error when grid is destroyed after scheduled IE polyfill.");
		});
	}

	QUnit.module("Resizing", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);

			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("resize container", function (assert) {

		var fnApplyLayout = sinon.spy(this.oGrid, "_applyLayout");

		// Arrange
		this.oGrid.$().width('123px');

		// forcing calling all resize listeners
		sap.ui.core.ResizeHandler.suspend(this.oGrid.getDomRef());
		sap.ui.core.ResizeHandler.resume(this.oGrid.getDomRef());

		assert.ok(fnApplyLayout.called, "ApplyLayout is called");
	});

	QUnit.test("Dimensions of the grid", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"}),
			oItem = new Card({
				layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
			});

		this.oGrid.setAggregation("layout", oSettings);
		this.oGrid.addItem(oItem);

		// Act
		Core.applyChanges();

		// Assert
		// 2*80px + 1*16px = 176
		assert.strictEqual(this.oGrid.$().height(), 176, "Grid height is correct. Equal to two rows and one gap.");

		if (bIsGridSupported) {
			assert.strictEqual(this.oGrid.$().width(), this.oGrid.$().parent().width(), "Grid width is 100%.");
		} else {
			// the width on IE depends on number of columns
			assert.strictEqual(this.oGrid.$().width(), 176, "Grid width is correct. Equal to two columns and one gap for IE.");
		}
	});
});