/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/mdc/AggregationBaseDelegate",
	"sap/ui/base/SyncPromise",
	"sap/ui/mdc/chart/MeasureItem",
	"sap/ui/mdc/chart/DimensionItem",
	"sap/ui/core/Core",
	"sap/ui/mdc/util/FilterUtil"
], function(
	AggregationBaseDelegate,
	SyncPromise,
	MeasureItem,
	DimensionItem,
	Core,
	FilterUtil
) {
	"use strict";

	/**
	 * Base delegate module for the <code>sap.ui.mdc.Chart</code> control.
	 *
	 * This module provides an interface and some basic functionality for sub-modules.
	 * Sub-modules usually interpret service metadata that represents entity-relationship
	 * models, service capabilities, and annotations.
	 *
	 * The result of this service metadata information is used to automatically create
	 * some chart's inner controls, for example, dimension and measure items.
	 *
	 * <b>Note:</b> The module is experimental and is not finalized, hence it should not
	 * be used productively.
	 *
	 * @private
	 * @experimental
	 * @alias module:sap/ui/mdc/ChartDelegate
	 * @since 1.62
	 * @author SAP SE
	 */
	var ChartDelegate = Object.assign({}, AggregationBaseDelegate);

	/**
	 * Delegates metadata structure.
	 *
	 * @typedef {object} sap.ui.mdc.ChartDelegate.Metadata Metadata structure
	 * @property {sap.ui.mdc.chart.Item[]} items The items in the <code>items</code> aggregation of the
	 * <code>sap.ui.mdc.Chart</code> control
	 * @property {array} properties An array of properties the entity set that is used via the
	 * {@link sap.ui.mdc.Chart} class
	 * Although being part of the entity, not every property results in a chart item only those properties
	 * that support aggregation or grouping.
	 * @property {boolean} sortable Indicates whether the chart control is sortable
	 * @property {boolean} filterable Indicates whether the chart control is filterable
	 */
	ChartDelegate.Metadata = {
		items: [],
		properties: [],
		sortable: true,
		filterable: true
	};

	/**
	 * Delegate metadata property structure.
	 * An object that represents the result of the chart control delegates metadata item structure.
	 *
	 * @typedef {object} sap.ui.mdc.ChartDelegate.MetadataProperty Metadata property structure
	 * @property {sap.ui.mdc.ChartItemType} kind The type of the item
	 * @property {sap.ui.mdc.ChartItemRoleType} role The role of the item
	 * @property {array} contextDefiningProperties An array of properties' context (TBD)
	 * @property {string} className The chart item class name reflecting the chart aggregation items.
	 * For example, an {@link sap.ui.mcd.chart.MeasureItem} item or an {@link sap.ui.mcd.chart.DimensionItem}
	 * item.
	 * @property {string} aggregationMethod For measures a string corresponding to the aggregation method.
	 * For example, <code>min</code>, <code>max</code>, <code>sum</code>, <code>average</code>,
	 * <code>count</code>, if not set for a measure the measure is a custom aggregate
	 * @property {boolean} default Indicates whether the aggregation method is the default method
	 * @property {boolean} custom Indicates whether the corresponding chart item is a custom aggregate
	 * @property {string} name The name of the chart item which for measures coincides with its alias
	 * @property {string} propertyPath The path to the corresponding object attribute in the model only
	 * evaluated for measures
	 * @property {string} label Defines the label of the chart item
	 * @property {string} textProperty The reference to a text property for a chart item.
	 * <b>Note:</b> ony used for dimensions
	 * @property {boolean} sortable Indicates whether the chart item is sortable
	 * @property {string} sortDirection Defines the sort direction of the chart item.
	 * Possible values are <code>both</code>, <code>asc</code> and <code>desc</code>
	 * @property {boolean} filterable Indicates whether the chart item is filterable
	 * @property {array} allowedExpressions Allowed filter expressions
	 * @private
	 * @static
	 */
	ChartDelegate.MetadataProperty = {
		kind: "",
		role: "",
		contextDefiningProperties: [],
		className: "",
		aggregationMethod: "",
		"default": true,
		custom: false,
		name: "",
		propertyPath: "",
		label: "",
		textProperty: "",
		sortable: true,
		sortDirection: "",
		filterable: true,
		allowedExpressions: []
	};

	/**
	 * Fetches the relevant metadata for the chart control and returns property info array.
	 *
	 * <b>Note:</b> To be overwritten by sub-modules.
	 *
	 * @static
	 * @param {sap.ui.mdc.Chart} oChart A chart instance
	 * @returns {Promise<sap.ui.mdc.ChartDelegate.Metadata>} A <code>Promise</code> object,
	 * otherwise a <code>Promise</code> object to be rejected
	 */
	ChartDelegate.retrieveAllMetadata = function(oChart) {
		return Promise.resolve(ChartDelegate.Metadata);
	};

	/**
	 * Fetches the metadata properties that can be used as items for the chart.
	 *
	 * <b>Note:</b> To be overwritten by sub-modules.
	 *
	 * @param {sap.ui.mdc.Chart} oChart A chart instance
	 * @static
	 * @return {Promise<sap.ui.mdc.ChartDelegate.MetadataProperty[]>} A fulfilled <code>Promise</code>
	 * object or a <code>Promise</code> object to be fulfilled, otherwise a <code>Promise</code>
	 * object to be rejected
	 */
	ChartDelegate.fetchProperties = function(oChart) {
		var aProperties = [ this.MetadataProperty ];
		return Promise.resolve(aProperties);
	};

	/**
	 * Retrieve a control/fragment pointing to the current aggregation.
	 *
	 * <b>Note:</b> To be overwritten by sub-modules.
	 *
	 * @param {string} sAggregationName The name of the aggregation
	 * @param {sap.ui.mdc.ChartDelegate.MetadataProperty} oMetadataProperty The metadata property
	 * @static
	 * @abstract
	 * @returns {object} Aggregation settings
	 */
	ChartDelegate.retrieveAggregationItem = function(sAggregationName, oMetadataProperty) {
		return {};
	};


	/**
	 * Updates the binding info with the relevant filters
	 *
	 * @param {Object} oMDCChart The MDC chart instance
	 * @param {Object} oBindingInfo The binding info of the chart
	 */
	ChartDelegate.updateBindingInfo = function(oMDCChart, oBindingInfo) {
		if (oMDCChart && oMDCChart.getAggregation("_chart") && oBindingInfo) {

			var oFilter = Core.byId(oMDCChart.getFilter());
			if (oFilter) {
				var mConditions = oFilter.getConditions();

				if (mConditions) {

					if (!oBindingInfo) {
						oBindingInfo = {};
					}

					var aPropertiesMetadata = oFilter.getPropertyInfoSet ? oFilter.getPropertyInfoSet() : null;
					var oFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, aPropertiesMetadata);
					oBindingInfo.filters = oFilterInfo.filters;
				}
			}
		}
	};

	/**
	 * Checks the binding of the chart and rebinds it if required.
	 *
	 * @param {Object} oMDCChart The MDC chart instance
	 * @param {Object} oBindingInfo The binding info of the chart
	 */
	ChartDelegate.rebindChart = function(oMDCChart, oBindingInfo) {
		if (oMDCChart && oMDCChart.getAggregation("_chart") && oBindingInfo) {
			oMDCChart.getAggregation("_chart").bindData(oBindingInfo);
		}
	};


	/**
	 * Create a chart item based on the metadata.
	 *
	 * This method is a factory method that interprets the provided metadata to create the concrete
	 * chart item by calling, for example, the {@link sap.ui.mdc.ChartDelegate#createDimensionItem}
	 * or the {@link sap.ui.mdc.ChartDelegate#createMeasureItem} method.
	 *
	 * @param {string} sName
	 * @param {sap.ui.mdc.Chart} oChart A chart instance
	 * @param {string} sRole
	 * @static
	 * @returns {Promise<sap.ui.mdc.chart.Item>} A promise object
	 */
	ChartDelegate.createChartItem = function(sName, oChart, sRole) {
		return this.fetchProperties(oChart).then(function(aProperties) {

			var oPropertyInfo = aProperties.find(function(oCurrentPropertyInfo) {
				return oCurrentPropertyInfo.name === sName;
			});

			if (!oPropertyInfo) {
				return null;
			}

			var oChartItem = null,
				sID = oChart.getId() + "--" + sName,
				sCreateItemMethodName = "create" + oPropertyInfo.kind + "Item",
				fnItemCreator = this[sCreateItemMethodName];

			if (typeof fnItemCreator === "function") {
				var oSettings = this.retrieveAggregationItem(oPropertyInfo.kind, oPropertyInfo).settings;
				oChartItem = fnItemCreator.call(this, sID, oSettings);

				if (sRole) {
					oChartItem.setRole(sRole);
				}
			}

			return oChartItem;
		}.bind(this));
	};

	/**
	 * Create a chart dimension item.
	 *
	 * @param {string} [sID] ID for the dimension item, generated automatically if no ID is given
	 * @param {object} oSettings Initial settings for the dimension item
	 * @returns {sap.ui.mdc.chart.DimensionItem} An dimension item instance
	 */
	ChartDelegate.createDimensionItem = function(sID, oSettings) {
		return new DimensionItem(sID, oSettings);
	};

	/**
	 * Create a chart measure item.
	 *
	 * @param {string} [sID] ID for the measure item, generated automatically if no ID is given
	 * @param {object} oSettings Initial settings for the measure item
	 * @returns {sap.ui.mdc.chart.MeasureItem} A measure item instance
	 */
	ChartDelegate.createMeasureItem = function(sID, oSettings) {
		return new MeasureItem(sID, oSettings);
	};

	ChartDelegate.addItem = function(sPropertyName, oChart, mPropertyBag, sRole) {
		if (typeof oChart.getModel === "function") {
			return this.createChartItem(sPropertyName, oChart, sRole);
		}

		return SyncPromise.resolve(null);
	};

	ChartDelegate.removeItem = function(sPropertyName, oChart, mPropertyBag) {
		return SyncPromise.resolve(true);
	};

	return ChartDelegate;
});
