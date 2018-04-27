/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.ODataBinding for classes extending sap.ui.model.Binding
sap.ui.define([
	"sap/ui/base/SyncPromise",
	"./lib/_Helper"
], function (SyncPromise, _Helper) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataBinding";

	/**
	 * A mixin for all OData V4 bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataBinding() {}

	/**
	 * Throws an Error if the binding's root binding is suspended.
	 *
	 * @throws {Error} If the binding's root binding is suspended
	 *
	 * @private
	 */
	ODataBinding.prototype.checkSuspended = function () {
		var oRootBinding = this.getRootBinding();

		if (oRootBinding && oRootBinding.isSuspended()) {
			throw new Error("Must not call method when the binding's root binding is suspended: "
				+ this);
		}
	};

	/**
	 * Creates a cache for this binding if a cache is needed and updates <code>oCachePromise</code>.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, may be undefined for absolute bindings
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchCache = function (oContext) {
		var oCachePromise,
			oCallToken = {},
			oCurrentCache,
			aPromises,
			that = this;

		if (!this.bRelative) {
			oContext = undefined;
		}
		if (this.oCachePromise.isFulfilled()) {
			oCurrentCache = this.oCachePromise.getResult();
			if (oCurrentCache) {
				oCurrentCache.setActive(false);
			}
		}
		aPromises = [this.fetchQueryOptionsForOwnCache(oContext), this.oModel.oRequestor.ready()];
		this.mCacheQueryOptions = undefined;
		oCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var vCanonicalPath,
				mQueryOptions = aResult[0];

			// Note: do not create a cache for a virtual context
			if (mQueryOptions && !(oContext && oContext.getIndex && oContext.getIndex() === -2)) {
				vCanonicalPath = SyncPromise.resolve(oContext && (oContext.fetchCanonicalPath
					? oContext.fetchCanonicalPath() : oContext.getPath()));
				return vCanonicalPath.then(function (sCanonicalPath) {
					var oCache,
						oError;

					// create cache only for the latest call to fetchCache
					if (!oCachePromise || that.oFetchCacheCallToken === oCallToken) {
						that.mCacheQueryOptions = jQuery.extend(true, {},
							that.oModel.mUriParameters, mQueryOptions);
						if (sCanonicalPath) { // quasi-absolute or relative binding
							// mCacheByContext has to be reset if parameters are changing
							that.mCacheByContext = that.mCacheByContext || {};
							oCache = that.mCacheByContext[sCanonicalPath];
							if (oCache) {
								oCache.setActive(true);
							} else {
								oCache = that.doCreateCache(
									_Helper.buildPath(sCanonicalPath, that.sPath).slice(1),
										that.mCacheQueryOptions, oContext);
								that.mCacheByContext[sCanonicalPath] = oCache;
								oCache.$canonicalPath = sCanonicalPath;
							}
						} else { // absolute binding
							oCache = that.doCreateCache(that.sPath.slice(1),
								that.mCacheQueryOptions, oContext);
						}
						return oCache;
					} else {
						oError = new Error("Cache discarded as a new cache has been created");
						oError.canceled = true;
						throw oError;
					}
				});
			}
		});
		oCachePromise["catch"](function (oError) {
			//Note: this may also happen if the promise to read data for the canonical path's
			// key predicate is rejected with a canceled error
			that.oModel.reportError("Failed to create cache for binding " + that, sClassName,
				oError);
		});
		this.oCachePromise = oCachePromise;
		this.oFetchCacheCallToken = oCallToken;
	};

	/**
	 * Fetches the query options to create the cache for this binding or <code>undefined</code> if
	 * no cache is to be created.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context instance to be used, must be undefined for absolute bindings
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which resolves with the query options to create the cache for this binding,
	 *   or with <code>undefined</code> if no cache is to be created
	 *
	 * @private
	 */
	ODataBinding.prototype.fetchQueryOptionsForOwnCache = function (oContext) {
		var bHasNonSystemQueryOptions,
			oQueryOptionsPromise,
			that = this;

		// operation binding manages its cache on its own
		if (this.oOperation) {
			return SyncPromise.resolve(undefined);
		}

		// unresolved binding
		if (this.bRelative && !oContext) {
			return SyncPromise.resolve(undefined);
		}

		// auto-$expand/$select and binding is a parent binding, so that it needs to wait until all
		// its child bindings know via the corresponding promise in this.aChildCanUseCachePromises
		// if they can use the parent binding's cache
		oQueryOptionsPromise = this.doFetchQueryOptions(oContext);
		if (this.oModel.bAutoExpandSelect && this.aChildCanUseCachePromises) {
			// For auto-$expand/$select, wait for query options of dependent bindings:
			// Promise.resolve() ensures all dependent bindings are created and have sent their
			// query options promise to this binding via fetchIfChildCanUseCache.
			// The aggregated query options of this binding and its dependent bindings are available
			// in that.mAggregatedQueryOptions once all these promises are fulfilled.
			oQueryOptionsPromise = SyncPromise.all([
				oQueryOptionsPromise,
				Promise.resolve().then(function () {
					return SyncPromise.all(that.aChildCanUseCachePromises);
				})
			]).then(function (aResult) {
				that.aChildCanUseCachePromises = [];
				that.updateAggregatedQueryOptions(aResult[0]);
				return that.mAggregatedQueryOptions;
			});
		}

		// (quasi-)absolute binding
		if (!this.bRelative || !oContext.fetchValue) {
			return oQueryOptionsPromise;
		}

		// auto-$expand/$select: Use parent binding's cache if possible
		if (this.oModel.bAutoExpandSelect) {
			bHasNonSystemQueryOptions = that.mParameters
				&& Object.keys(that.mParameters).some(function (sKey) {
					return sKey[0] !== "$" || sKey[1] === "$";
				});
			if (bHasNonSystemQueryOptions) {
				return oQueryOptionsPromise;
			}
			return oContext.getBinding()
				.fetchIfChildCanUseCache(oContext, that.sPath, oQueryOptionsPromise)
				.then(function (bCanUseCache) {
					return bCanUseCache ? undefined : oQueryOptionsPromise;
				});
		}

		// relative binding with parameters which are not query options (such as $$groupId)
		if (this.mParameters && Object.keys(this.mParameters).length) {
			return oQueryOptionsPromise;
		}

		// relative binding which may have query options from UI5 filter or sorter objects
		return oQueryOptionsPromise.then(function (mQueryOptions) {
			return Object.keys(mQueryOptions).length === 0 ? undefined : mQueryOptions;
		});
	};

	/**
	 * Returns the group ID of the binding that is used for read requests.
	 *
	 * @returns {string}
	 *   The group ID
	 *
	 * @private
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
	 * Note that the resulting path may start with a key predicate.
	 *
	 * Example: (The binding's resolved path is "/foo/bar"):
	 * baz -> baz
	 * /foo/bar/baz -> baz
	 * /foo/bar('baz') -> ('baz')
	 * /foo -> undefined if the binding is relative
	 *
	 * @param {string} sPath
	 *   A path
	 * @returns {string}
	 *   The path relative to the binding's path or <code>undefined</code> if the path is not a sub
	 *   path and the binding is relative
	 *
	 * @private
	 */
	ODataBinding.prototype.getRelativePath = function (sPath) {
		var sPathPrefix,
			sResolvedPath;

		if (sPath[0] === "/") {
			sResolvedPath = this.oModel.resolve(this.sPath, this.oContext);
			if (sPath.indexOf(sResolvedPath) === 0) {
				sPathPrefix = sResolvedPath;
			} else if (this.oReturnValueContext
					&& sPath.indexOf(this.oReturnValueContext.getPath()) === 0) {
				sPathPrefix = this.oReturnValueContext.getPath();
			} else {
				// A mismatch can only happen when a list binding's context has been parked and is
				// destroyed later. Such a context does no longer have a subpath of the binding's
				// path. The only caller in this case is ODataPropertyBinding#deregisterChange
				// which can safely be ignored.
				return undefined;
			}
			sPath = sPath.slice(sPathPrefix.length);

			if (sPath[0] === "/") {
				sPath = sPath.slice(1);
			}
		}
		return sPath;
	};

	/**
	 * Returns the root binding of this binding's hierarchy, see binding
	 * {@link topic:54e0ddf695af4a6c978472cecb01c64d Initialization and Read Requests}.
	 *
	 * @returns {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataPropertyBinding}
	 *   The root binding or <code>undefined</code> if this binding is not yet resolved.
	 *
	 * @public
	 * @since 1.53.0
	 */
	ODataBinding.prototype.getRootBinding = function () {
		if (this.bRelative && this.oContext && this.oContext.getBinding) {
			return this.oContext.getBinding().getRootBinding();
		}
		return this.bRelative && !this.oContext ? undefined : this;
	};

	/**
	 * Returns the group ID of the binding that is used for update requests.
	 *
	 * @returns {string}
	 *   The update group ID
	 *
	 * @private
	 */
	ODataBinding.prototype.getUpdateGroupId = function () {
		return this.sUpdateGroupId
			|| (this.bRelative && this.oContext && this.oContext.getUpdateGroupId
					&& this.oContext.getUpdateGroupId())
			|| this.oModel.getUpdateGroupId();
	};

	/**
	 * Returns <code>true</code> if this binding or its dependent bindings have pending changes,
	 * meaning updates that have not yet been successfully sent to the server.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @public
	 * @since 1.39.0
	 */
	ODataBinding.prototype.hasPendingChanges = function () {
		return this.hasPendingChangesForPath("") || this.hasPendingChangesInDependents();
	};

	/**
	 * Checks whether there are pending changes for the given path in the binding's cache (which may
	 * be inherited from the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @returns {boolean}
	 *   <code>true</code> if there are pending changes for the path
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesForPath = function (sPath) {
		var that = this,
			oPromise = this.withCache(function (oCache, sCachePath) {
				return oCache.hasPendingChangesForPath(sCachePath);
			}, sPath).catch(function (oError) {
				that.oModel.reportError("Error in hasPendingChangesForPath", sClassName, oError);
				return false;
			});

		// If the cache is still being determined, there can be no changes in it
		return oPromise.isFulfilled() ? oPromise.getResult() : false;
	};

	/**
	 * Checks whether any of the dependent bindings has pending changes.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding has pending changes
	 *
	 * @private
	 */
	ODataBinding.prototype.hasPendingChangesInDependents = function () {
		return this.oModel.getDependentBindings(this).some(function (oDependent) {
			var oCache, bHasPendingChanges;

			if (oDependent.oCachePromise.isFulfilled()) {
				// Pending changes for this cache are only possible when there is a cache already
				oCache = oDependent.oCachePromise.getResult();
				if (oCache && oCache.hasPendingChangesForPath("")) {
					return true;
				}
			}
			if (oDependent.mCacheByContext) {
				bHasPendingChanges = Object.keys(oDependent.mCacheByContext).some(function (sPath) {
					return oDependent.mCacheByContext[sPath].hasPendingChangesForPath("");
				});
				if (bHasPendingChanges) {
					return true;
				}
			}
			// Ask dependents, they might have no cache, but pending changes in mCacheByContext
			return oDependent.hasPendingChangesInDependents();
		});
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#isInitial
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#isInitial
	ODataBinding.prototype.isInitial = function () {
		throw new Error("Unsupported operation: isInitial");
	};

	/**
	 * Checks whether the binding can be refreshed. Only bindings which are not relative to a V4
	 * context and whose root binding is not suspended can be refreshed.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding can be refreshed
	 *
	 * @private
	 */
	ODataBinding.prototype.isRefreshable = function () {
		return (!this.bRelative || this.oContext && !this.oContext.getBinding)
			&& !this.isSuspended();
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 *
	 * Refresh is supported for bindings which are not relative to a
	 * {@link sap.ui.model.odata.v4.Context} and whose root binding is not suspended.
	 *
	 * Note: When calling {@link #refresh} multiple times, the result of the request triggered by
	 * the last call determines the binding's data; it is <b>independent</b> of the order of calls
	 * to {@link sap.ui.model.odata.v4.ODataModel#submitBatch} with the given group ID.
	 *
	 * If there are pending changes, an error is thrown. Use {@link #hasPendingChanges} to check if
	 * there are pending changes. If there are changes, call
	 * {@link sap.ui.model.odata.v4.ODataModel#submitBatch} to submit the changes or
	 * {@link sap.ui.model.odata.v4.ODataModel#resetChanges} to reset the changes before calling
	 * {@link #refresh}.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh; if not specified, the group ID for this binding is
	 *   used.
	 *
	 *   Valid values are <code>undefined</code>, '$auto', '$direct' or application group IDs as
	 *   specified in {@link sap.ui.model.odata.v4.ODataModel#submitBatch}.
	 * @throws {Error}
	 *   If the given group ID is invalid, the binding has pending changes, its root binding is
	 *   suspended or refresh on this binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @see #getRootBinding
	 * @see #hasPendingChanges
	 * @see #resetChanges
	 * @see #suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#refresh
	ODataBinding.prototype.refresh = function (sGroupId) {
		if (!this.isRefreshable()) {
			throw new Error("Refresh on this binding is not supported");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot refresh due to pending changes");
		}
		this.oModel.checkGroupId(sGroupId);

		// The actual refresh is specific to the binding and is implemented in each binding class.
		this.refreshInternal(sGroupId, true);
	};

	/**
	 * Refreshes the binding. The refresh method itself only performs some validation checks and
	 * forwards to this method doing the actual work. Interaction between contexts also runs via
	 * these internal methods.
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 * @param {boolean} [bCheckUpdate]
	 *   If <code>true</code>, a property binding is expected to check for updates.
	 *
	 * @abstract
	 * @function
	 * @name sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 * @private
	 */

	/**
	 * Resets all pending changes of this binding, see {@link #hasPendingChanges}. Resets also
	 * invalid user input.
	 *
	 * @throws {Error}
	 *   If the binding's root binding is suspended or if there is a change of this binding which
	 *   has been sent to the server and for which there is no response yet.
	 *
	 * @public
	 * @since 1.40.1
	 */
	ODataBinding.prototype.resetChanges = function () {
		this.checkSuspended();
		this.resetChangesForPath("");
		this.resetChangesInDependents();
		this.resetInvalidDataState();
	};

	/**
	 * Resets pending changes for the given path in the binding's cache (which may be inherited from
	 * the parent).
	 *
	 * @param {string} sPath
	 *   The path
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesForPath = function (sPath) {
		var oPromise = this.withCache(function (oCache, sCachePath) {
				oCache.resetChangesForPath(sCachePath);
			}, sPath),
			that = this;

		oPromise.catch(function (oError) {
			that.oModel.reportError("Error in resetChangesForPath", sClassName, oError);
		});
		if (oPromise.isRejected()) {
			throw oPromise.getResult();
		}
	};

	/**
	 * Resets pending changes in all dependent bindings.
	 * @throws {Error}
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetChangesInDependents = function () {
		this.oModel.getDependentBindings(this).forEach(function (oDependent) {
			var oCache;

			if (oDependent.oCachePromise.isFulfilled()) {
				// Pending changes for this cache are only possible when there is a cache already
				oCache = oDependent.oCachePromise.getResult();
				if (oCache) {
					oCache.resetChangesForPath("");
				}
				oDependent.resetInvalidDataState();
			}
			// mCacheByContext may have changes nevertheless
			if (oDependent.mCacheByContext) {
				Object.keys(oDependent.mCacheByContext).forEach(function (sPath) {
					oDependent.mCacheByContext[sPath].resetChangesForPath("");
				});
			}
			// Reset dependents, they might have no cache, but pending changes in mCacheByContext
			oDependent.resetChangesInDependents();
		});
	};

	/**
	 * A method to reset invalid data state, to be called by {@link #resetChanges}.
	 * Does nothing, because only property bindings have data state.
	 *
	 * @private
	 */
	ODataBinding.prototype.resetInvalidDataState = function () {
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
		return this.getMetadata().getName() + ": " + (this.bRelative  ? this.oContext + "|" : "")
			+ this.sPath;
	};

	/**
	 * Calls the given processor with the cache containing this binding's data, the path relative
	 * to the cache and the cache-owning binding. Adjusts the path if the cache is owned by a parent
	 * binding.
	 *
	 * @param {function} fnProcessor The processor
	 * @param {string} [sPath=""] The path; either relative to the binding or absolute containing
	 *   the cache's request path (it will become absolute when forwarding the request to the
	 *   parent binding)
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved with either the result of
	 *   the processor or <code>undefined</code> if there is no cache for this binding currently
	 */
	ODataBinding.prototype.withCache = function (fnProcessor, sPath) {
		var sRelativePath,
			that = this;

		sPath = sPath || "";
		return this.oCachePromise.then(function (oCache) {
			if (oCache) {
				sRelativePath = that.getRelativePath(sPath);
				if (sRelativePath !== undefined) {
					return fnProcessor(oCache, sRelativePath, that);
				}
				// the path did not match, try to find it in the parent cache
			} else if (that.oOperation) {
				return undefined; // no cache yet
			}
			if (that.oContext && that.oContext.withCache) {
				return that.oContext.withCache(fnProcessor,
					sPath[0] === "/" ? sPath : _Helper.buildPath(that.sPath, sPath));
			}
			// no context or base context -> no cache (yet)
			return undefined;
		});
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataBinding.prototype);
	};

}, /* bExport= */ false);
