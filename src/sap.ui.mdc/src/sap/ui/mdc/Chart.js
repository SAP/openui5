/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core",
	"sap/ui/mdc/Control",
	"./chart/ChartSettings",
	"sap/ui/base/SyncPromise",
	"sap/ui/mdc/util/loadModules",
	"./ChartRenderer",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/model/json/JSONModel",
	"sap/ui/mdc/library",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/model/Sorter",
	"sap/base/Log",
	"sap/base/util/deepEqual",
	"sap/ui/Device",
	"sap/ui/mdc/chart/ToolbarHandler",
	"sap/ui/mdc/mixin/FilterIntegrationMixin",
	"sap/m/VBox",
	"sap/m/Text",
	"sap/ui/mdc/p13n/subcontroller/ChartItemController",
	"sap/ui/mdc/p13n/subcontroller/SortController",
	'sap/ui/events/KeyCodes'
],
	function (
		Core,
		Control,
		ChartSettings,
		SyncPromise,
		loadModules,
		ChartRenderer,
		ManagedObjectObserver,
		JSONModel,
		MDCLib,
		ManagedObjectModel,
		Sorter,
		Log,
		deepEqual,
		Device,
		ToolbarHandler,
		FilterIntegrationMixin,
		VBox,
		Text,
		ChartItemController,
		SortController,
		KeyCodes
	) {
		"use strict";

		var ChartClass,
			SelectionHandler,
			DrillStackHandler,
			ChartTypeButton,
			MeasureItemClass,
			VizTooltip,
			FILTER_INTERFACE = "sap.ui.mdc.IFilter";

		/**
		 /**
		 * Constructor for a new Chart.
		 *
		 * @param {string} [sId] id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] initial settings for the new control
		 * @class The Chart control creates a chart based on metadata and the configuration specified.
		 * @extends sap.ui.mdc.Control
		 * @author SAP SE
		 * @version ${version}
		 * @constructor
		 * @experimental As of version 1.61
		 * @private
		 * @ui5-restricted sap.fe
		 * @MDC_PUBLIC_CANDIDATE
		 * @since 1.61
		 * @alias sap.ui.mdc.Chart
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Chart = Control.extend("sap.ui.mdc.Chart", /** @lends sap.ui.mdc.Chart.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				designtime: "sap/ui/mdc/designtime/chart/Chart.designtime",
				interfaces: [
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
					 * @since 1.78
					 */
					noDataText: {
						type: "string"
					},

					/**
					 * Specifies the type of chart to be created by the SmartChart control.
					 */
					chartType: {
						type: "string",
						group: "Misc",
						defaultValue: "column"
					},

					/**
					 * the selection mode of the chart
					 */
					selectionMode: {
						type: "string",
						group: "Misc",
						defaultValue: "MULTIPLE"
					},

					/**
					 * Specifies the personalization options available for the chart.<br>
					 * <b>Note:</b> The order of the provided options does not influence the arrangement of the icons on the UI.
					 *
					 * @since 1.75
					 */
					p13nMode: {
						type: "sap.ui.mdc.ChartP13nMode[]"
					},

					/**
					 * Set chart's legend properties.
					 *
					 * @since 1.62
					 */
					legendVisible: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					},

					/**
					 * The vizProperties
					 *
					 * @since 1.62
					 */
					vizProperties: {
						type: "object",
						group: "Misc"
					},

					/**
					 * The coloring
					 *
					 * @since 1.64
					 */
					_colorings: {
						type: "object",
						visibility: "_hidden",
						byValue: true
					},

					/**
					 * Specifies which actions should not be available in the chart's toolbar.
					 *
					 * @since 1.64
					 */
					ignoreToolbarActions: {
						type: "sap.ui.mdc.ChartToolbarActionType[]",
						defaultValue: []
					},

					/**
					 * The minimal width
					 */
					minWidth: {
						type: "sap.ui.core.CSSSize",
						group: "Dimension",
						defaultValue: "240px",
						invalidate: true
					},

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
					 * @since 1.74
					 */
					sortConditions: {
						type: "object"
					},
					/**
					 * Controls the visibility of the chart tooltip. If set to <code>true </code>, an instance of sap.viz.ui5.controls.VizTooltip will
					 * be created and shown when hovering over a data point.
					 *
					 * @since 1.86
					 */
					showChartTooltip: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					},
					/*
					 * Binds the chart automatically after the initial creation of the chart
					 */
					autoBindOnInit: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					}
									},
				aggregations: {
					data: {
						multiple: true
					},
					items: {
						type: "sap.ui.mdc.chart.Item",
						multiple: true
					},
					actions: {
						type: "sap.ui.core.Control",
						multiple: true,
						forwarding: {
							idSuffix: "--toolbar",
							aggregation: "actions"
						}
					},
					_chart: {
						type: "sap.chart.Chart",
						multiple: false
					},
					_toolbar: {
						type: "sap.ui.mdc.ActionToolbar",
						multiple: false
					},
					_breadcrumbs: {
						type: "sap.m.Breadcrumbs",
						multiple: false
					},
					_noDataStruct: {
						type: "sap.m.VBox",
						multiple: false
					},
					selectionDetailsActions: {
						type: "sap.ui.mdc.chart.SelectionDetailsActions",
						multiple: false
					}
				},
				associations: {
					/**
				 	* Control or object which enables the chart to do filtering, such as {@link sap.ui.mdc.FilterBar}.
					* Also see {@link sap.ui.mdc.IFilter}.
					*
					* @since 1.78
				 	*/
					filter: {
						type: FILTER_INTERFACE,
						multiple: false
					}
				},
				events: {
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
                    dataPointsSelected:{
					    parameters: {
                            /**
                             * The context of selected / deselected data points
                             */
					        dataContext: {
					            type: "object"
                            }
                        }
                    }
				}
			}
		});

		var _onSelectionMode = function(vValue) {

			if (!this.oChartPromise) {
				return;
			}

			this.oChartPromise.then(function(oChart) {

				if (this.bIsDestroyed) {
					return;
				}

				vValue = vValue || this.getSelectionMode();
				oChart.setSelectionMode(vValue);

				if (vValue !== "NONE") {
					this._prepareSelection();
				}

			}.bind(this));
		};

		FilterIntegrationMixin.call(Chart.prototype);

		/**
		 * Initialises the MDC Chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.init = function() {
			this._oObserver = new ManagedObjectObserver(this.update.bind(this));

			this._oObserver.observe(this, {
				aggregations: [
					"items", "_chart"
				],
				properties: [
					"ignoreToolbarActions", "p13nMode"
				]
			});

			this._oManagedObjectModel = new ManagedObjectModel(this);
			this.setModel(this._oManagedObjectModel, "$mdcChart");
			Control.prototype.init.apply(this, arguments);

		};

		/**
		 * Initializes modules needed for MDC Chart
		 *
		 * @param {array} aModules Modules to initialize
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.initModules = function(aModules) {
			this.initControlDelegate(aModules[0]);
			ChartClass = aModules[1];
			ChartTypeButton = aModules[2];
			MeasureItemClass = aModules[3];
			VizTooltip = aModules[4];
		};

		function getModulesPaths() {
			return [
				"sap/chart/Chart",
				"sap/ui/mdc/chart/ChartTypeButton",
				"sap/ui/mdc/chart/MeasureItem",
				"sap/viz/ui5/controls/VizTooltip"
			];
		}

		/**
		 * Applies given settings onto the MDC Chart and initialized it
		 *
		 * @param {*} mSettings settings to apply
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.applySettings = function(mSettings, oScope) {
			var aActions;

			// Note: In the mdc.Chart control metadata, the "action" aggregation
			// is defined as a forwarded aggregation.
			// However, the automatic forwarding of aggregations only works when
			// the target aggregation exists.
			// So, the actions are removed from the settings argument to prevent
			// an exception to happen when an aggregation is forwarded to a
			// target control that has not been created.
			if (mSettings) {
				aActions = mSettings.actions;
				delete mSettings.actions;
			}

			var oManagedObj = Control.prototype.applySettings.apply(this, arguments);
			this._tempResolve;
			this._tempReject;

			this.oChartPromise = new SyncPromise(function(resolve, reject) {
				this._tempResolve = resolve;
				this._tempReject = reject;
			}.bind(this));

			var oRegisterConfig = {};
			oRegisterConfig.controller = {};

			var aMode = this.getP13nMode() || [];
			aMode.forEach(function(sMode){
				if (sMode == "Item") {
					oRegisterConfig.controller["Item"] = ChartItemController;
				}
				if (sMode == "Sort") {
					oRegisterConfig.controller["Sort"] = SortController;
				}
			});

			this.getEngine().registerAdaptation(this, oRegisterConfig);


			if (this.getAutoBindOnInit()){
				this._createChart(mSettings, aActions);
			} else {
				this._mStoredSettings = mSettings;
				this._mStoredActions = aActions;

				//Toolbar needs settings to be applied before creation to read properties like header/title
				ToolbarHandler.createToolbar(this, aActions, true);
				this._createTempNoData();
			}

			return oManagedObj;

		};

		/**
		 * Create a temporary NoData structure in case inner chart is not created yet.
		 * @private
		 */
		Chart.prototype._createTempNoData = function() {
			var oNoDataText = new Text({
				text: this.getProperty("noDataText")
			});

			var oNoDataStruct = new VBox({
				items: [
					oNoDataText
				],
				justifyContent: "Center",
				alignItems: "Center",
				height: "100%"
			});

			this.setAggregation("_noDataStruct", oNoDataStruct);
		};

		/**
		 * Handles the creation of all chart components (inner chart, toolbar, delegate, ...)
		 * @param {*} mSettings the settings to apply to this managed object
		 * @param {*} aActions actions for toolbar
		 *
		 * @experimental
		 * @private
		 */
		Chart.prototype._createChart = function(mSettings, aActions){
			var oDelegateSettings = (mSettings && mSettings.delegate) || this.getDelegate();
			var sDelegatePath = oDelegateSettings && oDelegateSettings.name;
			var aModulesPaths = [ sDelegatePath ].concat(getModulesPaths());

			// Needs to be set in order to visualize busy indicator when binding happens very fast
			this.setBusyIndicatorDelay(0);
			this.setBusy(true);

			loadModules(aModulesPaths)

			.then(function onModulesLoaded(aModules) {
				this.initModules(aModules);

				// If the Chart control is destroyed before this async callback is
				// invoked, return a rejected promise object to suppress unnecessary
				// work (e.g. creation of the inner Chart) and further invocation
				// of .then() handlers.
				if (this.bIsDestroyed) {
					return SyncPromise.reject();
				}

				return this.getControlDelegate().fetchProperties(this);
			}.bind(this))

			.then(function createInnerChart(aProperties) {

				if (this.bIsDestroyed) {
					return SyncPromise.reject();
				}

				var mItems = {};
				aProperties.forEach(function(oProperty) {
					mItems[oProperty.name] = oProperty;
				});

				// make sure to destroy the temporary NoData structure before inserting the inner chart
				if (this.getAggregation("_noDataStruct")) {
					this.getAggregation("_noDataStruct").destroy();
					this.setAggregation("_noDataStruct", null);
				}

				return this._createInnerChart(mSettings, mItems);
			}.bind(this))

			.then(function createDrillBreadcrumbs(oInnerChart) {

				if (this.getAutoBindOnInit()){
					ToolbarHandler.createToolbar(this, aActions);
				} else {
					ToolbarHandler.updateToolbar(this);
				}

				this._createDrillBreadcrumbs();
				this._toggleChartTooltipVisibility(this.getShowChartTooltip());
				this._tempResolve(oInnerChart);
				return oInnerChart;
			}.bind(this))

			.catch(function applySettingsHandleException(oError) {
				this._tempReject();
				// only log an error in the console if the promise was not intentionally rejected
				// by calling Promise.reject()
				if (oError) {
					Log.error("The control could not be initialized.", oError, this.getMetadata().getName());
				}

			}.bind(this));

			if (!mSettings || mSettings.selectionMode === undefined) {
				_onSelectionMode.apply(this);
			}

			if (mSettings && mSettings.data) {
				this._addBindingListener(mSettings.data, "change", this._onDataLoadComplete.bind(this));
			}

			this._bInnerChartInitialized = true;
			this.bindAggregation("data", this.oDataInfo);
		};

		/**
		 * Calls the Delegates to bind the aggregation onto the inner chart
		 *
		 * @param {string} sName name of the aggregation
		 * @param oBindingInfo binding info for the aggregation
		 * @param sSearchText search text (optional)
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.bindAggregation = function (sName, oBindingInfo, sSearchText) {

			if (sName == "data") {

				this.oDataInfo = oBindingInfo;
				var oChart = this.getAggregation("_chart");

				if (oChart && this.bDelegateInitialized) {
					this.getControlDelegate().rebindChart(this, oBindingInfo, sSearchText);

				} else if (this.oChartPromise) {
					this.oChartPromise.then(function (oChart) {
						this.getControlDelegate().rebindChart(this, oBindingInfo, sSearchText);
					}.bind(this));
				}
				return this;
			}
			return Control.prototype.bindAggregation.apply(this, arguments);
		};

		Chart.prototype._onDataLoadComplete = function(mEventParams) {
			if (mEventParams.mParameters.reason === "change" && !mEventParams.mParameters.detailedReason) {
				this.setBusy(false);
			}
		};

		Chart.prototype._addBindingListener = function(oBindingInfo, sEventName, fHandler) {
			if (!oBindingInfo.events) {
				oBindingInfo.events = {};
			}

			if (!oBindingInfo.events[sEventName]) {
				oBindingInfo.events[sEventName] = fHandler;
			} else {
				// Wrap the event handler of the other party to add our handler.
				var fOriginalHandler = oBindingInfo.events[sEventName];
				oBindingInfo.events[sEventName] = function() {
					fHandler.apply(this, arguments);
					fOriginalHandler.apply(this, arguments);
				};
			}
		};

		/**
		 * Gets information about the current data binding
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype.getBindingInfo = function (sName) {

			if (sName == "data") {
				return this.oDataInfo;
			}

			return Control.prototype.getBindingInfo.apply(this, arguments);
		};

		/**
		 * Sets the visibility of the legend
		 * @param {boolean} bVisible true to show legend, false to hide
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype.setLegendVisible = function (bVisible) {

			// inherited from vizFrame
			this.setVizProperties({
				'legend': {
					'visible': bVisible
				},
				'sizeLegend': {
					'visible': bVisible
				}
			});

			return this.setProperty("legendVisible", bVisible);
		};

		/**
		 *  Creates inner chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype._createInnerChart = function (mSettings, mItems) {
			mSettings = mSettings || {};

			var mInitialChartSettings = {},
				oItem,
				aVizItems = [],
				aColMeasures = [],
				aInSettings = [],
				mVizItemSettings = {};

			mInitialChartSettings.chartType = '{$mdcChart>/chartType}';
			mInitialChartSettings.dimensions = [];
			mInitialChartSettings.measures = [];
			mInitialChartSettings.id = this.getId() + "--innerChart";
			mInitialChartSettings.height = '100%';
			mInitialChartSettings.width = '100%';
			mInitialChartSettings.vizProperties = '{$mdcChart>/vizProperties}';

			mSettings.items = mSettings.items || [];

			function moveToSettings(oVizItem) {
				if (this && this.getVizItemType() == "Dimension") {
					mInitialChartSettings.dimensions.push(oVizItem);
				} else {
					mInitialChartSettings.measures.push(oVizItem);
				}
			}

			function prepareColoring(oItem, oChart) {
				//COLORING
				if (oItem.getCriticality()) {
					oChart._addCriticality(oItem);
				}

				aInSettings.push(oItem.getKey());

				if (oItem.getAdditionalColoringMeasures) {

					for (var j = 0; j < oItem.getAdditionalColoringMeasures().length; j++) {

						if (aColMeasures.indexOf(oItem.getAdditionalColoringMeasures()[j]) == -1) {
							aColMeasures.push(oItem.getAdditionalColoringMeasures()[j]);
						}
					}
				}
			}

			function addAdditionalColoringMeasures() {
				var sKey, mColorItem;

				for (var i = 0; i < aColMeasures.length; i++) {
					sKey = aColMeasures[i];

					if (aInSettings.indexOf(sKey) == -1) {
						mColorItem = this.getControlDelegate().retrieveAggregationItem("items", mItems[sKey]);
						mColorItem = MeasureItemClass.getVizItemSettings(mColorItem.settings);
						//only add the measure to the vizFrame not to the mdc chart
						aVizItems.push(MeasureItemClass.createVizChartItem(mColorItem).then(moveToSettings));
					}
				}
			}

			for (var i = 0; i < mSettings.items.length; i++) {
				oItem = mSettings.items[i];
				prepareColoring(oItem, this);

				if (mItems[oItem.getKey()]) {
					mVizItemSettings = this.getControlDelegate().retrieveAggregationItem("items", mItems[oItem.getKey()]).settings;
				} else {
					mVizItemSettings = undefined;
				}

				aVizItems.push(oItem.toVizChartItem(mVizItemSettings).then(moveToSettings.bind(oItem)));
			}

			//After collecting all additional measure names for coloring we need to add them
			addAdditionalColoringMeasures();


			//attach dataPointsSelected event to inner charts selection/deselection events
			var fireDataPointsSelectedEvent = function(oEvent){
				this.fireDataPointsSelected({
					dataContext: oEvent.getParameters()
				});
			};

			return Promise.all(aVizItems).then(function() {
				var oChart = new ChartClass(mInitialChartSettings);

				//initial setup
				oChart.setVisibleDimensions([]);
				oChart.setVisibleMeasures([]);
				oChart.setInResultDimensions([]);

				oChart.attachSelectData(function(oEvent){
					fireDataPointsSelectedEvent.call(this, oEvent);
				}.bind(this));

				oChart.attachDeselectData(function(oEvent){
					fireDataPointsSelectedEvent.call(this, oEvent);
				}.bind(this));

				this._oObserver.observe(oChart, {
					bindings: [
						"data"
					],
					aggregations: [
						"dimensions", "measures"
					]
				});

				this.setAggregation("_chart", oChart);
				return oChart;
			}.bind(this));
		};

		/**
		* Sets the <code>selectionMode</code> property
		* @param {string} vValue the selection mode to set the chart to
		* @returns {this} reference to <code>this</code> for method chaining
		*
		* @private
		* @ui5-restricted Fiori Elements
		*/
		Chart.prototype.setSelectionMode = function (vValue) {
			this.setProperty("selectionMode", vValue, true);
			vValue = this.getSelectionMode();
			_onSelectionMode.call(this, vValue);
			return this;
		};

		/**
		 * Adds a Item to the chart
		 *
		 * @param {sap.ui.mdc.chart.Item} oItem a chart Item
		 * @param {boolean} bSuppressInvalidate Suppress invalidation of the control
		 *
		 * @private
		 * @experimental
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.addItem = function (oItem, bSuppressInvalidate) {
			var oChart = this.getAggregation("_chart");

			if (oChart) {
				oItem.toChart(oChart);
			} else if (this.oChartPromise) {
				this.oChartPromise.then(function(oChart) {

					if (oChart) {
						this.toChart(oChart);
					}
				}.bind(oItem));
			}

			this._oObserver.observe(oItem, {
				properties: [
					"visible", "inResult", "role"
				]
			});

			return this.addAggregation("items", oItem, bSuppressInvalidate);
		};

		/**
		 * Inserts an Item into the chart
		 * @param {sap.ui.mdc.chart.Item} oItem a chart Item
		 * @param {int} iIndex the index
		 * @param {boolean} bSuppressInvalidate Suppress invalidation of the control
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype.insertItem = function (oItem, iIndex, bSuppressInvalidate) {

			if (oItem.getCriticality()) {
				this._addCriticality(oItem);
			}

			var oChart = this.getAggregation("_chart");

			if (oChart) {
				oItem.toChart(oChart);
			} else if (this.oChartPromise) {
				this.oChartPromise.then(function (oChart) {

					if (oChart) {
						this.toChart(oChart);
					}
				}.bind(oItem));
			}

			this._oObserver.observe(oItem, {
				properties: [
					"visible", "inResult", "role"
				]
			});

			return this.insertAggregation("items", oItem, iIndex, bSuppressInvalidate);
		};

		/**
		 * Removes the chart item
		 *
		 * @param {sap.ui.mdc.chart.Item} oItem oItem a chart Item
		 * @param bSuppressInvalidate Suppress invalidation of the control
		 * @returns {*}
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype.removeItem = function (oItem, bSuppressInvalidate) {
			this._oObserver.unobserve(oItem);
			return this.removeAggregation("items", oItem, bSuppressInvalidate);
		};

		Chart.prototype.exit = function() {
			Control.prototype.exit.apply(this, arguments);

			this.oChartPromise = null;
			this._oSelectionHandlerPromise = null;

			var oChart = this.getAggregation("_chart");

			if (oChart) {
				oChart.destroy();
			}
		};

		/**
		 * Gets the item from the aggregation named <code>items</code> that
		 * matches the given <code>aItemKeys</code>.
		 *
		 * @param {array} aItemKeys The item keys that specify the item to be retrieved
		 * @returns {array} Array containing the matching items
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.getItemsByKeys = function(aItemKeys) {
			var aFilteredItems = [],
				aItems = this.getItems();

			aItemKeys.forEach(function(sItemName) {
				for (var i = aItems.length - 1; i >= 0; i--) {
					if (aItems[i].getKey() == sItemName /*&& is of type DimensionItem*/) {
						aFilteredItems.push(aItems[i]);
						break;
					}
				}
			});

			return aFilteredItems;
		};

		/**
		 * shows the drill-down popover for selection a dimension to drill down to.
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype._showDrillDown = function() {

			if (DrillStackHandler) {

				if (!this._oDrillDownPopover) {
					DrillStackHandler.createDrillDownPopover(this);
				}

				return DrillStackHandler.showDrillDownPopover(this);
			}

			return new Promise(function(resolve, reject) {
				sap.ui.require([
					"sap/ui/mdc/chart/DrillStackHandler"
				], function(DrillStackHandlerLoaded) {
					DrillStackHandler = DrillStackHandlerLoaded;
					DrillStackHandler.createDrillDownPopover(this);
					DrillStackHandler.showDrillDownPopover(this)
					.then(function(oDrillDownPopover) {
						resolve(oDrillDownPopover);
					});
				}.bind(this));
			}.bind(this));
		};

		/**
		 * shows the Breadcrumbs for current drill-path and drilling up.
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype._createDrillBreadcrumbs = function() {

			if (DrillStackHandler) {

				if (!this._oDrillBreadcrumbs) {
					return DrillStackHandler.createDrillBreadcrumbs(this);
				}

				return Promise.resolve(this._oDrillBreadcrumbs);
			}

			return new Promise(function(resolve, reject) {
				sap.ui.require([
					"sap/ui/mdc/chart/DrillStackHandler"
				], function(DrillStackHandlerLoaded) {
					DrillStackHandler = DrillStackHandlerLoaded;
					DrillStackHandler.createDrillBreadcrumbs(this).then(function(oDrillBreadcrumbs) {
						resolve(oDrillBreadcrumbs);
					});
				}.bind(this));
			}.bind(this));
		};

		Chart.prototype._getPropertyData = function () {
			return new Promise(function (resolve, reject) {

				// check if the data already has been retrieved
				if (!this.aFetchedProperties) {
					//retrieve the data
					return this.oChartPromise.then(function() {
						return this.getControlDelegate().fetchProperties(this);
					}.bind(this))
					.then(function(aFetchedProperties) {
						this.aFetchedProperties = aFetchedProperties;
						resolve(aFetchedProperties);
					}.bind(this));

				} else {
					//take the already instantiated data
					resolve(this.aFetchedProperties);
				}
			}.bind(this));
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
			var aChartTypes = [];
			var oChart = this.getAggregation("_chart");

			if (oChart) {
				var aAvailableChartTypes = oChart.getAvailableChartTypes().available;

				if (aChartTypes) {

					var oChartResourceBundle = Core.getLibraryResourceBundle("sap.chart.messages");

					for (var i = 0; i < aAvailableChartTypes.length; i++) {
						var sType = aAvailableChartTypes[i].chart;
						aChartTypes.push({
							key: sType,
							icon: ChartTypeButton.mMatchingIcon[sType],
							text: oChartResourceBundle.getText("info/" + sType),
							selected: (sType == this.getChartType())
						});
					}
				}
			}

			return aChartTypes;
		};

		/**
		 * @typedef {Object} sap.ui.mdc.Chart.ChartTypeInfo
		 * @property {string} icon - The icon of the selected chart type
		 * @property {string} text - Tooltip containing the current chart type
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */

		/**
		 * Gets information about the current chart type.
		 *
		 * @returns {sap.ui.mdc.Chart.ChartTypeInfo} Object containing information about the chart type
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 *
		 */
		Chart.prototype.getTypeInfo = function() {
			var sType = this.getChartType(),
				oMDCResourceBundle = Core.getLibraryResourceBundle("sap.ui.mdc");

			var mInfo = {
				icon: ChartTypeButton && ChartTypeButton.mMatchingIcon[sType] ? ChartTypeButton.mMatchingIcon[sType] : "sap-icon://horizontal-bar-chart",
				text: oMDCResourceBundle.getText("chart.CHART_TYPE_TOOLTIP", [
					sType
				])
			};

			return mInfo;
		};

		/**
		 * Gets the managed object model.
		 * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.getManagedObjectModel = function () {
			return this._oManagedObjectModel;
		};

		/**
		 * Updates the inner chart
		 * @param {object} oChanges Object containing the changes to update with
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.update = function (oChanges) {
			var oChart = this.getAggregation("_chart");

			if (oChart) {
				this._update(oChart, oChanges);
			} else if (this.oChartPromise) {
				this.oChartPromise.then(function (oChart) {

					if (oChart) {
						this._update(oChart, oChanges);
					}
				}.bind(this));
			}
		};

		/**
		 * Updates the inner chart
		 * @param {sap.chart.Chart} oChart the inner chart to update
		 * @param {object} oChanges Object containing the changes to update with
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype._update = function (oChart, oChanges) {

			var aItems = this.getItems(),
				oVizItem,
				oChartItem,
				aVisibleMeasures = [],
				aVisibleDimensions = [],
				aInResultDimensions = [],
				mDataPoints = {};

			if (oChanges.name === "ignoreToolbarActions" || oChanges.name === "p13nMode") {
				//ToolbarHandler.updateToolbar(this);
				return;
			}

			if (oChanges.name === "data" && oChanges.type === "binding" && oChanges.mutation === "prepare" && oChanges.object.isA("sap.chart.Chart")) {
				oChanges.bindingInfo.sorter = this._getSorters();
			}

			this._aInResultProperties = [];

			for (var i = 0; i < aItems.length; i++) {
				oChartItem = aItems[i];
				oVizItem = oChartItem.getVizItemType() == "Measure" ? oChart.getMeasureByName(oChartItem.getKey()) : oChart.getDimensionByName(oChartItem.getKey());

				if (!oVizItem) {
					continue;
				}

				if (oChartItem.getVisible()) {

					if (oChartItem.getVizItemType() == "Measure") {
						aVisibleMeasures.push(oVizItem.getName());

						if (oChartItem.getDataPoint()) {
							mDataPoints[oVizItem.getName()] = oChartItem.getDataPoint();
						}
					} else {
						aVisibleDimensions.push(oVizItem.getName());
					}

					this._aInResultProperties.push(oVizItem.getName());
				}

				//inResult only possible for dimensions
				if (oChartItem.getVizItemType() == "Dimension") {

					if (oChartItem.getInResult()) {
						aInResultDimensions.push(oVizItem.getName());
						this._aInResultProperties.push(oVizItem.getName());
					}
				}
			}

			var bRebind = false;

			if (!deepEqual(aVisibleDimensions, oChart.getVisibleDimensions())) {
				oChart.setVisibleDimensions(aVisibleDimensions);
				bRebind = true;
			}

			if (!deepEqual(aVisibleMeasures, oChart.getVisibleMeasures())) {
				oChart.setVisibleMeasures(aVisibleMeasures);
				bRebind = true;
			}

			if (!deepEqual(aInResultDimensions, oChart.getInResultDimensions())) {
				oChart.setInResultDimensions(aInResultDimensions);
				bRebind = true;
			}

			// Update binding with sorters
			if (bRebind) {
				this.rebind();
				this._updateSemanticalPattern(oChart, aVisibleMeasures, mDataPoints);
				this._updateColoring(oChart, aVisibleDimensions, aVisibleMeasures);
			}

			//TODO: Temporary Workaround
			//TODO: Investigate for a onUpdate event. Could save us effort in attaching to inner chart events
			if (DrillStackHandler && this.getAggregation("_breadcrumbs")) {
				DrillStackHandler._updateDrillBreadcrumbs(this, this.getAggregation("_breadcrumbs"));
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
		Chart.prototype._updateSemanticalPattern = function (oChart, aVisibleMeasures, mDataPoints) {

			for (var k = 0; k < aVisibleMeasures.length; k++) {
				//first draft only with semantic pattern
				var oDataPoint = mDataPoints[aVisibleMeasures[k]];

				if (oDataPoint) {

					if (oDataPoint.targetValue || oDataPoint.foreCastValue) {
						var oActualMeasure = oChart.getMeasureByName(aVisibleMeasures[k]);

						oActualMeasure.setSemantics("actual");

						if (oDataPoint.targetValue != null) {
							var oReferenceMeasure = oChart.getMeasureByName(oDataPoint.targetValue);

							if (oReferenceMeasure) {
								oReferenceMeasure.setSemantics("reference");
							} else {
								Log.error("sap.ui.mdc.Chart: " + oDataPoint.targetValue + " is not a valid measure");
							}
						}

						if (oDataPoint.foreCastValue) {
							var oProjectionMeasure = oChart.getMeasureByName(oDataPoint.foreCastValue);

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
			}
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
		Chart.prototype._updateColoring = function (oChart, aVisibleDimensions, aVisibleMeasures, mDataPoints) {
			var oColoring = this.getProperty("_colorings"), k;

			if (oColoring && oColoring.Criticality) {
				var oActiveColoring;

				//dimensions overrule
				for (k = 0; k < aVisibleDimensions.length; k++) {

					if (oColoring.Criticality.DimensionValues[aVisibleDimensions[k]]) {
						oActiveColoring = {
							coloring: "Criticality",
							parameters: {
								dimension: aVisibleDimensions[k]
							}
						};

						delete oColoring.Criticality.MeasureValues;
						break;
					}
				}

				if (!oActiveColoring) {
					delete oColoring.Criticality.DimensionValues;

					for (var sMeasure in oColoring.Criticality.MeasureValues) {

						if (aVisibleMeasures.indexOf(sMeasure) == -1) {
							delete oColoring.Criticality.MeasureValues[sMeasure];
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
					oChart.setColorings(oColoring);
					oChart.setActiveColoring(oActiveColoring);
				}
			}
		};

		Chart.prototype._prepareSelection = function () {
			if (SelectionHandler) {
				SelectionHandler.prepareChart(this);
			} else {
				this._oSelectionHandlerPromise = loadModules(["sap/ui/mdc/chart/SelectionHandler"]).then(function (aModules) {
					SelectionHandler = aModules[0];

					if (this.bIsDestroyed) {
						return;
					}

					SelectionHandler.prepareChart(this);
				}.bind(this));
			}
		};

		/**
		 * Returns sorters available for the data
		 *
		 * @returns {array} Array containing available sorters
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype._getSorters = function () {
			var aSorters;
            var aSorterProperties = this.getSortConditions() ? this.getSortConditions().sorters : [];

            aSorterProperties.forEach(function(oSortProp){
                if (this._aInResultProperties.indexOf(oSortProp.name) != -1) {
                    var oSorter = new Sorter(oSortProp.name, oSortProp.descending);

                    if (aSorters) {
                        aSorters.push(oSorter);
                    } else {
                        aSorters = [
                            oSorter
                        ];//[] has special meaning in sorting
                    }
                }
            }.bind(this));

            return aSorters;

		};

		/**
		 * Updates the delegate binding info and updates inner chart if necessary
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype.rebind = function() {
			this.setBusy(true);

			//When autoBindOnInit = false, trigger everything on rebind
			if (!this._bInnerChartInitialized) {
				this._createChart(this._mStoredSettings, this._mStoredActions);
				return;
			}

			if (!this.bDelegateInitialized) {
				return;
			}

			var oBindingInfo = this.oDataInfo,
				oDelegate = this.getControlDelegate();

			if (oDelegate) {
				oDelegate.updateBindingInfo(this, oBindingInfo);
			}

			if (!this.isInnerChartBound()) {
				return;
			}

			if (oBindingInfo) {

				//BindingInfo.filters = this._getFilterInfo().filters;
				oBindingInfo.sorter = this._getSorters();
				//TODO: Clarify why sap.ui.model.odata.v4.ODataListBinding.destroy this.bHasAnalyticalInfo is false
				//TODO: on second call, as it leads to issues when changing layout options within the settings dialog.
				//TODO: bHasAnalyticalInfo of inner chart binding should be true and in fact is true initially.
				oBindingInfo.binding.bHasAnalyticalInfo = true;
			}

			this.bindAggregation("data", oBindingInfo);
			this._updateInnerChartNoDataText();
			this._renderOverlay(false);
		};

		/**
		 * Checks whether inner chart is bound
		 *
		 * @returns {boolean} true if bound, false if not
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.isInnerChartBound = function() {
			return this.getAggregation("_chart") ? this.getAggregation("_chart").isBound("data") : false;
		};

		/**
		 * Callback for when fuilters changed
		 * Activates the overlay on the MDC Chart
		 *
		 * @param oEvent filter changed event
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements, sap.ui.mdc
		 */
		Chart.prototype._onFiltersChanged = function(oEvent) {
			if (this.isInnerChartBound() && oEvent.getParameter("conditionsBased")) {
				this._renderOverlay(true);
			}
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

			if (this.getAggregation("_chart")) {

				var $this = this.getAggregation("_chart").$(), $overlay = $this.find(".sapUiMdcChartOverlay");
				if (bShow && $overlay.length === 0) {
					$overlay = jQuery("<div>").addClass("sapUiOverlay sapUiMdcChartOverlay").css("z-index", "1");
					$this.append($overlay);
				} else if (!bShow) {
					$overlay.remove();
				}
			}
		};

		/**
		 * Sets the text shown for when there is no data for the chart
		 *
		 * @param {string} sNoData text to show when no data is shown
		 * @returns {*} reference to <code>this</code> for method chaining
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.setNoDataText = function(sNoData) {
			this.setProperty("noDataText", sNoData, true);
			this._updateInnerChartNoDataText();
			return this;
		};

		//methods provided via FilterIntegrationMixin
		Chart.prototype._onFilterProvided = function() {
			this._updateInnerChartNoDataText();
		};

		Chart.prototype._onFilterRemoved = function() {
			this._updateInnerChartNoDataText();
		};

		/**
		 * Updates the text shown when there is no data for the inner chart
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype._updateInnerChartNoDataText = function() {

			var oInnerChart = this.getAggregation("_chart");

			if (!oInnerChart) {
				return;
			}

			oInnerChart.setCustomMessages({
				'NO_DATA': this._getNoDataText()
			});
		};

		/**
		 * Gets the text shown for when there is no data on the inner chart
		 *
		 * @experimental
		 * @returns {string} text shown when data is missing
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype._getNoDataText = function() {
			var sNoDataText = this.getNoDataText();
			if (sNoDataText) {
				return sNoDataText;
			}

			var oRb = Core.getLibraryResourceBundle("sap.ui.mdc");

			if (!this.isInnerChartBound()) {
				if (this.getFilter()) {
					return oRb.getText("chart.NO_DATA_WITH_FILTERBAR");
				}
				return oRb.getText("chart.NO_DATA");
			}

			return oRb.getText("chart.NO_RESULTS");
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
		Chart.prototype._addCriticality = function (oItem) {
			var oColoring = this.getProperty("_colorings");

			oColoring = oColoring || {
				Criticality: {
					DimensionValues: {},
					MeasureValues: {}
				}
			};

			var mCrit = oItem.getCriticality(), mChartCrit = {};

			if (oItem.getVizItemType() == "Dimension") {

				for (var sKey in mCrit) {

					mChartCrit[sKey] = {
						Values: mCrit[sKey]
					};
				}

				oColoring.Criticality.DimensionValues[oItem.getKey()] = mChartCrit;
			} else {

				for (var sKey in mCrit) {
					mChartCrit[sKey] = mCrit[sKey];
				}

				oColoring.Criticality.MeasureValues[oItem.getKey()] = mChartCrit;
			}

			this.setProperty("_colorings", oColoring);
		};

		/**
		 * Gets the collection model from the binding information
		 * @returns {object} Object containing the binding information
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.getCollectionModel = function () {
			var oBindingInfo = this.getBindingInfo("data");
			return oBindingInfo ? this.getModel(oBindingInfo.model) : null;
		};

		/**
		 * Gets the collection path from the binding information
		 * @returns {string} path to collection
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.getCollectionPath = function () {
			var oBindingInfo = this.getBindingInfo("data");
			return oBindingInfo ? oBindingInfo.path : null;
		};

		/**
		 * Returns a Promise that resolves after the chart has been initialized after being created and after changing the type.
		 *
		 * @returns {Promise} A Promise that resolves after the chart has been initialized
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.done = function () {
			return this.oChartPromise;
		};

		/**
		 * Returns a Promise that resolves after the chart has been initialized after being created and after changing the type.
		 *
		 * @returns {Promise} A Promise that resolves after the chart has been initialized
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.initialized = function() {
			return this.oChartPromise;
		};

		var _getVisibleProperties = function (oChart) {
			var aProperties = [];
			if (oChart) {
				oChart.getItems().forEach(function (oChartItem, iIndex) {
					aProperties.push({
						name: oChartItem.getKey(),
						role: oChartItem.getRole()
					});

				});
			}
			return aProperties;
		};

		var _getSortedProperties = function(oChart) {
			return oChart.getSortConditions() ? oChart.getSortConditions().sorters : [];
		};

		/**
		 * Gets whether filtering is enabled for p13n
		 *
		 * @experimental
		 * @private
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.isFilteringEnabled = function() {
			var aP13nMode = this.getP13nMode() || [];
			return aP13nMode.indexOf("Filter");
		};

		/**
		 * Fetches the current state of the chart (as a JSON)
		 *
		 * @experimental
		 * @private
		 * @returns {Object} Current state of the chart
		 * @ui5-restricted Fiori Elements
		 */
		Chart.prototype.getCurrentState = function() {
			var oState = {};
			var aP13nMode = this.getP13nMode();

			if (aP13nMode) {

				if (aP13nMode.indexOf("Item") > -1) {
					oState.items = _getVisibleProperties(this);
				}

				if (aP13nMode.indexOf("Sort") > -1) {
					oState.sorters = _getSortedProperties(this);
				}
			}

			return oState;
		};

		/**
		 * Sets the ShowChartTooltip Property
		 * @param {boolean} bValue new value
		*/
		Chart.prototype.setShowChartTooltip = function (bValue) {
			this.setProperty("showChartTooltip", bValue);
			this._toggleChartTooltipVisibility(bValue);
			return this;
		};

		Chart.prototype._toggleChartTooltipVisibility = function(bFlag) {

			var oChart = this.getAggregation("_chart");

			if (oChart) {
				this._setChartTooltipVisiblity(oChart, bFlag);
			} else if (this.oChartPromise){
				this.oChartPromise.then(function (oChart) {
					this._setChartTooltipVisiblity(oChart, bFlag);
				}.bind(this));
			}
		};

		Chart.prototype._setChartTooltipVisiblity = function(oChart, bFlag) {
			if (bFlag) {
				if (!this._vizTooltip) {
					this._vizTooltip = new VizTooltip();
				}
				// Make this dynamic for setter calls
				this._vizTooltip.connect(oChart.getVizUid());
			} else {
				if (this._vizTooltip) {
					this._vizTooltip.destroy();
				}
			}
		};

		Chart.prototype.onkeydown = function(oEvent) {
			if (oEvent.isMarked()) {
				return;
			}

			if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
				// CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
				var oSettingsBtn =  Core.byId(this.getId() + "-chart_settings");
				if (oSettingsBtn && oSettingsBtn.getEnabled() && oSettingsBtn.getVisible()) {
					oSettingsBtn.firePress();

					// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
					// (e.g. Cmd+, opens browser settings on Mac).
					oEvent.setMarked();
					oEvent.preventDefault();
				}
			}
		};

		return Chart;
	}, true);
