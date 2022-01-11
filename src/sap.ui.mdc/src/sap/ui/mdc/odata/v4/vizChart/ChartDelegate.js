/*
 * ! ${copyright}
 */

sap.ui.define([
    "../ChartDelegate",
    "../../../util/loadModules",
    "sap/ui/core/Core",
    "sap/m/library",
    "sap/m/Text",
    "sap/ui/mdc/library",
    "sap/ui/mdc/odata/v4/ODataMetaModelUtil",
    "sap/base/Log",
    'sap/ui/mdc/util/FilterUtil',
    'sap/ui/mdc/odata/v4/util/DelegateUtil',
    "sap/ui/mdc/chart/ChartTypeButton",
    "sap/ui/mdc/chart/Item",
    "sap/ui/model/Sorter",
    "sap/m/VBox",
    "sap/ui/base/ManagedObjectObserver",
    "sap/ui/core/ResizeHandler",
    "sap/ui/mdc/p13n/panels/ChartItemPanel",
    "sap/m/MessageStrip"
], function (
    V4ChartDelegate,
    loadModules,
    Core,
    mobileLibrary,
    Text,
    MDCLib,
    ODataMetaModelUtil,
    Log,
    FilterUtil,
    DelegateUtil,
    ChartTypeButton,
    MDCChartItem,
    Sorter,
    VBox,
    ManagedObjectObserver,
    ResizeHandler,
    ChartItemPanel,
    MessageStrip
) {
    "use strict";
    /**
     * Delegate class for sap.ui.mdc.Chart and ODataV4.
     * Enables additional analytical capabilities.
     * <b>Note:</b> The class is experimental and the API/behavior is not finalized.
     *
     * @author SAP SE
     * @private
     * @since 1.88
     * @alias sap.ui.mdc.odata.v4.vizChart.ChartDelegate
     */
    var ChartDelegate = Object.assign({}, V4ChartDelegate);

	var FlexJustifyContent = mobileLibrary.FlexJustifyContent;
	var FlexAlignItems = mobileLibrary.FlexAlignItems;

    var mStateMap = new window.WeakMap();
    //var ChartLibrary;
    var Chart;
    var Dimension;
    //var HierarchyDimension;
    //var TimeDimension;
    var Measure;
    //var VizPopover;
    var VizTooltip;

    //API to access state
    ChartDelegate._getState = function (oMDCChart) {
        if (mStateMap.has(oMDCChart)){
            return mStateMap.get(oMDCChart);
        }

        Log.info("Couldn't get state for " + oMDCChart.getId());
    };

    ChartDelegate._setState = function(oMDCChart, oState) {
        mStateMap.set(oMDCChart, oState);
    };

    ChartDelegate._deleteState = function(oMDCChart) {

        if (this._getState(oMDCChart).vizTooltip) {
            this._getState(oMDCChart).vizTooltip.destroy();
        }

        if (this._getState(oMDCChart).observer) {
            this._getState(oMDCChart).observer.disconnect();
            this._getState(oMDCChart).observer = null;
        }

        return mStateMap.delete(oMDCChart);
    };


    ChartDelegate._getChart = function (oMDCChart){

        if (mStateMap.has(oMDCChart)) {
            return mStateMap.get(oMDCChart).innerChart;
        }

        Log.info("Couldn't get state for " + oMDCChart.getId());

        return undefined;

    };

    ChartDelegate._setChart = function (oMDCChart, oInnerChart) {
        if (mStateMap.has(oMDCChart)) {
            mStateMap.get(oMDCChart).innerChart = oInnerChart;
        } else {
            mStateMap.set(oMDCChart, {innerChart: oInnerChart});
        }
    };

    ChartDelegate._getInnerStructure = function (oMDCChart) {
        if (mStateMap.has(oMDCChart)) {
            return mStateMap.get(oMDCChart).innerStructure;
        }

        Log.info("Couldn't get state for " + oMDCChart.getId());

        return undefined;
    };

    ChartDelegate._setInnerStructure = function (oMDCChart, oInnerStructure) {
        if (mStateMap.has(oMDCChart)) {
            mStateMap.get(oMDCChart).innerStructure = oInnerStructure;
        } else {
            mStateMap.set(oMDCChart, {innerStructure: oInnerStructure});
        }
    };

    ChartDelegate._getBindingInfoFromState = function (oMDCChart) {
        if (mStateMap.has(oMDCChart)) {
            return mStateMap.get(oMDCChart).bindingInfo;
        }

        Log.info("Couldn't get state for " + oMDCChart.getId());

        return undefined;
    };

    ChartDelegate._setBindingInfoForState = function (oMDCChart, oBindingInfo) {
        if (mStateMap.has(oMDCChart)) {
            mStateMap.get(oMDCChart).bindingInfo = oBindingInfo;
        } else {
            mStateMap.set(oMDCChart, {bindingInfo: oBindingInfo});
        }
    };

    ChartDelegate._setUpChartObserver = function(oMDCChart) {
		var mChartMap = this._getState(oMDCChart);

		if (!mChartMap.observer) {
			mChartMap.observer = new ManagedObjectObserver(function(oChange) {
				if (oChange.type === "destroy") {
                    this.exit(oChange.object);
				}
			}.bind(this));
		}

		mChartMap.observer.observe(oMDCChart, {
			destroy: true
		});
	};


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
             *
             * @returns {Promise} Promise that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
             * For more information, see {@link sap.ui.mdc.AggregationBaseDelegate#addItem AggregationBaseDelegate}.
             */
            addItem: function (sPropertyName, oMDCChart) {
                return Promise.resolve(null);
            }
        };
    };

    ChartDelegate.exit = function(oMDCChart) {
        if (this._getInnerStructure(oMDCChart)){
            this._getInnerStructure(oMDCChart).destroy();
        }

        this._deleteState(oMDCChart);
    };

    /**
     * Toolbar relevant API (WIP)
     */
    ChartDelegate.zoomIn = function (oMDCChart, iValue) {
        this._getChart(oMDCChart).zoom({direction: "in"});
    };

    ChartDelegate.zoomOut = function (oMDCChart, iValue) {
        this._getChart(oMDCChart).zoom({direction: "out"});
    };


    /**
     * Gets the current zooming information for the inner chart
     * @returns {integer} Current zoom level on the inner chart
     */
    ChartDelegate.getZoomState = function (oMDCChart) {

        if (this._getChart(oMDCChart)) {
            return this._getChart(oMDCChart).getZoomInfo(this);
        }

    };
    /**
     ** Returns the event handler for chartSelectionDetails as an object
     * {
     *   "eventId": id of the selection event,
     *   "listener": reference to inner chart
     *   }
     *
     * @returns {object} event handler for chartSelectionDetails
     */
    ChartDelegate.getInnerChartSelectionHandler = function (oMDCChart) {
        return {eventId: "_selectionDetails", listener: this._getChart(oMDCChart)};
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

        if (this._aChartTypeLayout) {
            return this._aChartTypeLayout;
        }

        var aAxis1Only = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.series];
		var aAxis1And2 = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.axis2, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.series];
		var aCat2Axis1Only = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.category2];
		var aCat1AllAxis = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.axis2, MDCLib.ChartItemRoleType.axis3, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.series];

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

    ChartDelegate.getAdaptionUI = function(oMDCChart) {

        var oLayoutConfig = this.getChartTypeLayoutConfig().find(function(it){return it.key === oMDCChart.getChartType();});

        //Default case -> everything allowed
        if (!oLayoutConfig) {
            var aRoles = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.axis2, MDCLib.ChartItemRoleType.axis3, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.category2, MDCLib.ChartItemRoleType.series];
            oLayoutConfig = {key: oMDCChart.getChartType(), allowedLayoutOptions: aRoles};
        }

        var aStandardSetup = [
            {kind: "Groupable"},
            {kind: "Aggregatable"}
        ];

        oLayoutConfig.templateConfig = aStandardSetup;


        //var aRolesAvailable = [MDCLib.ChartItemRoleType.axis1, MDCLib.ChartItemRoleType.axis2, MDCLib.ChartItemRoleType.axis3, MDCLib.ChartItemRoleType.category, MDCLib.ChartItemRoleType.category2, MDCLib.ChartItemRoleType.series];
        var oArguments = {panelConfig: oLayoutConfig};

        var oPanel = new ChartItemPanel(oArguments);

        if (oMDCChart.getChartType() === "heatmap"){
            var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
            oPanel.setMessageStrip(new MessageStrip({text: MDCRb.getText("chart.PERSONALIZATION_DIALOG_MEASURE_WARNING"), type:"Warning"}));
        }

        return Promise.resolve(oPanel);
    };

    /**
     * Sets the visibility of the legend
     * This is called by the MDC Chart, do not call it directly!
     * @param {bool} bVisible true to show legend, false to hide
     *
     * @experimental
     * @private
     * @ui5-restricted Fiori Elements, sap.ui.mdc
     */
    ChartDelegate.setLegendVisible = function (oMDCChart, bVisible) {
        if (this._getChart(oMDCChart)) {
            this._getChart(oMDCChart).setVizProperties({
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
     * Creates a Sorter for given Property
     * @param {sap.ui.mdc.Chart.Item} oMDCItem the MDC Item to create a Sorter for
     * @param {object} oSortProperty the sorting information
     */
    ChartDelegate.getSorterForItem = function (oMDCItem, oSortProperty) {
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
     * Inserts an MDC Chart Item (in case of sap.chart.Chart a Measure/Dimension) on the inner chart
     * This function is called by MDC Chart on a change of the <code>Items</code> aggregation
     * @param {sap.ui.mdc.chart-Item} oMDCChartItem the MDC CHart Item to insert into the inner chart
     * @param {int} iIndex the index to insert into
     */
    ChartDelegate.insertItemToInnerChart = function (oMDCChart, oMDCChartItem, iIndex) {
        //TODO: Create Measures/Dimension only when required?
        if (oMDCChartItem.getType() === "groupable") {

            var sInnerDimName = this.getInternalChartNameFromPropertyNameAndKind(oMDCChartItem.getName(), "groupable", oMDCChart);
            var oDim = this._getChart(oMDCChart).getDimensionByName(sInnerDimName);

            if (!oDim) {
                this.createInnerDimension(oMDCChart, oMDCChartItem);
            } else {
                //Update Dimension
                oDim.setLabel(oMDCChartItem.getLabel());
                oDim.setRole(oMDCChartItem.getRole() ? oMDCChartItem.getRole() : "category");
            }

            var aVisibleDimension = this._getChart(oMDCChart).getVisibleDimensions();
            aVisibleDimension.splice(iIndex, 0, sInnerDimName); //Insert Item without deleting existing dimension
            this._getChart(oMDCChart).setVisibleDimensions(aVisibleDimension);

        } else if (oMDCChartItem.getType() === "aggregatable") {
            this.createInnerMeasure(oMDCChart, oMDCChartItem);
            var aVisibleMeasures = this._getChart(oMDCChart).getVisibleMeasures();
            aVisibleMeasures.splice(iIndex, 0, this._getAggregatedMeasureNameForMDCItem(oMDCChartItem));
            this._getChart(oMDCChart).setVisibleMeasures(aVisibleMeasures);
        }

        //Update coloring and semantical patterns on Item change
        this._prepareColoringForItem(oMDCChartItem).then(function(){
            this._updateColoring(oMDCChart, this._getChart(oMDCChart).getVisibleDimensions(), this._getChart(oMDCChart).getVisibleMeasures());
        }.bind(this));

        this.fetchProperties(oMDCChartItem.getParent()).then(function (aProperties) {
            this._updateSemanticalPattern(oMDCChart, aProperties);
        }.bind(this));
    };

    /**
     * Removes an Item (in case of sap.chart.Chart a Measure/Dimension) from the inner chart
     * This function is called by MDC Chart on a change of the <code>Items</code> aggregation
     * @param {sap.ui.mdc.chart.Item} oMDCChartItem The Item to remove from the inner chart
     */
    ChartDelegate.removeItemFromInnerChart = function (oMDCChart, oMDCChartItem) {
        if (oMDCChartItem.getType() === "groupable" && this._getChart(oMDCChart).getVisibleDimensions().includes(this.getInternalChartNameFromPropertyNameAndKind(oMDCChartItem.getName(), "groupable", oMDCChart))) {
            var sInnerDimName = this.getInternalChartNameFromPropertyNameAndKind(oMDCChartItem.getName(), "groupable", oMDCChart);

            var aNewVisibleDimensions = this._getChart(oMDCChart).getVisibleDimensions().filter(function (e) {
                return e !== sInnerDimName;
            });

            if (this._getState(oMDCChart).inResultDimensions.length > 0) {
                this._getChart(oMDCChart).setInResultDimensions(this._getState(oMDCChart).inResultDimensions);
            }

            this._getChart(oMDCChart).setVisibleDimensions(aNewVisibleDimensions);

            //this._getChart(oMDCChart).removeDimension(this._getChart(oMDCChart).getDimensionByName(oMDCChartItem.getName()));

        } else if (oMDCChartItem.getType() === "aggregatable" && this._getChart(oMDCChart).getVisibleMeasures().includes(this._getAggregatedMeasureNameForMDCItem(oMDCChartItem))) {
            var aNewVisibleMeasures = this._getChart(oMDCChart).getVisibleMeasures().filter(function (e) {
                return e !== this._getAggregatedMeasureNameForMDCItem(oMDCChartItem);
            }.bind(this));
            this._getChart(oMDCChart).setVisibleMeasures(aNewVisibleMeasures);

            this._getChart(oMDCChart).removeMeasure(this._getChart(oMDCChart).getMeasureByName(this._getAggregatedMeasureNameForMDCItem(oMDCChartItem)));
        }

        //Update coloring and semantical patterns on Item change
        this._updateColoring(oMDCChart, this._getChart(oMDCChart).getVisibleDimensions(), this._getChart(oMDCChart).getVisibleMeasures());
        this.fetchProperties(oMDCChartItem.getParent()).then(function (aProperties) {
            this._updateSemanticalPattern(oMDCChart, aProperties);
        }.bind(this));
    };

    /**
     * Creates a new MDC Chart Item for given Property name and updates inner chart
     * (Does NOT add the MDC CHart Item to the Item aggregation of the MDC Chart)
     * Called by p13n
     * @param {string} sPropertyName the name of the property added
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart to add the property to
     * @returns {Promise} Promise that resolves with new MDC Chart Item as parameter
     */
    ChartDelegate.addItem = function (sPropertyName, oMDCChart, mPropertyBag, sRole) {
        if (oMDCChart.getModel) {
            return Promise.resolve(this._createMDCChartItem(sPropertyName, oMDCChart, sRole));
        }
        return Promise.resolve(null);
    };

    ChartDelegate.removeItem = function (oProperty, oMDCChart) {
        return Promise.resolve(true);
    };

    ChartDelegate._createMDCChartItem = function (sPropertyName, oMDCChart, sRole) {
        return this.fetchProperties(oMDCChart).then(function (aProperties) {

            //Uses excact MDC Chart Item id
            var oPropertyInfo = aProperties.find(function (oCurrentPropertyInfo) {
                return oCurrentPropertyInfo.name === sPropertyName;
            });

            if (!oPropertyInfo) {
                return null;
            }


            //TODO: Check for case: both aggegatable and groupable
            if (oPropertyInfo.groupable) {
                return new MDCChartItem(oMDCChart.getId() + "--GroupableItem--" + oPropertyInfo.name, {
                    name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "groupable",
                    role: sRole ? sRole : "category"
                });
            }

            if (oPropertyInfo.aggregatable) {

                return new MDCChartItem(oMDCChart.getId() + "--AggregatableItem--" + oPropertyInfo.name, {
                    name: oPropertyInfo.name,
                    label: oPropertyInfo.label,
                    type: "aggregatable",
                    role: sRole ? sRole : "axis1"
                });
            }
        });
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

                var sVBoxHeight = this._calculateInnerChartHeight(oMDCChart);

                this._setInnerStructure(oMDCChart, new VBox({
                    justifyContent: "Center",
				    alignItems: "Center",
                    height: sVBoxHeight,
                    width: "100%"
                }));
                var oText = new Text();
                oText.setText(oMDCChart.getNoDataText());

                this._getInnerStructure(oMDCChart).addItem(oText);

                this._setUpChartObserver(oMDCChart);

                resolve(this._getInnerStructure(oMDCChart)); //Not applicable in this case
            }.bind(this));
        }.bind(this));
    };

    /**
     * Creates initial content for the chart, while metadata has not been retrieved yet
     * @param {sap.ui.mdc.chart} oMDCChart the MDC Chart
     */
    ChartDelegate.createInitialChartContent = function(oMDCChart) {
        //Not relevant for sap.chart.Chart
    };

    ChartDelegate._createContentFromItems = function (oMDCChart) {
        //This is done so the user doesn't have to specify property path & aggregation method in the XML
        this.fetchProperties(oMDCChart).then(function (aProperties) {
            var aColorPromises = [];

            var aVisibleDimensions = [];
            var aVisibleMeasures = [];
            oMDCChart.getItems().forEach(function (oItem, iIndex) {

                //Uses excact mdc chart item id
                var oPropertyInfo = aProperties.find(function (oCurrentPropertyInfo) {
                    return oCurrentPropertyInfo.name === oItem.getName();
                });

                //Skip a Item if there is no property representing the Item inside the backend
                if (!oPropertyInfo){
                    Log.error("sap.ui.mdc.Chart: Item " + oItem.getName() + " has no property info representing it in the metadata. Make sure the name is correct and the metadata is defined correctly. Skipping the item!");
                    return;
                }

                switch (oItem.getType()) {
                    case "groupable":
                        aVisibleDimensions.push(this.getInternalChartNameFromPropertyNameAndKind(oItem.getName(), "groupable", oMDCChart));

                        this._addInnerDimension(oMDCChart, oItem, oPropertyInfo);
                        break;
                    case "aggregatable":

                        //TODO: Alias might be changing after backend request
                        aVisibleMeasures.push(this._getAggregatedMeasureNameForMDCItem(oItem));

                        this._addInnerMeasure(oMDCChart, oItem, oPropertyInfo);
                        break;

                    default:
                        Log.error("MDC Chart Item " + oItem.getId() + " with label " + oItem.getLabel() + " has no known type. Supported typed are: \"groupable\" & \"aggregatable\"");
                }

                aColorPromises.push(this._prepareColoringForItem(oItem));
            }.bind(this));

            this._getState(oMDCChart).aColMeasures.forEach(function(sKey) {

                if (this._getState(oMDCChart).aInSettings.indexOf(sKey) == -1) {

                    var oPropertyInfo = oMDCChart.getPropertyHelper().getProperty(sKey); //this.getPropertyFromNameAndKind not used as the key is the name of the MDC Chart Item

                    var aggregationMethod = oPropertyInfo.aggregationMethod;
                    var propertyPath = oPropertyInfo.propertyPath;
                    var sName = this.getInternalChartNameFromPropertyNameAndKind(sKey, "aggregatable", oMDCChart);

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
                    this._getChart(oMDCChart).addMeasure(oMeasure);
                }

            }.bind(this));

            Promise.all(aColorPromises).then(function(){
                this._getChart(oMDCChart).setVisibleDimensions(aVisibleDimensions);
                this._getChart(oMDCChart).setVisibleMeasures(aVisibleMeasures);

                var aInResultDimensions = oMDCChart.getDelegate().inResultDimensions; //TODO: Does this use internal name? If so, change _getPropertyInfosByName  below; Most likely not the case
                if (aInResultDimensions && aInResultDimensions instanceof Array && aInResultDimensions.length != 0) {

                    var aInResultPromises = [];

                    aInResultDimensions.forEach(function(sInResultDim){

                        aInResultPromises.push(this._getPropertyInfosByName(sInResultDim, oMDCChart).then(function(oPropertyInfos){
                            var sName = this.getInternalChartNameFromPropertyNameAndKind(oPropertyInfos.name, "groupable", oMDCChart);

                            var oDim = new Dimension({
                                name: sName,
                                label: oPropertyInfos.label
                            });

                            this._getState(oMDCChart).inResultDimensions.push(sName);
                            this._getChart(oMDCChart).addDimension(oDim);
                        }.bind(this)));

                    }.bind(this));

                    Promise.all(aInResultPromises).then(function(){
                        this._getChart(oMDCChart).setInResultDimensions(this._getState(oMDCChart).inResultDimensions);
                    }.bind(this));

                }

                this._updateColoring(oMDCChart, aVisibleDimensions, aVisibleMeasures);
                this._updateSemanticalPattern(oMDCChart, aProperties);
            }.bind(this));

        }.bind(this));

    };

    ChartDelegate.getInnerChart = function (oMDCChart) {
        return this._getChart(oMDCChart);
    };


    ChartDelegate._prepareColoringForItem = function(oItem) {
        //COLORING
        return this._addCriticality(oItem).then(function(){
            this._getState(oItem.getParent()).aInSettings.push(oItem.getName());

            if (oItem.getType === "aggregatable") {

                //Uses excact MDC CHart Item name
                this._getPropertyInfosByName(oItem.getName(), oItem.getParent()).then(function (oPropertyInfo) {
                    for (var j = 0; j < this._getAdditionalColoringMeasuresForItem(oPropertyInfo); j++) {

                        if (this._getState(oItem.getParent()).aColMeasures.indexOf(this._getAdditionalColoringMeasuresForItem(oPropertyInfo)[j]) == -1) {
                            this._getState(oItem.getParent()).aColMeasures.push(this._getAdditionalColoringMeasuresForItem(oPropertyInfo)[j]);
                        }
                    }
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
     * Adds criticality to an item
     *
     * @param oItem item to add criticality to
     *
     * @experimental
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate._addCriticality = function (oItem) {

        //Uses excact MDC Chart item name to idenfiy property
        return this._getPropertyInfosByName(oItem.getName(), oItem.getParent()).then(function (oPropertyInfo) {

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

                    var sDimName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getName(), "groupable", oItem.getParent());
                    oColorings.Criticality.DimensionValues[sDimName] = mChartCrit;

                } else {
                    var mCrit = oPropertyInfo.datapoint  && oPropertyInfo.datapoint.criticality ? oPropertyInfo.datapoint.criticality : [];

                    for (var sKey in mCrit) {
                        mChartCrit[sKey] = mCrit[sKey];
                    }

                    var sMeasureName = this.getInternalChartNameFromPropertyNameAndKind(oItem.getName(), "aggregatable", oItem.getParent());
                    oColorings.Criticality.MeasureValues[sMeasureName] = mChartCrit;
                }

                var oState = this._getState(oItem.getParent());
                oState.oColorings = oColorings;
                this._setState(oItem.getParent(), oState);

            }

        }.bind(this));

    };

    /**
     * Updates the coloring on the inner chart
     * @param {sap.chart.Chart} oChart inner chart
     * @param {array} aVisibleDimensions visible dimensions for inner chart
     * @param {array} aVisibleMeasures visible measures for inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted Fiori Elements
     */
    ChartDelegate._updateColoring = function (oMDCChart, aVisibleDimensions, aVisibleMeasures) {
        var oTempColorings = jQuery.extend(true, {}, this._getState(oMDCChart).oColorings), k;

        if (oTempColorings && oTempColorings.Criticality) {
            var oActiveColoring;

            //dimensions overrule
            for (k = 0; k < aVisibleDimensions.length; k++) {

                if (this._getState(oMDCChart).oColorings.Criticality.DimensionValues[aVisibleDimensions[k]]) {
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
                this._getChart(oMDCChart).setColorings(oTempColorings);
                this._getChart(oMDCChart).setActiveColoring(oActiveColoring);
            }
        }
    };

    /**
     * Updates the semantical pattern for given measures
     *
     * @param {sap.chart.Chart} oChart the inner chart
     * @param {array} aVisibleMeasures array containing the visible measures on the inner chart
     * @param {*} mDataPoints data points of the inner chart
     *
     * @experimental
     * @private
     * @ui5-restricted Fiori Elements, sap.ui.mdc
     */
    ChartDelegate._updateSemanticalPattern = function (oMDCChart, aProperties) {

        var aVisibleMeasures = this._getChart(oMDCChart).getVisibleMeasures();

        aVisibleMeasures.forEach(function(sVisibleMeasureName){
            //first draft only with semantic pattern
            var oPropertyInfo = this.getPropertyFromNameAndKind(sVisibleMeasureName, "aggregatable", oMDCChart);

            if (!oPropertyInfo){
                return;
            }

            var oDataPoint = oPropertyInfo.datapoint;

            if (oDataPoint) {

                if (oDataPoint.targetValue || oDataPoint.foreCastValue) {
                    var oActualMeasure = this._getChart(oMDCChart).getMeasureByName(sVisibleMeasureName);

                    oActualMeasure.setSemantics("actual");

                    if (oDataPoint.targetValue != null) {
                        var oReferenceMeasure = this._getChart(oMDCChart).getMeasureByName(oDataPoint.targetValue);

                        if (oReferenceMeasure) {
                            oReferenceMeasure.setSemantics("reference");
                        } else {
                            Log.error("sap.ui.mdc.Chart: " + oDataPoint.targetValue + " is not a valid measure");
                        }
                    }

                    if (oDataPoint.foreCastValue) {
                        var oProjectionMeasure = this._getChart(oMDCChart).getMeasureByName(oDataPoint.foreCastValue);

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
     * Returns the current chart type
     * {
     *  icon : string,
     *  text: string
     * }
     *
     * @returns {object} information about the current chart type
     * @throws exception if inner chart is not yet ready
     */
    ChartDelegate.getChartTypeInfo = function (oMDCChart) {
        if (!this._getChart(oMDCChart)) {
            throw 'inner chart is not bound';
        }

        var sType = oMDCChart.getChartType(),
            oMDCResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");

        var mInfo = {
            icon: ChartTypeButton.mMatchingIcon[sType],
            text: oMDCResourceBundle.getText("chart.CHART_TYPE_TOOLTIP", [
                sType
            ])
        };

        return mInfo;
    };

    /**
     * Gets the available chart types for the current state of the inner chart
     *
     * @returns {array} Array containing the available chart types
     *
     * @experimental
     * @private
     * @ui5-restricted Fiori Elements
     */
    ChartDelegate.getAvailableChartTypes = function (oMDCChart) {
        var aChartTypes = [];

        if (this._getChart(oMDCChart)) {
            var aAvailableChartTypes = this._getChart(oMDCChart).getAvailableChartTypes().available;

            if (aChartTypes) {

                var oChartResourceBundle = Core.getLibraryResourceBundle("sap.chart.messages");

                for (var i = 0; i < aAvailableChartTypes.length; i++) {
                    var sType = aAvailableChartTypes[i].chart;
                    aChartTypes.push({
                        key: sType,
                        icon: ChartTypeButton.mMatchingIcon[sType],
                        text: oChartResourceBundle.getText("info/" + sType),
                        selected: (sType == oMDCChart.getChartType())
                    });
                }
            }
        }

        return aChartTypes;
    };

    //TODO: Check for setDrillStackInfo
    ChartDelegate.getDrillStackInfo = function () {

    };

    /**
     * Returns the current drill stack of the inner chart
     * The returned objects need at least a "label" and a "name" property
     * @returns {array} Array containing the drill stack
     */
    ChartDelegate.getDrillStack = function (oMDCChart) {
        //TODO: Generify the return values here for other chart frameworks
        var aDrillStack = [];
        aDrillStack = Object.assign(aDrillStack, this._getChart(oMDCChart).getDrillStack());

        aDrillStack.forEach(function(oStackEntry) {
			// loop over nested dimension arrays -> give them the correct name for filtering
			oStackEntry.dimension = oStackEntry.dimension.map(function(sDimension) {
                var oProp = this.getPropertyFromNameAndKind(sDimension, "groupable", oMDCChart);
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
     * This is used to determine possible drill-down dimensions in the drill down popover of the MDC Chart
     * @returns {Promise} Promsie containing an array of Dimensions in a sorted manner
     */
    ChartDelegate.getSortedDimensions = function (oMDCChart) {
        return new Promise(function (resolve, reject) {
            this.fetchProperties(oMDCChart).then(function (aProperties) {

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

                resolve(aDimensions);
            });
        }.bind(this));
    };

    /**
     * Determines which MDC Items are Drillable and returns them
     * Used by breadcrumbs
     *
     * @param {sap.ui.mdc.Chart} oMDCChart the MDC Chart to get the Items from
     * @returns {array} Array of MDC Items which are drillable
     *
     */
    ChartDelegate.getDrillableItems = function (oMDCChart) {
        var aFilteredItems = oMDCChart.getItems().filter(function (oItem) {
            return oItem.getType() === "groupable";
        });
        return aFilteredItems;
    };

    /**
     * Sets the chart type of the inner chart
     * Is called by MDC Chart when <code>chartType</code> property is updated
     * @param {string} sChartType the new chart type
     */
    ChartDelegate.setChartType = function (oMDCChart, sChartType) {
        this._getChart(oMDCChart).setChartType(sChartType);
    };

    /**
     * Creates the inner dataset for the inner chart
     */
    ChartDelegate.createInnerChartContent = function (oMDCChart, fnCallbackDataLoaded) {

        this._setChart(oMDCChart, new Chart({
            id: oMDCChart.getId() + "--innerChart",
            chartType: "column",
            width: "100%",
            isAnalytical: true//,
        }));

        //Initialize empty; will get filled later on
        this._getState(oMDCChart).inResultDimensions = [];

        if (oMDCChart.getHeight()){
            this._getChart(oMDCChart).setHeight(this._calculateInnerChartHeight(oMDCChart));
        }

        //Set height correctly again if chart changes
        ResizeHandler.register(oMDCChart, function(){
            this.adjustChartHeight(oMDCChart);
        }.bind(this));

        var oState = this._getState(oMDCChart);
        oState.aColMeasures = [];
        oState.aInSettings = [];
        this._setState(oMDCChart, oState);

        //Create initial content during pre-processing
        this._createContentFromItems(oMDCChart);

        //Since zoom information is not yet available for sap.chart.Chart after data load is complete, do it on renderComplete instead
        //This is a workaround which is hopefully not needed in other chart libraries
        this._getChart(oMDCChart).attachRenderComplete(function () {
            if (this._getState(oMDCChart).toolbarUpdateRequested){
                oMDCChart._updateToolbar();
                this._getState(oMDCChart).toolbarUpdateRequested = false;
            }
        }.bind(this));

        this._getInnerStructure(oMDCChart).removeAllItems();
        this._getInnerStructure(oMDCChart).setJustifyContent(FlexJustifyContent.Start);
        this._getInnerStructure(oMDCChart).setAlignItems(FlexAlignItems.Stretch);
        this._getInnerStructure(oMDCChart).addItem(this._getChart(oMDCChart));

        oState.dataLoadedCallback = fnCallbackDataLoaded;

        this._setState(oMDCChart, oState);
        var oBindingInfo = this._getBindingInfo(oMDCChart);
        this.updateBindingInfo(oMDCChart, oBindingInfo); //Applies filters
        this.rebind(oMDCChart, oBindingInfo);
    };

    ChartDelegate._calculateInnerChartHeight = function(oMDCChart) {
        var iTotalHeight = jQuery(oMDCChart.getDomRef()).height();
        var iToolbarHeight = 0;
        var oToolbar = oMDCChart.getAggregation("_toolbar");
        var iBreadcrumbsHeight = 0;
        var oBreadcrumbs = oMDCChart.getAggregation("_breadcrumbs");

        if (oToolbar){
            iToolbarHeight = jQuery(oToolbar.getDomRef()).outerHeight(true);
        }

        if (oBreadcrumbs){
            iBreadcrumbsHeight = jQuery(oBreadcrumbs.getDomRef()).outerHeight(true);
        }

        var iSubHeight = iBreadcrumbsHeight + iToolbarHeight;

        if (!iTotalHeight){
            return "480px";
        }

        return iTotalHeight - iSubHeight +  "px";
    };

    /**
     * Adjust chart height to changed content strucutre, if needed
     */
    ChartDelegate.adjustChartHeight = function(oMDCChart){
        if (oMDCChart.getHeight() && this._getChart(oMDCChart)){
            var sHeight = this._calculateInnerChartHeight(oMDCChart);

            this._getInnerStructure(oMDCChart).setHeight(sHeight);
            this._getChart(oMDCChart).setHeight(sHeight);
        }
    };

    ChartDelegate.requestToolbarUpdate = function(oMDCChart) {
        this._getState(oMDCChart).toolbarUpdateRequested = true;
    };

    ChartDelegate.createInnerDimension = function (oMDCChart, oMDCChartItem) {
        //TODO: Check for Hierachy and Time
        //TODO: Check for role annotation

        this.fetchProperties(oMDCChartItem.getParent()).then(function (aProperties) {

            //Uses MDC Chart Item ID to identify preoperty, not internal chart id
            var oPropertyInfo = aProperties.find(function (oCurrentPropertyInfo) {
                return oCurrentPropertyInfo.name === oMDCChartItem.getName();
            });

            this._addInnerDimension(oMDCChart, oMDCChartItem, oPropertyInfo);

        }.bind(this));

    };

    ChartDelegate.createInnerMeasure = function (oMDCChart, oMDCChartItem) {

        this.fetchProperties(oMDCChartItem.getParent()).then(function (aProperties) {

            //Uses MDC Chart Item ID to identify preoperty, not internal chart id
            var oPropertyInfo = aProperties.find(function (oCurrentPropertyInfo) {
                return oCurrentPropertyInfo.name === oMDCChartItem.getName();
            });

            this._addInnerMeasure(oMDCChart, oMDCChartItem, oPropertyInfo);

        }.bind(this));

    };

    /**
     * @private
     */
    ChartDelegate._addInnerDimension = function(oMDCChart, oMDCChartItem, oPropertyInfo) {
        var oDimension = new Dimension({
            name: this.getInternalChartNameFromPropertyNameAndKind(oMDCChartItem.getName(), "groupable", oMDCChart),
            role: oMDCChartItem.getRole() ? oMDCChartItem.getRole() : "category",
            label: oMDCChartItem.getLabel()
        });

        if (oPropertyInfo.textProperty){
            oDimension.setTextProperty(oPropertyInfo.textProperty);
            if (oPropertyInfo.textFormatter){
                oDimension.setTextFormatter(oPropertyInfo.textFormatter);
            }
            oDimension.setDisplayText(true);
        }

        this._getChart(oMDCChart).addDimension(oDimension);
    };

    /**
     * @private
     */
    ChartDelegate._addInnerMeasure = function(oMDCChart, oMDCChartItem, oPropertyInfo) {
        var aggregationMethod = oPropertyInfo.aggregationMethod;
        var propertyPath = oPropertyInfo.propertyPath;

        var oMeasureSettings = {
            name: this._getAggregatedMeasureNameForMDCItem(oMDCChartItem),//aggregationMethod + oItem.getName() under normal circumstances
            label: oMDCChartItem.getLabel(),
            role: oMDCChartItem.getRole() ? oMDCChartItem.getRole() : "axis1"
        };

        if (aggregationMethod && propertyPath) {
            oMeasureSettings.analyticalInfo = {
                propertyPath: propertyPath,
                "with": aggregationMethod
            };
        }


        var oMeasure = new Measure(oMeasureSettings);
        this._getChart(oMDCChart).addMeasure(oMeasure);
    };

    ChartDelegate._getAggregatedMeasureNameForProperty = function(oPoperty){
        return oPoperty.aggregationMethod + oPoperty.name;
    };

    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart The MDC chart instance
     * @param {object} oBindingInfo The bindingInfo of the chart
     * @deprecated as of 1.98; use rebind instead
     */
         ChartDelegate.rebindChart = function (oMDCChart, oBindingInfo) {
            this.rebind(oMDCChart, oBindingInfo);
        };

    /**
     * Checks the binding of the table and rebinds it if required.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart The MDC chart instance
     * @param {object} oBindingInfo The bindingInfo of the chart
     */
    ChartDelegate.rebind = function (oMDCChart, oBindingInfo) {
        if (oMDCChart && oBindingInfo && this._getChart(oMDCChart)) {
            //TODO: bindData sap.chart.Chart specific and therefore needs to be changed to a general API.
            this._addBindingListener(oBindingInfo, "dataReceived", this._getState(oMDCChart).dataLoadedCallback.bind(oMDCChart));

            //TODO: Clarify why sap.ui.model.odata.v4.ODataListBinding.destroy this.bHasAnalyticalInfo is false
            //TODO: on second call, as it leads to issues when changing layout options within the settings dialog.
            //TODO: bHasAnalyticalInfo of inner chart binding should be true and in fact is true initially.
            if (oBindingInfo.binding) {
                oBindingInfo.binding.bHasAnalyticalInfo = true;
            }


            this._getChart(oMDCChart).bindData(oBindingInfo);
            this._setBindingInfoForState(oMDCChart, oBindingInfo);
            var oState = this._getState(oMDCChart);
            oState.innerChartBound = true;
        }
    };

    ChartDelegate._getBindingInfo = function (oMDCChart) {

        if (this._getBindingInfoFromState(oMDCChart)) {
            return this._getBindingInfoFromState(oMDCChart);
        }

        var oMetadataInfo = oMDCChart.getDelegate().payload;
        var sEntitySetPath = "/" + oMetadataInfo.collectionName;
        var oBindingInfo = {
            path: sEntitySetPath
        };
        return oBindingInfo;
    };

    /**
     * Returns whether the inner chart is currently bound
     * @returns {bool} true if inner chart is bound; false if not
     */
    ChartDelegate.getInnerChartBound = function (oMDCChart) {
        var oState = this._getState(oMDCChart);

        if (!oState) {
            return false;
        }

        return oState.innerChartBound ? true : false;
    };

    /**
     * Updates the binding info with the relevant filters
     *
     * @param {Object} oMDCChart The MDC chart instance
     * @param {Object} oBindingInfo The binding info of the chart
     */
    ChartDelegate.updateBindingInfo = function (oMDCChart, oBindingInfo) {
        var oFilter = Core.byId(oMDCChart.getFilter());
        if (oFilter) {
            var mConditions = oFilter.getConditions();

            if (mConditions) {

                if (!oBindingInfo) {
                    oBindingInfo = {};
                }

                var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
                var aParameterNames = DelegateUtil.getParameterNames(oFilter);
                var oFilterInfo = FilterUtil.getFilterInfo(ChartDelegate.getTypeUtil(), mConditions, aPropertiesMetadata, aParameterNames);
                if (oFilterInfo) {
                    oBindingInfo.filters = oFilterInfo.filters;
                }

                var sParameterPath = DelegateUtil.getParametersInfo(oFilter);
                if (sParameterPath) {
                    oBindingInfo.path = sParameterPath;
                }
            }

            // get the basic search
            var sSearchText = oFilter.getSearch instanceof Function ? oFilter.getSearch() :  "";
            if (sSearchText) {

                if (!oBindingInfo) {
                    oBindingInfo = {};
                }

                if (!oBindingInfo.parameters) {
                    oBindingInfo.parameters = {};
                }
                // add basic search parameter as expected by v4.ODataListBinding
                oBindingInfo.parameters.$search = sSearchText;
            } else if (oBindingInfo.parameters && oBindingInfo.parameters.$search) {
                delete oBindingInfo.parameters.$search;
            }

        }
    };

    ChartDelegate._getAggregatedMeasureNameForMDCItem = function(oMDCItem){
        return this.getInternalChartNameFromPropertyNameAndKind(oMDCItem.getName(), "aggregatable", oMDCItem.getParent());
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
        return sName;
    };

    /**
     * This maps an id of an internal chart dimension/measure & kind of a property to its coresponding property entry.
     * @param {string} sName the id of internal chart measure/dimension
     * @param {string} sKind the kind of the property
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart
     * @returns {object} the property object
     */
    ChartDelegate.getPropertyFromNameAndKind = function(sName, sKind, oMDCChart) {
        return oMDCChart.getPropertyHelper().getProperty(sName);
    };

    /**
     * This returns the layout options for a specific type of Item (measure/dimension,groupable/aggregatable)
     * It is used by p13n to determine which layout options to show in the p13n panel
     * @param {string} sType the type for which the layout options are requested
     */
    ChartDelegate._getLayoutOptionsForType = function(sType){
        var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
		var oAvailableRoles = {
		    groupable: [
				{
					key: MDCLib.ChartItemRoleType.category,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY')
				}, {
					key: MDCLib.ChartItemRoleType.category2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_CATEGORY2')
				}, {
					key: MDCLib.ChartItemRoleType.series,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_SERIES')
				}
			],
			aggregatable: [
				{
					key: MDCLib.ChartItemRoleType.axis1,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS1')
				}, {
					key: MDCLib.ChartItemRoleType.axis2,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS2')
				}, {
					key: MDCLib.ChartItemRoleType.axis3,
					text: MDCRb.getText('chart.PERSONALIZATION_DIALOG_CHARTROLE_AXIS3')
				}
			]
		};
		return oAvailableRoles[sType];
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
     * Sets tooltips visible/invisible on inner chart
     * @param {bool}  bFlag true for visible, false for invisible
     */
    ChartDelegate.setChartTooltipVisibility = function (oMDCChart, bFlag) {

        if (this._getChart(oMDCChart)) {
            if (bFlag) {
                if (!this._getState(oMDCChart).vizTooltip) {

                    var oState = this._getState(oMDCChart);
                    oState.vizTooltip = new VizTooltip();
                    this._setState(oMDCChart, oState);
                }
                // Make this dynamic for setter calls
                //this._vizTooltip.connect(this._oInnerChart.getVizUid());
                this._getState(oMDCChart).vizTooltip.connect(this._getChart(oMDCChart).getVizUid());
            } else if (this._getState(oMDCChart).vizTooltip) {
                this._getState(oMDCChart).vizTooltip.destroy();
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
            var aNotLoadedModulePaths = ['sap/chart/library', 'sap/chart/Chart', 'sap/chart/data/Dimension', 'sap/chart/data/HierarchyDimension', 'sap/chart/data/TimeDimension', 'sap/chart/data/Measure', 'sap/viz/ui5/controls/VizTooltip'];

            function onModulesLoadedSuccess(fnChartLibrary, fnChart, fnDimension, fnHierarchyDimension, fnTimeDimension, fnMeasure, fnVizTooltip) {
                //ChartLibrary = fnChartLibrary;
                Chart = fnChart;
                Dimension = fnDimension;
                //HierarchyDimension = fnHierarchyDimension;
                //TimeDimension = fnTimeDimension;
                Measure = fnMeasure;
                VizTooltip = fnVizTooltip;

                resolve();
            }

            sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
        });

    };

    /**
     * Initializes a new table property helper for V4 analytics with the property extensions merged into the property infos.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart
     * @returns {Promise<sap.ui.mdc.table.V4AnalyticsPropertyHelper>} A promise that resolves with the property helper.
     * @private
     * @ui5-restricted sap.ui.mdc
     */
    ChartDelegate.initPropertyHelper = function (oMDCChart) {
        // TODO: Do this in the DelegateMixin, or provide a function in the base delegate to merge properties and extensions
        return Promise.all([
            this.fetchProperties(oMDCChart),
            loadModules("sap/ui/mdc/odata/v4/ChartPropertyHelper")
        ]).then(function (aResult) {
            return Promise.all(aResult.concat(this.fetchPropertyExtensions(oMDCChart, aResult[0])));
        }.bind(this)).then(function (aResult) {
            var aProperties = aResult[0];
            var PropertyHelper = aResult[1][0];
            var mExtensions = aResult[2];
            var iMatchingExtensions = 0;
            var aPropertiesWithExtension = [];

            for (var i = 0; i < aProperties.length; i++) {
                aPropertiesWithExtension.push(Object.assign({}, aProperties[i], {
                    extension: mExtensions[aProperties[i].name] || {}
                }));

                if (aProperties[i].name in mExtensions) {
                    iMatchingExtensions++;
                }
            }

            if (iMatchingExtensions !== Object.keys(mExtensions).length) {
                throw new Error("At least one property extension does not point to an existing property");
            }

            return new PropertyHelper(aPropertiesWithExtension, oMDCChart);
        });
    };
    /**
     * Returns the relevant propery infos based on the metadata used with the MDC Chart instance.
     *
     * @param {sap.ui.mdc.Chart} oMDCChart reference to the MDC Chart
     * @returns {array} Array of the property infos to be used within MDC Chart
     */
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

                    //TODO: Check what we want to do with properties neither aggregatable nor groupable
                    //Right now: skip them, since we can't create a chart from it
                    if (!oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"] && !oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {
                        continue;
                    }

                    if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"]){
                        aProperties = aProperties.concat(this._createPropertyInfosForAggregatable(sKey, oPropertyAnnotations, oFilterRestrictionsInfo, oSortRestrictionsInfo));
                    }

                    if (oPropertyAnnotations["@Org.OData.Aggregation.V1.Groupable"]) {

                        aProperties.push({
                            name: sKey,
                            propertyPath: sKey,
                            label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sKey,
                            sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
                            filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
                            groupable: true,
                            aggregatable: false,
                            maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
                            sortKey: sKey,
                            kind:  "Groupable", //TODO: Rename in type; Only needed for P13n Item Panel
                            availableRoles: this._getLayoutOptionsForType("groupable"), //for p13n
                            role: MDCLib.ChartItemRoleType.category, //standard, normally this should be interpreted from UI.Chart annotation
                            criticality: null ,//To be implemented by FE
                            textProperty: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] ? oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path  : null //To be implemented by FE
                            //textFormatter: function(){} -> can be used to provide a custom formatter for the textProperty
                        });
                    }
                }
            }
            return aProperties;
        }.bind(this));
    };

    ChartDelegate._createPropertyInfosForAggregatable = function(sKey, oPropertyAnnotations, oFilterRestrictionsInfo, oSortRestrictionsInfo) {
        var aProperties = [];

        if (oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"]){
            oPropertyAnnotations["@Org.OData.Aggregation.V1.SupportedAggregationMethods"].forEach(function(sAggregationMethod){
                aProperties.push({
                    name: sAggregationMethod + sKey,
                    propertyPath: sKey,
                    label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] + " (" + sAggregationMethod + ")" || sKey + " (" + sAggregationMethod + ")" ,
                    sortable: oSortRestrictionsInfo[sKey] ? oSortRestrictionsInfo[sKey].sortable : true,
                    filterable: oFilterRestrictionsInfo[sKey] ? oFilterRestrictionsInfo[sKey].filterable : true,
                    groupable: false,
                    aggregatable: oPropertyAnnotations["@Org.OData.Aggregation.V1.Aggregatable"],
                    aggregationMethod: sAggregationMethod,
                    maxConditions: ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[sKey]) ? -1 : 1,
                    sortKey: oPropertyAnnotations["@Org.OData.Aggregation.V1.RecommendedAggregationMethod"] + sKey,
                    kind: "Aggregatable",//Only needed for P13n Item Panel
                    availableRoles: this._getLayoutOptionsForType("aggregatable"), //for p13n
                    role: MDCLib.ChartItemRoleType.axis1,
                    datapoint: null //To be implemented by FE
                });
            }.bind(this));
        }

        return aProperties;
    };

    //Gets internal property infos by excact property name
    ChartDelegate._getPropertyInfosByName = function(sName, oMDCChart){
        return new Promise(function(resolve){
            this.fetchProperties(oMDCChart).then(function(aProperties){
                var oPropertyInfo = aProperties.find(function (oCurrentPropertyInfo) {
                    return oCurrentPropertyInfo.name === sName;
                });

                resolve(oPropertyInfo);
            });
        }.bind(this));
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

    /*
    ChartDelegate._onDataLoadComplete = function (mEventParams) {
        if (mEventParams.mParameters.reason === "change" && !mEventParams.mParameters.detailedReason) {
            this._fnDataLoadedCallback.call();
        }
    };*/

    return ChartDelegate;
});