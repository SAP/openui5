/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._ConcatHelper
sap.ui.define([
	"./_AggregationHelper"
], function (_AggregationHelper) {
	"use strict";

	return {
		/**
		 * Enhances the given cache, so that additional rows are requested together with the first
		 * request using "concat"; this means that $count needs to be requested as "UI5__count"
		 * instead, in a separate row. Subsequent requests remain unchanged.
		 *
		 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
		 *   The cache to be enhanced
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see also "OData
		 *   Extension for Data Aggregation Version 4.0"; must already be normalized by
		 *   {@link _AggregationHelper.buildApply}
		 * @param {function[]} [aAdditionalRowHandlers]
		 *   Handlers for the additional response rows (which are automatically scanned for
		 *   "UI5__count"); if a handler is missing, the corresponding row is assumed to be missing
		 *   as well
		 * @param {object} [mAlias2MeasureAndMethod]
		 *   A map which is filled by {@link _AggregationHelper.buildApply} in case an aggregatable
		 *   property requests minimum or maximum values.
		 */
		enhanceCache : function (oCache, oAggregation, aAdditionalRowHandlers,
				mAlias2MeasureAndMethod) {
			var bFollowUp;

			/**
			 * Returns the resource path including the query string with "$apply" which includes the
			 * aggregation functions for additional rows and thus uses "skip()/top()" as
			 * transformations. Follow-up requests do not aggregate these additional rows again.
			 *
			 * This function is used to replace <code>getResourcePathWithQuery</code> of the first
			 * level cache and needs to be called on the first level cache.
			 *
			 * @param {number} iStart
			 *   The start index of the range
			 * @param {number} iEnd
			 *   The index after the last element
			 * @returns {string}
			 *   The resource path including the query string
			 */
			// @override sap.ui.model.odata.v4.lib._CollectionCache#getResourcePathWithQuery
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
			 * @override
			 * @see sap.ui.model.odata.v4.lib._CollectionCache#handleResponse
			 */
			oCache.handleResponse = function (oResult) {
				aAdditionalRowHandlers.forEach(function (fnHandler) {
					var oAdditionalRow;

					if (fnHandler) {
						oAdditionalRow = oResult.value.shift();
						if ("UI5__count" in oAdditionalRow) {
							oResult["@odata.count"] = oAdditionalRow.UI5__count;
						}
						fnHandler(oAdditionalRow);
					}
				});

				// revert to prototype and call it
				delete this.handleResponse;

				return this.handleResponse.apply(this, arguments);
			};
		}
	};
}, /* bExport= */false);
