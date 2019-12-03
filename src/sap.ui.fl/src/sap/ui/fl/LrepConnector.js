/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/ui/thirdparty/URI",
	"sap/ui/fl/Utils",
	"sap/base/util/merge"
], function(
	jQuery,
	uri,
	FlexUtils,
	fnBaseMerge
) {
	"use strict";

	/**
	 * Provides the connectivity to the LRep & UI5 Flexibility Services REST-routes
	 *
	 * @param {object} [mParameters] - map of parameters, see below
	 * @param {String} [mParameters.XsrfToken] - XSRF token which can be reused for back-end connectivity. If no XSRF token is passed, a new one
	 *		will be fetched from back end.
	 * @constructor
	 * @alias sap.ui.fl.LrepConnector
	 * @deprecated
	 * @private
	 * @ui5-restricted
	 * @author SAP SE
	 * @version ${version}
	 */
	var LrepConnector = function(mParameters) {
		this._initClientParam();
		this._initLanguageParam();
		if (mParameters) {
			this._sXsrfToken = mParameters.XsrfToken;
		}
	};

	LrepConnector.createConnector = function(mParameters) {
		return new LrepConnector(mParameters);
	};

	LrepConnector._oLoadSettingsPromise = undefined;
	LrepConnector.prototype._sClient = undefined;
	LrepConnector.prototype._sLanguage = undefined;
	LrepConnector.prototype._aSentRequestListeners = [];
	LrepConnector.prototype._sRequestUrlPrefix = "";
	LrepConnector.DEFAULT_CONTENT_TYPE = "application/json; charset=utf-8";
	LrepConnector.ROUTES = {
		CONTENT: "/content/",
		CSRF: "/actions/getcsrftoken/",
		PUBLISH: "/actions/publish/",
		DATA: "/flex/data/",
		MODULES: "/flex/modules/",
		SETTINGS: "/flex/settings",
		INFO: "/flex/info"
	};

	/**
	 * Extract client from current running instance
	 *
	 * @private
	 */
	LrepConnector.prototype._initClientParam = function() {
		var client = FlexUtils.getClient();
		if (client) {
			this._sClient = client;
		}
	};

	/**
	 * Extract the sap-language URL parameter from current URL
	 *
	 * @private
	 */
	LrepConnector.prototype._initLanguageParam = function() {
		var sLanguage;
		sLanguage = FlexUtils.getUrlParameter("sap-language") || FlexUtils.getUrlParameter("sap-ui-language");
		if (sLanguage) {
			this._sLanguage = sLanguage;
		}
	};

	/**
	 * Resolves the complete URL of a request using the back-end URL and the relative URL from the request
	 *
	 * @param {String} sRelativeUrl - relative URL of the current request
	 * @returns {String} returns the complete uri for this request
	 * @private
	 */
	LrepConnector.prototype._resolveUrl = function(sRelativeUrl) {
		if (!sRelativeUrl.startsWith("/")) {
			sRelativeUrl = "/" + sRelativeUrl;
		}
		sRelativeUrl = this._sRequestUrlPrefix + sRelativeUrl;
		var oUri = uri(sRelativeUrl).absoluteTo("");
		return oUri.toString();
	};

	/**
	 * Get the default header for a request
	 *
	 * @returns {Object} Returns an object containing all headers for each request
	 * @private
	 */
	LrepConnector.prototype._getDefaultHeader = function() {
		return {
			headers: {
				"X-CSRF-Token": this._sXsrfToken || "fetch"
			}
		};
	};

	/**
	 * Get the default options, required for the jQuery.ajax request
	 *
	 * @param {String} sMethod - HTTP-method (PUT, POST, GET (default)...) used for this request
	 * @param {String} sContentType - Set the content-type manually and overwrite the default (application/json)
	 * @param {Object} oData - Payload of the request
	 * @returns {Object} Returns an object containing the options and the default header for a jQuery.ajax request
	 * @private
	 */
	LrepConnector.prototype._getDefaultOptions = function(sMethod, sContentType, oData) {
		var mOptions;
		if (!sContentType) {
			sContentType = LrepConnector.DEFAULT_CONTENT_TYPE;
		} else if (sContentType.indexOf("charset") === -1) {
			sContentType += "; charset=utf-8";
		}

		mOptions = fnBaseMerge(this._getDefaultHeader(), {
			type: sMethod,
			async: true,
			contentType: sContentType,
			processData: false,
			//xhrFields: {
			//	withCredentials: true
			//},
			headers: {
				"Content-Type": sContentType
			}
		});

		if (oData && mOptions.contentType.indexOf("application/json") === 0) {
			mOptions.dataType = "json";
			if (typeof oData === "object") {
				mOptions.data = JSON.stringify(oData);
			} else {
				mOptions.data = oData;
			}
		} else if (oData) {
			mOptions.data = oData;
		}

		if (sMethod === "DELETE") {
			delete mOptions.data;
			delete mOptions.contentType;
		}

		return mOptions;
	};

	/**
	 * Send a request to the back end
	 *
	 * @param {String} sUri Relative URL for this request
	 * @param {String} [sMethod] HTTP-method to be used by this request (default GET)
	 * @param {Object} [oData] Payload of the request
	 * @param {Object} [mOptions] Additional options which should be used in the request
	 * @returns {Promise} Returns a promise to the result of the request
	 * @deprecated
	 * @public
	 */
	LrepConnector.prototype.send = function(sUri, sMethod, oData, mOptions) {
		sMethod = sMethod || "GET";
		sMethod = sMethod.toUpperCase();
		mOptions = mOptions || {};
		sUri = this._resolveUrl(sUri);

		mOptions = fnBaseMerge(this._getDefaultOptions(sMethod, mOptions.contentType, oData), mOptions);

		return this._sendAjaxRequest(sUri, mOptions);
	};

	/**
	 * Extracts the messages from the back-end response
	 *
	 * @param {Object} oXHR - ajax request object
	 * @returns {Array} Array of messages, for example <code>[ { "severity": "Error", "text": "content id must be non-initial" } ] </code>
	 * @private
	 */
	LrepConnector.prototype._getMessagesFromXHR = function(oXHR) {
		var errorResponse;
		var aMessages;
		var length;
		var i;
		aMessages = [];
		try {
			errorResponse = JSON.parse(oXHR.responseText);
			if (errorResponse && errorResponse.messages && errorResponse.messages.length > 0) {
				length = errorResponse.messages.length;
				for (i = 0; i < length; i++) {
					aMessages.push({
						severity: errorResponse.messages[i].severity,
						text: errorResponse.messages[i].text
					});
				}
			}
		} catch (e) {
			// ignore
		}

		return aMessages;
	};

	/**
	 * Sends an AJAX request; this request is suppressed in case the flexibility services are disabled in the bootstrap.
	 *
	 * @param {String} sUri - Complete request URL
	 * @param {Object} mOptions - Options to be used by the request
	 * @returns {Promise} Returns a Promise with the status and response and messages
	 * @private
	 */
	LrepConnector.prototype._sendAjaxRequest = function(sUri, mOptions) {
		var sFlexibilityServicePrefix = FlexUtils.getLrepUrl();

		if (!sFlexibilityServicePrefix) {
			return Promise.reject({
				status: "warning",
				messages: [{severity:"warning", text:"Flexibility Services requests were not sent. The UI5 bootstrap is configured to not send any requests."}]
			});
		}

		var sFetchXsrfTokenUrl = sFlexibilityServicePrefix + LrepConnector.ROUTES.CSRF;
		var mFetchXsrfTokenOptions = {
			headers: {
				"X-CSRF-Token": "fetch"
			},
			type: "HEAD"
		};

		if (this._sClient) {
			mFetchXsrfTokenOptions.headers["sap-client"] = this._sClient;
		}

		return new Promise(function(resolve, reject) {
			function handleValidRequest(oResponse, sStatus, oXhr) {
				var sNewCsrfToken = oXhr.getResponseHeader("X-CSRF-Token");
				this._sXsrfToken = sNewCsrfToken || this._sXsrfToken;
				var sEtag = oXhr.getResponseHeader("etag");

				var oResult = {
					status: sStatus,
					etag: sEtag,
					response: oResponse
				};

				resolve(oResult);

				jQuery.each(this._aSentRequestListeners, function(iIndex, fCallback) {
					fCallback(oResult);
				});
			}

			function prepareErrorAndReject(fnReject, oXhr, sStatus, sErrorThrown) {
				// Fetching XSRF Token failed
				var oError = new Error(sErrorThrown);
				oError.status = sStatus;
				oError.code = oXhr.statusCode().status;
				oError.messages = this._getMessagesFromXHR(oXhr);
				// for IE11 - Error.prototype.stack is not set until error is caught
				if (!oError.stack) {
					try {
						throw oError;
					} catch (oErrorCaught) {
						fnReject(oErrorCaught);
					}
				} else {
					// for other browsers
					fnReject(oError);
				}
			}

			function fetchTokenAndHandleRequest(oResponse, sStatus, oXhr) {
				this._sXsrfToken = oXhr.getResponseHeader("X-CSRF-Token");
				mOptions.headers = mOptions.headers || {};
				mOptions.headers["X-CSRF-Token"] = this._sXsrfToken;

				// Re-send request after fetching token
				jQuery.ajax(sUri, mOptions)
					.done(handleValidRequest)
					.fail(prepareErrorAndReject.bind(this, reject));
			}

			function refetchTokenAndRequestAgainOrHandleInvalidRequest(fnResolve, fnReject, oXhr, sStatus, sErrorThrown) {
				if (oXhr.status === 403) {
					// Token seems to be invalid, refetch and then resend
					jQuery.ajax(sFetchXsrfTokenUrl, mFetchXsrfTokenOptions).done(fetchTokenAndHandleRequest.bind(this)).fail(function() {
						// Fetching XSRF Token failed
						fnReject({
							status: "error"
						});
					});
				} else if (mOptions && mOptions.type === "DELETE" && oXhr.status === 404) {
						// Do not reject, if a file was not found during deletion
						// (can be the case if another user already triggered a restore meanwhile)
					fnResolve();
				} else {
					prepareErrorAndReject.call(this, fnReject, oXhr, sStatus, sErrorThrown);
				}
			}

			//Check, whether CSRF token has to be requested
			var bRequestCSRFToken = true;
			if (mOptions && mOptions.type) {
				if (mOptions.type === "GET" || mOptions.type === "HEAD") {
					bRequestCSRFToken = false;
				} else if (this._sXsrfToken && this._sXsrfToken !== "fetch") {
					bRequestCSRFToken = false;
				}
			}

			if (bRequestCSRFToken) {
				// Fetch XSRF Token
				jQuery.ajax(sFetchXsrfTokenUrl, mFetchXsrfTokenOptions)
					.done(fetchTokenAndHandleRequest.bind(this))
					.fail(prepareErrorAndReject.bind(this, reject));
			} else {
				// Send normal request
				jQuery.ajax(sUri, mOptions)
					.done(handleValidRequest.bind(this))
					.fail(refetchTokenAndRequestAgainOrHandleInvalidRequest.bind(this, resolve, reject));
			}
		}.bind(this));
	};

	/**
	 * @param {Array} aParams Array of parameter objects in format {name:<name>, value:<value>}
	 * @returns {String} Returns a String with all parameters concatenated
	 * @private
	 */
	LrepConnector.prototype._buildParams = function(aParams) {
		if (!aParams) {
			aParams = [];
		}
		if (this._sClient) {
			// Add mandatory "sap-client" parameter
			aParams.push({
				name: "sap-client",
				value: this._sClient
			});
		}

		if (this._sLanguage) {
			// Add mandatory "sap-language" URL parameter.
			// Only use sap-language if there is an sap-language parameter in the original URL.
			// If sap-language is not added, the browser language might be used as back-end login language instead of sap-language.
			aParams.push({
				name: "sap-language",
				value: this._sLanguage
			});
		}

		var result = "";
		var len = aParams.length;
		for (var i = 0; i < len; i++) {
			if (i === 0) {
				result += "?";
			} else if (i > 0 && i < len) {
				result += "&";
			}
			result += aParams[i].name + "=" + aParams[i].value;
		}
		return result;
	};

	LrepConnector.prototype.loadChanges = function(oComponent, mPropertyBag) {
		function _createRequestOptions(mPropertyBag) {
			var mOptions = {};

			if (mPropertyBag.cacheKey) {
				mOptions.cache = true;
			}
			if (mPropertyBag.siteId) {
				if (!mOptions.headers) {
					mOptions.headers = {};
				}

				mOptions.headers = {
					"X-LRep-Site-Id": mPropertyBag.siteId
				};
			}

			if (mPropertyBag.appDescriptor) {
				if (mPropertyBag.appDescriptor["sap.app"]) {
					if (!mOptions.headers) {
						mOptions.headers = {};
					}

					mOptions.headers = {
						"X-LRep-AppDescriptor-Id": mPropertyBag.appDescriptor["sap.app"].id
					};
				}
			}

			return mOptions;
		}

		function _createUrls(oComponent, mPropertyBag, sClient) {
			var mUrls = {};
			var sFlexDataPrefix = FlexUtils.getLrepUrl() + LrepConnector.ROUTES.DATA;
			var sFlexModulesPrefix = FlexUtils.getLrepUrl() + LrepConnector.ROUTES.MODULES;
			var sPostFix = "";

			if (mPropertyBag.cacheKey) {
				sPostFix += "~" + mPropertyBag.cacheKey + "~/";
			}

			sPostFix += oComponent.name;


			if (mPropertyBag.layer) {
				sPostFix += "&upToLayerType=" + mPropertyBag.layer;
			}

			if (sClient) {
				sPostFix += "&sap-client=" + sClient;
			}

			if (oComponent.appVersion && (oComponent.appVersion !== FlexUtils.DEFAULT_APP_VERSION)) {
				sPostFix += "&appVersion=" + oComponent.appVersion;
			}

			// Replace first & with ?
			sPostFix = sPostFix.replace("&", "?");

			mUrls.flexDataUrl = mUrls.flexDataUrl || sFlexDataPrefix + sPostFix;
			mUrls.flexModulesUrl = mUrls.flexModulesUrl || sFlexModulesPrefix + sPostFix;

			return mUrls;
		}

		mPropertyBag = mPropertyBag || {};

		if (!oComponent.name) {
			return Promise.reject(new Error("Component name not specified"));
		}

		var mOptions = _createRequestOptions(mPropertyBag);

		var mUrls = _createUrls.call(this, oComponent, mPropertyBag, this._sClient);

		return this.send(mUrls.flexDataUrl, undefined, undefined, mOptions)
			.then(this._onChangeResponseReceived.bind(this, oComponent.name, mUrls.flexModulesUrl, mPropertyBag.cacheKey));
	};

	LrepConnector.prototype._onChangeResponseReceived = function (sComponentName, sFlexModulesUri, sCacheKey, oResponse) {
		LrepConnector._bServiceAvailability = true;
		// If a cachebuster token is used, we provide no etag in the response.
		// For the view cache feature, we must provide a etag, that's why we set the value from the
		// cachebuster token as etag
		if (oResponse.etag === null) {
			oResponse.etag = sCacheKey;
		}
		var mFlexData = {
			changes : oResponse.response,
			loadModules : oResponse.response.loadModules,
			messagebundle : oResponse.response.messagebundle,
			componentClassName : sComponentName,
			etag : oResponse.etag
		};

		if (!mFlexData.loadModules) {
			return mFlexData;
		}


		return this._loadModules(sFlexModulesUri).then(function () {
			/* the modules within the server response are preloaded by the browser processing the request.
			 * The promise chain only needs to return the response of the first server request. */
			return mFlexData;
		});
	};

	/**
	 * Loads flexibility settings.
	 *
	 * @returns {Promise} Returns a Promise with the flexibility settings content
	 * @deprecated
	 * @public
	 */
	LrepConnector.prototype.loadSettings = function() {
		if (!LrepConnector._oLoadSettingsPromise) {
			var sUri = FlexUtils.getLrepUrl() + LrepConnector.ROUTES.SETTINGS;

			if (this._sClient) {
				sUri += "?sap-client=" + this._sClient;
			}
			LrepConnector._oLoadSettingsPromise = this.send(sUri, undefined, undefined, {});
		}

		return LrepConnector._oLoadSettingsPromise.then(function(oResponse) {
			LrepConnector._bServiceAvailability = true;
			return oResponse.response;
		}, function(oError) {
			if (oError.code === 404) {
				LrepConnector._bServiceAvailability = false;
			}
			//In case of failure, resolve promise without value. Error handle is done in Settings class
			return Promise.resolve();
		});
	};

	/**
	 * Authenticated access to a resource in the Lrep
	 *
	 * @param {String} sNamespace The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {Boolean} bIsRuntime The stored file content is handed over to the lrep provider that can dynamically adjust the content to the runtime context (e.g. do text replacement to the users' logon language) before
	 * @returns {Promise} Returns the result from the request
	 *
	 * @deprecated
	 * @ui5-restricted sap.apf
	 * @private
	 */
	LrepConnector.prototype.getStaticResource = function(sNamespace, sName, sType, bIsRuntime) {
		var sRequestPath = FlexUtils.getLrepUrl() + LrepConnector.ROUTES.CONTENT;
		sRequestPath += sNamespace + "/" + sName + "." + sType;

		var aParams = [];
		if (!bIsRuntime) {
			aParams.push({
				name: "dt",
				value: "true"
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "GET", null, null);
	};

	/**
	 * Retrieves the file attributes for a given resource in the LREP.
	 *
	 * @param {String} sNamespace The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {String} sLayer File layer
	 * @returns {Object} Returns the result from the request
	 * @deprecated
	 * @ui5-restricted sap.apf
	 * @public
	 */
	LrepConnector.prototype.getFileAttributes = function(sNamespace, sName, sType, sLayer) {
		var sRequestPath = FlexUtils.getLrepUrl() + LrepConnector.ROUTES.CONTENT;
		sRequestPath += sNamespace + "/" + sName + "." + sType;

		var aParams = [];
		aParams.push({
			name: "metadata",
			value: "true"
		});

		if (sLayer) {
			aParams.push({
				name: "layer",
				value: sLayer
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "GET", null, null);
	};

	return LrepConnector;
}, true);
