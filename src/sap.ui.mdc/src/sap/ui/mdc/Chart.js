/*!
 * ${copyright}
 */

sap.ui.define([
        "sap/ui/core/Core",
        "sap/ui/mdc/Control",
        "./chart/ChartSettings",
        "sap/ui/mdc/util/loadModules",
        "./ChartRenderer",
        "sap/ui/mdc/library",
        "sap/m/Text",
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
        "sap/ui/thirdparty/jquery",
        "sap/ui/core/library"
    ],
    function (
        Core,
        Control,
        ChartSettings,
        loadModules,
        ChartRenderer,
        MDCLib,
        Text,
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
        jQuery,
        coreLibrary
    ) {
        "use strict";

        var DrillStackHandler;
        var TitleLevel = coreLibrary.TitleLevel;

        /**
         * Constructor for a new Chart.
         *
         * @param {string} [sId] ID for the new control, generated automatically if no id is given
         * @param {object} [mSettings] Initial settings for the new control
         * @class The Chart control creates a chart based on metadata and the configuration specified.
         * @extends sap.ui.mdc.Control
         * @author SAP SE
         * @version ${version}
         * @constructor
         * @experimental As of version ...
         * @private
         * @ui5-restricted sap.fe
         * @MDC_PUBLIC_CANDIDATE
         * @since 1.88
         * @alias sap.ui.mdc.Chart
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
                     * Specifies header text that is shown in chart
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
                        type: "sap.ui.mdc.ChartP13nMode[]",
                        defaultValue: []
                    },

                    /**
                     * Enables the legend of the chart.
                     *
                     * @since 1.88
                     */
                    legendVisible: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },
                    /**
                     * Specifies which actions should not be available in the chart's toolbar.
                     *
                     * @since 1.88
                     */
                    ignoreToolbarActions: {
                        type: "sap.ui.mdc.ChartToolbarActionType[]",
                        defaultValue: []
                    },
                    //TODO: Do we really need this? Should be avoided.
                    /**
                     * The minimal width
                     */
                    minWidth: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "240px",
                        invalidate: true
                    },
                    //TODO: Do we really need this? Should be avoided.
                    /**
                     * The minimal height
                     */
                    minHeight: {
                        type: "sap.ui.core.CSSSize",
                        group: "Dimension",
                        defaultValue: "400px",
                        invalidate: true
                    },
                    /**
                     * Defines the sort conditions.
                     *
                     * <b>Note:</b> This property is exclusively used for handling flexibility changes. Do not use it for anything else.
                     *
                     * @since 1.88
                     */
                    sortConditions: {
                        type: "object"
                    },
                    /**
                     * Defines the filter conditions.
                     *
                     * <b>Note:</b> This property is exclusively used for handling flexibility changes. Do not use it for anything else.
                     *
                     * @since 1.99
                     */
                     filterConditions: {
                        type: "object",
                        defaultValue: {}
                    },
                    /**
                     * Controls the visibility of the chart tooltip. If set to <code>true</code>, an instance of {@link sap.viz.ui5.controls.VizTooltip} is created and shown when hovering over a data point.
                     *
                     * @since 1.88
                     */
                    showChartTooltip: {
                        type: "boolean",
                        group: "Misc",
                        defaultValue: true
                    },
                    /**
                     * If set to <code>true</code>, the chart is automatically bound after initialization.
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
                     * <b>Note</b>: This property must not be bound.<br>
                     * <b>Note</b>: This property is used exclusively for SAPUI5 flexibility/ Fiori Elements. Do not use it otherwise.
                     *
                     * @since 1.99
                     */
                    propertyInfo: {
                        type: "object",
                        defaultValue: []
                    },
                    /**
                    * Semantic level of the header.
                    * For more information, see {@link sap.m.Title#setLevel}.
                    *
                    * @since 1.104
                    */
                    headerLevel: {
                        type: "sap.ui.core.TitleLevel",
                        group: "Appearance",
                        defaultValue: TitleLevel.Auto
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
                     * This aggregation describes actions that are added to the chart toolbar.
                     * See {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction} for more information.
                     */
                    actions: {
                        type: "sap.ui.core.Control",
                        multiple: true,
                        forwarding: {
                            getter: "_getToolbar",
                            aggregation: "actions"
                        }
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
                    selectionDetailsActions: {
                        type: "sap.ui.mdc.chart.SelectionDetailsActions",
                        multiple: false
                    },
                    /**
                     * Reference to a {@link sap.ui.fl.variants.VariantManagement} control for the chart.
                     */
                    variant: {
                        type: "sap.ui.fl.variants.VariantManagement",
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
                     * This event is fired when a SelectionDetailsAction is pressed.
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
                             * group of the SelectionDetails popover is pressed, this parameter contains all {@link sap.ui.model.Context contexts} of the
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
                    },
                    /**
                     * This event is fired when a data load on the inner chart completes
                     */
                    innerChartLoadedData: {
                        parameters: {
                            /**
                             * Reference to the inner chart
                             */
                            innerChart: {
                                type: "sap.ui.core.Control"
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
         * Initialises the MDC Chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.init = function () {
            this._oManagedObjectModel = new ManagedObjectModel(this);
            this.setModel(this._oManagedObjectModel, "$mdcChart");
            this._bNewP13n = true;//TODO: remove with migration
            Control.prototype.init.apply(this, arguments);

            this._setupPropertyInfoStore("propertyInfo");
            this._setPropertyHelperClass(PropertyHelper);
        };

        /**
         * Defines which personalization options are available in the chart.
         * Valid options are: "Item", "Sort", "Type".
         * @param {array} aMode String array containing the p13n options that are available
         * @returns {sap.ui.mdc.Chart} Reference to <code>this</code> for method chaining
         *
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements
         */
        Chart.prototype.setP13nMode = function(aMode) {
            var aSortedKeys = null;
            if (aMode && aMode.length >= 1){
                aSortedKeys = [];
                var mKeys = aMode.reduce(function(mMap, sKey, iIndex){
                    mMap[sKey] = true;
                    return mMap;
                }, {});

                //as the p13nMode has no strict order we need to ensure the order of tabs here
                if (mKeys.Item) {
                    aSortedKeys.push("Item");
                }
                if (mKeys.Sort) {
                    aSortedKeys.push("Sort");
                }
                if (mKeys.Filter) {
                    aSortedKeys.push("Filter");
                }
                if (mKeys.Type) {
                    this._typeBtnActive = true;
                    aSortedKeys.push("Type");
                } else {
                    this._typeBtnActive = false;
                }
            } else {
                aSortedKeys = aMode;
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
                Item: ChartItemController,
                Sort: SortController,
                Filter: FilterController,
                Type: ChartTypeController
            };

            if (aMode && aMode.length > 0) {
                aMode.forEach(function(sMode){
                    var sKey = sMode;
                    var oController = mRegistryOptions[sMode];
                    if (oController) {
                        oRegisterConfig.controller[sKey] = oController;
                    }
                });

                this.getEngine().registerAdaptation(this, oRegisterConfig);
            }

        };

        Chart.prototype.setFilterConditions = function(mConditions) {
            this.setProperty("filterConditions", mConditions, true);

            var oP13nFilter = this.getInbuiltFilter();
            if (oP13nFilter) {
                oP13nFilter.setFilterConditions(mConditions);
            }

            return this;
        };

        /**
         * Getter for <code>filterConditions</code> set in the personalization settings.
         * @returns {array} Filters set in the chart
         *
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements
         */
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
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
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

            //load required modules before init of inner controls
            var pLoadDelegate = this._loadDelegate().then(function(oDelegate){
                return oDelegate;
            }).then(function(oDelegate){
                return this.initControlDelegate(oDelegate);
            }.bind(this)).catch(function (error) {
                this._fnRejectInitialized(error);
            }.bind(this));

            var aInitPromises = [
                pLoadDelegate
            ];

            if (this.isFilteringEnabled()) {
                aInitPromises.push(this.retrieveInbuiltFilter());
            }

            //TODO: Refactor this so we use awaitPropertyHelper
            Promise.all(aInitPromises).then(function(){
                this._initInnerControls();
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
                this._bInnerChartReady = true;
                this._fnResolveInitialized();
                this.invalidate();

            }.bind(this)).catch(function (error) {
                this._fnRejectInitialized(error);
            }.bind(this));

            //independent from fetchProperties
            this._getToolbar().createToolbarContent(this);
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
            if (!this._oBreadcrumbs){
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
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements
         */
        Chart.prototype.isFilteringEnabled = function () {
            return this.getP13nMode().indexOf("Filter") > -1;
        };

        /**
         * Gets the adaptation panel for the p13n dialog.
         * <b>Note:</b> This is only used for  personalization, do not use it otherwise.
         * @returns {Promise} <code>Promise</code> that resolves with the adaptation panel control
         *
         * @experimental
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
         * Rebinds the inner chart instance by calling oDelegate.rebindChart
         */
        Chart.prototype._rebind = function () {

            if (!this._bInnerChartReady) {
                //TODO: This can lead to a race conditition when the "Go" button is pressed while the inner chart still intializes
                //TODO: Check whether we really need this since we insantiate the inner chart right away
                //this._initInnerControls();

                //Wait with rebind until inner chart is ready
                this.initialized().then(function () {
                    this._rebind();
                }.bind(this));
                return;
            }

            this.setBusy(true);

            if (!this.getControlDelegate().getInnerChartBound(this)) {
                this._createContentfromPropertyInfos();
                return;
            }

            var oBindingInfo = this.getControlDelegate()._getBindingInfo(this);

            this.getControlDelegate().updateBindingInfo(this, oBindingInfo); //Applies filters
            this.getControlDelegate().rebind(this, oBindingInfo);
        };

        /**
         * Creates a new instance of ChartToolbar
         *
         * @private
         */
        Chart.prototype._getToolbar = function () {
            if (this.getAggregation("_toolbar")) {
                return this.getAggregation("_toolbar");
            } else {
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
         * @experimental
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
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.innerChartBound = function () {
            return this.innerChartBoundPromise;
        };

        /**
         * Zooms in the inner chart.
         * @param {int} iValue how much steps should be zoomed in
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.zoomIn = function (iValue) {
            if (!iValue) {
                iValue = 10;
            }

            this.getControlDelegate().zoomIn(this, iValue);
        };

        /**
         * Zooms out the inner chart.
         * @param {int} iValue how much steps should be zoomed out
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.zoomOut = function (iValue) {
            if (iValue) {
                iValue = 10;
            }

            this.getControlDelegate().zoomOut(this, iValue);
        };

        /**
         * Returns the current zoom information as an object
         * {
         *   "enabled":true,
         *   "currentZoomLevel":0.16
         *   }
         *
         * @returns {Object} current Zoom Information
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.getZoomState = function () {
            return this.getControlDelegate().getZoomState(this);
        };

        /**
         * Retrieves the selection handler of the inner chart.
         * @returns {object} Selection handler of the inner chart
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.getSelectionHandler = function () {
            return this.getControlDelegate().getInnerChartSelectionHandler(this);
        };

        /**
         * Retrieves the chart type layout configuration.
         * <b>Note:</b> This is only used inside personalization.
         * @returns {object} Layout configuration
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.getChartTypeLayoutConfig = function() {
            return this.getControlDelegate().getChartTypeLayoutConfig();
        };

        /**
         * Retrieves the allowed chart roles for the chart types.
         * <b>Note:</b> This is only used inside the personalization.
         * @returns {object} Allowed roles
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
         */
        Chart.prototype.getAllowedRolesForKinds = function() {
            return this.getControlDelegate().getAllowedRolesForKinds();
        };

        /**
         * Sets the visibility of the legend.
         * Calls <code>setLegendVisible</code> on the delegate.
         * @param {boolean} bVisible <code>true</code> to show legend, <code>false</code> to hide
         * @returns {sap.ui.mdc.Chart} Reference to <code>this</code> for method chaining
         *
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements, sap.ui.mdc
         */
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

        /**
         * Sets the ShowChartTooltip Property
         * @param {boolean} bValue true for visible; false for invisible
         * @returns {sap.ui.mdc.Chart} the MDC chart
         */
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
         * shows the drill-down popover for selection a dimension to drill down to.
         * @param {sap.m.Button} oDrillBtn reference to the drill down button for loacation of the popover
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
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
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements
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
         * @experimental
         * @private
         * @ui5-restricted Fiori Elements
         */
        Chart.prototype.getAvailableChartTypes = function () {
            return this.getControlDelegate().getAvailableChartTypes(this);
        };


        /**
         * Sets the MDC chart to a specific chart type
         * @param {string} sChartType the name of the new chart type
         * @returns {sap.ui.mdc.chart} reference to <code>this</code> for method chaining
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

        /**
         * Gets the managed object model.
         * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc
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

            this.fireEvent("innerChartLoadedData ", {
                innerChart: this.getControlDelegate().getInnerChart(this)
            });
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
         * Fetches the current state of the chart (as a JSON)
         * Needed for P13n to fetch current state
         *
         * @experimental
         * @private
         * @returns {Object} Current state of the chart
         * @ui5-restricted sap.ui.mdc
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
                    name: oItem.getName(),
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

        /**
         * Returns the fetched properties from the delegate
         *
         * @private
         */
        Chart.prototype._getPropertyData = function () {

            if (!this.aFetchedProperties) {
                //retrieve the data
                this.aFetchedProperties = this.getControlDelegate().fetchProperties(this);
            } else {
                //take the already instantiated data
                return this.aFetchedProperties;
            }

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
		 * Callback for when fuilters changed
		 * Activates the overlay on the MDC chart
		 *
		 * @param oEvent filter changed event
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype._onFiltersChanged = function(oEvent) {
			if (this._bInnerChartReady && this.getControlDelegate() && this.getControlDelegate().getInnerChartBound(this) && oEvent.getParameter("conditionsBased")) {
				this._renderOverlay(true);
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
		 * Adds/Removes the overlay shown above the inner chart
		 * @param {boolean} bShow true to show overlay, false to hide
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype._renderOverlay = function(bShow) {

			if (this.getControlDelegate().getInnerChart(this)) {

				var $this = this.getControlDelegate().getInnerChart(this).$(), $overlay = $this.find(".sapUiMdcChartOverlay");
				if (bShow && $overlay.length === 0) {
					$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiMdcChartOverlay").css("z-index", "1");
					$this.append($overlay);
				} else if (!bShow) {
					$overlay.remove();
				}
			}
		};

        /**
         * Adds an action to the <code>actions</code> aggregation of the chart.
         * If the given control is not of type {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction}, a container is created for the control before passing it on to the {@link sap.ui.mdc.ActionToolbar}.
         * @param {sap.ui.core.Control} oControl to add to the aggregation
         * @return {sap.ui.mdc.Chart} Reference to <code>this</code> for method chaining.
         *
         * @experimental
         * @private
         * @ui5-restricted sap.ui.mdc, sap.fe
         */
        Chart.prototype.addAction = function(oControl) {
            if (oControl.getMetadata().getName() !== "sap.ui.mdc.actiontoolbar.ActionToolbarAction") {
                oControl = new ActionToolbarAction(oControl.getId() + "-action", {
                    action: oControl
                });
            }

            return Control.prototype.addAggregation.apply(this, ["actions", oControl]);
        };

        /**
         * Specifies the header level for the title of the chart.
         * @param {sap.ui.core.TitleLevel} sHeaderLevel Header level
         * @returns {sap.ui.mdc.Chart} Reference to <code>this</code> in order to allow method chaining
         */
        Chart.prototype.setHeaderLevel = function(sHeaderLevel) {
            if (this.getAggregation("_toolbar")) {
                this.getAggregation("_toolbar")._setHeaderLevel(sHeaderLevel);
            }

            this.setProperty("headerLevel", sHeaderLevel);
            return this;
        };

        return Chart;
    });