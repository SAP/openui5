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

	var Cache;

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
	function addByPath(mMap, sPath, oItem) {
		if (oItem) {
			if (!mMap[sPath]) {
				mMap[sPath] = [oItem];
			} else if (mMap[sPath].indexOf(oItem) >= 0) {
				return;
			} else {
				mMap[sPath].push(oItem);
			}
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
				case "$filter":
				case "$orderby":
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
	 * Creates an object that has the given value exactly at the given property path allowing to
	 * use the result in _Helper.updateCache().
	 * Examples:
	 * ["Age"], 42 -> {Age: 42}
	 * ["Address", "City"], "Walldorf" -> {Address: {City: "Walldorf"}}
	 *
	 * @param {string[]} aPropertyPath The property path split into an array of segments
	 * @param {any} vValue The property value
	 * @returns {object} The resulting object
	 */
	function createUpdateData(aPropertyPath, vValue) {
		return aPropertyPath.reduceRight(function (vValue0, sSegment) {
			var oResult = {};
			oResult[sSegment] = vValue0;
			return oResult;
		}, vValue);
	}

	/**
	 * Drills down into the given object according to <code>sPath</code>.
	 *
	 * @param {object} oResult
	 *   Some object
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} fnLog
	 *   A function logging a warning which takes the invalid segment as parameter
	 * @returns {object}
	 *   The child object according to <code>sPath</code>
	 */
	function drillDown(oResult, sPath, fnLog) {
		if (sPath) {
			sPath.split("/").every(function (sSegment) {
				if (!oResult || typeof oResult !== "object") {
					fnLog(sSegment);
					oResult = undefined;
					return false;
				}
				oResult = oResult[sSegment];
				if (oResult === undefined) {
					fnLog(sSegment);
					return false;
				}
				return true;
			});
		}
		return oResult;
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
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {object} mPatchRequests Map of PATCH requests
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 */
	function hasPendingChanges(mPatchRequests, sPath) {
		var sRequestPath;

		for (sRequestPath in mPatchRequests) {
			if (isSubPath(sRequestPath, sPath)) {
				return true;
			}
		}
		return false;
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
	 * Removes an item from the given map by path.
	 *
	 * @param {object} mMap
	 *   A map from path to a list of items
	 * @param {string} sPath
	 *   The path
	 * @param {object} oItem
	 *   The item
	 */
	function removeByPath(mMap, sPath, oItem) {
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
	}

	/**
	 * Removes all pending PATCH requests.
	 *
	 * @param {_Cache} oCache The cache
	 */
	function removePatchRequests(oCache) {
		var i,
			sPath,
			aPromises;

		for (sPath in oCache.mPatchRequests) {
			aPromises = oCache.mPatchRequests[sPath];
			for (i = 0; i < aPromises.length; i++) {
				oCache.oRequestor.removePatch(aPromises[i]);
			}
		}
	}

	/**
	 * Requests the elements in the given range and places them into the aElements list. While the
	 * request is running, all indexes in this range contain the Promise.
	 * A refresh cancels all pending requests. Their promises are rejected with an error that has a
	 * property <code>canceled</code> which is set to <code>true</code>.
	 *
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
	 *   The cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The position of the last element to request ($skip + $top)
	 * @param {string} sGroupId
	 *   The group ID
	 */
	function requestElements(oCache, iStart, iEnd, sGroupId) {
		var aElements = oCache.aElements,
			iExpectedLength = iEnd - iStart,
			oPromise,
			sResourcePath = oCache.sResourcePath + "$skip=" + iStart + "&$top=" + iExpectedLength;

		oPromise = oCache.oRequestor.request("GET", sResourcePath, sGroupId)
			.then(function (oResult) {
				var i, iResultLength = oResult.value.length, oError;

				if (aElements !== oCache.aElements) {
					oError = new Error("Refresh canceled pending request: "
						+ oCache.oRequestor.getServiceUrl() + sResourcePath);
					oError.canceled = true;
					throw oError;
				}
				oCache.sContext = oResult["@odata.context"];
				if (iResultLength < iExpectedLength) {
					oCache.iMaxElements = iStart + iResultLength;
					oCache.aElements.splice(oCache.iMaxElements, iExpectedLength - iResultLength);
				}
				for (i = 0; i < iResultLength; i++) {
					oCache.aElements[iStart + i] = oResult.value[i];
				}
			})["catch"](function (oError) {
				if (aElements === oCache.aElements) {
					fill(oCache.aElements, undefined, iStart, iEnd);
				}
				throw oError;
			});

		fill(oCache.aElements, oPromise, iStart, iEnd);
	}

	/**
	 * Reset all pending PATCH requests for the given <code>sPath</code>
	 *
	 * @param {_Cache} oCache The cache
	 * @param {string} sPath The path
	 */
	function resetChanges(oCache, sPath) {
		var i,
			sRequestPath,
			aPromises;

		for (sRequestPath in oCache.mPatchRequests) {
			if (isSubPath(sRequestPath, sPath)) {
				aPromises = oCache.mPatchRequests[sRequestPath];
				for (i = 0; i < aPromises.length; i++ ) {
					oCache.oRequestor.removePatch(aPromises[i]);
				}
				delete oCache.mPatchRequests[sRequestPath];
			}
		}
	}

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {object} oCache
	 *   The cache
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyPath
	 *   Name or path of the property to update relative to the edit URL
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} sPath
	 *   Relative path to drill-down into
	 * @param {object} oCacheData
	 *   The cache data for sPath
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	function update(oCache, sGroupId, sPropertyPath, vValue, sEditUrl, sPath, oCacheData) {
		var oBody, // the body for the PATCH request
			mHeaders, // the headers for the PATCH request
			vOldValue, // the old value of the property
			aPropertyPath = sPropertyPath.split("/"), // the property path as array of segments
			// the path that is updated; the promise is registered here
			sUpdatePath =
				_Helper.buildPath(sPath, oCache.bSingleProperty ? "value" : sPropertyPath),
			oUpdatePromise;

		if (!oCacheData) {
			throw new Error("Cannot update '" + sPropertyPath + "': '" + sPath
				+ "' does not exist");
		}
		sEditUrl += Cache.buildQueryString(oCache.mQueryOptions, true);
		mHeaders = {"If-Match" : oCacheData["@odata.etag"]};
		// create the PATCH request body
		oBody = createUpdateData(aPropertyPath, vValue);
		if (oCache.bSingleProperty) {
			// single property caches always have the attribute in "value"
			aPropertyPath = ["value"];
		}
		// remember the old value
		vOldValue = aPropertyPath.reduce(function (oValue, sSegment) {
			return oValue && oValue[sSegment];
		}, oCacheData);
		// write the changed value into the cache
		_Helper.updateCache(oCache.mChangeListeners, sPath, oCacheData,
			createUpdateData(aPropertyPath, vValue));
		// send and register the PATCH request
		oUpdatePromise = oCache.oRequestor.request("PATCH", sEditUrl, sGroupId, mHeaders, oBody);
		addByPath(oCache.mPatchRequests, sUpdatePath, oUpdatePromise);
		return oUpdatePromise.then(function (oPatchResult) {
			removeByPath(oCache.mPatchRequests, sUpdatePath, oUpdatePromise);
			// update the cache with the PATCH response
			_Helper.updateCache(oCache.mChangeListeners, sPath, oCacheData,
				oCache.bSingleProperty ? {value : oPatchResult[sPropertyPath]} : oPatchResult);
			return oPatchResult;
		}, function (oError) {
			removeByPath(oCache.mPatchRequests, sUpdatePath, oUpdatePromise);
			if (oError.canceled) {
				// write the previous value into the cache
				_Helper.updateCache(oCache.mChangeListeners, sPath, oCacheData,
					createUpdateData(aPropertyPath, vOldValue));
			}
			throw oError;
		});
	}

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
		var sQuery = Cache.buildQueryString(mQueryOptions);

		this.sContext = undefined;  // the "@odata.context" from the responses
		this.aElements = [];        // the available elements
		this.iMaxElements = -1;     // the max. number of elements if known, -1 otherwise
		this.mChangeListeners = {};
		this.mPatchRequests = {};
		this.mQueryOptions = mQueryOptions;
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath + sQuery + (sQuery.length ? "&" : "?");
	}

	/**
	 * Deregisters the given change listener. If no arguments are given, <i>all</i> change listeners
	 * are deregistered.
	 *
	 * @param {number} [iIndex]
	 *   The collection index
	 * @param {string} [sPath]
	 *   The path
	 * @param {object} [oListener]
	 *   The change listener
	 */
	CollectionCache.prototype.deregisterChange = function (iIndex, sPath, oListener) {
		if (arguments.length) {
			removeByPath(this.mChangeListeners, iIndex + "/" + sPath, oListener);
		} else {
			this.mChangeListeners = {};
		}
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 */
	CollectionCache.prototype.hasPendingChanges = function (sPath) {
		return hasPendingChanges(this.mPatchRequests, sPath);
	};

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 *
	 * @param {number} iIndex
	 *   The start index of the range; the first row has index 0
	 * @param {number} iLength
	 *   The length of the range
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the requests with
	 * @param {string} [sPath]
	 *   Relative path to drill-down into; <code>undefined</code> does not change the returned
	 *   OData response object, but <code>""</code> already drills down into the element at
	 *   <code>iIndex</code> (and requires <code>iLength === 1</code>)
	 * @param {function} [fnDataRequested]
	 *   The function is called directly after all back end requests have been triggered.
	 *   If no back end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> will be called with the new value if the property at that path is
	 *   modified via {@link #update} later.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>) or a single
	 *   value (in case of drill-down). If an HTTP request fails, the error from the _Requestor is
	 *   returned and the requested range is reset to undefined.
	 *
	 *   A {@link #refresh} cancels all pending requests. Their promises are rejected with an error
	 *   that has a property <code>canceled</code> which is set to <code>true</code>.
	 * @throws {Error} If given index or length is less than 0
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	CollectionCache.prototype.read = function (iIndex, iLength, sGroupId, sPath, fnDataRequested,
			oListener) {
		var i,
			iEnd = iIndex + iLength,
			iGapStart = -1,
			bIsDataRequested = false,
			that = this;

		if (iIndex < 0) {
			throw new Error("Illegal index " + iIndex + ", must be >= 0");
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		} else if (iLength !== 1 && sPath !== undefined) {
			throw new Error("Cannot drill-down for length " + iLength);
		}

		if (this.iMaxElements >= 0 && iEnd > this.iMaxElements) {
			iEnd = this.iMaxElements;
		}

		for (i = iIndex; i < iEnd; i++) {
			if (this.aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					requestElements(this, iGapStart, i, sGroupId);
					bIsDataRequested = true;
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			requestElements(this, iGapStart, iEnd, sGroupId);
			bIsDataRequested = true;
		}

		if (bIsDataRequested && fnDataRequested) {
			fnDataRequested();
		}

		return _SyncPromise.all(this.aElements.slice(iIndex, iEnd)).then(function () {
			var oResult;

			if (sPath !== undefined) {
				addByPath(that.mChangeListeners, iIndex + "/" + sPath, oListener);
				oResult = that.aElements[iIndex];
				return drillDown(oResult, sPath, function (sSegment) {
					jQuery.sap.log.error("Failed to drill-down into " + that.sResourcePath
						+ "$skip=" + iIndex + "&$top=1 via " + sPath
						+ ", invalid segment: " + sSegment,
						null, "sap.ui.model.odata.v4.lib._Cache");
				});
			}
			return {
				"@odata.context" : that.sContext,
				value : that.aElements.slice(iIndex, iEnd)
			};
		});
	};

	/**
	 * Clears the cache and cancels all pending requests from {@link #read} and {@link #update}.
	 */
	CollectionCache.prototype.refresh = function () {
		this.sContext = undefined;
		this.iMaxElements = -1;
		this.aElements = [];
		removePatchRequests(this);
	};

	/**
	 * Resets all pending changes below the given path.
	 *
	 * @param {string} [sPath]
	 *   The path
	 */
	CollectionCache.prototype.resetChanges = function (sPath) {
		resetChanges(this, sPath);
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 */
	CollectionCache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	CollectionCache.prototype.update = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
		var aSegments = sPath.split("/"),
			iIndex = parseInt(aSegments.shift(), 10);

		return this.read(iIndex, 1, sGroupId, aSegments.join("/"))
			.then(update.bind(null, this, sGroupId, sPropertyName, vValue, sEditUrl, sPath));
	};

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bSingleProperty]
	 *   Whether the cache is used to read a single property, not a single entity; automatic
	 *   unwrapping of <code>{value : "..."}</code> happens then
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may lead to
	 *   a request, {@link #read} may only read from the cache; otherwise {@link #post} throws an
	 *   error.
	 */
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bSingleProperty, bPost) {
		this.mChangeListeners = {};
		this.mPatchRequests = {};
		this.bPost = bPost;
		this.bPosting = false;
		this.oPromise = null;
		this.mQueryOptions = mQueryOptions;
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath + Cache.buildQueryString(mQueryOptions);
		this.bSingleProperty = bSingleProperty;
	}

	/**
	 * Deregisters the given change listener. If no arguments are given, <i>all</i> change listeners
	 * are deregistered.
	 *
	 * @param {string} [sPath]
	 *   The path
	 * @param {object} [oListener]
	 *   The change listener
	 */
	SingleCache.prototype.deregisterChange = function (sPath, oListener) {
		if (arguments.length) {
			removeByPath(this.mChangeListeners, this.bSingleProperty ? "value" : sPath, oListener);
		} else {
			this.mChangeListeners = {};
		}
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 */
	SingleCache.prototype.hasPendingChanges = function (sPath) {
		return hasPendingChanges(this.mPatchRequests, sPath);
	};

	/**
	 * Returns a promise to be resolved with an OData object for a POST request with the given data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {object} [oData]
	 *   The data to be sent with the POST request
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST or another POST is still being processed.
	 */
	SingleCache.prototype.post = function (sGroupId, oData) {
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
				this.oRequestor.request("POST", this.sResourcePath, sGroupId, undefined, oData)
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
	 * @param {function()} [fnDataRequested]
	 *   The function is called directly after the back end request has been triggered.
	 *   If no back end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {SyncPromise}
	 *   A promise to be resolved with the element.
	 *
	 *   A {@link #refresh} cancels a pending request. Its promise is rejected with an error that
	 *   has a property <code>canceled</code> which is set to <code>true</code>.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet
	 */
	SingleCache.prototype.read = function (sGroupId, sPath, fnDataRequested, oListener) {
		var that = this,
			oPromise,
			sResourcePath = this.sResourcePath;

		if (!this.oPromise) {
			if (this.bPost) {
				throw new Error("Read before a POST request");
			}
			oPromise = _SyncPromise.resolve(
				this.oRequestor.request("GET", sResourcePath, sGroupId).then(function (oResult) {
					var oError;

					if (that.oPromise !== oPromise) {
						oError = new Error("Refresh canceled pending request: "
							+ that);
						oError.canceled = true;
						throw oError;
					}
					return oResult;
				}));
			if (fnDataRequested) {
				fnDataRequested();
			}
			this.oPromise = oPromise;
		}
		return this.oPromise.then(function (oResult) {
			if (that.bSingleProperty) {
				// 204 No Content: map undefined to null
				oResult = oResult ? oResult.value : null;
			}
			addByPath(that.mChangeListeners, that.bSingleProperty ? "value" : sPath, oListener);
			if (sPath) {
				return drillDown(oResult, sPath, function (sSegment) {
					jQuery.sap.log.error("Failed to drill-down into " + sResourcePath + "/"
							+ sPath + ", invalid segment: " + sSegment, null,
						"sap.ui.model.odata.v4.lib._Cache");
				});
			}
			return oResult;
		});
	};

	/**
	 * Clears the cache and cancels all pending requests from {@link #read} and {@link #update}.
	 *
	 * @throws {Error}
	 *   If the cache is using POST requests
	 */
	SingleCache.prototype.refresh = function () {
		if (this.bPost) {
			throw new Error("Refresh not allowed when using POST");
		}
		this.oPromise = undefined;
		removePatchRequests(this);
	};

	/**
	 * Resets all pending changes below the given path.
	 * @param {string} [sPath]
	 *   The path
	 */
	SingleCache.prototype.resetChanges = function (sPath) {
		resetChanges(this, sPath);
	};

	/**
	 * Returns the single cache's URL.
	 *
	 * @returns {string} The URL
	 */
	SingleCache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	SingleCache.prototype.update = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
		return (this.bSingleProperty ? this.oPromise : this.read(sGroupId, sPath))
			.then(update.bind(null, this, sGroupId, sPropertyName, vValue, sEditUrl, sPath));
	};

	Cache = {
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
		buildQueryString : function (mQueryOptions, bDropSystemQueryOptions) {
			return _Helper.buildQuery(
				Cache.convertQueryOptions(mQueryOptions, bDropSystemQueryOptions));
		},

		/**
		 *  Converts the value for a "$expand" in mQueryParams.
		 *
		 *  @param {object} mExpandItems The expand items, a map from path to options
		 *  @returns {string} The resulting value for the query string
		 *  @throws {Error} If the expand items are not an object
		 */
		convertExpand : function (mExpandItems) {
			var aResult = [];

			if (!mExpandItems || typeof mExpandItems  !== "object") {
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
		},

		/**
		 * Converts the expand options.
		 *
		 * @param {string} sExpandPath The expand path
		 * @param {boolean|object} vExpandOptions
		 *   The options; either a map or simply <code>true</code>
		 * @returns {string} The resulting string for the OData query in the form "path" (if no
		 *   options) or "path($option1=foo;$option2=bar)"
		 */
		convertExpandOptions : function (sExpandPath, vExpandOptions) {
			var aExpandOptions = [];

			convertSystemQueryOptions(vExpandOptions, function (sOptionName, vOptionValue) {
				aExpandOptions.push(sOptionName + '=' + vOptionValue);
			});
			return aExpandOptions.length ? sExpandPath + "(" + aExpandOptions.join(";") + ")"
				: sExpandPath;
		},

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
		convertQueryOptions : function (mQueryOptions, bDropSystemQueryOptions) {
			var mConvertedQueryOptions = {};

			if (!mQueryOptions) {
				return undefined;
			}
			convertSystemQueryOptions(mQueryOptions, function (sKey, vValue) {
				mConvertedQueryOptions[sKey] = vValue;
			}, bDropSystemQueryOptions);
			return mConvertedQueryOptions;
		},

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
		create : function _create(oRequestor, sResourcePath, mQueryOptions) {
			return new CollectionCache(oRequestor, sResourcePath, mQueryOptions);
		},

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
		 * @param {boolean} [bSingleProperty]
		 *   Whether the cache is used to read a single property, not a single entity; automatic
		 *   unwrapping of <code>{value : "..."}</code> happens then
		 * @param {boolean} [bPost]
		 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may
		 *   lead to a request, {@link #read} may only read from the cache; otherwise {@link #post}
		 *   throws an error.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createSingle : function _createSingle(oRequestor, sResourcePath, mQueryOptions,
				bSingleProperty, bPost) {
			return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bSingleProperty,
				bPost);
		}
	};

	return Cache;
}, /* bExport= */false);
