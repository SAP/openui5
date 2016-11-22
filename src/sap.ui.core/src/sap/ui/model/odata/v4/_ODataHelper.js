/*!
 * ${copyright}
 */

sap.ui.define([
	"./lib/_Helper",
	"./lib/_SyncPromise"
], function (_Helper, _SyncPromise) {
	"use strict";

	var ODataHelper,
		// regular expression converting path to metadata path
		rNotMetaContext = /\([^/]*|\/\d+|^\d+\//g;


	ODataHelper = {
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
		 * @param {sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataContextBinding}
		 *   oBinding The binding
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
		 */
		createCache : function (oBinding, fnCreateCache, vCanonicalPath, oFilterPromise) {
			var oCacheProxy,
				oPromise;

			if (oBinding.oCache) {
				oBinding.oCache.setActive(false);
			}

			oPromise = _SyncPromise.all([vCanonicalPath, oFilterPromise]).then(function (aResult) {
				var sCanonicalPath = aResult[0];

				// do not create if a cache proxy was created, but the cache now has another one
				if (!oCacheProxy || oBinding.oCache === oCacheProxy) {
					if (sCanonicalPath) {
						oBinding.mCacheByContext = oBinding.mCacheByContext || {};
						oBinding.oCache = oBinding.mCacheByContext[sCanonicalPath];
						if (oBinding.oCache) {
							oBinding.oCache.setActive(true);
						} else {
							oBinding.mCacheByContext[sCanonicalPath] = oBinding.oCache
								= fnCreateCache(sCanonicalPath, aResult[1]);
							oBinding.oCache.$canonicalPath = sCanonicalPath;
						}
					} else {
						oBinding.oCache = fnCreateCache(sCanonicalPath, aResult[1]);
					}
				}
			});

			if (!oPromise.isFulfilled()) {
				oBinding.oCache = oCacheProxy = {
					hasPendingChanges : function () {
						return false;
					},
					post : function () {
						throw new Error("POST request not allowed");
					},
					read : function () {
						var aReadArguments = arguments;

						return oPromise.then(function () {
							return oBinding.oCache.read.apply(oBinding.oCache, aReadArguments);
						});
					},
					resetChanges : function () {},
					setActive : function () {},
					update : function () {
						throw new Error("PATCH request not allowed");
					}
				};
			}

			oPromise["catch"](function (oError) {
				//Note: this may also happen if the promise to read data for the canonical path's
				// key predicate is rejected with a canceled error
				oBinding.oModel.reportError("Failed to create cache for binding " + oBinding,
					"sap.ui.model.odata.v4._ODataHelper", oError);
			});

			return oBinding.oCache;
		},

		/**
		 * Returns the query options for the given binding.
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataContextBinding}
		 *   oBinding The OData list or context binding which is used to get OData query options for
		 *   the given path.
		 * @param {string} sPath
		 *   The path, relative to the given binding, for which the OData query options are
		 *   requested
		 * @param {sap.ui.model.Context} oContext
		 *   The context to be used to to compute the inherited query options
		 * @returns {object}
		 *   The query options for the given path
		 *
		 * @private
		 */
		getQueryOptions : function (oBinding, sPath, oContext) {
			var oResult = oBinding.mQueryOptions;

			if (!oResult) {
				return oContext && oContext.getQueryOptions
					&& oContext.getQueryOptions(_Helper.buildPath(oBinding.sPath, sPath));
			}
			if (!sPath) {
				return oResult;
			}

			// transform path to metadata path
			sPath = sPath.replace(rNotMetaContext, "");
			sPath.split("/").some(function (sSegment) {
				oResult = oResult.$expand && oResult.$expand[sSegment];
				if (!oResult || oResult === true) {
					oResult = undefined;
					return true;
				}
			});

			return oBinding.oModel.buildQueryOptions(oBinding.oModel.mUriParameters, oResult, true);
		},

		/**
		 * Checks whether there are pending changes. The function is called in three different
		 * situations:
		 * 1. From the binding itself using hasPendingChanges(true): Check the cache or the context,
		 *    then ask the children using hasPendingChanges(false)
		 * 2. From the parent binding using hasPendingChanges(false): Check the cache, then ask the
		 *    children using hasPendingChanges(false)
		 * 3. From a child binding (via the context) using hasPendingChanges(undefined, sPath):
		 *    Check the cache or the context using the (extended) path
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataContextBinding}
		 *   oBinding The OData list or context binding
		 * @param {boolean} bAskParent
		 *   If <code>true</code>, ask the parent using the relative path, too; this is only
		 *   relevant if there is no path
		 * @param {string} [sPath]
		 *   The path; if it is defined, only the parent is asked using the relative path
		 * @returns {boolean}
		 *   <code>true</code> if the binding has pending changes
		 *
		 * @private
		 */
		hasPendingChanges : function (oBinding, bAskParent, sPath) {
			var bResult;

			if (sPath !== undefined) {
				// We are asked from a child for a certain path -> only check own cache or context
				if (oBinding.oCache) {
					return oBinding.oCache.hasPendingChanges(sPath);
				}
				if (oBinding.oContext && oBinding.oContext.hasPendingChanges) {
					return oBinding.oContext.hasPendingChanges(
						_Helper.buildPath(oBinding.sPath, sPath));
				}
				return false;
			}
			if (oBinding.oCache) {
				bResult = oBinding.oCache.hasPendingChanges("");
			} else if (bAskParent && oBinding.oContext && oBinding.oContext.hasPendingChanges) {
				bResult = oBinding.oContext.hasPendingChanges(oBinding.sPath);
			}
			if (bResult) {
				return bResult;
			}
			return oBinding.oModel.getDependentBindings(oBinding).some(function (oDependent) {
				return ODataHelper.hasPendingChanges(oDependent, false);
			});
		},

		/**
		 * Checks whether the given binding can be refreshed. Only bindings which are not relative
		 * to a V4 context can be refreshed.
		 *
		 * @param {sap.ui.model.odata.v4.ODataContextBinding|sap.ui.model.odata.v4.ODataListBinding|
		 * sap.ui.model.odata.v4.ODataPropertyBinding} oBinding
		 *   The binding to check
		 * @returns {boolean}
		 *   <code>true</code> if the binding can be refreshed
		 *
		 * @private
		 */
		isRefreshable : function (oBinding) {
			return (!oBinding.bRelative || oBinding.oContext && !oBinding.oContext.getBinding);
		},

		/**
		 * Resets all pending changes of the binding and possible all dependent bindings. The
		 * function is called in three different situations:
		 * 1. From the binding itself using resetChanges(true): Reset the cache or the context,
		 *    then the children using resetChanges(false)
		 * 2. From the parent binding using resetChanges(false): Reset the cache, then the children
		 *    using resetChanges(false)
		 * 3. From a child binding (via the context) using resetChanges(undefined, sPath):
		 *    Reset the cache or the context using the (extended) path
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataContextBinding}
		 *   oBinding The OData list or context binding
		 * @param {boolean} bAskParent
		 *   If <code>true</code>, reset in the parent binding using this binding's relative path;
		 *   this is only relevant if there is no path given
		 * @param {string} [sPath]
		 *   The path; if it is defined, only the parent is asked to reset using the relative path
		 *
		 * @private
		 */
		resetChanges : function (oBinding, bAskParent, sPath) {
			if (sPath !== undefined) {
				// We are asked from a child for a certain path -> only reset own cache or context
				if (oBinding.oCache) {
					oBinding.oCache.resetChanges(sPath);
				} else if (oBinding.oContext && oBinding.oContext.resetChanges) {
					oBinding.oContext.resetChanges(_Helper.buildPath(oBinding.sPath, sPath));
				}
				return;
			}
			if (oBinding.oCache) {
				oBinding.oCache.resetChanges("");
			} else if (bAskParent && oBinding.oContext && oBinding.oContext.resetChanges) {
				oBinding.oContext.resetChanges(oBinding.sPath);
			}
			oBinding.oModel.getDependentBindings(oBinding).forEach(function (oDependentBinding) {
				ODataHelper.resetChanges(oDependentBinding, false);
			});
		}
	};

	return ODataHelper;
}, /* bExport= */ false);
