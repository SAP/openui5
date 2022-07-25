/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"local/test/pages/ListReport",
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
						async: true,
						settings: { id: "listreport" }
					},
					hash: "",
					autowait: true
				});
			}
		}
	});

	var oModuleSettings = {
		beforeEach: function() {},
		afterEach: function() {
			// in case the flex/variant changes are stored in the local browser storage
			localStorage.clear();
		}
	};

	QUnit.module("ListReport - Books Page Table", oModuleSettings);

	opaTest("Table - Check if Table has correct Toolbar and displays Data", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// Toolbar tests
		Then.onTheMDCTable.iShouldSeeTheTableHeader("Books");
		Then.onPage.iShouldSeeAP13nButtonForTheTable();
		Then.onPage.iShouldSeeAButtonWithTextForTheTable("Add Book");

		// Data tets
		Then.onPage.iShouldSeeGivenColumnsWithHeader([
			"Title",
			"Description",
			"Author ID",
			"Price",
			"Stock",
			"Genre",
			"SubGenre"
		]);
		Then.onPage.iShouldSeeRowsWithData(50);
		Then.onPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);
		Then.onPage.iShouldSeeARowWithData(2, ListReport.books["Alice's Adventures in Wonderland"]);

		Then.iTeardownMyUIComponent();
	});

	opaTest("Table - check if sorting works correctly on Table via sort dialog", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// check unsorted state
		Then.onPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);

		// 1) Sort by 'Title' (ascending)
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			success: function(aTables) {
				When.onTheMDCTable.iPersonalizeSort(aTables[0].getId(), [
					{key: "Title", descending: false}
				]);
				Then.onPage.iShouldSeeARowWithData(0, ListReport.books["...So They Baked a Cake"]);
			}
		});

		// 2) Change 'Title' sorter to descending
		When.waitFor({
			controlType: "sap.ui.mdc.Table",
			success: function(aTables) {
				When.onTheMDCTable.iPersonalizeSort(aTables[0].getId(), [
					{key: "Title", descending: true}
				]);
				Then.onPage.iShouldSeeARowWithData(0, ListReport.books["Youth"]);
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
				Then.onPage.iShouldSeeARowWithData(0, ListReport.books["The Complete Project Gutenberg Works of Jane Austen: A Linked Index of all PG Editions of Jane Austen"]);
			}
		});

		Then.iTeardownMyUIComponent();
	});

	opaTest("Table - check if sorting works correctly on Table via column header dialog", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		// check unsorted state
		Then.onPage.iShouldSeeARowWithData(0, ListReport.books["Pride and Prejudice"]);

		var fnSortByColumnTitle = function(sColumnTitle, sBookKeyAscending, sBookKeyDescending) {
			//Sort Ascending (first click)
			When.onPage.iClickOnColumnHeader(sColumnTitle);
			Then.onPage.iShouldSeeAColumnHeaderMenu(sColumnTitle);
			When.onPage.iClickOnColumnHeaderMenuSortAscendingButton(sColumnTitle);
			Then.onPage.iShouldSeeAAscendingSortedColumn(sColumnTitle);
			Then.onPage.iShouldSeeARowWithData(0, ListReport.books[sBookKeyAscending]);
			//Sort Descending (second click)
			//TODO: Need to check for the inconsistency with the actual value and the value in the model itself.
			When.onPage.iClickOnColumnHeader(sColumnTitle);
			Then.onPage.iShouldSeeAColumnHeaderMenu(sColumnTitle);
			When.onPage.iClickOnColumnHeaderMenuSortDescendingButton(sColumnTitle);
			Then.onPage.iShouldSeeADescendingSortedColumn(sColumnTitle);
			Then.onPage.iShouldSeeARowWithData(0, ListReport.books[sBookKeyDescending]);
		};

		// Sort 2 differnt times
		fnSortByColumnTitle("Title", "...So They Baked a Cake", "Youth");
		fnSortByColumnTitle("SubGenre", "The Adventures of Tom Sawyer", "The Ten Books on Architecture");

		Then.iTeardownMyUIComponent();
	});


	QUnit.module("ListReport - Books Page Filter Bar", oModuleSettings);

	opaTest("I should see the FilterBar control", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest("I should see the filter fields", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "listreport---books--booksFilterBar";
		var aLabelNames = ["Author ID", "Title", "Stock range"];
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, aLabelNames);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should see the "Adapt Filters" button', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should see the "Book ID ..." filter field', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "listreport---books--booksFilterBar";

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Stock range", "Created On", "Language", "Book ID"
			]
		});

		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, [
			"Author ID", "Title", "Stock range", "Created On", "Language", "Book ID"
		]);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

	opaTest('I should not see the "Stock" filter field', function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "listreport---books--booksFilterBar";

		When.onTheMDCFilterBar.iPersonalizeFilter(oFilterBar, {
			Books: [
				"Author ID", "Title", "Created On", "Language"
			]
		});

		var aLabelNames = ["Author ID", "Title", "Created On", "Language"];
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, aLabelNames);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

/*
	//  ------- TEMPORARY DISABLED AS REORDERING IS NOT AVAILABLE YET -----------
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
	});
*/

/*
	QUnit.module("ListReport - Books Page Variant", oModuleSettings);

	opaTest("It should save a variant", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var oFilterBar = "listreport---books--booksFilterBar";

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
		When.onTheMDCVariant.iPressOnTheVariantManagerButton(sVariantDefaultName);
		When.onTheMDCVariant.iPressOnTheVariantManagerSaveAsButton();
		When.onTheMDCVariant.iSaveVariantAs(sVariantDefaultName, sVariantNewName);

		// change variant
		When.onTheMDCVariant.iPressOnTheVariantManagerButton(sVariantNewName);
		When.onTheMDCVariant.iSelectVariant(sVariantDefaultName);
		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, {
			"Author": []
		});

		// cleanup
		Then.iTeardownMyUIComponent();
	});
*/

	QUnit.module("ListReport - Create filter conditions from Value Help", oModuleSettings);

/*
	opaTest("It should create a condition", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();
		var oFilterBar = "listreport---books--booksFilterBar";
		var sFieldLabelName = "Author",
			onTheMDCFilterField = "Author Value Help";

		When.onTheMDCFilterField.iPressOnTheFilterFieldValueHelpButton(sFieldLabelName);
		//Then.onTheMDCFilterField.iShouldSeeTheValueHelpDialog(sTitle);

		var aValues = [
			"102",
			"Gilman, Charlotte Perkins"
		];

		//TODO does not exist
		//When.onTheMDCValueHelp.iSelectTheValueHelpCondition(aValues);
		When.onTheMDCValueHelp.iPressOnTheValueHelpOKButton();

		Then.onTheMDCFilterBar.iShouldSeeFilters(oFilterBar, {
			"Author ID": [
				{
					operator: "EQ",
					values: [ 102, "Gilman, Charlotte Perkins" ]
				}
			]
		});
		When.onTheMDCFilterBar.iExpectSearch(oFilterBar);

		Then.onPage.iShouldSeeRowsWithData(2);
		Then.onPage.iShouldSeeARowWithData(0, ListReport.books["The Yellow Wallpaper"]);
		Then.onPage.iShouldSeeARowWithData(1, ListReport.books["Herland"]);

		// cleanup
		Then.iTeardownMyUIComponent();
	});
	*/


	QUnit.module("ValueHelp PageObject", oModuleSettings);

	opaTest("I open and close the ValueHelp for a given Field", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		When.onTheMDCValueHelp.iOpenTheValueHelpForField("listreport---books--ff1");
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		When.onTheMDCValueHelp.iOpenTheValueHelpForField("listreport---books--ff1");
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(false);

		// cleanup
		Then.iTeardownMyUIComponent();
	});

});
