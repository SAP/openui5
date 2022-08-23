/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._MinMaxHelper
sap.ui.define([
	"./_Cache",
	"./_ConcatHelper"
], function (_Cache, _ConcatHelper) {
	"use strict";

	return {
		/**
		 * Creates a cache that requests the minimum and maximum values together with the first
		 * request. Subsequent requests remain unchanged.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   The requestor
		 * @param {string} sResourcePath
		 *   A resource path relative to the service URL
		 * @param {object} oAggregation
		 *   An object holding the information needed for data aggregation; see also "OData
		 *   Extension for Data Aggregation Version 4.0"; must already be normalized by
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
				fnMeasureRangeResolve,
				oMeasureRangePromise = new Promise(function (resolve) {
					fnMeasureRangeResolve = resolve;
				});

			function handleMinMaxElement(oMinMaxElement) {
				var sAlias,
					mMeasureRange = {};

				function getMeasureRange(sMeasure) {
					mMeasureRange[sMeasure] = mMeasureRange[sMeasure] || {};
					return mMeasureRange[sMeasure];
				}

				for (sAlias in mAlias2MeasureAndMethod) {
					getMeasureRange(mAlias2MeasureAndMethod[sAlias].measure)
						[mAlias2MeasureAndMethod[sAlias].method] = oMinMaxElement[sAlias];
				}
				fnMeasureRangeResolve(mMeasureRange);
			}

			oCache = _Cache.create(oRequestor, sResourcePath, mQueryOptions, true);
			_ConcatHelper.enhanceCache(oCache, oAggregation, [handleMinMaxElement],
				mAlias2MeasureAndMethod);

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

			return oCache;
		}
	};
}, /* bExport= */false);
