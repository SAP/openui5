/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationCache
sap.ui.define([
	"./_AggregationHelper",
	"./_Cache",
	"./_GroupLock",
	"./_Helper",
	"./_Parser",
	"sap/base/Log",
	"sap/ui/base/SyncPromise"
], function (_AggregationHelper, _Cache, _GroupLock, _Helper, _Parser, Log, SyncPromise) {
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
	 * Note: The paths in $expand and $select will always be sorted in the cache's query string.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must be a clone that contains
	 *   <code>aggregate</code>, <code>group</code>, <code>groupLevels</code>
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string
	 * @throws {Error}
	 *   If the system query options "$count" or "$filter" are used together with group levels, or
	 *   if group levels are combined with min/max, or if the system query options "$expand" or
	 *   "$select" are used at all
	 *
	 * @private
	 */
	function _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions) {
		var mAlias2MeasureAndMethod = {},
			mFirstQueryOptions,
			fnMeasureRangeResolve;

		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, true);
		this.oAggregation = oAggregation;
		if ("$expand" in mQueryOptions) {
			throw new Error("Unsupported system query option: $expand");
		}
		if ("$select" in mQueryOptions) {
			throw new Error("Unsupported system query option: $select");
		}

		if (_AggregationHelper.hasMinOrMax(oAggregation.aggregate)) {
			// Note: ignore existing mQueryOptions.$apply, e.g. from ODLB#updateAnalyticalInfo
			if (oAggregation.groupLevels.length) {
				throw new Error("Unsupported group levels together with min/max");
			}
			this.oMeasureRangePromise = new Promise(function (resolve, reject) {
				fnMeasureRangeResolve = resolve;
			});
			mFirstQueryOptions = _AggregationHelper.buildApply(oAggregation, mQueryOptions,
				mAlias2MeasureAndMethod); // 1st request only
			this.oFirstLevel = _Cache.create(oRequestor, sResourcePath, mFirstQueryOptions, true);
			this.oFirstLevel.getResourcePath = _AggregationCache.getResourcePath.bind(
				this.oFirstLevel, oAggregation, mQueryOptions);
			this.oFirstLevel.handleResponse = _AggregationCache.handleResponse
				.bind(this.oFirstLevel, null, mAlias2MeasureAndMethod, fnMeasureRangeResolve,
					this.oFirstLevel.handleResponse);
		} else if (oAggregation.groupLevels.length) {
			this.aElements = [];
			this.aElements.$byPredicate = {};
			this.aElements.$count = undefined;
			this.aElements.$created = 0; // required for _Cache#drillDown (see _Cache.from$skip)

			if (mQueryOptions.$count) {
				throw new Error("Unsupported system query option: $count");
			}
			if (mQueryOptions.$filter) {
				throw new Error("Unsupported system query option: $filter");
			}
			this.oFirstLevel = this.createGroupLevelCache();
		} else { // grand total w/o visual grouping
			this.oFirstLevel = _Cache.create(oRequestor, sResourcePath, mQueryOptions, true);
			this.oFirstLevel.getResourcePath = _AggregationCache.getResourcePath.bind(
				this.oFirstLevel, oAggregation, mQueryOptions);
			this.oFirstLevel.handleResponse = _AggregationCache.handleResponse
				.bind(this.oFirstLevel, oAggregation, null, null, this.oFirstLevel.handleResponse);
		}
	}

	// make _AggregationCache a _Cache
	_AggregationCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Unconditionally copies the given elements from a cache read into aElements.
	 *
	 * @param {object[]} aReadElements
	 *   The elements from a cache read
	 * @param {number} iOffset
	 *   The offset within aElements
	 *
	 * @private
	 */
	_AggregationCache.prototype.addElements = function (aReadElements, iOffset) {
		var aElements = this.aElements;

		aReadElements.forEach(function (oElement, i) {
			var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

			aElements[iOffset + i] = oElement;
			aElements.$byPredicate[sPredicate] = oElement;
		});
	};

	/**
	 * Creates a cache for the children (next group level or leaves) of the given parent group node.
	 * Creates the first level cache if there is no parent group node.
	 *
	 * @param {object} [oParentGroupNode]
	 *   The parent group node or undefined for the first level cache
	 * @returns {sap.ui.model.odata.v4.lib._CollectionCache}
	 *   The group level cache
	 *
	 * @private
	 */
	_AggregationCache.prototype.createGroupLevelCache = function (oParentGroupNode) {
		var oCache, oFilteredAggregation, sFilteredOrderby, aGroupBy, bLeaf, iLevel, aMissing,
			mQueryOptions, bTotal;

		iLevel = oParentGroupNode ? oParentGroupNode["@$ui5.node.level"] + 1 : 1;

		oFilteredAggregation = _AggregationCache.filterAggregation(this.oAggregation, iLevel);
		aGroupBy = oFilteredAggregation.$groupBy;
		delete oFilteredAggregation.$groupBy;
		aMissing = oFilteredAggregation.$missing;
		delete oFilteredAggregation.$missing;

		mQueryOptions = Object.assign({}, this.mQueryOptions);
		sFilteredOrderby
			= _AggregationCache.filterOrderby(this.mQueryOptions.$orderby, oFilteredAggregation);
		if (sFilteredOrderby) {
			mQueryOptions.$orderby = sFilteredOrderby;
		} else {
			delete mQueryOptions.$orderby;
		}

		if (oParentGroupNode) {
			mQueryOptions.$$filterBeforeAggregate
				= _Helper.getPrivateAnnotation(oParentGroupNode, "filter");
		}

		delete mQueryOptions.$count;
		mQueryOptions = _AggregationHelper.buildApply(oFilteredAggregation, mQueryOptions);
		mQueryOptions.$count = true;

		oCache = _Cache.create(this.oRequestor, this.sResourcePath, mQueryOptions, true);

		bLeaf = !oFilteredAggregation.groupLevels.length;
		bTotal = !bLeaf && Object.keys(oFilteredAggregation.aggregate).length > 0;
		oCache.calculateKeyPredicate = _AggregationCache.calculateKeyPredicate.bind(null,
			oParentGroupNode, aGroupBy, aMissing, bLeaf, bTotal, this.aElements.$byPredicate);

		return oCache;
	};

	/**
	 * Expands the group node at the given path.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
	 * @param {string} sGroupNodePath
	 *   The group node path relative to the cache
	 * @returns {sap.ui.base.SyncPromise<number>}
	 *   A promise that is resolved with the number of nodes at the next level
	 *
	 * @public
	 */
	_AggregationCache.prototype.expand = function (oGroupLock, sGroupNodePath) {
		var oCache,
			oGroupNode,
			that = this;

		oGroupNode = this.fetchValue(_GroupLock.$cached, sGroupNodePath).getResult();

		// Note: this also prevents a 2nd expand of the same node
		_Helper.updateAll(this.mChangeListeners, sGroupNodePath, oGroupNode, {
			"@$ui5.node.isExpanded" : true
		});

		oCache = this.createGroupLevelCache(oGroupNode);

		// prefetch from the group level cache
		return oCache.read(0, this.iReadLength, 0, oGroupLock).then(function (oResult) {
			var iCount = oResult.value.$count,
				iIndex = that.aElements.indexOf(oGroupNode) + 1,
				i;

			// create the gap
			for (i = that.aElements.length - 1; i >= iIndex; i -= 1) {
				that.aElements[i + iCount] = that.aElements[i];
				// no need to delete, that.aElements[i] is overwritten below
			}
			// fill in the results
			that.addElements(oResult.value, iIndex);
			that.aElements.$count += iCount;
			// create placeholder
			for (i = iIndex + oResult.value.length; i < iIndex + iCount; i += 1) {
				that.aElements[i] = {};
				_Helper.setPrivateAnnotation(that.aElements[i], "index", i - iIndex);
				_Helper.setPrivateAnnotation(that.aElements[i], "parent", oCache);
			}

			return iCount;
		}, function (oError) {
			_Helper.updateAll(that.mChangeListeners, sGroupNodePath, oGroupNode, {
				"@$ui5.node.isExpanded" : false
			});

			throw oError;
		});
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with; unused in CollectionCache since no
	 *   request will be created
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent; unused in CollectionCache
	 *   since no request will be created
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested data. The promise is rejected if the cache is
	 *   inactive (see {@link #setActive}) when the response arrives. Fails to drill-down into
	 *   "$count" in cases where it does not reflect the leaf count.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#fetchValue
	 */
	_AggregationCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested,
			oListener) {
		var that = this;

		if (sPath === "$count") {
			if (!this.mQueryOptions.$count) {
				Log.error("Failed to drill-down into $count, invalid segment: $count",
					this.toString(), "sap.ui.model.odata.v4.lib._Cache");
				return SyncPromise.resolve();
			}
			if (!this.oMeasureRangePromise) {
				return this.oFirstLevel.fetchValue(oGroupLock, sPath).then(function () {
						return that.oFirstLevel.iLeafCount;
					});
			} // else: in case of min/max, no special handling is needed
		}
		if (this.oAggregation.groupLevels.length) {
			this.registerChange(sPath, oListener);
			return this.drillDown(this.aElements, sPath, oGroupLock);
		}
		return this.oFirstLevel.fetchValue(oGroupLock, sPath, fnDataRequested, oListener);
	};

	/**
	 * Gets the <code>Promise</code> which resolves with a map of minimum and maximum values.
	 *
	 * @returns {Promise}
	 *   A <code>Promise</code> which resolves with a map of minimum and maximum values for
	 *   requested measures, or <code>undefined</code> if no minimum or maximum is requested. The
	 *   key of the map is the measure property name and the value is an object with a
	 *   <code>min</code> or <code>max</code> property containing the corresponding minimum or
	 *   maximum value.
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#getMeasureRangePromise
	_AggregationCache.prototype.getMeasureRangePromise = function () {
		return this.oMeasureRangePromise;
	};

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 *
	 * @param {number} iIndex
	 *   The start index of the range
	 * @param {number} iLength
	 *   The length of the range; <code>Infinity</code> is supported
	 * @param {number} iPrefetchLength
	 *   The number of rows to read before and after the given range; with this it is possible to
	 *   prefetch data for a paged access. The cache ensures that at least half the prefetch length
	 *   is available left and right of the requested range without a further request. If data is
	 *   missing on one side, the full prefetch length is added at this side.
	 *   <code>Infinity</code> is supported
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
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
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#read
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	_AggregationCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var i, n,
			oCurrentParent,
			oGapParent,
			iGapStart,
			bHasGroupLevels = this.oAggregation.groupLevels.length,
			aReadPromises = [],
			that = this;

		/**
		 * Reads the given range of the current gap, saves the promise, and replaces the gap with
		 * the read's result.
		 *
		 * @param {number} iGapStart start of gap, inclusive
		 * @param {number} iGapEnd end of gap, exclusive
		 */
		function readGap(iGapStart, iGapEnd) {
			var iStart = _Helper.getPrivateAnnotation(that.aElements[iGapStart], "index"),
				oStartElement = that.aElements[iGapStart];

			aReadPromises.push(
				oGapParent.read(iStart, iGapEnd - iGapStart, 0, oGroupLock.getUnlockedCopy(),
						fnDataRequested)
					.then(function (oReadResult) {
						// Note: aElements[iGapStart] may have changed by a parallel operation
						if (oStartElement !== that.aElements[iGapStart]
							&& oReadResult.value[0] !== that.aElements[iGapStart]) {
								// start of the gap has moved meanwhile
								iGapStart = that.aElements.indexOf(oStartElement);
								if (iGapStart < 0) {
									iGapStart = that.aElements.indexOf(oReadResult.value[0]);
								}
						}
						that.addElements(oReadResult.value, iGapStart);
					})
			);
		}

		if (bHasGroupLevels && this.aElements.length) {
			for (i = iIndex, n = Math.min(iIndex + iLength, this.aElements.length); i < n; i += 1) {
				oCurrentParent = _Helper.getPrivateAnnotation(this.aElements[i], "parent");
				if (oCurrentParent !== oGapParent) {
					if (iGapStart) { // end of gap
						readGap(iGapStart, i);
						oGapParent = iGapStart = undefined;
					}
					if (oCurrentParent) { // start of new gap
						iGapStart = i;
						oGapParent = oCurrentParent;
					}
				}
			}
			if (iGapStart) { // gap at end
				readGap(iGapStart, i);
			}
			oGroupLock.unlock();

			return SyncPromise.all(aReadPromises).then(function () {
				var aElements = that.aElements.slice(iIndex, iIndex + iLength);

				aElements.$count = that.aElements.$count;

				return {value : aElements};
			});
		}

		return this.oFirstLevel.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested)
		.then(function (oResult) {
			var j;

			if (bHasGroupLevels) {
				that.addElements(oResult.value, iIndex);
				that.aElements.$count = oResult.value.$count;
				// create placeholders
				for (j = 0; j < that.aElements.$count; j += 1) {
					if (!that.aElements[j]) {
						that.aElements[j] = {};
						_Helper.setPrivateAnnotation(that.aElements[j], "index", j);
						_Helper.setPrivateAnnotation(that.aElements[j], "parent", that.oFirstLevel);
					}
				}
				that.iReadLength = iLength + iPrefetchLength;
			} else if (!that.oMeasureRangePromise) {
				oResult.value.forEach(function (oElement) {
					if (!("@$ui5.node.level" in oElement)) {
						oElement["@$ui5.node.isExpanded"] = undefined;
						oElement["@$ui5.node.isTotal"] = false;
						oElement["@$ui5.node.level"] = 1;
					}
				});
			}

			return oResult;
		});
	};

	/**
	 * Returns the cache's URL (ignoring dynamic parameters $skip/$top).
	 *
	 * @returns {string} The URL
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._AggregationCache.getResourcePath
	 */
	// @override
	_AggregationCache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath,
				_AggregationHelper.buildApply(this.oAggregation, this.mQueryOptions),
				false, true);
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Calculates the virtual key predicate and the filter for the given element (a group node or a
	 * leaf), adds the inherited key properties and the properties for groups not used in this
	 * element, and sets the node attributes.
	 *
	 * @param {object} [oGroupNode]
	 *   The parent group node or undefined for an element of the first level cache
	 * @param {string[]} aGroupBy
	 *   The ordered list of properties by which this element is grouped; used for the key predicate
	 *   and the filter
	 * @param {string[]} aMissing
	 *   A list of properties that are not grouped or aggregated and thus missing in the result, so
	 *   they have to be nulled to avoid drill-down errors
	 * @param {boolean} bLeaf
	 *   Whether this element is a leaf
	 * @param {boolean} bTotal
	 *   Whether this element is a (sub)total
	 * @param {object} mByPredicate A map of group nodes by key predicates, used to detect
	 *   collisions
	 * @param {object} oElement The element
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 * @param {string} sMetaPath The meta path of the collection in mTypeForMetaPath
	 * @throws {Error}
	 *   In case a multi-unit situation is detected via a collision of key predicates
	 *
	 * @private
	 */
	_AggregationCache.calculateKeyPredicate = function (oGroupNode, aGroupBy, aMissing,
			bLeaf, bTotal, mByPredicate, oElement, mTypeForMetaPath, sMetaPath) {
		var sPredicate;

		/*
		 * Returns a JSON string representation of the given object, but w/o the private namespace.
		 *
		 * @param {object} o
		 * @returns {string}
		 */
		function stringify(o) {
			return JSON.stringify(_Helper.publicClone(o));
		}

		// set grouping values for the levels above and below
		aGroupBy.forEach(function (sName) {
			if (!(sName in oElement)) {
				oElement[sName] = oGroupNode[sName];
			}
		});
		aMissing.forEach(function (sName) {
			oElement[sName] = null; // avoid drill-down errors
		});

		sPredicate = _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath, aGroupBy, true);
		if (sPredicate in mByPredicate) {
			throw new Error("Multi-unit situation detected: " + stringify(oElement) + " vs. "
				+ stringify(mByPredicate[sPredicate]));
		}
		_Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);

		if (!bLeaf) {
			_Helper.setPrivateAnnotation(oElement, "filter",
				_Helper.getKeyFilter(oElement, sMetaPath, mTypeForMetaPath, aGroupBy));
		}

		// set the node values - except for the grand total element
		if (oElement["@$ui5.node.level"] !== 0) {
			oElement["@$ui5.node.isExpanded"] = bLeaf ? undefined : false;
			oElement["@$ui5.node.isTotal"] = bTotal;
			oElement["@$ui5.node.level"] = oGroupNode ? oGroupNode["@$ui5.node.level"] + 1 : 1;
		}
	};

	/**
	 * Creates a cache for data aggregation that performs requests using the given requestor.
	 * Note: The paths in $expand and $select will always be sorted in the cache's query string.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string<br>
	 *   Example: Products
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must be a clone that contains
	 *   <code>aggregate</code>
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @returns {sap.ui.model.odata.v4.lib._AggregationCache}
	 *   The cache
	 *
	 * @public
	 */
	_AggregationCache.create = function (oRequestor, sResourcePath, oAggregation, mQueryOptions) {
		return new _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions);
	};

	/**
	 * Returns the aggregation information for the given level.
	 *
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must contain <code>aggregate</code>,
	 *   <code>group</code>, <code>groupLevels</code>
	 * @param {number} iLevel
	 *   The level of the request
	 * @returns {object[]}
	 *   The aggregation information for the given level with two additional properties:
	 *   <code>$groupBy</code> is an array with the ordered list of all groupables up to the given
	 *   level (to be used for key predicate and filter for child nodes);
	 *   <code>$missing</code> is an array of all properties that are not yet grouped or aggregated
	 *   at this level and thus missing in the level's result
	 *
	 * @private
	 */
	_AggregationCache.filterAggregation = function (oAggregation, iLevel) {
		var oFilteredAggregation, aGroupLevels, aLeafGroups;

		// copies the value with the given key from this map to the given target map
		function copyTo(mTarget, sKey) {
			mTarget[sKey] = this[sKey];
			return mTarget;
		}

		// filters the map using the given keys
		function filterMap(mMap, aKeys) {
			return aKeys.reduce(copyTo.bind(mMap), {});
		}

		// filters the keys of the given map according to the given filter function
		function filterKeys(mMap, fnFilter) {
			return Object.keys(mMap).filter(fnFilter);
		}

		// tells whether the given alias does not have subtotals
		function hasNoSubtotals(sAlias) {
			return !oAggregation.aggregate[sAlias].subtotals;
		}

		// tells whether the given alias has subtotals
		function hasSubtotals(sAlias) {
			return oAggregation.aggregate[sAlias].subtotals;
		}

		// tells whether the given groupable property is not a group level
		function isNotGroupLevel(sGroupable) {
			return oAggregation.groupLevels.indexOf(sGroupable) < 0;
		}

		aGroupLevels = oAggregation.groupLevels.slice(iLevel - 1, iLevel);
		oFilteredAggregation = {
			aggregate : aGroupLevels.length
				? filterMap(oAggregation.aggregate,
					filterKeys(oAggregation.aggregate, hasSubtotals))
				: oAggregation.aggregate,
			groupLevels : aGroupLevels,
			$groupBy : oAggregation.groupLevels.slice(0, iLevel)
		};
		aLeafGroups = filterKeys(oAggregation.group, isNotGroupLevel).sort();

		if (aGroupLevels.length) {
			oFilteredAggregation.group = {};
			oFilteredAggregation.$missing
				= oAggregation.groupLevels.slice(iLevel).concat(aLeafGroups)
					.concat(Object.keys(oAggregation.aggregate).filter(hasNoSubtotals));
		} else { // leaf
			oFilteredAggregation.group = filterMap(oAggregation.group, aLeafGroups);
			oFilteredAggregation.$groupBy = oFilteredAggregation.$groupBy.concat(aLeafGroups);
			oFilteredAggregation.$missing = [];
		}

		return oFilteredAggregation;
	};

	/**
	 * Returns the "$orderby" system query option filtered in such a way that only aggregatable or
	 * groupable properties contained in the given aggregation information are used.
	 *
	 * @param {string} [sOrderby]
	 *   The original "$orderby" system query option
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must contain <code>aggregate</code>,
	 *   <code>group</code>, <code>groupLevels</code>
	 * @returns {string}
	 *   The filtered "$orderby" system query option
	 *
	 * @private
	 */
	_AggregationCache.filterOrderby = function (sOrderby, oAggregation) {
		if (sOrderby) {
			return sOrderby.split(rComma).filter(function (sOrderbyItem) {
				var sName;

				if (rODataIdentifier.test(sOrderbyItem)) {
					sName = sOrderbyItem.split(rRws)[0]; // drop optional asc/desc
					return sName in oAggregation.aggregate || sName in oAggregation.group
						|| oAggregation.groupLevels.indexOf(sName) >= 0;
				}
				return true;
			}).join(",");
		}
	};

	/**
	 * Returns the resource path including the query string with "$apply" which includes the
	 * aggregation functions for count and grand total, minimum or maximum values and "skip()/top()"
	 * as transformations. Follow-up requests do not aggregate the count and minimum or maximum
	 * values again. Grand total values are requested only for <code>iStart === 0</code>.
	 *
	 * This function is used to replace <code>getResourcePath</code> of the first level cache and
	 * needs to be called on the first level cache.
	 *
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must contain <code>aggregate</code>
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the aggregation cache's original query string
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @returns {string} The resource path including the query string
	 *
	 * @private
	 */
	_AggregationCache.getResourcePath = function (oAggregation, mQueryOptions, iStart, iEnd) {
		mQueryOptions = Object.assign({}, mQueryOptions, {
			$skip : iStart,
			$top : iEnd - iStart
		});
		mQueryOptions = _AggregationHelper.buildApply(oAggregation, mQueryOptions, null,
			this.bFollowUp);
		this.bFollowUp = true; // next request is a follow-up

		return this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
	};

	/**
	 * Handles a GET response by extracting the minimum and the maximum values from the given
	 * result, resolving the measure range promise and calling <code>fnHandleResponse</code> with
	 * the remaining values of <code>aResult</code>. Restores the original
	 * <code>handleResponse</code>. This function needs to be called on the first level cache.
	 *
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also
	 *   <a href="http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/">OData
	 *   Extension for Data Aggregation Version 4.0</a>; must be a clone that contains
	 *   <code>aggregate</code>, <code>group</code>, <code>groupLevels</code>
	 * @param {object} [mAlias2MeasureAndMethod]
	 *   A map of the virtual property names to the corresponding measure property names and the
	 *   aggregation functions, for example:
	 *   <code> UI5min__Property : {measure : "Property", method : "min"} </code>
	 * @param {function} [fnMeasureRangeResolve]
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
	 * @private
	 */
	// @override
	_AggregationCache.handleResponse = function (oAggregation, mAlias2MeasureAndMethod,
			fnMeasureRangeResolve, fnHandleResponse, iStart, iEnd, oResult, mTypeForMetaPath) {
		var sAlias,
			mMeasureRange = {},
			oMinMaxElement;

		function getMeasureRange(sMeasure) {
			mMeasureRange[sMeasure] = mMeasureRange[sMeasure] || {};
			return mMeasureRange[sMeasure];
		}

		if (mAlias2MeasureAndMethod) {
			oMinMaxElement = oResult.value.shift();
			oResult["@odata.count"] = oMinMaxElement.UI5__count;
			for (sAlias in mAlias2MeasureAndMethod) {
				getMeasureRange(mAlias2MeasureAndMethod[sAlias].measure)
					[mAlias2MeasureAndMethod[sAlias].method] = oMinMaxElement[sAlias];
			}
			fnMeasureRangeResolve(mMeasureRange);
			this.handleResponse = fnHandleResponse;
		} else {
			oMinMaxElement = oResult.value[0];
			if ("UI5__count" in oMinMaxElement) {
				this.iLeafCount = parseInt(oMinMaxElement.UI5__count);
				oResult["@odata.count"] = this.iLeafCount + 1;
				if (iStart > 0) { // drop row with UI5__count only
					oResult.value.shift();
				}
			}
			if (iStart === 0) { // grand total row: rename measures, add empty dimensions
				oMinMaxElement["@$ui5.node.isExpanded"] = true;
				oMinMaxElement["@$ui5.node.isTotal"] = true;
				oMinMaxElement["@$ui5.node.level"] = 0;
				Object.keys(oMinMaxElement).forEach(function (sKey) {
					if (sKey.startsWith("UI5grand__")) {
						oMinMaxElement[sKey.slice(10)] = oMinMaxElement[sKey];
					}
				});
				// avoid "Failed to drill-down" for missing properties
				Object.keys(oAggregation.aggregate).forEach(function (sAggregate) {
					oMinMaxElement[sAggregate] = oMinMaxElement[sAggregate] || null;
				});
				Object.keys(oAggregation.group).forEach(function (sGroup) {
					oMinMaxElement[sGroup] = null;
				});
			}
		}

		fnHandleResponse.call(this, iStart, iEnd, oResult, mTypeForMetaPath);
	};

	return _AggregationCache;
}, /* bExport= */false);