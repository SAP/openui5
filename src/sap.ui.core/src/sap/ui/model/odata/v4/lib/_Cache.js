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

	var rPropertyNameOfSegment = /^[^-\d(][^(]*/, // Matches the property name of a segment
		// Matches two cases:  segment with predicate or simply predicate:
		//   EMPLOYEE(ID='42') -> aMatches[1] === "EMPLOYEE", aMatches[2] === "(ID='42')"
		//   (ID='42') ->  aMatches[1] === "",  aMatches[2] === "(ID='42')"
		rSegmentWithPredicate = /^([^(]*)(\(.*\))$/;

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
	 * Requests the elements in the given range and places them into the aElements list. Calculates
	 * the key predicates for all entities in the result before the promise is resolved. While the
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
		var sDelimiter = oCache.sQueryString ? "&" : "?",
			iExpectedLength = iEnd - iStart,
			oPromise,
			sResourcePath = oCache.sResourcePath + oCache.sQueryString + sDelimiter
				+ "$skip=" + iStart + "&$top=" + iExpectedLength;

		oPromise = Promise.all([
			oCache.oRequestor.request("GET", sResourcePath, sGroupId, undefined, undefined,
				fnDataRequested),
			oCache.fetchTypes()
		]).then(function (aResult) {
			var iCount,
				sCount,
				oElement,
				i,
				sPredicate,
				oResult = aResult[0],
				iResultLength = oResult.value.length;

			Cache.computeCount(oResult);
			oCache.sContext = oResult["@odata.context"];
			sCount = oResult["@odata.count"];
			if (sCount) {
				oCache.iLimit = parseInt(sCount, 10);
				setCount(oCache.mChangeListeners, "", oCache.aElements, oCache.iLimit);
			}
			for (i = 0; i < iResultLength; i++) {
				oElement = oResult.value[i];
				oCache.aElements[iStart + i] = oElement;
				oCache.calculateKeyPredicates(oElement, aResult[1]);
				sPredicate = oElement["@$ui5.predicate"];
				if (sPredicate) {
					oCache.aElements.$byPredicate[sPredicate] = oElement;
				}
			}
			if (iResultLength < iExpectedLength) { // a short read
					iCount = Math.min(getCount(oCache.aElements), iStart + iResultLength);
					oCache.aElements.length = iCount;
					// If the server did not send a count, the calculated count is greater than 0
					// and the element before has not been read yet, we do not know the count:
					// The element might or might not exist.
					if (!sCount && iCount > 0 && !oCache.aElements[iCount - 1]) {
						iCount = undefined;
					}
				setCount(oCache.mChangeListeners, "", oCache.aElements, iCount);
				oCache.iLimit = iCount;
			}
		})["catch"](function (oError) {
			fill(oCache.aElements, undefined, iStart, iEnd);
			throw oError;
		});

		oCache.bSentReadRequest = true;
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 */
	function Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect) {
		this.bActive = true;
		this.mChangeListeners = {}; // map from path to an array of change listeners
		this.mPatchRequests = {}; // map from path to an array of (PATCH) promises
		this.mPostRequests = {}; // map from path to an array of entity data (POST bodies)
		this.oRequestor = oRequestor;
		this.bSortExpandSelect = bSortExpandSelect;
		this.sResourcePath = sResourcePath;
		this.bSentReadRequest = false;
		this.oTypePromise = undefined;
		this.setQueryOptions(mQueryOptions);
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
	 *   entity and the entity list are passed as parameter
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
			sEditUrl += that.oRequestor.buildQueryString(that.sResourcePath, that.mQueryOptions,
				true);
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
							if (oEntity["@$ui5.predicate"]) {
								delete vCacheData.$byPredicate[oEntity["@$ui5.predicate"]];
							}
							vCacheData.splice(vDeleteProperty, 1);
						}
						addToCount(that.mChangeListeners, sParentPath, vCacheData, -1);
						that.iLimit -= 1;
						fnCallback(Number(vDeleteProperty), vCacheData);
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
			} else if (mMap[sPath].indexOf(oItem) < 0) {
				mMap[sPath].push(oItem);
			}
		}
	};

	/**
	 * Recursively calculates the key predicates for all entities in the result.
	 *
	 * @param {object} oRootInstance A single top-level instance
	 * @param {object} mTypeForPath A map from path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 */
	Cache.prototype.calculateKeyPredicates = function (oRootInstance, mTypeForPath) {
		var oRequestor = this.oRequestor;

		/**
		 * Adds predicates to all entities in the given collection and creates the map $byPredicate
		 * from predicate to entity.
		 *
		 * @param {object[]} aInstances The collection
		 * @param {string} sPath The path of the collection in mTypeForPath
		 */
		function visitArray(aInstances, sPath) {
			var i, oInstance, sPredicate;

			aInstances.$byPredicate = {};
			for (i = 0; i < aInstances.length; i++) {
				oInstance = aInstances[i];
				visitInstance(oInstance, sPath);
				sPredicate = oInstance["@$ui5.predicate"];
				if (sPredicate) {
					aInstances.$byPredicate[sPredicate] = oInstance;
				}
			}
		}

		/**
		 * Adds a predicate to the given instance if it is an entity.
		 *
		 * @param {object} oInstance The instance
		 * @param {string} sPath The path of the instance in mTypeForPath
		 */
		function visitInstance(oInstance, sPath) {
			var oType = mTypeForPath[sPath];

			if (oType) { // oType is only defined when at an entity
				oInstance["@$ui5.predicate"] = oRequestor.getKeyPredicate(oType, oInstance);
			}

			Object.keys(oInstance).forEach(function (sProperty) {
				var vPropertyValue = oInstance[sProperty],
					sPropertyPath = sPath + "/" + sProperty;

				if (Array.isArray(vPropertyValue)) {
					visitArray(vPropertyValue, sPropertyPath);
				} else if (vPropertyValue && typeof vPropertyValue === "object") {
					visitInstance(vPropertyValue, sPropertyPath);
				}
			});
		}

		visitInstance(oRootInstance, this.sResourcePath);
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
	 * group (for SubmitMode.API) or parked (for SubmitMode.Auto or SubmitMode.Direct). Parked POST
	 * requests are repeated with the next update of the entity data.
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
		var aCollection, that = this;

		// Clean-up when the create has been canceled.
		function cleanUp() {
			that.removeByPath(that.mPostRequests, sPath, oEntityData);
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
				sPostPath += that.oRequestor.buildQueryString(that.sResourcePath,
					that.mQueryOptions, true);
				that.addByPath(that.mPostRequests, sPath, oEntityData);
				return that.oRequestor.request("POST", sPostPath, sPostGroupId, null, oEntityData,
						setCreatePending, cleanUp)
					.then(function (oResult) {
						delete oEntityData["@$ui5.transient"];
						// now the server has one more element
						addToCount(that.mChangeListeners, sPath, aCollection, 1);
						that.removeByPath(that.mPostRequests, sPath, oEntityData);
						// update the cache with the POST response
						_Helper.updateCacheAfterPost(that.mChangeListeners,
							_Helper.buildPath(sPath, "-1"), oEntityData, oResult,
							_Helper.getSelectForPath(that.mQueryOptions, sPath));
						// determine and save the key predicate
						that.fetchTypeFor(sPath).then(function (oType) {
							oEntityData["@$ui5.predicate"]
								= that.oRequestor.getKeyPredicate(oType, oEntityData);
						});
					}, function (oError) {
						if (oError.canceled) {
							// for cancellation no error is reported via fnErrorCallback
							throw oError;
						}
						if (fnErrorCallback) {
							fnErrorCallback(oError);
						}
						return request(that.oRequestor.getGroupSubmitMode(sPostGroupId) === "API" ?
							sPostGroupId : "$parked." + sPostGroupId);
				});
			});
		}

		// clone data to avoid modifications outside the cache
		oEntityData = oEntityData ? JSON.parse(JSON.stringify(oEntityData)) : {};

		aCollection = this.fetchValue("$cached", sPath).getResult();
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
					+ "' does not reference a collection");
		}
		aCollection[-1] = oEntityData;

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
	 * leads into void. Paths may contain key predicates like "TEAM_2_EMPLOYEES('42')/Name". The
	 * initial segment in a collection cache may even start with a key predicate, for example a path
	 * could be "('42')/Name".
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
			return undefined;
		}

		// Determine the implicit value if the value is missing in the cache. Report an invalid
		// segment if there is no implicit value.
		function missingValue(oValue, sSegment, iPathLength) {
			var sPropertyPath = that.sResourcePath,
				sPropertyType,
				sReadLink,
				sServiceUrl;

			if (sPath[0] !== '(') {
				sPropertyPath += "/";
			}
			sPropertyPath += sPath.split("/").slice(0, iPathLength).join("/");
			sPropertyType = that.oRequestor.fetchTypeForPath(sPropertyPath, true).getResult();
			if (sPropertyType === "Edm.Stream") {
				sReadLink = oValue[sSegment + "@odata.mediaReadLink"];
				sServiceUrl = that.oRequestor.getServiceUrl();
				if (sReadLink) {
					return _Helper.makeAbsolute(sReadLink, sServiceUrl);
				}
				return sServiceUrl + sPropertyPath;
			}
			return invalidSegment(sSegment);
		}

		if (!sPath) {
			return oData;
		}
		return sPath.split("/").reduce(function (vValue, sSegment, i) {
			var aMatches, oParentValue;

			if (sSegment === "$count") {
				return Array.isArray(vValue) ? vValue.$count : invalidSegment(sSegment);
			}
			if (vValue === undefined || vValue === null) {
				// already beyond the valid data: an unresolved navigation property or a property of
				// a complex type which is null
				return undefined;
			}
			if (typeof vValue !== "object") {
				return invalidSegment(sSegment);
			}
			oParentValue = vValue;
			aMatches = rSegmentWithPredicate.exec(sSegment);
			if (aMatches) {
				if (aMatches[1]) { // e.g. "TEAM_2_EMPLOYEES('42')
					vValue = vValue[aMatches[1]]; // there is a navigation property, follow it
				}
				if (vValue) { // ensure that we do not fail on a missing navigation property
					vValue = vValue.$byPredicate[aMatches[2]]; // search the key predicate
				}
			} else {
				vValue = vValue[sSegment];
			}
			return vValue === undefined ? missingValue(oParentValue, sSegment, i + 1) : vValue;
		}, oData);
	};

	/**
	 * Fetches the type of the expanded entity matching the given path.
	 * @param {string} sPath
	 *   A relative path within the cache, which may contain key predicates and/or indexes.
	 * @returns {SyncPromise}
	 *   A promise that is resolved with the entity type for that path if it points to an expanded
	 *   entity and <code>undefined</code> otherwise
	 */
	Cache.prototype.fetchTypeFor = function (sPath) {
		var aSegments = [this.sResourcePath];

		return this.fetchTypes().then(function (mTypeForPath) {
			sPath.split("/").forEach(function (sSegment) {
				var aMatches = rPropertyNameOfSegment.exec(sSegment);
				if (aMatches) {
					aSegments.push(aMatches[0]);
				}
			});
			return mTypeForPath[aSegments.join("/")];
		});
	};

	/**
	 * Fetches the type from the metadata for the root entity plus all types for $expand and puts
	 * them into a map from type to path. Only (entity) types having a list of key properties
	 * are remembered.
	 *
	 * @returns {SyncPromise}
	 *   A promise that is resolved with a map from resource path + entity path to the type
	 */
	Cache.prototype.fetchTypes = function () {
		var aPromises, mTypeForPath, that = this;

		/*
		 * Recursively calls fetchType for all (sub)paths in $expand.
		 * @param {string} sBasePath The resource path + entity path
		 * @param {object} mQueryOptions The corresponding query options
		 */
		function fetchExpandedTypes(sBasePath, mQueryOptions) {
			if (mQueryOptions && mQueryOptions.$expand) {
				Object.keys(mQueryOptions.$expand).forEach(function (sNavigationPath) {
					var sPath = sBasePath;

					sNavigationPath.split("/").forEach(function (sSegment) {
						sPath += "/" + sSegment;
						fetchType(sPath);
					});
					fetchExpandedTypes(sPath, mQueryOptions.$expand[sNavigationPath]);
				});
			}
		}

		/*
		 * Fetches the type for the given path, adds the promise to aPromises and puts the type
		 * into mTypeForPath if it has a list of key properties.
		 * @param {string} sPath The resource path + navigation path (which may lead to an entity
		 *   or complex type)
		 */
		function fetchType(sPath) {
			aPromises.push(that.oRequestor.fetchTypeForPath(sPath).then(function (oType) {
				if (oType.$Key) {
					mTypeForPath[sPath] = oType;
				}
			}));
		}

		if (!this.oTypePromise) {
			aPromises = [];
			mTypeForPath = {};
			fetchType(this.sResourcePath);
			fetchExpandedTypes(this.sResourcePath, this.mQueryOptions);
			this.oTypePromise = Promise.all(aPromises).then(function () {
				return mTypeForPath;
			});
		}
		return this.oTypePromise;
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
		}) || Object.keys(this.mPostRequests).some(function (sRequestPath) {
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
		var that = this;

		Object.keys(this.mPatchRequests).forEach(function (sRequestPath) {
			var i, aPromises;

			if (isSubPath(sRequestPath, sPath)) {
				aPromises = that.mPatchRequests[sRequestPath];
				for (i = aPromises.length - 1; i >= 0; i--) {
					that.oRequestor.removePatch(aPromises[i]);
				}
				delete that.mPatchRequests[sRequestPath];
			}
		});

		Object.keys(this.mPostRequests).forEach(function (sRequestPath) {
			var aEntities, i, sTransientGroup;

			if (isSubPath(sRequestPath, sPath)) {
				aEntities = that.mPostRequests[sRequestPath];
				for (i = aEntities.length - 1; i >= 0; i--) {
					sTransientGroup = aEntities[i]["@$ui5.transient"];
					if (sTransientGroup) {
						that.oRequestor.removePost(sTransientGroup, aEntities[i]);
					}
				}
				delete that.mPostRequests[sRequestPath];
			}
		});
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
	 * Updates query options of the cache which has not yet sent a read request with the given
	 * options.
	 *
	 * @param {object} mQueryOptions
	 *   The new query options
	 * @throws {Error} If the cache has already sent a read request
	 */
	Cache.prototype.setQueryOptions = function (mQueryOptions) {
		if (this.bSentReadRequest) {
			throw new Error("Cannot set query options: Cache has already sent a read request");
		}

		this.mQueryOptions = mQueryOptions;
		// sResourcePath is only used for metadata access, it does not contribute to the result
		this.sQueryString = this.oRequestor.buildQueryString(this.sResourcePath, mQueryOptions,
			false, this.bSortExpandSelect);
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 */
	Cache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath + this.sQueryString;
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
	 * @param {function} fnErrorCallback
	 *   A function which is called with an Error object each time a PATCH request fails
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sEntityPath]
	 *   Path of the entity, relative to the cache
	 * @param {string} [sUnitOrCurrencyPath]
	 *   Path of the unit or currency for the property, relative to the entity
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	Cache.prototype.update = function (sGroupId, sPropertyPath, vValue, fnErrorCallback, sEditUrl,
			sEntityPath, sUnitOrCurrencyPath) {
		var aPropertyPath = sPropertyPath.split("/"),
			aUnitOrCurrencyPath,
			that = this;

		return this.fetchValue(sGroupId, sEntityPath).then(function (oEntity) {
			var sFullPath = _Helper.buildPath(sEntityPath, sPropertyPath),
				vOldValue,
				oPatchPromise,
				sParkedGroup,
				sTransientGroup,
				vUnitOrCurrencyValue,
				oUpdateData = Cache.makeUpdateData(aPropertyPath, vValue);

			function cacheValue(aPath) {
				return aPath.reduce(function (oValue, sSegment) {
					return oValue && oValue[sSegment];
				}, oEntity);
			}

			/*
			 * Synchronous callback to cancel the PATCH request so that it is really gone when
			 * resetChangesForPath has been called on the binding or model.
			 */
			function onCancel() {
				that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateCache(that.mChangeListeners, sEntityPath, oEntity,
					Cache.makeUpdateData(aPropertyPath, vOldValue));
			}

			function patch() {
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
					if (!oError.canceled) {
						fnErrorCallback(oError);
						if (that.oRequestor.getGroupSubmitMode(sGroupId) === "API") {
							return patch();
						}
					}
					throw oError;
				});
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
			vOldValue = cacheValue(aPropertyPath);
			// write the changed value into the cache
			_Helper.updateCache(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sUnitOrCurrencyPath) {
				aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
				vUnitOrCurrencyValue = cacheValue(aUnitOrCurrencyPath);
				if (vUnitOrCurrencyValue === undefined) {
					jQuery.sap.log.debug("Missing value for unit of measure "
							+ _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath)
							+ " when updating "
							+ sFullPath,
						that.toString(), "sap.ui.model.odata.v4.lib._Cache");
				} else {
					jQuery.extend(true, oUpdateData,
						Cache.makeUpdateData(aUnitOrCurrencyPath, vUnitOrCurrencyValue));
				}
			}
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
			sEditUrl += that.oRequestor.buildQueryString(that.sResourcePath, that.mQueryOptions,
				true);
			return patch();
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 */
	function CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect) {
		Cache.apply(this, arguments);

		this.sContext = undefined;         // the "@odata.context" from the responses
		this.aElements = [];               // the available elements
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // see setCount
		this.iLimit = Infinity;            // the upper limit for the count (for the case that the
									       // exact value is unknown)
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
		var that = this;

		// wait for all reads to be finished, this is essential for $count and for finding the index
		// of a key predicate
		return _SyncPromise.all(this.aElements).then(function () {
			that.checkActive();
			// register afterwards to avoid that updateCache fires updates before the first response
			that.registerChange(sPath, oListener);
			return that.drillDown(that.aElements, sPath);
		});
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
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
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

		iEnd = Math.min(iEnd, this.iLimit);

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
		Cache.call(this, oRequestor, sResourcePath, mQueryOptions);

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
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 */
	PropertyCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested, oListener) {
		var that = this;

		that.registerChange("", oListener);
		if (!this.oPromise) {
			this.oPromise = _SyncPromise.resolve(this.oRequestor.request("GET",
				this.sResourcePath + this.sQueryString, sGroupId, undefined, undefined,
				fnDataRequested));
			this.bSentReadRequest = true;
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may lead to
	 *   a request, {@link #read} may only read from the cache; otherwise {@link #post} throws an
	 *   error.
	 */
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bPost) {
		Cache.apply(this, arguments);

		this.bPost = bPost;
		this.bPosting = false;
		this.oPromise = null;
	}

	// make SingleCache a Cache
	SingleCache.prototype = Object.create(Cache.prototype);

	/**
	 * Returns a promise to be resolved with an OData object for the requested data. Calculates
	 * the key predicates for all entities in the result before the promise is resolved.
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
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet
	 */
	SingleCache.prototype.fetchValue = function (sGroupId, sPath, fnDataRequested, oListener) {
		var sResourcePath = this.sResourcePath + this.sQueryString,
			that = this;

		this.registerChange(sPath, oListener);
		if (!this.oPromise) {
			if (this.bPost) {
				throw new Error("Cannot fetch a value before the POST request");
			}
			this.oPromise = _SyncPromise.all([
				this.oRequestor.request("GET", sResourcePath, sGroupId, undefined, undefined,
					fnDataRequested),
				this.fetchTypes()
			]).then(function (aResult) {
				that.calculateKeyPredicates(aResult[0], aResult[1]);
				Cache.computeCount(aResult[0]);
				return aResult[0];
			});
			this.bSentReadRequest = true;
		}
		return this.oPromise.then(function (oResult) {
			that.checkActive();
			if (oResult["$ui5.deleted"]) {
				throw new Error("Cannot read a deleted entity");
			}
			return that.drillDown(oResult, sPath);
		});
	};

	/**
	 * Returns a promise to be resolved with an OData object for a POST request with the given data.
	 * Calculates the key predicates for all entities in the result before the promise is resolved.
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
				.request("POST", this.sResourcePath + this.sQueryString, sGroupId,
					{"If-Match" : sETag}, oData)
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

	//*********************************************************************************************
	// "static" functions
	//*********************************************************************************************

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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 */
	Cache.create = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect) {
		return new CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect);
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may
	 *   lead to a request, {@link #read} may only read from the cache; otherwise {@link #post}
	 *   throws an error.
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 */
	Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bPost) {
		return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bPost);
	};

	/**
	 * Processes the result received from the server. All arrays are annotated by their length;
	 * influenced by the annotations "@odata.count" and "@odata.nextLink".
	 *
	 * @param {object} oResult The result
	 */
	Cache.computeCount = function (oResult) {
		if (oResult && typeof oResult === "object") {
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
				} else {
					Cache.computeCount(vValue);
				}
			});
		}
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
