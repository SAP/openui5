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
		}, 10);

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
			}, 10);
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
			}, 10);
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
			}, 10);
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

	QUnit.test("Keep selected cache items when updatedFinished event is triggered from items binding", function(assert) {
		// prepare
		var done = assert.async(),
			aSelectedItems = [],
			oFF = new FacetFilter({
				showPersonalization : true,
				liveSearch : false
			}),
			oFFL = new FacetFilterList(),
			oModel = new JSONModel({
				values: [{key: "1", text: "Val1"}]
			}),
			oEventGetParamSub = sinon.stub(sap.ui.base.Event.prototype, "getParameter");
			oEventGetParamSub.withArgs("reason").returns("Refresh");

		oFF.addList(oFFL);
		oFFL.setModel(oModel);

		oFF.placeAt("content");
		sap.ui.getCore().applyChanges();

		// act
		oFFL.setSelectedKeys({1: "Val1"});
		aSelectedItems = oFFL.getSelectedItems();

		// assert
		assert.equal(aSelectedItems.length, 1, "There is one selected item");

		oFFL.attachEventOnce("listOpen", function() {
			oFFL.bindItems("/values", new FacetFilterItem({
				text: "{text}",
				key: "{key}"
			}));

			oFFL.attachEventOnce("updateFinished", function() {
				//assert
				aSelectedItems = oFFL.getSelectedItems();
				assert.equal(aSelectedItems.length, 1, "Item is still selected");

				destroyFF(oFF);
				done();
				oEventGetParamSub.restore();
			});
		});

		// act
		openPopover(oFF, 0);
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