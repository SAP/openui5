/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/ui/mdc/AggregationBaseDelegate", "sap/ui/mdc/mixin/delegate/FilterIntegrationDefault"
], (AggregationBaseDelegate, FilterIntegrationDefault) => {
	"use strict";

	/**
	 * Base Delegate for {@link sap.ui.mdc.Chart Chart}. Extend this object in your project to use all functionalities of the {@link sap.ui.mdc.Chart Chart}.<br>
	 * This class provides method calls, that are called by the <code>Chart</code> for specific operations and overwrite the internal behavior.
	 *
	 * @namespace
	 * @author SAP SE
	 * @alias module:sap/ui/mdc/ChartDelegate
	 * @extends module:sap/ui/mdc/AggregationBaseDelegate
	 * @mixes module:sap/ui/mdc/mixin/delegate/FilterIntegrationDefault
	 * @since 1.88
	 * @public
	 * @experimental As of version 1.88
	 *
	 */
	const ChartDelegate = Object.assign({}, AggregationBaseDelegate, FilterIntegrationDefault);

	/**
	 * Returns filters to be applied when updating the chart's binding based on the
	 * filter conditions of the chart itself and it's associated {@link sap.ui.mdc.IFilterSource IFilterSource}.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.model.Filter[]} Array of filters
	 * @function
	 * @name module:sap/ui/mdc/ChartDelegate.getFilters
	 * @since 1.121
	 * @protected
	 */

	/**
	 * Notifies the inner chart to zoom in.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 *
	 * @public
	 */
	ChartDelegate.zoomIn = function(oChart) { };

	/**
	 * Notifies the inner chart to zoom out.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 *
	 * @public
	 */
	ChartDelegate.zoomOut = function(oChart) { };

	/**
	 * Chart <code>ZoomState</code> type.
	 *
	 * @typedef {object} sap.ui.mdc.chart.ZoomState
	 * @property {boolean} enabled Zooming is enabled if set to <code>true</code>
	 * @property {number} currentZoomLevel Current zoom level of the chart in percent (between 0 and 1)
	 * @experimental As of version 1.80
	 * @public
	 */

	/**
	 * Gets the current zooming information for the inner chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.mdc.chart.ZoomState} Current <code>ZoomState</code> of the inner chart
	 *
	 * @public
	 */
	ChartDelegate.getZoomState = function(oChart) { };

	/**
	 * Returns the filter delegate of the chart that provides basic filter functionality, such as adding filter fields.
	 * <b>Note:</b> The functionality provided in this delegate acts as a subset of a <code>FilterBarDelegate</code> to enable the chart for inbuilt
	 * filtering.
	 *
	 * @example <caption>Example usage of <code>getFilterDelegate</code></caption>
	 * oFilterDelegate = {
	 * 		addItem: function() {
	 * 			var oFilterFieldPromise = new Promise(...);
	 * 			return oFilterFieldPromise;
	 * 		}
	 * }
	 * @returns {{addItem: (function(sap.ui.mdc.Chart, string): Promise<sap.ui.mdc.FilterField>)}} Object for the chart filter personalization
	 * @protected
	 */
	ChartDelegate.getFilterDelegate = function() {
		return {

			/**
			 * Creates an instance of a <code>sap.ui.mdc.FilterField</code>.
			 *
			 * @param {sap.ui.mdc.Control} oControl Instance of the control
			 * @param {string} sPropertyName The property name
			 * @returns {Promise<sap.ui.mdc.FilterField>} <code>Promise</code> that resolves with an instance of a <code>sap.ui.mdc.FilterField</code>.
			 * @see sap.ui.mdc.AggregationBaseDelegate#addItem
			 */
			addItem: function(oControl, sPropertyName) {
				return Promise.resolve();
			},

			/**
			 * This method is called when an <code>AddCondition</code> change is applied by the personalization.
			 * It can be used to perform tasks, such as caching information or modifying the control.
			 *
			 * @param {sap.ui.mdc.Control} oControl Instance of the control
			 * @param {string} sPropertyName Name of a property
			 * @param {Object} mPropertyBag Instance of property bag from the SAPUI5 flexibility API
			 * @returns {Promise} <code>Promise</code> that resolves once the properyInfo property has been updated
			 *
			 * @experimental
			 * @private
			 * @ui5-restricted sap.fe, sap.ui.mdc
			 */
			addCondition: function(oControl, sPropertyName, mPropertyBag) {
				return Promise.resolve();
			},

			/**
			 * This method is called when a <code>RemoveCondition</code> change is applied by the personalization.
			 * It can be used to perform tasks, such as caching information or modifying the control.
			 *
			 * @param {sap.ui.mdc.Control} oControl Instance of the control
			 * @param {string} sPropertyName Name of a property
			 * @param {Object} mPropertyBag Instance of property bag from the SAPUI5 flexibility API
			 * @returns {Promise} <code>Promise</code> that resolves once the properyInfo property has been updated
			 *
			 * @experimental
			 * @private
			 * @ui5-restricted sap.fe, sap.ui.mdc
			 */
			removeCondition: function(oControl, sPropertyName, mPropertyBag) {
				return Promise.resolve();
			}
		};
	};

	/**
	 * Creates a new chart item for a given property name and updates the inner chart.<br>
	 * <b>Note:</b> This does <b>not</b> add the chart item to the <code>Items</code> aggregation of the chart.
	 * Called and used by <code>p13n</code>.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart to add the property to
	 * @param {string} sPropertyName The name of the property added
	 * @param {object} mPropertyBag The property bag containing useful information about the change
	 * @param {string} [sRole] New role for given item
	 * @returns {Promise<sap.ui.mdc.chart.Item>} <code>Promise</code> that resolves with new chart <code>Item</code> as parameter
	 *
	 * @public
	 */
	ChartDelegate.addItem = function(oChart, sPropertyName, mPropertyBag, sRole) {
		return Promise.resolve();
	};

	/**
	 * Removes an existing chart item for a given property name and updates the inner chart.
	 * Called and used by <code>p13n</code>.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart from which property is removed
	 * @param {sap.ui.mdc.chart.Item} oItem The <code>item</code> that is removed from the chart
	 * @param {object} mPropertyBag The property bag containing useful information about the change
	 * @returns {Promise<boolean>} <code>Promise</code> containing information whether the item was deleted
	 *
	 * @public
	 */
	ChartDelegate.removeItem = function(oChart, oItem, mPropertyBag) {
		return Promise.resolve(true);
	};

	/**
	 * Event handler for <code>SelectionDetails</code> popover.
	 *
	 * @typedef {object} sap.ui.mdc.chart.SelectionDetails
	 * @property {string} eventId  ID of the selection event
	 * @property {sap.ui.core.Control} listener Reference to inner chart
	 * @experimental As of version 1.80
	 * @public
	 */

	/**
	 * Returns the event handler for <code>SelectionDetails</code> as an object.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.mdc.chart.SelectionDetails} Event handler for SelectionDetails
	 *
	 * @public
	 */
	ChartDelegate.getInnerChartSelectionHandler = function(oChart) { };

	/**
	 * Sets the visibility of the legend.
	 * <b>Note:</b> This function is called by the chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#setLegendVisible LegendVisible} instead.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Chart for which the legend visibility is set
	 * @param {boolean} bVisible Shows legend, if set to <code>true</code>
	 *
	 * @public
	 */
	ChartDelegate.setLegendVisible = function(oChart, bVisible) { };

	/**
	 * Inserts a chart item (measure / dimension for <code>sap.chart.Chart</code>) into the inner chart.<br>
	 * This function is called by the chart for a change of the <code>Items</code> aggregation.<br>
	 * <b>Note:</b> Do not call this yourself, as it would not be synced with the chart, but insert the item into the chart instead.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Chart into which the item is insert
	 * @param {sap.ui.mdc.chart.Item} oChartItem Chart item that is inserted into the inner chart
	 * @param {int} iIndex The index into which the chart item is inserted
	 *
	 * @public
	 */
	ChartDelegate.insertItemToInnerChart = function(oChart, oChartItem, iIndex) { };

	/**
	 * Removes a chart item (measure / dimension for <code>sap.chart.Chart</code>) from the inner chart.<br>
	 * This function is called by the chart for a change of the <code>Items</code> aggregation.<br>
	 * <b>Note:</b> Do not call this yourself, as it would not be synced with the chart, but remove the item from the chart instead.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Chart from which the item is removed
	 * @param {sap.ui.mdc.chart.Item} oChartItem Chart item that is removed from the inner chart
	 *
	 * @public
	 */
	ChartDelegate.removeItemFromInnerChart = function(oChart, oChartItem) { };

	/**
	 * Loads the required libraries and creates the inner chart.<br>
	 * By default, the method returns <code>Promise.reject()</code>.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {Promise} Resolved once the inner chart has been initialized
	 *
	 * @public
	 */
	ChartDelegate.initializeInnerChart = function(oChart) {
		return Promise.reject();
	};

	/**
	 * Creates the initial content for the chart before the metadata is retrieved.<br>
	 * This can be used by chart libraries that can already show some information without the actual data (for example, axis labels, legend, ...).
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 *
	 * @public
	 */
	ChartDelegate.createInitialChartContent = function(oChart) { };

	/**
	 * Returns the instance of the inner chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
	 * @returns {sap.ui.core.Control} Instance of the inner chart
	 *
	 * @public
	 */
	ChartDelegate.getInnerChart = function(oChart) { };

	/**
	 * Chart <code>ChartTypeObject</code> type.
	 *
	 * @typedef {object} sap.ui.mdc.chart.ChartTypeObject
	 * @property {string} key Unique key of the chart type
	 * @property {sap.ui.core.URI} icon URI for the icon for the current chart type
	 * @property {string} text Name of the current chart type
	 * @property {boolean} selected Whether the chart type is the one currently used
	 * @experimental As of version 1.80
	 * @public
	 */

	/**
	 * Returns the current chart type.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the MDC chart
	 * @returns {sap.ui.mdc.chart.ChartTypeObject[]} Information about the current chart type
	 * @throws {Error} Error thrown if inner chart is not initialized yet
	 *
	 * @public
	 */
	ChartDelegate.getChartTypeInfo = function(oChart) { };

	/**
	 * Gets the available chart types for the current state of the inner chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.mdc.chart.ChartTypeObject[]} Array containing the currently available chart types
	 *
	 * @public
	 */
	ChartDelegate.getAvailableChartTypes = function(oChart) { };


	/**
	 * Chart <code>ChartTypeLayoutConfig</code> type.
	 *
	 * @typedef {object} sap.ui.mdc.chart.ChartTypeLayoutConfig
	 * @property {string} key identifier for the chart type
	 * @property {string[]} allowedLayoutOptions Layout configuration of chart type
	 * @experimental As of version 1.80
	 * @public
	 */

	/**
	 * This function is used by <code>P13n</code> to determine which chart type supports which layout options.
	 * There might be chart types that do not support certain layout options (for example, "Axis3").
	 *
	 * @returns {sap.ui.mdc.chart.ChartTypeLayoutConfig[]} chart type layout config
	 *
	 * @public
	 */
	ChartDelegate.getChartTypeLayoutConfig = function() { };

	/**
	 * Returns the current drilling stack of the inner chart.<br>
	 * The returned objects need at least a <code>label</code> and a <code>name</code> property.<br>
	 * Also, a <code>dimension</code> array containing the dimension drill stack at the current level is required.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {array} Array containing the drill stack
	 *
	 * @public
	 */
	ChartDelegate.getDrillStack = function(oChart) { };

	/**
	 * Returns all sorted dimensions of an inner chart.
	 * This is used to determine possible drill-down dimensions in the drill-down popover of the chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {Promise<sap.ui.mdc.chart.Item[]>} <code>Promise</code> containing an array of dimensions that is sorted
	 *
	 * @public
	 */
	ChartDelegate.getSortedDimensions = function(oChart) { };

	/**
	 * Determines which MDC items are drillable and returns them.
	 * This function is used by the breadcrumb navigation.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.mdc.chart.Item[]} Array of MDC items that are drillable
	 *
	 * @public
	 */
	ChartDelegate.getDrillableItems = function(oChart) { };

	/**
	 * Sets the chart type of the inner chart.
	 * This function is called by the chart when the <code>chartType</code> property is updated.
	 * <b>Note:</b> This function is called by the chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#chartType chartType} instead.
	 *
	 * @param {string} sChartType New chart type
	 *
	 * @public
	 */
	ChartDelegate.setChartType = function(sChartType) { };

	/**
	 * This method is called to update the no data structure.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 *
	 * @public
	 */
	ChartDelegate.changedNoDataStruct = function(oChart) { };

	/**
	 * Sets a "No Data" text for the inner chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to chart
	 * @param {string} sText Text to show when there is no data displayed in the chart
	 *
	 * @public
	 */
	ChartDelegate.setNoDataText = function(oChart, sText) { };

	/**
	 * Binds the inner chart to the back-end data and creates the inner chart content.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {function} fnCallbackDataLoaded Callback function when data is loaded
	 *
	 * @public
	 */
	ChartDelegate.createInnerChartContent = function(oChart, fnCallbackDataLoaded) { };


	/**
	 * Checks the binding of the chart and rebinds it if required.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo BindingInfo of the chart
	 *
	 * @public
	 */
	ChartDelegate.rebind = function(oChart, oBindingInfo) { };

	/**
	 * Returns the information whether the inner chart is currently bound.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {boolean} <code>true</code> if inner chart is bound; <code>false</code> if not
	 *
	 * @public
	 */
	ChartDelegate.getInnerChartBound = function(oChart) { };


	/**
	 * Returns the binding info for given chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.base.ManagedObject.AggregationBindingInfo} BindingInfo object
	 *
	 * @public
	 */
	ChartDelegate.getBindingInfo = function(oChart) { };

	/**
	 * Updates the binding info with the relevant filters.<br>
	 * By default, this method updates a given {@link sap.ui.base.ManagedObject.AggregationBindingInfo AggregationBindingInfo} with the return value from the delegate's own {@link module:sap/ui/mdc/ChartDelegate.getFilters getFilters}.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.base.ManagedObject.AggregationBindingInfo} oBindingInfo Binding info of the chart
	 *
	 * @public
	 */
	ChartDelegate.updateBindingInfo = function(oChart, oBindingInfo) {
		oBindingInfo.filters = this.getFilters(oChart);
	};

	/**
	 * Sets tooltips to visible/invisible for the inner chart.
	 * <b>Note:</b> This function is called by the chart only. You must not call it directly but use {@link sap.ui.mdc.Chart#setShowChartTooltip setShowChartTooltip} instead.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {boolean} bVisible <code>true</code> for visible, <code>false</code> for invisible
	 *
	 * @public
	 */
	ChartDelegate.setChartTooltipVisibility = function(oChart, bVisible) { };

	/**
	 * This function returns an ID that should be used in the internal chart for the Measure/Dimension.<br>
	 * For standard cases, this is just the ID of the property.<br>
	 * If it is necessary to use another ID internally inside the chart (for example, for duplicate property IDs) this method can be overwritten.<br>
	 * In this case, <code>getPropertyFromNameAndKind</code> needs to be overwritten as well.
	 *
	 * @param {string} sName ID of the property
	 * @param {string} sKind Type of the property (Measure/Dimension)
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {string} Internal ID for the sap.chart.Chart
	 *
	 * @public
	 */
	ChartDelegate.getInternalChartNameFromPropertyNameAndKind = function(sName, sKind, oChart) { };

	/**
	 * Maps an ID of an internal chart dimension/measure and type of a property to its corresponding property entry.
	 *
	 * @param {string} sName ID of internal chart measure/dimension
	 * @param {string} sKind Kind of the property
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {sap.ui.mdc.chart.PropertyInfo} PropertyInfo object
	 *
	 * @public
	 */
	ChartDelegate.getPropertyFromNameAndKind = function(sName, sKind, oChart) { };

	/**
	 * Returns the relevant property info based on the metadata used with the chart instance.
	 *
	 * <b>Note:</b>
	 * The result of this function must be kept stable throughout the lifecycle of your application.
	 * Any changes of the returned values might result in undesired effects.
	 *
	 * <b>Note</b>: Existing properties (set via <code>sap.ui.mdc.Chart#setPropertyInfo</code>) must not be removed and their attributes must not be changed during the {@link module:sap/ui/mdc/ChartDelegate.fetchProperties fetchProperties} callback. Otherwise validation errors might occur whenever personalization-related control features (such as the opening of any personalization dialog) are activated.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @returns {Promise<sap.ui.mdc.chart.PropertyInfo[]>} Array of the property infos that is used within the chart
	 *
	 * @public
	 */
	ChartDelegate.fetchProperties = function(oChart) {
		return Promise.resolve([]);
	};

	/**
	 * Adds/Removes the busy overlay shown above the inner chart.
	 *
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {boolean} bShow Shows overlay if set to <code>true</code>
	 *
	 * @public
	 */
	ChartDelegate.showOverlay = function(oChart, bShow) { };

	/**
	 * Determines if a given <code>SelectionDetailsItem</code> is enabled.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {array} mData The data array of the selected item
	 * @param {sap.ui.model.Context | undefined} oContext Binding context of the item in the selection. This is undefined if no binding is used
	 * @returns {boolean} Boolean value that is forwarded to the enableNav property of the <code>SelectionDetailsItem</code>
	*/
	ChartDelegate.determineEnableNavForDetailsItem = (oChart, mData, oContext) => {
		return false;
	};

	/**
	 * The provided map is used to determine the navigation behavior of the {@link sap.ui.mdc.chart.ChartSelectionDetails}.
	 * The navigation shows a list of all entries if more than 1 entry of {@link sap.ui.mdc.field.FieldInfoBase} is given in the map.
	 * If there is only one entry, the navigation goes directly to the content of the given {@link sap.ui.mdc.field.FieldInfoBase}.
	 * @param {sap.ui.mdc.Chart} oChart Reference to the chart
	 * @param {sap.ui.mdc.chart.ChartSelectionDetails} oSelectionDetails Instance of the {@link sap.ui.mdc.chart.ChartSelectionDetails}
	 * @param {sap.ui.model.Context} oBindingContext Binding context of the <code>SelectionDetailsItem</code> to which is navigated
	 * @returns {Promise<Map<string, sap.ui.mdc.field.FieldInfoBase>>} Promise resolving in a <code>Map</code> containing a Name as key and a {@link sap.ui.mdc.field.FieldInfoBase} as value
	 */
	ChartDelegate.fetchFieldInfos = (oChart, oSelectionDetails, oBindingContext) => {
		return {};
	};

	return ChartDelegate;
});