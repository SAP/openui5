/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Cache
sap.ui.define([
	"./_GroupLock",
	"./_Helper",
	"./_Requestor",
	"sap/base/Log",
	"sap/base/util/isEmptyObject",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/odata/ODataUtils"
], function (_GroupLock, _Helper, _Requestor, Log, isEmptyObject, SyncPromise, ODataUtils) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.lib._Cache",
		// Matches if ending with a transient key predicate:
		//   EMPLOYEE($uid=id-1550828854217-16) -> aMatches[0] === "($uid=id-1550828854217-16)"
		//   @see sap.base.util.uid
		rEndsWithTransientPredicate = /\(\$uid=[-\w]+\)$/,
		rInactive = /^\$inactive\./,
		sMessagesAnnotation = "@com.sap.vocabularies.Common.v1.Messages",
		rNumber = /^-?\d+$/,
		// Matches two cases:  segment with predicate or simply predicate:
		//   EMPLOYEE(ID='42') -> aMatches[1] === "EMPLOYEE", aMatches[2] === "(ID='42')"
		//   (ID='42') ->  aMatches[1] === "",  aMatches[2] === "(ID='42')"
		rSegmentWithPredicate = /^([^(]*)(\(.*\))$/;

	/**
	 * Adds the given delta to the collection's $count if there is one.
	 *
	 * @param {object} mChangeListeners A map of change listeners by path
	 * @param {string} sPath The path of the collection in the cache (as used by change listeners)
	 * @param {array} aCollection The collection
	 * @param {number} iDelta The delta
	 */
	function addToCount(mChangeListeners, sPath, aCollection, iDelta) {
		if (aCollection.$count !== undefined) {
			setCount(mChangeListeners, sPath, aCollection, aCollection.$count + iDelta);
		}
	}

	/**
	 * Returns <code>true</code> if <code>sRequestPath</code> is a sub-path of <code>sPath</code>.
	 *
	 * @param {string} sRequestPath The request path
	 * @param {string} sPath The path to check against
	 * @returns {boolean} <code>true</code> if it is a sub-path
	 */
	function isSubPath(sRequestPath, sPath) {
		return sPath === "" || sRequestPath === sPath || sRequestPath.startsWith(sPath + "/");
	}

	/**
	 * Sets the collection's $count: a number representing the sum of the element count on
	 * server-side and the number of transient elements created on the client. It may be
	 * <code>undefined</code>, but not <code>Infinity</code>.
	 *
	 * @param {object} mChangeListeners A map of change listeners by path
	 * @param {string} sPath The path of the collection in the cache (as used by change listeners)
	 * @param {array} aCollection The collection
	 * @param {string|number} vCount The count
	 */
	function setCount(mChangeListeners, sPath, aCollection, vCount) {
		// Note: @odata.count is of type Edm.Int64, represented as a string in OData responses;
		// $count should be a number and the loss of precision is acceptable
		if (typeof vCount === "string") {
			vCount = parseInt(vCount);
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string;
	 *   note that this flag can safely be ignored for all "new" features (after 1.47) which
	 *   should just sort always
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function that returns the cache's original resource path to be used to build the target
	 *   path for bound messages; if it is not given or returns nothing, <code>sResourcePath</code>
	 *   is used instead. See {@link #getOriginalResourcePath}.
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, the cache is read-only and modifying calls lead to an error.
	 *
	 * @alias sap.ui.model.odata.v4.lib._Cache
	 * @constructor
	 * @private
	 */
	function _Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath, bSharedRequest) {
		// the number of active usages of this cache (initially 1 because the first usage that
		// creates the cache does not call #setActive)
		this.iActiveUsages = 1;
		this.mChangeListeners = {}; // map from path to an array of change listeners
		this.fnGetOriginalResourcePath = fnGetOriginalResourcePath;
		// the point in time when the cache became inactive; active caches have Infinity so that
		// they are always "newer"
		this.iInactiveSince = Infinity;
		this.mPatchRequests = {}; // map from path to an array of (PATCH) promises
		// a promise with attached properties $count, $resolve existing while DELETEs or POSTs are
		// being sent
		this.oPendingRequestsPromise = null;
		this.mPostRequests = {}; // map from path to an array of entity data (POST bodies)
		this.sReportedMessagesPath = undefined;
		this.oRequestor = oRequestor;
		// whether a request has been sent and the query options are final
		this.bSentRequest = false;
		this.bSortExpandSelect = bSortExpandSelect;

		this.setResourcePath(sResourcePath);
		this.setQueryOptions(mQueryOptions);
		this.bSharedRequest = bSharedRequest; // must be set after the functions!
	}

	/**
	 * Deletes an entity on the server and in the cached data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the DELETE request; w/o a lock, no DELETE is sent.
	 *   For a transient entity, the lock is ignored (use NULL)!
	 * @param {string} sEditUrl
	 *   The entity's edit URL to be used for the DELETE request;  w/o a lock, this is mostly
	 *   ignored.
	 * @param {string} sPath
	 *   The entity's path within the cache (as used by change listeners)
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding. W/o a lock, this is ignored.
	 * @param {boolean} [bDoNotRequestCount]
	 *   Whether not to request the new count from the server; useful in case of
	 *   {@link sap.ui.model.odata.v4.Context#replaceWith} where it is known that the count remains
	 *   unchanged; w/o a lock this should be true
	 * @param {function} fnCallback
	 *   A function which is called after a transient entity has been deleted from the cache or
	 *   after the entity has been deleted from the server and from the cache; the index of the
	 *   entity and the entity list are both passed as parameter, or none of them
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype._delete = function (oGroupLock, sEditUrl, sPath, oETagEntity,
			bDoNotRequestCount, fnCallback) {
		var aSegments = sPath.split("/"),
			vDeleteProperty = aSegments.pop(),
			iIndex = rNumber.test(vDeleteProperty) ? Number(vDeleteProperty) : undefined,
			sParentPath = aSegments.join("/"),
			that = this;

		this.checkSharedRequest();
		this.addPendingRequest();

		return this.fetchValue(_GroupLock.$cached, sParentPath).then(function (vCacheData) {
			var vCachePath = _Cache.from$skip(vDeleteProperty, vCacheData),
				oEntity = vDeleteProperty
					? vCacheData[vCachePath] || vCacheData.$byPredicate[vCachePath]
					: vCacheData, // deleting at root level
				mHeaders,
				sKeyPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"),
				sEntityPath = _Helper.buildPath(sParentPath,
					Array.isArray(vCacheData) ? sKeyPredicate : vDeleteProperty),
				sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient");

			if (sTransientGroup) {
				if (typeof sTransientGroup !== "string") {
					throw new Error("No 'delete' allowed while waiting for server response");
				}
				that.oRequestor.removePost(sTransientGroup, oEntity);
				return undefined;
			}
			if (oEntity["$ui5.deleting"]) {
				throw new Error("Must not delete twice: " + sEditUrl);
			}
			oEntity["$ui5.deleting"] = true;
			mHeaders = {"If-Match" : oETagEntity || oEntity};
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return SyncPromise.all([
				oGroupLock
					&& that.oRequestor.request("DELETE", sEditUrl, oGroupLock.getUnlockedCopy(),
							mHeaders, undefined, undefined, undefined, undefined,
							_Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath))
						.catch(function (oError) {
							if (oError.status !== 404) {
								delete oEntity["$ui5.deleting"];
								throw oError;
							} // else: map 404 to 200
						}),
				iIndex === undefined // single element or kept-alive not in list
					&& !bDoNotRequestCount
					&& that.requestCount(oGroupLock || that.oRequestor.lockGroup("$auto", that)),
				oGroupLock && oGroupLock.unlock() // unlock when all requests have been queued
			]).then(function () {
				if (Array.isArray(vCacheData)) {
					fnCallback(
						that.removeElement(vCacheData, iIndex, sKeyPredicate, sParentPath),
						vCacheData);
				} else {
					if (vDeleteProperty) {
						// set to null and notify listeners
						_Helper.updateExisting(that.mChangeListeners, sParentPath,
							vCacheData, _Cache.makeUpdateData([vDeleteProperty], null));
					} else { // deleting at root level
						oEntity["$ui5.deleted"] = true;
					}
					fnCallback();
				}
				that.oRequestor.getModelInterface().reportStateMessages(that.sResourcePath,
					{}, [sEntityPath]);
			});
		}).finally(function () {
			that.removePendingRequest();
		});
	};

	/**
	 * Adds one to the count of pending (that is, "currently being sent to the server") requests.
	 *
	 * @private
	 */
	_Cache.prototype.addPendingRequest = function () {
		var fnResolve;

		if (!this.oPendingRequestsPromise) {
			this.oPendingRequestsPromise = new SyncPromise(function (resolve) {
				fnResolve = resolve;
			});
			this.oPendingRequestsPromise.$count = 0;
			this.oPendingRequestsPromise.$resolve = fnResolve;
		}
		this.oPendingRequestsPromise.$count += 1;
	};

	/**
	 * Calculates and returns the key predicate for the given entity and stores it as private
	 * annotation at the given entity. If at least one key property is <code>undefined</code>, no
	 * private annotation for the key predicate is created.
	 *
	 * @param {object} oInstance
	 *   The instance for which to calculate the key predicate
	 * @param {object} mTypeForMetaPath
	 *   A map from meta path to the entity type (as delivered by {@link #fetchTypes})
	 * @param {string} sMetaPath
	 *   The meta path for the entity
	 * @returns {string|undefined}
	 *   The key predicate or <code>undefined</code>, if key predicate cannot be determined
	 * @private
	 */
	// Note: overridden by _AggregationCache.calculateKeyPredicate
	_Cache.prototype.calculateKeyPredicate = function (oInstance, mTypeForMetaPath, sMetaPath) {
		var sPredicate,
			oType = mTypeForMetaPath[sMetaPath];

		if (oType && oType.$Key) {
			sPredicate = _Helper.getKeyPredicate(oInstance, sMetaPath, mTypeForMetaPath);
			if (sPredicate) {
				_Helper.setPrivateAnnotation(oInstance, "predicate", sPredicate);
			}
		}
		return sPredicate;
	};

	/**
	 * Throws an error if the cache shares requests.
	 *
	 * @throws {Error} If the cache has bSharedRequest
	 *
	 * @private
	 */
	_Cache.prototype.checkSharedRequest = function () {
		if (this.bSharedRequest) {
			throw new Error(this + " is read-only");
		}
	};

	/**
	 * Creates a transient entity, inserts it in the list and adds a POST request to the batch
	 * group with the given ID. If the POST request failed, <code>fnErrorCallback</code> is called
	 * with an Error object, the POST request is automatically added again to the same batch
	 * group (for SubmitMode.API) or parked (for SubmitMode.Auto or SubmitMode.Direct). Parked POST
	 * requests are repeated with the next update of the entity data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {sap.ui.base.SyncPromise} oPostPathPromise
	 *   A SyncPromise resolving with the resource path for the POST request
	 * @param {string} sPath
	 *   The collection's path within the cache (as used by change listeners)
	 * @param {string} sTransientPredicate
	 *   A (temporary) key predicate for the transient entity: "($uid=...)"
	 * @param {string} [oEntityData={}]
	 *   The initial entity data
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
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.create = function (oGroupLock, oPostPathPromise, sPath, sTransientPredicate,
			oEntityData, bAtEndOfCreated, fnErrorCallback, fnSubmitCallback) {
		var aCollection = this.getValue(sPath),
			sGroupId = oGroupLock.getGroupId(),
			bKeepTransientPath = oEntityData && oEntityData["@$ui5.keepTransientPath"],
			oPostBody,
			fnResolve,
			that = this;

		// Clean-up when the create has been canceled.
		function cleanUp() {
			_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
			aCollection.splice(aCollection.indexOf(oEntityData), 1);
			aCollection.$created -= 1;
			if (!oEntityData["@$ui5.context.isInactive"]) {
				that.iActiveElements -= 1;
				addToCount(that.mChangeListeners, sPath, aCollection, -1);
			}
			delete aCollection.$byPredicate[sTransientPredicate];
			if (!sPath) {
				// Note: sPath is empty only in a CollectionCache, so we may call adjustReadRequests
				// Note: index 0 is OK here (see "Must not request created element")
				that.adjustReadRequests(0, -1);
			}
			oGroupLock.cancel();
		}

		// Sets a marker that the create request is pending, so that update and delete fail.
		function setCreatePending() {
			that.addPendingRequest();
			_Helper.setPrivateAnnotation(oEntityData, "transient", new Promise(function (resolve) {
				fnResolve = resolve;
			}));
			fnSubmitCallback();
		}

		function request(sPostPath, oPostGroupLock) {
			// mark as transient (again)
			_Helper.setPrivateAnnotation(oEntityData, "transient", sGroupId);
			_Helper.addByPath(that.mPostRequests, sPath, oEntityData);
			return SyncPromise.all([
				that.oRequestor.request("POST", sPostPath, oPostGroupLock, null, oPostBody,
					setCreatePending, cleanUp, undefined,
					_Helper.buildPath(that.sResourcePath, sPath, sTransientPredicate)),
				that.fetchTypes()
			]).then(function (aResult) {
				var oCreatedEntity = aResult[0],
					sPredicate,
					aSelect;

				_Helper.deletePrivateAnnotation(oEntityData, "postBody");
				_Helper.deletePrivateAnnotation(oEntityData, "transient");
				oEntityData["@$ui5.context.isTransient"] = false;
				_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
				that.visitResponse(oCreatedEntity, aResult[1],
					_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sPath)),
					sPath + sTransientPredicate, bKeepTransientPath);
				sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
				if (sPredicate) {
					_Helper.setPrivateAnnotation(oEntityData, "predicate", sPredicate);
					if (bKeepTransientPath) {
						sPredicate = sTransientPredicate;
					} else if (sTransientPredicate in aCollection.$byPredicate) {
						aCollection.$byPredicate[sPredicate] = oEntityData;
						_Helper.updateTransientPaths(that.mChangeListeners, sTransientPredicate,
							sPredicate);
						// Do not remove transient predicate from aCollection.$byPredicate; some
						// contexts still use the transient predicate to access the data
					} // else: transient element was not kept by #reset, leave it like that!
				}
				// update the cache with the POST response (note that a deep create is not supported
				// because updateSelected does not handle key predicates, ETags and $count)
				aSelect = _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath).$select;
				_Helper.updateSelected(that.mChangeListeners,
					_Helper.buildPath(sPath, sPredicate || sTransientPredicate), oEntityData,
					oCreatedEntity, aSelect);

				that.removePendingRequest();
				fnResolve(true);
				return oEntityData;
			}, function (oError) {
				if (oError.canceled) {
					// for cancellation no error is reported via fnErrorCallback
					throw oError;
				}
				if (fnResolve) {
					that.removePendingRequest();
					fnResolve();
				}
				fnErrorCallback(oError);
				if (that.fetchTypes().isRejected()) {
					throw oError;
				}
				sGroupId = sGroupId.replace(rInactive, "");
				sGroupId = that.oRequestor.getGroupSubmitMode(sGroupId) === "API"
					? sGroupId
					: "$parked." + sGroupId;

				return request(sPostPath,
					that.oRequestor.lockGroup(sGroupId, that, true, true));
			});
		}

		this.checkSharedRequest();
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
				+ "' does not reference a collection");
		}

		// clone data to avoid modifications outside the cache
		// remove any property starting with "@$ui5."
		oEntityData = _Helper.publicClone(oEntityData, true) || {};
		oPostBody = _Helper.merge({}, oEntityData);
		// keep post body separate to allow local property changes in the cache
		_Helper.setPrivateAnnotation(oEntityData, "postBody", oPostBody);
		_Helper.setPrivateAnnotation(oEntityData, "transientPredicate", sTransientPredicate);
		oEntityData["@$ui5.context.isTransient"] = true;
		if (sGroupId.startsWith("$inactive.")) {
			oEntityData["@$ui5.context.isInactive"] = true;
		} else {
			this.iActiveElements += 1;
			addToCount(this.mChangeListeners, sPath, aCollection, 1);
		}

		if (bAtEndOfCreated) {
			aCollection.splice(aCollection.$created, 0, oEntityData);
		} else {
			aCollection.unshift(oEntityData);
		}
		aCollection.$created += 1;
		// if the nested collection is empty $byPredicate is not available, create it on demand
		aCollection.$byPredicate = aCollection.$byPredicate || {};
		aCollection.$byPredicate[sTransientPredicate] = oEntityData;
		if (!sPath) {
			// Note: sPath is empty only in a CollectionCache, so we may call adjustReadRequests
			that.adjustReadRequests(0, 1);
		}

		return oPostPathPromise.then(function (sPostPath) {
			sPostPath += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return request(sPostPath, oGroupLock);
		});
	};

	/**
	 * Deregisters the given change listener. Note: shared caches have no listeners anyway.
	 *
	 * @param {string} sPath
	 *   The path
	 * @param {object} oListener
	 *   The change listener
	 *
	 * @public
	 */
	_Cache.prototype.deregisterChange = function (sPath, oListener) {
		if (!this.bSharedRequest) {
			_Helper.removeByPath(this.mChangeListeners, sPath, oListener);
		}
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
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate a request for late properties with
	 * @param {boolean} [bCreateOnDemand]
	 *   Whether to create missing objects on demand, in order to avoid drill-down errors
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the result matching to <code>sPath</code>
	 *
	 * @private
	 */
	_Cache.prototype.drillDown = function (oData, sPath, oGroupLock, bCreateOnDemand) {
		var oDataPromise = SyncPromise.resolve(oData),
			oEntity,
			iEntityPathLength,
			bInAnnotation = false,
			aSegments,
			bTransient = false,
			that = this;

		function invalidSegment(sSegment, bAsInfo) {
			Log[bAsInfo ? "info" : "error"]("Failed to drill-down into " + sPath
				+ ", invalid segment: " + sSegment, that.toString(), sClassName);
			return undefined;
		}

		/*
		 * Determines the implicit value if the value is missing in the cache. Reports an invalid
		 * segment if there is no @Core.Permissions: 'None' annotation and no implicit value.
		 *
		 * @param {object} oValue - The object that is expected to have the value
		 * @param {string} sSegment - The path segment that is missing
		 * @param {number} iPathLength - The length of the path of the missing value
		 * @returns {sap.ui.base.SyncPromise|undefined}
		 *   Returns a SyncPromise which resolves with the value or returns undefined in some
		 *   special cases.
		 */
		function missingValue(oValue, sSegment, iPathLength) {
			var sPropertyPath = aSegments.slice(0, iPathLength).join("/"),
				sPropertyName,
				sReadLink,
				sServiceUrl;

			if (Array.isArray(oValue)) {
				return invalidSegment(sSegment, sSegment === "0"); // missing key predicate or index
			}

			if (bInAnnotation) {
				return invalidSegment(sSegment, true);
			}

			if (sSegment.includes("@")) { // missing property annotation
				sPropertyName = sSegment.split("@")[0];
				if (bTransient
						|| sPropertyName in oValue
						|| oValue[sPropertyName + "@$ui5.noData"]
						|| (that.mQueryOptions
							&& that.mQueryOptions.$select.includes(sPropertyPath.split("@")[0]))) {
					// no use to send late request
					return invalidSegment(sSegment, true);
				}
			}

			return that.oRequestor.getModelInterface()
				.fetchMetadata(that.sMetaPath + "/"
					+ _Helper.getMetaPath(sPropertyPath.split("@")[0]))
				.then(function (oProperty) {
					var vPermissions;

					if (!oProperty) {
						return invalidSegment(sSegment);
					}
					if (oProperty.$Type === "Edm.Stream") {
						sReadLink = oValue[sSegment + "@odata.mediaReadLink"]
							|| oValue[sSegment + "@mediaReadLink"];
						sServiceUrl = that.oRequestor.getServiceUrl();
						return sReadLink
							|| _Helper.buildPath(sServiceUrl + that.sResourcePath, sPropertyPath);
					}
					if (!bTransient) {
						vPermissions = oValue[
							_Helper.getAnnotationKey(oValue, ".Permissions", sSegment)];
						if (vPermissions === 0 || vPermissions === "None") {
							return undefined;
						}
						// If there is no entity with a key predicate, try it with the cache root
						// object (in case of SimpleCache, the root object of CollectionCache is an
						// array)
						if (!oEntity && !Array.isArray(oData)) {
							oEntity = oData;
							iEntityPathLength = 0;
						}
						return oEntity
							&& that.fetchLateProperty(oGroupLock, oEntity,
								aSegments.slice(0, iEntityPathLength).join("/"),
								aSegments.slice(iEntityPathLength).join("/").split("@")[0],
								aSegments.slice(iEntityPathLength, iPathLength).join("/"))
							|| invalidSegment(sSegment);
					}
					// inside a transient entity, implicit values are determined as follows
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
		aSegments = sPath.split("/");
		return aSegments.reduce(function (oPromise, sSegment, i) {
			return oPromise.then(function (vValue) {
				var vIndex, aMatches, oParentValue;

				if (sSegment === "$count") {
					return Array.isArray(vValue) ? vValue.$count : invalidSegment(sSegment);
				}
				if (vValue === undefined || vValue === null) {
					// already beyond the valid data: an unresolved navigation property or a
					// property of a complex type which is null
					return undefined;
				}
				if (typeof vValue !== "object" || sSegment === "@$ui5._"
					|| Array.isArray(vValue) && (sSegment[0] === "$" || sSegment === "length")) {
					// Note: protect private namespace against read access just like any missing
					// object
					return invalidSegment(sSegment);
				}
				if (_Helper.hasPrivateAnnotation(vValue, "predicate")) {
					oEntity = vValue;
					iEntityPathLength = i;
				}
				oParentValue = vValue;
				bTransient = bTransient || vValue["@$ui5.context.isTransient"];
				aMatches = rSegmentWithPredicate.exec(sSegment);
				if (aMatches) {
					if (aMatches[1]) { // e.g. "TEAM_2_EMPLOYEES('42')
						vValue = vValue[aMatches[1]]; // there is a navigation property, follow it
					}
					if (vValue) { // ensure that we do not fail on a missing navigation property
						vValue = vValue.$byPredicate // not available on empty collections!
							&& vValue.$byPredicate[aMatches[2]]; // search the key predicate
					}
				} else {
					vIndex = _Cache.from$skip(sSegment, vValue);
					if (bCreateOnDemand && vIndex === sSegment
							&& (vValue[sSegment] === undefined || vValue[sSegment] === null)) {
						// create on demand for (navigation) properties only, not for indices
						vValue[sSegment] = {};
					}
					vValue = vValue[vIndex];
				}
				// missing advertisement or annotation is not an error
				vValue = vValue === undefined && sSegment[0] !== "#" && sSegment[0] !== "@"
					? missingValue(oParentValue, sSegment, i + 1)
					: vValue;
				if (sSegment.includes("@")) {
					bInAnnotation = true;
				}

				return vValue;
			});
		}, oDataPromise);
	};

	/**
	 * Fetches a missing property while drilling down into the cache. Writes it into the cache and
	 * returns it so that drillDown can continue.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID (on which unlock has already been called)
	 * @param {object} oResource
	 *   The resource in the cache on which the missing property is requested. Usually this is the
	 *   last entity in the property path for which the key predicate is known. This keeps $expand
	 *   as short as possible and it allows checking that the navigation property leading to this
	 *   entity is unchanged (by comparing the key predicate). If there is no entity with a key
	 *   predicate at all, SingleCache uses the cache root as oResource.
	 * @param {string} sResourcePath
	 *   The path of oResource relative to the cache
	 * @param {string} sRequestedPropertyPath
	 *   The path of the requested property relative to oResource; this property is requested from
	 *   the server
	 * @param {string} sMissingPropertyPath
	 *   The path of the missing property relative to oResource; this property is returned so that
	 *   drillDown can proceed
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise resolving with the missing property value or <code>undefined</code> if the
	 *   requested property is not an expected late property; it rejects with an error if the GET
	 *   request failed, or if the key predicate or the ETag has changed
	 *
	 * @private
	 */
	_Cache.prototype.fetchLateProperty = function (oGroupLock, oResource, sResourcePath,
			sRequestedPropertyPath, sMissingPropertyPath) {
		var sFullResourceMetaPath,
			sFullResourcePath,
			sGroupId,
			sMergeBasePath, // full resource path plus custom query options
			oPromise,
			mQueryOptions,
			sRequestPath,
			sResourceMetaPath = _Helper.getMetaPath(sResourcePath),
			mTypeForMetaPath = this.fetchTypes().getResult(),
			aUpdateProperties = [sRequestedPropertyPath],
			that = this;

		/*
		 * Visits the query options recursively descending $expand. Determines the target type, adds
		 * key properties, ETag and key predicate to aUpdateProperties.
		 *
		 * @param {object} mQueryOptions0 The query options
		 * @param {string} [sBasePath=""] The base (meta) path relative to oResource
		 *   Note: path === metapath here because there are only single (navigation) properties
		 */
		function visitQueryOptions(mQueryOptions0, sBasePath) {
			// the type is available synchronously because the binding read it when checking for
			// late properties
			var sMetaPath = _Helper.buildPath(sFullResourceMetaPath, sBasePath),
				oEntityType = mTypeForMetaPath[sMetaPath],
				sExpand;

			if (!oEntityType) {
				oEntityType = that.oRequestor.fetchType(mTypeForMetaPath, sMetaPath).getResult();
			}
			if (sBasePath) {
				// Key properties and predicate must only be copied from the result for nested
				// properties. The root property is already loaded and has them already. We check
				// that they are unchanged in this case.
				(oEntityType.$Key || []).forEach(function (vKey) {
					if (typeof vKey === "object") {
						vKey = vKey[Object.keys(vKey)[0]]; // the path for the alias
					}
					aUpdateProperties.push(_Helper.buildPath(sBasePath, vKey));
				});
			}
			if (mQueryOptions0.$expand) {
				// intersecting the query options with sRequestedPropertyPath delivers exactly one
				// entry in $expand at each level (one for each navigation property binding)
				sExpand = Object.keys(mQueryOptions0.$expand)[0];
				visitQueryOptions(mQueryOptions0.$expand[sExpand],
					_Helper.buildPath(sBasePath, sExpand));
			}
		}

		if (!this.mLateQueryOptions) {
			return undefined;
		}

		sFullResourceMetaPath = _Helper.buildPath(this.sMetaPath, sResourceMetaPath);
		// sRequestedPropertyPath is also a metapath because the binding does not accept a path with
		// a collection-valued navigation property for a late property
		mQueryOptions = _Helper.intersectQueryOptions(
			_Helper.getQueryOptionsForPath(this.mLateQueryOptions, sResourcePath),
			[sRequestedPropertyPath], this.oRequestor.getModelInterface().fetchMetadata,
			sFullResourceMetaPath, {});
		if (!mQueryOptions) {
			return undefined;
		}

		visitQueryOptions(mQueryOptions);
		sFullResourcePath = _Helper.buildPath(this.sResourcePath, sResourcePath);
		// include $expand/$select only; this uniquely *describes* the late property request
		sRequestPath = sFullResourcePath
			+ this.oRequestor.buildQueryString(sFullResourceMetaPath, mQueryOptions, false, true);
		oPromise = this.mPropertyRequestByPath[sRequestPath];
		if (!oPromise) {
			// include non-system query options into string; pass $expand/$select as objects to
			// allow merge
			sMergeBasePath = sFullResourcePath
				+ this.oRequestor.buildQueryString(sFullResourceMetaPath, this.mQueryOptions, true);
			sGroupId = _Helper.getPrivateAnnotation(oResource, "groupId");
			oPromise = this.oRequestor.request("GET", sMergeBasePath,
				sGroupId ? this.oRequestor.lockGroup(sGroupId, this) : oGroupLock.getUnlockedCopy(),
				undefined, undefined, undefined, undefined, sFullResourceMetaPath, undefined,
				false, mQueryOptions
			).then(function (oData) {
				that.visitResponse(oData, mTypeForMetaPath, sFullResourceMetaPath, sResourcePath);

				return oData;
			});
			this.mPropertyRequestByPath[sRequestPath] = oPromise;
		}
		// With the V2 adapter the surrounding complex type is requested for nested properties. So
		// even when two late properties lead to the same request, each of them must be copied to
		// the cache.
		return oPromise.then(function (oData) {
			var sPredicate = _Helper.getPrivateAnnotation(oData, "predicate");

			if (sPredicate && _Helper.getPrivateAnnotation(oResource, "predicate") !== sPredicate) {
				throw new Error("GET " + sRequestPath + ": Key predicate changed from "
					+ _Helper.getPrivateAnnotation(oResource, "predicate") + " to " + sPredicate);
			}
			// we expect the server to always or never send an ETag for this entity
			if (oResource["@odata.etag"] && oData["@odata.etag"] !== oResource["@odata.etag"]) {
				throw new Error("GET " + sRequestPath + ": ETag changed");
			}

			_Helper.updateSelected(that.mChangeListeners, sResourcePath, oResource, oData,
				aUpdateProperties);

			// return the missing property, so that drillDown properly proceeds
			return _Helper.drillDown(oResource, sMissingPropertyPath.split("/"));
		}).finally(function () { // clean up only after updateSelected!
			delete that.mPropertyRequestByPath[sRequestPath];
		});
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
	_Cache.prototype.fetchTypes = function () {
		var aPromises, mTypeForMetaPath,
			that = this;

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
						aPromises.push(that.oRequestor.fetchType(mTypeForMetaPath, sMetaPath));
					});
					fetchExpandedTypes(sMetaPath, mQueryOptions.$expand[sNavigationPath]);
				});
			}
		}

		if (!this.oTypePromise) {
			aPromises = [];
			mTypeForMetaPath = {};
			aPromises.push(this.oRequestor.fetchType(mTypeForMetaPath, this.sMetaPath));
			fetchExpandedTypes(this.sMetaPath, this.mQueryOptions);
			this.oTypePromise = SyncPromise.all(aPromises).then(function () {
				return mTypeForMetaPath;
			});
		}
		return this.oTypePromise;
	};

	/**
	 * Returns a promise to be resolved with the requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent, unless only a single
	 *   property is requested late
	 * @param {object} [oListener]
	 *   A change listener that is added for the given path. Its method <code>onChange</code> is
	 *   called with the new value if the property at that path is modified later
	 * @param {boolean} [bCreateOnDemand]
	 *   Whether to create missing objects on demand, in order to avoid drill-down errors
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested data. It is rejected if the request for the
	 *   data failed.
	 * @throws {Error}
	 *   If the group ID is '$cached' and the value is not cached (the error has a property
	 *   <code>$cached = true</code> then); implementing classes may have further preconditions
	 *
	 * @abstract
	 * @name sap.ui.model.odata.v4.lib._Cache#fetchValue
	 * @public
	 */

	/**
	 * Returns an array containing all current elements of a collection or single cache for the
	 * given relative path. If there are pending requests, the corresponding promises will be
	 * ignored and set to <code>undefined</code>.
	 *
	 * @param {string} [sPath]
	 *   Relative path to drill-down into, may be empty (only for collection cache)
	 * @returns {object[]} The cache elements
	 */
	 _Cache.prototype.getAllElements = function (sPath) {
		if (sPath) {
			return this.getValue(sPath);
		}
		return this.aElements.map(function (oElement) {
			return oElement instanceof SyncPromise ? undefined : oElement;
		});
	};

	/**
	 * Returns all created elements for the given path.
	 *
	 * @param {string} sPath
	 *   Relative path to drill-down into
	 * @returns {object[]}
	 *   An array with all created elements
	 *
	 * @public
	 */
	_Cache.prototype.getCreatedElements = function (sPath) {
		var aCollection = this.getValue(sPath);

		return aCollection ? aCollection.slice(0, aCollection.$created) : [];
	};

	/**
	 * Returns the query options to be used for downloading list data corresponding to the given
	 * query options.
	 *
	 * @param {object} mQueryOptions - The query options
	 * @returns {object} The download query options derived from the given query options
	 *
	 * @private
	 */
	_Cache.prototype.getDownloadQueryOptions = function (mQueryOptions) {
		return mQueryOptions;
	};

	/**
	 * Returns a URL by which the complete content of the list with the given path can be downloaded
	 * in JSON format.
	 *
	 * @param {string} sPath
	 *   The list's path relative to the cache; may be empty, but not <code>undefined</code>
	 * @param {object} [mCustomQueryOptions]
	 *   The custom query options, needed iff. a non-empty path is given
	 * @returns {string} The download URL
	 *
	 * @public
	 */
	_Cache.prototype.getDownloadUrl = function (sPath, mCustomQueryOptions) {
		var mQueryOptions = this.mQueryOptions;

		if (sPath) {
			// reduce the query options to the child path
			mQueryOptions = _Helper.getQueryOptionsForPath(mQueryOptions, sPath);
			// add the custom query options again
			mQueryOptions = _Helper.merge({}, mCustomQueryOptions, mQueryOptions);
		}
		return this.oRequestor.getServiceUrl()
			+ _Helper.buildPath(this.sResourcePath, sPath)
			+ this.oRequestor.buildQueryString(
				_Helper.buildPath(this.sMetaPath, _Helper.getMetaPath(sPath)),
				this.getDownloadQueryOptions(mQueryOptions));
	};

	/**
	 * Returns the query options for late properties.
	 *
	 * @returns {object} The late query options
	 *
	 * @public
	 * @see #setLateQueryOptions
	 */
	_Cache.prototype.getLateQueryOptions = function () {
		return this.mLateQueryOptions;
	};

	/**
	 * Returns this cache's query options.
	 *
	 * @returns {object} The query options
	 *
	 * @public
	 * @see #setQueryOptions
	 */
	_Cache.prototype.getQueryOptions = function () {
		return this.mQueryOptions;
	};

	/**
	 * Returns the requested data if available synchronously.
	 *
	 * @param {string} [_sPath]
	 *   Relative path to drill-down into
	 * @returns {any}
	 *   The requested data or <code>undefined</code> if the data is not yet available
	 *
	 * @public
	 */
	// eslint-disable-next-line valid-jsdoc -- in the subclasses the function does return a value
	_Cache.prototype.getValue = function (_sPath) {
		throw new Error("Unsupported operation");
	};

	/**
	 * Gets the cache's original resource path to be used to build the target path for bound
	 * messages.
	 *
	 * @param {object} oEntity
	 *   The entity to compute the original resource path for
	 * @returns {string}
	 *   The original resource path
	 *
	 * @private
	 */
	_Cache.prototype.getOriginalResourcePath = function (oEntity) {
		return this.fnGetOriginalResourcePath && this.fnGetOriginalResourcePath(oEntity)
			|| this.sResourcePath;
	};

	/**
	 * Gets the cache's resource path.
	 *
	 * @returns {string} The resource path
	 *
	 * @public
	 */
	_Cache.prototype.getResourcePath = function () {
		return this.sResourcePath;
	};

	/**
	 * Tells whether there are any registered change listeners.
	 *
	 * @returns {boolean}
	 *   Whether there are any registered change listeners
	 *
	 * @public
	 * @see #deregisterChange
	 * @see #registerChange
	 */
	_Cache.prototype.hasChangeListeners = function () {
		return !isEmptyObject(this.mChangeListeners);
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by APIs like sort or filter because they
	 *   relate to a context which is kept alive
	 * @param {boolean} [bIgnoreTransient]
	 *   Whether to ignore transient elements on top level which will not be lost by APIs like sort
	 *   or filter
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes
	 *
	 * @public
	 * @see _CollectionCache#reset
	 */
	_Cache.prototype.hasPendingChangesForPath = function (sPath, bIgnoreKeptAlive,
			bIgnoreTransient) {
		var that = this;

		return Object.keys(this.mPatchRequests).some(function (sRequestPath) {
			return isSubPath(sRequestPath, sPath)
				&& !(bIgnoreKeptAlive
					&& that.mPatchRequests[sRequestPath].every(function (oPatchPromise) {
						return oPatchPromise.$isKeepAlive();
					}));
		}) || Object.keys(this.mPostRequests).some(function (sRequestPath) {
			return bIgnoreTransient && !sRequestPath
				? false // ignore transient elements on top level
				: isSubPath(sRequestPath, sPath)
					&& that.mPostRequests[sRequestPath].some(function (oEntityData) {
						return !oEntityData["@$ui5.context.isInactive"];
					});
		});
	};

	/**
	 * Tells whether the cache has already sent a request.
	 *
	 * @returns {boolean} <code>true</code> if the cache has sent a request
	 *
	 * @public
	 */
	_Cache.prototype.hasSentRequest = function () {
		return this.bSentRequest;
	};

	/**
	 * Patches the cache at the given path with the given data.
	 *
	 * @param {string} sPath The path (as used by change listeners)
	 * @param {object} oData The data to patch with
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the patched data
	 * @throws {Error} If the cache is shared
	 *
	 * @private
	 */
	_Cache.prototype.patch = function (sPath, oData) {
		var that = this;

		this.checkSharedRequest();
		return this.fetchValue(_GroupLock.$cached, sPath).then(function (oCacheValue) {
			_Helper.updateExisting(that.mChangeListeners, sPath, oCacheValue, oData);

			return oCacheValue;
		});
	};

	/**
	 * Refreshes a single entity within a cache.
	 * Since 1.84.0, for a kept-alive entity late properties are also taken into account.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string} sPath
	 *   The entity collection's path within this cache, may be <code>""</code>
	 * @param {number} [iIndex]
	 *   The array index of the entity to be refreshed
	 * @param {string} [sPredicate]
	 *   The key predicate of the entity; only evaluated if <code>iIndex === undefined</code>
	 * @param {boolean} [bKeepAlive]
	 *   Whether the entity is kept-alive
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves without a defined result when it is updated in the cache.
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.refreshSingle = function (oGroupLock, sPath, iIndex, sPredicate, bKeepAlive,
			fnDataRequested) {
		var that = this;

		this.checkSharedRequest();
		return this.fetchValue(_GroupLock.$cached, sPath).then(function (aElements) {
			var mQueryOptions
					= Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)),
				sReadUrl;

			if (iIndex !== undefined) {
				sPredicate = _Helper.getPrivateAnnotation(aElements[iIndex], "predicate");
			}
			sReadUrl = _Helper.buildPath(that.sResourcePath, sPath, sPredicate);
			if (bKeepAlive && that.mLateQueryOptions) {
				// bKeepAlive === true -> own cache of the list binding -> sPath === ''
				// -> no need to apply _Helper.getQueryOptionsForPath
				_Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
			}
			// drop collection related system query options
			delete mQueryOptions.$apply;
			delete mQueryOptions.$count;
			delete mQueryOptions.$filter;
			delete mQueryOptions.$orderby;
			delete mQueryOptions.$search;
			sReadUrl += that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false,
				that.bSortExpandSelect);

			that.bSentRequest = true;
			return SyncPromise.all([
				that.oRequestor
					.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested),
				that.fetchTypes()
			]).then(function (aResult) {
				var oElement = aResult[0];

				that.replaceElement(aElements, iIndex, sPredicate, oElement, aResult[1], sPath);
			});
		});
	};

	/**
	 * Refreshes a single entity within a collection cache and removes it from the cache if the
	 * filter does not match anymore.
	 * Since 1.84.0, only removes entities that do not match the filter from the cache in case they
	 * are not kept-alive. If the entity is kept-alive, checks also the existence and removes it
	 * from the cache if it is no longer exists. For a kept-alive entity late properties are taken
	 * into account.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string} sPath
	 *   The entity collection's path within this cache, may be <code>""</code>
	 * @param {number} [iIndex]
	 *   The array index of the entity to be refreshed
	 * @param {string} [sPredicate]
	 *   The key predicate of the entity; only evaluated if the <code>iIndex === undefined</code>
	 * @param {boolean} [bKeepAlive]
	 *   Whether the entity is kept-alive
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} [fnOnRemove]
	 *   A function which is called after the entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}. Since 1.84.0, if the entity is
	 *   kept-alive and still exists, the function is called with <code>true</code>, otherwise with
	 *   <code>false</code>
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> when the entity is updated in
	 *   the cache.
	 * @throws {Error} If the cache is shared
	 *
	 * @private
	 */
	_Cache.prototype.refreshSingleWithRemove = function (oGroupLock, sPath, iIndex, sPredicate,
			bKeepAlive, fnDataRequested, fnOnRemove) {
		var that = this;

		this.checkSharedRequest();
		return SyncPromise.all([
			this.fetchValue(_GroupLock.$cached, sPath),
			this.fetchTypes()
		]).then(function (aResults) {
			var aElements = aResults[0],
				oEntity,
				sInCollectionFilter,
				mInCollectionQueryOptions = {},
				sInCollectionUrl,
				sKeyFilter,
				mQueryOptions
					= Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)),
				sReadUrl,
				sReadUrlPrefix = _Helper.buildPath(that.sResourcePath, sPath),
				aRequests = [],
				mTypeForMetaPath = aResults[1];

			if (iIndex !== undefined) {
				oEntity = aElements[iIndex];
				sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate");
			} else {
				oEntity = aElements.$byPredicate[sPredicate];
			}
			sKeyFilter = _Helper.getKeyFilter(oEntity, that.sMetaPath, mTypeForMetaPath);
			sInCollectionFilter
				= (mQueryOptions.$filter ? "(" + mQueryOptions.$filter + ") and " : "")
					+ sKeyFilter;
			delete mQueryOptions.$count;
			delete mQueryOptions.$orderby;

			that.bSentRequest = true;
			if (bKeepAlive) {
				if (that.mLateQueryOptions) {
					// bKeepAlive === true -> own cache of the list binding -> sPath === ''
					// -> no need to apply _Helper.getQueryOptionsForPath
					_Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
				}
				// clone query options for possible second request to check if entity is in
				// the collection
				mInCollectionQueryOptions = Object.assign({}, mQueryOptions);
				mInCollectionQueryOptions.$filter = sInCollectionFilter;

				mQueryOptions.$filter = sKeyFilter; // load data if the entity exists
				delete mQueryOptions.$search;

				sReadUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(that.sMetaPath,
					mQueryOptions, false, that.bSortExpandSelect);
				aRequests.push(that.oRequestor.request("GET", sReadUrl, oGroupLock, undefined,
					undefined, fnDataRequested));

				if (iIndex !== undefined
						&& (sKeyFilter !== sInCollectionFilter
							|| mInCollectionQueryOptions.$search)) {
					// request no data
					delete mInCollectionQueryOptions.$select;
					delete mInCollectionQueryOptions.$expand;
					mInCollectionQueryOptions.$count = true;
					mInCollectionQueryOptions.$top = 0;

					sInCollectionUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(
						that.sMetaPath, mInCollectionQueryOptions);

					aRequests.push(that.oRequestor.request("GET", sInCollectionUrl,
						oGroupLock.getUnlockedCopy()));
				}
			} else {
				mQueryOptions.$filter = sInCollectionFilter;
				sReadUrl = sReadUrlPrefix + that.oRequestor.buildQueryString(that.sMetaPath,
					mQueryOptions, false, that.bSortExpandSelect);
				aRequests.push(that.oRequestor.request("GET", sReadUrl, oGroupLock, undefined,
					undefined, fnDataRequested));
			}

			return SyncPromise.all(aRequests).then(function (aResults) {
				var aReadResult = aResults[0].value,
					bRemoveFromCollection = aResults[1] && aResults[1]["@odata.count"] === "0";

				if (aReadResult.length > 1) {
					throw new Error(
						"Unexpected server response, more than one entity returned.");
				} else if (aReadResult.length === 0) {
					that.removeElement(aElements, iIndex, sPredicate, sPath);
					that.oRequestor.getModelInterface()
						.reportStateMessages(that.sResourcePath, {}, [sPath + sPredicate]);
					fnOnRemove(false);
				} else if (bRemoveFromCollection) {
					that.removeElement(aElements, iIndex, sPredicate, sPath);
					// element no longer in cache -> re-insert via replaceElement
					that.replaceElement(aElements, undefined, sPredicate, aReadResult[0],
						mTypeForMetaPath, sPath);
					fnOnRemove(true);
				} else {
					that.replaceElement(aElements, iIndex, sPredicate, aReadResult[0],
						mTypeForMetaPath, sPath);
				}
			});
		});
	};

	/**
	 * Registers the listener for the path. Shared caches do not register listeners because they are
	 * read-only.
	 *
	 * @param {string} sPath The path
	 * @param {object} [oListener] The listener
	 *
	 * @private
	 */
	_Cache.prototype.registerChange = function (sPath, oListener) {
		if (!this.bSharedRequest) {
			_Helper.addByPath(this.mChangeListeners, sPath, oListener);
		}
	};

	/**
	 * Removes the element at the given index from the given array, taking care of
	 * <code>$byPredicate</code>, <code>$created</code>, the array's count, and a collection cache's
	 * limit and number of active elements (if applicable).
	 *
	 * @param {object[]} aElements
	 *   The array of elements
	 * @param {number} iIndex
	 *   The array index of the old element to be removed or <code>undefined</code> in case the
	 *   element is a kept-alive element without an index
	 * @param {string} sPredicate
	 *   The key predicate of the old element to be removed
	 * @param {string} sPath
	 *   The element collection's path within this cache (as used by change listeners), may be
	 *   <code>""</code> (only in a CollectionCache)
	 * @returns {number} The index at which the element actually was (it might have moved due to
	 *   parallel insert/delete)
	 *
	 * @private
	 */
	_Cache.prototype.removeElement = function (aElements, iIndex, sPredicate, sPath) {
		var oElement,
			sTransientPredicate;

		oElement = aElements.$byPredicate[sPredicate];
		if (iIndex !== undefined) {
			// the element might have moved due to parallel insert/delete
			iIndex = _Cache.getElementIndex(aElements, sPredicate, iIndex);
			aElements.splice(iIndex, 1);
			addToCount(this.mChangeListeners, sPath, aElements, -1);
		}
		delete aElements.$byPredicate[sPredicate];
		sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");
		if (sTransientPredicate) {
			aElements.$created -= 1;
			if (!sPath) {
				this.iActiveElements -= 1;
			}
			delete aElements.$byPredicate[sTransientPredicate];
		}
		if (!sPath && iIndex !== undefined) {
			// Note: sPath is empty only in a CollectionCache, so we may use iLimit and
			// adjustReadRequests
			if (!sTransientPredicate) {
				this.iLimit -= 1; // this doesn't change Infinity
			}
			this.adjustReadRequests(iIndex, -1);
		}
		return iIndex;
	};

	/**
	 * Removes bound messages from the message model if this cache already has reported messages
	 *
	 * @public
	 */
	_Cache.prototype.removeMessages = function () {
		if (this.sReportedMessagesPath) {
			this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath, {});
			this.sReportedMessagesPath = undefined;
		}
	};

	/**
	 * Removes one from the count of pending (that is, "currently being sent to the server")
	 * requests.
	 *
	 * @private
	 */
	_Cache.prototype.removePendingRequest = function () {
		if (this.oPendingRequestsPromise) {
			this.oPendingRequestsPromise.$count -= 1;
			if (!this.oPendingRequestsPromise.$count) {
				this.oPendingRequestsPromise.$resolve();
				this.oPendingRequestsPromise = null;
			}
		}
	};

	/**
	 * Replaces the old element at the given index by the given new element and calls
	 * <code>visitResponse</code> for the new element. Updates also the reference in
	 * <code>$byPredicate</code> for the transient predicate of the old element.
	 * Since 1.84.0, if <code>iIndex === undefined</code> replaces the element in the
	 * <code>aElements.$byPredicate</code> map of the cache's element list.
	 *
	 * @param {object[]} aElements
	 *   The array of elements
	 * @param {number} [iIndex]
	 *   The array index of the old element to be replaced
	 * @param {string} sPredicate
	 *   The key predicate of the old element to be replaced
	 * @param {object} oElement
	 *   The new element
	 * @param {object} mTypeForMetaPath
	 *   A map from meta path to the entity type (as delivered by {@link #fetchTypes})
	 * @param {string} sPath
	 *   The element collection's path within this cache, may be <code>""</code>
	 *
	 * @private
	 */
	_Cache.prototype.replaceElement = function (aElements, iIndex, sPredicate, oElement,
			mTypeForMetaPath, sPath) {
		var oOldElement, sTransientPredicate;

		if (iIndex === undefined) { // kept-alive element not in the list
			aElements.$byPredicate[sPredicate] = oElement;
		} else {
			// the element might have moved due to parallel insert/delete
			iIndex = _Cache.getElementIndex(aElements, sPredicate, iIndex);
			oOldElement = aElements[iIndex];
			// _Helper.updateExisting cannot be used because navigation properties cannot be handled
			aElements[iIndex] = aElements.$byPredicate[sPredicate] = oElement;
			sTransientPredicate = _Helper.getPrivateAnnotation(oOldElement, "transientPredicate");
			if (sTransientPredicate) {
				oElement["@$ui5.context.isTransient"] = false;
				aElements.$byPredicate[sTransientPredicate] = oElement;
				_Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
			}
		}
		// Note: iStart is not needed here because we know we have key predicates
		this.visitResponse(oElement, mTypeForMetaPath,
			_Helper.getMetaPath(_Helper.buildPath(this.sMetaPath, sPath)), sPath + sPredicate);
	};

	/**
	 * Requests $count after deletion of a kept-alive element that was not in the collection.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @returns {Promise|undefined}
	 *   A promise that resolves if the count has been determined or <code>undefined</code> if no
	 *   request needed
	 *
	 * @private
	 */
	_Cache.prototype.requestCount = function (oGroupLock) {
		var sExclusiveFilter, mQueryOptions, sReadUrl,
			that = this;

		if (this.mQueryOptions && this.mQueryOptions.$count) {
			// now we are definitely in a CollectionCache
			mQueryOptions = Object.assign({}, this.mQueryOptions);
			delete mQueryOptions.$expand;
			delete mQueryOptions.$orderby;
			delete mQueryOptions.$select;
			sExclusiveFilter = this.getFilterExcludingCreated();
			if (sExclusiveFilter) {
				mQueryOptions.$filter = mQueryOptions.$filter
					? "(" + mQueryOptions.$filter + ") and " + sExclusiveFilter
					: sExclusiveFilter;
			}
			mQueryOptions.$top = 0;
			sReadUrl = this.sResourcePath
				+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions);

			return this.oRequestor.request("GET", sReadUrl, oGroupLock.getUnlockedCopy())
				.catch(function (oError) {
					if (oError.cause && oError.cause.status === 404) {
						// retry because the deletion in the same $batch was rejected with 404
						return that.oRequestor.request("GET", sReadUrl,
							oGroupLock.getUnlockedCopy());
					}
					throw oError;
				}).then(function (oResult) {
					var iCount = parseInt(oResult["@odata.count"]) + that.iActiveElements;

					setCount(that.mChangeListeners, "", that.aElements, iCount);
					that.iLimit = iCount;
				});
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
	_Cache.prototype.resetChangesForPath = function (sPath) {
		var that = this;

		Object.keys(this.mPatchRequests).forEach(function (sRequestPath) {
			var aPromises, i;

			if (isSubPath(sRequestPath, sPath)) {
				aPromises = that.mPatchRequests[sRequestPath];
				for (i = aPromises.length - 1; i >= 0; i -= 1) {
					that.oRequestor.removePatch(aPromises[i]);
				}
				delete that.mPatchRequests[sRequestPath];
			}
		});

		Object.keys(this.mPostRequests).forEach(function (sRequestPath) {
			var aEntities, sTransientGroup, i;

			if (isSubPath(sRequestPath, sPath)) {
				aEntities = that.mPostRequests[sRequestPath];
				for (i = aEntities.length - 1; i >= 0; i -= 1) {
					sTransientGroup = _Helper.getPrivateAnnotation(aEntities[i], "transient");
					if (!sTransientGroup.startsWith("$inactive.")) {
						// this also cleans up that.mPostRequests
						that.oRequestor.removePost(sTransientGroup, aEntities[i]);
					}
				}
			}
		});
	};

	/**
	 * Adds or removes a usage of this cache. A cache with active usages must not be destroyed.
	 * If a usage is removed, all change listeners are removed too. Note: shared caches have no
	 * listeners.
	 *
	 * @param {boolean} bActive
	 *   Whether a usage is added or removed
	 *
	 * @public
	 */
	_Cache.prototype.setActive = function (bActive) {
		if (bActive) {
			this.iActiveUsages += 1;
			this.iInactiveSince = Infinity;
		} else {
			this.iActiveUsages -= 1;
			if (!this.iActiveUsages) {
				this.iInactiveSince = Date.now();
			}
			this.mChangeListeners = {}; // Note: shared caches have no listeners anyway
		}
	};

	/**
	 * Sets query options after the cache has sent a request to allow adding late properties.
	 * Accepts only $expand and $select.
	 *
	 * @param {object} mQueryOptions
	 *   The new late query options or <code>null</code> to reset
	 *
	 * @public
	 * @see #getLateQueryOptions
	 * @see #hasSentRequest
	 */
	_Cache.prototype.setLateQueryOptions = function (mQueryOptions) {
		if (mQueryOptions) {
			this.mLateQueryOptions = {
				// must contain both properties for requestSideEffects
				// ensure that $select precedes $expand in the resulting query
				$select : mQueryOptions.$select,
				$expand : mQueryOptions.$expand
			};
		} else {
			this.mLateQueryOptions = null;
		}
	};

	/**
	 * Updates the property of the given name with the given new value without sending a PATCH
	 * request.
	 *
	 * @param {string} sPropertyPath
	 *   Path of the property to update, relative to the entity
	 * @param {any} vValue
	 *   The new value
	 * @param {string} [sEntityPath]
	 *   Path of the entity, relative to the cache (as used by change listeners)
	 * @returns {Promise}
	 *   A promise which resolves with <code>undefined</code> once the value has been set, or is
	 *   rejected with an error if setting fails somehow
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.setProperty = function (sPropertyPath, vValue, sEntityPath) {
		var that = this;

		this.checkSharedRequest();
		return this.fetchValue(_GroupLock.$cached, sEntityPath, null, null, true)
			.then(function (oEntity) {
				_Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity,
					_Cache.makeUpdateData(sPropertyPath.split("/"), vValue));
			});
	};

	/**
	 * Updates this cache's query options if it has not yet sent a request.
	 *
	 * @param {object} [mQueryOptions]
	 *   The new query options
	 * @param {boolean} [bForce]
	 *   Forces an update even if a request has been already sent
	 * @throws {Error}
	 *   If the cache has already sent a request or if the cache is shared
	 *
	 * @public
	 * @see #getQueryOptions
	 * @see #hasSentRequest
	 */
	_Cache.prototype.setQueryOptions = function (mQueryOptions, bForce) {
		this.checkSharedRequest();
		if (this.bSentRequest && !bForce) {
			throw new Error("Cannot set query options: Cache has already sent a request");
		}

		this.mQueryOptions = mQueryOptions;
		this.sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false,
			this.bSortExpandSelect);
	};

	/**
	 * Sets the given resource path and the corresponding meta path. May only be called from outside
	 * if the cache's resource is an operation and its return value a single entity. The new
	 * resource path must be the canonical path of this entity. This path is then used for partial
	 * requests on this entity (late property requests or single row refreshes in an aggregated
	 * collection).
	 *
	 * @param {string} sResourcePath The new resource path
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.setResourcePath = function (sResourcePath) {
		this.checkSharedRequest();

		this.sResourcePath = sResourcePath;
		this.sMetaPath = _Helper.getMetaPath("/" + sResourcePath);

		this.oTypePromise = undefined;

		// the query options extended by $select for late properties
		this.mLateQueryOptions = null;
		// map from resource path to request Promise for pending late property requests
		this.mPropertyRequestByPath = {};
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 *
	 * @public
	 */
	_Cache.prototype.toString = function () {
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
	 * @param {function} [fnErrorCallback]
	 *   A function which is called with an Error object each time a PATCH request fails; if it is
	 *   missing, the PATCH is not retried, but this method's returned promise is rejected
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sEntityPath]
	 *   Path of the entity, relative to the cache (as used by change listeners)
	 * @param {string} [sUnitOrCurrencyPath]
	 *   Path of the unit or currency for the property, relative to the entity
	 * @param {boolean} [bPatchWithoutSideEffects]
	 *   Whether the PATCH response is ignored, except for a new ETag
	 * @param {function} fnPatchSent
	 *   The function is called just before a back-end request is sent for the first time.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} fnIsKeepAlive
	 *   A function to tell whether the entity is kept-alive
	 * @returns {Promise}
	 *   A promise for the PATCH request (resolves with <code>undefined</code>); rejected in case of
	 *   cancellation or if no <code>fnErrorCallback</code> is given
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.update = function (oGroupLock, sPropertyPath, vValue, fnErrorCallback,
			sEditUrl, sEntityPath, sUnitOrCurrencyPath, bPatchWithoutSideEffects, fnPatchSent,
			fnIsKeepAlive) {
		var oPromise,
			aPropertyPath = sPropertyPath.split("/"),
			aUnitOrCurrencyPath,
			that = this;

		this.checkSharedRequest();

		try {
			oPromise = this.fetchValue(_GroupLock.$cached, sEntityPath);
		} catch (oError) {
			if (!oError.$cached || this.oPromise !== null) {
				throw oError;
			}
			// data has not been read, fake it
			// Note: we need a unique "entity" instance to avoid merging of unrelated PATCH requests
			// and sharing of data across bindings - the instance is modified below!
			oPromise = this.oPromise = SyncPromise.resolve({"@odata.etag" : "*"});
		}

		return oPromise.then(function (oEntity) {
			var sFullPath = _Helper.buildPath(sEntityPath, sPropertyPath),
				sGroupId = oGroupLock.getGroupId(),
				vOldValue,
				oPatchPromise,
				oPostBody,
				sParkedGroup,
				sTransientGroup,
				sUnitOrCurrencyValue,
				oUpdateData = _Cache.makeUpdateData(aPropertyPath, vValue);

			/*
			 * Synchronous callback to cancel the PATCH request so that it is really gone when
			 * resetChangesForPath has been called on the binding or model.
			 */
			function onCancel() {
				_Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity,
					_Cache.makeUpdateData(aPropertyPath, vOldValue));
			}

			function patch(oPatchGroupLock, bAtFront) {
				var mHeaders = {"If-Match" : oEntity},
					oRequestLock;

				/*
				 * Synchronous callback called when the request is put on the wire. Locks the group
				 * so that further requests created via {@link ODataModel#submitBatch} wait until
				 * this request has returned and its response is applied to the cache.
				 */
				function onSubmit() {
					oRequestLock = that.oRequestor.lockGroup(sGroupId, that, true);
					fnPatchSent();
				}

				if (bPatchWithoutSideEffects) {
					mHeaders.Prefer = "return=minimal";
				}
				oPatchPromise = that.oRequestor.request("PATCH", sEditUrl, oPatchGroupLock,
					mHeaders, oUpdateData, onSubmit, onCancel, /*sMetaPath*/undefined,
					_Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath),
					bAtFront);
				oPatchPromise.$isKeepAlive = fnIsKeepAlive;
				_Helper.addByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				return SyncPromise.all([
					oPatchPromise,
					that.fetchTypes()
				]).then(function (aResult) {
					var oPatchResult = aResult[0];

					_Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
					if (!bPatchWithoutSideEffects) {
						// visit response to report the messages
						that.visitResponse(oPatchResult, aResult[1],
							_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sEntityPath)),
							sEntityPath
						);
					}
					// update the cache with the PATCH response
					_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity,
						bPatchWithoutSideEffects
						? {"@odata.etag" : oPatchResult["@odata.etag"]}
						: oPatchResult);
				}, function (oError) {
					var sRetryGroupId = sGroupId;

					if (!fnErrorCallback) {
						onCancel();
						throw oError;
					}
					_Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
					if (oError.canceled) {
						throw oError;
					}

					// Note: We arrive here only for the PATCH which was really sent to the server.
					// The other ones which have been merged are still pending on this one!
					// In the end, they will either succeed or be canceled.
					fnErrorCallback(oError);
					switch (that.oRequestor.getGroupSubmitMode(sGroupId)) {
						case "API":
							break;
						case "Auto":
							if (!that.oRequestor.hasChanges(sGroupId, oEntity)) {
								// park PATCH until another change to this entity happens
								// Note: At most one change per entity is parked (see above), thus
								// order does not matter and bAtFront = true is OK!
								sRetryGroupId = "$parked." + sGroupId;
							}
							break;
						default:
							throw oError; // no retry, just give up
					}
					oRequestLock.unlock();
					oRequestLock = undefined;

					return patch(that.oRequestor.lockGroup(sRetryGroupId, that, true, true), true);
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
				if (typeof sTransientGroup !== "string") {
					throw new Error("No 'update' allowed while waiting for server response");
				}
				if (sTransientGroup.startsWith("$parked.")
						|| sTransientGroup.startsWith("$inactive.")) {
					sParkedGroup = sTransientGroup;
					sTransientGroup = sTransientGroup.slice(sTransientGroup.indexOf(".") + 1);
				}
				if (sTransientGroup !== sGroupId) {
					throw new Error("The entity will be created via group '" + sTransientGroup
						+ "'. Cannot patch via group '" + sGroupId + "'");
				}
			}
			// remember the old value
			vOldValue = _Helper.drillDown(oEntity, aPropertyPath);
			oPostBody = _Helper.getPrivateAnnotation(oEntity, "postBody");
			if (oPostBody) {
				// change listeners are informed later
				_Helper.updateAll({}, sEntityPath, oPostBody, oUpdateData);
				if (oEntity["@$ui5.context.isInactive"]) {
					oUpdateData["@$ui5.context.isInactive"] = false;
					that.iActiveElements += 1;
					addToCount(that.mChangeListeners, "", that.aElements, 1);
				}
			}
			// write the changed value into the cache
			_Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sUnitOrCurrencyPath) {
				aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
				sUnitOrCurrencyPath = _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath);
				sUnitOrCurrencyValue = that.getValue(sUnitOrCurrencyPath);
				if (sUnitOrCurrencyValue === undefined) {
					Log.debug("Missing value for unit of measure " + sUnitOrCurrencyPath
							+ " when updating " + sFullPath, that.toString(), sClassName);
				} else {
					// some servers need unit and currency information
					_Helper.merge(sTransientGroup ? oPostBody : oUpdateData,
						_Cache.makeUpdateData(aUnitOrCurrencyPath, sUnitOrCurrencyValue));
				}
			}
			if (sTransientGroup) {
				// When updating a transient entity, _Helper.updateAll has already updated the
				// POST request.
				if (sParkedGroup) {
					_Helper.setPrivateAnnotation(oEntity, "transient", sTransientGroup);
					that.oRequestor.relocate(sParkedGroup, oPostBody, sTransientGroup);
				}
				oGroupLock.unlock();
				return Promise.resolve();
			}
			// Note: there should be only *one* parked PATCH per entity, but we don't rely on that
			that.oRequestor.relocateAll("$parked." + sGroupId, sGroupId, oEntity);
			// send and register the PATCH request
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return patch(oGroupLock);
		});
	};

	/**
	 * Processes the response from the server. All arrays are annotated by their length, influenced
	 * by the annotations "@odata.count" and "@odata.nextLink". Recursively calculates the key
	 * predicates for all entities in the result. Collects and reports OData messages via
	 * {@link sap.ui.model.odata.v4.lib._Requestor#reportStateMessages}.
	 *
	 * @param {any} oRoot An OData response, arrays or simple values are wrapped into an object as
	 *   property "value"
	 * @param {object} mTypeForMetaPath A map from absolute meta path to entity type (as delivered
	 *   by {@link #fetchTypes})
	 * @param {string} [sRootMetaPath=this.sMetaPath] The absolute meta path for <code>oRoot</code>
	 * @param {string} [sRootPath=""] Path to <code>oRoot</code>, relative to the cache; used to
	 *   compute the target property of messages
	 * @param {boolean} [bKeepTransientPath] Whether the transient path shall be used to report
	 *   messages
	 * @param {number} [iStart]
	 *    The index in the collection where "oRoot.value" needs to be inserted or undefined if
	 *    "oRoot" references a single entity
	 *
	 * @private
	 */
	_Cache.prototype.visitResponse = function (oRoot, mTypeForMetaPath, sRootMetaPath, sRootPath,
			bKeepTransientPath, iStart) {
		var aCachePaths,
			bHasMessages = false,
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
		 * @param {any[]} aInstances The collection
		 * @param {string} sMetaPath The meta path of the collection in mTypeForMetaPath
		 * @param {string} sCollectionPath The path of the collection
		 * @param {string} sContextUrl The context URL for message longtexts
		 */
		function visitArray(aInstances, sMetaPath, sCollectionPath, sContextUrl) {
			var mByPredicate = {},
				iIndex,
				vInstance,
				sPredicate,
				i;

			for (i = 0; i < aInstances.length; i += 1) {
				vInstance = aInstances[i];
				iIndex = sCollectionPath === "" ? iStart + i : i;

				if (vInstance && typeof vInstance === "object") {
					visitInstance(vInstance, sMetaPath, sCollectionPath, sContextUrl, iIndex);
					sPredicate = _Helper.getPrivateAnnotation(vInstance, "predicate");
					if (!sCollectionPath) {
						// remember the key predicates / indices of the root entries to remove all
						// messages for entities that have been read
						aCachePaths.push(sPredicate || iIndex.toString());
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
		 * @param {number} [iIndex]
		 *    The index in the collection if the instance is part of a collection
		 */
		function visitInstance(oInstance, sMetaPath, sInstancePath, sContextUrl, iIndex) {
			var aMatches,
				sPredicate,
				oType = mTypeForMetaPath[sMetaPath],
				sMessageProperty = oType && oType[sMessagesAnnotation]
					&& oType[sMessagesAnnotation].$Path,
				aMessages;

			sContextUrl = buildContextUrl(sContextUrl, oInstance["@odata.context"]);
			sPredicate = that.calculateKeyPredicate(oInstance, mTypeForMetaPath, sMetaPath);
			if (iIndex !== undefined) {
				sInstancePath = _Helper.buildPath(sInstancePath, sPredicate || iIndex);
			} else if (!bKeepTransientPath && sPredicate) {
				aMatches = rEndsWithTransientPredicate.exec(sInstancePath);
				if (aMatches) {
					sInstancePath = sInstancePath.slice(0, -aMatches[0].length) + sPredicate;
				}
			}
			if (sRootPath && !aCachePaths) {
				// remove messages only for the part of the cache that is updated
				aCachePaths = [sInstancePath];
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

				if (sProperty.endsWith("@odata.mediaReadLink")
						|| sProperty.endsWith("@mediaReadLink")) {
					oInstance[sProperty] = _Helper.makeAbsolute(vPropertyValue, sContextUrl);
				}
				if (sProperty === sMessageProperty || sProperty.includes("@")) {
					return; // ignore message property and other annotations
				}
				if (Array.isArray(vPropertyValue)) {
					vPropertyValue.$created = 0; // number of (client-side) created elements
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

		if (iStart !== undefined) {
			aCachePaths = [];
			visitArray(oRoot.value, sRootMetaPath || this.sMetaPath, "",
				buildContextUrl(sRequestUrl, oRoot["@odata.context"]));
		} else if (oRoot && typeof oRoot === "object") {
			visitInstance(oRoot, sRootMetaPath || this.sMetaPath, sRootPath || "", sRequestUrl);
		}
		if (bHasMessages) {
			this.sReportedMessagesPath = this.getOriginalResourcePath(oRoot);
			this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath,
				mPathToODataMessages, aCachePaths);
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, the cache is read-only and modifying calls lead to an error.
	 *
	 * @alias sap.ui.model.odata.v4.lib._CollectionCache
	 * @constructor
	 */
	function _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest) {
		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, function () {
				return sDeepResourcePath;
			}, bSharedRequest);

		this.iActiveElements = 0; // number of active (client-side) created elements
		this.oBackup = null; // see #reset
		this.sContext = undefined; // the "@odata.context" from the responses
		this.aElements = []; // the available elements
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // see setCount
		// number of all (client-side) created elements (active or inactive)
		this.aElements.$created = 0;
		this.aElements.$tail = undefined; // promise for a read w/o $top
		// upper limit for @odata.count, maybe sharp; assumes #getQueryString can $filter out all
		// created elements
		this.iLimit = Infinity;
		// an array of objects with ranges for pending read requests; each having the following
		// properties:
		// - iStart: the start (inclusive)
		// - iEnd: the end (exclusive)
		this.aReadRequests = [];
		this.bServerDrivenPaging = false;
		this.oSyncPromiseAll = undefined;
	}

	// make CollectionCache a Cache
	_CollectionCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Adds the element to $byPredicate of the cache's element list.
	 *
	 * @param {object} oElement - The element
	 *
	 * @public
	 */
	_CollectionCache.prototype.addKeptElement = function (oElement) {
		this.aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")] = oElement;
	};

	/**
	 * Adjusts the indices for read requests.
	 *
	 * @param {number} iIndex The index at which an element has been added or removed
	 * @param {number} iOffset The offset to add to the indices
	 *
	 * @private
	 */
	_CollectionCache.prototype.adjustReadRequests = function (iIndex, iOffset) {
		this.aReadRequests.forEach(function (oReadRequest) {
			if (oReadRequest.iStart >= iIndex) {
				oReadRequest.iStart += iOffset;
				oReadRequest.iEnd += iOffset;
			} // Note: no changes can happen inside *gaps*
		});
	};

	/**
	 * Creates an empty element for the given predicate to the cache, adds it to the cache and
	 * returns it.
	 *
	 * @param {string} sPredicate - The predicate
	 * @returns {object} The empty element
	 *
	 * @public
	 */
	_CollectionCache.prototype.createEmptyElement = function (sPredicate) {
		var oElement = {};

		_Helper.setPrivateAnnotation(oElement, "predicate", sPredicate);
		this.aElements.$byPredicate[sPredicate] = oElement;

		return oElement;
	};

	/**
	 * Replaces the old element at the given index with the given new element.
	 *
	 * @param {number} iIndex - The index
	 * @param {object} oElement - The new element
	 *
	 * @public
	 */
	_CollectionCache.prototype.doReplaceWith = function (iIndex, oElement) {
		this.aElements[iIndex] = oElement;
		this.addKeptElement(oElement); // maintain $byPredicate
	};

	/**
	 * Returns a promise to be resolved (synchronously if possible) with an OData object for the
	 * requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [_fnDataRequested]
	 *   The function is called just before the back-end request is sent; unused in CollectionCache
	 *   as only late property requests may occur
	 * @param {object} [oListener]
	 *   A change listener that is added for the given path. Its method <code>onChange</code> is
	 *   called with the new value if the property at that path is modified later
	 * @param {boolean} [bCreateOnDemand]
	 *   Whether to create missing objects on demand, in order to avoid drill-down errors
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested data. It is rejected if the request for the
	 *   data failed.
	 * @throws {Error}
	 *   If the group ID is '$cached' and the value is not cached (the error has a property
	 *   <code>$cached = true</code> then)
	 *
	 * @public
	 */
	_CollectionCache.prototype.fetchValue = function (oGroupLock, sPath, _fnDataRequested,
			oListener, bCreateOnDemand) {
		var aElements,
			sFirstSegment = sPath.split("/")[0],
			oSyncPromise,
			that = this;

		oGroupLock.unlock();
		if (this.aElements.$byPredicate[sFirstSegment]) {
			oSyncPromise = SyncPromise.resolve(); // sync access possible
		} else if ((oGroupLock === _GroupLock.$cached || sFirstSegment !== "$count")
				&& this.aElements[sFirstSegment] !== undefined) {
			// sync access might be possible
			oSyncPromise = SyncPromise.resolve(this.aElements[sFirstSegment]);
		} else {
			if (!this.oSyncPromiseAll) {
				// wait for all reads to be finished, this is essential for a new $count and for
				// finding the index of an unknown key predicate
				aElements = this.aElements.$tail
					? this.aElements.concat(this.aElements.$tail)
					: this.aElements;
				this.oSyncPromiseAll = SyncPromise.all(aElements);
			}
			oSyncPromise = this.oSyncPromiseAll;
		}

		return oSyncPromise.then(function () {
			// register afterwards to avoid that updateExisting fires updates before the first
			// response
			that.registerChange(sPath, oListener);
			return that.drillDown(that.aElements, sPath, oGroupLock, bCreateOnDemand);
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
	_CollectionCache.prototype.fill = function (oPromise, iStart, iEnd) {
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
		for (i = iStart; i < iEnd; i += 1) {
			this.aElements[i] = oPromise;
		}
		this.oSyncPromiseAll = undefined; // from now on, fetchValue has to wait again
	};

	/**
	 * Returns a filter that excludes all created entities in this cache's collection.
	 *
	 * @returns {string|undefined}
	 *   The filter or <code>undefined</code> if there is no created entity.
	 *
	 * @private
	 */
	_CollectionCache.prototype.getFilterExcludingCreated = function () {
		var oElement,
			sKeyFilter,
			aKeyFilters = [],
			mTypeForMetaPath,
			i;

		for (i = 0; i < this.aElements.$created; i += 1) {
			oElement = this.aElements[i];
			if (!oElement["@$ui5.context.isTransient"]) {
				mTypeForMetaPath = mTypeForMetaPath
					|| this.fetchTypes().getResult(); // Note: $metadata already read
				sKeyFilter = _Helper.getKeyFilter(oElement, this.sMetaPath, mTypeForMetaPath);
				if (sKeyFilter) {
					aKeyFilters.push(sKeyFilter);
				}
			}
		}

		return aKeyFilters.length ? "not (" + aKeyFilters.sort().join(" or ") + ")" : undefined;
	};

	/**
	 * Returns the query string with $filter adjusted as needed to exclude non-transient created
	 * elements (which have all key properties available).
	 *
	 * @returns {string}
	 *   The query string; it is empty if there are no options; it starts with "?" otherwise
	 *
	 * @private
	 */
	_CollectionCache.prototype.getQueryString = function () {
		var sExclusiveFilter = this.getFilterExcludingCreated(),
			mQueryOptions = Object.assign({}, this.mQueryOptions),
			sFilterOptions = mQueryOptions.$filter,
			sQueryString = this.sQueryString;

		if (sExclusiveFilter) {
			if (sFilterOptions) {
				mQueryOptions.$filter = "(" + sFilterOptions + ") and " + sExclusiveFilter;
				sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions,
					false, this.bSortExpandSelect);
			} else {
				sQueryString += (sQueryString ? "&" : "?") + "$filter="
					+ _Helper.encode(sExclusiveFilter, false);
			}
		}

		return sQueryString;
	};

	/**
	 * Returns the resource path including the query string with $skip and $top if needed.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @returns {string}
	 *   The resource path including the query string
	 * @throws {Error}
	 *   If there are created elements inside the given range
	 *
	 * @private
	 */
	_CollectionCache.prototype.getResourcePathWithQuery = function (iStart, iEnd) {
		var iCreated = this.aElements.$created,
			sQueryString = this.getQueryString(),
			sDelimiter = sQueryString ? "&" : "?",
			iExpectedLength = iEnd - iStart,
			sResourcePath = this.sResourcePath + sQueryString;

		if (iStart < iCreated) {
			throw new Error("Must not request created element");
		}

		iStart -= iCreated;
		if (iStart > 0 || iExpectedLength < Infinity) {
			sResourcePath += sDelimiter + "$skip=" + iStart;
		}
		if (iExpectedLength < Infinity) {
			sResourcePath += "&$top=" + iExpectedLength;
		}
		return sResourcePath;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getValue
	 */
	_CollectionCache.prototype.getValue = function (sPath) {
		var oSyncPromise;

		if (!sPath) {
			return this.aElements;
		}
		oSyncPromise = this.fetchValue(_GroupLock.$cached, sPath);
		if (oSyncPromise.isFulfilled()) {
			return oSyncPromise.getResult();
		}
		oSyncPromise.caught();
	};

	/**
	 * Handles a GET response by updating $count and friends.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID, used only in case $count needs to be requested
	 * @param {number} iTransientElements
	 *   The number of transient elements within the given group before the GET request
	 * @param {number} iStart - The start index of the read range (gap) in client coordinates
	 * @param {number} iEnd - The exclusive end index
	 * @param {object} oResult - The result of the GET request (only used for annotations)
	 * @param {object[]} oResult.value - Only used to access the original length incl. iFiltered
	 * @param {number} iFiltered - Number of newly created elements contained in the given result
	 * @returns {Promise|undefined}
	 *   A promise that resolves if the count has been determined or <code>undefined</code> if no
	 *   request needed
	 *
	 * @private
	 */
	_CollectionCache.prototype.handleCount = function (oGroupLock, iTransientElements, iStart, iEnd,
			oResult, iFiltered) {
		var sCount = oResult["@odata.count"],
			iCreated = this.aElements.$created,
			iFilteredCount,
			iLimit = -1,
			iOld$count = this.aElements.$count,
			oRequestCountPromise,
			iResultLength = oResult.value.length,
			i;

		// simulate #getFilterExcludingCreated for newly created persisted
		iEnd -= iFiltered;
		iResultLength -= iFiltered;

		if (sCount) {
			iFilteredCount = parseInt(sCount) - iFiltered;
			// client-side filter met all transient elements or we've seen everything there is
			if (iFiltered === iTransientElements
					|| iStart === iCreated && iResultLength === iFilteredCount) {
				this.iLimit = iLimit = iFilteredCount;
			} else {
				oRequestCountPromise
					= this.requestCount(this.oRequestor.getUnlockedAutoCopy(oGroupLock));
			}
		}
		if (oResult["@odata.nextLink"]) { // server-driven paging
			this.bServerDrivenPaging = true;
			if (iEnd < this.aElements.length) { // "inner" gap: do not remove elements behind gap
				for (i = iStart + iResultLength; i < iEnd; i += 1) {
					delete this.aElements[i];
				}
			} else { // gap at end: shorten array
				this.aElements.length = iStart + iResultLength;
			}
		} else if (iResultLength < iEnd - iStart) { // short read
			if (iLimit === -1) {
				// use formerly computed $count
				iLimit = iOld$count && iOld$count - this.iActiveElements;
			}
			iLimit = Math.min(
				iLimit !== undefined ? iLimit : Infinity,
				// length determined from the short read
				iStart - iCreated + iResultLength);
			this.aElements.length = iCreated + iLimit;
			this.iLimit = iLimit;
			// If the server did not send a count, the calculated count is greater than 0
			// and the element before has not been read yet, we do not know the count:
			// The element might or might not exist.
			if (!sCount && iLimit > 0 && !this.aElements[iLimit - 1]) {
				iLimit = undefined;
			}
		}
		if (iLimit !== -1) {
			setCount(this.mChangeListeners, "", this.aElements,
				iLimit !== undefined ? iLimit + this.iActiveElements : undefined);
		}

		return oRequestCountPromise;
	};

	/**
	 * Handles a GET response by updating the cache data; filters out newly created elements and
	 * overwrites the corresponding <code>SyncPromise</code> with <code>undefined</code>.
	 *
	 * @param {object} oResult - The result of the GET request
	 * @param {number} iStart - The start index of the GET's range in this.aElements
	 * @param {object} mTypeForMetaPath
	 *   A map from meta path to the entity type (as delivered by {@link #fetchTypes})
	 * @returns {number}
	 *   The number of newly created elements filtered out from the given result
	 *
	 * @private
	 */
	_CollectionCache.prototype.handleResponse = function (oResult, iStart, mTypeForMetaPath) {
		var oElement,
			aElements = this.aElements,
			iCreated = aElements.$created,
			oKeptElement,
			iOffset = 0,
			sPredicate,
			iResultLength = oResult.value.length,
			i;

		this.sContext = oResult["@odata.context"];
		this.visitResponse(oResult, mTypeForMetaPath, undefined, undefined, undefined, iStart);
		for (i = 0; i < iResultLength; i += 1) {
			oElement = oResult.value[i];
			sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
			if (sPredicate) {
				oKeptElement = aElements.$byPredicate[sPredicate];
				if (oKeptElement) {
					// we expect the server to always or never send an ETag for this entity
					if (!oKeptElement["@odata.etag"]
							|| oElement["@odata.etag"] === oKeptElement["@odata.etag"]) {
						if (iCreated && aElements.lastIndexOf(oKeptElement, iCreated - 1) >= 0) {
							// client-side filter for newly created persisted
							iOffset += 1;
							aElements[iStart + iResultLength - iOffset] = undefined;
							continue;
						}
						_Helper.updateNonExisting(oKeptElement, oElement);
						oElement = oKeptElement;
					} else if (this.hasPendingChangesForPath(sPredicate)) {
						throw new Error("Modified on client and on server: "
							+ this.sResourcePath + sPredicate);
					} // else: if POST and GET are in the same $batch, ETag cannot differ!
				}
				aElements.$byPredicate[sPredicate] = oElement;
			}
			aElements[iStart + i - iOffset] = oElement;
		}

		return iOffset;
	};

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 * Calculates the key predicates for all entities in the result before the promise is resolved.
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
	 *   <code>Infinity</code> is supported. In case server-driven paging (@odata.nextLink) has been
	 *   encountered before, this parameter is ignored.
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
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	_CollectionCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested) {
		var iCreatedPersisted = 0,
			oElement,
			aElementsRange,
			iEnd,
			oPromise = this.oPendingRequestsPromise || this.aElements.$tail,
			aReadIntervals,
			iTransientElements = 0,
			i,
			that = this;

		if (iIndex < 0) {
			throw new Error("Illegal index " + iIndex + ", must be >= 0");
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		}

		if (oPromise) {
			return oPromise.then(function () {
				return that.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested);
			});
		}

		for (i = 0; i < this.aElements.$created; i += 1) {
			oElement = this.aElements[i];
			if (_Helper.getPrivateAnnotation(oElement, "transient") === oGroupLock.getGroupId()) {
				// prepare for client-side filter for newly created persisted (see #handleResponse)
				iTransientElements += 1;
			}
			if (that.oBackup && !oElement["@$ui5.context.isTransient"]) {
				// count persisted inline creation rows which are refreshed separately during a
				// side-effects refresh (see #refreshKeptElements) and might be deleted on server;
				// increase prefetch to compensate for our exclusive filter (see
				// #getFilterExcludingCreated) (JIRA: CPOUI5ODATAV4-1521)
				iCreatedPersisted += 1;
			}
		}
		aReadIntervals = ODataUtils._getReadIntervals(this.aElements, iIndex, iLength,
				this.bServerDrivenPaging
				? 0
				: Math.max(iPrefetchLength, iTransientElements, iCreatedPersisted),
				this.aElements.$created + this.iLimit);

		if (iTransientElements
			 && (aReadIntervals.length > 1
				|| aReadIntervals.length && aReadIntervals[0].start > this.aElements.$created)) {
			oGroupLock.unlock();

			return this.oRequestor.waitForBatchResponseReceived(oGroupLock.getGroupId())
				.then(function () {
					return that.read(iIndex, iLength, iPrefetchLength,
						that.oRequestor.getUnlockedAutoCopy(oGroupLock), fnDataRequested);
				});
		}

		aReadIntervals.forEach(function (oInterval) {
				that.requestElements(oInterval.start, oInterval.end, oGroupLock.getUnlockedCopy(),
					iTransientElements, fnDataRequested);
				fnDataRequested = undefined;
			});

		oGroupLock.unlock();

		iEnd = iIndex + iLength + iPrefetchLength;
		aElementsRange = this.aElements.slice(iIndex, iEnd);
		if (this.aElements.$tail && iEnd > this.aElements.length) {
			aElementsRange.push(this.aElements.$tail);
		}
		return SyncPromise.all(aElementsRange).then(function () {
			var aElements = that.aElements.slice(iIndex, iIndex + iLength);

			aElements.$count = that.aElements.$count;

			return {
				"@odata.context" : that.sContext,
				value : aElements
			};
		});
	};

	/**
	 * Refreshes the kept-alive elements. This needs to be called before the cache has filled the
	 * collection. In that state the $byPredicate contains only the kept-alive and created elements.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {function(string,number)} fnOnRemove
	 *   A function which is called with predicate and index if a kept-alive or created element does
	 *   no longer exist after refresh; the index is undefined for a non-created element
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise resolving without a defined result, or rejecting with an error if the refresh
	 *   fails, or <code>undefined</code> if there are no kept-alive elements.
	 *
	 * @public
	 */
	_CollectionCache.prototype.refreshKeptElements = function (oGroupLock, fnOnRemove) {
		var that = this,
			// Note: at this time only kept-alive and created elements are in the cache, but we
			// don't care if $byPredicate still contains two entries for the same element
			aPredicates = Object.keys(this.aElements.$byPredicate).filter(isRefreshNeeded).sort(),
			mTypes;

		/*
		 * Calculates a query to request the kept-alive elements.
		 *
		 * @returns {string}
		 *   A query to request the kept-alive elements
		 */
		function calculateKeptElementsQuery() {
			var aKeyFilters,
				mQueryOptions = _Helper.merge({}, that.mQueryOptions);

			if (that.mLateQueryOptions) {
				_Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
			}
			delete mQueryOptions.$count;
			delete mQueryOptions.$orderby;
			delete mQueryOptions.$search;

			aKeyFilters = aPredicates.map(function (sPredicate) {
				return _Helper.getKeyFilter(that.aElements.$byPredicate[sPredicate], that.sMetaPath,
					mTypes);
			});
			mQueryOptions.$filter = aKeyFilters.join(" or ");
			if (aKeyFilters.length > 1) {
				// avoid small default page size for server-driven paging
				mQueryOptions.$top = aKeyFilters.length;
			}

			return that.sResourcePath
				+ that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false, true);
		}

		/*
		 * Tells whether a refresh is needed for the given predicate. Transient predicates and
		 * elements with pending changes need no refresh.
		 *
		 * @param {string} sPredicate - A key predicate
		 * @returns {boolean} - Whether a refresh is needed
		 */
		function isRefreshNeeded(sPredicate) {
			var oElement = that.aElements.$byPredicate[sPredicate];

			return _Helper.getPrivateAnnotation(oElement, "predicate") === sPredicate
				&& !that.hasPendingChangesForPath(sPredicate);
		}

		if (aPredicates.length === 0) {
			return undefined;
		}

		mTypes = this.fetchTypes().getResult(); // in this stage the promise is resolved

		return this.oRequestor.request("GET", calculateKeptElementsQuery(), oGroupLock)
			.then(function (oResponse) {
				var mStillAliveElements;

				that.visitResponse(oResponse, mTypes, undefined, undefined, undefined, 0);
				mStillAliveElements = oResponse.value.$byPredicate || {};

				aPredicates.forEach(function (sPredicate) {
					var oElement, iIndex;

					if (sPredicate in mStillAliveElements) {
						_Helper.updateAll(that.mChangeListeners, sPredicate,
							that.aElements.$byPredicate[sPredicate],
							mStillAliveElements[sPredicate]);
					} else {
						oElement = that.aElements.$byPredicate[sPredicate];
						if (_Helper.getPrivateAnnotation(oElement, "transientPredicate")) {
							iIndex = that.removeElement(that.aElements, -1, sPredicate, "");
						} else {
							delete that.aElements.$byPredicate[sPredicate];
						}
						fnOnRemove(sPredicate, iIndex);
					}
				});
			});
	};

	/**
	 * Requests the elements in the given range and places them into the aElements list. Calculates
	 * the key predicates for all entities in the result before the promise is resolved. While the
	 * request is running, all indices in this range contain the Promise.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {number} iTransientElements
	 *   The number of transient elements within the given group
	 * @param {function} [fnDataRequested]
	 *   The function is called when the back-end requests have been sent.
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @private
	 */
	_CollectionCache.prototype.requestElements = function (iStart, iEnd, oGroupLock,
			iTransientElements, fnDataRequested) {
		var oPromise,
			oReadRequest = {
				iEnd : iEnd,
				iStart : iStart
			},
			that = this;

		this.aReadRequests.push(oReadRequest);
		this.bSentRequest = true;
		oPromise = SyncPromise.all([
			this.oRequestor.request("GET", this.getResourcePathWithQuery(iStart, iEnd), oGroupLock,
				undefined, undefined, fnDataRequested),
			this.fetchTypes()
		]).then(function (aResult) {
			var iFiltered;

			if (that.aElements.$tail === oPromise) {
				that.aElements.$tail = undefined;
			}
			iFiltered = that.handleResponse(aResult[0], oReadRequest.iStart, aResult[1]);

			return that.handleCount(oGroupLock, iTransientElements, oReadRequest.iStart,
				oReadRequest.iEnd, aResult[0], iFiltered);
		}).catch(function (oError) {
			that.fill(undefined, oReadRequest.iStart, oReadRequest.iEnd);
			throw oError;
		}).finally(function () {
			that.aReadRequests.splice(that.aReadRequests.indexOf(oReadRequest), 1);
		});

		// Note: oPromise MUST be a SyncPromise for performance reasons, see SyncPromise#all
		this.fill(oPromise, iStart, iEnd);
	};

	/**
	 * Returns a promise to be resolved when the side effects have been applied to the elements
	 * with the given key predicates and all created elements. All other elements from the back end
	 * are discarded!
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group that is associated with the request;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {object} mNavigationPropertyPaths
	 *   Hash set of collection-valued navigation property meta paths (relative to this cache's
	 *   root) which need to be refreshed, maps string to <code>true</code>; is modified
	 * @param {string[]} aPredicates
	 *   The key predicates of the root elements to request side effects for
	 * @param {boolean} bSingle
	 *   Whether only the side effects for a single element are requested; no element is discarded
	 *   in this case
	 * @returns {Promise|sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result, or rejecting with an error if loading of side
	 *   effects fails
	 * @throws {Error}
	 *   If group ID is '$cached' (the error has a property <code>$cached = true</code> then) or if
	 *   the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.requestSideEffects = function (oGroupLock, aPaths,
			mNavigationPropertyPaths, aPredicates, bSingle) {
		var aElements,
			iMaxIndex = -1,
			mMergeableQueryOptions,
			mQueryOptions,
			mPredicates = {}, // a set of the predicates (as map to true) to speed up the search
			sResourcePath,
			bSkip,
			mTypeForMetaPath = this.fetchTypes().getResult(),
			that = this;

		this.checkSharedRequest();

		if (this.oPendingRequestsPromise) {
			return this.oPendingRequestsPromise.then(function () {
				return that.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths,
					aPredicates, bSingle);
			});
		}

		mQueryOptions = _Helper.intersectQueryOptions(
			Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths,
			this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath,
			mNavigationPropertyPaths, "", true);
		if (!mQueryOptions) {
			return SyncPromise.resolve(); // micro optimization: use *sync.* promise which is cached
		}

		if (bSingle) {
			aElements = [this.aElements.$byPredicate[aPredicates[0]]];
		} else {
			aPredicates.forEach(function (sPredicate) {
				mPredicates[sPredicate] = true;
			});

			aElements = this.aElements.filter(function (oElement, i) {
				var sPredicate;

				if (!oElement) {
					return false; // ignore
				}
				if (_Helper.hasPrivateAnnotation(oElement, "transient")) {
					iMaxIndex = i;
					return false; // keep, but do not request
				}

				sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
				if (mPredicates[sPredicate]
						|| _Helper.hasPrivateAnnotation(oElement, "transientPredicate")) {
					iMaxIndex = i;
					delete mPredicates[sPredicate];
					return true; // keep and request
				}

				delete that.aElements[i];
				delete that.aElements.$byPredicate[sPredicate];
				return false;
			});
			this.aElements.length = iMaxIndex + 1;
			if (!aElements.length) {
				return SyncPromise.resolve(); // micro optimization: use cached *sync.* promise
			}
			Object.keys(mPredicates).forEach(function (sPredicate) {
				aElements.push(that.aElements.$byPredicate[sPredicate]);
			});
		}
		mQueryOptions.$filter = aElements.map(function (oElement) {
			// all elements have a key predicate, so we will get a key filter
			return _Helper.getKeyFilter(oElement, that.sMetaPath, mTypeForMetaPath);
		}).join(" or ");
		if (aElements.length > 1) { // avoid small default page size for server-driven paging
			mQueryOptions.$top = aElements.length;
		}
		_Helper.selectKeyProperties(mQueryOptions, mTypeForMetaPath[this.sMetaPath]);
		delete mQueryOptions.$count;
		delete mQueryOptions.$orderby;
		delete mQueryOptions.$search;
		mMergeableQueryOptions = _Helper.extractMergeableQueryOptions(mQueryOptions);
		sResourcePath = this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);

		return this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined,
				undefined, undefined, this.sMetaPath, undefined, false, mMergeableQueryOptions,
				this, function (aOtherPaths) {
					if (arguments.length) {
						aPaths = aPaths.concat(aOtherPaths);
					} else {
						bSkip = true; // my GET was merged
						return aPaths;
					}
			}).then(function (oResult) {
				var oElement, sPredicate, i, n;

				function preventKeyPredicateChange(sPath) {
					sPath = sPath.slice(sPredicate.length + 1); // strip sPredicate
					// not (below) a $NavigationPropertyPath?
					return !aPaths.some(function (sSideEffectPath) {
						return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
					});
				}

				if (bSkip) {
					return;
				}

				if (oResult.value.length !== aElements.length) {
					throw new Error("Expected " + aElements.length + " row(s), but instead saw "
						+ oResult.value.length);
				}
				// Note: iStart makes no sense here (use NaN instead), but is not needed because
				// we know we have key predicates
				that.visitResponse(oResult, mTypeForMetaPath, undefined, "", false, NaN);
				for (i = 0, n = oResult.value.length; i < n; i += 1) {
					oElement = oResult.value[i];
					sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
					_Helper.updateAll(that.mChangeListeners, sPredicate,
						that.aElements.$byPredicate[sPredicate], oElement,
						preventKeyPredicateChange);
				}
			});
	};

	/**
	 * Resets this cache to its initial state, but keeps certain elements and their change listeners
	 * alive: all kept-alive elements identified by the given key predicates as well as all
	 * transient elements on top level.
	 *
	 * @param {string[]} aKeptElementPredicates
	 *   The key predicates for all kept-alive elements
	 * @param {string} [sGroupId]
	 *   The group ID used for a side-effects refresh; if given, only inline creation
	 *   rows and transient elements with a different batch group shall be kept in place and a
	 *   backup shall be remembered for a later {@link #restore}
	 *
	 * @public
	 * @see _Cache#hasPendingChangesForPath
	 */
	_CollectionCache.prototype.reset = function (aKeptElementPredicates, sGroupId) {
		var mByPredicate = this.aElements.$byPredicate,
			mChangeListeners = this.mChangeListeners,
			iCreated = 0, // index (and finally number) of created elements that we keep
			oElement,
			sTransientGroup,
			i,
			that = this;

		if (sGroupId) {
			this.oBackup = {
				iActiveElements : this.iActiveElements,
				mChangeListeners : this.mChangeListeners,
				sContext : this.sContext,
				aElements : this.aElements.slice(),
				$byPredicate : mByPredicate,
				$count : this.aElements.$count,
				$created : this.aElements.$created,
				iLimit : this.iLimit
			};
		}

		for (i = 0; i < this.aElements.$created; i += 1) {
			oElement = this.aElements[i];
			sTransientGroup = _Helper.getPrivateAnnotation(oElement, "transient");
			if (sGroupId
					? "@$ui5.context.isInactive" in oElement
						|| sTransientGroup && sTransientGroup !== sGroupId
					: sTransientGroup) {
				aKeptElementPredicates.push(_Helper.getPrivateAnnotation(oElement, "predicate")
					|| _Helper.getPrivateAnnotation(oElement, "transientPredicate"));
				this.aElements[iCreated] = oElement;
				iCreated += 1;
			} else { // Note: inactive elements are always kept
				this.iActiveElements -= 1;
			}
		}
		this.mChangeListeners = {};
		this.sContext = undefined;
		this.aElements.length = this.aElements.$created = iCreated;
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // needed for setCount()
		this.iLimit = Infinity;

		Object.keys(mChangeListeners).forEach(function (sPath) {
			if (aKeptElementPredicates.includes(sPath.split("/")[0])) {
				that.mChangeListeners[sPath] = mChangeListeners[sPath];
			}
		});
		aKeptElementPredicates.forEach(function (sPredicate) {
			that.aElements.$byPredicate[sPredicate] = mByPredicate[sPredicate];
		});
	};

	/**
	 * Restores the last backup taken by {@link #reset} with <code>sGroupId</code>, if told to
	 * really do so; drops the backup in any case to free memory.
	 *
	 * @param {boolean} bReally - Whether to really restore, not just drop the backup
	 *
	 * @public
	 */
	_CollectionCache.prototype.restore = function (bReally) {
		if (bReally) {
			this.iActiveElements = this.oBackup.iActiveElements;
			this.mChangeListeners = this.oBackup.mChangeListeners;
			this.sContext = this.oBackup.sContext;
			// Note: do not change reference to this.aElements! It's kept in closures :-(
			this.aElements.length = this.oBackup.aElements.length;
			this.oBackup.aElements.forEach(function (oElement, i) {
				this[i] = oElement;
			}, this.aElements);
			this.aElements.$byPredicate = this.oBackup.$byPredicate;
			this.aElements.$count = this.oBackup.$count;
			this.aElements.$created = this.oBackup.$created;
			this.iLimit = this.oBackup.iLimit;
		}
		this.oBackup = null;
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
	 *
	 * @alias sap.ui.model.odata.v4.lib._PropertyCache
	 * @constructor
	 */
	function _PropertyCache(oRequestor, sResourcePath, mQueryOptions) {
		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions);

		this.oPromise = null;
	}

	// make PropertyCache a Cache
	_PropertyCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Not supported.
	 *
	 * @throws {Error}
	 *   Deletion of a property is not supported.
	 *
	 * @public
	 */
	_PropertyCache.prototype._delete = function () {
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
	_PropertyCache.prototype.create = function () {
		throw new Error("Unsupported");
	};

	/**
	 * Returns a promise to be resolved with the requested property value.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [_sPath]
	 *   ignored for property caches, should be empty
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 * @param {object} [oListener]
	 *   A change listener that is added for the given path. Its method <code>onChange</code> is
	 *   called with the new value if the property at that path is modified later
	 * @param {boolean} [bCreateOnDemand]
	 *   Unsupported
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the value. It is rejected if the request for the data failed.
	 * @throws {Error}
	 *   If <code>bCreateOnDemand</code> is set or if group ID is '$cached' and the value is not
	 *   cached (the error has a property <code>$cached = true</code> then)
	 *
	 * @public
	 */
	_PropertyCache.prototype.fetchValue = function (oGroupLock, _sPath, fnDataRequested, oListener,
			bCreateOnDemand) {
		var that = this;

		if (bCreateOnDemand) {
			throw new Error("Unsupported argument: bCreateOnDemand");
		}
		if (this.oPromise) {
			oGroupLock.unlock();
		} else {
			this.bSentRequest = true;
			this.oPromise = SyncPromise.resolve(this.oRequestor.request("GET",
				this.sResourcePath + this.sQueryString, oGroupLock, undefined, undefined,
				fnDataRequested, undefined, this.sMetaPath));
		}
		return this.oPromise.then(function (oResult) {
			that.registerChange("", oListener);
			// Note: For a null value, null is returned due to "204 No Content". For $count,
			// "a simple primitive integer value with media type text/plain" is returned.
			return oResult && typeof oResult === "object" ? oResult.value : oResult;
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
	_PropertyCache.prototype.update = function () {
		// Note: keep bSharedRequest in mind before implementing this method!
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, the cache is read-only and modifying calls lead to an error.
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function that returns the cache's original resource path to be used to build the target
	 *   path for bound messages; if it is not given or returns nothing, <code>sResourcePath</code>
	 *   is used instead
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, the initial request must be
	 *   done via {@link #post}. {@link #fetchValue} expects to have cache data, but may trigger
	 *   requests for late properties. If <code>false<code>, {@link #post} throws an error.
	 * @param {string} [sMetaPath]
	 *   Optional meta path in case it cannot be derived from the given resource path
	 *
	 * @alias sap.ui.model.odata.v4.lib._SingleCache
	 * @constructor
	 * @private
	 */
	function _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath) {
		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath, bSharedRequest);

		this.sMetaPath = sMetaPath || this.sMetaPath; // overrides Cache c'tor
		this.bPost = bPost;
		this.bPosting = false;
		this.oPromise = null; // a SyncPromise for the current value
	}

	// make SingleCache a Cache
	_SingleCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Returns a promise to be resolved with an OData object for the requested data. Calculates
	 * the key predicates for all entities in the result before the promise is resolved.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {object} [oListener]
	 *   A change listener that is added for the given path. Its method <code>onChange</code> is
	 *   called with the new value if the property at that path is modified later
	 * @param {boolean} [bCreateOnDemand]
	 *   Whether to create missing objects on demand, in order to avoid drill-down errors
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the element. It is rejected if the request for the data
	 *   failed.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet, or if group ID is
	 *   '$cached' and the value is not cached (the error has a property <code>$cached = true</code>
	 *   then)
	 *
	 * @public
	 */
	_SingleCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener,
			bCreateOnDemand) {
		var sResourcePath = this.sResourcePath + this.sQueryString,
			that = this;

		if (this.oPromise) {
			oGroupLock.unlock();
		} else {
			if (this.bPost) {
				throw new Error("Cannot fetch a value before the POST request");
			}
			this.oPromise = SyncPromise.all([
				// Note: for _GroupLock.$cached, this may fail synchronously
				this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined,
					fnDataRequested, undefined, this.sMetaPath),
				this.fetchTypes()
			]).then(function (aResult) {
				that.visitResponse(aResult[0], aResult[1]);
				return aResult[0];
			});
			this.bSentRequest = true;
		}
		return this.oPromise.then(function (oResult) {
			if (oResult && oResult["$ui5.deleted"]) {
				throw new Error("Cannot read a deleted entity");
			}
			that.registerChange(sPath, oListener);
			return that.drillDown(oResult, sPath, oGroupLock, bCreateOnDemand);
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getValue
	 */
	_SingleCache.prototype.getValue = function (sPath) {
		var oSyncPromise;

		if (this.oPromise && this.oPromise.isFulfilled()) {
			oSyncPromise = this.drillDown(this.oPromise.getResult(), sPath, _GroupLock.$cached);
			if (oSyncPromise.isFulfilled()) {
				return oSyncPromise.getResult();
			}
			oSyncPromise.caught();
		}
	};

	/**
	 * Returns a promise to be resolved with an OData object for a POST request with the given data.
	 * Calculates the key predicates for all entities in the result before the promise is resolved.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group that is associated with the request;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {object} [oData]
	 *   A copy of the data to be sent with the POST request; may be used to tunnel a different
	 *   HTTP method via a property "X-HTTP-Method" (which is removed)
	 * @param {object} [oEntity]
	 *   The entity which contains the ETag to be sent as "If-Match" header with the POST request.
	 * @param {boolean} [bIgnoreETag]
	 *   Whether the entity's ETag should be actively ignored (If-Match:*); used only in case an
	 *   entity is given and an ETag is present
	 * @param {function} [fnOnStrictHandlingFailed]
	 *   If this callback is given, then the preference "handling=strict" is applied.
	 *   If the request fails with an error having <code>oError.strictHandlingFailed</code> set,
	 *   this error is passed to the callback which returns a promise. If this promise resolves with
	 *   <code>true</code> the action is repeated w/o the preference, otherwise this function's
	 *   result promise is rejected with an <code>Error</code> instance <code>oError</code> where
	 *   <code>oError.canceled === true</code>.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST, another POST is still being processed, or the cache is
	 *   shared
	 *
	 * @public
	 */
	_SingleCache.prototype.post = function (oGroupLock, oData, oEntity, bIgnoreETag,
			fnOnStrictHandlingFailed) {
		var sGroupId,
			mHeaders = oEntity
				? {"If-Match" : bIgnoreETag && "@odata.etag" in oEntity ? "*" : oEntity}
				: {},
			sHttpMethod = "POST",
			that = this;

		function post(oGroupLock0) {
			that.bPosting = true;

			// BEWARE! Avoid finally here! BCP: 2070200175
			return SyncPromise.all([
				that.oRequestor.request(sHttpMethod,
					that.sResourcePath + that.sQueryString, oGroupLock0, mHeaders, oData),
				that.fetchTypes()
			]).then(function (aResult) {
				that.visitResponse(aResult[0], aResult[1]);
				that.bPosting = false;

				return aResult[0];
			}, function (oError) {
				that.bPosting = false;
				if (fnOnStrictHandlingFailed && oError.strictHandlingFailed) {
					return fnOnStrictHandlingFailed(oError).then(function (bConfirm) {
						var oCanceledError;

						if (bConfirm) {
							delete mHeaders["Prefer"];
							return post(oGroupLock0.getUnlockedCopy());
						}

						oCanceledError = Error("Action canceled due to strict handling");
						oCanceledError.canceled = true;
						throw oCanceledError;
					});
				}
				throw oError;
			});
		}

		this.checkSharedRequest();
		if (!this.bPost) {
			throw new Error("POST request not allowed");
		}
		// We disallow parallel POSTs because they represent OData actions which must not be
		// canceled. However we cannot decide which POST has been processed last on the server, so
		// we cannot tell which response represents the final server state.
		if (this.bPosting) {
			throw new Error("Parallel POST requests not allowed");
		}

		if (oEntity) {
			sGroupId = oGroupLock.getGroupId();
			// Note: there should be only *one* parked PATCH per entity, but we don't rely on that
			this.oRequestor.relocateAll("$parked." + sGroupId, sGroupId, oEntity);
		}

		if (oData) {
			sHttpMethod = oData["X-HTTP-Method"] || sHttpMethod;
			delete oData["X-HTTP-Method"];
			if (this.oRequestor.isActionBodyOptional() && !Object.keys(oData).length) {
				oData = undefined;
			}
		}

		this.bSentRequest = true;
		if (fnOnStrictHandlingFailed) {
			mHeaders["Prefer"] = "handling=strict";
		}
		this.oPromise = post(oGroupLock);

		return this.oPromise;
	};

	/**
	 * Returns a promise to be resolved when the side effects have been loaded from the given
	 * resource path.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group that is associated with the request;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {object} mNavigationPropertyPaths
	 *   Hash set of collection-valued navigation property meta paths (relative to this cache's
	 *   root) which need to be refreshed, maps string to <code>true</code>; is modified
	 * @param {string} [sResourcePath=this.sResourcePath]
	 *   A resource path relative to the service URL; it must not contain a query string
	 * @returns {Promise|sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result, or rejecting with an error if loading of side
	 *   effects fails.
	 * @throws {Error} If the side effects require a $expand, if group ID is '$cached' (the error
	 *   has a property <code>$cached = true</code> then), or if the cache is shared
	 *
	 * @public
	 */
	_SingleCache.prototype.requestSideEffects = function (oGroupLock, aPaths,
			mNavigationPropertyPaths, sResourcePath) {
		var mMergeableQueryOptions,
			mQueryOptions,
			oResult,
			bSkip,
			that = this;

		this.checkSharedRequest();

		mQueryOptions = this.oPromise && _Helper.intersectQueryOptions(
			Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths,
			this.oRequestor.getModelInterface().fetchMetadata,
			this.sMetaPath, mNavigationPropertyPaths);
		if (!mQueryOptions) {
			return SyncPromise.resolve();
		}

		if (this.oPromise.isRejected()) {
			throw new Error(this + ": Cannot call requestSideEffects, cache is broken: "
				+ this.oPromise.getResult().message);
		}
		mMergeableQueryOptions = _Helper.extractMergeableQueryOptions(mQueryOptions);
		sResourcePath = (sResourcePath || this.sResourcePath)
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
		oResult = SyncPromise.all([
			this.oRequestor.request("GET", sResourcePath, oGroupLock, undefined, undefined,
				undefined, undefined, this.sMetaPath, undefined, false, mMergeableQueryOptions,
				this, function (aOtherPaths) {
					if (arguments.length) {
						aPaths = aPaths.concat(aOtherPaths);
					} else {
						bSkip = true; // my GET was merged
						return aPaths;
					}
				}),
			this.fetchTypes(),
			this.fetchValue(_GroupLock.$cached, "") // Note: includes some additional checks
		]).then(function (aResult) {
			// Delay by a microtask so that it does not overtake a POST.
			// This will be resolved by JIRA: CPOUI5ODATAV4-288
			return aResult;
		}).then(function (aResult) {
			var oNewValue = aResult[0],
				oOldValue = aResult[2];

			if (bSkip) {
				return;
			}

			// ensure that the new value has a predicate although key properties were not requested
			_Helper.setPrivateAnnotation(oNewValue, "predicate",
				_Helper.getPrivateAnnotation(oOldValue, "predicate"));
			// visit response to report the messages
			that.visitResponse(oNewValue, aResult[1]);
			_Helper.updateAll(that.mChangeListeners, "", oOldValue, oNewValue, function (sPath) {
				// not (below) a $NavigationPropertyPath?
				return !aPaths.some(function (sSideEffectPath) {
					return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
				});
			});
		});

		return oResult;
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, multiple requests for a cache using the same resource path will
	 *   always return the same, shared cache. This cache is read-only, modifying calls lead to an
	 *   error.
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	_Cache.create = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest) {
		var iCount, aKeys, sPath, oSharedCollectionCache, mSharedCollectionCacheByPath;

		if (bSharedRequest) {
			sPath = sResourcePath
				+ oRequestor.buildQueryString(_Helper.getMetaPath("/" + sResourcePath),
					mQueryOptions, false, bSortExpandSelect);
			mSharedCollectionCacheByPath = oRequestor.$mSharedCollectionCacheByPath;
			if (!mSharedCollectionCacheByPath) {
				mSharedCollectionCacheByPath = oRequestor.$mSharedCollectionCacheByPath = {};
			}
			oSharedCollectionCache = mSharedCollectionCacheByPath[sPath];
			if (oSharedCollectionCache) {
				oSharedCollectionCache.setActive(true);
			} else {
				// remove inactive caches when there are already more than 100 caches in the map
				aKeys = Object.keys(mSharedCollectionCacheByPath);
				iCount = aKeys.length;
				if (iCount > 100) {
					aKeys.filter(function (sKey) {
						return !mSharedCollectionCacheByPath[sKey].iActiveUsages;
					}).sort(function (sKey1, sKey2) {
						return mSharedCollectionCacheByPath[sKey1].iInactiveSince
							- mSharedCollectionCacheByPath[sKey2].iInactiveSince;
					}).every(function (sKey) {
						delete mSharedCollectionCacheByPath[sKey];
						iCount -= 1;
						return iCount > 100;
					});
				}

				oSharedCollectionCache = mSharedCollectionCacheByPath[sPath]
					= new _CollectionCache(oRequestor, sResourcePath, mQueryOptions,
						bSortExpandSelect, sDeepResourcePath, bSharedRequest);
			}

			return oSharedCollectionCache;
		}

		return new _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
				sDeepResourcePath);
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
	_Cache.createProperty = function (oRequestor, sResourcePath, mQueryOptions) {
		return new _PropertyCache(oRequestor, sResourcePath, mQueryOptions);
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, multiple requests for a cache using the same resource path might
	 *   always return the same, shared cache. This cache is read-only, modifying calls lead to an
	 *   error.
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function that returns the cache's original resource path to be used to build the target
	 *   path for bound messages; if it is not given or returns nothing, <code>sResourcePath</code>
	 *   is used instead
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may
	 *   lead to a request, {@link #read} may only read from the cache; otherwise {@link #post}
	 *   throws an error.
	 * @param {string} [sMetaPath]
	 *   Optional meta path in case it cannot be derived from the given resource path
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	_Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath) {
		return new _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bSharedRequest, fnGetOriginalResourcePath, bPost, sMetaPath);
	};

	/**
	 * Transforms a numeric path segment from $skip to array index.
	 *
	 * @param {string} sSegment - A path segment
	 * @param {any[]} aCollection - A collection
	 * @returns {number|string}
	 *   Either the path segment itself or an array index transformed from $skip according to the
	 *   collection's "$created" count.
	 *
	 * @private
	 */
	_Cache.from$skip = function (sSegment, aCollection) {
		return rNumber.test(sSegment)
			? (aCollection.$created || 0) + Number(sSegment)
			: sSegment;
	};

	/**
	 * Determines the index of the element with the given key predicate.
	 *
	 * @param {object[]} aElements - The elements collection
	 * @param {string} sKeyPredicate - The key predicate
	 * @param {number} iIndex - The previous index (to speed it up)
	 * @returns {number} The index or -1 if the element is not in the collection anymore
	 *
	 * @private
	 */
	_Cache.getElementIndex = function (aElements, sKeyPredicate, iIndex) {
		var oElement = aElements[iIndex];

		if (!oElement || _Helper.getPrivateAnnotation(oElement, "predicate") !== sKeyPredicate) {
			iIndex = aElements.indexOf(aElements.$byPredicate[sKeyPredicate]);
		}
		return iIndex;
	};

	/**
	 * Makes an object that has the given value exactly at the given property path allowing to use
	 * the result in _Helper.updateExisting().
	 *
	 * Examples:
	 * <ul>
	 *   <li> ["Age"], 42 -> {Age: 42}
	 *   <li> ["Address", "City"], "Walldorf" -> {Address: {City: "Walldorf"}}
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
	_Cache.makeUpdateData = function (aPropertyPath, vValue) {
		return aPropertyPath.reduceRight(function (vValue0, sSegment) {
			var oResult = {};

			oResult[sSegment] = vValue0;
			return oResult;
		}, vValue);
	};

	return _Cache;
}, /* bExport= */false);
