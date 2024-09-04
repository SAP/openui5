/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.ODataBinding for classes extending sap.ui.model.Binding
sap.ui.define([
	"./lib/_Helper",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/odata/v4/Context"
], function (_Helper, SyncPromise, ChangeReason, OperationMode, Context) {
	"use strict";

	var aChangeReasonPrecedence = [ChangeReason.Context, ChangeReason.Change, ChangeReason.Refresh,
			ChangeReason.Sort, ChangeReason.Filter],
		// Whether a path segment is an index or contains a transient predicate
		rIndexOrTransientPredicate = /\/\d|\(\$uid=/;

	/*
	 * Tells whether the first given change reason has precedence over the second one.
	 *
	 * @param {string} sChangeReason0 - A change reason
	 * @param {string} sChangeReason1 - A change reason
	 * @returns {boolean} Whether the first given change reason has precedence over the second one
	 */
	function hasPrecedenceOver(sChangeReason0, sChangeReason1) {
		return aChangeReasonPrecedence.indexOf(sChangeReason0)
			> aChangeReasonPrecedence.indexOf(sChangeReason1);
	}

	/**
	 * A mixin for all OData V4 bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataBinding() {
		// maps a canonical path of a quasi-absolute or relative binding to a cache object that may
		// be reused
		this.mCacheByResourcePath = undefined;
		// the current cache of this binding as delivered by oCachePromise
		// undefined: unknown whether the binding has an own cache or not
		// null: binding does not have an own cache
		this.oCache = null;
		this.oCachePromise = SyncPromise.resolve(null);
		this.mCacheQueryOptions = undefined;
		this.fnDeregisterChangeListener = undefined;
		// used to create cache only for the latest call to #fetchCache
		this.oFetchCacheCallToken = undefined;
		// query options resulting from child bindings added when this binding already has data
		this.mLateQueryOptions = undefined;
		// the absolute binding path (possibly reduced if the binding uses a parent binding's cache)
		this.sReducedPath = undefined;
		// change reason to be used when the binding is resumed
		this.sResumeChangeReason = undefined;
	}

	/**
	 * Returns <code>true</code> if this binding or its dependent bindings have changes.
	 *
	 * Note: This private function is needed in order to hide the additional parameter
	 * <code>sPathPrefix</code> from the public API {@link #hasPendingChanges}.
	 *
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by certain APIs, see
	 *   {@link #hasPendingChanges}
	 * @param {boolean} [sPathPrefix]
	 *   If supplied, only caches having a resource path starting with <code>sPathPrefix</code> are
	 *   checked
	 * @returns {boolean}
	 *   <code>true</code> if the binding is resolved and has pending changes
	 *
	 * @private
	 */
	ODataBinding.prototype._hasPendingChanges = function (bIgnoreKeptAlive, sPathPrefix) {
		return this.isResolved()
			&& (this.hasPendingChangesForPath("", bIgnoreKeptAlive)
				|| this.hasPendingChangesInDependents(bIgnoreKeptAlive, sPathPrefix));
	};

	/**
	 * Resets all pending changes of this binding, see {@link #hasPendingChanges}. Resets also
	 * invalid user input.
	 *
	 * Note: This private function is needed in order to hide the additional parameter
	 * <code>sPathPrefix</code> from the public API {@link #resetChanges}.
	 *
	 * @param {boolean} [sPathPrefix]
	 *   If supplied, only caches having a resource path starting with <code>sPathPrefix</code> are
	 *   reset
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result as soon as all changes in the binding
	 *   itself and all dependent bindings are canceled
	 * @throws {Error}
	 *   If the binding's root binding is suspended or if there is a change of this binding which
	 *   has been sent to the server and for which there is no response yet
	 *
	 * @private
	 */
	ODataBinding.prototype._resetChanges = function (sPathPrefix) {
		var aPromises = [];

		this.checkSuspended();
		this.resetChangesForPath("", aPromises);
		this.resetChangesInDependents(aPromises, sPathPrefix);
		this.resetInvalidDataState();

		return Promise.all(aPromises).then(function () {});
	};

	/**
	 * Adjusts the paths of all contexts of this binding by replacing the given transient predicate
	 * with the given predicate. Recursively adjusts all child bindings.
	 *
	 * @param {string} sTransientPredicate - The transient predicate to be replaced
	 * @param {string} sPredicate - The new predicate
	 *
	 * @private
	 */
	ODataBinding.prototype.adjustPredicate = function (sTransientPredicate, sPredicate) {
		this.sReducedPath = this.sReducedPath.replace(sTransientPredicate, sPredicate);
	};

	/**
	 * Checks binding-specific parameters from the given map. "Binding-specific" parameters are
	 * those with a key starting with '$$', i.e. OData query options provided as binding parameters
	 * are ignored. The following parameters are supported, if the parameter name is contained in
	 * the given 'aAllowed' parameter:
	 * <ul>
	 *   <li> '$$aggregation' with allowed values as specified in
	 *     {@link sap.ui.model.odata.v4.ODataListBinding#updateAnalyticalInfo} (but without
	 *     validation here)
	 *   <li> '$$canonicalPath' with value <code>true</code>
	 *   <li> '$$clearSelectionOnFilter' with value <code>true</code>
	 *   <li> '$$groupId' with allowed values as specified in {@link #checkGroupId}
	 *   <li> '$$inheritExpandSelect' with allowed values <code>false</code> and <code>true</code>
	 *   <li> '$$noPatch' with value <code>true</code>
	 *   <li> '$$operationMode' with value {@link sap.ui.model.odata.OperationMode.Server}
	 *   <li> '$$ownRequest' with value <code>true</code>
	 *   <li> '$$patchWithoutSideEffects' with value <code>true</code>
	 *   <li> '$$updateGroupId' with allowed values as specified in {@link #checkGroupId}
	 *   <li> '$$separate' with value <code>string[]</code>
	 * </ul>
	 *
	 * @param {object} mParameters
	 *   The map of binding parameters
	 * @param {string[]} aAllowed
	 *   The array of allowed binding parameter names
	 * @throws {Error}
	 *   For unsupported parameter names or parameter values
	 *
	 * @private
	 */
	ODataBinding.prototype.checkBindingParameters = function (mParameters, aAllowed) {
		var that = this;

		Object.keys(mParameters).forEach(function (sKey) {
			var vValue = mParameters[sKey];

			if (!sKey.startsWith("$$")) {
				return;
			}
			if (!aAllowed.includes(sKey)) {
				throw new Error("Unsupported binding parameter: " + sKey);
			}

			switch (sKey) {
				case "$$aggregation":
					// no validation here
					break;
				case "$$groupId":
				case "$$updateGroupId":
					_Helper.checkGroupId(vValue, false,
						"Unsupported value for binding parameter '" + sKey + "': ");
					break;
				case "$$ignoreMessages":
				case "$$sharedRequest":
					if (vValue !== true && vValue !== false) {
						throw new Error("Unsupported value for binding parameter '" + sKey + "': "
							+ vValue);
					}
					break;
				case "$$inheritExpandSelect":
					if (vValue !== true && vValue !== false) {
						throw new Error("Unsupported value for binding parameter "
							+ "'$$inheritExpandSelect': " + vValue);
					}
					if (!that.oOperation) {
						throw new Error("Unsupported binding parameter $$inheritExpandSelect: "
							+ "binding is not an operation binding");
					}
					if (mParameters.$expand) {
						throw new Error("Must not set parameter $$inheritExpandSelect on a binding "
							+ "which has a $expand binding parameter");
					}
					break;
				case "$$operationMode":
					if (vValue !== OperationMode.Server) {
						throw new Error("Unsupported operation mode: " + vValue);
					}
					break;
				case "$$getKeepAliveContext":
					if (that.isRelative() && !mParameters.$$ownRequest) {
						throw new Error(
							"$$getKeepAliveContext requires $$ownRequest in a relative binding");
					}
					["$$aggregation", "$$canonicalPath", "$$sharedRequest"]
						.forEach(function (sForbidden, i) {
							if (sForbidden in mParameters
									&& (i > 0 || _Helper.isDataAggregation(mParameters))) {
								throw new Error("Cannot combine $$getKeepAliveContext and "
									+ sForbidden);
							}
						});
					// falls through
				case "$$canonicalPath":
				case "$$clearSelectionOnFilter":
				case "$$noPatch":
				case "$$ownRequest":
				case "$$patchWithoutSideEffects":
					if (vValue !== true) {
						throw new Error("Unsupported value for binding parameter '" + sKey + "': "
							+ vValue);
					}
					break;
				case "$$separate":
					if (mParameters.$$aggregation) {
						throw new Error("Cannot combine $$aggregation and $$separate");
					}
					break;
				default:
					throw new Error("Unknown binding-specific parameter: " + sKey);
			}
		});
	};

	/**
	 * Throws an error that the response is being ignored if the current cache is not the expected
	 * one. The error has the property <code>canceled : true</code>
	 *
	 * @param {sap.ui.model.odata.v4.lib._Cache} oExpectedCache - The expected cache
	 * @throws {Error} If the current cache is not the expected one
	 *
	 * @private
	 */
	ODataBinding.prototype.checkSameCache = function (oExpectedCache) {
		var oError;

		if (this.oCache !== oExpectedCache) {
			oError = new Error(this + " is ignoring response from inactive cache: "
				+ oExpectedCache);
			oError.canceled = true;
			throw oError;
		}
	};

	/**
	 * Throws an Error if the binding's root binding is suspended.
	 *
	 * @param {boolean} [bIfNoResumeChangeReason]
	 *   Whether to accept a suspended root binding as long as no <code>sResumeChangeReason</code>
	 *   is known for this binding (which must not be a root itself) or any of its dependents
	 * @throws {Error} If the binding's root binding is suspended, except if
	 *   <code>bIfNoResumeChangeReason</code> is used as described
	 *
	 * @private
	 */
	ODataBinding.prototype.checkSuspended = function (bIfNoResumeChangeReason) {
		if (this.isRootBindingSuspended()
				&& (!bIfNoResumeChangeReason || this.isRoot() || this.getResumeChangeReason())) {
			throw new Error("Must not call method when the binding's root binding is suspended: "
				+ this);
		}
	};

	/**
	 * Throws an Error if the binding is {@link #isTransient transient}.
	 *
	 * @throws {Error} If the binding is transient
	 *
	 * @private
	 */
	ODataBinding.prototype.checkTransient = function () {
		if (this.isTransient()) {
			throw new Error("Must not call method when the binding is part of a deep create: "
				+ this);
		}
	};

	/**
	 * Calls {@link #checkUpdateInternal}.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   Whether the change event is fired in any case
	 * @throws {Error}
	 *   If there are unexpected parameters
	 *
	 * @private
	 */
	// @override sap.ui.model.Binding#checkUpdate
	ODataBinding.prototype.checkUpdate = function (bForceUpdate) {
		if (arguments.length > 1) {
			throw new Error("Only the parameter bForceUpdate is supported");
		}

		this.checkUpdateInternal(bForceUpdate).catch(this.oModel.getReporter());
		// do not rethrow, ManagedObject doesn't react on this either
		// throwing an error would cause "Uncaught (in promise)" in Chrome
	};

	/**
	 * A property binding re-fetches its value and fires a change event if the value has changed. A
	 * parent binding checks dependent bindings for updates or refreshes the binding if the resource
	 * path of its parent context changed.
	 *
	 * @param {boolean} [bForceUpdate]
	 *   Whether the change event is fired in any case (only allowed for property bindings)
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a defined result when the check is finished, or
	 *   rejected in case of an error
	 * @throws {Error} If called with illegal parameters
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#checkUpdateInternal
	 * @private
	 * @see #checkUpdate
	 * @see sap.ui.model.Binding#checkUpdate
	 */

	/**
	 * Creates and sets the cache, handles mCacheByResourcePath and adds some cache-relevant
	 * properties.
	 *
	 * @param {object} mQueryOptions
	 *   The cache query options; the options of oModel.mUriParameters are added
	 * @param {string} sResourcePath
	 *   The resource path
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, undefined for absolute bindings
	 * @param {string} [sGroupId]
	 *   The group ID used for a side-effects refresh, if applicable
	 * @param {sap.ui.model.odata.v4.lib._Cache} [oOldCache]
	 *   The old cache, in case it may be reused
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The cache or <code>null</code> if the binding is relative and the given context is
	 *   transient
	 *
	 * @private
	 */
	ODataBinding.prototype.createAndSetCache = function (mQueryOptions, sResourcePath, oContext,
			sGroupId, oOldCache) {
		var oCache, sDeepResourcePath, iGeneration;

		this.mCacheQueryOptions = Object.assign({}, this.oModel.mUriParameters, mQueryOptions);
		if (this.bRelative) { // quasi-absolute or relative binding
			// mCacheByResourcePath has to be reset if parameters are changing
			oCache = this.mCacheByResourcePath && this.mCacheByResourcePath[sResourcePath];
			iGeneration = oContext.getGeneration && oContext.getGeneration() || 0;
			if (oCache && oCache.$generation >= iGeneration) {
				oCache.setActive(true);
			} else {
				sDeepResourcePath = this.oModel.resolve(this.sPath, oContext).slice(1);
				oCache = this.doCreateCache(sResourcePath, this.mCacheQueryOptions, oContext,
					sDeepResourcePath, sGroupId, oOldCache);
				if (!(this.mParameters && this.mParameters.$$sharedRequest)) {
					this.mCacheByResourcePath ??= {};
					this.mCacheByResourcePath[sResourcePath] = oCache;
				}
				oCache.$deepResourcePath = sDeepResourcePath;
				oCache.$generation = iGeneration;
			}
		} else { // absolute binding
			oCache = this.doCreateCache(sResourcePath, this.mCacheQueryOptions, undefined,
				undefined, sGroupId, oOldCache);
		}
		if (oOldCache && oOldCache !== oCache) {
			this.deregisterChangeListener();
			oOldCache.setActive(false);
		}
		if (this.mLateQueryOptions) {
			oCache.setLateQueryOptions(this.mLateQueryOptions);
		}
		this.oCache = oCache;

		return oCache;
	};

	/**
	 * Deregisters the binding using the function it got via {@link #setDeregisterChangeListener}.
	 *
	 * @private
	 */
	ODataBinding.prototype.deregisterChangeListener = function () {
		this.fnDeregisterChangeListener?.();
		this.fnDeregisterChangeListener = undefined;
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @since 1.66
	 */
	ODataBinding.prototype.destroy = function () {
		this.mCacheByResourcePath = undefined;
		this.deregisterChangeListener();
		this.oCachePromise.then(function (oOldCache) {
			oOldCache?.setActive(false);
		}, function () {});
		this.oCache = null;
		this.oCachePromise = SyncPromise.resolve(null); // be nice to #withCache
		this.mCacheQueryOptions = undefined;
		// resolving functions e.g. for oReadPromise in #checkUpdateInternal may run after destroy
		// of this binding and must not access the context
		this.oContext = undefined;
		this.oFetchCacheCallToken = undefined;
	};

	/**
	 * Hook method for {@link sap.ui.model.odata.v4.ODataBinding#fetchCache} to create a cache for
	 * this binding with the given resource path and query options.
	 *
	 * @param {string} sResourcePath
	 *   The resource path, for example "EMPLOYEES"
	 * @param {object} mQueryOptions
	 *   The query options
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be <code>undefined</code> for absolute bindings
	 * @param {string} [sDeepResourcePath=sResourcePath]
	 *   The deep resource path to be used to build the target path for bound messages
	 * @param {string} [sGroupId]
	 *   The group ID used for a side-effects refresh, if applicable
	 * @param {sap.ui.model.odata.v4.lib._Cache} [oOldCache]
	 *   The old cache, in case it may be reused
	 * @returns {sap.ui.model.odata.v4.lib._Cache}
	 *   The new cache instance
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 * @private
	 */

	/**
	 * Hook method for {@link #fetchOrGetQueryOptionsForOwnCache} to determine the query options for
	 * this binding.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used for a relative binding
	 * @returns {object|undefined|sap.ui.base.SyncPromise}
	 *   The binding's query options (if any) or a promise resolving with them
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#doFetchOrGetQueryOptions
	 * @private
	 */

	/**
	 * @override
	 * @see sap.ui.base.EventProvider#getEventingParent
	 */
	ODataBinding.prototype.getEventingParent = function () {
		// this allows that dataRequested/dataReceived events are bubbled up to the model
		return this.oModel;
	};

	/**
	 * Creates a cache for this binding if a cache is needed and updates <code>oCachePromise</code>.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, may be undefined for absolute bindings
	 * @param {boolean} [bIgnoreParentCache]
	 *   Whether the parent cache is ignored and a new cache shall be created. This is for example
	 *   needed during the resume process in case this binding has changed but its parent
	 *   binding has not (see {@link sap.ui.model.odata.v4.ODataListBinding#resumeInternal})
	 * @param {boolean} [bKeepQueryOptions]
	 *   Whether to keep existing (late) query options and not to run auto-$expand/$select again
	 *   (cannot be combined with <code>bIgnoreParentCache</code>!)
	 * @param {string} [sGroupId]
	 *   The group ID used for a side-effects refresh, if applicable
	 * @throws {Error}
	 *   If auto-$expand/$select is still running and query options shall be kept (this case is just
	 *   not yet implemented and should not be needed)
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchCache = function (oContext, bIgnoreParentCache, bKeepQueryOptions,
			sGroupId) {
		var oCache = this.oCache,
			oCallToken = {
				// propagate old cache from first call of fetchCache to the latest call
				oOldCache : oCache === undefined ? this.oFetchCacheCallToken.oOldCache : oCache
			},
			aPromises,
			that = this;

		if (!this.bRelative) {
			oContext = undefined;
		}

		if (!oCache && bKeepQueryOptions) {
			if (oCache === undefined) {
				throw new Error("Unsupported bKeepQueryOptions while oCachePromise is pending");
			}
			return;
		}

		this.oCache = undefined;
		this.oFetchCacheCallToken = oCallToken;
		if (bKeepQueryOptions) {
			// asynchronously re-create an equivalent cache, but skip auto-$expand/$select
			this.oCachePromise = SyncPromise.resolve(Promise.resolve()).then(function () {
				return that.createAndSetCache(that.mCacheQueryOptions, oCache.getResourcePath(),
					oContext, sGroupId, oCache);
			});
			return;
		}

		aPromises = [
			this.fetchOrGetQueryOptionsForOwnCache(oContext, bIgnoreParentCache),
			this.oModel.oRequestor.ready()
		];
		this.mCacheQueryOptions = undefined;
		this.oCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var mQueryOptions = aResult[0].mQueryOptions;

			if (aResult[0].sReducedPath) {
				that.sReducedPath = aResult[0].sReducedPath;
			}

			// If there are mQueryOptions, the binding must create a cache. Do not create a cache
			// for a virtual context or if below a transient context
			if (!that.prepareDeepCreate(oContext, mQueryOptions)) {
				return that.fetchResourcePath(oContext).then(function (sResourcePath) {
					// create cache only for the latest call to fetchCache
					if (that.oFetchCacheCallToken !== oCallToken) {
						// a previous call waits for the current one to finish
						return that.oCachePromise.then(function (oNewCache) {
							// the previous call must fail if a new cache was created
							if (oNewCache === oCallToken.oOldCache) {
								return oNewCache;
							}
							const oError
								= new Error("Cache discarded as a new cache has been created");
							oError.canceled = true;
							throw oError;
						});
					}
					return that.oModel.waitForKeepAliveBinding(that).then(function () {
						that.oFetchCacheCallToken = undefined; // cleanup
						return that.createAndSetCache(mQueryOptions, sResourcePath, oContext,
							sGroupId, oCallToken.oOldCache);
					});
				});
			}

			oCallToken.oOldCache = undefined; // cleanup own token only
			if (oCache) {
				oCache.setActive(false);
			}
			that.oCache = null;
			return null;
		});
		// Note: this happens if the promise to read data for the canonical path's
		// key predicate is rejected with a canceled error or the cache creation failed (e.g. in
		// case the cache has been discarded because a new cache has been created).
		this.oCachePromise.catch(this.oModel.getReporter());
	};

	/**
	 * Fetches the query options to create the cache for this binding and the binding's reduced
	 * path.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be undefined for absolute bindings
	 * @param {boolean} [bIgnoreParentCache]
	 *   Whether the query options of the parent cache shall be ignored and own query options are
	 *   determined (see {@link #fetchCache})
	 * @returns {object|sap.ui.base.SyncPromise}
	 *   An object having two properties (or a promise resolving with it):
	 *   {object} mQueryOptions - The query options to create the cache for this binding or
	 *     <code>undefined</code> if no cache is to be created
	 *   {string} sReducedPath - The binding's absolute, reduced path in the cache hierarchy
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchOrGetQueryOptionsForOwnCache = function (oContext,
			bIgnoreParentCache) {
		var bHasNonSystemQueryOptions,
			vQueryOptions, // {object|undefined|sap.ui.base.SyncPromise}
			sResolvedPath = this.oModel.resolve(this.sPath, oContext),
			that = this;

		/*
		 * Wraps the given query options and adds sReducedPath to create a result for
		 * #fetchOrGetQueryOptionsForOwnCache.
		 *
		 * @param {object} [mQueryOptions]
		 *   Map of query options, or <code>undefined</code>
		 * @param {boolean} [bDropEmptyObject]
		 *   Whether an empty query options object should be replaced by <code>undefined</code>
		 * @param {string} [sReducedPath=sResolvedPath]
		 *   The reduced path
		 * @returns {object}
		 *   A result for #fetchOrGetQueryOptionsForOwnCache
		 */
		function _wrapQueryOptions(mQueryOptions, bDropEmptyObject, sReducedPath) {
			if (bDropEmptyObject && mQueryOptions && _Helper.isEmptyObject(mQueryOptions)) {
				mQueryOptions = undefined;
			}
			return {
				mQueryOptions : mQueryOptions,
				sReducedPath : sReducedPath || sResolvedPath
			};
		}

		/*
		 * Waits for <code>vQueryOptions</code> (if needed) and then creates a result for
		 * #fetchOrGetQueryOptionsForOwnCache.
		 *
		 * @param {boolean} [bDropEmptyObject]
		 *   Whether an empty query options object should be replaced by <code>undefined</code>
		 * @param {string} [sReducedPath=sResolvedPath]
		 *   The reduced path
		 * @returns {object|sap.ui.base.SyncPromise}
		 *   A result for #fetchOrGetQueryOptionsForOwnCache
		 */
		function wrapQueryOptions(bDropEmptyObject, sReducedPath) {
			if (vQueryOptions instanceof SyncPromise) {
				if (!vQueryOptions.isFulfilled()) {
					return vQueryOptions.then(function (mQueryOptions) {
						return _wrapQueryOptions(mQueryOptions, bDropEmptyObject, sReducedPath);
					});
				}
				vQueryOptions = vQueryOptions.getResult();
			}

			return _wrapQueryOptions(vQueryOptions, bDropEmptyObject, sReducedPath);
		}

		if (this.oOperation // operation binding manages its cache on its own
			|| !sResolvedPath // unresolved binding
			|| this.isMeta()) {
			return _wrapQueryOptions();
		}

		// auto-$expand/$select and binding is a parent binding, so that it needs to wait until all
		// its child bindings know via the corresponding promise in this.aChildCanUseCachePromises
		// if they can use the parent binding's cache
		// With $$aggregation, no auto-$expand/$select is needed
		vQueryOptions = this.doFetchOrGetQueryOptions(oContext);
		if (this.oModel.bAutoExpandSelect && this.aChildCanUseCachePromises
				&& !_Helper.isDataAggregation(this.mParameters)) {
			// For auto-$expand/$select, wait for query options of dependent bindings:
			// Promise.resolve() ensures all dependent bindings are created and have sent their
			// query options promise to this binding via fetchIfChildCanUseCache.
			// The aggregated query options of this binding and its dependent bindings are available
			// in that.mAggregatedQueryOptions once all these promises are fulfilled.
			vQueryOptions = SyncPromise.all([
				vQueryOptions,
				Promise.resolve().then(function () {
					return SyncPromise.all(that.aChildCanUseCachePromises);
				})
			]).then(function (aResult) {
				that.aChildCanUseCachePromises = [];
				that.updateAggregatedQueryOptions(aResult[0]);
				return that.mAggregatedQueryOptions;
			});
		}

		// parent cache is ignored or (quasi-)absolute binding
		if (bIgnoreParentCache || !this.bRelative || !oContext.fetchValue) {
			// the binding shall create its own cache
			return wrapQueryOptions();
		}

		// auto-$expand/$select: Use parent binding's cache if possible
		if (this.oModel.bAutoExpandSelect) {
			bHasNonSystemQueryOptions = this.mParameters
				&& Object.keys(that.mParameters).some(function (sKey) {
					return sKey[0] !== "$" || sKey[1] === "$";
				});
			if (bHasNonSystemQueryOptions) {
				return wrapQueryOptions();
			}
			return oContext.getBinding()
				.fetchIfChildCanUseCache(oContext, that.sPath, vQueryOptions,
					!this.mParameters) // duck typing for property binding
				.then(function (sReducedPath) {
					if (sReducedPath) {
						vQueryOptions = undefined;
					} else { // fetchCache only creates a cache if there are query options
						vQueryOptions ??= {};
					}
					return wrapQueryOptions(false, sReducedPath);
				});
		}

		// relative list or context binding with parameters which are not query options
		// (such as $$groupId)
		if (this.mParameters && !_Helper.isEmptyObject(this.mParameters)) {
			return wrapQueryOptions();
		}

		// relative binding which may have query options from UI5 filter or sorter objects
		return wrapQueryOptions(true);
	};

	/**
	 * Fetches the OData resource path for this binding using the given context.
	 * If '$$canonicalPath' is set or the context's path contains indexes, the resource path uses
	 * the context's canonical path, otherwise it uses the context's path.
	 *
	 * @param {sap.ui.model.Context|sap.ui.model.odata.v4.Context} [oContext=this.oContext]
	 *   A context; if omitted, the binding's context is used
	 * @returns {sap.ui.base.SyncPromise} A promise resolving with the resource path or
	 *   <code>undefined</code> for an unresolved binding. If computation of the canonical path
	 *   fails, the promise is rejected.
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchResourcePath = function (oContext) {
		var bCanonicalPath,
			sContextPath,
			oContextPathPromise,
			that = this;

		if (!this.bRelative) {
			return SyncPromise.resolve(this.sPath.slice(1));
		}
		oContext ??= this.oContext;
		if (!oContext) {
			return SyncPromise.resolve();
		}

		sContextPath = oContext.getPath();
		bCanonicalPath = oContext.fetchCanonicalPath
			&& (this.mParameters && this.mParameters.$$canonicalPath
				|| !this.isTransient() && rIndexOrTransientPredicate.test(sContextPath));
		oContextPathPromise = bCanonicalPath
			? oContext.fetchCanonicalPath()
			: SyncPromise.resolve(sContextPath);

		return oContextPathPromise.then(function (sContextResourcePath) {
			return _Helper.buildPath(sContextResourcePath, that.sPath).slice(1);
		});
	};

	/**
	 * Fires the 'dataReceived' event. The event is bubbled up to the model, unless it is prevented.
	 *
	 * @param {object} oParameters
	 *   The event parameters
	 * @param {object} [oParameters.data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oParameters.error]
	 *   The error object if a back-end request failed.
	 * @param {boolean} [bPreventBubbling]
	 *   Whether to prevent bubbling this event to the model
	 *
	 * @private
	 */
	 // @override sap.ui.model.Binding#fireDataReceived
	ODataBinding.prototype.fireDataReceived = function (oParameters, bPreventBubbling) {
		this.fireEvent("dataReceived", oParameters, /*bAllowPreventDefault*/false,
			/*bEnableEventBubbling*/!bPreventBubbling);
	};

	/**
	 * Fires the 'dataRequested' event. The event is bubbled up to the model, unless it is
	 * prevented.
	 *
	 * @param {boolean} [bPreventBubbling]
	 *   Whether to prevent bubbling this event to the model
	 *
	 * @private
	 */
	 // @override sap.ui.model.Binding#fireDataRequested
	ODataBinding.prototype.fireDataRequested = function (bPreventBubbling) {
		this.fireEvent("dataRequested", undefined, /*bAllowPreventDefault*/false,
			/*bEnableEventBubbling*/!bPreventBubbling);
	};

	/**
	 * Returns all bindings which have this binding as parent binding.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataBinding[]}
	 *   A list of dependent bindings, never <code>null</code>
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 * @private
	 */

	/**
	 * Returns the group ID of the binding that is used for read requests. The group ID of the
	 * binding is alternatively defined by
	 * <ul>
	 *   <li> the <code>groupId</code> parameter of the OData model; see
	 *     {@link sap.ui.model.odata.v4.ODataModel#constructor},
	 *   <li> the <code>$$groupId</code> binding parameter; see
	 *     {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *     {@link sap.ui.model.odata.v4.ODataModel#bindContext}.
	 * </ul>
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @public
	 * @since 1.81.0
	 */
	ODataBinding.prototype.getGroupId = function () {
		return this.sGroupId
			|| (this.bRelative && this.oContext && this.oContext.getGroupId
					&& this.oContext.getGroupId())
			|| this.oModel.getGroupId();
	};

	/**
	 * Returns the relative path for a given absolute path by stripping off the binding's resolved
	 * path or the path of the binding's return value context. Returns relative paths unchanged.
	 * The binding must be resolved to call this function.
	 *
	 * Note that the resulting path may start with a key predicate.
	 *
	 * Example: (The binding's resolved path is "/foo/bar"):
	 * "baz" -> "baz"
	 * "/foo/bar/baz" -> "baz"
	 * "/foo/bar('baz')" -> "('baz')"
	 * "/foo" -> undefined
	 *
	 * @param {string} sPath
	 *   A path (absolute or relative to this binding)
	 * @returns {string|undefined}
	 *   The given path, if it is already relative; otherwise the path relative to the binding's
	 *   resolved path or return value context path; <code>undefined</code> if the path does not
	 *   start with either of these paths.
	 *
	 * @private
	 */
	ODataBinding.prototype.getRelativePath = function (sPath) {
		var sRelativePath;

		if (sPath[0] === "/") {
			sRelativePath = _Helper.getRelativePath(sPath, this.getResolvedPath());
			if (sRelativePath === undefined && this.oReturnValueContext) {
				sRelativePath = _Helper.getRelativePath(sPath, this.oReturnValueContext.getPath());
			}
			return sRelativePath;
		}
		return sPath;
	};

	/**
	 * Returns the "strongest" change reason that {@link #resume} would fire for this binding or any
	 * of its dependents.
	 *
	 * @returns {sap.ui.model.ChangeReason|undefined}
	 *   The "strongest" change reason, or <code>undefined</code>
	 *
	 * @private
	 * @see #getDependentBindings
	 * @see #setResumeChangeReason
	 */
	ODataBinding.prototype.getResumeChangeReason = function () {
		var sStrongestChangeReason = this.sResumeChangeReason;

		this.getDependentBindings().forEach(function (oDependentBinding) {
			var sDependentChangeReason = oDependentBinding.getResumeChangeReason();

			if (sDependentChangeReason
					&& hasPrecedenceOver(sDependentChangeReason, sStrongestChangeReason)) {
				sStrongestChangeReason = sDependentChangeReason;
			}
		});

		return sStrongestChangeReason;
	};

	/**
	 * Returns a promise which resolves as soon as this binding is resumed.
	 *
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   This binding's current promise for {@link sap.ui.model.odata.v4.ODataParentBinding#resume},
	 *   or <code>undefined</code> in case it is not currently suspended.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#getResumePromise
	 * @private
	 * @see sap.ui.model.Binding#isSuspended
	 */

	/**
	 * Returns the root binding of this binding's hierarchy, see
	 * {@link topic:fccfb2eb41414f0792c165e69a878717 Initialization and Read Requests}.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|
	 *      sap.ui.model.odata.v4.ODataPropertyBinding|undefined}
	 *   The root binding or <code>undefined</code> if this binding is unresolved (see
	 *   {@link sap.ui.model.Binding#isResolved}).
	 *
	 * @public
	 * @since 1.53.0
	 */
	ODataBinding.prototype.getRootBinding = function () {
		if (this.bRelative) {
			if (!this.oContext) {
				return undefined;
			}
			if (this.oContext.getBinding) {
				return this.oContext.getBinding().getRootBinding();
			}
		}
		return this;
	};

	/**
	 * Returns a promise which resolves as soon as this binding's root binding is resumed.
	 *
	 * @returns {sap.ui.base.SyncPromise}
	 *   The root binding's current promise for {@link #resume}, or
	 *   <code>SyncPromise.resolve()</code> in case we have no root binding or it is not currently
	 *   suspended.
	 *
	 * @private
	 * @see #checkSuspended
	 * @see #getResumePromise
	 * @see #isRootBindingSuspended
	 */
	ODataBinding.prototype.getRootBindingResumePromise = function () {
		var oRootBinding = this.getRootBinding();

		return oRootBinding && oRootBinding.getResumePromise() || SyncPromise.resolve();
	};

	/**
	 * Returns the group ID of the binding that is used for update requests. The update group ID of
	 * the binding is alternatively defined by
	 * <ul>
	 *  <li> the <code>updateGroupId</code> parameter of the OData model; see
	 *    {@link sap.ui.model.odata.v4.ODataModel#constructor},
	 *  <li> the <code>$$updateGroupId</code> binding parameter; see
	 *    {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *    {@link sap.ui.model.odata.v4.ODataModel#bindContext}.
	 * </ul>
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @public
	 * @since 1.81.0
	 */
	ODataBinding.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId
			|| (this.bRelative && this.oContext && this.oContext.getUpdateGroupId
					&& this.oContext.getUpdateGroupId())
			|| this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if this binding or its dependent bindings have property changes,
	 * created entities, or entity deletions which have not been sent successfully to the server.
	 * This function does not take the invocation of OData operations
	 * (see {@link sap.ui.model.odata.v4.ODataContextBinding#invoke}) into account. Since 1.98.0,
	 * {@link sap.ui.model.odata.v4.Context#isInactive inactive} contexts are ignored, unless
	 * (since 1.100.0) their
	 * {@link sap.ui.model.odata.v4.ODataListBinding#event:createActivate activation} has been
	 * prevented and {@link sap.ui.model.odata.v4.Context#isInactive} therefore returns
	 * <code>1</code>.
	 *
	 * Note: If this binding is relative, its data is cached separately for each parent context
	 * path. This method returns <code>true</code> if there are pending changes for the current
	 * parent context path of this binding. If this binding is unresolved (see
	 * {@link sap.ui.model.Binding#isResolved}), it returns <code>false</code>.
	 *
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by APIs like
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#changeParameters changeParameters},
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#filter filter},
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#refresh refresh} (since 1.100.0),
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#sort sort}, or
	 *   {@link sap.ui.model.odata.v4.ODataListBinding#suspend suspend} because they relate to a
	 *   {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive} (since 1.97.0) or
	 *   {@link sap.ui.model.odata.v4.Context#delete deleted} (since 1.108.0) context of this
	 *   binding. Since 1.98.0, {@link sap.ui.model.odata.v4.Context#isTransient transient}
	 *   contexts of a {@link #getRootBinding root binding} are treated as kept alive by this flag.
	 *   Since 1.99.0, the same happens for bindings using the <code>$$ownRequest</code> parameter
	 *   (see {@link sap.ui.model.odata.v4.ODataModel#bindList}).
	 * @returns {boolean}
	 *   <code>true</code> if the binding is resolved and has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataBinding.prototype.hasPendingChanges = function (bIgnoreKeptAlive) {
		return this._hasPendingChanges(bIgnoreKeptAlive);
	};

	/**
	 * Checks whether there are pending changes for the given path in the binding's cache (which may
	 * be inherited from the parent).
	 *
	 * @param {string} sPath
	 *   The path (absolute or relative to this binding)
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by APIs like sort or filter because they
	 *   relate to a deleted context or a context which is kept alive
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes for the path
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesForPath = function (sPath, bIgnoreKeptAlive) {
		return this.withCache(function (oCache, sCachePath, oBinding) {
				return oCache.hasPendingChangesForPath(sCachePath, bIgnoreKeptAlive,
					bIgnoreKeptAlive && (oBinding.isRoot() || oBinding.mParameters.$$ownRequest));
			}, sPath, true).unwrap();
	};

	/**
	 * Checks whether there are pending changes in caches stored by resource path at this binding
	 * which have the given resource path as prefix. Called for unresolved bindings only.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix to identify the relevant caches
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes in caches
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesInCaches = function (sResourcePathPrefix) {
		var that = this;

		if (!this.mCacheByResourcePath) {
			return false;
		}
		return Object.keys(this.mCacheByResourcePath).some(function (sResourcePath) {
			var oCache = that.mCacheByResourcePath[sResourcePath];

			return oCache.$deepResourcePath.startsWith(sResourcePathPrefix)
				&& oCache.hasPendingChangesForPath("");
		});
	};

	/**
	 * Returns whether any dependent binding of this binding has pending changes
	 *
	 * @param {boolean} [bIgnoreKeptAlive]
	 *   Whether to ignore changes which will not be lost by APIs like sort or filter because they
	 *   relate to a deleted context or a context which is kept alive
	 * @param {boolean} [sPathPrefix]
	 *   If supplied, only caches having a resource path starting with <code>sPathPrefix</code> are
	 *   checked
	 * @returns {boolean}
	 *   <code>true</code> if this binding has pending changes
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#hasPendingChangesInDependents
	 * @private
	 */

	/**
	 * Method not supported
	 *
	 * @returns {boolean}
	 * @throws {Error}
	 *
	 * @public
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#isInitial
	ODataBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: isInitial");
	};

	/**
	 * Returns whether the binding points to metadata.
	 *
	 * @returns {boolean} - Whether the binding points to metadata
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#isMeta
	 * @private
	 */

	/**
	 * Returns whether the binding is absolute or quasi-absolute.
	 *
	 * @returns {boolean} Whether the binding is absolute or quasi-absolute
	 *
	 * @private
	 */
	ODataBinding.prototype.isRoot = function () {
		return !this.bRelative || this.oContext && !this.oContext.getBinding;
	};

	/**
	 * Tells whether the binding's root binding is suspended.
	 *
	 * @returns {boolean} Whether the binding's root binding is suspended
	 *
	 * @private
	 */
	ODataBinding.prototype.isRootBindingSuspended = function () {
		var oRootBinding = this.getRootBinding();

		return oRootBinding && oRootBinding.isSuspended();
	};

	/**
	 * Whether the binding is transient (relative to a transient context).
	 *
	 * @returns {boolean} Whether the binding is transient
	 *
	 * @private
	 */
	ODataBinding.prototype.isTransient = function () {
		return this.sReducedPath && this.sReducedPath.includes("($uid=");
	};

	/**
	 * Creates a lock for a group with this binding as owner.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID; defaults to this binding's (update) group ID
	 * @param {boolean} [bLocked]
	 *   Whether the created lock is locked
	 * @param {boolean} [bModifying]
	 *   Whether the reason for the group lock is a modifying request
	 * @param {function} [fnCancel]
	 *   Function that is called when the group lock is canceled
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.ODataModel#lockGroup
	 */
	ODataBinding.prototype.lockGroup = function (sGroupId, bLocked, bModifying, fnCancel) {
		sGroupId ??= (bModifying ? this.getUpdateGroupId() : this.getGroupId());
		return this.oModel.lockGroup(sGroupId, this, bLocked, bModifying, fnCancel);
	};

	/**
	 * Reacts on a delete of an entity via the model. If a context of this binding has the given
	 * canonical path it is destroyed.
	 *
	 * @param {string} sCanonicalPath
	 *   The canonical path of the entity (as a context path with the leading "/")
	 *
	 * @name sap.ui.model.odata.v4.ODataBinding#onDelete
	 * @private
	 */

	/**
	 * Prepares the binding for a deep create if there is a transient parent context. The default
	 * implementation only checks whether a cache may be created, and keeps the mQueryOptions for
	 * a later cache creation when below a transient context.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The parent context or <code>undefined</code> for absolute bindings
	 * @param {object} mQueryOptions
	 *   The binding's cache query options
	 * @returns {boolean}
	 *   Whether the binding must not create a cache, because the context is virtual or transient or
	 *   below a transient context, or there are no query options for a cache
	 *
	 * @private
	 */
	ODataBinding.prototype.prepareDeepCreate = function (oContext, mQueryOptions) {
		if (oContext) {
			if (oContext.iIndex === Context.VIRTUAL) {
				return true; // virtual parent => no cache
			}
			if (oContext.getPath().includes("($uid=")) {
				// below a transient context => no cache, but keep the query options for a later
				// creation in #adjustPredicate
				this.mCacheQueryOptions = mQueryOptions;
				return true;
			}
		}
		return !mQueryOptions;
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 *
	 * Refresh is supported for bindings which are not relative to an
	 * {@link sap.ui.model.odata.v4.Context}, as well as (since 1.122.0) for bindings with the
	 * <code>$$ownRequest</code> parameter (see {@link sap.ui.model.odata.v4.ODataModel#bindList}
	 * and {@link sap.ui.model.odata.v4.ODataModel#bindContext})
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request initiated by
	 * the last call determines the binding's data; it is <b>independent</b> of the order of calls
	 * to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given group ID.
	 *
	 * If there are pending changes that cannot be ignored, an error is thrown. Use
	 * {@link #hasPendingChanges} to check if there are such pending changes. If there are, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #refresh}.
	 *
	 * Use {@link #requestRefresh} if you want to wait for the refresh.
	 *
	 * @param {string|boolean} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the binding's group ID is used, see
	 *   {@link #getGroupId}. For suspended bindings, only the binding's group ID is supported
	 *   because {@link #resume} uses the binding's group ID. A value of type boolean is not
	 *   accepted and an error will be thrown (a forced refresh is not supported).
	 *
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the given group ID is invalid,
	 *     <li> refresh on this binding is not supported,
	 *     <li> a group ID different from the binding's group ID is specified for a suspended
	 *       binding,
	 *     <li> a value of type <code>boolean</code> is given,
	 *     <li> or there are pending changes that cannot be ignored.
	 *   </ul>
	 *   The following pending changes are ignored:
	 *   <ul>
	 *     <li> changes relating to a {@link sap.ui.model.odata.v4.Context#isKeepAlive kept-alive}
	 *       context of this binding (since 1.97.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#isTransient transient} contexts of a
	 *       {@link #getRootBinding root binding} (since 1.98.0),
	 *     <li> {@link sap.ui.model.odata.v4.Context#delete deleted} contexts (since 1.108.0).
	 *   </ul>
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @see #getRootBinding
	 * @see #suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#refresh
	ODataBinding.prototype.refresh = function (sGroupId) {
		if (typeof sGroupId === "boolean") {
			throw new Error("Unsupported parameter bForceUpdate");
		}
		this.requestRefresh(sGroupId).catch(this.oModel.getReporter());
	};

	/**
	 * Refreshes the binding. The refresh method itself only performs some validation checks and
	 * forwards to this method doing the actual work. Interaction between contexts also runs via
	 * these internal methods.
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
	 *   A promise which is resolved without a defined result when the refresh is finished, or
	 *   rejected when the refresh fails; the promise is resolved immediately on a suspended binding
	 * @throws {Error}
	 *   If the binding's root binding is suspended and a group ID different from the binding's
	 *   group ID is given
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 * @private
	 */

	/**
	 * Refreshes the binding; expects it to be suspended.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for the refresh
	 * @throws {Error}
	 *   If a group ID different from the binding's group ID is given

	 * @private
	 */
	ODataBinding.prototype.refreshSuspended = function (sGroupId) {
		if (sGroupId && sGroupId !== this.getGroupId()) {
			throw new Error(this + ": Cannot refresh a suspended binding with group ID '"
				+ sGroupId + "' (own group ID is '" + this.getGroupId() + "')");
		}
		this.setResumeChangeReason(ChangeReason.Refresh);
	};

	/**
	 * Remove this binding's caches and non-persistent messages. The binding's active cache removes
	 * only its own messages. Inactive caches with a deep resource path starting with the given
	 * resource path prefix are removed and they also remove only their own messages.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete inactive caches and their messages; may be
	 *   "" but not <code>undefined</code>
	 * @param {boolean} [bCachesOnly] Whether to keep messages untouched
	 *
	 * @private
	 */
	ODataBinding.prototype.removeCachesAndMessages = function (sResourcePathPrefix, bCachesOnly) {
		var that = this;

		if (!bCachesOnly && this.oCache) {
			this.oCache.removeMessages();
		}
		if (this.mCacheByResourcePath) {
			Object.keys(this.mCacheByResourcePath).forEach(function (sResourcePath) {
				var oCache = that.mCacheByResourcePath[sResourcePath],
					sDeepResourcePath = oCache.$deepResourcePath;

				if (_Helper.hasPathPrefix(sDeepResourcePath, sResourcePathPrefix)) {
					if (!bCachesOnly) {
						oCache.removeMessages();
					}
					delete that.mCacheByResourcePath[sResourcePath];
				}
			});
		}
	};

	/**
	 * Requests side effects for the given absolute paths.
	 *
	 * @param {string} sGroupId
	 *   The effective group ID
	 * @param {string[]} aAbsolutePaths
	 *   The absolute paths to request side effects for
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise which is resolved without a defined result, or rejected with an error if loading
	 *   of side effects fails, or <code>undefined</code> if there is nothing to do
	 *
	 * @private
	 */
	ODataBinding.prototype.requestAbsoluteSideEffects = function (sGroupId, aAbsolutePaths) {
		var aPaths = [],
			sMetaPath = _Helper.getMetaPath(this.getResolvedPath());

		aAbsolutePaths.some(function (sAbsolutePath) {
			var sRelativePath = _Helper.getRelativePath(sAbsolutePath, sMetaPath);

			if (sRelativePath !== undefined) {
				aPaths.push(sRelativePath);
			} else if (_Helper.hasPathPrefix(sMetaPath, sAbsolutePath)) {
				aPaths = [""]; // "refresh"
				return true; // break
			}
		});

		if (aPaths.length) {
			if (this.requestSideEffects) {
				return this.requestSideEffects(sGroupId, aPaths);
			}
			return this.refreshInternal("", sGroupId, true, true);
		}
		// return undefined;
	};

	/**
	 * Refreshes the binding and returns a promise to wait for it. See {@link #refresh} for details.
	 * Use {@link #refresh} if you do not need the promise.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result when the refresh is finished, or
	 *   rejected with an error if the refresh failed
	 * @throws {Error}
	 *   See {@link #refresh} for details
	 *
	 * @public
	 * @since 1.87.0
	 */
	ODataBinding.prototype.requestRefresh = function (sGroupId) {
		if (!this.mParameters?.$$ownRequest && !this.isRoot()) {
			throw new Error("Refresh on this binding is not supported");
		}
		if (this.hasPendingChanges(true)) {
			throw new Error("Cannot refresh due to pending changes");
		}
		_Helper.checkGroupId(sGroupId);

		// The actual refresh is specific to the binding and is implemented in each binding class.
		return Promise.resolve(this.refreshInternal("", sGroupId, true)).then(function () {
			// return undefined
		});
	};

	/**
	 * Resets all pending changes of this binding, see {@link #hasPendingChanges}. Resets also
	 * invalid user input.
	 *
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result as soon as all changes in the binding
	 *   itself and all dependent bindings are canceled (since 1.72.0)
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the binding's root binding is suspended,
	 *     <li> there is a change of this binding which has been sent to the server and for which
	 *       there is no response yet,
	 *     <li> the binding is {@link #isTransient transient} (part of a
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#create deep create}).
	 *   </ul>
	 *
	 * @public
	 * @since 1.40.1
	 */
	ODataBinding.prototype.resetChanges = function () {
		this.checkTransient();
		return this._resetChanges();
	};

	/**
	 * Resets pending changes for the given path in the binding's cache (which may be inherited from
	 * the parent).
	 *
	 * @param {string} sPath
	 *   The path (absolute or relative to this binding)
	 * @param {sap.ui.base.SyncPromise[]} aPromises
	 *   List of promises which is extended for each call to {@link #resetChangesForPath}
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesForPath = function (sPath, aPromises) {
		aPromises.push(this.withCache(function (oCache, sCachePath) {
				oCache.resetChangesForPath(sCachePath);
			}, sPath).unwrap());
	};

	/**
	 * Resets pending changes in all dependent bindings.
	 *
	 * @param {sap.ui.base.SyncPromise[]} aPromises
	 *   List of promises which is extended for each call to {@link #resetChangesInDependents}.
	 * @param {boolean} [sPathPrefix]
	 *   If supplied, only caches having a resource path starting with <code>sPathPrefix</code> are
	 *   reset
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#resetChangesInDependents
	 * @private
	 */

	/**
	 * A method to reset invalid data state, to be called by {@link #resetChanges}.
	 * Does nothing, because only property bindings have data state.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetInvalidDataState = function () {};

	/**
	 * Sets the function to deregister the binding as change listener again. Called back when
	 * registering it as a change listener.
	 *
	 * @param {function} fnDeregisterChangeListener - the function to deregister
	 *
	 * @private
	 * @see #deregisterChangeListener
	 */
	ODataBinding.prototype.setDeregisterChangeListener = function (fnDeregisterChangeListener) {
		this.fnDeregisterChangeListener = fnDeregisterChangeListener;
	};

	/**
	 * Sets the change reason that {@link #resume} fires. If there are multiple changes, the
	 * "strongest" change reason wins: Filter > Sort > Refresh > Change.
	 *
	 * @param {sap.ui.model.ChangeReason} sChangeReason
	 *   The change reason
	 *
	 * @private
	 */
	ODataBinding.prototype.setResumeChangeReason = function (sChangeReason) {
		if (hasPrecedenceOver(sChangeReason, this.sResumeChangeReason)) {
			this.sResumeChangeReason = sChangeReason;
		}
	};

	/**
	 * Returns a string representation of this object including the binding path. If the binding is
	 * relative, the parent path is also given, separated by a '|'.
	 *
	 * @returns {string} A string description of this binding
	 * @public
	 * @since 1.37.0
	 */
	ODataBinding.prototype.toString = function () {
		return this.getMetadata().getName() + ": " + (this.bRelative ? this.oContext + "|" : "")
			+ this.sPath;
	};

	/**
	 * Recursively updates all dependent bindings after a create.
	 *
	 * @param {boolean} bSkipRefresh
	 *   Whether the application wants to skip the automatic refresh
	 * @param {string} sGroupId
	 *   The group ID for missing properties requests
	 * @returns {sap.ui.base.SyncPromise|undefined}
	 *   A promise which is resolved without a defined result when the update is finished, or
	 *   rejected with an error if something went wrong; or <code>undefined</code> if there is no
	 *   need to wait
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#updateAfterCreate
	 * @private
	 * @see sap.ui.model.odata.v4.ODataListBinding#create
	 */

	/**
	 * Recursively visits all dependent bindings of (the given context of) this binding. Bindings
	 * with an own cache will request side effects themselves as applicable.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for requesting side effects
	 * @param {string[]} aPaths
	 *   The "14.5.11 Expression edm:NavigationPropertyPath" or
	 *   "14.5.13 Expression edm:PropertyPath" strings describing which properties need to be loaded
	 *   because they may have changed due to side effects of a previous update
	 * @param {sap.ui.model.odata.v4.Context} [oContext]
	 *   The context for which to request side effects; if missing, the whole binding is affected
	 * @param {Promise[]} aPromises
	 *   List of (sync) promises which is extended for each call to
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects} or
	 *   {@link sap.ui.model.odata.v4.ODataBinding#refreshInternal}.
	 * @param {string} [sPrefix=""]
	 *   Prefix for navigation property meta paths; must only be used during recursion
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#visitSideEffects
	 * @private
	 * @see sap.ui.model.odata.v4.Context#requestSideEffects
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */

	/**
	 * Calls the given processor with the cache containing this binding's data, with the path
	 * relative to the cache and with the cache-owning binding. Adjusts the path if the cache is
	 * owned by a parent binding.
	 *
	 * @param {function} fnProcessor The processor
	 * @param {string} [sPath=""] The path; either relative to the binding or absolute containing
	 *   the cache's request path (it will become absolute when forwarding the request to the
	 *   parent binding)
	 * @param {boolean} [bSync] Whether to use the synchronously available cache
	 * @param {boolean} [bWithOrWithoutCache] Whether to call the processor even without a cache
	 *   (currently implemented for operation bindings only)
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved with either the result of
	 *   the processor or <code>undefined</code> if there is no cache for this binding, or if the
	 *   cache determination is not yet completed
	 *
	 * @private
	 */
	ODataBinding.prototype.withCache = function (fnProcessor, sPath = "", bSync = false,
			bWithOrWithoutCache = false) {
		var oCachePromise = bSync ? SyncPromise.resolve(this.oCache) : this.oCachePromise,
			sRelativePath,
			that = this;

		return oCachePromise.then(function (oCache) {
			if (oCache) {
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					return fnProcessor(oCache, sRelativePath, that);
				}
				// the path did not match, try to find it in the parent cache
			} else if (oCache === undefined) {
				return undefined; // cache determination is still running
			} else if (that.oOperation) {
				return bWithOrWithoutCache
					? fnProcessor(null, that.getRelativePath(sPath), that)
					: undefined; // no cache
			}
			if (that.bRelative && that.oContext && that.oContext.withCache) {
				return that.oContext.withCache(fnProcessor,
					sPath[0] === "/" ? sPath : _Helper.buildPath(that.sPath, sPath),
					bSync, bWithOrWithoutCache);
			}
			// no context or base context -> no cache (yet)
			return undefined;
		});
	};

	function asODataBinding(oPrototype) {
		if (this) {
			ODataBinding.apply(this, arguments);
		} else {
			Object.assign(oPrototype, ODataBinding.prototype);
		}
	}

	[
		"adjustPredicate",
		"destroy",
		"hasPendingChangesForPath"
	].forEach(function (sMethod) { // method not final, allow for "super" calls
		asODataBinding.prototype[sMethod] = ODataBinding.prototype[sMethod];
	});

	return asODataBinding;
});
