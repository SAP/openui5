/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Requestor
sap.ui.define([
	"jquery.sap.global",
	"sap/ui/base/SyncPromise",
	"./_Batch",
	"./_GroupLock",
	"./_Helper",
	"./_V2Requestor"
], function (jQuery, SyncPromise, _Batch, _GroupLock, _Helper, asV2Requestor) {
	"use strict";

	var mBatchHeaders = { // headers for the $batch request
			"Accept" : "multipart/mixed"
		},
		_Requestor;

	/**
	 * Deletes the queue for the given group ID if it contains only the empty change set, so that
	 * no empty batch is sent.
	 *
	 * @param {Requestor} oRequestor The requestor
	 * @param {string} sGroupId The group ID
	 */
	function deleteEmptyGroup(oRequestor, sGroupId) {
		var aBatchQueue = oRequestor.mBatchQueue[sGroupId];

		if (aBatchQueue[0].length === 0 && aBatchQueue.length === 1) {
			delete oRequestor.mBatchQueue[sGroupId];
		}
	}

	/**
	 * The getResponseHeader() method imitates the jqXHR.getResponseHeader() method for a $batch
	 * error response.
	 *
	 * @param {string} sHeaderName The header name
	 * @returns {string} The response header value
	 */
	function getResponseHeader(sHeaderName) {
		var sResponseHeader;

		sHeaderName = sHeaderName.toLowerCase();

		for (sResponseHeader in this.headers) {
			if (sResponseHeader.toLowerCase() === sHeaderName) {
				return this.headers[sResponseHeader];
			}
		}
	}

	/**
	 * Constructor for a new <code>_Requestor</code> instance for the given service URL and default
	 * headers.
	 *
	 * @param {string} sServiceUrl
	 *   URL of the service document to request the CSRF token from; also used to resolve
	 *   relative resource paths (see {@link #request})
	 * @param {object} [mHeaders={}]
	 *   Map of default headers; may be overridden with request-specific headers; certain
	 *   predefined OData V4 headers are added by default, but may be overridden
	 * @param {object} [mQueryParams={}]
	 *   A map of query parameters as described in
	 *   {@link sap.ui.model.odata.v4.lib._Helper.buildQuery}; used only to request the CSRF token
	 * @param {object} oModelInterface
	 *   A interface allowing to call back to the owning model
	 * @param {function} oModelInterface.fnFetchEntityContainer
	 *   A promise which is resolved with the $metadata "JSON" object as soon as the entity
	 *   container is fully available, or rejected with an error.
	 * @param {function} oModelInterface.fnFetchMetadata
	 *   A function that returns a SyncPromise which resolves with the metadata instance for a
	 *   given meta path
	 * @param {function} oModelInterface.fnGetGroupProperty
	 *   A function called with parameters <code>sGroupId</code> and <code>sPropertyName</code>
	 *   returning the property value in question. Only 'submit' is supported for <code>
	 *   sPropertyName</code>. Supported property values are: 'API', 'Auto' and 'Direct'.
	 * @param {function (string)} [oModelInterface.fnOnCreateGroup]
	 *   A callback function that is called with the group name as parameter when the first
	 *   request is added to a group
	 * @private
	 */
	function Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface) {
		this.mBatchQueue = {};
		this.mHeaders = mHeaders || {};
		this.oModelInterface = oModelInterface;
		this.sQueryParams = _Helper.buildQuery(mQueryParams); // Used for $batch and CSRF token only
		this.mRunningChangeRequests = {};
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
		this.sServiceUrl = sServiceUrl;
	}

	/**
	 * Final (cannot be overridden) request headers for OData V4.
	 */
	Requestor.prototype.mFinalHeaders = {
		"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
	};

	/**
	 * Predefined request headers in $batch parts for OData V4.
	 */
	Requestor.prototype.mPredefinedPartHeaders = {
		"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
	};

	/**
	 * Predefined request headers for all requests for OData V4.
	 */
	Requestor.prototype.mPredefinedRequestHeaders = {
		"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
		"OData-MaxVersion" : "4.0",
		"OData-Version" : "4.0",
		"X-CSRF-Token" : "Fetch"
	};

	/**
	 * Called when a batch request has been sent to count the number of running change requests.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} bHasChanges
	 *   Whether the batch contains change requests; when <code>true</code> the number is increased
	 */
	Requestor.prototype.batchRequestSent = function (sGroupId, bHasChanges) {
		if (bHasChanges) {
			if (sGroupId in this.mRunningChangeRequests) {
				this.mRunningChangeRequests[sGroupId] += 1;
			} else {
				this.mRunningChangeRequests[sGroupId] = 1;
			}
		}
	};

	/**
	 * Called when a batch response has been received to count the number of running change
	 * requests.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} bHasChanges
	 *   Whether the batch contained change requests; when <code>true</code> the number is
	 *   decreased
	 */
	Requestor.prototype.batchResponseReceived = function (sGroupId, bHasChanges) {
		if (bHasChanges) {
			this.mRunningChangeRequests[sGroupId] -= 1;
			if (this.mRunningChangeRequests[sGroupId] === 0) {
				delete this.mRunningChangeRequests[sGroupId];
			}
		}
	};

	/**
	 * Builds a query string from the parameter map. Converts the known OData system query
	 * options, all other OData system query options are rejected; with
	 * <code>bDropSystemQueryOptions</code> they are dropped altogether.
	 *
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} [mQueryOptions]
	 *   A map of key-value pairs representing the query string
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string}
	 *   The query string; it is empty if there are no options; it starts with "?" otherwise
	 * @example
	 * {
	 *		$expand : {
	 *			"SO_2_BP" : true,
	 *			"SO_2_SOITEM" : {
	 *				"$expand" : {
	 *					"SOITEM_2_PRODUCT" : {
	 *						"$apply" : "filter(Price gt 100)",
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
	Requestor.prototype.buildQueryString = function (sMetaPath, mQueryOptions,
			bDropSystemQueryOptions, bSortExpandSelect) {
		return _Helper.buildQuery(
			this.convertQueryOptions(sMetaPath, mQueryOptions, bDropSystemQueryOptions,
				bSortExpandSelect));
	};

	/**
	 * Cancels all change requests for a given group. All pending change requests that have a
	 * <code>$cancel</code> callback are rejected with an error with property
	 * <code>canceled = true</code>. They are canceled in reverse order to properly undo stacked
	 * changes (like multiple PATCHes for the same property).
	 *
	 * @param {string} sGroupId
	 *   The group ID to be canceled
	 * @throws {Error}
	 *   If change requests for the given group ID are running
	 *
	 * @private
	 */
	Requestor.prototype.cancelChanges = function (sGroupId) {
		if (this.mRunningChangeRequests[sGroupId]) {
			throw new Error("Cannot cancel the changes for group '" + sGroupId
				+ "', the batch request is running");
		}
		this.cancelChangesByFilter(function () {
			return true;
		}, sGroupId);
	};

	/**
	 * Cancels all change requests for which the <code>$cancel</code> callback is defined and the
	 * given filter function returns <code>true</code>. For these requests the callback is called
	 * and the related promises are rejected with an error having property
	 * <code>canceled = true</code>.
	 *
	 * @param {function} fnFilter
	 *   A filter function which gets a change request as parameter and determines whether it has
	 *   to be canceled (returns <code>true</code>) or not.
	 * @param {string} [sGroupId]
	 *   The ID of the group from which the requests shall be canceled; if not given all groups
	 *   are processed
	 * @returns {boolean}
	 *   Whether at least one request has been canceled
	 *
	 * @private
	 */
	Requestor.prototype.cancelChangesByFilter = function (fnFilter, sGroupId) {
		var bCanceled = false,
			that = this;

		function cancelGroupChangeRequests(sGroupId0) {
			var aBatchQueue = that.mBatchQueue[sGroupId0],
				oChangeRequest,
				aChangeSet,
				oError,
				i;

			aChangeSet = aBatchQueue[0];
			// restore changes in reverse order to get the same initial state
			for (i = aChangeSet.length - 1; i >= 0; i--) {
				oChangeRequest = aChangeSet[i];
				if (oChangeRequest.$cancel && fnFilter(oChangeRequest)) {
					oChangeRequest.$cancel();
					oError = new Error("Request canceled: " + oChangeRequest.method + " "
						+ oChangeRequest.url + "; group: " + sGroupId0);
					oError.canceled = true;
					oChangeRequest.$reject(oError);
					aChangeSet.splice(i, 1);
					bCanceled = true;
				}
			}
			deleteEmptyGroup(that, sGroupId0);
		}

		if (sGroupId) {
			if (this.mBatchQueue[sGroupId]) {
				cancelGroupChangeRequests(sGroupId);
			}
		} else {
			for (sGroupId in this.mBatchQueue) {
				cancelGroupChangeRequests(sGroupId);
			}
		}
		return bCanceled;
	};

	/**
	 * Converts the value for a "$expand" in mQueryParams.
	 *
	 * @param {object} mExpandItems The expand items, a map from path to options
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string} The resulting value for the query string
	 * @throws {Error} If the expand items are not an object
	 */
	Requestor.prototype.convertExpand = function (mExpandItems, bSortExpandSelect) {
		var aKeys,
			aResult = [],
			that = this;

		if (!mExpandItems || typeof mExpandItems !== "object") {
			throw new Error("$expand must be a valid object");
		}

		aKeys = Object.keys(mExpandItems);
		if (bSortExpandSelect) {
			aKeys = aKeys.sort();
		}
		aKeys.forEach(function (sExpandPath) {
			var vExpandOptions = mExpandItems[sExpandPath];

			if (vExpandOptions && typeof vExpandOptions === "object") {
				aResult.push(that.convertExpandOptions(sExpandPath, vExpandOptions,
					bSortExpandSelect));
			} else {
				aResult.push(sExpandPath);
			}
		});

		return aResult.join(",");
	};

	/**
	 * Converts the expand options.
	 *
	 * @param {string} sExpandPath The expand path
	 * @param {boolean|object} vExpandOptions
	 *   The options; either a map or simply <code>true</code>
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string} The resulting string for the OData query in the form "path" (if no
	 *   options) or "path($option1=foo;$option2=bar)"
	 */
	Requestor.prototype.convertExpandOptions = function (sExpandPath, vExpandOptions,
			bSortExpandSelect) {
		var aExpandOptions = [];

		// We do not pass a resource path, but within V4 this doesn't matter
		this.doConvertSystemQueryOptions(undefined, vExpandOptions,
			function (sOptionName, vOptionValue) {
				aExpandOptions.push(sOptionName + '=' + vOptionValue);
			},
			undefined, bSortExpandSelect);
		return aExpandOptions.length ? sExpandPath + "(" + aExpandOptions.join(";") + ")"
			: sExpandPath;
	};

	/**
	 * Converts the query options. All known OData system query options are converted to
	 * strings, so that the result can be used for _Helper.buildQuery; with
	 * <code>bDropSystemQueryOptions</code> they are dropped altogether.
	 *
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} [mQueryOptions] The query options
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {object} The converted query options or undefined if there are no query options
	 */
	Requestor.prototype.convertQueryOptions = function (sMetaPath, mQueryOptions,
			bDropSystemQueryOptions, bSortExpandSelect) {
		var mConvertedQueryOptions = {};

		if (!mQueryOptions) {
			return undefined;
		}
		this.doConvertSystemQueryOptions(sMetaPath, mQueryOptions, function (sKey, vValue) {
			mConvertedQueryOptions[sKey] = vValue;
		}, bDropSystemQueryOptions, bSortExpandSelect);
		return mConvertedQueryOptions;
	};

	/**
	 * Converts the resource path if needed. For OData V4 requests no conversion is done.
	 * May be overwritten for other OData service versions.
	 *
	 * @param {string} sResourcePath The V4 resource path
	 * @returns {string} The resource path as required for the server
	 */
	Requestor.prototype.convertResourcePath = function (sResourcePath) {
		return sResourcePath;
	};

	/**
	 * Checks whether the "OData-Version" header is set to "4.0" otherwise an error is thrown.
	 *
	 * @param {function} fnGetHeader
	 *   A callback function to get a header attribute for a given header name with case-insensitive
	 *   search by header name
	 * @param {string} sResourcePath
	 *   The resource path of the request
	 * @param {boolean} [bVersionOptional=false]
	 *   Indicates whether the OData service version is optional, which is the case for responses
	 *   contained in a response for a $batch request
	 * @throws {Error} If the "OData-Version" header is not "4.0"
	 */
	Requestor.prototype.doCheckVersionHeader = function (fnGetHeader, sResourcePath,
			bVersionOptional) {
		var sODataVersion = fnGetHeader("OData-Version"),
			vDataServiceVersion = !sODataVersion && fnGetHeader("DataServiceVersion");

		if (vDataServiceVersion) {
			throw new Error("Expected 'OData-Version' header with value '4.0' but received"
				+ " 'DataServiceVersion' header with value '" + vDataServiceVersion
				+ "' in response for " + this.sServiceUrl + sResourcePath);
		}
		if (sODataVersion === "4.0" || !sODataVersion && bVersionOptional) {
			return;
		}
		throw new Error("Expected 'OData-Version' header with value '4.0' but received value '"
			+ sODataVersion + "' in response for " + this.sServiceUrl + sResourcePath);
	};

	/**
	 * Converts the known OData system query options from map or array notation to a string. All
	 * other parameters are simply passed through.
	 * May be overwritten for other OData service versions.
	 *
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} mQueryOptions The query options
	 * @param {function(string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 */
	Requestor.prototype.doConvertSystemQueryOptions = function (sMetaPath, mQueryOptions,
			fnResultHandler, bDropSystemQueryOptions, bSortExpandSelect) {
		var that = this;

		Object.keys(mQueryOptions).forEach(function (sKey) {
			var vValue = mQueryOptions[sKey];

			if (bDropSystemQueryOptions && sKey[0] === '$') {
				return;
			}

			switch (sKey) {
				case "$expand":
					vValue = that.convertExpand(vValue, bSortExpandSelect);
					break;
				case "$select":
					if (Array.isArray(vValue)) {
						vValue = bSortExpandSelect ? vValue.sort().join(",") : vValue.join(",");
					}
					break;
				default:
				// nothing to do
			}
			fnResultHandler(sKey, vValue);
		});
	};

	/**
	 * Converts an OData response payload if needed. For OData V4 payloads no conversion is done.
	 * May be overwritten for other OData service versions. The resulting payload has to
	 * be an OData V4 payload.
	 *
	 * @param {object} oResponsePayload
	 *   The OData response payload
	 * @param {string} [sMetaPath]
	 *   The meta path corresponding to the resource path; needed in case V2 response does not
	 *   contain <code>__metadata.type</code>, for example "2.2.7.2.4 RetrievePrimitiveProperty
	 *   Request"
	 * @returns {object}
	 *   The OData V4 response payload
	 */
	Requestor.prototype.doConvertResponse = function (oResponsePayload, sMetaPath) {
		return oResponsePayload;
	};

	/**
	 * Fetches the type of the given meta path from the metadata.
	 *
	 * @param {string} sMetaPath
	 *   The meta path, e.g. SalesOrderList/SO_2_BP
	 * @param {boolean} [bAsName]
	 *   If <code>true</code>, the name of the type is delivered instead of the type itself. This
	 *   must be used when asking for a property type to avoid that the function logs an error
	 *   because there are no objects for primitive types like "Edm.Stream".
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the type at the given path or its name.
	 */
	Requestor.prototype.fetchTypeForPath = function (sMetaPath, bAsName) {
		return this.oModelInterface.fnFetchMetadata(sMetaPath + (bAsName ? "/$Type" : "/"));
	};

	/**
	 * Formats a given internal value into a literal suitable for usage in URLs.
	 *
	 * @param {any} vValue
	 *   The value according to "OData JSON Format Version 4.0" section "7.1 Primitive Value"
	 * @param {object} oProperty
	 *   The OData property
	 * @returns {string}
	 *   The literal according to "OData Version 4.0 Part 2: URL Conventions" section
	 *   "5.1.1.6.1 Primitive Literals"
	 * @throws {Error}
	 *   If the value is undefined or the type is not supported
	 */
	Requestor.prototype.formatPropertyAsLiteral = function (vValue, oProperty) {
		return _Helper.formatLiteral(vValue, oProperty.$Type);
	};

	/**
	 * Returns the submit mode for the given group Id.
	 *
	 * @param {string} sGroupId
	 *   The group Id
	 * @returns {string} 'API'|'Auto'|'Direct'
	 *
	 * @private
	 */
	Requestor.prototype.getGroupSubmitMode = function (sGroupId) {
		return this.oModelInterface.fnGetGroupProperty(sGroupId, "submit");
	};

	/**
	 * Returns the resource path relative to the service URL, including function arguments.
	 *
	 * @param {string} sPath
	 *   The absolute binding path to the bound operation or operation import, e.g.
	 *   "/Entity('0815')/bound.Operation(...)" or "/OperationImport(...)"
	 * @param {object} oOperationMetadata
	 *   The operation's metadata
	 * @param {object} mParameters
	 *   A copy of the map of key-values pairs representing the operation's actual parameters;
	 *   invalid keys are removed for actions
	 * @returns {string}
	 *   The new path without leading slash and ellipsis
	 * @throws {Error}
	 *   If a collection-valued operation parameter is encountered
	 *
	 * @private
	 */
	Requestor.prototype.getPathAndAddQueryOptions = function (sPath, oOperationMetadata,
		mParameters) {
		var aArguments = [],
			sName,
			mName2Parameter = {}, // maps valid names to parameter metadata
			oParameter,
			that = this;

		sPath = sPath.slice(1, -5);
		if (oOperationMetadata.$Parameter) {
			oOperationMetadata.$Parameter.forEach(function (oParameter) {
				mName2Parameter[oParameter.$Name] = oParameter;
			});
		}
		if (oOperationMetadata.$kind === "Function") {
			for (sName in mParameters) {
				oParameter = mName2Parameter[sName];
				if (oParameter) {
					if (oParameter.$IsCollection) {
						throw new Error("Unsupported collection-valued parameter: " + sName);
					}
					aArguments.push(encodeURIComponent(sName) + "=" + encodeURIComponent(
						that.formatPropertyAsLiteral(mParameters[sName], oParameter)));
				}
			}
			sPath += "(" + aArguments.join(",") + ")";
		} else { // Action
			for (sName in mParameters) {
				if (!(sName in mName2Parameter)) {
					delete mParameters[sName]; // remove invalid parameter
				}
			}
		}
		return sPath;
	};

	/**
	 * Returns this requestor's service URL.
	 *
	 * @returns {string}
	 *   URL of the service document to request the CSRF token from
	 */
	Requestor.prototype.getServiceUrl = function () {
		return this.sServiceUrl;
	};

	/**
	 * Returns <code>true</code> if there are pending changes.
	 *
	 * @returns {boolean} <code>true</code> if there are pending changes
	 */
	Requestor.prototype.hasPendingChanges = function () {
		var sGroupId, bPending;

		for (sGroupId in this.mBatchQueue) {
			bPending = this.mBatchQueue[sGroupId][0].some(function (oRequest) {
				return oRequest.$cancel;
			});
			if (bPending) {
				return true;
			}
		}
		return Object.keys(this.mRunningChangeRequests).length > 0;
	};

	/**
	 * Tells whether an empty object in the request body is optional for parameterless actions.
	 * For OData V4, this is false, but for 4.01 it will become true.
	 *
	 * @returns {boolean} <code>false</code>
	 *
	 * @private
	 */
	Requestor.prototype.isActionBodyOptional = function () {
		return false;
	};

	/**
	 * Tells whether change sets are optional. For OData V4, this is true.
	 *
	 * @returns {boolean} <code>true</code>
	 *
	 * @private
	 */
	Requestor.prototype.isChangeSetOptional = function () {
		return true;
	};

	/**
	 * Returns a sync promise that is resolved when the requestor is ready to be used. The V4
	 * requestor is ready immediately. Subclasses may behave differently.
	 *
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved immediately with no result
	 */
	Requestor.prototype.ready = function () {
		return SyncPromise.resolve();
	};

	/**
	 * Returns a promise that will be resolved once the CSRF token has been refreshed, or rejected
	 * if that fails. Makes sure that only one HEAD request is underway at any given time and
	 * shares the promise accordingly.
	 *
	 * @param {string} [sOldSecurityToken]
	 *   Security token that caused a 403. A new token is only fetched if the old one is still
	 *   current.
	 * @returns {Promise}
	 *   A promise that will be resolved (with no result) once the CSRF token has been refreshed.
	 *
	 * @private
	 */
	Requestor.prototype.refreshSecurityToken = function (sOldSecurityToken) {
		var that = this;

		if (!this.oSecurityTokenPromise) {
			// do not refresh security token again if a new token is already available in between
			if (sOldSecurityToken !== this.mHeaders["X-CSRF-Token"]) {
				return Promise.resolve();
			}

			this.oSecurityTokenPromise = new Promise(function (fnResolve, fnReject) {
				jQuery.ajax(that.sServiceUrl + that.sQueryParams, {
					method : "HEAD",
					headers : {
						"X-CSRF-Token" : "Fetch"
					}
				}).then(function (oData, sTextStatus, jqXHR) {
					that.mHeaders["X-CSRF-Token"] = jqXHR.getResponseHeader("X-CSRF-Token");
					that.oSecurityTokenPromise = null;
					fnResolve();
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					that.oSecurityTokenPromise = null;
					fnReject(_Helper.createError(jqXHR));
				});
			});
		}

		return this.oSecurityTokenPromise;
	};

	/**
	 * Removes the pending PATCH request for the given promise from its group. Only requests for
	 * which the <code>$cancel</code> callback is defined are removed.
	 *
	 * @param {Promise} oPromise
	 *   A promise that has been returned for a PATCH request. That request will be rejected with
	 *   an error with property <code>canceled = true</code>.
	 * @throws {Error}
	 *   If the request is not in the queue, assuming that it has been submitted already
	 *
	 * @private
	 */
	Requestor.prototype.removePatch = function (oPromise) {
		var bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
				return oChangeRequest.$promise === oPromise;
			});
		if (!bCanceled) {
			throw new Error("Cannot reset the changes, the batch request is running");
		}
	};

	/**
	 * Removes the pending POST request with the given body from the given group. Only requests for
	 * which the <code>$cancel</code> callback is defined are removed.
	 *
	 * The request's promise is rejected with an error with property <code>canceled = true</code>.
	 *
	 * @param {string} sGroupId
	 *   The ID of the group containing the request
	 * @param {object} oBody
	 *   The body of the request
	 * @throws {Error}
	 *   If the request is not in the queue, assuming that it has been submitted already
	 */
	Requestor.prototype.removePost = function (sGroupId, oBody) {
		var bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
			return oChangeRequest.body === oBody;
		}, sGroupId);
		if (!bCanceled) {
			throw new Error("Cannot reset the changes, the batch request is running");
		}
	};

	/**
	 * Sends an HTTP request using the given method to the given relative URL, using the given
	 * request-specific headers in addition to the mandatory OData V4 headers and the default
	 * headers given to the factory. Takes care of CSRF token handling. Non-GET requests are bundled
	 * into a change set, GET requests are placed after that change set. Related PATCH requests are
	 * merged.
	 *
	 * @param {string} sMethod
	 *   HTTP method, e.g. "GET"
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL for which this requestor has been created;
	 *   use "$batch" to send a batch request
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group to associate the request with; if no lock is given or its group ID has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Direct}, the request is sent immediately; for all
	 *   other group ID values, the request is added to the given group and you can use
	 *   {@link #submitBatch} to send all requests in that group.
	 * @param {object} [mHeaders]
	 *   Map of request-specific headers, overriding both the mandatory OData V4 headers and the
	 *   default headers given to the factory. This map of headers must not contain
	 *   "X-CSRF-Token" header.
	 * @param {object} [oPayload]
	 *   Data to be sent to the server; this object is live and can be modified until the request
	 *   is really sent
	 * @param {function} [fnSubmit]
	 *   A function that is called when the request has been submitted, either immediately (when
	 *   the group ID is "$direct") or via {@link #submitBatch}
	 * @param {function} [fnCancel]
	 *   A function that is called for clean-up if the request is canceled while waiting in a batch
	 *   queue, ignored for GET requests; {@link #cancelChanges} cancels this request only if this
	 *   callback is given
	 * @param {string} [sMetaPath]
	 *   The meta path corresponding to the resource path; needed in case V2 response does not
	 *   contain <code>__metadata.type</code>, for example "2.2.7.2.4 RetrievePrimitiveProperty
	 *   Request"
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request
	 * @throws {Error}
	 *   If group ID is '$cached'
	 *
	 * @private
	 */
	Requestor.prototype.request = function (sMethod, sResourcePath, oGroupLock, mHeaders, oPayload,
			fnSubmit, fnCancel, sMetaPath) {
		var sGroupId = oGroupLock && oGroupLock.getGroupId() || "$direct",
			oPromise,
			oRequest,
			that = this;

		if (sGroupId === "$cached") {
			throw new Error("Unexpected request: " + sMethod + " " + sResourcePath);
		}

		sResourcePath = this.convertResourcePath(sResourcePath);
		if (this.getGroupSubmitMode(sGroupId) !== "Direct") {
			oPromise = new Promise(function (fnResolve, fnReject) {
				var aRequests = that.mBatchQueue[sGroupId];

				if (!aRequests) {
					aRequests = that.mBatchQueue[sGroupId] = [[/*empty change set*/]];
					if (that.oModelInterface.fnOnCreateGroup) {
						that.oModelInterface.fnOnCreateGroup(sGroupId);
					}
				}
				oRequest = {
					method : sMethod,
					url : sResourcePath,
					headers : jQuery.extend({},
						that.mPredefinedPartHeaders,
						that.mHeaders,
						mHeaders,
						that.mFinalHeaders),
					body : oPayload,
					$cancel : fnCancel,
					$metaPath : sMetaPath,
					$reject : fnReject,
					$resolve : fnResolve,
					$submit : fnSubmit
				};
				if (sMethod === "GET") { // push behind change set
					aRequests.push(oRequest);
				} else { // push into change set
					aRequests[0].push(oRequest);
				}
			});
			oRequest.$promise = oPromise;
			return oPromise;
		}

		if (fnSubmit) {
			fnSubmit();
		}
		return this.sendRequest(sMethod, sResourcePath,
			jQuery.extend({}, mHeaders, this.mFinalHeaders),
			JSON.stringify(_Requestor.cleanPayload(oPayload))
		).then(function (oResponse) {
			return that.doConvertResponse(oResponse.body, sMetaPath);
		});
	};

	/**
	 * Searches the request identified by the given group and body, removes it from that group and
	 * triggers a new request with the new group ID, based on the found request.
	 * The result of the new request is delegated to the found request.
	 *
	 * @param {string} sCurrentGroupId
	 *   The ID of the group in which to search the request
	 * @param {object} oBody
	 *   The body of the request to be searched
	 * @param {string} sNewGroupId
	 *   The ID of the group for the new request
	 * @throws {Error}
	 *   If the request could not be found
	 */
	Requestor.prototype.relocate = function (sCurrentGroupId, oBody, sNewGroupId) {
		var aRequests = this.mBatchQueue[sCurrentGroupId],
			that = this,
			bFound = aRequests && aRequests[0].some(function (oChange, i) {
				if (oChange.body === oBody) {
					that.request(oChange.method, oChange.url, new _GroupLock(sNewGroupId),
							oChange.headers, oBody, oChange.$submit, oChange.$cancel)
						.then(oChange.$resolve, oChange.$reject);
					aRequests[0].splice(i, 1);
					deleteEmptyGroup(that, sCurrentGroupId);
					return true;
				}
			});

		if (!bFound) {
			throw new Error("Request not found in group '" + sCurrentGroupId + "'");
		}
	};

	/**
	 * Sends a batch request.
	 *
	 * @param {object[]} aRequests The requests
	 * @returns {Promise} A promise on the responses
	 */
	Requestor.prototype.sendBatch = function (aRequests) {
		var oBatchRequest = _Batch.serializeBatchRequest(aRequests);

		return this.sendRequest("POST", "$batch" + this.sQueryParams,
			jQuery.extend(oBatchRequest.headers, mBatchHeaders), oBatchRequest.body
		).then(function (oResponse) {
			return _Batch.deserializeBatchResponse(oResponse.contentType, oResponse.body);
		});
	};

	/**
	 * Sends the request. Fetches a new security token and resends the request once when the
	 * security token is missing or rejected.
	 *
	 * @param {string} sMethod
	 *   HTTP method, e.g. "GET"
	 * @param {string} sResourcePath
	 *   A resource path relative to the service URL for which this requestor has been created
	 * @param {object} [mHeaders]
	 *   Map of request-specific headers, overriding both the mandatory OData V4 headers and the
	 *   default headers given to the factory.
	 * @param {string} [sPayload]
	 *   Data to be sent to the server
	 * @returns {Promise}
	 *   A promise that is resolved with an object having the properties body and contentType. The
	 *   body is already an object if the Content-Type is "application/json". The promise is
	 *   rejected with an error if the request failed.
	 */
	Requestor.prototype.sendRequest = function (sMethod, sResourcePath, mHeaders, sPayload) {
		var sRequestUrl = this.sServiceUrl + sResourcePath,
			that = this;

		return new Promise(function (fnResolve, fnReject) {

			function send(bIsFreshToken) {
				var sOldCsrfToken = that.mHeaders["X-CSRF-Token"];

				return jQuery.ajax(sRequestUrl, {
					data : sPayload,
					headers : jQuery.extend({},
						that.mPredefinedRequestHeaders,
						that.mHeaders,
						mHeaders),
					method : sMethod
				}).then(function (oResponse, sTextStatus, jqXHR) {
					try {
						that.doCheckVersionHeader(jqXHR.getResponseHeader, sResourcePath);
					} catch (oError) {
						fnReject(oError);
						return;
					}
					that.mHeaders["X-CSRF-Token"]
						= jqXHR.getResponseHeader("X-CSRF-Token") || that.mHeaders["X-CSRF-Token"];
					fnResolve({
						body : oResponse,
						contentType : jqXHR.getResponseHeader("Content-Type")
					});
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");

					if (!bIsFreshToken && jqXHR.status === 403
							&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
						// refresh CSRF token and repeat original request
						that.refreshSecurityToken(sOldCsrfToken).then(function () {
							send(true);
						}, fnReject);
					} else {
						fnReject(_Helper.createError(jqXHR));
					}
				});
			}

			if (that.oSecurityTokenPromise && sMethod !== "GET") {
			    return that.oSecurityTokenPromise.then(send);
			}
			return send();
		});
	};

	/**
	 * Sends an OData batch request containing all requests referenced by the given group ID.
	 *
	 * @param {string} sGroupId
	 *   ID of the group which should be sent as an OData batch request
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 */
	Requestor.prototype.submitBatch = function (sGroupId) {
		var aChangeSet = [],
			bHasChanges,
			oPreviousChange,
			aRequests = this.mBatchQueue[sGroupId],
			that = this;

		/*
		 * Merges a change from a change set into the previous one if possible.
		 *
		 * @param {object} oPreviousChange The previous change, may be undefined
		 * @param {object} oChange The current change
		 * @returns {object} The merged body or undefined if no merge is possible
		 */
		function mergePatch(oPreviousChange, oChange) {
			var oBody, oPreviousBody, sProperty;

			if (oPreviousChange
					&& oPreviousChange.method === "PATCH"
					&& oChange.method === "PATCH"
					&& oPreviousChange.url === oChange.url
					&& jQuery.sap.equal(oPreviousChange.headers, oChange.headers)) {
				oPreviousBody = oPreviousChange.body;
				oBody = oChange.body;
				for (sProperty in oPreviousBody) {
					if (oPreviousBody[sProperty] === null
							&& oBody[sProperty] && typeof oBody[sProperty] === "object") {
						// previous PATCH sets complex property to null -> must not be merged
						return undefined;
					}
				}
				return jQuery.extend(true, oPreviousBody, oBody);
			}
			return undefined;
		}

		/*
		 * Visits the given request/response pairs, rejecting or resolving the corresponding
		 * promises accordingly.
		 *
		 * @param {object[]} aRequests
		 * @param {object[]} aResponses
		 */
		function visit(aRequests, aResponses) {
			var oCause;

			aRequests.forEach(function (vRequest, index) {
				var oError,
					oResponse,
					vResponse = aResponses[index];

				if (Array.isArray(vResponse)) {
					visit(vRequest, vResponse);
				} else if (!vResponse) {
					oError = new Error(
						"HTTP request was not processed because the previous request failed");
					oError.cause = oCause;
					vRequest.$reject(oError);
				} else if (vResponse.status >= 400) {
					vResponse.getResponseHeader = getResponseHeader;
					oCause = _Helper.createError(vResponse);
					reject(oCause, vRequest);
				} else if (vResponse.responseText) {
					oResponse = JSON.parse(vResponse.responseText);
					try {
						that.doCheckVersionHeader(getResponseHeader.bind(vResponse), vRequest.url,
							true);
						vRequest.$resolve(that.doConvertResponse(oResponse, vRequest.$metaPath));
					} catch (oErr) {
						vRequest.$reject(oErr);
					}
				} else {
					vRequest.$resolve();
				}
			});
		}

		/*
		 * (Recursively) calls $submit on the request(s)
		 *
		 * @param {object|object[]} vRequest
		 */
		function onSubmit(vRequest) {
			if (Array.isArray(vRequest)) {
				vRequest.forEach(onSubmit);
			} else if (vRequest.$submit) {
				vRequest.$submit();
			}
		}

		/*
		 * (Recursively) rejects the request(s) with the given error
		 *
		 * @param {Error} oError
		 * @param {object|object[]} vRequest
		 */
		function reject(oError, vRequest) {
			if (Array.isArray(vRequest)) {
				vRequest.forEach(reject.bind(null, oError));
			} else {
				vRequest.$reject(oError);
			}
		}

		if (!aRequests) {
			return Promise.resolve();
		}
		delete this.mBatchQueue[sGroupId];

		onSubmit(aRequests);

		// iterate over the change set and merge related PATCH requests
		aRequests[0].forEach(function (oChange) {
			var oMergedBody = mergePatch(oPreviousChange, oChange);

			if (oMergedBody) {
				oPreviousChange.body = oMergedBody;
				oChange.$resolve(oPreviousChange.$promise);
			} else { // push into change set
				aChangeSet.push(oChange);
				oPreviousChange = oChange;
			}
		});

		if (aChangeSet.length === 0) {
			aRequests.splice(0, 1); // delete empty change set
		} else if (aChangeSet.length === 1 && this.isChangeSetOptional()) {
			aRequests[0] = aChangeSet[0]; // unwrap change set
		} else {
			aRequests[0] = aChangeSet;
		}

		bHasChanges = aChangeSet.length > 0;
		this.batchRequestSent(sGroupId, bHasChanges);

		return this.sendBatch(_Requestor.cleanBatch(aRequests))
			.then(function (aResponses) {
				that.batchResponseReceived(sGroupId, bHasChanges);
				visit(aRequests, aResponses);
			}).catch(function (oError) {
				var oRequestError = new Error(
					"HTTP request was not processed because $batch failed");

				/*
				 * Rejects all given requests (recursively) with <code>oRequestError</code>.
				 *
				 * @param {object[]} aRequests
				 */
				function rejectAll(aRequests) {
					aRequests.forEach(function (vRequest) {
						if (Array.isArray(vRequest)) {
							rejectAll(vRequest);
						} else {
							vRequest.$reject(oRequestError);
						}
					});
				}

				that.batchResponseReceived(sGroupId, bHasChanges);
				oRequestError.cause = oError;
				rejectAll(aRequests);
				throw oError;
			});
	};

	/**
	 * The <code>_Requestor</code> module which offers a factory method.
	 *
	 * @private
	 */
	_Requestor = {
		/**
		 * Recursively cleans the payload of all contained requests via {@link #.cleanPayload}.
		 * Modifies the array in-place.
		 *
		 * @param {object[]} aRequests
		 *   The requests
		 * @returns {object[]}
		 *   The cleaned requests
		 *
		 * @private
		 */
		cleanBatch : function (aRequests) {
			aRequests.forEach(function (oRequest) {
				if (Array.isArray(oRequest)) {
					_Requestor.cleanBatch(oRequest);
				} else {
					oRequest.body = _Requestor.cleanPayload(oRequest.body);
				}
			});
			return aRequests;
		},

		/**
		 * Creates a duplicate of the payload where all properties starting with "@$ui5." are
		 * removed.
		 *
		 * @param {object} [oPayload]
		 *   The request payload
		 * @returns {object}
		 *   The payload without the unwanted properties (only copied if necessary)
		 *
		 * @private
		 */
		cleanPayload : function (oPayload) {
			var oResult = oPayload;
			if (oResult) {
				Object.keys(oResult).forEach(function (sKey) {
					if (sKey.indexOf("@$ui5.") === 0) {
						if (oResult === oPayload) {
							oResult = jQuery.extend({}, oPayload);
						}
						delete oResult[sKey];
					}
				});
			}
			return oResult;
		},

		/**
		 * Creates a new <code>_Requestor</code> instance for the given service URL and default
		 * headers.
		 *
		 * @param {string} sServiceUrl
		 *   URL of the service document to request the CSRF token from; also used to resolve
		 *   relative resource paths (see {@link #request})
		 * @param {object} oModelInterface
		 *   An interface allowing to call back to the owning model
		 * @param {function} oModelInterface.fnFetchEntityContainer
		 *   A promise which is resolved with the $metadata "JSON" object as soon as the entity
		 *   container is fully available, or rejected with an error.
		 * @param {function} oModelInterface.fnFetchMetadata
		 *   A function that returns a SyncPromise which resolves with the metadata instance for a
		 *   given meta path
		 * @param {function} oModelInterface.fnGetGroupProperty
		 *   A function called with parameters <code>sGroupId</code> and <code>sPropertyName</code>
		 *   returning the property value in question. Only 'submit' is supported for <code>
		 *   sPropertyName</code>. Supported property values are: 'API', 'Auto' and 'Direct'.
		 * @param {function (string)} [oModelInterface.fnOnCreateGroup]
		 *   A callback function that is called with the group name as parameter when the first
		 *   request is added to a group
		 * @param {object} [mHeaders={}]
		 *   Map of default headers; may be overridden with request-specific headers; certain
		 *   OData V4 headers are predefined, but may be overridden by the default or
		 *   request-specific headers:
		 *   <pre>{
		 *     "Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
		 *     "OData-MaxVersion" : "4.0",
		 *     "OData-Version" : "4.0"
		 *   }</pre>
		 *   The map of the default headers must not contain "X-CSRF-Token" header. The created
		 *   <code>_Requestor</code> always sets the "Content-Type" header value to
		 *   "application/json;charset=UTF-8;IEEE754Compatible=true" for OData V4 or
		 *   "application/json;charset=UTF-8" for OData V2.
		 * @param {object} [mQueryParams={}]
		 *   A map of query parameters as described in
		 *   {@link sap.ui.model.odata.v4.lib._Helper.buildQuery}; used only to request the CSRF
		 *   token
		 * @param {string} [sODataVersion="4.0"]
		 *   The version of the OData service. Supported values are "2.0" and "4.0".
		 * @returns {object}
		 *   A new <code>_Requestor</code> instance
		 */
		create : function (sServiceUrl, oModelInterface, mHeaders, mQueryParams, sODataVersion) {
			var oRequestor = new Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface);

			if (sODataVersion === "2.0") {
				asV2Requestor(oRequestor);
			}

			return oRequestor;
		}
	};

	return _Requestor;
}, /* bExport= */false);