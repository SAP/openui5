/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._GrandTotalHelper
sap.ui.define([
	"./_AggregationHelper"
], function (_AggregationHelper) {
	"use strict";

	/**
	 * Returns the resource path including the query string with "$apply" which includes the
	 * aggregation functions for count and grand total, minimum or maximum values and "skip()/top()"
	 * as transformations. Follow-up requests do not aggregate the count and minimum or maximum
	 * values again. Grand total values are requested only for <code>iStart === 0</code>.
	 *
	 * This function is used to replace <code>getResourcePathWithQuery</code> of the first level
	 * cache and needs to be called on the first level cache.
	 *
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the aggregation cache's original query string
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @returns {string} The resource path including the query string
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#getResourcePathWithQuery
	function getResourcePathWithQuery(oAggregation, mQueryOptions, iStart, iEnd) {
		mQueryOptions = Object.assign({}, mQueryOptions, {
			$skip : iStart,
			$top : iEnd - iStart
		});
		mQueryOptions
			= _AggregationHelper.buildApply(oAggregation, mQueryOptions, 1, this.bFollowUp);
		this.bFollowUp = true; // next request is a follow-up

		return this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
	}

	/**
	 * Handles a GET response wich may contain grand total or count, each in a row of its own.
	 *
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
	 * @param {string[]} aAllProperties
	 *   A list of all properties that might be missing in the grand total row and thus have to be
	 *   nulled to avoid drill-down errors
	 * @param {function} fnHandleResponse
	 *   The original <code>#handleResponse</code> of the first level cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The index after the last element to request ($skip + $top)
	 * @param {object} oResult The result of the GET request
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 */
	// @override sap.ui.model.odata.v4.lib._CollectionCache#handleResponse
	function handleGrandTotalResponse(oAggregation, aAllProperties, fnHandleResponse, iStart, iEnd,
			oResult, mTypeForMetaPath) {
		var oGrandTotalElement = oResult.value[0],
			that = this;

		function handleCount(iIndex) {
			that.iLeafCount = parseInt(oResult.value[iIndex].UI5__count);
			oResult["@odata.count"] = that.iLeafCount + 1;
			oResult.value.splice(iIndex, 1); // drop row with UI5__count only
		}

		if ("UI5__count" in oGrandTotalElement) {
			handleCount(0);
		} else if (oResult.value.length > 1 && "UI5__count" in oResult.value[1]) {
			handleCount(1);
		}
		if (iStart === 0) { // grand total row: rename measures, add null values, annotate
			_AggregationHelper.setAnnotations(oGrandTotalElement, true, true, 0, aAllProperties);
			Object.keys(oGrandTotalElement).forEach(function (sKey) {
				if (sKey.startsWith("UI5grand__")) {
					oGrandTotalElement[sKey.slice(10)] = oGrandTotalElement[sKey];
					delete oGrandTotalElement[sKey];
				}
			});
		}

		fnHandleResponse.call(this, iStart, iEnd, oResult, mTypeForMetaPath);
	}

	return {
		/**
		 * Enhances the given cache, so that the count and/or grand total are requested together
		 * with the first request. Subsequent requests remain unchanged.
		 *
		 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
		 *   The cache to be enhanced
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see also
		 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
		 *   Extension for Data Aggregation Version 4.0</a>; must already be normalized by
	 	 *   {@link _AggregationHelper.buildApply}
		 * @param {object} mQueryOptions
		 *   A map of key-value pairs representing the aggregation cache's original query string
		 */
		enhanceCacheWithGrandTotal : function (oCache, oAggregation, mQueryOptions) {
			var aAllProperties
				= Object.keys(oAggregation.aggregate).concat(Object.keys(oAggregation.group));

			oCache.getResourcePathWithQuery
				= getResourcePathWithQuery.bind(oCache, oAggregation, mQueryOptions);
			oCache.handleResponse = handleGrandTotalResponse.bind(oCache, oAggregation,
				aAllProperties, oCache.handleResponse);
		}
	};
}, /* bExport= */false);
