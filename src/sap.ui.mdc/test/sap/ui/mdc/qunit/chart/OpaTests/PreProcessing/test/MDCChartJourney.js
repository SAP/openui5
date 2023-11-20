sap.ui.require([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
    'test-resources/sap/ui/mdc/testutils/opa/TestLibrary',
	"sap/ui/test/matchers/PropertyStrictEquals",
	"sap/ui/test/actions/Press"
], function(
	Opa5,
	opaTest,
    testLibrary,
	PropertyStrictEquals,
	Press
) {
	'use strict';

	if (window.blanket) {
		//window.blanket.options("sap-ui-cover-only", "sap/ui/comp");
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		autoWait: true,
		enabled: false,
		arrangements: {
			iStartMyUIComponentInViewMode: function(sComponentName) {
				return this.iStartMyUIComponent({
					componentConfig: {
						name: sComponentName,
						async: true
					},
					hash: "",
					autoWait: true
				});
			}
		},
		actions: new Opa5({
			iClickOnTheVMButton : function () {
				return this.waitFor({
					controlType: "sap.m.Button",
					matchers: [
						new PropertyStrictEquals({
							name: "icon",
							value: "sap-icon://slim-arrow-down"
						})
					],
					success: function(aBtns) {
						new Press().executeOn(aBtns[0]);
					}
				});
			}
		}),
		assertions: new Opa5({
			iShouldSeeAnVMPopover : function () {
				return this.waitFor({
					id: "container-applicationUnderTestMDCChart---chartNew--variantManagementChart-vm-popover",
					success: function(oPopver) {
						Opa5.assert.ok(oPopver, "VM Popover is opened");
					},
					errorMessage: "No Dialogs found"
				});
			},

			thereShouldBeNoFetchPropertiesCalled : function() {
				return this.waitFor({
					id: "container-applicationUnderTestMDCChart---chartNew--bookChart",
					success: function(oMDCChart) {
						Opa5.assert.ok(!oMDCChart.isPropertyHelperFinal(), "PropertyHelper is not finalized");
					},
					errorMessage: "No Chart found"
				});
			},

			thereShouldBeFetchPropertiesCalled : function() {
				return this.waitFor({
					id: "container-applicationUnderTestMDCChart---chartNew--bookChart",
					success: function(oMDCChart) {
						Opa5.assert.ok(oMDCChart.isPropertyHelperFinal(), "PropertyHelper is finalized");
					},
					errorMessage: "No Chart found"
				});
			}
		})
	});

	opaTest("When I look at the screen, MDC Chart should appear", function(Given, When, Then) {
		//Given.iStartMyUIComponentInViewMode("applicationUnderTestMDCChart");

		Given.iStartMyAppInAFrame({
			source: 'test-resources/sap/ui/mdc/qunit/chart/OpaTests/PreProcessing/start.html',
			autoWait: true
		});

		//When.iLookAtTheScreen();

		Then.onTheMDCChart.iShouldSeeAChart();
		Then.thereShouldBeNoFetchPropertiesCalled();
	});

	opaTest("When I click on a  \"View By\", Chart should open the drill-down window", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheDrillDownButton("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeADrillDownPopover();
		Then.thereShouldBeFetchPropertiesCalled();

		When.onTheMDCChart.iSelectANewDrillDimensionInPopover("Genre");

		Then.onTheMDCChart.iShouldSeeTheDrillStack(["language_code", "genre_code"], "container-applicationUnderTestMDCChart---chartNew--bookChart");
	});

	opaTest("When I click on \"Zoom In\", Chart should zoom in", function(Given, When, Then) {

		When.onTheMDCChart.iClickOnZoomIn("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeAChart();

		When.onTheMDCChart.iClickOnZoomOut("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeAChart();
	});

    opaTest("When I click on the  \"ChartType\" button, Chart should open the chart type popover", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheChartTypeButton("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeAChartTypePopover();

		When.onTheMDCChart.iSelectChartTypeInPopover("Pie Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType("container-applicationUnderTestMDCChart---chartNew--bookChart", "pie");

	});

	opaTest("When I change the chart type, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iSelectAChartType("container-applicationUnderTestMDCChart---chartNew--bookChart", "Line Chart");

		Then.onTheMDCChart.iShouldSeeTheChartWithChartType("container-applicationUnderTestMDCChart---chartNew--bookChart", "line");

	});


	opaTest("When I drill down, the inner chart should change", function(Given, When, Then) {
		When.onTheMDCChart.iDrillDownInDimension("container-applicationUnderTestMDCChart---chartNew--bookChart", "Title");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code", "genre_code", "title"], "container-applicationUnderTestMDCChart---chartNew--bookChart");

	});

	opaTest("When I click on \"Legend\", Chart should toggle the legend", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheLegendToggleButton("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeNoLegend("container-applicationUnderTestMDCChart---chartNew--bookChart");

		When.onTheMDCChart.iClickOnTheLegendToggleButton("container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeALegend("container-applicationUnderTestMDCChart---chartNew--bookChart");
	});

	opaTest("When I click on a  breadcrumb, Chart should perform a drill-up", function(Given, When, Then) {
		When.onTheMDCChart.iClickOnTheBreadcrumbWithName("Languages", "container-applicationUnderTestMDCChart---chartNew--bookChart");

		Then.onTheMDCChart.iShouldSeeVisibleDimensionsInOrder(["language_code"], "container-applicationUnderTestMDCChart---chartNew--bookChart");
		Then.onTheMDCChart.iShouldSeeVisibleMeasuresInOrder(["averagemetricsWords"], "container-applicationUnderTestMDCChart---chartNew--bookChart");
	});

	opaTest("When I click on the Variant Management, the dialog opens", function(Given, When, Then) {
		When.iClickOnTheVMButton();

		Then.iShouldSeeAnVMPopover();
	});

});
