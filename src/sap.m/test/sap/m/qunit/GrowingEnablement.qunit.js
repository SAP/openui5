/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/core/Lib",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/core/util/MockServer",
	"sap/m/List",
	"sap/m/GrowingEnablement",
	"sap/m/Table",
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/Text",
	"sap/ui/model/odata/ODataModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/m/StandardListItem",
	"sap/m/CustomListItem",
	"sap/ui/core/HTML",
	"sap/m/Page",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes"
], function(Core, Library, createAndAppendDiv, MockServer, List, GrowingEnablement, Table, Column, ColumnListItem, Text, ODataV1Model, ODataModel, JSONModel, Sorter, StandardListItem, CustomListItem, HTML, Page, jQuery, qutils, KeyCodes) {
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

		assert.equal(document.getElementById(oList.$("trigger").attr("aria-describedby")).textContent, Library.getResourceBundleFor("sap.m").getText("LOAD_MORE_DATA_ACC_WITH_COUNT", [1, 2]));

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
			assert.notOk(oTrigger.$().attr("aria-roledescription"), "aria-roledescription remove from the growing trigger");
			assert.notOk(oTrigger.$().attr("aria-posinset"), "aria-posinset remove from the growing trigger");
			assert.notOk(oTrigger.$().attr("aria-setsize"), "aria-setsize remove from the growing trigger");

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

	QUnit.test("Growing Trigger - ACC and Keyboard", function(assert) {
		var done = assert.async();

		var oModel = new JSONModel();
		oModel.setData({items: [{},{}]});

		var oList = new List({
			growing : true,
			growingThreshold: 1,
			items : {
				path : "/items",
				template : new StandardListItem()
			}
		}).setModel(oModel);

		new Page({
			content: oList
		}).placeAt("qunit-fixture");
		Core.applyChanges();

		// sytem under test
		//var oGrowingDelegate = oList._oGrowingDelegate;
		//var oTrigger = oGrowingDelegate._oTrigger;

		setTimeout(function() {
			assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible");

			//Check ACC
			assert.equal(oList.$("trigger").attr("aria-labelledby"), oList.$("triggerText").attr("id"), "aria-labelledby contains reference to the trigger text");
			assert.equal(oList.$("trigger").attr("aria-describedby"), oList.$("triggerMessage").attr("id"), "aria-describedby contains reference to status info");
			assert.ok(oList.$("triggerText").text(), "Status info is available");
			var aCountInfo = oList._oGrowingDelegate._getItemCounts();
			assert.equal(aCountInfo[0], 1, "Current loaded items count known");
			assert.equal(aCountInfo[1], 2, "Overall count known");

			// Test Navigation via Arrow Keys from / to Trigger
			oList.getItems()[0].focus();
			qutils.triggerKeydown(oList.getItems()[0].getDomRef(), KeyCodes.ARROW_DOWN);
			assert.ok(oList.getDomRef("trigger") === document.activeElement, "Trigger has focus after navigation from last item via arrow key");
			qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ARROW_UP);
			assert.ok(oList.getItems()[0].getDomRef() === document.activeElement, "Item has focus after navigation from trigger via arrow key");

			done();
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
		oModel = new ODataModel("http://sap.com/model");

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

			oList.setBusyIndicatorDelay(0);
			oList.focus();
			oList.setBusy(true);
			groupList(oList);

			oList.attachEventOnce("updateFinished", oAfterGroupingDeferred.resolve);
		});

		//Act part 3 - ungroup the list
		jQuery.when(oAfterGroupingDeferred).then(function () {
			assert.strictEqual(document.activeElement, oList.getItems()[0].getDomRef(), "The focus is set correctly");

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
			qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ENTER);

			oList.attachEventOnce("updateFinished", oSecondPageDeferred.resolve);
		});

		//Act part 3 - load another page - now we should have all items
		jQuery.when(oSecondPageDeferred).then(function () {
			//Assert
			assert.strictEqual(oList.getGrowingThreshold() + iInitialThreshold, oList.getItems().length, "The list did contain the same number of items as twice the treshold");

			var fnRequestNewPageSpy = sinon.spy(oList._oGrowingDelegate, "requestNewPage");
			qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.SPACE);
			qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ESCAPE);
			qutils.triggerKeyup(oList.getDomRef("trigger"), KeyCodes.SPACE);
			assert.notOk(fnRequestNewPageSpy.calledOnce);

			qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.SPACE);
			qutils.triggerKeyup(oList.getDomRef("trigger"), KeyCodes.SPACE);
			assert.ok(fnRequestNewPageSpy.calledOnce);
			fnRequestNewPageSpy.restore();

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

		assert.equal(document.getElementById(oTable.$("trigger").attr("aria-describedby")).textContent, Library.getResourceBundleFor("sap.m").getText("LOAD_MORE_ROWS_ACC_WITH_COUNT", [2, 3]));
		assert.strictEqual(oTable.getItems().length, 2, "2 items are rendered");
		var sItemIds = oTable.getItems().toString();

		oTable.setVisible(false);
		Core.applyChanges();
		oTable.getModel().refresh(true);
		assert.strictEqual(oTable.getItems().toString(), sItemIds, "During the binding udpate the items are not destroy even though the table is invisible");
		oTable.setVisible(true);
		Core.applyChanges();

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
		assert.notOk(oTable._oGrowingDelegate._aChunk.length > 0, "chunk is not available, while there is no visible columns it is not necessary to apply the chunk");

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

	QUnit.module("Group item mapping", {
		beforeEach: function() {
			this.clock = sinon.useFakeTimers();
			var oData = { // 10 items
				items : [ {
					Key: "Key1",
					Title : "Title1",
					Description: "Description1"
				}, {
					Key: "Key2",
					Title : "",
					Description: "Description2"
				}, {
					Key: "Key3",
					Title : "Title3",
					Description: "Description3"
				}, {
					Key: "Key1",
					Title : "Title4",
					Description: "Description4"
				}, {
					Key: "Key3",
					Title : "Title5",
					Description: "Description5"
				}, {
					Key: "Key3",
					Title : "Title6",
					Description: "Description6"
				}, {
					Key: "Key1",
					Title : "Title7",
					Description: "Description7"
				}, {
					Key: "Key2",
					Title : "Title8",
					Description: "Description8"
				}, {
					Key: "Key2",
					Title : "Title9",
					Description: "Description9"
				}, {
					Key: "Key3",
					Title : "Title10",
					Description: "Description10"
				} ]
			};
			var oModel = new JSONModel(oData);
			this.oList = new List({
				growing: true,
				growingThreshold: 5
			});
			this.oList.setModel(oModel);
			this.oList.bindItems({
				path: "/items",
				template: new StandardListItem({
					title: "{Title}",
					description: "{Description}"
				})
			});
			this.oList.placeAt("qunit-fixture");
			Core.applyChanges();
		},
		afterEach: function() {
			this.oList.destroy();
			this.clock.restore();
		}
	});

	QUnit.test("GrowingDirection - Downwards", function(assert) {
		var fnSetLastGroupHeaderSpy = sinon.spy(this.oList, "getGroupHeaderTemplate");
		var oBinding = this.oList.getBinding("items");
		var oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		oBinding.sort(oSorter);
		Core.applyChanges();

		var aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		assert.strictEqual(fnSetLastGroupHeaderSpy.callCount, aGroupHeaderListItems.length, "default groupHeaderListItem template called twice");

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			var $GroupItem = oGroupItem.$();
			oGroupItem.getGroupedItems().forEach(function(sId) {
				assert.ok($GroupItem.attr("aria-owns").indexOf(sId) > -1, "mapped items are set to aria-owns attribute");
			});
		});

		var oSecondGroupItem = aGroupHeaderListItems[1];
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 2, "2 items mapped to group");
		this.oList.$("trigger").trigger("tap");
		this.clock.tick(10);
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 3, "3 items mapped to group, due to growing");
		var aAriaOwns = oSecondGroupItem.$().attr("aria-owns").split(" ");
		assert.strictEqual(aAriaOwns.length, 3, "GroupHeader DOM updated");

		aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.strictEqual(oGroupItem.getGroupedItems().indexOf(this.oList._oGrowingDelegate._oTrigger.getId()), -1, "Growing Trigger is not mapped to the groupHeader");
		}, this);
	});

	QUnit.test("GrowingDirection - Upwards", function(assert) {
		this.oList.setGrowingDirection("Upwards");
		var oBinding = this.oList.getBinding("items");
		var oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		oBinding.sort(oSorter);
		Core.applyChanges();

		var aVisibleItems = this.oList.getVisibleItems();
		var aGroupHeaderListItems = aVisibleItems.filter(function(oItem) {
			return oItem.isGroupHeader();
		});
		aGroupHeaderListItems.forEach(function(oGroupItem) {
			var $GroupItem = oGroupItem.$();
			oGroupItem.getGroupedItems().forEach(function(sId) {
				assert.ok($GroupItem.attr("aria-owns").indexOf(sId) > -1, "mapped items are set to aria-owns attribute");
			});
		});

		var oSecondGroupItem = aGroupHeaderListItems[1];
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 2, "2 items mapped to group");
		this.oList.$("trigger").trigger("tap");
		this.clock.tick(10);
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 3, "3 items mapped to group, due to growing");
		var aAriaOwns = oSecondGroupItem.$().attr("aria-owns").split(" ");
		assert.strictEqual(aAriaOwns.length, 3, "GroupHeader DOM updated");

		aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.strictEqual(oGroupItem.getGroupedItems().indexOf(this.oList._oGrowingDelegate._oTrigger.getId()), -1, "Growing Trigger is not mapped to the groupHeader");
		}, this);
	});

	QUnit.module("itemsPool");

	/**
	 * @deprecated as of 1.48. ODataModel V1 is deprecated.
	 */
	QUnit.test("should not be created for OData V1 model", function(assert) {
		var done = assert.async();
		var oMockServer = startMockServer();
		var oList = new List({
			growing: true,
			models: new ODataV1Model("http://sap.com/model", true) // true is use JSON
		});
		var fFillItemsPoolSpy = sinon.spy(oList._oGrowingDelegate, "fillItemsPool");
		oList.bindItems({
			path: "/Products",
			template: new StandardListItem({
				title: "{Name}",
				description: "{Category}"
			})
		});
		oList.attachEventOnce("updateFinished", function() {
			var oBinding = oList.getBinding("items");
			assert.ok(oBinding.isA("sap.ui.model.odata.ODataListBinding"), "OData V1 binding found");
			assert.ok(fFillItemsPoolSpy.notCalled, "fillItemsPool method was not called for OData V1");
			oMockServer.stop();
			oList.destroy();
			done();
		});
		oList.placeAt("qunit-fixture");
		Core.applyChanges();
	});
});
