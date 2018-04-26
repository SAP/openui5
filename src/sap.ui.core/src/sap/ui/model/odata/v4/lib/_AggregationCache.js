/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationCache
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"./_Cache",
	"./_Helper",
	"./_Parser"
], function (jQuery, SyncPromise, _Cache, _Helper, _Parser) {
	"use strict";

	var rComma = /,|%2C|%2c/,
		rODataIdentifier = new RegExp("^" + _Parser.sODataIdentifier
			+ "(?:" + _Parser.sWhitespace + "+(?:asc|desc))?$"),
		// "required white space"
		rRws = new RegExp(_Parser.sWhitespace + "+");

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
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @throws {Error}
	 *   If the system query option "$filter" is used; if the system query option "$orderby" is
	 *   used and minimum or maximum values for a measure are requested
	 *
	 * @private
	 */
	function _AggregationCache(oRequestor, sResourcePath, aAggregation, mQueryOptions,
			bSortExpandSelect) {
		var mAlias2MeasureAndMethod = {},
			sApply,
			aFirstLevelAggregation,
			bHasMinMax = aAggregation.some(function (oAggregation) {
				return oAggregation.min || oAggregation.max;
			}),
			fnMeasureRangeResolve;

		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect);

		if (mQueryOptions.$filter) {
			throw new Error("Unsupported system query option: $filter");
		}

		if (bHasMinMax) {
			if (mQueryOptions.$orderby) {
				throw new Error("Cannot use $orderby together with min or max on measures");
			}
			this.oMeasureRangePromise = new Promise(function (resolve, reject) {
				fnMeasureRangeResolve = resolve;
			});
			sApply = _Helper.buildApply(aAggregation, mAlias2MeasureAndMethod);
			this.oFirstLevel = _Cache.create(oRequestor, sResourcePath,
				jQuery.extend({}, mQueryOptions, {$apply : sApply}), bSortExpandSelect);
			this.oFirstLevel.getResourcePath = _AggregationCache.getResourcePath
				.bind(this.oFirstLevel, aAggregation, this.oFirstLevel.getResourcePath);
			this.oFirstLevel.handleResponse = _AggregationCache.handleResponse
				.bind(this.oFirstLevel, mAlias2MeasureAndMethod, fnMeasureRangeResolve,
					this.oFirstLevel.handleResponse);
		} else {
			aFirstLevelAggregation = _AggregationCache.filterAggregationForFirstLevel(aAggregation);
			this.oFirstLevel = _Cache.create(oRequestor, sResourcePath,
				jQuery.extend({}, mQueryOptions, {
					$apply : _Helper.buildApply(aFirstLevelAggregation),
					$count : true,
					$orderby : _AggregationCache.filterOrderby(mQueryOptions.$orderby,
						aFirstLevelAggregation)
				}), bSortExpandSelect);
			this.oFirstLevel.calculateKeyPredicates = _AggregationCache.calculateKeyPredicate
				.bind(null, aFirstLevelAggregation, this.oFirstLevel.sMetaPath,
					this.oFirstLevel.aElements.$byPredicate);
		}
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
	 * Gets the Promise which resolves with a map of minimum and maximum values.
	 *
	 * @returns {Promise} oMeasureRangePromise
	 *   A Promise which resolves with a map of minimum and maximum values for requested measures
	 *   or undefined if no minimum or maximum is requested. The key of the map is the measure
	 *   property name and the value is an object with a <code>min</code> and/or <code>max</code>
	 *   property containing the corresponding minimum and maximum values.
	 *
	 * @public
	 */
	_AggregationCache.prototype.getMeasureRangePromise = function () {
		return this.oMeasureRangePromise;
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
		var oReadPromise =
				this.oFirstLevel.read(iIndex, iLength, iPrefetchLength, sGroupId, fnDataRequested);

		if (!this.oMeasureRangePromise) {
			return oReadPromise.then(function (oResult) {
				oResult.value.forEach(function (oElement) {
					oElement["@$ui5.node.isExpanded"] = false;
					oElement["@$ui5.node.isTotal"] = true;
					oElement["@$ui5.node.level"] = 1;
				});

				return oResult;
			});
		}
		return oReadPromise;
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Calculates the virtual key predicate for the given group node on level 1, based on the first
	 * dimension's value.
	 *
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; the grouped dimensions must come first
	 * @param {string} sMetaPath The meta path of the collection in mTypeForMetaPath
	 * @param {object} mByPredicate A map of group nodes by key predicates, used to detect
	 *   collisions
	 * @param {object} oGroupNode A 1st level group node
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 * @throws {Error}
	 *   In case a multi-unit situation is detected via a collision of key predicates
	 *
	 * @private
	 */
	_AggregationCache.calculateKeyPredicate = function (aAggregation, sMetaPath, mByPredicate,
			oGroupNode, mTypeForMetaPath) {
		var sFirstLevelDimension = aAggregation[0].name,
			sLiteral = _Helper.formatLiteral(oGroupNode[sFirstLevelDimension],
				mTypeForMetaPath[sMetaPath][sFirstLevelDimension].$Type),
			sPredicate = "(" + encodeURIComponent(sFirstLevelDimension) + "="
				+ encodeURIComponent(sLiteral) + ")";

		/*
		 * Returns a JSON string representation of the given object, but w/o the private namespace.
		 *
		 * @param {object} o
		 * @returns {string}
		 */
		function stringify(o) {
			return JSON.stringify(_Helper.publicClone(o));
		}

		if (sPredicate in mByPredicate) {
			throw new Error("Multi-unit situation detected: " + stringify(oGroupNode) + " vs. "
				+ stringify(mByPredicate[sPredicate]));
		}
		_Helper.setPrivateAnnotation(oGroupNode, "predicate", sPredicate);
	};

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
	 * @param {object} mQueryOptions
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

	/**
	 * Returns the "$orderby" system query option filtered in such a way that only dimensions
	 * contained in the given aggregation information are used.
	 *
	 * @param {string} [sOrderby]
	 *   The original "$orderby" system query option
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>
	 * @returns {string}
	 *   The filtered "$orderby" system query option
	 *
	 * @private
	 */
	_AggregationCache.filterOrderby = function (sOrderby, aAggregation) {
		var mNames; // hash set of all dimension/measure names

		if (sOrderby) {
			mNames = {};
			aAggregation.forEach(function (oAggregation) {
				mNames[oAggregation.name] = true;
			});

			return sOrderby.split(rComma).filter(function (sOrderbyItem) {
				var sName;

				if (rODataIdentifier.test(sOrderbyItem)) {
					sName = sOrderbyItem.split(rRws)[0]; // drop optional asc/desc
					return mNames[sName];
				}
				return true;
			}).join(",");
		}
	};

	/**
	 * Returns the resource path including the query string with "$skip" and "$top" if needed and
	 * "$apply" including the aggregation functions for minimum and maximum values of measures.
	 * The "$top" is increased by one, to compensate for the additional data set for min and max
	 * properties. This function is used to replace the #getResourcePath from the first level cache.
	 * Rebuilds the query string so that the next request does not contain the aggregation function
	 * for the minimum and the maximum values. The original function given in fnGetResourcePath is
	 * restored when calling this function. This function needs to be called on the first level
	 * cache.
	 *
	 * @param {object[]} aAggregation
	 *   An array with objects holding the information needed for data aggregation; see
	 *   {@link sap.ui.model.odata.v4.lib._Helper#buildApply}
	 * @param {function} fnGetResourcePath
	 *   The original <code>getResourcePath</code> of the first level cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The index after the last element to request ($skip + $top)
	 * @returns {string} The resource path including the query string
	 * @throws {Error} If <code>iStart</code> is not 0
	 *
	 * @protected
	 */
	_AggregationCache.getResourcePath = function (aAggregation, fnGetResourcePath, iStart, iEnd) {
		var aAggregationNoMinMax, sResourcePath;

		if (iStart !== 0) {
			throw new Error("First request needs to start at index 0");
		}

		sResourcePath = fnGetResourcePath.call(this, iStart, iEnd + 1);
		// remove min/max from $apply
		aAggregationNoMinMax = _Helper.clone(aAggregation);
		aAggregationNoMinMax.forEach(function (oAggregation) {
			delete oAggregation.min;
			delete oAggregation.max;
		});
		this.mQueryOptions.$apply = _Helper.buildApply(aAggregationNoMinMax);
		this.sQueryString = this.oRequestor.buildQueryString(this.sMetaPath,
			this.mQueryOptions, false, this.bSortExpandSelect);

		this.getResourcePath = fnGetResourcePath;
		return sResourcePath;
	};

	/**
	 * Handles a GET response by extracting the minimum and the maximum values from the given
	 * result, resolving the measure range promise and calling <code>fnHandleResponse<code> with the
	 * remaining values of <code>aResult</code>. Restores the original <code>handleResponse</code>.
	 * This function needs to be called on the first level cache.
	 *
	 * @param {object} mAlias2MeasureAndMethod
	 *   A map of the virtual property names to the corresponding measure property names and the
	 *   aggregation functions, for example:
	 *   <code> UI5min__Property : {measure : Property, method : min} </code>
	 * @param {function} fnMeasureRangeResolve
	 *   Function to resolve the measure range promise, see {@link #getMeasureRangePromise}
	 * @param {function} fnHandleResponse
	 *   The original <code>#handleResponse</code> of the first level cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The index after the last element to request ($skip + $top)
	 * @param {object} oResult The result of the GET request
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 *
	 * @protected
	 */
	_AggregationCache.handleResponse = function (mAlias2MeasureAndMethod, fnMeasureRangeResolve,
			fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath) {
		var sAlias,
			mMeasureRange = {},
			oMinMaxElement;

		function getMeasureRange(sMeasure) {
			mMeasureRange[sMeasure] = mMeasureRange[sMeasure] || {};
			return mMeasureRange[sMeasure];
		}

		if ("@odata.count" in oResult) {
			oResult["@odata.count"] -= 1;
		}
		oMinMaxElement = oResult.value.splice(0, 1)[0];
		for (sAlias in mAlias2MeasureAndMethod) {
			getMeasureRange(mAlias2MeasureAndMethod[sAlias].measure)
				[mAlias2MeasureAndMethod[sAlias].method] = oMinMaxElement[sAlias];
		}
		fnMeasureRangeResolve(mMeasureRange);

		this.handleResponse = fnHandleResponse;
		this.handleResponse(iStart, iEnd, oResult, mTypeForMetaPath);
	};

	return _AggregationCache;
}, /* bExport= */false);
