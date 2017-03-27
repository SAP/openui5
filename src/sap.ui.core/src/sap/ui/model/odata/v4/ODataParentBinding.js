/*!
 * ${copyright}
 */

//Provides mixin sap.ui.model.odata.v4.ODataParentBinding for classes extending sap.ui.model.Binding
//with dependent bindings
sap.ui.define([
	"sap/ui/model/ChangeReason",
	"./ODataBinding",
	"./lib/_Helper",
	"./lib/_SyncPromise"
], function (ChangeReason, asODataBinding, _Helper, _SyncPromise) {
	"use strict";

	/**
	 * A mixin for all OData V4 bindings with dependent bindings.
	 *
	 * @alias sap.ui.model.odata.v4.ODataParentBinding
	 * @extends sap.ui.model.odata.v4.ODataBinding
	 * @mixin
	 */
	function ODataParentBinding() {}

	asODataBinding(ODataParentBinding.prototype);

	var sClassName = "sap.ui.model.odata.v4.ODataParentBinding";

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
	 *   If there are pending changes or if <code>mParameters</code> is missing,
	 *   contains binding-specific or unsupported parameters, or contains unsupported values.
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataParentBinding.prototype.changeParameters = function (mParameters) {
		var mBindingParameters = jQuery.extend(true, {}, this.mParameters),
			bChanged = false,
			sKey;

		if (!mParameters) {
			throw new Error("Missing map of binding parameters");
		}
		if (this.hasPendingChanges()) {
			throw new Error("Cannot change parameters due to pending changes");
		}

		for (sKey in mParameters) {
			if (sKey.indexOf("$$") === 0) {
				throw new Error("Unsupported parameter: " + sKey);
			}
			if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
				delete mBindingParameters[sKey];
				bChanged = true;
			} else if (mBindingParameters[sKey] !== mParameters[sKey]) {
				if (typeof mParameters[sKey] === "object") {
					mBindingParameters[sKey] = jQuery.extend(true, {}, mParameters[sKey]);
				} else {
					mBindingParameters[sKey] = mParameters[sKey];
				}
				bChanged = true;
			}
		}

		if (bChanged) {
			this.applyParameters(mBindingParameters, ChangeReason.Change);
		}
	};

	/*
	 * Checks dependent bindings for updates or refreshes the binding if the canonical path of its
	 * parent context changed.
	 *
	 * @throws {Error} If called with parameters
	 */
	// @override
	ODataParentBinding.prototype.checkUpdate = function () {
		var that = this;

		function updateDependents() {
			// Do not fire a change event in ListBinding, there is no change in the list of contexts
			that.oModel.getDependentBindings(that).forEach(function (oDependentBinding) {
				oDependentBinding.checkUpdate();
			});
		}

		if (arguments.length > 0) {
			throw new Error("Unsupported operation: " + sClassName + "#checkUpdate must not be"
				+ " called with parameters");
		}

		this.oCachePromise.then(function (oCache) {
			if (oCache && that.bRelative && that.oContext.fetchCanonicalPath) {
				that.oContext.fetchCanonicalPath().then(function (sCanonicalPath) {
					// entity of context changed
					if (oCache.$canonicalPath !== sCanonicalPath) {
						that.refreshInternal();
					} else {
						updateDependents();
					}
				})["catch"](function (oError) {
					that.oModel.reportError("Failed to update " + that, sClassName, oError);
				});
			} else {
				updateDependents();
			}
		});
	};

	/**
	 * Deletes the entity in the cache. If the binding doesn't have a cache, it forwards to the
	 * parent binding adjusting the path.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be used for the DELETE request
	 * @param {string} sEditUrl
	 *   The edit URL to be used for the DELETE request
	 * @param {string} sPath
	 *   The path of the entity relative to this binding
	 * @param {function} fnCallback
	 *   A function which is called after the entity has been deleted from the server and from the
	 *   cache; the index of the entity is passed as parameter
	 * @returns {SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure
	 * @throws {Error}
	 *   If this binding is a deferred operation binding, if the group ID is neither '$auto'
	 *   nor '$direct' or if the cache promise for this binding is not yet fulfilled
	 *
	 * @private
	 */
	ODataParentBinding.prototype.deleteFromCache = function (sGroupId, sEditUrl, sPath,
			fnCallback) {
		var oCache = this.oCachePromise.getResult();

		if (this.oOperation) {
			throw new Error("Cannot delete a deferred operation");
		}

		if (!this.oCachePromise.isFulfilled()) {
			throw new Error("DELETE request not allowed");
		}

		if (oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			if (sGroupId !== "$auto" && sGroupId !== "$direct") {
				throw new Error("Illegal update group ID: " + sGroupId);
			}
			return oCache._delete(sGroupId, sEditUrl, sPath, fnCallback);
		}
		return this.oContext.getBinding().deleteFromCache(sGroupId, sEditUrl,
			_Helper.buildPath(this.oContext.iIndex, this.sPath, sPath), fnCallback);
	};

	/**
	 * Determines whether a child binding with the given context, path and query options can
	 * use the cache of this binding or one of its ancestor bindings.
	 *
	 * @param {sap.ui.model.Context} oContext The child binding's context
	 * @param {string} sPath The child binding's binding path
	 * @param {object} mQueryOptions The child binding's query options merged with the query options
	 *   of its dependent bindings
	 * @returns {SyncPromise} A promise resolved with a truthy or falsy value indicating whether the
	 *   child binding can use this binding's or an ancestor binding's cache.
	 *
	 * @private
	 */
	ODataParentBinding.prototype.fetchIfChildCanUseCache = function (oContext, sPath,
			mQueryOptions) {
		var bCanUseCache;

		// Determines whether the given options contain sPath in their "$select" array.
		function containsPathInSelect(mOptions) {
			return mOptions && mOptions.$select && mOptions.$select.indexOf(sPath) >= 0;
		}

		if (this.oCachePromise.isFulfilled()) {
			bCanUseCache = containsPathInSelect(this.mDependentQueryOptions);
			if (!bCanUseCache) {
				return this.fetchQueryOptionsForOwnCache(undefined)
					.then(function (mOwnQueryOptions) {
						return containsPathInSelect(mOwnQueryOptions);
					});
			}
		} else {
			// this.mDependentQueryOptions contains the aggregated query options of all child
			// bindings which can use the cache of this binding or an ancestor binding
			this.mDependentQueryOptions = this.mDependentQueryOptions || {};
			this.mDependentQueryOptions.$select = this.mDependentQueryOptions.$select || [];
			if (!containsPathInSelect(this.mDependentQueryOptions)) {
				this.mDependentQueryOptions.$select.push(sPath);
			}
			bCanUseCache = true;
		}

		return _SyncPromise.resolve(bCanUseCache);
	};

	/**
	 * Returns the query options for the given path relative to this binding. Uses the options
	 * resulting from the binding parameters or the options inherited from the parent binding by
	 * using {@link Context#getQueryOptionsForPath}.
	 *
	 * @param {string} sPath
	 *   The relative path for which the query options are requested
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context that is used to compute the inherited query options; only relevant for the
	 *   call from ODataListBinding#doCreateCache as this.oContext might not yet be set
	 * @returns {object}
	 *   The computed query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getQueryOptionsForPath = function (sPath, oContext) {
		var mQueryOptions;

		if (Object.keys(this.mParameters).length) {
			// binding has parameters -> all query options need to be defined at the binding
			mQueryOptions = this.mQueryOptions;
			// getMetaPath needs an absolute path, a relative path starting with an index would not
			// result in a correct meta path -> first add, then remove '/'
			this.oModel.oMetaModel.getMetaPath("/" + sPath).slice(1)
				.split("/").some(function (sSegment) {
					mQueryOptions = mQueryOptions.$expand && mQueryOptions.$expand[sSegment];
					if (!mQueryOptions || mQueryOptions === true) {
						mQueryOptions = {};
						return true;
					}
				});
			return jQuery.extend(true, {}, mQueryOptions);
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
	 * Initializes the OData list binding. Fires a 'change' event in case the binding has a
	 * resolved path.
	 *
	 * @protected
	 * @see sap.ui.model.Binding#initialize
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataParentBinding.prototype.initialize = function () {
		if (!this.bRelative || this.oContext) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Updates the value for the given property name inside the entity with the given relative path;
	 * the value is updated in this binding's cache or in its parent context in case it has no
	 * cache.
	 *
	 * @param {string} [sGroupId=getUpdateGroupId()]
	 *   The group ID to be used for this update call.
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated
	 * @param {string} [sPath]
	 *   Some relative path
	 * @returns {SyncPromise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 * @throws {Error}
	 *   If the cache promise for this binding is not yet fulfilled
	 *
	 * @private
	 */
	ODataParentBinding.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl,
			sPath) {
		var oCache;

		if (!this.oCachePromise.isFulfilled()) {
			throw new Error("PATCH request not allowed");
		}

		oCache = this.oCachePromise.getResult();
		if (oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			return oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
		}

		return this.oContext.updateValue(sGroupId, sPropertyName, vValue, sEditUrl,
			_Helper.buildPath(this.sPath, sPath));
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataParentBinding.prototype);
	};

}, /* bExport= */ false);
