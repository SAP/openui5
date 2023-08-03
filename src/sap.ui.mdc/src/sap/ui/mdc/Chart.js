/*!
 * ${copyright}
 */

sap.ui.define([
        "sap/ui/core/Core",
        "sap/ui/mdc/Control",
        "./ChartRenderer",
        "sap/base/Log",
        "./chart/ChartToolbar",
        "./chart/PropertyHelper",
        "sap/ui/mdc/mixin/FilterIntegrationMixin",
        "sap/ui/model/base/ManagedObjectModel",
        "sap/ui/mdc/p13n/subcontroller/ChartItemController",
        "sap/ui/mdc/p13n/subcontroller/FilterController",
        "sap/ui/mdc/p13n/subcontroller/SortController",
        "sap/ui/mdc/p13n/subcontroller/ChartTypeController",
        "sap/ui/base/ManagedObjectObserver",
        "sap/ui/mdc/chart/DrillBreadcrumbs",
        "sap/ui/mdc/actiontoolbar/ActionToolbarAction",
        "sap/ui/core/library",
        "sap/ui/events/KeyCodes",
        "sap/ui/mdc/util/InfoBar",
        "sap/ui/core/format/ListFormat",
        "sap/ui/mdc/enums/ProcessingStrategy",
        "sap/ui/mdc/enums/ChartP13nMode"
    ],
    function (
        Core,
        Control,
        ChartRenderer,
        Log,
        ChartToolbar,
        PropertyHelper,
        FilterIntegrationMixin,
        ManagedObjectModel,
        ChartItemController,
        FilterController,
        SortController,
        ChartTypeController,
        ManagedObjectObserver,
        Breadcrumbs,
        ActionToolbarAction,
        coreLibrary,
        KeyCodes,
        InfoBar,
        ListFormat,
        ProcessingStrategy,
        ChartP13nMode
    ) {
        "use strict";

        var DrillStackHandler;
        var TitleLevel = coreLibrary.TitleLevel;

        /**
         * Constructor for a new Chart.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no id is given
         * @param {object} [mSettings] Initial settings for the new control
         *
         * @class The <code>Chart</code> control creates a chart based on metadata and the configuration specified.<br>
         * <b>Note:</b> The inner chart needs to be assigned <code>ChartDelegate</code>.
         * @extends sap.ui.mdc.Control
         * @author SAP SE
         * @version ${version}
         * @constructor
         *
         * @public
         *
         * @since 1.88
         * @alias sap.ui.mdc.Chart
         * @experimental As of version 1.88
         */
        var Chart = Control.extend("sap.ui.mdc.Chart", /** @lends sap.ui.mdc.Chart.prototype */ {
            metadata: {
                library: "sap.ui.mdc",
                designtime: "sap/ui/mdc/designtime/chart/Chart.designtime",
                interfaces: [
                    "sap.ui.mdc.IFilterSource",
                    "sap.ui.mdc.IxState"
                ],
                defaultAggregation: "items",
                properties: {

                    /**
					 * Defines the width of the chart.
					 */
					width: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%",
						invalidate: true
					},

					/**
					 * Defines the height of the chart.
					 */
					height: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "100%",
						invalidate: true
					},

                    /**
                     * Defines the module path of the metadata delegate.
                     */
                    delegate: {
                        type: "object",
                        group: "Data",
                        defaultValue: {
                            name: "sap/ui/mdc/ChartDelegate"
                        }
                    },

                    /**
                     * Specifies header text that is shown in the chart.
                     */
                    header: {
                        type: "string",
                        group: "Misc",
                        defaultValue: null
                    },

                    /**
                     * Defines the no data text shown in the chart.
                     * @since 1.88
                     */
                    noDataText: {
                        type: "string",
                        defaultValue: "No data"
                    },

                    /**
                     * Specifies the personalization options available for the chart.<br>
                     * <b>Note:</b> The order of the provided options does not influence the arrangement of the icons on the UI.
                     *
                     * @since 1.88
                     */
                    p13nMode: {
                        type: "sap.ui.mdc.enums.ChartP13nMode[]",
                        defaultValue: []
                    },

                    /**
                     * Enables the legend of the chart.
                     * <b>Note:</b> The setter calls <code>setLegendVisible</code> of the delegate class.
                     *
                     * @since 1.88
                     */
                    legendVisible: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },

                    /**
                     * Specifies which actions must not be available in the chart's toolbar.
                     *
                     * @since 1.88
                     */
                    ignoreToolbarActions: {
                        type: "sap.ui.mdc.enums.ChartToolbarActionType[]",
                        defaultValue: []
                    },

                    //TODO: Do we really need this? Should be avoided.
                    /**
                     * Defines the minimum width.
                     */
                    minWidth: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "240px",
                        invalidate: true
                    },

                    //TODO: Do we really need this? Should be avoided.
                    /**
                     * Defines the minimum height.
                     */
                    minHeight: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "400px",
                        invalidate: true
                    },

                    /**
                     * Defines the sort conditions.<br>
                     *
                     * <b>Note:</b> This property is exclusively used for handling SAPUI5 flexibility changes. Do not use it for anything else.
                     *
                     * @since 1.88
                     */
                    sortConditions: {
                        type: "object"
                    },

                    /**
                     * Defines the filter conditions.<br>
				     * <b>Note:</b> This property must not be bound.<br>
                     * <b>Note:</b> This property is exclusively used for handling SAPUI5 flexibility changes. Do not use it for anything else.
                     *
                     * @since 1.99
                     */
                    filterConditions: {
                        type: "object",
                        defaultValue: {}
                    },

                    /**
                     * Controls the visibility of the chart tooltip. If set to <code>true</code>, a call of the <code>delegate.setChartTooltipVisibility</code> will be triggered and can be used to make the <code>Chart</code> tooltip visible.
                     *
                     * @since 1.88
                     */
                    showChartTooltip: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },

                    /**
                     * If set to <code>true</code>, the chart is automatically bound after initialization.<br>
                     * If set to <code>false</code>, the chart is bound after the first call to <code>rebind</code>.
                     */
                    autoBindOnInit: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },

                    /**
                     * Specifies the type of chart to be created by the <code>Chart</code> control.
                     */
                    chartType: {
                        type: "string",
                        group: "Misc",
                        defaultValue: "column"
                    },

                    /**
                     * Enables the Details button in the chart toolbar.
                     */
                    showSelectionDetails: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },

                    /**
                     * Specifies the chart metadata.<br>
                     * <b>Note:</b> This property must not be bound.<br>
                     * <b>Note:</b> This property is exclusively used for handling SAPUI5 flexibility changes. Do not use it otherwise.<br>
                     *
                     * <b>Note</b>: For more information about the supported inner elements, see {@link sap.ui.mdc.chart.PropertyInfo PropertyInfo}.
                     *
                     * @since 1.99
                     */
                    propertyInfo: {
                        type: "object", //TODO this should be an object[], but when I change this the TwFb does not start
                        defaultValue: []
                    },

                    /**
                    * Semantic level of the header.<br>
                    * For more information, see {@link sap.m.Title#setLevel}.
                    *
                    * @since 1.104
                    */
                    headerLevel: {
                        type: "sap.ui.core.TitleLevel",
                        group: "Appearance",
                        defaultValue: TitleLevel.Auto
                    },

                    /**
                     * Determines whether the header text is shown in the chart. Regardless of its value, the given header text is used to label the chart
                     * correctly for accessibility purposes.
                     *
                     * @since 1.111
                     */
                    headerVisible : {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    }
                },
                aggregations: {
                    /**
                     * This property describes the measures and dimensions visible in the chart.
                     * Changes in the personalization are also reflected here.
                     */
                    items: {
                        type: "sap.ui.mdc.chart.Item",
                        multiple: true
                    },
                    /**
                     * This aggregation describes actions that are added to the chart toolbar.<br>
                     * For more information, see {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction}.
                     */
                    actions: {
                        type: "sap.ui.core.Control",
                        multiple: true,
                        forwarding: {
                            getter: "_getToolbar",
                            aggregation: "actions"
                        }
                    },
                    /**
                     * Feeds details actions for data point selection in the mdc chart.<br>
                     * For more information, see {@link sap.ui.mdc.chart.SelectionDetailsActions SelectionDetailsActions}.
                     */
                    selectionDetailsActions: {
                        type: "sap.ui.mdc.chart.SelectionDetailsActions",
                        multiple: false
                    },
                    _toolbar: {
                        type: "sap.ui.mdc.chart.ChartToolbar",
                        multiple: false,
                        visibility: "hidden"
                    },
                    _breadcrumbs: {
                        type: "sap.m.Breadcrumbs",
                        multiple: false,
                        visibility: "hidden"
                    },
                    _innerChart: {
                        type: "sap.ui.core.Control",
                        multiple: false,
                        visibility: "hidden"
                    },
                    _infoToolbar: {
                        type: "sap.ui.mdc.util.InfoBar",
                        multiple: false,
                        visibility: "hidden"
                    },
                    /**
                     * Reference to a {@link sap.ui.fl.variants.VariantManagement} control for the chart.
                     */
                    variant: {
                        type: "sap.ui.fl.variants.VariantManagement",
                        multiple: false
                    },
                    /**
                     * Defines the custom visualization if there is no data available.<br>
                     * This control will be displayed on top of the chart when no data is visible inside the chart.<br>
                     * <b>Note:</b> If both a <code>noDataText</code> property and a <code>noData</code> aggregation are provided, the <code>noData</code> aggregation takes priority.<br>
                     * If the <code>noData</code> aggregation is undefined or set to null, the <code>noDataText</code> property is used instead.
                     *
                     * @since 1.107
                     */
                    noData: {
                        type: "sap.ui.core.Control",
                        multiple: false
                    }
                },
                associations: {
                    /**
                     * Control or object that enables the chart to do filtering, such as {@link sap.ui.mdc.FilterBar}.
                     * Also see {@link sap.ui.mdc.IFilter}.
                     *
                     * @since 1.88
                     */
                    filter: {
                        type: "sap.ui.mdc.IFilter",
                        multiple: false
                    }
                },
                events: {
                    /**
                     * This event is fired when a <code>SelectionDetailsAction</code> is pressed.
                     */
                    selectionDetailsActionPressed: {
                        parameters: {

                            /**
                             * The action that has to be processed once the action has been pressed
                             */
                            action: {
                                type: "sap.ui.core.Item"
                            },

                            /**
                             * If the action is pressed on one of the {@link sap.m.SelectionDetailsItem items}, the parameter contains the
                             * {@link sap.ui.model.Context context} of the pressed {@link sap.m.SelectionDetailsItem item}. If a custom action or action
                             * group of the <code>SelectionDetails</code> popover is pressed, this parameter contains all {@link sap.ui.model.Context contexts} of the
                             * {@link sap.m.SelectionDetailsItem items}.
                             */
                            itemContexts: {
                                type: "sap.ui.model.Context"
                            },

                            /**
                             * The action level of action buttons. The available levels are Item, List and Group
                             */
                            level: {
                                type: "sap.m.SelectionDetailsActionLevel"
                            }
                        }
                    }
                }
            },

            renderer: ChartRenderer
        });

        var MDCRb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");

        FilterIntegrationMixin.call(Chart.prototype);

	/**
	 * An object literal describing a data property in the context of a {@link sap.ui.mdc.Chart}.
	 *
	 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Chart#getPropertyInfo propertyInfo} property, the following
	 * attributes need to be specified:
	 * <ul>
	 *   <li><code>label</code></li>
	 *   <li><code>propertyPath</code></li>
	 * </ul>
	 *
	 * @typedef {object} sap.ui.mdc.chart.PropertyInfo
	 * @property {string} propertyPath
	 *   The path to the property in the back end
	 * @property {string} [name]
	 *   The identifier of the property
	 * @property {string} label
	 *   The label of the identifier
	 * @property {string} [tooltip]
	 *   The tooltip of the identifier
	 * @property {string} datatype
	 *   The name of the data type of the property
	 * @property {object} [constraints]
	 *   Defines constraints for the data type of the property
	 * @property {object} [formatOptions]
	 *   Defines formatting options for the data type of the property
	 * @property {boolean} [required = false]
	 *   Defines if the filter is mandatory
	 * @property {int} maxConditions
	 *   Defines if the filter supports multiple values <code>-1</code> or single values <code>1</code>
	 * @property {boolean} groupable
	 * 	Defines whether the property is groupable and is selectable as a dimension in the chart
	 * @property {boolean} aggregatable
	 *  Defines whether the property is aggregatable and is selectable as a measure in the chart
	 * @property {string} aggregationMethod
	 * 	The aggregation method used if the property is aggregatable
	 * @property {string} role
	 * 	Defines the role that the property visualizes inside the chart
	 * @property {object} [datapoint]
	 * 	Implementation-specific object containing information about the data point
	 * @property {object} [criticality]
	 *  Implementation-specific object containing information about the criticality
	 * @property {string} [textProperty]
	 * 	The text property used for the dimension
	 *
	 * @public
	 */


        /**
         * Initialises the MDC Chart
         *
         * @private
         */
        Chart.prototype.init = function () {
            this._oManagedObjectModel = new ManagedObjectModel(this);
            this.setModel(this._oManagedObjectModel, "$mdcChart");
            Control.prototype.init.apply(this, arguments);

            this._setupPropertyInfoStore("propertyInfo");
            this._setPropertyHelperClass(PropertyHelper);
        };

        Chart.prototype.setP13nMode = function(aModes) {
            var aSortedKeys = null;
            if (aModes && aModes.length >= 1){
                aSortedKeys = [];
                var mKeys = aModes.reduce(function(mMap, sKey, iIndex){
                    mMap[sKey] = true;
                    return mMap;
                }, {});

                //as the p13nMode has no strict order we need to ensure the order of tabs here
                if (mKeys.Item) {
                    aSortedKeys.push(ChartP13nMode.Item);
                }
                if (mKeys.Sort) {
                    aSortedKeys.push(ChartP13nMode.Sort);
                }
                if (mKeys.Filter) {
                    aSortedKeys.push(ChartP13nMode.Filter);
                }
                if (mKeys.Type) {
                    this._typeBtnActive = true;
                    aSortedKeys.push(ChartP13nMode.Type);
                } else {
                    this._typeBtnActive = false;
                }
            } else {
                aSortedKeys = aModes;
            }

            this.setProperty("p13nMode", aSortedKeys, true);

            this._updateAdaptation(this.getP13nMode());

            return this;
        };

        Chart.prototype._updateAdaptation = function(aMode) {
            var oRegisterConfig = {
                controller: {}
            };

            var mRegistryOptions = {
                Item: new ChartItemController({control: this}),
                Sort: new SortController({control: this}),
                Filter: new FilterController({control: this}),
                Type: new ChartTypeController({control: this})
            };

            if (aMode && aMode.length > 0) {
                aMode.forEach(function(sMode){
                    var sKey = sMode;
                    var oController = mRegistryOptions[sMode];
                    if (oController) {
                        oRegisterConfig.controller[sKey] = oController;
                    }
                });

                this.getEngine().register(this, oRegisterConfig);
            }

        };

        Chart.prototype.setFilterConditions = function(mConditions) {
            this.setProperty("filterConditions", mConditions, true);

            var oP13nFilter = this.getInbuiltFilter();
            if (oP13nFilter) {
                oP13nFilter.setFilterConditions(mConditions);
            }

            this._updateInfoToolbar();

            return this;
        };

        /**
         * Getter for <code>Conditions</code> set in the personalization settings.
         * @returns {object} Filters set in the chart
         *
         * @public
         */
        // Part of sap.ui.mdc.IFilterSource
        Chart.prototype.getConditions = function() {
            //may only return conditions if the inner FilterBar has already been initialized
            return this.getInbuiltFilter() ? this.getInbuiltFilter().getConditions() : [];
        };

        Chart.prototype._registerInnerFilter = function(oFilter) {
            oFilter.attachSearch(function() {
                this._rebind();
            }, this);
        };

        /**
         * Applies given settings onto the MDC chart, loads the delegate and initializes the MDC chart
         *
         * @param {*} mSettings settings to apply
         *
         * @private
         */
        Chart.prototype.applySettings = function (mSettings, oScope) {
            this._setPropertyHelperClass(PropertyHelper);
            Control.prototype.applySettings.apply(this, arguments);

            this.initializedPromise = new Promise(function (resolve, reject) {
                this._fnResolveInitialized = resolve;
                this._fnRejectInitialized = reject;
            }.bind(this));

            this.innerChartBoundPromise = new Promise(function (resolve, reject) {
                this._fnResolveInnerChartBound = resolve;
                this._fnRejectInnerChartBound = reject;
            }.bind(this));

            var pLoadDelegate = this.initControlDelegate();

            var aInitPromises = [ pLoadDelegate ];

            if (this.isFilteringEnabled()) {
                aInitPromises.push(this.retrieveInbuiltFilter());
            }

            //TODO: Refactor this so we use awaitPropertyHelper
            Promise.all(aInitPromises).then(function(){
                if (!this.isDestroyed()) {
                    this._initInnerControls();
                }
            }.bind(this));

        };

        /**
         * Initializes the inner controls of the MDC chart (toolbar, inner chart)
         * Inner chart is initialized via the delegate
         */
        Chart.prototype._initInnerControls = function () {

            this.getControlDelegate().initializeInnerChart(this).then(function (oInnerChart) {

                this.setBusyIndicatorDelay(0);

                this.getControlDelegate().createInitialChartContent(this);
                this._renderOverlay(true);

                if (this.getAutoBindOnInit()) {
                    this.setBusy(true);
                    this._createContentfromPropertyInfos(oInnerChart);
                }

                this.setAggregation("_innerChart", oInnerChart);

                if (this.getP13nMode().includes("Filter")){
                    this._initInfoToolbar();
                }

                this._bInnerChartReady = true;
                this._fnResolveInitialized();
                this.invalidate();

            }.bind(this)).catch(function (error) {
                this._fnRejectInitialized(error);
            }.bind(this));

            //independent from fetchProperties
            this._getToolbar().createToolbarContent(this);
        };

        Chart.prototype._initInfoToolbar = function() {
            this.setAggregation("_infoToolbar", new InfoBar(this.getId() + "--infoToolbar", {
                infoText: this._getFilterInfoText(),
                press: function() {
                    this.finalizePropertyHelper().then(function(){
                       return this.getEngine().show(this, "Filter");
                    }.bind(this)).then(function(oP13nDialog) {

                        oP13nDialog.attachEventOnce("afterClose", function() {

                            var aConditions = this.getFilterConditions();
                            var bNoConditions = !Object.keys(aConditions).find(function(oKey) {
                                return aConditions[oKey] && aConditions[oKey].length > 0;
                            });

                            if (bNoConditions && this.getAggregation("_toolbar")) {
                                this.getAggregation("_toolbar").getSettingsButton().focus();
                            }

                        }.bind(this));
                    }.bind(this));
                }.bind(this),
                removeAllFilters: function(oEvent) {
                    //this will only reset to the last variant and not clear all filters. this.getEngine().reset(this, ["Filter"]);
                    this.getEngine().createChanges({
                        control: this,
                        key: "Filter",
                        state: {},
                        applyAbsolute: ProcessingStrategy.FullReplace
                    });
                    //Focus handling, setting the focus back tothe settoing button
                    this._getToolbar().getSettingsButton().focus();
                }.bind(this)
            }));

            if (this.getDomRef()) {
                this.getDomRef().setAttribute("aria-labelledby", this.getAggregation("_infoToolbar").getACCTextId());
            }
        };

        Chart.prototype._updateInfoToolbar = function() {
            if (this.getP13nMode().includes("Filter") && this.getAggregation("_infoToolbar")){
                this.getAggregation("_infoToolbar").setInfoText(this._getFilterInfoText());
            }
        };

        Chart.prototype._getFilterInfoText = function() {
            if (this.getInbuiltFilter()) {
                var sText;
                var aFilterNames = this._getLabelsFromFilterConditions();
                var oListFormat = ListFormat.getInstance();

                if (aFilterNames.length > 0) {

                    if (aFilterNames.length > 1) {
                        sText = MDCRb.getText("chart.MULTIPLE_FILTERS_ACTIVE", [aFilterNames.length, oListFormat.format(aFilterNames)]);
                    } else {
                        sText = MDCRb.getText("chart.ONE_FILTER_ACTIVE", aFilterNames[0]);
                    }
                }

                return sText;
            }

            return undefined;
        };

        /**
         * Creates the content for the inner chart from properties.
         * The properties are given via the PropertyHelper which is initialized here.
         * The rest of the creation of the content for the inner chart is done in the delegate.
         * Also creates the breadcrumbs.
         *
         * Is called during init when autoBindOnInit = "true", if "false" then this is called by _rebind()
         */
        Chart.prototype._createContentfromPropertyInfos = function (oInnerChart) {

            //Make sure all MDC Items have the necessary information to create a chart
            this.getControlDelegate().checkAndUpdateMDCItems(this).then(function(){
                //Create content on inner chart instance
                this.getControlDelegate().createInnerChartContent(this, this._innerChartDataLoadComplete.bind(this)).then(function(){
                    this._createBreadcrumbs();
                    //From now on, listen to changes on Items Aggregation and sync them with inner chart
                    this._oObserver = new ManagedObjectObserver(this._propagateItemChangeToInnerChart.bind(this));
                    this._oObserver.observe(this, {
                        aggregations: [
                            "items"
                        ]
                    });

                    //Sync MDC chart properties with inner chart
                    this._propagatePropertiesToInnerChart();

                    this._fnResolveInnerChartBound();
                }.bind(this));
            }.bind(this));
        };

        Chart.prototype._createBreadcrumbs = function () {
            if (!this._oBreadcrumbs && !this._bIsDestroyed) {
                this._oBreadcrumbs = new Breadcrumbs(this.getId() + "--breadcrumbs");
                this._oBreadcrumbs.updateDrillBreadcrumbs(this, this.getControlDelegate().getDrillableItems(this));
                this.setAggregation("_breadcrumbs", this._oBreadcrumbs);
            }
        };

        /**
         * Loads the delegate for the MDC chart
         * @returns {Promise} resolved when delegate is loaded
         */
        Chart.prototype._loadDelegate = function () {

            return new Promise(function (resolve) {
                var aNotLoadedModulePaths = [this.getDelegate().name];

                function onModulesLoadedSuccess(oDelegate) {
                    resolve(oDelegate);
                }

                sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
            }.bind(this));

        };
        /**
         * Gets whether filtering is enabled in the personalization dialog.
         * @returns {boolean} <code>true</code> if filtering enabled, <code>false</code> if otherwise
         *
         * @private
         */
        Chart.prototype.isFilteringEnabled = function () {
            return this.getP13nMode().indexOf("Filter") > -1;
        };

        /**
         * Gets the adaptation panel for the p13n dialog.
         * <b>Note:</b> This is only used for  personalization, do not use it otherwise.
         * @returns {Promise} <code>Promise</code> that resolves with the adaptation panel control
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.getAdaptationUI = function () {
            return this.getControlDelegate().getAdaptionUI(this);
        };

        /**
         * Propagates a change on the "item" aggregation to the inner chart via the delegate
         * The delegate must then update the inner chart accordingly
         *
         * @param {object} oChange the change object from the ManagedObjectModel observer
         */
        Chart.prototype._propagateItemChangeToInnerChart = function (oChange) {

            if (this._bIsDestroyed){
                return; //Don't propagate changes when CHart is destroyed
            }

            this.setBusy(true);
            switch (oChange.mutation) {

                case "insert":
                    var iIndex;

                    if (oChange.child && oChange.child.getType()) {
                        iIndex = this.getItems().filter(function(oItem){return oItem.getType() === oChange.child.getType();}).indexOf(oChange.child);
                    } else {
                        iIndex = this.getItems().indexOf(oChange.child);
                    }

                    this.getControlDelegate().insertItemToInnerChart(this, oChange.child, iIndex);
                    break;
                case "remove":
                    this.getControlDelegate().removeItemFromInnerChart(this, oChange.child);
                    break;
                default:
                    Log.error("Unknown mutation on MDC Chart Item Aggregation. This will not sync to inner chart!");
                    break;
            }

            //Needed to apply current sorters when sorted measure/dimension was not selected yet
            //However, since this gets called multiple times when the aggregation adds/removes multiple properties, the binding seems to break
            this._rebind();

            //Update the breadcrumbs after an MDC Item change
            this._oBreadcrumbs.updateDrillBreadcrumbs(this, this.getControlDelegate().getDrillableItems(this));
        };

        /**
         * Rebinds the inner chart instance by calling oDelegate.rebind
		 *
		 * @param {boolean} [bForceRefresh] Indicates that the binding must be refreshed regardless of any <code>bindingInfo</code> change
		 * @private
		 */
        Chart.prototype._rebind = function (bForceRefresh) {

            if (!this._bInnerChartReady) {
                //TODO: This can lead to a race conditition when the "Go" button is pressed while the inner chart still intializes
                //TODO: Check whether we really need this since we insantiate the inner chart right away
                //this._initInnerControls();

                //Wait with rebind until inner chart is ready
                this.initialized().then(function () {
                    this._rebind(bForceRefresh);
                }.bind(this));
                return;
            }

            this.setBusy(true);

            if (!this.getControlDelegate().getInnerChartBound(this)) {
                this._createContentfromPropertyInfos();
                return;
            }

            var oChartDelegate = this.getControlDelegate();
            var oBindingInfo;
            if (oChartDelegate._getBindingInfo) {
                oBindingInfo = oChartDelegate._getBindingInfo(this);
                Log.warning("mdc Chart", "calling the private delegate._getBindingInfo. Please make the function public!");
            } else {
                oBindingInfo = oChartDelegate.getBindingInfo(this);
            }
            oChartDelegate.updateBindingInfo(this, oBindingInfo); //Applies filters
            oChartDelegate.rebind(this, oBindingInfo);
        };

        /**
         * Creates a new instance of ChartToolbar
         *
         * @private
         */
        Chart.prototype._getToolbar = function () {
            if (this.getAggregation("_toolbar")) {
                return this.getAggregation("_toolbar");
            } else if (!this._bIsDestroyed){
                var oToolbar = new ChartToolbar(this.getId() + "--toolbar", {
                    design: "Transparent"
                });

                this.setAggregation("_toolbar", oToolbar);
                return oToolbar;
            }
        };

        /**
         * Calls the update function on the toolbar, if toolbar exists
         *
         * @private
         */
        Chart.prototype._updateToolbar = function () {
            if (this.getAggregation("_toolbar")) {
                this.getAggregation("_toolbar").updateToolbar(this);
            } else {
                Log.warning("Trying to uipdate Chart Toolbar, but toolbar is not yet initialized. This will not work!");
            }
        };

        /**
         * Returns the instance of the inner chart from the delegate
         * @returns {sap.core.Control} the instance of the inner chart
         *
         * @private
         */
        Chart.prototype._getInnerChart = function () {
            if (this._bInnerChartReady) {
                return this.getControlDelegate().getInnerChart(this);
            } else {
                Log.error("Trying to acces inner chart while inner chart is not yet initialized!");
            }
        };

        /**
         * Checks whether the chart is initialized.
         * After initialization the delegate is loaded and (in case of <code>autoBindOnInit=true</code>) the inner chart is created.
         * The inner chart is not bound yet. Use <code>innerChartBound</code> for it.
         * @returns {Promise} <code>Promise</code> that resolves once MDC chart is initialized. Contains reference to MDC chart
         *
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.initialized = function () {
            return this.initializedPromise;
        };

        /**
         * Can be used to check whether the inner chart is initialized and bound.
         * @returns {Promise} Promise that resolves once MDC chart is bound
         *
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.innerChartBound = function () {
            return this.innerChartBoundPromise;
        };

        /**
         * Zooms in the inner chart.
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.zoomIn = function () {
            this.getControlDelegate().zoomIn(this);
        };

        /**
         * Zooms out the inner chart.
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.zoomOut = function () {
            this.getControlDelegate().zoomOut(this);
        };

        /**
         * Returns the current zoom information as an object
         * {
         *   "enabled":true,
         *   "currentZoomLevel":0.16
         * }
         *
         * @returns {Object} current Zoom Information
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.getZoomState = function () {
            return this.getControlDelegate().getZoomState(this);
        };

        /**
         * Retrieves the selection handler of the inner chart.
         * @returns {object} Selection handler of the inner chart
         *
         * @public
         */
        Chart.prototype.getSelectionHandler = function () {
            return this.getControlDelegate().getInnerChartSelectionHandler(this);
        };

        /**
         * Retrieves the chart type layout configuration.
         * <b>Note:</b> This is only used inside personalization.
         *
         * @returns {object} Layout configuration
         *
         * @public
         */
        Chart.prototype.getChartTypeLayoutConfig = function() {
            return this.getControlDelegate().getChartTypeLayoutConfig();
        };

        /**
         * Retrieves the allowed chart roles for the chart types.
         * <b>Note:</b> This is only used inside the personalization.
         *
         * @returns {object} Allowed roles
         *
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        //TODO is this function used?
        Chart.prototype.getAllowedRolesForKinds = function() {
            return this.getControlDelegate().getAllowedRolesForKinds();
        };

        Chart.prototype.setLegendVisible = function (bVisible) {
            this.setProperty("legendVisible", bVisible);

            //Skip if no control delegate; gets propagated by _propagatePropertiesToInnerChart after init
            try {
                this.getControlDelegate().setLegendVisible(this, bVisible);
            } catch (e) {
                Log.info("Trying to set legend visiblity for Chart before delegate was initialized");
            }


            return this;
        };

        Chart.prototype.setShowChartTooltip = function (bValue) {
            this.setProperty("showChartTooltip", bValue);

            //Skip if no control delegate; gets propagated by _propagatePropertiesToInnerChart after init
            try {
                this.getControlDelegate().setChartTooltipVisibility(this, bValue);
            } catch (e) {
                Log.info("Trying to set tooltip visibility before delegate was initialized");
            }

            return this;
        };

        Chart.prototype.destroy = function() {
            this._bIsDestroyed = true;

            Control.prototype.destroy.apply(this, arguments);
        };

        /**
         * Shows the drill-down popover for selection a dimension to drill down to.
         *
         * @param {sap.m.Button} oDrillBtn reference to the drill down button for loacation of the popover
         * @returns {Promise} show dril stack promise
         *
         * @private
         */
        Chart.prototype._showDrillDown = function (oDrillBtn) {
            if (!this.oDrillPopover) {
                if (DrillStackHandler) {

                    this.oDrillPopover = DrillStackHandler.createDrillDownPopover(this);
                    this.oDrillPopover.attachAfterClose(function(){
                        delete this.oDrillPopover;
                    }.bind(this));

                    return DrillStackHandler.showDrillDownPopover(this, oDrillBtn);
                }

                return new Promise(function (resolve, reject) {
                    sap.ui.require([
                        "sap/ui/mdc/chart/DrillStackHandler"
                    ], function (DrillStackHandlerLoaded) {
                        DrillStackHandler = DrillStackHandlerLoaded;

                        this.oDrillPopover = DrillStackHandler.createDrillDownPopover(this);
                        this.oDrillPopover.attachAfterClose(function(){
                            delete this.oDrillPopover;
                        }.bind(this));

                        DrillStackHandler.showDrillDownPopover(this, oDrillBtn)
                            .then(function (oDrillDownPopover) {
                                resolve(oDrillDownPopover);
                            });
                    }.bind(this));
                }.bind(this));
            } else if (this.oDrillPopover) {
                this.oDrillPopover.close();
            }
        };

        /**
         * If some properties are set on the MDC chart while the inner chart is not yet initialized, they need to eb set after initialaization.
         * This methods gets called after inner chart is ready and takes care of that
         *
         * @private
         */
        Chart.prototype._propagatePropertiesToInnerChart = function () {
            //TODO: Can this be set by constructor of inner chart?
            this.setLegendVisible(this.getLegendVisible());
            this.setShowChartTooltip(this.getShowChartTooltip());
            this.setChartType(this.getChartType());
        };

        /**
         * Gets information about the current chart type.
         *
         * @returns {object} object containing information about the chart type
         *
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         *
         */
        Chart.prototype.getChartTypeInfo = function () {
            var mInfo;

            try {
                mInfo = this.getControlDelegate().getChartTypeInfo(this);
            } catch (error) {
                //Inner chart is not yet ready
                var oChartResourceBundle = Core.getLibraryResourceBundle("sap.chart.messages");

                if (!mInfo) {
                    mInfo = {
                        icon: "sap-icon://vertical-bar-chart",
                        text: MDCRb.getText("chart.CHART_TYPE_TOOLTIP", [
                            oChartResourceBundle.getText("info/bar")
                        ])
                    };
                }
            }

            return mInfo;
        };

        /**
         * Gets the available chart types for the current state of the inner chart
         *
         * @returns {array} Array containing the available chart types
         *
         * @private
         */
        Chart.prototype.getAvailableChartTypes = function () {
            return this.getControlDelegate().getAvailableChartTypes(this);
        };


        /**
         * Sets the MDC chart to a specific chart type
         * @param {string} sChartType the name of the new chart type
         * @returns {sap.ui.mdc.Chart} reference to <code>this</code> in order to allow method chaining
         */
        Chart.prototype.setChartType = function (sChartType) {
            this.setProperty("chartType", sChartType);

            try {
                this.getControlDelegate().setChartType(this, sChartType);
            } catch (e) {
                Log.info("Trying to set chart type for Chart before delegate was initialized");
            }

            return this;
        };

        Chart.prototype.setNoData = function(oControl) {
            this.setAggregation("noData", oControl);

            try {
                this.getControlDelegate().changedNoDataStruct(this);
            } catch (err) {
                //This fails when the delegate instance is not yet available.
                //It is not a problem as the delegate will use getNoData() on init of the chart, thus using the correct noData struct.
                //This error primerely happens as the setter is called on init of the Chart from framework side.
            }

            return this;
        };

        Chart.prototype.setHeaderVisible = function(bVisible) {
            this.setProperty("headerVisible", bVisible, true);
            if (this.getAggregation("_toolbar")) {
                this.getAggregation("_toolbar").setHeaderVisible(bVisible);
            }
            return this;
        };

        /**
         * Gets the managed object model.
         * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model
         *
         * @private
         */
        Chart.prototype.getManagedObjectModel = function () {
            return this._oManagedObjectModel;
        };

        /**
         * This is a callback function which is called from the delegate once the inner chart finished loading data
         * Updates the Toolbar
         * Fires the innerChartLoadedData event
         *
         * @private
         */
        Chart.prototype._innerChartDataLoadComplete = function (mArguments) {
            this._checkStyleClassesForDimensions();
            this.setBusy(false);
            this._renderOverlay(false);

            this.getControlDelegate().requestToolbarUpdate(this);
        };

        Chart.prototype._checkStyleClassesForDimensions = function() {
            var bHasDimension = this.getItems().some(function(oItem){ return oItem.getType() === "groupable"; });

            if (!bHasDimension && this.hasStyleClass("sapUiMDCChartGrid")) {
                this.removeStyleClass("sapUiMDCChartGrid");
                this.addStyleClass("sapUiMDCChartGridNoBreadcrumbs");
            } else if (bHasDimension && this.hasStyleClass("sapUiMDCChartGridNoBreadcrumbs")) {
                this.removeStyleClass("sapUiMDCChartGridNoBreadcrumbs");
                this.addStyleClass("sapUiMDCChartGrid");
            }
        };

        /**
         * Fetches the current state of the chart (as a JSON)<br>
         * Needed for P13n to fetch current state
         *
         * @returns {Object} Current state of the chart
         *
         * @private
         */
        Chart.prototype.getCurrentState = function () {
            var oState = {};
            var aP13nMode = this.getP13nMode();

            if (aP13nMode) {
                if (aP13nMode.indexOf("Item") > -1) {
                    oState.items = this._getVisibleProperties();
                }

                if (aP13nMode.indexOf("Sort") > -1) {
                    oState.sorters = this._getSortedProperties();
                }

                if (aP13nMode.indexOf("Filter") > -1) {
                    oState.filter = this.getFilterConditions();
                }

                if (aP13nMode.indexOf("Type") > -1) {
                    oState.chartType = this.getChartType();
                }
            }

            return oState;
        };

        /**
         * Returns the currently visible Properties
         * Needed for P13n
         * @returns {array} Array containing the currently visible properties
         *
         * @private
         */
        Chart.prototype._getVisibleProperties = function () {
            var aProperties = [];
            this.getItems().forEach(function (oItem) {
                aProperties.push({
                    name: oItem.getPropertyKey(),
                    role: oItem.getRole()
                });

            });
            return aProperties;
        };

        /**
         * Returns the currently sorted Properties
         * Needed for P13n
         * @returns {array} Array containing the currently sorted properties
         *
         * @private
         */
        Chart.prototype._getSortedProperties = function () {
            return this.getSortConditions() ? this.getSortConditions().sorters : [];
        };

        Chart.prototype._getTypeBtnActive = function(){
            return !!this._typeBtnActive;
        };

        /**
         * Sets the <code>noDataText</code> property.
         * <code>noDataText</code> is displayed if the chart has no data to show.
         * @param {string} sText New value for <code>noDataText</code>
         * @returns {sap.ui.mdc.Chart} Reference to the <code>Chart</code>
         */
        Chart.prototype.setNoDataText = function(sText) {
            this.setProperty("noDataText", sText);

            try {
                this.getControlDelegate().setNoDataText(this, sText);
            } catch (error) {
                //Nothing to do here as this is done during init
            }

            return this;
        };

        /**
         * Callback for when filters changed<br>
         * Activates the overlay on the MDC chart
         *
         * @param oEvent filter changed event
         *
         * @private
         */
		Chart.prototype._onFiltersChanged = function(oEvent) {
			if (this._bInnerChartReady && this.getControlDelegate() && this.getControlDelegate().getInnerChartBound(this) && oEvent.getParameter("conditionsBased")) {
				this._renderOverlay(true);
			}
		};

        var fCheckIfRebindIsRequired = function(aAffectedP13nControllers) {
            var bRebindRequired = false;
            if (
                aAffectedP13nControllers && (
                    aAffectedP13nControllers.indexOf("Sort") > -1 ||
                    aAffectedP13nControllers.indexOf("Item") > -1 ||
                    aAffectedP13nControllers.indexOf("Filter") > -1
                )
            ) {
                bRebindRequired = true;
            }

            return bRebindRequired;
        };

        Chart.prototype._onModifications = function(aAffectedP13nControllers) {
            if (fCheckIfRebindIsRequired(aAffectedP13nControllers)) {
                this.rebind();
            }
        };

        Chart.prototype.setVariant = function(oControl) {
            this.setAggregation("variant", oControl);

            //Only add VM directly when Toolbar already exists; otherwise VM will be added during init of toolbar
            if (this.getAggregation("_toolbar")){
                this.getAggregation("_toolbar").addVariantManagement(oControl);
            }


            return this;
        };

        /**
         * Adds/Removes the overlay shown above the inner chart.
         *
         * @param {boolean} bShow true to show overlay, false to hide
         *
         * @private
         */
		Chart.prototype._renderOverlay = function(bShow) {
			try {
                this.getControlDelegate().showOverlay(this, bShow);
            } catch (err) {
                //If this is called too early, no delegate is availabloe.
                //This should never happen!
                Log.error("sap.ui.mdc.Chart: Tried to render overlay on not initiailized chart. This will not work!");
            }
		};

        Chart.prototype.addAction = function(oControl) {
            if (oControl.getMetadata().getName() !== "sap.ui.mdc.actiontoolbar.ActionToolbarAction") {
                oControl = new ActionToolbarAction(oControl.getId() + "-action", {
                    action: oControl
                });
            }

            return Control.prototype.addAggregation.apply(this, ["actions", oControl]);
        };

        Chart.prototype.setHeaderLevel = function(sHeaderLevel) {
            if (this.getAggregation("_toolbar")) {
                this.getAggregation("_toolbar")._setHeaderLevel(sHeaderLevel);
            }

            this.setProperty("headerLevel", sHeaderLevel);
            return this;
        };

        Chart.prototype.getVariant = function() {
            var oToolbar = this.getAggregation("_toolbar");
            return oToolbar  ? oToolbar._getVariantReference() : this.getAggregation("variant");
        };

        Chart.prototype.onkeydown = function(oEvent) {
            if (oEvent.isMarked()) {
                return;
            }

            if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
                // CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
                var oSettingsBtn = this._getToolbar()._oSettingsBtn;
                if (oSettingsBtn && oSettingsBtn.getVisible() && oSettingsBtn.getEnabled()) {
                    oSettingsBtn.firePress();

                    // Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
                    // (e.g. Cmd+, opens browser settings on Mac).
                    oEvent.setMarked();
                    oEvent.preventDefault();
                }
            }

        };

        return Chart;
    });