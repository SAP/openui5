/*!
 * ${copyright}
 */
//Provides mixin sap.ui.model.odata.v4.ODataBinding for classes extending sap.ui.model.Binding
sap.ui.define([
	"sap/ui/base/SyncPromise",
	"./lib/_Helper"
], function (SyncPromise, _Helper) {
	"use strict";

	/**
	 * A mixin for all OData V4 bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataBinding() {}

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
		oCachePromise = SyncPromise.all(aPromises).then(function (aResult) {
			var vCanonicalPath,
				mQueryOptions = aResult[0];

			// Note: do not create a cache for a virtual context
			if (mQueryOptions && !(oContext && oContext.getIndex && oContext.getIndex() === -2)) {
				vCanonicalPath = SyncPromise.resolve(oContext && (oContext.fetchCanonicalPath
					? oContext.fetchCanonicalPath() : oContext.getPath()));
				return vCanonicalPath.then(function (sCanonicalPath) {
					var oCache,
						mCacheQueryOptions,
						oError;

					// create cache only for the latest call to fetchCache
					if (!oCachePromise || that.oFetchCacheCallToken === oCallToken) {
						mCacheQueryOptions = jQuery.extend(true, {}, that.oModel.mUriParameters,
							mQueryOptions);
						if (sCanonicalPath) { // quasi-absolute or relative binding
							// mCacheByContext has to be reset if parameters are changing
							that.mCacheByContext = that.mCacheByContext || {};
							oCache = that.mCacheByContext[sCanonicalPath];
							if (oCache) {
								oCache.setActive(true);
							} else {
								oCache = that.doCreateCache(
									_Helper.buildPath(sCanonicalPath, that.sPath).slice(1),
									mCacheQueryOptions, oContext);
								that.mCacheByContext[sCanonicalPath] = oCache;
								oCache.$canonicalPath = sCanonicalPath;
							}
						} else { // absolute binding
							oCache = that.doCreateCache(that.sPath.slice(1), mCacheQueryOptions,
								oContext);
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
			that.oModel.reportError("Failed to create cache for binding " + that,
				"sap.ui.model.odata.v4.ODataBinding", oError);
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
	 * @returns {SyncPromise}
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
		if (!that.bRelative || oContext && !oContext.fetchValue) {
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
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			// No pending changes because create and update are not allowed
			return false;
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			return oCache.hasPendingChangesForPath(sPath);
		}
		if (this.oContext && this.oContext.hasPendingChangesForPath) {
			return this.oContext.hasPendingChangesForPath(_Helper.buildPath(this.sPath, sPath));
		}
		return false;
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
	 * context can be refreshed.
	 *
	 * @returns {boolean}
	 *   <code>true</code> if the binding can be refreshed
	 *
	 * @private
	 */
	ODataBinding.prototype.isRefreshable = function () {
		return !this.bRelative || this.oContext && !this.oContext.getBinding;
	};

	/**
	 * Refreshes the binding. Prompts the model to retrieve data from the server using the given
	 * group ID and notifies the control that new data is available.
	 *
	 * Refresh is supported for bindings which are not relative to a
	 * {@link sap.ui.model.odata.v4.Context}.
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
	 *   If the given group ID is invalid, the binding has pending changes or refresh on this
	 *   binding is not supported.
	 *
	 * @public
	 * @see sap.ui.model.Binding#refresh
	 * @see #hasPendingChanges
	 * @see #resetChanges
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
	 *   If there is a change of this binding which has been sent to the server and for which there
	 *   is no response yet.
	 *
	 * @public
	 * @since 1.40.1
	 */
	ODataBinding.prototype.resetChanges = function () {
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
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			// No pending changes because create and update are not allowed
			return;
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			oCache.resetChangesForPath(sPath);
		} else if (this.oContext && this.oContext.resetChangesForPath) {
			this.oContext.resetChangesForPath(_Helper.buildPath(this.sPath, sPath));
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
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#resume
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#resume
	ODataBinding.prototype.resume = function () {
		throw new Error("Unsupported operation: resume");
	};

	/**
	 * Method not supported
	 *
	 * @throws {Error}
	 *
	 * @public
	 * @see sap.ui.model.Binding#suspend
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#suspend
	ODataBinding.prototype.suspend = function () {
		throw new Error("Unsupported operation: suspend");
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataBinding.prototype);
	};

}, /* bExport= */ false);
