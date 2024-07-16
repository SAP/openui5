/*!
 * ${copyright}
 */

//Provides mixin sap.ui.model.odata.v4.ODataParentBinding for classes extending sap.ui.model.Binding
//with dependent bindings
sap.ui.define([
	"./Context",
	"./ODataBinding",
	"./lib/_Helper",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason"
], function (Context, asODataBinding, _Helper, Log, SyncPromise, ChangeReason) {
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
		this.mCanUseCachePromiseByChildPath = {};
		// auto-$expand/$select: promises to wait until child bindings have provided
		// their path and query options
		this.aChildCanUseCachePromises = [];
		// whether the binding has a child with a path to the parent binding via path reduction
		this.bHasPathReductionToParent = false;
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
	 * Resumes this binding. The binding can again fire change events and initiate data service
	 * requests.
	 *
	 * @param {boolean} bAsPrerenderingTask
	 *   Whether resume is done as a prerendering task
	 * @throws {Error}
	 *   If this binding is relative to an {@link sap.ui.model.odata.v4.Context} or if it is an
	 *   operation binding or if it is not suspended
	 *
	 * @private
	 * @see #suspend
	 */
	ODataParentBinding.prototype._resume = function (bAsPrerenderingTask) {
		var that = this;

		function doResume() {
			that.bSuspended = false;
			if (that.oResumePromise) {
				that.resumeInternal(true);
				that.oResumePromise.$resolve();
				that.oResumePromise = undefined;
			}
		}

		if (this.oOperation) {
			throw new Error("Cannot resume an operation binding: " + this);
		}
		if (!this.isRoot()) {
			throw new Error("Cannot resume a relative binding: " + this);
		}
		if (!this.bSuspended) {
			throw new Error("Cannot resume a not suspended binding: " + this);
		}

		if (bAsPrerenderingTask) {
			// wait one additional prerendering because resume itself starts in a prerendering task
			this.createReadGroupLock(this.getGroupId(), true, 1);
			// dependent bindings are only removed in a *new task* in ManagedObject#updateBindings
			// => must only resume in prerendering task
			this.oModel.addPrerenderingTask(doResume);
		} else {
			this.createReadGroupLock(this.getGroupId(), true);
			doResume();
		}
	};

	/**
	 * Decides whether the given query options can be fulfilled by this binding and merges them into
	 * this binding's <code>mAggregatedQueryOptions</code> if necessary.
	 *
	 * The query options cannot be fulfilled if there are conflicts. A conflict is an option other
	 * than <code>$expand</code>, <code>$select</code> and <code>$count</code> which has different
	 * values in the aggregate and the options to be merged. This is checked recursively.
	 *
	 * If the cache is already immutable the query options are aggregated into
	 * <code>mLateQueryOptions</code>. Then they also cannot be fulfilled if they contain a
	 * <code>$expand</code> using a collection-valued navigation property.
	 *
	 * Note: * is an item in <code>$select</code> and <code>$expand</code> just as others, that is
	 * it must be part of the array of items and one must not ignore the other items if * is
	 * provided. See "5.1.2 System Query Option $expand" and "5.1.3 System Query Option $select" in
	 * specification "OData Version 4.0 Part 2: URL Conventions".
	 *
	 * @param {object} mQueryOptions - The query options to be merged
	 * @param {string} sBaseMetaPath - This binding's meta path
	 * @param {boolean} bCacheImmutable - Whether the cache of this binding is immutable
	 * @param {boolean} [bIsProperty] - Whether the child is a property binding
	 * @returns {boolean} Whether the query options can be fulfilled by this binding
	 *
	 * @private
	 */
	ODataParentBinding.prototype.aggregateQueryOptions = function (mQueryOptions, sBaseMetaPath,
			bCacheImmutable, bIsProperty) {
		var mAggregatedQueryOptionsClone = _Helper.clone(
				bCacheImmutable && this.mLateQueryOptions || this.mAggregatedQueryOptions),
			that = this;

		/*
		 * Recursively merges the given query options into the given aggregated query options.
		 *
		 * @param {object} mAggregatedQueryOptions
		 *   The aggregated query options
		 * @param {object} mQueryOptions0
		 *   The query options to merge into the aggregated query options
		 * @param {string} [sMetaPath]
		 *   The meta path for the current $expand (only used if cache is immutable)
		 * @param {boolean} [bInsideExpand]
		 *   Whether the given query options are inside a $expand
		 * @param {boolean} [bAdd]
		 *   Whether to add the given query options because they are in a $expand that has not been
		 *   aggregated yet
		 * @returns {boolean}
		 *   Whether the query options can be fulfilled by this binding
		 */
		function merge(mAggregatedQueryOptions, mQueryOptions0, sMetaPath, bInsideExpand, bAdd) {
			/*
			 * Recursively merges the expand path into the aggregated query options.
			 *
			 * @param {string} sExpandPath The expand path
			 * @returns {boolean} Whether the query options can be fulfilled by this binding
			 */
			function mergeExpandPath(sExpandPath) {
				var bAddExpand = !mAggregatedQueryOptions.$expand[sExpandPath],
					sExpandMetaPath = sMetaPath + "/" + sExpandPath;

				if (bAddExpand) {
					mAggregatedQueryOptions.$expand[sExpandPath] = {};
					if (bCacheImmutable && that.oModel.getMetaModel()
							.fetchObject(sExpandMetaPath).getResult().$isCollection) {
						return false;
					}
				}
				return merge(mAggregatedQueryOptions.$expand[sExpandPath],
					mQueryOptions0.$expand[sExpandPath], sExpandMetaPath, true, bAddExpand);
			}

			/*
			 * Merges the select path into the aggregated query options.
			 *
			 * @param {string} sSelectPath The select path
			 * @returns {boolean} Whether the query options can be fulfilled by this binding
			 */
			function mergeSelectPath(sSelectPath) {
				if (!mAggregatedQueryOptions.$select.includes(sSelectPath)) {
					mAggregatedQueryOptions.$select.push(sSelectPath);
				}
				return true;
			}

			// Top-level all query options in the aggregate are OK, even if not repeated in the
			// child. In a $expand the child must also have them (and the second loop checks that
			// they're equal). Property bindings are an exception to this rule.
			return (bIsProperty || !bInsideExpand
				|| Object.keys(mAggregatedQueryOptions).every(function (sName) {
					return sName in mQueryOptions0 || sName === "$count" || sName === "$expand"
						|| sName === "$select";
				}))
				// merge $count, $expand and $select; check that all others equal the aggregate
				&& Object.keys(mQueryOptions0).every(function (sName) {
					switch (sName) {
						case "$count":
							if (mQueryOptions0.$count) {
								mAggregatedQueryOptions.$count = true;
							}
							return true;
						case "$expand":
							mAggregatedQueryOptions.$expand ??= {};
							return Object.keys(mQueryOptions0.$expand).every(mergeExpandPath);
						case "$select":
							mAggregatedQueryOptions.$select ??= [];
							return mQueryOptions0.$select.every(mergeSelectPath);
						default:
							if (bAdd) {
								mAggregatedQueryOptions[sName] = mQueryOptions0[sName];
								return true;
							}
							return mQueryOptions0[sName] === mAggregatedQueryOptions[sName];
					}
				});
		}

		if (merge(mAggregatedQueryOptionsClone, mQueryOptions, sBaseMetaPath)) {
			if (bCacheImmutable) {
				this.mLateQueryOptions = mAggregatedQueryOptionsClone;
			} else {
				this.mAggregatedQueryOptions = mAggregatedQueryOptionsClone;
				if (this.mLateQueryOptions) {
					merge(this.mLateQueryOptions, mQueryOptions);
				}
			}
			return true;
		}
		return false;
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'patchCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.attachPatchCompleted = function (fnFunction, oListener) {
		return this.attachEvent("patchCompleted", fnFunction, oListener);
	};

	/**
	 * Attach event handler <code>fnFunction</code> to the 'patchSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.attachPatchSent = function (fnFunction, oListener) {
		return this.attachEvent("patchSent", fnFunction, oListener);
	};

	/**
	 * Changes this binding's parameters and refreshes the binding. Since 1.111.0, a list binding's
	 * header context is deselected, but (since 1.120.13) only if the binding parameter
	 * '$$clearSelectionOnFilter' is set and the '$filter' or '$search' parameter is changed.
	 *
	 * If there are pending changes that cannot be ignored, an error is thrown. Use
	 * {@link #hasPendingChanges} to check if there are such pending changes. If there are, call
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
	 * @throws {Error} If
	 *   <ul>
	 *     <li> there are pending changes that cannot be ignored,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}),
	 *     <li> <code>mParameters</code> is missing, contains binding-specific or unsupported
	 *       parameters, contains unsupported values, or contains the property "$expand" or
	 *       "$select" when the model is in auto-$expand/$select mode.
	 *   </ul>
	 *   The following exceptions apply:
	 *   <ul>
	 *     <li> Since 1.90.0, binding-specific parameters are ignored if they are unchanged.
	 *     <li> Since 1.93.0, string values for "$expand" and "$select" are ignored if they are
	 *       unchanged; pending changes are ignored if all parameters are unchanged.
	 *     <li> Since 1.97.0, pending changes are ignored if they relate to a
	 *       {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive} context of this binding.
	 *     <li> Since 1.98.0, {@link sap.ui.model.odata.v4.Context#isTransient transient} contexts
	 *       of a {@link #getRootBinding root binding} do not count as pending changes.
	 *     <li> Since 1.108.0, {@link sap.ui.model.odata.v4.Context#delete deleted} contexts do not
	 *       count as pending changes.
	 *   </ul>
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataParentBinding.prototype.changeParameters = function (mParameters) {
		var mBindingParameters = Object.assign({}, this.mParameters),
			sChangeReason, // @see sap.ui.model.ChangeReason
			aChangedParameters = [],
			sKey,
			that = this;

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
		 * @throws {Error}
		 *   If name is "$expand" or "$select" when the model is in auto-$expand/$select mode
		 */
		function updateChangeReason(sName) {
			if (that.oModel.bAutoExpandSelect && (sName === "$expand" || sName === "$select")) {
				throw new Error("Cannot change " + sName
					+ " parameter in auto-$expand/$select mode: "
					+ JSON.stringify(mParameters[sName])
					+ " !== " + JSON.stringify(mBindingParameters[sName]));
			}
			if (sName === "$filter" || sName === "$search") {
				sChangeReason = ChangeReason.Filter;
			} else if (sName === "$orderby" && sChangeReason !== ChangeReason.Filter) {
				sChangeReason = ChangeReason.Sort;
			} else {
				sChangeReason ??= ChangeReason.Change;
			}
			aChangedParameters.push(sKey);
		}

		this.checkTransient();
		if (!mParameters) {
			throw new Error("Missing map of binding parameters");
		}

		for (sKey in mParameters) {
			if (sKey.startsWith("$$")) {
				if (this.isUnchangedParameter(sKey, mParameters[sKey])) {
					continue; // ignore unchanged binding-specific parameters
				}
				throw new Error("Unsupported parameter: " + sKey);
			}
			if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
				updateChangeReason(sKey);
				delete mBindingParameters[sKey];
			} else if (mBindingParameters[sKey] !== mParameters[sKey]) {
				updateChangeReason(sKey);
				if (typeof mParameters[sKey] === "object") {
					mBindingParameters[sKey] = _Helper.clone(mParameters[sKey]);
				} else {
					mBindingParameters[sKey] = mParameters[sKey];
				}
			}
		}

		if (sChangeReason) {
			if (this.hasPendingChanges(true)) {
				throw new Error("Cannot change parameters due to pending changes");
			}
			this.applyParameters(mBindingParameters, sChangeReason, aChangedParameters);
		}
	};

	/**
	 * Checks whether the given context (or any context of this binding) may be kept alive.
	 *
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   A context of this binding
	 * @param {boolean} [bKeepAlive]
	 *   Whether to keep the given context alive
	 * @throws {Error}
	 *   If <code>oContext.setKeepAlive(bKeepAlive)</code> is not allowed for the given (or any)
	 *   context
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#checkKeepAlive
	 * @private
	 * @see sap.ui.model.odata.v4.Context#setKeepAlive
	 */

	/*
	 * Checks dependent bindings for updates or refreshes the binding if the resource path of its
	 * parent context changed.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result when the check is finished, or
	 *   rejected in case of an error
	 * @throws {Error}
	 *   If called with parameters
	 *
	 * @private
	 */
	// @override sap.ui.model.odata.v4.ODataBinding#checkUpdateInternal
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
					if (oCache.getResourcePath() === sResourcePath) {
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
	 * parent binding.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oUpdateGroupLock
	 *   The group ID to be used for the POST request
	 * @param {string|sap.ui.base.SyncPromise} vCreatePath
	 *   The path for the POST request or a SyncPromise that resolves with that path
	 * @param {string} sCollectionPath
	 *   The absolute path to the collection in the cache where to create the entity
	 * @param {string} sTransientPredicate
	 *   A (temporary) key predicate for the transient entity: "($uid=...)"
	 * @param {object} [oInitialData={}]
	 *   The initial data for the created entity
	 * @param {boolean} bAtEndOfCreated
	 *   Whether the newly created entity should be inserted after previously created entities, not
	 *   before them
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
			sCollectionPath, sTransientPredicate, oInitialData, bAtEndOfCreated, fnErrorCallback,
			fnSubmitCallback) {
		var that = this;

		return this.oCachePromise.then(function (oCache) {
			var sPathInCache;

			if (oCache) {
				sPathInCache = _Helper.getRelativePath(sCollectionPath, that.getResolvedPath());
				return oCache.create(oUpdateGroupLock, vCreatePath, sPathInCache,
					sTransientPredicate, oInitialData, bAtEndOfCreated, fnErrorCallback,
					fnSubmitCallback
				).then(function (oCreatedEntity) {
					if (that.mCacheByResourcePath) {
						// Ensure that cache containing non-transient created entity is recreated
						// when the parent binding changes to another row and back again.
						delete that.mCacheByResourcePath[oCache.getResourcePath()];
					}
					return oCreatedEntity;
				});
			}
			return that.oContext.getBinding().createInCache(oUpdateGroupLock, vCreatePath,
				sCollectionPath, sTransientPredicate, oInitialData, bAtEndOfCreated,
				fnErrorCallback, fnSubmitCallback);
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
			that.oModel.addPrerenderingTask(function () {
				if (that.oReadGroupLock === oGroupLock) {
					iCount -= 1;
					if (iCount > 0) {
						// Use a promise to get out of the prerendering loop
						Promise.resolve().then(addUnlockTask);
					} else {
						// It is still the same, unused lock
						Log.debug("Timeout: unlocked " + oGroupLock, null, sClassName);
						that.removeReadGroupLock();
					}
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
	 * @param {boolean} bPreventBubbling
	 *   Whether the dataRequested and dataReceived events related to the refresh must not be
	 *   bubbled up to the model
	 * @returns {Promise} The created promise
	 *
	 * @see #isRefreshWithoutBubbling
	 * @see #resolveRefreshPromise
	 * @private
	 */
	ODataParentBinding.prototype.createRefreshPromise = function (bPreventBubbling) {
		var oPromise, fnResolve;

		oPromise = new Promise(function (resolve) {
			fnResolve = resolve;
		});
		oPromise.$preventBubbling = bPreventBubbling;
		oPromise.$resolve = fnResolve;
		this.oRefreshPromise = oPromise;
		return oPromise;
	};

	/**
	 * Deletes the entity identified by the edit URL.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the DELETE request; w/o a lock, no DELETE is sent.
	 *   For a transient entity, the lock is ignored (use NULL)!
	 * @param {string} [sEditUrl]
	 *   The entity's edit URL to be used for the DELETE request; only required with a lock
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context to be deleted
	 * @param {object} [oETagEntity]
	 *   An entity with the ETag of the binding for which the deletion was requested. This is
	 *   provided if the deletion is delegated from a context binding with empty path to a list
	 *   binding. W/o a lock, this is ignored.
	 * @param {boolean} [bDoNotRequestCount]
	 *   Whether not to request the new count from the server; useful in case of
	 *   {@link sap.ui.model.odata.v4.Context#replaceWith} where it is known that the count remains
	 *   unchanged; w/o a lock this should be true
	 * @param {function} fnUndelete
	 *   A function to undelete the context (and poss. the context the deletion was delegated to)
	 *   when the deletion failed or has been canceled
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure.
	 * @throws {Error}
	 *   If the cache promise for this binding is not yet fulfilled, or if the cache is shared
	 *
	 * @name sap.ui.model.odata.v4.ODataParentBinding#delete
	 * @private
	 */

	/**
	 * Deletes the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting the path.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the DELETE request; w/o a lock, no DELETE is sent.
	 *   For a transient entity, the lock is ignored (use NULL)!
	 * @param {string} [sEditUrl]
	 *   The entity's edit URL to be used for the DELETE request; only required with a lock
	 * @param {string} sPath
	 *   The path of the entity relative to this binding
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
	 *   instance of <code>Error</code> in case of failure; returns <code>undefined</code> if the
	 *   cache promise for this binding is not yet fulfilled
	 * @throws {Error}
	 *   If the cache is shared
	 *
	 * @private
	 */
	ODataParentBinding.prototype.deleteFromCache = function (oGroupLock, sEditUrl, sPath,
			oETagEntity, fnCallback) {
		return this.withCache(function (oCache, sCachePath) {
			return oCache._delete(oGroupLock, sEditUrl, sCachePath, oETagEntity, fnCallback);
		}, sPath, /*bSync*/true);
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.61
	 */
	ODataParentBinding.prototype.destroy = function () {
		// this.mAggregatedQueryOptions = undefined;
		this.aChildCanUseCachePromises = [];
		this.removeReadGroupLock();
		this.oResumePromise = undefined;

		asODataBinding.prototype.destroy.call(this);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'patchCompleted' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.detachPatchCompleted = function (fnFunction, oListener) {
		return this.detachEvent("patchCompleted", fnFunction, oListener);
	};

	/**
	 * Detach event handler <code>fnFunction</code> from the 'patchSent' event of this binding.
	 *
	 * @param {function} fnFunction The function to call when the event occurs
	 * @param {object} [oListener] Object on which to call the given function
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @since 1.59.0
	 */
	ODataParentBinding.prototype.detachPatchSent = function (fnFunction, oListener) {
		return this.detachEvent("patchSent", fnFunction, oListener);
	};

	/**
	 * Handles exceptional cases of setting the property with the given path to the given value.
	 *
	 * @param {string} sPath
	 *   A path (absolute or relative to this binding)
	 * @param {any} vValue
	 *   The new value which must be primitive
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the PATCH request; without a lock, no PATCH is sent
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   <code>undefined</code> for the general case which is handled generically by the caller
	 *   {@link sap.ui.model.odata.v4.Context#doSetProperty} or a <code>SyncPromise</code> for the
	 *   exceptional case
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	 * @private
	 */

	/**
	 * Binding specific code for suspend.
	 *
	 * @private
	 */
	ODataParentBinding.prototype.doSuspend = function () {
		// nothing to do here
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
	 *   A context of this binding which is the direct or indirect parent of the child binding.
	 *   Initially it is the child binding's parent context (See
	 *   {@link sap.ui.model.odata.v4.ODataBinding#fetchOrGetQueryOptionsForOwnCache}). When a
	 *   binding delegates up to its parent binding, it passes its own parent context adjusting
	 *   <code>sChildPath</code> accordingly.
	 * @param {string} sChildPath
	 *   The child binding's binding path relative to <code>oContext</code>
	 * @param {object|sap.ui.base.SyncPromise} [vChildQueryOptions={}]
	 *   The child binding's (aggregated) query options (if any) or a promise resolving with them
	 * @param {boolean} [bIsProperty]
	 *   Whether the child is a property binding
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolved with the reduced path for the child binding if the child binding can use
	 *   this binding's or an ancestor binding's cache; resolved with <code>undefined</code>
	 *   otherwise.
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.ODataMetaModel#getReducedPath
	 */
	ODataParentBinding.prototype.fetchIfChildCanUseCache = function (oContext, sChildPath,
			vChildQueryOptions, bIsProperty) {
		// getBaseForPathReduction must be called early, because the (virtual) parent context may be
		// lost again when the path is needed
		var sBaseForPathReduction = this.getBaseForPathReduction(),
			sBaseMetaPath,
			bCacheImmutable,
			oCanUseCachePromise,
			// whether this binding is an operation or depends on one
			bDependsOnOperation = oContext.getPath().includes("(...)"),
			iIndex = oContext.getIndex(),
			bIsAdvertisement = sChildPath[0] === "#",
			oMetaModel = this.oModel.getMetaModel(),
			oParentContext = this.oContext, // Note: might disappear later on
			aPromises,
			sResolvedChildPath = this.oModel.resolve(sChildPath, oContext),
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
				return oMetaModel.fetchObject(sBaseMetaPath + "/");
			}

			return _Helper.fetchPropertyAndType(that.oModel.oInterface.fetchMetadata,
				getStrippedMetaPath(sResolvedChildPath));
		}

		/*
		 * Returns the meta path corresponding to the given path, with its annotation part stripped
		 * off.
		 *
		 * @param {string} sPath - A path
		 * @returns {string} The meta path with its annotation part stripped off
		 */
		function getStrippedMetaPath(sPath) {
			var iIndex0;

			sPath = _Helper.getMetaPath(sPath);
			iIndex0 = sPath.indexOf("@"); // Note: sPath[0] !== "@"

			return iIndex0 > 0 ? sPath.slice(0, iIndex0) : sPath;
		}

		if (bDependsOnOperation && !sResolvedChildPath.includes("/$Parameter/")
				|| this.isRootBindingSuspended()
				|| _Helper.isDataAggregation(this.mParameters)) {
			// With data aggregation, no auto-$expand/$select is needed, but the child may still use
			// the parent's cache
			// Note: Operation bindings do not support auto-$expand/$select yet
			return SyncPromise.resolve(sResolvedChildPath);
		}

		// A binding w/o cache must skip this optimization and pass on to the parent binding;
		// otherwise late properties might be missing later
		oCanUseCachePromise = this.mCanUseCachePromiseByChildPath[sChildPath];
		if (bIsProperty && this.oCache !== null && oCanUseCachePromise) {
			return oCanUseCachePromise.then(function (sOldReducedPath) {
				if (!sOldReducedPath) {
					return undefined;
				}
				// Note: sResolvedChildPath could be "/SalesOrderList('42')/SO_2_SOITEM/0/Note"
				// w/ index (thus getMetaPath helps), but getStrippedMetaPath makes no difference
				if (!sChildPath.includes("/")
					|| _Helper.getMetaPath(sOldReducedPath)
						=== _Helper.getMetaPath(sResolvedChildPath)) {
					return sResolvedChildPath;
				}
				return oMetaModel.getReducedPath(sResolvedChildPath, sBaseForPathReduction);
			});
		}

		// Note: this.oCachePromise exists for all bindings except operation bindings; it might
		// become pending again
		bCacheImmutable = this.oCachePromise.isRejected()
			|| iIndex !== undefined && iIndex !== Context.VIRTUAL
			|| oContext.isEffectivelyKeptAlive() // no index when not in aContexts
			|| this.oCache === null
			|| this.oCache && this.oCache.hasSentRequest();
		sBaseMetaPath = _Helper.getMetaPath(oContext.getPath());
		aPromises = [
			this.doFetchOrGetQueryOptions(oParentContext),
			// After access to complete meta path of property, the metadata of all prefix paths
			// is loaded so that synchronous access in wrapChildQueryOptions via getObject is
			// possible - as well as #getReducedPath
			fetchPropertyAndType(),
			vChildQueryOptions
		];
		oCanUseCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var mChildQueryOptions = aResult[2] || {},
				mWrappedChildQueryOptions,
				mLocalQueryOptions = aResult[0],
				oProperty = aResult[1],
				sReducedChildMetaPath,
				sReducedPath;

			if (Array.isArray(oProperty)) { // Arrays are only used for functions and actions
				// a (non-deferred) function has to have its own cache
				return undefined;
			}

			sReducedPath = oMetaModel.getReducedPath(sResolvedChildPath, sBaseForPathReduction);
			sReducedChildMetaPath = _Helper.getRelativePath(getStrippedMetaPath(sReducedPath),
				sBaseMetaPath);

			if (sReducedChildMetaPath === undefined) {
				// the child's data does not fit into this bindings's cache, try the parent
				that.bHasPathReductionToParent = true;
				return oParentContext.getBinding().fetchIfChildCanUseCache(oParentContext,
					_Helper.getRelativePath(sResolvedChildPath, oParentContext.getPath()),
					mChildQueryOptions, bIsProperty);
			}

			if (bDependsOnOperation || sReducedChildMetaPath === "$count"
					|| sReducedChildMetaPath.endsWith("/$count")) {
				return sReducedPath;
			}

			if (that.bAggregatedQueryOptionsInitial) {
				that.mAggregatedQueryOptions = _Helper.clone(mLocalQueryOptions);
				that.selectKeyProperties(that.mAggregatedQueryOptions, sBaseMetaPath);
				that.bAggregatedQueryOptionsInitial = false;
			}
			if (bIsAdvertisement) {
				mWrappedChildQueryOptions = {$select : [sReducedChildMetaPath.slice(1)]};
				return that.aggregateQueryOptions(mWrappedChildQueryOptions, sBaseMetaPath,
						bCacheImmutable, bIsProperty)
					? sReducedPath
					: undefined;
			}
			if (sReducedChildMetaPath === ""
				|| oProperty
				&& (oProperty.$kind === "Property" || oProperty.$kind === "NavigationProperty")) {
				mWrappedChildQueryOptions = _Helper.wrapChildQueryOptions(sBaseMetaPath,
					sReducedChildMetaPath, mChildQueryOptions,
					that.oModel.oInterface.fetchMetadata);
				if (mWrappedChildQueryOptions) {
					return that.aggregateQueryOptions(mWrappedChildQueryOptions, sBaseMetaPath,
							bCacheImmutable, bIsProperty)
						? sReducedPath
						: undefined;
				}
				return undefined;
			}
			if (sReducedChildMetaPath === "value") { // symbolic name for operation result
				return that.aggregateQueryOptions(mChildQueryOptions, sBaseMetaPath,
						bCacheImmutable, bIsProperty)
					? sReducedPath
					: undefined;
			}
			Log.error("Failed to enhance query options for auto-$expand/$select as the path '"
					+ sResolvedChildPath + "' does not point to a property",
				JSON.stringify(oProperty), sClassName);
			return undefined;
		}).then(function (sReducedPath) {
			if (that.mLateQueryOptions && !that.isTransient()) {
				if (that.oCache) {
					that.oCache.setLateQueryOptions(that.mLateQueryOptions);
				} else if (that.oCache === null) {
					return oParentContext.getBinding()
						.fetchIfChildCanUseCache(oParentContext, that.sPath, that.mLateQueryOptions)
						.then(function (sPath) {
							return sPath && sReducedPath;
						});
				}
			}
			return sReducedPath;
		});
		if (bIsProperty && this.oCache !== null && !oContext.getPath().includes("($uid=")) {
			this.mCanUseCachePromiseByChildPath[sChildPath] = oCanUseCachePromise;
		}
		this.aChildCanUseCachePromises.push(oCanUseCachePromise);
		// If the cache is immutable, only mLateQueryOptions may have changed
		const oPromise = bCacheImmutable
			? oCanUseCachePromise
			: SyncPromise.all([this.oCachePromise, oCanUseCachePromise]).then(function (aResult) {
				var oCache = aResult[0];

				// Note: in operation bindings mAggregatedQueryOptions misses the options from
				// $$inheritExpandSelect
				if (oCache && !oCache.hasSentRequest() && !that.oOperation) {
					if (that.bSharedRequest) {
						oCache.setActive(false);
						oCache = that.createAndSetCache(that.mAggregatedQueryOptions,
							oCache.getResourcePath(), oContext);
					} else {
						oCache.setQueryOptions(_Helper.merge({}, that.oModel.mUriParameters,
							that.mAggregatedQueryOptions));
					}
				}
				return oCache;
			});
		// catch the error, but keep the rejected promise
		oPromise.catch(function (oError) {
			that.oModel.reportError(that + ": Failed to enhance query options for "
				+ "auto-$expand/$select for child " + sChildPath, sClassName, oError);
		});
		if (!bCacheImmutable) {
			this.oCachePromise = oPromise;
		}
		return oCanUseCachePromise;
	};

	/**
	 * Resolves the query options resulting from mParameters. Resolves all paths in $select
	 * containing navigation properties and converts them into an appropriate $expand if
	 * autoExpandSelect is active.
	 *
	 * @param {sap.ui.model.Context} oContext
	 *   The context instance to be used
	 * @returns {sap.ui.base.SyncPromise<object>} A promise that resolves with the resolved
	 *   query options when all paths in $select have been processed
	 *
	 * @private
	 * @see #getQueryOptionsFromParameters
	 */
	ODataParentBinding.prototype.fetchResolvedQueryOptions = function (oContext) {
		var fnFetchMetadata,
			mConvertedQueryOptions,
			sMetaPath,
			oModel = this.oModel,
			mQueryOptions = this.getQueryOptionsFromParameters();

		if (!(oModel.bAutoExpandSelect && mQueryOptions.$select)) {
			return SyncPromise.resolve(mQueryOptions);
		}

		fnFetchMetadata = oModel.oInterface.fetchMetadata;
		sMetaPath = _Helper.getMetaPath(oModel.resolve(this.sPath, oContext));
		mConvertedQueryOptions = Object.assign({}, _Helper.clone(mQueryOptions), {$select : []});
		return SyncPromise.all(mQueryOptions.$select.map(function (sSelectPath) {
			var sMetaSelectPath = sMetaPath + "/" + sSelectPath;

			if (sMetaSelectPath.endsWith(".*")) { // fetch metadata for namespace itself
				sMetaSelectPath = sMetaSelectPath.slice(0, -1);
			}

			return _Helper.fetchPropertyAndType(fnFetchMetadata, sMetaSelectPath).then(function () {
				var mWrappedQueryOptions = _Helper.wrapChildQueryOptions(
						sMetaPath, sSelectPath, {}, fnFetchMetadata);

				if (mWrappedQueryOptions) {
					_Helper.aggregateExpandSelect(mConvertedQueryOptions, mWrappedQueryOptions);
				} else {
					_Helper.addToSelect(mConvertedQueryOptions, [sSelectPath]);
				}
			});
		})).then(function () {
			return mConvertedQueryOptions;
		});
	};

	/**
	 * Finds the context that matches the given canonical path.
	 *
	 * @param {string} sCanonicalPath
	 *   The canonical path of an entity (as a context path with the leading "/")
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   A matching context or <code>undefined</code> if there is none
	 *
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#findContextForCanonicalPath
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
		this.bPatchSuccess &&= bSuccess;
		if (this.iPatchCounter === 0) {
			this.fireEvent("patchCompleted", {success : this.bPatchSuccess});
			this.bPatchSuccess = true;
		}
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
					|| !this.oModel.isApiGroup(sParentUpdateGroupId)) {
				return oParentBinding.getBaseForPathReduction();
			}
		}
		return this.getResolvedPath();
	};

	/**
	 * Returns the unique number of this bindings's generation, or <code>0</code> if it does not
	 * belong to any specific generation. This number can be inherited from a parent context.
	 *
	 * @returns {number}
	 *   The unique number of this binding's generation, or <code>0</code>
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getGeneration = function () {
		return this.bRelative && this.oContext.getGeneration && this.oContext.getGeneration() || 0;
	};

	/**
	 * Returns the query options that can be inherited from this binding, including late query
	 * options.
	 *
	 * @returns {object} The inheritable query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getInheritableQueryOptions = function () {
		if (this.mLateQueryOptions) {
			return _Helper.merge({}, this.mCacheQueryOptions, this.mLateQueryOptions);
		}

		return this.mCacheQueryOptions
			|| _Helper.getQueryOptionsForPath(
				this.oContext.getBinding().getInheritableQueryOptions(), this.sPath);
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
		if (!_Helper.isEmptyObject(this.mParameters)) {
			// binding has parameters -> all query options need to be defined at the binding
			return _Helper.getQueryOptionsForPath(this.getQueryOptionsFromParameters(), sPath);
		}

		oContext ??= this.oContext;
		// oContext is always set; as getQueryOptionsForPath is called only from ODLB#doCreateCache
		// binding has no parameters -> no own query options
		if (!this.bRelative || !oContext.getQueryOptionsForPath) {
			// absolute or quasi-absolute -> no inheritance and no query options -> no options
			return {};
		}
		return oContext.getQueryOptionsForPath(_Helper.buildPath(this.sPath, sPath));
	};

	/**
	 * Returns the query options resulting from mParameters. For operation bindings this includes
	 * $expand and $select from the parent context if the parameter $$inheritExpandSelect is set.
	 *
	 * Operation bindings directly use these options for the cache. With autoExpandSelect, other
	 * bindings may later extend these options to support child bindings that are allowed to
	 * participate in this binding's cache.
	 *
	 * @returns {object} The query options
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding.getQueryOptionsFromParameters
	 * @private
	 * @see sap.ui.model.odata.v4.ODataBinding#fetchOrGetQueryOptionsForOwnCache
	 * @see sap.ui.model.odata.v4.ODataBinding#doFetchOrGetQueryOptions
	 */

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
	ODataParentBinding.prototype.hasPendingChangesInDependents = function (bIgnoreKeptAlive0,
			sPathPrefix) {
		return this.getDependentBindings().some(function (oDependent) {
			var oCache = oDependent.oCache,
				bHasPendingChanges,
				bIgnoreKeptAlive = bIgnoreKeptAlive0; // new copy for this dependent only

			if (bIgnoreKeptAlive) {
				if (oDependent.oContext.isEffectivelyKeptAlive()) {
					return false; // changes can be safely ignored here
				}
				if (oDependent.oContext.getIndex() !== undefined) {
					bIgnoreKeptAlive = false; // context of ODLB which is not kept alive: unsafe!
				}
			}
			if (oCache !== undefined) {
				// Pending changes for this cache are only possible when there is a cache already
				if (oCache && oCache.hasPendingChangesForPath("", false, bIgnoreKeptAlive
						&& oDependent.mParameters && oDependent.mParameters.$$ownRequest)) {
					return true;
				}
			} else if (oDependent.hasPendingChangesForPath("")) {
				return true;
			}
			if (oDependent.mCacheByResourcePath) {
				bHasPendingChanges = Object.keys(oDependent.mCacheByResourcePath)
					.some(function (sPath) {
						var oCacheForPath = oDependent.mCacheByResourcePath[sPath];

						return (!sPathPrefix || sPath.startsWith(sPathPrefix.slice(1)))
							&& oCacheForPath !== oCache // don't ask again
							&& oCacheForPath.hasPendingChangesForPath("");
					});
				if (bHasPendingChanges) {
					return true;
				}
			}
			return oDependent.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix);
		})
		|| this.oModel.withUnresolvedBindings("hasPendingChangesInCaches",
				this.getResolvedPath().slice(1));
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#isMeta
	 */
	ODataParentBinding.prototype.isMeta = function () {
		return false;
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
	 * Whether the dataRequested and dataReceived events related to the refresh must not be bubbled
	 * up to the model.
	 *
	 * @returns {boolean} Whether to prevent bubbling
	 *
	 * @private
	 * @see #createRefreshPromise
	 */
	ODataParentBinding.prototype.isRefreshWithoutBubbling = function () {
		return this.oRefreshPromise && this.oRefreshPromise.$preventBubbling;
	};

	/**
	 * Tells whether the current value of the binding-specific parameter with the given name is
	 * "unchanged" when compared to the given other value.
	 *
	 * @param {string} sName - The parameter's name
	 * @param {any} vOtherValue - The parameter's other value
	 * @returns {boolean} Whether the parameter is "unchanged"
	 */
	ODataParentBinding.prototype.isUnchangedParameter = function (sName, vOtherValue) {
		return this.mParameters[sName] === vOtherValue;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#onDelete
	 */
	ODataParentBinding.prototype.onDelete = function (sCanonicalPath) {
		var oContext = this.findContextForCanonicalPath(sCanonicalPath);

		if (oContext) {
			this.resetChangesForPath(this.getRelativePath(oContext.getPath()), []);
			this.oModel.getDependentBindings(oContext).forEach(function (oBinding) {
				oBinding.resetChanges();
			});
			this.delete(null, sCanonicalPath.slice(1), oContext);
		}
	};

	/**
	 * Recursively refreshes all dependent list bindings that have no own cache.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving when all dependent list bindings without own cache are refreshed; it is
	 *   rejected when the refresh fails; the promise is resolved immediately on a suspended binding
	 * @throws {Error}
	 *   If the binding's root binding is suspended and a group ID different from the binding's
	 *   group ID is given
	 *
	 * @private
	 */
	ODataParentBinding.prototype.refreshDependentListBindingsWithoutCache = function () {
		return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
			if (oDependentBinding.filter && oDependentBinding.oCache === null) {
				return oDependentBinding.refreshInternal("");
			}

			if (oDependentBinding.refreshDependentListBindingsWithoutCache) {
				return oDependentBinding.refreshDependentListBindingsWithoutCache();
			}
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
	 *   A promise which is resolved without a defined result, or rejected with an error if loading
	 *   of side effects fails
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
	ODataParentBinding.prototype.resetChangesInDependents = function (aPromises, sPathPrefix) {
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
					if (!sPathPrefix || sPath.startsWith(sPathPrefix.slice(1))) {
						oDependent.mCacheByResourcePath[sPath].resetChangesForPath("");
					}
				});
			}
			// Reset dependents, they might have no cache, but pending changes in
			// mCacheByResourcePath
			oDependent.resetChangesInDependents(aPromises, sPathPrefix);
		});
	};

	/**
	 * If there is a refresh promise created by {@link #createRefreshPromise}, it is resolved with
	 * the given promise and cleared. Does not reject the refresh promise with a canceled error.
	 *
	 * @param {Promise} oPromise - The promise to resolve with
	 * @returns {Promise} oPromise for chaining
	 *
	 * @private
	 */
	ODataParentBinding.prototype.resolveRefreshPromise = function (oPromise) {
		if (this.oRefreshPromise) {
			this.oRefreshPromise.$resolve(oPromise.catch(function (oError) {
				if (!oError.canceled) {
					throw oError;
				}
			}));
			this.oRefreshPromise = null;
		}
		return oPromise;
	};

	/**
	 * Resumes this binding. The binding can then again fire change events and initiate data service
	 * requests.
	 * Before 1.53.0, this method was not supported and threw an error.
	 *
	 * @throws {Error}
	 *   If this binding
	 *   <ul>
	 *     <li> is relative to an {@link sap.ui.model.odata.v4.Context},
	 *     <li> is an operation binding,
	 *     <li> has {@link sap.ui.model.Binding#isSuspended} set to <code>false</code>,
	 *     <li> is not a root binding. Use {@link #getRootBinding} to determine the root binding.
	 *   </ul>
	 *
	 * @public
	 * @see {@link topic:b0f5c531e5034a27952cc748954cbe39 Suspend and Resume}
	 * @see sap.ui.model.Binding#resume
	 * @see #suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#resume
	ODataParentBinding.prototype.resume = function () {
		this._resume(false);
	};

	/**
	 * Resumes this binding asynchronously as soon as the next rendering starts.
	 *
	 * Note: Some API calls are not allowed as long as the binding is in suspended mode, hence the
	 * returned promise can be used to get the point in time when these APIs can be called again.
	 *
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result when the binding is resumed.
	 * @throws {Error}
	 *   If this binding is relative to an {@link sap.ui.model.odata.v4.Context} or if it is an
	 *   operation binding or if it is not suspended
	 *
	 * @protected
	 * @see #resume
	 * @see #suspend
	 * @since 1.75.0
	 */
	ODataParentBinding.prototype.resumeAsync = function () {
		this._resume(true);
		return Promise.resolve(this.oResumePromise);
	};

	/**
	 * Resumes this binding and all dependent bindings, fires a change or refresh event afterwards.
	 *
	 * @param {boolean} bCheckUpdate
	 *   Parameter is ignored; dependent property bindings of a list binding never call checkUpdate
	 * @param {boolean} [bParentHasChanges]
	 *   Whether there are changes on the parent binding that become active after resuming. If
	 *   <code>true</code>, this binding is allowed to reuse the parent cache, otherwise this
	 *   binding has to create its own cache
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataParentBinding#resumeInternal
	 * @private
	 */

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
	 * Suspends this binding. A suspended binding does not fire change events nor does it initiate
	 * data service requests. Call {@link #resume} to resume the binding. Before 1.53.0, this method
	 * was not supported and threw an error. Since 1.97.0, pending changes are ignored if they
	 * relate to a {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive} context of this
	 * binding. Since 1.98.0, {@link sap.ui.model.odata.v4.Context#isTransient transient} contexts
	 * of a {@link #getRootBinding root binding} do not count as pending changes. Since 1.108.0
	 * {@link sap.ui.model.odata.v4.Context#delete deleted} contexts do not count as pending
	 * changes.
	 *
	 * @throws {Error}
	 *   If this binding
	 *   <ul>
	 *     <li> is relative to an {@link sap.ui.model.odata.v4.Context},
	 *     <li> is an operation binding,
	 *     <li> has {@link sap.ui.model.Binding#isSuspended} set to <code>true</code>,
	 *     <li> has pending changes that cannot be ignored,
	 *     <li> is not a root binding. Use {@link #getRootBinding} to determine the root binding.
	 *   </ul>
	 *
	 * @public
	 * @see {@link topic:b0f5c531e5034a27952cc748954cbe39 Suspend and Resume}
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
		if (!this.isRoot()) {
			throw new Error("Cannot suspend a relative binding: " + this);
		}
		if (this.bSuspended) {
			throw new Error("Cannot suspend a suspended binding: " + this);
		}
		if (this.hasPendingChanges(true)) {
			throw new Error("Cannot suspend a binding with pending changes: " + this);
		}

		this.bSuspended = true;
		this.oResumePromise = new SyncPromise(function (resolve) {
			fnResolve = resolve;
		});
		this.oResumePromise.$resolve = fnResolve;
		this.removeReadGroupLock();
		this.doSuspend();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#updateAfterCreate
	 */
	ODataParentBinding.prototype.updateAfterCreate = function (bSkipRefresh, sGroupId) {
		return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
			return oDependentBinding.updateAfterCreate(bSkipRefresh, sGroupId);
		}));
	};

	/**
	 * Updates the aggregated query options of this binding with the values from the given
	 * query options. "$select" and "$expand" are only updated if the aggregated query options are
	 * still initial because these have been computed in {@link #fetchIfChildCanUseCache} otherwise.
	 * Note: If the aggregated query options contain a key which is not contained in the given
	 * query options, it is deleted from the aggregated query options.
	 *
	 * @param {object} mNewQueryOptions
	 *   The query options to update the aggregated query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.updateAggregatedQueryOptions = function (mNewQueryOptions) {
		var mAggregatedQueryOptions = this.mAggregatedQueryOptions,
			aAllKeys = Object.keys(mNewQueryOptions),
			that = this;

		if (mAggregatedQueryOptions) {
			aAllKeys = aAllKeys.concat(Object.keys(mAggregatedQueryOptions));
			aAllKeys.forEach(function (sName) {
				// if the aggregated query options are not initial anymore, $select and $expand
				// have already been merged
				if (that.bAggregatedQueryOptionsInitial
						|| sName !== "$select" && sName !== "$expand") {
					if (mNewQueryOptions[sName] === undefined) {
						delete mAggregatedQueryOptions[sName];
					} else {
						mAggregatedQueryOptions[sName] = mNewQueryOptions[sName];
					}
				}
			});
			if (mAggregatedQueryOptions.$select && !mAggregatedQueryOptions.$select.length) {
				mAggregatedQueryOptions.$select = [Object.keys(mAggregatedQueryOptions.$expand)[0]];
			}
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#visitSideEffects
	 */
	ODataParentBinding.prototype.visitSideEffects = function (sGroupId, aPaths, oContext, aPromises,
			sPrefix) {
		var aDependentBindings = oContext
				? this.oModel.getDependentBindings(oContext)
				: this.getDependentBindings();

		aDependentBindings.forEach(function (oDependentBinding) {
			var sPath = _Helper.buildPath(sPrefix,
					oDependentBinding.oOperation
					? "" // operation's name cannot appear inside aPaths!
					: _Helper.getMetaPath(oDependentBinding.getPath())
				),
				aStrippedPaths;

			if (oDependentBinding.oCache) {
				// dependent binding which has its own cache => not an ODataPropertyBinding
				aStrippedPaths = _Helper.stripPathPrefix(sPath, aPaths);
				if (aStrippedPaths.length) {
					aPromises.push(
						oDependentBinding.requestSideEffects(sGroupId, aStrippedPaths));
				}
			} else {
				oDependentBinding.visitSideEffects(sGroupId, aPaths, null, aPromises, sPath);
			}
		});
	};

	function asODataParentBinding(oPrototype) {
		if (this) {
			ODataParentBinding.apply(this, arguments);
		} else {
			Object.assign(oPrototype, ODataParentBinding.prototype);
		}
	}

	[
		"adjustPredicate",
		"destroy",
		"getGeneration",
		"hasPendingChangesForPath",
		"isUnchangedParameter",
		"updateAfterCreate"
	].forEach(function (sMethod) { // method (still) not final, allow for "super" calls
		asODataParentBinding.prototype[sMethod] = ODataParentBinding.prototype[sMethod];
	});

	return asODataParentBinding;
});
