/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/ChartDelegate",
    "sap/ui/mdc/chart/PropertyHelper"
], function (
    V4ChartDelegate,
    PropertyHelper
) {
    "use strict";

    var ChartDelegate = Object.assign({}, V4ChartDelegate);

    var Chart;

    ChartDelegate.getFilterDelegate = function () {
        return {
            addItem: function (sPropertyName, oChart) {
                return Promise.resolve(null);
            }
        };
    };

    ChartDelegate.zoomIn = function () {

    };

    ChartDelegate.zoomOut = function () {

    };

    ChartDelegate.getZoomState = function (oChart) {
        return { enabled: false };
    };

    ChartDelegate.getAvailableChartTypes = function(){
        return [];
    };

    ChartDelegate.setChartType = function(){

    };

    ChartDelegate.requestToolbarUpdate = function(oChart) {
        oChart._updateToolbar();
    };

    ChartDelegate.initializeInnerChart = function (oChart) {
        return new Promise(function (resolve, reject) {


            this._loadChart().then(function (aModules) {
                this._oInnerChart = new Chart({});
                resolve(this._oInnerChart);
            }.bind(this)).then(function() {
                oChart._innerChartDataLoadComplete();
            });
        }.bind(this));
    };

    ChartDelegate.getInnerChart = function () {
        return this._oInnerChart;
    };

    ChartDelegate.getChartTypeInfo = function () {
        return {};
    };

    ChartDelegate.createInnerChartContent = function (oChart, aPropertyInfos) {
        return Promise.resolve();
        //Nothing to test
    };

    ChartDelegate.rebind = function (oChart, oBindingInfo) {
        //Nothing to test
    };

    ChartDelegate.getBindingInfo = function (oChart) {
        var oMetadataInfo = oChart.getDelegate().payload;
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

    ChartDelegate.setInnerChartBoundTest = function(bValue) {
        this.oInnerChartBoundTest = bValue;
    };

    ChartDelegate.getInnerChartBound = function(){
        return this.oInnerChartBoundTest;
    };

    ChartDelegate.setLegendVisible = function(){
        //Nothing to do here
    };

    ChartDelegate.addInnerItem = function (sPropertyName, oChart, mPropertyBag) {
        return Promise.resolve(null);
    };

    ChartDelegate.insertInnerItem = function (sPropertyName, oChart, mPropertyBag) {

    };

    ChartDelegate.removeInnerItem = function (sPropertyName, oChart, mPropertyBag) {
        // return true within the Promise for default behaviour (e.g. continue to destroy the item)
        return Promise.resolve(true);
    };

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

    ChartDelegate.setChartTooltipVisibility = function(oChart, bFlag) {
        //Nothing to do here
    };

    ChartDelegate.fetchProperties = function (oChart) {
        var oModel = this._getModel(oChart);
        var pCreatePropertyInfos;

        if (!oModel) {
            pCreatePropertyInfos = new Promise(function (resolve) {
                oChart.attachModelContextChange({
                    resolver: resolve
                }, onModelContextChange, this);
            }.bind(this)).then(function (oModel) {
                return this._createPropertyInfos(oChart, oModel);
            }.bind(this));
        } else {
            pCreatePropertyInfos = this._createPropertyInfos(oChart, oModel);
        }

        return pCreatePropertyInfos;
    };

    function onModelContextChange(oEvent, oData) {
        var oChart = oEvent.getSource();
        var oModel = this._getModel(oChart);

        if (oModel) {
            oChart.detachModelContextChange(onModelContextChange);
            oData.resolver(oModel);
        }
    }

    ChartDelegate._createPropertyInfos = function (oChart, oModel) {
        return Promise.resolve();
    };

    ChartDelegate.getInnerChartSelectionHandler = function(oChart) {
        return { eventId: "_selectionDetails", listener: this._oInnerChart };
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

    ChartDelegate.initPropertyHelper = function (oChart) {
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

    ChartDelegate.changedNoDataStruct = function() {
        //Nothing to do here for test delegate
    };

    ChartDelegate.showOverlay = function(oChart, bShow) {

    };

    return ChartDelegate;
});