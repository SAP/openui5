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
	 * @param {function (string)} [fnOnCreateGroup]
	 *   A callback function that is called with the group name as parameter when the first
	 *   request is added to a group
	 * @private
	 */
	function Requestor(sServiceUrl, mHeaders, mQueryParams, fnOnCreateGroup) {
		this.mBatchQueue = {};
		this.mHeaders = mHeaders || {};
		this.fnOnCreateGroup = fnOnCreateGroup;
		this.sQueryParams = _Helper.buildQuery(mQueryParams); // Used for $batch and CSRF token only
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
		this.sServiceUrl = sServiceUrl;
	}

	/**
	 * Cancels all change requests in the batch queue of the given group or in all batch queues,
	 * if no <code>sGroupId</code> is given, for which the given filter function returns
	 * <code>true</code>. For these change requests the <code>$cancel</code> callback is called and
	 * the related promises are rejected with an error having property <code>canceled = true</code>.
	 *
	 * @param {function} fnFilter
	 *   A filter function which gets a change request as parameter and determines whether it has
	 *   to be canceled (returns <code>true</code>) or not.
	 * @param {string} [sGroupId]
	 *   The group the change request is related to
	 *
	 * @private
	 */
	Requestor.prototype.cancelChangeRequests = function (fnFilter, sGroupId) {
		var that = this;

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
				if (fnFilter(oChangeRequest)) {
					oChangeRequest.$cancel(); // all PATCH and POST have a $cancel
					oError = new Error("Request canceled: " + oChangeRequest.method + " "
						+ oChangeRequest.url + "; group: " + sGroupId0);
					oError.canceled = true;
					oChangeRequest.$reject(oError);
					aChangeSet.splice(i, 1);
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
	};

	/**
	 * Cancels all change requests (all PATCH and all POST requests) for a given group.
	 * All pending requests are rejected with an error with property <code>canceled = true</code>.
	 * PATCHes are canceled in reverse order to properly undo stacked changes.
	 *
	 * @param {string} sGroupId
	 *   The group ID to be canceled
	 *
	 * @private
	 */
	Requestor.prototype.cancelChanges = function (sGroupId) {
		this.cancelChangeRequests(function () {
			// change set contains only PATCH and POST requests; cancel all
			return true;
		}, sGroupId);
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
		var sGroupId;

		for (sGroupId in this.mBatchQueue) {
			if (this.mBatchQueue[sGroupId][0].length > 0) {
				return true;
			}
		}
		return false;
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
		this.cancelChangeRequests(function (oChangeRequest) {
			return oChangeRequest.$promise === oPromise;
		});
	};

	/**
	 * Removes the pending POST request with the given body from the given group.
	 *
	 * @param {string} sGroupId
	 *   The ID of the group containing the request
	 * @param {object} oBody
	 *   The body of the request
	 */
	Requestor.prototype.removePost = function (sGroupId, oBody) {
		this.cancelChangeRequests(function (oChangeRequest) {
			return oChangeRequest.body === oBody;
		}, sGroupId);
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
	 *   Data to be sent to the server; this object is live and can be modified until the request
	 *   is really sent
	 * @param {function} [fnSubmit]
	 *   A function that is called when the request has been submitted, either immediately (when
	 *   the group ID is "$direct") or via {@link #submitBatch}
	 * @param {function} [fnCancel]
	 *   A function that is called for clean-up if the request is canceled while waiting in a batch
	 *   queue; for <code>sMethod</code> === 'PATCH' or 'POST' the parameter is mandatory
	 * @param {boolean} [bIsFreshToken=false]
	 *   Whether the CSRF token has already been refreshed and thus should not be refreshed
	 *   again
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request
	 *
	 * @private
	 */
	Requestor.prototype.request = function (sMethod, sResourcePath, sGroupId, mHeaders, oPayload,
			fnSubmit, fnCancel, bIsFreshToken) {
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
			if (sGroupId !== "$direct") {
				oPromise = new Promise(function (fnResolve, fnReject) {
					var aRequests = that.mBatchQueue[sGroupId];

					if (!aRequests) {
						aRequests = that.mBatchQueue[sGroupId] = [[/*empty change set*/]];
						if (that.fnOnCreateGroup) {
							that.fnOnCreateGroup(sGroupId);
						}
					}
					oRequest = {
						method : sMethod,
						url : sResourcePath,
						headers : jQuery.extend({}, mPredefinedPartHeaders, that.mHeaders, mHeaders,
							mFinalHeaders),
						body : oPayload,
						$cancel : fnCancel,
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

			sPayload = JSON.stringify(oPayload);
			if (fnSubmit) {
				fnSubmit();
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
						// no fnSubmit, it has been called already
						// no fnCancel, it is only relevant while the request is in the queue
						fnResolve(that.request(sMethod, sResourcePath, sGroupId, mHeaders, oPayload,
							undefined, undefined, true));
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
					vResponse = aResponses[index];

				if (Array.isArray(vRequest)) {
					visit(vRequest, vResponse);
				} else if (vResponse) {
					if (vResponse.status >= 400) {
						vResponse.getResponseHeader = getResponseHeader;
						oCause = _Helper.createError(vResponse);
						vRequest.$reject(oCause);
					} else if (vResponse.responseText) {
						vRequest.$resolve(JSON.parse(vResponse.responseText));
					} else {
						vRequest.$resolve();
					}
				} else {
					oError = new Error(
						"HTTP request was not processed because the previous request failed");
					oError.cause = oCause;
					vRequest.$reject(oError);
				}
			});
		}

		function onSubmit(aRequests) {
			aRequests.forEach(function (vRequest) {
				if (Array.isArray(vRequest)) {
					onSubmit(vRequest);
				} else if (vRequest.$submit) {
					vRequest.$submit();
				}
			});
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
		 * @param {function (string)} [fnOnCreateGroup]
		 *   A callback function that is called with the group name as parameter when the first
		 *   request is added to a group
		 * @returns {object}
		 *   A new <code>_Requestor<code> instance
		 */
		create : function (sServiceUrl, mHeaders, mQueryParams, fnOnCreateGroup) {
			return new Requestor(sServiceUrl, mHeaders, mQueryParams, fnOnCreateGroup);
		}
	};
}, /* bExport= */false);