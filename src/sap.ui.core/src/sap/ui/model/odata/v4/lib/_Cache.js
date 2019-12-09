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
	"sap/ui/thirdparty/jquery"
], function (_GroupLock, _Helper, _Requestor, Log, isEmptyObject, SyncPromise, jQuery) {
	"use strict";

	var // Matches if ending with a transient key predicate:
		//   EMPLOYEE($uid=id-1550828854217-16) -> aMatches[0] === "($uid=id-1550828854217-16)"
		//   @see sap.base.util.uid
		rEndsWithTransientPredicate = /\(\$uid=[-\w]+\)$/,
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
		return sPath === "" || sRequestPath === sPath || sRequestPath.indexOf(sPath + "/") === 0;
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string;
	 *   note that this flag can safely be ignored for all "new" features (after 1.47) which
	 *   should just sort always
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function that returns the cache's original resource path to be used to build the target
	 *   path for bound messages; if it is not given or returns nothing, <code>sResourcePath</code>
	 *   is used instead. See {@link #getOriginalResourcePath}.
	 *
	 * @private
	 */
	function Cache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath) {
		this.bActive = true;
		this.mChangeListeners = {}; // map from path to an array of change listeners
		this.fnGetOriginalResourcePath = fnGetOriginalResourcePath;
		// the query options extended by $select for late properties
		this.mLateQueryOptions = null;
		this.sMetaPath = _Helper.getMetaPath("/" + sResourcePath);
		this.mPatchRequests = {}; // map from path to an array of (PATCH) promises
		// a promise with attached properties $count, $resolve existing while DELETEs or POSTs are
		// being sent
		this.oPendingRequestsPromise = null;
		this.mPostRequests = {}; // map from path to an array of entity data (POST bodies)
		// map from resource path to request Promise for pending late property requests
		this.mPropertyRequestByPath = {};
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath;
		this.bSortExpandSelect = bSortExpandSelect;
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
	 *   The entity's path within the cache (as used by change listeners)
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding.
	 * @param {function} fnCallback
	 *   A function which is called after a transient entity has been deleted from the cache or
	 *   after the entity has been deleted from the server and from the cache; the index of the
	 *   entity and the entity list are passed as parameter
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise for the DELETE request
	 *
	 * @public
	 */
	Cache.prototype._delete = function (oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback) {
		var aSegments = sPath.split("/"),
			vDeleteProperty = aSegments.pop(),
			sParentPath = aSegments.join("/"),
			that = this;

		this.addPendingRequest();

		return this.fetchValue(_GroupLock.$cached, sParentPath).then(function (vCacheData) {
			var oEntity = vDeleteProperty
					? vCacheData[Cache.from$skip(vDeleteProperty, vCacheData)]
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
				return undefined;
			}
			if (oEntity["$ui5.deleting"]) {
				throw new Error("Must not delete twice: " + sEditUrl);
			}
			oEntity["$ui5.deleting"] = true;
			mHeaders = {"If-Match" : oETagEntity || oEntity};
			sEditUrl += that.oRequestor.buildQueryString(that.sMetaPath, that.mQueryOptions, true);
			return that.oRequestor.request("DELETE", sEditUrl, oGroupLock, mHeaders, undefined,
					undefined, undefined, undefined,
					_Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath))
				.catch(function (oError) {
					if (oError.status !== 404) {
						delete oEntity["$ui5.deleting"];
						throw oError;
					} // else: map 404 to 200
				})
				.then(function () {
					if (Array.isArray(vCacheData)) {
						fnCallback(
							that.removeElement(vCacheData, Number(vDeleteProperty), sKeyPredicate,
								sParentPath),
							vCacheData);
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
					that.oRequestor.getModelInterface().reportBoundMessages(that.sResourcePath, [],
						[sEntityPath]);
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
	Cache.prototype.addPendingRequest = function () {
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
	 * @returns {string}
	 *   The key predicate or <code>undefined</code>, if key predicate cannot be determined
	 * @private
	 */
	// Note: overridden by _AggregationCache.calculateKeyPredicate
	Cache.prototype.calculateKeyPredicate = function (oInstance, mTypeForMetaPath, sMetaPath) {
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
	 * Throws an error if the cache is not active.
	 *
	 * @throws {Error} If the cache is not active
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
	 * Creates a transient entity at the front of the list and adds a POST request to the batch
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
	 * @param {function} fnCancelCallback
	 *   A function which is called after a transient entity has been canceled from the cache
	 * @param {function} fnErrorCallback
	 *   A function which is called with an error object each time a POST request for the create
	 *   fails
	 * @param {function} fnSubmitCallback
	 *   A function which is called just before a POST request for the create is sent
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved with the created entity when the POST request has been
	 *   successfully sent and the entity has been marked as non-transient
	 *
	 * @public
	 */
	Cache.prototype.create = function (oGroupLock, oPostPathPromise, sPath, sTransientPredicate,
			oEntityData, fnCancelCallback, fnErrorCallback, fnSubmitCallback) {
		var aCollection,
			bKeepTransientPath = oEntityData && oEntityData["@$ui5.keepTransientPath"],
			that = this;

		// Clean-up when the create has been canceled.
		function cleanUp() {
			_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
			aCollection.splice(aCollection.indexOf(oEntityData), 1);
			aCollection.$created -= 1;
			addToCount(that.mChangeListeners, sPath, aCollection, -1);
			delete aCollection.$byPredicate[sTransientPredicate];
			if (!sPath) {
				// Note: sPath is empty only in a CollectionCache, so we may call adjustReadRequests
				that.adjustReadRequests(0, -1);
			}
			fnCancelCallback();
		}

		// Sets a marker that the create request is pending, so that update and delete fail.
		function setCreatePending() {
			that.addPendingRequest();
			_Helper.setPrivateAnnotation(oEntityData, "transient", true);
			fnSubmitCallback();
		}

		function request(sPostPath, oPostGroupLock) {
			var sPostGroupId = oPostGroupLock.getGroupId();

			// mark as transient (again)
			_Helper.setPrivateAnnotation(oEntityData, "transient", sPostGroupId);
			_Helper.addByPath(that.mPostRequests, sPath, oEntityData);
			return SyncPromise.all([
				that.oRequestor.request("POST", sPostPath, oPostGroupLock, null, oEntityData,
					setCreatePending, cleanUp, undefined,
					_Helper.buildPath(that.sResourcePath, sPath, sTransientPredicate)),
				that.fetchTypes()
			]).then(function (aResult) {
				var oCreatedEntity = aResult[0],
					sPredicate;

				_Helper.deletePrivateAnnotation(oEntityData, "transient");
				oEntityData["@$ui5.context.isTransient"] = false;
				_Helper.removeByPath(that.mPostRequests, sPath, oEntityData);
				that.visitResponse(oCreatedEntity, aResult[1],
					_Helper.getMetaPath(_Helper.buildPath(that.sMetaPath, sPath)),
					sPath + sTransientPredicate, bKeepTransientPath);
				if (!bKeepTransientPath) {
					sPredicate = _Helper.getPrivateAnnotation(oCreatedEntity, "predicate");
					if (sPredicate) {
						aCollection.$byPredicate[sPredicate] = oEntityData;
						_Helper.updateTransientPaths(that.mChangeListeners, sTransientPredicate,
							sPredicate);
						// Do not remove transient predicate from aCollection.$byPredicate; some
						// contexts still use the transient predicate to access the data
					}
				}
				// update the cache with the POST response
				_Helper.updateSelected(that.mChangeListeners,
					_Helper.buildPath(sPath, sPredicate || sTransientPredicate), oEntityData,
					oCreatedEntity,
					_Helper.getQueryOptionsForPath(that.mQueryOptions, sPath).$select);

				that.removePendingRequest();
				return oEntityData;
			}, function (oError) {
				if (oError.canceled) {
					// for cancellation no error is reported via fnErrorCallback
					throw oError;
				}
				that.removePendingRequest();
				fnErrorCallback(oError);
				return request(sPostPath, that.oRequestor.lockGroup(
					that.oRequestor.getGroupSubmitMode(sPostGroupId) === "API" ?
						sPostGroupId : "$parked." + sPostGroupId, that, true, true));
			});
		}

		// clone data to avoid modifications outside the cache
		oEntityData = jQuery.extend(true, {}, oEntityData);
		// remove any property starting with "@$ui5."
		oEntityData = _Requestor.cleanPayload(oEntityData);
		_Helper.setPrivateAnnotation(oEntityData, "transientPredicate", sTransientPredicate);
		oEntityData["@$ui5.context.isTransient"] = true;

		aCollection = this.getValue(sPath);
		if (!Array.isArray(aCollection)) {
			throw new Error("Create is only supported for collections; '" + sPath
					+ "' does not reference a collection");
		}
		aCollection.unshift(oEntityData);
		aCollection.$created += 1;
		addToCount(this.mChangeListeners, sPath, aCollection, 1);
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
		_Helper.removeByPath(this.mChangeListeners, sPath, oListener);
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
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the result matching to <code>sPath</code>
	 *
	 * @private
	 */
	Cache.prototype.drillDown = function (oData, sPath, oGroupLock) {
		var oDataPromise = SyncPromise.resolve(oData),
			oEntity,
			iEntityPathLength,
			aSegments,
			bTransient = false,
			that = this;

		function invalidSegment(sSegment) {
			Log.error("Failed to drill-down into " + sPath + ", invalid segment: " + sSegment,
				that.toString(), "sap.ui.model.odata.v4.lib._Cache");
			return undefined;
		}

		/*
		 * Determines the implicit value if the value is missing in the cache. Reports an invalid
		 * segment if there is no implicit value.
		 *
		 * @param {object} oValue The object that is expected to have the value
		 * @param {string} sSegment The path segment that is missing
		 * @param {number} iPathLength The length of the path of the missing value
		 * @returns {any} The value if it could be determined or undefined otherwise
		 */
		function missingValue(oValue, sSegment, iPathLength) {
			var sPropertyPath = sPath.split("/").slice(0, iPathLength).join("/"),
				sReadLink,
				sServiceUrl;

			if (Array.isArray(oValue)) {
				return invalidSegment(sSegment); // missing key predicate or index
			}
			return that.oRequestor.getModelInterface()
				.fetchMetadata(that.sMetaPath + "/" + _Helper.getMetaPath(sPropertyPath))
				.then(function (oProperty) {
					if (!oProperty) {
						return invalidSegment(sSegment);
					}
					if (oProperty.$Type === "Edm.Stream") {
						sReadLink = oValue[sSegment + "@odata.mediaReadLink"];
						sServiceUrl = that.oRequestor.getServiceUrl();
						return sReadLink
							|| _Helper.buildPath(sServiceUrl + that.sResourcePath, sPropertyPath);
					}
					if (!bTransient) {
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
								aSegments.slice(iEntityPathLength).join("/"),
								aSegments.slice(iEntityPathLength, iPathLength).join("/"))
							|| invalidSegment(sSegment);
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
		aSegments = sPath.split("/");
		return aSegments.reduce(function (oPromise, sSegment, i) {
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
				if (_Helper.getPrivateAnnotation(vValue, "predicate")) {
					oEntity = vValue;
					iEntityPathLength = i;
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
					vValue = vValue[Cache.from$skip(sSegment, vValue)];
				}
				// missing advertisement or annotation is not an error
				return vValue === undefined && sSegment[0] !== "#" &&  sSegment[0] !== "@"
					? missingValue(oParentValue, sSegment, i + 1)
					: vValue;
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
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving with the missing property value or <code>undefined</code> if the
	 *   requested property is not an expected late property; it rejects with an error if the GET
	 *   request failed, or if the key predicate or the ETag has changed
	 *
	 * @private
	 */
	Cache.prototype.fetchLateProperty = function (oGroupLock, oResource, sResourcePath,
			sRequestedPropertyPath, sMissingPropertyPath) {
		var sFullResourceMetaPath,
			sFullResourcePath,
			sMergeBasePath, // full resource path plus custom query options
			oPromise,
			mQueryOptions,
			sRequestPath,
			sResourceMetaPath = _Helper.getMetaPath(sResourcePath),
			mTypeForMetaPath = this.fetchTypes().getResult(),
			aUpdateProperties = [sRequestedPropertyPath],
			that = this;

		/*
		 * Visits the query options recursively descending $expand. Determines the target type and
		 * adds key properties to the contained $select. Adds key properties, ETag and key predicate
		 * to aUpdateProperties.
		 *
		 * @param {object} mQueryOptions0 The query options
		 * @param {string} [sBasePath=""] The base (meta) path relative to oResource
		 *   Note: path === metapath here because there are only single (navigation) properties
		 */
		function visitQueryOptions(mQueryOptions0, sBasePath) {
			// the type is available synchronously because the binding read it when checking for
			// late properties
			var sMetaPath = _Helper.buildPath(sFullResourceMetaPath, sBasePath),
				oEntityType = that.oRequestor.fetchTypeForPath(sMetaPath).getResult(),
				sExpand;

			mTypeForMetaPath[sMetaPath] = oEntityType;
			(oEntityType.$Key || []).forEach(function (vKey) {
				if (typeof vKey === "object") {
					vKey = vKey[Object.keys(vKey)[0]]; // the path for the alias
				}
				mQueryOptions0.$select.push(vKey);
				aUpdateProperties.push(_Helper.buildPath(sBasePath, vKey));
			});
			if (sBasePath) {
				aUpdateProperties.push(sBasePath + "/@odata.etag");
				aUpdateProperties.push(sBasePath + "/@$ui5._/predicate");
			}
			if (mQueryOptions0.$expand) {
				if (mQueryOptions0.$select.length > 1) {
					// the first entry in $select is the one in $expand (from intersectQueryOptions)
					// and is unnecessary now
					mQueryOptions0.$select = mQueryOptions0.$select.slice(1);
				}
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
		mQueryOptions = _Helper.intersectQueryOptions({
				// ensure that $select precedes $expand in the resulting query
				$select : this.mLateQueryOptions.$select,
				$expand : this.mLateQueryOptions.$expand
			},
			// no need to convert sRequestedPropertyPath to a metapath, intersectQueryOptions will
			// reject the resulting invalid path
			[_Helper.buildPath(sResourceMetaPath, sRequestedPropertyPath)],
			this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath, {});
		if (!mQueryOptions) {
			return undefined;
		}
		mQueryOptions = _Helper.getQueryOptionsForPath(mQueryOptions, sResourcePath);

		sFullResourceMetaPath = _Helper.buildPath(this.sMetaPath, sResourceMetaPath);
		visitQueryOptions(mQueryOptions);
		sFullResourcePath = _Helper.buildPath(this.sResourcePath, sResourcePath);
		sRequestPath = sFullResourcePath
			+ this.oRequestor.buildQueryString(sFullResourceMetaPath, mQueryOptions, false, true);
		oPromise = this.mPropertyRequestByPath[sRequestPath];
		if (!oPromise) {
			sMergeBasePath = sFullResourcePath
				+ this.oRequestor.buildQueryString(sFullResourceMetaPath, this.mQueryOptions, true);
			oPromise = this.oRequestor.request("GET", sMergeBasePath, oGroupLock.getUnlockedCopy(),
				undefined, undefined, undefined, undefined, sFullResourceMetaPath, undefined,
				false, mQueryOptions
			).then(function (oData) {
				that.visitResponse(oData, mTypeForMetaPath, sFullResourceMetaPath, sResourcePath);

				return oData;
			}).finally(function () {
				delete that.mPropertyRequestByPath[sRequestPath];
			});
			this.mPropertyRequestByPath[sRequestPath] = oPromise;
		}
		// With the V2 adapter the surrounding complex type is requested for nested properties. So
		// even when two late properties lead to the same request, each of them must be copied to
		// the cache.
		return oPromise.then(function (oData) {
			if (_Helper.getPrivateAnnotation(oResource, "predicate")
					!== _Helper.getPrivateAnnotation(oData, "predicate")) {
				throw new Error("GET " + sRequestPath + ": Key predicate changed from "
					+ _Helper.getPrivateAnnotation(oResource, "predicate")
					+ " to " + _Helper.getPrivateAnnotation(oData, "predicate"));
			}
			if (oData["@odata.etag"] !== oResource["@odata.etag"]) {
				throw new Error("GET " + sRequestPath + ": ETag changed");
			}

			_Helper.updateSelected(that.mChangeListeners, sResourcePath, oResource, oData,
				aUpdateProperties);

			// return the missing property, so that drillDown properly proceeds
			return _Helper.drillDown(oResource, sMissingPropertyPath.split("/"));
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
				var oMessageAnnotation = that.oRequestor.getModelInterface()
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
	 * Returns $select and $expand of the query options used for fetching late properties.
	 *
	 * @returns {object}
	 *   The query options for late properties or <code>undefined</code>
	 *
	 * @public
	 */
	Cache.prototype.getLateQueryOptions = function () {
		return this.mLateQueryOptions && {
			$expand : this.mLateQueryOptions.$expand,
			$select : this.mLateQueryOptions.$select
		};
	};

	/**
	 * Gets the <code>Promise</code> which resolves with a map of minimum and maximum values.
	 *
	 * @returns {Promise}
	 *   <code>undefined</code> because no minimum or maximum can be requested here
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.lib._AggregationCache#getMeasureRangePromise
	 */
	Cache.prototype.getMeasureRangePromise = function () {
		return undefined;
	};

	/*
	 * Returns the requested data if available synchronously.
	 *
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {any}
	 *   The requested data or <code>undefined</code> if the data is not yet available
	 *
	 * @public
	 */
	Cache.prototype.getValue = function (sPath) {
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
	Cache.prototype.getOriginalResourcePath = function (oEntity) {
		return this.fnGetOriginalResourcePath && this.fnGetOriginalResourcePath(oEntity)
			|| this.sResourcePath;
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
	Cache.prototype.hasChangeListeners = function () {
		return !isEmptyObject(this.mChangeListeners);
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
	 * @param {string} sPath The path (as used by change listeners)
	 * @param {object} oData The data to patch with
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the patched data
	 *
	 * @private
	 */
	Cache.prototype.patch = function (sPath, oData) {
		var that = this;

		return this.fetchValue(_GroupLock.$cached, sPath).then(function (oCacheValue) {
			_Helper.updateExisting(that.mChangeListeners, sPath, oCacheValue, oData);

			return oCacheValue;
		});
	};

	/**
	 * Refreshes a single entity within a cache.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string} sPath
	 *   The entity collection's path within this cache, may be <code>""</code>
	 * @param {number} iIndex
	 *   The array index of the entity to be refreshed
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with the new entity when it is updated in the cache.
	 *
	 * @public
	 */
	Cache.prototype.refreshSingle = function (oGroupLock, sPath, iIndex, fnDataRequested) {
		var that = this;

		return this.fetchValue(_GroupLock.$cached, sPath).then(function (aElements) {
			var sPredicate = _Helper.getPrivateAnnotation(aElements[iIndex], "predicate"),
				sReadUrl = _Helper.buildPath(that.sResourcePath, sPath, sPredicate),
				mQueryOptions
					= Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath));

			// drop collection related system query options
			delete mQueryOptions["$apply"];
			delete mQueryOptions["$count"];
			delete mQueryOptions["$filter"];
			delete mQueryOptions["$orderby"];
			delete mQueryOptions["$search"];
			sReadUrl += that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false,
				that.bSortExpandSelect);

			that.bSentReadRequest = true;
			return SyncPromise.all([
				that.oRequestor
					.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested),
				that.fetchTypes()
			]).then(function (aResult) {
				var oElement = aResult[0];

				that.replaceElement(aElements, iIndex, sPredicate, oElement, aResult[1], sPath);

				return oElement;
			});
		});
	};

	/**
	 * Refreshes a single entity within a collection cache and removes it from the cache if the
	 * filter does not match anymore.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID
	 * @param {string} sPath
	 *   The entity collection's path within this cache, may be <code>""</code>
	 * @param {number} iIndex
	 *   The array index of the entity to be refreshed
	 * @param {function} [fnDataRequested]
	 *   The function is called just before the back-end request is sent.
	 *   If no back-end request is needed, the function is not called.
	 * @param {function} [fnOnRemove]
	 *   A function which is called after the entity does not match the binding's filter anymore,
	 *   see {@link sap.ui.model.odata.v4.ODataListBinding#filter}
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with <code>undefined</code> when the entity is updated in
	 *   the cache.
	 *
	 * @private
	 */
	Cache.prototype.refreshSingleWithRemove = function (oGroupLock, sPath, iIndex, fnDataRequested,
			fnOnRemove) {
		var that = this;

		return SyncPromise.all([
			this.fetchValue(_GroupLock.$cached, sPath),
			this.fetchTypes()
		]).then(function (aResults) {
			var aElements = aResults[0],
				oEntity = aElements[iIndex],
				sPredicate = _Helper.getPrivateAnnotation(oEntity, "predicate"),
				mQueryOptions
					= Object.assign({}, _Helper.getQueryOptionsForPath(that.mQueryOptions, sPath)),
				sFilterOptions = mQueryOptions["$filter"],
				sReadUrl = _Helper.buildPath(that.sResourcePath, sPath),
				mTypeForMetaPath = aResults[1];

			delete mQueryOptions["$count"];
			delete mQueryOptions["$orderby"];
			mQueryOptions["$filter"] = (sFilterOptions ? "(" + sFilterOptions + ") and " : "")
				+ _Helper.getKeyFilter(oEntity, that.sMetaPath, mTypeForMetaPath);

			sReadUrl += that.oRequestor.buildQueryString(that.sMetaPath, mQueryOptions, false,
				that.bSortExpandSelect);

			that.bSentReadRequest = true;
			return that.oRequestor
				.request("GET", sReadUrl, oGroupLock, undefined, undefined, fnDataRequested)
				.then(function (oResult) {
					if (oResult.value.length > 1) {
						throw new Error(
							"Unexpected server response, more than one entity returned.");
					} else if (oResult.value.length === 0) {
						that.removeElement(aElements, iIndex, sPredicate, sPath);
						that.oRequestor.getModelInterface()
							.reportBoundMessages(that.sResourcePath, [], [sPath + sPredicate]);
						fnOnRemove();
					} else {
						that.replaceElement(aElements, iIndex, sPredicate, oResult.value[0],
							mTypeForMetaPath, sPath);
					}
				});
		});
	};

	/**
	 * Registers the listener for the path.
	 *
	 * @param {string} sPath The path
	 * @param {object} [oListener] The listener
	 * @throws {Error} If the cache is not active
	 *
	 * @private
	 */
	Cache.prototype.registerChange = function (sPath, oListener) {
		this.checkActive();
		_Helper.addByPath(this.mChangeListeners, sPath, oListener);
	};

	/**
	 * Removes the element at the given index from the given array, taking care of
	 * <code>$byPredicate</code>, <code>$created</code>, the array's count, and a collection cache's
	 * limit (if applicable).
	 *
	 * @param {object[]} aElements
	 *   The array of elements
	 * @param {number} iIndex
	 *   The array index of the old element to be removed
	 * @param {string} sPredicate
	 *   The key predicate of the old element to be removed
	 * @param {string} sPath
	 *   The element collection's path within this cache (as used by change listeners), may be
	 *   <code>""</code>
	 * @returns {number} The index at which the element actually was (it might have moved due to
	 *   parallel insert/delete)
	 */
	Cache.prototype.removeElement = function (aElements, iIndex, sPredicate, sPath) {
		var oElement, sTransientPredicate;

		// the element might have moved due to parallel insert/delete
		iIndex = Cache.getElementIndex(aElements, sPredicate, iIndex);
		oElement = aElements[iIndex];
		aElements.splice(iIndex, 1);
		delete aElements.$byPredicate[sPredicate];
		sTransientPredicate = _Helper.getPrivateAnnotation(oElement, "transientPredicate");
		if (sTransientPredicate) {
			aElements.$created -= 1;
			delete aElements.$byPredicate[sTransientPredicate];
		} else if (!sPath) {
			// Note: sPath is empty only in a CollectionCache, so we may use iLmit and
			// adjustReadRequests
			this.iLimit -= 1;
			this.adjustReadRequests(iIndex, -1);
		}
		addToCount(this.mChangeListeners, sPath, aElements, -1);
		return iIndex;
	};

	/**
	 * Removes one from the count of pending (that is, "currently being sent to the server")
	 * requests.
	 *
	 * @private
	 */
	Cache.prototype.removePendingRequest = function () {
		this.oPendingRequestsPromise.$count -= 1;
		if (!this.oPendingRequestsPromise.$count) {
			this.oPendingRequestsPromise.$resolve();
			this.oPendingRequestsPromise = null;
		}
	};

	/**
	 * Replaces the old element at the given index by the given new element and calls
	 * <code>visitResponse</code> for the new element. Updates also the reference in
	 * <code>$byPredicate</code> for the transient predicate of the old element.
	 *
	 * @param {object[]} aElements
	 *   The array of elements
	 * @param {number} iIndex
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
	Cache.prototype.replaceElement = function (aElements, iIndex, sPredicate, oElement,
			mTypeForMetaPath, sPath) {
		var oOldElement, sTransientPredicate;

		// the element might have moved due to parallel insert/delete
		iIndex = Cache.getElementIndex(aElements, sPredicate, iIndex);
		oOldElement = aElements[iIndex];
		// _Helper.updateExisting cannot be used because navigation properties cannot be handled
		aElements[iIndex] = aElements.$byPredicate[sPredicate] = oElement;
		sTransientPredicate = _Helper.getPrivateAnnotation(oOldElement, "transientPredicate");
		if (sTransientPredicate) {
			oElement["@$ui5.context.isTransient"] = false;
			aElements.$byPredicate[sTransientPredicate] = oElement;
			_Helper.setPrivateAnnotation(oElement, "transientPredicate", sTransientPredicate);
		}
		// Note: iStart is not needed here because we know we have key predicates
		this.visitResponse(oElement, mTypeForMetaPath,
			_Helper.getMetaPath(_Helper.buildPath(this.sMetaPath, sPath)), sPath + sPredicate);
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
				for (i = aPromises.length - 1; i >= 0; i -= 1) {
					that.oRequestor.removePatch(aPromises[i]);
				}
				delete that.mPatchRequests[sRequestPath];
			}
		});

		Object.keys(this.mPostRequests).forEach(function (sRequestPath) {
			var aEntities, i, sTransientGroup;

			if (isSubPath(sRequestPath, sPath)) {
				aEntities = that.mPostRequests[sRequestPath];
				for (i = aEntities.length - 1; i >= 0; i -= 1) {
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
	 * Sets query options after the cache has sent a read request to allow adding late properties.
	 * Merges it with the existing query options because only $select and $expand may have changed.
	 *
	 * @param {object} mQueryOptions
	 *   The new query options
	 *
	 * @public
	 */
	Cache.prototype.setLateQueryOptions = function (mQueryOptions) {
		this.mLateQueryOptions = Object.assign({}, this.mQueryOptions, {
			$expand : mQueryOptions.$expand,
			$select : mQueryOptions.$select
		});
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
	 *   rejected with an error if setting fails somehow, for example because the affected entity
	 *   is transient
	 *
	 * @public
	 */
	Cache.prototype.setProperty = function (sPropertyPath, vValue, sEntityPath) {
		var that = this;

		return this.fetchValue(_GroupLock.$cached, sEntityPath).then(function (oEntity) {
			if (_Helper.getPrivateAnnotation(oEntity, "transient")) {
				// Note: includes "No 'update' allowed while waiting for server response"
				throw new Error("Cannot update a transient entity w/o PATCH");
			}
			_Helper.updateSelected(that.mChangeListeners, sEntityPath, oEntity,
				Cache.makeUpdateData(sPropertyPath.split("/"), vValue));
		});
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
	 * @param {function} [fnErrorCallback]
	 *   A function which is called with an Error object each time a PATCH request fails; if it is
	 *   missing, the PATCH is not retried, but this method's returned promise is rejected
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sEntityPath]
	 *   Path of the entity, relative to the cache (as used by change listeners)
	 * @param {string} [sUnitOrCurrencyPath]
	 *   Path of the unit or currency for the property, relative to the entity
	 * @param {boolean} [bPatchWithoutSideEffects=false]
	 *   Whether the PATCH response is ignored, except for a new ETag
	 * @param {function} [fnPatchSent]
	 *   The function is called just before a back-end request is sent for the first time.
	 *   If no back-end request is needed, the function is not called.
	 * @returns {Promise}
	 *   A promise for the PATCH request (resolves with <code>undefined</code>); rejected in case of
	 *   cancellation or if no <code>fnErrorCallback</code> is given
	 *
	 * @public
	 */
	Cache.prototype.update = function (oGroupLock, sPropertyPath, vValue, fnErrorCallback, sEditUrl,
			sEntityPath, sUnitOrCurrencyPath, bPatchWithoutSideEffects, fnPatchSent) {
		var oPromise,
			aPropertyPath = sPropertyPath.split("/"),
			aUnitOrCurrencyPath,
			that = this;

		try {
			oPromise = this.fetchValue(_GroupLock.$cached, sEntityPath);
		} catch (oError) {
			if (!oError.$cached) {
				throw oError;
			}
			// Note: we need a unique "entity" instance to avoid merging of PATCH requests!
			oPromise = SyncPromise.resolve({"@odata.etag" : "*"});
		}

		return oPromise.then(function (oEntity) {
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
				_Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
				// write the previous value into the cache
				_Helper.updateExisting(that.mChangeListeners, sEntityPath, oEntity,
					Cache.makeUpdateData(aPropertyPath, vOldValue));
			}

			function patch(oPatchGroupLock, bAtFront) {
				var oRequestLock;

				/*
				 * Synchronous callback called when the request is put on the wire. Locks the group
				 * so that further requests created via {@link ODataModel#submitBatch} wait until
				 * this request has returned and its response is applied to the cache.
				 */
				function onSubmit() {
					oRequestLock = that.oRequestor.lockGroup(sGroupId, that, true);
					if (fnPatchSent) {
						fnPatchSent();
					}
				}

				oPatchPromise = that.oRequestor.request("PATCH", sEditUrl, oPatchGroupLock,
					{"If-Match" : oEntity}, oUpdateData, onSubmit, onCancel, /*sMetaPath*/undefined,
					_Helper.buildPath(that.getOriginalResourcePath(oEntity), sEntityPath),
					bAtFront);
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

					_Helper.removeByPath(that.mPatchRequests, sFullPath, oPatchPromise);
					if (!fnErrorCallback || oError.canceled) {
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
			_Helper.updateAll(that.mChangeListeners, sEntityPath, oEntity, oUpdateData);
			if (sUnitOrCurrencyPath) {
				aUnitOrCurrencyPath = sUnitOrCurrencyPath.split("/");
				sUnitOrCurrencyPath = _Helper.buildPath(sEntityPath, sUnitOrCurrencyPath);
				sUnitOrCurrencyValue = that.getValue(sUnitOrCurrencyPath);
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
	 * {@link sap.ui.model.odata.v4.lib._Requestor#reportBoundMessages}.
	 *
	 * @param {*} oRoot An OData response, arrays or simple values are wrapped into an object as
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
	Cache.prototype.visitResponse = function (oRoot, mTypeForMetaPath, sRootMetaPath, sRootPath,
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
		 * @param {*[]} aInstances The collection
		 * @param {string} sMetaPath The meta path of the collection in mTypeForMetaPath
		 * @param {string} sCollectionPath The path of the collection
		 * @param {string} sContextUrl The context URL for message longtexts
		 */
		function visitArray(aInstances, sMetaPath, sCollectionPath, sContextUrl) {
			var mByPredicate = {}, i, iIndex, vInstance, sPredicate;

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

				if (sProperty.endsWith("@odata.mediaReadLink")) {
					oInstance[sProperty] = _Helper.makeAbsolute(vPropertyValue, sContextUrl);
				}
				if (sProperty.includes("@")) { // ignore other annotations
					return;
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
			this.oRequestor.getModelInterface().reportBoundMessages(
				this.getOriginalResourcePath(oRoot), mPathToODataMessages, aCachePaths);
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
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 */
	function CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath) {
		Cache.call(this, oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect, function () {
				return sDeepResourcePath;
			});

		this.sContext = undefined; // the "@odata.context" from the responses
		this.aElements = []; // the available elements
		this.aElements.$byPredicate = {};
		this.aElements.$count = undefined; // see setCount
		this.aElements.$created = 0; // number of (client-side) created elements
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
	CollectionCache.prototype = Object.create(Cache.prototype);

	/**
	 * Adjusts the indices for read requests.
	 *
	 * @param {number} iIndex The index at which an element has been added or removed
	 * @param {number} iOffset The offset to add to the indices
	 *
	 * @private
	 */
	CollectionCache.prototype.adjustReadRequests = function (iIndex, iOffset) {
		this.aReadRequests.forEach(function (oReadRequest) {
			if (oReadRequest.iStart >= iIndex) {
				oReadRequest.iStart += iOffset;
				oReadRequest.iEnd += iOffset;
			} // Note: no changes can happen inside *gaps*
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
			// register afterwards to avoid that updateExisting fires updates before the first
			// response
			that.registerChange(sPath, oListener);
			return that.drillDown(that.aElements, sPath, oGroupLock);
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
		for (i = iStart; i < iEnd; i += 1) {
			this.aElements[i] = oPromise;
		}
		this.oSyncPromiseAll = undefined;  // from now on, fetchValue has to wait again
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
	CollectionCache.prototype.getQueryString = function () {
		var mQueryOptions = Object.assign({}, this.mQueryOptions),
			oElement,
			sExclusiveFilter,
			sFilterOptions = mQueryOptions["$filter"],
			i,
			sKeyFilter,
			aKeyFilters = [],
			sQueryString = this.sQueryString,
			mTypeForMetaPath;

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

		if (aKeyFilters.length) {
			sExclusiveFilter = "not (" + aKeyFilters.join(" or ") + ")";
			if (sFilterOptions) {
				mQueryOptions["$filter"] = "(" + sFilterOptions + ") and " + sExclusiveFilter;
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
	 * Calculates the index range to be read for the given start, length and prefetch length.
	 * Checks if <code>aElements</code> entries are available for half the prefetch length left and
	 * right to it. If not, the full prefetch length is added to this side.
	 *
	 * @param {number} iStart
	 *   The start index for the data request
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
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @returns {string} The resource path including the query string
	 * @throws {Error}
	 *   If there are created elements inside the given range
	 *
	 * @private
	 */
	CollectionCache.prototype.getResourcePath = function (iStart, iEnd) {
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
	CollectionCache.prototype.getValue = function (sPath) {
		var oSyncPromise = this.drillDown(this.aElements, sPath, _GroupLock.$cached);

		if (oSyncPromise.isFulfilled()) {
			return oSyncPromise.getResult();
		}
	};

	/**
	 * Handles a GET response by updating the cache data and the $count-values recursively.
	 *
	 * @param {number} iStart
	 *   The start index of the range
	 * @param {number} iEnd
	 *   The index after the last element
	 * @param {object} oResult The result of the GET request
	 * @param {object} mTypeForMetaPath A map from meta path to the entity type (as delivered by
	 *   {@link #fetchTypes})
	 *
	 * @private
	 */
	CollectionCache.prototype.handleResponse = function (iStart, iEnd, oResult, mTypeForMetaPath) {
		var iCount = -1,
			sCount,
			iCreated = this.aElements.$created,
			oElement,
			i,
			iOld$count = this.aElements.$count,
			sPredicate,
			iResultLength = oResult.value.length;

		this.sContext = oResult["@odata.context"];
		this.visitResponse(oResult, mTypeForMetaPath, undefined, undefined, undefined, iStart);
		for (i = 0; i < iResultLength; i += 1) {
			oElement = oResult.value[i];
			this.aElements[iStart + i] = oElement;
			sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
			if (sPredicate) {
				this.aElements.$byPredicate[sPredicate] = oElement;
			}
		}
		sCount = oResult["@odata.count"];
		if (sCount) {
			this.iLimit = iCount = parseInt(sCount);
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
			if (iCount === -1) {
				// use formerly computed $count
				iCount = iOld$count && iOld$count - iCreated;
			}
			iCount = Math.min(
				iCount !== undefined ? iCount : Infinity,
				iStart - iCreated + iResultLength);
			this.aElements.length = iCreated + iCount;
			this.iLimit = iCount;
			// If the server did not send a count, the calculated count is greater than 0
			// and the element before has not been read yet, we do not know the count:
			// The element might or might not exist.
			if (!sCount && iCount > 0 && !this.aElements[iCount - 1]) {
				iCount = undefined;
			}
		}
		if (iCount !== -1) {
			setCount(this.mChangeListeners, "", this.aElements,
				iCount !== undefined ? iCount + iCreated : undefined);
		}
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
			oPromise = this.oPendingRequestsPromise || this.aElements.$tail,
			oRange,
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

		oRange = this.getReadRange(iIndex, iLength, this.bServerDrivenPaging ? 0 : iPrefetchLength);
		iEnd = Math.min(oRange.start + oRange.length, this.aElements.$created + this.iLimit);
		n = Math.min(iEnd, Math.max(oRange.start, this.aElements.length) + 1);

		for (i = oRange.start; i < n; i += 1) {
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

		aElementsRange = this.aElements.slice(iIndex, iEnd);
		if (this.aElements.$tail) { // Note: if available, it must be ours!
			aElementsRange.push(this.aElements.$tail);
		}
		return SyncPromise.all(aElementsRange).then(function () {
			var oResult;

			that.checkActive();
			oResult = {
				"@odata.context" : that.sContext,
				value : that.aElements.slice(iIndex, iEnd)
			};
			oResult.value.$count = that.aElements.$count;

			return oResult;
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
	 * @param {function} [fnDataRequested]
	 *   The function is called when the back-end requests have been sent.
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @private
	 */
	CollectionCache.prototype.requestElements = function (iStart, iEnd, oGroupLock,
			fnDataRequested) {
		var oPromise,
			oReadRequest = {
				iEnd : iEnd,
				iStart : iStart
			},
			that = this;

		this.aReadRequests.push(oReadRequest);
		oPromise = SyncPromise.all([
			this.oRequestor.request("GET", this.getResourcePath(iStart, iEnd), oGroupLock,
				undefined, undefined, fnDataRequested),
			this.fetchTypes()
		]).then(function (aResult) {
			if (that.aElements.$tail === oPromise) {
				that.aElements.$tail = undefined;
			}
			that.handleResponse(oReadRequest.iStart, oReadRequest.iEnd, aResult[0], aResult[1]);
		}).catch(function (oError) {
			that.fill(undefined, oReadRequest.iStart, oReadRequest.iEnd);
			throw oError;
		}).finally(function () {
			that.aReadRequests.splice(that.aReadRequests.indexOf(oReadRequest), 1);
		});

		this.bSentReadRequest = true;
		// Note: oPromise MUST be a SyncPromise for performance reasons, see SyncPromise#all
		this.fill(oPromise, iStart, iEnd);
	};

	/**
	 * Returns a promise to be resolved when the side effects have been applied to the given element
	 * range and all created elements. All other elements are discarded!
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
	 * @param {number} iStart
	 *   The array index of the first element to request side effects for
	 * @param {number} [iLength]
	 *   The number of elements to request side effects for; <code>Infinity</code> is supported.
	 *   If <code>undefined</code>, only the side effects for the element at <code>iStart</code> are
	 *   requested; the other elements are not discarded in this case.
	 * @returns {Promise|sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result, or rejecting with an error if loading of side
	 *   effects fails, or <code>null</code> if a key property is missing.
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @public
	 */
	CollectionCache.prototype.requestSideEffects = function (oGroupLock, aPaths,
			mNavigationPropertyPaths, iStart, iLength) {
		var oElement,
			aFilters = [],
			mQueryOptions,
			sResourcePath,
			mTypeForMetaPath = this.fetchTypes().getResult(),
			that = this,
			i;

		/**
		 * Adds the filter for the given element to the array of filters.
		 *
		 * @param {object} oFilterElement The element for which a filter is computed
		 * @returns {string} The filter for the given element; <code>undefined</code> if a key
		 *   property for the element is missing.
		 */
		function addFilter(oFilterElement) {
			var sFilter = _Helper.getKeyFilter(oFilterElement, that.sMetaPath, mTypeForMetaPath);

			aFilters.push(sFilter);
			return sFilter;
		}

		if (this.oPendingRequestsPromise) {
			return this.oPendingRequestsPromise.then(function () {
				return that.requestSideEffects(oGroupLock, aPaths, mNavigationPropertyPaths,
					iStart, iLength);
			});
		}

		mQueryOptions = _Helper.intersectQueryOptions(
			this.mLateQueryOptions || this.mQueryOptions, aPaths,
			this.oRequestor.getModelInterface().fetchMetadata, this.sMetaPath,
			mNavigationPropertyPaths, "", true);
		if (!mQueryOptions) {
			return SyncPromise.resolve(); // micro optimization: use *sync.* promise which is cached
		}

		if (iLength === undefined) {
			if (!addFilter(this.aElements[iStart])) {
				return null; // missing key property
			}
		} else {
			// collect key filters and discard elements outside of range
			for (i = 0; i < this.aElements.length; i += 1) {
				oElement = this.aElements[i];
				if (!oElement || _Helper.hasPrivateAnnotation(oElement, "transient")) {
					continue;
				}
				if ((i < iStart || i >= iStart + iLength)
					&& !_Helper.hasPrivateAnnotation(oElement, "transientPredicate"))  {
					delete this.aElements.$byPredicate[
						_Helper.getPrivateAnnotation(oElement, "predicate")];
					delete this.aElements[i];
					continue;
				}
				if (!addFilter(oElement)) {
					return null; // missing key property
				}
			}
			this.aElements.length = iLength
				? Math.min(iStart + iLength, this.aElements.length) // do not increase length
				: this.aElements.$created;
			if (!aFilters.length) {
				return SyncPromise.resolve(); // micro optimization: use cached *sync.* promise
			}
		}

		mQueryOptions.$filter = aFilters.join(" or ");
		_Helper.selectKeyProperties(mQueryOptions, mTypeForMetaPath[this.sMetaPath]);
		delete mQueryOptions.$count;
		delete mQueryOptions.$orderby;
		delete mQueryOptions.$search;
		sResourcePath = this.sResourcePath
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);

		return this.oRequestor.request("GET", sResourcePath, oGroupLock).then(function (oResult) {
				var oElement, sPredicate, i, n;

				if (oResult.value.length !== aFilters.length) {
					throw new Error("Expected " + aFilters.length + " row(s), but instead saw "
						+ oResult.value.length);
				}
				// Note: iStart makes no sense here (use NaN instead), but is not needed because
				// we know we have key predicates
				that.visitResponse(oResult, mTypeForMetaPath, undefined, "", false, NaN);
				for (i = 0, n = oResult.value.length; i < n; i += 1) {
					oElement = oResult.value[i];
					sPredicate = _Helper.getPrivateAnnotation(oElement, "predicate");
					_Helper.updateAll(that.mChangeListeners, sPredicate,
						that.aElements.$byPredicate[sPredicate], oElement);
				}
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
	 *   A lock for the ID of the group that is associated with the request;
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
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @public
	 */
	PropertyCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener) {
		var that = this;

		if (this.oPromise) {
			oGroupLock.unlock();
		} else {
			this.oPromise = SyncPromise.resolve(this.oRequestor.request("GET",
				this.sResourcePath + this.sQueryString, oGroupLock, undefined, undefined,
				fnDataRequested, undefined, this.sMetaPath));
			this.bSentReadRequest = true;
		}
		return this.oPromise.then(function (oResult) {
			that.registerChange("", oListener);
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
	 * @param {function} [fnGetOriginalResourcePath]
	 *   A function that returns the cache's original resource path to be used to build the target
	 *   path for bound messages; if it is not given or returns nothing, <code>sResourcePath</code>
	 *   is used instead
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
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath, bPost, sMetaPath, bFetchOperationReturnType) {
		Cache.apply(this, arguments);

		this.bFetchOperationReturnType = bFetchOperationReturnType;
		this.sMetaPath = sMetaPath || this.sMetaPath; // overrides Cache c'tor
		this.bPost = bPost;
		this.bPosting = false;
		this.oPromise = null; // a SyncPromise for the current value
	}

	// make SingleCache a Cache
	SingleCache.prototype = Object.create(Cache.prototype);

	/**
	 * Returns a promise to be resolved with an OData object for the requested data. Calculates
	 * the key predicates for all entities in the result before the promise is resolved.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the ID of the group that is associated with the request;
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
	 * @param {string} [bFetchIfMissing]
	 *   If true, the property may be fetched if missing in the cache
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the element.
	 *
	 *   The promise is rejected if the cache is inactive (see {@link #setActive}) when the response
	 *   arrives.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet, or if group ID is
	 *   '$cached' (the error has a property <code>$cached = true</code> then)
	 *
	 * @public
	 */
	SingleCache.prototype.fetchValue = function (oGroupLock, sPath, fnDataRequested, oListener) {
		var sResourcePath = this.sResourcePath + this.sQueryString,
			that = this;

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
				that.visitResponse(aResult[0], aResult[1],
					that.bFetchOperationReturnType ? that.sMetaPath + "/$Type" : undefined);
				return aResult[0];
			});
			this.bSentReadRequest = true;
		}
		return this.oPromise.then(function (oResult) {
			if (oResult["$ui5.deleted"]) {
				throw new Error("Cannot read a deleted entity");
			}
			that.registerChange(sPath, oListener);
			return that.drillDown(oResult, sPath, oGroupLock);
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.lib._Cache#getValue
	 */
	SingleCache.prototype.getValue = function (sPath) {
		var oSyncPromise;

		if (this.oPromise && this.oPromise.isFulfilled()) {
			oSyncPromise = this.drillDown(this.oPromise.getResult(), sPath, _GroupLock.$cached);
			if (oSyncPromise.isFulfilled()) {
				return oSyncPromise.getResult();
			}
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
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST or another POST is still being processed.
	 *
	 * @public
	 */
	SingleCache.prototype.post = function (oGroupLock, oData, oEntity) {
		var sGroupId,
			sHttpMethod = "POST",
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
		this.oPromise = SyncPromise.all([
			this.oRequestor.request(sHttpMethod, this.sResourcePath + this.sQueryString, oGroupLock,
				{"If-Match" : oEntity}, oData),
			this.fetchTypes()
		]).then(function (aResult) {
			that.bPosting = false;
			that.visitResponse(aResult[0], aResult[1],
				that.bFetchOperationReturnType ? that.sMetaPath + "/$Type" : undefined);

			return aResult[0];
		}, function (oError) {
			that.bPosting = false;
			throw oError;
		});
		this.bPosting = true;

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
	 * @throws {Error} If the side effects require a $expand, or if group ID is '$cached' (the error
	 *   has a property <code>$cached = true</code> then)
	 *
	 * @public
	 */
	SingleCache.prototype.requestSideEffects = function (oGroupLock, aPaths,
			mNavigationPropertyPaths, sResourcePath) {
		var oOldValuePromise = this.oPromise,
			mQueryOptions = oOldValuePromise && _Helper.intersectQueryOptions(
				this.mLateQueryOptions || this.mQueryOptions, aPaths,
				this.oRequestor.getModelInterface().fetchMetadata,
				this.sMetaPath + "/$Type", // add $Type because of return value context
				mNavigationPropertyPaths),
			oResult,
			that = this;

		if (!mQueryOptions) {
			return SyncPromise.resolve();
		}

		sResourcePath = (sResourcePath || this.sResourcePath)
			+ this.oRequestor.buildQueryString(this.sMetaPath, mQueryOptions, false, true);
		oResult = SyncPromise.all([
			this.oRequestor.request("GET", sResourcePath, oGroupLock),
			this.fetchTypes(),
			this.fetchValue(_GroupLock.$cached, "") // Note: includes some additional checks
		]).then(function (aResult) {
			var oNewValue = aResult[0],
				oOldValue = aResult[2];

			// visit response to report the messages
			that.visitResponse(oNewValue, aResult[1]);
			_Helper.updateAll(that.mChangeListeners, "", oOldValue, oNewValue);

			return oOldValue;
		});
		this.oPromise = oResult.catch(function () {
			// if side effects cannot be requested, keep the old value!
			return oOldValuePromise;
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
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the cache's query string
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	Cache.create = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			sDeepResourcePath) {
		return new CollectionCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
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
	 * @param {boolean} [bFetchOperationReturnType]
	 *   Whether the entity type of the operation return value must be fetched in
	 *   {@link #fetchTypes}
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache
	 *
	 * @public
	 */
	Cache.createSingle = function (oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath, bPost, sMetaPath, bFetchOperationReturnType) {
		return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bSortExpandSelect,
			fnGetOriginalResourcePath, bPost, sMetaPath, bFetchOperationReturnType);
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
	Cache.from$skip = function (sSegment, aCollection) {
		return rNumber.test(sSegment)
			? aCollection.$created + Number(sSegment)
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
	Cache.getElementIndex = function (aElements, sKeyPredicate, iIndex) {
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