/*!
 * ${copyright}
 */
sap.ui.define([], function () {
	"use strict";

	function parseHeaders(sAllResponseHeaders) {
		var result = new Headers();
		sAllResponseHeaders.trim().split("\r\n").forEach(function (sHeader) {
			if (sHeader) {
				var pos = sHeader.indexOf(": ");
				if (pos > 0) {
					result.append(sHeader.slice(0, pos), sHeader.slice(pos + 2));
				} else {
					result.append(sHeader, "");
				}
			}
		});
		return result;
	}

	/**
	 * Represents the response object to a {@link module:sap/base/util/fetch} request and {@link module:sap/base/util/syncFetch} request.
	 * The implementation is based on the Response interface of the global <code>fetch()</code> method,
	 * but brings a much reduced set of properties and methods.
	 *
	 * The properties that are provided:
	 * <ul>
	 * 	<li>The <code>headers</code> property containing the <code>Headers</code> object</li>
	 * 	<li>The <code>ok</code> property containing a boolean stating whether the response was successful</li>
	 * 	<li>The <code>status</code> property containing the HTTP status code</li>
	 * 	<li>The <code>statusText</code> property containing an HTTP status message</li>
	 * </ul>
	 *
	 * The methods that are provided:
	 * <ul>
	 * 	<li>The <code>json()</code> method returns a promise that resolves with the result of parsing the XHR response text as JSON</li>
	 * 	<li>The <code>text()</code> method returns a promise that resolves with the XHR response text as String</li>
	 * </ul>
	 *
	 * In case of a response to a synchronous <code>sap.base.util.syncFetch</code> request,
	 * all methods will return the XHR response directly, according to the respective output format.
	 *
	 *
	 * @param {XMLHttpRequest} xhr The XMLHttpRequest object
	 * @param {Promise|sap.ui.base.SyncPromise} PromiseImpl A Promise for asynchronous requests, and
	 *                                          an <code>sap.ui.base.SyncPromise</code> for synchronous requests.
	 * @interface
	 * @alias sap.base.util.SimpleResponse
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	function SimpleResponse(xhr, PromiseImpl) {
		this.xhr = xhr;

		var headers = parseHeaders(this.xhr.getAllResponseHeaders());
		Object.defineProperties(this, {
			headers: {
				value: headers
			},
			ok: {
				value: this.xhr.status >= 200 && this.xhr.status < 300
			},
			status: {
				value: this.xhr.status
			},
			statusText: {
				value: this.xhr.statusText
			}
		});

		this.json = function() {
			if (this.xhr.responseType === "json") {
				return PromiseImpl.resolve(this.xhr.response);
			} else {
				try {
					var oData = JSON.parse(this.xhr.responseText);
					return PromiseImpl.resolve(oData);
				} catch (err) {
					return PromiseImpl.reject(err);
				}
			}
		};

		this.text = function() {
			return PromiseImpl.resolve(this.xhr.responseText);
		};
	}

	// Allowed request credentials
	var ALLOWED_CREDENTIALS = ["include", "omit", "same-origin"];

	/**
	 * Performs an asynchronous XMLHttpRequest (XHR) with the provided resource URL and request settings.
	 * It returns a Promise that resolves with an <code>sap.base.util.SimpleResponse</code> object, which is
	 * a simplified implementation of the global Response interface, representing the response of the XHR.
	 *
	 * If the request encounters network failures, the returned promise will be rejected with a <code>TypeError</code>.
	 * In case of an HTTP error status (e.g. error status 404), the returned promise will resolve instead.
	 * The <code>response.ok</code> or <code>response.status</code> flags can be used to distinguish
	 * a success status from an error status.
	 *
	 * The Promise will reject with a <code>DOMException</code> if the request gets aborted.
	 * To abort a request, an instance of the global <code>AbortSignal</code> must be provided to the settings via property <code>init.signal</code>.
	 * An abort signal can be created via an instance of the <code>AbortController</code>, and then using
	 * the <code>AbortController.signal</code> property. The signal associates the abort controller with the request
	 * and allows it to abort the XHR by calling <code>AbortController.abort()</code>.
	 *
	 * Although the usage of this method is very similar to the native <code>fetch()</code> method,
	 * it allows a much reduced set of request settings (in the <code>init</code> argument).
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
	 * @return {Promise<sap.base.util.SimpleResponse>} Returns a Promise resolving with <code>sap.base.util.SimpleResponse</code>
	 *
	 * @alias module:sap/base/util/fetch
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 */
	function fetch(resource, init, _mImplementations) {
		/**
		 * see "https://developer.mozilla.org/en-US/docs/Web/API/Request/Request"
		 * regarding default values
		 */
		init = Object.assign({
			body: null,
			credentials: "same-origin",
			method: "GET",
			signal: new AbortController().signal
			// mode: "cors",
			// redirect: "follow",
			// referrer: "about:client"
		}, init);

		// "sap/base/util/syncFetch" might pass a SyncPromise implementation
		var PromiseImpl = (_mImplementations && _mImplementations.promiseImpl) || Promise;

		return new PromiseImpl(function(resolve, reject) {
			// check for credentials in the resource URL
			var oUrl = new URL(resource, document.baseURI);
			if (oUrl.username || oUrl.password) {
				reject(new TypeError("Failed to execute 'fetch': Request cannot be constructed from a URL that includes credentials:" + resource));
			}

			if (init.body !== null && (init.method == "GET" || init.method == "HEAD")) {
				reject(new TypeError("Failed to execute 'fetch': Request with GET/HEAD method cannot have body."));
			}

			var xhr = new XMLHttpRequest();
			// event listener
			xhr.addEventListener("load", function() {
				var oResponse = new SimpleResponse(xhr, PromiseImpl);

				if (_mImplementations && _mImplementations.responseMixin) {
					_mImplementations.responseMixin.apply(oResponse);
				}
				resolve(oResponse);
			});
			xhr.addEventListener("error", function() {
				reject(new TypeError("Failed to fetch."));
			});

			xhr.open(init.method, resource, _mImplementations ? false : true);

			// see https://developer.mozilla.org/en-US/docs/Web/API/AbortController/abort
			init.signal.addEventListener("abort", function () {
				xhr.abort();
				reject(new DOMException("The user aborted a request.", "AbortError"));
			});

			// set request headers
			var oHeaders;
			if (init.headers instanceof Headers) {
				oHeaders = Object.fromEntries(init.headers);
			} else {
				oHeaders = init.headers || {};
			}
			Object.keys(oHeaders).forEach(function(key) {
				xhr.setRequestHeader(key, oHeaders[key]);
			});

			// request credentials
			if (ALLOWED_CREDENTIALS.includes(init.credentials)) {
				// set credentials
				if (init.credentials === "omit") {
					xhr.withCredentials = false;
				} else if (init.credentials === "include") {
					xhr.withCredentials = true;
				}
			} else {
				reject(new TypeError("Failed to execute 'fetch': Failed to read the 'credentials' property from 'RequestInit': The provided value " + init.credentials
					+ " is not a valid enum value of type RequestCredentials."));
			}

			// send request
			try {
				xhr.send(init.body);
			} catch (error) {
				reject(new TypeError(error.message));
			}
		});
	}

	/**
	 * Header values that can be used with the "Accept" and "Content-Type" headers
	 * in the fetch call or the response object.
	 *
	 * @type {Object}
	 * @private
	 * @ui5-restricted SAPUI5 Dist
	 *
	 */
	fetch.ContentTypes = {
		TEXT: "text/plain",
		HTML: "text/html",
		XML: "application/xml, text/xml",
		JSON: "application/json, text/javascript"
	};

	return fetch;
});