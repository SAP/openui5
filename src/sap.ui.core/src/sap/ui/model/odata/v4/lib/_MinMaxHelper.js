/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MinMaxHelper
sap.ui.define([
	"./_AggregationHelper",
	"./_Cache"
], function (_AggregationHelper, _Cache) {
	"use strict";

	return {
		/**
		 * Creates a cache that requests the mininum and maximum values together with the first
		 * request. Subsequent requests remain unchanged.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   The requestor
		 * @param {string} sResourcePath
		 *   A resource path relative to the service URL
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see also
		 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
		 *   Extension for Data Aggregation Version 4.0</a>; must already be normalized by
		 *   {@link _AggregationHelper.buildApply}
		 * @param {object} mQueryOptions
		 *   A map of key-value pairs representing the query string
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createCache : function (oRequestor, sResourcePath, oAggregation, mQueryOptions) {
			// A map of the virtual property names to the corresponding measure property names and
			// the aggregation functions, for example
			// {UI5min__Property : {measure : "Property", method : "min"}}}
			var mAlias2MeasureAndMethod = {},
				oCache,
				bFollowUp = false,
				oMeasureRangePromise,
				fnMeasureRangeResolve;

			oCache = _Cache.create(oRequestor, sResourcePath, mQueryOptions, true);
			oMeasureRangePromise = new Promise(function (resolve) {
				fnMeasureRangeResolve = resolve;
			});

			/**
			 * Gets the <code>Promise</code> which resolves with a map of minimum and maximum
			 * values.
			 *
			 * @returns {Promise}
			 *   A <code>Promise</code> which resolves with a map of minimum and maximum values for
			 *   requested measures, or <code>undefined</code> if no minimum or maximum is
			 *   requested. The key of the map is the measure property name and the value is an
			 *   object with a <code>min</code> or <code>max</code> property containing the
			 *   corresponding minimum or maximum value.
			 *
			 * @public
			 */
			// @override sap.ui.model.odata.v4.lib._Cache#getMeasureRangePromise
			oCache.getMeasureRangePromise = function () {
				return oMeasureRangePromise;
			};

			/**
			 * Returns the resource path including the query string with "$apply" which includes the
			 * aggregation functions for count, minimum or maximum values and "skip()/top()" as
			 * transformations. Follow-up requests do not aggregate the count and minimum or maximum
			 * values again.
			 *
			 * @param {number} iStart
			 *   The start index of the range
			 * @param {number} iEnd
			 *   The index after the last element
			 * @returns {string} The resource path including the query string
			 */
			// @override sap.ui.model.odata.v4.lib._CollectionCache#getResourcePathWithQuery
			// Note: same as in _GrandTotalHelper
			oCache.getResourcePathWithQuery = function (iStart, iEnd) {
				// Note: ignore existing mQueryOptions.$apply, e.g. from ODLB#updateAnalyticalInfo
				var mQueryOptionsWithApply = _AggregationHelper.buildApply(oAggregation,
						Object.assign({}, this.mQueryOptions, {
							$skip : iStart,
							$top : iEnd - iStart
						}), 1, bFollowUp, mAlias2MeasureAndMethod);

				bFollowUp = true; // next request is a follow-up

				return this.sResourcePath + this.oRequestor.buildQueryString(this.sMetaPath,
					mQueryOptionsWithApply, false, true);
			};

			/**
			 * Handles a GET response by extracting the minimum and the maximum values from the
			 * given result, resolving the measure range promise, restoring the original
			 * <code>handleResponse</code> and calling it with the remaining values of
			 * <code>oResult</code>.
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
				var sAlias,
					mMeasureRange = {},
					oMinMaxElement = oResult.value.shift();

				function getMeasureRange(sMeasure) {
					mMeasureRange[sMeasure] = mMeasureRange[sMeasure] || {};
					return mMeasureRange[sMeasure];
				}

				oResult["@odata.count"] = oMinMaxElement.UI5__count;
				for (sAlias in mAlias2MeasureAndMethod) {
					getMeasureRange(mAlias2MeasureAndMethod[sAlias].measure)
						[mAlias2MeasureAndMethod[sAlias].method] = oMinMaxElement[sAlias];
				}
				fnMeasureRangeResolve(mMeasureRange);

				// revert to prototype and call it
				delete this.handleResponse;
				this.handleResponse(iStart, iEnd, oResult, mTypeForMetaPath);
			};

			return oCache;
		}
	};
}, /* bExport= */false);
