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
	"sap/ui/model/odata/ODataUtils"
], function (_GroupLock, _Helper, _Requestor, Log, SyncPromise, ODataUtils) {
	"use strict";
	/*eslint max-nested-callbacks: 0 */

	var sClassName = "sap.ui.model.odata.v4.lib._Cache",
		// Matches if ending with a transient key predicate:
		//   EMPLOYEE($uid=id-1550828854217-16) -> aMatches[0] === "($uid=id-1550828854217-16)"
		//   @see sap.base.util.uid
		rEndsWithTransientPredicate = /\(\$uid=[-\w]+\)$/,
		rInactive = /^\$inactive\./,
		sMessagesAnnotation = "@com.sap.vocabularies.Common.v1.Messages",
		rNumber = /^-?\d+$/,
		// Matches two cases: segment with predicate or simply predicate:
		//   EMPLOYEE(ID='42') -> aMatches[1] === "EMPLOYEE", aMatches[2] === "(ID='42')"
		//   (ID='42') -> aMatches[1] === "", aMatches[2] === "(ID='42')"
		rSegmentWithPredicate = /^([^(]*)(\(.*\))$/;

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
	 *   A map of key-value pairs representing the query string (requires "copy on write"!)
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string;
	 *   note that this flag can safely be ignored for all "new" features (after 1.47) which
	 *   should just sort always
	 * @param {string} [sOriginalResourcePath=sResourcePath]
	 *   The cache's original resource path to be used to build the target path for bound messages
	 * @param {boolean} [bSharedRequest]
	 *   If this parameter is set, the cache is read-only and modifying calls lead to an error.
	 *
	 * @alias sap.ui.model.odata.v4.lib._Cache
	 * @constructor
	 * @private
	 */
	function _Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sOriginalResourcePath, bSharedRequest) {
		// the number of active usages of this cache (initially 1 because the first usage that
		// creates the cache does not call #setActive)
		this.iActiveUsages = 1;
		this.mChangeListeners = {}; // map from path to an array of change listeners
		this.mChangeRequests = {}; // map from path to an array of DELETE or PATCH promises
		this.sOriginalResourcePath = sOriginalResourcePath || sResourcePath;
		// the point in time when the cache became inactive; active caches have Infinity so that
		// they are always "newer"
		this.iInactiveSince = Infinity;
		this.mEditUrl2PatchPromise = {}; // map from edit URL to a PATCH promise for retry
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
	 *   The entity's edit URL to be used for the DELETE request; w/o a lock, this is mostly
	 *   ignored.
	 * @param {string} sPath
	 *   The entity's path within the cache; if the entity is in a collection, the last segment is
	 *   its index therein
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding. W/o a lock, this is ignored.
	 * @param {function} fnCallback
	 *  A function which is called immediately when an entity has been deleted from the cache, or
	 *   when it was re-inserted; the index of the entity and an offset (-1 for deletion, 1 for
	 *   re-insertion) are passed as parameter
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype._delete = function (oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback) {
		var aSegments = sPath.split("/"),
			// either a :1 nav.prop, the index as string, or a key-predicate (kept alive and hidden)
			sDeleteProperty = aSegments.pop(),
			sParentPath = aSegments.join("/"),
			that = this;

		this.checkSharedRequest();

		return this.fetchValue(_GroupLock.$cached, sParentPath).then(function (vCacheData) {
			var oDeleted,
				oEntity = sDeleteProperty
					? vCacheData[sDeleteProperty] || vCacheData.$byPredicate[sDeleteProperty]
					: vCacheData, // deleting at root level
				sGroupId,
				aMessages,
				mHeaders,
				iIndex = rNumber.test(sDeleteProperty) ? Number(sDeleteProperty) : undefined,
				sKeyPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"),
				sEntityPath = _Helper.buildPath(sParentPath,
					Array.isArray(vCacheData) ? sKeyPredicate : sDeleteProperty),
				oModelInterface = that.oRequestor.getModelInterface(),
				oRequestPromise,
				sTransientGroup = _Helper.getPrivateAnnotation(oEntity, "transient"),
				sTransientPredicate = _Helper.getPrivateAnnotation(oEntity, "transientPredicate");

			/*
			 * Cleans up after a cancel or failed request.
			 */
			function cleanUp() {
				_Helper.removeByPath(that.mChangeRequests, sEntityPath, oRequestPromise);

				if (aMessages.length) {
					oModelInterface.updateMessages(undefined, aMessages);
				}

				delete oEntity["@$ui5.context.isDeleted"];
				if (Array.isArray(vCacheData)) {
					iIndex = oDeleted.index;
					const iDeletedIndex = vCacheData.$deleted.indexOf(oDeleted);
					if (iIndex !== undefined) {
						that.restoreElement(iIndex, oEntity, iDeletedIndex, vCacheData,
							sParentPath);
					}
					vCacheData.$deleted.splice(iDeletedIndex, 1);
				}
				if (that.iActiveUsages) {
					fnCallback(iIndex, 1);
				} else if (iIndex === undefined && that.reset) {
					// an active cache must let the list binding reset to be told about kept-alive
					// elements, an inactive cache however has no binding and no kept-alive
					// elements
					that.reset([]);
				}
			}

			if (sTransientGroup) {
				if (typeof sTransientGroup !== "string") {
					throw new Error("No 'delete' allowed while waiting for server response");
				}
				if (vCacheData.$postBodyCollection) { // within a deep create
					vCacheData.$postBodyCollection.splice(iIndex, 1);
					that.removeElement(iIndex, sTransientPredicate, vCacheData, sParentPath);
					fnCallback(iIndex, -1);
					const oError = new Error("Deleted from deep create");
					oError.canceled = true;
					_Helper.getPrivateAnnotation(oEntity, "reject")(oError);
					_Helper.cancelNestedCreates(oEntity, "Deleted from deep create");
				} else {
					that.oRequestor.removePost(sTransientGroup, oEntity);
				}
				return undefined;
			}

			aMessages = oModelInterface.getMessagesByPath(
				_Helper.buildPath("/", that.sResourcePath, sEntityPath), true);

			oModelInterface.updateMessages(aMessages);

			oEntity["@$ui5.context.isDeleted"] = true;
			if (Array.isArray(vCacheData)) {
				oDeleted = that.addDeleted(vCacheData, iIndex, sKeyPredicate, oGroupLock,
					!!sTransientPredicate);
				that.removeElement(iIndex, sKeyPredicate, vCacheData, sParentPath);
			}
			fnCallback(iIndex, -1);
			if (oGroupLock) {
				sGroupId = oGroupLock.getGroupId();
				// Note: there should be only *one* parked PATCH per entity, but we don't rely on it
				that.oRequestor.relocateAll("$parked." + sGroupId, sGroupId, oEntity);
			}
			mHeaders = {"If-Match" : oETagEntity || oEntity};
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			oRequestPromise = oGroupLock
				? that.oRequestor.request("DELETE", sEditUrl, oGroupLock, mHeaders, undefined,
					undefined, cleanUp, undefined,
					_Helper.buildPath(that.sOriginalResourcePath, sEntityPath))
				: SyncPromise.resolve();
			_Helper.addByPath(that.mChangeRequests, sEntityPath, oRequestPromise);
			return oRequestPromise.catch(function (oError) {
				if (oError.status !== 404) {
					throw oError;
				} // else: map 404 to 200
			}).then(function () {
				_Helper.removeByPath(that.mChangeRequests, sEntityPath, oRequestPromise);

				if (Array.isArray(vCacheData)) {
					vCacheData.$deleted.splice(vCacheData.$deleted.indexOf(oDeleted), 1);
					delete vCacheData.$byPredicate[sKeyPredicate];
					delete vCacheData.$byPredicate[sTransientPredicate];
				} else if (sDeleteProperty) {
					// set to null and notify listeners
					_Helper.updateExisting(that.mChangeListeners, sParentPath,
						vCacheData, _Helper.makeUpdateData([sDeleteProperty], null));
				} else { // deleting at root level
					oEntity["$ui5.deleted"] = true;
				}
			}, function (oError) {
				if (!oError.canceled) {
					aMessages = aMessages.filter(function (oMessage) {
						return !oMessage.persistent;
					});
					cleanUp();
				}

				throw oError;
			});
		});
	};

	/**
	 * Adds an entry about a deleted entity to <code>aElements.$deleted</code>. Ensures that the
	 * entries are ordered ascending by entity index and deletion order (if two entities were
	 * deleted on the same index, the second one must be behind). Entities w/o index are placed at
	 * the start.
	 *
	 * @param {object[]} aElements - The elements collection
	 * @param {number} [iIndex] - The entity's index, undefined if it was not in the collection
	 * @param {string} sPredicate - The entity's key predicate
	 * @param {sap.ui.model.odata.v4.lib._GroupLock|undefined} oGroupLock - The deletion group lock
	 * @param {boolean} bCreated - Whether the entity was created
	 * @returns {object} The deletion info
	 *
	 * @private
	 */
	_Cache.prototype.addDeleted = function (aElements, iIndex, sPredicate, oGroupLock, bCreated) {
		var oDeleted = {
				created : bCreated,
				groupId : oGroupLock && oGroupLock.getGroupId(),
				predicate : sPredicate,
				index : iIndex
			},
			i;

		aElements.$deleted ??= [];
		if (iIndex === undefined) {
			aElements.$deleted.unshift(oDeleted);
		} else {
			for (i = 0; i < aElements.$deleted.length; i += 1) {
				if (iIndex < aElements.$deleted[i].index) {
					break;
				}
			}
			aElements.$deleted.splice(i, 0, oDeleted);
		}
		return oDeleted;
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
	 * Adds a collection below a transient element.
	 *
	 * @param {string} sPath
	 *   The collection path
	 * @param {string[]} [aSelect]
	 *   The binding's $select if it would create a cache; later used for updateSelected (either
	 *   taking this aSelect or calculating it from the path)
	 * @returns {object[]}
	 *   The elements collection (either from the initial data or empty)
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.addTransientCollection = function (sPath, aSelect) {
		var aElements,
			aSegments = sPath.split("/"),
			sName = aSegments.pop(),
			oParent = this.getValue(aSegments.join("/")),
			oPostBody = _Helper.getPrivateAnnotation(oParent, "postBody"),
			aPostBodyCollection,
			sRootPathEnd = sPath.indexOf(")", sPath.indexOf("($uid=")) + 1,
			// the root transient element of the deep create
			oRoot = this.getValue(sPath.slice(0, sRootPathEnd)),
			mSelectForMetaPath = _Helper.getPrivateAnnotation(oRoot, "select", {}),
			that = this;

		function setPostBodyCollection() {
			aElements.$postBodyCollection = oPostBody[sName] = aPostBodyCollection;
		}

		this.checkSharedRequest();
		aElements = oParent[sName] ??= [];
		aElements.$count = aElements.$created = aElements.length;
		aElements.$byPredicate = {};
		aPostBodyCollection = oPostBody[sName] || [];
		if (aElements.length) {
			setPostBodyCollection();
		} else {
			// allow creating on demand when there is a create in the child list
			aElements.$postBodyCollection = setPostBodyCollection;
		}
		mSelectForMetaPath[_Helper.getMetaPath(sPath.slice(sRootPathEnd + 1))] = aSelect;
		_Helper.setPrivateAnnotation(oRoot, "select", mSelectForMetaPath);
		aElements.forEach(function (oElement, i) {
			var sTransientPredicate = "($uid=" + _Helper.uid() + ")";

			oElement["@$ui5.context.isTransient"] = true;
			_Helper.setPrivateAnnotation(oElement, "postBody", aPostBodyCollection[i]);
			_Helper.setPrivateAnnotation(oElement, "transient",
				_Helper.getPrivateAnnotation(oParent, "transient"));
			_Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
			_Helper.setPrivateAnnotation(oElement, "promise", _Helper.addPromise(oElement));
			aElements.$byPredicate[sTransientPredicate] = oElement;
		});
		// add the collection type to mTypeForMetaPath
		this.fetchTypes().then(function (mTypeForMetaPath) {
			that.oRequestor.fetchType(mTypeForMetaPath,
				that.sMetaPath + "/" + _Helper.getMetaPath(sPath));
		});

		return aElements;
	};

	/**
	 * Adjusts the indexes in the collection.
	 *
	 * @param {string} sPath The path of the collection in the cache
	 * @param {object[]} aElements The collection
	 * @param {number} [iIndex]
	 *   The index at which the element has been inserted or removed; undefined if not in the list
	 * @param {number} iOffset The offset (1 = insert, -1 = remove)
	 * @param {number} iDeletedIndex The element's index in $deleted (only for re-insertion)
	 * @param {boolean} bCreate Whether the insert is a create (and not reverting a delete)
	 *
	 * @private
	 */
	_Cache.prototype.adjustIndexes = function (sPath, aElements, iIndex, iOffset, iDeletedIndex,
			bCreate) {
		if (iIndex === undefined) {
			return; // not in the list -> nothing to adjust
		}
		if (!sPath && this.aReadRequests) {
			this.aReadRequests.forEach(function (oReadRequest) {
				if (oReadRequest.iStart >= iIndex) {
					oReadRequest.iStart += iOffset;
					oReadRequest.iEnd += iOffset;
				} // Note: no changes can happen inside *gaps*
			});
		}
		(aElements.$deleted || []).forEach(function (oDeleted, i) {
			if (iIndex < oDeleted.index || iDeletedIndex < i // before the deleted one
					|| bCreate
						&& (iIndex === 0 // create at start
							|| !oDeleted.created)) { // the deleted one was not created
				oDeleted.index += iOffset;
			}
		});
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
	 *
	 * @protected
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
	 * Creates a transient entity, inserts it into the list, and adds a POST request to the batch
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
	 * @param {object} oEntityData
	 *   The initial entity data, already cloned and cleaned of client-side annotations
	 * @param {boolean} bAtEndOfCreated
	 *   Whether the newly created entity should be inserted after previously created entities or at
	 *   the front of the list.
	 * @param {function} fnErrorCallback
	 *   A function which is called with an error object each time a POST request for the create
	 *   fails
	 * @param {function} fnSubmitCallback
	 *   A function which is called just before a POST request for the create is sent
	 * @param {function} [fnCancelCallback]
	 *   A function which is called when the create has been canceled (after internal clean-up and
	 *   just before {@link sap.ui.model.odata.v4.lib._GroupLock#cancel}), except if the entity is
	 *   simply inactive
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the created entity when the POST request has been
	 *   successfully sent and the entity has been marked as non-transient
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.create = function (oGroupLock, oPostPathPromise, sPath, sTransientPredicate,
			oEntityData, bAtEndOfCreated, fnErrorCallback, fnSubmitCallback, fnCancelCallback) {
		var aCollection = this.getValue(sPath),
			sGroupId = oGroupLock.getGroupId(),
			oPostBody,
			fnResolve,
			that = this;

		/*
		 * Clean-up when the create has been canceled.
		 *
		 * @param {boolean} bResetInactive
		 *   Whether an edited inactive entity should be reset instead of being removed.
		 * @returns {boolean}
		 *   Whether the entity was reset only and kept in the collection instead of being removed.
		 *
		 * @see sap.ui.model.odata.v4.lib._Requestor#cancelChangesByFilter
		 */
		function cleanUp(bResetInactive) {
			var bInactiveEntity = oEntityData["@$ui5.context.isInactive"],
				iIndex = aCollection.indexOf(oEntityData);

			if (bResetInactive && bInactiveEntity) {
				if (bInactiveEntity === 1) {
					_Helper.resetInactiveEntity(that.mChangeListeners, sTransientPredicate,
						oEntityData);
				} // there is nothing to reset if the entity is simply inactive
				return true;
			}

			_Helper.cancelNestedCreates(oEntityData, "Deep create of "
				+ oPostPathPromise.getResult() + " canceled; group: " + oGroupLock.getGroupId());
			_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
			aCollection.splice(iIndex, 1);
			aCollection.$created -= 1;
			if (!oEntityData["@$ui5.context.isInactive"]) {
				if (!sPath) {
					that.iActiveElements -= 1;
				}
				_Helper.addToCount(that.mChangeListeners, sPath, aCollection, -1);
			}
			delete aCollection.$byPredicate[sTransientPredicate];
			that.adjustIndexes(sPath, aCollection, iIndex, -1);
			if (fnCancelCallback) {
				fnCancelCallback();
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
					sResultingPath,
					aSelect;

				_Helper.deletePrivateAnnotation(oEntityData, "postBody");
				_Helper.deletePrivateAnnotation(oEntityData, "transient");
				// ensure that change listeners are informed via updateSelected
				aResult[0]["@$ui5.context.isTransient"] = false;
				_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
				that.visitResponse(oCreatedEntity, aResult[1],
					_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sPath)),
					sPath + sTransientPredicate, undefined, true);
				sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
				if (sPredicate) {
					_Helper.setPrivateAnnotation(oEntityData, "predicate", sPredicate);
					if (sTransientPredicate in aCollection.$byPredicate) {
						aCollection.$byPredicate[sPredicate] = oEntityData;
						_Helper.updateTransientPaths(that.mChangeListeners, sTransientPredicate,
							sPredicate);
						// Do not remove transient predicate from aCollection.$byPredicate; some
						// contexts still use the transient predicate to access the data
					} // else: transient element was not kept by #reset, leave it like that!
				}
				_Helper.cancelNestedCreates(oEntityData, "Deep create of " + sPostPath
					+ " succeeded. Do not use this promise.");
				// update the cache with the POST response
				sResultingPath = _Helper.buildPath(sPath, sPredicate || sTransientPredicate);
				// check for a deep create and update the created nested collections
				const bDeepCreate = _Helper.updateNestedCreates(that.mChangeListeners,
					that.mQueryOptions, sResultingPath, oEntityData, oCreatedEntity,
					_Helper.getPrivateAnnotation(oEntityData, "select"));
				if (!bDeepCreate) { // after a deep create the complete response is accepted
					aSelect = _Helper.getQueryOptionsForPath(
						that.mLateQueryOptions || that.mQueryOptions, sPath
					).$select;
				}
				// update selected properties (or in case of a deep create all of them incl.
				// single-valued navigation properties), ETags, and predicates
				_Helper.updateSelected(that.mChangeListeners, sResultingPath, oEntityData,
					oCreatedEntity, aSelect, /*fnCheckKeyPredicate*/ undefined,
					/*bOkIfMissing*/ true);
				_Helper.setPrivateAnnotation(oEntityData, "deepCreate", bDeepCreate);
				_Helper.deletePrivateAnnotation(oEntityData, "select");

				that.removePendingRequest();
				fnResolve(true);
				return oEntityData;
			}, function (oError) {
				var oPromise;

				if (oError.canceled) {
					// for cancellation no error is reported via fnErrorCallback
					throw oError;
				}
				if (fnResolve) {
					that.removePendingRequest();
					fnResolve();
				}
				if (that.fetchTypes().isRejected()) {
					fnErrorCallback(oError); // Note: fires "createCompleted"
					throw oError;
				}

				sGroupId = sGroupId.replace(rInactive, "");
				sGroupId = that.oRequestor.getGroupSubmitMode(sGroupId) === "API"
					? sGroupId
					: "$parked." + sGroupId;
				oPromise = request(sPostPath,
					that.oRequestor.lockGroup(sGroupId, that, true, true));
				fnErrorCallback(oError); // Note: fires "createCompleted"

				return oPromise;
			});
		}

		this.checkSharedRequest();
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
				+ "' does not reference a collection");
		}

		oPostBody = _Helper.clone(oEntityData);
		// keep post body separate to allow local property changes in the cache
		_Helper.setPrivateAnnotation(oEntityData, "postBody", oPostBody);
		_Helper.setPrivateAnnotation(oEntityData, "transientPredicate", sTransientPredicate);
		oEntityData["@$ui5.context.isTransient"] = true;
		if (sGroupId.startsWith("$inactive.")) {
			// keep initial data to allow resetting edited inactive rows
			_Helper.setPrivateAnnotation(oEntityData, "initialData",
				_Helper.publicClone(oEntityData, true));
			oEntityData["@$ui5.context.isInactive"] = true;
		} else {
			if (!sPath) {
				this.iActiveElements += 1;
			}
			_Helper.addToCount(this.mChangeListeners, sPath, aCollection, 1);
		}

		if (bAtEndOfCreated) {
			aCollection.splice(aCollection.$created, 0, oEntityData);
		} else {
			aCollection.unshift(oEntityData);
		}
		aCollection.$created += 1;
		// if the nested collection is empty $byPredicate is not available, create it on demand
		aCollection.$byPredicate ??= {};
		aCollection.$byPredicate[sTransientPredicate] = oEntityData;
		that.adjustIndexes(sPath, aCollection, 0, 1, 0, true);
		if (aCollection.$postBodyCollection) { // within a deep create
			if (typeof aCollection.$postBodyCollection === "function") {
				aCollection.$postBodyCollection(); // creation on demand
			}
			_Helper.setPrivateAnnotation(oEntityData, "transient", sGroupId);
			if (bAtEndOfCreated) {
				aCollection.$postBodyCollection.push(oPostBody);
			} else {
				aCollection.$postBodyCollection.unshift(oPostBody);
			}
			oGroupLock.unlock();
			return _Helper.addPromise(oEntityData);
		}

		return oPostPathPromise.then(function (sPostPath) {
			sPostPath += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return request(sPostPath, oGroupLock);
		});
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
	 *   An unlocked lock for the group to associate a request for late properties with
	 * @param {boolean} [bCreateOnDemand]
	 *   Whether to create missing objects on demand, in order to avoid drill-down errors
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the result matching to <code>sPath</code>
	 *
	 * @protected
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
			// no error for a key predicate, it's most probably due to a deleted entity
			bAsInfo ||= sSegment[0] === "(" && sSegment.at(-1) === ")";
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
		 * @param {boolean} [bAgain] - Whether we are trying again and must not cause a request
		 * @returns {sap.ui.base.SyncPromise|undefined}
		 *   Returns a SyncPromise which resolves with the value or returns undefined in some
		 *   special cases.
		 */
		function missingValue(oValue, sSegment, iPathLength, bAgain) {
			var vPermissions,
				sPropertyName,
				sPropertyPath = aSegments.slice(0, iPathLength).join("/"),
				sPropertyMetaPath = _Helper.getMetaPath(sPropertyPath),
				sReadLink;

			if (Array.isArray(oValue)) {
				return invalidSegment(sSegment, sSegment === "0"); // missing key predicate or index
			}

			if (bInAnnotation) {
				return invalidSegment(sSegment, true);
			}

			if (sSegment.includes("@")) { // missing property annotation
				sPropertyName = sSegment.split("@")[0];
				sPropertyMetaPath = _Helper.getMetaPath(sPropertyPath.split("@")[0]);
				if (bTransient
						|| sPropertyName in oValue
						|| oValue[sPropertyName + "@$ui5.noData"]
						|| _Helper.isSelected(sPropertyMetaPath, that.mQueryOptions)) {
					// no use to send late request
					return invalidSegment(sSegment, true);
				}
			}

			vPermissions = oValue[_Helper.getAnnotationKey(oValue, ".Permissions", sSegment)];
			if (vPermissions === 0 || vPermissions === "None") {
				return undefined;
			}

			return that.oRequestor.getModelInterface()
				.fetchMetadata(that.sMetaPath + "/" + sPropertyMetaPath)
				.then(function (oProperty) {
					var vResult = false;

					if (!oProperty) {
						return invalidSegment(sSegment);
					}
					if (oProperty.$Type === "Edm.Stream" && !sPropertyName) {
						sReadLink = oValue[sSegment + "@odata.mediaReadLink"]
							|| oValue[sSegment + "@mediaReadLink"];
						if (sReadLink) {
							return sReadLink;
						}
						if (oValue[sSegment + "@$ui5.noData"]
							|| _Helper.isSelected(sPropertyMetaPath, that.mQueryOptions)) {
							return _Helper.buildPath(that.oRequestor.getServiceUrl()
								+ that.sResourcePath, sPropertyPath);
						}
					}
					if (!bTransient) {
						// If there is no entity with a key predicate, try it with the cache root
						// object (in case of SimpleCache, the root object of CollectionCache is an
						// array)
						if (!oEntity && !Array.isArray(oData)) {
							oEntity = oData;
							iEntityPathLength = 0;
						}
						if (oEntity && !bAgain) {
							vResult = that.fetchLateProperty(oGroupLock, oEntity,
								aSegments.slice(0, iEntityPathLength).join("/"),
								aSegments.slice(iEntityPathLength).join("/"));
						}
						return typeof vResult === "boolean"
							? invalidSegment(sSegment, /*bAsInfo*/vResult)
							: vResult; // fetchLateProperty's promise
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
			return oPromise.then(function step(vValue, bAgain) {
				var vIndex, aMatches, oParentValue;

				if (vValue === undefined) {
					// already knowing there is nothing, but unable to stop the reduce loop early
					return undefined;
				}
				if (sSegment === "$count") {
					return Array.isArray(vValue) ? vValue.$count : invalidSegment(sSegment);
				}
				if (vValue === null) {
					// a complex or navigation property is null -> treat it as transient
					bTransient = true;
					return missingValue({}, sSegment, i + 1);
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
				bTransient ||= vValue["@$ui5.context.isTransient"];
				aMatches = rSegmentWithPredicate.exec(sSegment);
				if (aMatches) {
					if (aMatches[1]) { // e.g. "TEAM_2_EMPLOYEES('42')
						vValue = vValue[aMatches[1]]; // there is a navigation property, follow it
					}
					// ensure that we do not fail on a missing navigation property
					vValue &&= vValue.$byPredicate // not available on empty collections!
						&& vValue.$byPredicate[aMatches[2]]; // search the key predicate
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
				if (vValue === undefined && sSegment[0] !== "#" && sSegment[0] !== "@") {
					vValue = missingValue(oParentValue, sSegment, i + 1, bAgain);
					if (vValue instanceof SyncPromise && vValue.isPending()) {
						return vValue.then(function () { // repeat step once late property fetched
							return step(oParentValue, true);
						});
					}
				}
				if (sSegment.includes("@")) {
					bInAnnotation = true;
				}
				return vValue;
			});
		}, oDataPromise);
	};

	/**
	 * Fetches a missing property while drilling down into the cache. Writes it into the cache and
	 * resolves so that the drill-down can proceed.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group ID
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
	 *   the server. For annotations, except client annotations, the annotated property is requested
	 *   from the server.
	 * @returns {Promise<void>|boolean}
	 *   A promise which is resolved without a defined result if the requested property is an
	 *   expected late property, or a <code>boolean</code> value if it is not; it is rejected with
	 *   an error if the GET request failed, or if the key predicate or the ETag has changed. The
	 *   returned <code>boolean</code> value tells if the issue can be safely ignored.
	 *
	 * @private
	 */
	_Cache.prototype.fetchLateProperty = function (oGroupLock, oResource, sResourcePath,
			sRequestedPropertyPath) {
		var bDataRequested = false,
			sFullResourceMetaPath,
			sFullResourcePath,
			sGroupId,
			iIndexOfAt = sRequestedPropertyPath.indexOf("@"),
			sMergeBasePath, // full resource path plus custom query options
			oPromise,
			mQueryOptions,
			sRequestPath,
			sResourceMetaPath = _Helper.getMetaPath(sResourcePath),
			mTypeForMetaPath = this.getTypes(),
			aUpdateProperties,
			that = this;

		function onSubmit() {
			bDataRequested = true;
			that.oRequestor.getModelInterface().fireDataRequested("/" + sFullResourcePath);
		}

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

			oEntityType ??= that.oRequestor.fetchType(mTypeForMetaPath, sMetaPath).getResult();
			if (sBasePath) {
				// The key properties must only be copied from the result for nested entities. The
				// root entity is already loaded and has them already. We check that they are
				// unchanged in this case.
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

		if (!(this.mLateQueryOptions || this.mQueryOptions && this.mQueryOptions.$select)) {
			return false; // no autoExpandSelect
		}

		if (iIndexOfAt >= 0) {
			if (sRequestedPropertyPath.startsWith("@$ui5.", iIndexOfAt)) {
				return true; // send no request for a client annotation
			}
			sRequestedPropertyPath = sRequestedPropertyPath.slice(0, iIndexOfAt);
		}
		aUpdateProperties = [sRequestedPropertyPath];

		sFullResourceMetaPath = _Helper.buildPath(this.sMetaPath, sResourceMetaPath);
		mQueryOptions = this.mLateQueryOptions
			|| { // ensure that $select precedes $expand in the resulting query
				$select : this.mQueryOptions.$select,
				$expand : this.mQueryOptions.$expand
			};
		// sRequestedPropertyPath is also a meta path because the binding does not accept a path
		// with a collection-valued navigation property for a late property
		mQueryOptions = _Helper.intersectQueryOptions(
			_Helper.getQueryOptionsForPath(mQueryOptions, sResourcePath),
			[sRequestedPropertyPath], this.oRequestor.getModelInterface().fetchMetadata,
			sFullResourceMetaPath);
		if (!mQueryOptions) {
			return false;
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
				undefined, undefined, onSubmit, undefined, sFullResourceMetaPath, undefined,
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
			var sNewPredicate = _Helper.getPrivateAnnotation(oData, "predicate"),
				sOldPredicate = _Helper.getPrivateAnnotation(oResource, "predicate");

			if (sOldPredicate && sNewPredicate && sOldPredicate !== sNewPredicate) {
				throw new Error("GET " + sRequestPath + ": Key predicate changed from "
					+ sOldPredicate + " to " + sNewPredicate);
			}
			// only check for ETag change if the cache contains one; otherwise either the cache
			// element is empty (via #addKeptElement) or the server did not send one last time
			if (oResource["@odata.etag"] && oData["@odata.etag"] !== oResource["@odata.etag"]) {
				throw new Error("GET " + sRequestPath + ": ETag changed");
			}

			_Helper.updateSelected(that.mChangeListeners, sResourcePath, oResource, oData,
				aUpdateProperties);
			if (bDataRequested) {
				bDataRequested = false;
				that.oRequestor.getModelInterface()
					.fireDataReceived(undefined, "/" + sFullResourcePath);
			}
		}).catch(function (oError) {
			if (bDataRequested) {
				that.oRequestor
					.getModelInterface().fireDataReceived(oError, "/" + sFullResourcePath);
			}
			throw oError;
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
	 * @see #getTypes
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
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
	 * given relative path; the array is annotated with the collection's $count. If there are
	 * pending requests, the corresponding promises will be ignored and set to
	 * <code>undefined</code>.
	 *
	 * @param {string} [sPath]
	 *   Relative path to drill-down into, may be empty (only for collection cache)
	 * @returns {object[]} The cache elements
	 *
	 * @public
	 */
	_Cache.prototype.getAllElements = function (sPath) {
		var aAllElements;

		if (sPath) {
			return this.getValue(sPath);
		}
		aAllElements = this.aElements.map(function (oElement) {
			return oElement instanceof SyncPromise ? undefined : oElement;
		});
		aAllElements.$count = this.aElements.$count;

		return aAllElements;
	};

	/**
	 * Returns the collection at the given path and removes it from the cache if it is marked as
	 * transferable.
	 *
	 * @param {string} sPath - The relative path of the property
	 * @returns {object[]|undefined} The collection or <code>undefined</code>
	 * @throws {Error} If the cache is shared or if the given path does not point to a collection.
	 *
	 * @public
	 */
	_Cache.prototype.getAndRemoveCollection = function (sPath) {
		var aSegments = sPath.split("/"),
			sName = aSegments.pop(),
			oParent = this.fetchValue(_GroupLock.$cached, aSegments.join("/")).getResult(),
			vValue = oParent[sName];

		this.checkSharedRequest();
		if (vValue) {
			if (!Array.isArray(vValue)) {
				throw new Error(`${sPath} must point to a collection`);
			}
			if (!vValue.$transfer) {
				return undefined;
			}
			delete vValue.$transfer;
		}
		delete oParent[sName];

		return vValue;
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
	 * @protected
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
				this.getDownloadQueryOptions(mQueryOptions), false, true);
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
	 * Returns a promise that is pending while DELETEs or POSTs are being sent, or
	 * <code>null</code> in case no such requests are currently being sent.
	 *
	 * @returns {Promise|null} A promise that is pending while DELETEs or POSTs are being sent
	 *
	 * @public
	 * @see #addPendingRequest
	 * @see #removePendingRequest
	 */
	_Cache.prototype.getPendingRequestsPromise = function () {
		return this.oPendingRequestsPromise && this.oPendingRequestsPromise.getResult();
	};

	/**
	 * Returns this cache's query options.
	 *
	 * @returns {object|undefined} The query options, if any
	 *
	 * @public
	 * @see #setQueryOptions
	 */
	_Cache.prototype.getQueryOptions = function () {
		return this.mQueryOptions;
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
	 * Returns the existing map from meta path to type.
	 *
	 * @returns {Object<object>}
	 *   A map from resource path + entity path to the type
	 *
	 * @private
	 * @see #fetchTypes
	 */
	_Cache.prototype.getTypes = function () {
		return this.fetchTypes().getResult();
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
	 * Tells whether there are any registered change listeners.
	 *
	 * @returns {boolean}
	 *   Whether there are any registered change listeners
	 *
	 * @public
	 * @see #registerChangeListener
	 */
	_Cache.prototype.hasChangeListeners = function () {
		return !_Helper.isEmptyObject(this.mChangeListeners);
	};

	/**
	 * Returns <code>true</code> if there are pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path of a binding; must not end with '/'
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by APIs like sort or filter because they
	 *   relate to a deleted context or a context which is kept alive
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

		return Object.keys(this.mChangeRequests).some(function (sRequestPath) {
			return _Helper.hasPathPrefix(sRequestPath, sPath)
				&& !(bIgnoreKeptAlive
					&& that.mChangeRequests[sRequestPath].every(function (oChangePromise) {
						// w/o $isKeepAlive it is a DELETE
						return !oChangePromise.$isKeepAlive || oChangePromise.$isKeepAlive();
					}));
		}) || Object.keys(this.mPostRequests).some(function (sRequestPath) {
			return bIgnoreTransient && !sRequestPath
				? false // ignore transient elements on top level
				: _Helper.hasPathPrefix(sRequestPath, sPath)
					&& that.mPostRequests[sRequestPath].some(function (oEntityData) {
						return oEntityData["@$ui5.context.isInactive"] !== true;
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
	 * @public
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
	 *   The array index of the entity to be refreshed, <code>-1</code> if unknown (then a key
	 *   predicate must be given)
	 * @param {string} [sPredicate]
	 *   The key predicate of the entity; only evaluated if <code>iIndex</code> is undefined or
	 *   negative
	 * @param {boolean} [bKeepAlive]
	 *   Whether the entity is kept alive
	 * @param {boolean} [bWithMessages]
	 *   Whether the "@com.sap.vocabularies.Common.v1.Messages" path is treated specially, supported
	 *   only for <code>sPath === ""</code>
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with the refreshed entity after it was updated in the cache, and
	 *   rejects with an error when no key predicate is known.
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.refreshSingle = function (oGroupLock, sPath, iIndex, sPredicate, bKeepAlive,
			bWithMessages, fnDataRequested) {
		var bKeepReportedMessagesPath = false,
			that = this;

		this.checkSharedRequest();
		return this.fetchValue(_GroupLock.$cached, sPath).then(function (aElements) {
			var sMessagesPath = bWithMessages && sPath === ""
					&& that.oRequestor.getModelInterface().fetchMetadata(
						that.sMetaPath + "/@com.sap.vocabularies.Common.v1.Messages/$Path"
					).getResult(),
				mQueryOptions = _Helper.clone(
					_Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)),
				sReadUrl;

			if (iIndex >= 0) {
				sPredicate = _Helper.getPrivateAnnotation(aElements[iIndex], "predicate");
			}
			if (!sPredicate) { // Note: no need to give path here, error is wrapped by ODLB!
				throw new Error("No key predicate known");
			}
			sReadUrl = _Helper.buildPath(that.sResourcePath, sPath, sPredicate);
			if (bKeepAlive && that.mLateQueryOptions) {
				// bKeepAlive === true -> own cache of the list binding -> sPath === ''
				// -> no need to apply _Helper.getQueryOptionsForPath
				_Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
			}
			if (sMessagesPath && mQueryOptions.$select
				&& !mQueryOptions.$select.includes(sMessagesPath)) {
				// Note: w/o existing $select, we must not end up w/ just messages
				mQueryOptions.$select.push(sMessagesPath);
				bKeepReportedMessagesPath = true;
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

				that.replaceElement(aElements, iIndex, sPredicate, oElement, aResult[1], sPath,
					bKeepReportedMessagesPath);

				return oElement;
			});
		});
	};

	/**
	 * Refreshes a single entity within a collection cache and removes it from the cache if the
	 * filter does not match anymore.
	 * Since 1.84.0, only removes entities that do not match the filter from the cache in case they
	 * are not kept alive. If the entity is kept alive, checks also the existence and removes it
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
	 *   Whether the entity is kept alive
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} [fnOnRemove]
	 *   A function which is called after the entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}. Since 1.84.0, if the entity is
	 *   kept alive and still exists, the function is called with <code>true</code>, otherwise with
	 *   <code>false</code>
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> when the entity is updated in
	 *   the cache; it rejects with an error when no key predicate is known.
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
				mQueryOptions = _Helper.clone(
					_Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)),
				sReadUrl,
				sReadUrlPrefix = _Helper.buildPath(that.sResourcePath, sPath),
				aRequests = [],
				mTypeForMetaPath = aResults[1];

			if (iIndex !== undefined) {
				oEntity = aElements[iIndex];
				sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate");
				if (!sPredicate) { // Note: no need to give path here, error is wrapped by ODLB!
					throw new Error("No key predicate known");
				}
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

			return SyncPromise.all(aRequests).then(function (aResults0) {
				var aReadResult = aResults0[0].value,
					bRemoveFromCollection = aResults0[1] && aResults0[1]["@odata.count"] === "0";

				if (aReadResult.length > 1) {
					throw new Error(
						"Unexpected server response, more than one entity returned.");
				} else if (aReadResult.length === 0) {
					that.removeElement(iIndex, sPredicate, aElements, sPath);
					that.oRequestor.getModelInterface()
						.reportStateMessages(that.sResourcePath, {}, [sPath + sPredicate]);
					fnOnRemove(false);
				} else if (bRemoveFromCollection) {
					const oOldElement = aElements.$byPredicate[sPredicate];
					_Helper.copySelected(oOldElement, aReadResult[0]);
					if ("@$ui5.context.isTransient" in oOldElement) {
						aReadResult[0]["@$ui5.context.isTransient"] = false;
					}
					that.removeElement(iIndex, sPredicate, aElements, sPath);
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
	 * Registers the listener for the path. Shared caches do not register listeners except for the
	 * empty path, because they are read-only.
	 *
	 * @param {string} sPath The path
	 * @param {object} [oListener] The listener
	 *
	 * @protected
	 */
	_Cache.prototype.registerChangeListener = function (sPath, oListener) {
		if (!(this.bSharedRequest && sPath)) {
			_Helper.registerChangeListener(this, sPath, oListener);
		}
	};

	/**
	 * Removes the element at the given index from the given array, taking care of the array's
	 * <code>$byPredicate</code>, <code>$created</code> and <code>$count</code>, and a collection
	 * cache's limit and number of active elements (if applicable).
	 *
	 * If the predicate is given, the index is determined again to handle the case that the element
	 * has been moved (via a parallel insert/delete) in the meantime. Otherwise, the index is taken
	 * as is.
	 *
	 * @param {number} [iIndex]
	 *   The array index of the old element to be removed or <code>undefined</code> in case the
	 *   element is a kept-alive element without an index
	 * @param {string} [sPredicate]
	 *   The key predicate of the old element to be removed
	 * @param {object[]} [aElements]
	 *   The array of elements, defaults to a collection cache's own elements
	 * @param {string} [sPath=""]
	 *   The element collection's path within this cache (as used by change listeners), may be
	 *   <code>""</code> (only in a CollectionCache)
	 * @returns {number|undefined} The index at which the element actually was (it might have moved
	 *   due to parallel insert/delete)
	 *
	 * @protected
	 */
	_Cache.prototype.removeElement = function (iIndex, sPredicate, aElements = this.aElements,
			sPath = "") {
		const oElement = sPredicate
			? aElements.$byPredicate[sPredicate]
			: aElements[iIndex]; // undefined in case it was not yet read

		if (!sPredicate) {
			sPredicate = oElement && _Helper.getPrivateAnnotation(oElement, "predicate");
		} else if (iIndex !== undefined) {
			// the element might have moved due to parallel insert/delete
			iIndex = _Cache.getElementIndex(aElements, sPredicate, iIndex);
		}
		if (oElement && !oElement["@$ui5.context.isDeleted"]) {
			delete aElements.$byPredicate[sPredicate];
			delete aElements.$byPredicate[
				_Helper.getPrivateAnnotation(oElement, "transientPredicate")];
		}
		if (iIndex >= 0) {
			aElements.splice(iIndex, 1);
			_Helper.addToCount(this.mChangeListeners, sPath, aElements, -1);
			if (iIndex < aElements.$created) {
				aElements.$created -= 1;
				if (!sPath) {
					this.iActiveElements -= 1;
				}
			} else if (!sPath) {
				this.iLimit -= 1; // this doesn't change Infinity
			}
			this.adjustIndexes(sPath, aElements, iIndex, -1);
		}
		return iIndex;
	};

	/**
	 * Removes bound messages from the message model if this cache already has reported messages
	 *
	 * @public
	 */
	_Cache.prototype.removeMessages = function () {
		if (this.sReportedMessagesPath) { // Note: never set if the cache shares requests
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
	 * @param {boolean} [bKeepReportedMessagesPath]
	 *   Whether <code>this.sReportedMessagesPath</code> should be kept unchanged
	 *
	 * @private
	 */
	_Cache.prototype.replaceElement = function (aElements, iIndex, sPredicate, oElement,
			mTypeForMetaPath, sPath, bKeepReportedMessagesPath) {
		var oOldElement, sTransientPredicate;

		if (iIndex === undefined) { // kept-alive element not in the list
			// might be undefined because it was removed in #refreshSingleWithRemove already
			oOldElement = aElements.$byPredicate[sPredicate];
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
		if (oOldElement) {
			_Helper.copySelected(oOldElement, oElement);
		}
		_Helper.restoreUpdatingProperties(oOldElement, oElement);

		// Note: iStart is not needed here because we know we have a key predicate
		this.visitResponse(oElement, mTypeForMetaPath,
			_Helper.getMetaPath(_Helper.buildPath(this.sMetaPath, sPath)), sPath + sPredicate,
			undefined, bKeepReportedMessagesPath);
	};

	/**
	 * Requests $count after deletion of a kept-alive element that was not in the collection.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   An unlocked lock for the group ID
	 * @returns {Promise<number>}
	 *   A promise that resolves with the count regardless whether a request was needed
	 *
	 * @public
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
			sExclusiveFilter = this.getExclusiveFilter();
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

					_Helper.setCount(that.mChangeListeners, "", that.aElements, iCount);
					that.iLimit = iCount;
					return iCount;
				});
		}

		return Promise.resolve(that.iLimit);
	};

	/**
	 * Resets all pending changes below the given path.
	 *
	 * @param {string} sPath
	 *   The relative path within the cache
	 * @throws {Error}
	 *   If there is a change which has been sent to the server and for which there is no response
	 *   yet, or if the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.resetChangesForPath = function (sPath) {
		var that = this;

		this.checkSharedRequest();

		Object.keys(this.mChangeRequests).reverse().forEach(function (sRequestPath) {
			var aPromises, i;

			if (_Helper.hasPathPrefix(sRequestPath, sPath)) {
				aPromises = that.mChangeRequests[sRequestPath];
				for (i = aPromises.length - 1; i >= 0; i -= 1) {
					that.oRequestor.removeChangeRequest(aPromises[i]);
				}
				delete that.mChangeRequests[sRequestPath];
			}
		});

		Object.keys(this.mPostRequests).forEach(function (sRequestPath) {
			var aEntities = that.mPostRequests[sRequestPath],
				sTransientGroup,
				sTransientPredicate,
				i;

			if (sPath.startsWith("($uid=")) {
				aEntities.forEach(function (oEntity) {
					sTransientPredicate
						= _Helper.getPrivateAnnotation(oEntity, "transientPredicate");

					if (sTransientPredicate === sPath
						&& oEntity["@$ui5.context.isInactive"] === 1) {
						_Helper.resetInactiveEntity(that.mChangeListeners, sTransientPredicate,
							oEntity);
					}
				});
			} else if (isSubPath(sRequestPath, sPath)) {
				for (i = aEntities.length - 1; i >= 0; i -= 1) {
					sTransientGroup = _Helper.getPrivateAnnotation(aEntities[i], "transient");
					if (sTransientGroup.startsWith("$inactive.")) {
						_Helper.resetInactiveEntity(that.mChangeListeners,
							_Helper.getPrivateAnnotation(aEntities[i], "transientPredicate"),
							aEntities[i]);
					} else {
						// this also cleans up that.mPostRequests
						that.oRequestor.removePost(sTransientGroup, aEntities[i]);
					}
				}
			}
		});
	};

	/**
	 * Restores the element in the given array at the given index, taking care of the array's
	 * <code>$byPredicate</code>, <code>$created</code> and <code>$count</code>, and a collection
	 * cache's limit and number of active elements (if applicable).
	 *
	 * @param {number} iIndex - The index to restore at
	 * @param {object} oElement - The element to restore
	 * @param {int} [iDeletedIndex]
	 *   The index of the entry in <code>aElements.$deleted</code> if any
	 * @param {object[]} [aElements]
	 *   The array of elements, defaults to a collection cache's own elements
	 * @param {string} [sPath=""]
	 *   The element collection's path within this cache (as used by change listeners), may be
	 *   <code>""</code> (only in a CollectionCache)
	 *
	 * @protected
	 */
	_Cache.prototype.restoreElement = function (iIndex, oElement, iDeletedIndex,
			aElements = this.aElements, sPath = "") {
		this.adjustIndexes(sPath, aElements, iIndex, 1, iDeletedIndex);
		const sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");
		if (sTransientPredicate) {
			aElements.$created += 1;
			if (!sPath) {
				this.iActiveElements += 1;
			}
		} else if (!sPath) {
			this.iLimit += 1; // this doesn't change Infinity
		}
		_Helper.addToCount(this.mChangeListeners, sPath, aElements, 1);
		_Helper.insert(aElements, iIndex, oElement);
		aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")] = oElement;
	};

	/**
	 * Adds or removes a usage of this cache. A cache with active usages must not be destroyed.
	 * If the last usage is removed, all change listeners are removed too. Note: shared caches have
	 * no listeners except for the empty path (cf. <code>registerChangeListener("", th</code>).
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
				this.mChangeListeners = {};
			}
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
		// this.checkSharedRequest(); // don't do that here! it might work well enough
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
	 * @param {boolean} [bUpdating]
	 *   Whether the given property will not be overwritten by a creation POST(+GET) response
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> once the value has been set, or is
	 *   rejected with an error if setting fails somehow
	 * @throws {Error} If the cache is shared
	 *
	 * @public
	 */
	_Cache.prototype.setProperty = function (sPropertyPath, vValue, sEntityPath, bUpdating) {
		var that = this;

		this.checkSharedRequest();
		return this.fetchValue(_GroupLock.$cached, sEntityPath, null, null, true)
			.then(function (oEntity) {
				_Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity,
					_Helper.makeUpdateData(sPropertyPath.split("/"), vValue, bUpdating));
			});
	};

	/**
	 * Updates this cache's query options if it has not yet sent a request.
	 *
	 * @param {object} [mQueryOptions={}]
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
	_Cache.prototype.setQueryOptions = function (mQueryOptions = {}, bForce = false) {
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
	 *   Path of the unit or currency for the property, relative to the (entity or complex) type
	 *   which contains the property to update
	 * @param {boolean} [bPatchWithoutSideEffects]
	 *   Whether the PATCH response is ignored, except for a new ETag
	 * @param {function} fnPatchSent
	 *   The function is called just before a back-end request is sent for the first time.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} fnIsKeepAlive
	 *   A function to tell whether the entity is kept alive
	 * @returns {sap.ui.base.SyncPromise}
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
				oOldData,
				oPatchPromise,
				oPostBody,
				sParkedGroup,
				bSkip,
				sTransientGroup,
				sUnitOrCurrencyValue,
				oUpdateData = _Helper.makeUpdateData(aPropertyPath, vValue);

			/*
			 * Synchronous callback to cancel the PATCH request so that it is really gone when
			 * resetChangesForPath has been called on the binding or model.
			 */
			function onCancel() {
				_Helper.removeByPath(that.mChangeRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity, oOldData);
			}

			/*
			 * Callback to merge the entity's old data into its one remaining PATCH. If
			 * no old data from another PATCH is supplied, the PATCH is skipped and returns its
			 * old data. Otherwise the given old data from the skipped patch is merged into the
			 * surviving PATCH's own old data.
			 *
			 * @param {object} [oOtherOldData]
	 		 *   Either another PATCH's old data which is to be merged into this one or
			 *   <code>undefined</code> if this PATCH is the skipped one and has to return its own
			 *   old data.
			 * @returns {object}
			 *   This PATCH's old data which is to be merged into another one or
			 *   <code>undefined</code> if this is the surviving PATCH.
			 */
			function mergePatchRequests(oOtherOldData) {
				if (arguments.length === 0) {
					bSkip = true;
					return oOldData; // my PATCH was merged
				}
				_Helper.updateNonExisting(oOldData, oOtherOldData);
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
					mHeaders, oUpdateData, onSubmit, onCancel, /*sMetaPath*/ undefined,
					_Helper.buildPath(that.sOriginalResourcePath, sEntityPath),
					bAtFront, /*mQueryOptions*/ undefined, /*vOwner*/ undefined,
					mergePatchRequests);
				oPatchPromise.$isKeepAlive = fnIsKeepAlive;
				_Helper.addByPath(that.mChangeRequests, sFullPath, oPatchPromise);
				return SyncPromise.all([
					oPatchPromise,
					that.fetchTypes()
				]).then(function (aResult) {
					var oPatchResult = aResult[0];

					_Helper.removeByPath(that.mChangeRequests, sFullPath, oPatchPromise);
					if (bSkip) {
						// if a PATCH is skipped, because it is merged into another, nothing to do!
						return;
					}
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

					if (!fnErrorCallback && !oError.canceled) {
						onCancel();
						throw oError;
					}
					_Helper.removeByPath(that.mChangeRequests, sFullPath, oPatchPromise);
					if (oError.canceled) {
						throw oError;
					}
					oRequestLock.unlock();
					oRequestLock = undefined;

					fnErrorCallback(oError);
					if (bSkip) {
						// Note: this PATCH is already merged into another
						// --> return the corresponding PATCH promise
						return that.mEditUrl2PatchPromise[sEditUrl];
					}

					// Note: We arrive here only for the PATCH which was really sent to the server.
					// The other ones which have been merged are still pending on this one!
					// In the end, they will either succeed or be canceled.
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

					that.mEditUrl2PatchPromise[sEditUrl]
						= patch(that.oRequestor.lockGroup(sRetryGroupId, that, true, true), true);

					return that.mEditUrl2PatchPromise[sEditUrl];
				}).finally(function () {
					if (oRequestLock) {
						oRequestLock.unlock();
					}
					delete that.mEditUrl2PatchPromise[sEditUrl];
				});
			}

			if (!oEntity) {
				throw new Error("Cannot update '" + sPropertyPath + "': '" + sEntityPath
					+ "' does not exist");
			}

			_Helper.deleteUpdating(sPropertyPath, oEntity);

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
			oOldData
				= _Helper.makeUpdateData(aPropertyPath, _Helper.drillDown(oEntity, aPropertyPath));

			oPostBody = _Helper.getPrivateAnnotation(oEntity, "postBody");
			if (oPostBody) {
				// change listeners are informed later
				_Helper.updateAll({}, sEntityPath, oPostBody, oUpdateData);
			}
			// write the changed value into the cache
			_Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sUnitOrCurrencyPath) {
				sUnitOrCurrencyPath
					= _Helper.buildPath(aPropertyPath.slice(0, -1).join("/"), sUnitOrCurrencyPath);
				aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
				sUnitOrCurrencyPath = _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath);
				sUnitOrCurrencyValue = that.getValue(sUnitOrCurrencyPath);
				if (sUnitOrCurrencyValue === undefined) {
					Log.debug("Missing value for unit of measure " + sUnitOrCurrencyPath
							+ " when updating " + sFullPath, that.toString(), sClassName);
				} else {
					// some servers need unit and currency information
					_Helper.merge(sTransientGroup ? oPostBody : oUpdateData,
						_Helper.makeUpdateData(aUnitOrCurrencyPath, sUnitOrCurrencyValue));
				}
			}
			if (sTransientGroup) {
				// When updating a transient entity, the above _Helper.updateAll has already updated
				// the POST request. An inactive entity must remain parked.
				if (sParkedGroup && !oEntity["@$ui5.context.isInactive"]) {
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
	 * @param {number} [iStart]
	 *   The index in the collection where "oRoot.value" needs to be inserted or undefined if
	 *   "oRoot" references a single entity.
	 * @param {boolean} [bKeepReportedMessagesPath]
	 *   Whether <code>this.sReportedMessagesPath</code> should be kept unchanged
	 * @throws {Error}
	 *   If the cache is shared and OData messages would be reported
	 *
	 * @private
	 */
	_Cache.prototype.visitResponse = function (oRoot, mTypeForMetaPath, sRootMetaPath, sRootPath,
			iStart, bKeepReportedMessagesPath) {
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
				that.checkSharedRequest();
				mPathToODataMessages[sInstancePath] = aMessages;
				aMessages.forEach(function (oMessage) {
					oMessage.longtextUrl
						&&= _Helper.makeAbsolute(oMessage.longtextUrl, sContextUrl);
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
						aCachePaths.push(sPredicate || "" + iIndex);
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
			} else if (sPredicate) {
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
					sCount = oInstance[sProperty + "@odata.count"];
					// Note: ignore change listeners, because any change listener that is already
					// registered, is still waiting for its value and gets it via fetchValue
					if (sCount) {
						vPropertyValue.$count = parseInt(sCount);
					} else if (!oInstance[sProperty + "@odata.nextLink"]) {
						// Note: This relies on the fact that $skip/$top is not used on nested lists
						vPropertyValue.$count = vPropertyValue.length;
					} else {
						vPropertyValue.$count = undefined; // see _Helper.setCount
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
		if (bHasMessages && !this.bSharedRequest) {
			if (!bKeepReportedMessagesPath) {
				this.sReportedMessagesPath = this.sOriginalResourcePath;
			}
			this.oRequestor.getModelInterface().reportStateMessages(this.sOriginalResourcePath,
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
	 * @param {string[]} [aSeparateProperties]
	 *   An array of properties which are requested separately
	 *
	 * @alias sap.ui.model.odata.v4.lib._CollectionCache
	 * @constructor
	 */
	function _CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest, aSeparateProperties) {
		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest);

		this.iActiveElements = 0; // number of active (client-side) created elements
		this.oBackup = null; // see #reset
		this.sContext = undefined; // the "@odata.context" from the responses
		this.aElements = []; // the available elements
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // see _Helper.setCount
		// number of all (client-side) created elements (active or inactive)
		this.aElements.$created = 0;
		// this.aElements.$deleted = []; // only created on demand
		// "select all", only created on demand
		// this.aElements["@$ui5.context.isSelected"] = false;
		this.aElements.$tail = undefined; // promise for a read w/o $top
		// upper limit for @odata.count, maybe sharp; assumes #getQueryString can $filter out all
		// created elements
		this.iLimit = Infinity;
		// an array of objects with ranges for pending read requests; each having the following
		// properties:
		// - iStart: the start (inclusive)
		// - iEnd: the end (exclusive)
		this.aReadRequests = [];
		this.aSeparateProperties = aSeparateProperties ?? []; // properties to be loaded separately
		this.bServerDrivenPaging = false;
		this.oSyncPromiseAll = undefined;
	}

	// make CollectionCache a Cache
	_CollectionCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Adds the element to $byPredicate of the cache's element list.
	 *
	 * @param {object} oElement - The element
	 * @throws {Error}
	 *   If the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.addKeptElement = function (oElement) {
		this.checkSharedRequest();
		this.aElements.$byPredicate[_Helper.getPrivateAnnotation(oElement, "predicate")] = oElement;
	};

	/**
	 * Checks the given range of currently available elements to contain the given promise.
	 *
	 * @param {sap.ui.base.SyncPromise} oPromise
	 *   The promise
	 * @param {number} iStart
	 *   The start index
	 * @param {number} iEnd
	 *   The end index (will not be checked)
	 * @throws {Error}
	 *   If there is an index no longer containing the promise
	 *
	 * @private
	 */
	_CollectionCache.prototype.checkRange = function (oPromise, iStart, iEnd) {
		var i;

		// if the request used $tail, not all indexes got the promise, so we cannot easily check
		if (oPromise !== this.aElements.$tail) {
			iEnd = Math.min(iEnd, this.aElements.length);
			for (i = iStart; i < iEnd; i += 1) {
				if (this.aElements[i] !== oPromise) {
					throw new Error("Found data at an index being read from the back end");
				}
			}
		}
	};

	/**
	 * Replaces the old element at the given index with the given new element.
	 *
	 * @param {number} iIndex - The index
	 * @param {object} oElement - The new element
	 * @throws {Error}
	 *   If the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.doReplaceWith = function (iIndex, oElement) {
		var oOldElement = this.aElements[iIndex];

		this.checkSharedRequest();
		if (oOldElement && _Helper.hasPrivateAnnotation(oOldElement, "transientPredicate")
				&& !_Helper.hasPrivateAnnotation(oElement, "transientPredicate")) {
			// when replacing a created element (w/ transientPredicate), make sure the replacement
			// also *looks* like a created one (but do not overwrite existing transientPredicate!)
			_Helper.setPrivateAnnotation(oElement, "transientPredicate",
				_Helper.getPrivateAnnotation(oElement, "predicate"));
		}
		this.aElements[iIndex] = oElement;
		this.addKeptElement(oElement); // maintain $byPredicate
	};

	/**
	 * Drops the element with the given index and predicate from this cache's collection, so that it
	 * will be read again from the server later on. Created persisted elements lose their special
	 * treatment!
	 *
	 * @param {number} iIndex - An index
	 * @param {string} sPredicate - A key predicate
	 * @param {boolean} [bIndexIsSkip] - Whether <code>iIndex</code> is a raw $skip index
	 * @throws {Error} When the element with the given index is still transient
	 *
	 * @public
	 */
	_CollectionCache.prototype.drop = function (iIndex, sPredicate, bIndexIsSkip) {
		if (bIndexIsSkip) {
			iIndex += this.aElements.$created;
		}
		const oElement = this.aElements[iIndex];
		if (oElement["@$ui5.context.isTransient"]) {
			throw new Error("Must not drop a transient element");
		}
		delete this.aElements[iIndex];
		delete this.aElements.$byPredicate[sPredicate];

		const sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");
		if (sTransientPredicate) { // createdPersisted => persisted
			this.aElements.$created -= 1;
			this.iActiveElements -= 1;
			this.iLimit += 1;
			delete this.aElements.$byPredicate[sTransientPredicate];
		}
	};

	/**
	 * Returns a promise to be resolved (synchronously if possible) with an OData object for the
	 * requested data.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
		that.registerChangeListener(sPath, oListener);

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
			return that.drillDown(that.aElements, sPath, oGroupLock, bCreateOnDemand);
		});
	};

	/**
	 * Fills the given range of currently available elements with the given promise. If the
	 * collection count is unknown and it is not an option to enlarge the array to accommodate
	 * <code>iEnd - 1</code>, the promise is stored in <code>aElements.$tail</code>.
	 *
	 * @param {sap.ui.base.SyncPromise} oPromise
	 *   The promise
	 * @param {number} iStart
	 *   The start index
	 * @param {number} iEnd
	 *   The end index (will not be filled)
	 * @throws {Error}
	 *   If the array cannot be filled and the promise was stored in <code>aElements.$tail</code> in
	 *   a previous call already
	 *
	 * @private
	 */
	_CollectionCache.prototype.fill = function (oPromise, iStart, iEnd) {
		var i;

		// iEnd = Infinity is not an issue here. If $count is known, it is taken care of that iEnd
		// is never higher than $count (using iLimit) @see #read, @see ODataUtils#_getReadIntervals.
		// If not, iEnd is reduced to this.aElements.length here.
		if (!this.aElements.$count && iEnd > this.aElements.length && iEnd - iStart > 1024) {
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
	 * Returns a filter that excludes all created entities in this cache's collection and all
	 * entities that have been deleted on the client, but not on the server yet.
	 *
	 * @returns {string|undefined}
	 *   The filter or <code>undefined</code> if there is no such entity.
	 *
	 * @private
	 */
	_CollectionCache.prototype.getExclusiveFilter = function () {
		var aKeyFilters = [],
			mTypeForMetaPath,
			i,
			that = this;

		function addKeyFilter(oElement) {
			var sKeyFilter;

			mTypeForMetaPath ??= that.getTypes(); // Note: $metadata already read
			sKeyFilter = _Helper.getKeyFilter(oElement, that.sMetaPath, mTypeForMetaPath);
			if (sKeyFilter) {
				aKeyFilters.push(sKeyFilter);
			}
		}

		for (i = 0; i < this.aElements.$created; i += 1) {
			const oElement = this.aElements[i];
			if (!oElement["@$ui5.context.isTransient"]) {
				addKeyFilter(oElement);
			}
		}
		(this.aElements.$deleted || []).forEach(function (oDeleted) {
			addKeyFilter(that.aElements.$byPredicate[oDeleted.predicate]);
		});

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
		var sExclusiveFilter = this.getExclusiveFilter(),
			mQueryOptions = Object.assign({}, this.mQueryOptions),
			sFilterOptions = mQueryOptions.$filter,
			sQueryString = this.sQueryString;

		if (this.aSeparateProperties.length) {
			mQueryOptions.$expand = {...mQueryOptions.$expand};
			this.aSeparateProperties.forEach((sProperty) => {
				delete mQueryOptions.$expand[sProperty];
			});
			if (_Helper.isEmptyObject(mQueryOptions.$expand)) {
				delete mQueryOptions.$expand;
			}
			sQueryString = this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false,
				this.bSortExpandSelect, true);
		}

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
	 *   An unlocked lock for the group ID, used only in case $count needs to be requested
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

		// simulate #getExclusiveFilter for newly created persisted
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
			_Helper.setCount(this.mChangeListeners, "", this.aElements,
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
	 * @throws {Error}
	 *   If a kept-alive element has been modified on both client and server
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
		this.visitResponse(oResult, mTypeForMetaPath, undefined, undefined, iStart);
		for (i = 0; i < iResultLength; i += 1) {
			oElement = oResult.value[i];
			sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
			if (sPredicate) {
				oKeptElement = aElements.$byPredicate[sPredicate];
				if (oKeptElement) {
					// only check for ETag change if the cache contains one; otherwise either the
					// cache element is empty (via #addKeptElement) or the server did not send
					// one last time
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
					} // else: ETag changed, ignore kept element!
				}
				aElements.$byPredicate[sPredicate] = oElement;
			}
			aElements[iStart + i - iOffset] = oElement;
		}

		return iOffset;
	};

	/**
	 * Returns whether there are pending deletions in any group but the given one.
	 *
	 * @param {string} sGroupId - The ID of the allowed group
	 * @returns {boolean} Whether there are such pending deletions
	 *
	 * @public
	 */
	_CollectionCache.prototype.isDeletingInOtherGroup = function (sGroupId) {
		return Object.values(this.aElements.$deleted || {}).some(function (oDeleted) {
			return oDeleted.groupId !== sGroupId;
		});
	};

	/**
	 * Returns whether the element at the given index is missing (it does not exist and has not been
	 * requested yet).
	 *
	 * @param {int} iIndex - The index
	 * @returns {boolean} Whether the element is missing
	 *
	 * @protected
	 */
	_CollectionCache.prototype.isMissing = function (iIndex) {
		return this.aElements[iIndex] === undefined
			// if there is $tail, check whether the index is part of some read request
			&& !(this.$tail
				&& this.aReadRequests.some(
					(oReadRequest) => oReadRequest.iStart <= iIndex && iIndex < oReadRequest.iEnd
				)
			);
	};

	/**
	 * Determines the list of elements determined by the given predicates. All other elements from
	 * the back end are discarded!
	 *
	 * @param {string[]} aPredicates
	 *   The key predicates of the root elements to request side effects for
	 * @returns {object[]}
	 *   The list of elements for the given predicates
	 *
	 * @private
	 */
	_CollectionCache.prototype.keepOnlyGivenElements = function (aPredicates) {
		var aElements,
			iMaxIndex = -1,
			mPredicates = {}, // a set of the predicates (as map to true) to speed up the search
			that = this;

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
			if (mPredicates[sPredicate]) {
				iMaxIndex = i;
				delete mPredicates[sPredicate];
				return true; // keep and request
			}

			that.drop(i, sPredicate);
			return false;
		});
		this.aElements.length = iMaxIndex + 1;
		Object.keys(mPredicates).forEach(function (sPredicate) {
			aElements.push(that.aElements.$byPredicate[sPredicate]);
		});

		return aElements;
	};

	/**
	 * Moves the given number of elements from the given old to the given new position within this
	 * cache's collection.
	 *
	 * @param {number} iOldFrom - Old position before the move
	 * @param {number} iNewTo - New position after the move
	 * @param {number} iCount - Number of elements to move
	 *
	 * @protected
	 */
	_CollectionCache.prototype.move = function (iOldFrom, iNewTo, iCount) {
		// Note: do not change reference to this.aElements! It's kept in closures :-(
		// @see #restore
		const aElements = this.aElements;

		// reverse content of [iFirst, iLast]
		function reverse(iFirst, iLast) {
			while (iFirst < iLast) {
				const vSwap = aElements[iFirst];
				aElements[iFirst] = aElements[iLast];
				aElements[iLast] = vSwap;
				iFirst += 1;
				iLast -= 1;
			}
		}

		// inplace block swap of adjacent [iStart, iMiddle[ and [iMiddle, iEnd[
		function swap(iStart, iMiddle, iEnd) {
			reverse(iStart, iMiddle - 1);
			reverse(iMiddle, iEnd - 1);
			reverse(iStart, iEnd - 1);
		}

		if (iCount > 0) {
			if (iOldFrom < iNewTo) {
				swap(iOldFrom, iOldFrom + iCount, iNewTo + iCount);
			} else if (iOldFrom > iNewTo) {
				swap(iNewTo, iOldFrom, iOldFrom + iCount);
			} // else: nothing to do
		}
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
	 * @param {boolean} [bIndexIsSkip]
	 *   Whether <code>iIndex</code> is a raw $skip index
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>, enhanced
	 *   with a number property <code>$count</code> representing the element count on server-side;
	 *   <code>$count</code> may be <code>undefined</code>, but not <code>Infinity</code>). If an
	 *   HTTP request fails, the error from the _Requestor is returned and the requested range is
	 *   reset to <code>undefined</code>. If the request has been obsoleted by a {@link #reset}, the
	 *   promise is rejected with an error having a property <code>canceled = true</code>.
	 * @throws {Error} If given index or length is less than 0
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	_CollectionCache.prototype.read = function (iIndex, iLength, iPrefetchLength, oGroupLock,
			fnDataRequested, bIndexIsSkip) {
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
				return that.read(iIndex, iLength, iPrefetchLength, oGroupLock, fnDataRequested,
					bIndexIsSkip);
			});
		}

		if (bIndexIsSkip) {
			iIndex += this.aElements.$created;
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
				// #getExclusiveFilter) (JIRA: CPOUI5ODATAV4-1521)
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
		aElementsRange = this.aElements.slice(Math.max(0, iIndex - iPrefetchLength), iEnd);
		if (this.aElements.$tail) {
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
	 * @param {boolean} [bIgnorePendingChanges]
	 *   Whether kept elements are refreshed although there are pending changes.
	 * @param {boolean} [bDropApply]
	 *   Whether to drop the "$apply" system query option from the resulting GET
	 * @returns {Promise<void>|undefined}
	 *   A promise which is resolved without a defined result, or rejected with an error if the
	 *   refresh fails, or <code>undefined</code> if there are no kept-alive elements.
	 * @throws {Error}
	 *   If the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.refreshKeptElements = function (oGroupLock, fnOnRemove,
			bIgnorePendingChanges, bDropApply) {
		var that = this,
			// Note: at this time only kept-alive, created, and deleted elements are in the cache,
			// but we don't care if $byPredicate still contains two entries for the same element
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
				mQueryOptions = _Helper.clone(that.mQueryOptions);

			if (that.mLateQueryOptions) {
				_Helper.aggregateExpandSelect(mQueryOptions, that.mLateQueryOptions);
			}
			if (bDropApply) {
				delete mQueryOptions.$apply;
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
		 * Tells whether a refresh is needed for the given predicate. Transient predicates,
		 * elements with pending changes, and empty elements just created via
		 * {@link sap.ui.model.odata.v4.ODataModel#getKeepAliveContext} but not yet read, need no
		 * refresh.
		 *
		 * @param {string} sPredicate - A key predicate
		 * @returns {boolean} - Whether a refresh is needed
		 */
		function isRefreshNeeded(sPredicate) {
			var oElement = that.aElements.$byPredicate[sPredicate];

			return _Helper.getPrivateAnnotation(oElement, "predicate") === sPredicate
				&& Object.keys(oElement).length > 1 // entity has key properties
				&& !oElement["@$ui5.context.isDeleted"]
				&& !that.hasPendingChangesForPath(sPredicate, bIgnorePendingChanges);
		}

		this.checkSharedRequest();
		if (aPredicates.length === 0) {
			return undefined;
		}

		mTypes = this.getTypes(); // in this stage the promise is resolved

		return this.oRequestor.request("GET", calculateKeptElementsQuery(), oGroupLock)
			.then(function (oResponse) {
				var mStillAliveElements;

				that.visitResponse(oResponse, mTypes, undefined, undefined, 0);
				mStillAliveElements = oResponse.value.$byPredicate || {};

				aPredicates.forEach(function (sPredicate) {
					var oElement, iIndex;

					if (sPredicate in mStillAliveElements) {
						_Helper.updateAll(that.mChangeListeners, sPredicate,
							that.aElements.$byPredicate[sPredicate],
							mStillAliveElements[sPredicate]);
					} else {
						oElement = that.aElements.$byPredicate[sPredicate];
						if (_Helper.hasPrivateAnnotation(oElement, "transientPredicate")) {
							// Note: iIndex unknown, use -1 instead
							iIndex = that.removeElement(-1, sPredicate);
						} else {
							delete that.aElements.$byPredicate[sPredicate];
						}
						fnOnRemove(sPredicate, iIndex);
					}
				});
			});
	};

	/**
	 * Removes the element with the given predicate from $byPredicate of the cache's element list.
	 *
	 * @param {string} sPredicate - The predicate
	 * @throws {Error}
	 *   If the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.removeKeptElement = function (sPredicate) {
		this.checkSharedRequest();
		delete this.aElements.$byPredicate[sPredicate];
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
	 *   An unlocked lock for the group ID
	 * @param {number} iTransientElements
	 *   The number of transient elements within the given group
	 * @param {function} [fnDataRequested]
	 *   The function is called when the back-end requests have been sent.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result when the request is finished and
	 *   rejected in case of error; if the request has been obsoleted by a {@link #reset} the error
	 *   has a property <code>canceled = true</code>)
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
				bObsolete : false,
				iStart : iStart
			},
			that = this;

		this.aReadRequests.push(oReadRequest);
		this.bSentRequest = true;
		// This must be a SyncPromise, but nevertheless asynchronous. Otherwise, the then/catch
		// handler would be called synchronous and this.fill(oPromise, ...) would run afterwards and
		// destroy the result.
		oPromise = SyncPromise.all([
			this.mQueryOptions.$filter === "false"
				? Promise.resolve({
					"@odata.count" : "0", // EDM.Int64
					value : []
				})
				: this.oRequestor.request("GET",
					this.getResourcePathWithQuery(iStart, iEnd),
					oGroupLock, undefined, undefined, fnDataRequested),
			this.fetchTypes()
		]).then(function (aResult) {
			var iFiltered;

			if (oReadRequest.bObsolete) {
				const oError = new Error("Request is obsolete");
				oError.canceled = true;
				throw oError;
			}
			that.checkRange(oPromise, oReadRequest.iStart, oReadRequest.iEnd);
			if (that.aElements.$tail === oPromise) {
				that.aElements.$tail = undefined;
			}
			iFiltered = that.handleResponse(aResult[0], oReadRequest.iStart, aResult[1]);

			return that.handleCount(oGroupLock, iTransientElements, oReadRequest.iStart,
				oReadRequest.iEnd, aResult[0], iFiltered);
		}).catch(function (oError) {
			if (!oError.canceled) {
				that.checkRange(oPromise, oReadRequest.iStart, oReadRequest.iEnd);
				that.fill(undefined, oReadRequest.iStart, oReadRequest.iEnd);
			}
			throw oError;
		}).finally(function () {
			that.aReadRequests.splice(that.aReadRequests.indexOf(oReadRequest), 1);
		});

		// Note: oPromise MUST be a SyncPromise for performance reasons, see SyncPromise#all
		this.fill(oPromise, iStart, iEnd);

		return oPromise;
	};

	/**
	 * Returns a promise to be resolved when the side effects have been applied to the elements
	 * with the given key predicates. All other elements from the back end are discarded!
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group that is associated with the request;
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {string[]} aPredicates
	 *   The key predicates of the root elements to request side effects for
	 * @param {boolean} bSingle
	 *   Whether only the side effects for a single element are requested; no element is discarded
	 *   in this case
	 * @param {boolean} bWithMessages
	 *   Whether the "@com.sap.vocabularies.Common.v1.Messages" path is treated specially
	 * @returns {Promise<void>|sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result, or rejected with an error if loading
	 *   of side effects fails
	 * @throws {Error}
	 *   If group ID is '$cached' (the error has a property <code>$cached = true</code> then) or if
	 *   the cache is shared
	 *
	 * @public
	 */
	_CollectionCache.prototype.requestSideEffects = function (oGroupLock, aPaths, aPredicates,
			bSingle, bWithMessages) {
		var aElements,
			mMergeableQueryOptions,
			mQueryOptions,
			sResourcePath,
			bSkip,
			mTypeForMetaPath = this.getTypes(),
			that = this;

		/*
		 * Handles the response for a single element.
		 *
		 * @param {object} oElement - The response for a single element
		 * @param {string} [sPredicate] - The element's key predicate
		 */
		function handle(oElement,
				sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate")) {
			that.beforeUpdateSelected?.(sPredicate, oElement);
			_Helper.updateSelected(that.mChangeListeners, sPredicate,
				that.aElements.$byPredicate[sPredicate], oElement, aPaths,
				function preventKeyPredicateChange(sPath) {
					sPath = sPath.slice(sPredicate.length + 1); // strip sPredicate
					// not (below) a $NavigationPropertyPath?
					return !aPaths.some(function (sSideEffectPath) {
						return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
					});
				});
		}

		this.checkSharedRequest();

		mQueryOptions = _Helper.intersectQueryOptions(
			Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths,
			this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath, "", bWithMessages);
		if (!mQueryOptions) {
			return SyncPromise.resolve(); // micro optimization: use *sync.* promise which is cached
		}
		this.beforeRequestSideEffects?.(mQueryOptions);

		delete mQueryOptions.$count;
		delete mQueryOptions.$orderby;
		delete mQueryOptions.$search;
		if (bSingle) {
			delete mQueryOptions.$filter;
		} else {
			aElements = this.keepOnlyGivenElements(aPredicates);
			if (!aElements.length) {
				return SyncPromise.resolve(); // micro optimization: use cached *sync.* promise
			}
			mQueryOptions.$filter = aElements.map(function (oElement) {
				// all elements have a key predicate, so we will get a key filter
				return _Helper.getKeyFilter(oElement, that.sMetaPath, mTypeForMetaPath);
			}).sort().join(" or ");
			if (aElements.length > 1) { // avoid small default page size for server-driven paging
				mQueryOptions.$top = aElements.length;
			}
			_Helper.selectKeyProperties(mQueryOptions, mTypeForMetaPath[this.sMetaPath]);
		}
		mMergeableQueryOptions = _Helper.extractMergeableQueryOptions(mQueryOptions);
		sResourcePath = this.sResourcePath + (bSingle ? aPredicates[0] : "")
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
				if (bSkip) {
					return;
				}

				if (bSingle) {
					that.visitResponse(oResult, mTypeForMetaPath, undefined, aPredicates[0],
						undefined, true);
					handle(oResult, aPredicates[0]);
				} else {
					if (oResult.value.length !== aElements.length) {
						throw new Error("Expected " + aElements.length + " row(s), but instead saw "
							+ oResult.value.length);
					}
					// Note: iStart makes no sense here (use NaN instead), but is not needed because
					// we know we have key predicates
					that.visitResponse(oResult, mTypeForMetaPath, undefined, "", NaN, true);
					for (let i = 0, n = oResult.value.length; i < n; i += 1) {
						handle(oResult.value[i]);
					}
				}
			});
	};

	/**
	 * Resets this cache to its initial state, but keeps certain elements and their change listeners
	 * alive: all kept-alive elements identified by the given key predicates as well as all
	 * transient and deleted elements on top level.
	 *
	 * @param {string[]} aKeptElementPredicates
	 *   The key predicates for all kept-alive elements
	 * @param {string} [sGroupId]
	 *   The group ID used for a side-effects refresh; if given, only inline creation
	 *   rows and transient elements with a different batch group shall be kept in place and a
	 *   backup shall be remembered for a later {@link #restore}
	 * @param {object} [mQueryOptions]
	 *   The new query options
	 * @param {object} [_oAggregation]
	 *   An object holding the information needed for data aggregation; see also "OData Extension
	 *   for Data Aggregation Version 4.0"; must already be normalized by
	 *   {@link _AggregationHelper.buildApply}
	 * @param {boolean} [_bIsGrouped]
	 *   Whether the list binding is grouped via its first sorter
	 * @throws {Error}
	 *   If a cache is shared and a group ID is given
	 *
	 * @public
	 * @see _Cache#hasPendingChangesForPath
	 */
	_CollectionCache.prototype.reset = function (aKeptElementPredicates, sGroupId, mQueryOptions,
			_oAggregation, _bIsGrouped) {
		var mByPredicate = this.aElements.$byPredicate,
			mChangeListeners = this.mChangeListeners,
			iCreated = 0, // index (and finally number) of created elements that we keep
			oElement,
			sTransientGroup,
			i,
			that = this;

		if (sGroupId) {
			this.checkSharedRequest();
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

		if (mQueryOptions) {
			this.setQueryOptions(mQueryOptions, true);
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
		Object.keys(mByPredicate).forEach(function (sPredicate) {
			if ("@$ui5.context.isDeleted" in mByPredicate[sPredicate]) {
				aKeptElementPredicates.push(sPredicate);
			}
		});
		this.mChangeListeners = {};
		this.sContext = undefined;
		this.aElements.length = this.aElements.$created = iCreated;
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // needed for _Helper.setCount
		// Note: this.aElements.$deleted must remain unchanged
		this.iLimit = Infinity;

		Object.keys(mChangeListeners).forEach(function (sPath) {
			if (sPath === "$count" || aKeptElementPredicates.includes(sPath.split("/")[0])) {
				that.mChangeListeners[sPath] = mChangeListeners[sPath];
			}
		});
		aKeptElementPredicates.forEach(function (sPredicate) {
			that.aElements.$byPredicate[sPredicate] = mByPredicate[sPredicate];
		});
		// Beware: fireChange can initiate a read which must not be obsoleted
		this.aReadRequests?.forEach((oReadRequest) => {
			oReadRequest.bObsolete = true;
		});
		if (mChangeListeners[""]) {
			this.mChangeListeners[""] = mChangeListeners[""];
			_Helper.fireChange(this.mChangeListeners, "");
		}
		Object.values(this.aElements.$deleted || {}).forEach(function (oDeleted) {
			oDeleted.index = undefined;
		});
	};

	/**
	 * Restores the last backup taken by {@link #reset} with <code>sGroupId</code>, if told to
	 * really do so; drops the backup in any case to free memory.
	 *
	 * @param {boolean} bReally - Whether to really restore, not just drop the backup
	 * @throws {Error}
	 *   If a shared cache is told to really restore
	 *
	 * @public
	 */
	_CollectionCache.prototype.restore = function (bReally) {
		if (bReally) {
			this.checkSharedRequest();
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

	/**
	 * Sets the cache's $count at the root level to 0.
	 *
	 * @protected
	 */
	_CollectionCache.prototype.setEmpty = function () {
		this.iLimit = this.aElements.$count = 0;
	};

	/**
	 * Sets the "@$ui5.context.isInactive" annotation at the entity with the given path, which might
	 * activate it.
	 *
	 * @param {string} sPath - The path
	 * @param {boolean|number} bInactive
	 *   The new value, either <code>false</code> to activate it, or <code>1</code> to mark it as
	 *   inactive, but changed
	 *
	 * @public
	 */
	_CollectionCache.prototype.setInactive = function (sPath, bInactive) {
		const oElement = this.getValue(sPath);
		_Helper.updateAll(this.mChangeListeners, sPath, oElement,
			{"@$ui5.context.isInactive" : bInactive});
		if (!bInactive) { // activate
			_Helper.deletePrivateAnnotation(oElement, "initialData");
			this.iActiveElements += 1;
			_Helper.addToCount(this.mChangeListeners, "", this.aElements, 1);
		}
	};

	/**
	 * Sets the cache's elements to the given collection after a deep create.
	 *
	 * @param {object} aElements - The elements from the deep create
	 *
	 * @public
	 */
	_CollectionCache.prototype.setPersistedCollection = function (aElements) {
		this.aElements = aElements;
		this.iActiveElements = aElements.$created;
		this.iLimit = aElements.length;
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
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
		that.registerChangeListener("", oListener);

		return this.oPromise.then(function (oResult) {
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
	 * @param {string} [sOriginalResourcePath=sResourcePath]
	 *   The cache's original resource path to be used to build the target path for bound messages
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, the initial request must be
	 *   done via {@link #post}. {@link #fetchValue} expects to have cache data, but may initiate
	 *   requests for late properties. If <code>false<code>, {@link #post} throws an error.
	 * @param {string} [sMetaPath]
	 *   Optional meta path in case it cannot be derived from the given resource path
	 * @param {boolean} [bEmpty]
	 *   Whether the cache is initialized with an empty response so that all properties are fetched
	 *   as late properties
	 * @alias sap.ui.model.odata.v4.lib._SingleCache
	 * @constructor
	 * @private
	 */
	function _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bSharedRequest, sOriginalResourcePath, bPost, sMetaPath, bEmpty) {
		_Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sOriginalResourcePath, bSharedRequest);

		this.sMetaPath = sMetaPath || this.sMetaPath; // overrides Cache c'tor
		this.bPost = bPost;
		this.bPosting = false;
		if (bEmpty) {
			// simulates an empty response and ensure that all properties become late properties
			this.oPromise = SyncPromise.resolve({});
		} else {
			this.oPromise = null; // a SyncPromise for the current value
		}
	}

	// make SingleCache a Cache
	_SingleCache.prototype = Object.create(_Cache.prototype);

	/**
	 * Builds the cache's original resource path to be used to build the target path for bound
	 * messages.
	 *
	 * @param {object} oRootEntity
	 *   The root entity
	 * @param {object} mTypeForMetaPath
	 *   A map from absolute meta path to entity type (as delivered by {@link #fetchTypes})
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function returning the cache's original resource path to be used to build the target path
	 *   for bound messages
	 *
	 * @private
	 */
	_SingleCache.prototype.buildOriginalResourcePath = function (oRootEntity, mTypeForMetaPath,
			fnGetOriginalResourcePath) {
		if (fnGetOriginalResourcePath) {
			this.calculateKeyPredicate(oRootEntity, mTypeForMetaPath, this.sMetaPath);
			this.sOriginalResourcePath = fnGetOriginalResourcePath(oRootEntity);
		}
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data. Calculates
	 * the key predicates for all entities in the result before the promise is resolved.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
	 * @param {function(object):string} [fnGetOriginalResourcePath]
	 *   A function returning the cache's original resource path to be used to build the target path
	 *   for bound messages; it is called once with the response object as parameter
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet, or if group ID is
	 *   '$cached' and the value is not cached (the error has a property <code>$cached = true</code>
	 *   then)
	 *
	 * @public
	 */
	_SingleCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener,
			bCreateOnDemand, fnGetOriginalResourcePath) {
		var sResourcePath = this.sResourcePath + this.sQueryString,
			that = this;

		this.registerChangeListener(sPath, oListener);
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
				that.buildOriginalResourcePath(aResult[0], aResult[1], fnGetOriginalResourcePath);
				that.visitResponse(aResult[0], aResult[1]);
				return aResult[0];
			});
			this.bSentRequest = true;
		}
		return this.oPromise.then(function (oResult) {
			if (oResult && oResult["$ui5.deleted"]) {
				throw new Error("Cannot read a deleted entity");
			}
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
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
	 * @param {function(object):string} [fnGetOriginalResourcePath]
	 *   A function returning the cache's original resource path to be used to build the target path
	 *   for bound messages; it is called once with the response object as parameter
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST, another POST is still being processed, or the cache is
	 *   shared
	 *
	 * @public
	 */
	_SingleCache.prototype.post = function (oGroupLock, oData, oEntity, bIgnoreETag,
			fnOnStrictHandlingFailed, fnGetOriginalResourcePath) {
		var sGroupId,
			mHeaders = oEntity
				? {"If-Match" : bIgnoreETag && "@odata.etag" in oEntity ? "*" : oEntity}
				: {},
			sHttpMethod = "POST",
			oRequestLock,
			that = this;

		/*
		 * Synchronous callback called when the request is put on the wire. Locks the group (for
		 * bound actions) so that further requests created via {@link ODataModel#submitBatch} wait
		 * until this request has returned.
		 */
		function onSubmit() {
			oRequestLock = that.oRequestor.lockGroup(sGroupId, that, true);
		}

		function post(oGroupLock0) {
			that.bPosting = true;

			// BEWARE! Avoid finally here! BCP: 2070200175
			return SyncPromise.all([
				that.oRequestor.request(sHttpMethod,
					that.sResourcePath + that.sQueryString, oGroupLock0, mHeaders, oData,
					oEntity && sGroupId !== "$single" && onSubmit),
				that.fetchTypes()
			]).then(function (aResult) {
				that.buildOriginalResourcePath(aResult[0], aResult[1], fnGetOriginalResourcePath);
				that.visitResponse(aResult[0], aResult[1]);
				if (that.mQueryOptions && that.mQueryOptions.$select) {
					// add "@$ui5.noData" annotations, e.g. for missing Edm.Stream properties
					_Helper.updateSelected({}, "", aResult[0], aResult[0],
						that.mQueryOptions.$select);
				}
				that.bPosting = false;
				if (oRequestLock) {
					oRequestLock.unlock();
				}

				return aResult[0];
			}, function (oError) {
				that.bPosting = false;
				if (oRequestLock) {
					oRequestLock.unlock();
					oRequestLock = undefined; // in case we fail again before next submit
				}
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
			if (this.oRequestor.isActionBodyOptional() && _Helper.isEmptyObject(oData)) {
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
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {string} [sResourcePath=this.sResourcePath]
	 *   A resource path relative to the service URL; it must not contain a query string
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result, or rejected with an error if loading
	 *   of side effects fails.
	 * @throws {Error} If the side effects require a $expand, if group ID is '$cached' (the error
	 *   has a property <code>$cached = true</code> then), or if the cache is shared
	 *
	 * @public
	 */
	_SingleCache.prototype.requestSideEffects = function (oGroupLock, aPaths, sResourcePath) {
		var mMergeableQueryOptions,
			mQueryOptions,
			oResult,
			bSkip,
			that = this;

		this.checkSharedRequest();

		mQueryOptions = this.oPromise && _Helper.intersectQueryOptions(
			Object.assign({}, this.mQueryOptions, this.mLateQueryOptions), aPaths,
			this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath);
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
			_Helper.updateSelected(that.mChangeListeners, "", oOldValue, oNewValue, aPaths,
				function (sPath) {
					// not (below) a $NavigationPropertyPath?
					return !aPaths.some(function (sSideEffectPath) {
						return _Helper.getRelativePath(sPath, sSideEffectPath) !== undefined;
					});
			});
		});

		return oResult;
	};

	/**
	 * Resets the property for the given path. This means that the next #fetchValue will request the
	 * property again via #fetchLateProperty. Deletes also the entity's ETag within the cache in
	 * order to allow that it may change.
	 *
	 * @param {string} sPath - The path to the property within the cache
	 *
	 * @private
	 */
	_SingleCache.prototype.resetProperty = function (sPath) {
		var oData = this.oPromise.getResult();

		if (oData) {
			sPath.split("/").some(function (sProperty) {
				// Note: all ETags that are reached by the given sPath are deleted in order to
				// prevent that #fetchLateProperty throws "Key predicate changed from ..."
				// Ideally only the ETag for the entity the property belongs to should be deleted.
				// But because PATCH within SingletonPropertyCache is anyhow not supported we can
				// delete all ETags so far
				delete oData["@odata.etag"];
				if (typeof oData[sProperty] === "object") {
					oData = oData[sProperty];
					return false;
				}
				delete oData[sProperty];
				return true;
			});
		}
	};

	//*********************************************************************************************
	// SingletonPropertyCache
	//*********************************************************************************************
	/**
	 * Creates a cache for a property that belongs to an OData singleton by creating a _SingleCache
	 * for the singleton and remembering the property path within that _SingleCache. All
	 * _SingletonPropertyCaches that belong to the same singleton share the same _SingleCache if
	 * they have the same query options.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @private
	 */
	function _SingletonPropertyCache(oRequestor, sResourcePath, mQueryOptions) {
		var aSegments = sResourcePath.split("/"),
			sSingleton = aSegments[0],
			sSingletonKey = sSingleton + JSON.stringify(mQueryOptions),
			mSingletonCacheByPath;

		_PropertyCache.call(this, oRequestor, sResourcePath,
			{/*mQueryOptions will be passed to the _SingleCache*/});

		mSingletonCacheByPath = oRequestor.$mSingletonCacheByPath ??= {};
		this.oSingleton = mSingletonCacheByPath[sSingletonKey]
			??= new _SingleCache(oRequestor, sSingleton, mQueryOptions,
				/*bSortExpandSelect*/ undefined, /*bSharedRequest*/ undefined,
				/*sOriginalResourcePath*/ undefined, /*bPost*/ undefined,
				/*sMetaPath*/ undefined, /*bEmpty*/ true);
		this.sRelativePath = sResourcePath.split(sSingleton + "/")[1];
	}

	// make _SingletonPropertyCache a _PropertyCache
	_SingletonPropertyCache.prototype = Object.create(_PropertyCache.prototype);

	/**
	 * Delegates to #fetchValue of its shared OData Singleton _SingleCache. Within the 1st call its
	 * own relative property path is added to the mLateQueryOptions of its _SingleCache.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group to associate the request with
	 *   see {@link sap.ui.model.odata.v4.lib._Requestor#request} for details
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
	_SingletonPropertyCache.prototype.fetchValue = function (oGroupLock, _sPath, fnDataRequested,
			oListener, bCreateOnDemand) {
		var sPropertyPath = this.oSingleton.sResourcePath + "/" + this.sRelativePath,
			mLateQueryOptions,
			oMetadataPromise = this.oMetadataPromise || this.oRequestor.getModelInterface()
				.fetchMetadata("/" + _Helper.getMetaPath(sPropertyPath)),
			that = this;

		return oMetadataPromise.then(function () {
			if (!that.oMetadataPromise) {
				mLateQueryOptions = that.oSingleton.getLateQueryOptions() || {};
				_Helper.aggregateExpandSelect(mLateQueryOptions,
					_Helper.wrapChildQueryOptions("/" + that.oSingleton.sResourcePath,
						that.sRelativePath, {}, that.oRequestor.getModelInterface().fetchMetadata));
				that.oSingleton.setLateQueryOptions(mLateQueryOptions);
			}
			that.oMetadataPromise = oMetadataPromise;
			return that.oSingleton.fetchValue(oGroupLock, that.sRelativePath, fnDataRequested,
				oListener, bCreateOnDemand);
		});
	};

	/**
	 * Resets the property for its own relative path within the singleton's single cache. This means
	 * that the next #fetchValue will request the property again via #fetchLateProperty. Deletes
	 * also the entity's ETag within the cache in order to allow that it may change.
	 *
	 * @public
	 */
	_SingletonPropertyCache.prototype.reset = function () {
		this.oSingleton.resetProperty(this.sRelativePath);
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
	 *   A resource path relative to the service URL; it must not contain a query string
	 *   <br>
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
	 * @param {string[]} [aSeparateProperties]
	 *   An array of properties which are requested separately
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	_Cache.create = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath, bSharedRequest, aSeparateProperties) {
		var iCount, aKeys, sPath, oSharedCollectionCache, mSharedCollectionCacheByPath;

		if (bSharedRequest) {
			sPath = sResourcePath
				+ oRequestor.buildQueryString(_Helper.getMetaPath("/" + sResourcePath),
					mQueryOptions, false, bSortExpandSelect);
			mSharedCollectionCacheByPath = oRequestor.$mSharedCollectionCacheByPath ??= {};
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
				sDeepResourcePath, bSharedRequest, aSeparateProperties);
	};

	/**
	 * Creates a cache for a single property that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string
	 *   <br>
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
		if (sResourcePath.includes("(") || sResourcePath.endsWith("/$count")) {
			return new _PropertyCache(oRequestor, sResourcePath, mQueryOptions);
		}
		return new _SingletonPropertyCache(oRequestor, sResourcePath, mQueryOptions);
	};

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL; it must not contain a query string
	 *   <br>
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
	 * @param {string} [sOriginalResourcePath=sResourcePath]
	 *   The original resource path to be used to build the target path for bound messages
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
			bSharedRequest, sOriginalResourcePath, bPost, sMetaPath) {
		return new _SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			bSharedRequest, sOriginalResourcePath, bPost, sMetaPath);
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

	return _Cache;
});
