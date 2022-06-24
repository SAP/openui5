/*!
 * ${copyright}
 */
sap.ui.define([
	"./fetch",
	"sap/ui/base/SyncPromise"
], function (fetch, SyncPromise) {
	"use strict";

	function SyncResponseMixin() {
		this.text = text;
		this.json = json;
	}

	function text () {
		return SyncPromise.resolve(this.xhr.responseText).unwrap();
	}
	function json () {
		if (this.xhr.responseType === "json") {
			return SyncPromise.resolve(this.xhr.response).unwrap();
		} else {
			try {
				return SyncPromise.resolve(JSON.parse(this.xhr.responseText)).unwrap();
			} catch (err) {
				return SyncPromise.reject(err).unwrap();
			}
		}
	}

	/**
	 * Performs a synchronous XMLHttpRequest (XHR) with the provided resource URL and request settings.
	 * It returns a <code>sap.base.util.SimpleResponse</code> object, which is
	 * a simplified implementation of the global Response interface, representing the response of the XHR.
	 *
	 * If the request encounters network failures, this method will throw a <code>TypeError</code>.
	 * In case of an HTTP error status (e.g. error status 404), no error will be thrown. The properties
	 * <code>response.ok</code> or <code>response.status</code> can be used to distinguish
	 * a success status from an error status.
	 *
	 * A <code>DOMException</code> will be thrown if the request gets aborted.
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
	 *                                                   Must be either 'omit', 'same-origin' or 'include'.
	 * @param  {Headers|object} [init.headers] A Headers object or an object with key/value pairs containing the request headers
	 * @param  {string} [init.method='GET'] The request method, e.g. 'GET', 'POST'
	 * @param  {AbortSignal} [init.signal] An AbortSignal object instance which allows to abort the request
	 * @return {sap.base.util.SimpleResponse} Returns a <code>sap.base.util.SimpleResponse</code> response object
	 *
	 * @alias module:sap/base/util/syncFetch
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	function syncFetch(resource, init) {
		return fetch(resource, init, {
			promiseImpl: SyncPromise,
			responseMixin: SyncResponseMixin
		}).unwrap();
	}

	syncFetch.ContentTypes = fetch.ContentTypes;

	return syncFetch;
});