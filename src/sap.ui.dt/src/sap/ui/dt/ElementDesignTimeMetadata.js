/*!
 * ${copyright}
 */

// Provides class sap.ui.dt.ElementDesignTimeMetadata.
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/dt/DesignTimeMetadata'
],
function(jQuery, DesignTimeMetadata) {
	"use strict";


	/**
	 * Constructor for a new ElementDesignTimeMetadata.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The ElementDesignTimeMetadata is a wrapper for the ElementDesignTimeMetadata of the associated element
	 * @extends sap.ui.core.DesignTimeMetadata
	 *
	 * @author SAP SE
	 * @version ${version}
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.ElementDesignTimeMetadata
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var ElementDesignTimeMetadata = DesignTimeMetadata.extend("sap.ui.dt.ElementDesignTimeMetadata", /** @lends sap.ui.dt.ElementDesignTimeMetadata.prototype */ {
		metadata : {
			// ---- object ----

			// ---- control specific ----
			library : "sap.ui.dt"
		}
	});

	/**
	 * Returns the default DT metadata
	 * @return {Object} default data
	 * @override
	 */
	ElementDesignTimeMetadata.prototype.getDefaultData = function(oData) {
		var oDefaultData = DesignTimeMetadata.prototype.getDefaultData.apply(this, arguments);

		oDefaultData.aggregations  = {
			layout : {
				ignore : true
			},
			dependents : {
				ignore : true
			}
		};

		return oDefaultData;
	};

	/**
	 * Returns if the DT metadata for an aggregation name exists
	 * @param {string} sAggregationName an aggregation name
	 * @return {boolean} returns if the field for an aggregation with a given name exists in DT metadata
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.hasAggregation = function(sAggregationName) {
		return !!this.getAggregations()[sAggregationName];
	};

	/**
	 * Returns the DT metadata for an aggregation name
	 * @param {string} sAggregationName an aggregation name
	 * @return {object} returns the DT metadata for an aggregation with a given name
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregation = function(sAggregationName) {
		return this.getAggregations()[sAggregationName];
	};

	/**
	 * Returns the DT metadata for all aggregations
	 * @return {map} returns the DT metadata for all aggregations
	 * @public
	 */
	ElementDesignTimeMetadata.prototype.getAggregations = function() {
		return this.getData().aggregations;
	};

	return ElementDesignTimeMetadata;
}, /* bExport= */ true);