/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the MDC chart and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
    "sap/ui/mdc/AggregationBaseDelegate"
], function (AggregationBaseDelegate) {
    "use strict";

    /**
     * Base delegate class for sap.ui.mdc.Chart.<br>
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
     *
     * @author SAP SE
     * @private
     * @experimental
     * @since 1.88
     * @alias sap.ui.mdc.ChartDelegate
     */
    var ChartDelegate = Object.assign({}, AggregationBaseDelegate);


    /**
     * Toolbar relevant API (WIP)
     */

    /**
     *Zooms in on the inner chart.
     * @param {int} iValue Number of steps for zooming in
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.zoomIn = function (iValue) {
    };

    /**
     *Zooms out of the inner chart.
     * @param {int} iValue Number of steps for zooming out
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.zoomOut = function (iValue) {
    };


    /**
     * @typedef {object} ZoomState
     * @property {boolean} enabled <code>true</code> if zooming is enabled
     * @property {number} currentZoomLevel Current zoom level of the chart in percent (between 0 and 1)
     */
    /**
     * Retrieves the current zooming information for the inner chart.
     * @returns {ZoomState} Current zoom state on the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getZoomState = function () {
    };

    /**
     * @typedef {object} SelectionDetails
     * @property {string} eventId  ID of the selection event
     * @property {sap.ui.core.Control} reference Reference to inner chart
     */
    /**
     ** Returns the event handler for <code>chartSelectionDetails</code> as an object.
     *
     * @returns {SelectionDetails} Event handler for chartSelectionDetails
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getInnerChartSelectionHandler = function () {
    };

    /**
     * Sets the visibility of the legend.
     * <b>Note:</b> This function is called by the MDC chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#setLegendVisible LegendVisible} instead.
     * @param {boolean} bVisible <code>true</code> to show legend, <code>false</code> to hide
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.setLegendVisible = function (bVisible) {
    };

    /**
     * Creates a sorter for a given property.
     * @param {sap.ui.mdc.Chart.Item} oMDCItem MDC item for which a sorter is created
     * @param {object} oSortProperty The sorting information
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getSorterForItem = function (oMDCItem, oSortProperty) {
        //TODO: Check wether we really need this method.
        //TODO: Right now it is needed since the name of a property does not include the aggregation method -> leads to an error when calling back-end
        //TODO: In old chart, aggragation method was included in name since every method had their own Item
    };

    /**
     * Inserts an MDC chart item (for <code>sap.chart.Chart</code>, this would be a measure/dimension) into the inner chart.
     * This function is called by the MDC chart after a change of the <code>Items</code> aggregation.
     * <b>Note:</b> Do not call this yourself, as it would not be synced with the MDC chart, but instead insert the Item into the MDC chart.
     * @param {sap.ui.mdc.chart.Item} oMDCChartItem MDC chart item that is inserted into the inner chart
     * @param {int} iIndex The index into which items are inserted
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.insertItemToInnerChart = function (oMDCChartItem, iIndex) {
    };

    /**
     * Removes an item (for <code>sap.chart.Chart</code>, this would be a measure/dimension) from the inner chart.
     * This function is called by the MDC chart after a change of the <code>Items</code> aggregation.
     * <b>Note:</b> Do not call this yourself, as it would not be synced with the MDC chart, but instead remove the item from the MDC chart.
     * @param {sap.ui.mdc.chart.Item} oMDCChartItem The item to be removed from the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.removeItemFromInnerChart = function (oMDCChartItem) {
    };

    /**
     * Creates a new MDC chart item for a given property name and updates the inner chart.
     * <b>Note:</b> This does <b>not</b> add the MDC chart item to the <code>Items</code> aggregation of the MDC chart.
     * Called and used by <code>p13n</code>.
     * @param {string} sPropertyName Name of the property added
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart to which the item is added
     * @returns {Promise<sap.ui.mdc.Chart.Item>} <code>Promise</code> that resolves with new MDC chart item as parameter
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.addItem = function (sPropertyName, oMDCChart, mPropertyBag, sRole) {
    };

    /**
     * Removes an existing MDC chart item for a given property name and updates the inner chart.
     * Called and used by p13n
     * @param {string} sPropertyName Name of the property removed
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart from which property is removed
     * @returns {Promise<bool>} Promise containing information whether the item was deleted
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.removeItem = function (oProperty, oMDCChart) {
        return Promise.resolve(true);
    };

    /**
     * Chart relevant API (WIP)
     */

    /**
     * Loads the required libraries and creates the inner chart.
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @returns {Promise} Resolved once the inner chart has been initialized
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.initializeInnerChart = function (oMDCChart) {
    };

    /**
     * Creates the initial content for the chart before the metadata is retrieved.
     * This can be used by chart libraries that can already show some information without the actual data (for example, axis labels, legend, ...).
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.createInitialChartContent = function (oMDCChart) {
        //Not relevant for sap.chart.Chart
    };
    /**
     * Returns the instance of the inner chart.
     * @returns {sap.core.Control} Instance of the inner chart
     */
    ChartDelegate.getInnerChart = function () {
    };

    /**
     * @typedef {object} ChartTypeObject
     * @property {string} key Unique key of the chart type
     * @property {string} icon URI for the icon for the current chart type
     * @property {string} text Name of the current chart type
     * @property {boolean} selected Whether the chart type is the one currently used
     */
    /**
     * Returns the current chart type.
     * @returns {ChartTypeObject} Information about the current chart type
     * @throws exception if inner chart is not initialized yet
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getChartTypeInfo = function () {
    };

    /**
     * This function is used by P13n to determine which chart type supports which layout options.
     * There might be chart tyoes which do not support certain layout options (i.e. "Axis3").
     * Layout config is defined as followed:
     * {
     *  key: string //identifier for the chart type
     *  allowedLayoutOptions : [] //array containing allowed layout options as string
     * }
     *
     * @returns {array}
     */
    ChartDelegate.getChartTypeLayoutConfig = function() {

    };

    /**
     * Gets the available chart types for the current state of the inner chart.
     *
     * @returns {Array<ChartTypeObject>} Array containing the available chart types
     *
     * @experimental
     * @private
     * @ui5-restricted Fiori Elements
     */
    ChartDelegate.getAvailableChartTypes = function () {
    };

    /**
     * Returns the current drilling stack of the inner chart.
     * The returned objects need at least a <code>label</code> and a <code>name</code> property.
     * Also, a <code>dimension</code> array containing the dimension drill stack at the current level is required.
     * @returns {array} Array containing the drill stack
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getDrillStack = function () {
    };

    /**
     * Returns all sorted dimensions of an inner chart as property.
     * This is used to determine possible drilldown dimensions in the drill down popover of the MDC chart.
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @returns {Promise<Array<sap.ui.mdc.chart.Item>>} <code>Promise</code> containing an array of dimensions that is sorted
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getSortedDimensions = function (oMDCChart) {
    };

    /**
     * Determines which MDC items are drillable and returns them.
     * This function is used by the breadcrumb navigation.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @returns {Array<sap.ui.mdc.chart.Item>} Array of MDC items that are drillable
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getDrillableItems = function (oMDCChart) {
    };

    /**
     * Sets the chart type of the inner chart.
     * This function is called by the MDC chart when the <code>chartType</code> property is updated.
     *  <b>Note:</b> This function is called by the MDC chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#setChartType setChartType} instead.
     * @param {string} sChartType The new chart type
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.setChartType = function (sChartType) {
    };

    /**
     * Binds the inner chart to the back-end data and creates the inner chart content.
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @param {function} fnCallbackDataLoaded Callback function when data is loaded
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.createInnerChartContent = function (oMDCChart, fnCallbackDataLoaded) {
    };

    /**
     * Checks the binding of the chart and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @param {object} oBindingInfo The bindingInfo of the chart
     *  @deprecated as of 1.98;: use rebind instead
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
     ChartDelegate.rebindChart = function (oMDCChart, oBindingInfo) {
    };


    /**
     * Checks the binding of the chart and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @param {object} oBindingInfo The bindingInfo of the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
    };

    /**
     * Returns the information whether the inner chart is currently bound.
     * @returns {boolean} <code>true</code> if inner chart is bound; <code>false</code> if not
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.getInnerChartBound = function () {
    };

    /**
     * Updates the binding info with the relevant filters.
     *
     * @param {Object} oMDCChart The MDC chart instance
     * @param {Object} oBindingInfo The binding info of the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.updateBindingInfo = function (oMDCChart, oBindingInfo) {
    };

    /**
     * Sets tooltips to visible/invisible for the inner chart.
     * <b>Note:</b> This function is called by the MDC chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#setShowChartTooltip setShowChartTooltip} instead.
     * @param {boolean}  bFlag <code>true</code> for visible, <code>false</code> for invisible
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.setChartTooltipVisibility = function (bFlag) {
    };

    /**
     * This function returns an id which should be used in the internal chart for the measure/dimension
     * In the standard case, this is just the id of the property.
     * If it is necessary to use another id internally inside the chart (e.g. on duplicate property ids) this method can be overwritten.
     * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten aswell.
     * @param {string} sName ID of the property
     * @param {string} sKind Kind of the Property (Measure/Dimension)
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart
     * @returns {string} internal id for the sap.chart.Chart
     */
    ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName, sKind, oMDCChart) {

    };

    /**
     * This maps an id of an internal chart dimension/measure & kind of a property to its coresponding property entry.
     * @param {string} sName the id of internal chart measure/dimension
     * @param {string} sKind the kind of the property
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart
     * @returns {object} the property object
     */
    ChartDelegate.getPropertyFromNameAndKind = function(sName, sKind, oMDCChart) {

    };


    /**
     * Initializes a new chart property helper for V4 analytics with the property extensions merged into the property infos.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @returns {Promise<sap.ui.mdc.chart.PropertyHelper>} <code>Promise</code> that resolves with the property helper
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.initPropertyHelper = function (oMDCChart) {
        return Promise.resolve(true);
    };

    /**
     * Returns the relevant propery infos based on the metadata used with the MDC chart instance.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Reference to the MDC chart
     * @returns {array} Array of the property infos to be used within MDC chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.fetchProperties = function (oMDCChart) {
    };

    return ChartDelegate;
});
