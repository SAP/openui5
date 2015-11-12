/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define(["jquery.sap.global"], function(jQuery) {
	"use strict";

	var mFinalHeaders = { // final (cannot be overridden) request headers for OData v4
			"Content-Type" : "application/json;charset=UTF-8"
		},
		mPredefinedHeaders = { // predefined request headers for OData v4
			"Accept" : "application/json;odata.metadata=minimal",
			"OData-MaxVersion" : "4.0",
			"OData-Version" : "4.0",
			"X-CSRF-Token" : "Fetch"
		};

	/**
	 * Constructor for a new <code>_Requestor<code> instance for the given service URL and default
	 * headers.
	 *
	 * @param {string} sServiceUrl
	 *   URL of the service document to request the CSRF token from
	 * @param {object} mHeaders
	 *   map of default headers; may be overridden with request-specific headers; certain
	 *   predefined OData v4 headers are added by default, but may be overridden
	 * @private
	 */
	function Requestor(sServiceUrl, mHeaders) {
		this.sServiceUrl = sServiceUrl;
		this.mHeaders = mHeaders || {};
		this.oSecurityTokenPromise = null; // be nice to Chrome v8
	}

	/**
	 * Returns a promise that will be resolved once the CSRF token has been refreshed, or rejected
	 * if that fails. Makes sure that only one HEAD request is underway at any given time and
	 * shares the promise accordingly.
	 *
	 * @returns {Promise}
	 *   A promise that will be resolved (with no result) once the CSRF token has been refreshed;
	 *   it also has an <code>abort</code> property which provides access to the HEAD request's
	 *   <code>abort</code> function.
	 *
	 * @private
	 */
	Requestor.prototype.refreshSecurityToken = function () {
		var fnAbort,
			that = this;

		if (!this.oSecurityTokenPromise) {
			this.oSecurityTokenPromise = new Promise(function (fnResolve, fnReject) {
				var jqXHR = jQuery.ajax(that.sServiceUrl, {
						method: "HEAD",
						headers : {
							"X-CSRF-Token" : "Fetch"
						}
					});
				fnAbort = jqXHR.abort;
				jqXHR.then(function (oData, sTextStatus, jqXHR) {
					that.mHeaders["X-CSRF-Token"] = jqXHR.getResponseHeader("X-CSRF-Token");
					that.oSecurityTokenPromise = null;
					fnResolve();
				}, function (jqXHR, sTextStatus, sErrorMessage) {
					that.oSecurityTokenPromise = null;
					fnReject(new Error(sErrorMessage)/*TODO Helper.createError(jqXHR)*/);
				});
			});
			this.oSecurityTokenPromise.abort = fnAbort;
		}

		return this.oSecurityTokenPromise;
	};

	/**
	 * Sends an HTTP request using the given method to the given relative URL, using the given
	 * request-specific headers in addition to the mandatory OData v4 headers and the default
	 * headers given to the factory. Takes care of CSRF token handling.
	 *
	 * @param {string} sMethod
	 *   HTTP method, e.g. "GET"
	 * @param {string} sUrl
	 *   some absolute URL (which must belong to the service for which this requestor has been
	 *   created)
	 * @param {object} [mHeaders]
	 *   map of request-specific headers, overriding both the mandatory OData v4 headers and the
	 *   default headers given to the factory. This map of headers must not contain
	 *   "X-CSRF-Token" header.
	 * @param {object} [oPayload]
	 *   data to be sent to the server
	 * @param {boolean} [bIsFreshToken=false]
	 *   whether the CSRF token has already been refreshed and thus should not be refreshed
	 *   again
	 * @returns {Promise}
	 *   a promise on the outcome of the HTTP request
	 * @private
	 */
	Requestor.prototype.request = function (sMethod, sUrl, mHeaders, oPayload, bIsFreshToken) {
		var that = this;

		return new Promise(function (fnResolve, fnReject) {
			jQuery.ajax(sUrl, {
				data : JSON.stringify(oPayload),
				headers : jQuery.extend({},
					mPredefinedHeaders, that.mHeaders, mHeaders, mFinalHeaders),
				method : sMethod
			}).then(function (oPayload, sTextStatus, jqXHR) {
				that.mHeaders["X-CSRF-Token"]
					= jqXHR.getResponseHeader("X-CSRF-Token") || that.mHeaders["X-CSRF-Token"];
				fnResolve(oPayload);
			}, function (jqXHR, sTextStatus, sErrorMessage) {
				var sCsrfToken = jqXHR.getResponseHeader("X-CSRF-Token");
				if (!bIsFreshToken && jqXHR.status === 403
						&& sCsrfToken && sCsrfToken.toLowerCase() === "required") {
					// refresh CSRF token and repeat original request
					that.refreshSecurityToken().then(function () {
						fnResolve(that.request(sMethod, sUrl, mHeaders, oPayload, true));
					}, fnReject);
				} else {
					fnReject(new Error(sErrorMessage)/*TODO Helper.createError(jqXHR)*/);
				}
			});
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
		 *   URL of the service document to request the CSRF token from
		 * @param {object} mHeaders
		 *   map of default headers; may be overridden with request-specific headers; certain
		 *   OData v4 headers are predefined, but may be overridden by the default or
		 *   request-specific headers:
		 *   <pre>{
		 *     "Accept" : "application/json;odata.metadata=minimal",
		 *     "OData-MaxVersion" : "4.0",
		 *     "OData-Version" : "4.0"
		 *   }</pre>
		 *   The map of the default headers must not contain "X-CSRF-Token" header. The created
		 *   <code>_Requestor<code> always sets the "Content-Type" header to
		 *   "application/json;charset=UTF-8" value.
		 * @returns {object}
		 *   a new <code>_Requestor<code> instance
		 */
		create : function (sServiceUrl, mHeaders) {
			return new Requestor(sServiceUrl, mHeaders);
		}
	};
}, /* bExport= */false);
