/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/v4demo/test/pages/ListReport",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary"
], function(
	Opa5,
	opaTest,
	ListReport,
	TestLibrary
) {
	"use strict";

	Opa5.extendConfig({

		// TODO: increase the timeout timer from 15 (default) to 45 seconds
		// to see whether it influences the success rate of the first test on
		// the build infrastructure.
		// As currently, the underlying service takes some time for the
		// creation and initialization of tenants.
		// You might want to remove this timeout timer after the underlying
		// service has been optimized or if the timeout timer increase does
		// not have any effect on the success rate of the tests.
		timeout: 45,

		arrangements: {
			iStartMyUIComponentInViewMode: function() {

				// In some cases when a test fails in a success function,
				// the UI component is not properly teardown.
				// As a side effect, all the following tests in the stack
				// fails when the UI component is started, as only one UI
				// component can be started at a time.
				// Teardown the UI component to ensure it is not started
				// twice without a teardown, which results in less false
				// positives and more reliable reporting.
				if (this.hasUIComponentStarted()) {
					this.iTeardownMyUIComponent();
				}

				return this.iStartMyUIComponent({
					componentConfig: {
						name: "sap.ui.v4demo",
						async: true
					},
					hash: "",
					autowait: true
				});
			}
		}
	});

	var iComponent = 0;

	var oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {
			iComponent++;
			// in case the flex/variant changes are stored in the local browser storage
			localStorage.clear();
		}
	};

	QUnit.module("ListReport - Books Page Table", oModuleSettings);

	opaTest("Table - Check if Table has correct Toolbar and displays Data", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// Toolbar tests
		Then.onTheBooksListReportPage.iShouldSeeTheTableHeader("Books");
		Then.onTheBooksListReportPage.iShouldSeeAP13nButtonForTheTable();
		Then.onTheBooksListReportPage.iShouldSeeAButtonWithTextForTheTable("Add Book");

		// Data tets
		Then.onTheBooksListReportPage.iShouldSeeGivenColumnsWithHeader([
			"Title",
			"Description",
			"Author",
			"Price",
			"Stock"
		]);
		Then.onTheBooksListReportPage.iShouldSeeRowsWithData(50);
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(2, ListReport.books["Alice's Adventures in Wonderland"]);

		Then.iTeardownMyUIComponent();
	});

	opaTest("Table - check if sorting works correctly on Table via sort dialog", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// check unsorted state
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);

		// 1) Sort by 'Title' (ascending)
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			success: function(aTables) {
				When.onTheMDCTable.iPersonalizeSort(aTables[0].getId(), [
					{key: "Title", descending: false}
				]);
				Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["...So They Baked a Cake"]);
			}
		});

		// 2) Change 'Title' sorter to descending
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			success: function(aTables) {
				When.onTheMDCTable.iPersonalizeSort(aTables[0].getId(), [
					{key: "Title", descending: true}
				]);
				Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["Youth"]);
			}
		});

		// 3) Multiple sortings (+reorder sorting)
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			success: function(aTables) {
				When.onTheMDCTable.iPersonalizeSort(aTables[0].getId(), [
					{key: "Author ID", descending: false},
					{key: "Title", descending: true}
				]);
				Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen"]);
			}
		});

		Then.iTeardownMyUIComponent();
	});

	opaTest("Table - check if sorting works correctly on Table via column header dialog", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// check unsorted state
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);

		var fnSortByColumnTitle = function(sColumnTitle, sBookKeyAscending, sBookKeyDescending) {
			//Sort Ascending (first click)
			When.onTheBooksListReportPage.iClickOnColumnHeader(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeAColumnHeaderMenu(sColumnTitle);
			When.onTheBooksListReportPage.iClickOnColumnHeaderMenuSortAscendingButton(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeAAscendingSortedColumn(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books[sBookKeyAscending]);
			//Sort Descending (second click)
			//TODO: Need to check for the inconsistency with the actual value and the value in the model itself.
			When.onTheBooksListReportPage.iClickOnColumnHeader(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeAColumnHeaderMenu(sColumnTitle);
			When.onTheBooksListReportPage.iClickOnColumnHeaderMenuSortDescendingButton(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeADescendingSortedColumn(sColumnTitle);
			Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books[sBookKeyDescending]);
		};

		// Sort 3 differnt times
		fnSortByColumnTitle("Title", "...So They Baked a Cake", "Youth");
		fnSortByColumnTitle("Stock", "Utopia", "The History Of The Decline And Fall Of The Roman Empire: Table of Contents with links in the HTML file to the two,  Project Gutenberg editions (12 volumes)");
		fnSortByColumnTitle("Price", "The Coral Island: A Tale of the Pacific Ocean", "The Voyage Out");

		Then.iTeardownMyUIComponent();
	});

	/*opaTest("Table - check if Column dialog works correctly", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// Initial Columns test
		Then.onTheBooksListReportPage.iShouldSeeGivenColumnsWithHeader([
			"Title",
			"Description",
			"Author",
			"Price",
			"Stock"
		]);

		// add columns
		When.onTheBooksListReportPage.iClickOnTheColumnSettingsButton();
		Then.onTheBooksListReportPage.iShouldSeeTheColumnSettingsDialog();
		When.onTheBooksListReportPage.iAddAColumn("Author ID");
		When.onTheBooksListReportPage.iAddAColumn("Changed On");
		When.onTheBooksListReportPage.iCloseAllPopovers();
		Then.onTheBooksListReportPage.iShouldSeeGivenColumnsWithHeader([
			"Title",
			"Description",
			"Author",
			"Price",
			"Stock",
			"Author ID",
			"Changed On"
		]);

		// move columns
		When.onTheBooksListReportPage.iClickOnTheColumnSettingsButton();
		Then.onTheBooksListReportPage.iShouldSeeTheColumnSettingsDialog();
		When.onTheBooksListReportPage.iClickOnTheColumnReorderButton();
		When.onTheBooksListReportPage.iMoveAColumnToTheTop("Changed On");
		When.onTheBooksListReportPage.iMoveAColumnToTheTop("Stock");
		When.onTheBooksListReportPage.iCloseAllPopovers();
		Then.onTheBooksListReportPage.iShouldSeeGivenColumnsWithHeader([
			"Stock",
			"Changed On",
			"Title",
			"Description",
			"Author",
			"Price",
			"Author ID"
		]);

		// remove columns
		When.onTheBooksListReportPage.iClickOnTheColumnSettingsButton();
		Then.onTheBooksListReportPage.iShouldSeeTheColumnSettingsDialog();
		When.onTheBooksListReportPage.iRemoveAColumn("Title");
		When.onTheBooksListReportPage.iRemoveAColumn("Author");
		When.onTheBooksListReportPage.iCloseAllPopovers();
		Then.onTheBooksListReportPage.iShouldSeeGivenColumnsWithHeader([
			"Stock",
			"Changed On",
			"Description",
			"Price",
			"Author ID"
		]);

		Then.iTeardownMyUIComponent();
	});*/

	QUnit.module("ListReport - Books Page Filter Bar", oModuleSettings);

	opaTest("I should see the FilterBar control", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		Then.onTheBooksListReportPage.iShouldSeeTheFilterBar();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest("I should see the filter fields", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "__component" + iComponent + "---books--booksFilterBar";
		var aLabelNames = ["Author", "Title", "Stock range", "CreatedAt", "Language"];
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, aLabelNames);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should see the "Adapt Filters" button', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		Then.onTheBooksListReportPage.iShouldSeeTheAdaptFiltersButton();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should see the "Book ID" and "Date of Birth" filter field', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "__component" + iComponent + "---books--booksFilterBar";

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Stock", "Created On", "Language", "Book ID"
			]
		});

		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, [
			"Author", "Title", "Stock range", "CreatedAt", "Language", "Book ID"
		]);

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Stock", "Created On", "Language", "Book ID"
			],
			Authors: [
				"Date of Birth"
			]
		});

		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, [
			"Author", "Title", "Stock range", "CreatedAt", "Language", "Book ID", "Date of Birth"
		]);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should not see the "Stock" filter field', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "__component" + iComponent + "---books--booksFilterBar";

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Created On", "Language"
			]
		});

		var aLabelNames = ["Author", "Title", "CreatedAt", "Language"];
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, aLabelNames);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	/* ------- TEMPORARY DISABLED AS REORDERING IS NOT AVAILABLE YET -----------*/
	/*
	opaTest('It should reorder the "Stock" filter field', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		When.onTheBooksListReportPage.iPressOnTheAdaptFiltersButton()
			.and.iPressOnTheAdaptFiltersP13nReorderButton()
			.and.iPressOnTheAdaptFiltersP13nItem("Stock");

		// move stock filter field to the top
		When.onTheBooksListReportPage.iPressOnTheAdaptFiltersMoveToTopButton();
		var aLabelNames = ["Stock range", "Author", "Title", "CreatedAt", "Language"];
		Then.onTheBooksListReportPage.iShouldSeeTheFilterFieldsWithLabels(aLabelNames);

		// move stock filter field to the bottom
		When.onTheBooksListReportPage.iPressOnTheAdaptFiltersMoveToBottomButton();
		aLabelNames = ["Author", "Title", "CreatedAt", "Language", "Stock range"];
		Then.onTheBooksListReportPage.iShouldSeeTheFilterFieldsWithLabels(aLabelNames);

		// move the stock filter field (up one step)
		When.onTheBooksListReportPage.iPressOnTheAdaptFiltersMoveUpButton();
		aLabelNames = ["Author", "Title", "CreatedAt", "Stock range", "Language"];
		Then.onTheBooksListReportPage.iShouldSeeTheFilterFieldsWithLabels(aLabelNames);

		// move the stock filter field (down one step)
		When.onTheBooksListReportPage.iPressOnTheAdaptFiltersMoveDownButton();
		aLabelNames = ["Author", "Title", "CreatedAt", "Language", "Stock range"];
		Then.onTheBooksListReportPage.iShouldSeeTheFilterFieldsWithLabels(aLabelNames);

		// cleanup
		Then.iTeardownMyUIComponent();
	});*/


	QUnit.module("ListReport - Books Page Variant", oModuleSettings);

	opaTest("It should save a variant", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "__component" + iComponent + "---books--booksFilterBar";

		var sVariantDefaultName = "Standard",
			sVariantNewName = "Standard2";

		// make a change
		When.onTheMDCFilterBar.iEnterFilterValue(oFilterBar, {
			Books: {
				label: "Author ID",
				values: [ "101", "102" ]
			}
		});
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, {
			"Author": [
				{
					operator: "EQ",
					values: [ 101, "Austen, Jane" ]
				},
				{
					operator: "EQ",
					values: [ 102, "Gilman, Charlotte Perkins" ]
				}
			]
		});

		// save variant
		When.onTheBooksListReportPage.iPressOnTheVariantManagerButton(sVariantDefaultName);
		When.onTheBooksListReportPage.iPressOnTheVariantManagerSaveAsButton();
		When.onTheBooksListReportPage.iSaveVariantAs(sVariantDefaultName, sVariantNewName);

		// change variant
		When.onTheBooksListReportPage.iPressOnTheVariantManagerButton(sVariantNewName);
		When.onTheBooksListReportPage.iSelectVariant(sVariantDefaultName);
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, {
			"Author": []
		});

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	QUnit.module("ListReport - Create filter conditions from Value Help", oModuleSettings);

	opaTest("It should create a condition", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "__component" + iComponent + "---books--booksFilterBar";
		var sFieldLabelName = "Author",
			sTitle = "Author Value Help";

		When.onTheBooksListReportPage.iPressOnTheFilterFieldValueHelpButton(sFieldLabelName);
		Then.onTheBooksListReportPage.iShouldSeeTheValueHelpDialog(sTitle);

		var aValues = [
			"102",
			"Gilman, Charlotte Perkins"
		];

		When.onTheBooksListReportPage.iSelectTheValueHelpCondition(aValues);
		When.onTheBooksListReportPage.iPressOnTheValueHelpOKButton();

		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, {
			"Author": [
				{
					operator: "EQ",
					values: [ 102, "Gilman, Charlotte Perkins" ]
				}
			]
		});
		When.onTheMDCFilterBar.iExpectSearch(oFilterBar);

		Then.onTheBooksListReportPage.iShouldSeeRowsWithData(2);
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(0, ListReport.books["The Yellow Wallpaper"]);
		Then.onTheBooksListReportPage.iShouldSeeARowWithData(1, ListReport.books["Herland"]);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	QUnit.module("ValueHelp PageObject", oModuleSettings);

	opaTest("I open and close the ValueHelp for a given Field", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		When.onTheMDCValueHelp.iOpenTheValueHelpForField("__component" + iComponent + "---books--ff1");
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		When.onTheMDCValueHelp.iOpenTheValueHelpForField("__component" + iComponent + "---books--ff1");
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(false);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

});
