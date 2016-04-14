/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Cache
sap.ui.define([
	"jquery.sap.global",
	"./_Helper"
], function (jQuery, _Helper) {
	"use strict";

	var Cache;

	/**
	 * Converts the known OData system query options from map or array notation to a string. All
	 * other parameters are simply passed through.
	 *
	 * @param {object} mQueryOptions The query options
	 * @param {function(string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 */
	function convertSystemQueryOptions(mQueryOptions, fnResultHandler) {
		Object.keys(mQueryOptions).forEach(function (sKey) {
			var vValue = mQueryOptions[sKey];

			switch (sKey) {
				case "$expand":
					vValue = Cache.convertExpand(vValue);
					break;
				case "$filter":
				case "$orderby":
					break;
				case "$select":
					if (Array.isArray(vValue)) {
						vValue = vValue.join(",");
					}
					break;
				default:
					if (sKey[0] === '$') {
						throw new Error("Unsupported system query option " + sKey);
					}
			}
			fnResultHandler(sKey, vValue);
		});
	}

	/**
	 * Drills down into the given object according to <code>sPath</code>.
	 *
	 * @param {object} oResult
	 *   Some object
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function} fnLog
	 *   A function logging a warning which takes the invalid segment as parameter
	 * @returns {object}
	 *   The child object according to <code>sPath</code>
	 */
	function drillDown(oResult, sPath, fnLog) {
		if (sPath) {
			sPath.split("/").every(function (sSegment) {
				if (!oResult || typeof oResult !== "object") {
					fnLog(sSegment);
					oResult = undefined;
					return false;
				}
				oResult = oResult[sSegment];
				if (oResult === undefined) {
					fnLog(sSegment);
					return false;
				}
				return true;
			});
		}
		return oResult;
	}

	/**
	 * Fills the given array range with the given value. If iEnd is greater than the array length,
	 * elements are appended to the end, in contrast to Array.fill.
	 *
	 * @param {any[]} aArray
	 *   The array
	 * @param {any} vValue
	 *   The value
	 * @param {number} iStart
	 *   The start index
	 * @param {number} iEnd
	 *   The end index (will not be filled)
	 */
	function fill(aArray, vValue, iStart, iEnd) {
		var i;

		for (i = iStart; i < iEnd; i++) {
			aArray[i] = vValue;
		}
	}

	/**
	 * Requests the elements in the given range and places them into the aElements list. While the
	 * request is running, all indexes in this range contain the Promise.
	 * A refresh cancels all pending requests. Their promises are rejected with an error that has a
	 * property <code>canceled</code> which is set to <code>true</code>.
	 *
	 * @param {sap.ui.model.odata.v4.lib._CollectionCache} oCache
	 *   The cache
	 * @param {number} iStart
	 *   The index of the first element to request ($skip)
	 * @param {number} iEnd
	 *   The position of the last element to request ($skip + $top)
	 * @param {string} sGroupId
	 *   The group ID
	 */
	function requestElements(oCache, iStart, iEnd, sGroupId) {
		var aElements = oCache.aElements,
			iExpectedLength = iEnd - iStart,
			oPromise,
			sResourcePath = oCache.sResourcePath + "$skip=" + iStart + "&$top=" + iExpectedLength;

		oPromise = oCache.oRequestor.request("GET", sResourcePath, sGroupId)
			.then(function (oResult) {
				var i, iResultLength = oResult.value.length, oError;

				if (aElements !== oCache.aElements) {
					oError = new Error("Refresh canceled pending request: "
						+ oCache.oRequestor.getServiceUrl() + sResourcePath);
					oError.canceled = true;
					throw oError;
				}
				oCache.sContext = oResult["@odata.context"];
				if (iResultLength < iExpectedLength) {
					oCache.iMaxElements = iStart + iResultLength;
					oCache.aElements.splice(oCache.iMaxElements, iExpectedLength - iResultLength);
				}
				for (i = 0; i < iResultLength; i++) {
					oCache.aElements[iStart + i] = oResult.value[i];
				}
			})["catch"](function (oError) {
				if (aElements === oCache.aElements) {
					fill(oCache.aElements, undefined, iStart, iEnd);
				}
				throw oError;
			});

		fill(oCache.aElements, oPromise, iStart, iEnd);
	}

	/**
	 * Creates a cache for a collection of entities that performs requests using the given
	 * requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 */
	function CollectionCache(oRequestor, sResourcePath, mQueryOptions) {
		var sQuery = Cache.buildQueryString(mQueryOptions);

		sQuery += sQuery.length ? "&" : "?";
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath + sQuery;
		this.sContext = undefined;  // the "@odata.context" from the responses
		this.iMaxElements = -1;     // the max. number of elements if known, -1 otherwise
		this.aElements = [];        // the available elements
	}

	/**
	 * Returns a promise to be resolved with an OData object for a range of the requested data.
	 *
	 * @param {number} iIndex
	 *   The start index of the range; the first row has index 0
	 * @param {number} iLength
	 *   The length of the range
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the requests with
	 * @param {string} [sPath]
	 *   Relative path to drill-down into; <code>undefined</code> does not change the returned
	 *   OData response object, but <code>""</code> already drills down into the element at
	 *   <code>iIndex</code> (and requires <code>iLength === 1</code>)
	 * @param {function} [fnDataRequested]
	 *   The function is called directly after all back end requests have been triggered.
	 *   If no back end request is needed, the function is not called.
	 * @returns {Promise}
	 *   A promise to be resolved with the requested range given as an OData response object (with
	 *   "@odata.context" and the rows as an array in the property <code>value</code>) or a single
	 *   value (in case of drill-down). If an HTTP request fails, the error from the _Requestor is
	 *   returned and the requested range is reset to undefined.
	 *
	 *   A {@link #refresh} cancels all pending requests. Their promises are rejected with an error
	 *   that has a property <code>canceled</code> which is set to <code>true</code>.
	 * @throws {Error} If given index or length is less than 0
	 * @see sap.ui.model.odata.v4.lib._Requestor#request
	 */
	CollectionCache.prototype.read = function (iIndex, iLength, sGroupId, sPath, fnDataRequested) {
		var i,
			iEnd = iIndex + iLength,
			iGapStart = -1,
			bIsDataRequested = false,
			that = this;

		if (iIndex < 0) {
			throw new Error("Illegal index " + iIndex + ", must be >= 0");
		}
		if (iLength < 0) {
			throw new Error("Illegal length " + iLength + ", must be >= 0");
		} else if (iLength !== 1 && sPath != undefined) {
			throw new Error("Cannot drill-down for length " + iLength);
		}

		if (this.iMaxElements >= 0 && iEnd > this.iMaxElements) {
			iEnd = this.iMaxElements;
		}

		for (i = iIndex; i < iEnd; i++) {
			if (this.aElements[i] !== undefined) {
				if (iGapStart >= 0) {
					requestElements(this, iGapStart, i, sGroupId);
					bIsDataRequested = true;
					iGapStart = -1;
				}
			} else if (iGapStart < 0) {
				iGapStart = i;
			}
		}
		if (iGapStart >= 0) {
			requestElements(this, iGapStart, iEnd, sGroupId);
			bIsDataRequested = true;
		}

		if (bIsDataRequested && fnDataRequested) {
			fnDataRequested();
		}

		return Promise.all(this.aElements.slice(iIndex, iEnd)).then(function () {
			var oResult;

			if (sPath != undefined) {
				oResult = that.aElements[iIndex];
				return drillDown(oResult, sPath, function (sSegment) {
					jQuery.sap.log.error("Failed to drill-down into " + that.sResourcePath
						+ "$skip=" + iIndex + "&$top=1 via " + sPath
						+ ", invalid segment: " + sSegment,
						null, "sap.ui.model.odata.v4.lib._Cache");
				});
			}
			return {
				"@odata.context" : that.sContext,
				value : that.aElements.slice(iIndex, iEnd)
			};
		});
	};

	/**
	 * Clears the cache and cancels all pending {@link #read} requests.
	 */
	CollectionCache.prototype.refresh = function () {
		this.sContext = undefined;
		this.iMaxElements = -1;
		this.aElements = [];
	};

	/**
	 * Returns the cache's URL.
	 *
	 * @returns {string} The URL
	 */
	CollectionCache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	CollectionCache.prototype.update = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
		var oBody = {},
			mHeaders,
			oResult = drillDown(this.aElements, sPath),
			that = this;

		oBody[sPropertyName] = oResult[sPropertyName] = vValue;
		mHeaders = {"If-Match" : oResult["@odata.etag"]};

		return that.oRequestor.request("PATCH", sEditUrl, sGroupId, mHeaders, oBody)
			.then(function (oPatchResult) {
				for (sPropertyName in oResult) {
					if (sPropertyName in oPatchResult) {
						oResult[sPropertyName] = oPatchResult[sPropertyName];
					}
				}
				return oPatchResult;
			});
	};

	/**
	 * Creates a cache for a single entity that performs requests using the given requestor.
	 *
	 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
	 *   The requestor
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bSingleProperty]
	 *   Whether the cache is used to read a single property, not a single entity; automatic
	 *   unwrapping of <code>{value : "..."}</code> happens then
	 * @param {boolean} [bPost]
	 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may lead to
	 *   a request, {@link #read} may only read from the cache; otherwise {@link #post} throws an
	 *   error.
	 */
	function SingleCache(oRequestor, sResourcePath, mQueryOptions, bSingleProperty, bPost) {
		this.bPost = bPost;
		this.bPosting = false;
		this.oRequestor = oRequestor;
		this.sResourcePath = sResourcePath + Cache.buildQueryString(mQueryOptions);
		this.bSingleProperty = bSingleProperty;
		this.oPromise = null;
	}

	/**
	 * Returns a promise to be resolved with an OData object for a POST request with the given data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {object} [oData]
	 *   The data to be sent with the POST request
	 * @returns {Promise}
	 *   A promise to be resolved with the result of the request.
	 * @throws {Error}
	 *   If the cache does not allow POST or another POST is still being processed.
	 */
	SingleCache.prototype.post = function (sGroupId, oData) {
		var that = this;

		if (!this.bPost) {
			throw new Error("POST request not allowed");
		}
		// We disallow parallel POSTs because they represent OData actions which must not be
		// canceled. However we cannot decide which POST has been processed last on the server, so
		// we cannot tell which response represents the final server state.
		if (this.bPosting) {
			throw new Error("Parallel POST requests not allowed");
		}
		this.oPromise = this.oRequestor.request("POST", this.sResourcePath, sGroupId, undefined,
				oData)
			.then(function (oResult) {
				that.bPosting = false;
				return oResult;
			}, function (oError) {
				that.bPosting = false;
				throw oError;
			});
		this.bPosting = true;
		return this.oPromise;
	};

	/**
	 * Returns a promise to be resolved with an OData object for the requested data.
	 *
	 * @param {string} [sGroupId]
	 *   ID of the group to associate the request with;
	 *   see {sap.ui.model.odata.v4.lib._Requestor#request} for details
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @param {function()} [fnDataRequested]
	 *   The function is called directly after the back end request has been triggered.
	 *   If no back end request is needed, the function is not called.
	 * @returns {Promise}
	 *   A promise to be resolved with the element.
	 *
	 *   A {@link #refresh} cancels a pending request. Its promise is rejected with an error that
	 *   has a property <code>canceled</code> which is set to <code>true</code>.
	 * @throws {Error}
	 *   If the cache is using POST but no POST request has been sent yet
	 */
	SingleCache.prototype.read = function (sGroupId, sPath, fnDataRequested) {
		var that = this,
			oPromise,
			sResourcePath = this.sResourcePath;

		if (!this.oPromise) {
			if (this.bPost) {
				throw new Error("Read before a POST request");
			}
			oPromise = this.oRequestor.request("GET", sResourcePath, sGroupId)
				.then(function (oResult) {
					var oError;

					if (that.oPromise !== oPromise) {
						oError = new Error("Refresh canceled pending request: "
							+ that);
						oError.canceled = true;
						throw oError;
					}
					return oResult;
				});
			if (fnDataRequested) {
				fnDataRequested();
			}
			this.oPromise = oPromise;
		}
		return this.oPromise.then(function (oResult) {
			if (that.bSingleProperty) {
				// 204 No Content: map undefined to null
				oResult = oResult ? oResult.value : null;
			}
			if (sPath) {
				return drillDown(oResult, sPath, function (sSegment) {
					jQuery.sap.log.error("Failed to drill-down into " + sResourcePath + "/"
							+ sPath + ", invalid segment: " + sSegment, null,
						"sap.ui.model.odata.v4.lib._Cache");
				});
			}
			return oResult;
		});
	};

	/**
	 * Clears the cache and cancels a pending {@link #read} request.
	 *
	 * @throws {Error}
	 *   If the cache is using POST requests
	 */
	SingleCache.prototype.refresh = function () {
		if (this.bPost) {
			throw new Error("Refresh not allowed when using POST");
		}
		this.oPromise = undefined;
	};

	/**
	 * Returns the single cache's URL.
	 *
	 * @returns {string} The URL
	 */
	SingleCache.prototype.toString = function () {
		return this.oRequestor.getServiceUrl() + this.sResourcePath;
	};

	/**
	 * Updates the property of the given name with the given new value (and later with the server's
	 * response), using the given group ID for batch control and the given edit URL to send a PATCH
	 * request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {string} sPropertyName
	 *   Name of property to update
	 * @param {any} vValue
	 *   The new value
	 * @param {string} sEditUrl
	 *   The edit URL for the entity which is updated via PATCH
	 * @param {string} [sPath]
	 *   Relative path to drill-down into
	 * @returns {Promise}
	 *   A promise for the PATCH request
	 */
	SingleCache.prototype.update = function (sGroupId, sPropertyName, vValue, sEditUrl, sPath) {
		var that = this;

		return this.oPromise.then(function (oResult) {
			var oBody = {},
				mHeaders;

			oResult = drillDown(oResult, sPath);
			oBody[sPropertyName]
				= oResult[that.bSingleProperty ? "value" : sPropertyName] = vValue;
			mHeaders = {"If-Match" : oResult["@odata.etag"]};

			return that.oRequestor.request("PATCH", sEditUrl, sGroupId, mHeaders, oBody)
				.then(function (oPatchResult) {
					if (that.bSingleProperty) {
						oResult.value = oPatchResult[sPropertyName];
					} else {
						for (sPropertyName in oResult) {
							if (sPropertyName in oPatchResult) {
								oResult[sPropertyName] = oPatchResult[sPropertyName];
							}
						}
					}
					return oPatchResult;
				});
		});
	};

	Cache = {
		/**
		 * Builds a query string from the parameter map. Converts $select (which may be an array)
		 * and $expand (which must be an object) accordingly. All other system query options are
		 * rejected.
		 *
		 * @param {object} mQueryOptions
		 *   A map of key-value pairs representing the query string
		 * @returns {string}
		 *   The query string; it is empty if there are no options; it starts with "?" otherwise
		 * @example
		 * {
		 *		$expand : {
		 *			"SO_2_BP" : true,
		 *			"SO_2_SOITEM" : {
		 *				"$expand" : {
		 *					"SOITEM_2_PRODUCT" : {
		 *						"$expand" : {
		 *							"PRODUCT_2_BP" : null,
		 *						},
		 *						"$select" : "CurrencyCode"
		 *					},
		 *					"SOITEM_2_SO" : null
		 *				}
		 *			}
		 *		},
		 *		"sap-client" : "003"
		 *	}
		 */
		buildQueryString : function (mQueryOptions) {
			return _Helper.buildQuery(Cache.convertQueryOptions(mQueryOptions));
		},

		/**
		 *  Converts the value for a "$expand" in mQueryParams.
		 *
		 *  @param {object} mExpandItems The expand items, a map from path to options
		 *  @returns {string} The resulting value for the query string
		 *  @throws {Error} If the expand items are not an object
		 */
		convertExpand : function (mExpandItems) {
			var aResult = [];

			if (!mExpandItems || typeof mExpandItems  !== "object") {
				throw new Error("$expand must be a valid object");
			}

			Object.keys(mExpandItems).forEach(function (sExpandPath) {
				var vExpandOptions = mExpandItems[sExpandPath];

				if (vExpandOptions && typeof vExpandOptions === "object") {
					aResult.push(Cache.convertExpandOptions(sExpandPath, vExpandOptions));
				} else {
					aResult.push(sExpandPath);
				}
			});

			return aResult.join(",");
		},

		/**
		 * Converts the expand options.
		 *
		 * @param {string} sExpandPath The expand path
		 * @param {boolean|object} vExpandOptions
		 *   The options; either a map or simply <code>true</code>
		 * @returns {string} The resulting string for the OData query in the form "path" (if no
		 *   options) or "path($option1=foo;$option2=bar)"
		 */
		convertExpandOptions : function (sExpandPath, vExpandOptions) {
			var aExpandOptions = [];

			convertSystemQueryOptions(vExpandOptions, function (sOptionName, vOptionValue) {
				aExpandOptions.push(sOptionName + '=' + vOptionValue);
			});
			return aExpandOptions.length ? sExpandPath + "(" + aExpandOptions.join(";") + ")"
				: sExpandPath;
		},

		/**
		 * Converts the query options. All system query options are converted to strings, so that
		 * the result can be used for _Helper.buildQuery.
		 *
		 * @param {object} mQueryOptions The query options
		 * @returns {object} The converted query options
		 */
		convertQueryOptions : function (mQueryOptions) {
			var mConvertedQueryOptions = {};

			if (!mQueryOptions) {
				return undefined;
			}
			convertSystemQueryOptions(mQueryOptions, function (sKey, vValue) {
				mConvertedQueryOptions[sKey] = vValue;
			});
			return mConvertedQueryOptions;
		},

		/**
		 * Creates a cache for a collection of entities that performs requests using the given
		 * requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   The requestor
		 * @param {string} sResourcePath
		 *   A resource path relative to the service URL; it must not contain a query string<br>
		 *   Example: Products
		 * @param {object} mQueryOptions
		 *   A map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
		 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		create : function _create(oRequestor, sResourcePath, mQueryOptions) {
			return new CollectionCache(oRequestor, sResourcePath, mQueryOptions);
		},

		/**
		 * Creates a cache for a single entity that performs requests using the given requestor.
		 *
		 * @param {sap.ui.model.odata.v4.lib._Requestor} oRequestor
		 *   The requestor
		 * @param {string} sResourcePath
		 *   A resource path relative to the service URL; it must not contain a query string<br>
		 *   Example: Products
		 * @param {object} [mQueryOptions]
		 *   A map of key-value pairs representing the query string, the value in this pair has to
		 *   be a string or an array of strings; if it is an array, the resulting query string
		 *   repeats the key for each array value.
		 *   Examples:
		 *   {foo : "bar", "bar" : "baz"} results in the query string "foo=bar&bar=baz"
		 *   {foo : ["bar", "baz"]} results in the query string "foo=bar&foo=baz"
		 * @param {boolean} [bSingleProperty]
		 *   Whether the cache is used to read a single property, not a single entity; automatic
		 *   unwrapping of <code>{value : "..."}</code> happens then
		 * @param {boolean} [bPost]
		 *   Whether the cache uses POST requests. If <code>true</code>, only {@link #post} may
		 *   lead to a request, {@link #read} may only read from the cache; otherwise {@link #post}
		 *   throws an error.
		 * @returns {sap.ui.model.odata.v4.lib._Cache}
		 *   The cache
		 */
		createSingle : function _createSingle(oRequestor, sResourcePath, mQueryOptions,
				bSingleProperty, bPost) {
			return new SingleCache(oRequestor, sResourcePath, mQueryOptions, bSingleProperty,
				bPost);
		}
	};

	return Cache;
}, /* bExport= */false);
