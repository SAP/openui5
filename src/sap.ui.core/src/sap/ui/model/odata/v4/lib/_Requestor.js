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

	var mBatchHeaders = { // headers for the $batch request
			"Accept" : "multipart/mixed"
		},
		mFinalHeaders = { // final (cannot be overridden) request headers for OData V4
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
		this.mRunningChangeRequests = {};
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
		this.sServiceUrl = sServiceUrl;
	}

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
	Requestor.prototype.cancelChangeRequests = function (fnFilter, sGroupId) {
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
	 * Cancels change requests for a given group. All pending change requests that have a
	 * <code>$cancel</code> callback are rejected with an error with property
	 * <code>canceled = true</code>. They are canceled in reverse order to properly undo stacked
	 * changes (like multiple PATCHes for the same property).
	 *
	 * @param {string} sGroupId
	 *   The group ID to be canceled
	 * @throws {Error}
	 *   If change requests for the given group ID are running.
	 *
	 * @private
	 */
	Requestor.prototype.cancelChanges = function (sGroupId) {
		if (this.mRunningChangeRequests[sGroupId]) {
			throw new Error("Cannot cancel the changes for group '" + sGroupId
				+ "', the batch request is running");
		}
		this.cancelChangeRequests(function () {
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
	 * Removes the pending PATCH request for the given promise from its group. Only requests for
	 * which the <code>$cancel</code> callback is defined are removed.
	 *
	 * @param {Promise} oPromise
	 *   A promise that has been returned for a PATCH request. It will be rejected with an error
	 *   with property <code>canceled = true</code>.
	 * @throws {Error}
	 *   If the request is not in the queue, assuming that it has been submitted already
	 *
	 * @private
	 */
	Requestor.prototype.removePatch = function (oPromise) {
		var bCanceled = this.cancelChangeRequests(function (oChangeRequest) {
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
		var bCanceled = this.cancelChangeRequests(function (oChangeRequest) {
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
	 *   queue, ignored for GET requests; {@link #cancelChanges} cancels this request only if this
	 *   callback is given
	 * @param {boolean} [bIsFreshToken=false]
	 *   Whether the CSRF token has already been refreshed and thus should not be refreshed
	 *   again
	 * @returns {Promise}
	 *   A promise on the outcome of the HTTP request
	 * @throws {Error}
	 *   If group ID is '$cached'
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

		if (sGroupId === "$cached") {
			throw new Error("Unexpected request: " + sMethod + " " + sResourcePath);
		}

		sGroupId = sGroupId || "$direct";
		if (bIsBatch) {
			oBatchRequest = _Batch.serializeBatchRequest(_Requestor.cleanBatch(oPayload));
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

			sPayload = JSON.stringify(_Requestor.cleanPayload(oPayload));
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
					that.request(oChange.method, oChange.url, sNewGroupId, oChange.headers, oBody,
						oChange.$submit, oChange.$cancel).then(oChange.$resolve, oChange.$reject);
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
					vRequest.$resolve(JSON.parse(vResponse.responseText));
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
		} else if (aChangeSet.length === 1) {
			aRequests[0] = aChangeSet[0]; // unwrap change set
		} else {
			aRequests[0] = aChangeSet;
		}

		bHasChanges = aChangeSet.length > 0;
		this.batchRequestSent(sGroupId, bHasChanges);

		return this.request("POST", "$batch", undefined, mBatchHeaders, aRequests)
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
	 * The <code>_Requestor<code> module which offers a factory method.
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

	return _Requestor;
}, /* bExport= */false);