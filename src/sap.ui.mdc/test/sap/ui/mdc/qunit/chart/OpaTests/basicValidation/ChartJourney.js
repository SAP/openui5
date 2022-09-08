sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary'
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, testLibrary) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view.",
		autoWait: true,
		timeout: 45
	});



	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimentions and measures appears", function(Given, When, Then) {
		Given.enableAndDeleteLrepLocalStorage();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/chart/OpaTests/basicValidation/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

		//When.iLookAtTheScreen();

		Then.onTheMDCChart.iShouldSeeAChart();
	});

	opaTest("When I click on a  \"View By\", Chart should open the drill-down window", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheDrillDownButton("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeADrillDownPopover(); //TODO: I should see drilldown popover

		When.onTheMDCChart.iSelectANewDrillDimensionInPopover("Genre");

		Then.onTheMDCChart.iShouldSeeTheDrillStack(["language_code", "genre_code"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
	});

	opaTest("When I click on \"Zoom In\", Chart should zoom in", function(Given, When, Then) {

		When.onTheMDCChart.iClickOnZoomIn("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeAChart();

		When.onTheMDCChart.iClickOnZoomOut("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeAChart();
	});

    opaTest("When I click on the  \"ChartType\" button, Chart should open the chart type popover", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheChartTypeButton("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeAChartTypePopover();

		When.onTheMDCChart.iSelectChartTypeInPopover("Pie Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", "pie");

	});

	opaTest("When I change the chart type, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iSelectAChartType("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", "Line Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", "line");

	});


	opaTest("When I drill down, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iDrillDownInDimension("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", "Title");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code", "genre_code", "title"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

	});

	opaTest("When I click on \"Legend\", Chart should toggle the legend", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheLegendToggleButton("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeNoLegend("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		When.onTheMDCChart.iClickOnTheLegendToggleButton("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeALegend("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
	});

	opaTest("When I click on a  breadcrumb, Chart should perform a drill-up", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheBreadcrumbWithName("Languages", "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
	});

	opaTest("When I select a datapoint, I can access the details popover", function(Given, When, Then) {
		When.onTheMDCChart.iSelectTheDatapoint([{
			index: 0,
			measures: ['averagemetricsWords']
		}], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		When.onTheMDCChart.iClickOnTheSelectionDetailsButton("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		Then.onTheMDCChart.iShouldSeeADetailsPopover("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		When.onTheMDCChart.iDrillDownInDimension("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", "Genre");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code", "genre_code"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
	});

	opaTest("When I personalize the chart, the chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iPersonalizeChart("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", [
			{
				key: "Classification",
				role: "Category",
				kind: "Dimension"
			},
			{
				key: "Language",
				role: "Series",
				kind: "Dimension"
			},
			{
				key: "Words (average)",
				role: "Axis 1",
				kind: "Measure"
			}
		]);

		When.onTheMDCChart.iPersonalizeSort("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart", [
			{
				key: "Language",
				descending: true
			}
		]);

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["classification_code", "language_code"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");

		When.onTheMDCChart.iResetThePersonalization("__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart");
	});

	opaTest("Teardown", function(Given, When, Then) {
		Then.onTheMDCChart.iShouldSeeAChart();
		Then.iTeardownMyAppFrame();
	});
});