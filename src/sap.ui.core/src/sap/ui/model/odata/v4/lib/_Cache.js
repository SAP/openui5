/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define([
	"jquery.sap.global",
	"./_Helper",
	"./_SyncPromise"
], function (jQuery, _Helper, _SyncPromise) {
	"use strict";

	/**
	 * Adds the given delta to the collection's $count if there is one.
	 *
	 * @param {object} mChangeListeners A map of change listeners by path
	 * @param {string} sPath The path of the collection in the cache
	 * @param {array} aCollection The collection
	 * @param {number} iDelta The delta
	 */
	function addToCount(mChangeListeners, sPath, aCollection, iDelta) {
		if (aCollection.$count !== undefined) {
			setCount(mChangeListeners, sPath, aCollection, aCollection.$count + iDelta);
		}
	}

	/**
	 * Converts the known OData system query options from map or array notation to a string. All
	 * other parameters are simply passed through.
	 *
	 * @param {object} mQueryOptions The query options
	 * @param {function(string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 */
	function convertSystemQueryOptions(mQueryOptions, fnResultHandler, bDropSystemQueryOptions) {
		Object.keys(mQueryOptions).forEach(function (sKey) {
			var vValue = mQueryOptions[sKey];

			if (bDropSystemQueryOptions && sKey[0] === '$') {
				return;
			}

			switch (sKey) {
				case "$expand":
					vValue = Cache.convertExpand(vValue);
					break;
				case "$apply":
				case "$count":
				case "$filter":
				case "$orderby":
				case "$search":
					break;
				case "$select":
					if (Array.isArray(vValue)) {
						vValue = vValue.join(",");
					}
					break;
				default:
					if (sKey[0] === '$') {
						throw new Error("Unsupported system query option " + sKey);
					}
			}
			fnResultHandler(sKey, vValue);
		});
	}

	/**
	 * Fills the given array range with the given value. If iEnd is greater than the array length,
	 * elements are appended to the end, in contrast to Array.fill.
	 *
	 * @param {any[]} aArray
	 *   The array
	 * @param {any} vValue
	 *   The value
	 * @param {number} iStart
	 *   The start index
	 * @param {number} iEnd
	 *   The end index (will not be filled)
	 */
	function fill(aArray, vValue, iStart, iEnd) {
		var i;

		for (i = iStart; i < iEnd; i++) {
			aArray[i] = vValue;
		}
	}

	/**
	 * Returns the collection's $count.
	 *
	 * @param {array} aCollection The collection
	 * @returns {number} The count or <code>Infinity</code> if the count is unknown
	 */
	function getCount(aCollection) {
		return aCollection.$count !== undefined ? aCollection.$count : Infinity;
	}

	/**
	 * Returns <code>true</code> if <code>sRequestPath</code> is a sub-path of <code>sPath</code>.
	 *
	 * @param {string} sRequestPath The request path
	 * @param {string} sPath The path to check against
	 * @returns {boolean} <code>true</code> if it is a sub-path
	 */
	function isSubPath(sRequestPath, sPath) {
		return sPath === "" || sRequestPath === sPath || sRequestPath.indexOf(sPath + "/") === 0;
	}

	/**
	 * Requests the elements in the given range and places them into the aElements list. While the
	 * request is running, all indexes in this range contain the Promise.
	 *
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
	 *   The cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The position of the last element to request ($skip + $top)
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {function} [fnDataRequested]
	 *   The function is called when the back end requests have been sent.
	 */
	function requestElements(oCache, iStart, iEnd, sGroupId, fnDataRequested) {
		var iExpectedLength = iEnd - iStart,
			oPromise,
			sResourcePath = oCache.sResourcePath + "$skip=" + iStart + "&$top=" + iExpectedLength;

		oPromise = oCache.oRequestor.request("GET", sResourcePath, sGroupId, undefined, undefined,
				fnDataRequested)
			.then(function (oResult) {
				var iCount,
					sCount,
					i,
					iResultLength = oResult.value.length;

				Cache.computeCount(oResult);
				oCache.sContext = oResult["@odata.context"];
				sCount = oResult["@odata.count"];
				if (sCount) {
					setCount(oCache.mChangeListeners, "", oCache.aElements, sCount);
				}
				for (i = 0; i < iResultLength; i++) {
					oCache.aElements[iStart + i] = oResult.value[i];
				}
				if (iResultLength < iExpectedLength) {
					iCount = Math.min(getCount(oCache.aElements), iStart + iResultLength);
					setCount(oCache.mChangeListeners, "", oCache.aElements, iCount);
					oCache.aElements.length = iCount;
				}
			})["catch"](function (oError) {
				fill(oCache.aElements, undefined, iStart, iEnd);
				throw oError;
			});

		fill(oCache.aElements, oPromise, iStart, iEnd);
	}

	/**
	 * Sets the collection's $count: a number representing the element count on server-side. The
	 * server-side element count does not include transient entities. It may be
	 * <code>undefined</code>, but not <code>Infinity</code>.
	 *
	 * @param {object} mChangeListeners A map of change listeners by path
	 * @param {string} sPath The path of the collection in the cache
	 * @param {array} aCollection The collection
	 * @param {string|number} vCount The count
	 */
	function setCount(mChangeListeners, sPath, aCollection, vCount) {
		// Note: @odata.count is of type Edm.Int64, represented as a string in OData responses;
		// $count should be a number and the loss of precision is acceptable
		if (typeof vCount === "string") {
			vCount = parseInt(vCount, 10);
		}
		// Note: this relies on $count being present as an own property of aCollection
		_Helper.updateCache(mChangeListeners, sPath, aCollection, {$count : vCount});
	}

	//*********************************************************************************************
	// Cache
	//*********************************************************************************************

	/**
	 * Base class for the various caches.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 */
	function Cache(oRequestor, sResourcePath, mQueryOptions) {
		this.bActive = true;
		this.mChangeListeners = {};
		this.mPatchRequests = {};
		this.mQueryOptions = mQueryOptions;
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath + Cache.buildQueryString(mQueryOptions);
	}

	/**
	 * Deletes an entity on the server and in the cached data.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sEditUrl
	 *   The entity's edit URL
	 * @param {string} sPath
	 *   The entity's path within the cache
	 * @param {function} fnCallback
	 *   A function which is called after a transient entity has been deleted from the cache or
	 *   after the entity has been deleted from the server and from the cache; the index of the
	 *   entity is passed as parameter
	 * @returns {Promise}
	 *   A promise for the DELETE request
	 */
	Cache.prototype._delete = function (sGroupId, sEditUrl, sPath, fnCallback) {
		var aSegments = sPath.split("/"),
			vDeleteProperty = aSegments.pop(),
			sParentPath = aSegments.join("/"),
			that = this;

		return this.fetchValue(sGroupId, sParentPath).then(function (vCacheData) {
			var oEntity = vDeleteProperty
					? vCacheData[vDeleteProperty]
					: vCacheData, // deleting at root level
				mHeaders,
				sTransientGroup = oEntity["@$ui5.transient"];

			if (sTransientGroup === true) {
				throw new Error("No 'delete' allowed while waiting for server response");
			}
			if (sTransientGroup) {
				that.oRequestor.removePost(sTransientGroup, oEntity);
				return Promise.resolve();
			}
			if (oEntity["$ui5.deleting"]) {
				throw new Error("Must not delete twice: " + sEditUrl);
			}
			oEntity["$ui5.deleting"] = true;
			mHeaders = {"If-Match" : oEntity["@odata.etag"]};
			sEditUrl += Cache.buildQueryString(that.mQueryOptions, true);
			return that.oRequestor.request("DELETE", sEditUrl, sGroupId, mHeaders)
				["catch"](function (oError) {
					if (oError.status !== 404) {
						delete oEntity["$ui5.deleting"];
						throw oError;
					} // else: map 404 to 200
				})
				.then(function () {
					if (Array.isArray(vCacheData)) {
						if (vCacheData[vDeleteProperty] !== oEntity) {
							// oEntity might have moved due to parallel insert/delete
							vDeleteProperty = vCacheData.indexOf(oEntity);
						}
						if (vDeleteProperty === "-1") {
							delete vCacheData[-1];
						} else {
							vCacheData.splice(vDeleteProperty, 1);
						}
						addToCount(that.mChangeListeners, sParentPath, vCacheData, -1);
						fnCallback(Number(vDeleteProperty));
					} else {
						if (vDeleteProperty) {
							vCacheData[vDeleteProperty] = null;
						} else { // deleting at root level
							oEntity["$ui5.deleted"] = true;
						}
						fnCallback();
					}
				});
		});
	};

	/**
	 * Adds an item to the given map by path.
	 *
	 * @param {object} mMap
	 *   A map from path to a list of items
	 * @param {string} sPath
	 *   The path
	 * @param {object} [oItem]
	 *   The item; if it is <code>undefined</code>, nothing happens
	 */
	Cache.prototype.addByPath = function (mMap, sPath, oItem) {
		if (oItem) {
			if (!mMap[sPath]) {
				mMap[sPath] = [oItem];
			} else if (mMap[sPath].indexOf(oItem) >= 0) {
				return;
			} else {
				mMap[sPath].push(oItem);
			}
		}
	};

	/**
	 * Throws an error if the cache is not active.
	 */
	Cache.prototype.checkActive = function () {
		var oError;

		if (!this.bActive) {
			oError = new Error("Response discarded: cache is inactive");
			oError.canceled = true;
			throw oError;
		}
	};

	/**
	 * Creates a transient entity with index -1 in the list and adds a POST request to the batch
	 * group with the given ID. If the POST request failed, <code>fnErrorCallback</code> is called
	 * with an Error object, the POST request is automatically added again to the same batch
	 * group (for application group IDs) or parked (for '$auto' or '$direct'). Parked POST requests
	 * are repeated with the next update of the entity data.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string|SyncPromise} vPostPath
	 *   The path for the POST request or a SyncPromise that resolves with that path
	 * @param {string} sPath
	 *   The entity's path within the cache
	 * @param {string} [oEntityData={}]
	 *   The initial entity data
	 * @param {function} fnCancelCallback
	 *   A function which is called after a transient entity has been canceled from the cache
	 * @param {function} fnErrorCallback
	 *   A function which is called with an Error object each time a POST request fails
	 * @returns {Promise}
	 *   A promise which is resolved without data when the POST request has been successfully sent
	 *   and the entity has been marked as non-transient
	 */
	Cache.prototype.create = function (sGroupId, vPostPath, sPath, oEntityData,
			fnCancelCallback, fnErrorCallback) {
		var vCacheData, aCollection, sNavigationProperty, aSegments, that = this;

		// Clean-up when the create has been canceled.
		function cleanUp() {
			delete aCollection[-1];
			fnCancelCallback();
		}

		// Sets a marker that the create request is pending, so that update and delete fail.
		function setCreatePending() {
			oEntityData["@$ui5.transient"] = true;
		}

		function request(sPostGroupId) {
			oEntityData["@$ui5.transient"] = sPostGroupId; // mark as transient (again)
			return _SyncPromise.resolve(vPostPath).then(function (sPostPath) {
				sPostPath += Cache.buildQueryString(that.mQueryOptions, true);
				return that.oRequestor.request("POST", sPostPath, sPostGroupId, null, oEntityData,
						setCreatePending, cleanUp)
					.then(function (oResult) {
						delete oEntityData["@$ui5.transient"];
						// now the server has one more element
						addToCount(that.mChangeListeners, sPath, aCollection, 1);
						// update the cache with the POST response
						_Helper.updateCache(that.mChangeListeners, _Helper.buildPath(sPath, "-1"),
							oEntityData, oResult);
					}, function (oError) {
						if (oError.canceled) {
							// for cancellation no error is reported via fnErrorCallback
							throw oError;
						}
						if (fnErrorCallback) {
							fnErrorCallback(oError);
						}
						return request(sPostGroupId === "$auto" || sPostGroupId === "$direct"
							? "$parked." + sPostGroupId : sPostGroupId);
				});
			});
		}

		// clone data to avoid modifications outside the cache
		oEntityData = oEntityData ? JSON.parse(JSON.stringify(oEntityData)) : {};

		aSegments = sPath.split("/");
		sNavigationProperty = aSegments.pop();
		vCacheData = this.fetchValue("$cached", aSegments.join("/")).getResult();
		aCollection = sNavigationProperty ? vCacheData[sNavigationProperty] : vCacheData;
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
					+ "' does not reference a collection");
		}
		aCollection[-1] = oEntityData;

		// provide undefined ETag so that _Helper.updateCache() also updates ETag from server
		oEntityData["@odata.etag"] = undefined;
		return request(sGroupId);
	};

	/**
	 * Deregisters the given change listener.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {object} oListener
	 *   The change listener
	 */
	Cache.prototype.deregisterChange = function (sPath, oListener) {
		this.removeByPath(this.mChangeListeners, sPath, oListener);
	};

	/**
	 * Drills down into the given object according to <code>sPath</code>. Logs an error if the path
	 * leads into void.
	 *
	 * @param {object} oData
	 *   The result from a read or cache lookup
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {any}
	 *   The result matching to <code>sPath</code>
	 */
	Cache.prototype.drillDown = function (oData, sPath) {
		var that = this;

		function invalidSegment(sSegment) {
			jQuery.sap.log.error("Failed to drill-down into " + sPath + ", invalid segment: "
				+ sSegment, that.toString(), "sap.ui.model.odata.v4.lib._Cache");
		}

		if (sPath) {
			sPath.split("/").every(function (sSegment) {
				if (sSegment === "$count") {
					if (!Array.isArray(oData)) {
						invalidSegment(sSegment);
						oData = undefined;
						return false;
					}
					oData = oData.$count;
					return true;
				}
				if (!oData || typeof oData !== "object") {
					if (oData !== null) {
						invalidSegment(sSegment);
					}
					oData = undefined;
					return false;
				}
				oData = oData[sSegment];
				if (oData === undefined) {
					invalidSegment(sSegment);
					return false;
				}
				return true;
			});
		}
		return oData;
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 */
	Cache.prototype.hasPendingChangesForPath = function (sPath) {
		return Object.keys(this.mPatchRequests).some(function (sRequestPath) {
			return isSubPath(sRequestPath, sPath);
		});
	};

	/**
	 * Registers the listener for the path.
	 *
	 * @param {string} sPath The path
	 * @param {object} [oListener] The listener
	 */
	Cache.prototype.registerChange = function (sPath, oListener) {
		this.addByPath(this.mChangeListeners, sPath, oListener);
	};

	/**
	 * Removes an item from the given map by path.
	 *
	 * @param {object} mMap
	 *   A map from path to a list of items
	 * @param {string} sPath
	 *   The path
	 * @param {object} oItem
	 *   The item
	 */
	Cache.prototype.removeByPath = function (mMap, sPath, oItem) {
		var aItems = mMap[sPath],
			iIndex;

		if (aItems) {
			iIndex = aItems.indexOf(oItem);
			if (iIndex >= 0) {
				if (aItems.length === 1) {
					delete mMap[sPath];
				} else {
					aItems.splice(iIndex, 1);
				}
			}
		}
	};

	/**
	 * Resets all pending changes below the given path.
	 *
	 * @param {string} [sPath]
	 *   The path
	 * @throws {Error}
	 *   If there is a change which has been sent to the server and for which there is no response
	 *   yet.
	 */
	Cache.prototype.resetChangesForPath = function (sPath) {
		Object.keys(this.mPatchRequests).forEach(function (sRequestPath) {
			var i, aPromises;

			if (isSubPath(sRequestPath, sPath)) {
				aPromises = this.mPatchRequests[sRequestPath];
				for (i = aPromises.length - 1; i >= 0; i--) {
					this.oRequestor.removePatch(aPromises[i]);
				}
				delete this.mPatchRequests[sRequestPath];
			}
		}, this);
	};

	/**
	 * Sets the active state of the cache. If the cache becomes inactive, all change listeners are
	 * deregistered. If it is inactive, all read requests will be rejected, even if they have been
	 * started while the cache still was active.
	 *
	 * @param {boolean} bActive
	 *   Whether the cache shell be active
	 */
	Cache.prototype.setActive = function (bActive) {
		this.bActive = bActive;
		if (!bActive) {
			this.mChangeListeners = {};
		}
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 */
	Cache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyPath
	 *   Path of the property to update, relative to the entity
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sEntityPath]
	 *   Path of the entity, relative to the cache
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	Cache.prototype.update = function (sGroupId, sPropertyPath, vValue, sEditUrl, sEntityPath) {
		var aPropertyPath = sPropertyPath.split("/"),
			that = this;

		return this.fetchValue(sGroupId, sEntityPath).then(function (oEntity) {
			var sFullPath = _Helper.buildPath(sEntityPath, sPropertyPath),
				vOldValue,
				oPatchPromise,
				sParkedGroup,
				sTransientGroup,
				oUpdateData = Cache.makeUpdateData(aPropertyPath, vValue);

			/*
			 * Synchronous callback to cancel the PATCH request so that it is really gone when
			 * resetChangesForPath has been called on the binding or model.
			 */
			function onCancel () {
				that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateCache(that.mChangeListeners, sEntityPath, oEntity,
					Cache.makeUpdateData(aPropertyPath, vOldValue));
			}

			if (!oEntity) {
				throw new Error("Cannot update '" + sPropertyPath + "': '" + sEntityPath
					+ "' does not exist");
			}
			sTransientGroup = oEntity["@$ui5.transient"];
			if (sTransientGroup) {
				if (sTransientGroup === true) {
					throw new Error("No 'update' allowed while waiting for server response");
				}
				if (sTransientGroup.indexOf("$parked.") === 0) {
					sParkedGroup = sTransientGroup;
					sTransientGroup = sTransientGroup.slice(8);
				}
				if (sTransientGroup !== sGroupId) {
					throw new Error("The entity will be created via group '" + sTransientGroup
						+ "'. Cannot patch via group '" + sGroupId + "'");
				}
			}
			// remember the old value
			vOldValue = aPropertyPath.reduce(function (oValue, sSegment) {
				return oValue && oValue[sSegment];
			}, oEntity);
			// write the changed value into the cache
			_Helper.updateCache(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sTransientGroup) {
				// When updating a transient entity, _Helper.updateCache has already updated the
				// POST request, because the request body is a reference into the cache.
				if (sParkedGroup) {
					oEntity["@$ui5.transient"] = sTransientGroup;
					that.oRequestor.relocate(sParkedGroup, oEntity, sTransientGroup);
				}
				return Promise.resolve({});
			}
			// send and register the PATCH request
			sEditUrl += Cache.buildQueryString(that.mQueryOptions, true);
			oPatchPromise = that.oRequestor.request("PATCH", sEditUrl, sGroupId,
				{"If-Match" : oEntity["@odata.etag"]}, oUpdateData, undefined, onCancel);
			that.addByPath(that.mPatchRequests, sFullPath, oPatchPromise);
			return oPatchPromise.then(function (oPatchResult) {
				that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// update the cache with the PATCH response
				_Helper.updateCache(that.mChangeListeners, sEntityPath, oEntity, oPatchResult);
				return oPatchResult;
			}, function (oError) {
				that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				throw oError;
			});
		});
	};

	//*********************************************************************************************
	// CollectionCache
	//*********************************************************************************************

	/**
	 * Creates a cache for a collection of entities that performs requests using the given
	 * requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 */
	function CollectionCache(oRequestor, sResourcePath, mQueryOptions) {
		Cache.apply(this, arguments);

		this.sContext = undefined;         // the "@odata.context" from the responses
		this.aElements = [];               // the available elements
		this.aElements.$count = undefined; // see setCount

		this.sResourcePath += this.sResourcePath.indexOf("?") >= 0 ? "&" : "?";
	}

	// make CollectionCache a Cache
	CollectionCache.prototype = Object.create(Cache.prototype);


	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back end request is sent.
	 *   If no back end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the requested data.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 */
	CollectionCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested, oListener) {
		var iIndex,
			oPromise,
			aSegments,
			that = this;

		if (sPath === "$count") {
			oPromise = _SyncPromise.all(this.aElements);
		} else if (sPath) {
			aSegments = sPath.split("/");
			iIndex = parseInt(aSegments.shift(), 10);
			oPromise = this.read(iIndex, 1, sGroupId, fnDataRequested);
		} else {
			oPromise = _SyncPromise.resolve();
		}
		return oPromise.then(function () {
			that.checkActive();
			// register afterwards to avoid that updateCache fires updates before the first response
			that.registerChange(sPath, oListener);
			return that.drillDown(that.aElements, sPath);
		});
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 */
	CollectionCache.prototype.hasPendingChangesForPath = function (sPath) {
		return !!(sPath === "" && this.aElements[-1] && this.aElements[-1]["@$ui5.transient"])
			|| Cache.prototype.hasPendingChangesForPath.call(this, sPath);
	};

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 *
	 * @param {number} iIndex
	 *   The start index of the range in model coordinates; the first row has index -1 or 0!
	 * @param {number} iLength
	 *   The length of the range
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the requests with
	 * @param {function} [fnDataRequested]
	 *   The function is called just before a back end request is sent.
	 *   If no back end request is needed, the function is not called.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>, enhanced
	 *   with a number property <code>$count</code> representing the element count on server-side;
	 *   <code>$count</code> may be <code>undefined</code>, but not <code>Infinity</code>). If an
	 *   HTTP request fails, the error from the _Requestor is returned and the requested range is
	 *   reset to <code>undefined</code>.
	 *
	 *   The promise is rejected if the cache is inactive (see @link {#setActive}) when the response
	 *   arrives.
	 * @throws {Error} If given index or length is less than 0
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	CollectionCache.prototype.read = function (iIndex, iLength, sGroupId, fnDataRequested) {
		var i,
			iEnd = iIndex + iLength,
			iGapStart = -1,
			iLowerBound = this.aElements[-1] ? -1 : 0,
			iStart = Math.max(iIndex, 0), // for Array#slice()
			that = this;

		if (iIndex < iLowerBound) {
			throw new Error("Illegal index " + iIndex + ", must be >= " + iLowerBound);
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		}

		iEnd = Math.min(iEnd, getCount(this.aElements));

		for (i = iIndex; i < iEnd; i++) {
			if (this.aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					requestElements(this, iGapStart, i, sGroupId, fnDataRequested);
					fnDataRequested = undefined;
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			requestElements(this, iGapStart, iEnd, sGroupId, fnDataRequested);
			fnDataRequested = undefined;
		}

		// Note: this.aElements[-1] cannot be a promise...
		return _SyncPromise.all(this.aElements.slice(iStart, iEnd)).then(function () {
			var oResult;

			that.checkActive();
			oResult = {
				"@odata.context" : that.sContext,
				value : that.aElements.slice(iStart, iEnd)
			};
			oResult.value.$count = that.aElements.$count;
			if (iIndex === -1) {
				oResult.value.unshift(that.aElements[-1]); // Note: returns new length!
			}
			return oResult;
		});
	};

	/**
	 * Resets all pending changes below the given path.
	 *
	 * @param {string} [sPath]
	 *   The path
	 * @throws {Error}
	 *   If there is a change which has been sent to the server and for which there is no response
	 *   yet.
	 */
	CollectionCache.prototype.resetChangesForPath = function (sPath) {
		var sTransientGroup;

		if (sPath === "" && this.aElements[-1]) {
			sTransientGroup = this.aElements[-1]["@$ui5.transient"];
			if (sTransientGroup) {
				this.oRequestor.removePost(sTransientGroup, this.aElements[-1]);
			}
		}
		Cache.prototype.resetChangesForPath.call(this, sPath);
	};

	//*********************************************************************************************
	// PropertyCache
	//*********************************************************************************************

	/**
	 * Creates a cache for a single property that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 */
	function PropertyCache(oRequestor, sResourcePath, mQueryOptions) {
		Cache.apply(this, arguments);

		this.oPromise = null;
	}

	// make PropertyCache a Cache
	PropertyCache.prototype = Object.create(Cache.prototype);

	/**
	 * Not supported.
	 *
	 * @throws {Error}
	 *   Deletion of a property is not supported.
	 */
	PropertyCache.prototype._delete = function () {
		throw new Error("Unsupported");
	};

	/**
	 * Not supported.
	 *
	 * @throws {Error}
	 *   Creation of a property is not supported.
	 */
	PropertyCache.prototype.create = function () {
		throw new Error("Unsupported");
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   ignored for property caches, should be empty
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back end request is sent.
	 *   If no back end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the element.
	 *
	 *   The promise is rejected if the cache is inactive (see @link {#setActive}) when the response
	 *   arrives.
	 */
	PropertyCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested, oListener) {
		var that = this;

		that.registerChange("", oListener);
		if (!this.oPromise) {
			this.oPromise = _SyncPromise.resolve(this.oRequestor.request("GET", this.sResourcePath,
				sGroupId, undefined, undefined, fnDataRequested));
		}
		return this.oPromise.then(function (oResult) {
			that.checkActive();
			return oResult.value;
		});
	};

	/**
	 * Not supported.
	 *
	 * @throws {Error}
	 *   Updating a single property is not supported.
	 */
	PropertyCache.prototype.update = function () {
		throw new Error("Unsupported");
	};

	//*********************************************************************************************
	// SingleCache
	//*********************************************************************************************

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may lead to
	 *   a request, {@link #read} may only read from the cache; otherwise {@link #post} throws an
	 *   error.
	 */
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bPost) {
		Cache.apply(this, arguments);

		this.bPost = bPost;
		this.bPosting = false;
		this.oPromise = null;
	}

	// make SingleCache a Cache
	SingleCache.prototype = Object.create(Cache.prototype);

	/**
	 * Returns a promise to be resolved with an OData object for a POST request with the given data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {object} [oData]
	 *   The data to be sent with the POST request
	 * @param {string} [sETag]
	 *   The ETag to be sent as "If-Match" header with the POST request.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST or another POST is still being processed.
	 */
	SingleCache.prototype.post = function (sGroupId, oData, sETag) {
		var that = this;

		if (!this.bPost) {
			throw new Error("POST request not allowed");
		}
		// We disallow parallel POSTs because they represent OData actions which must not be
		// canceled. However we cannot decide which POST has been processed last on the server, so
		// we cannot tell which response represents the final server state.
		if (this.bPosting) {
			throw new Error("Parallel POST requests not allowed");
		}
		this.oPromise = _SyncPromise.resolve(
			this.oRequestor
				.request("POST", this.sResourcePath, sGroupId, {"If-Match" : sETag}, oData)
				.then(function (oResult) {
					that.bPosting = false;
					return oResult;
				}, function (oError) {
					that.bPosting = false;
					throw oError;
				})
		);
		this.bPosting = true;
		return this.oPromise;
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back end request is sent.
	 *   If no back end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the element.
	 *
	 *   The promise is rejected if the cache is inactive (see @link {#setActive}) when the response
	 *   arrives.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet
	 */
	SingleCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested, oListener) {
		var that = this,
			sResourcePath = this.sResourcePath;

		this.registerChange(sPath, oListener);
		if (!this.oPromise) {
			if (this.bPost) {
				throw new Error("Cannot fetch a value before the POST request");
			}
			this.oPromise = _SyncPromise.resolve(this.oRequestor.request("GET", sResourcePath,
					sGroupId, undefined, undefined, fnDataRequested))
				.then(function (oResult) {
					Cache.computeCount(oResult);
					return oResult;
				});
		}
		return this.oPromise.then(function (oResult) {
			that.checkActive();
			if (oResult["$ui5.deleted"]) {
				throw new Error("Cannot read a deleted entity");
			}
			return that.drillDown(oResult, sPath);
		});
	};

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

	/**
	 * Builds a query string from the parameter map. Converts the known OData system query
	 * options, all other OData system query options are rejected; with
	 * <code>bDropSystemQueryOptions</code> they are dropped altogether.
	 *
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @returns {string}
	 *   The query string; it is empty if there are no options; it starts with "?" otherwise
	 * @example
	 * {
	 *		$expand : {
	 *			"SO_2_BP" : true,
	 *			"SO_2_SOITEM" : {
	 *				"$expand" : {
	 *					"SOITEM_2_PRODUCT" : {
	 *						"$apply" : "filter(Price gt 100)",
	 *						"$expand" : {
	 *							"PRODUCT_2_BP" : null,
	 *						},
	 *						"$select" : "CurrencyCode"
	 *					},
	 *					"SOITEM_2_SO" : null
	 *				}
	 *			}
	 *		},
	 *		"sap-client" : "003"
	 *	}
	 */
	Cache.buildQueryString = function (mQueryOptions, bDropSystemQueryOptions) {
		return _Helper.buildQuery(
			Cache.convertQueryOptions(mQueryOptions, bDropSystemQueryOptions));
	};

	/**
	 *  Converts the value for a "$expand" in mQueryParams.
	 *
	 *  @param {object} mExpandItems The expand items, a map from path to options
	 *  @returns {string} The resulting value for the query string
	 *  @throws {Error} If the expand items are not an object
	 */
	Cache.convertExpand = function (mExpandItems) {
		var aResult = [];

		if (!mExpandItems || typeof mExpandItems !== "object") {
			throw new Error("$expand must be a valid object");
		}

		Object.keys(mExpandItems).forEach(function (sExpandPath) {
			var vExpandOptions = mExpandItems[sExpandPath];

			if (vExpandOptions && typeof vExpandOptions === "object") {
				aResult.push(Cache.convertExpandOptions(sExpandPath, vExpandOptions));
			} else {
				aResult.push(sExpandPath);
			}
		});

		return aResult.join(",");
	};

	/**
	 * Converts the expand options.
	 *
	 * @param {string} sExpandPath The expand path
	 * @param {boolean|object} vExpandOptions
	 *   The options; either a map or simply <code>true</code>
	 * @returns {string} The resulting string for the OData query in the form "path" (if no
	 *   options) or "path($option1=foo;$option2=bar)"
	 */
	Cache.convertExpandOptions = function (sExpandPath, vExpandOptions) {
		var aExpandOptions = [];

		convertSystemQueryOptions(vExpandOptions, function (sOptionName, vOptionValue) {
			aExpandOptions.push(sOptionName + '=' + vOptionValue);
		});
		return aExpandOptions.length ? sExpandPath + "(" + aExpandOptions.join(";") + ")"
			: sExpandPath;
	};

	/**
	 * Converts the query options. All known OData system query options are converted to
	 * strings, so that the result can be used for _Helper.buildQuery; with
	 * <code>bDropSystemQueryOptions</code> they are dropped altogether.
	 *
	 * @param {object} mQueryOptions The query options
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @returns {object} The converted query options
	 */
	Cache.convertQueryOptions = function (mQueryOptions, bDropSystemQueryOptions) {
		var mConvertedQueryOptions = {};

		if (!mQueryOptions) {
			return undefined;
		}
		convertSystemQueryOptions(mQueryOptions, function (sKey, vValue) {
			mConvertedQueryOptions[sKey] = vValue;
		}, bDropSystemQueryOptions);
		return mConvertedQueryOptions;
	};

	/**
	 * Creates a cache for a collection of entities that performs requests using the given
	 * requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string<br>
	 *   Example: Products
	 * @param {object} mQueryOptions
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 */
	Cache.create = function (oRequestor, sResourcePath, mQueryOptions) {
		return new CollectionCache(oRequestor, sResourcePath, mQueryOptions);
	};

	/**
	 * Creates a cache for a single property that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string<br>
	 *   Example: Products
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 */
	Cache.createProperty = function (oRequestor, sResourcePath, mQueryOptions) {
		return new PropertyCache(oRequestor, sResourcePath, mQueryOptions);
	};

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string<br>
	 *   Example: Products
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string, the value in this pair has to
	 *   be a string or an array of strings; if it is an array, the resulting query string
	 *   repeats the key for each array value.
	 *   Examples:
	 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
	 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may
	 *   lead to a request, {@link #read} may only read from the cache; otherwise {@link #post}
	 *   throws an error.
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 */
	Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bPost) {
		return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bPost);
	};

	/**
	 * Processes the result received from the server. All arrays are annotated by their length;
	 * influenced by the annotations "@odata.count" and "@odata.nextLink".
	 *
	 * @param {object} oResult The result
	 */
	Cache.computeCount = function (oResult) {
		Object.keys(oResult).forEach(function (sKey) {
			var sCount,
				vValue = oResult[sKey];

			if (Array.isArray(vValue)) {
				vValue.$count = undefined; // see setCount
				sCount = oResult[sKey + "@odata.count"];
				// Note: ignore change listeners, because any change listener that is already
				// registered, is still waiting for its value and gets it via fetchValue
				if (sCount) {
					setCount({}, "", vValue, sCount);
				} else if (!oResult[sKey + "@odata.nextLink"]) {
					// Note: This relies on the fact that $skip/$top is not used on nested lists.
					setCount({}, "", vValue, vValue.length);
				}
				vValue.forEach(Cache.computeCount);
			} else if (vValue && typeof vValue === "object") {
				Cache.computeCount(vValue);
			}
		});
	};

	/**
	 * Makes an object that has the given value exactly at the given property path allowing to use
	 * the result in _Helper.updateCache().
	 *
	 * Examples:
	 * <ul>
	 * <li>["Age"], 42 -> {Age: 42}
	 * <li>["Address", "City"], "Walldorf" -> {Address: {City: "Walldorf"}}
	 * </ul>
	 *
	 * @param {string[]} aPropertyPath
	 *   The property path split into an array of segments
	 * @param {any} vValue
	 *   The property value
	 * @returns {object}
	 *   The resulting object
	 */
	Cache.makeUpdateData = function (aPropertyPath, vValue) {
		return aPropertyPath.reduceRight(function (vValue0, sSegment) {
			var oResult = {};
			oResult[sSegment] = vValue0;
			return oResult;
		}, vValue);
	};

	return Cache;
}, /* bExport= */false);
