/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib._Requestor
sap.ui.define([
	"./_Batch",
	"./_GroupLock",
	"./_Helper",
	"./_V2Requestor",
	"sap/base/Log",
	"sap/ui/base/SyncPromise",
	"sap/ui/thirdparty/jquery"
], function (_Batch, _GroupLock, _Helper, asV2Requestor, Log, SyncPromise, jQuery) {
	"use strict";

	var mBatchHeaders = { // headers for the $batch request
			"Accept" : "multipart/mixed"
		},
		sClassName = "sap.ui.model.odata.v4.lib._Requestor",
		_Requestor,
		rTimeout = /^\d+$/;

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
	 * @param {function} oModelInterface.fetchEntityContainer
	 *   A promise which is resolved with the $metadata "JSON" object as soon as the entity
	 *   container is fully available, or rejected with an error.
	 * @param {function} oModelInterface.fetchMetadata
	 *   A function that returns a SyncPromise which resolves with the metadata instance for a
	 *   given meta path
	 * @param {function} oModelInterface.getGroupProperty
	 *   A function called with parameters <code>sGroupId</code> and <code>sPropertyName</code>
	 *   returning the property value in question. Only 'submit' is supported for <code>
	 *   sPropertyName</code>. Supported property values are: 'API', 'Auto' and 'Direct'.
	 * @param {function} oModelInterface.reportBoundMessages
	 *   A function for reporting bound messages; see {@link #reportBoundMessages} for the signature
	 *   of this function
	 * @param {function} oModelInterface.reportUnboundMessages
	 *   A function called with parameters <code>sResourcePath</code> and <code>sMessages</code>
	 *   reporting unbound OData messages to the {@link sap.ui.core.message.MessageManager}.
	 * @param {function (string)} [oModelInterface.onCreateGroup]
	 *   A callback function that is called with the group name as parameter when the first
	 *   request is added to a group
	 *
	 * @private
	 */
	function Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface) {
		this.mBatchQueue = {};
		this.mHeaders = mHeaders || {};
		this.aLockedGroupLocks = [];
		this.oModelInterface = oModelInterface;
		this.sQueryParams = _Helper.buildQuery(mQueryParams); // Used for $batch and CSRF token only
		this.mRunningChangeRequests = {}; // map from group ID to a SyncPromise
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
		this.iSessionTimer = 0;
		this.iSerialNumber = 0;
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
	 * OData V4 request headers reserved for internal use.
	 */
	Requestor.prototype.mReservedHeaders = {
		accept : true,
		"accept-charset" : true,
		"content-encoding" : true,
		"content-id" : true,
		"content-language" : true,
		"content-length" : true,
		"content-transfer-encoding" : true,
		"content-type" : true,
		"if-match" : true,
		"if-none-match" : true,
		isolation : true,
		"odata-isolation" : true,
		"odata-maxversion" : true,
		"odata-version" : true,
		prefer : true,
		"sap-contextid" : true
	};

	/**
	 * Adds a change set to the batch queue for the given group. All modifying requests created
	 * until the next call to this method are added to this new change set.
	 *
	 * @param {string} sGroupId The group ID
	 *
	 * @public
	 */
	Requestor.prototype.addChangeSet = function (sGroupId) {
		var aChangeSet = [],
			aRequests = this.getOrCreateBatchQueue(sGroupId);

		aChangeSet.iSerialNumber = this.getSerialNumber();
		aRequests.iChangeSet += 1;
		aRequests.splice(aRequests.iChangeSet, 0, aChangeSet);
	};

	/**
	 * Adds the given change to the given group.
	 *
	 * @param {object} oChange The change
	 * @param {string} sGroupId The group ID
	 *
	 * @private
	 */
	Requestor.prototype.addChangeToGroup = function (oChange, sGroupId) {
		var aRequests;

		if (this.getGroupSubmitMode(sGroupId) === "Direct") {
			oChange.$resolve(
				this.request(oChange.method, oChange.url,
					this.lockGroup(sGroupId, this, true, true),
					oChange.headers, oChange.body, oChange.$submit, oChange.$cancel));
		} else {
			aRequests = this.getOrCreateBatchQueue(sGroupId);
			aRequests[aRequests.iChangeSet].push(oChange);
		}
	};

	/**
	 * Adds the given query options to the resource path, which itself may already have query
	 * options.
	 *
	 * @param {string} sResourcePath The resource path with poss. query options
	 * @param {string} sMetaPath The absolute meta path matching the resource path
	 * @param {object} mQueryOptions Query options to add to the resource path
	 * @returns {string} The resource path with the query options
	 *
	 * @private
	 */
	Requestor.prototype.addQueryString = function (sResourcePath, sMetaPath, mQueryOptions) {
		var sQueryString = this.buildQueryString(sMetaPath, mQueryOptions, false, true);

		return sResourcePath +
			(sResourcePath.includes("?") ? "&" + sQueryString.slice(1) : sQueryString);
	};

	/**
	 * Called when a batch request for the given group ID has been sent.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} bHasChanges
	 *   Whether the batch contains change requests; when <code>true</code> this is memorized in an
	 *   internal map
	 * @throws {Error}
	 *   If there is already a batch request containing change requests
	 *
	 * @private
	 * @see #batchResponseReceived
	 * @see #hasPendingChanges
	 * @see #waitForRunningChangeRequests
	 */
	Requestor.prototype.batchRequestSent = function (sGroupId, bHasChanges) {
		var oPromise,
			fnResolve;

		if (bHasChanges) {
			if (this.mRunningChangeRequests[sGroupId]) {
				throw new Error("Unexpected second $batch");
			}
			// The resolving of this promise is truly async
			oPromise = new SyncPromise(function (resolve) {
				fnResolve = resolve;
			});
			oPromise.$resolve = fnResolve;
			this.mRunningChangeRequests[sGroupId] = oPromise;
		}
	};

	/**
	 * Called when a batch response for the given has been received.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {boolean} bHasChanges
	 *   Whether the batch contained change requests; when <code>true</code> the entry memorized in
	 *   the internal map is deleted
	 *
	 * @private
	 * @see #batchResponseSent
	 * @see #hasPendingChanges
	 * @see #waitForRunningChangeRequests
	 */
	Requestor.prototype.batchResponseReceived = function (sGroupId, bHasChanges) {
		if (bHasChanges) {
			// no handler can run synchronously
			this.mRunningChangeRequests[sGroupId].$resolve();
			delete this.mRunningChangeRequests[sGroupId];
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
	 *
	 * @public
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
	 * Additionally cancels all modifying group locks so that they won't create a request.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be canceled
	 * @throws {Error}
	 *   If change requests for the given group ID are running
	 *
	 * @public
	 */
	Requestor.prototype.cancelChanges = function (sGroupId) {
		if (this.mRunningChangeRequests[sGroupId]) {
			throw new Error("Cannot cancel the changes for group '" + sGroupId
				+ "', the batch request is running");
		}
		this.cancelChangesByFilter(function () {
			return true;
		}, sGroupId);
		this.cancelGroupLocks(sGroupId);
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
				i,
				j;

			// restore changes in reverse order to get the same initial state
			for (j = aBatchQueue.length - 1; j >= 0; j -= 1) {
				if (Array.isArray(aBatchQueue[j])) {
					aChangeSet = aBatchQueue[j];
					for (i = aChangeSet.length - 1; i >= 0; i -= 1) {
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
				}
			}
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
	 * Cancels all modifying and locked group locks for the given group ID or for all groups.
	 * Requests that are later created using such a canceled group lock will be rejected.
	 *
	 * @param {string} [sGroupId]
	 *   The ID of the group from which the locks shall be canceled; if not given all groups are
	 *   processed
	 */
	Requestor.prototype.cancelGroupLocks = function (sGroupId) {
		this.aLockedGroupLocks.forEach(function (oGroupLock) {
			if ((!sGroupId || sGroupId === oGroupLock.getGroupId())
					&& oGroupLock.isModifying() && oGroupLock.isLocked()) {
				oGroupLock.cancel();
			}
		});
	};

	/**
	 * Checks if there are open requests. Open requests are announced, pending, or running change
	 * requests.
	 *
	 * @throws {Error}
	 *   If there are open requests
	 *
	 * @public
	 */
	Requestor.prototype.checkForOpenRequests = function () {
		var that = this;

		if (Object.keys(this.mRunningChangeRequests).length // running change requests
			|| Object.keys(this.mBatchQueue).some(function (sGroupId) { // pending requests
				return that.mBatchQueue[sGroupId].some(function (vRequest) {
					return Array.isArray(vRequest) ? vRequest.length : true;
				});
			})
			|| this.aLockedGroupLocks.some(function (oGroupLock) { // announced requests
				return oGroupLock.isLocked();
			})) {
			throw new Error("Unexpected open requests");
		}
	};

	/**
	 * Checks if the given headers are allowed.
	 *
	 * @param {object} mHeaders
	 *   Map of HTTP header names to their values
	 * @throws {Error}
	 *   If <code>mHeaders</code> contains unsupported headers
	 *
	 * @public
	 */
	Requestor.prototype.checkHeaderNames = function (mHeaders) {
		var sKey;

		for (sKey in mHeaders) {
			if (this.mReservedHeaders[sKey.toLowerCase()]) {
				throw new Error("Unsupported header: " + sKey);
			}
		}
	};

	/**
	 * Cleans up the change sets contained in the given requests by merging PATCHes, deleting
	 * empty change sets and unwrapping change sets containing only one request in case change sets
	 * are optional.
	 *
	 * @param {object[]} aRequests The requests
	 * @returns {boolean} Whether there is a modifying request in aRequests
	 *
	 * @private
	 * @see sap.ui.model.odata.v4.lib.Requestor#isChangeSetOptional
	 */
	Requestor.prototype.cleanUpChangeSets = function (aRequests) {
		var aChangeSet,
			bHasChanges = false,
			i;

		/*
		 * Adds the given change request to the change set unless it merges with an existing PATCH.
		 *
		 * @param {object} oChange The current change
		 */
		function addToChangeSet(oChange) {
			if (!mergePatch(oChange)) {
				aChangeSet.push(oChange);
			}
		}

		/*
		 * Merges the given change into a "PATCH"-change contained in the change set if possible.
		 *
		 * @param {object} oChange The current change
		 * @returns {boolean} Whether the current change is merged into a change in the change set
		 */
		function mergePatch(oChange) {
			if (oChange.method !== "PATCH") {
				return false;
			}
			return aChangeSet.some(function (oCandidate) {
				if (oCandidate.method === "PATCH"
						&& oCandidate.headers["If-Match"] === oChange.headers["If-Match"]) {
					jQuery.extend(true, oCandidate.body, oChange.body);
					oChange.$resolve(oCandidate.$promise);
					return true;
				}
			});
		}

		for (i = aRequests.iChangeSet; i >= 0; i -= 1) {
			aChangeSet = [];
			aRequests[i].forEach(addToChangeSet);
			if (aChangeSet.length === 0) {
				aRequests.splice(i, 1); // delete empty change set
			} else if (aChangeSet.length === 1 && this.isChangeSetOptional()) {
				aRequests[i] = aChangeSet[0]; // unwrap change set
			} else {
				aRequests[i] = aChangeSet;
			}
			bHasChanges = bHasChanges || aChangeSet.length > 0;
		}

		return bHasChanges;
	};

	/**
	 * Clears the session context and its keep-alive timer and fires a 'sessionTimeout' event if
	 * required.
	 *
	 * @param {boolean} [bTimeout] - Whether the reason is a session timeout
	 *
	 * @private
	 */
	Requestor.prototype.clearSessionContext = function (bTimeout) {
		if (bTimeout) {
			this.oModelInterface.fireSessionTimeout();
		}
		delete this.mHeaders["SAP-ContextId"];
		if (this.iSessionTimer) {
			clearInterval(this.iSessionTimer);
			this.iSessionTimer = 0;
		}
	};

	/**
	 * Converts the value for a "$expand" in mQueryParams.
	 *
	 * @param {object} mExpandItems The expand items, a map from path to options
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string} The resulting value for the query string
	 * @throws {Error} If the expand items are not an object
	 *
	 * @private
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
	 *
	 * @private
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
	 *
	 * @private
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
	 *
	 * @private
	 */
	Requestor.prototype.convertResourcePath = function (sResourcePath) {
		return sResourcePath;
	};

	/**
	 * Destroys this requestor.
	 *
	 * @private
	 */
	Requestor.prototype.destroy = function () {
		this.clearSessionContext();
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
	 *
	 * @private
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
	 *
	 * @private
	 */
	Requestor.prototype.doConvertResponse = function (oResponsePayload, sMetaPath) {
		return oResponsePayload;
	};

	/**
	 * Converts the known OData system query options from map or array notation to a string. All
	 * other parameters are simply passed through.
	 * May be overwritten for other OData service versions.
	 *
	 * @param {string} sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} mQueryOptions The query options
	 * @param {function (string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions=false]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect=false]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 *
	 * @private
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
	 * Fetches the type of the given meta path from the metadata.
	 *
	 * @param {string} sMetaPath
	 *   The meta path, e.g. "/SalesOrderList/SO_2_BP"
	 * @param {boolean} [bAsName]
	 *   If <code>true</code>, the name of the type is delivered instead of the type itself. This
	 *   must be used when asking for a property type to avoid that the function logs an error
	 *   because there are no objects for primitive types like "Edm.Stream".
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the type at the given path or its name.
	 *
	 * @private
	 */
	Requestor.prototype.fetchTypeForPath = function (sMetaPath, bAsName) {
		return this.oModelInterface.fetchMetadata(sMetaPath + (bAsName ? "/$Type" : "/"));
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
	 *
	 * @private
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
		return this.oModelInterface.getGroupProperty(sGroupId, "submit");
	};

	/**
	 * Returns the model interface as passed as parameter to {@link #create}.
	 *
	 * @returns {object} The model interface
	 *
	 * @private
	 */
	Requestor.prototype.getModelInterface = function () {
		return this.oModelInterface;
	};

	/**
	*  Get the batch queue for the given group or create it if it does not exist yet.
	*
	*  @param {string} sGroupId The group ID
	*  @returns {object[]} The batch queue for the group
	*
	 * @private
	 */
	Requestor.prototype.getOrCreateBatchQueue = function (sGroupId) {
		var aChangeSet,
			aRequests = this.mBatchQueue[sGroupId];

		if (!aRequests) {
			aChangeSet = [];
			aChangeSet.iSerialNumber = 0;
			aRequests = this.mBatchQueue[sGroupId] = [aChangeSet];
			aRequests.iChangeSet = 0; // the index of the current change set in this queue
			if (this.oModelInterface.onCreateGroup) {
				this.oModelInterface.onCreateGroup(sGroupId);
			}
		}
		return aRequests;
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
	 * @public
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
					if (oParameter.$isCollection) {
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
	 * Gets the serial number for a request or change set.
	 *
	 * @returns {number}
	 *   The serial number
	 *
	 * @public
	 */
	Requestor.prototype.getSerialNumber = function () {
		// starts with 1 as first change set created in getOrCreateBatchQueue has serial number 0
		this.iSerialNumber += 1;
		return this.iSerialNumber;
	};

	/**
	 * Returns this requestor's service URL.
	 *
	 * @returns {string}
	 *   URL of the service document to request the CSRF token from
	 *
	 * @private
	 */
	Requestor.prototype.getServiceUrl = function () {
		return this.sServiceUrl;
	};

	/**
	 * Tells whether there are changes for the given group ID and given entity.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object} oEntity
	 *   The entity used to identify a request based on its "If-Match" header
	 * @returns {boolean}
	 *   Whether there are changes for the given group ID and given entity
	 *
	 * @public
	 */
	Requestor.prototype.hasChanges = function (sGroupId, oEntity) {
		var aRequests = this.mBatchQueue[sGroupId];

		if (aRequests) {
			return aRequests.some(function (vRequests) {
				return Array.isArray(vRequests) && vRequests.some(function (oRequest) {
					return oRequest.headers["If-Match"] === oEntity;
				});
			});
		}
		return false;
	};

	/**
	 * Returns <code>true</code> if there are pending changes for the given group ID.
	 *
	 * @param {string} [sGroupId]
	 *   The ID of the group to be checked; if not supplied all groups are checked for pending
	 *   changes (since 1.70.0)
	 * @returns {boolean} <code>true</code> if there are pending changes
	 *
	 * @public
	 */
	Requestor.prototype.hasPendingChanges = function (sGroupId) {
		var that = this;

		function filter(mMap) {
			if (!sGroupId) {
				return Object.keys(mMap);
			}

			return sGroupId in mMap ? [sGroupId] : [];
		}

		return filter(this.mRunningChangeRequests).length > 0
			|| this.aLockedGroupLocks.some(function (oGroupLock) {
				return (sGroupId === undefined || oGroupLock.getGroupId() === sGroupId)
					// aLockedGroupLocks may contain modifying group locks that have been unlocked
					// already; cleanup of aLockedGroupLocks is done only in #submitBacth. An
					// unlocked group lock is not relevant because either the corresponding change
					// has been reset or it has been added to the batch queue.
					&& oGroupLock.isModifying() && oGroupLock.isLocked();
			})
			|| filter(this.mBatchQueue).some(function (sGroupId0) {
				return that.mBatchQueue[sGroupId0].some(function (vRequests) {
					return Array.isArray(vRequests) && vRequests.some(function (oRequest) {
						return oRequest.$cancel;
					});
				});
			});
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
	 * Merges all GET requests that are marked as mergeable, have the same resource path and the
	 * same query options besides $expand and $select. One request with the merged $expand and
	 * $select is left in the queue and all merged requests get the response of this one remaining
	 * request.
	 *
	 * @param {object[]} aRequests The batch queue
	 * @returns {object[]} The adjusted batch queue
	 */
	Requestor.prototype.mergeGetRequests = function (aRequests) {
		var aResultingRequests = [],
			that = this;

		function merge(oRequest) {
			return oRequest.$queryOptions && aResultingRequests.some(function (oCandidate) {
				if (oCandidate.$queryOptions && oRequest.url === oCandidate.url) {
					_Helper.aggregateQueryOptions(oCandidate.$queryOptions, oRequest.$queryOptions);
					oRequest.$resolve(oCandidate.$promise);

					return true;
				}

				return false;
			});
		}

		aRequests.forEach(function (oRequest) {
			if (!merge(oRequest)) {
				aResultingRequests.push(oRequest);
			}
		});
		aResultingRequests.forEach(function (oRequest) {
			if (oRequest.$queryOptions) {
				oRequest.url
					= that.addQueryString(oRequest.url, oRequest.$metaPath, oRequest.$queryOptions);
			}
		});
		aResultingRequests.iChangeSet = aRequests.iChangeSet;

		return aResultingRequests;
	};

	/**
	 * Sends an OData batch request containing all requests referenced by the given group ID and
	 * processes the responses by dispatching them to the appropriate handlers.
	 *
	 * @param {string} sGroupId
	 *   ID of the group which should be sent as an OData batch request
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails
	 * @throws {Error}
	 *   If there is already a batch request containing change requests
	 *
	 * @private
	 */
	Requestor.prototype.processBatch = function (sGroupId) {
		var bHasChanges,
			aRequests = this.mBatchQueue[sGroupId] || [],
			that = this;

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
					sETag,
					oResponse,
					vResponse = aResponses[index];

				if (Array.isArray(vResponse)) {
					visit(vRequest, vResponse);
				} else if (!vResponse) {
					oError = new Error(
						"HTTP request was not processed because the previous request failed");
					oError.cause = oCause;
					oError.$reported = true; // do not create a message for this error
					vRequest.$reject(oError);
				} else if (vResponse.status >= 400) {
					vResponse.getResponseHeader = getResponseHeader;
					oCause = _Helper.createError(vResponse, "Communication error", vRequest.url,
						vRequest.$resourcePath);
					reject(oCause, vRequest);
				} else {
					if (vResponse.responseText) {
						try {
							that.doCheckVersionHeader(getResponseHeader.bind(vResponse),
								vRequest.url, true);
							oResponse = that.doConvertResponse(JSON.parse(vResponse.responseText),
								vRequest.$metaPath);
						} catch (oErr) {
							vRequest.$reject(oErr);
							return;
						}
					} else { // e.g. 204 No Content
						oResponse = {/*null object pattern*/};
					}
					that.reportUnboundMessagesAsJSON(vRequest.url,
						getResponseHeader.call(vResponse, "sap-messages"));
					sETag = getResponseHeader.call(vResponse, "ETag");
					if (sETag) {
						oResponse["@odata.etag"] = sETag;
					}
					vRequest.$resolve(oResponse);
				}
			});
		}

		delete this.mBatchQueue[sGroupId];
		onSubmit(aRequests);
		bHasChanges = this.cleanUpChangeSets(aRequests);
		if (aRequests.length === 0) {
			return Promise.resolve();
		}

		this.batchRequestSent(sGroupId, bHasChanges);
		aRequests = this.mergeGetRequests(aRequests);
		return this.sendBatch(_Requestor.cleanBatch(aRequests))
			.then(function (aResponses) {
				visit(aRequests, aResponses);
			}).catch(function (oError) {
				var oRequestError = new Error(
					"HTTP request was not processed because $batch failed");

				oRequestError.cause = oError;
				reject(oRequestError, aRequests);
				throw oError;
			}).finally(function () {
				that.batchResponseReceived(sGroupId, bHasChanges);
			});
	};

	/**
	 * Returns a sync promise that is resolved when the requestor is ready to be used. The V4
	 * requestor is ready immediately. Subclasses may behave differently.
	 *
	 * @returns {sap.ui.base.SyncPromise} A sync promise that is resolved immediately with no result
	 *
	 * @public
	 */
	Requestor.prototype.ready = function () {
		return SyncPromise.resolve();
	};

	/**
	 * Creates a group lock for the given group.
	 *
	 * A group lock is a hint that a request is expected which may be added asynchronously.
	 * If the expected request must be part of the next batch request for that group,
	 * <code>bLocked</code> needs to be set to <code>true</code>. {@link #submitBatch} waits until
	 * all group locks for that group are unlocked again. A group lock is automatically unlocked if
	 * {@link #request} is called with that group lock. If the caller of {@link #lockGroup}
	 * recognizes that no request needs to be added, the caller must unlock the group lock. In case
	 * of an error the caller of {@link #lockGroup} must call
	 * {@link sap.ui.model.odata.v4.lib._GroupLock#unlock} with <code>bForce = true</code>.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object} oOwner
	 *   The lock's owner for debugging
	 * @param {boolean} [bLocked]
	 *   Whether the created lock is locked
	 * @param {boolean} [bModifying]
	 *   Whether the reason for the group lock is a modifying request
	 * @param {function} [fnCancel]
	 *   Function that is called when the group lock is canceled
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   The group lock
	 * @throws {Error}
	 *   If <code>bModifying</code> is set but <code>bLocked</code> is unset.
	 *
	 * @public
	 */
	Requestor.prototype.lockGroup = function (sGroupId, oOwner, bLocked, bModifying, fnCancel) {
		var oGroupLock;

		oGroupLock = new _GroupLock(sGroupId, oOwner, bLocked, bModifying, this.getSerialNumber(),
			fnCancel);
		if (bLocked) {
			this.aLockedGroupLocks.push(oGroupLock);
		}
		return oGroupLock;
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
	 * @public
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
					headers : Object.assign({}, that.mHeaders, {"X-CSRF-Token" : "Fetch"})
				}).then(function (oData, sTextStatus, jqXHR) {
					that.mHeaders["X-CSRF-Token"] = jqXHR.getResponseHeader("X-CSRF-Token");
					that.oSecurityTokenPromise = null;
					fnResolve();
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					that.oSecurityTokenPromise = null;
					fnReject(_Helper.createError(jqXHR, "Could not refresh security token"));
				});
			});
		}

		return this.oSecurityTokenPromise;
	};

	/**
	 * Finds the request identified by the given group and body, removes it from that group and
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
	 *   If the request could not be found, or if the new group ID is '$cached' (the error has a
	 *   property <code>$cached = true</code> then)
	 *
	 * @private
	 */
	Requestor.prototype.relocate = function (sCurrentGroupId, oBody, sNewGroupId) {
		var aRequests = this.mBatchQueue[sCurrentGroupId],
			that = this,
			bFound = aRequests && aRequests[0].some(function (oChange, i) {
				if (oChange.body === oBody) {
					that.addChangeToGroup(oChange, sNewGroupId);
					aRequests[0].splice(i, 1);
					return true;
				}
			});

		if (!bFound) {
			throw new Error("Request not found in group '" + sCurrentGroupId + "'");
		}
	};

	/**
	 * Finds all requests identified by the given group and entity, removes them from that group
	 * and triggers new requests with the new group ID, based on each found request.
	 * The result of each new request is delegated to the corresponding found request. If no entity
	 * is given, all requests for that group are triggered again.
	 *
	 * @param {string} sCurrentGroupId
	 *   The ID of the group in which to search
	 * @param {string} sNewGroupId
	 *   The ID of the group for the new requests
	 * @param {object} [oEntity]
	 *   The entity used to identify a request based on its "If-Match" header; if not set, all
	 *   requests are taken into account
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @public
	 */
	Requestor.prototype.relocateAll = function (sCurrentGroupId, sNewGroupId, oEntity) {
		var j = 0,
			aRequests = this.mBatchQueue[sCurrentGroupId],
			that = this;

		if (aRequests) {
			aRequests[0].slice().forEach(function (oChange) {
				if (!oEntity || oChange.headers["If-Match"] === oEntity) {
					that.addChangeToGroup(oChange, sNewGroupId);
					aRequests[0].splice(j, 1);
				} else {
					j += 1;
				}
			});
		}
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
	 *
	 * @private
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
	 * Reports unbound OData messages.
	 *
	 * @param {string} sResourcePath
	 *   The resource path of the request whose response contained the messages
	 * @param {string} [sMessages]
	 *   The messages in the serialized form as contained in the "sap-messages" response header
	 *
	 * @private
	 */
	Requestor.prototype.reportUnboundMessagesAsJSON = function (sResourcePath, sMessages) {
		this.oModelInterface.reportUnboundMessages(sResourcePath, JSON.parse(sMessages || null));
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
	 *   A resource path relative to the service URL for which this requestor has been created
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group to associate the request with; if no lock is given or its group ID has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Direct}, the request is sent immediately; for all
	 *   other group ID values, the request is added to the given group and you can use
	 *   {@link #submitBatch} to send all requests in that group. This group lock will be unlocked
	 *   immediately, even if the request itself is queued. The request is rejected if the lock is
	 *   already canceled.
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
	 * @param {string} [sOriginalResourcePath=sResourcePath]
	 *   The path by which this resource has originally been requested and thus can be identified on
	 *   the client. Only required for non-GET requests where <code>sResourcePath</code> is a
	 *   different (canonical) path.
	 * @param {boolean} [bAtFront=false]
	 *   Whether the request is added at the front of the first change set (ignored for method
	 *   "GET")
	 * @param {object} [mQueryOptions]
	 *   Query options if it is allowed to merge this request with another request having the same
	 *   sResourcePath (only allowed for GET requests); the resulting resource path is the path from
	 *   sResourcePath plus the merged query options
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request; it will be rejected with an error having the
	 *   property <code>canceled = true</code> instead of sending a request if
	 *   <code>oGroupLock</code> is already canceled.
	 * @throws {Error}
	 *   If group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *
	 * @public
	 */
	Requestor.prototype.request = function (sMethod, sResourcePath, oGroupLock, mHeaders, oPayload,
			fnSubmit, fnCancel, sMetaPath, sOriginalResourcePath, bAtFront, mQueryOptions) {
		var iChangeSetNo,
			oError,
			sGroupId = oGroupLock && oGroupLock.getGroupId() || "$direct",
			oPromise,
			iRequestSerialNumber = Infinity,
			oRequest,
			that = this;

		if (sGroupId === "$cached") {
			oError = new Error("Unexpected request: " + sMethod + " " + sResourcePath);
			oError.$cached = true;
			throw oError; // fail synchronously!
		}

		if (oGroupLock && oGroupLock.isCanceled()) {
			if (fnCancel) {
				fnCancel();
			}
			oError = new Error("Request already canceled");
			oError.canceled = true;
			return Promise.reject(oError);
		}

		if (oGroupLock) {
			oGroupLock.unlock();
			iRequestSerialNumber = oGroupLock.getSerialNumber();
		}
		sResourcePath = this.convertResourcePath(sResourcePath);
		sOriginalResourcePath = sOriginalResourcePath || sResourcePath;
		if (this.getGroupSubmitMode(sGroupId) !== "Direct") {
			oPromise = new Promise(function (fnResolve, fnReject) {
				var aRequests = that.getOrCreateBatchQueue(sGroupId);

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
					$queryOptions : mQueryOptions,
					$reject : fnReject,
					$resolve : fnResolve,
					$resourcePath : sOriginalResourcePath,
					$submit : fnSubmit
				};
				if (sMethod === "GET") { // push behind last GET and all change sets
					aRequests.push(oRequest);
				} else if (bAtFront) { // add at front of first change set
					aRequests[0].unshift(oRequest);
				} else { // push into change set which was current when the request was triggered
					iChangeSetNo = aRequests.iChangeSet;
					while (aRequests[iChangeSetNo].iSerialNumber > iRequestSerialNumber) {
						iChangeSetNo -= 1;
					}
					aRequests[iChangeSetNo].push(oRequest);
				}
			});
			oRequest.$promise = oPromise;
			return oPromise;
		}

		if (mQueryOptions) {
			sResourcePath = that.addQueryString(sResourcePath, sMetaPath, mQueryOptions);
		}
		if (fnSubmit) {
			fnSubmit();
		}
		return this.sendRequest(sMethod, sResourcePath,
			jQuery.extend({}, mHeaders, this.mFinalHeaders),
			JSON.stringify(_Requestor.cleanPayload(oPayload)), sOriginalResourcePath
		).then(function (oResponse) {
			that.reportUnboundMessagesAsJSON(oResponse.resourcePath, oResponse.messages);
			return that.doConvertResponse(oResponse.body, sMetaPath);
		});
	};

	/**
	 * Sends a batch request.
	 *
	 * @param {object[]} aRequests The requests
	 * @returns {Promise} A promise on the responses
	 *
	 * @private
	 */
	Requestor.prototype.sendBatch = function (aRequests) {
		var oBatchRequest = _Batch.serializeBatchRequest(aRequests);

		return this.sendRequest("POST", "$batch" + this.sQueryParams,
			jQuery.extend(oBatchRequest.headers, mBatchHeaders), oBatchRequest.body
		).then(function (oResponse) {
			if (oResponse.messages !== null) {
				throw new Error("Unexpected 'sap-messages' response header for batch request");
			}
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
	 * @param {string} [sOriginalResourcePath]
	 *  The path by which the resource has originally been requested
	 * @returns {Promise}
	 *   A promise that is resolved with an object having the properties body, contentType, messages
	 *   and resourcePath. The body is already an object if the contentType is "application/json".
	 *   The messages are retrieved from the "sap-messages" response header. The promise is rejected
	 *   with an error if the request failed.
	 *
	 * @private
	 */
	Requestor.prototype.sendRequest = function (sMethod, sResourcePath, mHeaders, sPayload,
			sOriginalResourcePath) {
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
						_Helper.resolveIfMatchHeader(mHeaders)),
					method : sMethod
				}).then(function (/*{object|string}*/vResponse, sTextStatus, jqXHR) {
					var sETag = jqXHR.getResponseHeader("ETag");

					try {
						that.doCheckVersionHeader(jqXHR.getResponseHeader, sResourcePath,
							!vResponse);
					} catch (oError) {
						fnReject(oError);
						return;
					}
					that.mHeaders["X-CSRF-Token"]
						= jqXHR.getResponseHeader("X-CSRF-Token") || that.mHeaders["X-CSRF-Token"];
					that.setSessionContext(jqXHR.getResponseHeader("SAP-ContextId"),
						jqXHR.getResponseHeader("SAP-Http-Session-Timeout"));

					// Note: string response appears only for $batch and thus cannot be empty;
					// for 204 "No Content", vResponse === undefined
					vResponse = vResponse || {/*null object pattern*/};
					if (sETag) {
						vResponse["@odata.etag"] = sETag;
					}

					fnResolve({
						body : vResponse,
						contentType : jqXHR.getResponseHeader("Content-Type"),
						messages : jqXHR.getResponseHeader("sap-messages"),
						resourcePath : sResourcePath
					});
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					var sContextId = jqXHR.getResponseHeader("SAP-ContextId"),
						sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"),
						sMessage;

					if (!bIsFreshToken && jqXHR.status === 403
							&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
						// refresh CSRF token and repeat original request
						that.refreshSecurityToken(sOldCsrfToken).then(function () {
							send(true);
						}, fnReject);
					} else {
						sMessage = "Communication error";
						if (sContextId) {
							// an error response within the session (e.g. a failed save) refreshes
							// the session
							that.setSessionContext(sContextId,
								jqXHR.getResponseHeader("SAP-Http-Session-Timeout"));
						} else if (that.mHeaders["SAP-ContextId"]) {
							// There was a session, but now it's gone
							sMessage = "Session not found on server";
							Log.error(sMessage, undefined, sClassName);
							that.clearSessionContext(/*bTimeout*/true);
						}
						fnReject(_Helper.createError(jqXHR, sMessage, sRequestUrl,
							sOriginalResourcePath));
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
	 * Sets the session context. Starts a keep-alive timer in case there is a session context and
	 * a timeout of 60 seconds or more is indicated. This timer runs for at most 15 minutes.
	 *
	 * @param {string} [sContextId] The value of the header 'SAP-ContextId'
	 * @param {string} [sSAPHttpSessionTimeout] The value of the header 'SAP-Http-Session-Timeout',
	 *   containing the timeout in seconds as integer value
	 *
	 * @private
	 */
	Requestor.prototype.setSessionContext = function (sContextId, sSAPHttpSessionTimeout) {
		var iTimeoutSeconds = rTimeout.test(sSAPHttpSessionTimeout)
				? parseInt(sSAPHttpSessionTimeout)
				: 0,
			iSessionTimeout = Date.now() + 15 * 60 * 1000, // 15 min
			that = this;

		this.clearSessionContext(); // stop the current session and its timer
		if (sContextId) {
			// start a new session and a new timer with the current header values (should be the
			// same as before)
			that.mHeaders["SAP-ContextId"] = sContextId;
			if (iTimeoutSeconds >= 60) {
				this.iSessionTimer = setInterval(function () {
					if (Date.now() >= iSessionTimeout) { // 15 min have passed
						that.clearSessionContext(/*bTimeout*/true); // give up
					} else {
						jQuery.ajax(that.sServiceUrl + that.sQueryParams, {
							method : "HEAD",
							headers : {
								"SAP-ContextId" : that.mHeaders["SAP-ContextId"]
							}
						}).fail(function (jqXHR) {
							if (jqXHR.getResponseHeader("SAP-Err-Id") === "ICMENOSESSION") {
								// The server could not find the context ID ("ICM Error NO SESSION")
								Log.error("Session not found on server", undefined, sClassName);
								that.clearSessionContext(/*bTimeout*/true);
							} // else keep the timer running
						});
					}
				}, (iTimeoutSeconds - 5) * 1000);
			} else if (sSAPHttpSessionTimeout !== null) {
				Log.warning("Unsupported SAP-Http-Session-Timeout header", sSAPHttpSessionTimeout,
					sClassName);
			}
		}
	};

	/**
	 * Waits until all group locks for the given group ID have been unlocked and submits the
	 * requests associated with this group ID in one batch request.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails.
	 *
	 * @public
	 */
	Requestor.prototype.submitBatch = function (sGroupId) {
		var bBlocked,
			oPromise,
			that = this;

		// Use SyncPromise.all to call #processBatch synchronously when there is no lock -> The
		// batch is sent before the rendering. Rendering and server processing run in parallel.
		oPromise = SyncPromise.all(this.aLockedGroupLocks.map(function (oGroupLock) {
			return oGroupLock.waitFor(sGroupId);
		}));
		bBlocked = oPromise.isPending();
		if (bBlocked) {
			Log.info("submitBatch('" + sGroupId + "') is waiting for locks", null, sClassName);
		}
		return oPromise.then(function () {
			if (bBlocked) {
				Log.info("submitBatch('" + sGroupId + "') continues", null, sClassName);
			}
			that.aLockedGroupLocks = that.aLockedGroupLocks.filter(function (oGroupLock) {
				return oGroupLock.isLocked();
			});
			return that.processBatch(sGroupId);
		});
	};

	/**
	 * Waits for all running change requests for the given group ID.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that resolves when all change requests for the given group ID have been processed
	 *   completely, no matter if they succeed or fail
	 *
	 * @public
	 * @see #batchResponseReceived
	 * @see #batchResponseSent
	 */
	Requestor.prototype.waitForRunningChangeRequests = function (sGroupId) {
		return this.mRunningChangeRequests[sGroupId] || SyncPromise.resolve();
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
		 * @param {function} oModelInterface.fetchEntityContainer
		 *   A promise which is resolved with the $metadata "JSON" object as soon as the entity
		 *   container is fully available, or rejected with an error.
		 * @param {function} oModelInterface.fetchMetadata
		 *   A function that returns a SyncPromise which resolves with the metadata instance for a
		 *   given meta path
		 * @param {function} oModelInterface.getGroupProperty
		 *   A function called with parameters <code>sGroupId</code> and <code>sPropertyName</code>
		 *   returning the property value in question. Only 'submit' is supported for <code>
		 *   sPropertyName</code>. Supported property values are: 'API', 'Auto' and 'Direct'.
		 * @param {function (string)} [oModelInterface.onCreateGroup]
		 *   A callback function that is called with the group name as parameter when the first
		 *   request is added to a group
		 * @param {function} oModelInterface.reportBoundMessages
		 *   A function to report bound OData messages
		 * @param {function (object[])} oModelInterface.reportUnboundMessages
		 *   A function to report unbound OData messages contained in the <code>sap-messages</code>
		 *   response header
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