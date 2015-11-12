/*!
 * ${copyright}
 */

//Provides class sap.ui.model.odata.v4.lib.Requestor
sap.ui.define(["jquery.sap.global"], function(jQuery) {
	"use strict";

	// predefined request headers for OData v4
	var mPredefinedHeaders = {
			"Accept" : "application/json;odata.metadata=minimal",
			"OData-MaxVersion" : "4.0",
			"OData-Version" : "4.0"
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
//FIX4MASTER		this.sServiceUrl = sServiceUrl;
		this.mHeaders = mHeaders;
	}

	/**
	 * Sends an HTTP request using the given method to the given URL, using the given
	 * request-specific headers in addition to the predefined OData v4 headers and the default
	 * headers given to the factory.
	 *
	 * @param {string} sMethod
	 *   HTTP method, e.g. "GET"
	 * @param {string} sUrl
	 *   some absolute URL (which must belong to the service for which this requestor has been
	 *   created)
	 * @param {object} mHeaders
	 *   map of request-specific headers, overriding both the predefined OData v4 headers and the
	 *   default headers given to the factory
	 * @returns {Promise}
	 *   a promise on the outcome of the HTTP request
	 * @private
	 */
	Requestor.prototype.request = function(sMethod, sUrl, mHeaders) {
		return Promise.resolve(
			jQuery.ajax(sUrl, {
				headers : jQuery.extend({}, mPredefinedHeaders, this.mHeaders, mHeaders),
				method : sMethod
			})
		);
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
		 * @returns {object}
		 *   a new <code>_Requestor<code> instance
		 */
		create : function (sServiceUrl, mHeaders) {
			return new Requestor(sServiceUrl, mHeaders);
		}
	};
}, /* bExport= */false);
