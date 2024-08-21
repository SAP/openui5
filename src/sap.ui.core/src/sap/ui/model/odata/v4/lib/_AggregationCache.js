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
	"./_TreeState",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/ODataUtils"
], function (_AggregationHelper, _Cache, _ConcatHelper, _GroupLock, _Helper, _MinMaxHelper,
		_TreeState, Log, SyncPromise, ODataUtils) {
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
	 * @borrows sap.ui.model.odata.v4.lib._CollectionCache#addKeptElement as #addKeptElement
	 * @borrows sap.ui.model.odata.v4.lib._CollectionCache#removeKeptElement as #removeKeptElement
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
		this.sDownloadUrl = _Cache.prototype.getDownloadUrl.call(this, "");
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
		this.addKeptElement = this.oFirstLevel.addKeptElement; // @borrows ...
		this.removeKeptElement = this.oFirstLevel.removeKeptElement; // @borrows ...
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
		this.oTreeState = new _TreeState(oAggregation.$NodeProperty,
			(oNode) => _Helper.getKeyFilter(oNode, this.sMetaPath, this.getTypes()));
		// Whether this cache is a unified cache, using oFirstLevel with ExpandLevels instead of
		// separate group level caches
		this.bUnifiedCache = this.oAggregation.expandTo >= Number.MAX_SAFE_INTEGER
			|| !!this.oAggregation.createInPlace;
	}

	// make _AggregationCache a _Cache, but actively disinherit some critical methods
	_AggregationCache.prototype = Object.create(_Cache.prototype);
	_AggregationCache.prototype.addTransientCollection = null;

	/**
	 * Deletes a node on the server and in the cached data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the DELETE request
	 * @param {string} sEditUrl
	 *   The node's edit URL to be used for the DELETE request
	 * @param {string} sIndexOrPredicate
	 *   The node's index or its predicate if it is not in the collection
	 * @param {object} [_oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. Not used and
	 *   should always be undefined
	 * @param {function(number,number):void} fnCallback
	 *   A function which is called immediately with the node's index and offset -1 as parameter
	 *   when the node has been deleted from the cache; reinsertion does not occur
	 * @returns {sap.ui.base.SyncPromise<void>}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error} If the cache is shared, the node is not in the collection (because a
	 *   predicate was given), or the node at the given index is expanded.
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#_delete
	_AggregationCache.prototype._delete = function (oGroupLock, sEditUrl, sIndexOrPredicate,
			_oETagEntity, fnCallback) {
		let iIndex = parseInt(sIndexOrPredicate);
		if (isNaN(iIndex)) { // it must be a predicate because the element is not in the collection
			throw new Error(
				`Unsupported kept-alive entity: ${this.sResourcePath}${sIndexOrPredicate}`);
		}

		const oElement = this.aElements[iIndex];
		const sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
		if (oElement["@$ui5.node.isExpanded"]) {
			throw new Error(`Unsupported expanded node: ${this.sResourcePath}${sPredicate}`);
		}

		const oParentCache = _Helper.getPrivateAnnotation(oElement, "parent");
		if (oElement["@$ui5.context.isTransient"]) {
			// cancel the create (no callback function necessary)
			return oParentCache._delete(oGroupLock, sEditUrl,
				_Helper.getPrivateAnnotation(oElement, "transientPredicate"));
		}

		return SyncPromise.resolve(
			this.oRequestor.request("DELETE", sEditUrl, oGroupLock, {"If-Match" : oElement})
		).then(() => {
			this.oTreeState.delete(oElement);
			// the element might have moved due to parallel insert/delete
			iIndex = _Cache.getElementIndex(this.aElements, sPredicate, iIndex);
			// remove in parent cache
			const iIndexInParentCache = oParentCache.removeElement(
				_Helper.getPrivateAnnotation(oElement, "rank", 0), sPredicate);
			// remove the descendants in the parent cache (if any)
			const iDescendants = _Helper.getPrivateAnnotation(oElement, "descendants", 0);
			for (let i = 0; i < iDescendants; i += 1) {
				oParentCache.removeElement(iIndexInParentCache);
			}
			const iOffset = iDescendants + 1;
			if (oParentCache === this.oFirstLevel) {
				this.adjustDescendantCount(oElement, iIndex, -iOffset);
			} else if (!oParentCache.getValue("$count")) {
				// make parent a leaf (the direct predecessor)
				this.makeLeaf(this.aElements[iIndex - 1]);
			}
			this.shiftRank(iIndex, -iOffset);
			// remove in this cache
			this.removeElement(iIndex, sPredicate);
			// notify caller
			fnCallback(iIndex, -1);
		});
	};

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
	 *   The rank (aka. $skip index) of the first given element within the cache's collection; omit
	 *   it only if no group level cache is given or for a single created element (where it may be
	 *   unknown)
	 * @throws {Error}
	 *   In case an unexpected element or placeholder would be overwritten, if the given offset is
	 *   negative, if a resulting array index is out of bounds, in case of a duplicate predicate, or
	 *   if a kept-alive element has been modified on both client and server
	 *
	 * @private
	 */
	_AggregationCache.prototype.addElements = function (vReadElements, iOffset, oCache, iStart) {
		var aElements = this.aElements,
			sHierarchyQualifier = this.oAggregation.hierarchyQualifier,
			sNodeProperty = this.oAggregation.$NodeProperty,
			that = this;

		function addElement(oElement, i) {
			var oOldElement = aElements[iOffset + i],
				oKeptElement,
				sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate"),
				sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");

			if (oOldElement) { // check before overwriting
				if (oOldElement === oElement) {
					return;
				}
				_AggregationHelper.beforeOverwritePlaceholder(oOldElement, oElement, oCache,
					iStart === undefined ? undefined : iStart + i, sNodeProperty);
			} else if (iOffset + i >= aElements.length) {
				throw new Error("Array index out of bounds: " + (iOffset + i));
			}
			oKeptElement = aElements.$byPredicate[sPredicate];
			if (oKeptElement && oKeptElement !== oElement
					&& !(oKeptElement instanceof SyncPromise)) {
				if (!sHierarchyQualifier) {
					throw new Error("Duplicate predicate: " + sPredicate);
				}
				if (!oKeptElement["@odata.etag"]
						|| oElement["@odata.etag"] === oKeptElement["@odata.etag"]) {
					// no ETag used or known yet, or ETag unchanged
					_Helper.updateNonExisting(oElement, oKeptElement);
				} else if (that.hasPendingChangesForPath(sPredicate)) {
					throw new Error("Modified on client and on server: "
						+ that.sResourcePath + sPredicate);
				} // else: ETag changed, ignore kept element!
				_Helper.copySelected(oKeptElement, oElement);
			}

			if (sPredicate) {
				aElements.$byPredicate[sPredicate] = oElement;
			}
			if (sTransientPredicate) {
				aElements.$byPredicate[sTransientPredicate] = oElement;
			}
			aElements[iOffset + i] = oElement;

			// remember index & parent for #requestSideEffects
			if (oCache) {
				_Helper.setPrivateAnnotation(oElement, "parent", oCache);
			}

			if (sTransientPredicate) { // created
				iStart -= 1; // "shift" rank of non-created elements behind this one
			} else {
				_Helper.setPrivateAnnotation(oElement, "rank", iStart + i);
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
	 * Adjusts the (limited) descendant count at all ancestors of the given element which must be
	 * part of <code>this.oFirstLevel</code>, handles placeholders. Makes the parent a leaf if its
	 * descendant count becomes 0.
	 *
	 * @param {object} oElement - The element
	 * @param {number} iIndex - Its index
	 * @param {number} iOffset - The offset
	 *
	 * @private
	 */
	_AggregationCache.prototype.adjustDescendantCount = function (oElement, iIndex, iOffset) {
		let iLevel = oElement["@$ui5.node.level"];
		let bInitialPlaceholderFound = false;

		for (let iCandidateIndex = iIndex - 1; iCandidateIndex >= 0 && iLevel > 1;
				iCandidateIndex -= 1) {
			const oCandidate = this.aElements[iCandidateIndex];
			const iCandidateLevel = oCandidate["@$ui5.node.level"];
			if (iCandidateLevel === 0) {
				// Note: level 0 means "don't know" for initial *placeholders* of 1st level cache!
				bInitialPlaceholderFound = true;
			} else if (iCandidateLevel < iLevel) {
				if (!bInitialPlaceholderFound || this.isAncestorOf(iCandidateIndex, iIndex)) {
					const iCount
						= _Helper.getPrivateAnnotation(oCandidate, "descendants", 0) + iOffset;
					_Helper.setPrivateAnnotation(oCandidate, "descendants", iCount);
					if (iCount === 0) {
						this.makeLeaf(oCandidate);
					}
					// the next candidate must be an ancestor of this node
					iIndex = iCandidateIndex;
					bInitialPlaceholderFound = false;
				}
				// we have a node or placeholder at this level => there can only be ancestors at
				// lower levels
				iLevel = iCandidateLevel;
			}
		}
	};

	/**
	 * Deletes the "$apply" system query option before side effects are requested and adds the
	 * NodeProperty path to the "$select" system query option (if not already present).
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
		if (!mQueryOptions.$select.includes(this.oAggregation.$NodeProperty)) {
			mQueryOptions.$select.push(this.oAggregation.$NodeProperty);
		}
	};

	/**
	 * Before trying to update the element with the given key predicate with the given new value
	 * via {@link sap.ui.model.odata.v4.lib._Helper.updateSelected} (which might fail due to key
	 * predicate checks), checks that the NodeProperty ("the hierarchy node value") has not changed.
	 *
	 * @param {string} sPredicate - A key predicate
	 * @param {object} oNewValue - The new value, which usually just contains parts of the old
	 * @throws {Error} In case of a structural change
	 *
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#requestSideEffects
	 */
	_AggregationCache.prototype.beforeUpdateSelected = function (sPredicate, oNewValue) {
		_AggregationHelper.checkNodeProperty(this.aElements.$byPredicate[sPredicate], oNewValue,
			this.oAggregation.$NodeProperty, true);
	};

	/**
	 * Collapses the group node at the given path.
	 *
	 * @param {string} sGroupNodePath
	 *   The group node path relative to the cache
	 * @param {boolean|number} [bAll]
	 *   Whether collapsing the node and all its descendants; <code>undefined</code> means a simple
	 *   collapse, <code>true</code> collapsing all at this node, <code>1</code> a nested node below
	 *   a collapse all
	 * @returns {number}
	 *   The number of descendant nodes that were affected
	 *
	 * @public
	 * @see #expand
	 */
	_AggregationCache.prototype.collapse = function (sGroupNodePath, bAll) {
		const oGroupNode = this.getValue(sGroupNodePath);
		const oCollapsed = _AggregationHelper.getCollapsedObject(oGroupNode);
		_Helper.updateAll(this.mChangeListeners, sGroupNodePath, oGroupNode, oCollapsed);
		this.oTreeState.collapse(oGroupNode, bAll);

		const aElements = this.aElements;
		const iIndex = aElements.indexOf(oGroupNode);
		let iCount = this.countDescendants(oGroupNode, iIndex);
		if (this.oAggregation.subtotalsAtBottomOnly !== undefined
				// Note: there is at least one key for "@$ui5.node.isExpanded"; there are more keys
				// if and only if subtotals are actually being requested and (also) shown at the
				// bottom
				&& Object.keys(oCollapsed).length > 1) {
			iCount += 1; // collapse subtotals at bottom
		}

		let iRemaining = iCount; // with bAll this is the count of the direct children in the end
		for (let i = iIndex + 1; i < iIndex + 1 + iRemaining; i += 1) {
			const oElement = aElements[i];
			if (bAll && oElement["@$ui5.node.isExpanded"]) {
				iRemaining
					-= this.collapse(_Helper.getPrivateAnnotation(oElement, "predicate"), 1);
			}
			// exceptions of selection are effectively kept alive (with recursive hierarchy)
			if (!this.isSelectionDifferent(oElement)) {
				delete aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")];
				delete aElements.$byPredicate[
					_Helper.getPrivateAnnotation(oElement, "transientPredicate")];
			}
		}
		const aSpliced = aElements.splice(iIndex + 1, iRemaining);
		// with collapse all do not remember the collapsed nodes in a multi-level first level cache
		const iLevel = oGroupNode["@$ui5.node.level"];
		if (!bAll || !this.bUnifiedCache && iLevel >= this.oAggregation.expandTo) {
			aSpliced.$level = iLevel;
			aSpliced.$rank = _Helper.getPrivateAnnotation(oGroupNode, "rank");
			_Helper.setPrivateAnnotation(oGroupNode, "spliced", aSpliced);
		}
		aElements.$count -= iRemaining;

		return iCount;
	};

	/**
	 * Virtually collapses the given group node at the given index, counting the number of
	 * descendant nodes that would be affected.
	 *
	 * @param {object} oGroupNode - An expanded(!) group node
	 * @param {number} iIndex - Its index
	 * @returns {number} The number of descendant nodes that would be affected
	 *
	 * @private
	 * @see #collapse
	 * @see #isAncestorOf
	 */
	_AggregationCache.prototype.countDescendants = function (oGroupNode, iIndex) {
		var i;

		const iGroupNodeLevel = oGroupNode["@$ui5.node.level"];
		// Note: iExpandTo may be undefined (when using data aggregation)
		const iExpandTo = this.bUnifiedCache ? Infinity : this.oAggregation.expandTo;
		// Note: "descendants" refers to LimitedDescendantCount and counts descendants within
		// "top pyramid" only!
		let iDescendants = _Helper.getPrivateAnnotation(oGroupNode, "descendants");
		for (i = iIndex + 1; i < this.aElements.length; i += 1) {
			const oCandidate = this.aElements[i];
			const iCandidateLevel = oCandidate["@$ui5.node.level"];
			// level 0 means "don't know" for a placeholder, otherwise candidate is grand total
			const bLevelUnknown = iCandidateLevel === 0
				&& _Helper.hasPrivateAnnotation(oCandidate, "placeholder");
			if (!bLevelUnknown && iCandidateLevel <= iGroupNodeLevel) {
				break; // not a descendant
			}
			if (iCandidateLevel <= iExpandTo && _Helper.hasPrivateAnnotation(oCandidate, "rank")) {
				// a node w/ rank in oFirstLevel => counted in "descendants"
				// Note: a placeholder w/ level 0 has a rank
				if (!iDescendants) {
					break; // not a descendant
				}
				iDescendants -= 1;
				if (oCandidate["@$ui5.node.isExpanded"] === false) {
					// skip descendants of manually collapsed node
					iDescendants -= _Helper.getPrivateAnnotation(oCandidate, "descendants", 0);
				}
			}
		}

		return i - (iIndex + 1);
	};

	/**
	 * Creates a transient node with the parent identified by "@$ui5.node.parent", inserts it into
	 * the hierarchy at the appropriate position, and adds a POST request to the batch
	 * group with the given ID. See {@link sap.ui.model.odata.v4.lib._Cache#create} for more.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {sap.ui.base.SyncPromise} oPostPathPromise
	 *   A SyncPromise resolving with the resource path for the POST request
	 * @param {string} sPath
	 *   The collection's path within the cache (as used by change listeners)
	 * @param {string} sTransientPredicate
	 *   A (temporary) key predicate for the transient entity: "($uid=...)"
	 * @param {object} oEntityData
	 *   The initial entity data, already cloned and cleaned of client-side annotations (except
	 *   "@$ui5.node.parent" which contains the optional OData ID string needed for
	 *   "...@odata.bind")
	 * @param {boolean} bAtEndOfCreated
	 *   Whether the newly created entity should be inserted after previously created entities or at
	 *   the front of the list.
	 * @param {function} fnErrorCallback
	 *   A function which is called with an error object each time a POST request for the create
	 *   fails
	 * @param {function} fnSubmitCallback
	 *   A function which is called just before a POST request for the create is sent
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the created entity when the POST request has been
	 *   successfully sent and the entity has been marked as non-transient
	 * @throws {Error}
	 *   If <code>bAtEndOfCreated</code> is set or the parent is collapsed
	 *
	 * @public
	 */
	// @override sap.ui.model.odata.v4.lib._Cache#create
	_AggregationCache.prototype.create = function (oGroupLock, oPostPathPromise, sPath,
			sTransientPredicate, oEntityData, bAtEndOfCreated, fnErrorCallback, fnSubmitCallback) {
		if (bAtEndOfCreated) {
			throw new Error("Unsupported bAtEndOfCreated");
		}

		const sParentPath = oEntityData["@$ui5.node.parent"];
		delete oEntityData["@$ui5.node.parent"];
		const sParentPredicate = sParentPath?.slice(sParentPath.indexOf("("));
		const aElements = this.aElements;
		const oParentNode = aElements.$byPredicate[sParentPredicate];
		if (oParentNode?.["@$ui5.node.isExpanded"] === false) {
			throw new Error("Unsupported collapsed parent: " + sParentPath);
		}

		const iLevel = oParentNode
			? oParentNode["@$ui5.node.level"] + 1
			: 1;
		let oCache = iLevel > this.oAggregation.expandTo && !this.oAggregation.createInPlace
			? _Helper.getPrivateAnnotation(oParentNode, "cache")
			: this.oFirstLevel;
		if (!oCache) {
			oCache = this.createGroupLevelCache(oParentNode);
			oCache.setEmpty();
			_Helper.setPrivateAnnotation(oParentNode, "cache", oCache);
		}

		_Helper.addByPath(this.mPostRequests, sTransientPredicate, oEntityData);
		const iIndex = aElements.indexOf(oParentNode) + 1; // 0 w/o oParentNode :-)
		const oPromise = oCache.create(oGroupLock, oPostPathPromise, sPath, sTransientPredicate,
			oEntityData, bAtEndOfCreated, fnErrorCallback, fnSubmitCallback, /*onCancel*/() => {
				_Helper.removeByPath(this.mPostRequests, sTransientPredicate, oEntityData);
				if (this.oAggregation.createInPlace) {
					return;
				}
				aElements.$count -= 1;
				delete aElements.$byPredicate[sTransientPredicate];
				aElements.splice(iIndex, 1);
			});

		if (sParentPath) { // add @odata.bind to POST body only
			_Helper.getPrivateAnnotation(oEntityData, "postBody")
				[this.oAggregation.$ParentNavigationProperty + "@odata.bind"]
					= _Helper.makeRelativeUrl("/" + sParentPath, "/" + this.sResourcePath);
		}

		const bParentIsLeaf = oParentNode && oParentNode["@$ui5.node.isExpanded"] === undefined;
		const bExpandTreeState = bParentIsLeaf
			&& oParentNode?.["@$ui5.node.level"] >= this.oAggregation.expandTo;
		if (bExpandTreeState) {
			this.oTreeState.expand(oParentNode);
		} // else: already expanded automatically

		const addElement = (iIndex0, iRank) => {
			if (bParentIsLeaf) {
				_Helper.updateAll(this.mChangeListeners, sParentPredicate, oParentNode,
					{"@$ui5.node.isExpanded" : true}); // not a leaf anymore
			}
			oEntityData["@$ui5.node.level"] = iLevel; // do not send via POST!
			aElements.splice(iIndex0, 0, null); // create a gap
			this.addElements(oEntityData, iIndex0, oCache, iRank);
			aElements.$count += 1;
		};

		const completeCreation = (iIndex0, iRank) => {
			oCache.removeElement(0);
			_Helper.deletePrivateAnnotation(oEntityData, "transientPredicate");
			delete aElements.$byPredicate[sTransientPredicate];
			if (iRank !== undefined) {
				this.adjustDescendantCount(oEntityData, iIndex0, +1);
				oCache.restoreElement(iRank, oEntityData);
				_Helper.setPrivateAnnotation(oEntityData, "rank", iRank);
				this.shiftRank(iIndex0, +1);
			}
		};

		if (this.oAggregation.createInPlace) {
			return oPromise.then(async () => {
				_Helper.removeByPath(this.mPostRequests, sTransientPredicate, oEntityData);
				delete oEntityData["@$ui5.context.isTransient"];
				const [iRank] = await Promise.all([
					this.requestRank(oEntityData, oGroupLock),
					this.requestNodeProperty(oEntityData, oGroupLock)
				]);
				if (bExpandTreeState) { // isRefreshNeededAfterCreate returns true
					_Helper.setPrivateAnnotation(oEntityData, "rank", iRank);
				} else if (iRank === undefined) {
					oCache.removeElement(0);
				} else {
					addElement(iRank, iRank);
					completeCreation(iRank, iRank);
				}

				return oEntityData;
			});
		}

		addElement(iIndex, /*iRank*/undefined);

		return oPromise.then(async () => {
			_Helper.removeByPath(this.mPostRequests, sTransientPredicate, oEntityData);
			aElements.$byPredicate[_Helper.getPrivateAnnotation(oEntityData, "predicate")]
				= oEntityData;
			// Note: #calculateKeyPredicateRH doesn't know better :-(
			oEntityData["@$ui5.node.level"] = iLevel;
			// Note: key predicate required
			this.oTreeState.setOutOfPlace(oEntityData, oParentNode);

			if (oCache === this.oFirstLevel && this.oAggregation.expandTo > 1) {
				const [iRank] = await Promise.all([
					this.requestRank(oEntityData, oGroupLock),
					this.requestNodeProperty(oEntityData, oGroupLock, /*bDropFilter*/true)
				]);

				completeCreation(iIndex, iRank);
			} else {
				await this.requestNodeProperty(oEntityData, oGroupLock, /*bDropFilter*/true);
			}

			return oEntityData;
		});
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
			aAllProperties, oCache, aGroupBy, bLeaf, sParentFilter, mQueryOptions, bTotal;

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
			sParentFilter = _Helper.getPrivateAnnotation(oGroupNode, "filter")
				|| _Helper.getKeyFilter(oGroupNode, this.sMetaPath, this.getTypes());
			// Note: parent filter is just eq/and, no need for parentheses, but
			// $$filterBeforeAggregate is a black box! Put specific filter 1st for performance!
			mQueryOptions.$$filterBeforeAggregate = sParentFilter
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
		if (sParentFilter) {
			oCache.$parentFilter = sParentFilter;
		}

		return oCache;
	};

	/**
	 * Expands the given group node by the given number of levels.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group to associate the requests with
	 * @param {object|string} vGroupNodeOrPath
	 *   The group node or its path relative to the cache; a group node instance (instead of a path)
	 *   MUST only be given in case of "expanding" continued
	 * @param {number} iLevels
	 *   The number of levels to expand, <code>iLevels >= Number.MAX_SAFE_INTEGER</code> can be
	 *   used to expand all levels
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise<number>}
	 *   A promise that is resolved with the number of nodes at the next level, 0 if the node or
	 *   one of its parent is collapsed again before the response arrived, or -1 if the cache needs
	 *   to be refreshed (a unified cache)
	 *
	 * @public
	 * @see #collapse
	 */
	_AggregationCache.prototype.expand = function (oGroupLock, vGroupNodeOrPath, iLevels,
			fnDataRequested) {
		var iCount,
			oGroupNode = typeof vGroupNodeOrPath === "string"
				? this.getValue(vGroupNodeOrPath)
				: vGroupNodeOrPath,
			aSpliced = _Helper.getPrivateAnnotation(oGroupNode, "spliced"),
			that = this;

		if (vGroupNodeOrPath !== oGroupNode) {
			// Note: this also prevents a 2nd expand of the same node
			_Helper.updateAll(this.mChangeListeners, vGroupNodeOrPath, oGroupNode,
				_AggregationHelper.getOrCreateExpandedObject(this.oAggregation, oGroupNode));
			this.oTreeState.expand(oGroupNode, iLevels);
		} // else: no update needed!

		if (iLevels >= Number.MAX_SAFE_INTEGER) { // expand all below oGroupNode
			// nothing to do
		} else if (aSpliced) {
			_Helper.deletePrivateAnnotation(oGroupNode, "spliced");
			const aOldElements = this.aElements;
			const iIndex = aOldElements.indexOf(oGroupNode) + 1;
			// insert aSpliced at iIndex
			this.aElements = aOldElements.concat(aSpliced, aOldElements.splice(iIndex));
			this.aElements.$byPredicate = aOldElements.$byPredicate;
			iCount = aSpliced.length;
			this.aElements.$count = aOldElements.$count + iCount;
			_Helper.copySelected(aOldElements, this.aElements);
			const iLevelDiff = oGroupNode["@$ui5.node.level"] - aSpliced.$level;
			const iRankDiff = _Helper.getPrivateAnnotation(oGroupNode, "rank") - aSpliced.$rank;
			aSpliced.forEach(function (oElement) {
				var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

				if (oElement["@$ui5.node.level"]) {
					// Note: level 0 is used for initial placeholders of 1st level cache in case
					// expandTo > 1
					oElement["@$ui5.node.level"] += iLevelDiff;
				}
				if (_Helper.getPrivateAnnotation(oElement, "parent") === that.oFirstLevel) {
					const iRank = _Helper.getPrivateAnnotation(oElement, "rank");
					if (iRank !== undefined) {
						_Helper.setPrivateAnnotation(oElement, "rank", iRank + iRankDiff);
					}
				}
				if (!_Helper.hasPrivateAnnotation(oElement, "placeholder")) {
					if (aSpliced.$stale && !that.isSelectionDifferent(oElement)) {
						that.turnIntoPlaceholder(oElement, sPredicate);
					} else {
						that.aElements.$byPredicate[sPredicate] = oElement;
						const sTransientPredicate
							= _Helper.getPrivateAnnotation(oElement, "transientPredicate");
						if (sTransientPredicate) {
							that.aElements.$byPredicate[sTransientPredicate] = oElement;
						}
						if (_Helper.hasPrivateAnnotation(oElement, "expanding")) {
							_Helper.deletePrivateAnnotation(oElement, "expanding");
							iCount += that.expand(_GroupLock.$cached, oElement).getResult();
						}
					}
				}
			});
			return SyncPromise.resolve(iCount);
		}
		if (this.bUnifiedCache || iLevels > 1
				|| oGroupNode["@$ui5.node.level"] < this.oAggregation.expandTo) {
			return SyncPromise.resolve(-1); // refresh needed
		}

		let oCache = _Helper.getPrivateAnnotation(oGroupNode, "cache");
		if (!oCache) {
			oCache = this.createGroupLevelCache(oGroupNode);
			_Helper.setPrivateAnnotation(oGroupNode, "cache", oCache);
		}

		// prefetch from the group level cache
		return oCache.read(
			0, this.iReadLength, 0, oGroupLock, fnDataRequested
		).then(function (oResult) {
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
			that.oTreeState.collapse(oGroupNode);

			throw oError;
		});
	};

	/**
	 * Returns a promise to be resolved with the index for the requested parent node. The
	 * parent is also added to the correct position in this cache. Must only be called if
	 * {@link #getParentIndex} returns <code>undefined</code>.
	 *
	 * @param {number} iIndex
	 *   The index of the child node
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group to associate the requests with
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested index of the parent.
	 *
	 * @public
	 */
	_AggregationCache.prototype.fetchParentIndex = function (iIndex, oGroupLock) {
		const iNodeLevel = this.aElements[iIndex]["@$ui5.node.level"];
		// find adjacent sibling with smallest index
		for (let i = iIndex - 1; i >= 0; i -= 1) {
			const iCandidateLevel = this.aElements[i]["@$ui5.node.level"];
			if (iCandidateLevel === 0) {
				// Note: level 0 means "don't know" for initial *placeholders* of 1st level cache!
				break;
			}
			if (iCandidateLevel === iNodeLevel) {
				iIndex = i;
			}
			// iCandidateLevel < iNodeLevel: parent index found here => MUST not happen
		}
		const oNode = this.aElements[iIndex];

		let oPromise = _Helper.getPrivateAnnotation(oNode, "parentIndexPromise");
		if (oPromise) {
			return oPromise;
		}

		const sFilter = _Helper.getKeyFilter(oNode, this.sMetaPath, this.getTypes());
		const mQueryOptions = Object.assign({}, this.mQueryOptions);
		mQueryOptions.$apply = "ancestors($root" + this.oAggregation.$path
			+ "," + this.oAggregation.hierarchyQualifier + "," + this.oAggregation.$NodeProperty
			+ ",filter(" + sFilter + "),1)";
		const sQueryString = this.sResourcePath
			+ this.oRequestor.buildQueryString(/*sMetaPath*/null, mQueryOptions);

		oPromise = this.oRequestor.request("GET", sQueryString, oGroupLock)
			.then(async (oResult) => {
				const oParent = oResult.value[0];
				const oCandidate = this.aElements.$byPredicate[
					_Helper.getKeyPredicate(oParent, this.sMetaPath, this.getTypes())];
				if (oCandidate && _Helper.getPrivateAnnotation(oCandidate, "rank") !== undefined) {
					// parent already inside collection
					return this.aElements.indexOf(oCandidate);
				}

				_Helper.setPrivateAnnotation(oParent, "parent", this.oFirstLevel);
				const aSelect = [
					this.oAggregation.$DistanceFromRoot,
					this.oAggregation.$DrillState,
					this.oAggregation.$LimitedDescendantCount
				];
				const [iRank] = await Promise.all([
					this.requestRank(oParent, oGroupLock),
					this.requestProperties(oParent, aSelect, oGroupLock, true),
					this.requestNodeProperty(oParent, oGroupLock, /*bDropFilter*/false)
				]);

				// Note: overridden by _AggregationCache.calculateKeyPredicateRH
				this.oFirstLevel.calculateKeyPredicate(oParent, this.getTypes(), this.sMetaPath);

				const iParentIndex = this.findIndex(iRank);
				if (_Helper.hasPrivateAnnotation(this.aElements[iParentIndex], "placeholder")) {
					this.insertNode(oParent, iRank, iParentIndex);
				} // else: parent already inside collection

				return iParentIndex;
			})
			.finally(() => { // Note: the parent's *array* index can easily change
				_Helper.deletePrivateAnnotation(oNode, "parentIndexPromise");
			});
		oPromise = SyncPromise.resolve(oPromise);
		_Helper.setPrivateAnnotation(oNode, "parentIndexPromise", oPromise);

		return oPromise;
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group to associate the request with
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
	 * Returns the index in <code>this.aElements</code> for a given (limited preorder) rank where
	 * either a node or placeholder with that rank is present and belongs to the given first level
	 * or group level cache.
	 *
	 * @param {number} iRank
	 *   The (limited preorder) rank of a node
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} [oCache]
	 *   A (group level) cache
	 * @returns {number}
	 *   The array index
	 *
	 * @private
	 * @see #getInsertIndex
	 */
	_AggregationCache.prototype.findIndex = function (iRank, oCache = this.oFirstLevel) {
		return this.aElements.findIndex(
			(oNode) => _Helper.getPrivateAnnotation(oNode, "rank") === iRank
					&& _Helper.getPrivateAnnotation(oNode, "parent") === oCache);
	};

	/**
	 * Returns the index in <code>this.aElements</code> of the first in-place child of the given
	 * parent node, or the first in-place root if no parent is given.
	 *
	 * @param {number} iParentIndex
	 *   The parent node's index, or -1 if looking for a root node
	 * @returns {number}
	 *   The array index, or -1 if there is no such first in-place node
	 *
	 * @public
	 */
	_AggregationCache.prototype.get1stInPlaceChildIndex = function (iParentIndex) {
		const iLevel = iParentIndex >= 0
			? this.aElements[iParentIndex]["@$ui5.node.level"] + 1
			: 1;

		return this.aElements.findIndex(
			(oElement, iIndex) => iIndex > iParentIndex
				&& oElement["@$ui5.node.level"] === iLevel
				&& oElement["@$ui5.context.isTransient"] === undefined);
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
		if (this.oAggregation.hierarchyQualifier) {
			if ("$count" in mQueryOptions) {
				mQueryOptions = Object.assign({}, mQueryOptions); // shallow clone
				delete mQueryOptions.$count;
			}
		} else {
			mQueryOptions = _AggregationHelper.filterOrderby(mQueryOptions, this.oAggregation);
		}

		return _AggregationHelper.buildApply(this.oAggregation, mQueryOptions, 0, true);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getDownloadUrl
	 */
	_AggregationCache.prototype.getDownloadUrl = function (_sPath, _mCustomQueryOptions) {
		return this.sDownloadUrl;
	};

	/**
	 * Returns the index in <code>this.aElements</code> for a given (limited preorder) rank. No node
	 * with that rank is already present, but it needs to be inserted at the returned index later.
	 * A unified cache is assumed. Takes care of collapsed or out-of-place nodes.
	 *
	 * @param {number} iRank
	 *   The (limited preorder) rank of a node
	 * @returns {number}
	 *   The array index
	 *
	 * @private
	 * @see #findIndex
	 */
	_AggregationCache.prototype.getInsertIndex = function (iRank) {
		var i;

		for (i = 0; i < this.aElements.length; i += 1) {
			const oNode = this.aElements[i];
			// out-of-place nodes are ignored; nothing to do for collapsed nodes
			if (_Helper.getPrivateAnnotation(oNode, "rank") > iRank
				&& !this.oTreeState.isOutOfPlace(
					_Helper.getPrivateAnnotation(oNode, "predicate"))) {
				return i;
			}
		}

		return i;
	};

	/**
	 * Returns the index of a parent node.
	 *
	 * @param {number} iIndex
	 *   The index of the child node
	 * @returns {number|undefined}
	 *   The parent node's index, or -1 if the given node is a root node and thus has
	 *   no parent, or <code>undefined</code> if the parent node hasn't been read yet
	 *
	 * @public
	 */
	_AggregationCache.prototype.getParentIndex = function (iIndex) {
		const iLevel = this.aElements[iIndex]["@$ui5.node.level"];

		if (iLevel <= 1) {
			return -1; // a root has no parent
		}

		let bInitialPlaceholderFound = false;
		for (let i = iIndex; i >= 0; i -= 1) {
			const oCandidate = this.aElements[i];
			const iCandidateLevel = oCandidate["@$ui5.node.level"];

			if (iCandidateLevel === 0) {
				bInitialPlaceholderFound = true;
			} else if (iCandidateLevel < iLevel) {
				if (iCandidateLevel === iLevel - 1
						&& (!bInitialPlaceholderFound || this.isAncestorOf(i, iIndex))) {
					return i;
				}
				break; // missed the parent
			}
		}
		// return undefined;
	};

	/**
	 * Returns the index of the given node's sibling, either the next one (via offset +1) or the
	 * previous one (via offset -1), skipping out-of-place nodes.
	 *
	 * @param {number} iIndex - The index of a node
	 * @param {number} iOffset - An offset, either -1 or +1
	 * @param {boolean} [bAllowPlaceholder] - Whether the sibling is allowed to be a placeholder
	 * @returns {number}
	 *   The sibling node's index, or -1 if no such sibling exists for sure, or
	 *   <code>undefined</code> if we cannot tell or if the sibling is currently a placeholder and
	 *   that is not allowed
	 *
	 * @public
	 */
	_AggregationCache.prototype.getSiblingIndex = function (iIndex, iOffset, bAllowPlaceholder) {
		const oNode = this.aElements[iIndex];
		const oCache = _Helper.getPrivateAnnotation(oNode, "parent");
		const bSingleLevelCache = oCache !== this.oFirstLevel
			|| this.oAggregation.expandTo === 1 && !this.oAggregation.$ExpandLevels;
		const iRank = _Helper.getPrivateAnnotation(oNode, "rank");
		let iSiblingRank = iRank + iOffset;
		if (iOffset < 0) { // previous sibling
			if (!bSingleLevelCache) {
				iSiblingRank // Note: may become undefined!
					= _AggregationHelper.findPreviousSiblingIndex(oCache.aElements, iRank);
			}
			if (iSiblingRank < 0) {
				return -1; // no such sibling
			}
		} else { // next sibling: skip descendants
			iSiblingRank += _Helper.getPrivateAnnotation(oNode, "descendants", 0);
			if (iSiblingRank >= oCache.aElements.$count
				|| oCache.aElements[iSiblingRank]?.["@$ui5.node.level"]
					< oNode["@$ui5.node.level"]) {
				return -1; // no such sibling
			}
		}

		if (iSiblingRank >= 0) {
			const iSiblingIndex = this.findIndex(iSiblingRank, oCache);
			if (iSiblingIndex < 0) {
				return -1; // no such sibling
			}
			const oSibling = this.aElements[iSiblingIndex];
			if (bSingleLevelCache && bAllowPlaceholder
				|| !_Helper.hasPrivateAnnotation(oSibling, "placeholder")) {
				if (oSibling["@$ui5.context.isTransient"] !== undefined) {
					// sibling is out of place, skip it!
					return this.getSiblingIndex(iSiblingIndex, iOffset, bAllowPlaceholder);
				}
				return iSiblingIndex; // sibling found
			}
		} // else: iSiblingRank === undefined => return undefined;
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
	 * Moves the nodes out of place after a refresh based on the requests from
	 * {@link #requestOutOfPlaceNodes}.
	 *
	 * @param {object[]} aResults
	 *   An array containing at least two objects. The first object provides Rank and
	 *   DistanceFromRoot for all out-of-place nodes and all parents (in no particular order). The
	 *   following objects provide the full data of the out-of-place nodes (grouped by parent).
	 *
	 * @private
	 */
	_AggregationCache.prototype.handleOutOfPlaceNodes = function ([oRankResult, ...aNodeResults]) {
		if (!oRankResult) {
			return;
		}

		const getPredicate
			= (oNode) => _Helper.getKeyPredicate(oNode, this.sMetaPath, this.getTypes());
		const getRank
			= (oNode) => parseInt(_Helper.drillDown(oNode, this.oAggregation.$LimitedRank));
		const mPredicate2RankResult = {};
		oRankResult.value.forEach((oNode) => {
			mPredicate2RankResult[getPredicate(oNode)] = oNode;
		});
		// all nodes are considered in place until they are found to still have the same parent
		const oPredicatesNowInPlace = new Set(this.oTreeState.getOutOfPlacePredicates());

		// import data
		aNodeResults.forEach((oNodeResult) => {
			oNodeResult.value.forEach((oNode) => {
				const sPredicate = getPredicate(oNode);
				oPredicatesNowInPlace.delete(sPredicate); // still the same parent
				if (this.aElements.$byPredicate[sPredicate]) {
					return; // already read with the in-place request
				}
				const sParentPredicate = this.oTreeState.getOutOfPlace(sPredicate).parentPredicate;
				const oParent = mPredicate2RankResult[sParentPredicate];
				if (oParent) { // parent has a rank
					const sDrillState = _Helper.drillDown(oParent, this.oAggregation.$DrillState);
					if (sDrillState === "collapsed") {
						return; // parent is collapsed -> do not insert
					}
				} else if (sParentPredicate) { // parent has no rank
					return; // do not insert
				} // else: no parent (root) -> insert
				_Helper.merge(oNode, mPredicate2RankResult[sPredicate]);
				// Note: overridden by _AggregationCache.calculateKeyPredicateRH
				this.oFirstLevel.calculateKeyPredicate(oNode, this.getTypes(), this.sMetaPath);
				const iRank = getRank(oNode);
				_Helper.deleteProperty(oNode, this.oAggregation.$LimitedRank);
				// insert at rank position to ensure correct placeholder is replaced
				this.insertNode(oNode, iRank);
			});
		});

		oPredicatesNowInPlace.forEach((sPredicate) => this.oTreeState.deleteOutOfPlace(sPredicate));

		this.oTreeState.getOutOfPlaceGroupedByParent().forEach((oOutOfPlace) => {
			// move the out-of-place nodes in creation order
			const oParentRankResult = mPredicate2RankResult[oOutOfPlace.parentPredicate];
			this.moveOutOfPlaceNodes(oParentRankResult && getRank(oParentRankResult),
				oOutOfPlace.nodePredicates);
		});
	};

	/**
	 * Inserts a node at the given position into <code>aElements</code> and
	 * <code>oFirstLevel.aElements</code>.
	 *
	 * @param {object} oNode
	 *   The node to be inserted
	 * @param {number} iRank
	 *   The rank of the node
	 * @param {number} [iInsertIndex]
	 *   The insertion index within aElements in case it differs from iRank
	 *
	 * @private
	 */
	_AggregationCache.prototype.insertNode = function (oNode, iRank, iInsertIndex = iRank) {
		this.addElements(oNode, iInsertIndex, this.oFirstLevel, iRank);
		// poor man's #replaceElement to replace undefined w/ oParent
		this.oFirstLevel.removeElement(iRank);
		this.oFirstLevel.restoreElement(iRank, oNode);
	};

	/**
	 * Tells whether the first given node is an ancestor of (or the same as) the second given node
	 * (in case of a recursive hierarchy).
	 *
	 * @param {number} iAncestor - Index of some node which may be an ancestor
	 * @param {number} iDescendant - Index of some node which may be a descendant
	 * @returns {boolean} Whether the assumed ancestor relation holds
	 *
	 * @public
	 */
	_AggregationCache.prototype.isAncestorOf = function (iAncestor, iDescendant) {
		if (iDescendant === iAncestor) { // "or the same as"
			return true;
		}
		if (iDescendant < iAncestor
			|| !this.aElements[iAncestor]["@$ui5.node.isExpanded"]
			|| this.aElements[iAncestor]["@$ui5.node.level"]
				>= this.aElements[iDescendant]["@$ui5.node.level"]) { // impossible
			return false;
		}

		return iDescendant
			<= iAncestor + this.countDescendants(this.aElements[iAncestor], iAncestor);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#isDeletingInOtherGroup
	 */
	_AggregationCache.prototype.isDeletingInOtherGroup = function (_sGroupId) {
		return false;
	};

	/**
	 * Returns whether a refresh is needed, if a child is created below the given parent (index).
	 *
	 * @param {number} iParentIndex Index of the parent
	 * @returns {boolean} Whether a refresh is needed
	 *
	 * @public
	 */
	_AggregationCache.prototype.isRefreshNeededAfterCreate = function (iParentIndex) {
		const oParent = this.aElements[iParentIndex];

		return this.oAggregation.createInPlace
			&& oParent["@$ui5.node.isExpanded"] === undefined
			&& oParent["@$ui5.node.level"] >= this.oAggregation.expandTo;
	};

	/**
	 * Determines if the "@$ui5.context.isSelected" annotation of the given element differs from the
	 * annotation at the collection. Only relevant in case of a recursive hierarchy. Note: A missing
	 * annotation is treated as <code>false</code>.
	 *
	 * @param {object} oElement - The element
	 * @returns {boolean} Whether recursive hierarchy is used and the selection state of the element
	 *   differs from the collection
	 *
	 * @private
	 */
	_AggregationCache.prototype.isSelectionDifferent = function (oElement) {
		return this.oAggregation.hierarchyQualifier
			&& (oElement["@$ui5.context.isSelected"] ?? false)
				!== (this.aElements["@$ui5.context.isSelected"] ?? false);
	};

	/**
	 * Determines the list of elements determined by the given predicates. All other elements are
	 * turned into placeholders (lazily), except transient ones.
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

		return Object.values(this.aElements.$byPredicate).filter(function (oElement) {
			var sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");

			if (!sPredicate) {
				return; // keep transient elements "as is"
			}

			if (mPredicates[sPredicate]) {
				_AggregationHelper.markSplicedStale(oElement);
				mPredicates[sPredicate] = false;
				return true; // keep and request
			}

			if (!(sPredicate in mPredicates)) {
				that.turnIntoPlaceholder(oElement, sPredicate);
			}
		});
	};

	/**
	 * Makes the given element a leaf.
	 *
	 * @param {object} oElement - The element
	 *
	 * @private
	 */
	_AggregationCache.prototype.makeLeaf = function (oElement) {
		_Helper.updateAll(this.mChangeListeners,
			_Helper.getPrivateAnnotation(oElement, "predicate"), oElement,
			{"@$ui5.node.isExpanded" : undefined});
		// _Helper.updateAll only sets it to undefined
		delete oElement["@$ui5.node.isExpanded"];
		_Helper.deletePrivateAnnotation(oElement, "descendants"); // 0 not stored explicitly!
	};

	/**
	 * Moves the (child) node with the given path to the parent node with the given path by sending
	 * a PATCH request for "<parent navigation>@odata.bind". A <code>null</code> parent turns the
	 * child into a root. The optional sibling path invokes an action for moving the (child) node
	 * before the given sibling (or with <code>null</code> to the last sibling position) by sending
	 * a POST request for the "ChangeNextSiblingAction".
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the requests with
	 * @param {string} sChildPath
	 *   The (child) node's path relative to the cache
	 * @param {string|null} sParentPath
	 *   The parent node's path relative to the cache
	 * @param {string|null} [sSiblingPath]
	 *   The next sibling's path relative to the cache
	 * @param {string} [sNonCanonicalChildPath]
	 *   The (child) node's non-canonical path (relative to the service); only used when
	 *   <code>sSiblingPath</code> is given
	 * @param {boolean} [bRequestSiblingRank]
	 *   Whether to request the next sibling's rank and return its new index
	 * @returns {{promise : sap.ui.base.SyncPromise<function():number|number[]>, refresh : boolean}}
	 *   An object with two properties:
	 *   - <code>promise</code>: A promise which is resolved when the move is finished, or rejected
	 *     in case of an error. In case a refresh is needed, the promise is resolved with a function
	 *     that can be called w/o args once the refresh is finished - it then returns an array with
	 *     the new indices of the moved node (or <code>undefined</code>) and of the next sibling (if
	 *     requested). Else it is resolved with an array of:
	 *     - the number of child nodes added (normally one, but maybe more in case the parent node
	 *       was collapsed before),
	 *     - the new index of the moved node,
	 *     - the number of descendant nodes that were affected by collapsing the moved node
	 *       (<code>undefined</code> in case the moved node was not expanded before)
	 *   - <code>refresh</code>: A flag indicating whether a side-effects refresh is needed
	 *
	 * @public
	 */
	_AggregationCache.prototype.move = function (oGroupLock, sChildPath, sParentPath, sSiblingPath,
			sNonCanonicalChildPath, bRequestSiblingRank) {
		let bRefreshNeeded = !this.bUnifiedCache;

		const sChildPredicate = sChildPath.slice(sChildPath.indexOf("("));
		const oChildNode = this.aElements.$byPredicate[sChildPredicate];
		if (this.oTreeState.isOutOfPlace(sChildPredicate)) {
			// remove OOP for all descendants (incl. itself) of a moved OOP node
			this.oTreeState.deleteOutOfPlace(sChildPredicate);
			delete oChildNode["@$ui5.context.isTransient"];
			bRefreshNeeded = true;
		}

		const sParentPredicate = sParentPath?.slice(sParentPath.indexOf("("));
		const oParentNode = this.aElements.$byPredicate[sParentPredicate];
		if (this.oTreeState.isOutOfPlace(sParentPredicate)) {
			// remove OOP for all descendants (incl. itself) of new parent's top-most OOP ancestor
			this.oTreeState.deleteOutOfPlace(sParentPredicate, /*bUpAndDown*/true);
			bRefreshNeeded = true;
		}

		if (oParentNode?.["@$ui5.node.isExpanded"] === false
				|| oParentNode?.["@$ui5.node.level"] >= this.oAggregation.expandTo
				&& !oParentNode["@$ui5.node.isExpanded"]) {
			this.oTreeState.expand(oParentNode);
			if (!_Helper.hasPrivateAnnotation(oParentNode, "spliced")) {
				// not a leaf anymore, or a collapsed node at the edge of the top pyramid
				// Note: GET LimitedRank will not work properly w/o changed ExpandLevels here
				bRefreshNeeded = true;
			}
		}

		let oSiblingNode; // side effect of calling invokeNextSibling()
		const invokeNextSibling = () => {
			if (sSiblingPath !== undefined) {
				bRefreshNeeded = true;
				const sActionPath = sNonCanonicalChildPath + "/"
					+ this.oAggregation.$Actions.ChangeNextSiblingAction;
				const sSiblingPredicate = sSiblingPath?.slice(sSiblingPath.indexOf("("));
				oSiblingNode = this.aElements.$byPredicate[sSiblingPredicate];
				let oNextSibling = null;
				if (oSiblingNode) {
					// remove OOP for all descendants (incl. itself) of a next sibling
					this.oTreeState.deleteOutOfPlace(sSiblingPredicate);
					const oNextSiblingType = this.oAggregation.$fetchMetadata(
						_Helper.getMetaPath("/" + sActionPath + "/NextSibling/")
					).getResult();
					const aKeys = Object.keys(oNextSiblingType).filter((sKey) => sKey[0] !== "$");
					oNextSibling = aKeys.reduce((oKeys, sKey) => {
						oKeys[sKey] = oSiblingNode[sKey];
						return oKeys;
					}, {});
				}

				return this.oRequestor.request("POST", sActionPath, oGroupLock.getUnlockedCopy(), {
						"If-Match" : oChildNode,
						Prefer : "return=minimal"
					}, {NextSibling : oNextSibling});
			}
		};

		let oPromise = SyncPromise.all([
			this.oRequestor.request("PATCH", sChildPath, oGroupLock, {
					"If-Match" : oChildNode,
					Prefer : "return=minimal"
				}, {[this.oAggregation.$ParentNavigationProperty + "@odata.bind"] : sParentPath},
				/*fnSubmit*/null, function fnCancel() { /*nothing to do*/ }),
			invokeNextSibling(),
			this.requestRank(oChildNode, oGroupLock, bRefreshNeeded),
			bRequestSiblingRank && this.requestRank(oSiblingNode, oGroupLock, true)
		]);

		if (bRefreshNeeded) {
			oPromise = oPromise.then(([,, iRank, iSiblingRank]) => {
				return () => { // Note: caller MUST wait for side-effects refresh first
					return [
						iRank === undefined ? undefined : this.findIndex(iRank),
						bRequestSiblingRank && this.findIndex(iSiblingRank)
					];
				};
			});
		} else {
			oPromise = oPromise.then(([oPatchResult,, iRank]) => {
				const iCount = oChildNode["@$ui5.node.isExpanded"]
					? this.collapse(sChildPredicate)
					: undefined;

				let iResult = 1;
				switch (oParentNode ? oParentNode["@$ui5.node.isExpanded"] : true) {
					case false:
						iResult = this.expand(_GroupLock.$cached, sParentPredicate).unwrap() + 1;
						// fall through
					case true:
						break;

					default:
						_Helper.updateAll(this.mChangeListeners, sParentPredicate, oParentNode,
							{"@$ui5.node.isExpanded" : true}); // not a leaf anymore
				}

				// Note: iOldIndex might be affected by #expand above
				const iOldIndex = this.aElements.indexOf(oChildNode);
				const iOffset = _Helper.getPrivateAnnotation(oChildNode, "descendants", 0) + 1;
				this.adjustDescendantCount(oChildNode, iOldIndex, -iOffset);
				this.aElements.splice(iOldIndex, 1);
				const iOldRank = _Helper.getPrivateAnnotation(oChildNode, "rank");
				this.shiftRankForMove(iOldRank, iOffset, iRank);
				this.oFirstLevel.move(iOldRank, iRank, iOffset);
				// update the cache with the PATCH response (Note: "@odata.etag" is optional!)
				_Helper.updateExisting(this.mChangeListeners, sChildPredicate, oChildNode, {
					"@odata.etag" : oPatchResult["@odata.etag"],
					"@$ui5.context.isTransient" : undefined,
					"@$ui5.node.level" : oParentNode ? oParentNode["@$ui5.node.level"] + 1 : 1
				});
				_Helper.setPrivateAnnotation(oChildNode, "rank", iRank);
				const iNewIndex = this.getInsertIndex(iRank);
				this.aElements.splice(iNewIndex, 0, oChildNode);
				this.adjustDescendantCount(oChildNode, iNewIndex, +iOffset);

				return [iResult, iNewIndex, iCount];
			});
		} // else: side-effects refresh needed, nothing to do here!

		return {promise : oPromise, refresh : bRefreshNeeded};
	};

	/**
	 * Moves the out-of-place nodes below the given parent in the given order. Moves to the start if
	 * there is no parent.
	 *
	 * @param {number} [iParentRank]
	 *   The parent's rank or <code>undefined</code> if there is no parent
	 * @param {string[]} aOutOfPlacePredicates - The predicates of the out-of-place nodes
	 *
	 * @private
	 */
	_AggregationCache.prototype.moveOutOfPlaceNodes = function (iParentRank,
			aOutOfPlacePredicates) {
		const iParentIndex = iParentRank === undefined ? -1 : this.findIndex(iParentRank);
		aOutOfPlacePredicates.forEach((sNodePredicate) => {
			const oNode = this.aElements.$byPredicate[sNodePredicate];
			if (oNode) {
				this.oTreeState.stillOutOfPlace(oNode, sNodePredicate);
				const bExpanded = oNode["@$ui5.node.isExpanded"];
				if (bExpanded) {
					this.collapse(sNodePredicate);
				}
				const iNodeIndex = this.aElements.indexOf(oNode);
				this.aElements.splice(iNodeIndex, 1);
				this.aElements.splice(iParentIndex + 1, 0, oNode);
				if (bExpanded) {
					this.expand(_GroupLock.$cached, sNodePredicate);
				}
			}
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
			iFirstLevelIndex = iIndex,
			iFirstLevelLength = iLength,
			oGapParent,
			iGapStart,
			bHasGrandTotalAtTop = this.oGrandTotalPromise
				&& this.oAggregation.grandTotalAtBottomOnly !== true,
			aReadPromises = [],
			i,
			that = this;

		/*
		 * Reads the given range of the current gap, saves the promise, and replaces the gap with
		 * the read's result.
		 *
		 * @param {number} iGapStart start of gap, inclusive
		 * @param {number} iGapEnd end of gap, exclusive
		 */
		function readGap(iGapStart0, iGapEnd) {
			aReadPromises.push(
				that.readGap(oGapParent, iGapStart0, iGapEnd, oGroupLock.getUnlockedCopy(),
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
			const oReadRange = ODataUtils._getReadRange(this.aElements, iIndex, iLength,
				iPrefetchLength,
				(oElement) => {
					switch (_Helper.getPrivateAnnotation(oElement, "placeholder")) {
						case true: // an initial placeholder; must have a rank
							return _Helper.getPrivateAnnotation(oElement, "parent")
								.isMissing(_Helper.getPrivateAnnotation(oElement, "rank"));
						case 1: // converted back to a placeholder; must have a predicate
							return !(this.aElements.$byPredicate[
									_Helper.getPrivateAnnotation(oElement, "predicate")
								] instanceof SyncPromise);
						default: // no placeholder
							return false;
					}
				});
			const n = Math.min(oReadRange.start + oReadRange.length, this.aElements.length);
			for (i = oReadRange.start; i < n; i += 1) {
				const oElement = this.aElements[i];
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
						&& _Helper.getPrivateAnnotation(oElement, "rank")
							!== _Helper.getPrivateAnnotation(this.aElements[i - 1], "rank") + 1) {
					// Note: w/ side effect, ranks might not be consecutive => split gap
					// Note: an undefined "rank" causes a split gap, which is important!
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
			var aElements = that.aElements.slice(iIndex, iIndex + iLength)
					.map(function (oElement) {
						return _Helper.hasPrivateAnnotation(oElement, "placeholder")
							? undefined
							: oElement;
					});

			aElements.$count = that.aElements.$count;

			return {value : aElements};
		});
	};

	/**
	 * Reads the count of data (in case of a recursive hierarchy), taking the current filter and
	 * search into account.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An original lock for the group ID to be used for the GET request, to be cloned via
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy}
	 * @returns {Promise<void>|undefined}
	 *   A promise which is resolved without a defined result when the read is finished, or
	 *   rejected in case of an error; <code>undefined</code> in case no count needs to be read
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @private
	 */
	_AggregationCache.prototype.readCount = function (oGroupLock) {
		var mQueryOptions,
			fnResolve = this.oCountPromise && this.oCountPromise.$resolve,
			sResourcePath;

		if (fnResolve) {
			delete this.oCountPromise.$resolve;

			mQueryOptions = Object.assign({}, this.mQueryOptions);
			// // drop collection related system query options (except $filter,$search)
			delete mQueryOptions.$apply;
			delete mQueryOptions.$count;
			// keep mQueryOptions.$filter;
			delete mQueryOptions.$expand;
			delete mQueryOptions.$orderby;
			if (this.oAggregation.search) {
				// Note: A recursive hierarchy cannot be combined with "$search"
				mQueryOptions.$search = this.oAggregation.search;
			}
			delete mQueryOptions.$select;
			// Note: sMetaPath only needed for $filter by V42, but V42 cannot work here!
			sResourcePath = this.sResourcePath + "/$count"
				+ this.oRequestor.buildQueryString(/*sMetaPath*/null, mQueryOptions);

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
	 *   A promise which is resolved without a defined result when the read is finished, or
	 *   rejected in case of an error
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @private
	 */
	_AggregationCache.prototype.readFirst = function (iStart, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var that = this;

		iLength += iPrefetchLength; // "after the given range"

		// "before the given range"
		// after a side-effects refresh out-of-place nodes may shift the visible range, we have
		// to read as many nodes before this range to be on the safe side
		iPrefetchLength = Math.max(iPrefetchLength, this.oTreeState.getOutOfPlaceCount());
		if (iStart > iPrefetchLength) {
			iLength += iPrefetchLength;
			iStart -= iPrefetchLength;
		} else {
			iLength += iStart;
			iStart = 0;
		}

		// Note: this.oFirstLevel.read changes this value
		const bSentRequest = this.oFirstLevel.bSentRequest;

		return SyncPromise.all([
				this.oFirstLevel.read(iStart, iLength, 0, oGroupLock, fnDataRequested),
				// request out-of-place nodes only once
				...(bSentRequest ? [] : this.requestOutOfPlaceNodes(oGroupLock))
			]).then(function ([oResult, ...aOutOfPlaceResults]) {
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
					that.aElements[j] ??= _AggregationHelper.createPlaceholder(
						that.oAggregation.expandTo > 1 || that.bUnifiedCache
							? /*don't know*/0
							: 1,
						j - iOffset, that.oFirstLevel);
				}

				that.handleOutOfPlaceNodes(aOutOfPlaceResults);
			});
	};

	/**
	 * Reads the given gap from the given cache and replaces the gap with the read's result. This
	 * method may be used for single created persisted elements in order to refresh them.
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
	 *   A promise which is resolved without a defined result when the read is finished, or
	 *   rejected in case of an error
	 * @throws {Error} If index of placeholder at start of gap is less than 0, if end of gap is
	 *   before start, or if more than a single created persisted element is read
	 *
	 * @private
	 */
	_AggregationCache.prototype.readGap = function (oCache, iStart, iEnd, oGroupLock,
			fnDataRequested) {
		const oStartElement = this.aElements[iStart];
		const iRank = _Helper.getPrivateAnnotation(oStartElement, "rank");
		if (iRank === undefined) {
			if (iEnd - iStart !== 1) {
				throw new Error("Not just a single created persisted");
			}
			const sPredicate = _Helper.getPrivateAnnotation(oStartElement, "predicate");
			const oPromise = oCache.refreshSingle(oGroupLock, "", -1, sPredicate,
					/*bKeepAlive*/true, false, fnDataRequested)
				.then((oElement) => {
					_Helper.inheritPathValue(this.oAggregation.$NodeProperty.split("/"),
						oStartElement, oElement, true); // keep NodeProperty
					this.addElements(oElement, iStart, oCache); // $skip index is undefined!
				});
			this.aElements.$byPredicate[sPredicate] = oPromise;
			return oPromise;
		}

		const mQueryOptions = oCache.getQueryOptions();
		if (mQueryOptions.$count) { // $count not needed anymore, 1st read was done by #expand
			delete mQueryOptions.$count;
			oCache.setQueryOptions(mQueryOptions, true);
		}

		const oPromise = oCache.read(iRank, iEnd - iStart, 0, oGroupLock, fnDataRequested, true)
			.then((oResult) => {
				// Note: this code must be idempotent, it might well run twice!
				var bGapHasMoved = false,
					oError;

				// Note: aElements[iGapStart] may have changed by a parallel operation
				if (oStartElement !== this.aElements[iStart]
						&& oResult.value[0] !== this.aElements[iStart]) {
					// start of the gap has moved meanwhile
					bGapHasMoved = true;
					iStart = this.aElements.indexOf(oStartElement);
					if (iStart < 0) {
						iStart = this.aElements.indexOf(oResult.value[0]);
						if (iStart < 0) {
							oError = new Error("Collapse before read has finished");
							oError.canceled = true;
							throw oError;
						}
					}
				}

				this.addElements(oResult.value, iStart, oCache, iRank);

				if (bGapHasMoved) {
					oError = new Error("Collapse or expand before read has finished");
					oError.canceled = true;
					throw oError;
				}
			});
		if (oPromise.isPending()) {
			for (let i = iStart; i < iEnd; i += 1) {
				const sPredicate = _Helper.getPrivateAnnotation(this.aElements[i], "predicate");

				if (sPredicate) {
					this.aElements.$byPredicate[sPredicate] = oPromise;
				}
			}
		}

		return oPromise;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#refreshKeptElements
	 */
	_AggregationCache.prototype.refreshKeptElements = function (oGroupLock, fnOnRemove,
			bIgnorePendingChanges, _bDropApply) {
		// "super" call (like @borrows ...)
		const fnSuper = this.oFirstLevel.refreshKeptElements;
		return fnSuper.call(this, oGroupLock, fnOnRemove, bIgnorePendingChanges,
			/*bDropApply*/true);
	};

	/**
	 * Requests and updates the NodeProperty ("the hierarchy node value") of the given element,
	 * unless already available.
	 *
	 * @param {object} oElement - The element
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An original lock for the group ID to be used for the GET request, to be cloned via
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy}
	 * @param {boolean} [bDropFilter]
	 *   Whether to drop the list's filter from the request in order to support out-of-place nodes
	 *   outside the list's current collection
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result in case of success, or
	 *   rejected in case of an error
	 *
	 * @private
	 */
	_AggregationCache.prototype.requestNodeProperty = async function (oElement, oGroupLock,
			bDropFilter) {
		if (_Helper.drillDown(oElement, this.oAggregation.$NodeProperty) !== undefined) {
			return; // already available
		}

		await this.requestProperties(oElement, [this.oAggregation.$NodeProperty], oGroupLock, true,
			bDropFilter);
	};

	/**
	 * Creates and returns the request promises for out-of-place nodes, so that they can later be
	 * moved to their out-of-place position in the cache.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An original lock for the group ID to be used for the GET request, to be cloned via
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy}
	 * @returns {Promise[]}
	 *   The request promises
	 *
	 * @private
	 * @see #handleOutOfPlaceNodes
	 */
	_AggregationCache.prototype.requestOutOfPlaceNodes = function (oGroupLock) {
		const aOutOfPlaceByParent = this.oTreeState.getOutOfPlaceGroupedByParent();
		if (!aOutOfPlaceByParent.length) {
			return [];
		}

		const aOutOfPlacePromises = [];
		const request = (mQueryOptions) => {
			const sResourcePath = this.sResourcePath
				+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
			aOutOfPlacePromises.push(this.oRequestor.request("GET", sResourcePath,
				oGroupLock.getUnlockedCopy()));
		};

		// read the rank of the out-of-place nodes and their parents
		let mQueryOptions = _AggregationHelper.getQueryOptionsForOutOfPlaceNodesRank(
			aOutOfPlaceByParent, this.oAggregation, this.oFirstLevel.getQueryOptions());
		request(mQueryOptions);

		// read the out-of-place nodes
		aOutOfPlaceByParent.forEach((oOutOfPlace) => {
			mQueryOptions = _AggregationHelper.getQueryOptionsForOutOfPlaceNodesData(oOutOfPlace,
				this.oAggregation, this.mQueryOptions);
			request(mQueryOptions);
		});

		return aOutOfPlacePromises;
	};

	/**
	 * Requests the given properties for the given element via a "mergeable GET".
	 *
	 * @param {object} oElement - The element
	 * @param {string[]} aSelect - The relative paths to properties to be requested
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An original lock for the group ID to be used for the GET request, to be cloned via
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy}
	 * @param {boolean} [bInheritResult]
	 *   Whether the result is inherited in the given element
	 * @param {boolean} [bDropFilter]
	 *   Whether to drop the list's filter from the request in order to support out-of-place nodes
	 *   outside the list's current collection
	 * @param {boolean} [bRefreshNeeded]
	 *   Whether to request the rank with up-to-date ExpandLevels because a side-effects refresh is
	 *   about to follow; cannot be used in combination with <code>bDropFilter</code>
	 * @returns {Promise<object|undefined|void>}
	 *   A promise which is resolved without a defined result in case <code>bInheritResult</code> is
	 *   set to <code>true</code>, or with the result object (which may be <code>undefined</code>),
	 *   or rejected in case of an error
	 *
	 * @private
	 */
	_AggregationCache.prototype.requestProperties = async function (oElement, aSelect, oGroupLock,
			bInheritResult, bDropFilter, bRefreshNeeded) {
		function getApply(mQueryOptions) { // keep $apply and custom query options
			mQueryOptions = {...mQueryOptions};
			// Note: $filter is overwritten below, $orderby is part of $apply already
			delete mQueryOptions.$count;
			delete mQueryOptions.$expand;
			delete mQueryOptions.$select;
			return mQueryOptions;
		}

		let mQueryOptions;
		if (bRefreshNeeded) {
			const oAggregation = {
				...this.oAggregation,
				$ExpandLevels : this.oTreeState.getExpandLevels()
			};
			mQueryOptions = getApply(
				_AggregationHelper.buildApply4Hierarchy(oAggregation, this.mQueryOptions));
		} else {
			const oCache = _Helper.getPrivateAnnotation(oElement, "parent", this.oFirstLevel);
			mQueryOptions = bDropFilter
				? _AggregationHelper
					.dropFilter(this.oAggregation, this.mQueryOptions, oCache.$parentFilter)
				: getApply(oCache.getQueryOptions());
		}
		mQueryOptions.$filter = _Helper.getKeyFilter(oElement, this.sMetaPath, this.getTypes());
		const sResourcePath = this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
		const oResult = await this.oRequestor.request("GET", sResourcePath,
			oGroupLock.getUnlockedCopy(), undefined, undefined, undefined, undefined,
			this.sMetaPath, undefined, false, {$select : aSelect}, this);
		const oRequestedProperties = oResult.value[0];

		if (bInheritResult && oRequestedProperties) {
			aSelect.forEach((sPath) => {
				_Helper.inheritPathValue(sPath.split("/"), oRequestedProperties, oElement, true);
			});
		} else {
			return oRequestedProperties;
		}
	};

	/**
	 * Requests the (limited preorder) rank of the given element which must belong to
	 * <code>this.oFirstLevel</code>.
	 *
	 * @param {object} oElement - The element
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An original lock for the group ID to be used for the GET request, to be cloned via
	 *   {@link sap.ui.model.odata.v4.lib._GroupLock#getUnlockedCopy}
	 * @param {boolean} [bRefreshNeeded]
	 *   Whether to request the rank with up-to-date ExpandLevels because a side-effects refresh is
	 *   about to follow
	 * @returns {Promise<number|undefined>}
	 *   A promise which is resolved with the (limited preorder) rank of the given element (which
	 *   may well be <code>undefined</code>), or rejected in case of an error
	 *
	 * @private
	 */
	_AggregationCache.prototype.requestRank = async function (oElement, oGroupLock,
			bRefreshNeeded) {
		const oResult = await this.requestProperties(oElement, [this.oAggregation.$LimitedRank],
			oGroupLock, false, false, bRefreshNeeded);

		return oResult && parseInt(_Helper.drillDown(oResult, this.oAggregation.$LimitedRank));
	};

	/**
	 * Returns the index of the given node's sibling, either the next one (via offset +1) or the
	 * previous one (via offset -1).
	 *
	 * @param {number} iIndex - The index of a node
	 * @param {number} iOffset - An offset, either -1 or +1
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group to associate the requests with
	 * @returns {Promise<number>}
	 *   The sibling node's index, or -1 if no such sibling exists
	 *
	 * @public
	 */
	_AggregationCache.prototype.requestSiblingIndex = async function (iIndex, iOffset, oGroupLock) {
		const iSiblingIndex = this.getSiblingIndex(iIndex, iOffset, true);
		if (iSiblingIndex !== undefined) {
			return iSiblingIndex;
		}

		const oNode = this.aElements[iIndex];
		const mQueryOptions = {
			...this.oFirstLevel.mQueryOptions,
			$filter : this.oAggregation.$LimitedRank + (iOffset < 0 ? " lt " : " gt ")
				+ _Helper.getPrivateAnnotation(oNode, "rank") + " and "
				+ this.oAggregation.$DistanceFromRoot + " lt " + oNode["@$ui5.node.level"],
			$top : 1
		};
		if (iOffset < 0) {
			mQueryOptions.$orderby = this.oAggregation.$LimitedRank + " desc";
		}
		mQueryOptions.$select = [...mQueryOptions.$select, this.oAggregation.$LimitedRank];
		delete mQueryOptions.$count;
		const sResourcePath = this.sResourcePath
			+ this.oRequestor.buildQueryString("", mQueryOptions, false, true, true);

		const oResult = await this.oRequestor.request("GET", sResourcePath, oGroupLock);

		const oSibling = oResult.value[0];
		// Note: overridden by _AggregationCache.calculateKeyPredicateRH
		this.oFirstLevel.calculateKeyPredicate(oSibling, this.getTypes(), this.sMetaPath);
		const iSiblingRank = parseInt(_Helper.drillDown(oSibling, this.oAggregation.$LimitedRank));
		_Helper.deleteProperty(oSibling, this.oAggregation.$LimitedRank);
		if (_Helper.hasPrivateAnnotation(this.aElements[iSiblingRank], "placeholder")) {
			this.insertNode(oSibling, iSiblingRank);
		} // else: sibling already inside collection

		return oSibling["@$ui5.node.level"] === oNode["@$ui5.node.level"]
			? iSiblingRank
			: -1; // no such sibling
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#reset
	 */
	_AggregationCache.prototype.reset = function (aKeptElementPredicates, sGroupId, mQueryOptions,
			oAggregation, bIsGrouped) {
		var fnResolve,
			that = this;

		if (bIsGrouped) {
			throw new Error("Unsupported grouping via sorter");
		}

		aKeptElementPredicates.forEach(function (sPredicate) {
			var oKeptElement = that.aElements.$byPredicate[sPredicate];

			if (_Helper.hasPrivateAnnotation(oKeptElement, "placeholder")) {
				throw new Error("Unexpected placeholder");
			}
			delete oKeptElement["@$ui5.node.isExpanded"];
			delete oKeptElement["@$ui5.node.level"];
			delete oKeptElement["@$ui5._"];
			_Helper.setPrivateAnnotation(oKeptElement, "predicate", sPredicate);
		});

		this.oAggregation = oAggregation;
		// "super" call (like @borrows ...)
		const fnSuper = this.oFirstLevel.reset;
		fnSuper.call(this, aKeptElementPredicates, sGroupId, mQueryOptions);
		// reset modifies the cache's query options => recalculate the download URL
		this.sDownloadUrl = _Cache.prototype.getDownloadUrl.call(this, "");
		if (sGroupId) { // sGroupId means we are in a side-effects refresh
			this.oBackup.oCountPromise = this.oCountPromise;
			this.oBackup.oFirstLevel = this.oFirstLevel;
			this.oBackup.bUnifiedCache = this.bUnifiedCache;
			this.bUnifiedCache = true;
		} else {
			this.oTreeState.reset();
		}
		this.oAggregation.$ExpandLevels = this.oTreeState.getExpandLevels();
		this.oCountPromise = undefined;
		if (mQueryOptions.$count) {
			this.oCountPromise = new SyncPromise(function (resolve) {
				fnResolve = resolve;
			});
			this.oCountPromise.$resolve = fnResolve;
		}
		this.oFirstLevel = this.createGroupLevelCache();
	};

	/**
	 * Resets all out-of-place information.
	 *
	 * @public
	 */
	_AggregationCache.prototype.resetOutOfPlace = function () {
		this.oTreeState.resetOutOfPlace();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._CollectionCache#restore
	 */
	_AggregationCache.prototype.restore = function (bReally) {
		if (bReally) {
			this.oCountPromise = this.oBackup.oCountPromise;
			this.oFirstLevel = this.oBackup.oFirstLevel;
			this.bUnifiedCache = this.oBackup.bUnifiedCache;
		}
		// "super" call (like @borrows ...)
		const fnSuper = this.oFirstLevel.restore;
		fnSuper.call(this, bReally);
	};

	/**
	 * Shifts the rank (aka. $skip index) of all siblings (nodes or placeholders) after the node at
	 * the given array index by the given offset, except for elements where it is
	 * <code>undefined</code> or lower than the node's own rank. If the node at the given index
	 * itself has an <code>undefined</code> rank, nothing is shifted. Note that inside
	 * <code>this.oFirstLevel</code> not only siblings are affected and it's not simply "after".
	 *
	 * @param {number} iIndex
	 *   Index in <code>this.aElements</code> of a node
	 * @param {number} iOffset
	 *   Offset to add to rank
	 *
	 * @private
	 */
	_AggregationCache.prototype.shiftRank = function (iIndex, iOffset) {
		const oNode = this.aElements[iIndex];
		const iMinRank = _Helper.getPrivateAnnotation(oNode, "rank");
		if (iMinRank === undefined) {
			return;
		}

		const oCache = _Helper.getPrivateAnnotation(oNode, "parent");
		if (oCache === this.oFirstLevel) {
			iIndex = -1; // search from the start!
		}
		for (let i = iIndex + 1; i < this.aElements.length; i += 1) {
			const oSibling = this.aElements[i];
			if (oSibling === oNode) {
				continue;
			}
			if (_Helper.getPrivateAnnotation(oSibling, "parent") === oCache) {
				const iRank = _Helper.getPrivateAnnotation(oSibling, "rank");
				if (iRank >= iMinRank) { // Note: undefined >= ... is false
					_Helper.setPrivateAnnotation(oSibling, "rank", iRank + iOffset);
				}
			}
			if (oCache !== this.oFirstLevel
					&& oSibling["@$ui5.node.level"] < oNode["@$ui5.node.level"]) {
				// Note: placeholders with level 0 only exist in 1st level cache!
				break; // no use in searching further
			}
		}
	};

	/**
	 * Shifts the rank (aka. $skip index) of all other nodes or placeholders affected by the move of
	 * a subtree of the given size from the given old to the given new rank. The subtree itself is
	 * unaffected and may, but need not be present.
	 *
	 * @param {number} iOldRank - The old rank of the subtree's root node
	 * @param {number} iSize - Size of subtree (number of moving elements)
	 * @param {number} iNewRank - The new rank of the subtree's root node
	 *
	 * @private
	 */
	_AggregationCache.prototype.shiftRankForMove = function (iOldRank, iSize, iNewRank) {
		if (iOldRank < iNewRank) {
			this.aElements.forEach((oElement) => {
				const iRank = _Helper.getPrivateAnnotation(oElement, "rank");
				if (iOldRank + iSize <= iRank && iRank < iNewRank + iSize) {
					_Helper.setPrivateAnnotation(oElement, "rank", iRank - iSize);
				}
			});
		} else if (iNewRank < iOldRank) {
			this.aElements.forEach((oElement) => {
				const iRank = _Helper.getPrivateAnnotation(oElement, "rank");
				if (iNewRank <= iRank && iRank < iOldRank) {
					_Helper.setPrivateAnnotation(oElement, "rank", iRank + iSize);
				}
			});
		} // iOldRank === iNewRank => nothing to do
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

	/**
	 * Turns the given element, which has the given predicate, into a placeholder which keeps all
	 * private annotations plus the hierarchy node value. The original element is removed from its
	 * corresponding cache and must not be used any longer. Created persisted elements do not lose
	 * their special treatment!
	 *
	 * @param {object} oElement - An element
	 * @param {string} sPredicate - Its predicate
	 *
	 * @private
	 */
	_AggregationCache.prototype.turnIntoPlaceholder = function (oElement, sPredicate) {
		if (_Helper.hasPrivateAnnotation(oElement, "placeholder")) {
			return;
		}

		_Helper.setPrivateAnnotation(oElement, "placeholder", 1); // not an initial placeholder
		_AggregationHelper.markSplicedStale(oElement);
		delete this.aElements.$byPredicate[sPredicate];
		// drop original element from its cache's collection
		const iRank = _Helper.getPrivateAnnotation(oElement, "rank");
		if (iRank !== undefined) {
			_Helper.getPrivateAnnotation(oElement, "parent").drop(iRank, sPredicate, true);
		} // else: special handling inside #readGap
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
		var sDistanceFromRoot,
			bIsExpanded,
			iLevel = 1,
			sLimitedDescendantCount,
			sPredicate;

		if (!(sMetaPath in mTypeForMetaPath)) {
			return undefined; // nested object
		}

		sPredicate = _Helper.getKeyPredicate(oElement, sMetaPath, mTypeForMetaPath);
		_Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);
		if (sMetaPath !== oAggregation.$metaPath) { // related entity (via navigation property)
			return sPredicate;
		}

		switch (_Helper.drillDown(oElement, oAggregation.$DrillState)) {
			case "expanded":
				bIsExpanded = true;
				break;

			case "collapsed":
				bIsExpanded = false;
				break;

			default: // "leaf"
				// bIsExpanded = undefined;
		}
		_Helper.deleteProperty(oElement, oAggregation.$DrillState);
		if (oGroupNode) {
			iLevel = oGroupNode["@$ui5.node.level"] + 1;
		} else {
			sDistanceFromRoot = _Helper.drillDown(oElement, oAggregation.$DistanceFromRoot);
			if (sDistanceFromRoot) { // Edm.Int64
				_Helper.deleteProperty(oElement, oAggregation.$DistanceFromRoot);
				iLevel = parseInt(sDistanceFromRoot) + 1;
			}
		}
		// set the node values
		_AggregationHelper.setAnnotations(oElement, bIsExpanded, /*bIsTotal*/undefined, iLevel);

		if (oAggregation.$LimitedDescendantCount) {
			sLimitedDescendantCount
				= _Helper.drillDown(oElement, oAggregation.$LimitedDescendantCount);
			if (sLimitedDescendantCount) {
				_Helper.deleteProperty(oElement, oAggregation.$LimitedDescendantCount);
				if (sLimitedDescendantCount !== "0") { // Edm.Int64
					_Helper.setPrivateAnnotation(oElement, "descendants",
						parseInt(sLimitedDescendantCount));
				}
			}
		}

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
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   <br>
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @param {object} [oAggregation]
	 *   An object holding the information needed for data aggregation; see also "OData Extension
	 *   for Data Aggregation Version 4.0"; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
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
	_AggregationCache.create = function (oRequestor, sResourcePath, sDeepResourcePath,
			mQueryOptions, oAggregation, bSortExpandSelect, bSharedRequest, bIsGrouped) {
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
});
