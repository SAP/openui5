/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define([
	"jquery.sap.global",
	"./_Batch",
	"./_Helper"
], function (jQuery, _Batch, _Helper) {
	"use strict";

	var mFinalHeaders = { // final (cannot be overridden) request headers for OData V4
			"Content-Type" : "application/json;charset=UTF-8;IEEE754Compatible=true"
		},
		mPredefinedPartHeaders = { // predefined request headers in $batch parts
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true"
		},
		mPredefinedRequestHeaders = { // predefined request headers for all requests
			"Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
			"OData-MaxVersion" : "4.0",
			"OData-Version" : "4.0",
			"X-CSRF-Token" : "Fetch"
		};

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
	 * Constructor for a new <code>_Requestor<code> instance for the given service URL and default
	 * headers.
	 *
	 * @param {string} sServiceUrl
	 *   URL of the service document to request the CSRF token from; also used to resolve
	 *   relative resource paths (see {@link #request})
	 * @param {object} mHeaders
	 *   Map of default headers; may be overridden with request-specific headers; certain
	 *   predefined OData V4 headers are added by default, but may be overridden
	 * @param {object} mQueryParams
	 *   A map of query parameters as described in {@link _Helper.buildQuery}; used only to
	 *   request the CSRF token
	 * @private
	 */
	function Requestor(sServiceUrl, mHeaders, mQueryParams) {
		this.mBatchQueue = {};
		this.mHeaders = mHeaders || {};
		this.sQueryParams = _Helper.buildQuery(mQueryParams); // Used for $batch and CSRF token only
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
		this.sServiceUrl = sServiceUrl;
	}

	/**
	 * Cancels all PATCH requests for a given group.
	 * All pending requests are rejected with an error with property <code>canceled = true</code>.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be canceled
	 *
	 * @private
	 */
	Requestor.prototype.cancelPatch = function (sGroupId) {
		var aBatchQueue = this.mBatchQueue[sGroupId],
			oError = new Error("Group '" + sGroupId + "' canceled"),
			aChangeSet,
			i;

		if (!aBatchQueue) {
			return;
		}
		oError.canceled = true;
		aChangeSet = aBatchQueue[0];
		aBatchQueue[0] = [];
		for (i = aChangeSet.length - 1; i >= 0; i--) {
			if (aChangeSet[i].method === "PATCH") {
				aChangeSet[i].$reject(oError);
			} else {
				// all other methods stay in the change set
				aBatchQueue[0].push(aChangeSet[i]);
			}
		}
		deleteEmptyGroup(this, sGroupId);
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
	 * Returns a promise that will be resolved once the CSRF token has been refreshed, or rejected
	 * if that fails. Makes sure that only one HEAD request is underway at any given time and
	 * shares the promise accordingly.
	 *
	 * @returns {Promise}
	 *   A promise that will be resolved (with no result) once the CSRF token has been refreshed.
	 *
	 * @private
	 */
	Requestor.prototype.refreshSecurityToken = function () {
		var that = this;

		if (!this.oSecurityTokenPromise) {
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
	 * Removes the pending PATCH request for the given promise from its group.
	 *
	 * @param {Promise} oPromise
	 *   A promise that has been returned for a PATCH request. It will be rejected with an error
	 *   with property <code>canceled = true</code>.
	 *
	 * @private
	 */
	Requestor.prototype.removePatch = function (oPromise) {
		var aBatchQueue, aChangeSet, oError, sGroupId, i;

		for (sGroupId in this.mBatchQueue) {
			aBatchQueue = this.mBatchQueue[sGroupId];
			aChangeSet = aBatchQueue[0];
			for (i = 0; i < aChangeSet.length; i++) {
				if (aChangeSet[i].$promise === oPromise) {
					oError = new Error();
					oError.canceled = true;
					aChangeSet[i].$reject(oError);
					aChangeSet.splice(i, 1);
					deleteEmptyGroup(this, sGroupId);
					return;
				}
			}
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
	 * @param {string} [sGroupId="$direct"]
	 *   Identifier of the group to associate the request with; if '$direct', the request is
	 *   sent immediately; for all other group ID values, the request is added to the given group
	 *   and you can use {@link #submitBatch} to send all requests in that group.
	 * @param {object} [mHeaders]
	 *   Map of request-specific headers, overriding both the mandatory OData V4 headers and the
	 *   default headers given to the factory. This map of headers must not contain
	 *   "X-CSRF-Token" header.
	 * @param {object} [oPayload]
	 *   Data to be sent to the server
	 * @param {boolean} [bIsFreshToken=false]
	 *   Whether the CSRF token has already been refreshed and thus should not be refreshed
	 *   again
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request
	 * @private
	 */
	Requestor.prototype.request = function (sMethod, sResourcePath, sGroupId, mHeaders, oPayload,
		bIsFreshToken) {
		var that = this,
			oBatchRequest,
			bIsBatch = sResourcePath === "$batch",
			sPayload,
			oPromise,
			oRequest;

		sGroupId = sGroupId || "$direct";
		if (bIsBatch) {
			oBatchRequest = _Batch.serializeBatchRequest(oPayload);
			sPayload = oBatchRequest.body;
		} else {
			sPayload = JSON.stringify(oPayload);

			if (sGroupId !== "$direct") {
				oPromise = new Promise(function (fnResolve, fnReject) {
					var aRequests = that.mBatchQueue[sGroupId];

					if (!aRequests) {
						aRequests = that.mBatchQueue[sGroupId] = [[/*empty change set*/]];
					}
					oRequest = {
						method : sMethod,
						url : sResourcePath,
						headers : jQuery.extend({}, mPredefinedPartHeaders, that.mHeaders, mHeaders,
							mFinalHeaders),
						body : sPayload,
						$reject : fnReject,
						$resolve : fnResolve
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
		}

		return new Promise(function (fnResolve, fnReject) {
			// Adding query parameters could have been the responsibility of submitBatch, but doing
			// it here makes the $batch recognition easier.
			jQuery.ajax(that.sServiceUrl + sResourcePath + (bIsBatch ? that.sQueryParams : ""), {
				data : sPayload,
				headers : jQuery.extend({}, mPredefinedRequestHeaders, that.mHeaders, mHeaders,
					bIsBatch ? oBatchRequest.headers : mFinalHeaders),
				method : sMethod
			}).then(function (oPayload, sTextStatus, jqXHR) {
				that.mHeaders["X-CSRF-Token"]
					= jqXHR.getResponseHeader("X-CSRF-Token") || that.mHeaders["X-CSRF-Token"];
				if (bIsBatch) {
					oPayload = _Batch.deserializeBatchResponse(
						jqXHR.getResponseHeader("Content-Type"), oPayload);
				}
				fnResolve(oPayload);
			}, function (jqXHR, sTextStatus, sErrorMessage) {
				var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
				if (!bIsFreshToken && jqXHR.status === 403
						&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
					// refresh CSRF token and repeat original request
					that.refreshSecurityToken().then(function () {
						fnResolve(that.request(sMethod, sResourcePath, sGroupId, mHeaders, oPayload,
							true));
					}, fnReject);
				} else {
					fnReject(_Helper.createError(jqXHR));
				}
			});
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
			oPreviousChange,
			aRequests = this.mBatchQueue[sGroupId];

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
					vResponse = aResponses[index];

				if (Array.isArray(vRequest)) {
					visit(vRequest, vResponse);
				} else if (vResponse) {
					if (vResponse.status >= 400) {
						vResponse.getResponseHeader = getResponseHeader;
						oCause = _Helper.createError(vResponse);
						vRequest.$reject(oCause);
					} else {
						vRequest.$resolve(JSON.parse(vResponse.responseText));
					}
				} else {
					oError = new Error(
						"HTTP request was not processed because the previous request failed");
					oError.cause = oCause;
					vRequest.$reject(oError);
				}
			});
		}

		if (!aRequests) {
			return Promise.resolve();
		}
		delete this.mBatchQueue[sGroupId];

		// iterate over the change set and merge related PATCH requests
		aRequests[0].forEach(function (oChange) {
			if (oPreviousChange
					&& oPreviousChange.method === "PATCH"
					&& oChange.method === "PATCH"
					&& oPreviousChange.url === oChange.url
					&& jQuery.sap.equal(oPreviousChange.headers, oChange.headers)) {
				// merge related PATCH requests
				oPreviousChange.body = JSON.stringify(
					jQuery.extend(JSON.parse(oPreviousChange.body), JSON.parse(oChange.body)));
				oChange.$resolve(oPreviousChange.$promise);
			} else { // push into change set
				aChangeSet.push(oChange);
				oPreviousChange = oChange;
			}
		});

		if (aChangeSet.length === 0) {
			aRequests.splice(0, 1); // delete empty change set
		} else if (aChangeSet.length === 1) {
			aRequests[0] = aChangeSet[0]; // unwrap change set
		} else {
			aRequests[0] = aChangeSet;
		}

		return this.request("POST", "$batch", undefined, undefined, aRequests)
			.then(visit.bind(null, aRequests)).catch(function (oError) {
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

				oRequestError.cause = oError;
				rejectAll(aRequests);
				throw oError;
			});
	};

	/**
	 * The <code>_Requestor<code> module which offers a factory method.
	 *
	 * @private
	 */
	return {
		/**
		 * Creates a new <code>_Requestor<code> instance for the given service URL and default
		 * headers.
		 *
		 * @param {string} sServiceUrl
		 *   URL of the service document to request the CSRF token from; also used to resolve
		 *   relative resource paths (see {@link #request})
		 * @param {object} mHeaders
		 *   Map of default headers; may be overridden with request-specific headers; certain
		 *   OData V4 headers are predefined, but may be overridden by the default or
		 *   request-specific headers:
		 *   <pre>{
		 *     "Accept" : "application/json;odata.metadata=minimal;IEEE754Compatible=true",
		 *     "OData-MaxVersion" : "4.0",
		 *     "OData-Version" : "4.0"
		 *   }</pre>
		 *   The map of the default headers must not contain "X-CSRF-Token" header. The created
		 *   <code>_Requestor<code> always sets the "Content-Type" header to
		 *   "application/json;charset=UTF-8;IEEE754Compatible=true" value.
		 * @param {object} mQueryParams
		 *   A map of query parameters as described in {@link _Helper.buildQuery}; used only to
		 *   request the CSRF token
		 * @returns {object}
		 *   A new <code>_Requestor<code> instance
		 */
		create : function (sServiceUrl, mHeaders, mQueryParams) {
			return new Requestor(sServiceUrl, mHeaders, mQueryParams);
		}
	};
}, /* bExport= */false);