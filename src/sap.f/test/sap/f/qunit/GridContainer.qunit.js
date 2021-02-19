/*global QUnit, sinon */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/f/library",
	"sap/f/GridContainer",
	"sap/ui/core/Core",
	"sap/ui/core/dnd/DragInfo",
	"sap/m/Panel",
	"sap/m/GenericTile",
	"sap/f/Card",
	"sap/f/GridContainerItemLayoutData",
	"sap/f/GridContainerSettings",
	"sap/f/GridContainerUtils",
	"sap/f/dnd/GridDropInfo",
	"sap/ui/Device",
	"sap/base/Log",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/m/Button",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/widgets/Card",
	"sap/ui/model/json/JSONModel",
	"sap/f/dnd/GridDragOver"
],
function (
	jQuery,
	library,
	GridContainer,
	Core,
	DragInfo,
	Panel,
	GenericTile,
	Card,
	GridContainerItemLayoutData,
	GridContainerSettings,
	GridContainerUtils,
	GridDropInfo,
	Device,
	Log,
	qutils,
	KeyCodes,
	Button,
	Header,
	IntegrationCard,
	JSONModel,
	GridDragOver
) {
	"use strict";

	// shortcut for sap.f.NavigationDirection
	var NavigationDirection = library.NavigationDirection;

	var DOM_RENDER_LOCATION = "qunit-fixture",
		bIsGridSupported = GridContainerUtils.isGridSupportedByBrowser();

	var oIntegrationCardManifest = {
		"sap.card": {
			"type": "List",
			"header": {
				"actions": [
					{
						"type": "Navigation",
						"url": "https://www.sap.com"
					}
				],
				"title": "Integration Card with action",
				"subTitle": "Card subtitle",
				"icon": {
					"src": "sap-icon://activities"
				},
				"status": {
					"text": "100 of 200"
				}
			},
			"content": {
				"data": {
					"json": [
						{
							"Name": "Notebook Basic 15",
							"Description": "Notebook Basic 15 with 2,80 GHz quad core, 15\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1000",
							"SubCategoryId": "Notebooks",
							"icon": "sap-icon://laptop",
							"state": "Information",
							"info": "27.45 EUR",
							"infoState": "Success"
						},
						{
							"Name": "Notebook Basic 17",
							"Description": "Notebook Basic 17 with 2,80 GHz quad core, 17\" LCD, 4 GB DDR3 RAM, 500 GB Hard Disc, Windows 8 Pro",
							"Id": "HT-1001",
							"SubCategoryId": "Notebooks",
							"icon": "sap-icon://laptop",
							"state": "Success",
							"info": "27.45 EUR",
							"infoState": "Success"

						}
					]
				},
				"item": {
					"icon": {
						"src": "{icon}"
					},
					"title": {
						"label": "{{title_label}}",
						"value": "{Name}"
					},
					"description": {
						"label": "{{description_label}}",
						"value": "{Description}"
					},
					"highlight": "{state}",
					"info": {
						"value": "{info}",
						"state": "{infoState}"
					}
				}
			}
		}
	};

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

	QUnit.test("Min Height", function (assert) {
		// Act
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().css("min-height"), "32px", "Default min height is 2rem.");

		// Act
		this.oGrid.setMinHeight("0");
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().css("min-height"), "0px", "Min height can be set to 0.");

		// Act
		this.oGrid.setMinHeight("20px");
		Core.applyChanges();

		// Assert
		assert.strictEqual(this.oGrid.$().css("min-height"), "20px", "Min height can be set to 20px.");
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
		assert.strictEqual($grid.find("#tile3").parent().index(), 2, "Item 3 is inserted on correct location");

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

		// Act
		oInvisibleItem.setVisible(true);
		Core.applyChanges();

		// Assert
		assert.ok(aWrappers[2].offsetWidth > 0, "When item is turned to visible, its wrapper should take width.");

		// Act
		oVisibleItem.setVisible(false);
		Core.applyChanges();

		// Assert
		assert.notOk(aWrappers[1].offsetWidth > 0, "When item is turned to invisible, its wrapper should NOT take width.");
		assert.ok(aWrappers[2].offsetWidth > 0, "Wrapper of visible item should take width.");
	});

	QUnit.test("Visible/Invisible items with model", function (assert) {
		// Arrange
		var $grid,
			oData = [
				{
					title: "Tile1",
					visible: true
				},
				{
					title: "Tile2",
					visible: false
				},
				{
					title: "Tile3",
					visible: true
				}
			],
			oModel = new JSONModel(oData);

		this.oGrid.setModel(oModel);

		this.oGrid.bindAggregation("items", {
			path: "/",
			template: new GenericTile({
				header: "{title}",
				visible: "{visible}"
			})
		});

		Core.applyChanges();
		$grid = this.oGrid.$();

		// Act - hide first item
		oModel.setProperty("/0/visible", false);
		Core.applyChanges();

		// Assert
		assert.ok($grid.children()[1].offsetWidth === 0, "The first item is not visible and wrapper is not visible.");

		// Act - back to visible
		oModel.setProperty("/0/visible", true);
		Core.applyChanges();

		// Assert
		assert.ok($grid.children()[1].offsetWidth > 0, "The first item is visible again.");

		// Act - set second item to visible
		oModel.setProperty("/1/visible", true);
		Core.applyChanges();

		// Assert
		assert.ok($grid.children()[2].offsetWidth > 0, "The second item is visible.");

		// Clean up
		this.oGrid.setModel(null);
		this.oGrid.unbindAggregation("items");
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

	QUnit.test("resize device after GidContainer is destroyed", function (assert) {
		// Arrange
		this.oGrid.destroy();

		// Act
		Device.resize._update();

		// Assert
		assert.ok(true, "There is no error when GridContainer is destroyed and the width is changed");
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

	QUnit.test("columnsChange Event", function (assert) {
		var mSizes = {
			"300px": 3,
			"500px": 5,
			"700px": 7,
			"1200px": 12,
			"1600px": 16
		};

		// listen for layout change event
		var iColumnsCount;
		this.oGrid.attachColumnsChange(function (oEvent) {
			iColumnsCount = oEvent.getParameter("columns");
		});

		// Arrange
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		for (var sWidth in mSizes) {

			// Act
			this.oGrid.$().width(sWidth);
			this.oGrid._resize();

			// Assert
			assert.strictEqual(mSizes[sWidth], iColumnsCount, "columnsChange event was called correctly for width " + sWidth);
		}
	});

	QUnit.module("Keyboard mouse and focus handling", {
		beforeEach: function () {

			// Arrange
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					new Card({
						header: new Header({ title: "Title" }),
						content: new Button({ text: "Text" }),
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 })
					}),
					new Card({
						header: new Header({ title: "Title" }),
						content: new Button({ text: "Text" }),
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 })
					}),
					new Card({
						header: new Header({ title: "Title" }),
						content: new Button({ text: "Text" }),
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 })
					}),
					this.oTile = new GenericTile({
						header: "headerText 1",
						subheader: "subheaderText",
						press: function () {},
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 })
					}),
					this.oCard = new IntegrationCard({
						manifest: oIntegrationCardManifest,
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 })
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			this.oCard.destroy();
			this.oTile.destroy();
		}
	});

	QUnit.test("Right Arrow navigation through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef().children[1],
			oItemWrapper2 = this.oGrid.getDomRef().children[2];

		oItemWrapper1.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper2.getAttribute("tabindex"), "0", "Focus should be on the second GridItem");

		// Act - continue with arrow right
		qutils.triggerKeydown(oItemWrapper2, KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper2.getAttribute("tabindex"), "0", "Focus should stay on the same item");
	});

	QUnit.test("Down Arrow navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef().children[1],
			oItemWrapper3 = this.oGrid.getDomRef().children[3],
			oItemWrapper5 = this.oGrid.getDomRef().children[5];

		oItemWrapper1.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper3.getAttribute("tabindex"), "0", "Focus should be on the third GridItem (the item below)");

		// Act
		this.oGrid._oItemNavigation._onFocusLeave();
		oItemWrapper5.focus();
		Core.applyChanges();
		qutils.triggerKeydown(oItemWrapper5, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper5.getAttribute("tabindex"), "0", "Focus should remain on the fifth GridItem if there is no other item below it");
	});

	QUnit.test("Left Arrow navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper3 = this.oGrid.getDomRef().children[3];
		oItemWrapper3.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oItemWrapper3, KeyCodes.ARROW_LEFT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper3.getAttribute("tabindex"), "0", "Focus should stay on the same item");
	});

	QUnit.test("Up Arrow navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef().children[1],
			oItemWrapper3 = this.oGrid.getDomRef().children[3];
		oItemWrapper3.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oItemWrapper3, KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper1.getAttribute("tabindex"), "0",  "Focus should be on the first GridItem");
	});

	QUnit.test("Tabbing through a tile - focus should leave the grid container", function (assert) {

		// Arrange
		var oItemWrapperTile = this.oGrid.getDomRef().children[4],
			oTile = oItemWrapperTile.children[0],
			oForwardTabSpy = this.spy(this.oGrid._oItemNavigation, "forwardTab");

		oItemWrapperTile.focus();
		Core.applyChanges();
		// Act
		qutils.triggerKeydown(oItemWrapperTile, KeyCodes.TAB, false, false, false);

		// Assert
		assert.ok(oForwardTabSpy.called, "Focus should leave the GridContainer");

		oTile.focus();
		Core.applyChanges();

		// Assert
		assert.strictEqual(document.activeElement, oTile.parentNode, "Focus is moved to the list item.");
	});

	QUnit.test("Tabbing tough a List Card should leave the grid container at last focusable element", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Arrange
			this.oGrid._oItemNavigation.setFocusedIndex(4);
			var listDomRef = this.oCard.getCardContent()._getList().getDomRef(),
				firstListItem = listDomRef.children[1].children[0],
				oForwardTabSpy = sinon.spy(this.oGrid._oItemNavigation, "forwardTab");

			firstListItem.focus();
			Core.applyChanges();
			// Act
			qutils.triggerKeydown(firstListItem, KeyCodes.TAB, false, false, false);

			// Assert
			assert.strictEqual(oForwardTabSpy.called, true, "Focus should leave the GridContainer");
			done();
		}.bind(this));
	});

	QUnit.test("'mouseup' on the control focus dom ref should focus the grid list item", function (assert) {
		// Arrange
		var done = assert.async(),
			oJQueryTriggerSpy = sinon.spy(jQuery.prototype, "trigger");

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			// Arrange
			var oCardFocusDomRef = this.oCard.getFocusDomRef();

			// Act
			qutils.triggerMouseEvent(oCardFocusDomRef, "mousedown");
			oCardFocusDomRef.focus();
			Core.applyChanges();

			assert.notOk(oJQueryTriggerSpy.calledWith("focus"), "Focus should not be moved");

			qutils.triggerMouseEvent(oCardFocusDomRef, "mouseup");
			oCardFocusDomRef.focus();
			Core.applyChanges();

			// Assert
			assert.ok(oJQueryTriggerSpy.calledWith("focus"), "Focus should be moved to the grid list item");

			oJQueryTriggerSpy.restore();
			done();
		}.bind(this));
	});

	QUnit.test("focusing the grid list item should call onfocusin of the control", function (assert) {
		// Arrange
		var done = assert.async(),
			oCardFocusInSpy = sinon.spy(Card.prototype, "onfocusin"),
			oIntegrationCardFocusInSpy = sinon.spy(IntegrationCard.prototype, "onfocusin");

		this.oCard.attachEvent("_ready", function () {
			Core.applyChanges();

			var oItemWrapper = this.oGrid.getDomRef().children[2];
			oItemWrapper.focus();

			// Assert
			assert.ok(oCardFocusInSpy.called, "onfocusin is called");

			oItemWrapper = this.oGrid.getDomRef().children[5];
			oItemWrapper.focus();

			// Assert
			assert.ok(oIntegrationCardFocusInSpy.called, "onfocusin is called");

			oCardFocusInSpy.restore();
			oIntegrationCardFocusInSpy.restore();
			done();
		}.bind(this));
	});

	QUnit.test("Press on wrapper should transfer events to the inner control", function (assert) {

		// Arrange
		var oItemWrapper = this.oGrid.getDomRef().children[4],
			oAttachPressSpy = sinon.spy(this.oTile, "firePress");
		oItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeyup(oItemWrapper, KeyCodes.ENTER, false, false, false);

		// Assert
		assert.strictEqual(oAttachPressSpy.callCount, 1, "Tile is pressed");
	});

	QUnit.test("FocusDomRef tab index", function (assert) {
		var oCard = this.oGrid.getItems()[0];

		assert.strictEqual(oCard.getFocusDomRef().getAttribute("tabindex"), "-1", "Focus DomRef should have tabindex='-1'");

		oCard.getHeader().invalidate();
		Core.applyChanges();

		assert.strictEqual(oCard.getFocusDomRef().getAttribute("tabindex"), "-1", "Focus DomRef should have tabindex='-1'");
	});

	QUnit.module("'borderReached' event and 'focusItemByDirection' method", {
		beforeEach: function () {
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Arrow Left on edge element should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement,
			done = assert.async();

		this.oGrid.attachBorderReached(function (oEvent) {

			// Assert
			assert.ok(true, "'borderReached' event is fired");
			assert.strictEqual(oEvent.getParameter("direction"), NavigationDirection.Left, "'direction' parameter is correct");
			assert.strictEqual(oEvent.getParameter("row"), 0, "'row' parameter is correct");
			assert.strictEqual(oEvent.getParameter("column"), 0, "'column' parameter is correct");

			done();
		});

		oFirstItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_LEFT, false, false, false);
	});

	QUnit.test("Arrow Up on edge element should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement,
			done = assert.async();

		this.oGrid.attachBorderReached(function (oEvent) {
			// Assert
			assert.ok(true, "'borderReached' event is fired");
			assert.strictEqual(oEvent.getParameter("direction"), NavigationDirection.Up, "'direction' parameter is correct");
			assert.strictEqual(oEvent.getParameter("row"), 0, "'row' parameter is correct");
			assert.strictEqual(oEvent.getParameter("column"), 0, "'column' parameter is correct");

			done();
		});

		oFirstItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_UP, false, false, false);
	});

	QUnit.test("Arrow Right on edge element should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oFourthItemWrapper = this.oGrid.getItems()[3].getDomRef().parentElement,
			done = assert.async();

		this.oGrid.attachBorderReached(function (oEvent) {
			// Assert
			assert.ok(true, "'borderReached' event is fired");
			assert.strictEqual(oEvent.getParameter("direction"), NavigationDirection.Right, "'direction' parameter is correct");
			assert.strictEqual(oEvent.getParameter("row"), 1, "'row' parameter is correct");
			assert.strictEqual(oEvent.getParameter("column"), 1, "'column' parameter is correct");

			done();
		});

		oFourthItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oFourthItemWrapper, KeyCodes.ARROW_RIGHT, false, false, false);
	});

	QUnit.test("Arrow Down on edge element should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oThirdItemWrapper = this.oGrid.getItems()[3].getDomRef().parentElement,
			done = assert.async();

		this.oGrid.attachBorderReached(function (oEvent) {
			// Assert
			assert.ok(true, "'borderReached' event is fired");
			assert.strictEqual(oEvent.getParameter("direction"), NavigationDirection.Down, "'direction' parameter is correct");
			assert.strictEqual(oEvent.getParameter("row"), 1, "'row' parameter is correct");
			assert.strictEqual(oEvent.getParameter("column"), 1, "'column' parameter is correct");

			done();
		});

		oThirdItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oThirdItemWrapper, KeyCodes.ARROW_DOWN, false, false, false);
	});

	QUnit.test("focusItemByDirection method", function (assert) {
		this.oGrid.focusItemByDirection(NavigationDirection.Down, 0, 0);
		assert.strictEqual(document.activeElement, this.oGrid.getItems()[0].getDomRef().parentElement, "the item is correctly focused");

		this.oGrid.focusItemByDirection(NavigationDirection.Up, 0, 1);
		assert.strictEqual(document.activeElement, this.oGrid.getItems()[3].getDomRef().parentElement, "the item is correctly focused");

		this.oGrid.focusItemByDirection(NavigationDirection.Right, 1, 0);
		assert.strictEqual(document.activeElement, this.oGrid.getItems()[2].getDomRef().parentElement, "the item is correctly focused");

		this.oGrid.focusItemByDirection(NavigationDirection.Left, 1, 0);
		assert.strictEqual(document.activeElement, this.oGrid.getItems()[3].getDomRef().parentElement, "the item is correctly focused");
	});

	QUnit.module("Keyboard Drag&Drop - suggested positions in different directions", {
		beforeEach: function () {
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					}),
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: function (oInfo) {
							this.oDraggedControl = oInfo.getParameter("draggedControl");
							this.oDroppedControl = oInfo.getParameter("droppedControl");
							this.sInsertPosition = oInfo.getParameter("dropPosition");
						}.bind(this)
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			this.oDraggedControl = null;
			this.oDroppedControl = null;
			this.sInsertPosition = "";
		}
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Down", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_DOWN, false, false, /**ctrl */ true );

		// Assert
		assert.strictEqual(this.oGrid.indexOfItem(this.oDraggedControl), 0, "The dragged item is the first one");
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 2, "The dropped item is the third one");
		assert.strictEqual(this.sInsertPosition, "After", "The insert position is 'After'");
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Right", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_RIGHT, false, false, /**ctrl */ true );

		assert.strictEqual(this.oGrid.indexOfItem(this.oDraggedControl), 0, "The dragged item is the first one");
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 1, "The dropped item is the second one");
		assert.strictEqual(this.sInsertPosition, "After", "The insert position is 'After'");
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Left", function (assert) {
		// Arrange
		var oSecondItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oSecondItemWrapper, KeyCodes.ARROW_LEFT, false, false, /**ctrl */ true );

		assert.strictEqual(this.oGrid.indexOfItem(this.oDraggedControl), 1, "The dragged item is the second one");
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 0, "The dropped item is the first one");
		assert.strictEqual(this.sInsertPosition, "Before", "The insert position is 'Before'");
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Up", function (assert) {
		// Arrange
		var oThirdItemWrapper = this.oGrid.getItems()[2].getDomRef().parentElement;

		oThirdItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oThirdItemWrapper, KeyCodes.ARROW_UP, false, false, /**ctrl */ true );

		assert.strictEqual(this.oGrid.indexOfItem(this.oDraggedControl), 2, "The dragged item is the third one");
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 0, "The dropped item is the first one");
		assert.strictEqual(this.sInsertPosition, "Before", "The insert position is 'Before'");
	});

	QUnit.test("Keyboard Drag&Drop: No errors when moving items out of bounds", function (assert) {
		// Arrange
		var oItem = this.oGrid.getItems()[0],
			oItemDomRef = oItem.getDomRef().parentElement;

		// Act - moving first item upwards
		qutils.triggerKeydown(oItemDomRef, KeyCodes.ARROW_UP, false, false, /**ctrl */ true );

		// Assert
		assert.strictEqual(this.oGrid.getItems()[0].getId(), oItem.getId(), "Item hasn't moved");

		// Arrange
		oItem = this.oGrid.getItems()[3];
		oItemDomRef = oItem.getDomRef().parentElement;

		// Act - moving last item downwards
		qutils.triggerKeydown(oItemDomRef, KeyCodes.ARROW_DOWN, false, false, /**ctrl */ true );

		// Assert
		assert.strictEqual(this.oGrid.getItems()[3].getId(), oItem.getId(), "Item hasn't moved");
	});

	QUnit.test("Keyboard Drag&Drop: Check that GridDragOver is not used", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement,
			fnGetInstanceSpy = sinon.spy(GridDragOver, "getInstance");

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_DOWN, false, false, /**ctrl */ true );

		// Assert
		assert.ok(fnGetInstanceSpy.notCalled, "GridDragOver#getInstance() is not called during keyboard drag and drop.");

		// Clean
		fnGetInstanceSpy.restore();
	});

	QUnit.module("Keyboard Drag&Drop in RTL mode - suggested positions in different directions", {
		beforeEach: function () {
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oRTLStub = sinon.stub(Core.getConfiguration(), "getRTL").returns(true);

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					}),
					new GridDropInfo({
						targetAggregation: "items",
						dropPosition: "Between",
						dropLayout: "Horizontal",
						drop: function (oInfo) {
							this.oDraggedControl = oInfo.getParameter("draggedControl");
							this.oDroppedControl = oInfo.getParameter("droppedControl");
							this.sInsertPosition = oInfo.getParameter("dropPosition");
						}.bind(this)
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oRTLStub.restore();
			this.oGrid.destroy();
			this.oDraggedControl = null;
			this.oDroppedControl = null;
			this.sInsertPosition = "";
		}
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Right", function (assert) {
		// Arrange
		var oSecondItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oSecondItemWrapper, KeyCodes.ARROW_RIGHT, false, false, /**ctrl */ true );

		// Assert
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 0, "The dropped item is the in the right when in RTL");
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Left", function (assert) {
		// Arrange
		var oSecondItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oSecondItemWrapper, KeyCodes.ARROW_LEFT, false, false, /**ctrl */ true );

		// Assert
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), 2, "The dropped item is the one in the left when in RTL");
	});

	QUnit.module("Keyboard Drag&Drop between GridContainers - suggested positions in different directions", {
		beforeEach: function () {
			this.oGrid1 = new GridContainer({
				layout: new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"}),
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					})
				]
			});

			this.oGrid2 = new GridContainer({
				layout: new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"}),
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 3",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 4",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				],
				dragDropConfig: [
					new DragInfo({
						sourceAggregation: "items"
					})
				]
			});

			this.oGrid1.placeAt(DOM_RENDER_LOCATION);
			this.oGrid2.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid1.destroy();
			this.oGrid2.destroy();
		}
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Down from the first container to the second container", function (assert) {
		// Arrange
		var oFirstContainerItem = this.oGrid1.getItems()[3].getDomRef().parentElement,
			oExpectedSuggestion = this.oGrid2.getItems()[1];

		this.oGrid2.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: function (oEvent) {
				assert.strictEqual(oEvent.getParameter("droppedControl"), oExpectedSuggestion, "The suggested drop control is correct");
				assert.strictEqual(oEvent.getParameter("dropPosition"), "Before", "The suggested drop position is correct");
			}
		}));

		// Act
		qutils.triggerKeydown(oFirstContainerItem, KeyCodes.ARROW_DOWN, false, false, /**ctrl */ true );
	});

	QUnit.test("Keyboard Drag&Drop: Ctrl + Arrow Up from the second container to the first container", function (assert) {
		// Arrange
		var oSecondContainerItem = this.oGrid2.getItems()[0].getDomRef().parentElement,
			oExpectedSuggestion = this.oGrid1.getItems()[2];

		this.oGrid1.addDragDropConfig(new GridDropInfo({
			targetAggregation: "items",
			dropPosition: "Between",
			dropLayout: "Horizontal",
			drop: function (oEvent) {
				assert.strictEqual(oEvent.getParameter("droppedControl"), oExpectedSuggestion, "The suggested drop control is correct");
				assert.strictEqual(oEvent.getParameter("dropPosition"), "Before", "The suggested drop position is correct");
			}
		}));

		// Act
		qutils.triggerKeydown(oSecondContainerItem, KeyCodes.ARROW_UP, false, false, /**ctrl */ true );
	});

	QUnit.module("Focus handling");

	QUnit.test("Pressing on clickable element inside an item doesn't move the focus to the item", function (assert) {
		// Arrange
		var oBtn = new Button(),
			oGrid = new GridContainer({
				items: [ oBtn ]
			}),
			oItemWrapper,
			oItemWrapperFocusSpy;

		oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		oItemWrapper = oGrid.getDomRef().children[1];
		oItemWrapperFocusSpy = sinon.spy(oItemWrapper, "focus");

		// Act
		qutils.triggerMouseEvent(oBtn.getFocusDomRef(), "mousedown");
		qutils.triggerMouseEvent(oBtn.getFocusDomRef(), "mouseup");

		this.clock.tick(500);

		// Assert
		assert.ok(oItemWrapperFocusSpy.notCalled, "The item wrapper didn't get focused.");

		// Clean up
		oGrid.destroy();
		oItemWrapperFocusSpy.restore();
	});

	QUnit.test("Item with own focus, when the item has no focusable content", function (assert) {
		// Arrange
		var oCard = new Card({height: "100%"}),
			oGrid = new GridContainer({
				items: [ oCard ]
			});
		oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		// Assert
		assert.notOk(GridContainerUtils.getItemWrapper(oCard).classList.contains("sapFGridContainerItemWrapperNoVisualFocus"), "Class for own focus is not added");

		// Clean up
		oGrid.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function () {
			this.oGrid = new GridContainer({
				items: [
					new GenericTile({
						header: "Tile 1",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					}),
					new GenericTile({
						header: "Tile 2",
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Wrapper attributes", function (assert) {
		var oWrapper = this.oGrid.$().children().eq(1);

		assert.notOk(oWrapper.attr("aria-keyshortcuts"), "there is not aria-keyshortcuts attribute");
		assert.strictEqual(oWrapper.attr("tabindex"), "-1", "tabindex is set");
	});

	QUnit.module("2D Navigation", {
		beforeEach: function () {
			var oSettings = new GridContainerSettings({columns: 6, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oGrid = new GridContainer({
				layout: oSettings,
				items: [
					new Card({
						header: new Header({ title: "Title" }),
						content: new Button({ text: "Text" }),
						layoutData: new GridContainerItemLayoutData({ columns: 4, rows: 4 })
					}),
					this.oTile = new GenericTile({
						header: "headerText 1",
						subheader: "subheaderText",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					new IntegrationCard({
						manifest: oIntegrationCardManifest,
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					this.oTile = new GenericTile({
						header: "headerText 2",
						subheader: "subheaderText",
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					}),
					this.oCard = new IntegrationCard({
						manifest: oIntegrationCardManifest,
						layoutData: new GridContainerItemLayoutData({ columns: 2, rows: 2 })
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			Core.applyChanges();
		},
		afterEach: function () {
			this.oGrid.destroy();
			this.oCard.destroy();
			this.oTile.destroy();
		}
	});

	QUnit.test("Creating grid matrix", function (assert) {
		// Arrange
		var aMatrix = this.oGrid.getNavigationMatrix();

		// Assert
		assert.strictEqual(aMatrix.length, bIsGridSupported ? 6 : 8, "Matrix created with the expected number of rows");
		assert.strictEqual(aMatrix[0].length, 6, "Matrix created with the expected number of columns");
	});

	QUnit.test("Creating grid matrix with inlineBlockLayout enabled", function (assert) {
		// Arrange
		this.oGrid.setInlineBlockLayout(true);
		Core.applyChanges();
		var aMatrix = this.oGrid.getNavigationMatrix();

		// Assert
		assert.strictEqual(aMatrix.length, bIsGridSupported ? 2 : 8, "Matrix created with the expected number of rows");
		assert.strictEqual(aMatrix[0].length, 6, "Matrix created with the expected number of columns");
	});

	QUnit.test("Creating grid matrix when theme is not loaded", function (assert) {
		// Arrange
		sinon.stub(Core, "isThemeApplied").returns(false);

		// Assert
		assert.strictEqual(this.oGrid.getNavigationMatrix(), null, "'null' is returned when theme is not yet loaded");

		// Clean up
		Core.isThemeApplied.restore();
	});

	QUnit.test("Grid matrix should not include items with visible=false", function (assert) {
		// Arrange
		var oInvisibleItem = this.oGrid.getItems()[0].setVisible(false),
			oItemWrapper = GridContainerUtils.getItemWrapper(oInvisibleItem),
			aMatrix = this.oGrid.getNavigationMatrix(),
			bExists = aMatrix.some(function (aRow) {
				return aRow.some(function (oItemAtColumn) {
					return oItemAtColumn === oItemWrapper;
				});
			});

		// Assert
		assert.strictEqual(bExists, false, "Created matrix does not include the invisible item");
	});

	QUnit.test("Arrow Up at the top of the matrix should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oTopMostItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement,
			oSpy = sinon.spy();

		this.oGrid.attachBorderReached(oSpy);

		oTopMostItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oTopMostItemWrapper, KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.ok(oSpy.called, "'borderReached' event is fired");
	});

	QUnit.test("Arrow Down at the bottom of the matrix should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oBottomMostItemWrapper = this.oGrid.getItems()[3].getDomRef().parentElement,
			oSpy = sinon.spy();

		this.oGrid.attachBorderReached(oSpy);

		oBottomMostItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oBottomMostItemWrapper, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.ok(oSpy.called, "'borderReached' event is fired");
	});

	QUnit.test("Navigation between items of different size based on starting position top", function (assert) {
		// Arrange
		var oSecondItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement;

		oSecondItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oSecondItemWrapper, KeyCodes.ARROW_LEFT, false, false, false);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT, false, false, false );

		// Assert
		assert.strictEqual(document.activeElement, oSecondItemWrapper, "Focus is moved back to the top starting item.");

	});

	QUnit.test("Navigation between items of different size based on starting position bottom", function (assert) {
		// Arrange

		var oThirdItemWrapper = this.oGrid.getItems()[2].getDomRef().parentElement;

		oThirdItemWrapper.focus();
		Core.applyChanges();

		// Act
		qutils.triggerKeydown(oThirdItemWrapper, KeyCodes.ARROW_LEFT, false, false, false);
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT, false, false, false );

		// Assert
		assert.strictEqual(document.activeElement, oThirdItemWrapper, "Focus is moved back to the bottom starting item.");
	});

	QUnit.module("Tickets");

	QUnit.test("When the grid is invalidated, the internal 'width' settings are cleared", function (assert) {
		var oGrid = new GridContainer({});

		oGrid.placeAt(DOM_RENDER_LOCATION);
		Core.applyChanges();

		oGrid._resize();

		assert.ok(oGrid._lastGridWidth, "_lastGridWidth is set");
		assert.ok(oGrid._lastViewportWidth, "_lastViewportWidth is set");

		oGrid.invalidate();
		Core.applyChanges();

		assert.notOk(oGrid._lastGridWidth, "_lastGridWidth is not set");
		assert.notOk(oGrid._lastViewportWidth, "_lastViewportWidth is not set");

		oGrid.destroy();
	});
});
