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
	"sap/ui/core/cache/CacheManager",
	"sap/ui/security/Security",
	"sap/ui/thirdparty/jquery"
], function (_Batch, _GroupLock, _Helper, asV2Requestor, Log, SyncPromise, CacheManager,
		Security, jQuery) {
	"use strict";

	var mBatchHeaders = { // headers for the $batch request
			Accept : "multipart/mixed"
		},
		sCachePrefix = "sap.ui.model.odata.v4.optimisticBatch:",
		sClassName = "sap.ui.model.odata.v4.lib._Requestor",
		sMessagesAnnotation = "@com.sap.vocabularies.Common.v1.Messages",
		rSystemQueryOptionWithPlaceholder = /(\$\w+)=~/g,
		rTimeout = /^\d+$/;

	/**
	 * Clones the given headers and deletes the X-CSRF-Token within the returned cloned headers.
	 *
	 * @param {object} mHeaders The headers to be cloned
	 * @returns {object} The cloned headers w/o X-CSRF-Token header
	 */
	function getHeadersWithoutCSRFToken(mHeaders) {
		var oClone = Object.assign({}, mHeaders);

		delete oClone["X-CSRF-Token"];

		return oClone;
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
	 *   An interface allowing to call back to the owning model (see {@link .create})
	 * @param {boolean} [bWithCredentials]
	 *   Whether the XHR should be called with <code>withCredentials</code>
	 *
	 * @alias sap.ui.model.odata.v4.lib._Requestor
	 * @constructor
	 * @private
	 */
	function _Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface, bWithCredentials) {
		this.mBatchQueue = {};
		this.bBatchSent = false;
		this.mHeaders = mHeaders || {};
		this.aLockedGroupLocks = [];
		this.oModelInterface = oModelInterface;
		this.oOptimisticBatch = null; // optimistic batch processing off
		this.sQueryParams = _Helper.buildQuery(mQueryParams); // Used for $batch and CSRF token only
		this.oRetryAfterPromise = null;
		this.mRunningChangeRequests = {}; // map from group ID to a SyncPromise[]
		this.iSessionTimer = 0;
		this.iSerialNumber = 0;
		this.sServiceUrl = sServiceUrl;
		this.vStatistics = mQueryParams && mQueryParams["sap-statistics"];
		this.bWithCredentials = bWithCredentials;
		this.processSecurityTokenHandlers(); // sets this.oSecurityTokenPromise
	}

	/**
	 * Final (cannot be overridden) request headers for OData V4.
	 */
	_Requestor.prototype.mFinalHeaders = {
		"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
	};

	/**
	 * Predefined request headers in $batch parts for OData V4.
	 */
	_Requestor.prototype.mPredefinedPartHeaders = {
		Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
	};

	/**
	 * Predefined request headers for all requests for OData V4.
	 */
	_Requestor.prototype.mPredefinedRequestHeaders = {
		Accept : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
		"OData-MaxVersion" : "4.0",
		"OData-Version" : "4.0",
		"X-CSRF-Token" : "Fetch"
	};

	/**
	 * OData V4 request headers reserved for internal use.
	 */
	_Requestor.prototype.mReservedHeaders = {
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
	 * until the next call to this method are added to this new change set. The model is not
	 * informed about a created batch queue.
	 *
	 * @param {string} sGroupId The group ID
	 *
	 * @public
	 */
	_Requestor.prototype.addChangeSet = function (sGroupId) {
		var aChangeSet = [],
			aRequests = this.getOrCreateBatchQueue(sGroupId, true);

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
	_Requestor.prototype.addChangeToGroup = function (oChange, sGroupId) {
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
	 * Adds the given query options to the resource path.
	 *
	 * @param {string} sResourcePath The resource path with possible query options and placeholders
	 * @param {string} sMetaPath The absolute meta path matching the resource path
	 * @param {object} mQueryOptions Query options to add to the resource path
	 * @returns {string} The resource path with the query options
	 *
	 * @private
	 */
	_Requestor.prototype.addQueryString = function (sResourcePath, sMetaPath, mQueryOptions) {
		var sQueryString;

		mQueryOptions = this.convertQueryOptions(sMetaPath, mQueryOptions, false, true);
		sResourcePath = sResourcePath.replace(rSystemQueryOptionWithPlaceholder,
			function (_sString, sOption) {
				var sValue = mQueryOptions[sOption];

				delete mQueryOptions[sOption];

				return _Helper.encodePair(sOption, sValue);
			});

		sQueryString = _Helper.buildQuery(mQueryOptions);
		if (!sQueryString) {
			return sResourcePath;
		}

		return sResourcePath
			+ (sResourcePath.includes("?") ? "&" + sQueryString.slice(1) : sQueryString);
	};

	/**
	 * Called when a batch request for the given group ID has been sent.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object[]} aRequests
	 *   The array of requests; only used to identify the batch request.
	 * @param {boolean} bHasChanges
	 *   Whether the batch contains change requests; when <code>true</code> this is memorized in an
	 *   internal map
	 *
	 * @private
	 * @see #batchResponseReceived
	 * @see #hasPendingChanges
	 * @see #waitForRunningChangeRequests
	 */
	_Requestor.prototype.batchRequestSent = function (sGroupId, aRequests, bHasChanges) {
		var oPromise,
			fnResolve;

		if (bHasChanges) {
			if (!(sGroupId in this.mRunningChangeRequests)) {
				this.mRunningChangeRequests[sGroupId] = [];
			}
			oPromise = new SyncPromise(function (resolve) {
				fnResolve = resolve;
			});
			oPromise.$resolve = fnResolve;
			oPromise.$requests = aRequests;
			this.mRunningChangeRequests[sGroupId].push(oPromise);
		}
	};

	/**
	 * Called when a batch response for the given has been received.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @param {object[]} aRequests
	 *   The array of requests; only used to identify the batch request.
	 * @param {boolean} bHasChanges
	 *   Whether the batch contained change requests; when <code>true</code> the entry memorized in
	 *   the internal map is deleted
	 *
	 * @private
	 * @see #batchRequestSent
	 * @see #hasPendingChanges
	 * @see #waitForRunningChangeRequests
	 */
	_Requestor.prototype.batchResponseReceived = function (sGroupId, aRequests, bHasChanges) {
		var aPromises;

		if (bHasChanges) {
			aPromises = this.mRunningChangeRequests[sGroupId].filter(function (oPromise) {
					if (oPromise.$requests === aRequests) {
						// Note: no handler can run synchronously
						oPromise.$resolve();

						return false; // remove (should happen exactly once)
					}

					return true; // keep
				});
			if (aPromises.length) {
				this.mRunningChangeRequests[sGroupId] = aPromises;
			} else {
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
	 * @param {boolean} [bDropSystemQueryOptions]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @param {boolean} [bSortSystemQueryOptions]
	 *   Whether system query options are sorted alphabetically and moved to the query string's end
	 * @returns {string}
	 *   The query string; it is empty if there are no options; it starts with "?" otherwise
	 * @example
	 * {
     *   $expand : {
     *     "SO_2_BP" : true,
     *     "SO_2_SOITEM" : {
     *       "$expand" : {
     *         "SOITEM_2_PRODUCT" : {
     *           "$apply" : "filter(Price gt 100)",
     *           "$expand" : {
     *               "PRODUCT_2_BP" : null,
     *           },
     *           "$select" : "CurrencyCode"
     *         },
     *         "SOITEM_2_SO" : null
     *       }
     *     }
     *   },
     *   "sap-client" : "003"
     * }
	 *
	 * @public
	 */
	_Requestor.prototype.buildQueryString = function (sMetaPath, mQueryOptions,
			bDropSystemQueryOptions, bSortExpandSelect, bSortSystemQueryOptions) {
		return _Helper.buildQuery(
			this.convertQueryOptions(sMetaPath, mQueryOptions, bDropSystemQueryOptions,
				bSortExpandSelect),
			bSortSystemQueryOptions);
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
	 * @param {boolean} [bResetInactive]
	 *   Whether an edited inactive entity should be reset to its initial state instead of being
	 *   removed.
	 * @throws {Error}
	 *   If change requests for the given group ID are running
	 *
	 * @public
	 */
	_Requestor.prototype.cancelChanges = function (sGroupId, bResetInactive) {
		if (this.mRunningChangeRequests[sGroupId]) {
			throw new Error("Cannot cancel the changes for group '" + sGroupId
				+ "', the batch request is running");
		}
		this.cancelChangesByFilter(function () {
			return true;
		}, sGroupId, bResetInactive);
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
	 * @param {boolean} [bResetInactive]
	 *   Whether an edited inactive entity should be reset to its initial state instead of being
	 *   removed.
	 * @returns {boolean}
	 *   Whether at least one request has been canceled
	 *
	 * @private
	 */
	_Requestor.prototype.cancelChangesByFilter = function (fnFilter, sGroupId, bResetInactive) {
		var bCanceled = false,
			that = this;

		function cancelGroupChangeRequests(sGroupId0) {
			var aBatchQueue = that.mBatchQueue[sGroupId0],
				oChangeRequest,
				aChangeSet,
				oError,
				i, j;

			// restore changes in reverse order to get the same initial state
			for (j = aBatchQueue.length - 1; j >= 0; j -= 1) {
				if (Array.isArray(aBatchQueue[j])) {
					aChangeSet = aBatchQueue[j];
					for (i = aChangeSet.length - 1; i >= 0; i -= 1) {
						oChangeRequest = aChangeSet[i];
						if (oChangeRequest.$cancel && fnFilter(oChangeRequest)) {
							if (!oChangeRequest.$cancel(bResetInactive)) {
								oError = new Error("Request canceled: " + oChangeRequest.method
									+ " " + oChangeRequest.url + "; group: " + sGroupId0);
								oError.canceled = true;
								oChangeRequest.$reject(oError);
								aChangeSet.splice(i, 1);
								bCanceled = true;
							}
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
	 *
	 * @private
	 */
	_Requestor.prototype.cancelGroupLocks = function (sGroupId) {
		this.aLockedGroupLocks.forEach(function (oGroupLock) {
			if ((!sGroupId || sGroupId === oGroupLock.getGroupId())
					&& oGroupLock.isModifying() && oGroupLock.isLocked()) {
				oGroupLock.cancel();
			}
		});
	};

	/**
	 * Throws an error if the new request uses strict handling and there is a change set containing
	 * a strict handling request except the one at index <code>iChangeSetNo</code>.
	 *
	 * @param {object} oRequest
	 *   The new request
	 * @param {object[]} aRequests
	 *   The batch queue
	 * @param {number} iChangeSetNo
	 *   The index of the irrelevant change set
	 * @throws {Error}
	 *   If there is a conflicting change set
	 *
	 * @private
	 */
	_Requestor.prototype.checkConflictingStrictRequest = function (oRequest, aRequests,
		iChangeSetNo) {
		function isOtherChangeSetWithStrictHandling(aChangeSet, i) {
			return iChangeSetNo !== i && aChangeSet.some(isUsingStrictHandling);
		}

		function isUsingStrictHandling(oRequest0) {
			return oRequest0.headers.Prefer === "handling=strict";
		}

		// do not look past aRequests.iChangeSet because these cannot be change sets
		if (isUsingStrictHandling(oRequest)
				&& aRequests.slice(0, aRequests.iChangeSet + 1)
					.some(isOtherChangeSetWithStrictHandling)) {
			throw new Error("All requests with strict handling must belong to the same change set");
		}
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
	_Requestor.prototype.checkForOpenRequests = function () {
		var that = this;

		if (!_Helper.isEmptyObject(this.mRunningChangeRequests) // running change requests
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
	_Requestor.prototype.checkHeaderNames = function (mHeaders) {
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
	 * @see sap.ui.model.odata.v4.lib._Requestor#isChangeSetOptional
	 */
	_Requestor.prototype.cleanUpChangeSets = function (aRequests) {
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
				if (oChange.method === "DELETE" && oChange.headers["If-Match"]
						&& oChange.headers["If-Match"]["@odata.etag"]
						&& aChangeSet.find(function (oCandidate) {
							return oCandidate.headers["If-Match"] === oChange.headers["If-Match"];
						})) {
					oChange.headers["If-Match"] = {"@odata.etag" : "*"};
				}
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
					_Helper.merge(oCandidate.body, oChange.body);
					oChange.$resolve(oCandidate.$promise);
					oCandidate.$mergeRequests(oChange.$mergeRequests());

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
			bHasChanges ||= aChangeSet.length > 0;
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
	_Requestor.prototype.clearSessionContext = function (bTimeout) {
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string} The resulting value for the query string
	 * @throws {Error} If the expand items are not an object
	 *
	 * @private
	 */
	_Requestor.prototype.convertExpand = function (mExpandItems, bSortExpandSelect) {
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
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {string} The resulting string for the OData query in the form "path" (if no
	 *   options) or "path($option1=foo;$option2=bar)"
	 *
	 * @private
	 */
	_Requestor.prototype.convertExpandOptions = function (sExpandPath, vExpandOptions,
			bSortExpandSelect) {
		var aExpandOptions = [];

		// We do not pass a resource path, but within V4 this doesn't matter
		this.doConvertSystemQueryOptions(undefined, vExpandOptions,
			function (sOptionName, vOptionValue) {
				aExpandOptions.push(sOptionName + "=" + vOptionValue);
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
	 * @param {boolean} [bDropSystemQueryOptions]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 * @returns {object|undefined} The converted query options or <code>undefined</code> if there
	 *   are no query options
	 *
	 * @private
	 */
	_Requestor.prototype.convertQueryOptions = function (sMetaPath, mQueryOptions,
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
	_Requestor.prototype.convertResourcePath = function (sResourcePath) {
		return sResourcePath;
	};

	/**
	 * Destroys this requestor.
	 *
	 * @private
	 */
	_Requestor.prototype.destroy = function () {
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
	 * @param {boolean} [bVersionOptional]
	 *   Indicates whether the OData service version is optional, which is the case for responses
	 *   contained in a response for a $batch request
	 * @throws {Error} If the "OData-Version" header is not "4.0"
	 *
	 * @private
	 */
	_Requestor.prototype.doCheckVersionHeader = function (fnGetHeader, sResourcePath,
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
	 * @param {string} [_sMetaPath]
	 *   The meta path corresponding to the resource path; needed in case V2 response does not
	 *   contain <code>__metadata.type</code>, for example "2.2.7.2.4 RetrievePrimitiveProperty
	 *   Request"
	 * @returns {object}
	 *   The OData V4 response payload
	 *
	 * @private
	 */
	_Requestor.prototype.doConvertResponse = function (oResponsePayload, _sMetaPath) {
		return oResponsePayload;
	};

	/**
	 * Converts the known OData system query options from map or array notation to a string. All
	 * other parameters and placeholders are simply passed through.
	 * May be overwritten for other OData service versions.
	 *
	 * @param {string} _sMetaPath
	 *   The meta path corresponding to the resource path
	 * @param {object} mQueryOptions The query options
	 * @param {function (string,any)} fnResultHandler
	 *   The function to process the converted options getting the name and the value
	 * @param {boolean} [bDropSystemQueryOptions]
	 *   Whether all system query options are dropped (useful for non-GET requests)
	 * @param {boolean} [bSortExpandSelect]
	 *   Whether the paths in $expand and $select shall be sorted in the query string
	 *
	 * @private
	 */
	_Requestor.prototype.doConvertSystemQueryOptions = function (_sMetaPath, mQueryOptions,
			fnResultHandler, bDropSystemQueryOptions, bSortExpandSelect) {
		var that = this;

		Object.keys(mQueryOptions).forEach(function (sKey) {
			var vValue = mQueryOptions[sKey];

			if (bDropSystemQueryOptions && sKey[0] === "$") {
				return;
			}

			switch (sKey) {
				case "$expand":
					if (vValue !== "~") {
						vValue = that.convertExpand(vValue, bSortExpandSelect);
					}
					break;
				case "$select":
					if (Array.isArray(vValue)) {
						if (bSortExpandSelect) {
							vValue = vValue.slice().sort(); // Note: Array#sort is "in place"
							for (let i = 1; i < vValue.length;) {
								if (_Helper.hasPathPrefix(vValue[i], vValue[i - 1])) {
									vValue.splice(i, 1);
								} else {
									i += 1;
								}
							}
						}
						vValue = vValue.join(",");
					}
					break;
				default:
				// nothing to do
			}
			fnResultHandler(sKey, vValue);
		});
	};

	/**
	 * Fetches the type for the given path and puts it into mTypeForMetaPath. Recursively fetches
	 * the key properties' parent types if they are complex.
	 *
	 * @param {object} mTypeForMetaPath
	 *   A map from resource path and entity path to the type
	 * @param {string} sMetaPath
	 *   The meta path of the resource + navigation or key path (which may lead to an entity or
	 *   complex type)
	 * @returns {sap.ui.base.SyncPromise<object>}
	 *   A promise resolving with the type
	 *
	 * @public
	 */
	 _Requestor.prototype.fetchType = function (mTypeForMetaPath, sMetaPath) {
		var that = this;

		if (sMetaPath in mTypeForMetaPath) {
			return SyncPromise.resolve(mTypeForMetaPath[sMetaPath]);
		}

		return this.fetchTypeForPath(sMetaPath).then(function (oType) {
			var oMessageAnnotation,
				aPromises = [];

			if (oType) {
				oMessageAnnotation = that.getModelInterface()
					.fetchMetadata(sMetaPath + "/" + sMessagesAnnotation).getResult();
				if (oMessageAnnotation) {
					oType = Object.create(oType);
					oType[sMessagesAnnotation] = oMessageAnnotation;
				}

				mTypeForMetaPath[sMetaPath] = oType;

				(oType.$Key || []).forEach(function (vKey) {
					if (typeof vKey === "object") {
						// key has an alias
						vKey = vKey[Object.keys(vKey)[0]];
						aPromises.push(that.fetchType(mTypeForMetaPath,
							sMetaPath + "/" + vKey.slice(0, vKey.lastIndexOf("/"))));
					}
				});
				return SyncPromise.all(aPromises).then(function () {
					return oType;
				});
			}
		});
	};

	/**
	 * Fetches the type of the given meta path from the metadata.
	 *
	 * @param {string} sMetaPath
	 *   The meta path, e.g. "/SalesOrderList/SO_2_BP"
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that is resolved with the type at the given path.
	 *
	 * @private
	 */
	_Requestor.prototype.fetchTypeForPath = function (sMetaPath) {
		return this.oModelInterface.fetchMetadata(sMetaPath + "/");
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
	_Requestor.prototype.formatPropertyAsLiteral = function (vValue, oProperty) {
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
	_Requestor.prototype.getGroupSubmitMode = function (sGroupId) {
		return this.oModelInterface.getGroupProperty(sGroupId, "submit");
	};

	/**
	 * Returns the model interface as passed as parameter to {@link #create}.
	 *
	 * @returns {object} The model interface
	 *
	 * @private
	 */
	_Requestor.prototype.getModelInterface = function () {
		return this.oModelInterface;
	};

	/**
	 * Get the batch queue for the given group or create it if it does not exist yet.
	 *
	 * @param {string} sGroupId The group ID
	 * @param {string} [bSilent] Whether the model is not informed about a created batch queue
	 * @returns {object[]} The batch queue for the group
	 *
	 * @private
	 */
	_Requestor.prototype.getOrCreateBatchQueue = function (sGroupId, bSilent) {
		var aChangeSet,
			aRequests = this.mBatchQueue[sGroupId];

		if (!aRequests) {
			aChangeSet = [];
			aChangeSet.iSerialNumber = 0;
			aRequests = this.mBatchQueue[sGroupId] = [aChangeSet];
			aRequests.iChangeSet = 0; // the index of the current change set in this queue
			if (!bSilent) {
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
	_Requestor.prototype.getPathAndAddQueryOptions = function (sPath, oOperationMetadata,
		mParameters) {
		var aArguments = [],
			sName,
			mName2Parameter = {}, // maps valid names to parameter metadata
			that = this;

		sPath = sPath.slice(1, -5);
		if (oOperationMetadata.$Parameter) {
			oOperationMetadata.$Parameter.forEach(function (oParameter) {
				mName2Parameter[oParameter.$Name] = oParameter;
			});
		}
		if (oOperationMetadata.$kind === "Function") {
			for (sName in mParameters) {
				const oParameter = mName2Parameter[sName];
				if (oParameter) {
					if (oParameter.$isCollection) {
						throw new Error("Unsupported collection-valued parameter: " + sName);
					}
					aArguments.push(encodeURIComponent(sName) + "=" + encodeURIComponent(
						that.formatPropertyAsLiteral(mParameters[sName], oParameter)));
				}
			}
			sPath += "(" + aArguments.join(",") + ")";
		} else { // Action (or NavigationProperty, then mName2Parameter is empty!)
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
	_Requestor.prototype.getSerialNumber = function () {
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
	_Requestor.prototype.getServiceUrl = function () {
		return this.sServiceUrl;
	};

	/**
	 * Returns an unlocked copy of the given group lock if the corresponding group ID has submit
	 * mode "Auto" (or "Direct"); else returns a new group lock for "$auto" with the same owner.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock - The original
	 * @returns {sap.ui.model.odata.v4.lib._GroupLock}
	 *   An unlocked copy w/ submit mode "Auto", see above
	 *
	 * @public
	 */
	_Requestor.prototype.getUnlockedAutoCopy = function (oGroupLock) {
		if (this.getGroupSubmitMode(oGroupLock.getGroupId()) !== "API") {
			return oGroupLock.getUnlockedCopy();
		}

		return this.lockGroup("$auto", oGroupLock.getOwner());
	};

	/**
	 * Tells whether there are changes (that is, updates via PATCH or bound actions via POST) for
	 * the given group ID and given entity.
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
	_Requestor.prototype.hasChanges = function (sGroupId, oEntity) {
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
	 * Tells whether there are only PATCH requests with the "Prefer" header set to "return=minimal"
	 * (results from using $$patchWithoutSideEffects=true) enqueued in the batch queue with the
	 * given group ID.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {boolean}
	 *   Returns <code>true</code> if only PATCHes are enqueued in the batch queue with the given
	 *   group ID
	 *
	 * @private
	 */
	_Requestor.prototype.hasOnlyPatchesWithoutSideEffects = function (sGroupId) {
		return this.getGroupSubmitMode(sGroupId) === "Auto"
			&& !!this.mBatchQueue[sGroupId]
			&& this.mBatchQueue[sGroupId].every(function (vChangeSetOrRequest) {
				// PATCH requests must be in a change set which is modeled as an array
				return Array.isArray(vChangeSetOrRequest)
					&& vChangeSetOrRequest.every(function (oRequest) {
					return oRequest.method === "PATCH"
						&& oRequest.headers.Prefer === "return=minimal";
				});
			});
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
	_Requestor.prototype.hasPendingChanges = function (sGroupId) {
		var that = this;

		function filter(mMap) {
			if (!sGroupId) {
				return Object.keys(mMap);
			}

			return sGroupId in mMap ? [sGroupId] : [];
		}

		return filter(this.mRunningChangeRequests).length > 0
			|| this.aLockedGroupLocks.some(function (oGroupLock) {
				var sGroupId0 = oGroupLock.getGroupId();

				return (sGroupId === undefined || sGroupId0 === sGroupId)
					// aLockedGroupLocks may contain modifying group locks that have been unlocked
					// already; cleanup of aLockedGroupLocks is done only in #submitBatch. An
					// unlocked group lock is not relevant because either the corresponding change
					// has been reset or it has been added to the batch queue.
					&& oGroupLock.isModifying() && oGroupLock.isLocked()
					&& !sGroupId0.startsWith("$inactive.");
			})
			|| filter(this.mBatchQueue).some(function (sGroupId0) {
				return !sGroupId0.startsWith("$inactive.")
					&& that.mBatchQueue[sGroupId0].some(function (vRequests) {
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
	_Requestor.prototype.isActionBodyOptional = function () {
		return false;
	};

	/**
	 * Returns <code>true</code> if a non-optimistic batch request was already sent.
	 *
	 * @returns {boolean} Whether a non-optimistic batch was already sent
	 *
	 * @public
	 */
	_Requestor.prototype.isBatchSent = function () {
		return this.bBatchSent;
	};

	/**
	 * Tells whether change sets are optional. For OData V4, this is true.
	 *
	 * @returns {boolean} <code>true</code>
	 *
	 * @private
	 */
	_Requestor.prototype.isChangeSetOptional = function () {
		return true;
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
	_Requestor.prototype.lockGroup = function (sGroupId, oOwner, bLocked, bModifying, fnCancel) {
		var oGroupLock;

		oGroupLock = new _GroupLock(sGroupId, oOwner, bLocked, bModifying, this.getSerialNumber(),
			fnCancel);
		if (bLocked) {
			this.aLockedGroupLocks.push(oGroupLock);
		}
		return oGroupLock;
	};

	/**
	 * Merges all GET requests that are marked as mergeable (via parameter mQueryOptions of
	 * {@link #request}) and have the same owner, resource path, and query options besides $expand
	 * and $select. One request with the merged $expand and $select is left in the queue and all
	 * merged requests get the response of this one remaining request. For $mergeRequests, see
	 * parameter fnMergeRequests of {@link #request}.
	 *
	 * @param {object[]} aRequests The batch queue
	 * @returns {object[]} The adjusted batch queue
	 *
	 * @private
	 */
	_Requestor.prototype.mergeGetRequests = function (aRequests) {
		var aResultingRequests = [],
			that = this;

		function merge(oRequest) {
			return oRequest.$queryOptions && aResultingRequests.some(function (oCandidate) {
				if (oCandidate.$queryOptions && oRequest.url === oCandidate.url
						&& oRequest.$owner === oCandidate.$owner) {
					oCandidate.$queryOptions = _Helper.clone(oCandidate.$queryOptions);
					_Helper.aggregateExpandSelect(oCandidate.$queryOptions, oRequest.$queryOptions);
					oRequest.$resolve(oCandidate.$promise);
					if (oCandidate.$mergeRequests && oRequest.$mergeRequests) {
						oCandidate.$mergeRequests(oRequest.$mergeRequests());
					}

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
			var mQueryOptions = oRequest.$queryOptions;

			if (mQueryOptions) {
				if (mQueryOptions.$expand && !mQueryOptions.$select.length) {
					mQueryOptions.$select = Object.keys(mQueryOptions.$expand).sort().slice(0, 1);
				}
				oRequest.url = that.addQueryString(oRequest.url, oRequest.$metaPath, mQueryOptions);
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
	_Requestor.prototype.processBatch = function (sGroupId) {
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
		 * @param {object[]} aRequests0
		 * @param {object[]} aResponses
		 */
		function visit(aRequests0, aResponses) {
			var oCause;

			aRequests0.forEach(function (vRequest, index) {
				var sETag,
					oResponse,
					vResponse = aResponses[index];

				if (Array.isArray(vResponse)) {
					visit(vRequest, vResponse);
				} else if (!vResponse) {
					const oError = new Error(
						"HTTP request was not processed because the previous request failed");
					oError.cause = oCause;
					oError.$reported = true; // do not create a message for this error
					reject(oError, vRequest); // Note: vRequest may well be a change set
				} else if (vResponse.status >= 400) {
					that.oModelInterface.onHttpResponse(vResponse.headers);
					vResponse.getResponseHeader = getResponseHeader;
					// Note: vRequest is an array in case a change set fails, hence url and
					// $resourcePath are undefined
					oCause = _Helper.createError(vResponse, "Communication error",
						vRequest.url ? that.sServiceUrl + vRequest.url : undefined,
						vRequest.$resourcePath);
					if (Array.isArray(vRequest)) {
						_Helper.decomposeError(oCause, vRequest, that.sServiceUrl)
							.forEach(function (oError, i) {
								vRequest[i].$reject(oError);
							});
					} else {
						vRequest.$reject(oCause);
					}
				} else {
					that.oModelInterface.onHttpResponse(vResponse.headers);
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
						// With GET it must be visible that there is no content, with the other
						// methods it must be possible to insert the ETag from the header
						oResponse = vRequest.method === "GET" ? null : {};
					}
					that.reportHeaderMessages(vRequest.$resourcePath,
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

		this.bBatchSent = true;
		aRequests = this.mergeGetRequests(aRequests);
		this.batchRequestSent(sGroupId, aRequests, bHasChanges);
		return this.sendBatch(aRequests, sGroupId, bHasChanges)
			.then(function (aResponses) {
				visit(aRequests, aResponses);
			}).catch(function (oError) {
				var oRequestError = new Error(
					"HTTP request was not processed because $batch failed");

				oRequestError.cause = oError;
				reject(oRequestError, aRequests);
				throw oError;
			}).finally(function () {
				that.batchResponseReceived(sGroupId, aRequests, bHasChanges);
			});
	};

	/**
	 * This function has two tasks:
	 * <ul>
	 *   <li> We are in the 1st app start, no optimistic batch payload stored so far. If optimistic
	 *     batch handling is enabled via
	 *     {@link sap.ui.model.odata.v4.ODataModel#setOptimisticBatchEnabler}, this function stores
	 *     the current batch requests in cache.
	 *   <li> If an optimistic batch was already sent, it returns its result promise.
	 * </ul>
	 *
	 * @param {object[]} aRequests The requests of the current batch
	 * @param {string} sGroupId The group ID
	 * @returns {Promise|undefined}
	 *   The optimistic batch result or <code>undefined</code> if the batch should be sent
	 *   normally. <code>undefined</code> can have the following reasons:
	 *   <ul>
	 *     <li> We are in the 1st app start, no optimistic batch payload stored so far, or
	 *     <li> the optimistic batch was sent, but its payload did not match to the current one, or
	 *     <li> we are not in the first #sendBatch call within the _Requestors lifecycle, or
	 *     <li> #sendBatch was called before first batch payload could be read via CacheManager or
	 *     <li> we are in the first #sendBatch but the batch is modifying, means contains others
	 *       than GET requests.
	 *   </ul>
	 *
	 * @private
	 */
	_Requestor.prototype.processOptimisticBatch = function (aRequests, sGroupId) {
		var bIsModifyingBatch,
			sKey,
			oOptimisticBatch = this.oOptimisticBatch,
			fnOptimisticBatchEnabler,
			that = this;

		if (!oOptimisticBatch) {
			return;
		}
		fnOptimisticBatchEnabler = this.oModelInterface.getOptimisticBatchEnabler();
		sKey = oOptimisticBatch.key;
		this.oOptimisticBatch = null;
		if (oOptimisticBatch.result) { // n+1 app start, consume optimistic batch result
			if (_Requestor.matchesOptimisticBatch(aRequests, sGroupId,
					oOptimisticBatch.firstBatch.requests, oOptimisticBatch.firstBatch.groupId)) {
				if (fnOptimisticBatchEnabler) {
					Promise.resolve(fnOptimisticBatchEnabler(sKey)).then(async (bEnabled) => {
						if (!bEnabled) {
							await CacheManager.del(sCachePrefix + sKey);
							Log.info("optimistic batch: disabled, batch payload deleted", sKey,
								sClassName);
						}
					}).catch(that.oModelInterface.getReporter());
				}

				Log.info("optimistic batch: success, response consumed", sKey, sClassName);
				return oOptimisticBatch.result;
			}
			Log.warning("optimistic batch: mismatch, response skipped", sKey, sClassName);
			CacheManager.del(sCachePrefix + sKey).catch(this.oModelInterface.getReporter());
		}

		if (fnOptimisticBatchEnabler) { // 1st app start, or optimistic batch payload did not match
			bIsModifyingBatch = aRequests.some(function (oRequest) {
					return Array.isArray(oRequest) || oRequest.method !== "GET";
				});
			if (bIsModifyingBatch) {
				Log.warning("optimistic batch: modifying batch not supported", sKey, sClassName);
				return;
			}

			Promise.resolve(fnOptimisticBatchEnabler(sKey)).then(function (bEnabled) {
				if (bEnabled) {
					return CacheManager.set(sCachePrefix + sKey, {
						groupId : sGroupId,
						requests : aRequests.map(function (oRequest) {
							return {
								headers : getHeadersWithoutCSRFToken(oRequest.headers),
								method : "GET",
								url : oRequest.url
							};
						})
					}).then(function () {
						Log.info("optimistic batch: enabled, batch payload saved", sKey,
							sClassName);
					});
				}
				Log.info("optimistic batch: disabled", sKey, sClassName);
			}).catch(that.oModelInterface.getReporter());
		}
	};

	/**
	 * Calls the security token handlers returned by
	 * {@link module:sap/ui/security/Security.getSecurityTokenHandlers} one by one with the
	 * requestor's service URL. The first handler not returning <code>undefined</code> but a
	 * <code>Promise</code> is used to determine the required security tokens.
	 *
	 * @private
	 */
	_Requestor.prototype.processSecurityTokenHandlers = function () {
		var that = this;

		this.oSecurityTokenPromise = null;

		Security.getSecurityTokenHandlers().some(function (fnHandler) {
			var oSecurityTokenPromise = fnHandler(that.sServiceUrl);

			if (oSecurityTokenPromise !== undefined) {
				that.oSecurityTokenPromise = oSecurityTokenPromise.then(function (mHeaders) {
					that.checkHeaderNames(mHeaders);
					// also overwrite this.mPredefinedRequestHeaders["X-CSRF-Token"] : "Fetch"
					Object.assign(that.mHeaders, {"X-CSRF-Token" : undefined}, mHeaders);
					that.oSecurityTokenPromise = null;
				}).catch(function (oError) {
					Log.error("An error occurred within security token handler: " + fnHandler,
						oError, sClassName);
					throw oError;
				});
				return true;
			}
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
	_Requestor.prototype.ready = function () {
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
	 * @returns {Promise<void>}
	 *   A promise which is resolved without a defined result once the CSRF token has been
	 *   refreshed.
	 *
	 * @public
	 */
	_Requestor.prototype.refreshSecurityToken = function (sOldSecurityToken) {
		var that = this;

		if (!this.oSecurityTokenPromise) {
			// do not refresh security token again if a new token is already available in between
			if (sOldSecurityToken !== this.mHeaders["X-CSRF-Token"]) {
				return Promise.resolve();
			}

			this.oSecurityTokenPromise = new Promise(function (fnResolve, fnReject) {
				const oAjaxSettings = {
					method : "HEAD",
					headers : Object.assign({}, that.mHeaders, {"X-CSRF-Token" : "Fetch"})
				};
				if (that.bWithCredentials) {
					oAjaxSettings.xhrFields = {withCredentials : true};
				}
				jQuery.ajax(that.sServiceUrl + that.sQueryParams, oAjaxSettings)
					.then(function (_oData, _sTextStatus, jqXHR) {
						var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");

						if (sCsrfToken) {
							that.mHeaders["X-CSRF-Token"] = sCsrfToken;
						} else {
							delete that.mHeaders["X-CSRF-Token"];
						}
						that.oSecurityTokenPromise = null;
						that.oModelInterface.onHttpResponse(
							_Helper.parseRawHeaders(jqXHR.getAllResponseHeaders()));
						fnResolve();
					}, function (jqXHR) {
						that.oSecurityTokenPromise = null;
						fnReject(_Helper.createError(jqXHR, "Could not refresh security token"));
					});
			});
		}

		return this.oSecurityTokenPromise;
	};

	/**
	 * Finds the request identified by the given group and body, removes it from that group and
	 * initiates a new request with the new group ID, based on the found request.
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
	_Requestor.prototype.relocate = function (sCurrentGroupId, oBody, sNewGroupId) {
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
	 * and initiates new requests with the new group ID, based on each found request.
	 * The result of each new request is delegated to the corresponding found request. If no entity
	 * is given, all requests for that group are initiated again.
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
	_Requestor.prototype.relocateAll = function (sCurrentGroupId, sNewGroupId, oEntity) {
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
	 * Removes the pending PATCH or DELETE request for the given promise from its group. Only
	 * requests for which the <code>$cancel</code> callback is defined are removed.
	 *
	 * @param {Promise} oPromise
	 *   A promise that has been returned for a PATCH or DELETE request. That request will be
	 *   rejected with an error with property <code>canceled = true</code>.
	 * @throws {Error}
	 *   If the request is not in the queue, assuming that it has been submitted already
	 *
	 * @private
	 */
	_Requestor.prototype.removeChangeRequest = function (oPromise) {
		var bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
				return oChangeRequest.$promise === oPromise;
			});

		if (!bCanceled) {
			throw new Error("Cannot reset the changes, the batch request is running");
		}
	};

	/**
	 * Removes the pending POST request for the given entity from the given group. Only requests
	 * for which the <code>$cancel</code> callback is defined are removed.
	 *
	 * The request's promise is rejected with an error with a property <code>canceled = true</code>.
	 *
	 * @param {string} sGroupId
	 *   The ID of the group containing the request
	 * @param {object} oEntity
	 *   The entity of the request containing a private annotation <code>postBody</code> identifying
	 *   the POST body
	 * @throws {Error}
	 *   If the request is not in the queue, assuming that it has been submitted already
	 *
	 * @private
	 */
	_Requestor.prototype.removePost = function (sGroupId, oEntity) {
		var oBody = _Helper.getPrivateAnnotation(oEntity, "postBody"),
			bCanceled = this.cancelChangesByFilter(function (oChangeRequest) {
				return oChangeRequest.body === oBody;
			}, sGroupId);

		if (!bCanceled) {
			throw new Error("Cannot reset the changes, the batch request is running");
		}
	};

	/**
	 * Reports OData messages from the "sap-messages" response header.
	 *
	 * @param {string} sResourcePath
	 *   The resource path of the request whose response contained the messages
	 * @param {string} [sMessages]
	 *   The messages in the serialized form as contained in the "sap-messages" response header
	 *
	 * @private
	 */
	_Requestor.prototype.reportHeaderMessages = function (sResourcePath, sMessages) {
		if (sMessages) {
			this.oModelInterface.reportTransitionMessages(JSON.parse(sMessages), sResourcePath);
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
	 *   A resource path relative to the service URL for which this requestor has been created
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group to associate the request with; if no lock is given or its group ID has
	 *   {@link sap.ui.model.odata.v4.SubmitMode.Direct}, the request is sent immediately; for group
	 *   ID "$single" the request is added to the queue but also sent immediately; for all
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
	 * @param {function(boolean):boolean} [fnCancel]
	 *   A function that is called for clean-up if the request is canceled while waiting in a batch
	 *   queue, ignored for GET requests; {@link #cancelChanges} cancels this request only if this
	 *   callback is given and a falsy value was returned. A boolean parameter is passed to the
	 *   callback which indicates if inactive entities should be reset instead of being removed.
	 * @param {string} [sMetaPath]
	 *   The meta path corresponding to the resource path; needed in case V2 response does not
	 *   contain <code>__metadata.type</code>, for example "2.2.7.2.4 RetrievePrimitiveProperty
	 *   Request"
	 * @param {string} [sOriginalResourcePath=sResourcePath]
	 *   The path by which this resource has originally been requested and thus can be identified on
	 *   the client. Only required for non-GET requests where <code>sResourcePath</code> is a
	 *   different (canonical) path.
	 * @param {boolean} [bAtFront]
	 *   Whether the request is added at the front of the first change set (ignored for method
	 *   "GET")
	 * @param {object} [mQueryOptions]
	 *   Query options if it is allowed to merge this request with another request having the same
	 *   sResourcePath (only allowed for GET requests); the resulting resource path is the path from
	 *   sResourcePath plus the merged query options; must contain $select (even if empty), may also
	 *   contain $expand
	 * @param {any} [vOwner]
	 *   An additional precondition for the merging of GET requests: the owner must be identical.
	 * @param {function(string[]):string[]} [fnMergeRequests]
	 *   Function which is called during merging of GET or PATCH requests. If a merged request has a
	 *   function given, this function will be called and its return value is
	 *   given to the one remaining request's function as a parameter.
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request; it will be rejected with an error having the
	 *   property <code>canceled = true</code> instead of sending a request if
	 *   <code>oGroupLock</code> is already canceled.
	 * @throws {Error} If
	 *   <ul>
	 *     <li>group ID is '$cached'. The error has a property <code>$cached = true</code>
	 *     <li>group ID is '$single' and there is already an existing batch queue for this group
	 *   </ul>
	 * @public
	 */
	_Requestor.prototype.request = function (sMethod, sResourcePath, oGroupLock, mHeaders, oPayload,
			fnSubmit, fnCancel, sMetaPath, sOriginalResourcePath, bAtFront, mQueryOptions, vOwner,
			fnMergeRequests) {
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
		sOriginalResourcePath ??= sResourcePath;
		if (this.getGroupSubmitMode(sGroupId) !== "Direct") {
			if (sGroupId === "$single" && this.mBatchQueue[sGroupId]) {
				throw new Error("Cannot add new request to already existing $single queue");
			}
			oPromise = new Promise(function (fnResolve, fnReject) {
				var aRequests = that.getOrCreateBatchQueue(sGroupId);

				oRequest = {
					method : sMethod,
					url : sResourcePath,
					headers : Object.assign({},
						that.mPredefinedPartHeaders,
						that.mHeaders,
						mHeaders,
						that.mFinalHeaders),
					body : oPayload,
					$cancel : fnCancel,
					$mergeRequests : fnMergeRequests,
					$metaPath : sMetaPath,
					$owner : vOwner,
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
				} else { // push into change set which was current when the request was initiated
					iChangeSetNo = aRequests.iChangeSet;
					while (aRequests[iChangeSetNo].iSerialNumber > iRequestSerialNumber) {
						iChangeSetNo -= 1;
					}
					that.checkConflictingStrictRequest(oRequest, aRequests, iChangeSetNo);

					aRequests[iChangeSetNo].push(oRequest);
				}
				if (sGroupId === "$single") {
					that.submitBatch("$single");
				}
			});
			oRequest.$promise = oPromise;

			return oPromise;
		}

		if (this.vStatistics !== undefined) {
			mQueryOptions = Object.assign({"sap-statistics" : this.vStatistics}, mQueryOptions);
		}
		if (mQueryOptions) {
			sResourcePath = that.addQueryString(sResourcePath, sMetaPath, mQueryOptions);
		}
		if (fnSubmit) {
			fnSubmit();
		}
		return this.sendRequest(sMethod, sResourcePath,
			Object.assign({}, mHeaders, this.mFinalHeaders,
				sMethod === "GET" ? {"sap-cancel-on-close" : "true"} : undefined),
			JSON.stringify(oPayload), sOriginalResourcePath
		).then(function (oResponse) {
			that.reportHeaderMessages(sOriginalResourcePath, oResponse.messages);
			return that.doConvertResponse(
				// Note: "text/plain" used for $count
				typeof oResponse.body === "string" ? JSON.parse(oResponse.body) : oResponse.body,
				sMetaPath);
		});
	};

	/**
	 * Sends a batch request.
	 *
	 * @param {object[]} aRequests The requests
	 * @param {string} sGroupId The group ID
	 * @param {boolean} bHasChanges Whether the batch contains change requests
	 * @returns {Promise} A promise on the responses
	 *
	 * @private
	 */
	_Requestor.prototype.sendBatch = function (aRequests, sGroupId, bHasChanges) {
		var oBatchRequest = _Batch.serializeBatchRequest(aRequests,
				this.getGroupSubmitMode(sGroupId) === "Auto"
					? "Group ID: " + sGroupId
					: "Group ID (API): " + sGroupId,
				this.oModelInterface.isIgnoreETag()
			);

		return this.processOptimisticBatch(aRequests, sGroupId)
			|| this.sendRequest("POST", "$batch" + this.sQueryParams,
				Object.assign(oBatchRequest.headers, mBatchHeaders,
					bHasChanges ? undefined : {"sap-cancel-on-close" : "true"}),
				oBatchRequest.body
			).then(function (oResponse) {
				if (oResponse.messages !== null) {
					throw new Error("Unexpected 'sap-messages' response header for batch request");
				}
				return _Batch.deserializeBatchResponse(oResponse.contentType, oResponse.body);
			});
	};

	/**
	 * Checks whether a first batch from an earlier app start was recorded and sends it immediately
	 * out as optimistic batch in order to have its response at the earliest point in time.
	 *
	 * @public
	 */
	_Requestor.prototype.sendOptimisticBatch = function () {
		var sKey = window.location.href,
			that = this;

		CacheManager.get(sCachePrefix + sKey).then(function (oFirstBatch) {
			var oOptimisticBatch = {key : sKey};

			if (oFirstBatch) {
				if (that.isBatchSent()) {
					Log.error("optimistic batch: #sendBatch called before optimistic batch "
						+ "payload could be read", undefined, sClassName);
					return;
				}
				oOptimisticBatch.firstBatch = oFirstBatch;
				oOptimisticBatch.result
					= that.sendBatch(oFirstBatch.requests, oFirstBatch.groupId);
				Log.info("optimistic batch: sent ", sKey, sClassName);
			}
			that.oOptimisticBatch = oOptimisticBatch; // this has to be done after #sendBatch call
		}).catch(this.oModelInterface.getReporter());
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
	_Requestor.prototype.sendRequest = function (sMethod, sResourcePath, mHeaders, sPayload,
			sOriginalResourcePath) {
		var sRequestUrl = this.sServiceUrl + sResourcePath,
			that = this;

		return new Promise(function (fnResolve, fnReject) {
			function send(bIsFreshToken) {
				const oAjaxSettings = {
						contentType : mHeaders && mHeaders["Content-Type"],
						data : sPayload,
						headers : Object.assign({},
							that.mPredefinedRequestHeaders,
							that.mHeaders,
							_Helper.resolveIfMatchHeader(mHeaders,
								that.oModelInterface.isIgnoreETag())),
						method : sMethod
					};
				var sOldCsrfToken = that.mHeaders["X-CSRF-Token"];

				if (that.bWithCredentials) {
					oAjaxSettings.xhrFields = {withCredentials : true};
				}
				return jQuery.ajax(sRequestUrl, oAjaxSettings)
				.then(function (/*{object|string}*/vResponse, _sTextStatus, jqXHR) {
					var sETag = jqXHR.getResponseHeader("ETag"),
						sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");

					that.oModelInterface.onHttpResponse(
						_Helper.parseRawHeaders(jqXHR.getAllResponseHeaders()));

					try {
						that.doCheckVersionHeader(jqXHR.getResponseHeader, sResourcePath,
							!vResponse);
					} catch (oError) {
						fnReject(oError);
						return;
					}
					if (sCsrfToken) {
						that.mHeaders["X-CSRF-Token"] = sCsrfToken;
					}
					that.setSessionContext(jqXHR.getResponseHeader("SAP-ContextId"),
						jqXHR.getResponseHeader("SAP-Http-Session-Timeout"));

					// Note: string response appears only for $batch and thus cannot be empty;
					// for 204 "No Content", vResponse === undefined
					// With GET it must be visible that there is no content, with the other
					// methods it must be possible to insert the ETag from the header
					vResponse ||= sMethod === "GET" ? null : {};
					if (sETag && typeof vResponse === "object") {
						vResponse["@odata.etag"] = sETag;
					}

					fnResolve({
						body : vResponse,
						contentType : jqXHR.getResponseHeader("Content-Type"),
						messages : jqXHR.getResponseHeader("sap-messages"),
						resourcePath : sResourcePath
					});
				}, function (jqXHR) {
					var sContextId = jqXHR.getResponseHeader("SAP-ContextId"),
						sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token"),
						sMessage;

					if (!bIsFreshToken && jqXHR.status === 403
							&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
						// refresh CSRF token and repeat original request
						that.refreshSecurityToken(sOldCsrfToken).then(function () {
							send(true);
						}, fnReject);
					} else if (jqXHR.status === 503 && jqXHR.getResponseHeader("Retry-After")
							&& (that.oRetryAfterPromise
								|| that.oModelInterface.getRetryAfterHandler())) {
						that.oRetryAfterPromise ??= that.oModelInterface.getRetryAfterHandler()(
							_Helper.createError(jqXHR, ""));
						that.oRetryAfterPromise.then(send);
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

			if (that.oRetryAfterPromise) {
				that.oRetryAfterPromise.then(send);
			} else if (that.oSecurityTokenPromise && sMethod !== "GET") {
				that.oSecurityTokenPromise.then(send);
			} else {
				send();
			}
		});
	};

	/**
	 * Sets the session context. Starts a keep-alive timer in case there is a session context and
	 * a timeout of 60 seconds or more is indicated. This timer runs for at most 30 minutes.
	 *
	 * @param {string} [sContextId] The value of the header 'SAP-ContextId'
	 * @param {string} [sSAPHttpSessionTimeout] The value of the header 'SAP-Http-Session-Timeout',
	 *   containing the timeout in seconds as integer value
	 *
	 * @private
	 */
	_Requestor.prototype.setSessionContext = function (sContextId, sSAPHttpSessionTimeout) {
		var iTimeoutSeconds = rTimeout.test(sSAPHttpSessionTimeout)
				? parseInt(sSAPHttpSessionTimeout)
				: 0,
			iSessionTimeout = Date.now() + 30 * 60 * 1000, // 30 min
			that = this;

		this.clearSessionContext(); // stop the current session and its timer
		if (sContextId) {
			// start a new session and a new timer with the current header values (should be the
			// same as before)
			this.mHeaders["SAP-ContextId"] = sContextId;
			if (iTimeoutSeconds >= 60) {
				this.iSessionTimer = setInterval(function () {
					if (Date.now() >= iSessionTimeout) { // 30 min have passed
						that.clearSessionContext(/*bTimeout*/true); // give up

						return;
					}

					const oAjaxSettings = {
						method : "HEAD",
						headers : {
							"SAP-ContextId" : that.mHeaders["SAP-ContextId"]
						}
					};
					if (that.bWithCredentials) {
						oAjaxSettings.xhrFields = {withCredentials : true};
					}
					jQuery.ajax(that.sServiceUrl + that.sQueryParams, oAjaxSettings)
						.fail(function (jqXHR) {
							if (jqXHR.getResponseHeader("SAP-Err-Id") === "ICMENOSESSION") {
								// The server could not find the context ID ("ICM Error NO SESSION")
								Log.error("Session not found on server", undefined, sClassName);
								that.clearSessionContext(/*bTimeout*/true);
							} // else keep the timer running
						});
				}, (iTimeoutSeconds - 5) * 1000);
			} else if (sSAPHttpSessionTimeout !== null) {
				Log.warning("Unsupported SAP-Http-Session-Timeout header", sSAPHttpSessionTimeout,
					sClassName);
			}
		}
	};

	/**
	 * Waits until all group locks for the given group ID have been unlocked and submits the
	 * requests associated with this group ID in one batch request. If only PATCH requests are
	 * enqueued (see {@link #hasOnlyPatchesWithoutSideEffects}), this will delay the invocation to
	 * wait for potential side effect requests initiated by a
	 * {@link sap.ui.core.Control#event:validateFieldGroup 'validateFieldGroup'} event.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the HTTP request resolving with <code>undefined</code>; it is
	 *   rejected with an error if the batch request itself fails.
	 *
	 * @public
	 */
	_Requestor.prototype.submitBatch = function (sGroupId) {
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
			if (that.hasOnlyPatchesWithoutSideEffects(sGroupId)) {
				bBlocked = true;
				Log.info("submitBatch('" + sGroupId
					+ "') is waiting for potential side effect requests", null, sClassName);
				return new Promise(function (fnResolve) {
					setTimeout(function () {
						fnResolve();
					}, 0);
				});
			}
		}).then(function () {
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
	 * Waits until a batch response has been received for the given group ID.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that resolves without a defined result when a batch response has been received
	 *   for the given group ID, no matter if the batch succeeded or failed
	 *
	 * @public
	 * @see #batchResponseReceived
	 */
	_Requestor.prototype.waitForBatchResponseReceived = function (sGroupId) {
		// Note: this currently works only in case there is at least one change request already
		return SyncPromise.resolve(this.mBatchQueue[sGroupId][0][0].$promise);
	};

	/**
	 * Waits for all currently running change requests for the given group ID.
	 *
	 * @param {string} sGroupId
	 *   The group ID
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise that resolves without a defined result when all currently running change requests
	 *   for the given group ID have been processed completely, no matter if they succeed or fail
	 *
	 * @public
	 * @see #batchRequestSent
	 * @see #batchResponseReceived
	 */
	_Requestor.prototype.waitForRunningChangeRequests = function (sGroupId) {
		var aPromises = this.mRunningChangeRequests[sGroupId];

		if (aPromises) {
			return aPromises.length > 1 ? SyncPromise.all(aPromises) : aPromises[0];
		}

		return SyncPromise.resolve();
	};

	/**
	 * Checks whether the actual payload and group ID of a batch request matches to the optimistic
	 * batch payload and group ID.
	 *
	 * @param {object[]} aActualRequests The requests of the actual batch
	 * @param {string} sActualGroupId The group ID of the actual batch
	 * @param {object[]} aOptimisticRequests The requests of the optimistic batch
	 * @param {string} sOptimisticGroupId The group ID of the optimistic batch
	 * @returns {boolean}
	 *   Whether the actual batch requests and group ID matches the optimistic one
	 */
	_Requestor.matchesOptimisticBatch = function (aActualRequests, sActualGroupId,
		aOptimisticRequests, sOptimisticGroupId) {
		// no deepEqual because actual requests have additional properties which are irrelevant
		return sActualGroupId === sOptimisticGroupId
			&& aActualRequests.length === aOptimisticRequests.length
			&& aActualRequests.every(function (oActual, i) {
				// the payload is ignored because only GET requests are expected
				return oActual.url === aOptimisticRequests[i].url
					&& _Helper.deepEqual(
						getHeadersWithoutCSRFToken(oActual.headers),
						aOptimisticRequests[i].headers
					);
			});
	};

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
	 *   container is fully available, or rejected with an error
	 * @param {function} oModelInterface.fetchMetadata
	 *   A function that returns a SyncPromise which resolves with the metadata instance for a
	 *   given meta path
	 * @param {function} oModelInterface.fireDataReceived
	 *   A function that fires the 'dataReceived' event at the model with an optional parameter
	 *   <code>oError</code>
	 * @param {function} oModelInterface.fireDataRequested
	 *   A function that fires the 'dataRequested' event at the model
	 * @param {function} oModelInterface.fireSessionTimeout
	 *   A function that fires the 'sessionTimeout' event (when the server has created a session for
	 *   the model and this session ran into a timeout due to inactivity)
	 * @param {function} oModelInterface.getGroupProperty
	 *   A function called with parameters <code>sGroupId</code> and <code>sPropertyName</code>
	 *   returning the property value in question. Only 'submit' is supported for <code>
	 *   sPropertyName</code>. Supported property values are: 'API', 'Auto' and 'Direct'
	 * @param {function} oModelInterface.getMessagesByPath
	 *   A function returning model messages for which the target matches the given resolved binding
	 *   path
	 * @param {function} oModelInterface.getOptimisticBatchEnabler
	 *   A function that returns a callback function which controls the optimistic batch handling,
	 *   see also {@link sap.ui.model.odata.v4.ODataModel#setOptimisticBatchEnabler}
	 * @param {function} oModelInterface.getReporter
	 *   A catch handler function expecting an <code>Error</code> instance. This function will call
	 *   {@link sap.ui.model.odata.v4.ODataModel#reportError} if the error has not been reported
	 *   yet
	 * @param {function} oModelInterface.getRetryAfterHandler
	 *   A function that returns the "Retry-After" handler,
	 *   see also {@link sap.ui.model.odata.v4.ODataModel#setRetryAfterHandler}
	 * @param {function():boolean} oModelInterface.isIgnoreETag
	 *   Tells whether an entity's ETag should be actively ignored (If-Match:*) for PATCH requests.
	 * @param {function} oModelInterface.onCreateGroup
	 *   A callback function that is called with the group name as parameter when the first
	 *   request is added to a group
	 * @param {function} oModelInterface.reportStateMessages
	 *   A function to report OData state messages
	 * @param {function} oModelInterface.reportTransitionMessages
	 *   A function to report OData transition messages
	 * @param {function(sap.ui.core.message.Message[],sap.ui.core.message.Message[]):void} oModelInterface.updateMessages
	 *   A function to report messages to {@link module:sap/ui/core/Messaging}, expecting two arrays
	 *   of {@link sap.ui.core.message.Message} as parameters. The first array should be the old
	 *   messages and the second array the new messages.
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
	 * @param {boolean} [bWithCredentials]
	 *   Whether the XHR should be called with <code>withCredentials</code>
	 * @returns {object}
	 *   A new <code>_Requestor</code> instance
	 */
	_Requestor.create = function (sServiceUrl, oModelInterface, mHeaders, mQueryParams,
			sODataVersion, bWithCredentials) {
		var oRequestor = new _Requestor(sServiceUrl, mHeaders, mQueryParams, oModelInterface,
			bWithCredentials);

		if (sODataVersion === "2.0") {
			asV2Requestor(oRequestor);
		}

		return oRequestor;
	};

	return _Requestor;
});
