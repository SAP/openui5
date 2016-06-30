/*!
 * ${copyright}
 */

sap.ui.define([
	"./lib/_Cache",
	"./lib/_Helper",
	"./lib/_Parser",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/odata/OperationMode",
	"sap/ui/model/Sorter"
], function (_Cache, _Helper, _Parser, FilterOperator, OperationMode, Sorter) {
	"use strict";

	var ODataHelper,
		rApplicationGroupID = /^\w+$/,
		// regular expression converting path to metadata path
		rNotMetaContext = /\([^/]*|\/\d+|^\d+\//g;

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
		aAllowedSystemQueryOptions : ["$expand", "$filter", "$orderby", "$select"],

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
		 *   canonical path and the $filter value as parameter and returns the cache.
		 * @param {Promise} [oPathPromise] Promise which resolves with a canonical path for the
		 *   cache
		 * @param {Promise} [oFilterPromise] Promise which resolves with a value for the $filter
		 *   query option to be used when creating the cache
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
		createCacheProxy : function (oBinding, fnCreateCache, oPathPromise, oFilterPromise) {
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

			oCacheProxy.promise = Promise.all([oPathPromise, oFilterPromise])
				.then(function (aResult) {
					var oCache,
						sCanonicalPath = aResult[0];

					if (oBinding.oCache !== oCacheProxy) {
						return oBinding.oCache;
					}
					oBinding.mCacheByContext = oBinding.mCacheByContext || {};
					oCache = sCanonicalPath
						? oBinding.mCacheByContext[sCanonicalPath] =
							oBinding.mCacheByContext[sCanonicalPath]
							|| fnCreateCache(sCanonicalPath, aResult[1])
						: fnCreateCache(sCanonicalPath, aResult[1]);
					return oCache;
				});

			return oCacheProxy;
		},

		/**
		 * Creates a cache proxy for the given list binding using {@link #.createCacheProxy}. Takes
		 * care of sort and filter parameters. Returns the proxy (allowing for easier testing)
		 * which itself applies the final cache directly to the binding.
		 *
		 * This is meant to be a private method of ODataListBinding which is hidden here to prevent
		 * accidental usage.
		 *
		 * Note that the context is given as a parameter and oBinding.oContext is unused because
		 * the binding's setContext calls this method before calling the superclass to ensure that
		 * the cache proxy is already created when the events are fired.
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding
		 *   The OData list binding instance
		 * @param {sap.ui.model.odata.v4.Context} [oContext]
		 *   The context instance to be used, may be omitted for absolute bindings
		 * @returns {object}
		 *   The created cache proxy or undefined if none is required
		 */
		createListCacheProxy : function (oBinding, oContext) {
			var oCacheProxy, oFilterPromise, oPathPromise, mQueryOptions;

			function createCache(sPath, sFilter) {
				var sOrderby = ODataHelper.buildOrderbyOption(oBinding.aSorters,
						mQueryOptions && mQueryOptions.$orderby);

				return _Cache.create(oBinding.oModel.oRequestor,
					_Helper.buildPath(sPath, oBinding.sPath).slice(1),
					ODataHelper.mergeQueryOptions(mQueryOptions, sOrderby, sFilter));
			}

			if (oBinding.bRelative) {
				if (!oContext || (!oBinding.mQueryOptions && !oBinding.aSorters.length
						&& !oBinding.aFilters.length && !oBinding.aApplicationFilters.length)) {
					return undefined; // no need for an own cache
				}
			} else {
				oContext = undefined; // must be ignored for absolute bindings
			}
			mQueryOptions = ODataHelper.getQueryOptions(oBinding, "", oContext);
			oPathPromise = oContext && oContext.requestCanonicalPath();
			oFilterPromise = ODataHelper.requestFilter(oBinding, oContext,
				oBinding.aApplicationFilters, oBinding.aFilters,
				mQueryOptions && mQueryOptions.$filter);
			oCacheProxy = ODataHelper.createCacheProxy(oBinding, createCache, oPathPromise,
				oFilterPromise);
			oCacheProxy.promise.then(function (oCache) {
				oBinding.oCache = oCache;
			})["catch"](function (oError) {
				oBinding.oModel.reportError("Failed to create cache for binding " + oBinding,
					"sap.ui.model.odata.v4._ODataHelper", oError);
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
		 * @throws {Error}
		 *   If there is no entity instance or if one key property is undefined
		 */
		getKeyPredicate : function (oEntityType, oEntityInstance) {
			var aKeyProperties = [],
				bSingleKey = oEntityType.$Key.length === 1;

			if (!oEntityInstance) {
				throw new Error("No instance to calculate key predicate");
			}
			oEntityType.$Key.forEach(function (sName) {
				var vValue = oEntityInstance[sName];

				if (vValue === undefined) {
					throw new Error("Missing value for key property '" + sName + "'");
				}
				vValue = encodeURIComponent(
					_Helper.formatLiteral(vValue, oEntityType[sName].$Type)
				);
				aKeyProperties.push(bSingleKey ? vValue : encodeURIComponent(sName) + "=" + vValue);
			});

			return "(" + aKeyProperties.join(",") + ")";
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
		 * @param {sap.ui.model.odata.v4.Context} oContext
		 *   The context to be used to to compute the inherited query options
		 * @returns {object}
		 *   The query options for the given path
		 *
		 * @private
		 */
		getQueryOptions : function (oBinding, sPath, oContext) {
			var oResult = oBinding.mQueryOptions;

			if (!oResult) {
				return oContext
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

			return ODataHelper.buildQueryOptions(oBinding.oModel.mUriParameters, oResult,
				ODataHelper.aAllowedSystemQueryOptions);
		},

		/**
		 * Calculates the index range to be read for the given start, length and threshold.
		 * Checks if <code>aContexts</code> entries are available for the given index range plus
		 * half the threshold left and right to it. If this is not the case, returns the read range
		 * to be read; otherwise undefined.
		 *
		 * @param {sap.ui.model.odata.v4.Context[]} aContexts
		 *   The contexts to be checked for the requested data
		 * @param {number} iStart
		 *   The start index for the data request
		 * @param {number} iLength
		 *   The number of requested entries
		 * @param {number} iThreshold
		 *   The number of additionally requested entries (prefetch)
		 * @param {number} [iMaxLength=Infinity]
		 *   The upper boundary for the total number of entries
		 * @returns {object}
		 *   Returns <code>undefined</code> if all data is available and the prefetch cache is
		 *   filled.
		 *   Otherwise returns an object with a member <code>start</code> for the start index for
		 *   the next read and <code>length</code> for the number of entries to be read.
		 */
		getReadRange : function (aContexts, iStart, iLength, iThreshold, iMaxLength) {
			var i,
				iFirstEmptyIndexLeft = -1,
				iFirstEmptyIndexRight = -1,
				iMax = Math.min(iStart + iLength + iThreshold / 2, iMaxLength || Infinity),
				iMin = Math.max(iStart - iThreshold / 2, 0),
				oResult = {length : iLength, start : iStart};

			for (i = iStart; i < iMax; i += 1) {
				if (aContexts[i] === undefined) {
					iFirstEmptyIndexRight = i;
					break;
				}
			}
			if (iThreshold === 0 && iFirstEmptyIndexRight < 0) {
				return undefined; // all data available
			}
			if (iThreshold > 0) {
				for (i = iStart - 1; i >= iMin; i -= 1) {
					if (aContexts[i] === undefined) {
						iFirstEmptyIndexLeft = i;
						break;
					}
				}
				if (iFirstEmptyIndexLeft < 0 && iFirstEmptyIndexRight < 0) {
					return undefined; // enough data available
				} else if (iFirstEmptyIndexLeft >= 0 && iFirstEmptyIndexRight >= 0) {
					// not enough data in front of and after iStart --> read 2x iThreshold
					oResult = {
						start : iStart - iThreshold,
						length : iLength + 2 * iThreshold
					};
				} else {
					// not enough data either before or after iStart
					oResult = {
						start : iFirstEmptyIndexRight >= 0
							? iFirstEmptyIndexRight
							: iFirstEmptyIndexLeft - iThreshold - iLength + 1,
						length : iLength + iThreshold
					};
				}
			}

			if (oResult.start < 0) {
				oResult.start = 0;
			}
			if (oResult.start >= iMaxLength) {
				oResult = undefined;
			}
			return oResult;
		},

		/**
		 * Merges the given values for "$orderby" and "$filter" into the given map of query options.
		 * Ensures that the original map is left unchanged, but creates a copy only if necessary.
		 *
		 * @param {object} [mQueryOptions]
		 *   The map of query options
		 * @param {string} [sOrderby]
		 *   The new value for the query option "$orderby"
		 * @param {string} [sFilter]
		 *   The new value for the query option "$filter"
		 * @returns {object}
		 *   The merged map of query options
		 */
		mergeQueryOptions : function (mQueryOptions, sOrderby, sFilter) {
			var mResult;

			function set(sProperty, sValue) {
				if (sValue && (!mQueryOptions || mQueryOptions[sProperty] !== sValue)) {
					if (!mResult) {
						mResult = mQueryOptions ? JSON.parse(JSON.stringify(mQueryOptions)) : {};
					}
					mResult[sProperty] = sValue;
				}
			}

			set("$orderby", sOrderby);
			set("$filter", sFilter);
			return mResult || mQueryOptions;
		},

		/**
		 * Requests a $filter query option value for the given list binding; the value is computed
		 * from the given arrays of dynamic application and control filters and the given static
		 * filter.
		 *
		 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding
		 *   The list binding
		 * @param {sap.ui.model.odata.v4.Context} oContext
		 *   The context instance to be used; it is given as a parameter and oBinding.oContext is
		 *   unused because the binding's setContext calls this method (indirectly) before calling
		 *   the superclass to ensure that the cache proxy is already created when the events are
		 *   fired.
		 * @param {sap.ui.model.Filter[]} aApplicationFilters
		 *   The application filters
		 * @param {sap.ui.model.Filter[]} aControlFilters
		 *   The control filters
		 * @param {string} sStaticFilter
		 *   The static filter value
		 * @returns {Promise} A promise which resolves with the $filter value or "" if the filter
		 *   arrays are empty and the static filter parameter is not given. It rejects with an error
		 *   if a filter has an unknown operator or an invalid path.
		 */
		requestFilter : function (oBinding, oContext, aApplicationFilters, aControlFilters,
				sStaticFilter) {
			var aNonEmptyFilters = [];

			/**
			 * Concatenates the given $filter values using the given separator; the resulting
			 * value is enclosed in parentheses if more than one filter value is given.
			 *
			 * @param {string[]} aFilterValues The filter values
			 * @param {string} sSeparator The separator
			 * @returns {string} The combined filter value
			 */
			function combineFilterValues(aFilterValues, sSeparator) {
				var sFilterValue = aFilterValues.join(sSeparator);

				return aFilterValues.length > 1 ? "(" + sFilterValue + ")" : sFilterValue;
			}

			/**
			 * Returns the $filter value for the given single filter using the given Edm type to
			 * format the filter's operand(s).
			 *
			 * @param {sap.ui.model.Filter} oFilter The filter
			 * @param {string} sEdmType The Edm type
			 * @returns {string} The $filter value
			 */
			function getSingleFilterValue(oFilter, sEdmType) {
				var sFilter,
					sValue = _Helper.formatLiteral(oFilter.oValue1, sEdmType),
					sFilterPath = decodeURIComponent(oFilter.sPath);

				switch (oFilter.sOperator) {
					case FilterOperator.BT :
						sFilter = sFilterPath + " ge " + sValue + " and "
							+ sFilterPath + " le "
							+ _Helper.formatLiteral(oFilter.oValue2, sEdmType);
						break;
					case FilterOperator.EQ :
					case FilterOperator.GE :
					case FilterOperator.GT :
					case FilterOperator.LE :
					case FilterOperator.LT :
					case FilterOperator.NE :
						sFilter = sFilterPath + " " + oFilter.sOperator.toLowerCase() + " "
							+ sValue;
						break;
					case FilterOperator.Contains :
					case FilterOperator.EndsWith :
					case FilterOperator.StartsWith :
						sFilter = oFilter.sOperator.toLowerCase() + "(" + sFilterPath + ","
							+ sValue + ")";
						break;
					default :
						throw new Error("Unsupported operator: " + oFilter.sOperator);
				}
				return sFilter;
			}

			/**
			 * Requests the $filter value for an array of filters; filters with the same path are
			 * grouped with a logical 'or'.
			 *
			 * @param {sap.ui.model.Filter[]} aFilters The non-empty array of filters
			 * @param {boolean} [bAnd] Whether the filters are combined with 'and'; combined with
			 *   'or' if not given
			 * @returns {Promise} A promise which resolves with the $filter value
			 */
			function requestArrayFilter(aFilters, bAnd) {
				var aFilterPromises = [],
					mFiltersByPath = {};

				aFilters.forEach(function (oFilter) {
					mFiltersByPath[oFilter.sPath] = mFiltersByPath[oFilter.sPath] || [];
					mFiltersByPath[oFilter.sPath].push(oFilter);
				});
				aFilters.forEach(function (oFilter) {
					var aFiltersForPath;

					if (oFilter.aFilters) { // array filter
						aFilterPromises.push(requestArrayFilter(oFilter.aFilters, oFilter.bAnd)
							.then(function (sArrayFilter) {
								return "(" + sArrayFilter + ")";
							})
						);
						return;
					}
					// single filter
					aFiltersForPath = mFiltersByPath[oFilter.sPath];
					if (!aFiltersForPath) { // filter group for path of oFilter already processed
						return;
					}
					delete mFiltersByPath[oFilter.sPath];
					aFilterPromises.push(requestGroupFilter(aFiltersForPath));
				});

				return Promise.all(aFilterPromises).then(function (aFilterValues) {
					return aFilterValues.join(bAnd ? " and " : " or ");
				});
			}

			/**
			 * Requests the $filter value for the given group of filters which all have the same
			 * path and thus refer to the same Edm type; the resulting filter value is
			 * the $filter values for the single filters in the group combined with a logical 'or'.
			 *
			 * @param {sap.ui.model.Filter[]} aGroupFilters The non-empty array of filters
			 * @returns {Promise} A promise which resolves with the $filter value or rejects with an
			 *   error if the filter value uses an unknown operator
			 */
			function requestGroupFilter(aGroupFilters) {
				var oMetaModel = oBinding.oModel.oMetaModel,
					oMetaContext = oMetaModel.getMetaContext(
						oBinding.oModel.resolve(oBinding.sPath, oContext)),
					oPropertyPromise = oMetaModel.requestObject(aGroupFilters[0].sPath,
						oMetaContext);

				return oPropertyPromise.then(function (oPropertyMetadata) {
					var aGroupFilterValues;

					if (!oPropertyMetadata) {
						throw new Error("Type cannot be determined, no metadata for path: "
							+ oMetaContext.getPath());
					}

					aGroupFilterValues = aGroupFilters.map(function (oGroupFilter) {
							return getSingleFilterValue(oGroupFilter, oPropertyMetadata.$Type);
						});

					return combineFilterValues(aGroupFilterValues, " or ");
				});
			}

			return Promise.all([
				requestArrayFilter(aApplicationFilters, /*bAnd*/true),
				requestArrayFilter(aControlFilters, /*bAnd*/true)
			]).then(function (aFilterValues) {
				if (aFilterValues[0]) { aNonEmptyFilters.push(aFilterValues[0]); }
				if (aFilterValues[1]) { aNonEmptyFilters.push(aFilterValues[1]); }
				if (sStaticFilter) { aNonEmptyFilters.push(sStaticFilter); }

				return combineFilterValues(aNonEmptyFilters, ") and (");
			});
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
