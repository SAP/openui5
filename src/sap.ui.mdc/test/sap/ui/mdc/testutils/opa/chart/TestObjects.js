/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"./ActionsViz",
	"./AssertionsViz",
	"../p13n/Actions",
	"../p13n/Assertions"
], function(
	Opa5,
	chartActions,
	chartAssertions,
	p13nActions,
	p13nAssertions
) {
	"use strict";

	/**
	 * @namespace onTheMDCChart
	 */
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
				 * @memberof onTheMDCChart
				 * @method iPersonalizeChart
				 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is personalized
				 * @param {ChartPersonalizationConfiguration[]} aConfigurations Array containing the chart personalization configuration objects
				 * @returns {Promise} OPA waitFor
				 * 1. Opens the personalization dialog of a given <code>sap.ui.mdc.Chart</code>.
				 * 2. Selects a chart type given by <code>sChartType</code>.
				 * 3. Executes the given <code>ChartPersonalizationConfigurations</code>.
				 * 4. Closes the personalization dialog.
				 */
				iPersonalizeChart: function(oChart, aConfigurations){
					return p13nActions.iPersonalizeChart.call(this, oChart, null, aConfigurations, true, chartActions.iOpenThePersonalizationDialog);
				},
				/**
				 * @typedef {object} FilterPersonalizationConfiguration
				 * @property {string} key Key of the value that is the result of the personalization
				 * @property {string} operator Operator defining how the items are filtered
				 * @property {string[]} values Filter values for the given operator
				 * @property {string} inputControl <code>Control</code> that is used as input for the value
				 */

				/**
				 * OPA5 test action
				 * 1. Opens the personalization dialog of a given chart.
				 * 2. Executes the given <code>FilterPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCChart
				 * @method iPersonalizeFilter
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {FilterPersonalizationConfiguration[]} aSettings Array containing the filter personalization configuration objects
				 * @param {boolean} bCancel Cancel the personalization dialog after the configuration has been done instead of confirming it
				 * @returns {Promise} OPA waitFor
				 * @public
				 */
				 iPersonalizeFilter: function(oControl, aSettings, bCancel) {
					return p13nActions.iPersonalizeFilter.call(this, oControl, aSettings, chartActions.iOpenThePersonalizationDialog, bCancel);
				},
				/**
				 * @typedef {object} SortPersonalizationConfiguration
				 * @property {string} key Key of the item that is the result of the personalization
				 * @property {boolean} descending Determines whether the sort direction is descending
				 */
				/**
				 * OPA5 test action
				 * @memberof onTheMDCChart
				 * @method iPersonalizeSort
				 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is sorted
				 * @param {SortPersonalizationConfiguration[]} aConfigurations Array containing the sort personalization configuration objects
				 * @returns {Promise} OPA waitFor
				 * 1. Opens the personalization dialog of a given chart.
				 * 2. Executes the given <code>SortPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 */
				iPersonalizeSort: function(oChart, aConfigurations) {
					return p13nActions.iPersonalizeSort.call(this, oChart, aConfigurations, chartActions.iOpenThePersonalizationDialog);
				},
				/**
				 * Opa5 test action
				 * @memberof onTheMDCChart
				 * @method iResetThePersonalization
				 * @param {sap.ui.core.Control | string} oChart Instance / ID of the <code>MDCChart</code> that is reset
				 * @returns {Promise} OPA waitFor
				 * 1. Opens the personalization dialog of a given chart.
				 * 2. Presses the Reset personalization button.
				 * 3. Confirms the Reset dialog.
				 * 4. Closes the personalization dialog.
				 */
				iResetThePersonalization: function(oChart) {
					return p13nActions.iResetThePersonalization.call(this, oChart, chartActions.iOpenThePersonalizationDialog);
				},

				/**
				 * OPA5 test action
				 * Presses the "Zoom In" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnZoomIn
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnZoomIn : function(sId){
					return chartActions.iClickOnZoomIn.call(this, sId);
				},

				/**
				 * OPA5 test action
				 * Presses the "Zoom Out" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnZoomOut
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnZoomOut : function(sId){
					return chartActions.iClickOnZoomOut.call(this, sId);
				},
				/**
				 * OPA5 test action
				 * Presses the "Show Legend" toggle button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnTheLegendToggleButton
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnTheLegendToggleButton : function(sId){
					return chartActions.iClickOnTheLegendToggleButton.call(this, sId);
				},
				/**
				 * OPA5 test action
				 * Presses the "Show Details" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnTheSelectionDetailsButton
				 * @param {*} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnTheSelectionDetailsButton: function(sId){
					return chartActions.iClickOnTheSelectionDetailsButton.call(this, sId);
				},
				/**
				 * OPA5 test action
				 * Presses the "Drilldown" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnTheDrillDownButton
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnTheDrillDownButton: function(sId){
					return chartActions.iClickOnTheDrillDownButton.call(this, sId);
				},
				/**
				 * OPA5 test action
				 * Presses the "Chart Type" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnTheChartTypeButton
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnTheChartTypeButton: function(sId){
					return chartActions.iClickOnTheChartTypeButton.apply(this, arguments);
				},
				/**
				 * OPA5 test action
				 * Presses the "Personalization" button in the toolbar of a <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnThePersonalisationButton
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnThePersonalisationButton: function(sId){
					return chartActions.iClickOnThePersonalisationButton.call(this, sId);
				},
				/**
				 * OPA5 test action
				 * Selects a specific chart type for a <code>sap.ui.mdc.Chart</code> in an open chart type popover.
				 * @memberof onTheMDCChart
				 * @method iSelectChartTypeInPopover
				 * @param {string} sChartTypeName The name of the chart type
				 * @returns {Promise} OPA waitFor
				 */
				iSelectChartTypeInPopover: function(sChartTypeName){
				   return chartActions.iSelectChartTypeInPopover.call(this, sChartTypeName);
				},
				/**
				 * OPA5 test action
				 * Presses an drill-down breadcrumb with a given name for a given <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iClickOnTheBreadcrumbWithName
				 * @param {string} sName The name of the breadcrumbs
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iClickOnTheBreadcrumbWithName: function(sName, sId){
					return chartActions.iClickOnTheBreadcrumbWithName.call(this, sName, sId);
				},
				/**
				 * OPA5 test action
				 * Selects a specific dimension to drill-down for a <code>sap.ui.mdc.Chart</code> in an open chart drill-down popover.
				 * @memberof onTheMDCChart
				 * @method iSelectANewDrillDimensionInPopover
				 * @param {string} sDrillName Name of the dimension to which a drill-down takes place
				 * @returns {Promise} OPA waitFor
				 */
				iSelectANewDrillDimensionInPopover: function(sDrillName){
					return chartActions.iSelectANewDrillDimensionInPopover.call(this, sDrillName);
				},
				/**
				* OPA5 test action
				* Selects given data points on a given <code>sap.ui.mdc.Chart</code>.
				* @memberof onTheMDCChart
				* @method iSelectTheDatapoint
				* @param {array} aDataPoints Data point objects to select
				* @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				* @returns {Promise} OPA waitFor
				*/
			   iSelectTheDatapoint: function (aDataPoints, sId){
					return chartActions.iSelectTheDatapoint.call(this, aDataPoints, sId);
			   },
			   /**
				* OPA5 test action
				* Selects given categories (dimensions) for the given <code>sap.ui.mdc.Chart</code>.
				* @memberof onTheMDCChart
				* @method iSelectTheCategories
				* @param {object} oCategories Categories to select
				* @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				* @returns {Promise} OPA waitFor
				*/
			   iSelectTheCategories: function (oCategories, sId){
					return chartActions.iSelectTheDatapoint.call(this, oCategories, sId);
			   },
			   /**
				* OPA5 test action
				* Performs a drill-down on the <code>sap.ui.mdc.Chart</code>
				* @memberof onTheMDCChart
				* @method iDrillDownInDimension
				* @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				* @param {string} sDrillName Name of the dimension to which a drill-down takes place
				* @returns {Promise} OPA waitFor
				*/
				iDrillDownInDimension: function(sId, sDrillName) {
				   return chartActions.iDrillDownInDimension.call(this, sId, sDrillName);
			   },
			   /**
				* OPA5 test action
				* Performs a drill-down on the <code>sap.ui.mdc.Chart</code>
				* @memberof onTheMDCChart
				* @method iSelectAChartType
				* @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				* @param {string} sChartTypeName Name of the chart type which is to be selected
				* @returns {Promise} OPA waitFor
				*/
				iSelectAChartType: function(sId, sChartTypeName) {
					return chartActions.iSelectAChartType.call(this, sId, sChartTypeName);
				}

			},
			assertions: {
				/**
				 * OPA5 assertion
				 * Assertion to check that there is a <code>sap.ui.mdc.Chart</code> visible on the screen.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeAChart
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeAChart: function() {
					return chartAssertions.iShouldSeeAChart.call(this);
				},
				/**
				 * Assertion to check that there is a legend visible on the screen for a given <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeALegend
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a visible legend
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeALegend: function(sId) {
					return chartAssertions.iShouldSeeALegend.call(this, sId);
				},
				/**
				 * Assertion to check that there is no legend visible on the screen for a given <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeNoLegend
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a visible legend
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeNoLegend: function(sId) {
					return chartAssertions.iShouldSeeNoLegend.call(this, sId);
				},

				/**
				 * Assertion to check that there is a chart type popover visible on the screen.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeAChartTypePopover
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeAChartTypePopover: function() {
					return chartAssertions.iShouldSeeAChartTypePopover.call(this);
				},
				/**
				 * Assertion to check that there is a <code>sap.ui.mdc.Chart</code> visible with a given chart type.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeTheChartWithChartType
				 * @param {string} sChartId The ID of the <code>sap.ui.mdc.Chart</code> to be checked for a chart type
				 * @param {string} sChartType Chart type which is selected for the given chart
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheChartWithChartType: function(sChartId,  sChartType){
					return chartAssertions.iShouldSeeTheChartWithChartType.call(this, sChartId, sChartType);
				},
				/**
				 * Assertion to check that there is a chart with a given drillstack visible.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeTheDrillStack
				 * @param {array} aCheckDrillStack Drillstack to check for
				 * @param {string} sChartId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeTheDrillStack: function(aCheckDrillStack, sChartId) {
					return chartAssertions.iShouldSeeTheDrillStack.call(this, aCheckDrillStack, sChartId);
				},
				/**
				 * Assertion to check that there is a drilldown popover visible.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeADrillDownPopover
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeADrillDownPopover: function() {
					return chartAssertions.iShouldSeeADrillDownPopover.call(this);
				},
				/**
				* Assertion to check that there is a details popover visible.
				* @memberof onTheMDCChart
				* @method iShouldSeeADetailsPopover
				* @returns {Promise} OPA waitFor
				*/
			   iShouldSeeADetailsPopover: function() {
				 return chartAssertions.iShouldSeeADetailsPopover.call(this);
				},
				/**
				 * Assertion to check visible dimensions on the <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeVisibleDimensionsInOrder
				 * @param {string[]} aDimensions Array containing the expected dimensions
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				 */
				iShouldSeeVisibleDimensionsInOrder: function(aDimensions, sId) {
					return chartAssertions.iShouldSeeVisibleDimensionsInOrder.call(this, aDimensions, sId);
				},
				/**
				 * Assertion to check visible measures on the <code>sap.ui.mdc.Chart</code>.
				 * @memberof onTheMDCChart
				 * @method iShouldSeeVisibleMeasuresInOrder
				 * @param {string[]} aMeasures Array containing the expected measures
				 * @param {string} sId The ID of the <code>sap.ui.mdc.Chart</code>
				 * @returns {Promise} OPA waitFor
				*/
				iShouldSeeVisibleMeasuresInOrder: function(aMeasures, sId) {
					return chartAssertions.iShouldSeeVisibleMeasuresInOrder.call(this, aMeasures, sId);
				},
				/**
				 * OPA5 test assertion
				 * 1. Opens the personalization dialog of a given chart.
				 * 2. Executes the given <code>FilterPersonalizationConfiguration</code>.
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCChart
				 * @method iCheckFilterPersonalization
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {FilterPersonalizationConfiguration[]} aConfigurations Array containing the filter personalization configuration objects
				 * @param {function} fnOpenThePersonalizationDialog a function which opens the personalization dialog of the given control
				 * @returns {Promise} OPA waitFor
				 */
				iCheckFilterPersonalization: function(oControl, aConfigurations) {
					return p13nAssertions.iCheckFilterPersonalization.call(this, oControl, aConfigurations, chartActions.iOpenThePersonalizationDialog);
				},

				/**
				 * OPA5 test assertion
				 * 1. Opens the personalization dialog of a given table.
				 * 2. Checks the availability of the provided filter texts (by opening and comparing the available items in the ComboBox)
				 * 3. Closes the personalization dialog.
				 * @memberof onTheMDCChart
				 * @method iCheckAvailableFilters
				 * @param {sap.ui.core.Control | string} oControl Instance / ID of the <code>Control</code> that is filtered
				 * @param {string[]} aFilters Array containing the names of selectable filters
				 * @returns {Promise} OPA waitFor
				 */
				iCheckAvailableFilters: function(oControl, aFilters) {
					return p13nAssertions.iCheckAvailableFilters.call(this, oControl, aFilters, chartActions.iOpenThePersonalizationDialog);
				}

			}
		}
	});

});