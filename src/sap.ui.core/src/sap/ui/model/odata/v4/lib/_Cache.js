/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Cache
sap.ui.define([
	"./_GroupLock",
	"./_Helper",
	"./_Requestor",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/thirdparty/jquery"
], function (_GroupLock, _Helper, _Requestor, Log, SyncPromise, jQuery) {
	"use strict";

	var sMessagesAnnotation = "@com.sap.vocabularies.Common.v1.Messages",
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
		_Helper.updateExisting(mChangeListeners, sPath, aCollection, {$count : vCount});
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
	 *
	 * @private
	 */
	function Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect) {
		this.bActive = true;
		this.mChangeListeners = {}; // map from path to an array of change listeners
		this.sMetaPath = _Helper.getMetaPath("/" + sResourcePath);
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
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string} sEditUrl
	 *   The entity's edit URL
	 * @param {string} sPath
	 *   The entity's path within the cache
	 * @param {function} fnCallback
	 *   A function which is called after a transient entity has been deleted from the cache or
	 *   after the entity has been deleted from the server and from the cache; the index of the
	 *   entity and the entity list are passed as parameter
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise for the DELETE request
	 *
	 * @public
	 */
	Cache.prototype._delete = function (oGroupLock, sEditUrl, sPath, fnCallback) {
		var aSegments = sPath.split("/"),
			vDeleteProperty = aSegments.pop(),
			sParentPath = aSegments.join("/"),
			that = this;

		return this.fetchValue(_GroupLock.$cached, sParentPath).then(function (vCacheData) {
			var oEntity = vDeleteProperty
					? vCacheData[vDeleteProperty]
					: vCacheData, // deleting at root level
				mHeaders,
				sKeyPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"),
				sEntityPath = _Helper.buildPath(sParentPath,
					Array.isArray(vCacheData) ? sKeyPredicate : vDeleteProperty),
				sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient");

			if (sTransientGroup === true) {
				throw new Error("No 'delete' allowed while waiting for server response");
			}
			if (sTransientGroup) {
				oGroupLock.unlock();
				that.oRequestor.removePost(sTransientGroup, oEntity);
				return Promise.resolve();
			}
			if (oEntity["$ui5.deleting"]) {
				throw new Error("Must not delete twice: " + sEditUrl);
			}
			oEntity["$ui5.deleting"] = true;
			mHeaders = {"If-Match" : oEntity};
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return that.oRequestor.request("DELETE", sEditUrl, oGroupLock, mHeaders, undefined,
					undefined, undefined, undefined,
					_Helper.buildPath(that.sResourcePath, sEntityPath))
				.catch(function (oError) {
					if (oError.status !== 404) {
						delete oEntity["$ui5.deleting"];
						throw oError;
					} // else: map 404 to 200
				})
				.then(function () {
					var sPredicate;

					if (Array.isArray(vCacheData)) {
						if (vCacheData[vDeleteProperty] !== oEntity) {
							// oEntity might have moved due to parallel insert/delete
							vDeleteProperty = vCacheData.indexOf(oEntity);
						}
						if (vDeleteProperty === "-1") {
							delete vCacheData[-1];
						} else {
							sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate");
							if (sPredicate) {
								delete vCacheData.$byPredicate[sPredicate];
							}
							vCacheData.splice(vDeleteProperty, 1);
						}
						addToCount(that.mChangeListeners, sParentPath, vCacheData, -1);
						that.iLimit -= 1;
						fnCallback(Number(vDeleteProperty), vCacheData);
					} else {
						if (vDeleteProperty) {
							// set to null and notify listeners
							_Helper.updateExisting(that.mChangeListeners, sParentPath, vCacheData,
								Cache.makeUpdateData([vDeleteProperty], null));
						} else { // deleting at root level
							oEntity["$ui5.deleted"] = true;
						}
						fnCallback();
					}
					that.oRequestor.reportBoundMessages(that.sResourcePath, [], [sEntityPath]);
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
	 *
	 * @private
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
	 * Calculates the key predicate for the given entity.
	 *
	 * @param {object} oInstance
	 *   The instance for which to calculate the key predicate
	 * @param {object} mTypeForMetaPath
	 *   A map from meta path to the entity type (as delivered by {@link #fetchTypes})
	 * @param {string} sMetaPath
	 *   The meta path for the entity
	 *
	 * @private
	 */
	Cache.prototype.calculateKeyPredicate = function (oInstance, mTypeForMetaPath, sMetaPath) {
		var oType = mTypeForMetaPath[sMetaPath];

		if (oType && oType.$Key) {
			_Helper.setPrivateAnnotation(oInstance, "predicate",
				_Helper.getKeyPredicate(oInstance, sMetaPath, mTypeForMetaPath));
		}
	};

	/**
	 * Throws an error if the cache is not active.
	 *
	 * @private
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
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string|sap.ui.base.SyncPromise} vPostPath
	 *   The path for the POST request or a SyncPromise that resolves with that path
	 * @param {string} sPath
	 *   The entity's path within the cache
	 * @param {string} [oEntityData={}]
	 *   The initial entity data
	 * @param {function} fnCancelCallback
	 *   A function which is called after a transient entity has been canceled from the cache
	 * @param {function} fnErrorCallback
	 *   A function which is called with an Error object each time a POST request fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without data when the POST request has been successfully sent
	 *   and the entity has been marked as non-transient
	 *
	 * @public
	 */
	Cache.prototype.create = function (oGroupLock, vPostPath, sPath, oEntityData,
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
			_Helper.setPrivateAnnotation(oEntityData, "transient", true);
		}

		function request(sPostPath, oPostGroupLock) {
			var sPostGroupId = oPostGroupLock.getGroupId();

			// mark as transient (again)
			_Helper.setPrivateAnnotation(oEntityData, "transient", sPostGroupId);
			that.addByPath(that.mPostRequests, sPath, oEntityData);
			return SyncPromise.all([
				that.oRequestor.request("POST", sPostPath, oPostGroupLock, null, oEntityData,
					setCreatePending, cleanUp),
				that.fetchTypes()
			]).then(function (aResult) {
				var oResult = aResult[0];

				_Helper.deletePrivateAnnotation(oEntityData, "transient");
				// now the server has one more element
				addToCount(that.mChangeListeners, sPath, aCollection, 1);
				that.removeByPath(that.mPostRequests, sPath, oEntityData);
				that.visitResponse(oResult, aResult[1], false,
					_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sPath)), sPath + "/-1");
				// update the cache with the POST response
				_Helper.updateSelected(that.mChangeListeners,
					_Helper.buildPath(sPath, "-1"), oEntityData, oResult,
					_Helper.getSelectForPath(that.mQueryOptions, sPath));
			}, function (oError) {
				if (oError.canceled) {
					// for cancellation no error is reported via fnErrorCallback
					throw oError;
				}
				if (fnErrorCallback) {
					fnErrorCallback(oError);
				}
				return request(sPostPath, new _GroupLock(
					that.oRequestor.getGroupSubmitMode(sPostGroupId) === "API" ?
						sPostGroupId : "$parked." + sPostGroupId));
			});
		}

		// clone data to avoid modifications outside the cache
		oEntityData = jQuery.extend(true, {}, oEntityData);
		// remove any property starting with "@$ui5."
		oEntityData = _Requestor.cleanPayload(oEntityData);

		aCollection = this.fetchValue(_GroupLock.$cached, sPath).getResult();
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
					+ "' does not reference a collection");
		}
		aCollection[-1] = oEntityData;

		return SyncPromise.resolve(vPostPath).then(function (sPostPath) {
			sPostPath += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return request(sPostPath, oGroupLock);
		});
	};

	/**
	 * Deregisters the given change listener.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {object} oListener
	 *   The change listener
	 *
	 * @public
	 */
	Cache.prototype.deregisterChange = function (sPath, oListener) {
		this.removeByPath(this.mChangeListeners, sPath, oListener);
	};

	/**
	 * Drills down into the given object according to <code>sPath</code>. Logs an error if the path
	 * leads into void. Paths may contain key predicates like "TEAM_2_EMPLOYEES('42')/Name". The
	 * initial segment in a collection cache may even start with a key predicate, for example a path
	 * could be "('42')/Name". For properties that do not exist in transient entities, the default
	 * value or <code>null</code> is delivered.
	 *
	 * @param {object} oData
	 *   The result from a read or cache lookup
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the result matching to <code>sPath</code>
	 *
	 * @private
	 */
	Cache.prototype.drillDown = function (oData, sPath) {
		var oDataPromise = SyncPromise.resolve(oData),
			bTransient = false,
			that = this;

		function invalidSegment(sSegment) {
			Log.error("Failed to drill-down into " + sPath + ", invalid segment: " + sSegment,
				that.toString(), "sap.ui.model.odata.v4.lib._Cache");
			return undefined;
		}

		// Determine the implicit value if the value is missing in the cache. Report an invalid
		// segment if there is no implicit value.
		function missingValue(oValue, sSegment, iPathLength) {
			var sPropertyPath = "",
				sReadLink,
				sServiceUrl;

			if (sPath[0] !== '(') {
				sPropertyPath += "/";
			}
			sPropertyPath += sPath.split("/").slice(0, iPathLength).join("/");
			return that.oRequestor
				.fetchMetadata(that.sMetaPath + _Helper.getMetaPath(sPropertyPath))
				.then(function (oProperty) {
					if (!oProperty) {
						return invalidSegment(sSegment);
					}
					if (oProperty.$Type === "Edm.Stream") {
						sReadLink = oValue[sSegment + "@odata.mediaReadLink"];
						sServiceUrl = that.oRequestor.getServiceUrl();
						return sReadLink || sServiceUrl + that.sResourcePath + sPropertyPath;
					}
					if (!bTransient) {
						return invalidSegment(sSegment);
					}
					if (oProperty.$kind === "NavigationProperty") {
						return null;
					}
					if (!oProperty.$Type.startsWith("Edm.")) {
						return {};
					}
					if ("$DefaultValue" in oProperty) {
						return oProperty.$Type === "Edm.String"
							? oProperty.$DefaultValue
							: _Helper.parseLiteral(oProperty.$DefaultValue, oProperty.$Type,
								sPropertyPath);
					}
					return null;
				});
		}

		if (!sPath) {
			return oDataPromise;
		}
		return sPath.split("/").reduce(function (oPromise, sSegment, i) {
			return oPromise.then(function (vValue) {
				var aMatches, oParentValue;

				if (sSegment === "$count") {
					return Array.isArray(vValue) ? vValue.$count : invalidSegment(sSegment);
				}
				if (vValue === undefined || vValue === null) {
					// already beyond the valid data: an unresolved navigation property or a
					// property of a complex type which is null
					return undefined;
				}
				if (typeof vValue !== "object" || sSegment === "@$ui5._") {
					// Note: protect private namespace against read access just like any missing
					// object
					return invalidSegment(sSegment);
				}
				oParentValue = vValue;
				bTransient = bTransient || _Helper.getPrivateAnnotation(vValue, "transient");
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
				// missing advertisement is not an error
				return vValue === undefined && sSegment[0] !== "#"
					? missingValue(oParentValue, sSegment, i + 1)
					: vValue;
			});
		}, oDataPromise);
	};

	/**
	 * Fetches the type from the metadata for the root entity plus all types for $expand and puts
	 * them into a map from meta path to type. Checks the types' key properties and puts their types
	 * into the map, too, if they are complex. If a type has a
	 * "@com.sap.vocabularies.Common.v1.Messages" annotation for messages, the type is enriched by
	 * the property "@com.sap.vocabularies.Common.v1.Messages" containing the annotation object.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with a map from resource path + entity path to the type
	 *
	 * @private
	 */
	Cache.prototype.fetchTypes = function () {
		var aPromises, mTypeForMetaPath, that = this;

		/*
		 * Recursively calls fetchType for all (sub)paths in $expand.
		 * @param {string} sBaseMetaPath The resource meta path + entity path
		 * @param {object} [mQueryOptions] The corresponding query options
		 */
		function fetchExpandedTypes(sBaseMetaPath, mQueryOptions) {
			if (mQueryOptions && mQueryOptions.$expand) {
				Object.keys(mQueryOptions.$expand).forEach(function (sNavigationPath) {
					var sMetaPath = sBaseMetaPath;

					sNavigationPath.split("/").forEach(function (sSegment) {
						sMetaPath += "/" + sSegment;
						fetchType(sMetaPath);
					});
					fetchExpandedTypes(sMetaPath, mQueryOptions.$expand[sNavigationPath]);
				});
			}
		}

		/*
		 * Adds a promise to aPromises to fetch the type for the given path, put it into
		 * mTypeForMetaPath and recursively add the key properties' types if they are complex.
		 * @param {string} sMetaPath The meta path of the resource + navigation or key path (which
		 *   may lead to an entity or complex type or to <code>undefined</code>)
		 */
		function fetchType(sMetaPath) {
			aPromises.push(that.oRequestor.fetchTypeForPath(sMetaPath).then(function (oType) {
				var oMessageAnnotation = that.oRequestor
						.fetchMetadata(sMetaPath + "/" + sMessagesAnnotation).getResult();

				if (oMessageAnnotation) {
					oType = Object.create(oType);
					oType[sMessagesAnnotation] = oMessageAnnotation;
				}

				mTypeForMetaPath[sMetaPath] = oType;
				if (oType && oType.$Key) {
					oType.$Key.forEach(function (vKey) {
						var iIndexOfSlash, sKeyPath;

						if (typeof vKey !== "string") {
							sKeyPath = vKey[Object.keys(vKey)[0]];
							iIndexOfSlash = sKeyPath.lastIndexOf("/");
							if (iIndexOfSlash >= 0) {
								// drop the property name and fetch the type containing it
								fetchType(sMetaPath + "/" + sKeyPath.slice(0, iIndexOfSlash));
							}
						}
					});
				}
			}));
		}

		if (!this.oTypePromise) {
			aPromises = [];
			mTypeForMetaPath = {};
			fetchType(this.sMetaPath);
			if (this.bFetchOperationReturnType) {
				fetchType(this.sMetaPath + "/$Type");
			}
			fetchExpandedTypes(this.sMetaPath, this.mQueryOptions);
			this.oTypePromise = SyncPromise.all(aPromises).then(function () {
				return mTypeForMetaPath;
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
	 *
	 * @public
	 */
	Cache.prototype.hasPendingChangesForPath = function (sPath) {
		return Object.keys(this.mPatchRequests).some(function (sRequestPath) {
			return isSubPath(sRequestPath, sPath);
		}) || Object.keys(this.mPostRequests).some(function (sRequestPath) {
			return isSubPath(sRequestPath, sPath);
		});
	};

	/**
	 * Patches the cache at the given path with the given data.
	 *
	 * @param {string} sPath The path
	 * @param {object} oData The data to patch with
	 *
	 * @private
	 */
	Cache.prototype.patch = function (sPath, oData) {
		var that = this;

		this.fetchValue(_GroupLock.$cached, sPath).then(function (oCacheValue) {
			_Helper.updateExisting(that.mChangeListeners, sPath, oCacheValue, oData);
		});
	};

	/**
	 * Registers the listener for the path.
	 *
	 * @param {string} sPath The path
	 * @param {object} [oListener] The listener
	 *
	 * @private
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
	 *
	 * @private
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
	 *
	 * @public
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
					sTransientGroup = _Helper.getPrivateAnnotation(aEntities[i], "transient");
					that.oRequestor.removePost(sTransientGroup, aEntities[i]);
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
	 *
	 * @public
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
	 * @param {object} [mQueryOptions]
	 *   The new query options
	 * @throws {Error} If the cache has already sent a read request
	 *
	 * @public
	 */
	Cache.prototype.setQueryOptions = function (mQueryOptions) {
		if (this.bSentReadRequest) {
			throw new Error("Cannot set query options: Cache has already sent a read request");
		}

		this.mQueryOptions = mQueryOptions;
		this.sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false,
			this.bSortExpandSelect);
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 *
	 * @public
	 */
	Cache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath + this.sQueryString;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
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
	 *
	 * @public
	 */
	Cache.prototype.update = function (oGroupLock, sPropertyPath, vValue, fnErrorCallback, sEditUrl,
			sEntityPath, sUnitOrCurrencyPath) {
		var aPropertyPath = sPropertyPath.split("/"),
			aUnitOrCurrencyPath,
			that = this;

		return this.fetchValue(oGroupLock.getUnlockedCopy(), sEntityPath).then(function (oEntity) {
			var sFullPath = _Helper.buildPath(sEntityPath, sPropertyPath),
				sGroupId = oGroupLock.getGroupId(),
				vOldValue,
				oPatchPromise,
				sParkedGroup,
				sTransientGroup,
				sUnitOrCurrencyValue,
				oUpdateData = Cache.makeUpdateData(aPropertyPath, vValue);

			/*
			 * Synchronous callback to cancel the PATCH request so that it is really gone when
			 * resetChangesForPath has been called on the binding or model.
			 */
			function onCancel() {
				that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity,
					Cache.makeUpdateData(aPropertyPath, vOldValue));
			}

			function patch(oPatchGroupLock) {
				var oRequestLock;

				/*
				 * Synchronous callback called when the request is put on the wire. Locks the group
				 * so that further requests created via {@link ODataModel#submitBatch} wait until
				 * this request has returned and its response is applied to the cache.
				 */
				function onSubmit() {
					oRequestLock =  that.oRequestor.getModelInterface()
						.lockGroup(sGroupId, true, that);
				}

				oPatchPromise = that.oRequestor.request("PATCH", sEditUrl, oPatchGroupLock,
					{"If-Match" : oEntity}, oUpdateData, onSubmit, onCancel, undefined,
					_Helper.buildPath(that.sResourcePath, sEntityPath));
				that.addByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				return SyncPromise.all([
					oPatchPromise,
					that.fetchTypes()
				]).then(function (aResult) {
					var oPatchResult = aResult[0];

					that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
					// visit response to report the messages
					that.visitResponse(oPatchResult, aResult[1], false,
						_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sEntityPath)),
						sEntityPath
					);
					// update the cache with the PATCH response
					_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity,
						oPatchResult);
					return oPatchResult;
				}, function (oError) {
					that.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
					if (!oError.canceled) {
						fnErrorCallback(oError);
						if (that.oRequestor.getGroupSubmitMode(sGroupId) === "API") {
							oRequestLock.unlock();
							oRequestLock = undefined;
							return patch(oPatchGroupLock.getUnlockedCopy());
						}
					}
					throw oError;
				}).finally(function () {
					if (oRequestLock) {
						oRequestLock.unlock();
					}
				});
			}

			if (!oEntity) {
				throw new Error("Cannot update '" + sPropertyPath + "': '" + sEntityPath
					+ "' does not exist");
			}
			sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient");
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
			vOldValue = _Helper.drillDown(oEntity, aPropertyPath);
			// write the changed value into the cache
			_Helper.updateSelected(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sUnitOrCurrencyPath) {
				aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
				sUnitOrCurrencyPath = _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath);
				sUnitOrCurrencyValue
					= that.fetchValue(_GroupLock.$cached, sUnitOrCurrencyPath).getResult();
				if (sUnitOrCurrencyValue === undefined) {
					Log.debug("Missing value for unit of measure " + sUnitOrCurrencyPath
							+ " when updating " + sFullPath,
						that.toString(), "sap.ui.model.odata.v4.lib._Cache");
				} else {
					jQuery.extend(true,
						sTransientGroup ? oEntity : oUpdateData,
						Cache.makeUpdateData(aUnitOrCurrencyPath, sUnitOrCurrencyValue));
				}
			}
			if (sTransientGroup) {
				// When updating a transient entity, _Helper.updateSelected has already updated the
				// POST request, because the request body is a reference into the cache.
				if (sParkedGroup) {
					_Helper.setPrivateAnnotation(oEntity, "transient", sTransientGroup);
					that.oRequestor.relocate(sParkedGroup, oEntity, sTransientGroup);
				}
				oGroupLock.unlock();
				return Promise.resolve({});
			}
			// send and register the PATCH request
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return patch(oGroupLock);
		});
	};

	/**
	 * Processes the response from the server. All arrays are annotated by their length, influenced
	 * by the annotations "@odata.count" and "@odata.nextLink". Recursively calculates the key
	 * predicates for all entities in the result. Collects and reports OData messages via
	 * {@link sap.ui.model.odata.v4.lib._Requestor#reportBoundMessages}.
	 *
	 * @param {*} oRoot An OData response, arrays or simple values are wrapped into an object as
	 *   property "value"
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 * @param {boolean} [bWrapped] Whether the result is wrapped into an object as property "value"
	 * @param {string} [sRootMetaPath=this.sMetaPath] The meta path for <code>oRoot</code>
	 * @param {string} [sRootPath=""] Path to <code>oRoot</code>, relative to the cache; used to
	 *   compute the target property of messages; for operations with return context the
	 *   <code>sRootMetaPath</code> cannot be derived automatically via <code>sRootPath</code>
	 *
	 * @private
	 */
	Cache.prototype.visitResponse = function (oRoot, mTypeForMetaPath, bWrapped, sRootMetaPath,
			sRootPath) {
		var bHasMessages = false,
			aKeyPredicates,
			mPathToODataMessages = {},
			sRequestUrl = this.oRequestor.getServiceUrl() + this.sResourcePath,
			that = this;

		/*
		 * Adds the messages to mPathToODataMessages after adjusting the message longtext
		 * @param {object[]} aMessages The message list
		 * @param {string} sInstancePath The path of the instance in the cache
		 * @param {string} sContextUrl The context URL for message longtexts
		 */
		function addMessages(aMessages, sInstancePath, sContextUrl) {
			bHasMessages = true;
			if (aMessages && aMessages.length) {
				mPathToODataMessages[sInstancePath] = aMessages;
				aMessages.forEach(function (oMessage) {
					if (oMessage.longtextUrl) {
						oMessage.longtextUrl
							= _Helper.makeAbsolute(oMessage.longtextUrl, sContextUrl);
					}
				});
			}
		}

		/*
		 * Builds a new absolute context URL from the given absolute base URL and the URL from
		 * "@odata.context" (if there is one).
		 *
		 * @param {string} sBaseUrl The absolute base URL
		 * @param {string} [sContextUrl] The context URL (as read from "@odata.context")
		 * @returns {string} The resulting absolute context URL
		 */
		function buildContextUrl(sBaseUrl, sContextUrl) {
			return sContextUrl ? _Helper.makeAbsolute(sContextUrl, sBaseUrl) : sBaseUrl;
		}

		/*
		 * Calls visitInstance for all object entries of the given collection and creates the map
		 * $byPredicate from predicate to entity.
		 *
		 * @param {*[]} aInstances The collection
		 * @param {string} sMetaPath The meta path of the collection in mTypeForMetaPath
		 * @param {string} sCollectionPath The path of the collection
		 * @param {string} sContextUrl The context URL for message longtexts
		 */
		function visitArray(aInstances, sMetaPath, sCollectionPath, sContextUrl) {
			var mByPredicate = {}, i, vInstance, sPredicate;

			for (i = 0; i < aInstances.length; i++) {
				vInstance = aInstances[i];
				if (vInstance && typeof vInstance === "object") {
					visitInstance(vInstance, sMetaPath, sCollectionPath, sContextUrl, true);
					sPredicate = _Helper.getPrivateAnnotation(vInstance, "predicate");
					if (!sCollectionPath) {
						// remember the key predicates of the root entries to remove all messages
						// for entities that have been read
						aKeyPredicates.push(sPredicate);
					}
					if (sPredicate) {
						mByPredicate[sPredicate] = vInstance;
						aInstances.$byPredicate = mByPredicate;
					}
				}
			}
		}

		/*
		 * Recursively calculates the count for collection valued properties and calculates the key
		 * predicate for the given instance.
		 *
		 * @param {object} oInstance The instance
		 * @param {string} sMetaPath The meta path of the instance in mTypeForMetaPath
		 * @param {string} sInstancePath The path of the instance in the cache
		 * @param {string} sContextUrl The context URL for message longtexts
		 * @param {boolean} [bCollection=false]
		 *    Whether the instance is part of a collection and the predicate must be added to the
		 *    instance path
		 */
		function visitInstance(oInstance, sMetaPath, sInstancePath, sContextUrl, bCollection) {
			var oType = mTypeForMetaPath[sMetaPath],
				sMessageProperty = oType && oType[sMessagesAnnotation]
					&& oType[sMessagesAnnotation].$Path,
				aMessages;

			sContextUrl = buildContextUrl(sContextUrl, oInstance["@odata.context"]);
			that.calculateKeyPredicate(oInstance, mTypeForMetaPath, sMetaPath);
			if (bCollection) {
				sInstancePath += _Helper.getPrivateAnnotation(oInstance, "predicate");
			}
			if (sMessageProperty) {
				aMessages = _Helper.drillDown(oInstance, sMessageProperty.split("/"));
				if (aMessages !== undefined) {
					addMessages(aMessages, sInstancePath, sContextUrl);
				}
			}

			Object.keys(oInstance).forEach(function (sProperty) {
				var sCount,
					sPropertyMetaPath = sMetaPath + "/" + sProperty,
					vPropertyValue = oInstance[sProperty],
					sPropertyPath = _Helper.buildPath(sInstancePath, sProperty);

				if (sProperty.endsWith("@odata.mediaReadLink")) {
					oInstance[sProperty] = _Helper.makeAbsolute(vPropertyValue, sContextUrl);
				}
				if (sProperty.includes("@")) { // ignore other annotations
					return;
				}
				if (Array.isArray(vPropertyValue)) {
					// compute count
					vPropertyValue.$count = undefined; // see setCount
					sCount = oInstance[sProperty + "@odata.count"];
					// Note: ignore change listeners, because any change listener that is already
					// registered, is still waiting for its value and gets it via fetchValue
					if (sCount) {
						setCount({}, "", vPropertyValue, sCount);
					} else if (!oInstance[sProperty + "@odata.nextLink"]) {
						// Note: This relies on the fact that $skip/$top is not used on nested lists
						setCount({}, "", vPropertyValue, vPropertyValue.length);
					}
					visitArray(vPropertyValue, sPropertyMetaPath, sPropertyPath,
						buildContextUrl(sContextUrl, oInstance[sProperty + "@odata.context"]));
				} else if (vPropertyValue && typeof vPropertyValue === "object") {
					visitInstance(vPropertyValue, sPropertyMetaPath, sPropertyPath, sContextUrl);
				}
			});
		}

		if (bWrapped) {
			aKeyPredicates = [];
			visitArray(oRoot.value, sRootMetaPath || this.sMetaPath, "",
				buildContextUrl(sRequestUrl, oRoot["@odata.context"]));
		} else if (oRoot && typeof oRoot === "object") {
			visitInstance(oRoot, sRootMetaPath || this.sMetaPath, sRootPath || "", sRequestUrl);
		}
		if (bHasMessages) {
			this.oRequestor.reportBoundMessages(this.sResourcePath, mPathToODataMessages,
				aKeyPredicates);
		}
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
		this.aElements.$tail = undefined;  // promise for a read w/o $top
		this.iLimit = Infinity;            // the upper limit for the count (for the case that the
									       // exact value is unknown)
		this.oSyncPromiseAll = undefined;
	}

	// make CollectionCache a Cache
	CollectionCache.prototype = Object.create(Cache.prototype);

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
	 *   A promise to be resolved with the requested data.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 *
	 * @public
	 */
	CollectionCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested,
			oListener) {
		var aElements,
			that = this;

		oGroupLock.unlock();
		if (!this.oSyncPromiseAll) {
			// wait for all reads to be finished, this is essential for $count and for finding the
			// index of a key predicate
			aElements = this.aElements.$tail
				? this.aElements.concat(this.aElements.$tail)
				: this.aElements;
			this.oSyncPromiseAll = SyncPromise.all(aElements);
		}
		return this.oSyncPromiseAll.then(function () {
			that.checkActive();
			// register afterwards to avoid that updateExisting fires updates before the first
			// response
			that.registerChange(sPath, oListener);
			return that.drillDown(that.aElements, sPath);
		});
	};

	/**
	 * Fills the given range of currently available elements with the given promise. If it is not
	 * an option to enlarge the array to accommodate <code>iEnd - 1</code>, the promise is also
	 * stored in <code>aElements.$tail</code>.
	 *
	 * @param {sap.ui.base.SyncPromise} oPromise
	 *   The promise
	 * @param {number} iStart
	 *   The start index
	 * @param {number} iEnd
	 *   The end index (will not be filled)
	 *
	 * @private
	 */
	CollectionCache.prototype.fill = function (oPromise, iStart, iEnd) {
		var i,
			n = Math.max(this.aElements.length, 1024);

		if (iEnd > n) {
			if (this.aElements.$tail && oPromise) {
				throw new Error("Cannot fill from " + iStart + " to " + iEnd
					+ ", $tail already in use, # of elements is " + this.aElements.length);
			}
			this.aElements.$tail = oPromise;
			iEnd = this.aElements.length;
		}
		for (i = iStart; i < iEnd; i++) {
			this.aElements[i] = oPromise;
		}
		this.oSyncPromiseAll = undefined;  // from now on, fetchValue has to wait again
	};

	/**
	 * Calculates the index range to be read for the given start, length and prefetch length.
	 * Checks if <code>aElements</code> entries are available for half the prefetch length left and
	 * right to it. If not, the full prefetch length is added to this side.
	 *
	 * @param {number} iStart
	 *   The start index for the data request in model coordinates (starting with 0 or -1)
	 * @param {number} iLength
	 *   The number of requested entries
	 * @param {number} iPrefetchLength
	 *   The number of entries to prefetch before and after the given range; <code>Infinity</code>
	 *   is supported
	 * @returns {object}
	 *   Returns an object with a member <code>start</code> for the start index for the next
	 *   read and <code>length</code> for the number of entries to be read.
	 *
	 * @private
	 */
	CollectionCache.prototype.getReadRange = function (iStart, iLength, iPrefetchLength) {
		var aElements = this.aElements;

		// Checks whether aElements contains at least one <code>undefined</code> entry within the
		// given start (inclusive) and end (exclusive).
		function isDataMissing(iStart, iEnd) {
			var i;
			for (i = iStart; i < iEnd; i += 1) {
				if (aElements[i] === undefined) {
					return true;
				}
			}
			return false;
		}

		if (isDataMissing(iStart + iLength, iStart + iLength + iPrefetchLength / 2)) {
			iLength += iPrefetchLength;
		}
		if (isDataMissing(Math.max(iStart - iPrefetchLength / 2, 0), iStart)) {
			iLength += iPrefetchLength;
			iStart -= iPrefetchLength;
			if (iStart < 0) {
				iLength += iStart; // Note: Infinity + -Infinity === NaN
				if (isNaN(iLength)) {
					iLength = Infinity;
				}
				iStart = 0;
			}
		}
		return {length : iLength, start : iStart};
	};

	/**
	 * Returns the resource path including the query string with $skip and $top if needed.
	 *
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The index after the last element to request ($skip + $top)
	 * @returns {string} The resource path including the query string
	 *
	 * @private
	 */
	CollectionCache.prototype.getResourcePath = function (iStart, iEnd) {
		var sDelimiter = this.sQueryString ? "&" : "?",
			iExpectedLength = iEnd - iStart,
			sResourcePath = this.sResourcePath + this.sQueryString;

		if (iStart > 0 || iExpectedLength < Infinity) {
			sResourcePath += sDelimiter + "$skip=" + iStart;
		}
		if (iExpectedLength < Infinity) {
			sResourcePath += "&$top=" + iExpectedLength;
		}
		return sResourcePath;
	};

	/**
	 * Handles a GET response by updating the cache data and the $count-values recursively.
	 *
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
	CollectionCache.prototype.handleResponse = function (iStart, iEnd, oResult, mTypeForMetaPath) {
		var iCount,
			sCount,
			oElement,
			i,
			sPredicate,
			iResultLength = oResult.value.length;

		this.sContext = oResult["@odata.context"];
		sCount = oResult["@odata.count"];
		if (sCount) {
			this.iLimit = parseInt(sCount, 10);
			setCount(this.mChangeListeners, "", this.aElements, this.iLimit);
		}
		this.visitResponse(oResult, mTypeForMetaPath, true);
		for (i = 0; i < iResultLength; i++) {
			oElement = oResult.value[i];
			this.aElements[iStart + i] = oElement;
			sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
			if (sPredicate) {
				this.aElements.$byPredicate[sPredicate] = oElement;
			}
		}
		if (iResultLength < iEnd - iStart) { // a short read
			iCount = Math.min(getCount(this.aElements), iStart + iResultLength);
			this.aElements.length = iCount;
			// If the server did not send a count, the calculated count is greater than 0
			// and the element before has not been read yet, we do not know the count:
			// The element might or might not exist.
			if (!sCount && iCount > 0 && !this.aElements[iCount - 1]){
				iCount = undefined;
			}
			setCount(this.mChangeListeners, "", this.aElements, iCount);
			this.iLimit = iCount;
		}
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
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	CollectionCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var i, n,
			aElementsRange,
			iEnd,
			iGapStart = -1,
			iLowerBound = this.aElements[-1] ? -1 : 0,
			oRange,
			iStart = Math.max(iIndex, 0), // for Array#slice()
			that = this;

		if (iIndex < iLowerBound) {
			throw new Error("Illegal index " + iIndex + ", must be >= " + iLowerBound);
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		}

		if (this.aElements.$tail) {
			return this.aElements.$tail.then(function () {
				return that.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested);
			});
		}

		oRange = this.getReadRange(iIndex, iLength, iPrefetchLength);
		iEnd = Math.min(oRange.start + oRange.length, this.iLimit);
		n = Math.min(iEnd, Math.max(oRange.start, this.aElements.length) + 1);

		for (i = oRange.start; i < n; i++) {
			if (this.aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					this.requestElements(iGapStart, i, oGroupLock.getUnlockedCopy(),
						fnDataRequested);
					fnDataRequested = undefined;
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			this.requestElements(iGapStart, iEnd, oGroupLock.getUnlockedCopy(), fnDataRequested);
		}

		oGroupLock.unlock();

		// Note: this.aElements[-1] cannot be a promise...
		aElementsRange = this.aElements.slice(iStart, iEnd);
		if (this.aElements.$tail) { // Note: if available, it must be ours!
			aElementsRange.push(this.aElements.$tail);
		}
		return SyncPromise.all(aElementsRange).then(function () {
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
	 * Requests the elements in the given range and places them into the aElements list. Calculates
	 * the key predicates for all entities in the result before the promise is resolved. While the
	 * request is running, all indexes in this range contain the Promise.
	 *
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The index after the last element to request ($skip + $top)
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {function} [fnDataRequested]
	 *   The function is called when the back-end requests have been sent.
	 *
	 * @private
	 */
	CollectionCache.prototype.requestElements = function (iStart, iEnd, oGroupLock,
			fnDataRequested) {
		var oPromise,
			that = this;

		oPromise = SyncPromise.all([
			this.oRequestor.request("GET", this.getResourcePath(iStart, iEnd), oGroupLock,
				undefined, undefined, fnDataRequested),
			this.fetchTypes()
		]).then(function (aResult) {
			if (that.aElements.$tail === oPromise) {
				that.aElements.$tail = undefined;
			}
			that.handleResponse(iStart, iEnd, aResult[0], aResult[1]);
		}).catch(function (oError) {
			that.fill(undefined, iStart, iEnd);
			throw oError;
		});

		this.bSentReadRequest = true;
		// Note: oPromise MUST be a SyncPromise for performance reasons, see SyncPromise#all
		this.fill(oPromise, iStart, iEnd);
	};

	/**
	 * Refreshes a single entity within a collection cache.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {number} iIndex
	 *   The index of the element to be refreshed
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> when the entity is updated in
	 *   the cache.
	 *
	 * @public
	 */
	CollectionCache.prototype.refreshSingle = function (oGroupLock, iIndex, fnDataRequested) {
		var sPredicate = _Helper.getPrivateAnnotation(this.aElements[iIndex], "predicate"),
			oPromise,
			sReadUrl = this.sResourcePath + sPredicate,
			mQueryOptions = jQuery.extend({}, this.mQueryOptions),
			that = this;

		// drop collection related system query options
		delete mQueryOptions["$count"];
		delete mQueryOptions["$filter"];
		delete mQueryOptions["$orderby"];
		sReadUrl += this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false,
			this.bSortExpandSelect);

		oPromise = SyncPromise.all([
			this.oRequestor
				.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested),
			this.fetchTypes()
		]).then(function (aResult) {
			var oElement = aResult[0];
			// _Helper.updateExisting cannot be used because navigation properties cannot be handled
			that.aElements[iIndex] = that.aElements.$byPredicate[sPredicate] = oElement;
			that.visitResponse(oElement, aResult[1], false, that.sMetapath, sPredicate);
		});

		this.bSentReadRequest = true;
		return oPromise;
	};

	/**
	 * Refreshes a single entity within a collection cache and removes it from the cache if the
	 * filter does not match anymore.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {number} iIndex
	 *   The index of the element to be refreshed
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} [fnOnRemove]
	 *   A function which is called after an entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> when the entity is updated in
	 *   the cache.
	 *
	 * @private
	 */
	CollectionCache.prototype.refreshSingleWithRemove = function (oGroupLock, iIndex,
			fnDataRequested, fnOnRemove) {
		var that = this;

		return this.fetchTypes().then(function (mTypeForMetaPath) {
			var sKey,
				aKeyFilters = [],
				oEntity = that.aElements[iIndex],
				mKeyProperties = _Helper.getKeyProperties(oEntity,
					"/" + that.sResourcePath, mTypeForMetaPath),
				sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"),
				mQueryOptions = jQuery.extend({}, that.mQueryOptions),
				sFilterOptions = mQueryOptions["$filter"],
				sReadUrl = that.sResourcePath;

			for (sKey in mKeyProperties) {
				aKeyFilters.push(sKey + " eq " + mKeyProperties[sKey]);
			}

			mQueryOptions["$filter"] = (sFilterOptions ? "(" + sFilterOptions + ") and " : "")
				+ aKeyFilters.join(" and ");

			sReadUrl += that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false,
				that.bSortExpandSelect);

			that.bSentReadRequest = true;
			return that.oRequestor
				.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested)
				.then(function (oResult) {
					if (that.aElements[iIndex] !== oEntity) {
						// oEntity might have moved due to parallel insert/delete
						iIndex = that.aElements.indexOf(oEntity);
					}
					if (oResult.value.length > 1) {
						throw new Error(
							"Unexpected server response, more than one entity returned.");
					} else if (oResult.value.length === 0) {
						if (iIndex === -1) {
							delete that.aElements[-1];
						} else {
							that.aElements.splice(iIndex, 1);
						}
						delete that.aElements.$byPredicate[sPredicate];
						addToCount(that.mChangeListeners, "", that.aElements, -1);
						that.iLimit -= 1;
						fnOnRemove(iIndex);
					} else {
						oResult = oResult.value[0];
						// _Helper.updateExisting cannot be used because navigation properties
						// cannot be handled
						that.aElements[iIndex] = that.aElements.$byPredicate[sPredicate] = oResult;
						that.visitResponse(oResult, mTypeForMetaPath, false, that.sMetapath,
							sPredicate);
					}
				});
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
	 *
	 * @public
	 */
	PropertyCache.prototype._delete = function () {
		throw new Error("Unsupported");
	};

	/**
	 * Not supported.
	 *
	 * @throws {Error}
	 *   Creation of a property is not supported.
	 *
	 * @public
	 */
	PropertyCache.prototype.create = function () {
		throw new Error("Unsupported");
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   ignored for property caches, should be empty
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   An optional change listener that is added for the given path. Its method
	 *   <code>onChange</code> is called with the new value if the property at that path is modified
	 *   via {@link #update} later.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the element.
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 *
	 * @public
	 */
	PropertyCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener) {
		var that = this;

		that.registerChange("", oListener);
		if (this.oPromise) {
			oGroupLock.unlock();
		} else {
			this.oPromise = SyncPromise.resolve(this.oRequestor.request("GET",
				this.sResourcePath + this.sQueryString, oGroupLock, undefined, undefined,
				fnDataRequested, undefined, this.sMetaPath));
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
	 *
	 * @public
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
	 * @param {string} [sMetaPath]
	 *   Optional meta path in case it cannot be derived from the given resource path
	 * @param {boolean} [bFetchOperationReturnType]
	 *   Whether the entity type of the operation return value must be fetched in
	 *   {@link #fetchTypes}
	 *
	 * @private
	 */
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bPost,
			sMetaPath, bFetchOperationReturnType) {
		Cache.apply(this, arguments);

		this.bFetchOperationReturnType = bFetchOperationReturnType;
		this.sMetaPath = sMetaPath || this.sMetaPath; // overrides Cache c'tor
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
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
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
	 *   A promise to be resolved with the element.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet
	 *
	 * @public
	 */
	SingleCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener) {
		var sResourcePath = this.sResourcePath + this.sQueryString,
			that = this;

		this.registerChange(sPath, oListener);
		if (this.oPromise) {
			oGroupLock.unlock();
		} else {
			if (this.bPost) {
				throw new Error("Cannot fetch a value before the POST request");
			}
			this.oPromise = SyncPromise.all([
				this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined,
					fnDataRequested, undefined, this.sMetaPath),
				this.fetchTypes()
			]).then(function (aResult) {
				that.visitResponse(aResult[0], aResult[1], false,
					that.bFetchOperationReturnType ? that.sMetaPath + "/$Type" : undefined);
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
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {object} [oData]
	 *   A copy of the data to be sent with the POST request; may be used to tunnel a different
	 *   HTTP method via a property "X-HTTP-Method" (which is removed)
	 * @param {object} [oEntity]
	 *   The entity which contains the ETag to be sent as "If-Match" header with the POST request.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST or another POST is still being processed.
	 *
	 * @public
	 */
	SingleCache.prototype.post = function (oGroupLock, oData, oEntity) {
		var sHttpMethod = "POST",
			aPromises,
			that = this;

		if (!this.bPost) {
			throw new Error("POST request not allowed");
		}
		// We disallow parallel POSTs because they represent OData actions which must not be
		// canceled. However we cannot decide which POST has been processed last on the server, so
		// we cannot tell which response represents the final server state.
		if (this.bPosting) {
			throw new Error("Parallel POST requests not allowed");
		}
		if (oData) {
			sHttpMethod = oData["X-HTTP-Method"] || sHttpMethod;
			delete oData["X-HTTP-Method"];
			if (this.oRequestor.isActionBodyOptional() && !Object.keys(oData).length) {
				oData = undefined;
			}
		}
		aPromises = [
			this.oRequestor.request(sHttpMethod, this.sResourcePath + this.sQueryString, oGroupLock,
				{"If-Match" : oEntity}, oData)
		];
		if (this.bFetchOperationReturnType) {
			aPromises.push(this.fetchTypes());
		}
		this.oPromise = SyncPromise.all(aPromises).then(function (aResult) {
			that.bPosting = false;
			if (that.bFetchOperationReturnType) {
				that.visitResponse(aResult[0], aResult[1], false, that.sMetaPath + "/$Type");
			}
			return aResult[0];
		}, function (oError) {
			that.bPosting = false;
			throw oError;
		});
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
	 * @param {object} [mQueryOptions]
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
	 *
	 * @public
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
	 *
	 * @public
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
	 * @param {string} [sMetaPath]
	 *   Optional meta path in case it cannot be derived from the given resource path
	 * @param {boolean} [bFetchOperationReturnType]
	 *   Whether the entity type of the operation return value must be fetched in
	 *   {@link #fetchTypes}
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bPost, sMetaPath, bFetchOperationReturnType) {
		return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, bPost,
			sMetaPath, bFetchOperationReturnType);
	};

	/**
	 * Makes an object that has the given value exactly at the given property path allowing to use
	 * the result in _Helper.updateExisting().
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
	 *
	 * @private
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