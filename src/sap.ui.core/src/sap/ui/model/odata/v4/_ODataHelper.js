/*!
 * ${copyright}
 */

sap.ui.define([
	"./lib/_Helper",
	"./lib/_Parser",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/Sorter"
], function (_Helper, _Parser, OperationMode, Sorter) {
	"use strict";

	var ODataHelper,
		rApplicationGroupID = /^\w+$/;

	/**
	 * Returns whether the given group ID is valid, which means it is either undefined, '$auto',
	 * '$direct' or an application group ID, which is a non-empty string consisting of
	 * alphanumeric characters from the basic Latin alphabet, including the underscore.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} [bApplicationGroup]
	 *   Whether only an application group ID is considered valid
	 * @returns {boolean}
	 *   Whether the group ID is valid
	 */
	function isValidGroupId(sGroupId, bApplicationGroup) {
		if (typeof sGroupId === "string" && rApplicationGroupID.test(sGroupId)) {
			return true;
		}
		if (!bApplicationGroup) {
			return sGroupId === undefined || sGroupId === "$auto" || sGroupId === "$direct";
		}
		return false;
	}

	ODataHelper = {
		/**
		 * Returns the map of binding-specific parameters from the given map. "Binding-specific"
		 * parameters are those with a key starting with '$$', i.e. OData query options provided as
		 * binding parameters are not contained in the map. The following parameters and parameter
		 * values are supported, if the parameter is contained in the given 'aAllowed' parameter:
		 * <ul>
		 * <li> '$$groupId' with allowed values as specified in {@link #checkGroupId}
		 * <li> '$$updateGroupId' with allowed values as specified in {@link #checkGroupId}
		 * <li> '$$operationMode' with value {@link sap.ui.model.odata.OperationMode.Server}
		 * </ul>
		 *
		 * @param {object} mParameters
		 *   The map of binding parameters
		 * @param {string[]} aAllowed
		 *   The array of allowed binding parameters
		 * @returns {object}
		 *   The map of binding-specific parameters
		 * @throws {Error}
		 *   For unsupported parameters or parameter values
		 */
		buildBindingParameters : function (mParameters, aAllowed) {
			var mResult = {};

			if (mParameters) {
				Object.keys(mParameters).forEach(function (sKey) {
					var sValue = mParameters[sKey];

					if (sKey.indexOf("$$") !== 0) {
						return;
					}
					if (!aAllowed || aAllowed.indexOf(sKey) < 0) {
						throw new Error("Unsupported binding parameter: " + sKey);
					}

					if (sKey === "$$groupId" || sKey === "$$updateGroupId") {
						if (!isValidGroupId(sValue)) {
							throw new Error("Unsupported value '" + sValue
									+ "' for binding parameter '" + sKey + "'");
						}
					} else if (sKey === "$$operationMode") {
						if (sValue !== OperationMode.Server) {
							throw new Error("Unsupported operation mode: " + sValue);
						}
					}

					mResult[sKey] = sValue;
				});
			}
			return mResult;
		},

		/**
		 * Build the value for the OData V4 '$orderby' system query option from the given sorters
		 * and the optional static '$orderby' value which is appended to the sorters.
		 *
		 * @param {sap.ui.model.Sorter[]} [aSorters]
		 *   An array of <code>Sorter</code> objects to be converted into corresponding '$orderby'
		 *   string.
		 * @param {string} [sOrderbyQueryOption]
		 *   The static '$orderby' system query option which is appended to the converted 'aSorters'
		 *   parameter.
		 * @returns {string}
		 *   The concatenated orderby-string
		 * @throws {Error}
		 *   If 'aSorters' contains elements, which are not {@link sap.ui.model.Sorter} instances.
		 */
		buildOrderbyOption : function (aSorters, sOrderbyQueryOption) {
			var aOrderbyOptions = [];

			aSorters.forEach(function (oSorter) {
				if (oSorter instanceof Sorter) {
					aOrderbyOptions.push(oSorter.sPath + (oSorter.bDescending ? " desc" : ""));
				} else {
					throw new Error("Unsupported sorter: '" + oSorter + "' ("
						+ typeof oSorter + ")");
				}
			});
			if (sOrderbyQueryOption) {
				aOrderbyOptions.push(sOrderbyQueryOption);
			}
			return aOrderbyOptions.join(',');
		},

		/**
		 * Constructs a map of query options from the given options <code>mOptions</code> and
		 * model options <code>mModelOptions</code>; an option overwrites a model option with the
		 * same key. Options in <code>mOptions</code> starting with '$$' indicate binding-specific
		 * parameters, which must not be part of a back end query; they are ignored and
		 * not added to the map.
		 * The following query options are disallowed:
		 * <ul>
		 * <li> System query options (key starts with "$") except those specified in
		 *   <code>aAllowed</code>
		 * <li> Parameter aliases (key starts with "@")
		 * <li> Custom query options starting with "sap-", unless <code>bSapAllowed</code> is set
		 * </ul>
		 * @param {object} [mModelOptions={}]
		 *   Map of query options specified for the model
		 * @param {object} [mOptions={}]
		 *   Map of query options
		 * @param {string[]} [aAllowed=[]]
		 *   Names of allowed system query options
		 * @param {boolean} [bSapAllowed=false]
		 *   Whether Custom query options starting with "sap-" are allowed
		 * @throws {Error}
		 *   If disallowed OData query options are provided
		 * @returns {object}
		 *   The map of query options
		 */
		buildQueryOptions : function (mModelOptions, mOptions, aAllowed, bSapAllowed) {
			var mResult = JSON.parse(JSON.stringify(mModelOptions || {}));

			/**
			 * Validates an expand item.
			 *
			 * @param {boolean|object} vExpandOptions
			 *   The expand options (the value for the "$expand" in the hierarchical options);
			 *   either a map or simply true if there are no options
			 */
			function validateExpandItem(vExpandOptions) {
				var sOption;

				if (typeof vExpandOptions === "object") {
					for (sOption in vExpandOptions) {
						validateSystemQueryOption(sOption, vExpandOptions[sOption]);
					}
				}
			}

			/**
			 * Validates a system query option.
			 * @param {string} sOption The name of the option
			 * @param {any} vValue The value of the option
			 */
			function validateSystemQueryOption(sOption, vValue) {
				var sPath;

				if (!aAllowed || aAllowed.indexOf(sOption) < 0) {
					throw new Error("System query option " + sOption + " is not supported");
				}
				if (sOption === "$expand") {
					for (sPath in vValue) {
						validateExpandItem(vValue[sPath]);
					}
				}
			}

			if (mOptions) {
				Object.keys(mOptions).forEach(function (sKey) {
					var vValue = mOptions[sKey];

					if (sKey.indexOf("$$") === 0) {
						return;
					}

					if (sKey[0] === "@") {
						throw new Error("Parameter " + sKey + " is not supported");
					}
					if (sKey[0] === "$") {
						if ((sKey === "$expand" || sKey === "$select")
								&& typeof vValue === "string") {
							vValue = _Parser.parseSystemQueryOption(sKey + "=" + vValue)[sKey];
						}
						validateSystemQueryOption(sKey, vValue);
					} else if (!bSapAllowed && sKey.indexOf("sap-") === 0) {
						throw new Error("Custom query option " + sKey + " is not supported");
					}
					mResult[sKey] = vValue;
				});
			}
			return mResult;
		},

		/**
		 * Checks whether the given group ID is valid, which means it is either undefined, '$auto',
		 * '$direct' or an application group ID, which is a non-empty string consisting of
		 * alphanumeric characters from the basic Latin alphabet, including the underscore.
		 *
		 * @param {string} sGroupId
		 *   The group ID
		 * @param {boolean} [bApplicationGroup]
		 *   Whether only an application group ID is considered valid
		 * @param {string} [sErrorMessage]
		 *   The error message to be used if group ID is not valid; the group ID will be appended
		 * @throws {Error}
		 *   For invalid group IDs
		 */
		checkGroupId : function (sGroupId, bApplicationGroup, sErrorMessage) {
			if (!isValidGroupId(sGroupId, bApplicationGroup)) {
				throw new Error((sErrorMessage || "Invalid group ID: ") + sGroupId);
			}
		},

		/**
		 * Creates a cache proxy acting as substitute for a cache while it waits for the
		 * resolution of the given promise which resolves with a canonical path; it then creates the
		 * "real" cache using the given function.
		 *
		 * If there is no cache for the canonical path in the binding's
		 * <code>mCacheByContext</code>, creates the cache by calling the given function
		 * <code>fnCreateCache</code> with the canonical path. If the binding's cache is not the
		 * cache proxy, the promise resolves with the binding's cache in order to ensure a cache
		 * proxy associated with a binding is only replaced by the corresponding cache.
		 *
		 * If there is already a cache for the binding, <code>deregisterChange()</code> is called
		 * to deregister all listening property bindings at the cache, because they are not able to
		 * deregister themselves afterwards.
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding|sap.ui.model.odata.v4.ODataContextBinding}
		 *   oBinding The relative binding
		 * @param {function} fnCreateCache Function to create the cache which is called with the
		 *   canonical path as parameter and returns the cache.
		 * @param {Promise} oPathPromise Promise which resolves with a canonical path for the cache
		 * @returns {object} The cache proxy with the following properties
		 *   deregisterChange: method does nothing
		 *   hasPendingChanges: method returning false
		 *   post: method throws an error as the cache proxy does not support write operations
		 *   promise: promise fulfilled with the cache or rejected with the error on requesting the
		 *     canonical path or creating the cache
		 *   read: method delegates to the cache's read method
		 *   refresh: method does nothing
		 *   update: method throws an error as the cache proxy does not support write operations
		 */
		createCacheProxy : function (oBinding, fnCreateCache, oPathPromise) {
			var oCacheProxy;

			if (oBinding.oCache) {
				oBinding.oCache.deregisterChange();
			}
			oCacheProxy = {
				deregisterChange : function () {},
				hasPendingChanges : function () {
					return false;
				},
				post : function () {
					throw new Error("POST request not allowed");
				},
				read : function () {
					var aReadArguments = arguments;

					return this.promise.then(function (oCache) {
						return oCache.read.apply(oCache, aReadArguments);
					}, function (oError) {
						throw new Error("Cannot read from cache, cache creation failed: "
							+ oError);
					});
				},
				refresh : function () {},
				update : function () {
					throw new Error("PATCH request not allowed");
				}
			};

			oCacheProxy.promise = Promise.all([oPathPromise])
				.then(function (aResult) {
					var oCache, sCanonicalPath = aResult[0];

					if (oBinding.oCache !== oCacheProxy) {
						return oBinding.oCache;
					}
					oBinding.mCacheByContext = oBinding.mCacheByContext || {};
					oCache = oBinding.mCacheByContext[sCanonicalPath] =
						oBinding.mCacheByContext[sCanonicalPath] || fnCreateCache(sCanonicalPath);
					return oCache;
				});

			return oCacheProxy;
		},

		/**
		 * Returns the key predicate (see "4.3.1 Canonical URL") for the given entity type meta
		 * data and entity instance runtime data.
		 *
		 * @param {object} oEntityType
		 *   Entity type meta data
		 * @param {object} oEntityInstance
		 *   Entity instance runtime data
		 * @returns {string}
		 *   The key predicate, e.g. "(Sector='DevOps',ID='42')" or "('42')"
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyProperties = [],
				bSingleKey = oEntityType.$Key.length === 1;

			oEntityType.$Key.forEach(function (sName) {
				var sError,
					vValue = oEntityInstance[sName];

				if (vValue === undefined) {
					sError = "Missing value for key property '" + sName + "'";
					jQuery.sap.log.error(sError, null, "sap.ui.model.odata.v4._ODataHelper");
					throw new Error(sError);
				}
				vValue = encodeURIComponent(
					_Helper.formatLiteral(vValue, oEntityType[sName].$Type)
				);
				aKeyProperties.push(bSingleKey ? vValue : encodeURIComponent(sName) + "=" + vValue);
			});

			return "(" + aKeyProperties.join(",") + ")";
		},

		/**
		 * Converts given value to an array.
		 * <code>null</code> and <code>undefined</code> are converted to the empty array, a
		 * non-array value is wrapped with an array and an array is returned as it is.
		 *
		 * @param {any} [vElement]
		 *   The element to be converted into an array.
		 * @returns {Array}
		 *   The array for the given element.
		 */
		toArray : function (vElement) {
			if (vElement === undefined || vElement === null) {
				return [];
			}
			if (Array.isArray(vElement)) {
				return vElement;
			}
			return [vElement];
		}
	};

	return ODataHelper;
}, /* bExport= */ false);
