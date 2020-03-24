/*global QUnit, sinon */
/*eslint no-undef:1, no-unused-vars:1, strict: 1 */
sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/FacetFilter",
	"sap/m/FacetFilterList",
	"sap/ui/model/Filter",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/m/Popover",
	"sap/m/FacetFilterItem",
	"sap/ui/core/IconPool",
	"sap/m/Page",
	"sap/m/ListItemBase",
	"sap/ui/events/jquery/EventExtension",
	"sap/ui/model/Sorter",
	"sap/m/HBox",
	"sap/ui/core/InvisibleText",
	"sap/ui/base/EventProvider",
	"sap/m/GroupHeaderListItem",
	"sap/ui/qunit/utils/waitForThemeApplied",
	"jquery.sap.keycodes"
], function(
	qutils,
	createAndAppendDiv,
	FacetFilter,
	FacetFilterList,
	Filter,
	mobileLibrary,
	JSONModel,
	jQuery,
	Device,
	Popover,
	FacetFilterItem,
	IconPool,
	Page,
	ListItemBase,
	EventExtension,
	Sorter,
	HBox,
	InvisibleText,
	EventProvider,
	GroupHeaderListItem,
	waitForThemeApplied
) {
	"use strict";

	// shortcut for sap.m.ToolbarDesign
	var ToolbarDesign = mobileLibrary.ToolbarDesign;

	// shortcut for sap.m.ButtonType
	var ButtonType = mobileLibrary.ButtonType;

	// shortcut for sap.m.ListType
	var ListType = mobileLibrary.ListType;

	// shortcut for sap.m.PlacementType
	var PlacementType = mobileLibrary.PlacementType;

	// shortcut for sap.m.FacetFilterListDataType
	var FacetFilterListDataType = mobileLibrary.FacetFilterListDataType;

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = mobileLibrary.FacetFilterType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);



	//	if(navigator.userAgent.indexOf("MSIE") === -1) {


	QUnit.module("Control Design");

	QUnit.test("Aggregations", function(assert) {

		// The aggregations below are created programatically by FacetFilter when it is initialized, so make sure they are created.
		var oFF = new FacetFilter("someid");
		oFF.setShowPersonalization(true);
		oFF.addList(new FacetFilterList("list1"));
		oFF.addList(new FacetFilterList("list2"));
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oFF.getLists().length, 2, "There should be two lists in the 'lists' aggregation");
		assert.ok(oFF.getAggregation("addFacetButton"), "Add facet button aggregation should be created");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");
		assert.ok(oFF.getAggregation("summaryBar"), "The summary bar aggregation should be created");
		destroyFF(oFF);

		// Now make sure we can create a new FF using the same IDs.  This will fail if any of the aggregated controls are is not destroyed properly.
		var oFF = new FacetFilter("someid");
		oFF.setShowPersonalization(true);
		oFF.addList(new FacetFilterList("list1"));
		oFF.addList(new FacetFilterList("list2"));
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		destroyFF(oFF);
	});


	QUnit.test("Aggreations: list's items can be bound to a model with an arbitrary size limit", function(assert) {
		//prepare
		var oFF = new FacetFilter({type: FacetFilterType.Light}),
				oModel = new JSONModel(),
				aData = [],
				done = assert.async(),
				oDialog;

		oFF.bindAggregation("lists", {path: "/Filters", template: new FacetFilterList({title: "{text}"})});
		for (var i = 1; i <= 105; i++) {
			aData.push({text: "List" + i});
		}

		oModel.setData({Filters: aData});
		oModel.setSizeLimit(200);
		oFF.setModel(oModel);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		//act
		oDialog = oFF._getFacetDialog();
		oDialog.attachEventOnce("afterOpen", function() {

			//test
			assert.equal(oFF.getLists().length, 105, "Expected 105 lists");
			assert.ok(jQuery("#__item0-__list1-104").size(), "There should be element at 105 rendered");

			destroyFF(oFF);

			done();
		});
		oFF.getAggregation("summaryBar").firePress();
	});

	QUnit.test("Default Property Values & Override", function(assert) {

		var oFF = new FacetFilter();
		assert.strictEqual(oFF.getVisible(), true, "Visibility should be enabled by default");
		assert.strictEqual(oFF.getShowPersonalization(), false, "Personalization should disabled by default");
		assert.strictEqual(oFF.getShowSummaryBar(), false, "Show summary bar should disabled by default");
		assert.strictEqual(oFF.getShowReset(), true, "Show reset should enabled by default");
		assert.strictEqual(oFF.getShowPopoverOKButton(), false, "Show popover ok should disabled by default");
		assert.strictEqual(oFF.getType(), FacetFilterType.Simple, "Type should be Simple by default");
		assert.strictEqual(oFF.getLiveSearch(), true, "Live search should be enabled by default");
		oFF.destroy();

		var oFFL1 = new FacetFilterList();
		assert.strictEqual(oFFL1.getActive(), true, "List active should be enabled by default");
		assert.strictEqual(oFFL1.getMultiSelect(), true, "List multi select should be enabled by default");
		assert.strictEqual(oFFL1.getMode(), ListMode.MultiSelect, "List mode should be multi select by default");
		assert.strictEqual(oFFL1.getGrowing(), true, 'Growing is enabled by default');
		assert.strictEqual(oFFL1.getShowRemoveFacetIcon(), true, "Remove icon should be shown by default");
		assert.strictEqual(oFFL1.getRetainListSequence(), false, "List sequence should not be retained by default when list is inactive and made active again");
		assert.strictEqual(oFFL1.getDataType(), FacetFilterListDataType.String, 'Data Type is String by default');
		oFFL1.destroy();

		// Test overrides
		var oFFL2 = new FacetFilterList({
			active: false,
			multiSelect: false,
			growing: false,
			mode: ListMode.SingleSelectMaster
		});
		assert.strictEqual(oFFL2.getActive(), false, "List active should be disabled");
		assert.strictEqual(oFFL2.getMultiSelect(), false, "List multi select should be disabled");
		assert.strictEqual(oFFL2.getMode(), ListMode.SingleSelectMaster, "List mode should be single select master");
		assert.strictEqual(oFFL2.getGrowing(), false, 'Growing should be disabled');
		oFFL2.destroy();
	});


	QUnit.module("Private API");

	QUnit.test("FacetFilter.init", function(assert) {

		var oFF = new FacetFilter(),
		oFFS = oFF._enableTouchSupport();
		// Verify the add facet button is created
		var oAddFacetButton = oFF.getAggregation("addFacetButton");
		assert.ok(oAddFacetButton, "The add facet button is created");

		// Verify the summary bar is created
		var oSummaryBar = oFF.getAggregation("summaryBar");
		assert.ok(oSummaryBar, "The summary bar is created");

		jQuery.sap.touchEventMode === "ON";
		oFF._enableTouchSupport();

		Device.system.phone;
		oFF.getType(FacetFilterType.Light);

		oFF.destroy();
	});

	QUnit.test("FacetFilter._getPopover", function(assert) {

		var oFF = new FacetFilter();
		oFF._getPopover();

		var oPopover = oFF.getAggregation("popover");
		assert.ok(oPopover, "The popover is created");
		assert.equal(oPopover.getPlacement(), PlacementType.Bottom, "Popover placement should be bottom");
		assert.strictEqual(oPopover.getHorizontalScrolling(), false, "Horizontal scrolling should be disabled");
		assert.strictEqual(oPopover, oFF._getPopover(), "There should only be one instance of Popover created while the popover aggregation is still valid");
		assert.ok(!oPopover.getFooter(), "Popover should not contain the OK button in the footer");

		oFF.setShowPopoverOKButton(true);
		oPopover = oFF._getPopover();
		assert.ok(oPopover.getFooter(), "Popover should contain the OK button in the footer");

		assert.ok(oPopover.getContentWidth("30%"),"Popover width set to 30% for IE");

		oFF.destroy();
	});

	QUnit.test("FacetFilter._openPopover", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList();

		oFFL.setWordWrap(true);

		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function() {
			assert.ok(oPopover.isOpen(), "Popover should be open");
			assert.ok(oPopover.getContentWidth("30%"),"Popover width should be 30% if wordwrap is set to true");

			destroyFF(oFF);
			done();
		});

		var oButton = oFF._getButtonForList(oFFL);
		oFF._openPopover(oPopover, oButton);



	});


	QUnit.test("FacetFilter._closePopover", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({items: [new FacetFilterItem({text: "Val"})]});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function() {

			oPopover.attachEventOnce("afterClose", function() {
				assert.ok(!oPopover.isOpen(), "Popover should be closed");
				assert.ok(!oPopover.getSubHeader(), "Popover subheader should be destroyed");

				assert.equal(oPopover.getContent().length, 0, "Popover content should be destroyed");
				destroyFF(oFF);
				done();
			});
			oFF._closePopover();
		});
		openPopover(oFF, 0);
	});


	QUnit.test("FacetFilter._moveListToDisplayContainer, _restoreListFromDisplayContainer", function(assert) {

		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList();
		var oFFL2 = new FacetFilterList();
		var oFFL3 = new FacetFilterList();
		oFF.addList(oFFL1);
		oFF.addList(oFFL2);
		oFF.addList(oFFL3);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oFF.indexOfAggregation("lists", oFFL1), 0, "List 1 should be at index 0");
		assert.equal(oFF.indexOfAggregation("lists", oFFL2), 1, "List 2 should be at index 1");
		assert.equal(oFF.indexOfAggregation("lists", oFFL3), 2, "List 3 should be at index 2");

		var oContainer = new Popover();
		var fnMoveAndTest = function(oFFL, iIndex) {

			oFF._moveListToDisplayContainer(oFFL, oContainer);

			assert.equal(oFFL.getAssociation("facetFilter"), oFF.getId(), "The list should have an association back to the FacetFilter after it is moved");
			assert.strictEqual(oFF._displayedList, oFFL, "_displayedList should point to the moved list");
			assert.equal(oFF._listAggrIndex, iIndex, "Index of the displayed list within the FacetFilter lists aggregation should be " + iIndex);
			assert.strictEqual(oContainer.getContent()[0], oFFL, "The displayed list should be set into the content of the container");
			assert.equal(oFF.getLists().length, 3, "All lists should still be returned from getList()");

			oFF._restoreListFromDisplayContainer(oContainer);

			assert.ok(!oFF.getAggregation("popover"), "The popover aggregation should be destroyed");

			assert.equal(oFF.indexOfAggregation("lists", oFFL1), 0, "List 1 should be at index 0");
			assert.equal(oFF.indexOfAggregation("lists", oFFL2), 1, "List 2 should be at index 1");
			assert.equal(oFF.indexOfAggregation("lists", oFFL3), 2, "List 3 should be at index 2");

			assert.strictEqual(oFF._displayedList, null, "_displayedList should be reset to null");
			assert.equal(oFF._listAggrIndex, -1, "Displayed list index should be reset to -1");
			assert.strictEqual(oContainer.getContent().length, 0, "The container control should no longer contain the list");
			assert.equal(oFF.getLists().length, 3, "All lists should still be returned from getList()");
		};

		fnMoveAndTest(oFFL1, 0);
		fnMoveAndTest(oFFL2, 1);
		fnMoveAndTest(oFFL3, 2);

		oContainer.destroy();
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._getFacetDialog", function(assert) {

		var oFF = new FacetFilter();
		var oDialog = oFF.getAggregation("dialog");

		assert.ok(!oDialog, "Dialog should be created lazily");

		oDialog = oFF._getFacetDialog();
		assert.ok(oDialog instanceof sap.m.Dialog, "Should be an instance of sap.m.Dialog");
		assert.ok(oDialog, "Dialog should not be null");
		assert.ok(oFF.getAggregation("dialog"), "Dialog aggregation should be created");

		assert.ok(oDialog.getBeginButton(), "Dialog begin button should be created");
		assert.strictEqual(oDialog.getShowHeader(), false, "Dialog header should not be shown");
		assert.strictEqual(oDialog.getStretch(), Device.system.phone ? true : false, "Dialog stretch should be false on desktop and true on phone");

		var oButton = oDialog.getBeginButton();
		oButton.firePress();
		oFF._closeDialog();

		if (Device.system.desktop) {
			assert.equal(oDialog.getContentHeight(), "500px", "Dialog height should be fixed on desktop");
		}

		assert.equal(oFF._getFacetDialog(), oDialog, "There should be only one dialog instance created");
		oFF.destroy();
	});

	QUnit.test("FacetFilter._closeDialog", function(assert) {
		var done = assert.async();

		var oListCloseEvent = null;
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({title: "List"});
		var oFFI = new FacetFilterItem({text: "Val"});
		oFFL.addItem(oFFI);
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFFL.attachListClose(function(oEvent) {
			oListCloseEvent = oEvent;
		});
		var oDialog = oFF._getFacetDialog();

		oFF.openFilterDialog();
		var oNavContainer = oDialog.getContent()[0];
		oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

			oDialog.attachEventOnce("afterClose", function(oEvent) {
				assert.ok(oListCloseEvent, "List close event should have been fired");
				assert.ok(!oDialog.isOpen(), "Dialog should be closed");
				assert.equal(oDialog.getContent().length, 0, "Dialog nav container should be destroyed");

				destroyFF(oFF);
				done();
			});
			oFF._closeDialog();
		});

		oFF._navToFilterItemsPage(oNavContainer.getPages()[0].getContent()[0].getItems()[0]);
	});

	QUnit.test("FacetFilter._createFacetList", function(assert) {

		var sFacet1 = "Facet1", sFacet2 = "Facet2", iFacet1AllCount = 4, iFacet2AllCount = 7;
		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList({title: sFacet1,allCount: iFacet1AllCount});
		var oFFL2 = new FacetFilterList({title: sFacet2,allCount: iFacet2AllCount});
		oFF.addList(oFFL1);
		oFF.addList(oFFL2);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oList = oFF._createFacetList();
		assert.ok(oList, "List should not be null");
		oList.placeAt("content");
		sap.ui.getCore().applyChanges();


		assert.equal(oList.getMode(), ListMode.None, "The facet list mode should be None");
		assert.equal(oList.getItems().length, 2, "There should be two list items");
		assert.equal(oList.getItems()[0].getType(), ListType.Navigation, "List item type should be Navigation");
		assert.equal(oList.getItems()[0].getTitle(), sFacet1, "The first facet should be " + sFacet1);
		assert.equal(oList.getItems()[0].getCounter(), iFacet1AllCount, "The first facet all count should be " + iFacet1AllCount);
		assert.equal(oList.getItems()[0].getTooltip(), null,"The facet shouldn't have tooltip");
		assert.equal(oList.getItems()[1].getTitle(), sFacet2, "The second facet should be " + sFacet2);
		assert.equal(oList.getItems()[1].getCounter(), iFacet2AllCount, "The second facet all count should be " + iFacet2AllCount);
		assert.equal(oList.getItems()[1].getTooltip(), null,"The facet shouldn't have tooltip");
		for (var i = 0; i < oList.getItems().length; i++) {

			var aCustomData1 = oList.getItems()[i].getCustomData();
			assert.equal(aCustomData1.length, 1, "There should be one custom data in the list item to hold its index");
			assert.equal(aCustomData1[0].getValue(), i, "Index should be " + i);
		}

		oList.destroy();
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._createFacetPage", function(assert) {

		var oFF = new FacetFilter();
		var oPage = oFF._createFacetPage();

		assert.ok(oPage.getEnableScrolling(), "Page scrolling should be enabled");

		var oPageSubHeader = oPage.getSubHeader();
		assert.ok(oPageSubHeader, "Page should have a sub header");
		assert.ok(oPageSubHeader instanceof sap.m.Bar, "Page sub header should be a Bar");

		var oPageSubHeaderSearchField = oPageSubHeader.getContentMiddle()[0];
		assert.ok(oPageSubHeaderSearchField, "Page sub header should have content");
		assert.ok(oPageSubHeaderSearchField instanceof sap.m.SearchField, "Page sub header should be a SearchField");
		assert.equal(oPageSubHeaderSearchField.getWidth(), "100%", "Page search field width should be 100%");

		var oFacetList = oPage.getContent()[0];
		assert.ok(oFacetList, "Page should have content");
		assert.ok(oFacetList instanceof sap.m.List, "Page content should be a List");
		oFF.destroy();
	});

	QUnit.test("FacetFilter._createFilterItemsPage", function(assert) {

		var oFF = new FacetFilter();
		var oPage = oFF._createFilterItemsPage();

		assert.ok(oPage.getEnableScrolling(), "Page scrolling should be enabled");
		assert.ok(oPage.getShowNavButton(), "Filter items page should show the navigation button");

		oFF.destroy();
	});

	QUnit.test("FacetFilter._createFilterItemsSearchFieldBar", function(assert) {

		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList();
		oFF.addList(oFFL1);
		var oBar = oFF._createFilterItemsSearchFieldBar(oFFL1);
		assert.ok(oBar, "Bar should be created");
		var oSearchField = oBar.getContentMiddle()[0];

		assert.ok(oSearchField, "Bar should contain a search field placed in middle content");
		assert.ok(oSearchField.getTooltip(), "Search field has tooltip");
		assert.equal(oSearchField.getWidth(), "100%", "Search field width should be 100%");

		assert.equal(oFFL1.getAssociation("search"), oSearchField.getId(), "The list should have an association with the search field");
		assert.equal(oSearchField.getEnabled(), true, "the search field is enabled");
		var oFFL2 = new FacetFilterList();
		oFFL2.setDataType(FacetFilterListDataType.Date);
		oFF.addList(oFFL2);
		var oBar2 = oFF._createFilterItemsSearchFieldBar(oFFL2);
		var oSearchField2 = oBar2.getContentMiddle()[0];
		assert.equal(oSearchField2.getEnabled(), false, "the search field is not enabled");
		oFF.destroy();
	});

	QUnit.test("FacetFilter._createSelectAllCheckboxBar", function(assert) {

		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList();
		oFFL1.addItem(new FacetFilterItem());
		var oCheckboxBar1 = oFF._createSelectAllCheckboxBar(oFFL1);
		assert.ok(oCheckboxBar1, "The checkbox bar is created");
		assert.ok(oCheckboxBar1 instanceof sap.m.Bar, "The checkbox bar should be a Bar");
		var oCheckBox1 = oCheckboxBar1.getContentLeft()[0];
		assert.ok(oCheckBox1, "A control is contained in the left content of the bar");
		assert.ok(oCheckBox1 instanceof sap.m.CheckBox, "The bar contains a CheckBox");
		assert.ok(oCheckBox1.getTooltip(),"CheckBox contain tooltip");
		assert.ok(!oCheckBox1.getSelected(), "Checkbox should be initially unchecked when the list is active and contains no selections");
		oFFL1.destroy();

		var oFFL2 = new FacetFilterList();
		oFFL2.addItem(new FacetFilterItem({selected: true}));
		var oCheckboxBar2 = oFF._createSelectAllCheckboxBar(oFFL2);
		var oCheckBox2 = oCheckboxBar2.getContentLeft()[0];
		assert.ok(!oCheckBox2.getSelected(), "Checkbox should not be initially checked when the list contains selections");
		oFFL2.destroy();

		var oFFL3 = new FacetFilterList({active: false});
		var oCheckboxBar3 = oFF._createSelectAllCheckboxBar(oFFL3);
		var oCheckBox3 = oCheckboxBar3.getContentLeft()[0];
		assert.ok(!oCheckBox3.getSelected(), "Checkbox should not be initially checked when the list is inactive");

		oFFL3.destroy();

		var oFFL4 = new FacetFilterList({multiSelect: false});
		assert.ok(!oFF._createSelectAllCheckboxBar(oFFL4), "Checkbox bar should not be created when the list is not multi select");
		oFFL4.destroy();

		oFF.destroy();
	});


	QUnit.test("FacetFilter._getFacetDialogNavContainer", function(assert) {

		var oFF = new FacetFilter();
		var oNavContainer = oFF._getFacetDialogNavContainer();
		assert.ok(oNavContainer instanceof sap.m.NavContainer, "Should be an instance of sap.m.NavContainer");
		assert.ok(oNavContainer, "NavContainer should not be null");

		assert.equal(oNavContainer.getPages().length, 1, "Nav container should contain one pages");
		oFF.destroy();
	});


	QUnit.test("FacetFilter._navToFilterItemsPage", function(assert) {
		var done = assert.async();

		var sList1Title = "List1", sList2Title = "List2", sItem1 = "List1 Val1", sItem2 = "List2 Val1";

		var oFFL1 = new FacetFilterList({title: sList1Title});
		oFFL1.addItem(new FacetFilterItem({text: sItem1}));
		var oFFL2 = new FacetFilterList({title: sList2Title});
		oFFL2.addItem(new FacetFilterItem({text: sItem2}));
		var oFF = new FacetFilter( {
			lists: [oFFL1, oFFL2]
		});
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {
			var oFacetFilterListPage = oNavContainer.getPages()[1];
			var oFacetFilterListBar = oFacetFilterListPage.getContent()[0];
			var oFacetFilterList = oFacetFilterListPage.getContent()[1];
			var oCurrentPage = oNavContainer.getCurrentPage();
			assert.strictEqual(oFacetFilterListPage, oCurrentPage, "The current page should be the facet filter item page");
			assert.ok(oFacetFilterListBar instanceof sap.m.Bar, 'The first content item is the Bar that contains selectAll checkbox');
			assert.strictEqual(oFFL1, oFacetFilterList, 'The second content item is the Facet filter list page');

			var oPageSubHeader = oCurrentPage.getSubHeader();
			assert.ok(oPageSubHeader, "Page should have a sub header");
			assert.ok(oPageSubHeader instanceof sap.m.Bar, "Page sub header should be a Bar");

			var oPageSubHeaderSearchField = oPageSubHeader.getContentMiddle()[0];
			assert.ok(oPageSubHeaderSearchField, "Page sub header should have content");
			assert.ok(oPageSubHeaderSearchField instanceof sap.m.SearchField, "Page sub header should be a SearchField");
			assert.equal(sList1Title, oCurrentPage.getTitle(), "Current page should display the first facet filter list");
			assert.ok(oFFL1.getItems()[0].getDomRef(), "Facet filter item should be rendered");
			// in MultiSelect mode focus is on 1st item of 2nd content item, since the first content item is the Bar with "Select All" checkbox
			assert.ok(jQuery.sap.byId(oFFL1.getItems()[0].getId()).is(":focus"), 'The first Facet filter item should be focused');

			destroyFF(oFF);
			done();
		});
		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.test("FacetFilter._navToFilterItemsPage in SingleSelectMaster mode of FacetFilterList", function(assert) {
		var done = assert.async();

		var sList1Title = "List1", sList2Title = "List2", sItem1 = "List1 Val1", sItem2 = "List2 Val1";

		var oFFL1 = new FacetFilterList({title: sList1Title});
		// set SingleSelectMaster mode of the FacetFilterList by default it is MultiSelect
		oFFL1.setMode(ListMode.SingleSelectMaster);
		oFFL1.addItem(new FacetFilterItem({text: sItem1}));
		var oFFL2 = new FacetFilterList({title: sList2Title});
		oFFL2.addItem(new FacetFilterItem({text: sItem2}));
		var oFF = new FacetFilter( {
			lists: [oFFL1, oFFL2]
		});
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {
			var oFacetFilterList = oNavContainer.getPages()[1].getContent()[0];

			assert.strictEqual(oFFL1, oFacetFilterList, 'The first content item is the Facet filter list page');
			assert.ok(oFFL1.getItems()[0].getDomRef(), "Facet filter item should be rendered");
			// in SingleSelectMaster focus is on the 1st content item 1st item
			assert.ok(jQuery.sap.byId(oFFL1.getItems()[0].getId()).is(":focus"), 'The first Facet filter item should be focused');

			destroyFF(oFF);
			done();
		});
		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.test("FacetFilter._navToFilterItemsPage after search", function(assert) {
		var done = assert.async();

		var sList1Title = "List1", sList2Title = "List2", sItem1 = "List1 Val1", sItem2 = "List2 Val1";

		var oFFL1 = new FacetFilterList({title: sList1Title});
		oFFL1.addItem(new FacetFilterItem({text: sItem1}));
		var oFFL2 = new FacetFilterList({title: sList2Title});
		oFFL2.addItem(new FacetFilterItem({text: sItem2}));
		var oFF = new FacetFilter( {
			lists: [oFFL1, oFFL2]
		});
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());

		var oSearchField = getDialogFacetSearchField(oFacetPage);

		oSearchField.attachLiveChange(function(oEvent) {

			oNavContainer.attachEventOnce("afterNavigate", function() {
				var oFacetFilterListPage = oNavContainer.getPages()[1];
				var oCurrentPage = oNavContainer.getCurrentPage();
				assert.strictEqual(oFacetFilterListPage, oCurrentPage, "The current page should be the facet filter item page");
				assert.equal(sList2Title, oCurrentPage.getTitle(), "Current page should display the second facet filter list");
				assert.ok(oFFL2.getItems()[0].getDomRef(), "Facet filter item should be rendered");

				destroyFF(oFF);
				done();
			});

			var oFacetList = oFacetPage.getContent()[0];
			var oFacetListItem = oFacetList.getItems()[0];
			oFF._navToFilterItemsPage(oFacetListItem);
		});

		oSearchField.fireLiveChange({
			newValue: "List2"
		});
	});

	QUnit.test("FacetFilter._navFromFilterItemsPage", function(assert) {
		var done = assert.async();

		var iAllCount = 54;
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({title: "List"});
		oFFL.addItem(new FacetFilterItem({text: "Val1"}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {

			oNavContainer.attachEventOnce("afterNavigate", function() {
				var oCurrentPage = oNavContainer.getCurrentPage();
				assert.strictEqual(oFacetPage, oCurrentPage, "The current page should be the facet page");

				var oContent = oNavContainer.getPages()[1].getContent();
				assert.equal(oContent.length, 0, "Filter items page content should be destroyed");

				var oFacetList = getDialogFacetList(oFF);
				assert.equal(oFacetList.getItems()[0].getCounter(), iAllCount, "Facet allCount should be set");

				destroyFF(oFF);
				done();
			});
			oFFL.setAllCount(iAllCount);

			oFF._navFromFilterItemsPage(oNavContainer);
		});
		var oOldItemsPage = oNavContainer.getPages()[1];
		oFF._navToFilterItemsPage(oFacetListItem1);
		assert.notEqual(oNavContainer.getPages()[1].getId(), oOldItemsPage && oOldItemsPage.getId(), 'New items page has been created');
	});

	QUnit.test("FacetFilter._getSequencedLists", function(assert) {

		var oFF = new FacetFilter();
		var aSequencedLists = oFF._getSequencedLists();

		assert.equal(aSequencedLists.length, 0, "There should be no sequenced lists");

		oFF.addList(new FacetFilterList());

		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 1, "There should be one sequenced list");
		assert.equal(aSequencedLists[0].getSequence(), 0, "Sequence should be 0");

		oFF.removeAllLists();

		// Check when a list has a sequence less than -1
		oFF.addList(new FacetFilterList({sequence: -2}));
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 1, "There should be one sequenced list");
		assert.equal(aSequencedLists[0].getSequence(), 0, "Sequence should be 0");

		oFF.removeAllLists();

		// Verify initial ordering is preserved if all lists have the default sequence
		oFF.addList(new FacetFilterList());
		oFF.addList(new FacetFilterList());
		oFF.addList(new FacetFilterList());
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 3, "There should be three sequenced lists");
		assert.equal(aSequencedLists[0].getSequence(), 0, "Sequence of the first list should be 0");
		assert.equal(aSequencedLists[1].getSequence(), 1, "Sequence of the second list should be 1");
		assert.equal(aSequencedLists[2].getSequence(), 2, "Sequence of the third list should be 2");
		assert.strictEqual(oFF.getLists()[0], aSequencedLists[0], "Initial list order should be preserved");
		assert.strictEqual(oFF.getLists()[1], aSequencedLists[1], "Initial list order should be preserved");
		assert.strictEqual(oFF.getLists()[2], aSequencedLists[2], "Initial list order should be preserved");

		oFF.removeAllLists();

		// Verify that a list with sequence -1 is placed after a list with sequence 0
		oFF.addList(new FacetFilterList());
		oFF.addList(new FacetFilterList({sequence: 0}));
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 2, "There should be two sequenced lists");
		assert.equal(aSequencedLists[0].getSequence(), 0, "Sequence of the first list should be 0");
		assert.equal(aSequencedLists[1].getSequence(), 1, "Sequence of the second list should be 1");
		assert.strictEqual(oFF.getLists()[0], aSequencedLists[1], "The list with initial sequence of -1 should be moved after the list with 0 sequence");
		assert.strictEqual(oFF.getLists()[1], aSequencedLists[0], "The list with initial sequence of 0 should be before the list with sequence -1");

		oFF.removeAllLists();

		// Verify sequencing remains as-is for lists that are already ordered
		oFF.addList(new FacetFilterList({sequence: 3}));
		oFF.addList(new FacetFilterList({sequence: 5}));
		oFF.addList(new FacetFilterList({sequence: 9}));
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 3, "There should be three sequenced lists");
		assert.equal(aSequencedLists[0].getSequence(), 3, "Sequence of the first list should be 3");
		assert.equal(aSequencedLists[1].getSequence(), 5, "Sequence of the second list should be 5");
		assert.equal(aSequencedLists[2].getSequence(), 9, "Sequence of the third list should be 9");

		oFF.removeAllLists();

		// Verify sequencing is correct if all lists start in the reverse order
		oFF.addList(new FacetFilterList({sequence: 9}));
		oFF.addList(new FacetFilterList({sequence: 5}));
		oFF.addList(new FacetFilterList({sequence: 3}));
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 3, "There should be three sequenced lists");
		assert.equal(aSequencedLists[0].getSequence(), 3, "Sequence of the first list should be 3");
		assert.equal(aSequencedLists[1].getSequence(), 5, "Sequence of the second list should be 5");
		assert.equal(aSequencedLists[2].getSequence(), 9, "Sequence of the third list should be 9");

		oFF.removeAllLists();

		// Verify that active/inactive behavior
		oFF.addList(new FacetFilterList({active: false, sequence: 9}));
		oFF.addList(new FacetFilterList({sequence: 5}));
		oFF.addList(new FacetFilterList({active: false, sequence: 3}));
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 1, "There should be one sequenced list");
		assert.equal(aSequencedLists[0].getSequence(), 5, "Sequence of the list should be 5");


		oFF.getLists()[0].setActive(true);
		aSequencedLists = oFF._getSequencedLists();
		assert.equal(aSequencedLists.length, 2, "There should be two sequenced lists");
		assert.equal(aSequencedLists[0].getSequence(), 5, "Sequence of the first list should be 5");
		assert.equal(aSequencedLists[1].getSequence(), 6, "Sequence of the second list should be 6");

		oFF.destroy();
	});

	QUnit.test("FacetFilter._getButtonForList", function(assert) {

		var sListTitle = "List";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({title: sListTitle});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges(); //_getButtonForList is implicitly called upon rendering

		var oButton = oFF.getAggregation("buttons")[0];
		assert.strictEqual(oFF._getButtonForList(oFFL), oButton, "There should be only one button instance created per list");
		assert.equal(oButton.getText().indexOf(sListTitle), 0, "Button text should contain the list title");
		assert.equal(oButton.getAssociation("list"), oFFL.getId(), "Button should be associated with the list");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._getFacetRemoveIcon", function(assert) {

		var oFF = new FacetFilter({
			showPersonalization: true
		});
		var oFFL = new FacetFilterList({title: "List"});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges(); //_getFacetRemoveIcon is implicitly called upon rendering

		var oIcon = oFF.getAggregation("removeFacetIcons")[0];
		assert.strictEqual(oFF._getFacetRemoveIcon(oFFL), oIcon, "There should be only one icon instance created per list");
		assert.ok(oIcon.getTooltip(),"Facet Remove icon has tooltip");
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._displayRemoveIcon", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPersonalization: true
		});
		var oFFL = new FacetFilterList({title: "List"});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			oFF._displayRemoveIcon(false, oFFL);
			assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLHiddenRemoveIcon"), "The remove icon should not be displayed.");
			oFF._displayRemoveIcon(true, oFFL);
			assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLVisibleRemoveIcon"), "The remove icon should be displayed.");

			destroyFF(oFF);
			done();
		});
		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter._displayRemoveIcon should be visible until the user releases the mouse (touchend)", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPersonalization: true
		});
		var oFFL = new FacetFilterList({title: "List"});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			var oIcon = getRemoveIconCtrl(oFF, 0);

			assert.equal(oIcon.aBeforeDelegates.length, 1, "There must be single delegate");

			//touch start
			callIconDelegate("ontouchstart", oIcon);
			assert.ok(oIcon._bTouchStarted, "A flag indicated mousedown/touchstart on icon " + oIcon.getId() + " must present");
			assert.ok(oIcon.$().hasClass("sapMFFLVisibleRemoveIcon"),"The 'remove icon ' should be visible");

			//touch end
			callIconDelegate("ontouchend", oIcon);
			assert.strictEqual(false, oIcon._bTouchStarted, "A flag indicated mousedown/touchstart on icon " + oIcon.getId() + " must be reflected");
			assert.ok(oIcon.$().hasClass("sapMFFLHiddenRemoveIcon"),"The 'remove icon ' should not be visible");

			//press
			oIcon.firePress();
			assert.notOk(oIcon._bPress, "A flag indicated press on icon " + oIcon.getId() + " should exist");
			assert.ok(oIcon.$().hasClass("sapMFFLHiddenRemoveIcon"),"The 'remove icon ' should not be visible");
			destroyFF(oFF);
			done();
		});

		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter RemoveIcon should be displayed", function(assert) {
	  var done = assert.async();
		   var oFF = new FacetFilter({
		   showPersonalization: true
		   });
		   var oFFL = new FacetFilterList({title: "List", showRemoveFacetIcon:true});
		   oFF.addList(oFFL);
		   oFF.placeAt("content");
		   sap.ui.getCore().applyChanges();
		   var oPopover = oFF._getPopover();
		   oPopover.attachEventOnce("afterOpen", function(oEvent) {
			   assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLVisibleRemoveIcon"), "The remove icon should  be displayed.");
			   destroyFF(oFF);
			   done();
		   });
		   openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter RemoveIcon should not be displayed", function(assert) {
		var done = assert.async();
		 var oFF = new FacetFilter({
		 showPersonalization: true
		 });
		 var oFFL = new FacetFilterList({title: "List", showRemoveFacetIcon:false});
		 oFF.addList(oFFL);
		 oFF.placeAt("content");
		 sap.ui.getCore().applyChanges();
		 var oPopover = oFF._getPopover();
		 oPopover.attachEventOnce("afterOpen", function(oEvent) {
			 assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLHiddenRemoveIcon"), "The remove icon should not be displayed.");
			 destroyFF(oFF);
			 done();
		 });
		 openPopover(oFF, 0);
  });


	QUnit.test("FacetFilter._getAddFacetButton", function(assert) {
		var oFF = new FacetFilter();
		var oAddFacetButton = oFF.getAggregation("addFacetButton");
		assert.strictEqual(oAddFacetButton, oFF._getAddFacetButton(), "There should only be one instance of the add facet button created for the lifetime of the FacetFilter");
		assert.equal(oAddFacetButton.getIcon(), IconPool.getIconURI("add-filter"), "Button should have the add-filter icon URI");
		assert.equal(oAddFacetButton.getType(), ButtonType.Transparent, "Button type should be Transparent");
		assert.ok(oAddFacetButton.getTooltip(),"Add facet Button has tooltip");
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._createResetButton", function(assert) {

		var oFF = new FacetFilter();
		var oResetButton = oFF._createResetButton();
		assert.notStrictEqual(oResetButton, oFF._createResetButton(), "A new button should be created with each call");

		assert.equal(oResetButton.getIcon(), IconPool.getIconURI("undo"), "Button should have the undo icon URI");
		assert.equal(oResetButton.getType(), ButtonType.Transparent, "Button type should be Transparent");
		assert.ok(oResetButton.getTooltip(),"Reset Button has tooltip");

		 oFF.addList(new FacetFilterList("list1"));
		 oFF.addList(new FacetFilterList("list2"));
		 oResetButton.firePress();

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._addOKButtonToPopover", function(assert) {

		var oFF = new FacetFilter();
		var oPopover = oFF._getPopover();

		oFF._addOKButtonToPopover(oPopover);
		var oButton = oPopover.getFooter();
		assert.ok(oButton, "Popover OK button should be created and added to the popover footer");
		assert.equal(oButton.getWidth(), "100%", "Popover OK button width should be 100%");
		assert.ok(oButton.getText(), "Button text should be set");
		assert.ok(oButton.getTooltip(), "Button tooltip should be set");

		oButton.firePress();
		oPopover.attachEventOnce("afterOpen", function() {
			oButton.firePress();
			oFF._closePopover();
		});

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._getSummaryBar", function(assert) {

		var oFF = new FacetFilter();
		var oSummaryBar = oFF.getAggregation("summaryBar");
		assert.strictEqual(oSummaryBar, oFF._getSummaryBar(), "There should only be one instance of the summary bar created for the lifetime of the FacetFilter");

		assert.equal(oSummaryBar.getContent().length, 1, "Summary bar should have one control in its content");
		var oText = oSummaryBar.getContent()[0];
		assert.ok(oText instanceof sap.m.Text, "Summary bar should have a Text control as its contents");
		assert.ok(!oSummaryBar.getActive(), "Summary bar should be inactive");
		assert.equal(oSummaryBar.getDesign(), ToolbarDesign.Info, "Summary bar design should be Info");
		assert.equal(oSummaryBar.getHeight(), "", "Toolbar height shouldn't be specified");

		oSummaryBar.firePress();
		oSummaryBar.attachEventOnce("afterOpen", function() {
		oFF.openFilterDialog();
		});

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._getSelectedItemsText", function(assert) {
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			   title : "List1",
			   items : [
					 new FacetFilterItem({text: "Val1"}),
					 new FacetFilterItem({key: "2", text: "Val2"}),
					 new FacetFilterItem({text: "Val3"}),
					 new FacetFilterItem({text: "Val4"})
			   ]
		});


		oFF.addList(oFFL);

		oFFL.setSelectedKeys({"2" : "Val2"});
		oFFL.getItems()[0].setSelected(true);

		var aText = oFF._getSelectedItemsText(oFFL);
		assert.equal(aText.length, 2, "There are two texts from selected items");
		assert.equal(aText[0], "Val1", "Check that value matches the text of selected item");
		assert.equal(aText[1], "Val2", "Check that value matches the text of selected item");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._getSummaryText", function(assert) {

		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
	   // var oFFL1 = oFF.getLists()[1];
		oFF.placeAt("content");

		oFFL.setSelectedKeys({"4" : "Val4"});
		oFFL.getItems()[2].setSelected(true);

		assert.ok(oFF._getSummaryText().indexOf("Val3") > -1, "Summary text contains the selected item");
		assert.ok(oFF._getSummaryText().indexOf("Val4") > -1, "Summary text contains the selected item");


		destroyFF(oFF);
	});


	QUnit.test("FacetFilter._addResetToSummary, _removeResetFromSummary", function(assert) {

		var oFF = new FacetFilter();
		var oSummaryBar = oFF._getSummaryBar();

		oFF._addResetToSummary(oSummaryBar);
		assert.equal(oSummaryBar.getContent().length, 3, "The summary bar should contain three controls");
		oFF._addResetToSummary(oSummaryBar);
		assert.equal(oSummaryBar.getContent().length, 3, "The summary bar should still contain three controls");

		oFF._removeResetFromSummary(oSummaryBar);
		assert.equal(oSummaryBar.getContent().length, 1, "The summary bar should contain one control");
		oFF._removeResetFromSummary(oSummaryBar);
		assert.equal(oSummaryBar.getContent().length, 1, "The summary bar should still contain one control");
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter._setButtonText", function(assert) {
		var sItemText1 = "Val1", sItemText2 = "Val2", sItemText3 = "Val3";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title: "List",
			multiSelect: false // Turn off multi select otherwise the FacetFilter will expect the select all checkbox to exist
		});
		oFFL.addItem(new FacetFilterItem({text: sItemText1}));
		oFFL.addItem(new FacetFilterItem({text: sItemText2}));
		oFFL.addItem(new FacetFilterItem({text: sItemText3}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oButton = oFF._getButtonForList(oFFL);
		oFFL.getItems()[0].setSelected(true);
		oFF._setButtonText(oFFL);
		assert.ok(oButton.getText().indexOf(sItemText1) !== -1, "Button should be updated with text for the first list item");

		oFFL.setMultiSelect(true);
		//all items are selected
		oFFL.getItems()[0].setSelected(true);
		oFFL.getItems()[1].setSelected(true);
		oFFL.getItems()[2].setSelected(true);

		oFF._setButtonText(oFFL);

		assert.equal(oButton.getText(), "List (All)", "Button should contain the 'All' if all items are selected");

		//More than one(but not all) items are selected
		oFFL.getItems()[0].setSelected(true);
		oFFL.getItems()[1].setSelected(false);
		oFFL.getItems()[2].setSelected(true);
		oFF._setButtonText(oFFL);

		assert.ok(oButton.getText().indexOf("List (2)") !== -1, "Button should contain the count of selected items");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.init", function(assert) {

		var oFFL = new FacetFilterList();
		assert.strictEqual(oFFL.getMultiSelect(), true, "List multiSelect should be enabled by default");
		assert.strictEqual(oFFL.getMode(), ListMode.MultiSelect, "List mode should be MultiSelect by default");
		assert.strictEqual(oFFL.getIncludeItemInSelection(), true, "List item selection should include the whole item by default");

		oFFL.destroy();
	});

	QUnit.test("FacetFilterList._updateActiveState for initially non-active lists", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList({
			active: false,
			title: "List1"
		});
		oFFL1.addItem(new FacetFilterItem());
		oFF.addList(oFFL1);
		var oFFL2 = new FacetFilterList({
			active: false,
			title: "List2"
		});
		oFFL2.addItem(new FacetFilterItem());
		oFF.addList(oFFL2);
		var oFFL3 = new FacetFilterList({
			active: false,
			title: "List3",
			items: {
				path: "/values",
				template: new FacetFilterItem( {
					text: "{text}",
					key: "{key}"
				})
			}
		});
		oFFL3.setModel(new JSONModel({
			values: [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}]
		}));
		oFF.addList(oFFL3);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oDialog = oFF._getFacetDialog();
		oDialog.attachEventOnce("afterOpen", function(oEvent) {

			var oFacetListItem = getDialogFacetList(oFF).getItems()[0];
			var oNavContainer = oDialog.getContent()[0];
			oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

				// Verify the active state when an item is selected and then deselected
				var oList = getDialogFilterItemsList(oFF);
				assert.strictEqual(oList.getActive(), false, "The list should be inactive initially");
				assert.strictEqual(oList.getSelectedItems().length, 0, "The list should not contain any selections initially");
				oList.getItems()[0].setSelected(true);
				oList._updateActiveState();
				assert.strictEqual(oList.getActive(), true, "List should be active after selecting item");
				oList.getItems()[0].setSelected(false);
				oList._updateActiveState();
				assert.strictEqual(oList.getActive(), false, "List should not remain active after deselecting last item");

				oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

					var oFacetListItem = getDialogFacetList(oFF).getItems()[1];

					oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

						// Verify the active state when the select all checkbox is checked
						var oList = getDialogFilterItemsList(oFF);
						assert.strictEqual(oList.getActive(), false, "The list should be inactive initially");
						assert.strictEqual(oList.getSelectedItems().length, 0, "The list should not contain any selections initially");

						var oFilterItemsPage = getDialogFilterItemsPage(oFF);
						var oCheckboxBar = oFilterItemsPage.getContent()[0];
						var oCheckBox = oCheckboxBar.getContentLeft()[0];
						assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should be deselected initially");

						oCheckBox.fireSelect({"selected": true});
						oList._updateActiveState();
						assert.strictEqual(oList.getActive(), true, "List should be active after selecting the select all checkbox");

						oCheckBox.fireSelect({"selected": false});//Checkbox allow deselection

						oList._updateActiveState();
						assert.strictEqual(oList.getActive(), false, "List should not be active after deselect the select all checkbox");

						oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

							var oFacetListItem = getDialogFacetList(oFF).getItems()[2];
							oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {
								// Verify active state when the selected item is filtered from the list
								var oList = getDialogFilterItemsList(oFF);
								assert.strictEqual(oList.isBound("items"), true, "Items should be bound when test requires filtering");
								assert.strictEqual(oList.getActive(), false, "The list should be inactive initially");
								assert.strictEqual(oList.getSelectedItems().length, 0, "The list should not contain any selections initially");
								oList.getItems()[0].setSelected(true);
								oList._search("Val2");
								oList._updateActiveState();
								assert.strictEqual(oList.getActive(), true, "List should be active after filtering out selected item");

								destroyFF(oFF);
								done();
							});

							// Navigate to the third list
							oFF._navToFilterItemsPage(oFacetListItem);
						});
						oFF._navFromFilterItemsPage(oNavContainer);
					});

					// Navigate to the second list
					oFF._navToFilterItemsPage(oFacetListItem);
				});
				oFF._navFromFilterItemsPage(oNavContainer);
			});

			// Navigate to the first list
			oFF._navToFilterItemsPage(oFacetListItem);
		});
		oFF.openFilterDialog();
	});

	QUnit.test("FacetFilterList._updateActiveState for initially active lists", function(assert) {
		var done = assert.async();
		//prepare
		var oFF = new FacetFilter(),
		oFFL1 = new FacetFilterList({
			title: "List1"
		});
		oFFL1.addItem(new FacetFilterItem());
		oFF.addList(oFFL1);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oDialog = oFF._getFacetDialog();
		oDialog.attachEventOnce("afterOpen", function(oEvent) {

			var oFacetListItem = getDialogFacetList(oFF).getItems()[0];
			var oNavContainer = oDialog.getContent()[0];
			oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

				// Verify the active state when an item is selected and then deselected
				var oList = getDialogFilterItemsList(oFF);
				//assert
				assert.strictEqual(oList.getActive(), true, "The list should be active initially");
				assert.strictEqual(oList.getSelectedItems().length, 0, "The list should not contain any selections initially");
				//act
				oList.getItems()[0].setSelected(true);
				oList._updateActiveState();
				//assert
				assert.strictEqual(oList.getActive(), true, "List should be active after selecting item");
				//act
				oList.getItems()[0].setSelected(false);
				oList._updateActiveState();
				//assert
				assert.strictEqual(oList.getActive(), true, "List should not remain active after deselecting last item");

				//cleanup
				destroyFF(oFF);
				done();
			});

			// Navigate to the list
			oFF._navToFilterItemsPage(oFacetListItem);
		});
		oFF.openFilterDialog();
	});


	QUnit.test("FacetFilterList._search, _getSearchValue", function(assert) {

		var aValues = [{text : "a"}, {text : "ba"}, {text : "c"}, {text: ''}, {text: ' '}, {text: null}, {}];
		var oModel = new JSONModel({
			values : aValues
		});

		var oFFL = new FacetFilterList();
		oFFL.bindAggregation("items", {
			path : "/values",
			template : new FacetFilterItem({
				text : "{text}"
			})
		});
		oFFL.setModel(oModel);

		oFFL._search("x");
		assert.strictEqual(oFFL.getItems().length, 0, "No items should match");
		assert.equal(oFFL._getSearchValue(), "x", "Search value should be set correctly");
		oFFL._search("");
		assert.strictEqual(oFFL.getItems().length, aValues.length, "Filter should be cleared and all items displayed");
		assert.equal(oFFL._getSearchValue(), "", "Search value should be set correctly");
		oFFL._search("c");
		assert.strictEqual(oFFL.getItems().length, 1, "One item should match");
		oFFL._search("");
		assert.strictEqual(oFFL.getItems().length, aValues.length, "Filter should be cleared");
		oFFL._search("a");
		assert.strictEqual(oFFL.getItems().length, 2, "Two items should match");

		oFFL.destroy();
	});

	QUnit.test("FacetFilterList._search with relative binding", function (assert) {
		// Arrange
		var oModel = new JSONModel({values: ["a", "b", "c"]}),
				oFFL = new FacetFilterList({
					title: "Values",
					items: {
						path: "m>/values",
						template: new FacetFilterItem({
							text: {path: "m>"}
						})
					}
				}),
				oFF = new FacetFilter({lists: [oFFL]});

		sap.ui.getCore().setModel(oModel, "m");
		oFF.placeAt("content");

		// Act
		oFFL._search("c");

		// Assert
		assert.strictEqual(oFFL.getItems().length, 1, "One item should match");
		assert.equal(oFFL.getItems()[0].getText(), "c", ".. and this should be the third one");

		// Cleanup
		oFF.destroy();
	});

	QUnit.test("FacetFilterList search on different bind parts", function(assert) {

		var aValues = [{country : "Bulgaria", city: "Sofia"}, {country : "Germany", city: "Stuttgart"}, {country: "Brunei", city: "Brunei"}];
		var oModel = new JSONModel({
			values : aValues
		});

		var oFFL = new FacetFilterList();
		oFFL.bindAggregation("items", {
			path : "/values",
			template : new FacetFilterItem().bindProperty("text", {
				parts: [
					{path:'country'},
					{path: 'city'}
				],
				formatter: function (Country, City) {
					return Country + " " + City;
				}
			})
		});
		oFFL.setModel(oModel);
		var aResult = oFFL.getItems();

		oFFL._search("S");
		aResult = oFFL.getItems();
		assert.equal(aResult.length, 2, "Matched two items Sofia and Stuttgart");
		assert.equal(aResult[0].getText(), "Bulgaria Sofia", "first item is correct");
		assert.equal(aResult[1].getText(), "Germany Stuttgart", "second item is correct");

		oFFL._search("x");
		aResult = oFFL.getItems();
		assert.equal(aResult.length, 0, "No Matches found");

		oFFL._search("ga");
		aResult = oFFL.getItems();
		assert.equal(aResult.length, 2, "Matched two items 'Bulgaria' and 'Stuttgart' because of 'ga'");
		assert.equal(aResult[0].getText(), "Bulgaria Sofia", "first item is correct");
		assert.equal(aResult[1].getText(), "Germany Stuttgart", "second item is correct");


		oFFL.destroy();
	});

	QUnit.test("FacetFilter searchValue of the list when FacetFilter _navFromFilterItemsPage is called", function (assert) {
		// arrange
		var oFF = new FacetFilter(),
			oFFL = new FacetFilterList(),
			oSearchSpy = this.spy(oFFL, "_search"),
				restoreListFromDisplayContainerStub = this.stub(oFF, "_restoreListFromDisplayContainer", function () {
					return oFFL;
				}),
			oNavContainer = {
				getPages: function () { return [new Page()];},
				backToTop: function () {}
			},
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			};

		oFFL.attachEventOnce("search", function(oEvent) {
			oEvent.preventDefault();
		});

		oFF._selectedFacetItem = { setCounter: function () {} };

		// act
		oFF._navFromFilterItemsPage(oNavContainer);

		// assert
		assert.ok(oSearchSpy.calledWith(""), "_search method is called with empty string when navigation out of list is performed");
		assert.equal(oFFL._getSearchValue(), "", "Search value should be set correctly");

		// act
		oFFL._handleSearchEvent(oFakeEvent);
		oFF._navFromFilterItemsPage(oNavContainer);

		// assert
		assert.notOk(oSearchSpy.calledTwice, "_search method was not called when default filtering behavour of the FacetFilterList is prevented");

		// cleanup
		oSearchSpy.restore();
		restoreListFromDisplayContainerStub.restore();
		oFFL.destroy();
	});

	QUnit.test("FacetFilter searchValue of the list is reset when FacetFilter dialog is closed", function (assert) {
		// arrange
		var done = assert.async(),
			oFF = new FacetFilter(),
			oFFL = new FacetFilterList();

		oFF.addList(oFFL);

		// act
		oFF.openFilterDialog();
		var oDialog = oFF.getAggregation("dialog"),
			oNavContainer = oDialog.getContent()[0];

		oFF._navToFilterItemsPage(oNavContainer.getPages()[0].getContent()[0].getItems()[0]);
		oNavContainer.attachEventOnce("afterNavigate", function () {
			oFF._closeDialog();
		});

		oDialog.attachEventOnce("afterClose", function () {
			// assert
			assert.equal(oFFL._getSearchValue(), "", "Search value should be set correctly");

			// cleanup
			oFFL.destroy();
			done();
		});
	});

	QUnit.test("FacetFilterList searchValue not reset when FacetFilter dialog is closed and default filtering behavior is prevented", function (assert) {
		// arrange
		var done = assert.async(),
			oFF = new FacetFilter(),
			oFFL = new FacetFilterList(),
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			},
			oSearchSpy = this.spy(oFFL, "_search");

		oFFL.attachEventOnce("search", function(oEvent) {
			oEvent.preventDefault();
		});

		oFF.addList(oFFL);

		// act
		oFFL._handleSearchEvent(oFakeEvent);
		oFF.openFilterDialog();
		var oDialog = oFF.getAggregation("dialog"),
			oNavContainer = oDialog.getContent()[0];

		oFF._navToFilterItemsPage(oNavContainer.getPages()[0].getContent()[0].getItems()[0]);
		oNavContainer.attachEventOnce("afterNavigate", function () {
			oFF._closeDialog();
		});

		oDialog.attachEventOnce("afterClose", function () {
			// assert
			assert.notOk(oSearchSpy.called, "_search function not called when default filtering behavior of the list is prevented");

			// cleanup
			oFFL.destroy();
			oSearchSpy.restore();
			done();
		});
	});

	QUnit.test("FacetFilterList.prototype._applySearch - default filtering prevented", function(assert) {
		// arrange
		var oList = new FacetFilterList(),
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			},
			fnSearchSpy = this.spy(oList, "_search");

		oList.attachEventOnce("search", function(oEvent) {
			oEvent.preventDefault();
		});

		// act
		oList._handleSearchEvent(oFakeEvent);
		oList._applySearch();

		// assert
		assert.ok(fnSearchSpy.notCalled, "_search function was not called");

		// clean
		fnSearchSpy.restore();
		oList.destroy();
	});

	QUnit.test("FacetFilter.prototype._openPopover - default filtering prevented", function(assert) {
		// arrange
		var done = assert.async(),
			oFacetFilter = new FacetFilter({
				lists: [new FacetFilterList()]
			}),
			oTargetList = oFacetFilter.getLists()[0],
			oButtonOpener = oFacetFilter._getButtonForList(oTargetList),
			oPopover = oFacetFilter._getPopover(),
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			},
			fnSetSearchValueSpy = this.spy(oTargetList, "_setSearchValue");

		oTargetList.attachEventOnce("search", function(oEvent) {
			oEvent.preventDefault();
		});

		oFacetFilter.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oTargetList._handleSearchEvent(oFakeEvent);
		oFacetFilter._openPopover(oPopover, oButtonOpener);

		// assert
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(fnSetSearchValueSpy.calledOnce, "_setSearchValue function was called once");
			assert.notOk(this.getSubHeader().getVisible(), "allCheckBoxBar is invisible");

			// clean
			fnSetSearchValueSpy.restore();
			oFacetFilter.destroy();
			done();
		});
	});

	QUnit.test("FacetFilter allCheckboxBar - visibility ajdustment", function(assert) {
		// arrange
		var done = assert.async(),
			oFacetFilter = new FacetFilter({
				lists: [new FacetFilterList()]
			}),
			oTargetList = oFacetFilter.getLists()[0],
			oButtonOpener = oFacetFilter._getButtonForList(oTargetList),
			aValues = [{key : 'k1',text : "a"}, {key : 'k2',text : "ba"}, {key : 'k3',text : "c"}],
			oModel = new JSONModel({
				values : aValues
			}),
			oPopover = oFacetFilter._getPopover(),
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			};

		oFacetFilter.setModel(oModel);
		oFacetFilter.placeAt("content");
		sap.ui.getCore().applyChanges();

		oTargetList.attachEvent("search", function(oEvent) {
			var sSearchString = oEvent.getParameters()["term"];

			this.bindItems({
				path : "/values",
				template : new FacetFilterItem({
					text : "{text}",
					key : "{key}"
				}),
				filters: [new Filter("text", 'Contains', sSearchString.toLowerCase())]
			});

			oEvent.preventDefault();
		});

		// act
		oFacetFilter._openPopover(oPopover, oButtonOpener);

		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			// act
			oTargetList._handleSearchEvent(oFakeEvent);

			// assert
			assert.equal(oTargetList.getBinding("items").getLength(), 3, "There three items in the list");
			assert.ok(oPopover.getSubHeader().getVisible(), "AllCheckBoxBar is visibile");

			// act
			oFakeEvent = {
				getParameters: function () {
					return {
						query: "test"
					};
				}
			};
			oTargetList._handleSearchEvent(oFakeEvent);

			// assert
			assert.equal(oTargetList.getBinding("items").getLength(), 0, "There are no items in the list");
			assert.notOk(oPopover.getSubHeader().getVisible(), "AllCheckBoxBar is not visibile");

			// clean
			oFacetFilter.destroy();
			done();
		});
	});

	QUnit.test("FacetFilterList.listItemsChange", function(assert) {
		// arrange
		var done = assert.async(),
			oFacetFilter = new FacetFilter({
				// We add to FacetFilterLists in order to trigger "FacetFilter.prototype.getLists" function twice
				// and after that check if event with ID "listItemsChange" is attached only once to every list
				lists: [new FacetFilterList(), new FacetFilterList()]
			}),
			oList = oFacetFilter.getLists()[0],
			aValues = [{key : 'k1',text : "a"}, {key : 'k2',text : "ba"}, {key : 'k3',text : "c"}],
			oModel = new JSONModel({
				values : aValues
			}),
			fnFireEventSpy = this.spy(oList, "fireEvent");

		oFacetFilter.setModel(oModel);
		oList.bindItems({
			path : "/values",
			template : new FacetFilterItem({
				text : "{text}",
				key : "{key}"
			})
		});

		// assert
		oList.attachEventOnce("updateFinished", function() {

			// assert
			assert.ok(fnFireEventSpy.calledWith("listItemsChange"), "listItemsChange private event is fired");
			assert.equal(EventProvider.getEventList(this)["listItemsChange"].length, 1, "Event with ID 'listItemsChange' is attached only once to the FacetFilterList instance");

			// clean
			fnFireEventSpy.restore();
			oFacetFilter.destroy();
			done();
		});
	});

	QUnit.test("FacetFilterList._updateSelectAllCheckBox", function(assert) {
		var done = assert.async();

			var aValues = [{key : 'k1',text : "a"}, {key : 'k2',text : "ba"}, {key : 'k3',text : "c"}],
				oModel = new JSONModel({
					values : aValues
				});

			var oFFL = new FacetFilterList();
			oFFL.bindAggregation("items", {
				path : "/values",
				template : new FacetFilterItem({
					text : "{text}",
					key : "{key}"
				})
			});
			oFFL.setModel(oModel);
			var oFF = new FacetFilter();
			oFF.addList(oFFL);
			oFF.placeAt("content");
			sap.ui.getCore().applyChanges();

			var oPopover = oFF._getPopover();
			oPopover.attachEventOnce("afterOpen", function(oEvent) {
				var sSearchId = getPopoverFilterItemsList(oPopover).getAssociation("search");
				var oSearch = sap.ui.getCore().byId(sSearchId);
				//This moves the focus out of the filter items, because when item is focused and deleted (due to filtering) on Crhome the focus for this item is lost and the popover closes.
				oSearch.focus();

				var oCheckBox = getPopoverSelectAllCheckBox(oPopover);
				assert.ok(oCheckBox.getTooltip(),"Select All Checkbox for popover has tooltip");
				assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected");


				oFFL.getItems()[0].setSelected(true); // _updateSelectAllCheckBox called implicitly when list selection changes
				assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected when only 1 of 3 items is selected");

				oFFL.getItems()[1].setSelected(true); // _updateSelectAllCheckBox called implicitly when list selection changes
				oFFL.getItems()[2].setSelected(true); // _updateSelectAllCheckBox called implicitly when list selection changes
				setTimeout(function () {
					assert.strictEqual(oCheckBox.getSelected(), true, "Select all checkbox should be selected because all 3 of 3 items are selected");


					oFFL.getItems()[2].setSelected(false); // _updateSelectAllCheckBox called implicitly when list selection changes
					setTimeout(function () {
						assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected, because only 2 of 3 items is selected");

						oFFL.getItems()[0].setSelected(false); // _updateSelectAllCheckBox called implicitly when list selection changes
						oFFL.getItems()[1].setSelected(false); // _updateSelectAllCheckBox called implicitly when list selection changes

						// Verify the select all checkbox state is set correctly after search
						if (!Device.browser.msie) {
							simulateUserSearch("c", oFFL);
							oFFL.getItems()[0].setSelected(true);
						}

						setTimeout(function () {
							if (!Device.browser.msie) {
								assert.strictEqual(oCheckBox.getSelected(), true, "Select all checkbox should be selected after search, because 1 of 1 items is selected");
							}

							simulateUserSearch(undefined, oFFL);

							// When no item.setSelected is called, no need to async wait via setTimeout. This is because when item.setSelected is called,
							// the "All" checkbox update is postponed (see FacetFilterList.prototype.onItemSelectedChange)

							// Verify the select all checkbox state remains unchanged after search
							if (!Device.browser.msie) {
								assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected after search, because 1 of 3 items is selected");
								simulateUserSearch("a", oFFL);
								oFFL.getItems()[0].setSelected(false);
							} else {
								assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected after search, because 0 of 3 items is selected");
							}

							setTimeout(function () {
								// Verify the select all checkbox state remains unchanged after search
								if (!Device.browser.msie) {
									assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected after search, because 0 of 3 items is selected");
								}
								simulateUserSearch(undefined, oFFL);
								assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected after search, because 0 of 3 items is selected");

								//When search finds no items, the "All" checkbox should not be selected
								simulateUserSearch("This item surely not exist", oFFL);

								assert.strictEqual(oCheckBox.getSelected(), false, "Select all checkbox should not be selected after search, because no result is found");

								destroyFF(oFF);
								done();

							}, 1000);
						}, 1000);
					}, 1000);
				}, 1000);
			});
			openPopover(oFF, 0);
		});

	QUnit.test("FacetFilterList._resetItemsBinding", function(assert) {

		var oFFL = new FacetFilterList();
		oFFL.setSelectedKeys({"val1": "Val1", "val2": "Val2"});

		oFFL.bindAggregation("items", {
			path: "/values",
			template: new FacetFilterItem({
				text: "{text}",
				key: "{key}"
			})
		});

		assert.equal(oFFL.getSelectedItems().length, 2, "Selected items should not have been removed");

		oFFL._searchValue = "x";

		oFFL.setModel(new JSONModel({
			values: [{text: "Val1", key: "val1"}, {text: "Val2", key: "val3"}]
		}));

		assert.strictEqual(oFFL._searchValue, "", "Search value is cleared after items binding is reset");

		assert.equal(oFFL.getSelectedItems().length, 2, "Selected items should not have been removed");

		oFFL.setModel(new JSONModel({
			values: [{text: "Val1", key: "val1"}, {text: "Val2", key: "val3"}]
		}));

		assert.equal(oFFL.getSelectedItems().length, 2, "Selected items should not have been removed after binding again");

		oFFL.destroy();
	});

	QUnit.test("FacetFilterList._getScrollingArrow", function(assert) {

		var oFF = new FacetFilter();

		var oArrow = oFF._getScrollingArrow();
		assert.ok(!oArrow, "Arrow control is null if an invalid name is given");
		oArrow = oFF._getScrollingArrow("left");
		assert.ok(oArrow, "Arrow control is created");
		assert.ok(oArrow instanceof sap.ui.core.Icon, "Arrow is an Icon");
		assert.equal(oArrow.getId(), oFF.getId() + "-arrowScrollLeft", "Icon id is correct");
		assert.ok(oArrow.hasStyleClass("sapMPointer"), "Style class is set");
		assert.ok(oArrow.hasStyleClass("sapMFFArrowScroll"), "Style class is set");
		assert.ok(oArrow.hasStyleClass("sapMFFArrowScrollLeft"), "Style class is set");
		assert.ok(oFF.getAggregation("arrowLeft"), "arrowLeft aggregation is set");
		assert.ok(oArrow.getTooltip(), "arrowLeft has tooltip");
		assert.strictEqual(oFF._getScrollingArrow("left"), oArrow, "Icon is created only once");


		oArrow = oFF._getScrollingArrow("right");
		assert.ok(oArrow, "Arrow control is created");
		assert.ok(oArrow instanceof sap.ui.core.Icon, "Arrow is an Icon");
		assert.equal(oArrow.getId(), oFF.getId() + "-arrowScrollRight", "Icon id is correct");
		assert.ok(oArrow.hasStyleClass("sapMPointer"), "Style class is set");
		assert.ok(oArrow.hasStyleClass("sapMFFArrowScroll"), "Style class is set");
		assert.ok(oArrow.hasStyleClass("sapMFFArrowScrollRight"), "Style class is set");
		assert.ok(oFF.getAggregation("arrowRight"), "arrowLeft aggregation is set");
		assert.ok(oArrow.getTooltip(), "arrowRight has tooltip");
		assert.strictEqual(oFF._getScrollingArrow("right"), oArrow, "Icon is created only once");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterItem.init", function(assert) {
		var oItem = new FacetFilterItem();

		assert.ok(oItem.hasStyleClass("sapMFFLI"), "sapMFFLI style class set");
		oItem.destroy();
	});

	QUnit.test("_getMapFacetLists returns a new array with the lists", function(assert) {
		// Arrange
		var aLists = [{
			getTitle: function () { return "First List"; },
			getAllCount: function () { return 1; }
		}, {
			getTitle: function () { return "Second List"; },
			getAllCount: function () { return 2; }
		}];
		var aExpectedList = [{
			text: aLists[0].getTitle(),
			count: aLists[0].getAllCount(),
			index: 0
		}, {
			text: aLists[1].getTitle(),
			count: aLists[1].getAllCount(),
			index: 1
		}];
		var oFacetFilter = new FacetFilter();
		var oGetListsStub = this.stub(oFacetFilter, "getLists", function () { return aLists; });
		var aResult = [];

		// Act
		aResult = oFacetFilter._getMapFacetLists();

		// Assert
		assert.equal(aResult.length, aLists.length, "new list should have the same length");
		assert.deepEqual(aResult, aExpectedList, "new list should be correct");

		// Cleanup
		oGetListsStub.restore();
		oFacetFilter.destroy();
	});

	QUnit.module("Public API");

	QUnit.test("FacetFilterItem.setCount", function(assert) {

		var iCount1 = 14, iCount2 = 67;
		var oItem = new FacetFilterItem();

		oItem.setCount(iCount1);
		assert.equal(oItem.getCount(), iCount1, "Item count should be set");
		assert.equal(oItem.getCounter(), iCount1, "Item counter should be set to the same value");

		oItem.setCount(iCount2);
		assert.equal(oItem.getCount(), iCount2, "Item count should be set");
		assert.equal(oItem.getCounter(), iCount2, "Item counter should be set to the same value");

		oItem.destroy();
	});

	QUnit.test("FacetFilterItem.setCounter", function(assert) {

		var iCount1 = 14, iCount2 = 67;
		var oItem = new FacetFilterItem();

		oItem.setCounter(iCount1);
		assert.equal(oItem.getCount(), iCount1, "Item count should be set");
		assert.equal(oItem.getCounter(), iCount1, "Item counter should be set to the same value");

		oItem.setCounter(iCount2);
		assert.equal(oItem.getCount(), iCount2, "Item count should be set");
		assert.equal(oItem.getCounter(), iCount2, "Item counter should be set to the same value");

		oItem.destroy();
	});

	QUnit.test("FacetFilter.openFilterDialog", function(assert) {

		var oFF = new FacetFilter();
		oFF.openFilterDialog();

		var oDialog = oFF.getAggregation("dialog");
		assert.ok(oDialog.isOpen(), "Dialog should be opened");
		var aContent = oDialog.getContent();
		assert.equal(aContent.length, 1, "Dialog contains one control in its content");
		assert.ok(aContent[0] instanceof sap.m.NavContainer, "The dialog content is a NavContainer");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter.removeList, removeAggregation", function(assert) {

		var oFF = new FacetFilter({
			showPersonalization : true
		});
		oFF.addList(new FacetFilterList());
		oFF.addList(new FacetFilterList());
		oFF.addList(new FacetFilterList());
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnGetButtonRefs = function() {
			var aButtonRefs = [];
			for ( var sRef in oFF._buttons) {
				aButtonRefs.push(sRef);
			}
			return aButtonRefs;
		};
		var fnGetIconRefs = function() {

			var aIconRefs = [];
			for ( var sRef in oFF._removeFacetIcons) {
				aIconRefs.push(sRef);
			}
			return aIconRefs;
		};
		var fnTestAggregations = function(iExpected, sRemoveListId) {

			assert.equal(fnGetButtonRefs().length, iExpected, "The buttons map should have " + iExpected + " buttons");
			assert.equal(oFF.getAggregation("buttons").length, iExpected, "The buttons aggregation should have " + iExpected
					+ " buttons");
			assert.equal(fnGetIconRefs().length, iExpected, "The remove icon map should have" + iExpected + "icons");
			assert.equal(oFF.getAggregation("removeFacetIcons").length, iExpected, "The removeFacetIcons aggregation should have "
					+ iExpected + " icons");

			if (sRemoveListId) {
				assert.strictEqual(oFF._buttons[sRemoveListId], undefined, "Button entry in buttons map should be deleted");
				assert.strictEqual(oFF._removeFacetIcons[sRemoveListId], undefined,
						"Icon entry in removeFacetIcons map should be deleted");
			}
		};

		// Establish baseline conditions
		fnTestAggregations(3);

		// Now incrementally remove all lists
		var sRemoveListId = oFF.getLists()[0].getId();
		oFF.removeList(oFF.getLists()[0]);
		fnTestAggregations(2, sRemoveListId);

		var sRemoveListId = oFF.getLists()[0].getId();
		oFF.removeList(oFF.getLists()[0]);
		fnTestAggregations(1, sRemoveListId);

		var sRemoveListId = oFF.getLists()[0].getId();
		oFF.removeAggregation("lists", oFF.getLists()[0]);
		fnTestAggregations(0, sRemoveListId);

		destroyFF(oFF);
	});


	QUnit.test("FacetFilterList.removeSelections model inherited from core, binding in listOpen", function(assert) {

		var aItemsData = [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}];
		var oModel = new JSONModel({
			values: aItemsData
		});
		sap.ui.getCore().setModel(oModel);

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title: "List",
			listOpen: function(oEvent) {

				this.bindAggregation("items", {
					path: "/values",
					template: new FacetFilterItem({
						text: "{text}",
						key: "{key}"
					})
				});
				this.removeSelections(true);
				assert.equal(this.getSelectedItems().length, 0, "All items should be deselected");
				destroyFF(oFF);
			}
		});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFFL.setSelectedKeys({"1": "Val1", "2": "Val2"});
		oFFL.fireListOpen();
	});

	QUnit.test("FacetFilterList.removeSelections model set directly on list (not inherited)", function(assert) {

		var aItemsData = [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}];

		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList({
			items: {
				path: "/values",
				template: new FacetFilterItem( {
					text: "{text}",
					key: "{key}"
				})
			}
		});
		oFFL1.setModel(new JSONModel({
			values: aItemsData
		}));
		oFF.addList(oFFL1);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFFL1.setSelectedKeys({"1": "Val1", "2": "Val2"});

		oFFL1.removeSelections(false);
		var aKeys = Object.getOwnPropertyNames(oFFL1.getSelectedKeys());
		assert.equal(aKeys.length, 2, "All keys should be returned");
		oFFL1.removeSelections(); // no parameter
		aKeys = Object.getOwnPropertyNames(oFFL1.getSelectedKeys());
		assert.equal(aKeys.length, 2, "All keys should be returned");
		oFFL1.removeSelections(true);
		aKeys = Object.getOwnPropertyNames(oFFL1.getSelectedKeys());
		assert.equal(aKeys.length, 0, "No keys should be returned");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.removeSelections no model and no binding", function(assert) {
		var oFFL = new FacetFilterList();
		oFFL.setSelectedKeys({"1": "Val1", "2": "Val2"});
		oFFL.removeSelections(true);
		var aKeys = Object.getOwnPropertyNames(oFFL.getSelectedKeys());
		assert.equal(aKeys.length, 0, "No keys should be returned");
		oFFL.destroy();
	});

	QUnit.test("FacetFilterList.getSelectedItems", function(assert) {

		var aItemsData = [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}];

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			growingThreshold: 2, // Make sure the third item is not actually created so that we can test selection
			items: {
				path: "/values",
				template: new FacetFilterItem( {
					text: "{text}",
					key: "{key}"
				})
			}
		});

		var oModel = new JSONModel({
			values: aItemsData
		});
		oFFL.setModel(oModel);
		assert.equal(oFFL.getItems().length, 2, "Only two items should be created");
		oFF.addList(oFFL);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var aSelectedItems = oFFL.getSelectedItems();
		assert.equal(aSelectedItems.length, 0, "Empty array should be returned when nothing is selected");

		oFFL.setSelectedKeys({"1": "Val1", "3": "Val3"});

		var aKeys = Object.getOwnPropertyNames(oFFL.getSelectedKeys());
		aSelectedItems = oFFL.getSelectedItems();
		assert.equal(aSelectedItems.length, aKeys.length, "Number of selected keys should match the number of selected items");
		assert.equal(aSelectedItems.length, 2, "All items selected via keys should be returned");
		assert.equal(aSelectedItems[0].getKey(), "1", "First item key should be correct");
		assert.equal(aSelectedItems[1].getKey(), "3", "Second item key should be correct");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.getSelectedItem", function(assert) {

		var aItemsData = [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}];

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			mode: ListMode.SingleSelectMaster,
			growingThreshold: 2, // Make sure the third item is not actually created so that we can test selection
			items: {
				path: "/values",
				template: new FacetFilterItem( {
					text: "{text}",
					key: "{key}"
				})
			}
		});

		var oModel = new JSONModel({
			values: aItemsData
		});
		oFFL.setModel(oModel);
		oFF.addList(oFFL);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFFL.getSelectedItem(), null, "No item should be selected");

		oFFL.setSelectedKeys({"1": "Val1"});

		assert.equal(oFFL.getSelectedItem().getKey(), "1", "Item should be selected");

		oFFL.setSelectedKeys({"3": "Val3"});
		assert.ok(oFFL.getSelectedItem(), "Item should be selected");
		oFFL.getSelectedItem() && assert.equal(oFFL.getSelectedItem().getKey(), "3", "The correct item should be selected");

		// Now the multi-select case
		oFFL = new FacetFilterList({
			items: {
				path: "/values",
				template: new FacetFilterItem( {
					text: "{text}",
					key: "{key}"
				})
			}
		});

		var oModel = new JSONModel({
			values: aItemsData
		});
		oFFL.setModel(oModel);
		oFF.addList(oFFL);

		oFFL.setSelectedKeys({"35": "Val35", "23": "Val23", "67": "Val16", "16": "Val16"});
		assert.ok(oFFL.getSelectedItem(), "Item should be selected");
		oFFL.getSelectedItem() && assert.equal(oFFL.getSelectedItem().getKey(), "16", "The last added item should be selected when the list is multi-select");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.removeItem", function(assert) {

		var oFFL = new FacetFilterList();
		var oFFI1 = new FacetFilterItem({text: "Val1", key: "1"});
		var oFFI2 = new FacetFilterItem({text: "Val2", key: "2", selected: true});
		oFFL.addItem(oFFI1);
		oFFL.addItem(oFFI2);

		var oItem = oFFL.removeItem(oFFI2);
		assert.strictEqual(oItem, oFFI2, "The returned item should match the removed item");
		var aSelectedKeys = Object.getOwnPropertyNames(oFFL.getSelectedKeys());
		assert.equal(aSelectedKeys.length, 0, "There should be no selected keys");

		oFFL.destroy();
	});

	QUnit.test("FacetFilterList.removeSelectedKey, _removeSelectedKey", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		// No errors appear when method is called first time
		oFFL.removeSelectedKey();

		oFFL._addSelectedKey("key1");
		oFFL._addSelectedKey("key2", "text");

		oFFL.removeSelectedKey("key1");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1, "1 item removed from _oSelectedKeys");

		oFFL.removeSelectedKey("key1");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1,
				"Removal of the same item does not remove another item");

		oFFL.removeSelectedKey("key2");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 0,
				"The last item removed from _oSelectedKeys");

		// No error appear when removing from empty object
		oFFL.removeSelectedKey("key2");
		oFFL.removeSelectedKey(undefined, "key2");

		var sItemText = "Graphics Card";
		oFFL._addSelectedKey(undefined, sItemText);
		oFFL.removeSelectedKey(undefined, sItemText);
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 0, "item removed from _oSelectedKeys");

		oFFL.addItem(new FacetFilterItem({key: "addedItem", text: "Memory Module", selected: true}));
		var iNumItems = oFFL.getItems().length;
		assert.equal(oFFL.getSelectedItems()[0].getKey(), "addedItem", "Added item is selected");
		oFFL.removeSelectedKey("addedItem");
		assert.equal(oFFL.getItems()[iNumItems - 1].getSelected(), false, "Added item is not selected");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.removeSelectedKeys", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({"1": "Val1", "2": "Val2", "3": "Val3"});
		oFFL.removeSelectedKeys();

		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 0, "All keys are removed");
		assert.strictEqual(oFFL.getSelectedItems().length, 0, "All items are deselected");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList._setSearchValue", function(assert) {
		var oFacetFilterList = new FacetFilterList(),
			sPredefinedSearchValue = "a";

		//Act
		oFacetFilterList._setSearchValue(sPredefinedSearchValue);

		//Assert
		assert.equal(oFacetFilterList._getSearchValue(), sPredefinedSearchValue, "sets the correct _searchValue");
	});

	QUnit.test("_searchValue is reset before popover opens", function(assert) {
		var done = assert.async();
		var oFacetFilter = new FacetFilter(),
			oFacetFilterList = new FacetFilterList({
				items: [
					new FacetFilterItem({
						key: "one",
						text: "One",
						selected: true
					}),
					new FacetFilterItem({
						key: "two",
						text: "Two",
						selected: false
					})
				]
			}),
			oPopover;

		oFacetFilter.addList(oFacetFilterList);

		oFacetFilter.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oResetSearchSpy = sinon.spy(oFacetFilterList, "_setSearchValue");

		oPopover = oFacetFilter._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			//Assert
			assert.ok(oResetSearchSpy.calledWith(""), "Search value is reset");
			oFacetFilterList._setSearchValue.restore();
			destroyFF(oFacetFilter);
			done();
		});

		openPopover(oFacetFilter, 0);
	});
	//BCP: 1680160703
	QUnit.test("FacetFilterList._handleSelectAllClick does not inform the list for item selection changes", function(assert) {
		var oFFL = new FacetFilterList({
			items: [
				new FacetFilterItem({
					key: "one",
					text: "One",
					selected: true
				}),
				new FacetFilterItem({
					key: "two",
					text: "Two",
					selected: false
				}),
				new FacetFilterItem({
					key: "three",
					text: "Three",
					selected: false
				})
			]
		}),
			oItemSetSelectedSpy = sinon.spy(ListItemBase.prototype, "setSelected");

		//act
		oFFL._handleSelectAllClick(true);

		//assert
		assert.ok(oItemSetSelectedSpy.calledThrice, "setSelected called 3 times");
		assert.ok(oItemSetSelectedSpy.args[0][1], "1st time called with bDontNotifyParent: true");
		assert.ok(oItemSetSelectedSpy.args[1][1], "2nd time called with bDontNotifyParent: true");
		assert.ok(oItemSetSelectedSpy.args[2][1], "3rd time called with bDontNotifyParent: true");

		//clean
		ListItemBase.prototype.setSelected.restore();
		oFFL.destroy();
	});

	QUnit.module("Events", {
		beforeEach: function () {
			//Arrange
			this.oFacetFilter = new FacetFilter({
				lists: [
					new FacetFilterList({
						title: "List 1",
						items: [
							new FacetFilterItem({
								key: "one",
								text: "One",
								selected: true
							}),
							new FacetFilterItem({
								key: "two",
								text: "Two",
								selected: false
							}),
							new FacetFilterItem({
								key: "three",
								text: "Three",
								selected: false
							})
						]
					}),
					new FacetFilterList({
						title: "List 2",
						items: [
							new FacetFilterItem({
								key: "one",
								text: "One",
								selected: true
							}),
							new FacetFilterItem({
								key: "two",
								text: "Two",
								selected: false
							}),
							new FacetFilterItem({
								key: "three",
								text: "Three",
								selected: false
							})
						]
					})
				]
			});
			this.oFacetFilter.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oFacetFilter.destroy();
		}
	});

	QUnit.test("FacetFilterList.search - default filtering prevented", function(assert) {
		// arrange
		var oList = this.oFacetFilter.getLists()[0],
			oFakeEvent = {
				getParameters: function () {
					return {
						query: ""
					};
				}
			},
			fnFireSearchSpy = this.spy(oList, "fireSearch"),
			fnSearchSpy = this.spy(oList, "_search"),
			fnSetSearchValueSpy = this.spy(oList, "_setSearchValue");

		oList.attachEventOnce("search", function(oEvent) {
			oEvent.preventDefault();
		});

		// act
		oList._handleSearchEvent(oFakeEvent);

		// assert
		assert.ok(fnFireSearchSpy.calledOnce, "fireSearch function was called once");
		assert.ok(fnSearchSpy.notCalled, "_search function was not called");
		assert.ok(fnSetSearchValueSpy.calledOnce, "_setSearchValue function was called once");

		// clean
		fnFireSearchSpy.restore();
		fnSearchSpy.restore();
		fnSetSearchValueSpy.restore();
	});

	QUnit.test("FacetFilterList.listOpen", function(assert) {
		var done = assert.async();
		var oListOpenEvent = null;
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});
		oFFL.attachEventOnce("listOpen", function(oEvent) {
			assert.ok(oEvent, "List open event should exist");
			oFF._closePopover();
			done();
		});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			destroyFF(oFF);
		});

		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilterList.listClose - none selected", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});
		oFFL.attachListClose(function(oEvent) {
			assert.ok(oEvent, "Event should exist");
			var aSelectedItems = oEvent.getParameter("selectedItems");
			assert.equal(aSelectedItems.length, 0, "No items should be selected");
			var oSelectedKeys = oEvent.getParameter("selectedKeys");
			assert.equal(Object.getOwnPropertyNames(oSelectedKeys).length, 0, "No items should be selected");
			var bAllSelected = oEvent.getParameter("allSelected");
			assert.equal(bAllSelected, true, "allSelected parameter should be true");
			destroyFF(oFF);
			done();
		});
		oFFL.addItem(new FacetFilterItem({
			selected : false
		}));
		oFFL.addItem(new FacetFilterItem({
			selected : false
		}));
		oFFL.addItem(new FacetFilterItem({
			selected : false
		}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function() {

			oFF._closePopover();
		});
		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilterList.listClose - some selected", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});
		oFFL.attachListClose(function(oEvent) {
			assert.ok(oEvent, "Event should exist");
			var aSelectedItems = oEvent.getParameter("selectedItems");
			assert.equal(aSelectedItems.length, 2, "Two items should be selected");
			assert.strictEqual(aSelectedItems[0].getKey(), oFFL.getItems()[0].getKey(), "The first item should be present in the event");
			assert.strictEqual(aSelectedItems[1].getKey(), oFFL.getItems()[2].getKey(), "The last item should be present in the event");
			assert.ok(aSelectedItems[0].getSelected(), "The item should be selected");
			assert.ok(aSelectedItems[1].getSelected(), "The item should be selected");

			var oSelectedKeys = oEvent.getParameter("selectedKeys");
			assert.equal(Object.getOwnPropertyNames(oSelectedKeys).length, 2, "Two items should be selected");

			var bAllSelected = oEvent.getParameter("allSelected");
			assert.strictEqual(bAllSelected, false, "allSelected parameter should be false");

			destroyFF(oFF);
			done();
		});
		oFFL.addItem(new FacetFilterItem({
			selected : true,
			key: "1",
			text: "Val1"
		}));
		oFFL.addItem(new FacetFilterItem({
			selected : false,
			key: "2",
			text: "Val2"
		}));
		oFFL.addItem(new FacetFilterItem({
			selected : true,
			key: "3",
			text: "Val3"
		}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function() {

			oFF._closePopover();
		});
		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilterList.listClose - all selected", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});
		oFFL.attachListClose(function(oEvent) {
			assert.ok(oEvent, "Event should exist");
			var aSelectedItems = oEvent.getParameter("selectedItems");
			assert.equal(aSelectedItems.length, 3, "All items should be selected");
			assert.strictEqual(aSelectedItems[0].getKey(), oFFL.getItems()[0].getKey(), "The first item should be present in the event");
			assert.strictEqual(aSelectedItems[1].getKey(), oFFL.getItems()[1].getKey(), "The second item should be present in the event");
			assert.strictEqual(aSelectedItems[2].getKey(), oFFL.getItems()[2].getKey(), "The last item should be present in the event");
			assert.ok(aSelectedItems[0].getSelected(), "The item should be selected");
			assert.ok(aSelectedItems[1].getSelected(), "The item should be selected");
			assert.ok(aSelectedItems[2].getSelected(), "The item should be selected");
			var bAllSelected = oEvent.getParameter("allSelected");
			assert.strictEqual(bAllSelected, false, "allSelected parameter should be false");

			destroyFF(oFF);
			done();
		});
		oFFL.addItem(new FacetFilterItem({
			key: "1",
			selected : true
		}));
		oFFL.addItem(new FacetFilterItem({
			key: "2",
			selected : true
		}));
		oFFL.addItem(new FacetFilterItem({
			key: "3",
			selected : true
		}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function() {

			oFF._closePopover();
		});
		openPopover(oFF, 0);
	});

	/**
	 * When the user clicks on the delete facet icon, the following event flows are possible:
	 * a) quick click - icon touchstart, icon touchend, icon press, popover afterClose
	 * b) click, hold & release delete icon - icon touchstart, popover afterClose, icon touchend, icon press
	 * c) click, hold delete icon, but release elsewhere - icon touchstart, popover afterClose, elsewhere touchend
	 **/

	QUnit.test("FacetFilterList.listClose - called only once(scenario a)", function (assert) {
		testListCloseCalledOnce.call(this, "Icon.touchstart->Icon.touchend->Icon.press->Popover.afterClose", "a");
	});
	QUnit.test("FacetFilterList.listClose - called only once(scenario b)", function (assert) {
		testListCloseCalledOnce.call(this, "Icon.touchstart->Popover.afterClose->Icon.touchend->Icon.press", "b");
	});

	QUnit.test("FacetFilterList.listClose - called only once(scenario c)", function (assert) {
		testListCloseCalledOnce.call(this, "Icon.touchstart->Popover.afterClose->Icon.touchend(outside the icon)-> no icon.press", "c");
	});

	function testListCloseCalledOnce(sSubtestName, sScenario) {
		var done = assert.async();
		var oFF = this.oFacetFilter;
		var oFFL = oFF.getLists()[0];

		var listCloseListener = function(oEvent) {
			this.parent = oEvent.getSource().getParent();
		};
		var oListCloseSpy = sinon.spy(listCloseListener.bind(this));

		oFFL.attachEvent("listClose", oListCloseSpy);
		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function () {
			var oList = oFF._displayedList;
			var oIcon = oFF._getFacetRemoveIcon(oList);
			switch (sScenario) {
				case "a":
					callIconDelegate("ontouchstart", oIcon);
					callIconDelegate("ontouchend", oIcon);
					oIcon.firePress({});
					oPopover.fireAfterClose({});
					break;
				case "b":
					callIconDelegate("ontouchstart", oIcon);
					oPopover.fireAfterClose({});
					callIconDelegate("ontouchend", oIcon);
					oIcon.firePress({});
					break;
				case "c":
					callIconDelegate("ontouchstart", oIcon);
					oPopover.fireAfterClose({});
					callIconDelegate("ontouchend", oIcon);
					break;
				default:
					assert.ok(false, "Invalid parameter test scenario: " + sScenario);
			}
			setTimeout(function () {
				assert.equal(oListCloseSpy.callCount, 1, sSubtestName + "# calls");
				assert.equal(this.parent.getId(), oFF.getId(), "listClose handler should be provided with the instance of FacetFilter as event's source parent");
				assert.equal(this.parent.getMetadata().getName(), oFF.getMetadata().getName(), "listClose handler should be provided with FacetFilter as event's source parent");
				destroyFF(oFF);
				done();
			}.bind(this), 500);
		}.bind(this));

		openPopover(oFF, 0);
	}

	QUnit.test("FacetFilter.reset (no summary bar)", function(assert) {
		var done = assert.async();

		var oResetEvent = null;
		var oFF = new FacetFilter();

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.attachEventOnce("reset", function(oEvent) {
			assert.ok(oEvent, "Filter reset event triggered");
			destroyFF(oFF);
			done();
		});

		var oResetButton = oFF.getAggregation("resetButton");
		oResetButton.firePress();
	});

	QUnit.test("FacetFilter.reset (summary bar)", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showSummaryBar : true
		});

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.attachEventOnce("reset", function(oEvent) {
			assert.ok(oEvent, "Filter reset event triggered");
			destroyFF(oFF);
			done();
		});

		var oSummaryBar = oFF.getAggregation("summaryBar");
		var oResetButton = oSummaryBar.getContent()[2];
		oResetButton.firePress();
	});

	QUnit.test("FacetFilter click another button when popover is opened", function(assert) {
		var done = assert.async();
		var oFFL1ListCloseEvent = null, oFFL2ListOpenEvent = null;
		var oFF = new FacetFilter();
		var oFFL1 = new FacetFilterList({
			title : "List1"
		});
		var oFFL2 = new FacetFilterList({
			title : "List2"
		});
		oFF.addList(oFFL1);
		oFF.addList(oFFL2);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		// click another button after the first popover is opened
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			setTimeout(function() {
				openPopover(oFF, 1);
			}, 1000);
			oFF._closePopover();
		});

		// timeout error will appear if oFFL2.listOpen is not called

		// mark the listClose event is called
		oFFL1.attachEventOnce("listClose", function(oEvent) {
			// fail if the oFFL2.listOpen was called before
			assert.ok(!oFFL2ListOpenEvent, 'oFFL2.listOpen should not be called before oFFL1.listClose');
			if (oFFL2ListOpenEvent) {
				destroyFF(oFF);
				done();
			} else {
				oFFL1ListCloseEvent = oEvent;
			}
		});

		// check that the prevoius list was closed before
		oFFL2.attachEventOnce("listOpen", function(oEvent) {
			// fail if the oFFL1.listClose wasn't called
			assert.ok(oFFL1ListCloseEvent, "oFFL1.listClose should be called before oFFL2.listOpen");
			if (oFFL1ListCloseEvent) {
				var oPopover = oFF._getPopover();
				oPopover.attachEventOnce("afterOpen", function(oEvent) {
					destroyFF(oFF);
					done();
				});
			} else {
				oFFL2ListOpenEvent = oEvent;
			}
		});

		openPopover(oFF, 0);
	});

	QUnit.test("Reset button & dialog with list items filtering sync", function (assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		var oResetButton = oFF._createResetButton();
		oFF.placeAt("content");

		var iInitialItems = oFFL.getItems().length;
		assert.ok(iInitialItems > 0, "Items have been set");

		oFFL._searchValue = "5";
		oFFL._applySearch();
		sap.ui.getCore().applyChanges();
		assert.ok(oFFL.getItems().length !== iInitialItems, "Items are being filtered");

		oResetButton.firePress();
		assert.ok(oFFL.getItems().length === iInitialItems, "Items filtering is being reset properly");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter CONFIRM event - popover close", function (assert) {
		//Arrange
		var fnConfirmSpy = sinon.spy(),
			fnListOpenSpy = sinon.spy(),
			fnListCloseSpy = sinon.spy(),
			oTargetList = this.oFacetFilter.getLists()[0],
			oButtonOpener = this.oFacetFilter._getButtonForList(oTargetList),
			oPopover = this.oFacetFilter._getPopover();

		this.oFacetFilter.attachEvent("confirm", null, fnConfirmSpy, this);
		this.oFacetFilter.getLists().forEach(function (oList) {
			if (oList) {
				oList.attachEvent("listOpen", null, fnListOpenSpy, this);
				oList.attachEvent("listClose", null, fnListCloseSpy, this);
			}
		});

		this.oFacetFilter._openPopover(oPopover, oButtonOpener);
		sap.ui.getCore().applyChanges();
		this.oFacetFilter._handlePopoverAfterClose(oTargetList);
		sap.ui.getCore().applyChanges();
		//Assert
		assert.strictEqual(fnListOpenSpy.callCount, 1, "ListOpen is called once");
		assert.strictEqual(fnListCloseSpy.callCount, 1, "ListClose is called once");
		assert.strictEqual(fnConfirmSpy.callCount, 1, "Confirm event was fired");
	});

	QUnit.test("FacetFilter CONFIRM event - popover close (with OK button)", function (assert) {
		var done = assert.async();
		//Arrange
		var fnConfirmSpy = sinon.spy(),
			fnListOpenSpy = sinon.spy(),
			fnListCloseSpy = sinon.spy(),
			oTargetList = this.oFacetFilter.getLists()[0],
			oButtonOpener = this.oFacetFilter._getButtonForList(oTargetList),
			oPopover = this.oFacetFilter._getPopover(),
			oPopoverOKButton;

		this.oFacetFilter.setShowPopoverOKButton(true);
		oPopoverOKButton = this.oFacetFilter._addOKButtonToPopover(oPopover);
		this.oFacetFilter.attachEvent("confirm", null, fnConfirmSpy, this);
		this.oFacetFilter.getLists().forEach(function (oList) {
			if (oList) {
				oList.attachEvent("listOpen", null, fnListOpenSpy, this);
				oList.attachEvent("listClose", null, fnListCloseSpy, this);
			}
		});

		this.oFacetFilter._openPopover(oPopover, oButtonOpener);
		sap.ui.getCore().applyChanges();
		assert.strictEqual(fnListOpenSpy.callCount, 1, "ListOpen is called once");
		oPopoverOKButton.firePress({});
		sap.ui.getCore().applyChanges();
		setTimeout(function() {
			//Assert
			assert.strictEqual(fnListCloseSpy.callCount, 1, "ListClose is called once");
			assert.strictEqual(fnConfirmSpy.callCount, 1, "Confirm event was fired");
			done();
		},500);
	});

	QUnit.test("FacetFilter OK event - dialog close", function (assert) {
		//Arrange
		var fnConfirmSpy = sinon.spy(),
				fnListOpenSpy = sinon.spy(),
				fnListCloseSpy = sinon.spy(),
				oDialog = this.oFacetFilter._getFacetDialog(),
				oDialogOkButton = oDialog.getButtons()[0];

		this.oFacetFilter.attachEvent("confirm", null, fnConfirmSpy, this);
		this.oFacetFilter.getLists().forEach(function (oList) {
			if (oList) {
				oList.attachEvent("listOpen", null, fnListOpenSpy, this);
				oList.attachEvent("listClose", null, fnListCloseSpy, this);
			}
		});

		this.oFacetFilter.openFilterDialog();
		sap.ui.getCore().applyChanges();
		oDialogOkButton.firePress({});
		sap.ui.getCore().applyChanges();
		//Assert
		assert.strictEqual(fnConfirmSpy.callCount, 1, "Confirm event was fired");
	});

	QUnit.module("List Container Rendering");

	QUnit.test("Popover rendering", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPopoverOKButton : true
		});
		var oFFL = new FacetFilterList({
			title : "List"
		});
		var oFFI = new FacetFilterItem({
			text : "val"
		});
		oFF.addList(oFFL);
		oFFL.addItem(oFFI);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(oPopover.getDomRef(), "Popover should be rendered");
			assert.ok(oPopover.$().hasClass("sapMFFPop"), "Popover is rendered with the correct CSS class");

			assert.ok(oFFL.getDomRef(), "List should be rendered");
			assert.ok(oFFI.getDomRef(), "List item should be rendered");

			// Search field bar
			var oSearchFieldBar = oPopover.getCustomHeader();
			assert.ok(oSearchFieldBar.getDomRef(), "Popover custom header bar should be rendered");
			var oSearchField = oSearchFieldBar.getContentMiddle()[0];
			assert.ok(oSearchField.getDomRef(), "Popover search field should be rendered");

			// Select all checkbox bar
			var oCheckboxBar = oPopover.getSubHeader();
			assert.ok(oCheckboxBar.getDomRef(), "Popover subheader bar should be rendered");
			var oCheckbox = oCheckboxBar.getContentLeft()[0];
			assert.ok(oCheckbox.getDomRef(), "Select all checkbox should be rendered");

			// Popover ok button
			assert.ok(oPopover.getFooter().getDomRef(), "Popover OK button should be rendered");
			destroyFF(oFF);
			done();
		});
		openPopover(oFF, 0);
	});

	QUnit.test("Dialog rendering", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPersonalization : true
		});
		var oFFL = new FacetFilterList({
			title : "List"
		});
		var oFFI = new FacetFilterItem({
			text : "val"
		});
		oFF.addList(oFFL);
		oFFL.addItem(oFFI);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oDialog = oFF._getFacetDialog();
		oDialog.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(oDialog.getDomRef(), "Dialog should be rendered");
			assert.ok(oDialog.$().hasClass("sapMFFDialog"), "Dialog is rendered with the correct CSS class");

			// Facet list page
			var oSearchField = getDialogFacetSearch(oFF);
			assert.ok(oSearchField instanceof sap.m.SearchField, "Control should be an instance of SearchField");
			assert.ok(oSearchField.getTooltip(), "Dialog search field has tooltip");
			assert.ok(oSearchField.getDomRef(), "Facet search field should be rendered");
			var oFacetList = getDialogFacetList(oFF);
			assert.ok(oFacetList instanceof sap.m.List, "Control should be an instance of List");
			assert.ok(oFacetList.getDomRef(), "Dialog facet list should be rendered");
			var oFacetListItem = oFacetList.getItems()[0];
			assert.ok(oFacetListItem.getDomRef(), "Facet list item should be rendered");

			oFF._navToFilterItemsPage(oFacetListItem);

			// Filter items page
			var oFilterItemsPage = getDialogFilterItemsPage(oFF);
			assert.ok(oFilterItemsPage.getDomRef(), "Filter items page is rendered");

			var oSearchFieldBar = oFilterItemsPage.getSubHeader();
			assert.ok(oSearchFieldBar.getDomRef(), "Filter items page subheader bar should be rendered");
			var oSearchField = oSearchFieldBar.getContentMiddle()[0];
			assert.ok(oSearchField.getDomRef(), "Filter items page search field should be rendered");

			var oCheckboxBar = oFilterItemsPage.getContent()[0];
			assert.ok(oCheckboxBar.getDomRef(), "Filter items page select all checkbox bar should be rendered");
			var oCheckbox = oCheckboxBar.getContentLeft()[0];
			assert.ok(oCheckbox.getDomRef(), "Select all checkbox should be rendered");

			var oFilterItemsList = getDialogFilterItemsList(oFF);
			assert.ok(oFilterItemsList instanceof FacetFilterList, "Control should be an instance of FacetFilterList");
			assert.ok(oFilterItemsList.getDomRef(), "Filter items list is rendered");

			assert.ok(oFilterItemsList.getItems()[0].getDomRef(), "Filter item is rendered");

			destroyFF(oFF);
			done();
		});
		openDialogFromAddFacet(oFF);
	});

	QUnit.module("Properties");

	QUnit.test("FacetFilter.visible", function(assert) {

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList();
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFF.getVisible(), true, "Visibility should be enabled by default");
		assert.ok(getButtonCtrl(oFF, 0).getDomRef(), "Button should be rendered");

		oFF.setVisible(false);
		sap.ui.getCore().applyChanges();

		assert.ok(!getButtonCtrl(oFF, 0).getDomRef(), "Button should not be rendered");

		destroyFF(oFF);
	});



	QUnit.test("FacetFilter.retainListSequence", function(assert) {
			var oFF = new FacetFilter();


			// Verify that retainListSequence behavior when inactive and made active again.

			oFF.addList(new FacetFilterList({
				active : false,
				sequence : 9,
				retainListSequence : true
			}));
			oFF.addList(new FacetFilterList({
				sequence : 5
			}));
			oFF.addList(new FacetFilterList({
				active : false,
				sequence : 3,
				retainListSequence : false
			}));
			var aSequencedLists = oFF._getSequencedLists();
			assert.equal(aSequencedLists.length, 1, "There should be one sequenced list");
			assert.strictEqual(aSequencedLists[0].getRetainListSequence(), false,"List sequence should not be retained by default when list is inactive and made active again");
			assert.equal(aSequencedLists[0].getSequence(), 5, "Sequence of the list should be 5");

			oFF.getLists()[0].setActive(true);
			aSequencedLists = oFF._getSequencedLists();
			assert.equal(aSequencedLists.length, 2, "There should be two sequenced lists");
			assert.equal(aSequencedLists[0].getSequence(), 5, "Sequence of the first list should be 5");
			assert.equal(aSequencedLists[1].getSequence(), 9, "Sequence of the second list should be 9");

			oFF.getLists()[2].setActive(true);
			aSequencedLists = oFF._getSequencedLists();
			assert.equal(aSequencedLists.length, 3, "There should be three sequenced lists");
			assert.equal(aSequencedLists[0].getSequence(), 5, "Sequence of the first list should be 5");
			assert.equal(aSequencedLists[1].getSequence(), 9, "Sequence of the second list should be 9");
			assert.equal(aSequencedLists[2].getSequence(), 10, "Sequence of the second list should be 10");

			oFF.removeAllLists();

			oFF.destroy();
		});


	QUnit.test("FacetFilter.showPersonalization", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({items: [new FacetFilterItem({text: "Val"})]});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFF.getShowPersonalization(), false, "Personalization should be disabled by default");

		oFF.setShowPersonalization(true);
		sap.ui.getCore().applyChanges();

		assert.ok(getAddFacetCtrl(oFF).getDomRef(), "Add button should be displayed");
		assert.equal(getAddFacetCtrl(oFF).$().find(".sapUiIcon").attr("data-sap-ui-icon-content").charCodeAt(0), 57430,
				"The add icon should be the add-filter icon font.");

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(getRemoveIconCtrl(oFF, 0).getDomRef(), "Facet filter remove icon should be rendered");
			assert.equal(getRemoveIconCtrl(oFF, 0).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57799,
					"The remove icon should be the sys-cancel icon font.");
			assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLVisibleRemoveIcon"), "The remove icon should be displayed.");

			destroyFF(oFF);
			done();
		});

		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter.type", function(assert) {

		// Verify Simple type
		var sFFL1Title = "List1", sFFL2Title = "List2";
		var oFFSimple = new FacetFilter();
		oFFSimple.setShowPersonalization(true);
		oFFSimple.addList(new FacetFilterList({
			title : sFFL1Title,
			items: [new FacetFilterItem({text: "Val"})]
		}));
		oFFSimple.addList(new FacetFilterList({
			title : sFFL2Title,
			items: [new FacetFilterItem({text: "Val"})]
		}));
		oFFSimple.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnTestSimple = function(oFF) {

			if (!Device.system.phone) {

				var oFFL1 = oFF.getLists()[0];
				var oFFL2 = oFF.getLists()[1];

				// Main facet filter container
				assert.ok(oFF.getDomRef(), "Facet filter container should be rendered");
				assert.ok(oFF.$().hasClass("sapMFF"), "Facet filter container is rendered with the correct CSS class");

				// Popover buttons
				assert.ok(getButtonCtrl(oFF, 0).getDomRef(), "Facet filter button should be rendered");
				assert.ok(getButtonCtrl(oFF, 1).getDomRef(), "Facet filter button should be rendered");
				assert.ok(getButtonCtrl(oFF, 0).$().text().indexOf(oFFL1.getTitle()) !== -1,
						"Facet filter button text should be rendered");
				assert.ok(getButtonCtrl(oFF, 1).$().text().indexOf(oFFL2.getTitle()) !== -1,
						"Facet filter button text should be rendered");

				// Personalization, add facet icon
				assert.ok(getAddFacetCtrl(oFF).getDomRef(), "The add facet button should be rendered");
				assert.equal(getAddFacetCtrl(oFF).$().find(".sapUiIcon").attr("data-sap-ui-icon-content").charCodeAt(0), 57430,
						"The add icon should be the add-filter icon font.");

				// Personalization, remove facet icons
				assert.ok(getRemoveIconCtrl(oFF, 0).getDomRef(), "Facet filter remove icon should be rendered");
				assert.ok(getRemoveIconCtrl(oFF, 1).getDomRef(), "Facet filter remove icon should be rendered");
				assert.equal(getRemoveIconCtrl(oFF, 0).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57799,
						"The remove icon should be the sys-cancel icon font.");
				assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLHiddenRemoveIcon"), "The remove icon should be hidden.");
				assert.equal(getRemoveIconCtrl(oFF, 1).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57799,
						"The remove icon should be the sys-cancel icon font.");
				assert.ok(getRemoveIconCtrl(oFF, 1).$().hasClass("sapMFFLHiddenRemoveIcon"), "The remove icon should be hidden.");
			}


		};

		fnTestSimple(oFFSimple);

		// Verify Light type
		var oFFLight = new FacetFilter({
			type : FacetFilterType.Light
		});
		oFFLight.setShowPersonalization(true);
		oFFLight.addList(new FacetFilterList({
			title : sFFL1Title,
			items: [new FacetFilterItem({text: "Val"})]
		}));
		oFFLight.addList(new FacetFilterList({
			title : sFFL2Title,
			items: [new FacetFilterItem({text: "Val"})]
		}));

		oFFLight.placeAt("content");
		sap.ui.getCore().applyChanges();

		var fnTestLight = function(oFF) {
			var oSummaryBar = oFF.getAggregation("summaryBar"),
				oSummaryBarText = oSummaryBar.getContent()[0];

			assert.ok(oSummaryBar.getDomRef(), "Summary bar should be rendered");
			assert.ok(oSummaryBar.getActive(), "Summary bar should be active when type is Light");
			assert.ok(oSummaryBarText.getDomRef(), "Summary bar text should be rendered");
			assert.ok(oSummaryBarText.getText(), "There should be text in the summary bar");

			assert.strictEqual(oSummaryBar.$().attr("aria-labelledby"),
				InvisibleText.getStaticId("sap.m", "FACETFILTER_TITLE") + " " + oSummaryBarText.getId(),
				"aria-labelledby should consist of a hidden 'Filter' label and the filter's text");

			testResetInSummaryBar(oFF, true);

			oFF.setShowReset(false);
			testResetInSummaryBar(oFF, false);
			};
		fnTestLight(oFFLight);


		// Switch from simple to light
		oFFSimple.setType(FacetFilterType.Light);
		sap.ui.getCore().applyChanges();
		fnTestLight(oFFSimple);

		// Switch from light to simple
		oFFLight.setType(FacetFilterType.Simple);
		sap.ui.getCore().applyChanges();
		fnTestSimple(oFFLight);

		oFFSimple.destroy();
		oFFLight.destroy();

		// If running on the phone then test behavior if type is explicitly set to Simple
		/*  if (sap.ui.Device.system.phone) {

			var oFFPhone = new sap.m.FacetFilter({
				type : sap.m.FacetFilterType.Simple
			});
			oFFPhone.setShowPersonalization(true);

			oFFPhone.placeAt("content");
			sap.ui.getCore().applyChanges();
			fnTestLight(oFFPhone);
		 }  */

		 if (Device.system.phone) {

			var oFFPhone = new FacetFilter();

			oFFPhone.setType(FacetFilterType.Light);
				oSummaryBar.setActive(true);
			//oFFPhone.setShowPersonalization(true);

			oFFPhone.placeAt("content");
			sap.ui.getCore().applyChanges();
			//fnTestLight(oFFPhone);

		 }

	});


	QUnit.test("FacetFilter.type interval timer", function(assert) {
		var done = assert.async();
		var oFFLight = new FacetFilter({
			type : FacetFilterType.Light
		});
		var fnCheckOverflowSpy = sinon.spy(oFFLight, "_checkOverflow");

		oFFLight.placeAt("content");
		sap.ui.getCore().applyChanges();

		setTimeout(function () {
			assert.strictEqual(fnCheckOverflowSpy.callCount, 0, 'No _checkOverflow should be registered to the central timer in light mode.');

			fnCheckOverflowSpy.restore();
			done();
		}, 1000);

		oFFLight.destroy();
		oFFLight = null;
	});

	QUnit.test("FacetFilter.liveSearch", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "Live Search",
			items : {
				path : "/values",
				template : new FacetFilterItem({
					text : "{text}"
				})
			}
		});

		oFF.addList(oFFL);

		// Need a model and binding to test search
		var oListModel = new JSONModel({

			values : [{
				text : "Val1"
			}, {
				text : "Val2"
			}, {
				text : "Val10"
			}]
		});
		oFFL.setModel(oListModel);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			var oSearchField = getPopoverFilterItemsSearchField(oPopover);

			oFFL.attachEventOnce("updateFinished", function(oEvent) {

				var aFilteredItems = oFFL.getItems();
				assert.equal(aFilteredItems.length, 2, "There should be two items left after live search");
				assert.equal(aFilteredItems[0].getText(), "Val1");
				assert.equal(aFilteredItems[1].getText(), "Val10");

				// Now disable live search
				assert.ok(oFF.setLiveSearch(false), "setLiveSearch should support method chaining");

				oFFL.attachEventOnce("updateFinished", function(oEvent) {
					assert.ok(false, "Live search should not have triggered a search");
					destroyFF(oFF);
					done();
				});

				oSearchField.fireLiveChange({
					newValue : "x"
				});

				setTimeout(function() {
					// Start the test runner and destroy the FF after the search has completed
					destroyFF(oFF);
					done();
				});
			});

			oSearchField.fireLiveChange({
				newValue : "Val1"
			});
		});
		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter.showReset", function(assert) {
		var oFF = new FacetFilter();
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		// First test the reset button with a FacetFilter of Simple type
		assert.ok(
				oFF.$().hasClass("sapMFFResetSpacer"),
				"FacetFilter container should have spacer class to insure reset button does not overlay facet buttons when type is Simple");

		var $div = oFF.$().find(".sapMFFResetDiv");
		assert.equal($div.length, 1,
				"There should be a container element around the reset button having the correct style class");
		assert.ok($div.is("div"), "The container is a div");
		var $button = $div.find("button");
		assert.ok($button, "There should be a button element within the container element");
		oFF.setShowReset(false);
		sap.ui.getCore().applyChanges();

		assert.ok(
				!oFF.$().hasClass("sapMFFResetSpacer"),
				"FacetFilter container should not have spacer class to insure reset button does not overlay facet buttons when type is Simple");
		assert.equal(oFF.$().find(".sapMFFResetDiv").length, 0, "There should not be a div container");
		assert.equal(oFF.$().find(".sapMFF > button").length, 0, "There should not be a button");

		destroyFF(oFF);

		// Now test when the reset button is displayed in the summary bar
		var oFF = new FacetFilter({
			showSummaryBar : true
		});
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		testResetInSummaryBar(oFF, true);

		oFF.setShowReset(false);
		sap.ui.getCore().applyChanges();

		testResetInSummaryBar(oFF, false);

		 oFF.setShowReset(true);
		sap.ui.getCore().applyChanges();

		testResetInSummaryBar(oFF, true);

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter.showSummaryBar", function(assert) {

		var oFF = new FacetFilter();
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.ok(!oFF.getAggregation("summaryBar").getDomRef(), "Summary bar should not be displayed");

		oFF.setShowSummaryBar(true);
		sap.ui.getCore().applyChanges();

		var oSummaryBar = oFF.getAggregation("summaryBar");
		assert.ok(oSummaryBar.getDomRef(), "Summary bar should be displayed");
		assert.ok(!oSummaryBar.getActive(), "Summary bar should be inactive when type is Simple");
		testResetInSummaryBar(oFF, true);
		oFF.setShowSummaryBar(false);
		sap.ui.getCore().applyChanges();

		oFF.setShowSummaryBar(true);
		oFF.setShowReset(false);
		sap.ui.getCore().applyChanges();

		testResetInSummaryBar(oFF, false);

		oFF.setShowSummaryBar(true);
		oFF.setShowReset(true);
		sap.ui.getCore().applyChanges();

		testResetInSummaryBar(oFF, true);


		destroyFF(oFF);
	});


	QUnit.test("FacetFilterList.active", function(assert) {

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList();
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFFL.getActive(), true, "List active should be enabled by default");
		assert.ok(getButtonCtrl(oFF, 0).getDomRef(), "Button should be rendered");

		oFFL.setActive(false);
		sap.ui.getCore().applyChanges();

		assert.strictEqual(oFFL.getActive(), false, "List active should be disabled");
		assert.ok(!getButtonCtrl(oFF, 0).getDomRef(), "Button should not be rendered");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.multiSelect", function(assert) {

		var oFFL = new FacetFilterList();

		assert.ok(oFFL.setMultiSelect(false), "setMultiSelect should support method chaining");
		assert.strictEqual(oFFL.getMultiSelect(), false, "List multiSelect should be changed to false");
		assert.strictEqual(oFFL.getMode(), ListMode.SingleSelectMaster,
				"List mode should be changed to SingleSelectMaster");
		oFFL.destroy();
	});

	QUnit.test("FacetFilterList.mode", function(assert) {

		var oFFL = new FacetFilterList();

		assert.ok(oFFL.setMode(ListMode.SingleSelectMaster), "setMode should support method chaining");
		assert.strictEqual(oFFL.getMode(), ListMode.SingleSelectMaster, "List mode should be SingleSelectMaster");
		assert.strictEqual(oFFL.getMultiSelect(), false, "List multiSelect should be changed to false");

		oFFL.setMode(ListMode.None);
		oFFL.setMode(ListMode.SingleSelect);
		oFFL.setMode(ListMode.Delete);
		oFFL.setMode(ListMode.SingleSelectLeft);
		assert.strictEqual(oFFL.getMode(), ListMode.SingleSelectMaster,
				"Current list mode should be retained after attempting to set invalid modes");
		oFFL.destroy();
	});

	QUnit.test("FacetFilterList.title", function(assert) {

		var initialTitle = "a", changedTitle = "b";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : initialTitle
		});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		assert.equal(oFFL.getTitle(), initialTitle, "List title should be set to the initial value");
		assert.ok(getButtonCtrl(oFF, 0).$().text().indexOf(oFFL.getTitle()) !== -1,
				"Button label should be set to the initial value");

		assert.ok(oFFL.setTitle(changedTitle), "setTitle should support method chaining");
		sap.ui.getCore().applyChanges();

		assert.equal(oFFL.getTitle(), changedTitle, "List title should be set to the changed value");
		assert.ok(getButtonCtrl(oFF, 0).$().text().indexOf(oFFL.getTitle()) !== -1,
				"Button label should be set to the changed value");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter should be shrinkable", function(assert) {
		var oFF = new FacetFilter();
		assert.ok(oFF.getMetadata().isInstanceOf("sap.ui.core.IShrinkable"), "Facet filter is shrinkable");
		oFF.destroy();
	});

	QUnit.module("Selection Text Update");

	QUnit.test("Selection button text updated after popover close", function(assert) {
		var done = assert.async();

		var sItem1Text = "Val1";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});

		// Need to have more than one item otherwise selecting the only item in the list
		// is interpreted as all items selected and there will be no change in the button text
		oFFL.addItem(new FacetFilterItem({
			text : sItem1Text
		}));
		oFFL.addItem(new FacetFilterItem({
			text : "Val2"
		}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oPopover = oFF._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			var oList = getPopoverFilterItemsList(oPopover);
			oList.getItems()[0].setSelected(true);

			oPopover.attachEventOnce("afterClose", function(oEvent) {
				sap.ui.getCore().applyChanges();
				// var oButton = getButtonCtrl(oFF, 0);
				var oButton = oFF._getButtonForList(oFFL);
				assert.ok(oButton.getText().indexOf(sItem1Text) !== -1, "Button text should be updated with the selected value");
				destroyFF(oFF);
				done();
			});
			oFF._closePopover();
		});
		openPopover(oFF, 0);
	});

	QUnit.test("Selection button text updated after popover close - binding and search scenario", function(assert) {
		//arrange
		var done = assert.async(),
			aValues = [
				{key : 'k1',text : "a"},
				{key : 'k2',text : "ba"},
				{key : 'k3',text : "c"}
			],
			aNewModel = [
				{key : 'k4',text : "a1"},
				{key : 'k5',text : "ba1"},
				{key : 'k6',text : "a2"},
				{key : 'k7',text : "d1"}
			],
			oModel = new JSONModel({
				values : aValues
			}),
			oFF = new FacetFilter(),
			oFFL = new FacetFilterList(),
			oPopover = oFF._getPopover(),
			oButton = oFF._getButtonForList(oFFL),
			oList = getPopoverFilterItemsList(oPopover);

		oFFL.bindAggregation("items", {
			path : "/values",
			template : new FacetFilterItem({
				text : "{text}",
				key : "{key}"
			})
		});
		oFFL.setModel(oModel);
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			//act
			simulateUserSearch("a", oFFL);
			//the search will result in exactly three of four items
			oFFL.getItems()[0].setSelected(true);
			oFFL.getItems()[1].setSelected(true);
			oFFL.getItems()[2].setSelected(true);

			oPopover.attachEventOnce("afterClose", function(oEvent) {
				sap.ui.getCore().applyChanges();
				//assert
				assert.equal(oButton.getText(), " (3)",
						"Button text is 3 because the model was changed with another one with 4 items, 3 of them - selected during the search");
				destroyFF(oFF);
				done();
			});
			oFF._closePopover();

		});

		oModel.setProperty("/values", aNewModel);

		openPopover(oFF, 0);
	});

	QUnit.test("Selection button text updated after dialog close", function(assert) {
		var done = assert.async();

		var sItem1Text = "Val1";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List"
		});

		// Need to have more than one item otherwise selecting the only item in the list
		// is interpreted as all items selected and there will be no change in the button text
		oFFL.addItem(new FacetFilterItem({
			text : sItem1Text
		}));
		oFFL.addItem(new FacetFilterItem({
			text : "Val2"
		}));
		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oDialog = oFF._getFacetDialog();

		oDialog.attachEventOnce("afterOpen", function(oEvent) {

			var oNavContainer = oDialog.getContent()[0];
			oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

				var oList = getDialogFilterItemsList(oFF);
				oList.getItems()[0].setSelected(true);

				oDialog.attachEventOnce("afterClose", function(oEvent) {
					sap.ui.getCore().applyChanges();
					var oButton = getButtonCtrl(oFF, 0);
					assert.ok(oButton.getText().indexOf(sItem1Text) !== -1, "Button text should be updated with the selected value");
					destroyFF(oFF);
					done();
				});

				oFF._closeDialog();
			});
			oFF._navToFilterItemsPage(oNavContainer.getPages()[0].getContent()[0].getItems()[0]);
		});
		oFF.openFilterDialog();
	});
	/////////////////////////////////////////////////daniel//////////////////////////////////////////////////


	QUnit.test("Keyboard", function(assert) {

		var oFF = createFF(oFF);
		assert.ok(oFF.$().find(":sapTabbable").length == 4, "Total 4 tabble fields");
		var oEvent = new jQuery.Event();

//home
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.oItemNavigation.setFocusedIndex(0);
		oFF.onsaphome(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaphome tested - focus on List1");

		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsaphome(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaphome tested - focus on List1");

		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsaphome(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaphome tested - focus on List1");

//onsapincreasemodifiers - page down
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

//onsapdecreasemodifiers - page up
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oEvent.which = jQuery.sap.KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

//onsapupmodifiers
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.oItemNavigation.setFocusedIndex(1);
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapdownmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapdownmodifiers tested - focus on Add button");

		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapdownmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapdownmodifiers tested - focus on Add button");

		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsapdownmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapdownmodifiers event tested - focus on Add button");

		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsapdownmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapdownmodifiers event tested - focus on Add button");

//onsappagedow
		var oFF = createFF(oFF);
//  	var sapTabbable = oFF.$().find(":sapTabbable");
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.oItemNavigation.setFocusedIndex(2);
		assert.ok(jQuery(oFF.onsappagedown(oEvent)), "keyboard onsappagedown tested - case 1");

		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(0);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsappagedown(oEvent)), "keyboard onsappagedown tested - case 2");

//onsaptabnext
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 1");

		var oFF = createFF(oFF);
		oFF._invalidateFlag = true;
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 2");

		var oFF = createFF(oFF);
		oFF._closePopoverFlag = true;
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 3");
//onsapend
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapend(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapend tested - focus on add button");
		assert.ok(jQuery(oFF.onsapend(oEvent)), "keyboard onsapend tested - case 1");

		var oFF = createFF(oFF);
		oFF._addTarget = null;
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsapend(oEvent)), "keyboard onsapend tested - case 2");

//onsappageup
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsappageup(oEvent);
		assert.ok(jQuery(oFF.onsappageup(oEvent)), "keyboard onsappageup tested");

//expand
		oFF.oItemNavigation.setFocusedIndex(0);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsapexpand tested - focus on List2");

		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapexpand tested - focus on Add button");

		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(2);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapexpand tested - focus on Add button");

//collapse
		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(2);
		oFF.onsapcollapse(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsapcollapse tested - focus on List2");

		oFF.oItemNavigation.setFocusedIndex(1);
		oFF.onsapcollapse(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapcollapse tested - focus on list 1");

		oFF.oItemNavigation.setFocusedIndex(0);
		oFF.onsapcollapse(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapcollapse tested - focus on list 1");

//tabprev
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[1];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 2");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[0];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 3");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[2];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 4");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
//		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 5");

//down
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapdown(oEvent)), "keyboard onsapdown tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapdown(oEvent)), "keyboard onsapdown tested - case2 ");

//onsapescape
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsapescape(oEvent)), "keyboard onsapescape tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapescape(oEvent)), "keyboard onsapescape tested - case2");

//onsapup
		//*why need to comment out oEvent.hover in facetfilter.js -?????
		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapup(oEvent)), "keyboard onsapup tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapup(oEvent)), "keyboard onsapup tested - case 2");
//		assert.ok(jQuery(oEvent.target).focus(), "keyboard onsapup tested");

//onsapleft
		//*why need to comment out oEvent.hover in facetfilter.js -?????
		var oFF = createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsapleft(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsapleft tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapleft(oEvent)), "keyboard onsapleft tested - case 2");

//onsapright
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapright(oEvent)), "keyboard onsaprigh tested - case 1");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapright(oEvent)), "keyboard onsaprigh tested - case 2");

//onsapdelete
		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[0].getActive(), false, "keyboard onsapdelete tested - list1 deleted");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[1].getActive(), false, "keyboard onsapdelete tested - list2 deleted");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");


		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsapdelete(oEvent);
		assert.ok(oFF.getAggregation("addFacetButton"), "keyboard onsapdelete tested - can't delete addFacetButton");

		var oFF = createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsapdelete(oEvent);
		assert.ok(oFF.getAggregation("resetButton"), "keyboard onsapdelete tested - can't delete resetbutton");

		var oFF = createFF(oFF);
		oFF.setShowPersonalization(false);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.equal(oFF.getLists()[0].getActive(), true, "keyboard onsapdelete tested - no delete allowed, list1 active");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		var oFF = createFF(oFF);
		var oList = oFF.getLists()[1];
		oList.setShowRemoveFacetIcon(false);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.equal(oFF.getLists()[1].getActive(), true, "keyboard onsapdelete tested - no delete allowed, list2 active");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		//one of list is inactive
		var oFF = createFF(oFF, [
			new FacetFilterList("list101"),
			new FacetFilterList("list102", {active: false}),
			new FacetFilterList("list103") ]);

		oEvent.target = oFF.$().find(":sapTabbable")[1];//this should be the 3th list, as the second is not active
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[2].getActive(), false, "keyboard onsapdelete when one of list is inactive tested - list103 deleted(should be inactive)");
		assert.equal(oFF.getAggregation("buttons").length, 2, "keyboard onsapdelete when one of list is inactive tested - There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "keyboard onsapdelete when one of list is inactive tested - There should be two remove icons in the aggregation");

		var oFF = createFF(oFF);
		oFF.getLists()[1].setActive(false);
		oFF.getLists()[0].setActive(false);
		oFF.oItemNavigation.setFocusedIndex(0);
		assert.ok(jQuery(oFF.onsapdelete(oEvent)), "keyboard onsapdelete tested");

		destroyFF(oFF);

	});



	function createFF(oFF, aLists) {

		if (oFF) {
			oFF.destroy();
		}

		var oFF = new FacetFilter("someid");
		oFF.setShowPersonalization(true);
		if (!aLists) {
			oFF.addList(new FacetFilterList("list1"));
			oFF.addList(new FacetFilterList("list2"));
		} else {
			aLists.forEach(function(oList) {
				oFF.addList(oList);
			});
		}

//		oFF._createResetButton();
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();
		oFF._startItemNavigation();
		return oFF;

	}
	//////////////////////////////////////end////////////////////////////////////////////////////////////

	QUnit.module("Selected keys");

	/* Helper functions for the module */
	var oSCHelper = {

		createFFWithBinding : function(iLists, bSkipGrowing) {
			iLists = iLists == undefined ? 1 : iLists;
			var oFF = new FacetFilter({
				showPersonalization : true
			});
			for (var i = 0; i < iLists; i++) {
				var oFFL = new FacetFilterList({
					title : "List" + (i + 1),
					growing : !bSkipGrowing,
					growingThreshold : 3,
					items : {
						path : "/values",
						template : new FacetFilterItem({
							text : "{text}",
							key : "{key}"
						})
					}
				});
				oFF.addList(oFFL);
			}

			return oFF;
		},

		createModel : function() {
			return new JSONModel({
				values : [{
					text : "Val1",
					key : "1"
				}, {
					text : "Val2",
					key : "2"
				}, {
					text : "Val3",
					key : "3"
				}, {
					text : "Val4",
					key : "4"
				}, {
					text : "Val5",
					key : "5"
				}, {
					text : "Val6",
					key : "6"
				}]
			});
		},

		createFFWithModel : function(bSkipGrowing) {
			// Need a model and binding to test search
			var oFF = oSCHelper.createFFWithBinding(undefined, bSkipGrowing);
			oFF.getLists()[0].setModel(oSCHelper.createModel());
			return oFF;
		}
	};
	/* END Helper functions for the module */

	QUnit.test("FacetFilterList._addSelectedKey", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		oFFL.setMode(ListMode.SingleSelectMaster);

		oFFL._addSelectedKey();
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 0, "Undefined item is not added");

		oFFL._addSelectedKey(undefined, "test");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1, "Items without the keys are added");

		oFFL._addSelectedKey("key1");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1, "Item without text is added");
		assert.strictEqual(oFFL._oSelectedKeys["key1"], "key1", "If item has no text then key is used as a text");

		oFFL._addSelectedKey("key1", "text1");
		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1, "Items with text is added");
		assert.strictEqual(oFFL._oSelectedKeys["key1"], "text1", "Key/text pair is stored in the object");

		oFFL._addSelectedKey("key2", "text2");

		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 1, "Only one item isstored");
		assert.strictEqual(oFFL._oSelectedKeys["key2"], "text2", "Key/text pair is stored in the object");

		// Switch to mult select and verify more than one key is added
		oFFL.setMode(ListMode.MultiSelect);
		oFFL._addSelectedKey("key1", "text1");

		assert.strictEqual(Object.getOwnPropertyNames(oFFL._oSelectedKeys).length, 2, "Items with text is added");
		assert.strictEqual(oFFL._oSelectedKeys["key1"], "text1", "Key/text pair is stored in the object");
		assert.strictEqual(oFFL._oSelectedKeys["key2"], "text2", "Key/text pair is stored in the object");
		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList._isItemSelected",
			function(assert) {
				var oFF = oSCHelper.createFFWithModel();
				var oFFL = oFF.getLists()[0];

				// No errors appear when method is called first time
				oFFL._addSelectedKey("key1");
				oFFL._addSelectedKey("key2", "text2");
				oFFL._addSelectedKey("", "text3");

				assert.strictEqual(oFFL._isItemSelected(new FacetFilterItem({
					key : 'key1'
				})), true, 'Item with key only is selected');
				assert.strictEqual(oFFL._isItemSelected(new FacetFilterItem({
					key : 'key2'
				})), true, 'Item with key and text is selected');
				assert.strictEqual(oFFL._isItemSelected(new FacetFilterItem({
					text : 'text2'
				})), false, 'Item cannot be selected by text if the key is specified');
				assert.strictEqual(oFFL._isItemSelected(new FacetFilterItem({
					text : 'text3'
				})), true, 'Item with text only is selected');
				assert.strictEqual(oFFL._isItemSelected(new FacetFilterItem()), false,
						'Item with no text and key is not selected');
				assert.strictEqual(oFFL._isItemSelected(), false, '"undefined" item is not selected');

				destroyFF(oFF);
			});

	QUnit.test("Getting selected keys", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		var oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "There are no keys selected");

		oFFL.getItems()[1].setSelected(true);
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["2"], "Val2", "Key '2' is selected");

		oKeys["3"] = "Val3";
		assert.equal(Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length, 1,
				"Changing the result of getSelectedKeys does not change selected keys in FacetFilterList");

		destroyFF(oFF);
	});

	QUnit.test("Setting selected keys", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		var oSelectedKeys = {
			"2" : "Val2"
		};

		var oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "There are no keys selected");

		oFFL.getItems()[2].setSelected(true);
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["3"], "Val3", "Key '3' is selected");

		oFFL.setSelectedKeys(oSelectedKeys);

		oKeys = oFFL.getSelectedKeys();
		assert.strictEqual(oFFL.getItems()[1].getSelected(), true, "FacetFilterItem with key '2' is selected");
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["2"], "Val2", "Key '2' is selected");

		// Empty, null, undefined clears the list
		oFFL.setSelectedKeys({});
		oKeys = oFFL.getSelectedKeys();
		assert.strictEqual(oFFL.getItems()[1].getSelected(), false, "FacetFilterItem with key '2' is not selected");
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "Empty object clears selected keys");

		oFFL.setSelectedKeys(oSelectedKeys);
		oFFL.setSelectedKeys(null);
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "null clears selected keys");

		oFFL.setSelectedKeys(oSelectedKeys);
		oFFL.setSelectedKeys();
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "undefined clears selected keys");

		destroyFF(oFF);
	});

	QUnit.test("Setting selected keys with binding aggregation", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"2" : "Val2"
		});
		oFFL.setModel(oFFL.getModel());

		var oKeys = oFFL.getSelectedKeys();
		assert.strictEqual(oFFL.getItems()[1].getSelected(), true, "FacetFilterItem with key '2' is selected");
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["2"], "Val2", "Key '2' is selected");

		destroyFF(oFF);
	});

	QUnit.test("Filter model after selection", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		oFFL.setSelectedKeys({
			"3" : null
		});

		oFFL._search("Val2");
		var oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["3"], "Val3", "Key '3' is selected");

		oFFL._search("");
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oFFL.getItems()[2].getSelected(), true, "FacetFilterItem with key '3' is selected");
		assert.strictEqual(oKeys["3"], "Val3", "Key '3' is selected");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.onItemSetSelected", function(assert) {
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		oFFL.setActive(false);
		oFFL.setMultiSelect(false);

		var oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "There are no keys selected");

		oFFL.getItems()[1].setSelected(true);

		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 1, "There is one key selected");
		assert.strictEqual(oKeys["2"], "Val2", "Key '2' is selected");

		oFFL.getItems()[1].setSelected(false);
		oKeys = oFFL.getSelectedKeys();
		assert.equal(Object.getOwnPropertyNames(oKeys).length, 0, "There are no keys selected");

		oFFL.getItems()[1].setSelected(true);
		oKeys = oFFL._handleSelectAllClick(false);

		var oItem = oFFL.getItems()[0];
		oItem.setSelected(true);
		assert.strictEqual(oFFL._oSelectedItem, oItem,
				"ListBase.onItemSetSelected should have been called so that single selection state is maintained");

		destroyFF(oFF);
	});

	QUnit.test("Preselected items on growing list", function(assert) {
		var done = assert.async();
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});
		assert.equal(oFFL.getItems().length, 3, "There are only three items in the list");

		oFFL.attachEventOnce("updateFinished", function(oEvent) {
			assert.equal(oFFL.getItems().length, 6, "There are six items in the list");
			assert.strictEqual(oFFL.getItems()[3].getSelected(), true, "Item in the growing part was selected");

			destroyFF(oFF);
			done();
		});
		//TODO change this to actually display the popover
		oFFL._oGrowingDelegate.requestNewPage();
	});

	QUnit.test("Items in non-growing list are preselected before the model is assigned", function(assert) {

		var oFF = oSCHelper.createFFWithBinding();
		var oFFL = oFF.getLists()[0];
		oFFL.setGrowing(false);
		oFF.placeAt("content");
		oFFL.setSelectedKeys({
			"1" : "Val1"
		});
		oFFL.setModel(oSCHelper.createModel());
		assert.ok(!!Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length, "Selected keys are present");
		assert.ok(oFFL.getItems()[0].getSelected(), "Item is selected");

		oFFL.removeSelections(true);
		assert.equal(Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length, 0, "Selected keys are removed");
		assert.strictEqual(oFFL.getItems()[0].getSelected(), false, "Item is not selected");

		destroyFF(oFF);
	});

	QUnit.test("Items in non-growing list are preselected before items binding", function(assert) {

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : "List",
			growing : false
		});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		oFFL.setModel(oSCHelper.createModel());

		oFFL.setSelectedKeys({
			"1" : "Val1"
		});
		oFFL.bindAggregation("items", {
			path : "/values",
			template : new FacetFilterItem({
				text : "{text}",
				key : "{key}"
			})
		});

		assert.ok(!!Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length, "Selected keys are present");
		assert.ok(oFFL.getItems()[0].getSelected(), "Item is selected");

		oFFL.removeSelections(true);
		assert.equal(Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length, 0, "Selected keys are removed");
		assert.strictEqual(oFFL.getItems()[0].getSelected(), false, "Item is not selected");

		destroyFF(oFF);
	});

	QUnit.test("Update button text when items are preselected", function(assert) {
		var oFF = oSCHelper.createFFWithModel(true);
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		var oButton = oFF._getButtonForList(oFFL);
		assert.strictEqual(oButton.getText().indexOf("Val4") > -1, true,
				"Selected item is displayed on the button");

		oFFL.setSelectedKeys({
			"4" : "Val4",
			"2" : "Val4"
		});
		// rerendering required to display selected keys
		oFF.rerender();
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oButton.getText().indexOf("2") > -1, true, "Two items are displayed on the button");

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});
		oFFL._search("Val2");
		oFF.rerender();
		sap.ui.getCore().applyChanges();
		assert.strictEqual(oButton.getText().indexOf("Val4") > -1, true,
				"Selected item isd isplayed on the button");

		destroyFF(oFF);
	});

	// BCP: 1770321721
	QUnit.test("Update FacetFilterList selectedKeys cache when text of bound item is changed.", function (assert) {
		var done = assert.async(),
			oModel = new JSONModel({
				values: [{
					text : "Val1",
					key : "1"
				}, {
					text : "Val2",
					key : "2"
				}]
			}),
			oFF = new FacetFilter(),
			oFFL = new FacetFilterList({
				title : "List"
			});

		oFF.addList(oFFL);
		oFF.placeAt("content");
		oFFL.setModel(oModel);

		oFFL.bindAggregation("items", {
			path : "/values",
			template : new FacetFilterItem({
				text : "{text}",
				key : "{key}"
			})
		});

		oFFL.getItems()[0].setSelected(true);

		assert.equal(oFF._getSelectedItemsText(oFFL).length, 1, "Only one item is selected");
		assert.equal(oFF._getSelectedItemsText(oFFL)[0], "Val1", "Text of the selected item is Val1");

		oModel.setProperty("/values", [{
			text : "NewVal1",
			key : "1"
		}, {
			text : "Val2",
			key : "2"
		}]);

		oFFL.getItems()[0].setSelected(true);

		oFFL.attachUpdateFinished(function () {
			assert.equal(oFF._getSelectedItemsText(oFFL).length, 1, "Only one item is selected");
			assert.equal(oFF._getSelectedItemsText(oFFL)[0], "NewVal1", "Text of the selected item is NewVal1");
			destroyFF(oFF);
			done();
		});
	});

	//BCP: 144850 / 2018
	QUnit.test("Do not update selectedKeys cache in a non-growing list when filtering", function(assert) {
		//arrange
		var oFF = oSCHelper.createFFWithModel(true);
		var oFFL = oFF.getLists()[0];

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		//act
		oFFL._search("Val1", true);
		sap.ui.getCore().applyChanges();

		oFFL.getItems()[0].setSelected(true);
		sap.ui.getCore().applyChanges();

		oFFL._search("Val3", true);
		sap.ui.getCore().applyChanges();

		oFFL.getItems()[0].setSelected(true);
		sap.ui.getCore().applyChanges();

		//assert
		assert.equal(oFF._getSelectedItemsText(oFFL).join(","), "Val3,Val1", "Summary text is correct");

		//clean
		destroyFF(oFF);
	});

	QUnit.test("'All' checkbox to be unchecked when items are preselected and model is assigned later", function(assert) {
		var done = assert.async();
		var oFF = oSCHelper.createFFWithBinding();
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});


		oFF.placeAt('content');
		sap.ui.getCore().applyChanges();

		var oCheckbox = oFF._createSelectAllCheckboxBar(oFFL).getContentLeft()[0];

		oFFL.setModel(oSCHelper.createModel());

		assert.ok(!oCheckbox.getSelected(), "Select all checkbox should be unchecked because of preselected items");

		oFFL.setSelectedKeys({
			"1" : "Val1"
		});

		oCheckbox.fireSelect({
			selected : false
		});
		setTimeout(function () {
			assert.strictEqual(oFFL.getItems().filter(function (oItem) {return oItem.getSelected();}).length, 0, "Visible selected keys should be cleared by selecting 'All' checkbox");
			done();
		}, 1000);


		destroyFF(oFF);
	});

	QUnit.test("'All' checkbox initial state", function(assert) {
		var oFF = new FacetFilter(),
			oFFL = new FacetFilterList({
				multiSelect: true
			}),
			//sut
			oAllCheckbox;
		oFF.addList(oFFL);

		//act
		oFF._createSelectAllCheckboxBar(oFFL);

		oAllCheckbox = sap.ui.getCore().byId(oFFL.getAssociation("allcheckbox"));

		//assert
		assert.ok(oAllCheckbox, "all checkbox is created");
		assert.ok(!oAllCheckbox.getSelected(), "all checkbox is initially unchecked when created for a list with no items");

		//clean
		oFF.destroy();
	});

	QUnit.test("The selected keys are cleared when the list is made inactive", function(assert) {
		var done = assert.async();
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges(); //_getFacetRemoveIcon is implicitly called upon rendering

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});
		var oIcon = oFF.getAggregation("removeFacetIcons")[0];
		callIconDelegate("ontouchstart", oIcon);
		callIconDelegate("ontouchend", oIcon);
		oIcon.firePress({
			selected : true
		});
		setTimeout(function() {
			assert.ok(!Object.getOwnPropertyNames(oFFL.getSelectedKeys()).length,
					"Selected keys should be cleared by making list inactive");
			destroyFF(oFF);
			done();
		}, 500);
	});

	module("Buttons for List");

	QUnit.test("_bCheckForAddListBtn should be set to true when the list is multiSelect", function(assert) {
		var done = assert.async();

		var oFFL = new FacetFilterList({
			active: false,
			multiSelect: true,
			title : "List"
		});
		var oFF = new FacetFilter({
			showPersonalization : true
		});

		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {
			var oFacetFilterListPage = oNavContainer.getPages()[1];
			var oFacetFilterListBar = oFacetFilterListPage.getContent()[0];
			var oCheckbox = oFacetFilterListBar.getContentLeft()[0];
			// act
			oCheckbox.ontap(new jQuery.Event()); // check "All" checkbox

			var oDialog = oFF._getFacetDialog();
			var oDialogOkButton = oDialog.getButtons()[0];
			// act
			oDialogOkButton.firePress({}); // press "OK" button
		});

		oFF._getFacetDialog().attachEventOnce("afterClose", function(oEvent) {
			// Assert
			assert.ok(oFF._bCheckForAddListBtn, '_bCheckForAddListBtn should be set to true');
			sap.ui.getCore().applyChanges();
			setTimeout(function () {
				assert.equal(oFF.getAggregation("buttons"), null, 'The button for the list is not rendered, when the list is empty');
				destroyFF(oFF);
				done();
			}, 1000);
		});

		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.test("The button for the list is rendered, when _bCheckForAddListBtn is already true and for the list which is not active is set selected key programatically", function(assert) {
		var done = assert.async();
		var oSelectedKey = {};
		var fetchDimensionData = function(oEvent) {
			var oFacetList = oEvent.getSource();

			oFacetList.addItem(new FacetFilterItem({text: "Val"}));
		};

		var oFF = new FacetFilter({
			showPersonalization : true
		});
		var oFFL = new FacetFilterList({
			active: false,
			multiSelect: true,
			title: "List",
			listOpen: fetchDimensionData
		});

		var oFFL2 = new FacetFilterList({
			active: false,
			multiSelect: true,
			title: "List3",
			listOpen: fetchDimensionData
		});

		oFF.addList(oFFL);
		oFF.addList(oFFL2);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {
			var oFacetFilterListPage = oNavContainer.getPages()[1];
			var oFacetFilterListBar = oFacetFilterListPage.getContent()[0];
			var oCheckbox = oFacetFilterListBar.getContentLeft()[0];
			// act
			oCheckbox.ontap(new jQuery.Event()); // check "All" checkbox

			var oDialog = oFF._getFacetDialog();
			var oDialogOkButton = oDialog.getButtons()[0];
			// act
			oDialogOkButton.firePress({}); // press "OK" button
		});

		oFF._getFacetDialog().attachEventOnce("afterClose", function(oEvent) {
			// Assert
			setTimeout(function () {
				assert.ok(oFF.getAggregation("buttons")[0].getDomRef(), 'The button for the first list is rendered');

				// act
				// setSelectedKey - this will make the list active if it is in multiselect mode
				oSelectedKey['{"key1"}'] = "key1";
				oFFL2.setSelectedKeys(oSelectedKey);
				oFF.rerender();
				setTimeout(function () {
					// Assert
					assert.ok(oFF.getAggregation("buttons")[1].getDomRef(), 'The button for the second list is rendered');
					// clean
					destroyFF(oFF);
					done();
				}, 0);
			}, 1000);
		});

		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.test("The button for the list is rendered, when the list is empty but active", function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPersonalization : true
		});
		var oFFL = new FacetFilterList({
			active: true,
			multiSelect: true,
			title : "List"
		});

		oFF.addList(oFFL);
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = sap.ui.getCore().byId(oNavContainer.getInitialPage());
		var oFacetList = oFacetPage.getContent()[0];
		var oFacetListItem1 = oFacetList.getItems()[0];

		oNavContainer.attachEventOnce("afterNavigate", function() {
			var oFacetFilterListPage = oNavContainer.getPages()[1];
			var oFacetFilterListBar = oFacetFilterListPage.getContent()[0];
			var oCheckbox = oFacetFilterListBar.getContentLeft()[0];
			// act
			oCheckbox.ontap(new jQuery.Event()); // check "All" checkbox

			var oDialog = oFF._getFacetDialog();
			var oDialogOkButton = oDialog.getButtons()[0];
			// act
			oDialogOkButton.firePress({}); // press "OK" button
		});

		oFF._getFacetDialog().attachEventOnce("afterClose", function(oEvent) {
			// Assert
			setTimeout(function () {
				assert.ok(oFF.getAggregation("buttons")[0].getDomRef(), 'The button for the list is rendered, when the list is empty but active');
				destroyFF(oFF);
				done();
			}, 1000);
		});

		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.module('Group Headers', {
		beforeEach: function () {
			this.oFF = new FacetFilter({
				showPersonalization: true
			});
			this.oFFL = new FacetFilterList({
				title: "Group List Sample",
				showRemoveFacetIcon:false,
				items: {
					path: "/values",
					templateShareable : true,
					template: new FacetFilterItem( {
						text: "{text}",
						key: "{key}"
					}),
					sorter: [new Sorter({
						path: 'group',
						descending: false,
						group: true
					})],
					groupHeaderFactory: getGroupHeader
				},
				key:"FilterListWithGroupsKey"
			});

			this.oFFL.setModel(new JSONModel({
				values: [
					{key : "A01", text : "A1", selected : true, group: "A"},
					{key : "A02", text : "A2", selected : true, group: "A"},
					{key : "B01", text : "B1", selected : true, group: "B"},
					{key : "B02", text : "B2", selected : true, group: "B"}
				]
			}));
			this.oFF.addList(this.oFFL);
			this.oFF.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oFF.destroy();
			this.oFFL.destroy();
		}
	});

	QUnit.test("if _updateSelectAllCheckBox is checked, all items must be selected, but not the headers", function(assert) {
		var done = assert.async();
		//prepare
		var oPopover, oCheckbox, oSpy;

		//act
		oPopover = this.oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			oCheckbox = getPopoverSelectAllCheckBox(oPopover);
			//assert
			assert.ok(!oCheckbox.getSelected(), "Select all checkbox should be unchecked");

			//act
			oSpy = sinon.spy(oCheckbox,"setSelected");
			this.oFFL._updateSelectAllCheckBox();

			//assert
			assert.ok(oSpy.calledWith(false),
					"oCheckbox is called with setSelected(false) because the selected items < items.length");

			//act
			oCheckbox.ontap(new jQuery.Event());
			//assert
			assert.equal(oCheckbox.getSelected(), true, "Select all checkbox should be checked");
			assert.equal(this.oFFL.getSelectedItems().length, 4, "All items are selected also");

			//act
			this.oFFL._updateSelectAllCheckBox();

			//assert
			assert.equal(oSpy.calledWith(true), true,
					"oCheckbox is called with setSelected(true) because the selected items = items.length");
			done();
		}.bind(this));
		openPopover(this.oFF, 0);
	});

	QUnit.test("Only items could be selected, not headers", function (assert) {
		//prepare
		var oSpy, counter = 0;

		//act
		oSpy = sinon.spy(this.oFFL, "_isItemSelected");
		this.oFFL._selectItemsByKeys();
		for (var i = 0; i < this.oFFL.getAggregation("items").length; i++){
			if (!this.oFFL.getAggregation("items")[i]._bGroupHeader){
				counter++;
			}
		}
		// Assert
		assert.equal(oSpy.callCount, counter,
				"Group headers have '_bGroupHeader' property set to true and they don't have to be selected");

	});

	QUnit.module('Overflow Arrows', {
		beforeEach: function () {
			this.oFacetFilter = new FacetFilter({
				showPersonalization: true,
				type: "Simple",
				liveSearch: true,
				showSummaryBar: false,
				showReset: false,
				showPopoverOKButton: true,
				lists: [
					new FacetFilterList({
						key: "20160831",
						title: "8/31/2016"
					}),
					new FacetFilterList({
						key: "20160930",
						title: "9/30/2016"
					}),
					new FacetFilterList({
						key: "20161031",
						title: "10/31/2016"
					}),
					new FacetFilterList({
						key: "20161130",
						title: "11/30/2016"
					}),
					new FacetFilterList({
						key: "20161231",
						title: "12/31/2016"
					}),
					new FacetFilterList({
						key: "20170131",
						title: "1/31/2017"
					})
				]
			});
			var aItems = [this.oFacetFilter];
			this.oHBox = new HBox({
				height: "",
				width: "",
				displayInline: false,
				direction: "Row",
				fitContainer: false,
				renderType: "Div",
				justifyContent: "Start",
				alignItems: "Stretch",
				wrap: "NoWrap",
				alignContent: "Stretch",
				items: aItems
			});
			this.oHBox.placeAt('content');
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			this.oFacetFilter.destroy();
			this.oHBox.destroy();
		}
	});
	QUnit.test("Overflow arrows are not shown when FacetFilter is inside an flex element", function (assert) {
		var sLeftArrowCSSVisibility = jQuery(this.oFacetFilter.getDomRef('arrowScrollLeft')).css('visibility');
		var sRightArrowCSSVisibility = jQuery(this.oFacetFilter.getDomRef("arrowScrollRight")).css('visibility');

		assert.strictEqual(sLeftArrowCSSVisibility, "hidden", "Left arrow is hidden");
		assert.strictEqual(sRightArrowCSSVisibility, "hidden", "Right arrow is hidden");
	});

	QUnit.module("Aria support", {
		beforeEach: function () {
			this.oFF = oSCHelper.createFFWithBinding(5);
			for (var i = 0; i < 5; i++) {
				this.oFF.getLists()[i].setModel(oSCHelper.createModel());
			}
			this.oFF.placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach: function () {
			destroyFF(this.oFF);
		},
		/**
		 *
		 * @param {int} iListCount the number of expected ff lists
		 */
		testFacetFilterList: function (iListCount) {
			var aExpectedDescribedBy = [],
					bAriaRemoveFacetFound = false;

			for (var i = 0; i < iListCount; i++) {
				var sAriaDescribedByList = getButtonCtrl(this.oFF, i).$().attr("aria-describedby");
				assert.ok(sAriaDescribedByList, "There must be attribute 'aria-describedby' for List" + (i + 1));

				var aAriaDescribedByList = sAriaDescribedByList.split(" ");
				assert.equal(aAriaDescribedByList.length, 2, "There must be attribute 'aria-describedby' for List" + (i + 1));

				var $InvisibleText0 = jQuery("#" + aAriaDescribedByList[0]);
				assert.ok($InvisibleText0.length, "'aria-describedby' must point to an existing static text");
				var sExpectedText = "Facet Filter " + (i + 1) + " of " + iListCount;
				assert.equal($InvisibleText0.text(), sExpectedText, "Positioning info");

				if (!bAriaRemoveFacetFound) {
					bAriaRemoveFacetFound = true;
					aExpectedDescribedBy.push(aAriaDescribedByList[1]);
				}
				aExpectedDescribedBy.push(aAriaDescribedByList[0]);
			}

			assert.equal(this.oFF.getRenderer().getAriaDescribedBy(this.oFF), aExpectedDescribedBy.join(" "), "FacetFilterRenderer.getAriaDescribedBy array check");
		}
	});

	QUnit.test("Facet filter role", function (assert) {
		assert.equal(this.oFF.$().attr("role"), "toolbar", "The role of the FacetFilter is 'toolbar'");
	});

	QUnit.test("Facet filter list positioning - initial", function (assert) {
		this.testFacetFilterList(5);
	});

	QUnit.test("Facet filter list positioning - after removal of list(s)", function (assert) {
		var aExpectedDescribedBy = [],
				bAriaRemoveFacetFound = false,
				oListToRemove = this.oFF.getLists()[2];

		this.oFF.removeList(oListToRemove);
		sap.ui.getCore().applyChanges();

		this.testFacetFilterList(4);
	});


	QUnit.module("Other scenarios");

	//BCP: 1770254364
	QUnit.test("Updating list items binding updates the button text", function(assert) {
		//arrange
		var done = assert.async(),
			data = [{
				key : "key1",
				text: "text1",
				selected: false
			},{
				key : "key2",
				text : "text2",
				selected : true
			}],
			newData = [{
				key : "key3",
				text: "text3",
				selected: false
			},{
				key : "key4",
				text : "text4",
				selected : false
			}],
			oFF = new FacetFilter(),
			oFFList = new FacetFilterList({
				title: "test",
				key: "test"
			}),
			oModel = new JSONModel(data);

		oFFList.bindItems("/", new FacetFilterItem({
			key : '{key}',
			text : '{text}',
			selected : '{selected}'
		}));
		oFF.addList(oFFList);
		oFFList.setModel(oModel);

		oFF.placeAt('content');
		sap.ui.getCore().applyChanges();
		assert.equal(oFF._getButtonForList(oFFList).getText(), "test (text2)", "button has the correct initial title");

		//act
		oModel.setData(newData);
		oModel.updateBindings();

		//this event handler is attached second, so it asserts after the original event handler has done the job (applied the fix)
		oFFList.attachUpdateFinished(function() {
			//assert
			assert.equal(oFF._getButtonForList(oFFList).getText(), "test", "button has the correct title after update items binding");
			oFF.destroy();
			done();
		});
	});

	//BCP: 1770489543
	QUnit.test("List item bindings sets button text properly when ListMode is SingleSelectMaster", function(assert) {
		//arrange
		var done = assert.async(),
				data = [{
					key : "key1",
					text: "text1",
					selected: false
				},{
					key : "key2",
					text : "text2",
					selected : true
				}],
				oFF = new FacetFilter(),
				oFFList = new FacetFilterList({
					title: "test",
					key: "test"
				}),
				oModel = new JSONModel(data);

		oFFList.setMode(ListMode.SingleSelectMaster);
		oFFList.bindItems("/", new FacetFilterItem({
			key : '{key}',
			text : '{text}',
			selected : '{selected}'
		}));
		oFF.addList(oFFList);
		oFFList.setModel(oModel);
		oFF.placeAt('content');
		sap.ui.getCore().applyChanges();

		oFFList.attachUpdateFinished(function () {
			//wait for all
			setTimeout(function () {
				assert.equal(oFF._getButtonForList(oFFList).getText(), "test (text2)", "button has the correct title after model is updated");

				oFF.destroy();
				done();
			}, 500);
		});
	});

	//BCP: 1770254364
	QUnit.test("Update on a model remembers selection properly", function(assert) {
		//arrange
		var done = assert.async(),
			data = [{
				key : "key1",
				text: "text1",
				selected: false
			},{
				key : "key2",
				text : "text2",
				selected : true
			}],
			newData = [{
				key : "key1",
				text: "text1",
				selected: false
			},{
				key : "key2",
				text : "text2",
				selected : false
			}],
			oFF = new FacetFilter(),
			oFFList = new FacetFilterList({
				title: "test",
				key: "test"
			}),
			oModel = new JSONModel(data);

		oFFList.bindItems("/", new FacetFilterItem({
			key : '{key}',
			text : '{text}',
			selected : '{selected}'
		}));
		oFF.addList(oFFList);
		oFFList.setModel(oModel);

		oFF.placeAt('content');
		sap.ui.getCore().applyChanges();

		//act
		oModel.setData(newData);
		oModel.updateBindings();

		//this event handler is attached second, so it asserts after the original event handler has done the job (applied the fix)
		oFFList.attachUpdateFinished(function() {
			//assert
			assert.equal(oFF._getButtonForList(oFFList).getText(), "test", "button has the correct title after update items binding");
			assert.equal(oFFList.getSelectedKeys()["key2"], null, "key2 is not selected");
			oFF.destroy();
			done();
		});
	});

	QUnit.test("Keep selected items when updatedFinished event is fired (eg. when Growing)", function(assert) {
		var done = assert.async(),
			aSelectedKeys,
			aSelectedItems = [],
			aItemsData = [{key: "1", text: "Val1"},{key: "2", text: "Val2"},{key: "3", text: "Val3"}],
			oFF = new FacetFilter(),
			oFFL = new FacetFilterList({
				growingThreshold: 2,
				items: {
					path: "/values",
					template: new FacetFilterItem( {
						text: "{text}",
						key: "{key}"
					})
				}
			});

		oFF.addList(oFFL);
		var oModel = new JSONModel({
			values: aItemsData
		});
		oFFL.setModel(oModel);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();
		aSelectedItems = oFFL.getSelectedItems();
		oFFL.setSelectedKeys({"1": "Val1", "3": "Val3"});

		aSelectedItems = oFFL.getSelectedItems();
		aSelectedKeys = Object.getOwnPropertyNames(oFFL.getSelectedKeys());

		assert.equal(aSelectedItems.length, aSelectedKeys.length, "Number of selected keys should match the number of selected items");
		assert.equal(aSelectedItems.length, 2, "All items selected via keys should be returned");
		assert.equal(aSelectedItems[0].getKey(), "1", "First item key should be correct");
		assert.equal(aSelectedItems[1].getKey(), "3", "Second item key should be correct");

		oFFL._oGrowingDelegate.requestNewPage();

		oFFL.attachUpdateFinished(function() {
			//assert
			var aSelectedKeys = Object.getOwnPropertyNames(oFFL.getSelectedKeys());
			aSelectedItems = oFFL.getSelectedItems();
			assert.equal(aSelectedItems.length, aSelectedKeys.length, "Number of selected keys should match the number of selected items");
			assert.equal(aSelectedItems.length, 2, "All items selected via keys should be returned");
			assert.equal(aSelectedItems[0].getKey(), "1", "First item key should be correct");
			assert.equal(aSelectedItems[1].getKey(), "3", "Second item key should be correct");

			destroyFF(oFF);
			done();
		});
	});

	QUnit.test("_updateFacetFilterButtonText is called from setSelectedKeys", function (assert) {
		var oFFL = new FacetFilterList({
				items: [
					new FacetFilterItem({ key: "key1", text: "Text 1" }),
					new FacetFilterItem({ key: "key2", text: "Text 2" })
				]
		});
		var oUpdateFacetFilterButtonTextSpy = this.spy(oFFL, "_updateFacetFilterButtonText");

		oFFL.setSelectedKeys({ "key1": "Text 1" });

		assert.equal(oUpdateFacetFilterButtonTextSpy.callCount, 1);

		oFFL.destroy();
	});

	// BCP: 1880240852
	// BCP: 1880222185
	QUnit.test("RootDomRef is set to the ItemNavigation", function (assert) {
		// Arrange
		var oFF = new FacetFilter({
			type: "Simple",
			lists: [
				new FacetFilterList("list1", {
					key: "item1",
					title: "Item 1"
				}),
				new FacetFilterList("list2", {
					key: "item2",
					title: "Item 2"
				})
			]
		});

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.equal(oFF.oItemNavigation.getRootDomRef(), oFF.getDomRef(), "RootDomRef is properly set to the item navigation");

		// Cleanup
		destroyFF(oFF);
	});

	// BCP: 1880240852
	// BCP: 1880222185
	QUnit.test("onsaptabnext should not call focus on the FacetFilter instance - itemNavigation will take care of it", function (assert) {
		// Arrange
		var oFF = new FacetFilter({
			type: "Simple",
			lists: [
				new FacetFilterList("list1", {
					key: "item1",
					title: "Item 1"
				}),
				new FacetFilterList("list2", {
					key: "item2",
					title: "Item 2"
				})
			]
		});
		var oFFFocusSpy = this.spy(oFF, "focus");
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();
		var oMockedEvent = {
			target: oFF.getDomRef()
		};

		// Act
		oFF._closePopoverFlag = true; // simulate old implementation where flag when popover is closed is set
		oFF.onsaptabnext(oMockedEvent);

		// Assert
		assert.equal(oFFFocusSpy.callCount, 0, "Focus method of the FacetFilter should not be called ontabnext");

		// Cleanup
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter in Light mode has tabindex=0 only on a InfoBar inside it", function (assert) {
		// Arrange
		var oFF = new FacetFilter({
			type: "Light"
		});
		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		// Assert
		assert.ok(!oFF.$().attr("tabindex"), "FF doesn't have tabindex");
		assert.equal(oFF.$().children().attr("tabindex"), 0, "toolbar inside FF has tabindex 0");
		assert.ok(!oFF.oItemNavigation, "ItemNavigation wasn't initialize for the FF Light mode");

		// Cleanup
		destroyFF(oFF);
	});

	QUnit.test("FacetFilter's dialog has an ariaLabelledBy set", function(assert) {
		// arrange
		var oFF = new FacetFilter(),
			oDialog,
			aLabelledBy;

		// act
		oDialog = oFF._getFacetDialog();
		aLabelledBy = oDialog.getAriaLabelledBy();

		// assert
		assert.ok(aLabelledBy, "there is an ariaLabelledBy set");
		assert.strictEqual(aLabelledBy.length, 1, "it is one id");
		assert.strictEqual(aLabelledBy[0],
			InvisibleText.getStaticId("sap.m", "FACETFILTER_AVAILABLE_FILTER_NAMES"),
			"it is the right id");

		// clean
		oFF.destroy();
	});


	// Helper functions

	function getButtonCtrl(oFF, iIndex) {
		return oFF._buttons[oFF.getLists()[iIndex].getId()];
	}

	function getRemoveIconCtrl(oFF, iIndex) {
		return oFF._removeFacetIcons[oFF.getLists()[iIndex].getId()];
	}

	function getAddFacetCtrl(oFF) {
		return sap.ui.getCore().byId(oFF.getId() + "-add");
	}

	function openPopover(oFF, iIndex) {

		qutils.triggerMouseEvent(getButtonCtrl(oFF, iIndex), "tap");
	}

	function openDialogFromAddFacet(oFF) {

		qutils.triggerMouseEvent(getAddFacetCtrl(oFF), "tap");
	}

	function getDialogFacetSearchField(oFacetPage) {

		return oFacetPage.getSubHeader().getContentMiddle()[0];
	}

	function getDialogFilterItemsSearchField(oFilterItemsPage) {

		return oFilterItemsPage.getSubHeader().getContentMiddle()[0];
	}

	function getPopoverFilterItemsSearchField(oPopover) {

		return oPopover.getCustomHeader().getContentMiddle()[0];
	}

	function getPopoverSelectAllCheckBox(oPopover) {

		var oBar = oPopover.getSubHeader();
		return oBar.getContentLeft()[0];
	}

	function getPopoverFilterItemsList(oPopover) {
		return oPopover.getContent()[0];
	}

	function getDialogFacetList(oFF) {

		var oFacetPage = getDialogFacetPage(oFF);
		var oList = oFacetPage.getContent()[0];
		return oList;
	}

	function getDialogFilterItemsPage(oFF) {

		var oDialog = oFF.getAggregation("dialog");
		var oNavCont = oDialog.getContent()[0];
		return oNavCont.getPages()[1];
	}

	function getDialogFilterItemsList(oFF) {

		var oPage = getDialogFilterItemsPage(oFF);
		var oList = oPage.getContent()[0];
		if (!(oList instanceof sap.m.List)) { //May need to skip the select all checkbox bar if the list is multi select
			oList = oPage.getContent()[1];
		}
		return oList;
	}

	function getDialogFacetPage(oFF) {

		var oDialog = oFF.getAggregation("dialog");
		var oNavCont = oDialog.getContent()[0];
		return oNavCont.getPages()[0];
	}

	function getDialogFacetSearch(oFF) {

		var oFacetPage = getDialogFacetPage(oFF);
		var oSearchField = oFacetPage.getSubHeader().getContentMiddle()[0];
		return oFacetPage.getSubHeader().getContentMiddle()[0];
	}

	function testResetInSummaryBar(oFF, bDisplayed) {

		var oSummaryBar = oFF.getAggregation("summaryBar");
		if (bDisplayed) {
			assert.equal(oSummaryBar.getContent().length, 3,
					"The summary bar should have 3 controls in its content when the reset button is displayed");
			var oToolbarSpacer = oSummaryBar.getContent()[1];
			assert.ok(
					oToolbarSpacer instanceof sap.m.ToolbarSpacer,
					"The second control in the summary bar content should be a spacer so that the reset button is displayed on the right side of the toolbar");
			var oResetButton = oSummaryBar.getContent()[2];
			assert.ok(oResetButton instanceof sap.m.Button, "The third control in the summary bar content should be a button");
			assert.ok(oResetButton.$().hasClass("sapUiSizeCompact"), "The button should be in compact size");
		} else {

			assert.equal(oSummaryBar.getContent().length, 1,
					"The summary bar should have 1 control in its content when the reset button is not displayed");
		}
	}

	function getGroupHeader(oGroup) {
		return new GroupHeaderListItem( {
			title: "Group: " + oGroup.key,
			upperCase: false
		} );
	}

	/*
	 * Make sure the popover and dialog are closed before destroying, otherwise popover/dialog
	 * timers still run and then find their object is destroyed, causing an error to be logged after a few seconds.
	 */
	function destroyFF(oFF, bAsync) {

		var oPopover = oFF.getAggregation("popover");
		if (oPopover) {
			if (oPopover.isOpen()) {
				oPopover.attachEventOnce("afterClose", function(oEvent) {
					destroyFF(oFF);
				});

				oFF._closePopover();
				return;
			}
		}

		oFF.destroy();
	}

	function callIconDelegate(sEventName, oIcon) {
		oIcon.aBeforeDelegates[0].oDelegate[sEventName].call(oIcon, {});
	}

	function simulateUserSearch(sSearchStr, oFFL) {
		var oEventParams = { query: sSearchStr, newValue: sSearchStr};
		if (sSearchStr === undefined) { //this is how the search field works when search value is cleared
			oEventParams.query = undefined;
			oEventParams.newValue = "";
		}
		var oEvent = {};
		oEvent.getParameters = function() {
			return oEventParams;
		};
		oFFL._handleSearchEvent(oEvent);
	}

	return waitForThemeApplied();
});