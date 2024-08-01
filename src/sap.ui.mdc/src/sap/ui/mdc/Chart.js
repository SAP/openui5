/*!
* ${copyright}
*/

sap.ui.define([
	"sap/ui/core/Lib",
	"sap/ui/mdc/Control",
	"./ChartRenderer",
	"sap/base/Log",
	"./chart/ToolbarControlFactory",
	"sap/ui/mdc/ActionToolbar",
	"./chart/PropertyHelper",
	"sap/ui/mdc/mixin/FilterIntegrationMixin",
	"sap/ui/model/base/ManagedObjectModel",
	"sap/ui/mdc/p13n/subcontroller/ChartItemController",
	"sap/ui/mdc/p13n/subcontroller/FilterController",
	"sap/ui/mdc/p13n/subcontroller/SortController",
	"sap/ui/mdc/p13n/subcontroller/ChartTypeController",
	"sap/ui/base/ManagedObjectObserver",
	"sap/ui/mdc/actiontoolbar/ActionToolbarAction",
	"sap/ui/core/library",
	"sap/ui/events/KeyCodes",
	"sap/ui/mdc/util/InfoBar",
	"sap/ui/core/format/ListFormat",
	"sap/ui/mdc/enums/ProcessingStrategy",
	"sap/ui/mdc/enums/ChartP13nMode",
	"sap/ui/mdc/enums/ChartToolbarActionType",
	"sap/ui/mdc/chart/SelectionButtonItem",
	"sap/ui/core/InvisibleMessage"
],
	(
		Library,
		Control,
		ChartRenderer,
		Log,
		ToolbarControlFactory,
		ActionToolbar,
		PropertyHelper,
		FilterIntegrationMixin,
		ManagedObjectModel,
		ChartItemController,
		FilterController,
		SortController,
		ChartTypeController,
		ManagedObjectObserver,
		ActionToolbarAction,
		coreLibrary,
		KeyCodes,
		InfoBar,
		ListFormat,
		ProcessingStrategy,
		ChartP13nMode,
		ChartToolbarActionType,
		SelectionButtonItem,
		InvisibleMessage
	) => {
		"use strict";

		const { TitleLevel } = coreLibrary;

		/**
		 * Constructor for a new Chart.
		 *
		 * @param {string} [sId] ID for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class The <code>Chart</code> control creates a chart based on metadata and the configuration specified.<br>
		 * <b>Note:</b> The inner chart needs to be created inside the <code>ChartDelegate</code>.
		 * @extends sap.ui.mdc.Control
		 * @borrows sap.ui.mdc.mixin.FilterIntegrationMixin.rebind as #rebind
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
		const Chart = Control.extend("sap.ui.mdc.Chart", /** @lends sap.ui.mdc.Chart.prototype */ {
			metadata: {
				library: "sap.ui.mdc",
				designtime: "sap/ui/mdc/designtime/chart/Chart.designtime",
				interfaces: [
					"sap.ui.mdc.IFilterSource", "sap.ui.mdc.IxState"
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
					 * Object related to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
					 * The object has the following properties:
					 * <ul>
					 * 	<li><code>name</code> defines the path to the <code>Delegate</code> module</li>
					 * 	<li><code>payload</code> (optional) defines application-specific information that can be used in the given delegate</li>
					 * </ul>
					 * <i>Sample delegate object:</i>
					 * <pre><code>{
					 * 	name: "sap/ui/mdc/BaseDelegate",
					 * 	payload: {}
					 * }</code></pre>
					 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
					 * Do not bind or modify the module. This property can only be configured during control initialization.
					 * @experimental
					 */
					delegate: {
						type: "object",
						group: "Data",
						defaultValue: {
							name: "sap/ui/mdc/ChartDelegate",
							payload: {}
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
					 * <b>Note:</b> This property must not be bound.<br>
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
					 * <b>Note</b>: Existing properties (set via <code>sap.ui.mdc.Chart#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/ChartDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
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
					 * Defines style of the header.
					 * For more information, see {@link sap.m.Title#setTitleStyle}.
					 * @since 1.120
					 */
					headerStyle: {
						type: "sap.ui.core.TitleLevel",
						group: "Appearance"
						// defaultValue : TitleLevel.Auto
					},

					/**
					 * Determines whether the header text is shown in the chart. Regardless of its value, the given header text is used to label the chart
					 * correctly for accessibility purposes.
					 *
					 * @since 1.111
					 */
					headerVisible: {
						type: "boolean",
						group: "Misc",
						defaultValue: true
					}
				},
				aggregations: {
					/**
					 * This property describes the measures and dimensions visible in the chart.
					 * Changes in the personalization are also reflected here.
					 * <b>Note:</b>
					 * This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not bindable.
					 * Any changes of the initial aggregation content might result in undesired effects.
					 * Changes of the aggregation have to be made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
					 */
					items: {
						type: "sap.ui.mdc.chart.Item",
						multiple: true
					},
					/**
					 * This aggregation describes actions that are added to the chart toolbar.<br>
					 * For more information, see {@link sap.ui.mdc.actiontoolbar.ActionToolbarAction}.
					 *
					 * <b>Note:</b>
					 * This aggregation is managed by the control, can only be populated during the definition in the XML view, and is not bindable.
					 * Any changes of the initial aggregation content might result in undesired effects.
					 * Changes of the aggregation have to be made with the {@link sap.ui.mdc.p13n.StateUtil StateUtil}.
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
						type: "sap.ui.mdc.ActionToolbar",
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
					 * Control or object that enables the chart to do filtering, such as {@link sap.ui.mdc.FilterBar}. See also
					 * {@link sap.ui.mdc.IFilter}.
					 *
					 * Automatic filter generation only works in combination with a <code>sap.ui.mdc.FilterBar</code>.
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

		const MDCRb = Library.getResourceBundleFor("sap.ui.mdc");

		FilterIntegrationMixin.call(Chart.prototype);

		/**
		 * An object literal describing a data property in the context of a {@link sap.ui.mdc.Chart}.
		 *
		 * When specifying the <code>PropertyInfo</code> objects in the {@link sap.ui.mdc.Chart#getPropertyInfo propertyInfo} property, the following
		 * attributes need to be specified:
		 * <ul>
		 *   <li><code>key</code></li>
		 *   <li><code>label</code></li>
		 *   <li><code>groupable</code></li>
		 *   <li><code>aggregatable</code></li>
		 *   <li><code>role</code></li>
		 *   <li><code>dataType</code></li>
		 * </ul>
		 *
		 * @typedef {sap.ui.mdc.util.PropertyInfo} sap.ui.mdc.chart.PropertyInfo
		 *
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
		 * @property {object} [textFormatter]
		 * 	The text formatter object which can be used to format the textProperty
		 * @property {object} [unitPath]
		 *  The name of the unit property which will be used to display and format measure values with a unit value on a selectionDetails popover
		 * @property {string} [timeUnitType]
		 *  The <code>timeUnitType</code> type for a <code>TimeDimension</code>. If set, a <code>TimeDimension</code> is created instead of a <code>Dimension</code>
		 * @public
		 * @experimental As of version 1.80
		 */


		/**
		 * Initialises the MDC Chart
		 *
		 * @private
		 */
		Chart.prototype.init = function() {
			this._oManagedObjectModel = new ManagedObjectModel(this);
			this.setModel(this._oManagedObjectModel, "$mdcChart");
			Control.prototype.init.apply(this, arguments);

			this._setPropertyHelperClass(PropertyHelper);
			this._setupPropertyInfoStore("propertyInfo");
		};

		Chart.prototype.setP13nMode = function(aModes) {
			let aSortedKeys = null;
			if (aModes && aModes.length >= 1) {
				aSortedKeys = [];
				const mKeys = aModes.reduce((mMap, sKey, iIndex) => {
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
			const oRegisterConfig = {
				controller: {}
			};

			const mRegistryOptions = {
				Item: new ChartItemController({ control: this }),
				Sort: new SortController({ control: this }),
				Filter: new FilterController({ control: this }),
				Type: new ChartTypeController({ control: this })
			};

			if (aMode && aMode.length > 0) {
				aMode.forEach((sMode) => {
					const sKey = sMode;
					const oController = mRegistryOptions[sMode];
					if (oController) {
						oRegisterConfig.controller[sKey] = oController;
					}
				});

				this.getEngine().register(this, oRegisterConfig);
			}

		};

		Chart.prototype.setFilterConditions = function(mConditions) {
			this.setProperty("filterConditions", mConditions, true);

			const oP13nFilter = this.getInbuiltFilter();
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
		Chart.prototype.applySettings = function(mSettings, oScope) {
			Control.prototype.applySettings.apply(this, arguments);

			this.initializedPromise = new Promise((resolve, reject) => {
				this._fnResolveInitialized = resolve;
				this._fnRejectInitialized = reject;
			});

			this.innerChartBoundPromise = new Promise((resolve, reject) => {
				this._fnResolveInnerChartBound = resolve;
				this._fnRejectInnerChartBound = reject;
			});

			const pLoadDelegate = this.initControlDelegate();

			const aInitPromises = [pLoadDelegate];

			if (this.isFilteringEnabled()) {
				aInitPromises.push(this.retrieveInbuiltFilter());
			}

			//TODO: Refactor this so we use awaitPropertyHelper
			Promise.all(aInitPromises).then(() => {
				if (!this.isDestroyed()) {
					this._initInnerControls();
				}
			});

		};

		/**
		 * Initializes the inner controls of the MDC chart (toolbar, inner chart)
		 * Inner chart is initialized via the delegate
		 */
		Chart.prototype._initInnerControls = function() {

			this.getControlDelegate().initializeInnerChart(this).then((oInnerChart) => {

				this.setBusyIndicatorDelay(0);

				this.getControlDelegate().createInitialChartContent(this);
				this._renderOverlay(true);

				if (this.getAutoBindOnInit()) {
					this.setBusy(true);
					this._createContentfromPropertyInfos(oInnerChart);
				}

				this.setAggregation("_innerChart", oInnerChart);

				if (this.getP13nMode().includes("Filter")) {
					this._initInfoToolbar();
				}

				this._bInnerChartReady = true;
				this._fnResolveInitialized();
				this.invalidate();

			}).catch((error) => {
				this._fnRejectInitialized(error);
			});

			//independent from fetchProperties

			this._createToolbarContent();
		};

		Chart.prototype._createToolbarContent = function() {
			const aP13nMode = this.getP13nMode() || [];
			const aIgnoreToolbarActions = this.getIgnoreToolbarActions();

			const bShowSelectionDetails = this.getShowSelectionDetails();
			const bShowDrillDown = (aP13nMode.includes("Item") && !(aIgnoreToolbarActions.length || aIgnoreToolbarActions.includes(ChartToolbarActionType.DrillDownUp)));
			const bShowLegend = !(aIgnoreToolbarActions.length || aIgnoreToolbarActions.includes(ChartToolbarActionType.Legend));
			const bShowZoom = !(aIgnoreToolbarActions.length || aIgnoreToolbarActions.includes(ChartToolbarActionType.ZoomInOut));
			const bShowSettings = aP13nMode.includes("Sort") || aP13nMode.includes("Item") || aP13nMode.includes("Filter");
			const bShowChartType = this._getTypeBtnActive();

			const header = this.getHeader();
			const headerStyle = this.getHeaderStyle();
			const headerLevel = this.getHeaderLevel();
			const headerVisible = this.getHeaderVisible();

			const beforeOpenDrillDown = function(oEvent) {
				const oViewByBtn = oEvent.getSource();
				oViewByBtn.removeAllItems();
				oViewByBtn.setSelectedItemKey("");

				const fnGetDrillStackDimensions = function(oChart) {
					const aDrillStack = oChart.getControlDelegate().getDrillStack(oChart);
					const aStackDimensions = [];

					aDrillStack.forEach((oStackEntry) => {
						// loop over nested dimension arrays
						oStackEntry.dimension.forEach((sDimension) => {
							if (sDimension != null && sDimension != "" && aStackDimensions.indexOf(sDimension) == -1) {
								aStackDimensions.push(sDimension);
							}
						});
					});

					return aStackDimensions;
				};

				const pSortedDimensionsPromise = this.getControlDelegate().getSortedDimensions(this);
				return pSortedDimensionsPromise.then((aSortedDimensions) => {
					// Ignore currently applied dimensions from drill-stack for selection
					const aIgnoreDimensions = fnGetDrillStackDimensions(this);
					aSortedDimensions = aSortedDimensions.filter((oDimension) => { return aIgnoreDimensions.indexOf(oDimension.name) < 0; });

					aSortedDimensions.forEach((oDimension) => {
						// oData.items.push({ text: oDimension.label, id: oDimension.name });
						oViewByBtn.addItem(new SelectionButtonItem({ key: oDimension.name, text: oDimension.label }));
					});
					oViewByBtn.setSearchEnabled(aSortedDimensions.length >= 7);
					oViewByBtn._openPopover(); // in this case the beforeOpen is not able to provide all item syncron
				});
			}.bind(this);

			const itemSelectedDrillDown = function(oEvent) {
				const sDimensionName = oEvent.getParameter("item").key;

				//Call flex to capture current state before adding an item to the chart aggregation
				this.getEngine().createChanges({
					control: this,
					key: "Item",
					state: [{
						name: sDimensionName,
						position: this.getItems().length
					}]
				});
			}.bind(this);

			const pressSettings = function() {
				const aP13nMode = this.getP13nMode();
				const iIdx = aP13nMode.indexOf("Type");
				if (iIdx > -1) {
					aP13nMode.splice(iIdx, 1);
				}

				//TODO: Move this to p13n functionality?
				if (this.isPropertyHelperFinal()) {
					this.getEngine().show(this, aP13nMode);
				} else {
					this.finalizePropertyHelper().then(() => {
						this.getEngine().show(this, aP13nMode);
					});
				}
			}.bind(this);

			const chartType = this.getChartType();

			const beforeOpenChartType = function(oEvent) {
				const oChartTypeBtn = oEvent.getSource();
				// use this to update the available ChartTypes
				const aAvailableChartTypes = this.getAvailableChartTypes();
				oChartTypeBtn.removeAllItems();
				aAvailableChartTypes.forEach((oChartType) => {
					oChartTypeBtn.addItem(
						new SelectionButtonItem({ key: oChartType.key, text: oChartType.text, icon: oChartType.icon })
					);
				});
				oChartTypeBtn.setSearchEnabled(aAvailableChartTypes.length >= 7);
			}.bind(this);

			const itemSelectedChartType = function(oEvent) {
				const oChartTypeBtn = oEvent.getSource();
				const sChartType = oEvent.getParameter("item").key;

				const oChartTypeInfo = this.getChartTypeInfo();
				const aAvailableChartTypes = this.getAvailableChartTypes();
				const [oChartType] = aAvailableChartTypes.filter((o) => { return o.key === sChartType; });

				oChartTypeBtn.setText(oChartType.text);
				oChartTypeBtn.setTooltip(oChartTypeInfo.text);
				oChartTypeBtn.setIcon(oChartType.icon);

				//TODO should be done in the chart, the control should only raise an event
				sap.ui.require([
					"sap/ui/mdc/flexibility/Chart.flexibility"
				], (ChartFlex) => {

					this.getEngine().createChanges({
						control: this,
						key: "Type",
						state: {
							properties: {
								chartType: sChartType
							}
						}
					}).then((vResult) => {
						this.getControlDelegate().requestToolbarUpdate(this);
					});

				});

			}.bind(this);


			const sId = this.getId();
			const oToolbar = this._getToolbar();

			/** add beginning **/
			this._oTitle = ToolbarControlFactory.createTitle(sId, { header: header, headerStyle: headerStyle, headerLevel: headerLevel, headerVisible: headerVisible }, oToolbar);
			oToolbar.addBegin(this._oTitle);

			/** variant management **/
			const oVariantManagement = this.getAggregation("variant");
			if (oVariantManagement && oToolbar) {
				const oCurrentVariantManagement = this.getVariant();
				if (oCurrentVariantManagement) {
					oToolbar.removeBetween(oCurrentVariantManagement);
				}
				oToolbar.addBetween(oVariantManagement);
				this._updateVariantManagementStyle();
			}

			if (bShowSelectionDetails) {
				this._oSelectionDetailsBtn = this._createSelectionDetails(sId);
				oToolbar.addEnd(this._oSelectionDetailsBtn);
			}

			if (bShowDrillDown) {
				this._oDrillDownBtn = ToolbarControlFactory.createDrillDownBtn(sId, { beforeOpen: beforeOpenDrillDown, itemSelected: itemSelectedDrillDown });
				// this._oDrillDownBtn.attachBeforeOpen(beforeOpenDrillDown);
				// this._oDrillDownBtn.attachItemSelected(itemSelectedDrillDown);
				oToolbar.addEnd(this._oDrillDownBtn);
			}

			if (bShowLegend) {
				this._oLegendBtn = ToolbarControlFactory.createLegendBtn(sId, { pressed: "{$mdcChart>/legendVisible}" });
				// this._oLegendBtn.bindProperty("pressed", {path: "$mdcChart>/legendVisible"});
				oToolbar.addEnd(this._oLegendBtn);
			}

			if (bShowZoom) {
				this._oZoomInBtn = ToolbarControlFactory.createZoomInBtn(sId, { press: this.zoomIn.bind(this) });
				oToolbar.addEnd(this._oZoomInBtn);

				this._oZoomOutBtn = ToolbarControlFactory.createZoomOutBtn(sId, { press: this.zoomOut.bind(this) });
				oToolbar.addEnd(this._oZoomOutBtn);
			}

			if (bShowSettings) {
				this._oSettingsBtn = ToolbarControlFactory.createSettingsBtn(sId, { press: pressSettings });
				oToolbar.addEnd(this._oSettingsBtn);
			}

			if (bShowChartType) {
				this._oChartTypeBtn = ToolbarControlFactory.createChartTypeBtn(sId, { selectedItemKey: chartType, beforeOpen: beforeOpenChartType, itemSelected: itemSelectedChartType });
				oToolbar.addEnd(this._oChartTypeBtn);
			}

			this._updateVariantManagementStyle();
		};

		Chart.prototype._createSelectionDetails = function(sId) {
			const fnActionPress = function(oEvent) {
				// extract binding information of each item
				const aItemContexts = [];
				oEvent.getParameter("items").forEach((oItem) => {
					aItemContexts.push(oItem.getBindingContext());
				});
				// Re-arrange event object and navigate to outer press handler
				this.fireSelectionDetailsActionPressed({
					id: oEvent.getParameter("id"),
					action: oEvent.getParameter("action"),
					itemContexts: aItemContexts,
					level: oEvent.getParameter("level")
				});
			}.bind(this);

			const oSelectionDetailsBtn = ToolbarControlFactory.createSelectionDetailsBtn(sId, {
				actionPress: fnActionPress,
				getSelectionDetailsActions: this.getSelectionDetailsActions.bind(this),
				enableNavCallback: (mData, oContext) => {
					return this.getControlDelegate().determineEnableNavForDetailsItem(this, mData, oContext);
				},
				fetchFieldInfosCallback: (oSelectionDetails, oBindingContext) => {
					return this.getControlDelegate().fetchFieldInfos(this, oSelectionDetails, oBindingContext);
				}
			});

			return oSelectionDetailsBtn;
		};

		Chart.prototype._initInfoToolbar = function() {
			this.setAggregation("_infoToolbar", new InfoBar(this.getId() + "--infoToolbar", {
				infoText: this._getFilterInfoText(),
				press: function() {
					this.finalizePropertyHelper().then(() => {
						return this.getEngine().show(this, "Filter");
					}).then((oP13nDialog) => {

						oP13nDialog.attachEventOnce("close", () => {

							const aConditions = this.getFilterConditions();
							const bNoConditions = !Object.keys(aConditions).find((oKey) => {
								return aConditions[oKey] && aConditions[oKey].length > 0;
							});

							if (bNoConditions && this.getAggregation("_toolbar")) {
								//TODO this.getAggregation("_toolbar").getSettingsButton().focus();
							}

						});
					});
				}.bind(this),
				removeAllFilters: function(oEvent) {
					//this will only reset to the last variant and not clear all filters. this.getEngine().reset(this, ["Filter"]);
					this.getEngine().createChanges({
						control: this,
						key: "Filter",
						state: {},
						applyAbsolute: ProcessingStrategy.FullReplace
					});
					//Focus handling, setting the focus back to the setting button
					//TODO this._getToolbar().getSettingsButton().focus();
				}.bind(this)
			}));

			if (this.getDomRef()) {
				this.getDomRef().setAttribute("aria-labelledby", this.getAggregation("_infoToolbar").getACCTextId());
			}
		};

		Chart.prototype._updateInfoToolbar = function() {
			if (this.getP13nMode().includes("Filter") && this.getAggregation("_infoToolbar")) {
				this.getAggregation("_infoToolbar").setInfoText(this._getFilterInfoText());
			}
		};

		Chart.prototype._getFilterInfoText = function() {
			if (this.getInbuiltFilter()) {
				let sText;
				const aFilterNames = this._getLabelsFromFilterConditions();
				const oListFormat = ListFormat.getInstance();

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
		Chart.prototype._createContentfromPropertyInfos = function(oInnerChart) {
			//Make sure all MDC Items have the necessary information to create a chart
			this.getControlDelegate().checkAndUpdateMDCItems(this).then(() => {
				//Create content on inner chart instance
				if (!this._oInnerChartContentPromise) {
					this._oInnerChartContentPromise = this.getControlDelegate().createInnerChartContent(this, this._innerChartDataLoadComplete.bind(this));
					this._oInnerChartContentPromise.then(() => {
						this._createBreadcrumbs();
						//From now on, listen to changes on Items Aggregation and sync them with inner chart
						this._oObserver?.disconnect();
						this._oObserver?.destroy();
						this._oObserver = new ManagedObjectObserver(this._propagateItemChangeToInnerChart.bind(this));
						this._oObserver.observe(this, {
							aggregations: [
								"items"
							]
						});

						//Sync MDC chart properties with inner chart
						this._propagatePropertiesToInnerChart();

						this._fnResolveInnerChartBound();
					});
				}
			});
		};

		Chart.prototype._createBreadcrumbs = function() {
			let _oBreadcrumbs = this.getAggregation("_breadcrumbs");
			if (!_oBreadcrumbs && !this._bIsDestroyed) {
				_oBreadcrumbs = ToolbarControlFactory.createDrillBreadcrumbs(this.getId(), {
					linkPressed: function(oEvent) {
						const index = oEvent.getParameter("index");

						// get drill-path which was drilled-up and needs to be removed from mdc chart
						const aCurrentDrillStack = this.getControlDelegate().getDrillableItems(this);
						const aDrilledItems = aCurrentDrillStack.slice(index + 1);
						const aFlexItemChanges = aDrilledItems.map((oDrillItem) => {
							return {
								name: oDrillItem.getPropertyKey(),
								visible: false
							};
						});

						this.getEngine().createChanges({
							control: this,
							key: "Item",
							state: aFlexItemChanges
						});

					}.bind(this)
				});

				const aItems = this.getControlDelegate().getDrillableItems(this).map((oItem) => { return { key: oItem.getPropertyKey(), text: oItem.getLabel() }; });
				_oBreadcrumbs.update(aItems);
				this.setAggregation("_breadcrumbs", _oBreadcrumbs);
			}
		};

		/**
		 * Loads the delegate for the MDC chart
		 * @returns {Promise} resolved when delegate is loaded
		 */
		Chart.prototype._loadDelegate = function() {

			return new Promise((resolve) => {
				const aNotLoadedModulePaths = [this.getDelegate().name];

				function onModulesLoadedSuccess(oDelegate) {
					resolve(oDelegate);
				}

				sap.ui.require(aNotLoadedModulePaths, onModulesLoadedSuccess);
			});

		};
		/**
		 * Gets whether filtering is enabled in the personalization dialog.
		 * @returns {boolean} <code>true</code> if filtering enabled, <code>false</code> if otherwise
		 *
		 * @private
		 */
		Chart.prototype.isFilteringEnabled = function() {
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
		Chart.prototype.getAdaptationUI = function() {
			return this.getControlDelegate().getAdaptionUI(this);
		};

		/**
		 * Propagates a change on the "item" aggregation to the inner chart via the delegate
		 * The delegate must then update the inner chart accordingly
		 *
		 * @param {object} oChange the change object from the ManagedObjectModel observer
		 */
		Chart.prototype._propagateItemChangeToInnerChart = function(oChange) {

			if (this._bIsDestroyed) {
				return; //Don't propagate changes when CHart is destroyed
			}

			this.setBusy(true);
			let iIndex;
			switch (oChange.mutation) {

				case "insert":

					if (oChange.child && oChange.child.getType()) {
						iIndex = this.getItems().filter((oItem) => { return oItem.getType() === oChange.child.getType(); }).indexOf(oChange.child);
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
			const aItems = this.getControlDelegate().getDrillableItems(this).map((oItem) => { return { key: oItem.getPropertyKey(), text: oItem.getLabel() }; });
			this.getAggregation("_breadcrumbs").update(aItems);
		};

		/**
		 * Rebinds the inner chart instance by calling oDelegate.rebind
		 *
		 * @param {boolean} [bForceRefresh] Indicates that the binding must be refreshed regardless of any <code>bindingInfo</code> change
		 * @returns {Promise} A <code>Promise</code> that resolves after rebind is executed
		 * @private
		 */
		Chart.prototype._rebind = async function(bForceRefresh) {

			if (!this._bInnerChartReady) {
				//TODO: This can lead to a race conditition when the "Go" button is pressed while the inner chart still intializes
				//TODO: Check whether we really need this since we insantiate the inner chart right away
				//this._initInnerControls();

				//Wait with rebind until inner chart is ready
				await this.initialized();
			}

			this.setBusy(true);

			if (!this.getControlDelegate().getInnerChartBound(this)) {
				this._createContentfromPropertyInfos();
				return;
			}

			const oChartDelegate = this.getControlDelegate();
			let oBindingInfo;
			if (oChartDelegate._getBindingInfo) {
				oBindingInfo = oChartDelegate._getBindingInfo(this);
				Log.warning("mdc Chart", "calling the private delegate._getBindingInfo. Please make the function public!");
			} else {
				oBindingInfo = oChartDelegate.getBindingInfo(this);
			}
			oChartDelegate.updateBindingInfo(this, oBindingInfo); //Applies filters
			oChartDelegate.rebind(this, oBindingInfo);
		};

		Chart.prototype._onFilterSearch = function(oEvent) {
			this._bAnnounceUpdate = true;
		};

		/**
		 * Provides an additional announcement for the screen reader to inform the user that the chart
		 * has been updated.
		 *
		 * @param {string} sChartType The current chart type to be announced
		 * @param {string} sHeader The header text to be announced
		 * @param {int} [iDimensions] The dimension count
		 * @param {int} [iMeasures] The measure count
		 * @private
		 * @since 1.123
		 */
		Chart.prototype._announceUpdate = function(sChartType, sHeader, iDimensions, iMeasures) {
			if (!this._bAnnounceUpdate) {
				return;
			}
			this._bAnnounceUpdate = false;
			const oInvisibleMessage = InvisibleMessage.getInstance();

			if (oInvisibleMessage) {
				const oResourceBundle = MDCRb;
				const aAvailableChartTypes = this.getAvailableChartTypes();
				const [oChartType] = aAvailableChartTypes.filter((o) => { return o.key === sChartType; });
				sChartType = oChartType?.text || sChartType;

				let sMsg = oResourceBundle.getText("chart.ANNOUNCEMENT_UPDATED", [sHeader, sChartType]);
				let sResourceKey;

				if (iDimensions && iMeasures) {
					if (iDimensions === 1 && iMeasures === 1) {
						sResourceKey = "chart.ANNOUNCEMENT_DIMMEA_11_UPDATED";
					} else if (iDimensions > 1 && iMeasures === 1) {
						sResourceKey = "chart.ANNOUNCEMENT_DIMMEA_N1_UPDATED";
					} else if (iDimensions === 1 && iMeasures > 1) {
						sResourceKey = "chart.ANNOUNCEMENT_DIMMEA_1N_UPDATED";
					} else {
						sResourceKey = "chart.ANNOUNCEMENT_DIMMEA_NN_UPDATED";
					}

					sMsg += " " + oResourceBundle.getText(sResourceKey, [iDimensions, iMeasures]);
				}
				oInvisibleMessage.announce(sMsg);
			}
		};


		/**
		 * Creates a new instance of ChartToolbar
		 *
		 * @private
		 */
		Chart.prototype._getToolbar = function() {
			if (this.getAggregation("_toolbar")) {
				return this.getAggregation("_toolbar");
			} else if (!this._bIsDestroyed) {
				const oToolbar = new ActionToolbar(this.getId() + "--toolbar", {
					design: "Transparent",
					enabled: false
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
		Chart.prototype._updateToolbar = function() {
			const oToolbar = this.getAggregation("_toolbar");
			if (oToolbar) {
				if (!oToolbar.getEnabled()) {
					oToolbar.setEnabled(true);
				}
				this._updateZoomButtons();

				// this must be called only once from the delegate
				this._initSelectionDetails();
			} else {
				Log.warning("Trying to update Chart Toolbar, but toolbar is not yet initialized. This will not work!");
			}
		};

		/**
		 * This checks the enablement of the zoom button in the toolbar.
		 *
		 * @experimental
		 * @private
		 */
		Chart.prototype._updateZoomButtons = function() {
			const oZoomInBtn = this._oZoomInBtn;
			const oZoomOutBtn = this._oZoomOutBtn;

			if (!oZoomInBtn || !oZoomOutBtn) {
				return;
			}

			const oZoomState = this.getControlDelegate().getZoomState(this);

			if (oZoomState?.enabled) {
				const bInFocused = document.activeElement === oZoomInBtn.getDomRef();
				const bOutFocused = document.activeElement === oZoomOutBtn.getDomRef();

				oZoomInBtn.setEnabled(oZoomState.enabledZoomIn);
				oZoomOutBtn.setEnabled(oZoomState.enabledZoomOut);

				// toggle the focus between zoom buttons when the currecnt is disabled
				if (!oZoomState.enabledZoomIn && bInFocused) {
					oZoomOutBtn.focus();
				}
				if (!oZoomState.enabledZoomOut && bOutFocused) {
					oZoomInBtn.focus();
				}
			} else {
				oZoomInBtn.setEnabled(false);
				oZoomOutBtn.setEnabled(false);
			}

		};


		Chart.prototype._initSelectionDetails = function() {
			const oSelectionDetailsBtn = this._oSelectionDetailsBtn;
			if (oSelectionDetailsBtn && !oSelectionDetailsBtn._oChangeHandler) {
				const oSelectionHandler = this.getSelectionHandler();
				if (oSelectionHandler) {
					//This can be called multiple times, but only the first will be used
					oSelectionDetailsBtn.attachSelectionHandler(oSelectionHandler.eventId, oSelectionHandler.listener);
				}
			}
		};

		/**
		 * Returns the instance of the inner chart from the delegate
		 * @returns {sap.core.Control} the instance of the inner chart
		 *
		 * @private
		 */
		Chart.prototype._getInnerChart = function() {
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
		Chart.prototype.initialized = function() {
			return this.initializedPromise;
		};

		/**
		 * Can be used to check whether the inner chart is initialized and bound.
		 * @returns {Promise} Promise that resolves once MDC chart is bound
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.fe
		 */
		Chart.prototype.innerChartBound = function() {
			return this.innerChartBoundPromise;
		};

		/**
		 * Zooms in the inner chart.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.zoomIn = function() {
			this.getControlDelegate().zoomIn(this);
			this._updateZoomButtons();
		};

		/**
		 * Zooms out the inner chart.
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.zoomOut = function() {
			this.getControlDelegate().zoomOut(this);
			this._updateZoomButtons();
		};


		/**
		 * Retrieves the selection handler of the inner chart.
		 * @returns {object} Selection handler of the inner chart
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
		 */
		Chart.prototype.getSelectionHandler = function() {
			return this.getControlDelegate().getInnerChartSelectionHandler(this);
		};

		/**
		 * Retrieves the chart type layout configuration.
		 * <b>Note:</b> This is only used inside personalization.
		 *
		 * @returns {object} Layout configuration
		 *
		 * @private
		 * @ui5-restricted sap.ui.mdc
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

		Chart.prototype.setLegendVisible = function(bVisible) {
			this.setProperty("legendVisible", bVisible);

			//Skip if no control delegate; gets propagated by _propagatePropertiesToInnerChart after init
			try {
				this.getControlDelegate().setLegendVisible(this, bVisible);
			} catch (e) {
				Log.info("Trying to set legend visiblity for Chart before delegate was initialized");
			}


			return this;
		};

		Chart.prototype.setShowChartTooltip = function(bValue) {
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
		 * If some properties are set on the MDC chart while the inner chart is not yet initialized, they need to eb set after initialaization.
		 * This methods gets called after inner chart is ready and takes care of that
		 *
		 * @private
		 */
		Chart.prototype._propagatePropertiesToInnerChart = function() {
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
		Chart.prototype.getChartTypeInfo = function() {
			return this.getControlDelegate().getChartTypeInfo(this);
		};

		/**
		 * Gets the available chart types for the current state of the inner chart
		 *
		 * @returns {array} Array containing the available chart types
		 *
		 * @private
		 */
		Chart.prototype.getAvailableChartTypes = function() {
			return this.getControlDelegate().getAvailableChartTypes(this);
		};


		/**
		 * Sets the MDC chart to a specific chart type
		 * @param {string} sChartType the name of the new chart type
		 * @returns {sap.ui.mdc.Chart} reference to <code>this</code> in order to allow method chaining
		 */
		Chart.prototype.setChartType = function(sChartType) {
			this.setProperty("chartType", sChartType);

			const oChartTypeButton = this._oChartTypeBtn;
			if (oChartTypeButton) {
				oChartTypeButton.setSelectedItemKey(sChartType);
				const oChartTypeInfo = this.getChartTypeInfo();
				oChartTypeButton.setTooltip(oChartTypeInfo.text);
				oChartTypeButton.setIcon(oChartTypeInfo.icon);
			}

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

		/**
		 * Gets the managed object model.
		 * @returns {sap.ui.model.base.ManagedObjectModel} the managed object model
		 *
		 * @private
		 */
		Chart.prototype.getManagedObjectModel = function() {
			return this._oManagedObjectModel;
		};

		/**
		 * This is a callback function which is called from the delegate once the inner chart finished loading data
		 * Updates the Toolbar
		 * Fires the innerChartLoadedData event
		 *
		 * @private
		 */
		Chart.prototype._innerChartDataLoadComplete = function() {
			this._checkStyleClassesForDimensions();
			this.setBusy(false);
			this._renderOverlay(false);

			this.getControlDelegate().requestToolbarUpdate(this);
		};

		Chart.prototype._checkStyleClassesForDimensions = function() {
			const _oBreadcrumbs = this.getAggregation("_breadcrumbs");
			const bHasDimension = _oBreadcrumbs?.getVisible() && // breadcrump must be visible and dimension exist
				this.getItems().some((oItem) => { return oItem.getType() === "groupable"; });

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
		Chart.prototype.getCurrentState = function() {
			const oState = {};
			const aP13nMode = this.getP13nMode();

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
		Chart.prototype._getVisibleProperties = function() {
			const aProperties = [];
			this.getItems().forEach((oItem) => {
				const sPropertyKey = oItem.getPropertyKey();
				aProperties.push({
					key: sPropertyKey,
					name: sPropertyKey,
					role: oItem.getRole() // TODO: not part of sap.ui.mdc.State?
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
		Chart.prototype._getSortedProperties = function() {
			return this.getSortConditions() ? this.getSortConditions().sorters : [];
		};

		Chart.prototype._getTypeBtnActive = function() {
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

		const fCheckIfRebindIsRequired = function(aAffectedP13nControllers) {
			let bRebindRequired = false;
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

		Chart.prototype._onModifications = async function(aAffectedP13nControllers) {
			if (fCheckIfRebindIsRequired(aAffectedP13nControllers)) {
				await this.rebind();
			}
		};

		Chart.prototype.setVariant = function(oVariantManagement) {
			this.setAggregation("variant", oVariantManagement);

			//Only add VM directly when Toolbar already exists; otherwise VM will be added during init of toolbar
			const oToolbar = this.getAggregation("_toolbar");
			if (oVariantManagement && oToolbar) {
				const oCurrentVariantManagement = this.getVariant();
				if (oCurrentVariantManagement) {
					oToolbar.removeBetween(oCurrentVariantManagement);
				}
				oToolbar.addBetween(oVariantManagement);
				this._updateVariantManagementStyle();
			}

			return this;
		};

		Chart.prototype.getVariant = function() {
			let oVariantManagement;
			const oToolbar = this.getAggregation("_toolbar");
			if (oToolbar) {
				[oVariantManagement] = oToolbar.getBetween().filter((oControl) => oControl.isA("sap.ui.fl.variants.VariantManagement"));
			} else {
				oVariantManagement = this.getAggregation("variant");
			}
			return oVariantManagement;
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

		Chart.prototype.setHeader = function(sHeader) {
			this.setProperty("header", sHeader);

			const oToolbar = this.getAggregation("_toolbar");

			this._oTitle?.setText(sHeader);
			oToolbar?._oInvTitle?.setText(sHeader);

			return this;
		};

		Chart.prototype.setHeaderLevel = function(sHeaderLevel) {
			this.setProperty("headerLevel", sHeaderLevel);

			this._oTitle?.setLevel(sHeaderLevel);
			this._updateVariantManagementStyle();

			return this;
		};

		Chart.prototype.setHeaderStyle = function(sHeaderStyle) {
			this.setProperty("headerStyle", sHeaderStyle);

			this._oTitle?.setTitleStyle(sHeaderStyle);
			this._updateVariantManagementStyle();

			return this;
		};

		Chart.prototype.setHeaderVisible = function(bVisible) {
			this.setProperty("headerVisible", bVisible, true);

			this._oTitle?.setVisible(bVisible);
			this._updateVariantManagementStyle();

			return this;
		};


		Chart.prototype._updateVariantManagementStyle = function() {
			const oVariantManagement = this.getVariant();

			if (oVariantManagement) {
				oVariantManagement.setShowAsText(this.getHeaderVisible());
				oVariantManagement.setTitleStyle(this.getHeaderStyle());
				oVariantManagement.setHeaderLevel(this.getHeaderLevel());
			}
		};


		Chart.prototype.onkeydown = function(oEvent) {
			if (oEvent.isMarked()) {
				return;
			}

			if ((oEvent.metaKey || oEvent.ctrlKey) && oEvent.which === KeyCodes.COMMA) {
				// CTRL (or Cmd) + COMMA key combination to open the table personalisation dialog
				const oSettingsBtn = this._oSettingsBtn;
				if (oSettingsBtn && oSettingsBtn.getVisible() && oSettingsBtn.getEnabled()) {
					oSettingsBtn.firePress();

					// Mark the event to ensure that parent handlers (e.g. FLP) can skip their processing if needed. Also prevent potential browser defaults
					// (e.g. Cmd+, opens browser settings on Mac).
					oEvent.setMarked();
					oEvent.preventDefault();
				}
			}

		};

		Chart.prototype.exit = function() {
			delete this._oTitle;
			delete this._oSelectionDetailsBtn;
			delete this._oDrillDownBtn;
			delete this._oLegendBtn;
			delete this._oZoomInBtn;
			delete this._oZoomOutBtn;
			delete this._oSettingsBtn;
			delete this._oChartTypeBtn;

			delete this.innerChartBoundPromise;
			delete this._fnResolveInnerChartBound;
			delete this._fnRejectInnerChartBound;

			delete this.initializedPromise;
			delete this._fnResolveInitialized;
			delete this._fnRejectInitialized;

			delete this._oInnerChartContentPromise;

			const oToolbar = this.getAggregation("_toolbar");
			oToolbar?._oInvTitle?.destroy();

			Control.prototype.exit.apply(this, arguments);

			this._oObserver?.destroy();
			delete this._oObserver;
		};

		/**
		 * @name sap.ui.mdc.Chart#addAction
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#destroyActions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#insertAction
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#removeAction
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#removeAllActions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#addItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#destroyItems
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#insertItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#removeItem
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#removeAllItems
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#setSortConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#getSortConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#setFilterConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#getFilterConditions
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#setPropertyInfo
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		/**
		 * @name sap.ui.mdc.Chart#getPropertyInfo
		 * @private
		 * @ui5-restricted sap.ui.mdc, sap.ui.fl
		 */

		return Chart;
	});