/*!
 * ${copyright}
 */

sap.ui.define([
    "sap/ui/mdc/odata/v4/ChartDelegate",
    "sap/ui/core/Core",
    "sap/m/Text",
    "sap/base/Log",
    'sap/ui/mdc/util/FilterUtil',
    'sap/ui/mdc/odata/v4/util/DelegateUtil',
    "sap/ui/mdc/chart/ChartTypeButton",
    "sap/ui/mdc/chart/Item",
    "sap/ui/model/Sorter",
    "sap/ui/mdc/chart/ChartImplementationContainer",
    "sap/ui/base/ManagedObjectObserver",
    "sap/ui/mdc/p13n/panels/ChartItemPanel",
    "sap/m/MessageStrip",
    "sap/ui/mdc/FilterBarDelegate",
    "sap/ui/model/Filter",
    "sap/ui/mdc/chart/PropertyHelper",
    "sap/ui/thirdparty/jquery",
    "sap/ui/mdc/enums/ChartItemRoleType"
], function (
    V4ChartDelegate,
    Core,
    Text,
    Log,
    FilterUtil,
    DelegateUtil,
    ChartTypeButton,
    MDCChartItem,
    Sorter,
    ChartImplementationContainer,
    ManagedObjectObserver,
    ChartItemPanel,
    MessageStrip,
    FilterBarDelegate,
    Filter,
    PropertyHelper,
    jQuery,
    ChartItemRoleType
) {
    "use strict";

	/**
	 * Module for vizChart delegate
	 * @namespace
	 * @name sap.ui.mdc.odata.v4.vizChart
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
	 */

    /**
	 * @class Base Delegate for {@link sap.ui.mdc.Chart Chart}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Chart Chart}.<br>
	 * This class provides method calls, which are called by the <code>Chart</code> at specific operations and allows to overwrite an internal behaviour.
	 *
	 * @author SAP SE
	 * @namespace
	 * @alias module:sap/ui/mdc/odata/v4/vizChart/ChartDelegate
	 * @extends module:sap/ui/mdc/odata/v4/ChartDelegate
	 * @since 1.88
	 * @private
	 * @ui5-restricted sap.fe, sap.ui.mdc
     *
     */
    var ChartDelegate = Object.assign({}, V4ChartDelegate);

    var mStateMap = new window.WeakMap();
    var Chart;
    var Dimension;
    var Measure;
    var VizTooltip;

    //API to access state
    ChartDelegate._getState = function (oChart) {
        if (mStateMap.has(oChart)){
            return mStateMap.get(oChart);
        }

        if (oChart){
            Log.info("Couldn't get state for " + oChart.getId());
        }
    };

    ChartDelegate._setState = function(oChart, oState) {
        mStateMap.set(oChart, oState);
    };

    ChartDelegate.getFilterDelegate = function() {
        return FilterBarDelegate;
    };

    /**
     * This method is called when an <code>AddCondition</code> change is applied by the personalization.
     * It can be used to perform tasks, such as caching information or modifying the control.
     *
     * @param {string} sPropertyName Name of a property
     * @param {sap.ui.mdc.Control} oControl Instance of the MDC control
     * @param {Object} mPropertyBag Instance of property bag from the SAPUI5 flexibility API
     * @returns {Promise} <code>Promise</code> that resolves once the properyInfo property has been updated
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.addCondition = function(sPropertyName, oControl, mPropertyBag) {
		//return this.getFilterDelegate().addCondition(sPropertyName, oControl, mPropertyBag);
        // will be activated, once mdc.Chart has the property propertyInfo.
        return Promise.resolve();
    };

    /**
     * This method is called when a <code>RemoveCondition</code> change is applied by the personalization.
     * It can be used to perform tasks, such as caching information or modifying the control.
     *
     * @param {string} sPropertyName Name of a property
     * @param {sap.ui.mdc.Control} oControl Instance of the MDC control
     * @param {Object} mPropertyBag Instance of property bag from the SAPUI5 flexibility API
     * @returns {Promise} <code>Promise</code> that resolves once the properyInfo property has been updated
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.removeCondition = function(sPropertyName, oControl, mPropertyBag) {
		//return this.getFilterDelegate().removeCondition(sPropertyName, oControl, mPropertyBag);
        // will be activated, once mdc.Chart has the property propertyInfo.
        return Promise.resolve();
    };

    ChartDelegate._deleteState = function(oChart) {

        if (this._getState(oChart)){
            if (this._getState(oChart).vizTooltip) {
                this._getState(oChart).vizTooltip.destroy();
            }

            if (this._getState(oChart).observer) {
                this._getState(oChart).observer.disconnect();
                this._getState(oChart).observer = null;
            }
        }

        return mStateMap.delete(oChart);
    };


    ChartDelegate._getChart = function (oChart){

        if (mStateMap.has(oChart)) {
            return mStateMap.get(oChart).innerChart;
        }

        if (oChart){
            Log.info("Couldn't get state for " + oChart.getId());
        }

        return undefined;

    };

    ChartDelegate._setChart = function (oChart, oInnerChart) {
        if (mStateMap.has(oChart)) {
            mStateMap.get(oChart).innerChart = oInnerChart;
        } else {
            mStateMap.set(oChart, {innerChart: oInnerChart});
        }
    };

    ChartDelegate._getInnerStructure = function (oChart) {
        if (mStateMap.has(oChart)) {
            return mStateMap.get(oChart).innerStructure;
        }

        if (oChart){
            Log.info("Couldn't get state for " + oChart.getId());
        }

        return undefined;
    };

    ChartDelegate._setInnerStructure = function (oChart, oInnerStructure) {
        if (mStateMap.has(oChart)) {
            mStateMap.get(oChart).innerStructure = oInnerStructure;
        } else {
            mStateMap.set(oChart, {innerStructure: oInnerStructure});
        }
    };

    ChartDelegate._getBindingInfoFromState = function (oChart) {
        if (mStateMap.has(oChart)) {
            return mStateMap.get(oChart).bindingInfo;
        }

        if (oChart){
            Log.info("Couldn't get state for " + oChart.getId());
        }

        return undefined;
    };

    ChartDelegate._setBindingInfoForState = function (oChart, oBindingInfo) {
        if (mStateMap.has(oChart)) {
            mStateMap.get(oChart).bindingInfo = oBindingInfo;
        } else {
            mStateMap.set(oChart, {bindingInfo: oBindingInfo});
        }
    };

    ChartDelegate._setUpChartObserver = function(oChart) {
		var mChartMap = this._getState(oChart);

		if (!mChartMap.observer) {
			mChartMap.observer = new ManagedObjectObserver(function(oChange) {
				if (oChange.type === "destroy") {
                    this.exit(oChange.object);
				}
			}.bind(this));
		}

		mChartMap.observer.observe(oChart, {
			destroy: true
		});
	};


    /**
     * Define a set of V4 specific functions which is specifically meant for the sap.chart.Chart control
     *
     * ...
     */


    ChartDelegate.exit = function(oChart) {
        if (this._getInnerStructure(oChart)){
            this._getInnerStructure(oChart).destroy();
        }

        this._deleteState(oChart);
    };

    /**
     * Toolbar relevant API (WIP)
     */
    /**
     * Notifies the inner chart to zoom in.
     * <b>Note:</b> iValue does not affect the zoom for the sap.chart.Chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.zoomIn = function (oChart) {
        var oInnerChart = this._getChart(oChart);

        if (oInnerChart) {
            oInnerChart.zoom({direction: "in"});
        }
    };

    /**
     * Notifies the inner chart to zoom out.
     * <b>Note:</b> iValue does not affect the zoom in case of the sap.chart.Chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.zoomOut = function (oChart) {
        var oInnerChart = this._getChart(oChart);

        if (oInnerChart) {
            oInnerChart.zoom({direction: "out"});
        }
    };

    /**
     * Gets the current zooming information for the inner chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {object} Current <code>ZoomState</code> of the inner chart
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getZoomState = function (oChart) {

        if (this._getChart(oChart)) {
            return this._getChart(oChart).getZoomInfo(this);
        }

    };

    /**
     * Returns the event handler for SelectionDetails as an object:
     *
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {sap.ui.mdc.SelectionDetails} Event handler for SelectionDetails
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getInnerChartSelectionHandler = function (oChart) {
        return {eventId: "_selectionDetails", listener: this._getChart(oChart)};
    };

    /**
     * This function is used by P13n to determine which chart type supports which layout options.
     * There might be chart types that do not support certain layout options (i.e. "Axis3").
     * Layout configuration is defined as followed:
     * {
     *  key: string, //identifier for the chart type
     *  allowedLayoutOptions : [] //array containing allowed layout options as string
     * }
     *
     * @returns {array} Layout configuration for personalization panel
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getChartTypeLayoutConfig = function() {

        if (this._aChartTypeLayout) {
            return this._aChartTypeLayout;
        }

        var aAxis1Only = [ChartItemRoleType.axis1, ChartItemRoleType.category, ChartItemRoleType.series];
		var aAxis1And2 = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.category, ChartItemRoleType.series];
		var aCat2Axis1Only = [ChartItemRoleType.axis1, ChartItemRoleType.category, ChartItemRoleType.category2];
		var aCat1AllAxis = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.axis3, ChartItemRoleType.category, ChartItemRoleType.series];

        this._aChartTypeLayout = [
            {key: "column", allowedLayoutOptions: aAxis1Only},
            {key: "bar", allowedLayoutOptions:  aAxis1Only},
			{key: "line", allowedLayoutOptions:  aAxis1Only},
			{key: "combination", allowedLayoutOptions:  aAxis1Only},
			{key: "pie", allowedLayoutOptions:  aAxis1Only},
			{key: "donut", allowedLayoutOptions:  aAxis1Only},
            {key: "dual_column", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_bar", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_line", allowedLayoutOptions:  aAxis1And2},
			{key: "stacked_bar", allowedLayoutOptions:  aAxis1Only},
			{key: "scatter", allowedLayoutOptions:  aAxis1And2},
			{key: "bubble", allowedLayoutOptions:  aCat1AllAxis},
			{key: "heatmap", allowedLayoutOptions:  aCat2Axis1Only},
			{key: "bullet", allowedLayoutOptions:  aAxis1Only},
			{key: "vertical_bullet", allowedLayoutOptions:  aAxis1Only},
			{key: "dual_stacked_bar", allowedLayoutOptions:  aAxis1And2},
			{key: "100_stacked_bar", allowedLayoutOptions:  aAxis1Only},
			{key: "stacked_column", allowedLayoutOptions:  aAxis1Only},
			{key: "dual_stacked_column", allowedLayoutOptions:  aAxis1And2},
			{key: "100_stacked_column", allowedLayoutOptions:  aAxis1Only},
			{key: "dual_combination", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_horizontal_combination", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_horizontal_combination", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_stacked_combination", allowedLayoutOptions:  aAxis1And2},
			{key: "dual_horizontal_stacked_combination", allowedLayoutOptions:  aAxis1And2},
			{key: "stacked_combination", allowedLayoutOptions:  aAxis1Only},
			{key: "100_dual_stacked_bar", allowedLayoutOptions:  aAxis1Only},
			{key: "100_dual_stacked_column", allowedLayoutOptions:  aAxis1Only},
			{key: "horizontal_stacked_combination", allowedLayoutOptions:  aAxis1Only},
			{key: "waterfall", allowedLayoutOptions:  aCat2Axis1Only},
			{key: "horizontal_waterfall", allowedLayoutOptions:  aCat2Axis1Only}
        ];

        return this._aChartTypeLayout;
    };

    /**
     * This function returns a UI which is then shown inside the p13n Items panel.
     * Depending on which chart is used, the panel might offer different functionality.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {sap.ui.core.Control} Adaptation UI to be used
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getAdaptionUI = function(oChart) {

        return Promise.resolve(this._setupAdaptionUI(oChart));
    };

    ChartDelegate._setupAdaptionUI = function(oChart) {
        var oLayoutConfig = this.getChartTypeLayoutConfig().find(function(it){return it.key === oChart.getChartType();});

        //Default case -> everything allowed
        if (!oLayoutConfig) {
            var aRoles = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.axis3, ChartItemRoleType.category, ChartItemRoleType.category2, ChartItemRoleType.series];
            oLayoutConfig = {key: oChart.getChartType(), allowedLayoutOptions: aRoles};
        }

        var aStandardSetup = [
            {kind: "Groupable"},
            {kind: "Aggregatable"}
        ];

        oLayoutConfig.templateConfig = aStandardSetup;


        //var aRolesAvailable = [ChartItemRoleType.axis1, ChartItemRoleType.axis2, ChartItemRoleType.axis3, ChartItemRoleType.category, ChartItemRoleType.category2, ChartItemRoleType.series];
        var oArguments = {panelConfig: oLayoutConfig};

        var oPanel = new ChartItemPanel(oArguments);

        if (oChart.getChartType() === "heatmap"){
            var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
            oPanel.setMessageStrip(new MessageStrip({text: MDCRb.getText("chart.PERSONALIZATION_DIALOG_MEASURE_WARNING"), type:"Warning"}));
        }

        return oPanel;
    };

    /**
     * Sets the visibility of the legend.
     * This is called by the MDC chart, do not call it directly!
     * @param {sap.ui.mdc.Chart} oChart MDC chart to the set the legend visibility on
     * @param {boolean} bVisible <code>true</code> to show legend, false to hide
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.setLegendVisible = function (oChart, bVisible) {
        if (this._getChart(oChart)) {
            this._getChart(oChart).setVizProperties({
                'legend': {
                    'visible': bVisible
                },
                'sizeLegend': {
                    'visible': bVisible
                }
            });
        } else {
            Log.error("Could not set legend visibility since inner chart is not yet initialized!");
        }
    };

    /**
     * Creates a Sorter for a given property.
     * @param {sap.ui.mdc.chart.Item} oMDCItem MDC item to create a sorter for
     * @param {object} oSortProperty Sorting information
     * @returns {sap.ui.model.Sorter} Sorter for given item
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._getSorterForItem = function (oMDCItem, oSortProperty) {
        //TODO: Check wether we really need this method.
        //TODO: Right now it is needed since the name of a property does not include the aggregation method -> leads to an error when calling back-end
        //TODO: In old chart, aggragation method was included in name since every method had their own Item

        if (oMDCItem.getType() === "aggregatable") {
            return new Sorter(this._getAggregatedMeasureNameForMDCItem(oMDCItem), oSortProperty.descending);
        } else if (oMDCItem.getType() === "groupable") {
            return new Sorter(this.getInternalChartNameFromPropertyNameAndKind(oSortProperty.name, "groupable", oMDCItem.getParent()), oSortProperty.descending);
        }

    };

    /**
     * Inserts an MDC chart item (in case of sap.chart.Chart a measure/dimension) on the inner chart.
     * This function is called by the MDC chart after a change of the <code>Items</code> aggregation-
     * @param {sap.ui.mdc.Chart} oChart MDC chart to insert the item into
     * @param {sap.ui.mdc.chart.Item} oItem MDC chart item to insert into the inner chart
     * @param {int} iIndex Index to insert into
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.insertItemToInnerChart = function (oChart, oItem, iIndex) {
        //TODO: Create Measures/Dimension only when required?
        if (oItem.getType() === "groupable") {

            var sInnerDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart);
            var oDim = this._getChart(oChart).getDimensionByName(sInnerDimName);

            if (!oDim) {
                this.createInnerDimension(oChart, oItem);
            } else {
                //Update Dimension
                oDim.setLabel(oItem.getLabel());
                oDim.setRole(oItem.getRole() ? oItem.getRole() : "category");
            }

            var aVisibleDimension = this._getChart(oChart).getVisibleDimensions();
            aVisibleDimension.splice(iIndex, 0, sInnerDimName); //Insert Item without deleting existing dimension
            this._getChart(oChart).setVisibleDimensions(aVisibleDimension);

        } else if (oItem.getType() === "aggregatable") {
            this.createInnerMeasure(oChart, oItem);
            var aVisibleMeasures = this._getChart(oChart).getVisibleMeasures();
            aVisibleMeasures.splice(iIndex, 0, this._getAggregatedMeasureNameForMDCItem(oItem));
            this._getChart(oChart).setVisibleMeasures(aVisibleMeasures);
        }

        //Update coloring and semantical patterns on Item change
        this._prepareColoringForItem(oItem).then(function(){
            this._updateColoring(oChart, this._getChart(oChart).getVisibleDimensions(), this._getChart(oChart).getVisibleMeasures());
        }.bind(this));

        this._updateSemanticalPattern(oChart);

    };

    /**
     * Removes an item (in case of sap.chart.Chart a measure/dimension) from the inner chart.
     * This function is called by MDC chart on a change of the <code>Items</code> aggregation.
     * @param {sap.ui.mdc.Chart} oChart MDC chart to remove the item from
     * @param {sap.ui.mdc.chart.Item} oItem Item to remove from the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.removeItemFromInnerChart = function (oChart, oItem) {
        if (oItem.getType() === "groupable" && this._getChart(oChart).getVisibleDimensions().includes(this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart))) {
            var sInnerDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart);

            var aNewVisibleDimensions = this._getChart(oChart).getVisibleDimensions().filter(function (e) {
                return e !== sInnerDimName;
            });

            if (this._getState(oChart).inResultDimensions.length > 0) {
                this._getChart(oChart).setInResultDimensions(this._getState(oChart).inResultDimensions);
            }

            this._getChart(oChart).setVisibleDimensions(aNewVisibleDimensions);

            //this._getChart(oChart).removeDimension(this._getChart(oChart).getDimensionByName(oChartItem.getPropertyKey()));

        } else if (oItem.getType() === "aggregatable" && this._getChart(oChart).getVisibleMeasures().includes(this._getAggregatedMeasureNameForMDCItem(oItem))) {
            var aNewVisibleMeasures = [];

            oChart.getItems().filter(function(oItem) {return oItem.getType() === "aggregatable";})
            .filter(function(item){ return item !== oItem;})
            .forEach(function(oItem){
                aNewVisibleMeasures.push(this._getAggregatedMeasureNameForMDCItem(oItem));
            }.bind(this));

            this._getChart(oChart).setVisibleMeasures(aNewVisibleMeasures);

            this._getChart(oChart).removeMeasure(this._getChart(oChart).getMeasureByName(this._getAggregatedMeasureNameForMDCItem(oItem)));
        }

        //Update coloring and semantical patterns on Item change
        this._updateColoring(oChart, this._getChart(oChart).getVisibleDimensions(), this._getChart(oChart).getVisibleMeasures());

        this._updateSemanticalPattern(oChart);
    };

    /**
     * Creates a new MDC chart item for a given property name and updates the inner chart.
     * <b>Note:</b> This does <b>not</b> add the MDC chart item to the <code>Items</code> aggregation of the MDC chart.
     * Called and used by <code>p13n</code>.
     * @param {string} sPropertyName Name of the property added
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart to add the property to
     * @param {object} mPropertyBag Property bag containing useful information about the change
     * @param {string} sRole New role for given item (if available)
     * @returns {Promise} Promise that resolves with new MDC chart item as parameter
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.addItem = function (sPropertyName, oChart, mPropertyBag, sRole) {
        if (oChart.getModel) {
            return Promise.resolve(this._createMDCChartItem(sPropertyName, oChart, sRole));
        }
    };

    ChartDelegate.removeItem = function (oProperty, oChart) {
        return Promise.resolve(true);
    };

    /**
     * This iterates over all items of the MDC chart to make sure all necessary information is available on them.
     * If something is missing, this method updates the item accordingly. This is the last check before the inner chart is rendered.
     * @param {sap.ui.mdc.Chart} oChart MDC chart to check the items on
     * @returns {Promise} Resolves once check is complete
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.checkAndUpdateMDCItems = function(oChart) {
        return new Promise(function(resolve, reject){
            var aPropPromises = [];

            oChart.getItems().forEach(function(oMDCItem){
                var bIsComplete = oMDCItem.getPropertyKey() && oMDCItem.getLabel() && oMDCItem.getType() && oMDCItem.getRole();

                if (!bIsComplete) {
                    aPropPromises.push(this._getPropertyInfosByName(oMDCItem.getPropertyKey(), oChart).then(function(oPropertyInfo){
                        oMDCItem.setLabel(oPropertyInfo.label);

                        if (oPropertyInfo.groupable) {
                            oMDCItem.setType("groupable");
                            oMDCItem.setRole(oMDCItem.getRole() ? oMDCItem.getRole() : "category");
                        } else if (oPropertyInfo.aggregatable) {
                            oMDCItem.setType("aggregatable");
                            oMDCItem.setRole(oMDCItem.getRole() ? oMDCItem.getRole() : "axis1");
                        }
                    }));
                }
            }.bind(this));

            Promise.all(aPropPromises).then(function(){
                resolve();
            });
        }.bind(this));

    };

    /**
     * Creates an MDC chart Item for given property.
     * @param {string} sPropertyName the name of the property in the propertyInfo object.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @param {string} sRole Role of the new item (if available)
     * @returns {sap.ui.mdc.chart.Item} Created MDC Item
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._createMDCChartItem = function (sPropertyName, oChart, sRole) {

        return this._getPropertyInfosByName(sPropertyName, oChart).then(function(oPropertyInfo){
            if (!oPropertyInfo) {
                return null;
            }

            return this._createMDCItemFromProperty(oPropertyInfo, oChart.getId(), sRole);

        }.bind(this));

    };

    /**
     * Creates an MDC Item from given property info.
     * @param {object} oPropertyInfo PropertyInfo object
     * @param {string} idPrefix Prefix for the id of the item
     * @param {string} sRole Role of the new item (if available)
     * @returns {sap.ui.mdc.chart.Item} Created MDC Item
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._createMDCItemFromProperty = function(oPropertyInfo, idPrefix, sRole) {

            if (oPropertyInfo.groupable) {
                return new MDCChartItem(idPrefix + "--GroupableItem--" + oPropertyInfo.name, {
                    name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "groupable",
                    role: sRole ? sRole : "category"
                });
            }

            if (oPropertyInfo.aggregatable) {

                return new MDCChartItem(idPrefix + "--AggregatableItem--" + oPropertyInfo.name, {
                    name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "aggregatable",
                    role: sRole ? sRole : "axis1"
                });
            }

            return null;
    };

    /**
     * Loads required libraries and creates the inner chart.
     * For the vizChart, only an outer structure is created, the chart has not yet been initialized.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {Promise} Resolved when inner chart is ready
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.initializeInnerChart = function (oChart) {

        return new Promise(function (resolve, reject) {

            this._loadChart().then(function (aModules) {
                var oNoDataCont;

                this._setInnerStructure(oChart, new ChartImplementationContainer(oChart.getId() + "--implementationContainer", {}));
                oChart.addStyleClass("sapUiMDCChartTempTextOuter");

                if (oChart.getNoData()){
                    this._getInnerStructure(oChart).setChartNoDataContent(oChart.getNoData());
                } else {
                    oNoDataCont = new Text({text: oChart.getNoDataText()});
                    this._getInnerStructure(oChart).addStyleClass("sapUiMDCChartTempText");
                    this._getInnerStructure(oChart).setNoDataContent(oNoDataCont);
                }

                this._setUpChartObserver(oChart);

                resolve(this._getInnerStructure(oChart)); //Not applicable in this case
            }.bind(this));
        }.bind(this));
    };

    /**
     * Triggers invalidation on ChartImplContainer when external noData changed.
     * @param {sap.ui.mdc.Chart} oChart reference to the MDC Chart
     */
    ChartDelegate.changedNoDataStruct = function(oChart) {
        if (this._getInnerStructure(oChart)) {
            this._getInnerStructure(oChart).setChartNoDataContent(oChart.getNoData());
            this._getInnerStructure(oChart).invalidate();
        }
    };

    /**
     * This function creates the content defined by the MDC chart for the inner chart instance.
     * For vizFrame, coloring dimensions/measures are set up here too.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {Promise} Resolved once chart content has been created
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._createContentFromItems = function (oChart) {
        return new Promise(function(resolve, reject){
            //This is done so the user doesn't have to specify property path & aggregation method in the XML
            var aColorPromises = [];
            var aPropPromises = [];

            var aVisibleDimensions = [];
            var aVisibleMeasures = [];
            oChart.getItems().forEach(function (oItem, iIndex) {

                //Uses excact mdc chart item id
                aPropPromises.push(this._getPropertyInfosByName( oItem.getPropertyKey(), oChart).then(function(oPropertyInfo){
                    //Skip a Item if there is no property representing the Item inside the backend
                    if (!oPropertyInfo){
                        Log.error("sap.ui.mdc.Chart: Item " + oItem.getPropertyKey() + " has no property info representing it in the metadata. Make sure the name is correct and the metadata is defined correctly. Skipping the item!");
                        return;
                    }

                    switch (oItem.getType()) {
                        case "groupable":
                            aVisibleDimensions.push(this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart));

                            this._addInnerDimension(oChart, oItem, oPropertyInfo);
                            break;
                        case "aggregatable":

                            //TODO: Alias might be changing after backend request
                            aVisibleMeasures.push(this._getAggregatedMeasureNameForMDCItem(oItem));

                            this._addInnerMeasure(oChart, oItem, oPropertyInfo);
                            break;

                        default:
                            Log.error("MDC Chart Item " + oItem.getId() + " with label " + oItem.getLabel() + " has no known type. Supported typed are: \"groupable\" & \"aggregatable\"");
                    }

                    aColorPromises.push(this._prepareColoringForItem(oItem));
                }.bind(this)));

            }.bind(this));

            Promise.all(aPropPromises).then(function(){
                this._getState(oChart).aColMeasures.forEach(function(sKey) {

                    if (this._getState(oChart).aInSettings.indexOf(sKey) == -1) {

                        aColorPromises.push(new Promise(function(resolve, reject){
                            oChart._getPropertyByNameAsync(sKey).then(function(oPropertyInfo){
                                var aggregationMethod = oPropertyInfo.aggregationMethod;
                                var propertyPath = oPropertyInfo.propertyPath;
                                var sName = this.getInternalChartNameFromPropertyNameAndKind(sKey, "aggregatable", oChart);

                                var oMeasureSettings = {
                                    name: sName,
                                    label: oPropertyInfo.label,
                                    role: "axis1"
                                };

                                if (aggregationMethod && propertyPath) {
                                    oMeasureSettings.analyticalInfo = {
                                        propertyPath: propertyPath,
                                        "with": aggregationMethod
                                    };
                                }

                                var oMeasure = new Measure(oMeasureSettings);

                                aVisibleMeasures.push(oMeasure);
                                this._getChart(oChart).addMeasure(oMeasure);
                                resolve();
                            }); //this.getPropertyFromNameAndKind not used as the key is the name of the MDC chart Item

                        }));
                    }

                }.bind(this));

                Promise.all(aColorPromises).then(function(){
                    this._getChart(oChart).setVisibleDimensions(aVisibleDimensions);
                    this._getChart(oChart).setVisibleMeasures(aVisibleMeasures);

                    var aInResultDimensions = oChart.getDelegate().inResultDimensions; //TODO: Does this use internal name? If so, change _getPropertyInfosByName  below; Most likely not the case
                    if (aInResultDimensions && aInResultDimensions instanceof Array && aInResultDimensions.length != 0) {

                        var aInResultPromises = [];

                        aInResultDimensions.forEach(function(sInResultDim){

                            aInResultPromises.push(this._getPropertyInfosByName(sInResultDim, oChart).then(function(oPropertyInfos){
                                var sName = this.getInternalChartNameFromPropertyNameAndKind(oPropertyInfos.name, "groupable", oChart);

                                var oDim = new Dimension({
                                    name: sName,
                                    label: oPropertyInfos.label
                                });

                                this._getState(oChart).inResultDimensions.push(sName);
                                this._getChart(oChart).addDimension(oDim);
                            }.bind(this)));

                        }.bind(this));

                        Promise.all(aInResultPromises).then(function(){
                            this._getChart(oChart).setInResultDimensions(this._getState(oChart).inResultDimensions);
                        }.bind(this));

                    }

                    this._updateColoring(oChart, aVisibleDimensions, aVisibleMeasures);
                    this._updateSemanticalPattern(oChart);

                    resolve();
                }.bind(this));
            }.bind(this));

        }.bind(this));
    };

    /**
     * Returns the instance of the inner chart for a given MDC chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {sap.ui.core.Control} Inner chart instance
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getInnerChart = function (oChart) {
        return this._getChart(oChart);
    };

    /**
     * Prepares the internal vizFrame coloring for given MDC chart Item.
     * @param {sap.ui.mdc.chart.Item} oItem item to prepare coloring for
     * @returns {Promise} resolved, once coloring is prepared
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._prepareColoringForItem = function(oItem) {
        //COLORING
        return this._addCriticality(oItem).then(function(){
            this._getState(oItem.getParent()).aInSettings.push(oItem.getPropertyKey());

            if (oItem.getType() === "aggregatable") {

                //Uses excact MDC CHart Item name
                this._getPropertyInfosByName(oItem.getPropertyKey(), oItem.getParent()).then(function (oPropertyInfo) {
                    this._getAdditionalColoringMeasuresForItem(oPropertyInfo).forEach(function(oMeasure){

                        if (this._getState(oItem.getParent()).aColMeasures && this._getState(oItem.getParent()).aColMeasures.indexOf(oMeasure) == -1) {
                            this._getState(oItem.getParent()).aColMeasures.push(oMeasure);
                        }
                    }.bind(this));

                }.bind(this));
            }
        }.bind(this));

    };

    ChartDelegate._getAdditionalColoringMeasuresForItem = function(oPropertyInfo) {

		var aAdditional = [];

		var oCriticality = oPropertyInfo.datapoint ? oPropertyInfo.datapoint.criticality : null;

		if (oCriticality && oCriticality.DynamicThresholds) {
			aAdditional = oCriticality.DynamicThresholds.usedMeasures;
		}

		return aAdditional;
	};

    /**
     * Adds criticality to an item.
     *
     * @param {sap.ui.mdc.chart.Item} oItem Item to add criticality to
     * @returns {Promise} Resolved once criticality is added
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate._addCriticality = function (oItem) {

        //Uses excact MDC chart item name to idenfiy property
        return this._getPropertyInfosByName(oItem.getPropertyKey(), oItem.getParent()).then(function (oPropertyInfo) {

            if (oPropertyInfo.criticality || (oPropertyInfo.datapoint && oPropertyInfo.datapoint.criticality)){
                var oColorings = this._getState(oItem.getParent()).oColorings || {
                    Criticality: {
                        DimensionValues: {},
                        MeasureValues: {}
                    }
                };

                var mChartCrit = {};

                if (oItem.getType() == "groupable") {

                    var mCrit = oPropertyInfo.criticality ? oPropertyInfo.criticality : [];

                    for (var sKey in mCrit) {

                        mChartCrit[sKey] = {
                            Values: mCrit[sKey]
                        };
                    }

                    var sDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oItem.getParent());
                    oColorings.Criticality.DimensionValues[sDimName] = mChartCrit;

                } else {
                    var mCrit = oPropertyInfo.datapoint  && oPropertyInfo.datapoint.criticality ? oPropertyInfo.datapoint.criticality : [];

                    for (var sKey in mCrit) {
                        mChartCrit[sKey] = mCrit[sKey];
                    }

                    var sMeasureName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
                    oColorings.Criticality.MeasureValues[sMeasureName] = mChartCrit;
                }

                var oState = this._getState(oItem.getParent());
                oState.oColorings = oColorings;
                this._setState(oItem.getParent(), oState);

            }

        }.bind(this));

    };

    /**
     * Updates the coloring on the inner chart.
     * @param {sap.chart.Chart} oChart Inner chart
     * @param {array} aVisibleDimensions Visible dimensions for inner chart
     * @param {array} aVisibleMeasures Visible measures for inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe
     */
    ChartDelegate._updateColoring = function (oChart, aVisibleDimensions, aVisibleMeasures) {
        var oTempColorings = jQuery.extend(true, {}, this._getState(oChart).oColorings), k;

        if (oTempColorings && oTempColorings.Criticality) {
            var oActiveColoring;

            //dimensions overrule
            for (k = 0; k < aVisibleDimensions.length; k++) {

                if (this._getState(oChart).oColorings.Criticality.DimensionValues[aVisibleDimensions[k]]) {
                    oActiveColoring = {
                        coloring: "Criticality",
                        parameters: {
                            dimension: aVisibleDimensions[k]
                        }
                    };

                    delete oTempColorings.Criticality.MeasureValues;
                    break;
                }
            }

            if (!oActiveColoring) {
                delete oTempColorings.Criticality.DimensionValues;

                for (var sMeasure in oTempColorings.Criticality.MeasureValues) {

                    if (aVisibleMeasures.indexOf(sMeasure) == -1) {
                        delete oTempColorings.Criticality.MeasureValues[sMeasure];
                    }
                }

                oActiveColoring = {
                    coloring: "Criticality",
                    parameters: {
                        measure: aVisibleMeasures
                    }
                };
            }

            if (oActiveColoring) {
                this._getChart(oChart).setColorings(oTempColorings);
                this._getChart(oChart).setActiveColoring(oActiveColoring);
            }
        }
    };

    /**
     * Updates the semantical pattern for given measures.
     *
     * @param {sap.chart.Chart} oChart Inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._updateSemanticalPattern = function (oChart) {

        var aVisibleMeasures = this._getChart(oChart).getVisibleMeasures();

        aVisibleMeasures.forEach(function(sVisibleMeasureName){
            //first draft only with semantic pattern
            var oPropertyInfo = this.getPropertyFromNameAndKind(sVisibleMeasureName, "aggregatable", oChart);

            if (!oPropertyInfo){
                return;
            }

            var oDataPoint = oPropertyInfo.datapoint;

            if (oDataPoint) {

                if (oDataPoint.targetValue || oDataPoint.foreCastValue) {
                    var oActualMeasure = this._getChart(oChart).getMeasureByName(sVisibleMeasureName);

                    oActualMeasure.setSemantics("actual");

                    if (oDataPoint.targetValue != null) {
                        var oReferenceMeasure = this._getChart(oChart).getMeasureByName(oDataPoint.targetValue);

                        if (oReferenceMeasure) {
                            oReferenceMeasure.setSemantics("reference");
                        } else {
                            Log.error("sap.ui.mdc.Chart: " + oDataPoint.targetValue + " is not a valid measure");
                        }
                    }

                    if (oDataPoint.foreCastValue) {
                        var oProjectionMeasure = this._getChart(oChart).getMeasureByName(oDataPoint.foreCastValue);

                        if (oProjectionMeasure) {
                            oProjectionMeasure.setSemantics("projected");
                        } else {
                            Log.error("sap.ui.comp.SmartChart: " + oDataPoint.ForecastValue.Path + " is not a valid measure");
                        }
                    }

                    oActualMeasure.setSemanticallyRelatedMeasures({
                        referenceValueMeasure: oDataPoint.targetValue,
                        projectedValueMeasure: oDataPoint.foreCastValue
                    });
                }
            }
        }.bind(this));

    };

    /**
     * Returns the current chart type in form:
     * {
     *  icon : string,
     *  text: string
     * }
     *
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {object} Information about the current chart type
     * @throws {Error} if inner chart is not yet ready
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getChartTypeInfo = function (oChart) {
        if (!this._getChart(oChart)) {
            throw 'inner chart is not bound';
        }

        var sType = oChart.getChartType(),
            oMDCResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc"),
            oChartResourceBundle = Core.getLibraryResourceBundle("sap.chart.messages");

        var mInfo = {
            icon: ChartTypeButton.mMatchingIcon[sType],
            text: oMDCResourceBundle.getText("chart.CHART_TYPE_TOOLTIP", [
                oChartResourceBundle.getText("info/" + sType)
            ])
        };

        return mInfo;
    };

    /**
     * Gets the available chart types for the current state of the inner chart.
     *
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {array} Array containing the available chart types
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe
     */
    ChartDelegate.getAvailableChartTypes = function (oChart) {
        var aChartTypes = [];

        if (this._getChart(oChart)) {
            var aAvailableChartTypes = this._getChart(oChart).getAvailableChartTypes().available;

            if (aChartTypes) {

                var oChartResourceBundle = Core.getLibraryResourceBundle("sap.chart.messages");

                for (var i = 0; i < aAvailableChartTypes.length; i++) {
                    var sType = aAvailableChartTypes[i].chart;
                    aChartTypes.push({
                        key: sType,
                        icon: ChartTypeButton.mMatchingIcon[sType],
                        text: oChartResourceBundle.getText("info/" + sType),
                        selected: (sType == oChart.getChartType())
                    });
                }
            }
        }

        return aChartTypes;
    };

    /**
     * Returns the current drill stack of the inner chart.
     * The returned objects need at least a label and a name property.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {array} Array containing the drill stack
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getDrillStack = function (oChart) {
        //TODO: Generify the return values here for other chart frameworks
        var aDrillStack = Object.assign([], this._getChart(oChart).getDrillStack());

        aDrillStack.forEach(function(oStackEntry) {
			// loop over nested dimension arrays -> give them the correct name for filtering
			oStackEntry.dimension = oStackEntry.dimension.map(function(sDimension) {
                var oProp = this.getPropertyFromNameAndKind(sDimension, "groupable", oChart);
                if (oProp) {
                    return oProp.name;
                } else {
                    Log.error("MDC Chart Delegate: Couldn't map chart dimension to groupable property: " + sDimension);
                    return sDimension;
                }
			}.bind(this));
		}.bind(this));

        return aDrillStack;
    };

    /**
     * This returns all sorted dimensions of an inner chart as property.
     * This is used to determine possible drill-down dimensions in the drill-down popover of the MDC chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {Promise} <code>Promise</code> containing an array of dimensions that are sorted
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getSortedDimensions = function (oChart) {
        return new Promise(function (resolve, reject) {

            if (oChart.isPropertyHelperFinal()){
                resolve(this._sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
            } else {
                oChart.finalizePropertyHelper().then(function(){
                    resolve(this._sortPropertyDimensions(oChart.getPropertyHelper().getProperties()));
                }.bind(this));
            }
        }.bind(this));
    };

    ChartDelegate._sortPropertyDimensions = function(aProperties) {
        var aDimensions = aProperties.filter(function (oItem) {
            return oItem.groupable; //Groupable means "Dimension" for sap.chart.Chart
        });

        if (aDimensions) {
            aDimensions.sort(function (a, b) {
                if (a.label && b.label) {
                    return a.label.localeCompare(b.label);
                }
            });
        }

        return aDimensions;
    };

    /**
     * Determines which MDC items are drillable and returns them.
     * Used by breadcrumbs of MDC charts.
     *
     * @param {sap.ui.mdc.Chart} oChart MDC chart to get the items from
	 * @returns {sap.ui.mdc.chart.Item[]} Array of MDC items that are drillable
     *
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     *
     */
    ChartDelegate.getDrillableItems = function (oChart) {
        var aFilteredItems = oChart.getItems().filter(function (oItem) {
            return oItem.getType() === "groupable";
        });
        return aFilteredItems;
    };

    /**
     * Sets the chart type of the inner chart.
     * This function is called by MDC chart when the <code>chartType</code> property is updated.
     * @param {sap.ui.mdc.Chart} oChart MDC chart to set the chart type for
     * @param {string} sChartType New chart type
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.setChartType = function (oChart, sChartType) {
        this._getChart(oChart).setChartType(sChartType);
    };

    /**
     * Creates the inner data set for the inner chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @param {function} fnCallbackDataLoaded Callback for when data is loaded in the inner chart
     * @returns {Promise} Resolved once inner chart has been created
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.createInnerChartContent = function (oChart, fnCallbackDataLoaded) {

        return new Promise(function(resolve,reject){
            this._setChart(oChart, new Chart({
                id: oChart.getId() + "--innerChart",
                chartType: "column",
                height: "100%",
                width: "100%",
                isAnalytical: true//,
            }));

            this._getChart(oChart).setCustomMessages({
			    'NO_DATA': oChart.getNoDataText()
		    });

            //Initialize empty; will get filled later on
            this._getState(oChart).inResultDimensions = [];

            this._getInnerStructure(oChart).removeStyleClass("sapUiMDCChartTempText");
            oChart.removeStyleClass("sapUiMDCChartTempTextOuter");
            oChart.addStyleClass("sapUiMDCChartGrid");

            var oState = this._getState(oChart);
            oState.aColMeasures = [];
            oState.aInSettings = [];
            this._setState(oChart, oState);

            //Create initial content during pre-processing
            this._createContentFromItems(oChart).then(function(){
                //Since zoom information is not yet available for sap.chart.Chart after data load is complete, do it on renderComplete instead
                //This is a workaround which is hopefully not needed in other chart libraries
                this._getChart(oChart).attachRenderComplete(function () {
                    if (this._getState(oChart).toolbarUpdateRequested){
                        oChart._updateToolbar();
                        this._getState(oChart).toolbarUpdateRequested = false;
                    }
                }.bind(this));

                //this._getInnerStructure(oChart).removeAllContent();
                //this._getInnerStructure(oChart).setJustifyContent(FlexJustifyContent.Start);
                //this._getInnerStructure(oChart).setAlignItems(FlexAlignItems.Stretch);
                this._getInnerStructure(oChart).setContent(this._getChart(oChart));
                this._getInnerStructure(oChart).setShowNoDataStruct(false);

                oState.dataLoadedCallback = fnCallbackDataLoaded;

                this._setState(oChart, oState);
                var oBindingInfo;
                if (this._getBindingInfo) {
                    oBindingInfo = this._getBindingInfo(oChart);
                    Log.warning("mdc ChartDelegate", "calling the private delegate._getBindingInfo. Please make the function public!");
                } else {
                    oBindingInfo = this.getBindingInfo(oChart);
                }
                this.updateBindingInfo(oChart, oBindingInfo); //Applies filters
                this._performInitialBind(oChart, oBindingInfo);

                resolve();
            }.bind(this));


        }.bind(this));

    };

    /**
     * Performs the initial binding for the inner chart.
     * It is used for the vizFrame to make sure that the inner chart is correctly initialized upon creation.
     * Otherwise the chart will go into an error loop. <br><b>Note:</b> You must not override this setting.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @param {object} oBindingInfo Binding info object
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._performInitialBind = function(oChart, oBindingInfo) {
        if (oChart && oBindingInfo && this._getChart(oChart)) {
            this._addBindingListener(oBindingInfo, "dataReceived", this._onDataLoadComplete.bind(oChart));

            this._getChart(oChart).bindData(oBindingInfo);
            this._setBindingInfoForState(oChart, oBindingInfo);
            var oState = this._getState(oChart);
            oState.innerChartBound = true;

            this._checkForMeasureWarning(oChart);
        }
    };

    /**
     * Requests a toolbar update once the inner chart is ready.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.requestToolbarUpdate = function(oChart) {

        //Workaround as the sap.chart.Chart doesn't call renderComplete when no dimensions/measures are set up
        if (oChart.getItems().length === 0) {
            oChart._updateToolbar();
            return;
        }

        this._getState(oChart).toolbarUpdateRequested = true;
    };

    /**
     * Creates and adds a dimension for the inner chart for a given MDC chart item.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @param {sap.ui.mdc.chart.Item} oItem MDC chart item to be added to the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.createInnerDimension = function (oChart, oItem) {
        //TODO: Check for Hierachy and Time
        //TODO: Check for role annotation

        this._getPropertyInfosByName(oItem.getPropertyKey(), oChart).then(function(oPropInfo){
            this._addInnerDimension(oChart, oItem, oPropInfo);
        }.bind(this));


    };

    /**
     * Creates and adds a measure for the inner chart for given MDC chart item.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @param {sap.ui.mdc.chart.Item} oItem MDC chart item to be added to the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.createInnerMeasure = function (oChart, oItem) {

        this._getPropertyInfosByName(oItem.getPropertyKey(), oChart).then(function(oPropInfo){
            this._addInnerMeasure(oChart, oItem, oPropInfo);
        }.bind(this));
    };

    /**
     * @private
     */
    ChartDelegate._addInnerDimension = function(oChart, oChartItem, oPropertyInfo) {
        var oDimension = this.innerDimensionFactory(oChart, oChartItem, oPropertyInfo);
        this._getChart(oChart).addDimension(oDimension);
    };

    /**
     * @private
     */
    ChartDelegate.innerDimensionFactory = function (oChart, oItem, oPropertyInfo) {
        var oDimension = new Dimension({
            name: this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "groupable", oChart),
            role: oItem.getRole() ? oItem.getRole() : "category",
            label: oItem.getLabel()
        });

        if (oPropertyInfo.textProperty){
            oDimension.setTextProperty(oPropertyInfo.textProperty);
            oDimension.setDisplayText(true);
        }

        if (oPropertyInfo.textFormatter){
            oDimension.setTextFormatter(this.formatText.bind(oPropertyInfo));
        }
        return oDimension;
    };

    /**
     * @private
     */
    ChartDelegate._addInnerMeasure = function(oChart, oChartItem, oPropertyInfo) {
        var oMeasure = this.innerMeasureFactory(oChart, oChartItem, oPropertyInfo);
        this._getChart(oChart).addMeasure(oMeasure);
    };

    /**
     * @private
     */
    ChartDelegate.innerMeasureFactory = function(oChart, oChartItem, oPropertyInfo) {
        var aggregationMethod = oPropertyInfo.aggregationMethod;
        var propertyPath = oPropertyInfo.propertyPath;

        var oMeasureSettings = {
            name: this._getAggregatedMeasureNameForMDCItem(oChartItem),//aggregationMethod + oItem.getPropertyKey() under normal circumstances
            label: oChartItem.getLabel(),
            role: oChartItem.getRole() ? oChartItem.getRole() : "axis1"
        };

        if (aggregationMethod && propertyPath) {
            oMeasureSettings.analyticalInfo = {
                propertyPath: propertyPath,
                "with": aggregationMethod
            };
        }


        return new Measure(oMeasureSettings);
    };

    /**
     * Gets the aggreagted name for given propertyInfo.
     * @param {object} oPoperty PropertyInfo object
     * @returns {string} Name for inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate._getAggregatedMeasureNameForProperty = function(oPoperty){
        return oPoperty.aggregationMethod + oPoperty.name;
    };

    /**
     * Checks the binding of the chart and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oChart MDC chart instance
     * @param {object} oBindingInfo BindingInfo of the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.rebind = function (oChart, oBindingInfo) {
        if (oChart && oBindingInfo && this._getChart(oChart)) {
            //TODO: bindData sap.chart.Chart specific and therefore needs to be changed to a general API.
            this._addBindingListener(oBindingInfo, "dataReceived", this._onDataLoadComplete.bind(oChart));

            //Will be enabled with future BLI
            //this._checkForMeasureWarning(oChart);
            this._getInnerStructure(oChart).setShowNoDataStruct(false);

            //TODO: Clarify why sap.ui.model.odata.v4.ODataListBinding.destroy this.bHasAnalyticalInfo is false
            //TODO: on second call, as it leads to issues when changing layout options within the settings dialog.
            //TODO: bHasAnalyticalInfo of inner chart binding should be true and in fact is true initially.
            if (oBindingInfo.binding) {
                oBindingInfo.binding.bHasAnalyticalInfo = true;
            }


            this._getChart(oChart).bindData(oBindingInfo);
            this._setBindingInfoForState(oChart, oBindingInfo);
            var oState = this._getState(oChart);
            oState.innerChartBound = true;
        }
    };

    //TODO: Write unit test for this!!
    ChartDelegate._checkForMeasureWarning = function(oChart) {

        if (!oChart.getNoData()) {
            return;
        }

        var oMDCMeasures = oChart.getItems().filter(function(oItem){
            return oItem.getType() === "aggregatable";
        });

        if (oMDCMeasures.length === 0) {
            this._getInnerStructure(oChart).setShowNoDataStruct(true);
            oChart.setBusy(false);
        } else {
            this._getInnerStructure(oChart).setShowNoDataStruct(false);
        }
    };

    /**
     * Returns the binding info for given chart.
     * If no binding info exists yet, a new one will be created.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {object} BindingInfo object
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getBindingInfo = function (oChart) {

        if (this._getBindingInfoFromState(oChart)) {
            return this._getBindingInfoFromState(oChart);
        }

        var oMetadataInfo = oChart.getDelegate().payload;
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oBindingInfo = {
            path: sEntitySetPath
        };
        return oBindingInfo;
    };

    /**
     * Returns whether the inner chart is currently bound.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {boolean} <code>true</code> if inner chart is bound; <code>false</code> if not
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getInnerChartBound = function (oChart) {
        var oState = this._getState(oChart);

        if (!oState) {
            return false;
        }

        return oState.innerChartBound ? true : false;
    };

    /**
     * Updates the binding info with the relevant filters and sorters.
     * Override this to apply custom info to the binding.
     *
     * @param {Object} oChart MDC chart instance
     * @param {Object} oBindingInfo BindingInfo of the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.updateBindingInfo = function (oChart, oBindingInfo) {
        var aFilters = createInnerFilters.call(this, oChart).concat(createOuterFilters.call(this, oChart));
        addSearchParameter(oChart, oBindingInfo);
		oBindingInfo.filters = new Filter(aFilters, true);
        oBindingInfo.sorter = this.getSorters(oChart);

    };

    function createInnerFilters(oChart) {
		var bFilterEnabled = oChart.getP13nMode().indexOf("Filter") > -1;
		var aFilters = [];

		if (bFilterEnabled) {
			var aChartProperties = oChart.getPropertyHelper().getProperties();
			var oInnerFilterInfo = FilterUtil.getFilterInfo(this.getTypeMap(), oChart.getConditions(), aChartProperties);

			if (oInnerFilterInfo.filters) {
				aFilters.push(oInnerFilterInfo.filters);
			}
		}

		return aFilters;
	}

	function createOuterFilters(oChart) {
		var oFilter = Core.byId(oChart.getFilter());
		var aFilters = [];

		if (!oFilter) {
			return aFilters;
		}

		var mConditions = oFilter.getConditions();

		if (mConditions) {
			var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
			var aParameterNames = DelegateUtil.getParameterNames(oFilter);
			var oOuterFilterInfo = FilterUtil.getFilterInfo(this.getTypeMap(), mConditions, aPropertiesMetadata, aParameterNames);

			if (oOuterFilterInfo.filters) {
				aFilters.push(oOuterFilterInfo.filters);
			}
		}

		return aFilters;
	}

	function addSearchParameter(oChart, oBindingInfo) {
		var oFilter = Core.byId(oChart.getFilter());
		if (!oFilter) {
			return;
		}

		var mConditions = oFilter.getConditions();
		// get the basic search
		var sSearchText = oFilter.getSearch instanceof Function ? oFilter.getSearch() :  "";

		if (mConditions) {
			var sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
			if (sParameterPath) {
				oBindingInfo.path = sParameterPath;
			}
		}

        if (!oBindingInfo.parameters) {
            oBindingInfo.parameters = {};
        }

		oBindingInfo.parameters["$search"] = sSearchText || undefined;
	}

    /**
     * Returns sorters available for the data.
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {array} Array containing available sorters
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
    */
    ChartDelegate.getSorters = function (oChart) {
        var aSorters;
        var aSorterProperties = oChart.getSortConditions() ? oChart.getSortConditions().sorters : [];

        aSorterProperties.forEach(function (oSortProp) {

            var oMDCItem = oChart.getItems().find(function (oItem) {
                return oItem.getPropertyKey() === oSortProp.name;
            });

            //Ignore not visible Items
            if (!oMDCItem) {
                return;
            }

            //TODO: Check for inResultDimensions
            var oSorter = this._getSorterForItem(oMDCItem, oSortProp);

            if (aSorters) {
                aSorters.push(oSorter);
            } else {
                aSorters = [
                    oSorter
                ];//[] has special meaning in sorting
            }
        }.bind(this));

        return aSorters;

    };

    ChartDelegate._getAggregatedMeasureNameForMDCItem = function(oItem){
        return this.getInternalChartNameFromPropertyNameAndKind(oItem.getPropertyKey(), "aggregatable", oItem.getParent());
    };

    /**
     * This function returns an ID that is used in the internal chart for the measure/dimension.
     * In the standard case, this is just the ID of the property.
     * If it is necessary to use another ID internally inside the chart (for example, on duplicate property IDs) this method can be overwritten.
     * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
     * @param {string} sName ID of the property
     * @param {string} sKind Kind of the Property (Measure/Dimension)
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {string} Internal id for the sap.chart.Chart
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName, sKind, oChart) {
        return sName;
    };

    /**
     * This maps an ID of an internal chart dimension/measure & kind of a property to its corresponding property entry.
     * @param {string} sName ID of internal chart measure/dimension
     * @param {string} sKind Kind of the property
     * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
     * @returns {object} Property object
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.getPropertyFromNameAndKind = function(sName, sKind, oChart) {
        return oChart.getPropertyHelper().getProperty(sName);
    };

    /**
     * Sets tooltips to visible/invisible on inner chart.
     * @param {sap.ui.mdc.Chart} oChart MDC chart
     * @param {boolean} bFlag <code>true</code> for visible, <code>false</code> for invisible
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.setChartTooltipVisibility = function (oChart, bFlag) {

        if (this._getChart(oChart)) {
            if (bFlag) {
                if (!this._getState(oChart).vizTooltip) {

                    var oState = this._getState(oChart);
                    oState.vizTooltip = new VizTooltip();
                    this._setState(oChart, oState);
                }
                // Make this dynamic for setter calls
                //this._vizTooltip.connect(this._oInnerChart.getVizUid());
                this._getState(oChart).vizTooltip.connect(this._getChart(oChart).getVizUid());
            } else if (this._getState(oChart).vizTooltip) {
                this._getState(oChart).vizTooltip.destroy();
            }
        } else {
            Log.error("Trying to set chart tooltip while inner chart was not yet initialized");
        }
    };

    /**
     *
     * Delegate specific part
     *
     */
    ChartDelegate._loadChart = function () {

        return new Promise(function (resolve) {
            var aNotLoadedModulePaths = ['sap/chart/Chart', 'sap/chart/data/Dimension', 'sap/chart/data/Measure', 'sap/viz/ui5/controls/VizTooltip'];

            function onModulesLoadedSuccess(fnChart, fnDimension, fnMeasure, fnVizTooltip) {
                Chart = fnChart;
                Dimension = fnDimension;
                Measure = fnMeasure;
                VizTooltip = fnVizTooltip;

                resolve();
            }

            Core.loadLibrary("sap.viz", {async: true}).then(function(){
                sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
            });

        });

    };

    /**
     * Returns the propertyHelper used for the chart delegate.
     * @returns {Promise} <code>Promise</code> with the property helper reference
     */
    ChartDelegate.getPropertyHelperClass = function () {
        return PropertyHelper;
    };

    /**
     * This allows formatting for axis labels of the inner sap.chart.Chart.
     * Note: As the inner chart has no association to the propertyInfo, <code>this</code> will be bound to the propertyInfo object when calling this method.
     * @param {string} sKey Key of the dimension
     * @param {string} sDesc Description provided by the metadata
     * @returns {string} Label which should be shown on the chart axis
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.formatText = function(sKey, sDesc) {
        return sKey;
    };

    /**
     * Defines a <code>noDataText</code> text for the inner chart.
     * @param {sap.ui.mdc.Chart} oChart Reference to chart
     * @param {string} sText Text that shows if no data is displayed in the chart
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.setNoDataText = function(oChart, sText) {
        this._getChart(oChart).setCustomMessages({
            'NO_DATA': sText
        });
    };

    /**
     * Adds/Removes the overlay shown above the inner chart.
     * @param {sap.ui.mdc.Chart} oChart reference to the chart
     * @param {boolean} bShow <code>true</code> to show overlay, <code>false</code> to hide
     *
     * @experimental
     * @private
     * @ui5-restricted sap.fe, sap.ui.mdc
     */
    ChartDelegate.showOverlay = function(oChart, bShow) {
        if (this._getInnerStructure(oChart)) {
            this._getInnerStructure(oChart).showOverlay(bShow);
        }
    };

    //Gets internal property infos by excact property name
    ChartDelegate._getPropertyInfosByName = function(sName, oChart){
        return oChart._getPropertyByNameAsync(sName);
    };


    ChartDelegate._getModel = function (oTable) {
        var oMetadataInfo = oTable.getDelegate().payload;
        return oTable.getModel(oMetadataInfo.model);
    };

    ChartDelegate._addBindingListener = function (oBindingInfo, sEventName, fHandler) {
        if (!oBindingInfo.events) {
            oBindingInfo.events = {};
        }

        if (!oBindingInfo.events[sEventName]) {
            oBindingInfo.events[sEventName] = fHandler;
        } else {
            // Wrap the event handler of the other party to add our handler.
            var fOriginalHandler = oBindingInfo.events[sEventName];
            oBindingInfo.events[sEventName] = function () {
                fHandler.apply(this, arguments);
                fOriginalHandler.apply(this, arguments);
            };
        }
    };

    //This is bound to mdc chart
    ChartDelegate._onDataLoadComplete = function (mEventParams) {
        var oNoDataStruct = this.getControlDelegate()._getInnerStructure(this);

        if (this.getNoData()){
            if (mEventParams.getSource() && mEventParams.getSource().getCurrentContexts().length === 0) {
                //var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
                //oNoDataStruct.setNoDataContent(new IllustratedMessage({title: this.getNoDataText(), description: MDCRb.getText("chart.NO_DATA_WITH_FILTERBAR"), illustrationType: mLib.IllustratedMessageType.BeforeSearch}));
                oNoDataStruct.setShowNoDataStruct(true);
            } else {
                oNoDataStruct.setShowNoDataStruct(false);
            }
        }


        this._innerChartDataLoadComplete(mEventParams);
    };

    return ChartDelegate;
});