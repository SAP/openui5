/*!
 * ${copyright}
 */

sap.ui.define([
	"jquery.sap.global", "sap/ui/thirdparty/URI", "sap/ui/fl/Utils"
], function(jQuery, uri, FlexUtils) {
	"use strict";

	/**
	 * Provides the connectivity to the ABAP based LRep REST-service
	 *
	 * @param {object} [mParameters] - map of parameters, see below
	 * @param {String} [mParameters.XsrfToken] - XSRF token which can be reused for back-end connectivity. If no XSRF token is passed, a new one
	 *		will be fetched from back end.
	 * @constructor
	 * @alias sap.ui.fl.LrepConnector
	 * @private
	 * @sap-restricted
	 * @author SAP SE
	 * @version ${version}
	 */
	var Connector = function(mParameters) {
		this._initClientParam();
		this._initLanguageParam();
		if (mParameters) {
			this._sXsrfToken = mParameters.XsrfToken;
		}

	};

	Connector.createConnector = function(mParameters) {
		return new Connector(mParameters);
	};

	Connector._bServiceAvailability = undefined;
	Connector.prototype.DEFAULT_CONTENT_TYPE = "application/json; charset=utf-8";
	Connector.prototype._sClient = undefined;
	Connector.prototype._sLanguage = undefined;
	Connector.prototype._aSentRequestListeners = [];
	Connector.prototype._sRequestUrlPrefix = "";

	/**
	 * Gets the availability status of the flexibility service.
	 *
	 * @Returns {Promise} A Boolean value of the availability status
	 * @public
	 * @function
	 * @name sap.ui.fl.Connector.isFlexServiceAvailable
	 */
	Connector.isFlexServiceAvailable =  function() {
		if (Connector._bServiceAvailability !== undefined) {
			return Promise.resolve(Connector._bServiceAvailability);
		}
		//probe service availability by sending settings request
		return Connector.createConnector().loadSettings().then(function (){
			return Promise.resolve(Connector._bServiceAvailability);
		});
	};

	/**
	 * Registers a callback for a sent request to the back end. The callback is only called once for each change. Each call is done with an object
	 * similar to the resolve of the promises containing a <code>status</code> of the response from the back end i.e. <code>success</code>, a
	 * <code>response</code> containing the change processed in this request
	 *
	 * @param {function} fCallback function called after all related promises are resolved
	 * @public
	 */
	Connector.attachSentRequest = function(fCallback) {
		if (typeof fCallback === "function" && Connector.prototype._aSentRequestListeners.indexOf(fCallback) === -1) {
			Connector.prototype._aSentRequestListeners.push(fCallback);
		}
	};

	/**
	 * Deregisters a callback for a sent request to the back end if the callback was registered
	 *
	 * @param {function} fCallback function called after all related promises are resolved
	 * @public
	 */
	Connector.detachSentRequest = function(fCallback) {
		var iIndex = Connector.prototype._aSentRequestListeners.indexOf(fCallback);
		if (iIndex !== -1) {
			Connector.prototype._aSentRequestListeners.splice(iIndex, 1);
		}
	};

	/**
	 * Extract client from current running instance
	 *
	 * @private
	 */
	Connector.prototype._initClientParam = function() {
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
	Connector.prototype._initLanguageParam = function() {
		var sLanguage;
		sLanguage = FlexUtils.getUrlParameter("sap-language") || FlexUtils.getUrlParameter("sap-ui-language");
		if (sLanguage) {
			this._sLanguage = sLanguage;
		}
	};

	/**
	 * Prefix for request URL can be set in exceptional cases when consumer needs to add a prefix to the URL
	 *
	 * @param {String} sRequestUrlPrefix - request URL prefix which must start with a (/) and must not end with a (/)
	 * @private
	 * @sap-restricted
	 */
	Connector.prototype.setRequestUrlPrefix = function(sRequestUrlPrefix) {
		this._sRequestUrlPrefix = sRequestUrlPrefix;
	};

	/**
	 * Resolves the complete URL of a request using the back-end URL and the relative URL from the request
	 *
	 * @param {String} sRelativeUrl - relative URL of the current request
	 * @returns {sap.ui.core.URI} returns the complete uri for this request
	 * @private
	 */
	Connector.prototype._resolveUrl = function(sRelativeUrl) {
		if (!jQuery.sap.startsWith(sRelativeUrl, "/")) {
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
	Connector.prototype._getDefaultHeader = function() {
		var mHeaders = {
			headers: {
				"X-CSRF-Token": this._sXsrfToken || "fetch"
			}
		};
		return mHeaders;
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
	Connector.prototype._getDefaultOptions = function(sMethod, sContentType, oData) {
		var mOptions;
		if (!sContentType) {
			sContentType = this.DEFAULT_CONTENT_TYPE;
		} else if (sContentType.indexOf("charset") === -1) {
			sContentType += "; charset=utf-8";
		}

		mOptions = jQuery.extend(true, this._getDefaultHeader(), {
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
	 * @param {String} sMethod HTTP-method to be used by this request (default GET)
	 * @param {Object} oData Payload of the request
	 * @param {Object} mOptions Additional options which should be used in the request
	 * @returns {Promise} Returns a promise to the result of the request
	 * @public
	 */
	Connector.prototype.send = function(sUri, sMethod, oData, mOptions) {
		sMethod = sMethod || "GET";
		sMethod = sMethod.toUpperCase();
		mOptions = mOptions || {};
		sUri = this._resolveUrl(sUri);

		if (mOptions.success || mOptions.error) {
			var sErrorMessage = "Success and error handler are not allowed in mOptions";
			throw new Error(sErrorMessage);
		}

		var sContentType = mOptions.contentType || this.DEFAULT_CONTENT_TYPE;

		mOptions = jQuery.extend(true, this._getDefaultOptions(sMethod, sContentType, oData), mOptions);

		return this._sendAjaxRequest(sUri, mOptions);
	};

	/**
	 * Extracts the messages from the back-end response
	 *
	 * @param {Object} oXHR - ajax request object
	 * @returns {Array} Array of messages, for example <code>[ { "severity": "Error", "text": "content id must be non-initial" } ] </code>
	 * @private
	 */
	Connector.prototype._getMessagesFromXHR = function(oXHR) {
		var errorResponse, aMessages, length, i;
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
	 * @param {String} sUri - Complete request URL
	 * @param {Object} mOptions - Options to be used by the request
	 * @returns {Promise} Returns a Promise with the status and response and messages
	 * @private
	 */
	Connector.prototype._sendAjaxRequest = function(sUri, mOptions) {
		var that = this;
		var sFetchXsrfTokenUrl = "/sap/bc/lrep/actions/getcsrftoken/";
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
				that._sXsrfToken = sNewCsrfToken || that._sXsrfToken;
				var sEtag = oXhr.getResponseHeader("etag");

				var oResult = {
					status: sStatus,
					etag: sEtag,
					response: oResponse
				};

				resolve(oResult);

				jQuery.each(that._aSentRequestListeners, function(iIndex, fCallback) {
					fCallback(oResult);
				});
			}

			function fetchTokenAndHandleRequest(oResponse, sStatus, oXhr) {
				that._sXsrfToken = oXhr.getResponseHeader("X-CSRF-Token");
				mOptions.headers = mOptions.headers || {};
				mOptions.headers["X-CSRF-Token"] = that._sXsrfToken;

				// Re-send request after fetching token
				jQuery.ajax(sUri, mOptions).done(handleValidRequest).fail(function(oXhr, sStatus, sErrorThrown) {
					var oError = new Error(sErrorThrown);
					oError.status = "error";
					oError.code = oXhr.statusCode().status;
					oError.messages = that._getMessagesFromXHR(oXhr);
					reject(oError);
				});
			}

			function refetchTokenAndRequestAgainOrHandleInvalidRequest(oXhr, sStatus, sErrorThrown) {
				if (oXhr.status === 403) {
					// Token seems to be invalid, refetch and then resend
					jQuery.ajax(sFetchXsrfTokenUrl, mFetchXsrfTokenOptions).done(fetchTokenAndHandleRequest).fail(function(oXhr, sStatus, sErrorThrown) {
						// Fetching XSRF Token failed
						reject({
							status: "error"
						});
					});
				} else {
					if (mOptions && mOptions.type === "DELETE" && oXhr.status === 404) {
						// Do not reject, if a file was not found during deletion
						// (can be the case if another user already triggered a restore meanwhile)
						resolve();
					} else {
						var result;
						result = {
							status: "error",
							code: oXhr.statusCode().status,
							messages: that._getMessagesFromXHR(oXhr)
						};
						reject(result);
					}
				}
			}

			//Check, whether CSRF token has to be requested
			var bRequestCSRFToken = true;
			if (mOptions && mOptions.type) {
				if (mOptions.type === "GET" || mOptions.type === "HEAD") {
					bRequestCSRFToken = false;
				} else if (that._sXsrfToken && that._sXsrfToken !== "fetch") {
					bRequestCSRFToken = false;
				}
			}

			if (bRequestCSRFToken) {
				// Fetch XSRF Token
				jQuery.ajax(sFetchXsrfTokenUrl, mFetchXsrfTokenOptions).done(fetchTokenAndHandleRequest).fail(function(oXhr, sStatus, sErrorThrown) {
					// Fetching XSRF Token failed
					reject({
						status: "error",
						code: oXhr.statusCode().status,
						messages: that._getMessagesFromXHR(oXhr)
					});
				});
			} else {
				// Send normal request
				jQuery.ajax(sUri, mOptions).done(handleValidRequest).fail(refetchTokenAndRequestAgainOrHandleInvalidRequest);
			}
		});
	};

	/**
	 * Loads the changes for the given component class name.
	 *
	 * @see sap.ui.core.Component
	 * @param {object} oComponent - Contains component data needed for reading changes
	 * @param {string} oComponent.name - Name of component
	 * @param {string} [oComponent.appVersion] - Current running version of application
	 * @param {map} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {object} [mPropertyBag.appDescriptor] - Manifest that belongs to actual component
	 * @param {string} [mPropertyBag.siteId] - <code>sideId</code> that belongs to actual component
	 * @param {string} [mPropertyBag.layer] - Layer up to which changes shall be read (excluding the specified layer)
	 * @param {string} [mPropertyBag.appVersion] - Version of application whose changes shall be read
	 * @param {string} [mPropertyBag.url] - address to which the request for change should be sent in case the data is not cached
	 *
	 * @returns {Promise} Returns a Promise with the changes (changes, contexts, optional messagebundle), <code>componentClassName</code> and <code>etag</code> value
	 * @public
	 */
	Connector.prototype.loadChanges = function(oComponent, mPropertyBag) {
		var mOptions = {};
		var sComponentName = oComponent.name;
		var sUrl = "/sap/bc/lrep/flex/data/";
		mPropertyBag = mPropertyBag || {};

		if (!sComponentName || sComponentName.match(new RegExp(/^\$*\{[a-zA-Z0-9\.]*\}/g))) {
			return Promise.reject(new Error("Component name not specified"));
		}

		if (mPropertyBag.url) {
			sUrl = mPropertyBag.url;
		} else {
			if (mPropertyBag.cacheKey) {
				mOptions.cache = true;
				sUrl += "~" + mPropertyBag.cacheKey + "~/";
			}

			sUrl += sComponentName;
		}

		if (mPropertyBag.siteId) {
			if (!mOptions.headers) {
				mOptions.headers = {};
			}

			mOptions.headers = {
				"X-LRep-Site-Id": mPropertyBag.siteId
			};
		}

		if (mPropertyBag.layer) {
			sUrl += "&upToLayerType=" + mPropertyBag.layer;
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

		if (this._sClient) {
			sUrl += "&sap-client=" + this._sClient;
		}

		if (oComponent.appVersion && (oComponent.appVersion !== FlexUtils.DEFAULT_APP_VERSION)) {
			if (oComponent.appVersion.match(new RegExp(/^\$*\{[a-zA-Z0-9\.]*\}/g))) {
				return Promise.reject(new Error("Component appVersion is invalid"));
			}
			sUrl += "&appVersion=" + oComponent.appVersion;
		}

		// Replace first & with ?
		sUrl = sUrl.replace("&", "?");

		return this.send(sUrl, undefined, undefined, mOptions)
			.then(function(oResponse) {
				Connector._bServiceAvailability = true;
				return {
					changes: oResponse.response,
					messagebundle: oResponse.response.messagebundle,
					componentClassName: sComponentName,
					etag: oResponse.etag
				};
			}, function(oError) {
				if (oError.code === 404) {
					Connector._bServiceAvailability = false;
				}
				throw (oError);
			});
	};

	/**
	 * Loads flexibility settings.
	 *
	 * @returns {Promise} Returns a Promise with the flexibility settings content
	 * @public
	 */
	Connector.prototype.loadSettings = function() {
		var sUri = "/sap/bc/lrep/flex/settings";

		if (this._sClient) {
			sUri += "?sap-client=" + this._sClient;
		}

		return this.send(sUri, undefined, undefined, {})
			.then(function(oResponse) {
				Connector._bServiceAvailability = true;
				return oResponse.response;
			}, function(oError) {
				if (oError.code === 404) {
					Connector._bServiceAvailability = false;
				}
				//In case of failure, resolve promise without value. Error handle is done in Settings class
				return Promise.resolve();
			});
	};

	/**
	 * @param {Array} aParams Array of parameter objects in format {name:<name>, value:<value>}
	 * @returns {String} Returns a String with all parameters concatenated
	 * @private
	 */
	Connector.prototype._buildParams = function(aParams) {
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

	/**
	 * The URL prefix of the REST API for example /sap/bc/lrep/changes/.
	 *
	 * @param {Boolean} bIsVariant Flag whether the change is of type variant
	 * @returns {String} URL prefix
	 * @private
	 */
	Connector.prototype._getUrlPrefix = function(bIsVariant) {
		if (bIsVariant) {
			return "/sap/bc/lrep/variants/";
		}
		return "/sap/bc/lrep/changes/";
	};

	/**
	 * Creates a change or variant via REST call.
	 *
	 * @param {Object} oPayload The content which is send to the server
	 * @param {String} [sChangelist] The transport ID.
	 * @param {Boolean} bIsVariant - is variant?
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.create = function(oPayload, sChangelist, bIsVariant) {
		var sRequestPath = this._getUrlPrefix(bIsVariant);

		var aParams = [];
		if (sChangelist) {
			aParams.push({
				name: "changelist",
				value: sChangelist
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "POST", oPayload, null);
	};

	/**
	 * Update a change or variant via REST call.
	 *
	 * @param {Object} oPayload The content which is send to the server
	 * @param {String} sChangeName Name of the change
	 * @param {String} sChangelist (optional) The transport ID.
	 * @param {Boolean} bIsVariant - is variant?
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.update = function(oPayload, sChangeName, sChangelist, bIsVariant) {
		var sRequestPath = this._getUrlPrefix(bIsVariant);
		sRequestPath += sChangeName;

		var aParams = [];
		if (sChangelist) {
			aParams.push({
				name: "changelist",
				value: sChangelist
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "PUT", oPayload, null);
	};

	/**
	 * Delete a change or variant via REST call.
	 *
	 * @param {String} mParameters property bag
	 * @param {String} mParameters.sChangeName - name of the change
	 * @param {String} [mParameters.sLayer="USER"] - other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER
	 * @param {String} mParameters.sNamespace - the namespace of the change file
	 * @param {String} mParameters.sChangelist - The transport ID.
	 * @param {Boolean} bIsVariant - is it a variant?
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.deleteChange = function(mParameters, bIsVariant) {
		// REVISE rename to deleteFile
		var sRequestPath = this._getUrlPrefix(bIsVariant);
		sRequestPath += mParameters.sChangeName;

		var aParams = [];
		if (mParameters.sLayer) {
			aParams.push({
				name: "layer",
				value: mParameters.sLayer
			});
		}
		if (mParameters.sNamespace) {
			aParams.push({
				name: "namespace",
				value: mParameters.sNamespace
			});
		}
		if (mParameters.sChangelist) {
			aParams.push({
				name: "changelist",
				value: mParameters.sChangelist
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "DELETE", {}, null);
	};

	/**
	 * Authenticated access to a resource in the Lrep
	 *
	 * @param {String} sNamespace The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {Boolean} bIsRuntime The stored file content is handed over to the lrep provider that can dynamically adjust the content to the runtime
	 *		context (e.g. do text replacement to the users' logon language) before
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.getStaticResource = function(sNamespace, sName, sType, bIsRuntime) {
		var sApiPath = "/sap/bc/lrep/content/";
		var sRequestPath = sApiPath;
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
	 * @public
	 */
	Connector.prototype.getFileAttributes = function(sNamespace, sName, sType, sLayer) {
		var sApiPath = "/sap/bc/lrep/content/";
		var sRequestPath = sApiPath;
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

	/**
	 * Upserts a given change or variant via REST call.
	 *
	 * @param {String} sNamespace The abap package goes here. It is needed to identify the change.
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {String} sLayer File layer
	 * @param {String} sContent File content to be saved as string
	 * @param {String} sContentType Content type (e.g. application/json, text/plain, ...), default: application/json
	 * @param {String} sChangelist The transport ID, optional
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.upsert = function(sNamespace, sName, sType, sLayer, sContent, sContentType, sChangelist) {
		var that = this;
		return Promise.resolve(that._fileAction("PUT", sNamespace, sName, sType, sLayer, sContent, sContentType, sChangelist));
	};

	/**
	 * Delete a file via REST call.
	 *
	 * @param {String} sNamespace The abap package goes here. It is needed to identify the change.
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {String} sLayer File layer
	 * @param {String} sChangelist The transport ID, optional
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.deleteFile = function(sNamespace, sName, sType, sLayer, sChangelist) {
		return this._fileAction("DELETE", sNamespace, sName, sType, sLayer, null, null, sChangelist);
	};

	Connector.prototype._fileAction = function(sMethod, sNamespace, sName, sType, sLayer, sContent, sContentType, sChangelist) {
		var sApiPath = "/sap/bc/lrep/content/";
		var sRequestPath = sApiPath;
		sRequestPath += sNamespace + "/" + sName + "." + sType;

		var aParams = [];
		aParams.push({
			name: "layer",
			value: sLayer
		});

		if (sChangelist) {
			aParams.push({
				name: "changelist",
				value: sChangelist
			});
		}

		sRequestPath += this._buildParams(aParams);

		var mOptions = {
			contentType: sContentType || this.DEFAULT_CONTENT_TYPE
		};

		return this.send(sRequestPath, sMethod.toUpperCase(), sContent, mOptions);
	};

	/**
	 * @param {String} sOriginNamespace The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".
	 * @param {String} sName Name of the change
	 * @param {String} sType File type extension
	 * @param {String} sOriginLayer File layer
	 * @param {String} sTargetLayer File where the new Target-Layer
	 * @param {String} sTargetNamespace target namespace
	 * @param {String} sChangelist The changelist where the file will be written to
	 * @returns {Object} Returns the result from the request
	 * @private Private for now, as is not in use.
	 */
	Connector.prototype.publish = function(sOriginNamespace, sName, sType, sOriginLayer, sTargetLayer, sTargetNamespace, sChangelist) {
		var sApiPath = "/sap/bc/lrep/actions/publish/";
		var sRequestPath = sApiPath;
		sRequestPath += sOriginNamespace + "/" + sName + "." + sType;

		var aParams = [];
		if (sOriginLayer) {
			aParams.push({
				name: "layer",
				value: sOriginLayer
			});
		}
		if (sTargetLayer) {
			aParams.push({
				name: "target-layer",
				value: sTargetLayer
			});
		}
		if (sTargetNamespace) {
			aParams.push({
				name: "target-namespace",
				value: sTargetNamespace
			});
		}
		if (sChangelist) {
			aParams.push({
				name: "changelist",
				value: sChangelist
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "POST", {}, null);
	};

	/**
	 * Retrieves the content for a given namespace and layer via REST call.
	 *
	 * @param {String} sNamespace - The file namespace goes here. It is needed to identify the change.
	 * @param {String} sLayer - File layer
	 * @returns {Object} Returns the result from the request
	 * @public
	 */
	Connector.prototype.listContent = function(sNamespace, sLayer) {
		var sRequestPath = "/sap/bc/lrep/content/";
		sRequestPath += sNamespace;

		var aParams = [];
		if (sLayer) {
			aParams.push({
				name: "layer",
				value: sLayer
			});
		}

		sRequestPath += this._buildParams(aParams);

		return this.send(sRequestPath, "GET", null, null);
	};

	return Connector;
}, true);
