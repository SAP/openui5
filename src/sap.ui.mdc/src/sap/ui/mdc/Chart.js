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
	"sap/ui/mdc/chart/ToolbarHandler"
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
		ToolbarHandler
	) {
		"use strict";

		var ChartClass,
			SelectionHandler,
			DrillStackHandler,
			ChartTypeButton,
			MeasureItemClass,
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
		 * @experimental
		 * @private
		 * @since 1.61
		 * @alias sap.ui.mdc.Chart
		 * @ui5-metamodel This control/element also will be described in the UI5 (legacy) designtime metamodel
		 */
		var Chart = Control.extend("sap.ui.mdc.Chart", /** @lends sap.ui.mdc.Chart.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
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
			this.oChartPromise.then(function (oChart) {
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

		Chart.prototype.init = function () {
			this._oObserver = new ManagedObjectObserver(this.update.bind(this));
			this._oAdaptationController = null;

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

			var oResourceBundle = sap.ui.getCore().getLibraryResourceBundle("sap.ui.mdc");
			this.setProperty("adaptationConfig", {
				itemConfig: {
					changeOperations: {
						add: "addItem",
						remove: "removeItem",
						move: "moveItem"
					},
					title: oResourceBundle.getText("chart.PERSONALIZATION_DIALOG_TITLE"),
					adaptationUI: "sap/ui/mdc/p13n/panels/ChartItemPanel",
					additionalDeltaAttributes: ["role"]
				}
			});
		};

		Chart.prototype.initModules = function(aModules) {
			this.initControlDelegate(aModules[0]);
			ChartClass = aModules[1];
			ChartTypeButton = aModules[2];
			MeasureItemClass = aModules[3];
		};

		function getModulesPaths() {
			return [
				"sap/chart/Chart",
				"sap/ui/mdc/chart/ChartTypeButton",
				"sap/ui/mdc/chart/MeasureItem"
			];
		}

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

			var oDelegateSettings = (mSettings && mSettings.delegate) || this.getDelegate();
			var sDelegatePath = oDelegateSettings && oDelegateSettings.name;
			var aModulesPaths = [ sDelegatePath ].concat(getModulesPaths());

			this.oChartPromise = loadModules(aModulesPaths)

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
			.then(function (aProperties) {
				return this.retrieveAdaptationController().then(function () {
					return aProperties;
				});
			}.bind(this))

			.then(function createInnerChart(aProperties) {

				if (this.bIsDestroyed) {
					return SyncPromise.reject();
				}

				ToolbarHandler.createToolbar(this, aActions);
				this._createDrillBreadcrumbs();

				var mItems = {};
				aProperties.forEach(function(oProperty) {
					mItems[oProperty.name] = oProperty;
				});

				return this._createInnerChart(mSettings, mItems);
			}.bind(this))

			.catch(function applySettingsHandleException(oError) {

				// only log an error in the console if the promise was not intentionally rejected
				// by calling Promise.reject()
				if (oError) {
					Log.error("The control could not be initialized.", oError, this.getMetadata().getName());
				}

			}.bind(this));

			if (!mSettings || mSettings.selectionMode === undefined) {
				_onSelectionMode.apply(this);
			}

			return Control.prototype.applySettings.apply(this, arguments);
		};

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

		Chart.prototype.getBindingInfo = function (sName) {

			if (sName == "data") {
				return this.oDataInfo;
			}

			return Control.prototype.getBindingInfo.apply(this, arguments);
		};

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

			// We have to wait until all flex changes have been applied to the mdc.Chart
			var oWaitForChangesPromise = new Promise(function (resolve) {
				sap.ui.require([
					"sap/ui/fl/apply/api/FlexRuntimeInfoAPI"
				], function (FlexRuntimeInfoAPI) {

					// If the condition, that a control is assigned to a AppComponent is not fulfilled, we can go ahead
					if (!FlexRuntimeInfoAPI.isFlexSupported({ element: this })) {
						return Promise.resolve();
					}

					// Otherwise we wait until the changes are applied
					FlexRuntimeInfoAPI.waitForChanges({ element: this }).then(function () {
						return resolve();
					});
				}.bind(this));
			}.bind(this));

			return Promise.all(aVizItems, oWaitForChangesPromise).then(function () {
				var oChart = new ChartClass(mInitialChartSettings);
				//initial setup
				oChart.setVisibleDimensions([]);
				oChart.setVisibleMeasures([]);
				oChart.setInResultDimensions([]);

                //attach dataPointsSelected event to inner charts selection/deselection events
                var fireDataPointsSelectedEvent = function(oEvent){
                    this.fireDataPointsSelected({
                        dataContext: oEvent.getParameters()
                    });
                };

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

		Chart.prototype.setSelectionMode = function (vValue) {
			_onSelectionMode.call(this, vValue);
			return this.setProperty("selectionMode", vValue, true);
		};

		/**
		 * Adds a Item to the chart
		 *
		 * @param {sap.ui.mdc.chart.Item} oItem a chart Item
		 * @param bSuppressInvalidate Suppress invalidation of the control
		 * @returns {sap.ui.mdc.Chart} the chart
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
		 * Inserts a Item into the chart+
		 * @param {sap.ui.mdc.chart.Item} oItem a chart Item
		 * @param {int} iIndex the index
		 * @param bSuppressInvalidate Suppress invalidation of the control
		 * @returns {sap.ui.mdc.Chart} the chart
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
		 * @param oItem {sap.ui.mdc.chart.Item} oItem a chart Item
		 * @param bSuppressInvalidate Suppress invalidation of the control
		 * @returns {*}
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
		 * @private
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
		 * @private
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
					DrillStackHandler.createDrillBreadcrumbs(this).then(function() {
						resolve();
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

		Chart.prototype.getTypeInfo = function() {
			var sType = this.getChartType(),
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
		 *
		 * @return {oModel} the managed object model
		 */
		Chart.prototype.getManagedObjectModel = function () {
			return this._oManagedObjectModel;
		};

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

		Chart.prototype._update = function (oChart, oChanges) {
			var aItems = this.getItems(),
				oVizItem,
				oChartItem,
				aVisibleMeasures = [],
				aVisibleDimensions = [],
				aInResultDimensions = [],
				mDataPoints = {};

			if (oChanges.name === "ignoreToolbarActions" || oChanges.name === "p13nMode") {
				ToolbarHandler.updateToolbar(this);
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
				this._rebind();
				this._updateSemanticalPattern(oChart, aVisibleMeasures, mDataPoints);
				this._updateColoring(oChart, aVisibleDimensions, aVisibleMeasures);
			}

			//TODO: Temporary Workaround
			//TODO: Investigate for a onUpdate event. Could save us effort in attaching to inner chart events
			if (DrillStackHandler && this.getAggregation("_breadcrumbs")) {
				DrillStackHandler._updateDrillBreadcrumbs(this, this.getAggregation("_breadcrumbs"));
			}

		};

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

		Chart.prototype._rebind = function() {

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

		Chart.prototype.setFilter = function(vFilter) {
			if (this._validateFilter(vFilter)) {
				this._deregisterFilter();

				this.setAssociation("filter", vFilter, true);

				this._registerFilter();
				this._updateInnerChartNoDataText();
			}

			return this;
		};

		Chart.prototype._validateFilter = function(vFilter) {
			var oFilter = typeof vFilter === "object" ? vFilter : Core.byId(vFilter);
			if (!oFilter || oFilter.isA(FILTER_INTERFACE)) {
				return true;
			}
			throw new Error("\"" + vFilter + "\" is not valid for association \"filter\" of mdc.Chart. Please use an object that implements \"" + FILTER_INTERFACE + "\" interface");
		};

		Chart.prototype._registerFilter = function() {
			var oFilter = Core.byId(this.getFilter());
			if (oFilter) {
				oFilter.attachSearch(this._rebind, this);
				oFilter.attachFiltersChanged(this._onFiltersChanged, this);
			}
		};

		Chart.prototype._deregisterFilter = function() {
			var oFilter = Core.byId(this.getFilter());
			if (oFilter) {
				oFilter.detachSearch(this._rebind, this);
				oFilter.detachFiltersChanged(this._onFiltersChanged, this);
			}
		};


		Chart.prototype.isInnerChartBound = function() {
			return this.getAggregation("_chart") ? this.getAggregation("_chart").isBound("data") : false;
		};

		Chart.prototype._onFiltersChanged = function(oEvent) {
			if (this.isInnerChartBound() && oEvent.getParameter("conditionsBased")) {
				this._renderOverlay(true);
			}
		};

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

		Chart.prototype.setNoDataText = function(sNoData) {
			this.setProperty("noDataText", sNoData, true);
			this._updateInnerChartNoDataText();
			return this;
		};

		Chart.prototype._updateInnerChartNoDataText = function() {

			var oInnerChart = this.getAggregation("_chart");

			if (!oInnerChart) {
				return;
			}

			oInnerChart.setCustomMessages({
				'NO_DATA': this._getNoDataText()
			});
		};

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

		Chart.prototype.getCollectionModel = function () {
			var oBindingInfo = this.getBindingInfo("data");
			return oBindingInfo ? this.getModel(oBindingInfo.model) : null;
		};

		Chart.prototype.getCollectionPath = function () {
			var oBindingInfo = this.getBindingInfo("data");
			return oBindingInfo ? oBindingInfo.path : null;
		};

		Chart.prototype.done = function () {
			return this.oChartPromise;
		};

		/**
		 * Returns a Promise that resolves after the chart has been initialized after being created and after changing the type.
		 *
		 * @returns {Promise} A Promise that resolves after the chart has been initialized
		 * @public
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
		 * Fetches the current state of the chart (as a JSON)
		 *
		 * @protected
		 * @returns {Object} Current state of the chart
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

		return Chart;
	}, true);
