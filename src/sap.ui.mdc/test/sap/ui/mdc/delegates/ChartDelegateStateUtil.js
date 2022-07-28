/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/odata/v4/vizChart/ChartDelegate",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/chart/PropertyHelper",
    "sap/ui/mdc/chart/Item"
], function (
    V4ChartDelegate,
    ODataMetaModelUtil,
    PropertyHelper,
    MDCChartItem
) {
    "use strict";

    var ChartDelegate = Object.assign({}, V4ChartDelegate);

    ChartDelegate.setChartType = function(){

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
            resolve();
        });
    };

    /**
     * Creates the inner dataset for the inner chart
     */
    ChartDelegate.createInnerChartContent = function (oMDCChart, aPropertyInfos) {
        return Promise.resolve();
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

    ChartDelegate.checkAndUpdateMDCItems = function() {
        return Promise.resolve();
    };


    /**
     * Sets tooltips visible/invisible on inner chart
     * @param {boolean}  bFlag true for visible, false for invisible
     */
    ChartDelegate.setChartTooltipVisibility = function(bFlag) {
        //Nothing to do here
    };

    ChartDelegate.fetchProperties = function (oMDCChart) {

        var aMetadata = [
            {
                name: "CategoryName",
                type: "string",
                required: true,
                label: "Category",
                groupable: true,
                kind: "Groupable"
            },
            {
                name: "SalesNumber",
                propertyPath: "SalesNumber",
                type: "Edm.Int32",
                required: true,
                aggregatable: true,
                label: "Sales Number",
                kind: "Aggregatable"
            }, {
                name: "agSalesAmount",
                propertyPath: "SalesAmount",
                type: "string",
                required: true,
                label: "Sales Amount",
                kind: "Aggregatable",
                aggregatable: true,
                defaultAggregation: "sum",
                supportedAggregations: ["sum", "min", "max", "average"]
            }, {
                name: "Name",
                propertyPath: "Name",
                type: "string",
                required: true,
                label: "Name",
                groupable: true,
                kind: "Groupable"
            }, {
                name: "Industry",
                type: "string",
                required: true,
                label: "Industry",
                groupable: true,
                kind: "Groupable"
            }, {
                name: "Country",
                type: "string",
                required: true,
                label: "Country",
                groupable: true,
                kind: "Groupable"
            }, {
                name: "SomePropertyName",
                type: "string",
                required: true,
                label: "SomeProperty",
                groupable: true,
                kind: "Groupable"
            }
        ];

        return Promise.resolve(aMetadata);
    };

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


    /**
     * Initializes a new chart property helper.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart Instance of the MDC chart.
     * @returns {Promise<sap.ui.chart.PropertyHelper>} A promise that resolves with the property helper.
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

    ChartDelegate.removeItemFromInnerChart = function() {
        //nothing to do here
    };

    return ChartDelegate;
});