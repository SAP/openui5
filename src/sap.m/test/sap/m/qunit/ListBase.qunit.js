/*global QUnit, sinon */
sap.ui.define([
	"sap/m/App",
	"sap/m/Button",
	"sap/m/CustomListItem",
	"sap/m/GroupHeaderListItem",
	"sap/m/GrowingEnablement",
	"sap/m/IllustratedMessage",
	"sap/m/Input",
	"sap/m/InputListItem",
	"sap/m/library",
	"sap/m/List",
	"sap/m/ListBase",
	"sap/m/Menu",
	"sap/m/MenuItem",
	"sap/m/MessageToast",
	"sap/m/Page",
	"sap/m/ScrollContainer",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/Title",
	"sap/m/Toolbar",
	"sap/m/ToolbarSpacer",
	"sap/m/VBox",
	"sap/m/plugins/DataStateIndicator",
	"sap/ui/Device",
	"sap/ui/core/Element",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/Lib",
	"sap/ui/core/library",
	"sap/ui/core/Theming",
	"sap/ui/events/KeyCodes",
	"sap/ui/layout/VerticalLayout",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/Sorter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery"
], function(App, Button, CustomListItem, GroupHeaderListItem, GrowingEnablement, IllustratedMessage, Input, InputListItem, library, List, ListBase, Menu, MenuItem, MessageToast, Page, ScrollContainer, StandardListItem, Text, Title, Toolbar, ToolbarSpacer, VBox, DataStateIndicator, Device, Element, InvisibleMessage, Library, coreLibrary, Theming, KeyCodes, VerticalLayout, Filter, FilterOperator, Sorter, JSONModel, qutils, createAndAppendDiv, nextUIUpdate, jQuery) {
	"use strict";
	jQuery("#qunit-fixture").attr("data-sap-ui-fastnavgroup", "true");


	/*******************************************************************************
	 * Helper variables & functions
	 *******************************************************************************/

	async function timeout(iDuration) {
		await new Promise(function(resolve) {
			window.setTimeout(resolve, iDuration);
		});
	}

	// helper variables
	let oScrollContainer;
	let iItemCount = 0;
	let oList = null;
	const data1 = { // 0 items
			items : [ ]
		},
		data2 = { // 3 items
				items : [ {
					Title : "Title1",
					Description: "Description1"
				}, {
					Title : "Title2",
					Description: "Description2"
				}, {
					Title : "Title3",
					Description: "Description3"
				} ]
		},
		data3 = { // 10 items
				items : [ {
					Title : "Title1",
					Description: "Description1"
				}, {
					Title : "Title2",
					Description: "Description2"
				}, {
					Title : "Title3",
					Description: "Description3"
				}, {
					Title : "Title4",
					Description: "Description4"
				}, {
					Title : "Title5",
					Description: "Description5"
				}, {
					Title : "Title6",
					Description: "Description6"
				}, {
					Title : "Title7",
					Description: "Description7"
				}, {
					Title : "Title8",
					Description: "Description8"
				}, {
					Title : "Title9",
					Description: "Description9"
				}, {
					Title : "Title10",
					Description: "Description10"
				} ]
		},
		data4 = {
				items : [ {
					Title : "Table",
					Description: "This is a table"
				}, {
					Title : "Window",
					Description: "This is a window"
				}, {
					Title : "Room",
					Description: "This is a room"
				}, {
					Title : "Lamp",
					Description: "This is a lamp"
				}, {
					Title : "Attic",
					Description: "This is an attic"
				}, {
					Title : "House",
					Description: "This is a house"
				}, {
					Title : "Ceiling",
					Description: "This is a ceiling"
				}, {
					Title : "Wall",
					Description: "This is a wall"
				}, {
					Title : "Door",
					Description: "This is a door"
				}, {
					Title : "Flower",
					Description: "This is a flower"
				} ]
		},
		data5 = { // 10 items
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


	// create a static list item
	function createListItem() {
		iItemCount++;
		return new StandardListItem({
			title : "Title" + iItemCount,
			description: "Description" + iItemCount
		});
	}

	function createTemplateListItem() {
		return new StandardListItem({
			title: "{Title}",
			description: "{Description}"
		});
	}

	// bind list with data
	function bindListData(oList, oData, sPath, oItemTemplate) {
		const oModel = new JSONModel();
		// set the data for the model
		oModel.setData(oData);
		// set the model to the list
		oList.setModel(oModel);
		// bind Aggregation
		oList.bindAggregation("items", sPath, oItemTemplate);
	}

	async function testRemeberSelections(oList, oRenderSpy, assert) {
		const oSorterAsc = new Sorter("Title", false, function(oContext){
			return oContext.getProperty("Title").charAt(0); // sort ascending by first letter of title
		}),
		oSorterDesc = new Sorter("Title", true, function(oContext){
			return oContext.getProperty("Title").charAt(0); // sort descending by first letter of title
		});
		let vSelectedItemsNumber;

		bindListData(oList, data3, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		const vSelectionMode = oList.getMode();
		// call method & do tests
		if (vSelectionMode == "SingleSelect") {
			oList.getItems()[0].setSelected(true);
			vSelectedItemsNumber = 1;
		} else if (vSelectionMode == "MultiSelect") {
			oList.getItems()[0].setSelected(true);
			oList.getItems()[1].setSelected(true);
			oList.getItems()[5].setSelected(true);
			vSelectedItemsNumber = 3;
		}

		oList.setRememberSelections(true);
		assert.strictEqual(oList.getRememberSelections(), true, 'The property "rezmemberSelections" is "true" on ' + oList);

		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList.getSelectedContextPaths().length, vSelectedItemsNumber, 'The internal selection array has length of ' + vSelectedItemsNumber + ' on ' + oList);
		assert.strictEqual(oList.getSelectedItems().length, vSelectedItemsNumber, 'The selection contains ' + vSelectedItemsNumber + ' item ' + oList);

		// filter 2 items ("Title1" and "Title10")
		oList.getBinding("items").filter([new Filter("Title", FilterOperator.Contains , "Title1")]);
		assert.strictEqual(oList.getSelectedItems().length, 1, 'The selection contains 1 item ' + oList);

		// reset filter
		oList.getBinding("items").filter([]);
		assert.strictEqual(oList.getSelectedItems().length, vSelectedItemsNumber, 'The selection contains ' + vSelectedItemsNumber + 'item ' + oList);

		oList.setRememberSelections(false).removeSelections(true);
		assert.strictEqual(oList.getRememberSelections(), false, 'The property "rememberSelections" is "false" on ' + oList);

		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList.getSelectedContextPaths().length, 0, 'The internal selection array is empty on ' + oList);

		// filter 2 items ("Title1" and "Title10")
		oList.getBinding("items").filter([new Filter("Title", FilterOperator.Contains , "Title1")]);
		assert.strictEqual(oList.getSelectedItems().length, 0, 'The selection contains no items ' + oList);

		// reset filter
		oList.getBinding("items").filter([]);
		assert.strictEqual(oList.getSelectedItems().length, 0, 'The selection contains no items ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setRememberSelections(), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		oList.setGrowing(true);
		assert.strictEqual(oList.getGrowing(), true, 'The property "growing" is "true" on ' + oList);

		oList.setRememberSelections(true);

		bindListData(oList, data4, "/items", createTemplateListItem());
		// remember the selected items in oListSelected
		let oListSelected;
		if (vSelectionMode == "SingleSelect") {
			oList.getItems()[5].setSelected(true);
			oListSelected = oList.getItems()[5].getTitle();
		} else if (vSelectionMode == "MultiSelect") {
			oList.getItems()[0].setSelected(true);
			oList.getItems()[1].setSelected(true);
			oList.getItems()[5].setSelected(true);
			oListSelected = [];
			oListSelected[0] = oList.getItems()[0].getTitle();
			oListSelected[1] = oList.getItems()[1].getTitle();
			oListSelected[2] = oList.getItems()[5].getTitle();
			oListSelected.sort();
		}

		const aSelectedContextPaths = oList.getSelectedContextPaths();

		assert.strictEqual(aSelectedContextPaths.length, vSelectedItemsNumber, 'The internal selection array has length of' + vSelectedItemsNumber + ' on ' + oList);
		assert.strictEqual(oList.getSelectedItems().length, vSelectedItemsNumber, 'The selection contains ' + vSelectedItemsNumber + ' items ' + oList);

		oList.setGrowing(false);
		assert.strictEqual(oList.getGrowing(), false, 'The property "growing" is "false" on ' + oList);

		// sort ascending
		oList.getBinding("items").sort([new Sorter("Title", false, oSorterAsc) ] );

		let oListSelectedAfterSorting;
		if (vSelectionMode == "SingleSelect") {
			oListSelectedAfterSorting = oList.getSelectedItems()[0].getTitle();
			assert.strictEqual(oListSelected, oListSelectedAfterSorting, "the same item should be selected after sorting" );
		} else if (vSelectionMode == "MultiSelect") {
			oListSelectedAfterSorting = [];
			oListSelectedAfterSorting[0] = oList.getSelectedItems()[0].getTitle();
			oListSelectedAfterSorting[1] = oList.getSelectedItems()[1].getTitle();
			oListSelectedAfterSorting[2] = oList.getSelectedItems()[2].getTitle();
			oListSelectedAfterSorting.sort();
			assert.strictEqual(oListSelected.toString(), oListSelectedAfterSorting.toString(), "the same items should be selected after sorting" );
		}

		assert.strictEqual(oList.getSelectedContextPaths().length, vSelectedItemsNumber, 'The internal selection array has length of' + vSelectedItemsNumber + ' on ' + oList);
		assert.strictEqual(oList.getSelectedItems().length, vSelectedItemsNumber, 'The selection contains' + vSelectedItemsNumber + 'items ' + oList);

		oList.setRememberSelections(false);
		if (vSelectionMode == "MultiSelect") {
			assert.strictEqual(oList.getRememberSelections(), false, 'rememberSelections is set to false on ' + oList);
			assert.strictEqual(oList.getSelectedContextPaths().length, 0, 'Empty array returned as bAll is undefined on ' + oList);
			assert.strictEqual(oList.getSelectedContextPaths(true).length, 3, 'Selected context paths return via binding context paths as bAll=true on ' + oList);
		}

		oList.removeSelections(true);
		assert.strictEqual(oList.getSelectedContextPaths().length, 0, 'The internal selection array is empty on ' + oList);
		assert.strictEqual(oList.getSelectedContextPaths(true).length, 0, 'Empty array returned via binding context on ' + oList);

		// sort descending
		oList.getBinding("items").sort([new Sorter("Title", true, oSorterDesc) ] );
		assert.strictEqual(oList.getSelectedContextPaths().length, 0, 'The internal selection array has length of 0 on ' + oList);
		assert.strictEqual(oList.getSelectedItems().length, 0, 'The selection contains no items ' + oList);

		//rebinding
		bindListData(oList, data4, "/items", createTemplateListItem());
		assert.strictEqual(oList.getSelectedItems().length, 0, 'The selection contains no items ' + oList);

		// retain selection after binding
		oList.setRememberSelections(true);
		oList.setSelectedContextPaths(aSelectedContextPaths);

		// sort ascending
		oList.getBinding("items").sort([new Sorter("Title", false, oSorterAsc) ] );

		// retest after sorting
		if (vSelectionMode == "SingleSelect") {
			oListSelectedAfterSorting = oList.getSelectedItems()[0].getTitle();
			assert.strictEqual(oListSelected, oListSelectedAfterSorting, "the same item should be selected after sorting" );
		} else if (vSelectionMode == "MultiSelect") {
			oListSelectedAfterSorting = [];
			oListSelectedAfterSorting[0] = oList.getSelectedItems()[0].getTitle();
			oListSelectedAfterSorting[1] = oList.getSelectedItems()[1].getTitle();
			oListSelectedAfterSorting[2] = oList.getSelectedItems()[2].getTitle();
			oListSelectedAfterSorting.sort();
			assert.strictEqual(oListSelected.toString(), oListSelectedAfterSorting.toString(), "the same items should be selected after sorting" );
		}

		// cleanup
		oPage.removeAllContent();
		oList.destroy();
	}

	// app
	const oRB = Library.getResourceBundleFor("sap.m"),
		oApp = new App("myApp", { initialPage: "myFirstPage" }),
		oPage = new Page("myFirstPage", {
			title : "ListBase Test Page"
		});

	// init app
	oApp.addPage(oPage).placeAt("qunit-fixture");

	/********************************************************************************/
	QUnit.module("Basic Control API checks", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.test("Properties", function(assert) {
		const oProperties = oList.getMetadata().getAllProperties();

		assert.ok(oProperties.inset, 'Property "inset" exists');
		assert.ok(oProperties.visible, 'Property "visible" exists');
		assert.ok(oProperties.headerText, 'Property "headerText" exists');
		assert.ok(oProperties.headerLevel, 'Property "headerText" exists');
		assert.ok(oProperties.footerText, 'Property "footerText" exists');
		assert.ok(oProperties.mode, 'Property "mode" exists');
		assert.ok(oProperties.width, 'Property "width" exists');
		assert.ok(oProperties.includeItemInSelection, 'Property "includeItemInSelection" exists');
		assert.ok(oProperties.showUnread, 'Property "showUnread" exists');
		assert.ok(oProperties.showNoData, 'Property "showNoData" exists');
		assert.ok(oProperties.noDataText, 'Property "noDataText" exists');
		assert.ok(oProperties.modeAnimationOn, 'Property "modeAnimationOn" exists');
		assert.ok(oProperties.showSeparators, 'Property "showSeparators" exists');
		assert.ok(oProperties.swipeDirection, 'Property "swipeDirection" exists');
		assert.ok(oProperties.growing, 'Property "growing" exists');
		assert.ok(oProperties.growingThreshold, 'Property "growingThreshold" exists');
		assert.ok(oProperties.growingTriggerText, 'Property "growingTriggerText" exists');
		assert.ok(oProperties.growingScrollToLoad, 'Property "growingScrollToLoad" exists');
	});

	QUnit.test("Events", async function(assert) {
		const oEvents = oList.getMetadata().getAllEvents();
		bindListData(oList, data2, "/items", createTemplateListItem());

		assert.ok(oEvents.selectionChange, 'Event "selectionChange" exists');
		assert.ok(oEvents["delete"], 'Event "delete" exists');
		assert.ok(oEvents.swipe, 'Event "swipe" exists');
		assert.ok(oEvents.updateStarted, 'Event "updateStarted" exists');
		assert.ok(oEvents.updateFinished, 'Event "updateFinished" exists');
		assert.ok(oEvents.beforeOpenContextMenu, 'Event "beforeOpenContextMenu" exists');

		oList.setMode("MultiSelect");
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oList.getItems().length, 3, "List has exactly 3 items");

		oList.attachEventOnce("selectionChange", function(e) {
			assert.ok(!e.getParameter("selectAll"), "selectAll parameter is false when the 1st item is selected");
		});
		oList.attachEventOnce("itemSelectedChange", function(e) {
			assert.ok(e.getParameter("selected"), "the list item is selected");
			assert.equal(e.getParameter("listItem"), oList.getItems()[0], "the first list item is selected");
		});
		oList.getItems()[0].getModeControl().$().trigger("tap");

		oList.attachEventOnce("selectionChange", function(e) {
			assert.ok(e.getParameter("selectAll"), "selectAll parameter is true when the 'ctrl+A' is pressed");
		});
		oList.getItems()[0].focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true});

		oList.attachEventOnce("selectionChange", function(e) {
			assert.ok(!e.getParameter("selectAll"), "selectAll parameter is false when the 'ctrl+A' is pressed again");
		});
		oList.getItems()[0].focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true});

		const oSelectionChangeSpy = this.spy();
		const oItemSelectedChangeSpy = this.spy();
		oList.attachSelectionChange(oSelectionChangeSpy);
		oList.attachEvent("itemSelectedChange", oItemSelectedChangeSpy);

		oList.selectAll();
		assert.strictEqual(oSelectionChangeSpy.callCount, 0, "selectAll is not fired via public API call");
		assert.strictEqual(oItemSelectedChangeSpy.callCount, oList.getItems().length, "itemSelectedChange is triggered for every item after selectAll");

		oItemSelectedChangeSpy.resetHistory();
		oList.removeSelections();
		assert.strictEqual(oItemSelectedChangeSpy.callCount, oList.getItems().length, "itemSelectedChange is triggered for every item after removeSelections");

		oList.selectAll(true);
		assert.strictEqual(oSelectionChangeSpy.callCount, 1, "selectAll fired a selectionChange event via true parameter call");
		oSelectionChangeSpy.resetHistory();

		oList.removeSelections(true, true);
		assert.strictEqual(oSelectionChangeSpy.callCount, 1, "selectAll fired a removeSelections event via true parameter call");
	});

	QUnit.test("Aggregations", function(assert) {
		const oAggregations = oList.getMetadata().getAllAggregations();

		assert.ok(oAggregations.items, 'Aggregation "items" exists');
		assert.ok(oAggregations.swipeContent, 'Aggregation "swipeContent" exists');
		assert.ok(oAggregations.headerToolbar, 'Aggregation "headerToolbar" exists');
		assert.ok(oAggregations.infoToolbar, 'Aggregation "infoToolbar" exists');
		assert.ok(oAggregations.contextMenu, 'Aggregation "contextMenu" exists');
	});

	QUnit.test("Methods", function(assert) {
		assert.ok(oList.getSelectedItem, 'Method "getSelectedItem" exists');
		assert.ok(oList.setSelectedItem, 'Method "setSelectedItem" exists');
		assert.ok(oList.getSelectedItems, 'Method "getSelectedItems" exists');
		assert.ok(oList.setSelectedItemById, 'Method "setSelectedItemById" exists');
		assert.ok(oList.removeSelections, 'Method "removeSelections" exists');
		assert.ok(oList.selectAll, 'Method "selectAll" exists');
		assert.ok(oList.getSwipedItem, 'Method "getSwipedItem" exists');
		assert.ok(oList.swipeOut, 'Method "swipeOut" exists');
		assert.ok(oList.getGrowingInfo, 'Method "getGrowingInfo" exists');
	});

	/********************************************************************************/
	QUnit.module("Initialization", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.test("Constructor behaviour", function(assert) {

		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList.getSelectedContextPaths().length, 0, "Internal selected path array is empty after initialization of " + oList);
		assert.strictEqual(oList._oGrowingDelegate, undefined, "Internal growingDelegate is null after initialization of " + oList);
	});

	QUnit.test("Default values", async function(assert) {
		let sAddText = " (state: before rendering)";
		const fnAssertions = function(sAddText) {
				assert.strictEqual(oList.getInset(), false, 'The default value of property "inset" should be "false" on ' + oList + sAddText);
				assert.strictEqual(oList.getVisible(), true, 'The default value of property "visible" should be "true" on ' + oList + sAddText);
				assert.strictEqual(oList.getHeaderText(), "", 'The default value of property "headerText" should be "" on ' + oList + sAddText);
				assert.strictEqual(oList.getHeaderLevel(), coreLibrary.TitleLevel.Auto, 'The default value of property "headerLevel" should be "Auto" on ' + oList + sAddText);
				assert.strictEqual(oList.getFooterText(), "", 'The default value of property "footerText" should be "" on ' + oList + sAddText);
				assert.strictEqual(oList.getMode(), library.ListMode.None, 'The default value of property "mode" should be "' + library.ListMode.None + '" on ' + oList + sAddText);
				assert.strictEqual(oList.getWidth(), "100%", 'The default value of property "width" should be "100%" on ' + oList + sAddText);
				assert.strictEqual(oList.getIncludeItemInSelection(), false, 'The default value of property "includeItemInSelection" should be "false" on ' + oList + sAddText);
				assert.strictEqual(oList.getShowUnread(), false, 'The default value of property "showUnread" should be "false" on ' + oList + sAddText);
				assert.strictEqual(oList.getShowNoData(), true, 'The default value of property "showNoData" should be "true" on ' + oList + sAddText);
				assert.strictEqual(oList.getModeAnimationOn(), true, 'The default value of property "modeAnimationOn" should be "true" on ' + oList + sAddText);
				assert.strictEqual(oList.getShowSeparators(), library.ListSeparators.All, 'The default value of property "showSeparators" should be "' + library.ListSeparators.All + '" on ' + oList + sAddText);
				assert.strictEqual(oList.getSwipeDirection(), library.SwipeDirection.Both, 'The default value of property "swipeDirection" should be "' + library.SwipeDirection.Both + '" on ' + oList + sAddText);
				assert.strictEqual(oList.getGrowing(), false, 'The default value of property "growing" should be "false" on ' + oList + sAddText);
				assert.strictEqual(oList.getGrowingThreshold(), 20, 'The default value of property "growingThreshold" should be "20" on ' + oList + sAddText);
				assert.strictEqual(oList.getGrowingTriggerText(), "", 'The default value of property "growingTriggerText" should be "" on ' + oList + sAddText);
				assert.strictEqual(oList.getGrowingScrollToLoad(), false, 'The default value of property "growingScrollToLoad" should be "false" on ' + oList + sAddText);
				assert.strictEqual(oList.getNoDataText(), oRB.getText("LIST_NO_DATA"), 'The update value of property "noDataText" should be "' + oRB.getText("LIST_NO_DATA") + '"  on ' + oList + sAddText);
			};

		// check before rendering
		fnAssertions(sAddText);

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// check again after rendering
		sAddText = " (state: after rendering)";
		fnAssertions(sAddText);

		// cleanup
		oPage.removeAllContent();
	});

	/********************************************************************************/
	QUnit.module("Destruction", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.test("Destructor behaviour", async function(assert) {

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// call destructor
		oList.destroy();
		await nextUIUpdate();

		// assertions
		assert.strictEqual(oList.getItems().length, 0, "Items aggregation is empty after destroying " + oList.getId());
		if (oList.getSwipeContent()) {
			assert.strictEqual(oList.getSwipeContent().length, 0, "SwipeContent aggregation is empty after destroying " + oList.getId());
		}
		if (oList.getHeaderToolbar()) {
			assert.strictEqual(oList.getHeaderToolbar().length, 0, "HeaderTooblar aggregation is empty after destroying " + oList.getId());
		}
		if (oList.getInfoToolbar()) {
			assert.strictEqual(oList.getInfoToolbar().length, 0, "InfoToolbar aggregation is empty after destroying " + oList.getId());
		}
		assert.strictEqual(oList.getDomRef(), null, "Domref does not exist anymore after destroying " + oList.getId());

		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList.getSelectedContextPaths().length, 0, "Internal selected path array is empty after destroying " + oList.getId());
		assert.strictEqual(oList._oGrowingDelegate, undefined, "Internal growingDelegate is null after destroying " + oList.getId());
	});

	/********************************************************************************/
	QUnit.module("Rendering", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.test("HTML Tags & CSS Classes for a list with default values and no items", async function(assert) {
		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();
		const $list = oList.$();
		const $listUl = $list.children("ul");
		const $listLi = $list.children("ul").children("li");

		// HTML & DOM checks
		assert.ok($list.length, "The HTML div container element exists on " + oList.getId());
		assert.ok($listUl.length, "The HTML ul element exists on " + oList.getId());
		assert.strictEqual($listUl[0].getAttribute("id"), oList.getId() + "-listUl", 'The id of the HTML ul element is "' + oList.getId() + '"-listUl" on ' + oList);
		assert.strictEqual($listUl[0].getAttribute("tabindex"), "0", 'The tabindex is "-1" for the HTML ul element on ' + oList);
		assert.strictEqual($listLi[0].getAttribute("id"), oList.getId() + "-nodata", 'The id of the HTML li no data element is "' + oList.getId() + '"-nodat" on ' + oList);

		// CSS checks
		assert.ok($list.hasClass("sapMList"), 'The HTML div container for the list has class "sapMList" on ' + oList);
		assert.ok($list.hasClass("sapMListBGSolid"), 'The HTML div container for the list has class "sapMListBGSolid" on ' + oList);
		assert.ok($listUl.hasClass("sapMListUl"), 'The HTML ul element has class "sapMListUl" on ' + oList);
		assert.ok($listUl.hasClass("sapMListModeNone"), 'The HTML ul element has class "sapMListModeNone" on ' + oList);
		assert.ok($listUl.hasClass("sapMListShowSeparatorsAll"), 'The HTML ul element has class "sapMListShowSeparatorsAll" on ' + oList);
		assert.ok($listLi.hasClass("sapMLIB"), 'The HTML no data li element has class "sapMLIB" on ' + oList);
		assert.ok($listLi.hasClass("sapMListNoData"), 'The HTML no data li element has class "sapMListNoData" on ' + oList);

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.test("Toolbar has style classes sapMTBHeader-CTX and sapMListHdrTBar", async function(assert) {
		const oToolbar = new Toolbar();
		oList.setHeaderToolbar(oToolbar);

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		assert.ok(oToolbar.hasStyleClass("sapMTBHeader-CTX"), "Toolbar has style class sapMTBHeader-CTX");
		assert.ok(oToolbar.hasStyleClass("sapMListHdrTBar"), "Toolbar has style class sapMListHdrTBar");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.test("Header Text & Header Level", async function(assert) {
		oList.setHeaderText("Header Text");

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		assert.ok(oList.$("header").hasClass("sapMListHdr"), "Header has style class sapMListHdr");
		assert.ok(oList.$("header").hasClass("sapMListHdrText"), "Header has style class sapMListHdrText");
		assert.strictEqual(oList.$("header").text(), "Header Text", "Header contains the header text");
		assert.strictEqual(oList.$("header").attr("role"), "heading", "Header has ARIA role heading");
		assert.ok(!oList.$("header").attr("aria-level"),  "Header has no ARIA level");

		oList.setHeaderLevel(coreLibrary.TitleLevel.H3);
		await nextUIUpdate();

		assert.strictEqual(oList.$("header").attr("aria-level"), "3", "Header has ARIA level 3");

		oList.setHeaderLevel(coreLibrary.TitleLevel.H1);
		await nextUIUpdate();

		assert.strictEqual(oList.$("header").attr("aria-level"), "1", "Header has ARIA level 1");

		oList.setHeaderLevel(coreLibrary.TitleLevel.Auto);
		await nextUIUpdate();

		assert.ok(!oList.$("header").attr("aria-level"),  "Header has no ARIA level");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.test("Show noDataText when no item is visible", async function(assert) {
		bindListData(oList, data2, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		let aVisibleItems = oList.getVisibleItems();
		assert.ok(aVisibleItems.length > 0, "List has visible items.");
		assert.strictEqual(oList.$("nodata-text")[0], undefined, "NoDataText is not visible");

		aVisibleItems.forEach(function(oItem) {
			oItem.setVisible(false);
		});
		await nextUIUpdate();

		aVisibleItems = oList.getVisibleItems();
		assert.strictEqual(aVisibleItems.length, 0, "List has no visible items.");
		assert.ok(oList.$("nodata-text")[0], "NoDataText is visible");
		assert.ok(oList.getDomRef("listUl").hasAttribute("tabindex"), "List is focusable");
		assert.notOk(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class not present");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.test("List DOM should not be focusable when showNoData=false & there are no items", async function(assert) {
		const oList = new List({
			showNoData: false
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.focus();
		assert.notOk(oList.getItemNavigation(), "ItemNavigation is not available");
		assert.ok(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class added");

		oList.destroy();
	});

	QUnit.test("List should be focusable when it contains items", async function(assert) {
		const oList = new List({
			showNoData: false
		});

		oList.placeAt("qunit-fixture");
		const oListItem = new StandardListItem({
			title: "Title"
		});
		oList.addItem(oListItem);
		await nextUIUpdate();

		oList.focus();
		assert.ok(oList.getItemNavigation(), "ItemNavigation is available");
		assert.notOk(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class not present");

		oList.destroy();
	});

	QUnit.test("List focus handling behavior with growing and showNoData=false", async function(assert) {
		bindListData(oList, data2, "/items", createTemplateListItem());
		oList.setGrowing(true);
		oList.setGrowingThreshold(1);
		oList.setShowNoData(false);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.focus();
		assert.ok(oList.getItemNavigation(), "ItemNavigation is available");
		assert.notOk(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class not present");

		oList.getBinding("items").filter(new Filter("Title", "EQ", "FooBar"));
		await timeout();

		oList.focus();
		assert.notOk(oList.getItemNavigation(), "ItemNavigation is not available");
		assert.ok(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class added");

		oList.getBinding("items").filter();
		await timeout();

		oList.focus();
		assert.ok(oList.getItemNavigation(), "ItemNavigation is available");
		assert.notOk(oList.getDomRef().classList.contains("sapMListPreventFocus"), "sapMListPreventFocus class not present");

		oList.destroy();
	});

	/********************************************************************************/
	QUnit.module("Getter/Setter methods", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	/* setter */

	QUnit.test("setInset", async function(assert) {
		let $list, sAddText = " (state: before rendering)";
		const oRenderSpy = this.spy(oList.getRenderer(), "render");

		// check before rendering
		oList.setInset(); // default
		assert.strictEqual(oList.getInset(), false, 'The property "inset" is "false" on ' + oList + sAddText);

		oList.setInset(true);
		assert.strictEqual(oList.getInset(), true, 'The property "inset" is "true" on ' + oList + sAddText);

		oList.setInset(false);
		assert.strictEqual(oList.getInset(), false, 'The property "inset" is "false" on ' + oList + sAddText);

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// check again after rendering
		sAddText = " (state: after rendering)";
		oList.setInset(true);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getInset(), true, 'The property "inset" is "true" on ' + oList + sAddText);
		assert.ok($list.hasClass("sapMListInsetBG"), 'The HTML div container for the list has class "sapMListInsetBG" on ' + oList + sAddText);

		oList.setInset(false);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getInset(), false, 'The property "inset" is "false" on ' + oList + sAddText);
		assert.ok(!$list.hasClass("sapMListInsetBG"), 'The HTML div container for the list has no class "sapMListInsetBG" on ' + oList + sAddText);

		// standard setter tests
		assert.strictEqual(oList.setInset(false), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 3, "The list should be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setMode", async function(assert) {
		const oListItem = createListItem().setSelected(true),
			oRenderSpy = this.spy(oList.getRenderer(), "render");

		// add item to page & render
		oList.addItem(oListItem);
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		assert.strictEqual(oList.setMode(library.ListMode.None).getMode(), library.ListMode.None, 'The property "mode" is "None" on ' + oList);
		assert.strictEqual(oList.getSelectedItem(), null, 'The selection is not available after setting mode "None" on ' + oList);
		oListItem.setSelected(true);
		assert.strictEqual(oList.getSelectedItem(), null, 'While mode is "None" we cannot select an item even via API call on ' + oListItem);
		assert.strictEqual(oList.setMode(library.ListMode.SingleSelect).getMode(), library.ListMode.SingleSelect, 'The property "mode" is "None" on ' + oList);
		oListItem.setSelected(true);
		assert.strictEqual(oList.getSelectedItem(), oListItem, 'The selection is still there after switching the mode to "SingleSelect" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._bSelectionMode, true, 'Internal selection mode is true for list mode "SingleSelect" on ' + oList);
		assert.strictEqual(oList.setMode(library.ListMode.MultiSelect).getMode(), library.ListMode.MultiSelect, 'The property "mode" is "None" on ' + oList);
		assert.strictEqual(oList.getSelectedItems().length, 1, 'One selection should be keepts after switching the mode to "MultiSelect" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._bSelectionMode, true, 'Internal selection mode is true for list mode "MultiSelect" on ' + oList);
		assert.strictEqual(oList.setMode(library.ListMode.Delete).getMode(), library.ListMode.Delete, 'The property "mode" is "None" on ' + oList);
		assert.strictEqual(oList.setMode(library.ListMode.SingleSelectMaster).getMode(), library.ListMode.SingleSelectMaster, 'The property "mode" is "None" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._bSelectionMode, true, 'Internal selection mode is true for list mode "SingleSelectMaster" on ' + oList);
		assert.strictEqual(oList.setMode(library.ListMode.SingleSelectLeft).getMode(), library.ListMode.SingleSelectLeft, 'The property "mode" is "None" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._bSelectionMode, true, 'Internal selection mode is true for list mode "SingleSelectLeft" on ' + oList);

		assert.throws(function() {
			oList.setMode("DoesNotExist");
		}, "Throws a type exception");
		assert.strictEqual(oList.getMode(), library.ListMode.SingleSelectLeft, 'The property "mode" is still "SingleSelectLeft" after setting mode "DoesNotExist" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setMode(library.ListMode.None), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setWidth", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let $list,
			sWidth,
			sWidthPx;

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();
		$list = oList.$();
		const iWidth100Percent = $list.width();

		// call method & do tests
		sWidth = "0px";
		sWidthPx = 0;
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.css("width"), sWidth, 'The CSS property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.width(), sWidthPx, 'The px width is now "' + sWidthPx + '" on ' + oList);

		sWidth = "500px";
		sWidthPx = 500;
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.css("width"), sWidth, 'The CSS property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.width(), sWidthPx, 'The px width is now "' + sWidthPx + '" on ' + oList);

		assert.throws(function() {
			oList.setWidth("NotaCSSSize");
		}, "Throws a type exception");
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is still "' + sWidth + '" after setting value "NotACSSSize"  on ' + oList);

		assert.throws(function() {
			oList.setWidth(-666);
		}, "Throws a type exception");
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is still "' + sWidth + '" after setting value "-666"  on ' + oList);

		assert.throws(function() {
			oList.setWidth(false);
		}, "Throws a type exception");
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is still "' + sWidth + '" after setting value "false" on ' + oList);

		oList.setWidth("");
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), "", 'The control property "width" is now "" after setting value "" on ' + oList);
		assert.strictEqual($list.width(), iWidth100Percent, 'The CSS property "width" is now 100% after setting value "" on ' + oList);

		sWidth = "20rem";
		sWidthPx = "320px";
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.css("width"), sWidthPx, 'The CSS property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.width(), parseInt(sWidthPx.replace("px", "")), 'The px width is now "' + parseInt(sWidthPx.replace("px", "")) + '" on ' + oList);

		sWidth = "50%";
		sWidthPx = Math.ceil(parseInt($list.parent().css("width")) / 2.0) + "px";
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The property "width" is now "' + sWidth + '" on ' + oList);

		sWidth = "auto";
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.css("width"), $list.parent().css("width"), 'The CSS property "width" is now "' + $list.parent().css("width") + '" on ' + oList);

		sWidth = "inherit";
		oList.setWidth(sWidth);
		await nextUIUpdate();
		$list = oList.$();
		assert.strictEqual(oList.getWidth(), sWidth, 'The control property "width" is now "' + sWidth + '" on ' + oList);
		assert.strictEqual($list.css("width"), $list.parent().css("width"), 'The CSS property "width" is now "' + $list.parent().css("width") + '" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setWidth(""), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 8, "The list should be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setNoDataText", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let sText;

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		sText = "Test1234567890!\"§$%&/()=?`´@€-_.:,;#'+*~1²³456{[]}\\";
		assert.strictEqual(oList.setNoDataText(sText).getNoDataText(), sText, 'The control property "noDataText" is "' + sText + '" on ' + oList);
		assert.strictEqual(oList.$("nodata").text(), sText, 'The dom element has the text "' + sText + '" on ' + oList);

		sText = "";
		assert.strictEqual(oList.setNoDataText(sText).getNoDataText(), oRB.getText("LIST_NO_DATA"), 'The control property "noDataText" is "' + sText + '" on ' + oList);
		assert.strictEqual(oList.$("nodata-text").text(), oRB.getText("LIST_NO_DATA"), 'The dom element has the text "' + sText + '" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setNoDataText(""), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setGrowing", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let bGrowing;

		oList.setGrowing(true);
		oList.setGrowingThreshold(5);

		bindListData(oList, data3, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		bGrowing = true;
		assert.strictEqual(oList.setGrowing(bGrowing).getGrowing(), bGrowing, 'The control property "growing" is "' + bGrowing + '" on ' + oList);
		assert.strictEqual(oList.getItems().length, 5, 'The displayed item size is "5" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._oGrowingDelegate instanceof GrowingEnablement, true, 'The growing delegate is initialized');

		bGrowing = false;
		assert.strictEqual(oList.setGrowing(bGrowing).getGrowing(), bGrowing, 'The control property "growing" is "' + bGrowing + '" on ' + oList);
		assert.strictEqual(oList.getItems().length, 5, 'The displayed item size is "5" on ' + oList);
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._oGrowingDelegate, null, 'The growing delegate is null');
		assert.strictEqual(oRenderSpy.callCount, 1, 'The list should not be rerendered until now');

		bGrowing = true;
		oList.setGrowing(bGrowing);
		await nextUIUpdate();

		assert.strictEqual(oList.getGrowing(), bGrowing, 'The control property "growing" is "' + bGrowing + '" on ' + oList);
		assert.strictEqual(oList.getItems().length, 5, 'The displayed item size is "5" after setting property "growing" to "true" again ' + oList.getId());
		// TODO: decide if check on internal variables is needed (Cahit)
		assert.strictEqual(oList._oGrowingDelegate instanceof GrowingEnablement, true, 'The growing delegate is initialized');
		assert.strictEqual(oRenderSpy.callCount, 2, 'The list should be rerendered after setting growing to "true"');

		// TODO: this should fire an exception because type is boolean
		//assert.throws(function() {
			oList.setGrowing("WrongType");
		//}, "Throws a type exception");
		assert.strictEqual(oList.getGrowing(), true, 'The control property "growing" is now "true" after setting value "WrongType" on ' + oList);
		assert.strictEqual(oList.setGrowing("").getGrowing(), false, 'The control property "growing" is now "false" after setting value "" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setGrowing(""), oList, 'Method returns this pointer on ' + oList);

		assert.strictEqual(oRenderSpy.callCount, 2, "The list should be rerendered twice in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setGrowingThreshold", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let iThreshold;

		oList.setGrowing(true);
		oList.setGrowingThreshold(5);

		bindListData(oList, data3, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		iThreshold = 5;
			assert.strictEqual(oList.getGrowingThreshold(), iThreshold, 'The control property "growingThreshold" is "' + iThreshold + '" on ' + oList);
			assert.strictEqual(oList.getItems().length, iThreshold, 'The displayed item size is "' + iThreshold + '" on ' + oList);

		iThreshold = 10;
		assert.strictEqual(oList.setGrowingThreshold(iThreshold).getGrowingThreshold(), iThreshold, 'The control property "growingThreshold" is "' + iThreshold + '" on ' + oList);
		assert.strictEqual(oList.getItems().length, 5, 'The displayed item size is still "5" on ' + oList);

		// TODO: this should not fail (check if it is a bug)
		//assert.strictEqual(oList.setGrowingThreshold(0).getGrowingThreshold(), iThreshold, 'The control property "growingThreshold" is still "' + iThreshold + '" after setting value "0" on ' + oList);
		//assert.strictEqual(oList.setGrowingThreshold(-99).getGrowingThreshold(), iThreshold, 'The control property "growingThreshold" is still "' + iThreshold + '" after setting value "-99" on ' + oList);

		assert.throws(function() {
			oList.setGrowingThreshold("WrongType");
		}, "Throws a type exception");
		assert.strictEqual(oList.getGrowingThreshold(), iThreshold, 'The control property "growingThreshold" is still "' + iThreshold + '" after setting value "wrongType" on ' + oList);
		// standard setter tests
		assert.strictEqual(oList.setGrowingThreshold(), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setGrowingTriggerText", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let sText;

		oList.setGrowing(true);
		oList.setGrowingThreshold(5);

		bindListData(oList, data3, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		sText = "Test1234567890!\"§$%&/()=?`´@€-_.:,;#'+*~1²³456{[]}\\";
		assert.strictEqual(oList.setGrowingTriggerText(sText).getGrowingTriggerText(), sText, 'The control property "growingTriggerText" is "' + sText + '" on ' + oList);
		await nextUIUpdate();
		assert.strictEqual(oList.$("trigger").find(".sapMSLITitle").text(), sText, 'The dom element has the text "' + sText + '" on ' + oList);

		sText = "~!@#$%^&*()_+{}:\"|<>?\'\"><script>alert('xss')<\/script>";
		assert.strictEqual(oList.setGrowingTriggerText(sText).getGrowingTriggerText(), sText, 'Javascript code injection is not possible on ' + oList);
		await nextUIUpdate();
		assert.strictEqual(oList.$("trigger").find(".sapMSLITitle").text(), sText, 'The dom element has the text "' + sText + '" on ' + oList);

		sText = "";
		assert.strictEqual(oList.setGrowingTriggerText(sText).getGrowingTriggerText(), sText, 'The control property "growingTriggerText" is "' + sText + '" on ' + oList);
		await nextUIUpdate();
		assert.strictEqual(oList.$("trigger").find(".sapMSLITitle").text(), oRB.getText("LOAD_MORE_DATA"), 'The dom element has the text "' + sText + '" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setGrowingTriggerText(""), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 4, "The list should be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oRenderSpy.restore();
	});

	QUnit.test("setEnableBusyIndicator", async function(assert) {
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oRenderSpy = this.spy(oList.getRenderer(), "render");

		oList.setEnableBusyIndicator(false);
		oList.setEnableBusyIndicator(true);
		await nextUIUpdate();
		assert.strictEqual(oRenderSpy.callCount, 0, "The list should not be rerendered when enableBusyIndicator is changed");
	});

	QUnit.test("setBusy method test enableBusyIndicator property", async function(assert) {
		oList.setEnableBusyIndicator(false);
		// simulate List is busy
		oList._bBusy = true;
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		const fSetBusy = sinon.spy(oList, "setBusy");
		oList._hideBusyIndicator();
		assert.notOk(oList._bBusy, "_bBusy was reset");
		assert.notOk(fSetBusy.called, "setBusy function not called, since enableBusyIndicator=false");

		// enable busy indicator
		oList.setEnableBusyIndicator(true);
		// simulate List is busy
		oList._bBusy = true;
		await nextUIUpdate();
		oList._hideBusyIndicator();
		assert.ok(fSetBusy.calledWith(false , "listUl"));
		assert.notOk(oList._bBusy, "_bBusy is false");
	});

	if (window.IntersectionObserver) {
		QUnit.test("BusyIndicator in the middle", async function(assert) {
			createAndAppendDiv("uiArea1");

			const $qunitFixture = jQuery("#qunit-fixture"),
				sPosition = $qunitFixture.css("position"),
				sTop = $qunitFixture.css("top"),
				sLeft = $qunitFixture.css("left"),
				sWidth = $qunitFixture.css("width");

			$qunitFixture.css("position", "inherit");
			$qunitFixture.css("top", "inherit");
			$qunitFixture.css("left", "inherit");
			$qunitFixture.css("width", "inherit");

			let oMutationObserver, observedDomRef;
			const done = assert.async();
			oScrollContainer = new ScrollContainer({
				vertical: true,
				height: "300px",
				content: [oList, new Toolbar({height: "100px"})]
			});

			oList.setBusyIndicatorDelay(0);
			oScrollContainer.placeAt("uiArea1");
			await nextUIUpdate();

			oList.getDomRef().style.height = "500px";

			new Promise(function(fnResolve) {
				oList.setBusy(true);

				observedDomRef = oList.getDomRef("busyIndicator").firstChild;
				oMutationObserver = new MutationObserver(function(aMutations) {
					aMutations.forEach(function(oMutation) {
						if (oMutation.attributeName == "style") {
							assert.strictEqual(oList.getDomRef("busyIndicator").firstChild.style.position, "sticky", "Position sticky was applied correctly");

							oList.setBusy(false);
							oMutationObserver.disconnect();
							fnResolve();
						}
					});
				});
				oMutationObserver.observe(observedDomRef, { attributes: true, attributeFilter: ["style"] });
			}).then(function() {
				oScrollContainer.scrollTo(0, 400);
				oList.setBusy(true);

				observedDomRef = oList.getDomRef("busyIndicator").firstChild;
				oMutationObserver = new MutationObserver(function(aMutations) {
					aMutations.forEach(function(oMutation) {
						// safari returns top: "20.000000298023224%", hence the parseInt to remove the floating point values
						assert.strictEqual(parseInt(oList.getDomRef("busyIndicator").firstChild.style.top) + "%", "20%", "Style top 20% was applied correctly");

						oList.setBusy(false);
						oMutationObserver.disconnect();

						// restore style
						$qunitFixture.css("position", sPosition);
						$qunitFixture.css("top", sTop);
						$qunitFixture.css("left", sLeft);
						$qunitFixture.css("width", sWidth);
						done();
					});
				});
				oMutationObserver.observe(observedDomRef, { attributes: true, attributeFilter: ["style"] });
			});
		});
	}


	QUnit.test("setShowSeparators", async function(assert) {
		const oListItem = createListItem().setSelected(true),
			oList = new List({
				showSeparators: library.ListSeparators.All,
				items: [
					oListItem
				]
			}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");
		let $listUl;

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();
		$listUl = jQuery(oList.$().children("ul")[0]);

		// call method & do tests
		assert.strictEqual(oList.getShowSeparators(), library.ListSeparators.All, 'The property "showSeparators" is "All" on ' + oList);
		assert.ok($listUl.hasClass("sapMListShowSeparatorsAll"), 'The HTML div container for the list has class "sapMListShowSeparatorsAll" on ' + oList);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsInner"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsInner" on ' + oList);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsNone"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsNone" on ' + oList);

		assert.strictEqual(oList.setShowSeparators(library.ListSeparators.Inner).getShowSeparators(), library.ListSeparators.Inner, 'The property "showSeparators" is "Inner" on ' + oList);
		await nextUIUpdate();
		$listUl = jQuery(oList.$().children("ul")[0]);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsAll"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsAll" on ' + oList);
		assert.ok($listUl.hasClass("sapMListShowSeparatorsInner"), 'The HTML div container for the list has class "sapMListShowSeparatorsInner" on ' + oList);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsNone"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsNone" on ' + oList);

		assert.strictEqual(oList.setShowSeparators(library.ListSeparators.None).getShowSeparators(), library.ListSeparators.None, 'The property "showSeparators" is "None" on ' + oList);
		await nextUIUpdate();
		$listUl = jQuery(oList.$().children("ul")[0]);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsAll"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsAll" on ' + oList);
		assert.ok(!$listUl.hasClass("sapMListShowSeparatorsInner"), 'The HTML div container for the list does not have class "sapMListShowSeparatorsInner" on ' + oList);
		assert.ok($listUl.hasClass("sapMListShowSeparatorsNone"), 'The HTML div container for the list has class "sapMListShowSeparatorsNone" on ' + oList);

		assert.throws(function() {
			oList.setshowSeparators("DoesNotExist");
		}, "Throws a type exception");
		assert.strictEqual(oList.getShowSeparators(), library.ListSeparators.None, 'The property "showSeparators" is still "sap.m.showSeparators.None" after setting mode "DoesNotExist" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setShowSeparators(), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 3, "The list should be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oList.destroy();
	});

	QUnit.test("setIncludeItemInSelection", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				includeItemInSelection: false,
				mode: library.ListMode.MultiSelect,
				items: [
					oListItemTemplate
				]
			}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");
		let bIncludeItemInSelection;

		// let the item navigation run for testing
		this.stub(Device.system, "desktop").value(true);

		bindListData(oList, data3, "/items", createTemplateListItem());

		// add item to page & render
		oPage.addContent(oList);
		await nextUIUpdate();
		const oSelectionItem = oList.getItems()[3];

		// call method & do tests
		bIncludeItemInSelection = true;
		assert.strictEqual(oList.setIncludeItemInSelection(bIncludeItemInSelection).getIncludeItemInSelection(), bIncludeItemInSelection, 'The control property "includeItemInSelection" is "' + bIncludeItemInSelection + '" on ' + oList);
		await nextUIUpdate();
		oList.getItems().forEach(function(oItem) {
			assert.strictEqual(oItem.$().hasClass("sapMLIBActionable"), true, 'Each item has css class "sapMLIBActionable" on ' + oList);
		});

		// simulate tap & check result
		oSelectionItem.$().trigger("tap");
		assert.strictEqual(oList.getSelectedItem(), oSelectionItem, 'Item "' + oSelectionItem + '" should be selected');
		oSelectionItem.setSelected(false);

		bIncludeItemInSelection = false;
		assert.strictEqual(oList.setIncludeItemInSelection(bIncludeItemInSelection).getIncludeItemInSelection(), bIncludeItemInSelection, 'The control property "includeItemInSelection" is "' + bIncludeItemInSelection + '" on ' + oList);
		await nextUIUpdate();
		oList.getItems().forEach(function(oItem) {
			assert.strictEqual(oItem.$().hasClass("sapMLIBActionable"), false, 'Each item does not have has css class "sapMLIBCursor" on ' + oList);
		});

		// simulate tap & check result
		oSelectionItem.$().trigger("tap");
		assert.strictEqual(oList.getSelectedItem(), null, 'Item "' + oSelectionItem + '" should not be selected / selection should be empty');
		oSelectionItem.setSelected(false);

		// TODO: this should fire an exception because type is boolean
		assert.throws(function() {
			oList.setIncludeItemInSelection("WrongType");
		}, "Throws a type exception");
		assert.strictEqual(oList.getIncludeItemInSelection(), false, 'The control property "includeItemInSelection" is still "false" after setting value "WrongType" on ' + oList);

		// standard setter tests
		assert.strictEqual(oList.setIncludeItemInSelection(), oList, 'Method returns this pointer on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 3, "The list should be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oList.destroy();
	});



	QUnit.test("setRememberSelectionsForMultiSelect", async function(assert) {
		const oListItemTemplate = createListItem().setSelected(true),
			oList = new List({
				includeItemInSelection: false,
				mode: library.ListMode.MultiSelect,
				items: [
					oListItemTemplate
				]
			}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");

		await testRemeberSelections(oList, oRenderSpy, assert);
	});

	QUnit.test("setRememberSelectionsForSingleSelect", async function(assert) {
		const oListItemTemplate = createListItem().setSelected(true),
			oList = new List({
				includeItemInSelection: false,
				mode: library.ListMode.SingleSelect,
				items: [
					oListItemTemplate
				]
			}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");

		await testRemeberSelections(oList, oRenderSpy, assert);

	});


	/* getter */

	QUnit.test("getId", function(assert) {
		const id = "testId",
			suffix = "testSuffix",
			oList = new List(id, {}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");

		// call method & do tests
		assert.strictEqual(oList.getId(), id, 'The id returned by method getId is "' + id + '" on ' + oList);
		assert.strictEqual(oList.getId(suffix), id + '-' + suffix, 'The id returned by method getId is "' + (id + '-' + suffix) + '" on ' + oList);

		// standard getter tests
		assert.strictEqual(typeof oList.getId(), "string", 'Method returns a string type on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 0, "The list should not be rerendered in this method");
	});

	QUnit.test("getNoDataText", async function(assert) {
		const oList = new List({
				noDataText: ""
			}),
			oRenderSpy = this.spy(oList.getRenderer(), "render");
		let sText = oRB.getText("LIST_NO_DATA");

		// add item to page & render
		oList.setNoDataText();
		oPage.addContent(oList);
		await nextUIUpdate();

		// call method & do tests
		assert.strictEqual(oList.getNoDataText(), sText, 'The control property "noDataText" is "' + sText + '" when the property value is empty on ' + oList);

		sText = "Text";
		assert.strictEqual(oList.setNoDataText(sText).getNoDataText(), sText, 'The control property "noDataText" is "' + sText + '" on ' + oList);

		// standard getter tests
		assert.strictEqual(typeof oList.getNoDataText(), "string", 'Method returns a string type on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
		oList.destroy();
	});

	QUnit.test("getMaxItemsCount", async function(assert) {
		const oRenderSpy = this.spy(oList.getRenderer(), "render");
		let iCounter;

		// add item to page & render
		oList.setMode(library.ListMode.None);
		oPage.addContent(oList);
		await nextUIUpdate();

		// no binding
		iCounter = 0;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a static list with ' + iCounter + ' items on ' + oList);

		oList.addItem(createListItem());
		iCounter++;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a static list with ' + iCounter + ' items on ' + oList);

		oList.addItem(createListItem());
		iCounter++;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a static list with ' + iCounter + ' items on ' + oList);

		oList.removeAllItems();
		iCounter = 0;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a static list with ' + iCounter + ' items on ' + oList);

		bindListData(oList, data1, "/items", createTemplateListItem());
		iCounter = data1.items.length;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a dynamic list with ' + iCounter + ' items on ' + oList);

		bindListData(oList, data2, "/items", createTemplateListItem());
		iCounter = data2.items.length;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a dynamic list with ' + iCounter + ' items on ' + oList);

		bindListData(oList, data3, "/items", createTemplateListItem());
		iCounter = data3.items.length;
		assert.strictEqual(oList.getMaxItemsCount(), iCounter, 'The item count is ' + iCounter + ' in a dynamic list with ' + iCounter + ' items on ' + oList);

		// standard getter tests
		assert.strictEqual(typeof oList.getMaxItemsCount(), "number", 'Method returns a number type on ' + oList);
		assert.strictEqual(oRenderSpy.callCount, 1, "The list should not be rerendered in this method");

		// cleanup
		oPage.removeAllContent();
	});

	QUnit.test("getStickyFocusOffset", function(assert){
		assert.strictEqual(oList.getStickyFocusOffset(), 0, "The sticky UI element has proper focus offset");
	});

	/********************************************************************************/
	QUnit.module("Other API methods", {
		beforeEach: async function() {
			const aListItems = [];

			for (let i = 0; i < 50; i++) {
				aListItems.push(createListItem());
			}

			oList = new List({
				items: aListItems
			});

			oScrollContainer = new ScrollContainer({
				vertical: true,
				content: oList
			});

			oScrollContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach: function() {
			oScrollContainer.destroy();
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.test("Function scrollToIndex", async function(assert) {
		const done = assert.async();

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		oList.setHeaderToolbar(oHeaderToolbar);
		oList.setInfoToolbar(oInfoToolbar);

		await nextUIUpdate();

		const oScrollDelegate = library.getScrollDelegate(oList, true),
			oSpy = sinon.spy(oScrollDelegate, "scrollToElement");

		function testScroll(iIndex) {
			return new Promise(function(resolve) {
				if (iIndex === -1) {
					iIndex = oList.getVisibleItems().length - 1;
				}

				oList.scrollToIndex(iIndex).then(function() {
					assert.ok(oSpy.called, "The scroll delegate was called");
					assert.ok(oSpy.calledOnce, "The scroll delegate was called exactly once");
					assert.ok(oSpy.calledWithExactly(oList.getVisibleItems()[iIndex].getDomRef(), null, [0, oList._getStickyAreaHeight() * -1], true),
						"Scroll delegate was called with correct parameters");
					oSpy.resetHistory();
					resolve();
				});
			});
		}

		return new Promise(function(resolve) {
			resolve();
		}).then(function() {
			return testScroll(0);
		}).then(function() {
			return testScroll(oList.getVisibleItems().length / 2);
		}).then(function() {
			return testScroll(-1);
		}).then(function() {
			oList.setSticky(['HeaderToolbar']);
			return testScroll(0);
		}).then(function() {
			oSpy.restore();
			oScrollContainer.destroy();
			done();
		});
	});

	QUnit.test("Function requestItems", function(assert) {
		let oNewList = new List({
			growing: false
		});

		const fRequestNewPageSpy =  sinon.spy(GrowingEnablement.prototype, "requestNewPage");
		bindListData(oNewList, data4, "/items", createTemplateListItem());
		assert.strictEqual(oNewList.getItems().length, 10, "List has 10 items");

		assert.throws(function() {oNewList.requestItems(5);}, /The prerequisites to use 'requestItems' are not met. Please read the documentation for more details./, "Expected error thrown");
		assert.ok(fRequestNewPageSpy.notCalled, "GrowingDelegate#requestNewPage not called");

		oNewList.destroy();
		oNewList = new List({
			growing: true,
			growingThreshold: 2
		});
		bindListData(oNewList, data4, "/items", createTemplateListItem());
		assert.strictEqual(oNewList.getItems().length, 2, "List has 2 items");
		assert.throws(function() {oNewList.requestItems(0);}, /The prerequisites to use 'requestItems' are not met. Please read the documentation for more details./, "Expected error thrown, iItems=0");
		assert.ok(fRequestNewPageSpy.notCalled, "GrowingDelegate#requestNewPage not called");
		assert.throws(function() {oNewList.requestItems(-10);}, /The prerequisites to use 'requestItems' are not met. Please read the documentation for more details./, "Expected error thrown, iItem is negative number");
		assert.ok(fRequestNewPageSpy.notCalled, "GrowingDelegate#requestNewPage not called");
		oNewList.requestItems(4);
		assert.strictEqual(oNewList.getItems().length, 6, "growing is enabled, requestItems API request data");
		assert.strictEqual(oNewList.getGrowingThreshold(), 2, "Growing threshold restored");
		assert.ok(fRequestNewPageSpy.calledOnce, "GrowingDelegate#requestNewPage called once");

		oNewList.destroy();
	});

	QUnit.test("Function _setFocus", async function(assert) {
		function testFocus(iIndex, bFirstInteractiveElement) {
			return new Promise(function(resolve) {
				if (iIndex === -1) {
					iIndex = oList.getVisibleItems().length - 1;
				}

				iIndex = Math.min(iIndex, oList.getVisibleItems().length - 1);

				oList._setFocus(iIndex, bFirstInteractiveElement).then(function() {
					const oItem = oList.getVisibleItems()[iIndex];
					const $Elem = (bFirstInteractiveElement && oItem.getTabbables(true).length) ? oItem.getTabbables(true)[0] : oItem.getDomRef();
					assert.deepEqual(document.activeElement, $Elem, "The focus was set correctly");
					resolve();
				});
			});
		}

		function setItemFocusable(oItem) {
			oItem.getTabbables(true).first().attr("tabindex", 0);
		}

		oList.setMode("MultiSelect");
		await nextUIUpdate();
		await testFocus(100, false);
		await testFocus(0, false);
		await testFocus(oList.getVisibleItems().length / 2, false);
		await testFocus(-1, false);
		await testFocus(100, true);
		setItemFocusable(oList.getVisibleItems()[0]);
		await testFocus(0, true);
		setItemFocusable(oList.getVisibleItems()[oList.getVisibleItems().length / 2]);
		await testFocus(oList.getVisibleItems().length / 2, true);
		await testFocus(-1, true);
	});

	/********************************************************************************/
	QUnit.module("Internal methods", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});
	/********************************************************************************/

	QUnit.module("KeyboardHandling", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("Basics", async function(assert) {
		const fnDetailPressSpy = this.spy(),
			fnItemPressSpy = this.spy(),
			fnDeleteSpy = this.spy(),
			fnPressSpy = this.spy(),
			fnSelectionChangeSpy = this.spy(),
			oInput = new Input(),
			oListItem1 = new CustomListItem({
				content: oInput,
				type: "Navigation",
				press: fnPressSpy,
				detailPress: fnDetailPressSpy
			}),
			oListItem2 = new StandardListItem({
				type: "Detail",
				detailPress: fnDetailPressSpy
			}),
			oList = new List({
				mode: "MultiSelect",
				"delete": fnDeleteSpy,
				itemPress: fnItemPressSpy,
				selectionChange: fnSelectionChangeSpy
			}).addItem(oListItem1).addItem(oListItem2);

		// let the item navigation run for testing
		this.stub(Device.system, "desktop").value(true);

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.focus();

		assert.strictEqual(oList.getDomRef("before").getAttribute("tabindex"), "-1", "Before dummy element is not at the tab chain");
		assert.strictEqual(oList.getNavigationRoot().getAttribute("tabindex"), "0", "Navigation root is at the tab chain");
		assert.strictEqual(oList.getDomRef("after").getAttribute("tabindex"), "0", "After dummy element is at the tab chain");
		assert.strictEqual(oList.getDomRef("after").getAttribute("role"), "none", "After dummy element has role=none");

		if (!document.hasFocus()) {
			return;
		}

		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Initial focus is at the first list item");

		qutils.triggerKeydown(document.activeElement, "ARROW_LEFT");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Left arrow has no effect on focus");

		qutils.triggerKeydown(document.activeElement, "ARROW_RIGHT");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Right arrow has no effect on focus");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Focus is still at the first list item");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		assert.strictEqual(document.activeElement, oListItem2.getFocusDomRef(), "Focus is moved down to the second list item");

		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
		assert.strictEqual(document.activeElement, oListItem2.getFocusDomRef(), "Focus is still at the second list item");

		qutils.triggerKeydown(document.activeElement, "ARROW_UP");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Focus is now again at the first list item");

		qutils.triggerKeydown(document.activeElement, "END");
		assert.strictEqual(document.activeElement, oListItem2.getFocusDomRef(), "Focus is at the second list item");

		qutils.triggerKeydown(document.activeElement, "HOME");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Focus is at the first list item");

		qutils.triggerKeydown(document.activeElement, "PAGE_DOWN");
		assert.strictEqual(document.activeElement, oListItem2.getFocusDomRef(), "Focus is at the second list item");

		qutils.triggerKeydown(document.activeElement, "PAGE_UP");
		assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Focus is at the first list item");

		qutils.triggerKeydown(document.activeElement, "SPACE");
		assert.strictEqual(fnSelectionChangeSpy.callCount, 1, "SelectionChange event is fired when space is pressed while focus is at the item");
		fnSelectionChangeSpy.resetHistory();

		qutils.triggerKeydown(document.activeElement, "ENTER");
		await timeout();

		assert.strictEqual(fnItemPressSpy.callCount, 1, "ItemPress event is fired async when enter is pressed while focus is at the item");
		assert.strictEqual(fnPressSpy.callCount, 1, "Press event is fired async when enter is pressed while focus is at the item");
		fnItemPressSpy.resetHistory();
		fnPressSpy.resetHistory();

		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyE", ctrlKey: true});
		assert.strictEqual(fnDetailPressSpy.callCount, 0, "DetailPress event is not called since first item has not Edit type");

		qutils.triggerKeydown(document.activeElement, "DELETE");
		assert.strictEqual(fnDeleteSpy.callCount, 0, "Delete event is not called since List is not in Delete mode");

		assert.equal(oListItem1.getTabbables()[0], oListItem1.getModeControl().getFocusDomRef(), "the first tabbable element is checkbox");
		assert.equal(oListItem1.getTabbables(true)[0], oInput.getFocusDomRef(), "the first tabbable element in the content is input");

		oList.setMode("Delete");
		await nextUIUpdate();
		oList.focus();

		qutils.triggerKeydown(document.activeElement, "DELETE");
		assert.strictEqual(fnDeleteSpy.callCount, 1, "Delete event is now called because List is in Delete mode");

		oInput.focus();
		qutils.triggerKeydown(document.activeElement, "SPACE");
		assert.strictEqual(fnSelectionChangeSpy.callCount, 0, "SelectionChange event is not fired when space is pressed while focus is not at the item");

		qutils.triggerKeydown(document.activeElement, "ENTER");
		await timeout();

		assert.strictEqual(fnItemPressSpy.callCount, 0, "ItemPress event is not fired when enter is pressed while focus is not at the item");
		assert.strictEqual(fnPressSpy.callCount, 0, "Press event is not fired when enter is pressed while focus is not at the item");

		oListItem2.focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyE", ctrlKey: true});
		assert.strictEqual(fnDetailPressSpy.callCount, 1, "DetailPress event is called since second item has type Edit");

		oList.destroy();
	});

	QUnit.test("Test Tab/ShiftTab/F6/ShiftF6 handling", async function(assert) {
		const fnSpy = this.spy();
		const oPage = new Page();
		const oBeforeList = new Input();
		const oAfterList = new Input();
		const oInput = new Input();
		const oListItem = new InputListItem({
			label: "Input",
			content : oInput,
			type: "Navigation"
		});
		const oList = new List({
			mode: "MultiSelect",
			items : [oListItem]
		});

		oPage.addContent(oBeforeList);
		oPage.addContent(oList);
		oPage.addContent(oAfterList);
		oPage.placeAt("qunit-fixture");
		await nextUIUpdate();
		oList.forwardTab = fnSpy;

		// tab key
		qutils.triggerKeydown(oListItem.getFocusDomRef(), "TAB", false, false, false);
		assert.strictEqual(fnSpy.callCount, 1, "List is informed to forward tab when tab is pressed while focus is on the item");
		assert.strictEqual(fnSpy.args[0][0], true, "Tab Forward is informed");
		fnSpy.resetHistory();

		// shift-tab key
		qutils.triggerKeydown(oListItem.getFocusDomRef(), "TAB", true, false, false);
		assert.strictEqual(fnSpy.callCount, 1, "List is informed to forward tab backwards when tab is pressed while focus is on the row");
		assert.strictEqual(fnSpy.args[0][0], false, "Backwards tab is informed");
		fnSpy.resetHistory();

		// shift-F6 key
		oInput.getFocusDomRef().focus();
		qutils.triggerKeydown(oInput.getFocusDomRef(), "F6", true, false, false);
		assert.strictEqual(document.activeElement.id, oBeforeList.getFocusDomRef().id, "Focus is moved correctly after Shift-F6");

		// F6
		oInput.getFocusDomRef().focus();
		qutils.triggerKeydown(oInput.getFocusDomRef(), "F6", false, false, false);
		assert.strictEqual(document.activeElement.id, oAfterList.getFocusDomRef().id, "Focus is moved correctly after F6");

		// cleanup
		oPage.destroy();
	});

	// in case of testrunner does not put the focus to the document it is not neccessary to make this test
	if (document.hasFocus()) {
		QUnit.test("Focusing an item in the ListItemBase should change the focus index of item navigation", async function(assert) {
			const oInput = new Input();
			const oListItem0 = new InputListItem({
				label: "Input",
				content : oInput,
				type: "Navigation"
			});
			const oListItem1 = oListItem0.clone();
			const oListItem2 = oListItem0.clone();

			oList.addItem(oListItem0).addItem(oListItem1).addItem(oListItem2);

			// let the item navigation run for testing
			this.stub(Device.system, "desktop").value(true);

			oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			const oFocusedInput = oListItem1.getTabbables()[0];
			oFocusedInput.focus();
			await timeout(1);

			assert.strictEqual(oList.getItemNavigation().getFocusedIndex(), 1, "Focus index is set correctly");

			// cleanup
			oList.destroy();
		});
	}

	QUnit.test("Item visible changes should inform the List", async function(assert) {
		const fnSpy = this.spy();
		const oListItem = new StandardListItem({
			title: "Title"
		});
		const oList = new List({
			items : oListItem
		});

		oPage.addContent(oList);
		await nextUIUpdate();

		// act
		oList.onItemDOMUpdate = fnSpy;

		oListItem.setVisible(false);
		await nextUIUpdate();

		assert.strictEqual(fnSpy.callCount, 1, "List is informed when item visibility is changed from visible to invisible");
		assert.strictEqual(fnSpy.args[0][0], oListItem, "Correct list item is informed");
		fnSpy.resetHistory();

		oListItem.setVisible(true);
		await nextUIUpdate();

		assert.strictEqual(fnSpy.callCount, 1, "List is informed when item visibility is changed from invisible to visible");
		assert.strictEqual(fnSpy.args[0][0], oListItem, "Correct list item is informed");
		assert.strictEqual(fnSpy.args[0][1], true, "Correct visible parameter item is informed");
		fnSpy.resetHistory();

		oListItem.invalidate();
		await nextUIUpdate();

		assert.strictEqual(fnSpy.callCount, 0, "Visibility did not changed and list is not informed");

		// cleanup
		oPage.removeAllContent();
		oList.destroy();
	});

	QUnit.test("ListItem visibility change should not rerender the list", async function(assert) {
		const oListItem1 = new StandardListItem({
				title: "Title1"
			}),
			oListItem2 = new StandardListItem({
				title: "Title2"
			}),
			oList = new List({
				items : [oListItem1, oListItem2]
			});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		// let the item navigation run for testing
		this.stub(Device.system, "desktop").value(true);

		const fnRenderSpy = this.spy(oList.getRenderer(), "render");

		oListItem1.setVisible(false);
		await nextUIUpdate();

		oListItem2.focus();
		await timeout(1);

		/* make it sure document has focus in case of testrunner */
		if (document.hasFocus()) {
			assert.strictEqual(oList.getItemNavigation().getItemDomRefs().length, 1, "Invisible items are not in the item navigation.");
		}

		oListItem1.setVisible(true);
		await nextUIUpdate();

		oListItem1.focus();
		await timeout(1);

		/* make it sure document has focus in case of testrunner */
		if (document.hasFocus()) {
			assert.strictEqual(oList.getItemNavigation().getItemDomRefs().length, 2, "Only visible items are in the item navigation.");
		}

		oListItem1.setVisible(false);
		await nextUIUpdate();

		assert.strictEqual(fnRenderSpy.callCount, 0, "The list should not be rerendered with item visibility changes");

		oList.destroy();
	});

	QUnit.test("Container Padding Classes", async function(assert) {
		// System under Test + Act
		let sResponsiveSize;

		if (Device.resize.width <= 599) {
			sResponsiveSize = "0px";
		} else if (Device.resize.width <= 1023) {
			sResponsiveSize = "16px";
		} else {
			sResponsiveSize = "16px 32px";
		}
		const aResponsiveSize = sResponsiveSize.split(" ");

		// Act
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		oList.addStyleClass("sapUiNoContentPadding");
		const $containerContent = oList.$();

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "0px", "The container has no left content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "0px", "The container has no right content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "0px", "The container has no top content padding when class \"sapUiNoContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "0px", "The container has no bottom content padding when class \"sapUiNoContentPadding\" is set");

		// Act
		oList.removeStyleClass("sapUiNoContentPadding");
		oList.addStyleClass("sapUiContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), "16px", "The container has 1rem left content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-right"), "16px", "The container has 1rem right content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-top"), "16px", "The container has 1rem top content padding when class \"sapUiContentPadding\" is set");
		assert.strictEqual($containerContent.css("padding-bottom"), "16px", "The container has 1rem bottom content padding when class \"sapUiContentPadding\" is set");

		// Act
		oList.removeStyleClass("sapUiContentPadding");
		oList.addStyleClass("sapUiResponsiveContentPadding");

		// Assert
		assert.strictEqual($containerContent.css("padding-left"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]), "The container has " + sResponsiveSize + " left content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-right"), (aResponsiveSize[1] ? aResponsiveSize[1] : aResponsiveSize[0]) , "The container has " + sResponsiveSize + " right content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-top"), aResponsiveSize[0], "The container has " + sResponsiveSize + " top content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");
		assert.strictEqual($containerContent.css("padding-bottom"), aResponsiveSize[0], "The container has " + sResponsiveSize + " bottom content padding when class \"sapUiResponsiveContentPadding\" is set (tested value depends on window size)");

	});

	if (document.hasFocus()) {
		QUnit.test("KeybordMode", async function(assert) {
			const fnDetailPressSpy = this.spy(),
				fnItemPressSpy = this.spy(),
				fnPressSpy = this.spy(),
				oInput1 = new Input(),
				oInput2 = new Input(),
				oButton1 = new Button(),
				oButton2 = new Button(),
				oListItem1 = new CustomListItem({
					content: oInput1,
					type: "Detail",
					detailPress: fnDetailPressSpy
				}),
				oListItem2 = new CustomListItem({
					content: oInput2,
					type: "Navigation",
					press: fnPressSpy
				}),
				oList = new List({
					mode: "MultiSelect",
					itemPress: fnItemPressSpy
				}).addItem(oListItem1).addItem(oListItem2),
				oContainer = new VBox({
					items: [oButton1, oList, oButton2]
				});

			oContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
			oList.focus();

			qutils.triggerKeydown(oListItem1.getFocusDomRef(), "TAB", true, false, false);
			assert.strictEqual(document.activeElement, oList.getDomRef('before'), "Focus is forwarded before the table");

			oListItem1.focus();
			qutils.triggerKeydown(document.activeElement, "TAB");
			assert.strictEqual(document.activeElement, oList.getDomRef("after"), "Focus is forwarded after the table");

			oInput1.focus();
			qutils.triggerKeydown(document.activeElement, "ARROW_UP");
			assert.strictEqual(document.activeElement, oInput1.getFocusDomRef(), "Arrow up has no effect");

			oInput1.focus();
			qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
			assert.strictEqual(document.activeElement, oInput1.getFocusDomRef(), "Arrow up has no effect");

			oInput1.focus();
			qutils.triggerKeydown(document.activeElement, "ENTER");
			assert.strictEqual(fnPressSpy.callCount, 0, "Enter has no effect");

			oListItem1.focus();
			qutils.triggerEvent("keydown", document.activeElement, {code: "KeyE", ctrlKey: true});
			assert.strictEqual(fnDetailPressSpy.callCount, 1, "Detail press event is fired while focus is on the row");
			fnDetailPressSpy.resetHistory();

			oInput1.focus();
			qutils.triggerKeydown(document.activeElement, "TAB");
			assert.notStrictEqual(document.activeElement, oList.getDomRef("after"), "Focus is not forwarded after the table");

			oInput1.focus();
			qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
			assert.strictEqual(document.activeElement, oListItem1.getFocusDomRef(), "Focus is moved to the row");

			oListItem1.detachDetailPress(fnDetailPressSpy);
			qutils.triggerEvent("keydown", document.activeElement, {code: "F2"});
			assert.strictEqual(document.activeElement, oListItem1.getModeControl().getFocusDomRef(), "Focus is moved to the Input again");

			qutils.triggerKeydown(document.activeElement, "ARROW_DOWN");
			assert.strictEqual(document.activeElement, oListItem2.getModeControl().getFocusDomRef(), "Focus is moved to the next items selection control");

			qutils.triggerKeydown(document.activeElement, "ARROW_UP");
			assert.strictEqual(document.activeElement, oListItem1.getModeControl().getFocusDomRef(), "Focus is moved to the previous items selection control");

			oInput1.focus();
			qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", false, false, true);
			assert.strictEqual(document.activeElement, oInput2.getFocusDomRef(), "Focus is moved to the second input with CTRL held");

			qutils.triggerKeydown(document.activeElement, "ARROW_UP", false, false, true);
			assert.strictEqual(document.activeElement, oInput1.getFocusDomRef(), "Focus is moved to the first input with CTRL held");

			oInput2.setEnabled(false);
			await nextUIUpdate();
			qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", false, false, true);
			assert.strictEqual(document.activeElement, oListItem2.getModeControl().getFocusDomRef(), "Focus is moved to the selection control of 2nd item since the input is disabled");

			qutils.triggerKeydown(document.activeElement, "TAB", true, false, false);
			assert.notStrictEqual(document.activeElement, oList.getItemsContainerDomRef(), "Focus is not forwarded before the table");

			oInput2.setEnabled(true);
			await nextUIUpdate();
			oListItem2.focus();
			qutils.triggerEvent("keydown", document.activeElement, {code: "F7"});
			assert.strictEqual(document.activeElement, oListItem2.getModeControl().getFocusDomRef(), "Focus is moved to the selection control");

			qutils.triggerKeydown(document.activeElement, "ENTER");
			assert.strictEqual(fnItemPressSpy.callCount, 0, "Item press event is not called");
			assert.strictEqual(fnPressSpy.callCount, 0, "Press event is not called");

			oContainer.destroy();
		});
	}

	QUnit.test("Keyboard range selection", async function(assert) {

		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			}),
			fnFireSelectionChangeEvent = this.spy(oList, "_fireSelectionChangeEvent");

		bindListData(oList, data3, "/items", createTemplateListItem());

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.getVisibleItems()[0].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that oList._mRangeSelectionIndex object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");

		// when the range selection is started the tab key should exit from the range selection
		qutils.triggerEvent("keydown", document.activeElement, {code: "Tab"});
		assert.notOk(oList._mRangeSelection, "Range selection is cleared when tab is pressed");
		oList.getVisibleItems()[0].setSelected(false);
		fnFireSelectionChangeEvent.resetHistory();

		// select the item again
		oList.getVisibleItems()[0].focus();
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that oList._mRangeSelectionIndex object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(oList.getVisibleItems()[1].getSelected(), "Item at position 1 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(oList.getVisibleItems()[2].getSelected(), "Item at position 2 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 3, "selectionChange event fired");

		// item should be deselected with range selection mode is enabled and direction changes
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		assert.ok(!oList.getVisibleItems()[2].getSelected(), "Item at position 2 is deselected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 4, "selectionChange event fired");

		// delete oList._mRangeSelectionIndex object
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);
		assert.ok(!oList._mRangeSelection, "Range selection mode cleared");
		// reset the spy
		fnFireSelectionChangeEvent.resetHistory();

		oList.getVisibleItems()[5].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");
		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		assert.ok(oList.getVisibleItems()[4], "Item at position 4 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		assert.ok(oList.getVisibleItems()[3], "Item at position 3 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 3, "selectionChange event fired");

		// item should be deselected with range selection mode is enabled and direction changes
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		assert.ok(!oList.getVisibleItems()[3].getSelected(), "Item at position 3 is deselected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 4, "selectionChange event fired");

		// clear oList._mRangeSelection object
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);
		assert.ok(!oList._mRangeSelection, "Range selection mode cleared");
		// reset the spy
		fnFireSelectionChangeEvent.resetHistory();

		// selectionChange event should not be fired when the item is already selected and range selection occurs on this item
		assert.ok(oList.getVisibleItems()[4].getSelected(), "item is already selected");
		assert.ok(oList.getVisibleItems()[5].getSelected(), "item is already selected");
		oList.getVisibleItems()[4].focus();
		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		assert.ok(fnFireSelectionChangeEvent.notCalled, "selectionChange event is not fired for already selected items");

		// clear oList._mRangeSelection object
		qutils.triggerKeyup(document.activeElement, "SHIFT", false, false, false);
		assert.ok(!oList._mRangeSelection, "Range selection mode cleared");

		// test for invisible items
		const oListItem = oList.getVisibleItems()[5];
		oListItem.setSelected(false);
		oListItem.setVisible(false);
		await nextUIUpdate();

		oList.getVisibleItems()[4].focus();
		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);

		assert.ok(oList._mRangeSelection, "Range selection mode enabled");
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);

		assert.ok(oList.getVisibleItems()[5].getSelected(), "Visible item at position 5 is selected");
		assert.ok(oList.getVisibleItems()[5] !== oListItem, "Invisible item is not selected via keyboard rangeSelection");

		oList.destroy();
	});

	QUnit.test("Keyboard range selection for non-selectable items", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			}),
			fnFireSelectionChangeEvent = this.spy(oList, "_fireSelectionChangeEvent"),
			oGroupHeaderListItem = new GroupHeaderListItem({title: "Grouped"});

		bindListData(oList, data3, "/items", createTemplateListItem());

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.insertItem(oGroupHeaderListItem, 3);
		await nextUIUpdate();

		oList.getVisibleItems()[1].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that oList._mRangeSelectionIndex object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");
		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(oList.getVisibleItems()[2].getSelected(), "Item at position 2 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(!oList.getVisibleItems()[3].getSelected(), "Item at position 3 is not selected via keyboard range selection as it is a sap.m.GroupHeaderListItem control");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event not fired");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(oList.getVisibleItems()[4].getSelected(), "Item at position 4 is selected via keyboard range selection");
		assert.equal(fnFireSelectionChangeEvent.callCount, 3, "selectionChange event fired");

		oList.destroy();
	});

	QUnit.test("Keyboard range selection - when range selection starts from a selected item, deselection should happen when direction changes", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			}),
			fnFireSelectionChangeEvent = this.spy(oList, "_fireSelectionChangeEvent");

		bindListData(oList, data3, "/items", createTemplateListItem());

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.getVisibleItems()[1].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);

		oList.getVisibleItems()[2].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);

		oList.getVisibleItems()[3].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);

		oList.getVisibleItems()[4].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);

		await nextUIUpdate();
		assert.equal(oList.getSelectedItems().length, 4, "4 items are selected");

		fnFireSelectionChangeEvent.resetHistory();

		// focus an already selected item
		oList.getVisibleItems()[2].focus();
		// trigger shift keydown so that oList._mRangeSelectionIndex object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");

		// range seletion item index
		assert.equal(oList._mRangeSelection.index, 2, "RangeSelection item index = 2");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(fnFireSelectionChangeEvent.notCalled, "action is selection and the item is already selected, then selectionChange event should not be fired");
		assert.equal(oList._mRangeSelection.direction, 1, "Direction of index stored in _mRangeSelection object");

		// trigger SHIFT + Arrow Down to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_DOWN", true, false, false);
		await nextUIUpdate();
		assert.ok(fnFireSelectionChangeEvent.notCalled, "action is selection and the item is already selected, then selectionChange event should not be fired");

		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "direction changed, so selectionChange event should be fired");
		assert.ok(!oList.getVisibleItems()[4].getSelected(), "Item at position 4 is deselected");

		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "direction changed, so selectionChange event should be fired");
		assert.ok(!oList.getVisibleItems()[3].getSelected(), "Item at position 3 is deselected");

		// trigger SHIFT + Arrow Up to perform range selection
		qutils.triggerKeydown(document.activeElement, "ARROW_UP", true, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "index of item and range selection item index matched, selection Cange no fired, item is already selected");
		assert.equal(oList._mRangeSelection.direction, -1, "Direction change updated in _mRangeSelection object");

		assert.equal(oList.getSelectedItems().length, 2, "2 items are selected in the list");

		oList.destroy();
	});

	QUnit.test("Mouse range selection", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			}),
			fnFireSelectionChangeEvent = this.spy(oList, "_fireSelectionChangeEvent");

		bindListData(oList, data3, "/items", createTemplateListItem());

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.getVisibleItems()[0].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.equal(fnFireSelectionChangeEvent.callCount, 1, "selectionChange event fired");

		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");

		let oCheckboxDomRef = oList.getVisibleItems()[9].getDomRef("selectMulti");
		qutils.triggerMouseEvent(oCheckboxDomRef, "tap");
		assert.equal(fnFireSelectionChangeEvent.callCount, 2, "selectionChange event fired");
		assert.equal(oList.getSelectedItems().length, 10, "10 items are selected using mouse range selection");

		// range deselection should be prevented and selection change should not be fired if the item is already selected
		fnFireSelectionChangeEvent.resetHistory();
		assert.ok(oList.getVisibleItems()[5].getSelected(), "item is already selected");
		oCheckboxDomRef = oList.getVisibleItems()[5].getDomRef("selectMulti");
		qutils.triggerMouseEvent(oCheckboxDomRef, "tap");
		assert.ok(oList.getVisibleItems()[5].getSelected(), "item is not deselected");

		oList.destroy();
	});

	QUnit.test("Mouse range selection with hidden items", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				items: [
					oListItemTemplate
				]
			});

		bindListData(oList, data3, "/items", createTemplateListItem());

		const aItems = oList.getItems();
		for (let i = 5; i <= 7; i++) {
			aItems[i].setVisible(false);
		}
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		aItems[4].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		const oCheckboxDomRef = aItems[8].getDomRef("selectMulti");
		qutils.triggerMouseEvent(oCheckboxDomRef, "tap");
		await nextUIUpdate();

		assert.strictEqual(oList.getSelectedItems().length, 2, "Invisible items are no selected");
		oList.destroy();
	});

	QUnit.test("Mouse range selection with hidden items with includeItemInSelection=true", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			});

		bindListData(oList, data3, "/items", createTemplateListItem());
		const aItems = oList.getItems();
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		aItems[4].focus();
		// select the item
		qutils.triggerMouseEvent(document.activeElement, "tap");
		await nextUIUpdate();

		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		qutils.triggerMouseEvent(aItems[8].getDomRef(), "tap");
		assert.strictEqual(oList.getSelectedItems().length, 5, "5 items selected also when the item was tapped with inckudeItemInSelection=true");
		oList.destroy();
	});

	QUnit.test("Do not create range seletion object when CTRL + SHIFT is pressed", async function(assert) {
		const oListItemTemplate = createListItem(),
			oList = new List({
				mode: library.ListMode.MultiSelect,
				includeItemInSelection: true,
				items: [
					oListItemTemplate
				]
			});

		bindListData(oList, data3, "/items", createTemplateListItem());

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.getVisibleItems()[0].focus();
		// select the item
		qutils.triggerKeydown(document.activeElement, "SPACE", false, false, false);
		await nextUIUpdate();
		assert.ok(oList.getVisibleItems()[0].getSelected(), "First item selected");

		// trigger shift + ctrlKey keydown
		qutils.triggerKeydown(document.activeElement, "", true, false, true);
		assert.notOk(oList._mRangeSelection, "rangeSelection object not created (SHIFT + CTRL)");

		// trigger shift + altKey keydown
		qutils.triggerKeydown(document.activeElement, "", true, true, false);
		assert.notOk(oList._mRangeSelection, "rangeSelection object not created (SHIFT + ALT)");

		// trigger shift + altKey + ctrlKey keydown
		qutils.triggerKeydown(document.activeElement, "", true, true, true);
		assert.notOk(oList._mRangeSelection, "rangeSelection object not created (SHIFT + ALT + CTRL)");

		// trigger shift keydown so that oList._mRangeSelection object is available
		qutils.triggerKeydown(document.activeElement, "", true, false, false);
		assert.ok(oList._mRangeSelection, "Range selection mode enabled");

		oList.destroy();
	});

	QUnit.module("Highlight", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("Highlight should be rendered", async function(assert) {
		const oLI = new StandardListItem({
			title: "Title of the item"
		}).placeAt("qunit-fixture");

		const fnTestHighlight = async function(sHighlight) {
			oLI.setHighlight(sHighlight);
			await nextUIUpdate();
			assert.ok(oLI.getDomRef().firstChild.classList.contains("sapMLIBHighlight"), "Highlight is rendered");
			assert.ok(oLI.getDomRef().firstChild.classList.contains("sapMLIBHighlight" + sHighlight), sHighlight + " Highlight is rendered");
		};

		const aHighlightColors = ["Error", "Warning", "Success", "Information", "Indication01", "Indication02", "Indication03", "Indication04", "Indication05"];
		for (let i = 0; i < aHighlightColors.length; i++) {
			await fnTestHighlight(aHighlightColors[i]);
		}

		oLI.setHighlight("None");
		await nextUIUpdate();
		assert.ok(!oLI.getDomRef().firstChild.classList.contains("sapMLIBHighlight"), "Highlight is not rendered");
		assert.ok(!oLI.getDomRef().firstChild.classList.contains("sapMLIBHighlightNone"), "No highlight class for None");

		oLI.setHighlight(null);
		assert.strictEqual(oLI.getHighlight(), "None", "Default for highlight is 'None'.");

		oLI.setHighlight();
		assert.strictEqual(oLI.getHighlight(), "None", "Default for highlight is 'None'.");

		assert.throws(function() {
			oLI.setHighlight("Nonsens");
		}, "Error thrown when invalid value is set for highlight property.");

		// clean up
		oLI.destroy();
	});

	QUnit.test("List should respect highlight changes", async function(assert) {

		const oListItem1 = new StandardListItem({
				title: "oListItem1"
			}),
			oListItem2 = new CustomListItem({
				highlight: "Warning"
			}),
			oList = new List({
				items: [oListItem1, oListItem2]
			});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is added");

		oListItem2.setHighlight("None");
		await nextUIUpdate();
		assert.ok(!oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is removed");

		oListItem1.setHighlight("Information");
		await nextUIUpdate();
		assert.ok(oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is added");

		oListItem1.setVisible(false);
		await nextUIUpdate();
		assert.ok(!oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is removed");

		oListItem1.setVisible(true);
		await nextUIUpdate();
		assert.ok(oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is removed");

		oListItem1.destroy();
		await nextUIUpdate();
		assert.ok(!oList.getDomRef("listUl").classList.contains("sapMListHighlight"), "Highlight class is removed");

		oList.destroy();
	});

	QUnit.module("Theming", {
		beforeEach: async function() {
			this.oListItem = new StandardListItem({
				title: "ListItem"
			});
			this.oList = new List({
				items: [this.oListItem]
			});

			this.oList.placeAt("qunit-fixture");
			await nextUIUpdate();

			this._iThreshold = QUnit.config.testTimeout;
			QUnit.config.testTimeout = 120000; // 2 min timeout to prevent issues with the multiple theme changes
		},
		afterEach: function() {
			this.oList.destroy();

			QUnit.config.testTimeout = this._iThreshold;
		}
	});

	QUnit.test("Delete Icon", function(assert) {
		const done = assert.async();

		const aThemes = ["sap_fiori_3", "sap_horizon", "sap_horizon_dark", "sap_horizon_hcb", "sap_horizon_hcw"];

		assert.expect(aThemes.length + 1);
		assert.ok(this.oListItem.getDeleteControl(true), "Delete Control exists.");

		const fnThemeChanged = (oEvent) => {
			const sTheme = oEvent.theme;
			let sExpectedIconType;

			switch (sTheme) {
				case "sap_horizon" :
				case "sap_horizon_dark" :
				case "sap_horizon_hcb" :
				case "sap_horizon_hcw" :
				case "sap_fiori_3" :
					sExpectedIconType = "sap-icon://decline";
					break;
				default : sExpectedIconType = "sap-icon://sys-cancel";
			}

			assert.equal(this.oListItem.getDeleteControl(true).getIcon(), sExpectedIconType, "Delete icon is correct for Theme " + sTheme);

			if (sTheme === aThemes.at(-1)) {
				Theming.detachApplied(fnThemeChanged);
				done();
			} else {
				const iPosition = aThemes.indexOf(sTheme);
				aThemes.splice(iPosition, 1);
				Theming.setTheme(aThemes[0]);
			}
		};

		Theming.attachApplied(fnThemeChanged);
	});

	QUnit.module("Navigated indicator", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("Navigated indicator should be rendered", async function(assert) {
		const oLI = new StandardListItem({
			title: "Title of the item"
		}).placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.notOk(oLI.$().find(".sapMLIBNavigated").length > 0, "navigated property is not enabled, hence class is not rendered");
		assert.equal(oLI.$().attr("aria-current"), undefined, "ARIA attribute aria-current is not set");

		oLI.setNavigated(true);
		await nextUIUpdate();
		assert.ok(oLI.$().find(".sapMLIBNavigated").length > 0, "navigated property is set correctly and class is also rendered");
		assert.ok(oLI.$().attr("aria-current"), "ARIA attribute aria-current is set");

		oLI.destroy();
	});

	QUnit.test("List should respect navigated changes", async function(assert) {
		const oListItem1 = new StandardListItem({
			title: "oListItem1"
		}),
		oListItem2 = new CustomListItem({
			highlight: "Warning"
		}),
		oList = new List({
			items: [oListItem1, oListItem2]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		assert.notOk(oList.getDomRef("listUl").classList.contains("sapMListNavigated"), "Navigated class is not added as navigated property is not enabled");
		assert.equal(oListItem1.$().attr("aria-current"), undefined, "ARIA attribute aria-current is not set");

		oListItem2.setNavigated(true);
		await nextUIUpdate();
		assert.ok(oList.getDomRef("listUl").classList.contains("sapMListNavigated"), "List informed to add navigated class");
		assert.ok(oListItem2.$().attr("aria-current"), "ARIA attribute aria-current is set");

		oListItem2.setNavigated(false);
		await nextUIUpdate();
		assert.notOk(oList.getDomRef("listUl").classList.contains("sapMListNavigated"), "Navigated class is removed, as non of the items are navigated");
		assert.equal(oListItem2.$().attr("aria-current"), undefined, "ARIA attribute aria-current is not set");

		oList.destroy();
	});

	QUnit.module("Accessibility", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("aria-labelledby association should only be in the DOM", async function(assert) {
		oList.placeAt("qunit-fixture");
		const oText1 = new Text({
			text: "text1"
		}).placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.addAriaLabelledBy(oText1);
		await nextUIUpdate();

		assert.ok(oList.getNavigationRoot().getAttribute("aria-labelledby") == oText1.getId(), "Accessibility info of text1 is in the list dom");

		oList.removeAriaLabelledBy(oText1);
		await nextUIUpdate();
		assert.ok(oList.getNavigationRoot().getAttribute("aria-labelledby") == null, "Accessibility info of text1 is removed from the dom");

		oText1.destroy();
	});

	QUnit.test("aria-labelledby should not contain same id multiple times", async function(assert) {
		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					id: "titleId",
					text: "Title"
				})
			]
		});
		const oText = new Text({
			id: "textId",
			text: "Text"
		}).placeAt("qunit-fixture");

		oList.addAriaLabelledBy("titleId");
		oList.addAriaLabelledBy("textId");
		oList.setHeaderToolbar(oHeaderToolbar);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const aAriaLabelledBy = oList.getNavigationRoot().getAttribute("aria-labelledby").split(" ");
		assert.strictEqual(aAriaLabelledBy.length, 2, "correct aria-labelledby ids added to the control DOM root");
		oText.destroy();
	});

	QUnit.test("group headers info of the item", async function(assert) {
		const oGroupHeader1 = new GroupHeaderListItem({
				title: "Group Header 1"
			}),
			oListItem1 = new StandardListItem({
				title: "List Item 1"
			}),
			oGroupHeader2 = new GroupHeaderListItem({
				title: "Group Header 2"
			}),
			oListItem2 = new StandardListItem({
				title: "List Item 2"
			}),
			oList = new List({
				items: [oGroupHeader1, oListItem1, oGroupHeader2, oListItem2]
			}).placeAt("qunit-fixture");

		await nextUIUpdate();

		oListItem1.focus();
		assert.ok(oListItem1.getAccessibilityInfo().description.indexOf(oGroupHeader1.getTitle()) > -1, "group headers info exist in the accessibility info of the item");

		oListItem2.focus();
		assert.ok(oListItem2.getAccessibilityInfo().description.indexOf(oGroupHeader2.getTitle()) > -1, "group headers info of the item matches with the correct group header");

		oList.destroy();
	});

	QUnit.test("highlight text of the item", async function(assert) {
		const oListItem1 = new StandardListItem({
			title: "Title of the item"
		}).placeAt("qunit-fixture");

		const fnTestHighlight = async function(sHighlight, sHighlightText, sExpectedHighlightText) {
			oListItem1.setHighlight(sHighlight);
			oListItem1.setHighlightText(sHighlightText);
			await nextUIUpdate();
			assert.ok(oListItem1.getAccessibilityInfo().description.indexOf(sExpectedHighlightText) > -1,
				"highlight text exists in the accessibility info of the item");
		};

		const aMessageTypes = ["Error", "Warning", "Success", "Information"];
		const aIndicationColors = ["Indication01", "Indication02", "Indication03", "Indication04", "Indication05"];

		// Default text
		for (const sMessageType of aMessageTypes) {
			const sDefaultText = Library.getResourceBundleFor("sap.m").getText("LIST_ITEM_STATE_" + sMessageType.toUpperCase());
			await fnTestHighlight(sMessageType, undefined, sDefaultText);
		}

		// Custom text
		for (const sIndicationColor of aMessageTypes.concat(aIndicationColors)) {
			await fnTestHighlight(sIndicationColor, "custom highlight text", "custom highlight text");
		}

		oListItem1.setHighlight("None");
		oListItem1.setHighlightText("custom highlight text");
		assert.ok(oListItem1.getAccessibilityInfo().description.indexOf("custom highlight text") === -1,
			"If the highlight is 'None', the highlight text does not exist in the accessibility info of the item");

		oListItem1.destroy();
	});

	QUnit.test("Internal control created by the ListBase should not be disabled by the EnabledPropagator", async function(assert) {
		const oListItem = new StandardListItem({
				title: "Foo",
				description: "Bar"
			}),
			oList = new List({
				mode: "MultiSelect",
				items: [oListItem]
			}),
			oVerticalLayout = new VerticalLayout({
				enabled: false,
				content: [oList]
			});

		oVerticalLayout.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oListItem.getMultiSelectControl().getEnabled(), true, "MultiSelect Checkbox was not disabled by the EnabledPropagator");

		oList.setMode("SingleSelect");
		await nextUIUpdate();
		assert.strictEqual(oListItem.getSingleSelectControl().getEnabled(), true, "SingleSelect RadioButton was not disabled by the EnabledPropagator");

		oList.setMode("SingleSelectLeft");
		await nextUIUpdate();
		assert.strictEqual(oListItem.getSingleSelectControl().getEnabled(), true, "SingleSelectLeft RadioButton was not disabled by the EnabledPropagator");

		oList.setMode("Delete");
		await nextUIUpdate();
		assert.strictEqual(oListItem.getDeleteControl().getEnabled(), true, "Delete button was not disabled by the EnabledPropagator");

		oListItem.setType("Detail");
		await nextUIUpdate();
		assert.strictEqual(oListItem.getDetailControl().getEnabled(), true, "Detail button was not disabled by the EnabledPropagator");

		oVerticalLayout.destroy();
	});

	QUnit.test("Accessibility Text for Standard List Item", function(assert) {
		const oListItem = new StandardListItem({
			title: "Title",
			description: "Description"
		});

		bindListData(oList, data3, "/items", oListItem);
		const oBundle = Library.getResourceBundleFor("sap.m");

		oList.setMode("None");
		let sStates = oList.getAccessibilityStates();
		assert.strictEqual(sStates, "", "No Punctuation added since no text available");

		oList.setMode("MultiSelect");
		sStates = oList.getAccessibilityStates();
		assert.strictEqual(sStates, oBundle.getText("LIST_MULTISELECTABLE") + " . ", "Punctuation added to Multi SelectMode");

		oList.setMode("Delete");
		sStates = oList.getAccessibilityStates();
		assert.strictEqual(sStates, oBundle.getText("LIST_DELETABLE") + " . ", "Punctuation added to Delete mode");

		oList.setMode("SingleSelect");
		assert.strictEqual(oList.getAccessibilityStates(), oBundle.getText("LIST_SELECTABLE") + " . ", "Punctuation added to mode None");

		const oSorter = new Sorter("items", false, function(oContext){
			return oContext.getProperty("items"); // group by first letter of Name
		});

		oList.getBinding("items").sort(oSorter);
		oList.setMode("MultiSelect");
		assert.strictEqual(oList.isGrouped(), true, "Grouping enabled");
		assert.strictEqual(oList.getAccessibilityStates(), oBundle.getText("LIST_MULTISELECTABLE") + " . " + oBundle.getText("LIST_GROUPED") + " . ", "Punctuation added to Multi SelectMode");

		assert.strictEqual(oList.getItems()[0].getAccessibilityInfo().description, "Title . Description . Not Selected",  "Content annoucement for Standard List Item with Punctuation" );
		oListItem.setSelected(true);
		oListItem.setHighlight("Information");
		oListItem.setNavigated(true);
		oListItem.setType("Active");
		assert.strictEqual(oListItem.getAccessibilityInfo().description,oBundle.getText("LIST_ITEM_SELECTED") + " . " + oListItem.getHighlight() + " . " + oBundle.getText("LIST_ITEM_ACTIVE") + " . " + "Title . Description",  "Content announcement for Standard List Item with Punctuation" );
	});

	QUnit.test("ListItem aria-labelledby reference to Accessibility Text", async function(assert) {
		const oList = new List({
			items: [
				new StandardListItem({
					title: "Title",
					description: "Description",
					ariaLabelledBy: "test"
				})
			]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oItem = oList.getItems()[0];
		const oInvisibleText = ListBase.getInvisibleText();

		assert.equal(oItem.getDomRef().getAttribute("aria-labelledby"), "test", "aria-labelledby is correct");
		oItem.$().trigger("focusin");
		assert.equal(oItem.getDomRef().getAttribute("aria-labelledby"), "test " + oInvisibleText.getId(), "reference to invisible text is added on focusin");
		oItem.$().trigger("focusout");
		assert.equal(oItem.getDomRef().getAttribute("aria-labelledby"), "test", "reference to invisible text is removed on focusout");
	});

	QUnit.test("Accessibility Text for Input List Item", function(assert) {
		const oInputListItem = new InputListItem({
			title: "Title",
			label: "Label",
			content : new Input({
				value: "Content"
			})
		});
		const oBundle = Library.getResourceBundleFor("sap.m");

		oInputListItem.setSelected(true);
		oInputListItem.setHighlight("Information");
		oInputListItem.setNavigated(true);
		oInputListItem.setType("Active");
		assert.strictEqual(oInputListItem.getAccessibilityInfo().description,oBundle.getText("LIST_ITEM_SELECTED") + " . " + oInputListItem.getHighlight() + " . " + oBundle.getText("LIST_ITEM_ACTIVE") + " . " + "Label . Input Content",  "Content announcement for Standard List Item with Punctuation" );
	});

	QUnit.test("test content announcement update after selection changes", async function(assert) {
		const oList = new List({
			mode: "MultiSelect",
			items: [
				new StandardListItem({
					title: "Title",
					description: "Description"
				})
			]
		});

		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oItem = oList.getItems()[0],
			oRb = Library.getResourceBundleFor("sap.m"),
			fnInvisibleMessageAnnounce = sinon.spy(InvisibleMessage.prototype, "announce");

		// item is focused
		oItem.focus();
		assert.ok(document.getElementById(document.activeElement.getAttribute("aria-labelledby")).innerHTML.indexOf(oRb.getText("LIST_ITEM_NOT_SELECTED")) > -1, "'Not Selected', is added to the acc text");
		qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE);
		await nextUIUpdate();
		assert.ok(fnInvisibleMessageAnnounce.calledWith(oRb.getText("LIST_ITEM_SELECTED"), "Assertive"), "InvisibleMessage#announce method called with 'Selected' & 'Assertive'");

		fnInvisibleMessageAnnounce.resetHistory();

		// selection control is focused
		oItem._oMultiSelectControl.focus();
		qutils.triggerKeydown(document.activeElement, KeyCodes.SPACE);
		await nextUIUpdate();
		assert.ok(fnInvisibleMessageAnnounce.notCalled, "InvisibleMessage#announce method not called, since focused element is the selection control");

		fnInvisibleMessageAnnounce.restore();
		oList.destroy();
	});

	QUnit.test("InputListItem: inner control should have ariaLabelledBy association", async function(assert) {
		const oInputListItem = new InputListItem({
			label: "Label",
			content : [
				new Input({
					value: "Content"
				}),
				new VBox({
					items: [
						new Input({
							value: "value"
						})
					]
				})
			]
		});

		oList.addItem(oInputListItem);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();
		const oControl = oInputListItem.getContent()[0];
		const oControl1 = oInputListItem.getContent()[1];

		assert.ok(oControl.addAriaLabelledBy, "Control has ariaLabelledBy association");
		assert.strictEqual(oControl.getDomRef("inner").getAttribute("aria-labelledby"), oInputListItem.getId() + "-label", "aria-lablledBy is added to the control");
		assert.notOk(oControl1.addAriaLabelledBy, "Control does not have ariaLabelledBy association");
		assert.notOk(oControl1.getDomRef().getAttribute("aria-labelledby"), "aria-lablledBy is not added to the control" );
	});

	QUnit.test("CustomListItem - custom accessibility annoucement", async function(assert) {
		const oCLI = new CustomListItem({
			content: new Text({
				text: "Hello world"
			})
		});

		oList.addItem(oCLI);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.notOk(oCLI.getAccDescription(), "accDescription is not defined by default");
		assert.strictEqual(oCLI.getContentAnnouncement(), "Hello world", "Default accessibility annoucement returned");

		oCLI.setAccDescription("Foo Bar");
		assert.strictEqual(oCLI.getAccDescription(), "Foo Bar", "accDescription property updated");
		assert.strictEqual(oCLI.getContentAnnouncement(), "Foo Bar", "custom accessilbility announcement returned");
	});

	QUnit.test("Aria-LabelledBy to selection control", async function(assert) {
		const oListItem = new StandardListItem({
			type: "Active",
			title: "Hello World"
		});

		oList.setMode("MultiSelect");
		oList.addItem(oListItem);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		let sSelectionItemId = oListItem._oMultiSelectControl.getAriaLabelledBy();
		assert.strictEqual(Element.getElementById(sSelectionItemId).getText(), "Item Selection", "MultiSelect associated with aria-labelledBy");

		oList.setMode("SingleSelectLeft");
		await nextUIUpdate();
		sSelectionItemId = oListItem._oMultiSelectControl.getAriaLabelledBy();
		assert.strictEqual(Element.getElementById(sSelectionItemId).getText(), "Item Selection", "Invisible text added to Static area");
	});

	QUnit.test("Events when multiSelectMode property is changed", async function(assert) {
		bindListData(oList, data2, "/items", createTemplateListItem());
		oList.setMode("MultiSelect");
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.strictEqual(oList.getItems().length, 3, "List has exactly 3 items");
		oList.selectAll();
		assert.strictEqual(oList.getSelectedItems().length, 3, "multiSelectMode: Default, selectAll API is enabled");
		oList.removeSelections();
		oList.getItems()[0].focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true});
		assert.strictEqual(oList.getSelectedItems().length, 3, "multiSelectMode: Default, Items are selected when 'ctrl+A' is pressed");

		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true});
		assert.notOk(oList.getSelectedItems().length, "multiSelectMode: Default, Items are deselected when 'ctrl+A' is pressed again");

		oList.setMultiSelectMode("ClearAll");
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oList.getItems()[0].focus();
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true});
		assert.notOk(oList.getSelectedItems().length, "multiSelectMode: ClearAll, Items are not selected when 'ctrl+A' is pressed");
		oList.getItems()[0].setSelected(true);
		qutils.triggerEvent("keydown", document.activeElement, {code: "KeyA", ctrlKey: true, shiftKey: true});
		assert.notOk(oList.getSelectedItems().length, "multiSelectMode: ClearAll, Items are deselected when 'ctrl+shift+A' is pressed");
		oList.selectAll();
		assert.notOk(oList.getSelectedItems().length, "multiSelectMode: ClearAll, selectAll API is disabled");
	});

	QUnit.test("Accessibility announcement for role='list'", async function(assert) {
		const oSLI = new StandardListItem({
			title: "Title",
			description: "Description"
		});
		oList.addItem(oSLI);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oSLI.focus();
		const $SLI = oSLI.$();
		const oRb = Library.getResourceBundleFor("sap.m");
		const oCustomAnnouncement = document.getElementById($SLI.attr("aria-labelledby")),
			aTexts = oCustomAnnouncement.innerText.split(" . ");
		assert.ok(aTexts.indexOf(oRb.getText("ACC_CTR_TYPE_LISTITEM")) !== -1, "Type info is added to custom announcement for compatibility reasons");
	});

	QUnit.test("Accessibility announcement for role='listbox'", async function(assert) {
		const oSLI = new StandardListItem({
			title: "Title",
			description: "Description"
		});
		oList.addItem(oSLI);
		oList.applyAriaRole("listbox");
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		oSLI.focus();
		const $SLI = oSLI.$();
		const oRb = Library.getResourceBundleFor("sap.m");
		const oCustomAnnouncement = document.getElementById($SLI.attr("aria-labelledby")),
			aTexts = oCustomAnnouncement.innerText.split(" . ");
		assert.ok(aTexts.indexOf(oRb.getText("ACC_CTR_TYPE_LISTITEM")) === -1, "Type info is not added to custom announcement since Jaws also does not announce the role option");
	});

	QUnit.test("Grouping behavior with role='list'", async function(assert) {
		const oList = new List();
		bindListData(oList, data5, "/items", createListItem);
		const oSorter = new Sorter({
			path: "Key",
			descending: false,
			group: function(oContext) {
				return oContext.getProperty("Key");
			}
		});
		oList.placeAt("qunit-fixture");

		const oBinding = oList.getBinding("items");
		oBinding.sort(oSorter);
		await nextUIUpdate();
		assert.ok(oBinding.isGrouped(), "list is grouped");

		const aGroupHeaderListItems = oList.getVisibleItems().filter(function(oItem) {
			return oItem.isGroupHeader();
		});

		const oRb = Library.getResourceBundleFor("sap.m");

		aGroupHeaderListItems.forEach(function(oGroupItem) {
			const $GroupItem = oGroupItem.$();
			assert.strictEqual($GroupItem.attr("role"), "group", "Group header has role='group'");
			assert.strictEqual($GroupItem.attr("aria-label"), oGroupItem.getTitle(), "correct aria-label is set");
			assert.strictEqual($GroupItem.attr("aria-roledescription"), oRb.getText("LIST_ITEM_GROUP_HEADER"), "correct aria-roledescription assigned");
			assert.notOk($GroupItem.attr("aria-posinset"), "aria-posinset attribute not added to groupHeader");
			assert.notOk($GroupItem.attr("aria-setsize"), "aria-setsize attribute not added to groupHeader");
			assert.ok($GroupItem.attr("aria-owns"), "aria-owns attribute added to Group Headers");
			assert.ok(oGroupItem.getGroupedItems().length, "GroupHeader contains the mapped list items");
			oGroupItem.getGroupedItems().forEach(function(sId) {
				assert.ok($GroupItem.attr("aria-owns").indexOf(sId) > -1, "mapped items are set to aria-owns attribute");
			});
		});

		oList.destroy();
	});

	QUnit.module("Context Menu", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("Context Menu", async function(assert) {
		const fnInvalidate = this.spy(oList, "invalidate");

		// list should not be invalidated for setContextMenu
		fnInvalidate.resetHistory();
		oList.setContextMenu(new Menu({
		items: [
			new MenuItem({text: "{Title}"})
		]}));
		assert.ok(!fnInvalidate.called, "List is not invalidated when the contextMenu aggregation is set");

		const oMenu = oList.getContextMenu();
		const fnOpenAsContextMenu = this.spy(oMenu, "openAsContextMenu");


		bindListData(oList, data4, "/items", createTemplateListItem());
		oPage.addContent(oList);
		await nextUIUpdate();
		assert.ok(oList.getContextMenu(), "ContextMenu was set correctly");

		const oItem = oList.getItems()[0];
		oItem.focus();
		oItem.$().trigger("contextmenu");
		assert.equal(fnOpenAsContextMenu.callCount, 1, "Menu#OpenAsContextMenu is called");
		oMenu.close();

		// list should not be invalidated for destroyContextmenu
		fnInvalidate.resetHistory();
		oList.destroyContextMenu();
		assert.ok(!fnInvalidate.called, "List is not invalidated when the contextMenu aggregation is destroyed");

		//clean up
		oMenu.destroy();
	});

	QUnit.test("Test context menu on interactive control", async function(assert) {
		const oInput = new Input();
		const oListItem = new InputListItem({
			label: "Input",
			content : oInput,
			type: "Navigation"
		});
		const oList = new List({
			mode: "MultiSelect",
			items : [oListItem],
			contextMenu : new Menu({
				items: [
					new MenuItem({text: "ContextMenu"})
				]
			})
		});

		const oMenu = oList.getContextMenu();
		const fnOpenAsContextMenu = this.spy(oMenu, "openAsContextMenu");

		oPage.addContent(oList);
		await nextUIUpdate();

		const $input = oInput.$("inner").trigger("focus");
		$input.trigger("contextmenu");
		assert.equal(fnOpenAsContextMenu.callCount, 0, "Menu#OpenAsContextMenu is not called");

		oListItem.getMultiSelectControl().focus();
		oListItem.getMultiSelectControl().$().trigger("contextmenu");
		assert.equal(fnOpenAsContextMenu.callCount, 1, "Menu#OpenAsContextMenu is called");
		oMenu.close();

		oList.setMode("SingleSelectLeft");
		await nextUIUpdate();

		oListItem.getSingleSelectControl().focus();
		oListItem.getSingleSelectControl().$().trigger("contextmenu");
		assert.equal(fnOpenAsContextMenu.callCount, 2, "Menu#OpenAsContextMenu is called again");
		oMenu.close();

		// clean up
		oMenu.destroy();
		oList.destroy();
	});

	QUnit.module("Text Selection", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("No press event on text selection", async function(assert) {
		const oListItem = new StandardListItem({
			type: "Active",
			title: "Hello World",
			press: function(e) {
				MessageToast.show("Item Pressed");
			}
		});

		oList.addItem(oListItem);
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const fnPress = this.spy(oListItem, "firePress");
		oListItem.focus();
		let bHasSelection;
		this.stub(window, "getSelection").callsFake(function() {
			return {
				toString: function() {
					return bHasSelection ? "Hello World" : "";
				},
				focusNode: oListItem.getDomRef("content").firstChild
			};
		});

		bHasSelection = true;
		assert.equal(window.getSelection().toString(), "Hello World");
		oListItem.$().trigger("tap");
		assert.ok(!fnPress.called, "Press event not fired");

		bHasSelection = false;
		assert.equal(window.getSelection().toString(), "");
		oListItem.$().trigger("tap");
		await timeout();

		assert.ok(fnPress.called, "Press event fired");
	});

	QUnit.module("ListBase sticky feature", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("Sticky support", async function(assert) {
		// stub for Chrome
		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});
		const oList = new List({
			headerText: "List Header",
			sticky: ["HeaderToolbar"],
			items: [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		assert.ok(oList.getDomRef().classList.contains("sapMSticky"), "Sticky style class added");
		assert.ok(oList.getDomRef().classList.contains("sapMSticky1"), "Sticky style class added");

		oList.destroy();
	});

	QUnit.test("Sticky ColumnHeaders should not be possible with List", async function(assert) {
		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});
		const oList = new List({
			headerText: "List Header",
			sticky: ["ColumnHeaders"],
			items: [oStdLI]
		});
		oList.placeAt("qunit-fixture");
		await nextUIUpdate();

		const aClassList = oList.getDomRef().classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky4"), "Sticky column headers is not supported with List");

		oList.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky infoToolbar", async function(assert) {
		this.stub(Device.system, "desktop").value(false);

		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const oStdLI2 = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const sut = new List({
			headerText: "List Header",
			items: [oStdLI, oStdLI2]
		});

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		sut.setInfoToolbar(oInfoToolbar);
		oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["InfoToolbar"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky class added for sticky infoToolbar only");

		sut.getInfoToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky2"), "Sticky classes removed");

		sut.getInfoToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky classes added");

		const oInfoToolbarContainer = oInfoToolbar.$().parent()[0];

		assert.ok(oInfoToolbarContainer.classList.contains("sapMListInfoTBarContainer"), "infoToolbar container div rendered");

		this.stub(oInfoToolbarContainer, "getBoundingClientRect").callsFake(function() {
			return {
				bottom: 72,
				height: 32
			};
		});

		const oFocusedItem = sut.getItems()[1];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(window, "requestAnimationFrame").callsFake(window.setTimeout);
		this.stub(oFocusedItemDomRef, "getBoundingClientRect").callsFake(function() {
			return {
				top: 70
			};
		});

		oFocusedItemDomRef.focus();
		await timeout();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -32], true), "scrollToElement function called");

		oScrollContainer.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky headerToolbar", async function(assert) {
		this.stub(Device.system, "desktop").value(false);

		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const oStdLI2 = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const sut = new List({
			items: [oStdLI, oStdLI2]
		});

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		sut.setHeaderToolbar(oHeaderToolbar);
		oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["HeaderToolbar"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky class added for sticky headerToolbar only");

		sut.getHeaderToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky1"), "Sticky classes removed as no element is sticky");

		sut.getHeaderToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky1"), "Sticky classes added");

		const oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
		const fnGetDomRef = sut.getDomRef;
		this.stub(oHeaderDomRef, "getBoundingClientRect").callsFake(function() {
			return {
				bottom: 88,
				height: 48
			};
		});

		this.stub(sut, "getDomRef").callsFake(function() {
			return {
				querySelector: function() {
					return oHeaderDomRef;
				}
			};
		});

		const oFocusedItem = sut.getItems()[1];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(window, "requestAnimationFrame").callsFake(window.setTimeout);
		this.stub(oFocusedItemDomRef, "getBoundingClientRect").callsFake(function() {
			return {
				top: 80
			};
		});

		oFocusedItemDomRef.focus();
		await timeout();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -48], true), "scrollToElement function called");

		// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
		sut.getDomRef = fnGetDomRef;

		oScrollContainer.destroy();
	});

	QUnit.test("Focus and scroll handling with sticky headerToolbar and infoToolbar", async function(assert) {
		this.stub(Device.system, "desktop").value(false);

		const oStdLI = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const oStdLI2 = new StandardListItem({
			title : "Title",
			info : "+359 1234 567",
			infoTextDirection: coreLibrary.TextDirection.LTR
		});

		const sut = new List({
			items: [oStdLI, oStdLI2]
		});

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		sut.setHeaderToolbar(oHeaderToolbar);

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		sut.setInfoToolbar(oInfoToolbar);

		oScrollContainer = new ScrollContainer({
			vertical: true,
			content: sut
		});
		sut.setSticky(["HeaderToolbar", "InfoToolbar"]);
		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		let aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky3"), "Sticky class added for sticky headerToolbar and infoToolbar");

		sut.getHeaderToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky2"), "Sticky class updated for sticky infoToolbar");

		sut.getInfoToolbar().setVisible(false);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(!aClassList.contains("sapMSticky") && !aClassList.contains("sapMSticky1") && !aClassList.contains("sapMSticky2"), "No sticky classes present");

		sut.getHeaderToolbar().setVisible(true);
		sut.getInfoToolbar().setVisible(true);
		await nextUIUpdate();
		aClassList = sut.$()[0].classList;
		assert.ok(aClassList.contains("sapMSticky") && aClassList.contains("sapMSticky3"), "Sticky class added for sticky headerToolbar, infoToolbar and column headers");

		const oHeaderDomRef = sut.getDomRef().querySelector(".sapMListHdr");
		const fnGetDomRef = sut.getDomRef;
		this.stub(oHeaderDomRef, "getBoundingClientRect").callsFake(function() {
			return {
				bottom: 48,
				height: 48
			};
		});

		const oInfoToolbarContainer = oInfoToolbar.$().parent()[0];
		this.stub(oInfoToolbarContainer, "getBoundingClientRect").callsFake(function() {
			return {
				bottom: 80,
				height: 32
			};
		});

		const oFocusedItem = sut.getItems()[1];
		const oFocusedItemDomRef = oFocusedItem.getDomRef();
		const fnScrollToElementSpy = sinon.spy(oScrollContainer.getScrollDelegate(), "scrollToElement");

		this.stub(window, "requestAnimationFrame").callsFake(window.setTimeout);
		this.stub(oFocusedItemDomRef, "getBoundingClientRect").callsFake(function() {
			return {
				top: 40
			};
		});

		oFocusedItemDomRef.focus();
		await timeout();

		assert.ok(fnScrollToElementSpy.calledWith(oFocusedItemDomRef, 0, [0, -80], true), "scrollToElement function called");

		// restore getDomRef() to avoid error caused when oScrollContainer is destroyed
		sut.getDomRef = fnGetDomRef;

		oScrollContainer.destroy();
	});


	QUnit.test("Focus and scroll handling with sticky headerToolbar and focus on input control", async function(assert) {
		function isElementVisible(oListItem, oViewData) {
			const oListItemRect = oListItem.getBoundingClientRect();
			if (oListItemRect.top >= oViewData.iStartView && (oListItemRect.top + oListItemRect.height) <= oViewData.iEndView) {
				return true;
			}

			return false;
		}

		const aStdLI = [];
		for (let i = 0; i < 10; i++) {
			aStdLI.push({
				title: `Address${i}`
			});
		}

		var oList = new List({
			items: {
				path: "/items",
				template:   new InputListItem({
					content : new Input()
				})
			},
			sticky: ["HeaderToolbar"]
		}).setModel(new JSONModel({
			items: aStdLI
		}));

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text: "Sticky Handling Test Page"
				})
			]
		});

		oList.setHeaderToolbar(oHeaderToolbar);

		const oPage2 = new Page({
				content: [oList]
			});

		const oApp2 = new App({
			pages: [oPage2],
			height: "400px"
		});

		oApp2.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oAppRect = oApp2.getDomRef().getBoundingClientRect();
		const oViewData = {
			iStartView: oList.getVisibleItems()[0].getDomRef().getBoundingClientRect().top,
			iEndView: (oAppRect.top + oAppRect.height)
		};

		assert.notOk(isElementVisible(oList.getItems()[9].getDomRef(), oViewData), "Item is not visible");
		assert.ok(isElementVisible(oList.getItems()[0].getDomRef(), oViewData), "Item is visible");

		//focus element 8, which puts element 0 out of view
		oList.getItems()[8].focus();
		await timeout(100);

		assert.notOk(isElementVisible(oList.getItems()[0].getDomRef(), oViewData), "Item 0 is not visible anymore");
		assert.ok(isElementVisible(oList.getItems()[8].getDomRef(), oViewData), "Item 8 is visible");

		oList.getItems()[0].focus();
		await timeout(100);
		assert.ok(isElementVisible(oList.getItems()[0].getDomRef(), oViewData), "Item 0 is visible after focus");
		assert.notOk(isElementVisible(oList.getItems()[6].getDomRef(), oViewData), "Item 6 is not fully visible");

		oList.getItems()[6].focus();
		await timeout(100);

		assert.ok(isElementVisible(oList.getItems()[6].getDomRef(), oViewData), "Item 6 is fully visible after focus");
	});

	QUnit.test("Function _getStickyAreaHeight", async function(assert) {
		const aListItems = [];

		for (let i = 0; i < 25; i++) {
			aListItems.push(createListItem());
		}

		const oList = new List({
			items: aListItems
		});

		const oHeaderToolbar = new Toolbar({
			content: [
				new Title({
					text : "Keyboard Handling Test Page"
				}),
				new ToolbarSpacer(),
				new Button({
					tooltip: "View Settings",
					icon: "sap-icon://drop-down-list"
				})
			]
		});

		const oInfoToolbar = new Toolbar({
			active: true,
			content: [
				new Text({
					text : "The quick brown fox jumps over the lazy dog.",
					wrapping : false
				})
			]
		});

		oList.setHeaderToolbar(oHeaderToolbar);
		oList.setInfoToolbar(oInfoToolbar);

		oScrollContainer = new ScrollContainer({
			vertical: true,
			content: oList
		});

		oScrollContainer.placeAt("qunit-fixture");
		await nextUIUpdate();

		const iHeaderToolbarHeight = (oList.getHeaderToolbar() && oList.getHeaderToolbar().getDomRef() || this.getDomRef("header")).offsetHeight;
		const iInfoToolbarHeight = oList.getInfoToolbar().getDomRef().offsetHeight;

		assert.notOk((oList.getSticky() && oList.getSticky().length), "No sticky applied");
		assert.equal(oList._getStickyAreaHeight(), 0, "Zero height for no sticky elements");

		oList.setSticky(["HeaderToolbar"]);
		assert.equal(oList.getSticky().length, 1, "One sticky element");
		assert.notEqual(oList._getStickyAreaHeight(), 0, "Height of sticky elements > 0");
		assert.equal(oList._getStickyAreaHeight(), iHeaderToolbarHeight, "Correct height returned");

		oList.setSticky(["InfoToolbar"]);
		assert.equal(oList.getSticky().length, 1, "One sticky element");
		assert.notEqual(oList._getStickyAreaHeight(), 0, "Height of sticky elements > 0");
		assert.equal(oList._getStickyAreaHeight(), iInfoToolbarHeight, "Correct height returned");

		oList.setSticky(["HeaderToolbar", "InfoToolbar"]);
		assert.equal(oList.getSticky().length, 2, "Two sticky elements");
		assert.notEqual(oList._getStickyAreaHeight(), 0, "Height of sticky elements > 0");
		assert.equal(oList._getStickyAreaHeight(), iHeaderToolbarHeight + iInfoToolbarHeight, "Correct height returned");
	});

	QUnit.module("Dependents Plugins", {
		beforeEach: function() {
			oList = new List();
		},
		afterEach: function() {
			oList.destroy();
		}
	});

	QUnit.test("DataStateIndicator Plugin Support", function(assert) {
		try {
			new ListBase({
				dependents: new DataStateIndicator()
			});
			assert.ok(true, "ListBase supports DataStateIndicator plugin");
		} catch (e) {
			assert.ok(false, "ListBase does not support DataStateIndicator plugin");
		}
	});

	QUnit.module("No data aggregation", {
		beforeEach: async function() {
			oList = new List({});
			oPage.addContent(oList);
			await nextUIUpdate();
		},
		afterEach: function() {
			oPage.removeAllContent();
			oList.destroy();
		}
	});

	QUnit.test("No Data Illustrated Message", async function(assert) {
		const oMessage = new IllustratedMessage("nodataIllustratedMessage", {
			illustrationType: library.IllustratedMessageType.NoSearchResults,
			title: "Custom Title",
			description: "This is a custom description."
		});
		oList.setNoData(oMessage);
		await nextUIUpdate();

		const $noDataText = oList.$("nodata-text");
		const $noData = oList.$("nodata");

		assert.ok(oList.getNoData().isA("sap.m.IllustratedMessage"));
		assert.strictEqual($noDataText.children().get(0), Element.getElementById("nodataIllustratedMessage").getDomRef(), "List contains figure's DOM element");

		$noData.focus();
		const sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Illustrated Message Custom Title. This is a custom description.", "Accessbility text is set correctly");

		oList.setEnableBusyIndicator(true);
		oList._showBusyIndicator();
		await timeout(1000);

		assert.ok(oList.getBusy(), "List is set to busy");
		assert.strictEqual($noDataText.children().get(0), Element.getElementById("nodataIllustratedMessage").getDomRef(), "Busy indicator does not clear illustrated message");

		oList._hideBusyIndicator();
		await nextUIUpdate();

		assert.notOk(oList.getBusy(), "List is not set to busy");
		assert.strictEqual($noDataText.children().get(0), Element.getElementById("nodataIllustratedMessage").getDomRef(), "List contains figure's DOM element after busy indicator hidden");

		oList.setNoDataText("Test");
		assert.strictEqual($noDataText.children().get(0), Element.getElementById("nodataIllustratedMessage").getDomRef(), "List contains figure's DOM element");

		oMessage.destroy();
	});

	QUnit.test("No Data String", async function(assert) {
		const sNoData = "No data Example";
		oList.setNoData(sNoData);
		await nextUIUpdate();

		const $noDataText = oList.$("nodata-text");
		const $noData = oList.$("nodata");

		assert.strictEqual(typeof oList.getNoData(), "string", "No data aggregation is of type string");
		assert.strictEqual($noDataText.text(), sNoData, "List contains correct no data string");

		$noData.focus();
		const sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), sNoData, "Accessbility text is set correctly");

		oList.setNoDataText("Test");
		assert.strictEqual($noDataText.text(), sNoData, "List contains correct button");
	});

	QUnit.test("No Data Control", async function(assert) {
		let oControl = new Button({text: "Button 1"});
		oList.setNoData(oControl);
		await nextUIUpdate();

		const $noDataText = oList.$("nodata-text");
		const $noData = oList.$("nodata");

		assert.ok(oList.getNoData().isA("sap.m.Button"), "No data aggregation is a sap.m.Button");
		assert.equal(oList.getNoData().getText(), "Button 1", "Correct button text");
		assert.strictEqual($noDataText.children().get(0), oControl.getDomRef(), "List contains correct button");

		$noData.focus();
		let sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Button Button 1", "Accessbility text is set correctly");

		oList.setNoDataText("Test");
		assert.strictEqual($noDataText.children().get(0), oControl.getDomRef(), "List contains correct button");

		oControl = new Text({text: "Text 1"});
		oList.setNoData(oControl);
		await nextUIUpdate();

		assert.ok(oList.getNoData().isA("sap.m.Text"), "No data aggregation is a sap.m.Text");
		assert.equal(oList.getNoData().getText(), "Text 1", "Text control's text is set correctly");
		assert.strictEqual($noDataText.children().get(0), oControl.getDomRef(), "List contains correct text control");

		$noData.focus();
		sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Text 1", "Accessbility text is set correctly");

		oList.setNoData();
		await nextUIUpdate();

		assert.notOk(oList.getNoData(), "No data aggregation is empty");
		assert.strictEqual($noDataText.text(), "Test", "List contains correct text");

		$noData.focus();
		sLabelledBy = $noData.attr("aria-labelledby");
		assert.equal(Element.getElementById(sLabelledBy).getText(), "Test", "Accessbility text is set correctly");
	});
}
);
