/*global QUnit, sinon */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/m/FacetFilter",
	"sap/m/FacetFilterList",
	"sap/ui/model/Filter",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/ui/Device",
	"sap/m/FacetFilterItem",
	"sap/ui/model/Sorter",
	"sap/m/HBox",
	"sap/ui/core/InvisibleText",
	"sap/m/GroupHeaderListItem",
	"sap/ui/events/KeyCodes",
	"sap/ui/base/Event",
	// provides jQuery custom selectors ":sapTabbable"
	"sap/ui/dom/jquery/Selectors"
], function(
	Element,
	qutils,
	createAndAppendDiv,
	FacetFilter,
	FacetFilterList,
	Filter,
	mobileLibrary,
	JSONModel,
	nextUIUpdate,
	jQuery,
	Device,
	FacetFilterItem,
	Sorter,
	HBox,
	InvisibleText,
	GroupHeaderListItem,
	KeyCodes,
	BaseEvent
) {
	"use strict";

	// shortcut for sap.m.ListMode
	var ListMode = mobileLibrary.ListMode;

	// shortcut for sap.m.FacetFilterType
	var FacetFilterType = mobileLibrary.FacetFilterType;

	document.body.insertBefore(createAndAppendDiv("content"), document.body.firstChild);

	QUnit.module("List Container Rendering");

	QUnit.test("Popover rendering", async function(assert) {
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
		await nextUIUpdate();

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

	QUnit.test("Dialog rendering", async function(assert) {
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
		await nextUIUpdate();

		var oDialog = oFF._getFacetDialog();
		oDialog.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(oDialog.getDomRef(), "Dialog should be rendered");
			assert.ok(oDialog.$().hasClass("sapMFFDialog"), "Dialog is rendered with the correct CSS class");

			// Facet list page
			var oSearchField = getDialogFacetSearch(oFF);
			assert.ok(oSearchField.isA("sap.m.SearchField"), "Control should be an instance of SearchField");
			assert.ok(oSearchField.getTooltip(), "Dialog search field has tooltip");
			assert.ok(oSearchField.getDomRef(), "Facet search field should be rendered");
			var oFacetList = getDialogFacetList(oFF);
			assert.ok(oFacetList.isA("sap.m.List"), "Control should be an instance of List");
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

	QUnit.test("FacetFilter.visible", async function(assert) {

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList();
		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oFF.getVisible(), true, "Visibility should be enabled by default");
		assert.ok(getButtonCtrl(oFF, 0).getDomRef(), "Button should be rendered");

		oFF.setVisible(false);
		await nextUIUpdate();

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

	QUnit.test("FacetFilter.showPersonalization", async function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({items: [new FacetFilterItem({text: "Val"})]});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oFF.getShowPersonalization(), false, "Personalization should be disabled by default");

		oFF.setShowPersonalization(true);
		await nextUIUpdate();

		assert.ok(getAddFacetCtrl(oFF).getDomRef(), "Add button should be displayed");
		assert.equal(getAddFacetCtrl(oFF).$().find(".sapUiIcon").attr("data-sap-ui-icon-content").charCodeAt(0), 57430,
				"The add icon should be the add-filter icon font.");

		var oPopover = oFF._getPopover();
		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			assert.ok(getRemoveIconCtrl(oFF, 0).getDomRef(), "Facet filter remove icon should be rendered");
			assert.equal(getRemoveIconCtrl(oFF, 0).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57406,
					"The remove icon should be the decline icon font.");
			assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLVisibleRemoveIcon"), "The remove icon should be displayed.");

			destroyFF(oFF);
			done();
		});

		openPopover(oFF, 0);
	});

	QUnit.test("FacetFilter.type", async function(assert) {

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
		await nextUIUpdate();

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
				assert.equal(getRemoveIconCtrl(oFF, 0).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57406,
						"The remove icon should be the decline icon font.");
				assert.ok(getRemoveIconCtrl(oFF, 0).$().hasClass("sapMFFLHiddenRemoveIcon"), "The remove icon should be hidden.");
				assert.equal(getRemoveIconCtrl(oFF, 1).$().attr("data-sap-ui-icon-content").charCodeAt(0), 57406,
						"The remove icon should be the decline icon font.");
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
		await nextUIUpdate();

		var fnTestLight = function(oFF) {
			var oSummaryBar = oFF.getAggregation("summaryBar"),
				oSummaryBarText = oSummaryBar.getContent()[0];

			assert.ok(oSummaryBar.getDomRef(), "Summary bar should be rendered");
			assert.ok(oSummaryBar.getActive(), "Summary bar should be active when type is Light");
			assert.ok(oSummaryBarText.getDomRef(), "Summary bar text should be rendered");
			assert.ok(oSummaryBarText.getText(), "There should be text in the summary bar");

			assert.strictEqual(oSummaryBar._getActiveButton().$().attr("aria-labelledby"),
			oSummaryBarText.getId(), "aria-labelledby should consist of a filter's text");

			testResetInSummaryBar(oFF, true, assert);

			oFF.setShowReset(false);
			testResetInSummaryBar(oFF, false, assert);
			};
		fnTestLight(oFFLight);


		// Switch from simple to light
		oFFSimple.setType(FacetFilterType.Light);
		await nextUIUpdate();
		fnTestLight(oFFSimple);

		// Switch from light to simple
		oFFLight.setType(FacetFilterType.Simple);
		await nextUIUpdate();
		fnTestSimple(oFFLight);

		oFFSimple.destroy();
		oFFLight.destroy();

		// If running on the phone then test behavior if type is explicitly set to Simple
		/*  if (Device.system.phone) {

			var oFFPhone = new FacetFilter({
				type : FacetFilterType.Simple
			});
			oFFPhone.setShowPersonalization(true);

			oFFPhone.placeAt("content");
			sap.ui.getCore().applyChanges();
			fnTestLight(oFFPhone);
		 }  */

		 if (Device.system.phone) {

			var oFFPhone = new FacetFilter();

			oFFPhone.setType(FacetFilterType.Light);
			var oSummaryBar = oFFPhone.getAggregation("summaryBar");
			oSummaryBar.setActive(true);
			//oFFPhone.setShowPersonalization(true);

			oFFPhone.placeAt("content");
			await nextUIUpdate();
			//fnTestLight(oFFPhone);

		 }

	});

	QUnit.test("FacetFilter.type interval timer", async function(assert) {
		var done = assert.async();
		var oFFLight = new FacetFilter({
			type : FacetFilterType.Light
		});
		var fnCheckOverflowSpy = sinon.spy(oFFLight, "_checkOverflow");

		oFFLight.placeAt("content");
		await nextUIUpdate();

		setTimeout(function () {
			assert.strictEqual(fnCheckOverflowSpy.callCount, 0, 'No _checkOverflow should be registered to the central timer in light mode.');

			fnCheckOverflowSpy.restore();
			done();
		}, 10);

		oFFLight.destroy();
		oFFLight = null;
	});

	QUnit.test("FacetFilter.liveSearch", async function(assert) {
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
		await nextUIUpdate();

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

	QUnit.test("FacetFilter.showReset", async function(assert) {
		var oFF = new FacetFilter();
		oFF.placeAt("content");
		await nextUIUpdate();

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
		await nextUIUpdate();

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
		await nextUIUpdate();

		testResetInSummaryBar(oFF, true, assert);

		oFF.setShowReset(false);
		await nextUIUpdate();

		testResetInSummaryBar(oFF, false, assert);

		 oFF.setShowReset(true);
		await nextUIUpdate();

		testResetInSummaryBar(oFF, true, assert);

		destroyFF(oFF);
	});

	QUnit.test("FacetFilter.showSummaryBar", async function(assert) {

		var oFF = new FacetFilter();
		oFF.placeAt("content");
		await nextUIUpdate();

		assert.ok(!oFF.getAggregation("summaryBar").getDomRef(), "Summary bar should not be displayed");

		oFF.setShowSummaryBar(true);
		await nextUIUpdate();

		var oSummaryBar = oFF.getAggregation("summaryBar");
		assert.ok(oSummaryBar.getDomRef(), "Summary bar should be displayed");
		assert.ok(!oSummaryBar.getActive(), "Summary bar should be inactive when type is Simple");
		testResetInSummaryBar(oFF, true, assert);
		oFF.setShowSummaryBar(false);
		await nextUIUpdate();

		oFF.setShowSummaryBar(true);
		oFF.setShowReset(false);
		await nextUIUpdate();

		testResetInSummaryBar(oFF, false, assert);

		oFF.setShowSummaryBar(true);
		oFF.setShowReset(true);
		await nextUIUpdate();

		testResetInSummaryBar(oFF, true, assert);


		destroyFF(oFF);
	});


	QUnit.test("FacetFilterList.active", async function(assert) {

		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList();
		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		assert.strictEqual(oFFL.getActive(), true, "List active should be enabled by default");
		assert.ok(getButtonCtrl(oFF, 0).getDomRef(), "Button should be rendered");

		oFFL.setActive(false);
		await nextUIUpdate();

		assert.strictEqual(oFFL.getActive(), false, "List active should be disabled");
		assert.ok(!getButtonCtrl(oFF, 0).getDomRef(), "Button should not be rendered");

		destroyFF(oFF);
	});

	QUnit.test("FacetFilterList.mode", function(assert) {
		var oFFL = new FacetFilterList();

		assert.ok(oFFL.setMode(ListMode.SingleSelectMaster), "setMode should support method chaining");
		assert.strictEqual(oFFL.getMode(), ListMode.SingleSelectMaster, "List mode should be SingleSelectMaster");

		oFFL.setMode(ListMode.None);
		oFFL.setMode(ListMode.SingleSelect);
		oFFL.setMode(ListMode.Delete);
		oFFL.setMode(ListMode.SingleSelectLeft);
		assert.strictEqual(oFFL.getMode(), ListMode.SingleSelectMaster,
				"Current list mode should be retained after attempting to set invalid modes");
		oFFL.destroy();
	});

	QUnit.test("FacetFilterList.title", async function(assert) {

		var initialTitle = "a", changedTitle = "b";
		var oFF = new FacetFilter();
		var oFFL = new FacetFilterList({
			title : initialTitle
		});
		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		assert.equal(oFFL.getTitle(), initialTitle, "List title should be set to the initial value");
		assert.ok(getButtonCtrl(oFF, 0).$().text().indexOf(oFFL.getTitle()) !== -1,
				"Button label should be set to the initial value");

		assert.ok(oFFL.setTitle(changedTitle), "setTitle should support method chaining");
		await nextUIUpdate();

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

	QUnit.test("Selection button text updated after popover close", async function(assert) {
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
		await nextUIUpdate();

		var oPopover = oFF._getPopover();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			var oList = getPopoverFilterItemsList(oPopover);
			oList.getItems()[0].setSelected(true);

			oPopover.attachEventOnce("afterClose", async function(oEvent) {
				await nextUIUpdate();
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

	QUnit.test("Selection button text updated after popover close - binding and search scenario", async function(assert) {
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
			oButton = oFF._getButtonForList(oFFL);

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
		await nextUIUpdate();

		oPopover.attachEventOnce("afterOpen", function(oEvent) {

			//act
			simulateUserSearch("a", oFFL);
			//the search will result in exactly three of four items
			oFFL.getItems()[0].setSelected(true);
			oFFL.getItems()[1].setSelected(true);
			oFFL.getItems()[2].setSelected(true);

			oPopover.attachEventOnce("afterClose", async function(oEvent) {
				await nextUIUpdate();
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

	QUnit.test("Selection button text updated after dialog close", async function(assert) {
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
		await nextUIUpdate();

		var oDialog = oFF._getFacetDialog();

		oDialog.attachEventOnce("afterOpen", function(oEvent) {

			var oNavContainer = oDialog.getContent()[0];
			oNavContainer.attachEventOnce("afterNavigate", function(oEvent) {

				var oList = getDialogFilterItemsList(oFF);
				oList.getItems()[0].setSelected(true);

				oDialog.attachEventOnce("afterClose", async function(oEvent) {
					await nextUIUpdate();
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


	QUnit.test("Keyboard", async function(assert) {

		var oFF = await createFF(oFF);
		assert.ok(oFF.$().find(":sapTabbable").length == 4, "Total 4 tabbable fields");
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
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oEvent.which = KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oEvent.which = KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oEvent.which = KeyCodes.ARROW_RIGHT;
		oFF.onsapincreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapincreasemodifiers tested - focus on add button");

//onsapdecreasemodifiers - page up
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oEvent.which = KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oEvent.which = KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oEvent.which = KeyCodes.ARROW_LEFT;
		oFF.onsapdecreasemodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapdecreasemodifiers tested - focus on List1");

//onsapupmodifiers
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.oItemNavigation.setFocusedIndex(1);
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapupmodifiers(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsapupmodifiers tested - focus on List1");

		var oFF = await createFF(oFF);
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
		var oFF = await createFF(oFF);
//  	var sapTabbable = oFF.$().find(":sapTabbable");
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.oItemNavigation.setFocusedIndex(2);
		assert.ok(jQuery(oFF.onsappagedown(oEvent)), "keyboard onsappagedown tested - case 1");

		var oFF = await createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(0);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsappagedown(oEvent)), "keyboard onsappagedown tested - case 2");

//onsaptabnext
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 1");

		var oFF = await createFF(oFF);
		oFF._invalidateFlag = true;
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 2");

		var oFF = await createFF(oFF);
		oFF._closePopoverFlag = true;
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsaptabnext(oEvent)), "keyboard onsaptabnext tested - case 3");
//onsapend
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapend(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapend tested - focus on add button");
		assert.ok(jQuery(oFF.onsapend(oEvent)), "keyboard onsapend tested - case 1");

		var oFF = await createFF(oFF);
		oFF._addTarget = null;
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsapend(oEvent)), "keyboard onsapend tested - case 2");

//onsappageup
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsappageup(oEvent);
		assert.ok(jQuery(oFF.onsappageup(oEvent)), "keyboard onsappageup tested");

//expand
		oFF.oItemNavigation.setFocusedIndex(0);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsapexpand tested - focus on List2");

		var oFF = await createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapexpand tested - focus on Add button");

		var oFF = await createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(2);
		oFF.onsapexpand(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsapexpand tested - focus on Add button");

//collapse
		var oFF = await createFF(oFF);
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
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[1];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 2");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[0];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 0, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 3");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF._previousTarget = oFF.$().find(":sapTabbable")[2];
		oFF.onsaptabprevious(oEvent);
//		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 2, "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 4");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
//		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested");
		assert.ok(jQuery(oFF.onsaptabprevious(oEvent)), "keyboard onsaptabprevious tested - case 5");

//down
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapdown(oEvent)), "keyboard onsapdown tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapdown(oEvent)), "keyboard onsapdown tested - case2 ");

//onsapescape
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.ok(jQuery(oFF.onsapescape(oEvent)), "keyboard onsapescape tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapescape(oEvent)), "keyboard onsapescape tested - case2");

//onsapup
		//*why need to comment out oEvent.hover in facetfilter.js -?????
		var oFF = await createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapup(oEvent)), "keyboard onsapup tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapup(oEvent)), "keyboard onsapup tested - case 2");
//		assert.ok(jQuery(oEvent.target).trigger("focus"), "keyboard onsapup tested");

//onsapleft
		//*why need to comment out oEvent.hover in facetfilter.js -?????
		var oFF = await createFF(oFF);
		oFF.oItemNavigation.setFocusedIndex(1);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsapleft(oEvent);
		assert.ok(oFF.oItemNavigation.getFocusedIndex() == 1, "keyboard onsapleft tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapleft(oEvent)), "keyboard onsapleft tested - case 2");

//onsapright
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.ok(jQuery(oFF.onsapright(oEvent)), "keyboard onsaprigh tested - case 1");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		assert.ok(jQuery(oFF.onsapright(oEvent)), "keyboard onsaprigh tested - case 2");

//onsapdelete
		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[0].getActive(), false, "keyboard onsapdelete tested - list1 deleted");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[1].getActive(), false, "keyboard onsapdelete tested - list2 deleted");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");


		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[2];
		oFF.onsapdelete(oEvent);
		assert.ok(oFF.getAggregation("addFacetButton"), "keyboard onsapdelete tested - can't delete addFacetButton");

		var oFF = await createFF(oFF);
		oEvent.target = oFF.$().find(":sapTabbable")[3];
		oFF.onsapdelete(oEvent);
		assert.ok(oFF.getAggregation("resetButton"), "keyboard onsapdelete tested - can't delete resetbutton");

		var oFF = await createFF(oFF);
		oFF.setShowPersonalization(false);
		oEvent.target = oFF.$().find(":sapTabbable")[0];
		assert.equal(oFF.getLists()[0].getActive(), true, "keyboard onsapdelete tested - no delete allowed, list1 active");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		var oFF = await createFF(oFF);
		var oList = oFF.getLists()[1];
		oList.setShowRemoveFacetIcon(false);
		oEvent.target = oFF.$().find(":sapTabbable")[1];
		assert.equal(oFF.getLists()[1].getActive(), true, "keyboard onsapdelete tested - no delete allowed, list2 active");
		assert.equal(oFF.getAggregation("buttons").length, 2, "There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "There should be two remove icons in the aggregation");

		//one of list is inactive
		var oFF = await createFF(oFF, [
			new FacetFilterList("list101"),
			new FacetFilterList("list102", {active: false}),
			new FacetFilterList("list103") ]);

		oEvent.target = oFF.$().find(":sapTabbable")[1];//this should be the 3th list, as the second is not active
		oFF.onsapdelete(oEvent);
		assert.equal(oFF.getLists()[2].getActive(), false, "keyboard onsapdelete when one of list is inactive tested - list103 deleted(should be inactive)");
		assert.equal(oFF.getAggregation("buttons").length, 2, "keyboard onsapdelete when one of list is inactive tested - There should be two buttons in the 'buttons' aggregation");
		assert.equal(oFF.getAggregation("removeFacetIcons").length, 2, "keyboard onsapdelete when one of list is inactive tested - There should be two remove icons in the aggregation");

		var oFF = await createFF(oFF);
		oFF.getLists()[1].setActive(false);
		oFF.getLists()[0].setActive(false);
		oFF.oItemNavigation.setFocusedIndex(0);
		assert.ok(jQuery(oFF.onsapdelete(oEvent)), "keyboard onsapdelete tested");

		destroyFF(oFF);

	});



	async function createFF(oFF, aLists) {

		if (oFF) {
			oFF.destroy();
			await nextUIUpdate();
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
		await nextUIUpdate();
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
		oFFL.setMode(ListMode.SingleSelectMaster);

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

	QUnit.test("Update button text when items are preselected", async function(assert) {
		var oFF = oSCHelper.createFFWithModel(true);
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});

		oFF.placeAt("content");
		await nextUIUpdate();

		var oButton = oFF._getButtonForList(oFFL);
		assert.strictEqual(oButton.getText().indexOf("Val4") > -1, true,
				"Selected item is displayed on the button");

		oFFL.setSelectedKeys({
			"4" : "Val4",
			"2" : "Val4"
		});
		// rerendering required to display selected keys
		oFF.invalidate();
		await nextUIUpdate();
		assert.strictEqual(oButton.getText().indexOf("2") > -1, true, "Two items are displayed on the button");

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});
		oFFL._search("Val2");
		oFF.invalidate();
		await nextUIUpdate();
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
	QUnit.test("Do not update selectedKeys cache in a non-growing list when filtering", async function(assert) {
		//arrange
		var oFF = oSCHelper.createFFWithModel(true);
		var oFFL = oFF.getLists()[0];

		oFF.placeAt("content");
		await nextUIUpdate();

		//act
		oFFL._search("Val1", true);
		await nextUIUpdate();

		oFFL.getItems()[0].setSelected(true);
		await nextUIUpdate();

		oFFL._search("Val3", true);
		await nextUIUpdate();

		oFFL.getItems()[0].setSelected(true);
		await nextUIUpdate();

		//assert
		assert.equal(oFF._getSelectedItemsText(oFFL).join(","), "Val3,Val1", "Summary text is correct");

		//clean
		destroyFF(oFF);
	});

	QUnit.test("'All' checkbox to be unchecked when items are preselected and model is assigned later", async function(assert) {
		var done = assert.async();
		var oFF = oSCHelper.createFFWithBinding();
		var oFFL = oFF.getLists()[0];

		oFFL.setSelectedKeys({
			"4" : "Val4"
		});


		oFF.placeAt('content');
		await nextUIUpdate();

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
				mode: ListMode.MultiSelect
			}),
			//sut
			oAllCheckbox;
		oFF.addList(oFFL);

		//act
		oFF._createSelectAllCheckboxBar(oFFL);

		oAllCheckbox = Element.getElementById(oFFL.getAssociation("allcheckbox"));

		//assert
		assert.ok(oAllCheckbox, "all checkbox is created");
		assert.ok(!oAllCheckbox.getSelected(), "all checkbox is initially unchecked when created for a list with no items");

		//clean
		oFF.destroy();
	});

	QUnit.test("The selected keys are cleared when the list is made inactive", async function(assert) {
		var done = assert.async();
		var oFF = oSCHelper.createFFWithModel();
		var oFFL = oFF.getLists()[0];
		oFF.placeAt("content");
		await nextUIUpdate(); //_getFacetRemoveIcon is implicitly called upon rendering

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

	QUnit.module("Buttons for List");

	QUnit.test("_bCheckForAddListBtn should be set to true when the list is multiSelect", async function(assert) {
		var done = assert.async();

		var oFFL = new FacetFilterList({
			active: false,
			mode: ListMode.MultiSelect,
			title : "List"
		});
		var oFF = new FacetFilter({
			showPersonalization : true
		});

		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = Element.getElementById(oNavContainer.getInitialPage());
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

		oFF._getFacetDialog().attachEventOnce("afterClose", async function(oEvent) {
			// Assert
			assert.ok(oFF._bCheckForAddListBtn, '_bCheckForAddListBtn should be set to true');
			await nextUIUpdate();
			setTimeout(function () {
				assert.equal(oFF.getAggregation("buttons"), null, 'The button for the list is not rendered, when the list is empty');
				destroyFF(oFF);
				done();
			}, 10);
		});

		oFF._navToFilterItemsPage(oFacetListItem1);
	});

	QUnit.test("The button for the list is rendered, when _bCheckForAddListBtn is already true and for the list which is not active is set selected key programatically", async function(assert) {
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
			mode: ListMode.MultiSelect,
			title: "List",
			listOpen: fetchDimensionData
		});

		var oFFL2 = new FacetFilterList({
			active: false,
			mode: ListMode.MultiSelect,
			title: "List3",
			listOpen: fetchDimensionData
		});

		oFF.addList(oFFL);
		oFF.addList(oFFL2);
		oFF.placeAt("content");
		await nextUIUpdate();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = Element.getElementById(oNavContainer.getInitialPage());
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
			setTimeout(async function () {
				assert.ok(oFF.getAggregation("buttons")[0].getDomRef(), 'The button for the first list is rendered');

				// act
				// setSelectedKey - this will make the list active if it is in multiselect mode
				oSelectedKey['{"key1"}'] = "key1";
				oFFL2.setSelectedKeys(oSelectedKey);
				oFF.invalidate();
				await nextUIUpdate();
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

	QUnit.test("The button for the list is rendered, when the list is empty but active", async function(assert) {
		var done = assert.async();

		var oFF = new FacetFilter({
			showPersonalization : true
		});
		var oFFL = new FacetFilterList({
			active: true,
			mode: ListMode.MultiSelect,
			title : "List"
		});

		oFF.addList(oFFL);
		oFF.placeAt("content");
		await nextUIUpdate();

		oFF.openFilterDialog();

		var oNavContainer = oFF.getAggregation("dialog").getContent()[0];
		var oFacetPage = Element.getElementById(oNavContainer.getInitialPage());
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
		beforeEach: async function () {
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
			await nextUIUpdate();
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
		beforeEach: async function () {
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
			await nextUIUpdate();
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
		beforeEach: async function () {
			this.oFF = oSCHelper.createFFWithBinding(5);
			for (var i = 0; i < 5; i++) {
				this.oFF.getLists()[i].setModel(oSCHelper.createModel());
			}
			this.oFF.placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			destroyFF(this.oFF);
		},
		/**
		 * @param {QUnit.Assert} assert
		 * @param {int} iListCount the number of expected ff lists
		 */
		testFacetFilterList: function (assert, iListCount) {
			var iTotalSize = iListCount + 1, // Make sure to include the Add Filter button
				$currentlyTestedButton,
				aAriaDescribedByIds,
				$positioningLabel,
				sExpectedLabelText;

			// First check each list's button
			for (var i = 0; i < iListCount; i++) {
				$currentlyTestedButton = getButtonCtrl(this.oFF, i).$();
				aAriaDescribedByIds = $currentlyTestedButton.attr("aria-describedby").split(" ");
				assert.equal(aAriaDescribedByIds.length, 2,
					"There should be 2 IDs (positioning & removal labels) in aria-describedby for List" + (i + 1));

				$positioningLabel = jQuery("#" + aAriaDescribedByIds[0]); // Positioning label should be the first reference
				sExpectedLabelText = "Facet Filter " + (i + 1) + " of " + iTotalSize;
				assert.equal($positioningLabel.text(), sExpectedLabelText, "Correct positioning info for that List");
			}

			// Then the Add Filter button
			$currentlyTestedButton = this.oFF.getAggregation("addFacetButton").$();
			aAriaDescribedByIds = $currentlyTestedButton.attr("aria-describedby").split(" ");
			assert.equal(aAriaDescribedByIds.length, 1,
				"There should be 1 ID (positioning label) in aria-describedby for the Add Filter button");

			$positioningLabel = jQuery("#" + aAriaDescribedByIds[0]); // Positioning label should be the first reference
			sExpectedLabelText = "Facet Filter " + iTotalSize + " of " + iTotalSize;
			assert.equal($positioningLabel.text(), sExpectedLabelText, "Correct positioning info for it too");
		}
	});

	QUnit.test("Facet filter list positioning - initial", function (assert) {
		this.testFacetFilterList(assert, 5);
	});

	QUnit.test("Facet filter list positioning - after removal of list(s)", async function (assert) {
		var oListToRemove = this.oFF.getLists()[2];

		this.oFF.removeList(oListToRemove);
		await nextUIUpdate();

		this.testFacetFilterList(assert, 4);
	});

	QUnit.test("FacetFilter: type=Light", async function(assert) {
		// arrange
		var oToolbar,
			oFacetFilter = new FacetFilter();

		oFacetFilter.setType("Light");
		oFacetFilter.placeAt("content");
		await nextUIUpdate();
		oToolbar = oFacetFilter._getSummaryBar().$();

		// assert
		assert.equal(oToolbar.attr("role"), "group", "role attribute value is proper");
		assert.equal(oToolbar.attr("aria-roledescription"), oFacetFilter._bundle.getText("FACETFILTER_ACTIVE_TITLE"), "aria-roledescription attribute value is proper");

		// cleanup
		oFacetFilter.destroy();
	});

	QUnit.test("FacetFilter: type=Simple, showSummaryBar=true", async function(assert) {
		// arrange
		var oToolbar,
			oFacetFilter = new FacetFilter();

		oFacetFilter.setType("Simple");
		oFacetFilter.setShowSummaryBar(true);
		oFacetFilter.placeAt("content");
		await nextUIUpdate();
		oToolbar = oFacetFilter._getSummaryBar().$();

		// assert
		assert.equal(oToolbar.attr("role"), "group", "role attribute value is proper");
		assert.equal(oToolbar.attr("aria-roledescription"), oFacetFilter._bundle.getText("FACETFILTER_TITLE"), "aria-roledescription attribute value is proper");

		// cleanup
		oFacetFilter.destroy();
	});

	QUnit.test("FacetFilter: type=Simple, showSummaryBar=false", async function(assert) {
		// arrange
		var oFilter,
			oFacetFilter = new FacetFilter();

		oFacetFilter.setType("Simple");
		oFacetFilter.setShowSummaryBar(false);
		oFacetFilter.placeAt("content");
		await nextUIUpdate();
		oFilter = oFacetFilter.$();

		// assert
		assert.equal(oFilter.attr("role"), "toolbar", "role attribute value is proper");
		assert.equal(oFilter.attr("aria-roledescription"), oFacetFilter._bundle.getText("FACETFILTER_TITLE"), "aria-roledescription attribute value is proper");

		// cleanup
		oFacetFilter.destroy();
	});

	QUnit.module("Other scenarios");

	//BCP: 2070160117
	QUnit.test("Facet button text when default filtering is prevented and select all checkbox is checked", async function(assert) {
		// arrange
		var done = assert.async(),
			aValues = [{key : 'k1',text : "aa"}, {key : 'k2',text : "aabb"}, {key : 'k3',text : "cc"}],
			oModel = new JSONModel({
				values : aValues
			}),
			oFFL = new FacetFilterList({
				title : "Values"
			}),
			oFF = new FacetFilter({
				showPersonalization : true,
				liveSearch : false,
				lists: [oFFL]
			}),
			oButtonOpener = oFF._getButtonForList(oFFL),
			oPopover = oFF._getPopover(),
			oFakeEvent = {
				getParameters: function () {
					return {
						query: "aa"
					};
				}
			};

		oFF.setModel(oModel);
		oFF.placeAt("content");
		await nextUIUpdate();

		oFFL.attachEventOnce("search", function(oEvent) {
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

		oPopover.attachEventOnce("afterOpen", function(oEvent) {
			// act
			oFFL._handleSearchEvent(oFakeEvent);
			// select all items
			oFFL._handleSelectAllClick(true);

			oPopover.attachEventOnce("afterClose", async function(oEvent) {
				await nextUIUpdate();
				//assert
				assert.equal(oButtonOpener.getText(), "Values (All)", "Button text is All");
				oFF.destroy();
				done();
			});

			oFF._closePopover();
		});

		oFF._openPopover(oPopover, oButtonOpener);
	});

	//BCP: 1770254364
	QUnit.test("Updating list items binding updates the button text", async function(assert) {
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
		await nextUIUpdate();
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
	// QUnit.test("List item bindings sets button text properly when ListMode is SingleSelectMaster", async function(assert) {
	// 	//arrange
	// 	var done = assert.async(),
	// 			data = [{
	// 				key : "key1",
	// 				text: "text1",
	// 				selected: false
	// 			},{
	// 				key : "key2",
	// 				text : "text2",
	// 				selected : true
	// 			}],
	// 			oFF = new FacetFilter(),
	// 			oFFList = new FacetFilterList({
	// 				title: "test",
	// 				key: "test"
	// 			}),
	// 			oModel = new JSONModel(data);

	// 	oFFList.setMode(ListMode.SingleSelectMaster);
	// 	oFFList.bindItems("/", new FacetFilterItem({
	// 		key : '{key}',
	// 		text : '{text}',
	// 		selected : '{selected}'
	// 	}));
	// 	oFF.addList(oFFList);
	// 	oFFList.setModel(oModel);
	// 	oFF.placeAt('content');
	// 	await nextUIUpdate();

	// 	oFFList.attachUpdateFinished(function () {
	// 		//wait for all
	// 		setTimeout( async function () {
	// 			assert.equal(oFF._getButtonForList(oFFList).getText(), "test (text2)", "button has the correct title after model is updated");

	// 			oFF.destroy();
	// 			await nextUIUpdate();
	// 			done();
	// 		}, 500);
	// 	});
	// });

	//BCP: 1770254364
	QUnit.test("Update on a model remembers selection properly", async function(assert) {
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
		await nextUIUpdate();

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

	QUnit.test("Keep selected items when updatedFinished event is fired (eg. when Growing)", async function(assert) {
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
		await nextUIUpdate();
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

	QUnit.test("Keep selected cache items when updatedFinished event is triggered from items binding", async function(assert) {
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
			oEventGetParamStub = sinon.stub(BaseEvent.prototype, "getParameter");
			oEventGetParamStub.withArgs("reason").returns("Refresh");

		oFF.addList(oFFL);
		oFFL.setModel(oModel);

		oFF.placeAt("content");
		await nextUIUpdate();

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
				oEventGetParamStub.restore();
			});
		});

		// act
		openPopover(oFF, 0);
	});

	QUnit.test("List binding before anything is rendered", function(assert) {
		// prepare
		var oModel = new JSONModel({
				values: [{key: "1", text: "Val1"}]
			}),
			oFF = new FacetFilter({
				showPersonalization : true,
				liveSearch : false
			}),
			oFFL = new FacetFilterList(),
			oBody = document.querySelector("body"),
			oHtml = document.querySelector("html");

		oHtml.removeChild(oBody);
		oFFL.bindItems("/values", new FacetFilterItem({
			text: "{text}",
			key: "{key}"
		}));

		oFF.addList(oFFL);

		// act
		try {
			oFFL.setModel(oModel);
		} catch (oError) {
			oHtml.appendChild(oBody);
			throw oError;
		}

		// act
		oHtml.appendChild(oBody);

		// assert
		assert.ok(true, "No error is thrown");

		// clean
		oFF.destroy();
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
	QUnit.test("RootDomRef is set to the ItemNavigation", async function (assert) {
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
		await nextUIUpdate();

		// Assert
		assert.equal(oFF.oItemNavigation.getRootDomRef(), oFF.getDomRef(), "RootDomRef is properly set to the item navigation");

		// Cleanup
		destroyFF(oFF);
	});

	// BCP: 1880240852
	// BCP: 1880222185
	QUnit.test("onsaptabnext should not call focus on the FacetFilter instance - itemNavigation will take care of it", async function (assert) {
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
		await nextUIUpdate();
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
		return Element.getElementById(oFF.getId() + "-add");
	}

	function openPopover(oFF, iIndex) {

		qutils.triggerMouseEvent(getButtonCtrl(oFF, iIndex), "tap");
	}

	function openDialogFromAddFacet(oFF) {

		qutils.triggerMouseEvent(getAddFacetCtrl(oFF), "tap");
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
		if (!(oList.isA("sap.m.List"))) { //May need to skip the select all checkbox bar if the list is multi select
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
		return oFacetPage.getSubHeader().getContentMiddle()[0];
	}

	function testResetInSummaryBar(oFF, bDisplayed, assert) {

		var oSummaryBar = oFF.getAggregation("summaryBar");
		if (bDisplayed) {
			assert.equal(oSummaryBar.getContent().length, 3,
					"The summary bar should have 3 controls in its content when the reset button is displayed");
			var oToolbarSpacer = oSummaryBar.getContent()[1];
			assert.ok(
					oToolbarSpacer.isA("sap.m.ToolbarSpacer"),
					"The second control in the summary bar content should be a spacer so that the reset button is displayed on the right side of the toolbar");
			var oResetButton = oSummaryBar.getContent()[2];
			assert.ok(oResetButton.isA("sap.m.Button"), "The third control in the summary bar content should be a button");
			assert.ok(oResetButton.$().hasClass("sapUiSizeCompact"), "The button should be in compact size");
		} else {

			assert.equal(oSummaryBar.getContent().length, 1,
					"The summary bar should have 1 control in its content when the reset button is not displayed");
		}
	}

	function getGroupHeader(oGroup) {
		return new GroupHeaderListItem( {
			title: "Group: " + oGroup.key
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
});