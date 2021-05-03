/* global QUnit */
sap.ui.require([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
    'sap/ui/mdc/integration/testlibrary/ChartNew/ActionsViz',
	'sap/ui/mdc/integration/testlibrary/ChartNew/AssertionsViz'
], function(
	Opa5,
	opaTest,
    Actions,
    Assertions
) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/comp");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		autoWait: true,
		enabled: false,
		actions: Actions,
		assertions: Assertions,
		arrangements: {
			iStartMyUIComponentInViewMode: function(sComponentName) {
				return this.iStartMyUIComponent({
					componentConfig: {
						name: sComponentName,
						async: true
					},
					hash: "",
					autowait: true
				});
			}
		}
	});

	QUnit.module("MDC Chart");

	opaTest("When I look at the screen, MDC Chart should appear", function(Given, When, Then) {
		Given.iStartMyUIComponentInViewMode("applicationUnderTestMDCChart");

		When.iLookAtTheScreen();

		Then.iShouldSeeAChart();
	});

    opaTest("When I click on the  \"ChartType\" button, Chart should open the chart type popover", function(Given, When, Then) {
		When.iClickOnTheChartTypeButton("__component0---chartNew--bookChart");

		Then.iShouldSeeAChartTypePopover();

		When.iSelectChartTypeInPopover("Pie Chart");

		Then.iShouldSeeTheChartWithChartType("__component0---chartNew--bookChart", "pie");

	});

	opaTest("When I click on \"Zoom In\", Chart should zoom in", function(Given, When, Then) {
		When.iClickOnZoomIn("__component0---chartNew--bookChart");

		Then.iShouldSeeAChart();
	});

	opaTest("When I click on \"Legend\", Chart should toggle the legend", function(Given, When, Then) {
		When.iClickOnTheLegendToggleButton("__component0---chartNew--bookChart");

		Then.iShouldSeeNoLegend("__component0---chartNew--bookChart");

		When.iClickOnTheLegendToggleButton("__component0---chartNew--bookChart");

		Then.iShouldSeeALegend("__component0---chartNew--bookChart");
	});

	opaTest("When I click on a  \"View By\", Chart should open the drill-down window", function(Given, When, Then) {
		When.iClickOnTheDrillDownButton("__component0---chartNew--bookChart");

		Then.iShouldSeeADrillDownPopover(); //TODO: I should see drilldown popover

		When.iSelectANewDrillDimensionInPopover("Genre");

		Then.iSeeTheDrillStack(["language_code", "genre_code"], "__component0---chartNew--bookChart");
	});

	opaTest("When I click on a  breadcrumb, Chart should perform a drill-up", function(Given, When, Then) {
		When.iClickOnTheBreadcrumbWithNameOnChart("Languages", "__component0---chartNew--bookChart");

		Then.iSeeTheDrillStack(["language_code"], "__component0---chartNew--bookChart");
	});


});
