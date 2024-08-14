sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Arrangement',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Util',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Action',
	'test-resources/sap/ui/mdc/qunit/p13n/OpaTests/utility/Assertion',
	'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
	'test-resources/sap/ui/mdc/testutils/opa/link/Assertions',
	'test-resources/sap/ui/mdc/testutils/opa/chart/ActionsBase',
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press"
], function(Opa5, opaTest, Arrangement, TestUtil, Action, Assertion, testLibrary, LinkAssertions, ChartActions, PropertyStrictEquals, Press) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/mdc");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		arrangements: new Arrangement(),
		actions: {
			...new Action(),
			iClickOnTheSelectionDetailsItem: ChartActions.iClickOnTheSelectionDetailsItem,
			iClickOnStandardListItem: function(sTitle) {
				this.waitFor({
					controlType: "sap.m.StandardListItem",
					matchers: new PropertyStrictEquals({
						name: "title",
						value: sTitle
					}),
					actions: new Press(),
					success: function(aStandardListItems) {
						Opa5.assert.equal(aStandardListItems.length, 1, "StandardListItem found.");
					}
				});
			}
		},
		assertions: {
			...new Assertion(),
			iShouldSeeLinksOnPopover: function(aLinks) {
				LinkAssertions.iShouldSeeLinksOnPopover.call(this, undefined, aLinks);
			},
			iShouldSeeStandardListItem: function(sTitle) {
				this.waitFor({
					controlType: "sap.m.StandardListItem",
					matchers: new PropertyStrictEquals({
						name: "title",
						value: sTitle
					}),
					success: function(aStandardListItems) {
						Opa5.assert.equal(aStandardListItems.length, 1, "StandardListItem found.");
					}
				});
			}
		},
		viewNamespace: "view.",
		autoWait: true,
		timeout: 45
	});

	const sChartId = "__component0---IDViewOfAppUnderTestChart--IDChartOfAppUnderTestChart";

	opaTest("When I start the 'appUnderTestChart' app, the chart with some dimensions and measures appears", function(Given, When, Then) {
		Given.enableAndDeleteLrepLocalStorage();
		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/chart/OpaTests/basicValidation/appUnderTestChart/ChartOpaApp.html',
			autoWait: true
		});

		//When.iLookAtTheScreen();

		Then.onTheMDCChart.iShouldSeeAChart();
	});

	opaTest("When I click on a  \"View By\", Chart should open the drill-down window", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheDrillDownButton(sChartId);

		Then.onTheMDCChart.iShouldSeeADrillDownPopover(); //TODO: I should see drilldown popover

		When.onTheMDCChart.iSelectANewDrillDimensionInPopover("Genre");

		Then.onTheMDCChart.iShouldSeeTheDrillStack(["language_code", "genre_code"], sChartId);
	});

	opaTest("When I click on \"Zoom In\", Chart should zoom in", function(Given, When, Then) {

		When.onTheMDCChart.iClickOnZoomIn(sChartId);

		Then.onTheMDCChart.iShouldSeeAChart();

		When.onTheMDCChart.iClickOnZoomOut(sChartId);

		Then.onTheMDCChart.iShouldSeeAChart();
	});

	opaTest("When I click on the  \"ChartType\" button, Chart should open the chart type popover", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheChartTypeButton(sChartId);

		Then.onTheMDCChart.iShouldSeeAChartTypePopover();

		When.onTheMDCChart.iSelectChartTypeInPopover("Pie Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartId, "pie");

	});

	opaTest("When I change the chart type, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iSelectAChartType(sChartId, "Line Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType(sChartId, "line");

	});


	opaTest("When I drill down, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iDrillDownInDimension(sChartId, "Title");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code", "genre_code", "title"], sChartId);

	});

	opaTest("When I click on \"Legend\", Chart should toggle the legend", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartId);

		Then.onTheMDCChart.iShouldSeeNoLegend(sChartId);

		When.onTheMDCChart.iClickOnTheLegendToggleButton(sChartId);

		Then.onTheMDCChart.iShouldSeeALegend(sChartId);
	});

	opaTest("When I click on a  breadcrumb, Chart should perform a drill-up", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheBreadcrumbWithName("Languages", sChartId);

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code"], sChartId);
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], sChartId);
	});

	opaTest("When I select a datapoint, I can access the details popover", function(Given, When, Then) {
		When.onTheMDCChart.iSelectTheDatapoint([{
			index: 0,
			measures: ["averagemetricsWords"]
		}], sChartId);

		When.onTheMDCChart.iClickOnTheSelectionDetailsButton(sChartId);

		Then.onTheMDCChart.iShouldSeeADetailsPopover(sChartId);

		When.iClickOnTheSelectionDetailsItem();

		Then.iShouldSeeStandardListItem("Title_1");
		Then.iShouldSeeStandardListItem("Title_2");

		When.iClickOnStandardListItem("Title_1");

		Then.iShouldSeeLinksOnPopover(["Link_1"]);
	});

	opaTest("When I select a datapoint and drill down, I should see the correct dimensions", function(Given, When, Then) {
		When.onTheMDCChart.iSelectTheDatapoint([{
			index: 0,
			measures: ["averagemetricsWords"]
		}], sChartId);

		When.onTheMDCChart.iDrillDownInDimension(sChartId, "Genre");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["genre_code"], sChartId);
	});

	opaTest("When I personalize the chart, the chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iPersonalizeChart(sChartId, [
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

		When.onTheMDCChart.iPersonalizeSort(sChartId, [
			{
				key: "Language",
				descending: true
			}
		]);

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["classification_code", "language_code"], sChartId);
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], sChartId);

		When.onTheMDCChart.iResetThePersonalization(sChartId);
		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code"], sChartId);
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], sChartId);
	});

	opaTest("Teardown", function(Given, When, Then) {
		Then.onTheMDCChart.iShouldSeeAChart();
		Then.iTeardownMyAppFrame();
	});
});