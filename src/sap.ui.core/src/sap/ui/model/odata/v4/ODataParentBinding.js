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
	 * Changes this binding's parameters and refreshes the binding. The parameters are changed
	 * according to the given map of parameters: Parameters with an <code>undefined</code> value are
	 * removed, the other parameters are set, and missing parameters remain unchanged.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, see {@link sap.ui.model.odata.v4.ODataModel#bindList} and
	 *   {@link sap.ui.model.odata.v4.ODataModel#bindContext}
	 * @throws {Error}
	 *   If <code>mParameters</code> is missing, contains binding-specific or unsupported
	 *   parameters, or contains unsupported values.
	 *
	 * @public
	 * @since 1.45.0
	 */
	ODataParentBinding.prototype.changeParameters = function (mParameters) {
		var bChanged = false,
			sKey,
			mBindingParameters = jQuery.extend(true, {}, this.mParameters);

		if (!mParameters) {
			throw new Error("Missing map of binding parameters");
		}

		for (sKey in mParameters) {
			if (sKey.indexOf("$$") === 0) {
				throw new Error("Unsupported parameter: " + sKey);
			}
			if (mParameters[sKey] === undefined && mBindingParameters[sKey] !== undefined) {
					delete mBindingParameters[sKey];
					bChanged = true;
			} else if (mBindingParameters[sKey] !== mParameters[sKey]) {
				if (typeof mParameters[sKey] === 'object') {
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

	/**
	 * Creates a cache using the given function when the given SyncPromises are fulfilled.
	 * If there is already a cache for the canonical path in the binding's
	 * <code>mCacheByContext</code>, it is activated again and used, no cache is created.
	 *
	 * If there is already a cache for the binding, it is deactivated, so that pending read
	 * requests do not deliver results to the binding any more.
	 *
	 * If the path promise or the filter promise fail, an error is reported to the model.
	 *
	 * @param {function} fnCreateCache
	 *   Function to create the cache which is called with the canonical path and the $filter
	 *   value as parameter and returns the cache.
	 * @param {String|_SyncPromise} [vCanonicalPath]
	 *   The canonical path for the cache or a promise resolving with it
	 * @param {SyncPromise} [oFilterPromise]
	 *   Promise which resolves with a value for the $filter query option to be used when
	 *   creating the cache
	 * @returns {SyncPromise}
	 *   A promise which resolves with a cache instance or <code>undefined</code> if no cache is
	 *   needed
	 *
	 * @private
	 */
	ODataParentBinding.prototype.createCache = function (fnCreateCache, vCanonicalPath,
			oFilterPromise) {
		var oCurrentCache,
			oPromise,
			that = this;

		if (this.oCachePromise && this.oCachePromise.isFulfilled()) {
			oCurrentCache = this.oCachePromise.getResult();
			if (oCurrentCache) {
				oCurrentCache.setActive(false);
			}
		}

		oPromise = _SyncPromise.all([vCanonicalPath, oFilterPromise]).then(function (aResult) {
			var sCanonicalPath = aResult[0],
				oCache,
				oError;

			// create cache only if oCachePromise has not been changed in the meantime
			if (!oPromise || that.oCachePromise === oPromise) {
				if (sCanonicalPath) {
					//mCacheByContext has to be reset if parameters are changing
					that.mCacheByContext = that.mCacheByContext || {};
					oCache = that.mCacheByContext[sCanonicalPath];
					if (oCache) {
						oCache.setActive(true);
					} else {
						oCache = that.mCacheByContext[sCanonicalPath]
							= fnCreateCache(sCanonicalPath, aResult[1]);
						oCache.$canonicalPath = sCanonicalPath;
					}
				} else {
					oCache = fnCreateCache(sCanonicalPath, aResult[1]);
				}
				return oCache;
			} else {
				oError = new Error("Cache discarded as a new cache has been created");
				oError.canceled = true;
				throw oError;
			}
		});

		oPromise["catch"](function (oError) {
			//Note: this may also happen if the promise to read data for the canonical path's
			// key predicate is rejected with a canceled error
			that.oModel.reportError("Failed to create cache for binding " + that,
				"sap.ui.model.odata.v4.ODataParentBinding", oError);
		});

		return oPromise;
	};

	/**
	 * Returns the query options for the binding. Uses the options resulting from the binding
	 * parameters or the options inherited from the parent binding by
	 * using {@link #inheritQueryOptions}. Merges the model's query options.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context that is used to compute the inherited query options
	 * @returns {object}
	 *   The computed query options
	 *
	 * @private
	 */
	ODataParentBinding.prototype.getQueryOptions = function (oContext) {
		var mOwnQueryOptions = this.mQueryOptions;

		if (!Object.keys(mOwnQueryOptions).length) {
			mOwnQueryOptions = this.inheritQueryOptions(oContext);
		}

		return jQuery.extend({}, this.oModel.mUriParameters, mOwnQueryOptions);
	};

	/**
	 * Returns the query options that are inherited from the parent binding. This is the case if
	 * the parent binding has a <code>$expand</code> within the binding path.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context that is used to compute the inherited query options
	 * @returns {object}
	 *   The query options for the given path
	 *
	 * @private
	 */
	ODataParentBinding.prototype.inheritQueryOptions = function (oContext) {
		var oResult;

		if (!this.isRelative() || !oContext || !oContext.getQueryOptions) {
			return undefined;
		}

		oResult = oContext.getQueryOptions();
		if (!oResult) {
			return undefined;
		}

		this.sPath
			.replace(rNotMetaContext, "") // transform path to metadata path
			.split("/").some(function (sSegment) {
				oResult = oResult.$expand && oResult.$expand[sSegment];
				if (!oResult || oResult === true) {
					oResult = undefined;
					return true;
				}
			});

		return oResult;
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
