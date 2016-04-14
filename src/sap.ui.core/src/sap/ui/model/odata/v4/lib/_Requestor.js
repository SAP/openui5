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
			// This would have been the responsibility of submitBatch. But doing it here makes the
			// $batch recognition easier.
			sResourcePath += this.sQueryParams;
		} else {
			sPayload = JSON.stringify(oPayload);

			if (sGroupId !== "$direct") {
				oPromise = new Promise(function (fnResolve, fnReject) {
					var oLastChange,
						aRequests = that.mBatchQueue[sGroupId];

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
					} else {
						oLastChange = aRequests[0].length && aRequests[0][aRequests[0].length - 1];
						if (oLastChange
							&& oLastChange.method === "PATCH"
							&& oRequest.method === "PATCH"
							&& oLastChange.url === oRequest.url
							&& jQuery.sap.equal(oLastChange.headers, oRequest.headers)) {
							// merge related PATCH requests
							oLastChange.body = JSON.stringify(
								jQuery.extend(JSON.parse(oLastChange.body), oPayload));
							fnResolve(oLastChange.$promise);
						} else { // push into change set
							aRequests[0].push(oRequest);
						}
					}
				});
				oRequest.$promise = oPromise;
				return oPromise;
			}
		}

		return new Promise(function (fnResolve, fnReject) {
			jQuery.ajax(that.sServiceUrl + sResourcePath, {
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
		var aRequests = this.mBatchQueue[sGroupId];

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

		if (aRequests[0].length === 0) {
			aRequests.splice(0, 1); // delete empty change set
		} else if (aRequests[0].length === 1) {
			aRequests[0] = aRequests[0][0]; // unwrap change set
		}

		return this.request("POST", "$batch", undefined, undefined, aRequests)
			.then(visit.bind(null, aRequests)).catch(function (oError) {
				var oRequestError = new Error(
					"HTTP request was not processed because $batch failed");

				oRequestError.cause = oError;
				aRequests.forEach(function (oRequest) {
					oRequest.$reject(oRequestError);
				});
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