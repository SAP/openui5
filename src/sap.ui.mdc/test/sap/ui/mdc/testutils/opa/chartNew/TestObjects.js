/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"../chart/ActionsViz",
	"../chart/AssertionsViz",
	"../p13n/Actions"
], function(
	Opa5,
	chartActions,
	chartAssertions,
	p13nActions
) {
	"use strict";

	Opa5.createPageObjects({
		onTheMDCChart: {
			actions: {
                /**
                 * @typedef {object} ChartPersonalizationConfiguration
                 * @property {string} key Key of the value that is the result of the personalization
                 * @property {string} role Role of the given value
                 */
                /**
                 * OPA5 test action
                 * This only works with the new chart personalization
                 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is personalized
                 * @param {ChartPersonalizationConfiguration[]} aConfigurations Array containing the chart personalization configuration objects
                 * @returns {Promise} OPA waitFor
                 * 1. Opens the personalization dialog of a given chart.
                 * 2. Selects a chart type given by <code>sChartType</code>.
                 * 3. Executes the given ChartPersonalizationConfigurations.
                 * 4. Closes the personalization dialog.
                 */
                iPersonalizeChart: function(oChart, aConfigurations){
                    return p13nActions.iPersonalizeChart.call(this, oChart, null, aConfigurations, true, chartActions.iOpenThePersonalizationDialog);
                },
                /**
                 * @typedef {object} SortPersonalizationConfiguration
                 * @property {string} key Key of the item that is the result of the personalization
                 * @property {boolean} descending Determines whether the sort direction is descending
                 */
                /**
                 * OPA5 test action
                 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is sorted
                 * @param {SortPersonalizationConfiguration[]} aConfigurations Array containing the sort personalization configuration objects
                 * @returns {Promise} OPA waitFor
                 * 1. Opens the personalization dialog of a given chart.
                 * 2. Executes the given SortPersonalizationConfiguration.
                 * 3. Closes the personalization dialog.
                 */
                iPersonalizeSort: function(oChart, aConfigurations) {
                    return p13nActions.iPersonalizeSort.call(this, oChart, aConfigurations, chartActions.iOpenThePersonalizationDialog);
                },
                /**
                 * Opa5 test action
                 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is reset
                 * @returns {Promise} OPA waitFor
                 * 1. Opens the personalization dialog of a given chart.
                 * 2. Clicks on the reset personalization button.
                 * 3. Confirms the reset dialog.
                 * 4. Closes the personalization dialog.
                 */
                iResetThePersonalization: function(oChart) {
                    return p13nActions.iResetThePersonalization.call(this, oChart, chartActions.iOpenThePersonalizationDialog);
                },

                /**
                 * OPA5 test action
                 * Clicks on the "Zoom In" button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnZoomIn : function(sId){
                    return chartActions.iClickOnZoomIn.call(this, sId);
                },

                /**
                 * OPA5 test action
                 * Clicks on the "Zoom Out" button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnZoomOut : function(sId){
                    return chartActions.iClickOnZoomOut.call(this, sId);
                },
                /**
                 * OPA5 test action
                 * Clicks on the "Legend" toggle button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnTheLegendToggleButton : function(sId){
                    return chartActions.iClickOnTheLegendToggleButton.call(this, sId);
                },
                /**
                 * OPA5 test action
                 * Clicks on the "Show Details" button in the toolbar of a mdc chart.
                 * @param {*} sId The id of the mdc chart
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnTheSelectionDetailsButton: function(sId){
                    return chartActions.iClickOnTheSelectionDetailsButton.call(this, sId);
                },
                /**
                 * OPA5 test action
                 * Clicks on the "Drilldown" button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart.
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnTheDrillDownButton: function(sId){
                    return chartActions.iClickOnTheDrillDownButton.call(this, sId);
                },
                /**
                 * OPA5 test action
                 * Clicks on the "Chart Type" button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart.
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnTheChartTypeButton: function(sId){
                    return chartActions.iClickOnTheChartTypeButton.apply(this, arguments);
                },
                /**
                 * OPA5 test action
                 * Clicks on the "Personalisation" button in the toolbar of a mdc chart.
                 * @param {string} sId The id of the mdc chart.
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnThePersonalisationButton: function(sId){
                    return chartActions.iClickOnThePersonalisationButton.call(this, sId);
                },
                /**
                 * OPA5 test action
                 * Selects a specific chart type for a mdc chart in an open chart type popover
                 * @param {string} sChartTypeName The name of the chart type
                 * @returns {Promise} OPA waitFor
                 */
                iSelectChartTypeInPopover: function(sChartTypeName){
                   return chartActions.iSelectChartTypeInPopover.call(this, sChartTypeName);
                },
                /**
                 * OPA5 test action
                 * Clicks on an drill-down breadcrumb with given name for given mdc chart
                 * @param {string} sName The name of the breadcrumbs
                 * @param {string} sId Id of the mdc chart.
                 * @returns {Promise} OPA waitFor
                 */
                iClickOnTheBreadcrumbWithName: function(sName, sId){
                    return chartActions.iClickOnTheBreadcrumbWithName.call(this, sName, sId);
                },
                /**
                 * OPA5 test action
                 * Selects a specific dimension to drill-down for a mdc chart in an open chart drill-down popover
                 * @param {string} sDrillName Name of the Dimension which should be drilled-down
                 * @returns {Promise} OPA waitFor
                 */
                iSelectANewDrillDimensionInPopover: function(sDrillName){
                    return chartActions.iSelectANewDrillDimensionInPopover.call(this, sDrillName);
                },
                /**
                 * OPA5 test action
                * Selects given datapoints on given chart.
                * @param {array} aDataPoints Datapoint objects to select
                * @param {string} sId Id of the mdc chart
                * @returns {Promise} OPA waitFor
                */
               iSelectTheDatapoint: function (aDataPoints, sId){
                    return chartActions.iSelectTheDatapoint.call(this, aDataPoints, sId);
               },
               /**
                * OPA5 test action
                * Selectes given categories (dimensions) for the given mdc chart
                * @param {object} oCategories Categories to select
                * @param {string} sId Id of the mdc chart
                * @returns {Promise} OPA waitFor
                */
               iSelectTheCategories: function (oCategories, sId){
                    return chartActions.iSelectTheDatapoint.call(this, oCategories, sId);
               },
               /**
                * OPA5 test action
                * Performs a drill-down on the MDC Chart
                * @param {string} sId The id of the MDC Chart.
                * @param {string} sDrillName Name of the Dimension which should be drilled-down.
                * @returns {Promise} OPA waitFor
                */
                iDrillDownInDimension: function(sId, sDrillName) {
                   return chartActions.iDrillDownInDimension.call(this, sId, sDrillName);
               },
               /**
                * OPA5 test action
                * Performs a drill-down on the MDC Chart
                * @param {string} sId The id of the MDC Chart
                * @param {string} sChartTypeName Name of the Dimension which should be drilled-down.
                * @returns {Promise} OPA waitFor
                */
                iSelectAChartType: function(sId, sChartTypeName) {
                    return chartActions.iSelectAChartType.call(this, sId, sChartTypeName);
                }

            },
            assertions: {
                /**
                 * OPA5 assertion
                 * Assertion to check that there is a mdc chart visible on the screen.
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeAChart: function() {
                    return chartAssertions.iShouldSeeAChart.call(this);
                },
                /**
                 * Assertion to check that there is a legend visible on the screen for given mdc chart.
                 * @param {string} sId Id of the chart to be checked for a visible legend
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeALegend: function(sId) {
                    return chartAssertions.iShouldSeeALegend.call(this, sId);
                },
                /**
                 * Assertion to check that there is no legend visible on the screen for given mdc chart.
                 * @param {string} sId Id of the chart to be checked for a visible legend
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeNoLegend: function(sId) {
                    return chartAssertions.iShouldSeeNoLegend.call(this, sId);
                },

                /**
                 * Assertion to check that there is a chart type popover visible on the screen.
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeAChartTypePopover: function() {
                    return chartAssertions.iShouldSeeAChartTypePopover.call(this);
                },
                /**
                 * Assertion to check that there is chart visible with given chart type.
                 * @param {string} sChartId Id of the chart to be checked for a chart type
                 * @param {string} sChartType Chart type which should be selected for the given chart
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeTheChartWithChartType: function(sChartId,  sChartType){
                    return chartAssertions.iShouldSeeTheChartWithChartType.call(this, sChartId, sChartType);
                },
                /**
                 * Assertion to check that there is a chart with given drillstack visible.
                 * @param {array} aCheckDrillStack Drillstack to check for
                 * @param {string} sChartId Id of the mdc chart
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeTheDrillStack: function(aCheckDrillStack, sChartId) {
                    return chartAssertions.iShouldSeeTheDrillStack.call(this, aCheckDrillStack, sChartId);
                },
                /**
                 * Assertion to check that there is a drilldown popover visible.
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeADrillDownPopover: function() {
                    return chartAssertions.iShouldSeeADrillDownPopover.call(this);
                },
                /**
                * Assertion to check that there is a drilldown popover visible.
                * @returns {Promise} OPA waitFor
                */
               iShouldSeeADetailsPopover: function() {
                 return chartAssertions.iShouldSeeADetailsPopover.call(this);
                },
                /**
                 * Assertion to check visible dimensions on the MDC Chart
                 * @param {string} sId Id of the MDC Chart
                 * @returns {Promise} OPA waitFor
                 */
                iShouldSeeVisibleDimensionsInOrder: function(aDimensions, sId) {
                    return chartAssertions.iShouldSeeVisibleDimensionsInOrder.call(this, aDimensions, sId);
                },
                /**
                 * Assertion to check visible measures on the MDC Chart
                 * @param {string} sId Id of the MDC Chart
                 * @returns {Promise} OPA waitFor
                */
                iShouldSeeVisibleMeasuresInOrder: function(aMeasures, sId) {
                    return chartAssertions.iShouldSeeVisibleMeasuresInOrder.call(this, aMeasures, sId);
                }
			}
        }
    });

});
