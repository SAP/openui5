/*!
 * ${copyright}
 */

/* global QUnit */

sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit"
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
		}
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

		var sFieldID = "__component" + iComponent + "---books--ff1";
		When.onTheMDCValueHelp.iOpenTheValueHelpForField(sFieldID);
		//TODO not more action or assertions available
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true); //TODO close only work with FieldValueHelp

		sFieldID = "__component" + iComponent + "---books--ff2";
		When.onTheMDCValueHelp.iOpenTheValueHelpForField(sFieldID);
		When.onTheMDCValueHelp.iCloseTheValueHelpDialog(true);

		Then.iTeardownMyUIComponent();
	});


	opaTest("twfb - start app and test personalization of table", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sTableID = "__component" + iComponent + "---books--booksTable";
		//???? why onTable and not onTheMDCTable?
		//???? first parameter is called oControl. Why not oTable or vTableIdentifier.....
		When.onTable.iPersonalizeColumns(sTableID, ["Genre", "Sub Genre"]);
		When.onTable.iResetThePersonalization(sTableID);
		//Then TODO no assertions available

		//TODO only works with comp
		//When.onTable.iPersonalizeFilter(sTableID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);

		When.onTable.iPersonalizeSort(sTableID, [{key: "Price", descending: false}]); //ERROR failed because of custom stock slider (when at the end I call teardown....)
		// When.onTable.iResetThePersonalization(sTableID);

		Then.iTeardownMyUIComponent();
	});


	opaTest("twfb - start app and test chart/personalization", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode();

		var sChartID = "__component" + iComponent + "---books--bookChart";

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
		When.onTable.iResetThePersonalization(sChartID);

		//TODO does not exist for Chart
		// When.onTheMDCChart.iPersonalizeFilter(sChartID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);

		When.onTheMDCChart.iPersonalizeSort(sChartID, [{key: "Language", descending: true}]); // This is not a key it is the label!
		When.onTable.iResetThePersonalization(sChartID);

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

		var sFilterBarID = "__component" + iComponent + "---books--booksFilterBar";
		// for the Filterbar the sFilterBarID can be Object instance or id string.
		When.onFilterBar.iPersonalizeFilter(sFilterBarID, {	Books: ["Author ID"] });
		//    When.onTheMDCChart.iPersonalizeFilter(sFilterBarID, [{key : "language_code", operator: "EQ", values: ["DE"], inputControl: "__component0---books--booksTable--filter--language_code"}]);
		//TODO no assertions available
		When.onFilterBar.iResetThePersonalization(sFilterBarID);

		When.onFilterBar.iEnterFilterValue(sFilterBarID, { // Why does this action always change FilterValues on the Adapt Filters dialog and not directly on the FB?
			Books: {
				label: "Author ID",
				values: [ "101"] //, "102" ]
			}
		});
		Then.onFilterBar.iShouldSeeFilters(sFilterBarID, {
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

		When.onFilterBar.iExpectSearch(sFilterBarID);

		//ERROR Clear does not work. It waits for tokens which are not visible on the field
		When.onFilterBar.iClearFilterValue(sFilterBarID, "Author ID");
		Then.onFilterBar.iShouldSeeFilters(sFilterBarID, {
			"Author ID": []
		});
		When.onFilterBar.iExpectSearch(sFilterBarID);

		Then.iTeardownMyUIComponent();
	});

});
