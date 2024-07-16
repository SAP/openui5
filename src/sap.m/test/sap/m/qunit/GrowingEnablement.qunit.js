/*global QUnit, sinon */
sap.ui.define([
	"sap/m/Column",
	"sap/m/ColumnListItem",
	"sap/m/CustomListItem",
	"sap/m/GrowingEnablement",
	"sap/m/library",
	"sap/m/List",
	"sap/m/Page",
	"sap/m/StandardListItem",
	"sap/m/Table",
	"sap/m/Text",
	"sap/ui/core/HTML",
	"sap/ui/core/Lib",
	"sap/ui/core/util/MockServer",
	"sap/ui/events/KeyCodes",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(Column, ColumnListItem, CustomListItem, GrowingEnablement, mLibrary, List, Page, StandardListItem, Table, Text, HTML, Library, MockServer, KeyCodes, Sorter, JSONModel, ODataModel, qutils, createAndAppendDiv, nextUIUpdate, jQuery) {
	"use strict";
	createAndAppendDiv("growing1");
	createAndAppendDiv("growing2");

	async function timeout(iDuration) {
		await new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	async function ui5Event(sEventName, oControl) {
		return await new Promise((fnResolve) => {
			oControl?.attachEventOnce(sEventName, fnResolve);
		});
	}

	async function nextDOMAttributeUpdate(oDOMElement, aAttributeNames) {
		await new Promise((fnResolve) => {
			const oObserver = new MutationObserver(() => {
				oObserver.disconnect();
				fnResolve();
			});
			oObserver.observe(oDOMElement, {
				attributes: true,
				attributeFilter: aAttributeNames
			});
		});
	}

	QUnit.module("trigger");
	QUnit.test("Should update the trigger state correctly", async function(assert) {
		const data = { items: [ {},{}] };

		const oModel = new JSONModel();
		oModel.setData(data);

		//System under Test
		const oList = new List({
			growing : true,
			growingThreshold: 1,
			items : {
				path : "/items",
				template : new CustomListItem({
					content : new HTML({content:'<div style="height: 10000px"></div>'})
				})
			}
		}).setModel(oModel);

		const oPage = new Page({
			title: "List Page",
			content : oList
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		// sytem under test
		const oGrowingDelegate = oList._oGrowingDelegate;
		const oTrigger = oGrowingDelegate._oTrigger;

		assert.equal(document.getElementById(oList.$("trigger").attr("aria-describedby")).textContent, Library.getResourceBundleFor("sap.m").getText("LOAD_MORE_DATA_ACC_WITH_COUNT", [1, 2]));
		await timeout();

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
		await nextUIUpdate();

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
		await nextUIUpdate();
		await timeout();

		assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is  visible");
		oGrowingDelegate.requestNewPage();

		await timeout();

		assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible everything is loaded");

		oPage.destroy();
		oModel.destroy();
	});

	QUnit.test("Growing Trigger - ACC and Keyboard", async function(assert) {
		const oModel = new JSONModel();
		oModel.setData({items: [{},{}]});

		const oList = new List({
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
		await nextUIUpdate();
		await timeout();

		assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is visible");
		assert.equal(oList.$("trigger").attr("aria-labelledby"), oList.$("triggerText").attr("id"), "aria-labelledby contains reference to the trigger text");
		assert.equal(oList.$("trigger").attr("aria-describedby"), oList.$("triggerMessage").attr("id"), "aria-describedby contains reference to status info");
		assert.ok(oList.$("triggerText").text(), "Status info is available");

		const aCountInfo = oList._oGrowingDelegate._getItemCounts();
		assert.equal(aCountInfo[0], 1, "Current loaded items count known");
		assert.equal(aCountInfo[1], 2, "Overall count known");

		// Test Navigation via Arrow Keys from / to Trigger
		oList.getItems()[0].focus();
		qutils.triggerKeydown(oList.getItems()[0].getDomRef(), KeyCodes.ARROW_DOWN);
		assert.ok(oList.getDomRef("trigger") === document.activeElement, "Trigger has focus after navigation from last item via arrow key");
		qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ARROW_UP);
		assert.ok(oList.getItems()[0].getDomRef() === document.activeElement, "Item has focus after navigation from trigger via arrow key");

	});

	QUnit.test("Show noDataText and hide 'Load more' trigger when no item is visible", async function(assert) {
		const data = { // 3 items
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

		const oModel = new JSONModel();
		oModel.setData(data);

		const oList = new List({
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

		const oPage = new Page({
			title: "List Page",
			content: oList
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aVisibleItems = oList.getVisibleItems();

		aVisibleItems.forEach(function(oItem) {
			oItem.setVisible(false);
		});

		await nextUIUpdate();
		aVisibleItems = oList.getVisibleItems();
		assert.strictEqual(aVisibleItems.length, 0, "List has no visible items.");

		assert.ok(oList.$("nodata-text")[0], "NoDataText is visible");
		assert.ok(oList.$("triggerList").is(":hidden"), "Load more trigger is not visible");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.module("Integration tests");
	QUnit.test("Should determine if the list is scrollable", async function(assert) {
		const data = { items: [ {},{}] };

		const oModel = new JSONModel();
		oModel.setData(data);

		const oList = new List({
			growing : true,
			growingScrollToLoad : true,
			items : {
			path : "/items",
			template : new CustomListItem({
					content : new HTML({content:'<div style="height: 1000px"></div>'})
				})
			}
		}).setModel(oModel);

		const page = new Page({
			title: "List Page",
			content : oList
		});

		const oGrowingEnablement = new GrowingEnablement(oList);

		page.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oGrowingEnablement._getHasScrollbars(), "The list has scrollbars");

		page.destroy();
		oModel.destroy();
		oGrowingEnablement.destroy();
		oList.destroy();
	});

	QUnit.test("Should determine if the list is not scrollable", async function(assert) {
		const oList = new List({
			growing : true,
			growingScrollToLoad : true
		});

		const oGrowingEnablement = new GrowingEnablement(oList);

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(!oGrowingEnablement._getHasScrollbars(), "The list has no scrollbars");

		oGrowingEnablement.destroy();
		oList.destroy();
	});

	QUnit.test("Should react overflow event of the scroll container", async function(assert) {
		const data = { items: [ {}, {}] };
		const oModel = new JSONModel();

		oModel.setData(data);

		const oHtml = new HTML({
			content:'<div style="height: 5000px"></div>'
		});
		const oList = new List({
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
		const oPage = new Page({
			title: "List Page",
			content : [oHtml, oList]
		});

		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();

		/*
		 * The following timeout is required to ensure that ScrollEnablement._checkOverflowChange
		 * will detect the initial overflow correctly. Otherwise, the subsequent underflow
		 * will not lead to an overflow change event and GrowingEnablement._updateTrigger is not called.
		 */
		await timeout(300);

		assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible");

		oHtml.setVisible(false);
		await timeout(300);

		assert.ok(oList.$("triggerList").is(":visible"), "Load more trigger is now visible");

		oHtml.setVisible(true);
		await timeout(300);

		assert.ok(!oList.$("triggerList").is(":visible"), "Load more trigger is not visible again");

		oPage.destroy();
		oModel.destroy();
	});

	QUnit.test("List without model", async function(assert) {
		const oList = new List({
			growing : true,
			growingScrollToLoad : true,
			items: {
				path : "/items",
				template : new StandardListItem()
			}
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(!!oList.getDomRef(), "DomRef OK");

		oList.destroy();
	});

	QUnit.module("Odata");

	function startMockServer() {
		MockServer.config({ autoRespond : true });

		const oMockServer = new MockServer({
			rootUri: "http://sap.com/model/"
		});

		oMockServer.simulate("test-resources/sap/m/qunit/data/metadata.xml", "test-resources/sap/m/qunit/data");
		oMockServer.start();
		return oMockServer;
	}

	let oModel;

	function setODataModelAndBindItems (oList) {
		oModel = new ODataModel("http://sap.com/model");

		oList.setModel(oModel);

		let oItemTemplate;
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
		const oBinding = oList.getBinding("items");
		oBinding.sort([
			new Sorter("Category", false, function(oContext) {
				const sCategory = oContext.getProperty("Category");
				return {
					key : sCategory,
					text : sCategory
				};
			})
		]);
	}

	QUnit.test("Should group and ungroup a List", async function(assert) {
		const oMockServer = startMockServer(),
			oList = new List({
				growing : true
			});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		setODataModelAndBindItems(oList);
		await ui5Event("updateFinished", oList);

		const iInitialItemCount = oList.getItems().length;
		oList.setBusyIndicatorDelay(0);
		oList.focus();
		oList.setBusy(true);
		groupList(oList);
		await ui5Event("updateFinished", oList);

		assert.strictEqual(document.activeElement, oList.getItems()[0].getDomRef(), "The focus is set correctly");
		oList.getBinding("items").sort([]);
		await ui5Event("updateFinished", oList);

		assert.strictEqual(iInitialItemCount, oList.getItems().length, "The list did contain the same number of items");

		oList.destroy();
		oMockServer.stop();

	});

	QUnit.test("Should grow by the treshold", async function(assert) {
		const oMockServer = startMockServer(),
			iInitialThreshold = 2,
			oList = new List({
				growing : true,
				//small number that not all data gets loaded
				growingThreshold : iInitialThreshold
			});

		//System under test
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		setODataModelAndBindItems(oList);
		await ui5Event("updateFinished", oList);

		assert.strictEqual(iInitialThreshold, oList.getItems().length, "The list did contain the same number of items as the initial treshold");
		const iTotalNumberOfItems = oList.getBinding("items").getLength();

		oList.setGrowingThreshold(Math.floor(iTotalNumberOfItems / 2));
		qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ENTER);
		await ui5Event("updateFinished", oList);

		assert.strictEqual(oList.getGrowingThreshold() + iInitialThreshold, oList.getItems().length, "The list did contain the same number of items as twice the treshold");

		const fnRequestNewPageSpy = sinon.spy(oList._oGrowingDelegate, "requestNewPage");
		qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.SPACE);
		qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.ESCAPE);
		qutils.triggerKeyup(oList.getDomRef("trigger"), KeyCodes.SPACE);
		assert.notOk(fnRequestNewPageSpy.calledOnce);

		qutils.triggerKeydown(oList.getDomRef("trigger"), KeyCodes.SPACE);
		qutils.triggerKeyup(oList.getDomRef("trigger"), KeyCodes.SPACE);
		assert.ok(fnRequestNewPageSpy.calledOnce);
		fnRequestNewPageSpy.restore();
		await ui5Event("updateFinished", oList);

		assert.strictEqual(iTotalNumberOfItems, oList.getItems().length, "The list did contain the max number of items");

		oList.destroy();
		oMockServer.stop();
	});

	QUnit.test("Prevent DOM update when all columns are hidden (BCP - 2080250160)", async function(assert) {
		const oTable = new Table({
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
		await nextUIUpdate();

		assert.equal(document.getElementById(oTable.$("trigger").attr("aria-describedby")).textContent, Library.getResourceBundleFor("sap.m").getText("LOAD_MORE_ROWS_ACC_WITH_COUNT", [2, 3]));
		assert.strictEqual(oTable.getItems().length, 2, "2 items are rendered");
		const sItemIds = oTable.getItems().toString();

		oTable.setVisible(false);
		await nextUIUpdate();
		oTable.getModel().refresh(true);
		assert.strictEqual(oTable.getItems().toString(), sItemIds, "During the binding udpate the items are not destroy even though the table is invisible");
		oTable.setVisible(true);
		await nextUIUpdate();

		// hide all columns
		const oColumn = oTable.getColumns()[0];
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

	QUnit.test("Growing should invalidate Table, when autoPopinMode=true", async function(assert) {
		const oMockServer = startMockServer(),
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
			});

		//System under test
		oTable.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fnGetInitialAccumulatedWidth = sinon.spy(oTable, "_getInitialAccumulatedWidth");

		assert.notOk(oTable.getItems().length, "no items available");
		assert.ok(fnGetInitialAccumulatedWidth.notCalled, "autoPopinMode calculation is not performed yet, since no items available");

		setODataModelAndBindItems(oTable);
		await ui5Event("updateFinished", oTable);

		assert.ok(oTable.getItems().length, "items are available");
		assert.ok(fnGetInitialAccumulatedWidth.calledOnce, "autoPopinMode calculation performed");

		oTable.destroy();
		oMockServer.stop();
	});

	QUnit.module("Dummy Column", {
		beforeEach: async function() {
			const data = [
				{firstName: "Peter", lastName: "Mueller"},
				{firstName: "Petra", lastName: "Maier"},
				{firstName: "Thomas", lastName: "Smith"},
				{firstName: "John", lastName: "Williams"},
				{firstName: "Maria", lastName: "Jones"}
			];

			const oModel = new JSONModel();
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
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oPage.destroy();
		}
	});

	QUnit.test("Trigger button size should be adapted with dummy column is rendered", async function(assert) {
		const oTable = this.oTable;
		await timeout();

		const oTableDomRef = oTable.getDomRef(),
		oTriggerDomRef = oTable.getDomRef("trigger"),
		oDummyColDomRef = oTable.getDomRef("tblHeadDummyCell");
		assert.ok(oTriggerDomRef.clientWidth - oTableDomRef.clientWidth - oDummyColDomRef.clientWidth < 2, "Trigger button width correctly adapted");

	});

	QUnit.test("Trigger button size should take the full table width when table has popins and dummy column", async function(assert) {
		const oTable = this.oTable;
		const oColumn = oTable.getColumns()[1];

		oColumn.setMinScreenWidth("48000px");
		oColumn.setDemandPopin(true);
		await nextUIUpdate();
		await timeout();

		const oTableDomRef = oTable.getDomRef(),
			oTriggerDomRef = oTable.getDomRef("trigger");
		assert.equal(oTableDomRef.clientWidth, oTriggerDomRef.clientWidth, "Table width === Trigger button width");
	});

	QUnit.module("Group item mapping", {
		beforeEach: async function() {
			const oData = { // 10 items
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
			const oModel = new JSONModel(oData);
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
			await nextUIUpdate();
		},
		afterEach: function() {
			this.oList.destroy();
		}
	});

	QUnit.test("GrowingDirection - Downwards", async function(assert) {
		const fnSetLastGroupHeaderSpy = sinon.spy(this.oList, "getGroupHeaderTemplate");
		const oBinding = this.oList.getBinding("items");
		const oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		oBinding.sort(oSorter);
		await nextUIUpdate();

		let aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		assert.strictEqual(fnSetLastGroupHeaderSpy.callCount, aGroupHeaderListItems.length, "default groupHeaderListItem template called twice");

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			const $GroupItem = oGroupItem.$();
			oGroupItem.getGroupedItems().forEach(function(sId) {
				assert.ok($GroupItem.attr("aria-owns").indexOf(sId) > -1, "mapped items are set to aria-owns attribute");
			});
		});

		const oSecondGroupItem = aGroupHeaderListItems[1];
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 2, "2 items mapped to group");
		this.oList.$("trigger").trigger("tap");

		await nextDOMAttributeUpdate(oSecondGroupItem.$()[0], ["aria-owns"]);

		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 3, "3 items mapped to group, due to growing");
		const aAriaOwns = oSecondGroupItem.$().attr("aria-owns").split(" ");
		assert.strictEqual(aAriaOwns.length, 3, "GroupHeader DOM updated");

		aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.strictEqual(oGroupItem.getGroupedItems().indexOf(this.oList._oGrowingDelegate._oTrigger.getId()), -1, "Growing Trigger is not mapped to the groupHeader");
		}, this);
	});

	QUnit.test("GrowingDirection - Upwards", async function(assert) {
		this.oList.setGrowingDirection("Upwards");
		const oBinding = this.oList.getBinding("items");
		const oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		oBinding.sort(oSorter);
		await nextUIUpdate();

		const aVisibleItems = this.oList.getVisibleItems();
		let aGroupHeaderListItems = aVisibleItems.filter(function(oItem) {
			return oItem.isGroupHeader();
		});
		aGroupHeaderListItems.forEach(function(oGroupItem) {
			const $GroupItem = oGroupItem.$();
			oGroupItem.getGroupedItems().forEach(function(sId) {
				assert.ok($GroupItem.attr("aria-owns").indexOf(sId) > -1, "mapped items are set to aria-owns attribute");
			});
		});

		const oSecondGroupItem = aGroupHeaderListItems[1];
		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 2, "2 items mapped to group");
		this.oList.$("trigger").trigger("tap");
		await timeout(10);

		assert.strictEqual(oSecondGroupItem.getGroupedItems().length, 3, "3 items mapped to group, due to growing");
		const aAriaOwns = oSecondGroupItem.$().attr("aria-owns").split(" ");
		assert.strictEqual(aAriaOwns.length, 3, "GroupHeader DOM updated");

		aGroupHeaderListItems = this.oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			assert.strictEqual(oGroupItem.getGroupedItems().indexOf(this.oList._oGrowingDelegate._oTrigger.getId()), -1, "Growing Trigger is not mapped to the groupHeader");
		}, this);
	});

	QUnit.module("itemsPool");
});
