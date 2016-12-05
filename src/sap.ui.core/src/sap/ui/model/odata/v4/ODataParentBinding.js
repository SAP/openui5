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

	// regular expression converting path to metadata path
	var rNotMetaContext = /\([^/]*|\/\d+|^\d+\//g;

	/**
	 * Creates a cache using the given function and sets it at the binding. If the given
	 * SyncPromises are not fulfilled yet, it temporarily sets a proxy acting as substitute.
	 * If there is already a cache for the canonical path in the binding's
	 * <code>mCacheByContext</code>, it is activated again and used, no cache is created.
	 *
	 * If there is already a cache for the binding, it is deactivated, so that pending read
	 * requests do not deliver results to the binding any more.
	 *
	 * If the path promise or the filter promise fail, an error is reported to the model and
	 * the proxy is not replaced, so that subsequent reads fail.
	 *
	 * @param {function} fnCreateCache
	 *   Function to create the cache which is called with the canonical path and the $filter
	 *   value as parameter and returns the cache.
	 * @param {String|_SyncPromise} [vCanonicalPath]
	 *   The canonical path for the cache or a promise resolving with it
	 * @param {_SyncPromise} [oFilterPromise]
	 *   Promise which resolves with a value for the $filter query option to be used when
	 *   creating the cache
	 * @returns {object}
	 *   The created cache or cache proxy (allows for easier testing)
	 *
	 * @private
	 */
	ODataParentBinding.prototype.createCache = function (fnCreateCache, vCanonicalPath,
			oFilterPromise) {
		var oCacheProxy,
			oPromise,
			that = this;

		if (this.oCache) {
			this.oCache.setActive(false);
		}

		oPromise = _SyncPromise.all([vCanonicalPath, oFilterPromise]).then(function (aResult) {
			var sCanonicalPath = aResult[0];

			// do not create if a cache proxy was created, but the cache now has another one
			if (!oCacheProxy || that.oCache === oCacheProxy) {
				if (sCanonicalPath) {
					that.mCacheByContext = that.mCacheByContext || {};
					that.oCache = that.mCacheByContext[sCanonicalPath];
					if (that.oCache) {
						that.oCache.setActive(true);
					} else {
						that.mCacheByContext[sCanonicalPath] = that.oCache
							= fnCreateCache(sCanonicalPath, aResult[1]);
						that.oCache.$canonicalPath = sCanonicalPath;
					}
				} else {
					that.oCache = fnCreateCache(sCanonicalPath, aResult[1]);
				}
			}
		});

		if (!oPromise.isFulfilled()) {
			this.oCache = oCacheProxy = {
				_delete : function () {
					throw new Error("DELETE request not allowed");
				},
				create : function () {
					throw new Error("POST request not allowed");
				},
				deregisterChange : function () {
					// Be prepared for late deregistrations by dependents of parked contexts
				},
				hasPendingChangesForPath : function () {
					// No pending changes because create and update are not allowed
					return false;
				},
				post : function () {
					throw new Error("POST request not allowed");
				},
				read : function () {
					var aReadArguments = arguments;

					return oPromise.then(function () {
						return that.oCache.read.apply(that.oCache, aReadArguments);
					});
				},
				resetChangesForPath : function () {
					// No pending changes because create and update are not allowed
				},
				setActive : function () {
					// Do not deactivate, the cache that finally replaces the proxy must be
					// active.
				},
				toString : function () {
					return "Cache proxy for " + that;
				},
				update : function () {
					throw new Error("PATCH request not allowed");
				}
			};
		}

		oPromise["catch"](function (oError) {
			//Note: this may also happen if the promise to read data for the canonical path's
			// key predicate is rejected with a canceled error
			that.oModel.reportError("Failed to create cache for binding " + that,
				"sap.ui.model.odata.v4.ODataParentBinding", oError);
		});

		return this.oCache;
	};

	/**
	 * Returns the query options for the binding.
	 *
	 * @param {string} sPath
	 *   The path (relative to this binding) for which the OData query options are requested
	 * @param {sap.ui.model.Context} oContext
	 *   The context to be used to to compute the inherited query options
	 * @returns {object}
	 *   The query options for the given path
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getQueryOptions = function (sPath, oContext) {
		var oResult = this.mQueryOptions;

		if (!oResult) {
			return oContext && oContext.getQueryOptions
				&& oContext.getQueryOptions(_Helper.buildPath(this.sPath, sPath));
		}
		if (!sPath) {
			return oResult;
		}

		sPath = sPath.replace(rNotMetaContext, ""); // transform path to metadata path
		sPath.split("/").some(function (sSegment) {
			oResult = oResult.$expand && oResult.$expand[sSegment];
			if (!oResult || oResult === true) {
				oResult = undefined;
				return true;
			}
		});

		return this.oModel.buildQueryOptions(this.oModel.mUriParameters, oResult, true);
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
	 * @returns {Promise}
	 *   A promise on the outcome of the cache's <code>update</code> call
	 *
	 * @private
	 */
	ODataParentBinding.prototype.updateValue = function (sGroupId, sPropertyName, vValue, sEditUrl,
			sPath) {
		if (this.oCache) {
			sGroupId = sGroupId || this.getUpdateGroupId();
			return this.oCache.update(sGroupId, sPropertyName, vValue, sEditUrl, sPath);
		}

		return this.oContext.updateValue(sGroupId, sPropertyName, vValue, sEditUrl,
			_Helper.buildPath(this.sPath, sPath));
	};

	return function (oPrototype) {
		jQuery.extend(oPrototype, ODataParentBinding.prototype);
	};

}, /* bExport= */ false);
