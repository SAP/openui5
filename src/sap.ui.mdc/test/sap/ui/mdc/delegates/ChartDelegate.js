/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/AggregationBaseDelegate",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/odata/v4/ChartPropertyHelper"
], function (
    V4ChartDelegate,
    ODataMetaModelUtil,
    PropertyHelper
) {
    "use strict";

    var ChartDelegate = Object.assign({}, V4ChartDelegate);

    //var ChartLibrary;
    var Chart;
    //var Dimension;
    //var HierarchyDimension;
    //var TimeDimension;
    //var Measure;
    //var VizPopover;
    //var VizTooltip;


    /**
     * Define a set of V4 specific functions which is specifically meant for the sap.chart.Chart control
     *
     * ...
     */

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
    ChartDelegate.getFilterDelegate = function () {
        return {
            /**
             *
             * @param {string} sPropertyName The property name
             * @param {Object} oMDCChart Instance of the chart TODO: Which one? MDC or inner?
             * @since 1.88
             * @returns {Promise} Promise that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
             * For more information, see {@link sap.ui.mdc.AggregationBaseDelegate#addItem AggregationBaseDelegate}.
             */
            addItem: function (sPropertyName, oMDCChart) {
                return Promise.resolve(null);
            }
        };
    };

    /**
     * Toolbar relevant API (WIP)
     */
    ChartDelegate.zoomIn = function () {

    };

    ChartDelegate.zoomOut = function () {

    };

    ChartDelegate.getZoomState = function () {

    };

    ChartDelegate.toggleLegend = function () {

    };

    ChartDelegate.getLegendState = function () {

    };

    ChartDelegate.getPersonalizationInfo = function () {

    };

    ChartDelegate.getSortInfo = function () {

    };

    ChartDelegate.getAvailableChartTypes = function(){
        return [];
    };

    ChartDelegate.setChartType = function(){

    };

    ChartDelegate.requestToolbarUpdate = function() {

    };

    /**
     * Chart relevant API (WIP)
     */
    /**
     * Loads necessary libraries and creates inner chart
     * @returns {Promise} resolved when inner chart is ready
     */
    ChartDelegate.initializeInnerChart = function (oMDCChart) {
        return new Promise(function (resolve, reject) {


            this._loadChart().then(function (aModules) {
                this._oInnerChart = new Chart({});
                resolve(this._oInnerChart);
            }.bind(this)).then(function() {
                oMDCChart._innerChartDataLoadComplete();
            });
        }.bind(this));
    };

    ChartDelegate.getInnerChart = function () {
        return this._oInnerChart;
    };

    ChartDelegate.getChartTypeInfo = function () {
        return {};
    };

    //TODO: Check for setDrillStackInfo
    ChartDelegate.getDrillStackInfo = function () {

    };

    /**
     * Creates the inner dataset for the inner chart
     */
    ChartDelegate.createInnerChartContent = function (oMDCChart, aPropertyInfos) {

        //Nothing to test
    };

    ChartDelegate.fillInnerVisibleProperties = function (aMDCItems) {
       //Nothing to test
    };

    ChartDelegate.createInnerDimensions = function (aGroupableProperties) {

    };

    ChartDelegate.createInnerMeasures = function (aAggregatableProperties, oPropertyHelper) {

    };

    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart The MDC chart instance
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
        //Nothing to test
    };

    ChartDelegate._getBindingInfo = function (oMDCChart) {
        var oMetadataInfo = oMDCChart.getDelegate().payload;
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oBindingInfo = {
            path: sEntitySetPath/*,
            parameters: {
                entitySet: oMetadataInfo.collectionName,
                useBatchRequests: true,
                provideGrandTotals: true,
                provideTotalResultSize: true,
                noPaging: true
            }*/
        };
        return oBindingInfo;
    };

    /**
     * Updates the binding info with the relevant path and model from the metadata.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart The MDC chart instance
     * @param {object} oMetadataInfo The metadataInfo set on the chart
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.updateBindingInfo = function (oMDCChart, oMetadataInfo, oBindingInfo) {
        //Nothing to do here
    };

    /**
     * Use this funciton inside a unit test to mock a bound value
     * @param {*} bValue value to set on
     *
     * @private
     */
    ChartDelegate.setInnerChartBoundTest = function(bValue) {
        this.oInnerChartBoundTest = bValue;
    };

    ChartDelegate.getInnerChartBound = function(){
        return this.oInnerChartBoundTest;
    };

    ChartDelegate.setLegendVisible = function(){
        //Nothing to do here
    };

    /**
     * Adds an item to the inner chart (measure/dimension)
     */
    ChartDelegate.addInnerItem = function (sPropertyName, oMDCChart, mPropertyBag) {
        return Promise.resolve(null);
    };

    /**
     * Inserts an item to the inner chart (measure/dimension)
     */
    ChartDelegate.insertInnerItem = function (sPropertyName, oMDCChart, mPropertyBag) {

    };

    /**
     * Removes an item from the inner chart
     */
    ChartDelegate.removeInnerItem = function (sPropertyName, oMDCChart, mPropertyBag) {
        // return true within the Promise for default behaviour (e.g. continue to destroy the item)
        return Promise.resolve(true);
    };

    /**
     * Delegate specific part
     */
    ChartDelegate._loadChart = function () {

        return new Promise(function (resolve) {
            var aNotLoadedModulePaths = ['sap/chart/Chart'];

            function onModulesLoadedSuccess(fnChart) {

                Chart = fnChart;

                resolve();
            }

            sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
        });

    };

    /**
     * Sets tooltips visible/invisible on inner chart
     * @param {boolean}  bFlag true for visible, false for invisible
     */
    ChartDelegate.setChartTooltipVisibility = function(bFlag) {
        //Nothing to do here
    };

    ChartDelegate.fetchProperties = function (oMDCChart) {
        var oModel = this._getModel(oMDCChart);
        var pCreatePropertyInfos;

        if (!oModel) {
            pCreatePropertyInfos = new Promise(function (resolve) {
                oMDCChart.attachModelContextChange({
                    resolver: resolve
                }, onModelContextChange, this);
            }.bind(this)).then(function (oModel) {
                return this._createPropertyInfos(oMDCChart, oModel);
            }.bind(this));
        } else {
            pCreatePropertyInfos = this._createPropertyInfos(oMDCChart, oModel);
        }

        return pCreatePropertyInfos.then(function (aProperties) {
            if (oMDCChart.data) {
                oMDCChart.data("$mdcChartPropertyInfo", aProperties);
            }
            return aProperties;
        });
    };

    function onModelContextChange(oEvent, oData) {
        var oMDCChart = oEvent.getSource();
        var oModel = this._getModel(oMDCChart);

        if (oModel) {
            oMDCChart.detachModelContextChange(onModelContextChange);
            oData.resolver(oModel);
        }
    }

    ChartDelegate._createPropertyInfos = function (oMDCChart, oModel) {
        return Promise.resolve();
    };

    ChartDelegate.getInnerChartSelectionHandler = function() {
        return ["_selectionDetails", this._oInnerChart];
    };


    ChartDelegate.checkAndUpdateMDCItems = function(){
        return Promise.resolve();
    };


    ChartDelegate._getModel = function (oTable) {
        var oMetadataInfo = oTable.getDelegate().payload;
        return oTable.getModel(oMetadataInfo.model);
    };


    ChartDelegate.setNoDataText = function() {
        //Nothing to do here in test delegate
    };

    /**
     * Initializes a new chart property helper.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Instance of the MDC chart.
     * @returns {Promise<sap.ui.mdc.odata.v4.ChartPropertyHelper>} A promise that resolves with the property helper.
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.initPropertyHelper = function (oMDCChart) {
        return new Promise(function(resolve){
            resolve(new PropertyHelper([]));
        });
    };

    ChartDelegate.createInitialChartContent = function() {
        //Nothing to do here
    };

    ChartDelegate.insertItemToInnerChart = function() {
        //Nothing to mock here
    };

    ChartDelegate.getDrillableItems = function() {
        return [];
    };

    ChartDelegate.adjustChartHeight = function() {
        //Nothing to do here in the test delegate
    };

    return ChartDelegate;
});