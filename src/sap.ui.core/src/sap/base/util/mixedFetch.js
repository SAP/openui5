/*!
 * ${copyright}
 */
sap.ui.define([
	"./fetch",
	"sap/ui/base/SyncPromise"
], function (fetch, SyncPromise) {
	"use strict";

	/**
	 * Allows to perform an synchronous or asynchronous XMLHttpRequest (XHR) with the provided resource URL and request settings.
	 * It returns a Promise resolving with an <code>sap.base.util.SimpleResponse</code> object, which is
	 * a simplified implementation of the global Response interface, representing the response of the XHR.
	 * It returns a <code>sap.ui.base.SyncPromise</code>, if the property <code>init.sync</code> is set to 'true'.
	 *
	 * If the request encounters network failures, the returned promise will be rejected with a <code>TypeError</code>.
	 * In case of an HTTP error status (e.g. error status 404), the returned promise will resolve instead. The properties
	 * <code>response.ok</code> or <code>response.status</code> can be used to distinguish
	 * a success status from an error status.
	 *
	 * The Promise or SyncPromise will reject with a <code>DOMException</code> if the request gets aborted.
	 * To abort a request, an instance of the global <code>AbortSignal</code> must be provided to the settings.
	 * An abort signal can be created via an instance of the <code>AbortController</code>, and then using
	 * the <code>AbortController.signal</code> property. The signal associates the abort controller with the request
	 * and allows it to abort the XHR by calling <code>AbortController.abort()</code>.
	 *
	 * @param  {string} resource A string containing the URL to which the request is sent
	 * @param  {object} [init] A set of key/value pairs that configure the request.
	 * @param  {any} [init.body] Any body that you want to add to your request: this can be a Blob, BufferSource, FormData, URLSearchParams, string, or ReadableStream object.
	 *                           Note that a request using the GET or HEAD method cannot have a body.
	 * @param  {"omit"|"same-origin"|"include"} [init.credentials='same-origin'] Controls what browsers do with credentials.
	 *                                                                           Must be either 'omit', 'same-origin' or 'include'.
	 * @param  {Headers|object} [init.headers] A Headers object or an object with key/value pairs containing the request headers
	 * @param  {string} [init.method='GET'] The request method, e.g. 'GET', 'POST'
	 * @param  {AbortSignal} [init.signal] An AbortSignal object instance which allows to abort the request
	 * @param  {boolean} [bSync=false] Performs a synchronous XMLHttpRequest if set to 'true'
	 * @return {Promise<sap.base.util.SimpleResponse>|sap.ui.base.SyncPromise<sap.base.util.SimpleResponse>} Returns a Promise or SyncPromise resolving with an <code>sap.base.util.SimpleResponse</code> object
	 *
	 * @alias module:sap/base/util/mixedFetch
	 * @private
	 * @ui5-restricted sap.ui.core, sap.ui.model
	 */
	function mixedFetch(resource, init, bSync) {
		var mImplementations;

		if (bSync === true) {
			mImplementations = {
				promiseImpl: SyncPromise
			};
		}

		return fetch(resource, init, mImplementations);
	}

	/**
	 * Header values that can be used with the "Accept" and "Content-Type" headers
	 * in the fetch call or the response object.
	 *
	 * @type {Object}
	 * @private
	 * @ui5-restricted sap.ui.core
	 *
	 */
	mixedFetch.ContentTypes = fetch.ContentTypes;

	return mixedFetch;
});