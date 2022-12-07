/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._AggregationCache
sap.ui.define([
	"./_AggregationHelper",
	"./_Cache",
	"./_ConcatHelper",
	"./_GroupLock",
	"./_Helper",
	"./_MinMaxHelper",
	"sap/base/Log",
	"sap/ui/base/SyncPromise"
], function (_AggregationHelper, _Cache, _ConcatHelper, _GroupLock, _Helper, _MinMaxHelper,
		Log, SyncPromise) {
	"use strict";

	//*********************************************************************************************
	// _AggregationCache
	//*********************************************************************************************

	/**
	 * Creates a cache for data aggregation that performs requests using the given requestor.
	 * Note: The paths in $expand and $select will always be sorted in the cache's query string.
	 * This kind of cache is only used if grand totals or group levels are involved!
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} oAggregation
	 *   An object holding the information needed for data aggregation; see also "OData Extension
	 *   for Data Aggregation Version 4.0"; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} bHasGrandTotal
	 *   Whether a grand total is needed
	 *
	 * @alias sap.ui.model.odata.v4.lib._AggregationCache
	 * @borrows sap.ui.model.odata.v4.lib._CollectionCache#requestSideEffects as #requestSideEffects
	 * @constructor
	 * @extends sap.ui.model.odata.v4.lib._Cache
	 * @private
	 */
	function _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions,
			bHasGrandTotal) {
		var fnCount = function () {}, // no specific handling needed for "UI5__count" here
			fnLeaves = null,
			fnResolve,
			that = this;

		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, true);

		this.oAggregation = oAggregation;
		this.sDownloadUrl = oAggregation.hierarchyQualifier
			? "n/a"
			: _Cache.prototype.getDownloadUrl.call(this, "");
		this.aElements = [];
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined;
		this.aElements.$created = 0; // required for _Cache#drillDown (see _Cache.from$skip)
		this.oCountPromise = undefined;
		if (mQueryOptions.$count) {
			if (oAggregation.hierarchyQualifier) {
				this.oCountPromise = new SyncPromise(function (resolve) {
					fnResolve = resolve;
				});
				this.oCountPromise.$resolve = fnResolve;
			} else if (oAggregation.groupLevels.length) {
				mQueryOptions.$$leaves = true; // do this after #getDownloadUrl
				this.oCountPromise = new SyncPromise(function (resolve) {
					fnLeaves = function (oLeaves) {
						// Note: count has type Edm.Int64, represented as string in OData responses;
						// $count should be a number and the loss of precision is acceptable
						resolve(parseInt(oLeaves.UI5__leaves));
					};
				});
			}
		}
		this.oFirstLevel = this.createGroupLevelCache(null, bHasGrandTotal || !!fnLeaves);
		this.requestSideEffects = this.oFirstLevel.requestSideEffects; // @borrows ...
		this.oGrandTotalPromise = undefined;
		if (bHasGrandTotal) {
			this.oGrandTotalPromise = new SyncPromise(function (resolve) {
				_ConcatHelper.enhanceCache(that.oFirstLevel, oAggregation, [fnLeaves,
					function (oGrandTotal) {
						var oGrandTotalCopy;

						if (oAggregation["grandTotal like 1.84"]) { // rename measures
							_AggregationHelper.removeUI5grand__(oGrandTotal);
						}
						_AggregationHelper.setAnnotations(oGrandTotal, true, true, 0,
							_AggregationHelper.getAllProperties(oAggregation));

						if (oAggregation.grandTotalAtBottomOnly === false) {
							// Note: make shallow copy *before* there are private annotations!
							oGrandTotalCopy = Object.assign({}, oGrandTotal, {
									"@$ui5.node.isExpanded" : undefined // treat copy as a leaf
								});
							_Helper.setPrivateAnnotation(oGrandTotal, "copy", oGrandTotalCopy);
							_Helper.setPrivateAnnotation(oGrandTotalCopy, "predicate",
								"($isTotal=true)");
						}
						_Helper.setPrivateAnnotation(oGrandTotal, "predicate", "()");

						resolve(oGrandTotal);
					}, fnCount]);
			});
		} else if (fnLeaves) {
			_ConcatHelper.enhanceCache(that.oFirstLevel, oAggregation, [fnLeaves, fnCount]);
		}
	}

	// make _AggregationCache a _Cache
	_AggregationCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Copies the given elements from a cache read into <code>this.aElements</code>.
	 *
	 * @param {object|object[]} vReadElements
	 *   The elements from a cache read, or just a single one
	 * @param {number} iOffset
	 *   The offset within aElements
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} [oCache]
	 *   The group level cache which the given elements have been read from; omit it only for grand
	 *   totals or separate subtotals
	 * @param {number} [iStart]
	 *   The index of the first element within the cache's collection; omit it only if no group
	 *   level cache is given
	 * @throws {Error}
	 *   In case an unexpected element or placeholder would be overwritten, if the given offset is
	 *   negative, if a resulting array index is out of bounds, or in case of a duplicate predicate
	 *
	 * @private
	 */
	_AggregationCache.prototype.addElements = function (vReadElements, iOffset, oCache, iStart) {
		var aElements = this.aElements;

		function addElement(oElement, i) {
			var oOldElement = aElements[iOffset + i],
				oOtherElement,
				sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

			if (oOldElement) { // check before overwriting
				if (oOldElement === oElement) {
					return;
				}
				_AggregationHelper
					.beforeOverwritePlaceholder(oOldElement, oElement, oCache, iStart + i);
			} else if (iOffset + i >= aElements.length) {
				throw new Error("Array index out of bounds: " + (iOffset + i));
			}
			oOtherElement = aElements.$byPredicate[sPredicate];
			if (oOtherElement && oOtherElement !== oElement
					&& !(oOtherElement instanceof SyncPromise)) {
				throw new Error("Duplicate predicate: " + sPredicate);
			}

			aElements.$byPredicate[sPredicate] = aElements[iOffset + i] = oElement;

			if (oCache) {
				// remember index & parent for #requestSideEffects
				_Helper.setPrivateAnnotation(oElement, "index", iStart + i);
				_Helper.setPrivateAnnotation(oElement, "parent", oCache);
			}
		}

		if (iOffset < 0) {
			throw new Error("Illegal offset: " + iOffset);
		}
		if (Array.isArray(vReadElements)) {
			vReadElements.forEach(addElement);
		} else {
			addElement(vReadElements, 0);
		}
	};

	/**
	 * Deletes the "$apply" system query option before side effects are requested.
	 *
	 * @param {object} mQueryOptions
	 *   A modifiable map of key-value pairs representing the query string
	 * @throws {Error}
	 *   If no recursive hierarchy is used
	 *
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#requestSideEffects
	 */
	_AggregationCache.prototype.beforeRequestSideEffects = function (mQueryOptions) {
		if (!this.oAggregation.hierarchyQualifier) {
			throw new Error("Missing recursive hierarchy");
		}
		delete mQueryOptions.$apply;
	};

	/**
	 * Collapses the group node at the given path.
	 *
	 * @param {string} sGroupNodePath
	 *   The group node path relative to the cache
	 * @returns {number}
	 *   The number of descendant nodes that were affected
	 *
	 * @public
	 * @see #expand
	 */
	_AggregationCache.prototype.collapse = function (sGroupNodePath) {
		var oCollapsed,
			iCount = 0,
			iDescendants,
			aElements = this.aElements,
			oGroupNode = this.fetchValue(_GroupLock.$cached, sGroupNodePath).getResult(),
			iGroupNodeLevel = oGroupNode["@$ui5.node.level"],
			iIndex = aElements.indexOf(oGroupNode),
			i = iIndex + 1;

		function collapse(j) {
			delete aElements.$byPredicate[_Helper.getPrivateAnnotation(aElements[j], "predicate")];
			iCount += 1;
		}

		oCollapsed = _AggregationHelper.getCollapsedObject(oGroupNode);
		_Helper.updateAll(this.mChangeListeners, sGroupNodePath, oGroupNode, oCollapsed);

		iDescendants = _Helper.getPrivateAnnotation(oGroupNode, "descendants");
		if (iDescendants) { // => this.oAggregation.expandTo > 1
			// Note: "descendants" refers to LimitedDescendantCountProperty and counts descendants
			// within "top pyramid" only!
			iGroupNodeLevel = this.oAggregation.expandTo;
		}
		while (i < aElements.length) {
			if (aElements[i]["@$ui5.node.level"] <= iGroupNodeLevel) {
				// Note: level 0 or 1 is used for initial placeholders of 1st level cache!
				if (!iDescendants) {
					break; // we've reached a sibling of the collapsed node
				}
				iDescendants -= 1;
				if (aElements[i]["@$ui5.node.isExpanded"] === false) {
					// skip descendants of manually collapsed node
					iDescendants -= _Helper.getPrivateAnnotation(aElements[i], "descendants") || 0;
				}
			}
			collapse(i);
			i += 1;
		}
		if (this.oAggregation.subtotalsAtBottomOnly !== undefined
				// Note: there is at least one key for "@$ui5.node.isExpanded"; there are more keys
				// if and only if subtotals are actually being requested and (also) shown at the
				// bottom
				&& Object.keys(oCollapsed).length > 1) {
			collapse(i); // collapse subtotals at bottom
		}
		_Helper.setPrivateAnnotation(oGroupNode, "spliced", aElements.splice(iIndex + 1, iCount));
		aElements.$count -= iCount;

		return iCount;
	};

	/**
	 * Creates a cache for the children (next group level or leaves) of the given group node.
	 * Creates the first level cache if there is no group node.
	 *
	 * @param {object} [oGroupNode]
	 *   The group node or <code>undefined</code> for the first level cache
	 * @param {boolean} [bHasConcatHelper]
	 *   Whether the _ConcatHelper is involved (use only for the first level cache!)
	 * @returns {sap.ui.model.odata.v4.lib._CollectionCache}
	 *   The group level cache
	 *
	 * @private
	 */
	_AggregationCache.prototype.createGroupLevelCache = function (oGroupNode, bHasConcatHelper) {
		var oAggregation = this.oAggregation,
			iLevel = oGroupNode ? oGroupNode["@$ui5.node.level"] + 1 : 1,
			aAllProperties, oCache, aGroupBy, bLeaf, mQueryOptions, bTotal;

		if (oAggregation.hierarchyQualifier) {
			mQueryOptions = Object.assign({}, this.mQueryOptions);
		} else {
			aAllProperties = _AggregationHelper.getAllProperties(oAggregation);
			bLeaf = iLevel > oAggregation.groupLevels.length;
			aGroupBy = bLeaf
				? oAggregation.groupLevels.concat(Object.keys(oAggregation.group).sort())
				: oAggregation.groupLevels.slice(0, iLevel);
			mQueryOptions
				= _AggregationHelper.filterOrderby(this.mQueryOptions, oAggregation, iLevel);
			bTotal = !bLeaf && Object.keys(oAggregation.aggregate).some(function (sAlias) {
				return oAggregation.aggregate[sAlias].subtotals;
			});
		}
		if (oGroupNode) {
			// Note: parent filter is just eq/and, no need for parentheses, but
			// $$filterBeforeAggregate is a black box! Put specific filter 1st for performance!
			mQueryOptions.$$filterBeforeAggregate
				= _Helper.getPrivateAnnotation(oGroupNode, "filter")
					+ (mQueryOptions.$$filterBeforeAggregate
						? " and (" + mQueryOptions.$$filterBeforeAggregate + ")"
						: "");
		}
		if (!bHasConcatHelper) {
			// Note: UI5__count currently handled only by _ConcatHelper!
			delete mQueryOptions.$count;
			mQueryOptions = _AggregationHelper.buildApply(oAggregation, mQueryOptions, iLevel);
		}
		mQueryOptions.$count = true;
		oCache = _Cache.create(this.oRequestor, this.sResourcePath, mQueryOptions, true);
		oCache.calculateKeyPredicate = oAggregation.hierarchyQualifier
			? _AggregationCache.calculateKeyPredicateRH.bind(null, oGroupNode, oAggregation)
			: _AggregationCache.calculateKeyPredicate.bind(null, oGroupNode, aGroupBy,
				aAllProperties, bLeaf, bTotal);

		return oCache;
	};

	/**
	 * Expands the given group node.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
	 * @param {object|string} vGroupNodeOrPath
	 *   The group node or its path relative to the cache; a group node instance (instead of a path)
	 *   MUST only be given in case of "expanding" continued
	 * @returns {sap.ui.base.SyncPromise<number>}
	 *   A promise that is resolved with the number of nodes at the next level
	 *
	 * @public
	 * @see #collapse
	 */
	_AggregationCache.prototype.expand = function (oGroupLock, vGroupNodeOrPath) {
		var oCache,
			iCount,
			aElements = this.aElements,
			oGroupNode = typeof vGroupNodeOrPath === "string"
				? this.fetchValue(_GroupLock.$cached, vGroupNodeOrPath).getResult()
				: vGroupNodeOrPath,
			iIndex,
			aSpliced = _Helper.getPrivateAnnotation(oGroupNode, "spliced"),
			bStale,
			that = this;

		if (vGroupNodeOrPath !== oGroupNode) {
			// Note: this also prevents a 2nd expand of the same node
			_Helper.updateAll(this.mChangeListeners, vGroupNodeOrPath, oGroupNode,
				_AggregationHelper.getOrCreateExpandedObject(this.oAggregation, oGroupNode));
		} // else: no update needed!

		if (aSpliced) {
			_Helper.deletePrivateAnnotation(oGroupNode, "spliced");
			bStale = aSpliced.$stale;

			iIndex = aElements.indexOf(oGroupNode) + 1;
			// insert aSpliced at iIndex
			this.aElements = aElements.concat(aSpliced, aElements.splice(iIndex));
			this.aElements.$byPredicate = aElements.$byPredicate;

			iCount = aSpliced.length;
			this.aElements.$count = aElements.$count + iCount;
			aSpliced.forEach(function (oElement, i) {
				var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

				if (!_Helper.hasPrivateAnnotation(oElement, "placeholder")) {
					if (bStale) {
						that.replaceByPlaceholder(iIndex + i, oElement, sPredicate);
					} else {
						that.aElements.$byPredicate[sPredicate] = oElement;
						if (_Helper.hasPrivateAnnotation(oElement, "expanding")) {
							_Helper.deletePrivateAnnotation(oElement, "expanding");
							iCount += that.expand(_GroupLock.$cached, oElement).getResult();
						}
					}
				}
			});
			return SyncPromise.resolve(iCount);
		}

		oCache = _Helper.getPrivateAnnotation(oGroupNode, "cache");
		if (!oCache) {
			oCache = this.createGroupLevelCache(oGroupNode);
			_Helper.setPrivateAnnotation(oGroupNode, "cache", oCache);
		}

		// prefetch from the group level cache
		return oCache.read(0, this.iReadLength, 0, oGroupLock).then(function (oResult) {
			var iIndex = that.aElements.indexOf(oGroupNode) + 1,
				iLevel = oGroupNode["@$ui5.node.level"],
				oSubtotals = _AggregationHelper.getCollapsedObject(oGroupNode),
				// Note: there is at least one key for "@$ui5.node.isExpanded"; there are more keys
				// if and only if subtotals are actually being requested and only or also shown at
				// bottom
				bSubtotalsAtBottom = that.oAggregation.subtotalsAtBottomOnly !== undefined
					&& Object.keys(oSubtotals).length > 1,
				i;

			if (!oGroupNode["@$ui5.node.isExpanded"]) { // already collapsed again
				// Note: we MUST not change "@$ui5.node.isExpanded" in this case!
				_Helper.deletePrivateAnnotation(oGroupNode, "spliced");
				return 0;
			}
			if (!iIndex) { // some parent already collapsed again
				_Helper.setPrivateAnnotation(oGroupNode, "expanding", true);
				return 0;
			}

			iCount = oResult.value.$count;
			if (_Helper.hasPrivateAnnotation(oGroupNode, "groupLevelCount")
				&& _Helper.getPrivateAnnotation(oGroupNode, "groupLevelCount") !== iCount) {
				throw new Error("Unexpected structural change: groupLevelCount");
			}
			_Helper.setPrivateAnnotation(oGroupNode, "groupLevelCount", iCount);
			_Helper.updateAll(that.mChangeListeners, vGroupNodeOrPath, oGroupNode,
				{"@$ui5.node.groupLevelCount" : iCount});
			if (bSubtotalsAtBottom) {
				iCount += 1;
			}
			if (iIndex === that.aElements.length) { // expanding last node: make room for children
				that.aElements.length += iCount;
			} else {
				// create the gap
				for (i = that.aElements.length - 1; i >= iIndex; i -= 1) {
					that.aElements[i + iCount] = that.aElements[i];
					delete that.aElements[i]; // delete to allow overwrite below
				}
			}
			// fill in the results
			that.addElements(oResult.value, iIndex, oCache, 0);
			// create placeholder
			for (i = iIndex + oResult.value.length; i < iIndex + oResult.value.$count; i += 1) {
				that.aElements[i]
					= _AggregationHelper.createPlaceholder(iLevel + 1, i - iIndex, oCache);
			}
			if (bSubtotalsAtBottom) {
				oSubtotals = Object.assign({}, oSubtotals);
				_AggregationHelper.setAnnotations(oSubtotals, undefined, true, iLevel,
					_AggregationHelper.getAllProperties(that.oAggregation));
				_Helper.setPrivateAnnotation(oSubtotals, "predicate",
					_Helper.getPrivateAnnotation(oGroupNode, "predicate").slice(0, -1)
						+ ",$isTotal=true)");
				that.addElements(oSubtotals, iIndex + iCount - 1);
			}
			that.aElements.$count += iCount;

			return iCount;
		}, function (oError) {
			// Note: typeof vGroupNodeOrPath === "string"
			_Helper.updateAll(that.mChangeListeners, vGroupNodeOrPath, oGroupNode,
				_AggregationHelper.getCollapsedObject(oGroupNode));

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
			if (this.oCountPromise) {
				return this.oCountPromise;
			}
			if (this.oAggregation.hierarchyQualifier || this.oAggregation.groupLevels.length) {
				Log.error("Failed to drill-down into $count, invalid segment: $count",
					this.toString(), "sap.ui.model.odata.v4.lib._Cache");

				return SyncPromise.resolve();
			}

			return this.oFirstLevel.fetchValue(oGroupLock, sPath, fnDataRequested, oListener);
		}

		return SyncPromise.resolve(this.aElements.$byPredicate[sPath.split("/")[0]])
			.then(function () {
				that.registerChangeListener(sPath, oListener);

				return that.drillDown(that.aElements, sPath, oGroupLock);
			});
	};

	/**
	 * Returns an array containing all current elements of this aggregation cache's flat list; the
	 * array is annotated with the collection's $count. If there are placeholders, the corresponding
	 * objects will be ignored and set to <code>undefined</code>.
	 *
	 * @param {string} [sPath] - Relative path to drill-down into, MUST be empty
	 * @returns {object[]} The cache elements
	 * @throws {Error} If a non-empty path is given
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#getAllElements
	_AggregationCache.prototype.getAllElements = function (sPath) {
		var aAllElements;

		if (sPath) {
			throw new Error("Unsupported path: " + sPath);
		}

		aAllElements = this.aElements.map(function (oElement) {
			return _Helper.hasPrivateAnnotation(oElement, "placeholder") ? undefined : oElement;
		});
		aAllElements.$count = this.aElements.$count;

		return aAllElements;
	};

	/**
	 * Nothing to do here, we have no created elements.
	 *
	 * @param {string} [_sPath]
	 *   Relative path to drill-down into
	 * @returns {object[]}
	 *   An empty array
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#getCreatedElements
	_AggregationCache.prototype.getCreatedElements = function (_sPath) {
		return [];
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getDownloadQueryOptions
	 */
	_AggregationCache.prototype.getDownloadQueryOptions = function (mQueryOptions) {
		return _AggregationHelper.buildApply(this.oAggregation,
			_AggregationHelper.filterOrderby(mQueryOptions, this.oAggregation),
			0, true);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getDownloadUrl
	 */
	_AggregationCache.prototype.getDownloadUrl = function (_sPath, _mCustomQueryOptions) {
		return this.sDownloadUrl;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getValue
	 */
	_AggregationCache.prototype.getValue = function (sPath) {
		var oSyncPromise;

		oSyncPromise = this.fetchValue(_GroupLock.$cached, sPath);
		if (oSyncPromise.isFulfilled()) {
			return oSyncPromise.getResult();
		}
		oSyncPromise.caught();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#isDeletingInOtherGroup
	 */
	_AggregationCache.prototype.isDeletingInOtherGroup = function (_sGroupId) {
		return false;
	};

	/**
	 * Determines the list of elements determined by the given predicates. All other elements are
	 * replaced by placeholders (lazily).
	 *
	 * @param {string[]} aPredicates
	 *   The key predicates of the elements to request side effects for
	 * @returns {object[]}
	 *   The list of elements for the given predicates
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#keepOnlyGivenElements
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#requestSideEffects
	 */
	_AggregationCache.prototype.keepOnlyGivenElements = function (aPredicates) {
		var mPredicates = {}, // a set of the predicates (as map to true) to speed up the search
			that = this;

		aPredicates.forEach(function (sPredicate) {
			mPredicates[sPredicate] = true;
		});

		return this.aElements.filter(function (oElement, i) {
			var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

			if (mPredicates[sPredicate]) {
				_AggregationHelper.markSplicedStale(oElement);
				return true; // keep and request
			}

			that.replaceByPlaceholder(i, oElement, sPredicate);
		});
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
	 *   prefetch data for a paged access. <code>Infinity</code> is supported.
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
	 *   HTTP request fails, the error from the _Requestor is returned.
	 *   The promise is rejected if a conflicting {@link #collapse} happens before the response
	 *   arrives, in this case the error has the property <code>canceled</code> with value
	 *   <code>true</code>.
	 * @throws {Error} If given index or length is less than 0, or if
	 *   <code>iPrefetchLength !== 0</code> is used while reading a grand total row separately
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#read
	 */
	_AggregationCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var oCurrentParent,
			oElement,
			iFirstLevelIndex = iIndex,
			iFirstLevelLength = iLength,
			oGapParent,
			iGapStart,
			bHasGrandTotalAtTop = this.oGrandTotalPromise
				&& this.oAggregation.grandTotalAtBottomOnly !== true,
			aReadPromises = [],
			i, n,
			that = this;

		/*
		 * Reads the given range of the current gap, saves the promise, and replaces the gap with
		 * the read's result.
		 *
		 * @param {number} iGapStart start of gap, inclusive
		 * @param {number} iGapEnd end of gap, exclusive
		 */
		function readGap(iGapStart, iGapEnd) {
			aReadPromises.push(
				that.readGap(oGapParent, iGapStart, iGapEnd, oGroupLock.getUnlockedCopy(),
					fnDataRequested));
		}

		if (bHasGrandTotalAtTop && !iIndex && iLength === 1) {
			if (iPrefetchLength !== 0) {
				throw new Error("Unsupported prefetch length: " + iPrefetchLength);
			}
			oGroupLock.unlock();

			return this.oGrandTotalPromise.then(function (oGrandTotal) {
				return {value : [oGrandTotal]};
			});
		}

		if (this.aElements.$count === undefined) {
			this.iReadLength = iLength + iPrefetchLength;
			if (bHasGrandTotalAtTop) { // account for grand total row at top
				if (iFirstLevelIndex) {
					iFirstLevelIndex -= 1;
				} else {
					iFirstLevelLength -= 1;
				}
			}
			aReadPromises.push(
				this.readCount(oGroupLock),
				this.readFirst(iFirstLevelIndex, iFirstLevelLength, iPrefetchLength,
					oGroupLock, fnDataRequested));
		} else {
			for (i = iIndex, n = Math.min(iIndex + iLength, this.aElements.length); i < n; i += 1) {
				oElement = this.aElements[i];
				oCurrentParent = _Helper.hasPrivateAnnotation(oElement, "placeholder")
					? _Helper.getPrivateAnnotation(oElement, "parent")
					: undefined;
				if (oCurrentParent !== oGapParent) {
					if (iGapStart !== undefined) { // end of gap
						readGap(iGapStart, i);
						oGapParent = iGapStart = undefined;
					}
					if (oCurrentParent) { // start of new gap
						iGapStart = i;
						oGapParent = oCurrentParent;
					}
				} else if (iGapStart !== undefined
						&& _Helper.getPrivateAnnotation(oElement, "index")
							!== _Helper.getPrivateAnnotation(this.aElements[i - 1], "index") + 1) {
					// Note: w/ side effect, indices might not be consecutive => split gap
					readGap(iGapStart, i);
					iGapStart = i;
				}
			}
			if (iGapStart !== undefined) { // gap at end
				readGap(iGapStart, i);
			}
			oGroupLock.unlock();
		}

		return SyncPromise.all(aReadPromises).then(function () {
			var aElements = that.aElements.slice(iIndex, iIndex + iLength);

			aElements.$count = that.aElements.$count;

			return {value : aElements};
		});
	};

	/**
	 * Reads the count of data (in case of a recursive hierarchy), taking the current filter and
	 * search into account.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with;
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy} still needs to be called!
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise resolving without a defined result when the read is finished, or rejecting in
	 *   case of an error; <code>undefined</code> in case no count needs to be read
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @private
	 */
	_AggregationCache.prototype.readCount = function (oGroupLock) {
		var fnResolve = this.oCountPromise && this.oCountPromise.$resolve,
			sResourcePath = this.sResourcePath + "/$count",
			sSeparator = "?";

		if (fnResolve) {
			delete this.oCountPromise.$resolve;
			if (this.mQueryOptions.$filter) {
				sResourcePath += "?$filter=" + this.mQueryOptions.$filter;
				sSeparator = "&";
			}
			if (this.oAggregation.search) {
				sResourcePath += sSeparator + "$search=" + this.oAggregation.search;
			}

			return this.oRequestor.request("GET", sResourcePath, oGroupLock.getUnlockedCopy())
				.then(fnResolve); // Note: $count is already of type number here
		}
	};

	/**
	 * Reads the first range of data being requested.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iLength
	 *   The length of the range; <code>Infinity</code> is supported
	 * @param {number} iPrefetchLength
	 *   The number of rows to read before and after the given range; with this it is possible to
	 *   prefetch data for a paged access. code>Infinity</code> is supported.
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the read is finished, or rejecting in
	 *   case of an error
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @private
	 */
	_AggregationCache.prototype.readFirst = function (iStart, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var that = this;

		return this.oFirstLevel.read(iStart, iLength, iPrefetchLength, oGroupLock, fnDataRequested)
			.then(function (oResult) {
				// Note: this code must be idempotent, it might well run twice!
				var oGrandTotal,
					oGrandTotalCopy,
					iOffset = 0, // offset for 1st level data rows
					j;

				that.aElements.length = that.aElements.$count = oResult.value.$count;

				if (that.oGrandTotalPromise) {
					that.aElements.$count += 1;
					that.aElements.length += 1;
					oGrandTotal = that.oGrandTotalPromise.getResult();

					switch (that.oAggregation.grandTotalAtBottomOnly) {
						case false: // top & bottom
							iOffset = 1;
							that.aElements.$count += 1;
							that.aElements.length += 1;
							that.addElements(oGrandTotal, 0);
							oGrandTotalCopy
								= _Helper.getPrivateAnnotation(oGrandTotal, "copy");
							that.addElements(oGrandTotalCopy, that.aElements.length - 1);
							break;

						case true: // bottom
							that.addElements(oGrandTotal, that.aElements.length - 1);
							break;

						default: // top
							iOffset = 1;
							that.addElements(oGrandTotal, 0);
					}
				}

				that.addElements(oResult.value, iStart + iOffset, that.oFirstLevel, iStart);
				for (j = 0; j < that.aElements.$count; j += 1) {
					if (!that.aElements[j]) {
						that.aElements[j] = _AggregationHelper.createPlaceholder(
							that.oAggregation.expandTo > 1 ? /*don't know*/0 : 1,
							j - iOffset, that.oFirstLevel);
					}
				}
			});
	};

	/**
	 * Reads the given gap from the given cache and replaces the gap with the read's result.
	 *
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
	 *   The collection cache to read data from
	 * @param {number} iStart
	 *   Start of gap, inclusive
	 * @param {number} iEnd
	 *   End of gap, exclusive
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the read is finished, or rejecting in
	 *   case of an error
	 * @throws {Error} If index of placeholder at start of gap is less than 0, or if end of gap is
	 *   before start
	 *
	 * @private
	 */
	_AggregationCache.prototype.readGap = function (oCache, iStart, iEnd, oGroupLock,
			fnDataRequested) {
		var sPredicate,
			oPromise,
			mQueryOptions = oCache.getQueryOptions(),
			iIndex = _Helper.getPrivateAnnotation(this.aElements[iStart], "index"),
			oStartElement = this.aElements[iStart],
			i,
			that = this;

		if (mQueryOptions.$count) { // $count not needed anymore, 1st read was done by #expand
			delete mQueryOptions.$count;
			oCache.setQueryOptions(mQueryOptions, true);
		}

		oPromise = oCache.read(iIndex, iEnd - iStart, 0, oGroupLock, fnDataRequested)
			.then(function (oResult) {
				// Note: this code must be idempotent, it might well run twice!
				var bGapHasMoved = false,
					oError;

				// Note: aElements[iGapStart] may have changed by a parallel operation
				if (oStartElement !== that.aElements[iStart]
						&& oResult.value[0] !== that.aElements[iStart]) {
					// start of the gap has moved meanwhile
					bGapHasMoved = true;
					iStart = that.aElements.indexOf(oStartElement);
					if (iStart < 0) {
						iStart = that.aElements.indexOf(oResult.value[0]);
						if (iStart < 0) {
							oError = new Error("Collapse before read has finished");
							oError.canceled = true;
							throw oError;
						}
					}
				}

				that.addElements(oResult.value, iStart, oCache, iIndex);

				if (bGapHasMoved) {
					oError = new Error("Collapse or expand before read has finished");
					oError.canceled = true;
					throw oError;
				}
			});
		if (oPromise.isPending()) {
			for (i = iStart; i < iEnd; i += 1) {
				sPredicate = _Helper.getPrivateAnnotation(this.aElements[i], "predicate");

				if (sPredicate) {
					this.aElements.$byPredicate[sPredicate] = oPromise;
				}
			}
		}

		return oPromise;
	};

	/**
	 * Refreshes the kept-alive elements. Nothing to do here, we have no kept-alive elements.
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#refreshKeptElements
	 */
	_AggregationCache.prototype.refreshKeptElements = function () {};

	/**
	 * Replaces the given element, which is at the given position and has the given predicate, with
	 * a placeholder which keeps all private annotations. The original element is removed from its
	 * corresponding cache and must not be used any longer.
	 *
	 * @param {number} iIndex - Its index
	 * @param {object} oElement - An element
	 * @param {string} sPredicate - Its predicate
	 *
	 * @private
	 */
	_AggregationCache.prototype.replaceByPlaceholder = function (iIndex, oElement, sPredicate) {
		if (_Helper.hasPrivateAnnotation(oElement, "placeholder")) {
			return;
		}

		_AggregationHelper.markSplicedStale(oElement);
		this.aElements[iIndex] = {
			"@$ui5._" : Object.assign(oElement["@$ui5._"], {placeholder : true}),
			"@$ui5.node.isExpanded" : oElement["@$ui5.node.isExpanded"],
			"@$ui5.node.level" : oElement["@$ui5.node.level"]
		};
		delete this.aElements.$byPredicate[sPredicate];

		// drop original element from its cache's collection
		_Helper.getPrivateAnnotation(oElement, "parent")
			.drop(_Helper.getPrivateAnnotation(oElement, "index"), sPredicate);
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._AggregationCache#getDownloadUrl
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#toString
	_AggregationCache.prototype.toString = function () {
		return this.sDownloadUrl;
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
	 *   The group node or <code>undefined</code> for an element of the first level cache
	 * @param {string[]} aGroupBy
	 *   The ordered list of properties by which this element is grouped; used for the key predicate
	 *   and the filter
	 * @param {string[]} aAllProperties
	 *   A list of all properties that might be missing in the result and thus have to be inherited
	 *   from the group node or nulled, in order to avoid drill-down errors
	 * @param {boolean} bLeaf
	 *   Whether this element is a leaf
	 * @param {boolean} bTotal
	 *   Whether this element is a (sub)total
	 * @param {object} oElement
	 *   The element for which to calculate the key predicate
	 * @param {object} mTypeForMetaPath
	 *   A map from meta paths to entity types (as delivered by {@link #fetchTypes})
	 * @param {string} sMetaPath
	 *   The meta path for the given element
	 * @returns {string|undefined}
	 *   The key predicate or <code>undefined</code>, if key predicate cannot be determined
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#calculateKeyPredicate
	_AggregationCache.calculateKeyPredicate = function (oGroupNode, aGroupBy, aAllProperties, bLeaf,
			bTotal, oElement, mTypeForMetaPath, sMetaPath) {
		var sPredicate;

		if (!(sMetaPath in mTypeForMetaPath)) {
			return undefined; // nested object
		}

		if (oGroupNode) {
			// inherit grouping (and additional and null) values from the level above
			aAllProperties.forEach(function (vProperty) {
				if (Array.isArray(vProperty)) {
					_Helper.inheritPathValue(vProperty, oGroupNode, oElement);
				} else if (!(vProperty in oElement)) {
					oElement[vProperty] = oGroupNode[vProperty];
				}
			});
		}
		// prefer real key predicate for leaf
		sPredicate = bLeaf && _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath)
			|| _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath, aGroupBy, true);
		_Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);
		if (!bLeaf) {
			_Helper.setPrivateAnnotation(oElement, "filter",
				_Helper.getKeyFilter(oElement, sMetaPath, mTypeForMetaPath, aGroupBy));
		}
		// set the node values
		_AggregationHelper.setAnnotations(oElement, bLeaf ? undefined : false, bTotal,
			oGroupNode ? oGroupNode["@$ui5.node.level"] + 1 : 1,
			oGroupNode ? null : aAllProperties);

		return sPredicate;
	};

	/**
	 * Calculates the key predicate for the given element, the filter in case of a collapsed node,
	 * and sets the node attributes as needed for a recursive hierarchy ("RH").
	 *
	 * @param {object} [oGroupNode]
	 *   The group node or <code>undefined</code> for an element of the first level cache
	 * @param {object} oAggregation
	 *   An object holding the information needed for a recursive hierarchy; must already be
	 *   normalized by {@link _AggregationHelper.buildApply4Hierarchy}
	 * @param {object} oElement
	 *   The element for which to calculate the key predicate
	 * @param {object} mTypeForMetaPath
	 *   A map from meta paths to entity types (as delivered by {@link #fetchTypes})
	 * @param {string} sMetaPath
	 *   The meta path for the given element
	 * @returns {string|undefined}
	 *   The key predicate or <code>undefined</code>, if key predicate cannot be determined
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#calculateKeyPredicate
	_AggregationCache.calculateKeyPredicateRH = function (oGroupNode, oAggregation, oElement,
			mTypeForMetaPath, sMetaPath) {
		var sDistanceFromRootProperty = oAggregation.$DistanceFromRootProperty,
			sDrillStateProperty = oAggregation.$DrillStateProperty,
			bIsExpanded,
			iLevel = 1,
			sLimitedDescendantCountProperty = oAggregation.$LimitedDescendantCountProperty,
			sPredicate;

		if (!(sMetaPath in mTypeForMetaPath)) {
			return undefined; // nested object
		}

		sPredicate = _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath);
		_Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);
		switch (oElement[sDrillStateProperty]) {
			case "expanded":
				bIsExpanded = true;
				break;

			case "collapsed":
				bIsExpanded = false;
				_Helper.setPrivateAnnotation(oElement, "filter",
					_Helper.getKeyFilter(oElement, sMetaPath, mTypeForMetaPath));
				break;

			default: // "leaf"
				// bIsExpanded = undefined;
		}
		if (oGroupNode) {
			iLevel = oGroupNode["@$ui5.node.level"] + 1;
		} else if (oElement[sDistanceFromRootProperty]) { // Edm.Int64
			iLevel = parseInt(oElement[sDistanceFromRootProperty]) + 1;
		}
		// set the node values
		_AggregationHelper.setAnnotations(oElement, bIsExpanded, /*bIsTotal*/undefined, iLevel);
		if (oElement[sLimitedDescendantCountProperty]
			&& oElement[sLimitedDescendantCountProperty] !== "0") { // Edm.Int64
			_Helper.setPrivateAnnotation(oElement, "descendants",
				parseInt(oElement[sLimitedDescendantCountProperty]));
		}
		delete oElement[sDistanceFromRootProperty];
		delete oElement[sDrillStateProperty];
		delete oElement[sLimitedDescendantCountProperty];

		return sPredicate;
	};

	/**
	 * Creates a cache for a collection of entities or for data aggregation that performs requests
	 * using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string
	 *   <br>
	 *   Example: Products
	 * @param {string} sDeepResourcePath
	 *   The deep resource path to be used to build the target path for bound messages
	 * @param {object} [oAggregation]
	 *   An object holding the information needed for data aggregation; see also "OData Extension
	 *   for Data Aggregation Version 4.0"; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   <br>
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string. When
	 *   using min, max, grand total, or data aggregation they will always be sorted.
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, multiple requests for a cache using the same resource path will
	 *   always return the same, shared cache. This cache is read-only, modifying calls lead to an
	 *   error.
	 * @param {boolean} [bIsGrouped]
	 *   Whether the list binding is grouped via its first sorter
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 * @throws {Error}
	 *   If the system query option "$filter" is combined with group levels or with grand totals
	 *   (unless "grandTotal like 1.84"), or if grand totals or group levels or recursive hierarchy
	 *   are combined with min/max or with grouping via sorter, or if the system query options
	 *   "$expand" or "$select" are combined with pure data aggregation (no recursive hierarchy), or
	 *   if the system query option "$search" is combined with grand totals or group levels or a
	 *   recursive hierarchy, or if shared requests are combined with min/max or with grand totals
	 *   or group levels or recursive hierarchy
	 *
	 * @public
	 */
	_AggregationCache.create = function (oRequestor, sResourcePath, sDeepResourcePath, oAggregation,
			mQueryOptions, bSortExpandSelect, bSharedRequest, bIsGrouped) {
		var bHasGrandTotal, bHasGroupLevels;

		function checkExpandSelect() {
			if ("$expand" in mQueryOptions) {
				throw new Error("Unsupported system query option: $expand");
			}
			if ("$select" in mQueryOptions) {
				throw new Error("Unsupported system query option: $select");
			}
		}

		if (oAggregation) {
			bHasGrandTotal = _AggregationHelper.hasGrandTotal(oAggregation.aggregate);
			bHasGroupLevels = oAggregation.groupLevels && !!oAggregation.groupLevels.length;

			if (_AggregationHelper.hasMinOrMax(oAggregation.aggregate)) {
				if (bHasGrandTotal) {
					throw new Error("Unsupported grand totals together with min/max");
				}
				if (bHasGroupLevels) {
					throw new Error("Unsupported group levels together with min/max");
				}
				if (oAggregation.hierarchyQualifier) {
					throw new Error("Unsupported recursive hierarchy together with min/max");
				}
				if (bSharedRequest) {
					throw new Error("Unsupported $$sharedRequest together with min/max");
				}
				checkExpandSelect();

				return _MinMaxHelper.createCache(oRequestor, sResourcePath, oAggregation,
					mQueryOptions);
			}

			if (mQueryOptions.$filter
				&& (bHasGrandTotal && !oAggregation["grandTotal like 1.84"]
					|| bHasGroupLevels)) {
				throw new Error("Unsupported system query option: $filter");
			}

			if (bHasGrandTotal || bHasGroupLevels || oAggregation.hierarchyQualifier) {
				if (mQueryOptions.$search) {
					throw new Error("Unsupported system query option: $search");
				}
				if (!oAggregation.hierarchyQualifier) {
					checkExpandSelect();
				}
				if (bIsGrouped) {
					throw new Error("Unsupported grouping via sorter");
				}
				if (bSharedRequest) {
					throw new Error("Unsupported $$sharedRequest");
				}

				return new _AggregationCache(oRequestor, sResourcePath, oAggregation, mQueryOptions,
						bHasGrandTotal);
			}
		}

		if (mQueryOptions.$$filterBeforeAggregate) {
			mQueryOptions.$apply = "filter(" + mQueryOptions.$$filterBeforeAggregate + ")/"
				+ mQueryOptions.$apply;
			delete mQueryOptions.$$filterBeforeAggregate;
		}

		return _Cache.create(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest);
	};

	return _AggregationCache;
}, /* bExport= */false);
