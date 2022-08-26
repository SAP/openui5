/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
	// "test-resources/sap/ui/mdc/testutils/opa/Util"
], function(
	Opa5,
	opaTest
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


		appParams: {
			"sap-ui-xx-complexP13n": true
		},

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
		afterEach: function() {}
	};

	QUnit.module("TwFb - Books", oModuleSettings);


	opaTest("twfb - start app and test mdc links", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var firstLink = {text: "Pride and Prejudice"};
		When.onTheMDCLink.iPressTheLink(firstLink);
		Then.onTheMDCLink.iShouldSeeAPopover(firstLink);
		When.onTheMDCLink.iCloseThePopover();

		var secondLink = {text: "The Yellow Wallpaper"};
		When.onTheMDCLink.iPressTheLink(secondLink);
		Then.onTheMDCLink.iShouldSeeAPopover(secondLink);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(secondLink, ["Manage book"]);
		When.onTheMDCLink.iCloseThePopover();

		When.onTheMDCLink.iPersonalizeTheLinks(secondLink, ["Manage book", "Manage author"]);
		Then.onTheMDCLink.iShouldSeeLinksOnPopover(secondLink, ["Manage book", "Manage author"]);

		When.onTheMDCLink.iPressTheLink(secondLink);
		//When.onTheMDCLink.iPressLinkOnPopover(secondLink, "Manage book");
		//When.onTheMDCLink.iPressLinkOnPopover(secondLink, "Manage author");
		//Then.iShouldSeeApp("Book: The Yellow Wallpaper"});
		When.onTheMDCLink.iCloseThePopover();

		Then.iTeardownMyUIComponent();
	});



	opaTest("twfb - start app and test field and valuehelp", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sFieldID = "listreport---books--ff1";
		When.onTheMDCValueHelp.iOpenTheValueHelpForField(sFieldID);
		//TODO not more action or assertions available
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true); //TODO close only work with FieldValueHelp

		sFieldID = "listreport---books--ff2";
		When.onTheMDCValueHelp.iOpenTheValueHelpForField(sFieldID);
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		Then.iTeardownMyUIComponent();
	});


	opaTest("twfb - start app and test personalization of table", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sTableID = "listreport---books--booksTable";
		//???? first parameter is called oControl. Why not oTable or vTableIdentifier.....
		When.onTheMDCTable.iPersonalizeColumns(sTableID, ["Genre", "Sub Genre"]);
		When.onTheMDCTable.iResetThePersonalization(sTableID);
		//Then TODO no assertions available

		When.onTheMDCTable.iPersonalizeFilter(sTableID, [{key : "Language", values: ["DE"], inputControl: "listreport---books--booksTable--filter--language_code"}]);

		When.onTheMDCTable.iPersonalizeSort(sTableID, [{key: "Price", descending: false}]); //ERROR failed because of custom stock slider (when at the end I call teardown....)
		// When.onTheMDCTable.iResetThePersonalization(sTableID);

		Then.iTeardownMyUIComponent();
	});


	opaTest("twfb - start app and test chart/personalization", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sChartID = "listreport---books--bookChart";

		Then.onTheMDCChart.iShouldSeeAChart();// Why does it not get the chartId?
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "column"); // key of chart not the name

		When.onTheMDCChart.iPersonalizeChart(sChartID, [{
			key: "Author ID",
			role: "Category",
			kind: "Dimension"
		},
		{
			key: "Language",
			role: "Category",
			kind: "Dimension"
		},
		{
			key: "Words (average)",
			kind: "Measure"
		}
		]);
		Then.onTheMDCChart.iShouldSeeTheDrillStack(["author_ID", "language_code"], sChartID); // why is sChartID the second param?
		When.onTheMDCTable.iResetThePersonalization(sChartID);

		//TODO does not exist for Chart
		// When.onTheMDCChart.iPersonalizeFilter(sChartID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);

		When.onTheMDCChart.iPersonalizeSort(sChartID, [{key: "Language", descending: true}]); // This is not a key it is the label!
		When.onTheMDCTable.iResetThePersonalization(sChartID);

		// zoom is disabled for most chart types
		//When.onTheMDCChart.iClickOnZoomIn(sChartID);

		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartID);
		Then.onTheMDCChart.iShouldSeeNoLegend(sChartID);
		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartID);
		Then.onTheMDCChart.iShouldSeeALegend(sChartID);

		//change ChartType
		When.onTheMDCChart.iSelectAChartType(sChartID, "Pie Chart");
		// same as:
		//    When.onTheMDCChart.iClickOnTheChartTypeButton(sChartID);
		//    When.onTheMDCChart.iSelectChartTypeInPopover("Pie Chart");
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "pie"); // char type key and NOT the ui label!!!!

		Then.iTeardownMyUIComponent();
	});



	opaTest("twfb - start app and test filterbar", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sFilterBarID = "listreport---books--booksFilterBar";
		// for the Filterbar the sFilterBarID can be Object instance or id string.
		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, {	Books: ["Author ID"] });
		//    When.onTheMDCChart.iPersonalizeFilter(sFilterBarID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);
		//TODO no assertions available
		When.onTheMDCFilterBar.iResetThePersonalization(sFilterBarID);

		When.onTheMDCFilterBar.iEnterFilterValue(sFilterBarID, { // Why does this action always change FilterValues on the Adapt Filters dialog and not directly on the FB?
			Books: {
				label: "Author ID",
				values: [ "101"] //, "102" ]
			}
		});
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			// Why do I not need the Books group in the iShouldSeeFilters?
			// Why can I not test the expected values in the format values: [ "101", "102" ]?
			"Author ID": [
				{
					operator: "EQ",
					values: [ 101, "Austen, Jane" ]
				} //,
				// {
				// 	operator: "EQ",
				// 	values: [ 102, "Gilman, Charlotte Perkins" ]
				// }
			]
		});

		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		//ERROR Clear does not work. It waits for tokens which are not visible on the field
		When.onTheMDCFilterBar.iClearFilterValue(sFilterBarID, "Author ID");
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			"Author ID": []
		});
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		Then.iTeardownMyUIComponent();
	});


	opaTest("twfb - Search one book, navigate to factsheet, change the price and save it.", function(Given, When, Then) {
		var booksComponentID = "listreport---books--";
		var sFilterBarID = booksComponentID + "booksFilterBar";

		// I start the Manage Books TwFb example app
		// Already possible to start the app, but we see the current Books Service content and not a new (fresh) set of data.
		Given.iStartMyUIComponentInViewMode();



		// I should see the Standard Variant and Filterbar with empty FilterFields
		// Then.onTheMDCVariant.iShouldSeeTheVariantManagerButton("Standard");

		Then.onTheMDCFilterBar.iShouldSeeTheFilterBar();
		Then.onTheMDCFilterBar.iShouldSeeTheAdaptFiltersButton();
		//TODO iShouldSeeTheFilterFieldsWithLabels does not work when we have a basic search field on the Filterbar.
		//Then.onTheMDCFilterBar.iShouldSeeTheFilterFieldsWithLabels(["", "Author ID", "Title", "Stock range", "Published", "Language", "Genre", "Sub Genre"]);

		// Chart (I should see a “Books Chart” Chart with Bars chart)
		var sChartID = "listreport---books--bookChart";
		Then.onTheMDCChart.iShouldSeeAChart();
		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartID, "column");



		// I should see a Books table with columns (x,y,z) and n rows.
		Then.onTheMDCTable.iShouldSeeTheTableHeader("Books");



		// I search books with titles “Wallpaper“ using the Search Books filter field
		//TODO iEnterTextOnTheFilterField only works for FilterFields having a label, but not for the basic search
		//TODO should work with id instead of label as parameter
		// When.onTheMDCFilterField.iEnterTextOnTheFilterField("Title", "*Wallpaper*");

		When.onTheMDCFilterBar.iEnterFilterValue(sFilterBarID, {
			Books: {
				label: "Title",
				values: ["*Wallpaper*"]
			}
		});
		Then.onTheMDCFilterBar.iShouldSeeFilters(sFilterBarID, {
			"Title": [
				{
					operator: "Contains",
					values: ["Wallpaper" ]
				}
			]
		});



		//I press the Go button (or press enter in the search field)
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);



		//I should see a table with one book and the title “The Yellow Wallpaper“
		Then.onTheMDCTable.iShouldSeeRowsWithData(1);


		// I click on the row The Yellow Wallpaper
		var link = {text: "The Yellow Wallpaper"};
		When.onTheMDCLink.iPressTheLink(link);
		When.onTheMDCLink.iPressLinkOnPopover(link, "Manage book");



		//I should see a new Factsheet screen….
		// Not available



		//I toggle the screen into  edit mode (press Edit button)
		When.util.iPressButton("Edit");



		//I should see an editable field Price with value 22.00 GBP
		var sFieldId = "listreport---bookdetails--fPrice";
		// Then.onTheMDCField.iShouldSeeTheFieldWithValues(sFieldId, ['22', 'GBP']);



		//I change the Price to 48.79 GBP
		// TODO How can I change value and unit
		When.onTheMDCField.iEnterTextOnTheField(sFieldId, '1234.56');



		//I save the changed price
		When.util.iPressButton("Save");



		//I should see a table with one row and a column Price with value 48.79 GBP
		Then.onTheMDCTable.iShouldSeeARowWithData(0, JSON.parse('["The Yellow Wallpaper","Mentally ill women  Fiction, Feminist fiction, Psychological fiction, Married women  Psychology  Fiction, Sex role  Fiction",102,["1234.56","GBP"],815,"religious_text","prophecy"]'));



		// TODO revert the database modifications
		// When.onTheMDCLink.iPressTheLink(link);
		// When.onTheMDCLink.iPressLinkOnPopover(link, "Manage book");
		// When.util.iPressButton("Edit");
		// When.onTheMDCField.iEnterTextOnTheField(sFieldId, "22.00");
		// When.util.iPressButton("Save");

		Then.iTeardownMyUIComponent();
	});

	opaTest("twfb - Search a book via Created On DateTime filterfield.", function(Given, When, Then) {
		var booksComponentID = "listreport---books--";
		var sFilterBarID = booksComponentID + "booksFilterBar";

		// I start the Manage Books TwFb example app
		Given.iStartMyUIComponentInViewMode();

		When.onTheMDCFilterBar.iPersonalizeFilter(sFilterBarID, {	Books: ["Created On"] });
		When.onTheMDCFilterField.iEnterTextOnTheFilterField("Created On", "Feb 22, 2005, 6:24:25 PM");

		//I press the Go button (or press enter in the search field)
		When.onTheMDCFilterBar.iExpectSearch(sFilterBarID);

		//I should see a table with one book and the title “The Yellow Wallpaper“
		Then.onTheMDCTable.iShouldSeeRowsWithData(1);

		Then.iTeardownMyUIComponent();
	});


});
