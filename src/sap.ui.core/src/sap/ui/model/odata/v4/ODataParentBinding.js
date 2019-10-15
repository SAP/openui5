/*!
 * ${copyright}
 */

//Provides mixin sap.ui.model.odata.v4.ODataParentBinding for classes extending sap.ui.model.Binding
//with dependent bindings
sap.ui.define([
	"./ODataBinding",
	"./SubmitMode",
	"./lib/_Helper",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason",
	"sap/ui/thirdparty/jquery"
], function (asODataBinding, SubmitMode, _Helper, Log, SyncPromise, ChangeReason, jQuery) {
	"use strict";

	/**
	 * A mixin for all OData V4 bindings with dependent bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataParentBinding
	 * @extends sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataParentBinding() {
		// initialize members introduced by ODataBinding
		asODataBinding.call(this);

		// the aggregated query options
		this.mAggregatedQueryOptions = {};
		// whether the aggregated query options are processed the first time
		this.bAggregatedQueryOptionsInitial = true;
		// auto-$expand/$select: promises to wait until child bindings have provided
		// their path and query options
		this.aChildCanUseCachePromises = [];
		// counts the sent but not yet completed PATCHes
		this.iPatchCounter = 0;
		// whether all sent PATCHes have been successfully processed
		this.bPatchSuccess = true;
		this.oReadGroupLock = undefined; // see #createReadGroupLock
		this.oRefreshPromise = null; // see #createRefreshPromise and #resolveRefreshPromise
		this.oResumePromise = undefined; // see #getResumePromise
	}

	asODataBinding(ODataParentBinding.prototype);

	var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";

	/**
	 * Attach event handler <code>fnFunction</code> to the 'patchCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.attachPatchCompleted = function (fnFunction, oListener) {
		this.attachEvent("patchCompleted", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'patchCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.detachPatchCompleted = function (fnFunction, oListener) {
		this.detachEvent("patchCompleted", fnFunction, oListener);
	};

	/**
	 * Handles exceptional cases of setting the property with the given path to the given value.
	 *
	 * @param {string} sPath
	 *   A relative path within the JSON structure
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the PATCH request; without a lock, no PATCH is sent
	 * @returns {sap.ui.base.SyncPromise} <code>undefined</code> for the general case which is
	 *   handled generically by the caller {@link sap.ui.model.odata.v4.ODataContext#doSetProperty}
	 *   or a <code>SyncPromise</code> for the exceptional case
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	 * @private
	 */

	/**
	 * Fire event 'patchCompleted' to attached listeners, if the last PATCH request is completed.
	 *
	 * @param {boolean} bSuccess Whether the current PATCH request has been processed successfully
	 * @private
	 */
	ODataParentBinding.prototype.firePatchCompleted = function (bSuccess) {
		if (this.iPatchCounter === 0) {
			throw new Error("Completed more PATCH requests than sent");
		}
		this.iPatchCounter -= 1;
		this.bPatchSuccess = this.bPatchSuccess && bSuccess;
		if (this.iPatchCounter === 0) {
			this.fireEvent("patchCompleted", {success : this.bPatchSuccess});
			this.bPatchSuccess = true;
		}
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'patchSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.attachPatchSent = function (fnFunction, oListener) {
		this.attachEvent("patchSent", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'patchSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.detachPatchSent = function (fnFunction, oListener) {
		this.detachEvent("patchSent", fnFunction, oListener);
	};

	/**
	 * Fire event 'patchSent' to attached listeners, if the first PATCH request is sent.
	 *
	 * @private
	 */
	ODataParentBinding.prototype.firePatchSent = function () {
		this.iPatchCounter += 1;
		if (this.iPatchCounter === 1) {
			this.fireEvent("patchSent");
		}
	};

	/**
	 * Find the context in the uppermost binding in the hierarchy that can be reached with an empty
	 * path.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context of the caller
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The context that can be reached through empty paths
	 *
	 * @private
	 */
	ODataParentBinding.prototype._findEmptyPathParentContext = function (oContext) {
		if (this.sPath === "" && this.oContext.getBinding) {
			return this.oContext.getBinding()._findEmptyPathParentContext(this.oContext);
		}
		return oContext;
	};

	/**
	 * Decides whether the given query options can be fulfilled by this binding and merges them into
	 * this binding's aggregated query options if necessary.
	 *
	 * The query options cannot be fulfilled if there are conflicts. A conflict is an option other
	 * than $expand, $select and $count which has different values in the aggregate and the options
	 * to be merged. This is checked recursively.
	 *
	 * Merging is not necessary if the binding's cache has already requested its data and the query
	 * options would extend $select. In this case the binding's cache will request the resp.
	 * property and add it when it is accessed.
	 *
	 * Note: * is an item in $select and $expand just as others, that is it must be part of the
	 * array of items and one must not ignore the other items if * is provided. See
	 * "5.1.2 System Query Option $expand" and "5.1.3 System Query Option $select" in specification
	 * "OData Version 4.0 Part 2: URL Conventions".
	 *
	 * @param {object} mQueryOptions The query options to be merged
	 * @param {boolean} bCacheImmutable Whether the cache of this binding is immutable
	 * @returns {boolean} Whether the query options can be fulfilled by this binding
	 *
	 * @private
	 */
	ODataParentBinding.prototype.aggregateQueryOptions = function (mQueryOptions, bCacheImmutable) {
		var mAggregatedQueryOptionsClone = _Helper.merge({}, this.mAggregatedQueryOptions,
				this.oCache && this.oCache.getLateQueryOptions()),
			bChanged = false;

		/*
		 * Recursively merges the given query options into the given aggregated query options.
		 *
		 * @param {object} mAggregatedQueryOptions The aggregated query options
		 * @param {object} mQueryOptions The query options to merge into the aggregated query
		 *   options
		 * @param {boolean} bInsideExpand Whether the given query options are inside a $expand
		 * @returns {boolean} Whether the query options can be fulfilled by this binding
		 */
		function merge(mAggregatedQueryOptions, mQueryOptions, bInsideExpand) {
			var mExpandValue,
				aSelectValue;

			/*
			 * Recursively merges the expand path into the aggregated query options.
			 *
			 * @param {string} sExpandPath The expand path
			 * @returns {boolean} Whether the query options can be fulfilled by this binding
			 */
			function mergeExpandPath(sExpandPath) {
				if (mAggregatedQueryOptions.$expand[sExpandPath]) {
					return merge(mAggregatedQueryOptions.$expand[sExpandPath],
						mQueryOptions.$expand[sExpandPath], true);
				}
				if (bCacheImmutable) {
					return false;
				}
				mAggregatedQueryOptions.$expand[sExpandPath]
					= _Helper.merge({}, mExpandValue[sExpandPath]);
				return true;
			}

			/*
			 * Merges the select path into the aggregated query options.
			 *
			 * @param {string} sSelectPath The select path
			 * @returns {boolean} Whether the query options can be fulfilled by this binding
			 */
			function mergeSelectPath(sSelectPath) {
				if (mAggregatedQueryOptions.$select.indexOf(sSelectPath) < 0) {
					if (bCacheImmutable && bInsideExpand) {
						return false;
					}
					bChanged = true;
					mAggregatedQueryOptions.$select.push(sSelectPath);
				}
				return true;
			}

			mExpandValue = mQueryOptions.$expand;
			if (mExpandValue) {
				mAggregatedQueryOptions.$expand = mAggregatedQueryOptions.$expand || {};
				if (!Object.keys(mExpandValue).every(mergeExpandPath)) {
					return false;
				}
			}
			aSelectValue = mQueryOptions.$select;
			if (aSelectValue) {
				mAggregatedQueryOptions.$select = mAggregatedQueryOptions.$select || [];
				if (!aSelectValue.every(mergeSelectPath)) {
					return false;
				}
			}
			if (mQueryOptions.$count) {
				mAggregatedQueryOptions.$count = true;
			}
			return Object.keys(mQueryOptions).concat(Object.keys(mAggregatedQueryOptions))
				.every(function (sName) {
					if (sName === "$count" || sName === "$expand" || sName === "$select"
						|| !bInsideExpand && !(sName in mQueryOptions)) {
						return true;
					}
					return mQueryOptions[sName] === mAggregatedQueryOptions[sName];
				});
		}

		if (merge(mAggregatedQueryOptionsClone, mQueryOptions)) {
			if (!bCacheImmutable) {
				this.mAggregatedQueryOptions = mAggregatedQueryOptionsClone;
			} else if (bChanged) {
				if (this.oCache === null) {
					return false;
				}
				this.oCache.setLateQueryOptions(mAggregatedQueryOptionsClone);
			}
			return true;
		}
		return false;
	};

	/**
	 * Changes this binding's parameters and refreshes the binding.
	 *
	 * If there are pending changes an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #changeParameters}.
	 *
	 * The parameters are changed according to the given map of parameters: Parameters with an
	 * <code>undefined</code> value are removed, the other parameters are set, and missing
	 * parameters remain unchanged.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, see {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext}
	 * @throws {Error}
	 *   If there are pending changes or if <code>mParameters</code> is missing, contains
	 *   binding-specific or unsupported parameters, contains unsupported values, or contains the
	 *   property "$expand" or "$select" when the model is in auto-$expand/$select mode.
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataParentBinding.prototype.changeParameters = function (mParameters) {
		var mBindingParameters = jQuery.extend(true, {}, this.mParameters),
			sChangeReason, // @see sap.ui.model.ChangeReason
			sKey,
			that = this;

		function checkExpandSelect(sName) {
			if (that.oModel.bAutoExpandSelect && sName in mParameters) {
				throw new Error("Cannot change $expand or $select parameter in "
					+ "auto-$expand/$select mode: "
					+ sName + "=" + JSON.stringify(mParameters[sName]));
			}
		}

		/*
		 * Updates <code>sChangeReason</code> depending on the given custom or system query option
		 * name:
		 * - "$filter" and "$search" cause <code>ChangeReason.Filter</code>,
		 * - "$orderby" causes <code>ChangeReason.Sort</code>,
		 * - default is <code>ChangeReason.Change</code>.
		 *
		 * The "strongest" change reason wins: Filter > Sort > Change.
		 *
		 * @param {string} sName
		 *   The name of a custom or system query option
		 */
		function updateChangeReason(sName) {
			if (sName === "$filter" || sName === "$search") {
				sChangeReason = ChangeReason.Filter;
			} else if (sName === "$orderby" && sChangeReason !== ChangeReason.Filter) {
				sChangeReason = ChangeReason.Sort;
			} else if (!sChangeReason) {
				sChangeReason = ChangeReason.Change;
			}
		}

		if (!mParameters) {
			throw new Error("Missing map of binding parameters");
		}
		checkExpandSelect("$expand");
		checkExpandSelect("$select");
		if (this.hasPendingChanges()) {
			throw new Error("Cannot change parameters due to pending changes");
		}

		for (sKey in mParameters) {
			if (sKey.indexOf("$$") === 0) {
				throw new Error("Unsupported parameter: " + sKey);
			}
			if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
				updateChangeReason(sKey);
				delete mBindingParameters[sKey];
			} else if (mBindingParameters[sKey] !== mParameters[sKey]) {
				updateChangeReason(sKey);
				if (typeof mParameters[sKey] === "object") {
					mBindingParameters[sKey] = jQuery.extend(true, {}, mParameters[sKey]);
				} else {
					mBindingParameters[sKey] = mParameters[sKey];
				}
			}
		}

		if (sChangeReason) {
			this.createReadGroupLock(this.getGroupId(), true);
			this.applyParameters(mBindingParameters, sChangeReason);
		}
	};

	/*
	 * Checks dependent bindings for updates or refreshes the binding if the resource path of its
	 * parent context changed.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the check is finished, or rejecting in
	 *   case of an error (e.g. thrown by the change event handler of a control)
	 * @throws {Error} If called with parameters
	 *
	 * @private
	 */
	// @override
	ODataParentBinding.prototype.checkUpdateInternal = function (bForceUpdate) {
		var that = this;

		function updateDependents() {
			return SyncPromise.all(that.getDependentBindings().map(function (oDependentBinding) {
				return oDependentBinding.checkUpdateInternal();
			}));
		}

		if (bForceUpdate !== undefined) {
			throw new Error("Unsupported operation: " + sClassName + "#checkUpdateInternal must not"
				+ " be called with parameters");
		}

		return this.oCachePromise.then(function (oCache) {
			if (oCache && that.bRelative) {
				return that.fetchResourcePath(that.oContext).then(function (sResourcePath) {
					if (oCache.$resourcePath === sResourcePath) {
						return updateDependents();
					}
					return that.refreshInternal(""); // entity of context changed
				});
			}
			return updateDependents();
		});
	};

	/**
	 * Creates the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting <code>sPathInCache</code>.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oUpdateGroupLock
	 *   The group ID to be used for the POST request
	 * @param {string|sap.ui.base.SyncPromise} vCreatePath
	 *   The path for the POST request or a SyncPromise that resolves with that path
	 * @param {string} sPathInCache
	 *   The path within the cache where to create the entity
	 * @param {string} sTransientPredicate
	 *   A (temporary) key predicate for the transient entity: "($uid=...)"
	 * @param {object} oInitialData
	 *   The initial data for the created entity
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
	 * @private
	 */
	ODataParentBinding.prototype.createInCache = function (oUpdateGroupLock, vCreatePath,
			sPathInCache, sTransientPredicate, oInitialData, fnCancelCallback, fnErrorCallback,
			fnSubmitCallback) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			if (oCache) {
				return oCache.create(oUpdateGroupLock, vCreatePath, sPathInCache,
					sTransientPredicate, oInitialData, fnCancelCallback, fnErrorCallback,
					fnSubmitCallback
				).then(function (oCreatedEntity) {
					if (oCache.$resourcePath) {
						// Ensure that cache containing non-transient created entity is recreated
						// when the parent binding changes to another row and back again.
						delete that.mCacheByResourcePath[oCache.$resourcePath];
					}
					return oCreatedEntity;
				});
			}
			return that.oContext.getBinding().createInCache(oUpdateGroupLock, vCreatePath,
				_Helper.buildPath(that.oContext.iIndex, that.sPath, sPathInCache),
				sTransientPredicate, oInitialData, fnCancelCallback, fnErrorCallback,
				fnSubmitCallback);
		});
	};

	/**
	 * Creates a group lock and keeps it in this.oReadGroupLock.
	 * ODataListBinding#getContexts or ODataContextBinding#fetchValue are expected to use and remove
	 * it. To ensure that the queue does not remain locked forever the lock is unlocked and taken
	 * out again if it still resides there in the chosen prerendering.
	 *
	 * If not specified otherwise, the function removes the lock in the 2nd prerendering, because
	 * there are controls that render first before they request data from the model (for example the
	 * sap.ui.table.Table with VisibleRowCountMode=Auto).
	 *
	 * @param {string} [sGroupId]
	 *   The group ID
	 * @param {boolean} [bLocked]
	 *   Whether the group lock is locked
	 * @param {number} [iCount=0]
	 *   The number of additional prerenderings to wait before removing a stale lock again
	 *
	 * @private
	 */
	ODataParentBinding.prototype.createReadGroupLock = function (sGroupId, bLocked, iCount) {
		var oGroupLock,
			that = this;

		function addUnlockTask() {
			sap.ui.getCore().addPrerenderingTask(function () {
				iCount -= 1;
				if (iCount > 0) {
					// Use a promise to get out of the prerendering loop
					Promise.resolve().then(addUnlockTask);
				} else if (that.oReadGroupLock === oGroupLock) {
					// It is still the same, unused lock
					Log.debug("Timeout: unlocked " + oGroupLock, null, sClassName);
					that.removeReadGroupLock();
				}
			});
		}

		this.removeReadGroupLock();
		this.oReadGroupLock = oGroupLock = this.lockGroup(sGroupId, bLocked);
		if (bLocked) {
			iCount = 2 + (iCount || 0);
			addUnlockTask();
		}
	};

	/**
	 * Creates a promise for the refresh to be resolved by the binding's GET request.
	 *
	 * @returns {Promise} the created promise
	 *
	 * @see #resolveRefreshPromise
	 * @private
	 */
	ODataParentBinding.prototype.createRefreshPromise = function () {
		var oPromise, fnResolve;

		oPromise = new Promise(function (resolve) {
			fnResolve = resolve;
		});
		oPromise.$resolve = fnResolve;
		this.oRefreshPromise = oPromise;
		return oPromise;
	};

	/**
	 * Deletes the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting the path.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the DELETE request; if no group ID is specified, it
	 *   defaults to <code>getUpdateGroupId()</code>()
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @param {string} sPath
	 *   The path of the entity relative to this binding
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding.
	 * @param {function} fnCallback
	 *   A function which is called after the entity has been deleted from the server and from the
	 *   cache; the index of the entity is passed as parameter
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error}
	 *   If the group ID has {@link sap.ui.model.odata.v4.SubmitMode.Auto} or if the cache promise
	 *   for this binding is not yet fulfilled
	 *
	 * @private
	 */
	ODataParentBinding.prototype.deleteFromCache = function (oGroupLock, sEditUrl, sPath,
			oETagEntity, fnCallback) {
		var sGroupId;

		if (this.oCache === undefined) {
			throw new Error("DELETE request not allowed");
		}

		if (this.oCache) {
			sGroupId = oGroupLock.getGroupId();
			if (!this.oModel.isAutoGroup(sGroupId) && !this.oModel.isDirectGroup(sGroupId)) {
				throw new Error("Illegal update group ID: " + sGroupId);
			}
			return this.oCache._delete(oGroupLock, sEditUrl, sPath, oETagEntity, fnCallback);
		}
		return this.oContext.getBinding().deleteFromCache(oGroupLock, sEditUrl,
			_Helper.buildPath(this.oContext.iIndex, this.sPath, sPath), oETagEntity, fnCallback);
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.61
	 */
	ODataParentBinding.prototype.destroy = function () {
//		this.mAggregatedQueryOptions = undefined;
		this.aChildCanUseCachePromises = [];
		this.removeReadGroupLock();
		this.oResumePromise = undefined;

		asODataBinding.prototype.destroy.call(this);
	};

	/**
	 * Determines whether a child binding with the given context and path can use
	 * the cache of this binding or one of its ancestor bindings. If this is the case, enhances
	 * the aggregated query options of this binding with the query options computed from the child
	 * binding's path; the aggregated query options initially hold the binding's local query
	 * options with the entity type's key properties added to $select.
	 *
	 * The decision is based on the reduced path of the child binding. If the resolved binding path
	 * contains a pair of navigation properties that are marked as partners, the path is reduced by
	 * removing these two navigation properties from the path.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The child binding's context, must not be <code>null</code> or <code>undefined</code>. See
	 *   <code>sap.ui.model.odata.v4.ODataBinding#fetchQueryOptionsForOwnCache</code>.
	 * @param {string} sChildPath
	 *   The child binding's binding path relative to <code>oContext</code>
	 * @param {sap.ui.base.SyncPromise} oChildQueryOptionsPromise
	 *   Promise resolving with the child binding's (aggregated) query options
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolved with the reduced path for the child binding if the child binding can use
	 *   this binding's or an ancestor binding's cache; <code>undefined</code> otherwise.
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.ODataMetaModel#getReducedPath
	 */
	ODataParentBinding.prototype.fetchIfChildCanUseCache = function (oContext, sChildPath,
			oChildQueryOptionsPromise) {
		// getBaseForPathReduction must be called early, because the (virtual) parent context may be
		// lost again when the path is needed
		var sBaseForPathReduction = this.getBaseForPathReduction(),
			sBaseMetaPath,
			bCacheImmutable,
			oCanUseCachePromise,
			sFullMetaPath,
			bIsAdvertisement = sChildPath[0] === "#",
			oMetaModel = this.oModel.getMetaModel(),
			aPromises,
			sResolvedChildPath = this.oModel.resolve(sChildPath, oContext),
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext),
			// whether this binding is an operation or depends on one
			bDependsOnOperation = sResolvedPath.indexOf("(...)") >= 0,
			that = this;

		/*
		 * Fetches the property that is reached by the calculated meta path and (if necessary) its
		 * type.
		 * @returns {sap.ui.base.SyncPromise} A promise that is either resolved with the property
		 *   or, in case of an action advertisement with the entity. If no property can be reached
		 *   by the calculated meta path the promise is resolved with undefined.
		 */
		function fetchPropertyAndType() {
			if (bIsAdvertisement) {
				// Ensure entity type metadata is loaded even for advertisement so that sync access
				// to key properties is possible
				return oMetaModel.fetchObject(sFullMetaPath.slice(0,
					sFullMetaPath.lastIndexOf("/") + 1));
			}
			return oMetaModel.fetchObject(sFullMetaPath).then(function (oProperty) {
				if (oProperty && oProperty.$kind === "NavigationProperty") {
					// Ensure that the target type of the navigation property is available
					// synchronously. This is only necessary for navigation properties and may only
					// be done for them because it would fail for properties with a simple type like
					// "Edm.String".
					return oMetaModel.fetchObject(sFullMetaPath + "/").then(function () {
						return oProperty;
					});
				}
				return oProperty;
			});
		}

		if (bDependsOnOperation || this.getRootBinding().isSuspended()) {
			// Note: Operation bindings do not support auto-$expand/$select yet
			return SyncPromise.resolve(sResolvedChildPath);
		}

		// Note: this.oCachePromise exists for all bindings except operation bindings; it might
		// become pending again
		bCacheImmutable = this.oCachePromise.isRejected()
			|| this.oCache === null
			|| this.oCache && this.oCache.bSentReadRequest;
		sBaseMetaPath = oMetaModel.getMetaPath(oContext.getPath());
		sFullMetaPath = oMetaModel.getMetaPath(sResolvedChildPath);
		aPromises = [
			this.doFetchQueryOptions(this.oContext),
			// After access to complete meta path of property, the metadata of all prefix paths
			// is loaded so that synchronous access in wrapChildQueryOptions via getObject is
			// possible
			fetchPropertyAndType(),
			oChildQueryOptionsPromise
		];
		oCanUseCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var sChildMetaPath,
				mChildQueryOptions = aResult[2],
				mWrappedChildQueryOptions,
				mLocalQueryOptions = aResult[0],
				oProperty = aResult[1],
				sReducedPath = oMetaModel.getReducedPath(sResolvedChildPath, sBaseForPathReduction);

			if (sChildPath === "$count" || sChildPath.slice(-7) === "/$count"
					|| sChildPath[0] === "@") {
				return SyncPromise.resolve(sReducedPath);
			}

			if (_Helper.getRelativePath(sReducedPath, sResolvedPath) === undefined) {
				return that.oContext.getBinding().fetchIfChildCanUseCache(that.oContext,
					_Helper.getRelativePath(sResolvedChildPath, that.oContext.getPath()),
					oChildQueryOptionsPromise);
			}

			sChildMetaPath = _Helper.getRelativePath(_Helper.getMetaPath(sReducedPath),
				sBaseMetaPath);
			if (that.bAggregatedQueryOptionsInitial) {
				that.selectKeyProperties(mLocalQueryOptions, sBaseMetaPath);
				that.mAggregatedQueryOptions = jQuery.extend(true, {}, mLocalQueryOptions);
				that.bAggregatedQueryOptionsInitial = false;
			}
			if (bIsAdvertisement) {
				mWrappedChildQueryOptions = {"$select" : [sChildMetaPath.slice(1)]};
				return that.aggregateQueryOptions(mWrappedChildQueryOptions, bCacheImmutable)
					? sReducedPath
					: undefined;
			}
			if (sChildMetaPath === ""
				|| oProperty
				&& (oProperty.$kind === "Property" || oProperty.$kind === "NavigationProperty")) {
				mWrappedChildQueryOptions = _Helper.wrapChildQueryOptions(sBaseMetaPath,
					sChildMetaPath, mChildQueryOptions,
					that.oModel.oRequestor.getModelInterface().fetchMetadata);
				if (mWrappedChildQueryOptions) {
					return that.aggregateQueryOptions(mWrappedChildQueryOptions, bCacheImmutable)
						? sReducedPath
						: undefined;
				}
				return undefined;
			}
			if (sChildMetaPath === "value") { // symbolic name for operation result
				return that.aggregateQueryOptions(mChildQueryOptions, bCacheImmutable)
					? sReducedPath
					: undefined;
			}
			Log.error("Failed to enhance query options for auto-$expand/$select as the path '"
					+ sFullMetaPath + "' does not point to a property",
				JSON.stringify(oProperty), sClassName);
			return undefined;
		});
		this.aChildCanUseCachePromises.push(oCanUseCachePromise);
		this.oCachePromise = SyncPromise.all([this.oCachePromise, oCanUseCachePromise])
			.then(function (aResult) {
				var oCache = aResult[0];

				if (oCache && !oCache.bSentReadRequest) {
					oCache.setQueryOptions(_Helper.merge({}, that.oModel.mUriParameters,
						that.mAggregatedQueryOptions));
				}
				return oCache;
			});
		// catch the error, but keep the rejected promise
		this.oCachePromise.catch(function (oError) {
			that.oModel.reportError(that + ": Failed to enhance query options for "
				+ "auto-$expand/$select for child " + sChildPath,  sClassName, oError);
		});
		return oCanUseCachePromise;
	};

	/**
	 * Returns the absolute base path used for path reduction of child (property) bindings. This is
	 * the shortest possible path of a binding that may carry the data for the reduced path. A
	 * parent binding is not eligible if it uses a different update group with submit mode API.
	 *
	 * @returns {string}
	 *   The absolute base path for path reduction
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getBaseForPathReduction = function () {
		var oParentBinding, sParentUpdateGroupId;

		if (!this.isRoot()) {
			oParentBinding = this.oContext.getBinding();
			sParentUpdateGroupId = oParentBinding.getUpdateGroupId();
			if (sParentUpdateGroupId === this.getUpdateGroupId()
					|| this.oModel.getGroupProperty(sParentUpdateGroupId, "submit")
						!== SubmitMode.API) {
				return oParentBinding.getBaseForPathReduction();
			}
		}
		return this.oModel.resolve(this.sPath, this.oContext);
	};

	/**
	 * Returns the query options for the given path relative to this binding. Uses the options
	 * resulting from the binding parameters or the options inherited from the parent binding by
	 * using {@link sap.ui.model.odata.v4.Context#getQueryOptionsForPath}.
	 *
	 * @param {string} sPath
	 *   The relative path for which the query options are requested
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context that is used to compute the inherited query options; only relevant for the
	 *   call from ODataListBinding#doCreateCache as this.oContext might not yet be set
	 * @returns {object}
	 *   The computed query options (live reference, no clone!)
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getQueryOptionsForPath = function (sPath, oContext) {
		if (Object.keys(this.mParameters).length) {
			// binding has parameters -> all query options need to be defined at the binding
			return _Helper.getQueryOptionsForPath(this.mQueryOptions, sPath);
		}

		oContext = oContext || this.oContext;
		// oContext is always set; as getQueryOptionsForPath is called only from ODLB#doCreateCache
		// binding has no parameters -> no own query options
		if (!this.bRelative || !oContext.getQueryOptionsForPath) {
			// absolute or quasi-absolute -> no inheritance and no query options -> no options
			return {};
		}
		return oContext.getQueryOptionsForPath(_Helper.buildPath(this.sPath, sPath));
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getResumePromise
	 */
	ODataParentBinding.prototype.getResumePromise = function () {
		return this.oResumePromise;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#hasPendingChangesInDependents
	 */
	ODataParentBinding.prototype.hasPendingChangesInDependents = function () {
		var aDependents = this.getDependentBindings();

		return aDependents.some(function (oDependent) {
			var oCache = oDependent.oCache,
				bHasPendingChanges;

			if (oCache !== undefined) {
				// Pending changes for this cache are only possible when there is a cache already
				if (oCache && oCache.hasPendingChangesForPath("")) {
					return true;
				}
			} else if (oDependent.hasPendingChangesForPath("")) {
				return true;
			}
			if (oDependent.mCacheByResourcePath) {
				bHasPendingChanges = Object.keys(oDependent.mCacheByResourcePath)
					.some(function (sPath) {
						return oDependent.mCacheByResourcePath[sPath].hasPendingChangesForPath("");
					});
				if (bHasPendingChanges) {
					return true;
				}
			}
			// Ask dependents, they might have no cache, but pending changes in mCacheByResourcePath
			return oDependent.hasPendingChangesInDependents();
		})
		|| this.oModel.withUnresolvedBindings("hasPendingChangesInCaches",
				this.oModel.resolve(this.sPath, this.oContext).slice(1));
	};

	/**
	 * Tells whether implicit loading of side effects via PATCH requests is switched off for this
	 * binding.
	 *
	 * @returns {boolean}
	 *   Whether implicit loading of side effects is off
	 *
	 * @private
	 */
	ODataParentBinding.prototype.isPatchWithoutSideEffects = function () {
		return this.mParameters.$$patchWithoutSideEffects
			|| !this.isRoot() && this.oContext
				&& this.oContext.getBinding().isPatchWithoutSideEffects();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#isMeta
	 */
	ODataParentBinding.prototype.isMeta = function () {
		return false;
	};

	/**
	 * Refreshes all dependent bindings with the given parameters and waits for them to have
	 * finished.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete the dependent caches and corresponding
	 *   messages; may be "" but not <code>undefined</code>
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 * @param {boolean} [bCheckUpdate]
	 *   If <code>true</code>, a property binding is expected to check for updates
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving when all dependent bindings are refreshed; it is rejected if the
	 *   binding's root binding is suspended and a group ID different from the binding's group ID is
	 *   given
	 *
	 * @private
	 */
	ODataParentBinding.prototype.refreshDependentBindings = function (sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
			return oDependentBinding.refreshInternal(sResourcePathPrefix, sGroupId, bCheckUpdate,
				bKeepCacheOnError);
		}));
	};

	/**
	 * Unlocks a ReadGroupLock and removes it from the binding.
	 *
	 * @private
	 */
	ODataParentBinding.prototype.removeReadGroupLock = function () {
		if (this.oReadGroupLock) {
			this.oReadGroupLock.unlock(true);
			this.oReadGroupLock = undefined;
		}
	};

	/**
	 * Refreshes the binding; expects it to be suspended.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for the refresh
	 * @throws {Error}
	 *   If a group ID different from the binding's group ID is given

	 * @private
	 */
	ODataParentBinding.prototype.refreshSuspended = function (sGroupId) {
		if (sGroupId && sGroupId !== this.getGroupId()) {
			throw new Error(this + ": Cannot refresh a suspended binding with group ID '"
				+ sGroupId  + "' (own group ID is '" + this.getGroupId() + "')");
		}
		this.setResumeChangeReason(ChangeReason.Refresh);
	};

	/**
	 * Loads side effects for the given context of this binding.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for requesting side effects
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context for which to request side effects; if this parameter is missing or if it is the
	 *   header context of a list binding, the whole binding is affected
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result, or rejecting with an error if loading of side
	 *   effects fails
	 * @throws {Error}
	 *   If this binding does not use own data service requests or if the binding's root binding is
	 *   suspended and the given group ID is not the binding's group
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 * @private
	 * @see sap.ui.model.odata.v4.Context#requestSideEffects
	 */

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#resetChangesInDependents
	 */
	ODataParentBinding.prototype.resetChangesInDependents = function (aPromises) {
		this.getDependentBindings().forEach(function (oDependent) {
			aPromises.push(oDependent.oCachePromise.then(function (oCache) {
				if (oCache) {
					oCache.resetChangesForPath("");
				}
				oDependent.resetInvalidDataState();
			}).unwrap());

			// mCacheByResourcePath may have changes nevertheless
			if (oDependent.mCacheByResourcePath) {
				Object.keys(oDependent.mCacheByResourcePath).forEach(function (sPath) {
					oDependent.mCacheByResourcePath[sPath].resetChangesForPath("");
				});
			}
			// Reset dependents, they might have no cache, but pending changes in
			// mCacheByResourcePath
			oDependent.resetChangesInDependents(aPromises);
		});
	};

	/**
	 * Resolves and clears the refresh promise created by {@link #createRefreshPromise} with the
	 * given result if there is one.
	 *
	 * @param {any} vResult - The result to resolve with
	 * @returns {any} vResult for chaining
	 *
	 * @private
	 */
	ODataParentBinding.prototype.resolveRefreshPromise = function (vResult) {
		if (this.oRefreshPromise) {
			this.oRefreshPromise.$resolve(vResult);
			this.oRefreshPromise = null;
		}
		return vResult;
	};

	/**
	 * Resumes this binding. The binding can again fire change events and trigger data service
	 * requests.
	 * Before 1.53.0, this method was not supported and threw an error.
	 *
	 * @throws {Error}
	 *   If this binding is relative to a {@link sap.ui.model.odata.v4.Context} or if it is an
	 *   operation binding or if it is not suspended
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @see #suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#resume
	ODataParentBinding.prototype.resume = function () {
		var that = this;

		if (this.oOperation) {
			throw new Error("Cannot resume an operation binding: " + this);
		}
		if (this.bRelative && (!this.oContext || this.oContext.fetchValue)) {
			throw new Error("Cannot resume a relative binding: " + this);
		}
		if (!this.bSuspended) {
			throw new Error("Cannot resume a not suspended binding: " + this);
		}

		// wait one additional prerendering because resume itself only starts in a prerendering task
		this.createReadGroupLock(this.getGroupId(), true, 1);
		// dependent bindings are only removed in a *new task* in ManagedObject#updateBindings
		// => must only resume in prerendering task
		sap.ui.getCore().addPrerenderingTask(function () {
			that.bSuspended = false;
			if (that.oResumePromise) {
				that.resumeInternal(true);
				that.oResumePromise.$resolve();
				that.oResumePromise = undefined;
			}
		});
	};

	/**
	 * Adds the key properties of the entity reached by the given navigation property path to
	 * $select of the query options. Expects that the type has already been loaded so that it can
	 * be accessed synchronously.
	 *
	 * @param {object} mQueryOptions The query options
	 * @param {string} sMetaPath The path to the navigation property
	 *
	 * @private
	 */
	ODataParentBinding.prototype.selectKeyProperties = function (mQueryOptions, sMetaPath) {
		_Helper.selectKeyProperties(mQueryOptions,
			this.oModel.getMetaModel().getObject(sMetaPath + "/"));
	};

	/**
	 * Suspends this binding. A suspended binding does not fire change events nor does it trigger
	 * data service requests. Call {@link #resume} to resume the binding.
	 * Before 1.53.0, this method was not supported and threw an error.
	 *
	 * @throws {Error}
	 *   If this binding is relative to a {@link sap.ui.model.odata.v4.Context} or if it is an
	 *   operation binding or if it is already suspended or if it has pending changes
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @see sap.ui.model.odata.v4.ODataContextBinding#hasPendingChanges
	 * @see sap.ui.model.odata.v4.ODataListBinding#hasPendingChanges
	 * @see #resume
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#suspend
	ODataParentBinding.prototype.suspend = function () {
		var fnResolve;

		if (this.oOperation) {
			throw new Error("Cannot suspend an operation binding: " + this);
		}
		if (this.bRelative && (!this.oContext || this.oContext.fetchValue)) {
			throw new Error("Cannot suspend a relative binding: " + this);
		}
		if (this.bSuspended) {
			throw new Error("Cannot suspend a suspended binding: " + this);
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot suspend a binding with pending changes: " + this);
		}

		this.bSuspended = true;
		this.oResumePromise = new SyncPromise(function (resolve, reject) {
			fnResolve = resolve;
		});
		this.oResumePromise.$resolve = fnResolve;
		this.removeReadGroupLock();
	};

	/**
	 * Updates the aggregated query options of this binding with the values from the given
	 * query options except the values for "$select" and "$expand" as these are computed by
	 * auto-$expand/$select and are only changed in {@link #fetchIfChildCanUseCache}.
	 * Note: If the aggregated query options contain a key which is not contained in the given
	 * query options, it is deleted from the aggregated query options.
	 *
	 * @param {object} mNewQueryOptions
	 *   The query options to update the aggregated query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.updateAggregatedQueryOptions = function (mNewQueryOptions) {
		var aAllKeys = Object.keys(mNewQueryOptions),
			that = this;

		if (this.mAggregatedQueryOptions) {
			aAllKeys = aAllKeys.concat(Object.keys(this.mAggregatedQueryOptions));
			aAllKeys.forEach(function (sName) {
				if (sName === "$select" || sName === "$expand") {
					return;
				}
				if (mNewQueryOptions[sName] === undefined) {
					delete that.mAggregatedQueryOptions[sName];
				} else {
					that.mAggregatedQueryOptions[sName] = mNewQueryOptions[sName];
				}
			});
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#visitSideEffects
	 */
	ODataParentBinding.prototype.visitSideEffects = function (sGroupId, aPaths, oContext,
			mNavigationPropertyPaths, aPromises, sPrefix) {
		var aDependentBindings = oContext
				? this.oModel.getDependentBindings(oContext)
				: this.getDependentBindings();

		aDependentBindings.forEach(function (oDependentBinding) {
			var sPath = _Helper.buildPath(sPrefix,
					_Helper.getMetaPath(oDependentBinding.getPath())),
				aStrippedPaths;

			if (oDependentBinding.oCache) {
				// dependent binding which has its own cache => not an ODataPropertyBinding
				aStrippedPaths = _Helper.stripPathPrefix(sPath, aPaths);
				if (aStrippedPaths.length) {
					aPromises.push(
						oDependentBinding.requestSideEffects(sGroupId, aStrippedPaths));
				}
			} else if (mNavigationPropertyPaths[sPath]) {
				aPromises.push(oDependentBinding.refreshInternal("", sGroupId));
			} else {
				oDependentBinding.visitSideEffects(sGroupId, aPaths, null,
					mNavigationPropertyPaths, aPromises, sPath);
			}
		});
	};

	function asODataParentBinding(oPrototype) {
		if (this) {
			ODataParentBinding.apply(this, arguments);
		} else {
			jQuery.extend(oPrototype, ODataParentBinding.prototype);
		}
	}

	// #doDeregisterChangeListener is still not final, allow for "super" calls
	asODataParentBinding.prototype.doDeregisterChangeListener
		= ODataParentBinding.prototype.doDeregisterChangeListener;
	// #doSetProperty is not final, allow for "super" calls
	asODataParentBinding.prototype.doSetProperty = ODataParentBinding.prototype.doSetProperty;
	// #destroy is still not final, allow for "super" calls
	asODataParentBinding.prototype.destroy = ODataParentBinding.prototype.destroy;
	// #hasPendingChangesForPath is still not final, allow for "super" calls
	asODataParentBinding.prototype.hasPendingChangesForPath
		= ODataParentBinding.prototype.hasPendingChangesForPath;

	return asODataParentBinding;
}, /* bExport= */ false);