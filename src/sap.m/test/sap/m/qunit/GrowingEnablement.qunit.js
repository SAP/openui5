/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/util/MockServer",
	"sap/m/List",
	"sap/m/GrowingEnablement",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/StandardListItem",
	"sap/m/CustomListItem",
	"sap/ui/core/HTML",
	"sap/m/Page"
], function(Core, createAndAppendDiv, MockServer, List, GrowingEnablement, Table, Column, ColumnListItem, Text, ODataModel, JSONModel, Sorter, StandardListItem, CustomListItem, HTML, Page) {
	"use strict";
	createAndAppendDiv("growing1");
	createAndAppendDiv("growing2");



	QUnit.module("trigger");
	QUnit.test("Should update the trigger state correctly", function(assert) {
		var done = assert.async();
		//Arrange
		var data = { items: [ {},{}] };

		var oModel = new JSONModel();
		oModel.setData(data);

		//System under Test
		var oList = new List({
			growing : true,
			growingThreshold: 1,
			items : {
				path : "/items",
				template : new CustomListItem({
					content : new HTML({content:'<div style="height: 10000px"></div>'})
				})
			}
		}).setModel(oModel);

		var oPage = new Page({
			title: "List Page",
			content : oList
		});

		oPage.placeAt("qunit-fixture");
		Core.applyChanges();

		// sytem under test
		var oGrowingDelegate = oList._oGrowingDelegate;
		var oTrigger = oGrowingDelegate._oTrigger;

		// Act
		setTimeout(function() {
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible after initial rendering");

			// act + assert loading is started case
			oGrowingDelegate._updateTrigger(true);

			assert.ok(oTrigger.getBusy(), "Trigger shows the busy indicator");
			assert.ok(!oTrigger.$().hasClass("sapMLIBActive"), "Trigger is not active since it is busy");
			assert.ok(oTrigger.$().hasClass("sapMGrowingListBusyIndicatorVisible"), "Busy indicator visible class is added");
			assert.strictEqual(oList.$("triggerText").css("visibility"), "hidden", "Growing trigger text is hidden");
			assert.strictEqual(oList.$("triggerInfo").css("visibility"), "hidden", "Growing infor text is hidden");
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible");

			// act + assert loading is finished case for growingScrollToLoad=false
			oGrowingDelegate._updateTrigger(false);
			assert.ok(!oTrigger.getBusy(), "Trigger does not show the busy indicator");
			assert.ok(!oTrigger.$().hasClass("sapMGrowingListBusyIndicatorVisible"), "Busy indicator visible class is removed");
			assert.strictEqual(oList.$("triggerText").css("visibility"), "visible", "Growing trigger text is visible");
			assert.strictEqual(oList.$("triggerInfo").css("visibility"), "visible", "Growing info text is visible");
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible");

			// act + assert growingScrollToLoad=true
			oList.setGrowingScrollToLoad(true);
			Core.applyChanges();
			assert.ok(oList.$("triggerList").is(":hidden"), "Load more trigger is not visible");

			// act + assert loading is started case for growingScrollToLoad=true
			oGrowingDelegate._updateTrigger(true);
			assert.ok(oTrigger.getBusy(), "Trigger shows the busy indicator");
			assert.ok(!oTrigger.$().hasClass("sapMLIBActive"), "Trigger is not active since it is busy");
			assert.ok(oTrigger.$().hasClass("sapMGrowingListBusyIndicatorVisible"), "Busy indicator visible class is added");
			assert.strictEqual(oList.$("triggerText").css("visibility"), "hidden", "Growing trigger text is hidden");
			assert.strictEqual(oList.$("triggerInfo").css("visibility"), "hidden", "Growing infor text is hidden");
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible");

			// act + assert loading is finished case for growingScrollToLoad=true
			oGrowingDelegate._updateTrigger(false);
			assert.ok(!oTrigger.getBusy(), "Trigger does not show the busy indicator");
			assert.ok(!oTrigger.$().hasClass("sapMGrowingListBusyIndicatorVisible"), "Busy indicator visible class is removed");
			assert.ok(!oList.$("triggerText").is(":visible"), "Growing trigger text is not visible");
			assert.ok(!oList.$("triggerInfo").is(":visible"), "Growing info text is not visible");
			assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible");

			// check for Growing trigger DOM
			assert.equal(oTrigger.TagName, "div", "Growing trigger has TagName as div");
			assert.ok(oTrigger.$().is("div"), "Growing trigger rendered as div in DOM");
			assert.ok(jQuery(".sapMSLITitle").is("span"), "More button rendered with span tag");
			assert.strictEqual(oTrigger.$().attr("role"), "button", "role=button");
			assert.strictEqual(oTrigger.$().attr("aria-selected"), undefined, "aria-selected attribute removed as role=button");

			// act + assert growingScrollToLoad=true
			oList.setGrowingScrollToLoad(false);
			Core.applyChanges();

			setTimeout(function() {
				assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is  visible");
				oGrowingDelegate.requestNewPage();

				setTimeout(function() {
					assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible everything is loaded");
					oPage.destroy();
					oModel.destroy();
					done();
				}, 0);

			}, 0);

		}, 0);
	});

	QUnit.test("Show noDataText and hide 'Load more' trigger when no item is visible", function(assert) {
		var data = { // 3 items
			items: [{
				Title: "Title1",
				Description: "Description1"
			}, {
				Title: "Title2",
				Description: "Description2"
			}, {
				Title: "Title3",
				Description: "Description3"
			}]
		};

		var oModel = new JSONModel();
		oModel.setData(data);

		//System under Test
		var oList = new List({
			growing: true,
			growingThreshold: 1,
			items: {
				path: "/items",
				template: new StandardListItem({
					title: "{Title}",
					description: "{Description}"
				})
			}
		}).setModel(oModel);

		var oPage = new Page({
			title: "List Page",
			content: oList
		});

		oPage.placeAt("qunit-fixture");
		Core.applyChanges();

		var aVisibleItems = oList.getVisibleItems();

		aVisibleItems.forEach(function(oItem) {
			oItem.setVisible(false);
		});

		Core.applyChanges();
		aVisibleItems = oList.getVisibleItems();
		assert.strictEqual(aVisibleItems.length, 0, "List has no visible items.");

		assert.ok(oList.$("nodata-text")[0], "NoDataText is visible");
		assert.ok(oList.$("triggerList").is(":hidden"), "Load more trigger is not visible");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.module("Integration tests");
	QUnit.test("Should determine if the list is scrollable", function(assert) {
		//Arrange
		var data = { items: [ {},{}] };

		var oModel = new JSONModel();
		oModel.setData(data);

		var oList = new List({
			growing : true,
			growingScrollToLoad : true,
			items : {
			path : "/items",
			template : new CustomListItem({
					content : new HTML({content:'<div style="height: 1000px"></div>'})
				})
			}
		}).setModel(oModel);

		var page = new Page({
			title: "List Page",
			content : oList
		});

		//System under Test
		var sut = new GrowingEnablement(oList);

		page.placeAt("qunit-fixture");
		Core.applyChanges();

		//Act + Assert
		assert.ok(sut._getHasScrollbars(), "The list has scrollbars");

		page.destroy();
		oModel.destroy();
		sut.destroy();
	});

	QUnit.test("Should determine if the list is not scrollable", function(assert) {
		//Arrange
		var oList = new List({
			growing : true,
			growingScrollToLoad : true
		});

		//System under Test
		var sut = new GrowingEnablement(oList);

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		//Act + Assert
		assert.ok(!sut._getHasScrollbars(), "The list has no scrollbars");

		sut.destroy();
		oList.destroy();
	});

	QUnit.test("Should react overflow event of the scroll container", function(assert) {
		//Arrange
		var done = assert.async();
		var data = { items: [ {}, {}] };

		var oModel = new JSONModel();
		oModel.setData(data);

		//System under Test
		var oHtml = new HTML({content:'<div style="height: 5000px"></div>'});
		var oList = new List({
			growing : true,
			growingScrollToLoad : true,
			growingThreshold: 1,
			items : {
				path : "/items",
				template : new CustomListItem({
					content : new HTML({content:'<div style="height: 100px"></div>'})
				})
			}
		}).setModel(oModel);
		var oPage = new Page({
			title: "List Page",
			content : [oHtml, oList]
		});

		oPage.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible");

		oHtml.setVisible(false);
		setTimeout(function() {
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is now visible");

			oHtml.setVisible(true);
			setTimeout(function() {
				assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible again");

				oPage.destroy();
				oModel.destroy();
				done();
			}, 300);
		}, 300);
	});

	QUnit.test("List without model", function(assert) {
		var done = assert.async();
		//Arrange
		var oList = new List({
			growing : true,
			growingScrollToLoad : true,
			items: {
				path : "/items",
				template : new StandardListItem()
			}
		});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		//Act + Assert
		assert.ok(!!oList.getDomRef(), "DomRef OK");

		window.setTimeout(function() {
			oList.destroy();
			done();
		}, 0);
	});

	QUnit.module("Odata");


	function startMockServer() {

		MockServer.config({ autoRespond : true });

		var oMockServer = new MockServer({
			rootUri: "http://sap.com/model/"
		});

		oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
		oMockServer.start();
		return oMockServer;
	}

	var oModel;

	function setODataModelAndBindItems (oList) {
		//true is use JSON
		oModel = new ODataModel("http://sap.com/model", true);

		oList.setModel(oModel);

		var oItemTemplate;
		if (oList.isA("sap.m.Table")) {
			oItemTemplate = new ColumnListItem({
				cells: [
					new Text({text: "{Name}"}),
					new Text({text: "{Category}"})
				]
			});
		} else {
			oItemTemplate = new StandardListItem({
				title : "{Name}",
				description : "{Category}"
			});
		}

		oList.bindItems({
			path : "/Products",
			template : oItemTemplate
		});
	}

	function groupList (oList) {
		var oBinding = oList.getBinding("items");
		oBinding.sort([
			new Sorter("Category", false, function(oContext) {
				var sCategory = oContext.getProperty("Category");
				return {
					key : sCategory,
					text : sCategory
				};
			})
		]);
	}

	QUnit.test("Should group and ungroup a List", function (assert) {
		var done = assert.async();
		//Arrange
		var iInitialItemCount,
			oMockServer = startMockServer(),
			oInitialLoadDeferred = jQuery.Deferred(),
			oAfterGroupingDeferred = jQuery.Deferred(),
			oAfterUnGroupingDeferred = jQuery.Deferred(),
			oInitialLoadDeferred = jQuery.Deferred(),
			oList = new List({
				growing : true
			});

		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		oList.attachEventOnce("updateFinished", oInitialLoadDeferred.resolve);

		//Act part 2 - group the list
		jQuery.when(oInitialLoadDeferred).then(function () {
			iInitialItemCount = oList.getItems().length;
			groupList(oList);

			oList.attachEventOnce("updateFinished", oAfterGroupingDeferred.resolve);
		});

		//Act part 3 - ungroup the list
		jQuery.when(oAfterGroupingDeferred).then(function () {
			//ungroup
			oList.getBinding("items").sort([]);

			oList.attachEventOnce("updateFinished", oAfterUnGroupingDeferred.resolve);
		});

		//Assert + Cleanup
		jQuery.when(oAfterUnGroupingDeferred).then(function () {
			assert.strictEqual(iInitialItemCount, oList.getItems().length, "The list did contain the same number of items");
			done();

			oList.destroy();
			oMockServer.stop();
		});

		//Act
		setODataModelAndBindItems(oList);
	});

	QUnit.test("Should grow by the treshold", function (assert) {
		var done = assert.async();
		//Arrange
		var oMockServer = startMockServer(),
			iInitialThreshold = 2,
			oList = new List({
				growing : true,
				//small number that not all data gets loaded
				growingThreshold : iInitialThreshold
			}),
			iTotalNumberOfItems,
			oInitialLoadDeferred = jQuery.Deferred(),
			oSecondPageDeferred = jQuery.Deferred(),
			oAllPagesDeferred = jQuery.Deferred();

		//System under test
		oList.placeAt("qunit-fixture");
		Core.applyChanges();

		oList.attachEventOnce("updateFinished", oInitialLoadDeferred.resolve);

		//Act part 2 - set growing treshold to half of the total items and load a second page
		jQuery.when(oInitialLoadDeferred).then(function () {
			assert.strictEqual(iInitialThreshold, oList.getItems().length, "The list did contain the same number of items as the initial treshold");
			iTotalNumberOfItems = oList.getBinding("items").getLength();

			oList.setGrowingThreshold(Math.floor(iTotalNumberOfItems / 2));
			oList._oGrowingDelegate.requestNewPage();

			oList.attachEventOnce("updateFinished", oSecondPageDeferred.resolve);
		});

		//Act part 3 - load another page - now we should have all items
		jQuery.when(oSecondPageDeferred).then(function () {
			//Assert
			assert.strictEqual(oList.getGrowingThreshold() + iInitialThreshold, oList.getItems().length, "The list did contain the same number of items as twice the treshold");

			oList._oGrowingDelegate.requestNewPage();

			oList.attachEventOnce("updateFinished", oAllPagesDeferred.resolve);
		});

		//Assert - check if all items where loaded
		jQuery.when(oAllPagesDeferred).then(function () {
			assert.strictEqual(iTotalNumberOfItems, oList.getItems().length, "The list did contain the max number of items");

			//Cleanup
			oList.destroy();
			oMockServer.stop();
			done();
		});

		//Act
		//Loads the data
		setODataModelAndBindItems(oList);
	});

	QUnit.test("Prevent DOM update when all columns are hidden (BCP - 2080250160)", function(assert) {
		var oTable = new Table({
				growing: true,
				growingThreshold: 2,
				columns: [
					new Column({
						header: new Text({
							text: "Test"
						})
					})
				],
				items: {
					path: "/items",
					template: new ColumnListItem({
						cells: [
							new Text({
								text: "{stringVal}"
							})
						]
					})
				}
			}),
			data = { items: [
				{
					stringVal: "a"
				},
				{
					stringVal: "b"
				},
				{
					stringVal: "c"
				}
			]},
			oModel = new JSONModel();

		oModel.setData(data);
		oTable.setModel(oModel);

		oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		assert.strictEqual(oTable.getItems().length, 2, "2 items are rendered");

		// hide all columns
		var oColumn = oTable.getColumns()[0];
		oColumn.setVisible(false);

		assert.notOk(oTable._oGrowingDelegate._aChunk.length, "No chunk available since model did not change");

		// change model data and refresh
		data.items.splice(0, 0, {
			stringVal: "d"
		});
		oTable.getModel().refresh();
		// changes done to the model are collected as chuck in the GrowingEnablement
		assert.ok(oTable._oGrowingDelegate._aChunk.length > 0, "chuck is available but not cleared yet since the columns are hidden");

		// make the column visible again
		oColumn.setVisible(true);
		// change model data and refresh
		data.items.splice(0, 0, {
			stringVal: "e"
		});
		oTable.getModel().refresh();
		assert.notOk(oTable._oGrowingDelegate._aChunk.length, "chunk is cleared as expected, which updates the items as expected in the DOM");

		oTable.destroy();
	});

	QUnit.test("Growing should invalidate Table, when autoPopinMode=true", function(assert) {
		var done = assert.async();
		//Arrange
		var oMockServer = startMockServer(),
			iInitialThreshold = 2,
			oTable = new Table({
				autoPopinMode: true,
				growing : true,
				growingThreshold : iInitialThreshold,
				columns: [
					new Column({
						header: new Text({text: "Name"})
					}),
					new Column({
						header: new Text({text: "Category"})
					})
				]
			}),
			oDeferred = jQuery.Deferred();

		//System under test
		oTable.placeAt("qunit-fixture");
		Core.applyChanges();

		oTable.attachEventOnce("updateFinished", oDeferred.resolve);
		var fnGetInitialAccumulatedWidth = sinon.spy(oTable, "_getInitialAccumulatedWidth");

		assert.notOk(oTable.getItems().length, "no items available");
		assert.ok(fnGetInitialAccumulatedWidth.notCalled, "autoPopinMode calculation is not performed yet, since no items available");

		jQuery.when(oDeferred).then(function() {
			assert.ok(oTable.getItems().length, "items are available");
			assert.ok(fnGetInitialAccumulatedWidth.calledOnce, "autoPopinMode calculation performed");

			//Cleanup
			oTable.destroy();
			oMockServer.stop();
			done();
		});

		setODataModelAndBindItems(oTable);
	});

	QUnit.module("Dummy Column", {
		beforeEach: function() {
			var data = [
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"}
			];

			var oModel = new JSONModel();
			oModel.setData(data);

			this.oTable = new Table({
				growing: true,
				growingThreshold: 2,
				fixedLayout: "Strict",
				columns: [
					new Column({width: "20rem"}),
					new Column({width: "30rem"})
				]
			});

			this.oTable.setModel(oModel);

			this.oTable.bindItems({
				path: "/",
				template : new ColumnListItem({
					cells: [
						new Text({text: "{lastName}"}),
						new Text({text: "{firstName}"})
					]
				})
			});

			this.oPage = new Page({
				title: "Table Page",
				content: this.oTable
			});

			this.oPage.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oPage.destroy();
		}
	});

	QUnit.test("Trigger button size should be adapted with dummy column is rendered", function(assert) {
		var oTableDomRef = this.oTable.getDomRef(),
			oTriggerDomRef = this.oTable.getDomRef("trigger"),
			oDummyColDomRef = this.oTable.getDomRef("tblHeadDummyCell");
		assert.ok(oTriggerDomRef.clientWidth - oTableDomRef.clientWidth - oDummyColDomRef.clientWidth < 2, "Trigger button width correctly adapted");
	});

	QUnit.test("Trigger button size should take the full table width when table has popins and dummy column", function(assert) {
		var oColumn = this.oTable.getColumns()[1];

		oColumn.setMinScreenWidth("48000px");
		oColumn.setDemandPopin(true);
		Core.applyChanges();

		var oTableDomRef = this.oTable.getDomRef(),
			oTriggerDomRef = this.oTable.getDomRef("trigger");
		assert.equal(oTableDomRef.clientWidth, oTriggerDomRef.clientWidth, "Table width === Trigger button width");
	});

});
