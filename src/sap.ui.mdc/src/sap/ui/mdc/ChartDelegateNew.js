/*
 * ! ${copyright}
 */

// ---------------------------------------------------------------------------------------
// Helper class used to help create content in the MDC ChartNew and fill relevant metadata
// ---------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------
sap.ui.define([
    "sap/ui/mdc/AggregationBaseDelegate"
], function(AggregationBaseDelegate) {
    "use strict";

    /**
     * Base delegate class for sap.ui.mdc.ChartNew.<br>
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized and hence this should not be used for productive usage.
     *
     * @author SAP SE
     * @private
     * @experimental
     * @since 1.88
     * @alias sap.ui.mdc.ChartDelegateNew
     */
    var ChartDelegate = Object.assign({}, AggregationBaseDelegate);

    /**
     * Provides the table's filter delegate that provides basic filter functionality such as adding filter fields.
     * <b>Note:</b> The functionality provided in this delegate should act as a subset of a FilterBarDelegate
     * to enable the table for inbuilt filtering.
     *
     * @example <caption>Example usage of <code>getFilterDelegate</code></caption>
     * oFilterDelegate = {
     * 		addItem: function() {
     * 			var oFilterFieldPromise = new Promise(...);
     * 			return oFilterFieldPromise;
     * 		}
     * }
     * @returns {Object} Object for the chart filter personalization
     * @public
     */
    ChartDelegate.getFilterDelegate = function() {
        return {
            /**
             *
             * @param {String} sPropertyName The property name
             * @param {Object} oMDCChart Instance of the chart TODO: Which one? MDC or inner?
             *
             * @returns {Promise} Promise that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
             * For more information, see {@link sap.ui.mdc.AggregationBaseDelegate#addItem AggregationBaseDelegate}.
             */
            addItem: function(sPropertyName, oMDCChart) {
                return Promise.resolve(null);
            }
        };
    };

    /**
     * Toolbar relevant API (WIP)
     */
    ChartDelegate.zoomIn = function(){

    };

    ChartDelegate.zoomOut = function(){

    };

    ChartDelegate.getZoomState = function(){

    };

    ChartDelegate.toggleLegend = function(){

    };

    ChartDelegate.getLegendState = function(){

    };

    ChartDelegate.getPersonalizationInfo = function(){

    };

    ChartDelegate.getSortInfo = function(){

    };

    /**
     * Chart relevant API (WIP)
     */
    /**
     * Initializes the inner chart control
     * No modification of items allowed
     * @returns {Promise} resolved when inner chart is ready
     */
    ChartDelegate.initializeInnerChart = function(){

    };

    ChartDelegate.getInnerChart = function(){

    };

    ChartDelegate.getChartTypeInfo = function(){

    };

    //TODO: Check for setDrillStackInfo
    ChartDelegate.getDrillStackInfo = function(){

    };

    /**
     * Creates the inner dataset for the inner chart
     */
    ChartDelegate.createInnerChartContent = function(aPropertyInfos){

    };

    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.ChartNew} oMDCChart The MDC chart instance
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.rebindChart = function(oMDCChart, oBindingInfo) {
        if (oMDCChart && oMDCChart._oInnerChart && oBindingInfo) {
            //TODO: bindData sap.chart.Chart specific and therefore needs to be changed to a general API.
            oMDCChart._oInnerChart.bindData(oBindingInfo);
        }
    };

    /**
     * Updates the binding info with the relevant path and model from the metadata.
     *
     * @param {sap.ui.mdc.ChartNew} oMDCChart The MDC chart instance
     * @param {object} oMetadataInfo The metadataInfo set on the chart
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.updateBindingInfo = function(oMDCChart, oMetadataInfo, oBindingInfo) {};

    /**
     * Adds an item to the inner chart (measure/dimension)
     */
    ChartDelegate.addInnerItem = function(sPropertyName, oMDCChart, mPropertyBag) {
        return Promise.resolve(null);
    };

    /**
     * Inserts an item to the inner chart (measure/dimension)
     */
    ChartDelegate.insertInnerItem = function(sPropertyName, oMDCChart, mPropertyBag){

    };

    /**
     * Removes an item from the inner chart
     */
    ChartDelegate.removeInnerItem = function(sPropertyName, oMDCChart, mPropertyBag) {
        // return true within the Promise for default behaviour (e.g. continue to destroy the item)
        return Promise.resolve(true);
    };



    return ChartDelegate;
});
