/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._GrandTotalHelper
sap.ui.define([
	"./_AggregationHelper"
], function (_AggregationHelper) {
	"use strict";

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
		 * @param {function} fnGrandTotal
		 *   Callback for the grand total response
		 */
		enhanceCacheWithGrandTotal : function (oCache, oAggregation, fnGrandTotal) {
			var bFollowUp;

			/**
			 * Returns the resource path including the query string with "$apply" which includes the
			 * aggregation functions for count and grand total, minimum or maximum values and
			 * "skip()/top()" as transformations. Follow-up requests do not aggregate the count and
			 * grand total, minimum or maximum values again.
			 *
			 * This function is used to replace <code>getResourcePathWithQuery</code> of the first
			 * level cache and needs to be called on the first level cache.
			 *
			 * @param {number} iStart
			 *   The start index of the range
			 * @param {number} iEnd
			 *   The index after the last element
			 * @returns {string} The resource path including the query string
			 */
			// @override sap.ui.model.odata.v4.lib._CollectionCache#getResourcePathWithQuery
			// Note: same as in _MinMaxHelper
			oCache.getResourcePathWithQuery = function (iStart, iEnd) {
				var mQueryOptionsWithApply = _AggregationHelper.buildApply(oAggregation,
						Object.assign({}, this.mQueryOptions, {
							$skip : iStart,
							$top : iEnd - iStart
						}), 1, bFollowUp);

				bFollowUp = true; // next request is a follow-up

				return this.sResourcePath + this.oRequestor.buildQueryString(this.sMetaPath,
					mQueryOptionsWithApply, false, true);
			};

			/**
			 * Handles a GET response wich may contain grand total or count, each in a row of its
			 * own.
			 *
			 * @param {number} iStart
			 *   The index of the first element to request ($skip)
			 * @param {number} iEnd
			 *   The index after the last element to request ($skip + $top)
			 * @param {object} oResult The result of the GET request
			 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as
			 *   delivered by {@link #fetchTypes})
			 */
			// @override sap.ui.model.odata.v4.lib._CollectionCache#handleResponse
			oCache.handleResponse = function (iStart, iEnd, oResult, mTypeForMetaPath) {
				fnGrandTotal(oResult.value.shift());

				// Note: drop row with UI5__count only
				oResult["@odata.count"] = oResult.value.shift().UI5__count;

				// revert to prototype and call it
				delete this.handleResponse;
				this.handleResponse(iStart, iEnd, oResult, mTypeForMetaPath);
			};
		}
	};
}, /* bExport= */false);
