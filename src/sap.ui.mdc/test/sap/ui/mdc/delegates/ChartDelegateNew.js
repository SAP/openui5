/*
 * ! ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/AggregationBaseDelegate",
    "sap/ui/mdc/util/loadModules",
    "sap/ui/mdc/library",
    "sap/ui/core/Core",
    "sap/m/text",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/library",
    "sap/base/util/merge",
    'sap/ui/mdc/odata/v4/TypeUtil',
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/ui/mdc/odata/v4/ChartPropertyHelperNew"
], function (
    V4ChartDelegate,
    loadModules,
    library,
    Core,
    Text,
    MetaModelUtil,
    MDCLib,
    merge,
    TypeUtil,
    ODataMetaModelUtil,
    PropertyHelper
) {
    "use strict";

    var ChartDelegate = Object.assign({}, V4ChartDelegate);

    //var ChartLibrary;
    var Chart;
    var Dimension;
    //var HierarchyDimension;
    //var TimeDimension;
    var Measure;
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
             * @param {String} sPropertyName The property name
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
            }.bind(this));
        }.bind(this));
    };

    ChartDelegate.getInnerChart = function () {
        return this._oInnerChart;
    };

    ChartDelegate.getChartTypeInfo = function () {

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
        //TODO: Check for Hierachy and Time
        //TODO: Check for role annotation
        aGroupableProperties.forEach(function (oProperty) {
            var oDimension = new Dimension({name: oProperty.getName(), role: "category", label: oProperty.getLabel()});
            this._oInnerChart.addDimension(oDimension);
        }.bind(this));
    };

    ChartDelegate.createInnerMeasures = function (aAggregatableProperties, oPropertyHelper) {
        //TODO: Check for Criticality, Coloring and so on
        //TODO: Check for role annotation
        //TODO: Where to get analyticalInfo from?
        aAggregatableProperties.forEach(function (oProperty) {
            var oRawProperty = oPropertyHelper.getRawProperty(oProperty.getName());
            var oMeasure = new Measure({
                name: oRawProperty.recAggrMethod + oProperty.getName(),
                role: "axis1", label: oProperty.getLabel(),
                analyticalInfo: {
                    propertyPath: oProperty.getName(),
                    "with": oRawProperty.recAggrMethod
                }
            });
            this._oInnerChart.addMeasure(oMeasure);
        }.bind(this));
    };
    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.ChartNew} oMDCChart The MDC chart instance
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.rebindChart = function (oMDCChart, oBindingInfo) {
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
     * @param {sap.ui.mdc.ChartNew} oMDCChart The MDC chart instance
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
            var aNotLoadedModulePaths = ['sap/chart/library', 'sap/chart/Chart', 'sap/chart/data/Dimension', 'sap/chart/data/HierarchyDimension', 'sap/chart/data/TimeDimension', 'sap/chart/data/Measure', 'sap/viz/ui5/controls/VizTooltip'];

            function onModulesLoadedSuccess(fnChartLibrary, fnChart, fnDimension, fnHierarchyDimension, fnTimeDimension, fnMeasure, fnVizTooltip) {
                //ChartLibrary = fnChartLibrary;
                Chart = fnChart;
                Dimension = fnDimension;
                //HierarchyDimension = fnHierarchyDimension;
                //TimeDimension = fnTimeDimension;
                Measure = fnMeasure;
                //VizTooltip = fnVizTooltip;

                resolve();
            }

            sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
        });

    };

    /**
     * Sets tooltips visible/invisible on inner chart
     * @param {bool}  bFlag true for visible, false for invisible
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
        var oMetadataInfo = oMDCChart.getDelegate().payload;
        var aProperties = [];
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oMetaModel = oModel.getMetaModel();

        return Promise.all([
            oMetaModel.requestObject(sEntitySetPath + "/"), oMetaModel.requestObject(sEntitySetPath + "@")
        ]).then(function (aResults) {
            var oEntityType = aResults[0], mEntitySetAnnotations = aResults[1];
            var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
            var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
            var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
            var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);

            for (var sKey in oEntityType) {
                var oObj = oEntityType[sKey];

                if (oObj && oObj.$kind === "Property") {
                    // ignore (as for now) all complex properties
                    // not clear if they might be nesting (complex in complex)
                    // not clear how they are represented in non-filterable annotation
                    // etc.
                    if (oObj.$isCollection) {
                        //Log.warning("Complex property with type " + oObj.$Type + " has been ignored");
                        continue;
                    }

                    var oPropertyAnnotations = oMetaModel.getObject(sEntitySetPath + "/" + sKey + "@");

                    aProperties.push({
                        name: sKey,
                        label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
                        sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
                        filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
                        groupable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"] || false,
                        aggregatable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] || false,
                        recAggrMethod: oPropertyAnnotations["@Org.OData.Aggregation.V1.RecommendedAggregationMethod"],
                        supAggrMethods: oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"],
                        maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1
                    });
                }
            }
            return aProperties;
        });
    };

    ChartDelegate.getInnerChartSelectionHandler = function() {
        return ["_selectionDetails", this._oInnerChart];
    };



    ChartDelegate._getModel = function (oTable) {
        var oMetadataInfo = oTable.getDelegate().payload;
        return oTable.getModel(oMetadataInfo.model);
    };


    /**
     * Initializes a new table property helper for V4 analytics with the property extensions merged into the property infos.
     *
     * @param {sap.ui.mdc.Table} oTable Instance of the MDC table.
     * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper.
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.initPropertyHelper = function (oMDCChart) {
        return new Promise(function(resolve){
            resolve(new PropertyHelper([]));
        });
    };

    return ChartDelegate;
});