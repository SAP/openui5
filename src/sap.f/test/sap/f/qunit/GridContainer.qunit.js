/*global QUnit, sinon */

sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/f/library",
	"sap/f/GridContainer",
	"sap/ui/core/dnd/DragInfo",
	"sap/m/Panel",
	"sap/m/SearchField",
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
	"sap/m/ScrollContainer",
	"sap/ui/integration/cards/Header",
	"sap/ui/integration/widgets/Card",
	"sap/ui/model/json/JSONModel",
	"sap/f/dnd/GridDragOver",
	"sap/ui/core/ResizeHandler",
	"sap/ui/qunit/utils/nextUIUpdate",
	"./testResources/nextCardReadyEvent"
],
function(
	Localization,
	library,
	GridContainer,
	DragInfo,
	Panel,
	SearchField,
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
	ScrollContainer,
	Header,
	IntegrationCard,
	JSONModel,
	GridDragOver,
	ResizeHandler,
	nextUIUpdate,
	nextCardReadyEvent
) {
	"use strict";

	// shortcut for sap.f.NavigationDirection
	var NavigationDirection = library.NavigationDirection;

	var DOM_RENDER_LOCATION = "qunit-fixture";

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
				},
				"dataTimestamp": "2024-01-16T15:20:42Z"
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
		var oGridStyle = oGrid.getDomRef("listUl").style,
			sColumnsTemplate,
			sExpectedColumnsTemplate,
			sColumnSize = oSettings.getColumnSize(),
			sMinColumnSize = oSettings.getMinColumnSize(),
			sMaxColumnSize = oSettings.getMaxColumnSize(),
			bColumnsDoMatch;

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

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("Tab indexes of dummy areas when the grid has items", function (assert) {
		// Arrange
		var oGrid = new GridContainer({
			items: [new Card()]
		});
		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oGrid.getDomRef("before").tabIndex, 0, "tabindex of 'before' dummy area should be correct");
		assert.strictEqual(oGrid.getDomRef("after").tabIndex, 0, "tabindex of 'after' dummy area should be correct");

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("Tab indexes of dummy areas when the grid doesn't have items", function (assert) {
		// Arrange
		var oGrid = new GridContainer({
			items: []
		});
		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oGrid.getDomRef("before").tabIndex, -1, "tabindex of 'before' dummy area should be correct");
		assert.strictEqual(oGrid.getDomRef("after").tabIndex, 0, "tabindex of 'after' dummy area should be correct");

		// Clean up
		oGrid.destroy();
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oGrid.$("listUl").hasClass("sapFGridContainerSnapToRow"), "Has class sapFGridContainerSnapToRow when snapToRow is true");
	});

	QUnit.test("Width", function (assert) {
		// Arrange
		this.oGrid.setWidth("100px");

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$().width(), 100, "Width is as expected");
	});

	QUnit.test("Min Height", function (assert) {
		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$("listUl").css("min-height"), "32px", "Default min height is 2rem.");

		// Act
		this.oGrid.setMinHeight("0");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$("listUl").css("min-height"), "0px", "Min height can be set to 0.");

		// Act
		this.oGrid.setMinHeight("20px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$("listUl").css("min-height"), "20px", "Min height can be set to 20px.");
	});

	QUnit.test("Tooltip", function (assert) {
		// Arrange
		var sExample = "Some tooltip";
		this.oGrid.setTooltip(sExample);

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$("listUl").attr("title"), sExample, "The grid has the expected tooltip");
	});

	QUnit.test("Allow dense fill", function (assert) {
		// Arrange
		this.oGrid.setAllowDenseFill(true);

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oGrid.$("listUl").hasClass("sapFGridContainerDenseFill"), "The grid has class 'sapFGridContainerDenseFill' when allowDenseFill is true");

	});

	QUnit.test("Inline block layout", function (assert) {
		// Arrange
		var oTile = new GenericTile({
			layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })
		});
		this.oGrid.addItem(oTile);
		this.oGrid.setInlineBlockLayout(true);

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$("listUl").css("grid-auto-rows"), "min-content", "The grid has 'grid-auto-rows:min-content', when inlineBlockLayout is true");
		assert.strictEqual(oTile.$().parent().css("grid-row-start"), "span 1", "The grid items have row span 1");

	});

	QUnit.module("Items", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Render items", function (assert) {
		// Arrange
		this.oGrid
			.addItem(new GenericTile({id: "tile1", header: "Comulative Tools"}))
			.addItem(new GenericTile({id: "tile2", header: "Travel and Expenses"}));

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(this.oGrid.getDomRef(), "GridContainer is rendered");
		assert.ok(this.oGrid.$().find("#tile1").length, "Item 1 is rendered");
		assert.ok(this.oGrid.$().find("#tile1").parent().attr("id"), "Item 1's wrapper has ID created during rendering");
		assert.ok(this.oGrid.$().find("#tile2").length, "Item 2 is rendered");
		assert.ok(this.oGrid.$().find("#tile2").parent().attr("id"), "Item 2's wrapper has ID created during rendering");
	});

	QUnit.test("Add/remove items", function (assert) {
		// Arrange
		var oItem = new GenericTile({id: "tile1", header: "Comulative Tools"});

		// Act
		this.oGrid.addItem(oItem);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(this.oGrid.$().find("#tile1").length, 1, "Item 1 is rendered");

		// Act
		this.oGrid.removeItem(oItem);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/; // render the grid

		var $grid,
			oItem1 = new GenericTile({id: "tile1", header: "Comulative Tools"}),
			oItem2 = new GenericTile({id: "tile2", header: "Travel and Expenses"}),
			oItem3 = new GenericTile({id: "tile3", header: "Tools", layoutData: new GridContainerItemLayoutData({ minRows: 2, columns: 2 })});

		// Act
		this.oGrid.insertItem(oItem1, -1);
		this.oGrid.insertItem(oItem2, 5000);
		this.oGrid.insertItem(oItem3, 1);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		$grid = this.oGrid.$("listUl");
		assert.strictEqual($grid.find("#tile1").length, 1, "Item 1 is inserted with index which is out of range");
		assert.ok($grid.find("#tile1").attr("id"), "Item 1's wrapper has an ID created through insertItem");
		assert.strictEqual($grid.find("#tile2").length, 1, "Item 2 is inserted with index which is out of range");
		assert.ok($grid.find("#tile2").attr("id"), "Item 2's wrapper has an ID created through insertItem");
		assert.strictEqual($grid.find("#tile3").length, 1, "Item 3 is inserted with index 1");
		assert.strictEqual($grid.find("#tile3").parent().index(), 1, "Item 3 is inserted on correct location");
		assert.ok($grid.find("#tile3").attr("id"), "Item 3's wrapper has an ID created through insertItem");

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		aExamples.forEach(function (oExample, iInd) {
			var $gridItem = oExample.item.$().parent();

			assert.strictEqual($gridItem.css("grid-row-start"), "span " + oExample.expectedRows, "Item " + iInd + " rows are as expected");
			assert.strictEqual($gridItem.css("grid-column-start"), "span " + oExample.expectedColumns, "Item " + iInd + " columns are as expected");
		});
	});

	QUnit.test("Visible/Invisible items", function (assert) {
		// Arrange
		var oVisibleItem = new GenericTile({id: "tile1", header: "Comulative Tools"}),
			oInvisibleItem = new GenericTile({id: "tile2", header: "Comulative Tools", visible: false});

		// Act
		this.oGrid.addItem(oVisibleItem);
		this.oGrid.addItem(oInvisibleItem);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		var aWrappers = this.oGrid.$("listUl").children();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oInvisibleItem.setVisible(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok(aWrappers[1].offsetWidth > 0, "When item is turned to visible, its wrapper should take width.");

		// Act
		oVisibleItem.setVisible(false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(aWrappers[0].offsetWidth > 0, "When item is turned to invisible, its wrapper should NOT take width.");
		assert.ok(aWrappers[1].offsetWidth > 0, "Wrapper of visible item should take width.");
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

		nextUIUpdate.runSync()/*fake timer is used in module*/;
		$grid = this.oGrid.$("listUl");

		// Act - hide first item
		oModel.setProperty("/0/visible", false);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok($grid.children()[0].offsetWidth === 0, "The first item is not visible and wrapper is not visible.");

		// Act - back to visible
		oModel.setProperty("/0/visible", true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok($grid.children()[0].offsetWidth > 0, "The first item is visible again.");

		// Act - set second item to visible
		oModel.setProperty("/1/visible", true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.ok($grid.children()[1].offsetWidth > 0, "The second item is visible.");

		// Clean up
		this.oGrid.setModel(null);
		this.oGrid.unbindAggregation("items");
	});

	QUnit.test("Item with more columns than the grid with columns auto-fill", function (assert) {
		// Arrange
		var oItem = new Card({
			layoutData: new GridContainerItemLayoutData({ columns: 6 })
		});
		this.oGrid.addItem(oItem);

		// Act
		this.oGrid.setWidth("370px"); // place for 4 columns
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(100);

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oItem.$().parent().css("grid-column-start"), "span 4", "Item has 4 columns as expected");
	});

	QUnit.test("Item resize", function (assert) {
		// Arrange
		var oItem = new Card();
		this.oGrid.addItem(oItem);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oItem.setHeight("400px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(oItem.$().parent().css("grid-row-start"), "span 5", "Item has 5 rows after resize");
	});

	QUnit.test("Item resize handler is deregistered and registered on invalidation", function (assert) {
		// Arrange
		var fnRegisterSpy = this.spy(ResizeHandler, "register"),
			fnDeregisterSpy = this.spy(ResizeHandler, "deregister"),
			oItem = new Card();

		this.oGrid.addItem(oItem);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		fnRegisterSpy.resetHistory();

		// Act
		oItem.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(fnDeregisterSpy.callCount, 1, "ResizeHandler.deregister() is called once");
		assert.strictEqual(fnRegisterSpy.callCount, 1, "ResizeHandler.register() is called once");
		assert.ok(fnRegisterSpy.calledWith(oItem), "ResizeHandler.register() is called for the correct item");
	});

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
			fnLogErrorSpy = this.spy(Log, "error");

		// Assert
		assert.ok(isNaN(oSettings.getRowSizeInPx()), "Row size of '5in' can not be parsed and results in NaN");
		assert.ok(fnLogErrorSpy.calledOnce, "An error was logged about that row size '5in' can not be converted to 'px'");
		assert.strictEqual(oSettings.getGapInPx(), 0, "Gap size of 0 is 0 in 'px'");
	});

	QUnit.module("Layout settings & breakpoints", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Custom layout settings", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({rowSize: "90px", columnSize: "90px", gap: "20px"});
		this.oGrid.setAggregation("layout", oSettings);

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assertGridSettings(this.oGrid, oSettings, "layout", assert);
	});

	QUnit.test("Layout settings with breathing", function (assert) {
		// Arrange
		var oSettings = new GridContainerSettings({columns: 10, rowSize: "90px", minColumnSize: "90px", maxColumnSize: "150px", gap: "20px"});
		this.oGrid.setAggregation("layout", oSettings);

		// Act
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		var $itemWrapper = oItem.$().parent();

		assert.strictEqual($itemWrapper.width(), 150, "Item width is stretched to max column size when there is space.");
		this.oGrid.$().width("80px");
		assert.strictEqual($itemWrapper.width(), 80, "Item width is equal to min column size when there is not enough space.");
	});

	QUnit.test("If breakpoint XS is not defined, fallback to S", function (assert) {
		// Arrange
		var oLayoutS = new GridContainerSettings({rowSize: "40px", columnSize: "40px", gap: "4px"});
		this.oGrid.setAggregation("layoutS", oLayoutS);
		this.oGrid.setContainerQuery(true);
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		this.oGrid.$().width("350px");
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		this.clock.tick(500);

		// Assert
		assertGridSettings(this.oGrid, oLayoutS, "layoutS", assert);
	});

	QUnit.module("Layout breakpoints", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
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
			this.oLayoutChangeStub = this.stub();
			this.oGrid.attachLayoutChange(function (oEvent) {
				this.oLayoutChangeStub(oEvent.getParameter("layout"));
			}.bind(this));
		},
		afterEach: function () {
			this.oGrid.destroy();
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Breakpoints", function (assert) {
		// Arrange
		this.oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
			this.oLayoutChangeStub.resetHistory();
		}

		Device.resize.width = iOriginalWidth;
	});

	QUnit.test("Breakpoints when containerQuery is true", function (assert) {
		// Arrange
		this.oGrid.setContainerQuery(true);

		var oContainer = new Panel({content: this.oGrid});
		oContainer.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act & Assert
		var sLayoutName;

		for (var sWidth in this.mLayouts) {

			// Act
			oContainer.$().width(sWidth);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			this.clock.tick(500);

			// Assert
			sLayoutName = this.mLayouts[sWidth];
			assertGridSettings(this.oGrid, this.mTestSettings[sLayoutName], sLayoutName, assert);
			assert.ok(this.oLayoutChangeStub.calledWith(sLayoutName), "Layout change event was called for layout " + sLayoutName);
			this.oLayoutChangeStub.resetHistory();
		}

		oContainer.destroy();
	});

	QUnit.test("Should not trigger layout change when container hides", function (assert) {
		// Arrange
		var oContainer = new Panel({ content: this.oGrid }),
			fnLayoutChangeSpy = this.stub();

		this.oGrid.setWidth("100%");
		this.oGrid.setContainerQuery(true);

		oContainer.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		this.oGrid.attachLayoutChange(fnLayoutChangeSpy);

		// Act
		oContainer.$().hide();
		this.clock.tick(500);

		// Assert
		assert.strictEqual(fnLayoutChangeSpy.called, false, "Layout change is not called when container hides.");

		// Clean up
		oContainer.destroy();
	});

	QUnit.module("Resizing", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);

			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oGrid.destroy();
		},
		after: function() {
			sinon.config.useFakeTimers = false;
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

		var fnApplyLayout = this.spy(this.oGrid, "_applyLayout");

		// Arrange
		this.oGrid.$().width('123px');

		// forcing calling all resize listeners
		ResizeHandler.suspend(this.oGrid.getDomRef());
		ResizeHandler.resume(this.oGrid.getDomRef());

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		// 2*80px + 1*16px = 176
		assert.strictEqual(this.oGrid.$().height(), 176, "Grid height is correct. Equal to two rows and one gap.");
		assert.strictEqual(this.oGrid.$().width(), this.oGrid.$().parent().width(), "Grid width is 100%.");

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		for (var sWidth in mSizes) {

			// Act
			this.oGrid.$().width(sWidth);
			this.oGrid._resize();
			this.clock.tick(100);

			// Assert
			assert.strictEqual(mSizes[sWidth], iColumnsCount, "columnsChange event was called correctly for width " + sWidth);
		}
	});

	QUnit.module("Keyboard mouse and focus handling", {
		beforeEach: function () {

			// Arrange
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oScrollContainer = new ScrollContainer({
				height: "200px",
				content: this.oGrid = new GridContainer({
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
							layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 }),
							dataMode: "Active"
						})
					]
				})
			});

			this.oScrollContainer.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oScrollContainer.destroy();
		},
		isVerticallyScrolledTo: function (oElem) {
			var oElemRect = oElem.getBoundingClientRect(),
				oScrollContRect = this.oScrollContainer.getDomRef().getBoundingClientRect();

			return oElemRect.top >= oScrollContRect.top && oElemRect.top <= oScrollContRect.bottom;
		}
	});

	QUnit.test("Right Arrow navigation through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef("listUl").children[0],
			oItemWrapper2 = this.oGrid.getDomRef("listUl").children[1],
			oScrollSpy = this.spy(this.oGrid.getItems()[1].getCardHeader().getDomRef(), "scrollIntoView");

		oItemWrapper1.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper2.getAttribute("tabindex"), "0", "Focus should be on the second GridItem");

		// Act - continue with arrow right
		qutils.triggerKeydown(oItemWrapper2, KeyCodes.ARROW_RIGHT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper2.getAttribute("tabindex"), "0", "Focus should stay on the same item");

		// Assert
		assert.ok(oScrollSpy.notCalled, "scrollIntoView is not called");

		oScrollSpy.resetHistory();
	});

	QUnit.test("Down Arrow navigating through grid container", function (assert) {
		// Arrange
		var done = assert.async();
		var oItemWrapper1 = this.oGrid.getDomRef("listUl").children[0],
			oItemWrapper3 = this.oGrid.getDomRef("listUl").children[2],
			oItemWrapper5 = this.oGrid.getDomRef("listUl").children[4];

		oItemWrapper1.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper3.getAttribute("tabindex"), "0", "Focus should be on the third GridItem (the item below)");

		// Act
		this.oGrid._oItemNavigation._onFocusLeave();
		oItemWrapper5.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		qutils.triggerKeydown(oItemWrapper5.firstElementChild, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper5.getAttribute("tabindex"), "0", "Focus should remain on the fifth GridItem if there is no other item below it");
		setTimeout(function () {
			assert.ok(this.isVerticallyScrolledTo(oItemWrapper5), "scrollIntoView is called 1");
			done();
		}.bind(this), 50);
	});

	QUnit.test("Left Arrow navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper3 = this.oGrid.getDomRef("listUl").children[2];
		oItemWrapper3.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper3, KeyCodes.ARROW_LEFT, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper3.getAttribute("tabindex"), "0", "Focus should stay on the same item");
	});

	QUnit.test("Up Arrow navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef("listUl").children[0],
			oItemWrapper3 = this.oGrid.getDomRef("listUl").children[2];
		oItemWrapper3.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper3, KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper1.getAttribute("tabindex"), "0",  "Focus should be on the first GridItem");
	});

	QUnit.test("Page Down navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper1 = this.oGrid.getDomRef("listUl").children[0],
			oItemWrapper5 = this.oGrid.getDomRef("listUl").children[4];
		oItemWrapper1.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper1, KeyCodes.PAGE_DOWN, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper5.getAttribute("tabindex"), "0",  "Focus should be on the third GridItem");
	});

	QUnit.test("Page Up navigating through grid container", function (assert) {
		// Arrange
		var oItemWrapper2 = this.oGrid.getDomRef("listUl").children[1],
			oItemWrapper4 = this.oGrid.getDomRef("listUl").children[3];
			oItemWrapper4.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oItemWrapper4, KeyCodes.PAGE_UP, false, false, false);

		// Assert
		assert.strictEqual(oItemWrapper2.getAttribute("tabindex"), "0",  "Focus should be on the first GridItem");
	});

	QUnit.test("Tabbing through a tile - focus should leave the grid container", function (assert) {

		// Arrange
		var oItemWrapperTile = this.oGrid.getDomRef("listUl").children[3],
			oTile = oItemWrapperTile.children[0],
			oForwardTabSpy = this.spy(this.oGrid._oItemNavigation, "forwardTab");

		oItemWrapperTile.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		// Act
		qutils.triggerKeydown(oItemWrapperTile, KeyCodes.TAB, false, false, false);

		// Assert
		assert.ok(oForwardTabSpy.called, "Focus should leave the GridContainer");

		oTile.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.strictEqual(document.activeElement, oTile.parentNode, "Focus is moved to the list item.");
	});

	QUnit.test("Tabbing through a List Card should leave the grid container at last focusable element", function (assert) {
		// Arrange
		var done = assert.async();

		this.oCard.attachEvent("_ready", function () {
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			// Arrange
			this.oGrid._oItemNavigation.setFocusedIndex(4);
			var listDomRef = this.oCard.getCardContent()._getList().getDomRef(),
				firstListItem = listDomRef.children[1].children[0],
				oForwardTabSpy = this.spy(this.oGrid._oItemNavigation, "forwardTab");

			firstListItem.focus();
			nextUIUpdate.runSync()/*fake timer is used in module*/;
			// Act
			qutils.triggerKeydown(firstListItem, KeyCodes.TAB, false, false, false);

			// Assert
			assert.strictEqual(oForwardTabSpy.called, true, "Focus should leave the GridContainer");
			done();
		}.bind(this));
	});

	QUnit.test("focusing the grid list item should call onfocusin of the control", function (assert) {
		// Arrange
		var done = assert.async(),
			oCardFocusInSpy = this.spy(Card.prototype, "onfocusin"),
			oIntegrationCardFocusInSpy = this.spy(IntegrationCard.prototype, "onfocusin");

		this.oCard.attachEvent("_ready", function () {
			nextUIUpdate.runSync()/*fake timer is used in module*/;

			var oItemWrapper = this.oGrid.getDomRef("listUl").children[1];
			oItemWrapper.focus();

			// Assert
			assert.ok(oCardFocusInSpy.called, "onfocusin is called");

			oItemWrapper = this.oGrid.getDomRef("listUl").children[4];
			oItemWrapper.focus();

			// Assert
			assert.ok(oIntegrationCardFocusInSpy.called, "onfocusin is called");

			done();
		}.bind(this));
	});

	QUnit.test("Press on wrapper should transfer events to the inner control", function (assert) {

		// Arrange
		var oItemWrapper = this.oGrid.getDomRef("listUl").children[3],
			oAttachPressSpy = this.spy(this.oTile, "firePress");

		oItemWrapper.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeyup(oItemWrapper, KeyCodes.ENTER, false, false, false);

		// Assert
		assert.strictEqual(oAttachPressSpy.callCount, 1, "Tile is pressed");
	});

	QUnit.test("FocusDomRef tab index", function (assert) {
		var oCard = this.oGrid.getItems()[0];

		assert.strictEqual(oCard.getFocusDomRef().getAttribute("tabindex"), null, "Focus DomRef should not have tabindex");

		oCard.getHeader().invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(oCard.getFocusDomRef().getAttribute("tabindex"), null, "Focus DomRef should not have tabindex");
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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

	QUnit.test("Keyboard Drag&Drop: Alt + Arrow Right", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_RIGHT, false, /**alt */true,  false );

		assert.strictEqual(this.oGrid.indexOfItem(this.oDraggedControl), -1, "Dragging should be disabled for alt + arrow keys");
		assert.strictEqual(this.oGrid.indexOfItem(this.oDroppedControl), -1, "Dragging should be disabled for alt + arrow keys");
	});

	QUnit.test("Keyboard Drag&Drop: Check that GridDragOver is not used", function (assert) {
		// Arrange
		var oFirstItemWrapper = this.oGrid.getItems()[0].getDomRef().parentElement,
			fnGetInstanceSpy = this.spy(GridDragOver, "getInstance");

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_DOWN, false, false, /**ctrl */ true );

		// Assert
		assert.ok(fnGetInstanceSpy.notCalled, "GridDragOver#getInstance() is not called during keyboard drag and drop.");
	});

	QUnit.test("Wrapper IDs are preserved after Drag&Drop operations", function (assert) {
		// Arrange
		var oFirstItem = this.oGrid.getItems()[0];
		var sFirstItemWrapperId = oFirstItem.getDomRef().parentElement.id;
		var oSecondItem = this.oGrid.getItems()[1];
		var sSecondItemWrapperId = oSecondItem.getDomRef().parentElement.id;

		var oFirstItemWrapper = oFirstItem.getDomRef().parentElement;

		// Act
		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.ARROW_RIGHT, false, false, /**ctrl */ true );

		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.strictEqual(this.oDraggedControl.getDomRef().parentElement.id, sFirstItemWrapperId, "The dragged item wrapper's ID is preserved");
		assert.strictEqual(this.oDroppedControl.getDomRef().parentElement.id, sSecondItemWrapperId, "The dropped item wrapper's ID is preserved");
	});

	QUnit.module("Keyboard Drag&Drop in RTL mode - suggested positions in different directions", {
		beforeEach: function () {
			var oSettings = new GridContainerSettings({columns: 2, rowSize: "80px", columnSize: "80px", gap: "16px"});

			this.oRTLStub = this.stub(Localization, "getRTL").returns(true);

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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
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

	QUnit.module("Focus handling", {
		before: function() {
			sinon.config.useFakeTimers = true;
		},
		after: function() {
			sinon.config.useFakeTimers = false;
		}
	});

	QUnit.test("Pressing on clickable element inside an item doesn't move the focus to the item", function (assert) {
		// Arrange
		var oBtn = new Button(),
			oGrid = new GridContainer({
				items: [ oBtn ]
			}),
			oItemWrapper,
			oItemWrapperFocusSpy;

		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oItemWrapper = oGrid.getDomRef().children[1];
		oItemWrapperFocusSpy = this.spy(oItemWrapper, "focus");

		// Act
		qutils.triggerMouseEvent(oBtn.getFocusDomRef(), "mousedown");
		qutils.triggerMouseEvent(oBtn.getFocusDomRef(), "mouseup");

		this.clock.tick(500);

		// Assert
		assert.ok(oItemWrapperFocusSpy.notCalled, "The item wrapper didn't get focused.");

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("Mouse up for a tile handles focus correctly", function (assert) {
		// Arrange
		var oTile = new GenericTile({
				header: "Tile 1",
				layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 1 })
			}),
			oGrid = new GridContainer({
				items: [ oTile ]
			});

		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerEvent("mousedown", oTile.getDomRef());
		oTile.getFocusDomRef().focus();
		oGrid._oItemNavigation._onMouseUp();

		// Assert
		assert.strictEqual(document.activeElement, oTile.getDomRef().parentElement, "The item wrapper of the tile is focused instead of the tile itself.");

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("Item with own focus, when the item has no focusable content", function (assert) {
		// Arrange
		var oCard = new Card({height: "100%"}),
			oGrid = new GridContainer({
				items: [ oCard ]
			});
		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Assert
		assert.notOk(GridContainerUtils.getItemWrapper(oCard).classList.contains("sapFGridContainerItemWrapperNoVisualFocus"), "Class for own focus is not added");

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("'after' dummy area correctly forwards the focus to grid item", function (assert) {
		// Arrange
		var oCard = new Card(),
			oGrid = new GridContainer({
				items: [ oCard ]
			});

		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act - focus the "after" element
		qutils.triggerEvent("focusin", oGrid.getDomRef("after"));

		// Assert - check if the "after" element correctly forwarded the focus to grid element
		assert.strictEqual(document.activeElement, GridContainerUtils.getItemWrapper(oCard), "Correct grid item wrapper is focused");

		// Clean up
		oGrid.destroy();
	});

	QUnit.test("'before' dummy area correctly forwards the focus to grid item", function (assert) {
		// Arrange
		var oBtnBefore = new Button(),
			oBtn1 = new Button({ text: "1" }),
			oBtn2 = new Button({ text: "2" }),
			oGrid = new GridContainer({
				items: [ oBtn1, oBtn2 ]
			});

		oBtnBefore.placeAt(DOM_RENDER_LOCATION);
		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerEvent("focusin", oGrid.getDomRef());
		qutils.triggerEvent("focusin", oGrid.getDomRef("before"));

		// Assert - check if the "before" element correctly forwarded the focus to grid element
		assert.strictEqual(document.activeElement, GridContainerUtils.getItemWrapper(oBtn1), "First grid item wrapper should be focused");

		// Act - focus the second item and leave the grid
		qutils.triggerKeydown(document.activeElement, KeyCodes.ARROW_RIGHT, false, false, false);
		oBtnBefore.focus();

		// Act - return the focus where it was
		qutils.triggerEvent("focusin", oGrid.getDomRef("before"));

		// Assert - check if the "before" element correctly restored the focus to grid element
		assert.strictEqual(document.activeElement, GridContainerUtils.getItemWrapper(oBtn2), "Second grid item wrapper should be focused");

		// Clean up
		oBtnBefore.destroy();
		oGrid.destroy();
	});

	QUnit.test("#focusItem should reset grid matrix position", function (assert) {
		// Arrange
		var oBtn1 = new Button({ text: "1" }),
			oBtn2 = new Button({ text: "2" }),
			oGrid = new GridContainer({
				items: [ oBtn1, oBtn2 ]
			});

		oGrid.placeAt(DOM_RENDER_LOCATION);
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		oGrid.focusItem(1);

		// Assert - check if the "before" element correctly forwarded the focus to grid element
		assert.strictEqual(oGrid._oItemNavigation._mCurrentPosition, null, "Matrix position should be reset");

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
					}),
					new IntegrationCard({
						manifest: oIntegrationCardManifest,
						layoutData: new GridContainerItemLayoutData({ columns: 1, rows: 2 }),
						dataMode: "Active"
					})
				]
			});

			this.oGrid.placeAt(DOM_RENDER_LOCATION);
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Wrapper attributes", async function (assert) {
		await nextCardReadyEvent(this.oGrid.getItems()[2]);
		await nextUIUpdate();

		var oWrapper = this.oGrid.$("listUl").children().eq(0),
			oCard,
			oHeader,
			sAriaLabelledByIds;

		assert.notOk(oWrapper.attr("aria-keyshortcuts"), "there is not aria-keyshortcuts attribute");
		assert.strictEqual(oWrapper.attr("tabindex"), "-1", "tabindex is set");

			oCard = this.oGrid.getItems()[2];
			oHeader = oCard.getCardHeader();
			oWrapper = this.oGrid.$("listUl").children().eq(2);
			sAriaLabelledByIds = oCard._ariaText.getId() + " " + oHeader._getTitle().getId() + " " + oHeader._getSubtitle().getId() + " " + oHeader.getId() + "-status" + " " + oHeader.getId() + "-dataTimestamp" + " " + oHeader.getId() + "-ariaAvatarText";

			assert.notOk(oWrapper.attr("aria-roledescription"), "aria-roledescription attribute is not set");
			assert.strictEqual(oWrapper.children()[0].getAttribute("aria-labelledby"), sAriaLabelledByIds, "Card header element should have aria-labelledby - pointing to the ID of an element describing the card type, title, subtitle, status text, dataTimestamp or avatar, if there is such element");
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
			nextUIUpdate.runSync()/*fake timer is used in module*/;
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("Creating grid matrix", function (assert) {
		// Arrange
		var aMatrix = this.oGrid.getNavigationMatrix();

		// Assert
		assert.strictEqual(aMatrix.length, 6, "Matrix created with the expected number of rows");
		assert.strictEqual(aMatrix[0].length, 6, "Matrix created with the expected number of columns");
	});

	QUnit.test("Creating grid matrix with inlineBlockLayout enabled", function (assert) {
		// Arrange
		this.oGrid.setInlineBlockLayout(true);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var aMatrix = this.oGrid.getNavigationMatrix();

		// Assert
		assert.strictEqual(aMatrix.length, 2, "Matrix created with the expected number of rows");
		assert.strictEqual(aMatrix[0].length, 6, "Matrix created with the expected number of columns");
	});

	QUnit.test("Creating grid matrix when theme is not loaded", function (assert) {
		// Arrange
		this.stub(this.oGrid, "_bThemeApplied").value(false);

		// Assert
		assert.strictEqual(this.oGrid.getNavigationMatrix(), null, "'null' is returned when theme is not yet loaded");
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
			oSpy = this.spy();

		this.oGrid.attachBorderReached(oSpy);

		oTopMostItemWrapper.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oTopMostItemWrapper, KeyCodes.ARROW_UP, false, false, false);

		// Assert
		assert.ok(oSpy.called, "'borderReached' event is fired");
	});

	QUnit.test("Arrow Down at the bottom of the matrix should trigger 'borderReached' event", function (assert) {
		// Arrange
		var oBottomMostItemWrapper = this.oGrid.getItems()[3].getDomRef().parentElement,
			oSpy = this.spy();

		this.oGrid.attachBorderReached(oSpy);

		oBottomMostItemWrapper.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		// Act
		qutils.triggerKeydown(oBottomMostItemWrapper, KeyCodes.ARROW_DOWN, false, false, false);

		// Assert
		assert.ok(oSpy.called, "'borderReached' event is fired");
	});

	QUnit.test("Navigation between items of different size based on starting position top", function (assert) {
		// ArrangeKeyCodes.
		var oSecondItemWrapper = this.oGrid.getItems()[1].getDomRef().parentElement;

		oSecondItemWrapper.focus();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

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
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		oGrid._resize();

		assert.ok(oGrid._lastGridWidth, "_lastGridWidth is set");
		assert.ok(oGrid._lastViewportWidth, "_lastViewportWidth is set");

		oGrid.invalidate();
		nextUIUpdate.runSync()/*fake timer is used in module*/;

		assert.notOk(oGrid._lastGridWidth, "_lastGridWidth is not set");
		assert.notOk(oGrid._lastViewportWidth, "_lastViewportWidth is not set");

		oGrid.destroy();
	});

	QUnit.module("Keyboard handling", {
		beforeEach: function () {
			this.oGrid = new GridContainer();
			this.oGrid.placeAt(DOM_RENDER_LOCATION);
		},
		afterEach: function () {
			this.oGrid.destroy();
		}
	});

	QUnit.test("HOME keydown on indirect child", function (assert) {
		var oSf = new SearchField();
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(oSf);
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oSf.focus();

		assert.strictEqual(document.activeElement, oSf.getFocusDomRef(), "Focus is in the search field");

		qutils.triggerKeydown(oSf.getFocusDomRef(), KeyCodes.HOME);

		assert.strictEqual(document.activeElement, oSf.getFocusDomRef(), "Focus should still be on the search field");
	});

	QUnit.test("END keydown on indirect child", function (assert) {
		var oSf = new SearchField();
		this.oGrid.addItem(oSf);
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		oSf.focus();

		assert.strictEqual(document.activeElement, oSf.getFocusDomRef(), "Focus is in the search field");

		qutils.triggerKeydown(oSf.getFocusDomRef(), KeyCodes.END);

		assert.strictEqual(document.activeElement, oSf.getFocusDomRef(), "Focus should still be on the search field");
	});

	QUnit.test("HOME keydown on direct child (item wrapper)", function (assert) {
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var oFirstItemWrapper = this.oGrid.getDomRef("listUl").children[0];
		var oLastItemWrapper = this.oGrid.getDomRef("listUl").children[2];
		oLastItemWrapper.focus();

		assert.strictEqual(document.activeElement, oLastItemWrapper, "Focus is on the last grid item");

		qutils.triggerKeydown(oLastItemWrapper, KeyCodes.HOME);

		assert.strictEqual(document.activeElement, oFirstItemWrapper, "Focus should be moved to the first grid item");
	});

	QUnit.test("HOME keydown on direct child (item wrapper)", function (assert) {
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		this.oGrid.addItem(new SearchField());
		nextUIUpdate.runSync()/*fake timer is used in module*/;
		var oFirstItemWrapper = this.oGrid.getDomRef("listUl").children[0];
		var oLastItemWrapper = this.oGrid.getDomRef("listUl").children[2];
		oFirstItemWrapper.focus();

		assert.strictEqual(document.activeElement, oFirstItemWrapper, "Focus is on the first grid item");

		qutils.triggerKeydown(oFirstItemWrapper, KeyCodes.END);

		assert.strictEqual(document.activeElement, oLastItemWrapper, "Focus should be moved to the last grid item");
	});

});
