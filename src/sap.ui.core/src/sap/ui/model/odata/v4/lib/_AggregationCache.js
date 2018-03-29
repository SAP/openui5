/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationCache
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"./_Cache",
	"./_Helper"
], function (jQuery, SyncPromise, _Cache, _Helper) {
	"use strict";

	//*********************************************************************************************
	// _AggregationCache
	//*********************************************************************************************

	/**
	 * Creates a cache for data aggregation that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData Extension
	 *   for Data Aggregation Version 4.0</a>
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 *
	 * @private
	 */
	function _AggregationCache(oRequestor, sResourcePath, aAggregation, mQueryOptions,
		bSortExpandSelect) {
		var sApply = _Helper.buildApply(
				_AggregationCache.filterAggregationForFirstLevel(aAggregation));

		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect);

		this.oFirstLevel = _Cache.create(oRequestor, sResourcePath,
			jQuery.extend({}, mQueryOptions, {$apply : sApply, $count : true}), bSortExpandSelect);
	}

	// make _AggregationCache a _Cache
	_AggregationCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested data.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#fetchValue
	 */
	_AggregationCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested,
			oListener) {
		return this.oFirstLevel.fetchValue(sGroupId, sPath, fnDataRequested, oListener);
	};

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 *
	 * @param {number} iIndex
	 *   The start index of the range in model coordinates; the first row has index -1 or 0!
	 * @param {number} iLength
	 *   The length of the range; <code>Infinity</code> is supported
	 * @param {number} iPrefetchLength
	 *   The number of rows to read before and after the given range; with this it is possible to
	 *   prefetch data for a paged access. The cache ensures that at least half the prefetch length
	 *   is available left and right of the requested range without a further request. If data is
	 *   missing on one side, the full prefetch length is added at this side.
	 *   <code>Infinity</code> is supported
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the requests with
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>, enhanced
	 *   with a number property <code>$count</code> representing the element count on server-side;
	 *   <code>$count</code> may be <code>undefined</code>, but not <code>Infinity</code>). If an
	 *   HTTP request fails, the error from the _Requestor is returned and the requested range is
	 *   reset to <code>undefined</code>.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#read
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	_AggregationCache.prototype.read = function (iIndex, iLength, iPrefetchLength, sGroupId,
			fnDataRequested) {
		return this.oFirstLevel.read(iIndex, iLength, iPrefetchLength, sGroupId, fnDataRequested)
			.then(function (oResult) {
				oResult.value.forEach(function (oElement) {
					oElement["@$ui5.node.isExpanded"] = false;
					oElement["@$ui5.node.isTotal"] = true;
					oElement["@$ui5.node.level"] = 1;
				});

				return oResult;
			});
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Creates a cache for data aggregation that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string<br>
	 *   Example: Products
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @returns {sap.ui.model.odata.v4.lib._AggregationCache}
	 *   The cache
	 *
	 * @public
	 */
	_AggregationCache.create = function (oRequestor, sResourcePath, aAggregation, mQueryOptions,
			bSortExpandSelect) {
		return new _AggregationCache(oRequestor, sResourcePath, aAggregation, mQueryOptions,
			bSortExpandSelect);
	};

	/**
	 * Returns the aggregation information for the first level.
	 *
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>
	 * @returns {object[]}
	 *   The aggregation information for the first level
	 *
	 * @private
	 */
	_AggregationCache.filterAggregationForFirstLevel = function (aAggregation) {
		return aAggregation.filter(function (oAggregation) {
			return oAggregation.grouped === true || oAggregation.total === true;
		});
	};

	return _AggregationCache;
}, /* bExport= */false);
