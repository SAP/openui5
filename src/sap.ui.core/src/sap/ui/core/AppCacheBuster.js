/*!
 * ${copyright}
 */

/*global HTMLScriptElement, HTMLLinkElement, XMLHttpRequest */

/*
 * Provides the AppCacheBuster mechanism to load application files using a timestamp
 */
sap.ui.define(['jquery.sap.global', 'sap/ui/base/ManagedObject', './Core', 'sap/ui/thirdparty/URI'],
	function(jQuery, ManagedObject, Core, URI) {
	"use strict";

	/*
	 * The AppCacheBuster is only aware of resources which are relative to the
	 * current application or have been registered via:
	 *   - jQuery.sap.registerModulePath
	 */

	// intercept function to avoid usage of cachebuster

	// URL normalizer


	// 1.) Enableable
	// 2.) Must match to index
	// 3.) hook to suppress

	// ==> ManagedObject -> validateProperty

	// API
	// setURLFilter,onConvertURL => return true, false
	// convertURL

	// what about being not on the root with the HTML page
	//   appcachebuster is always relative to the HTML page


	// we need a detection for the root location
	//   --> to avoid registerComponent("./")
	//   --> configuration?

	// nested components?
	//   indexOf check in convertURL will not work here!

	// determine the language and loading mode from the configuration
	var oConfiguration = sap.ui.getCore().getConfiguration();
	var sLanguage = oConfiguration.getLanguage();
	var bSync = oConfiguration.getAppCacheBusterMode() === "sync";
	var bBatch = oConfiguration.getAppCacheBusterMode() === "batch";

	// AppCacheBuster session (will be created initially for compat reasons with mIndex)
	//   - oSession.index: file index (maps file to timestamp) / avoid duplicate loading of known base paths
	//   - oSession.active: flag, whether the session is active or not
	var oSession = {
		index: {},
		active: false
	};

	// store the original function / property description to intercept
	var fnValidateProperty, descScriptSrc, descLinkHref, fnXhrOpenOrig, fnEnhancedXhrOpen;

	// determine the application base url
	var sLocation = document.baseURI.replace(/\?.*|#.*/g, "");

	// determine the base urls (normalize and then calculate the resources and test-resources urls)
	var oUri = URI(jQuery.sap.getModulePath("", "/../"));
	var sOrgBaseUrl = oUri.toString();
	if (oUri.is("relative")) {
		oUri = oUri.absoluteTo(sLocation);
	}
	var sBaseUrl = oUri.normalize().toString();
	var sResBaseUrl = URI("resources").absoluteTo(sBaseUrl).toString();
	//var sTestResBaseUrl = URI("test-resources").absoluteTo(sBaseUrl).toString();

	// create resources check regex
	var oFilter = new RegExp("^" + jQuery.sap.escapeRegExp(sResBaseUrl));

	// helper function to append the trailing slashes if missing
	var fnEnsureTrailingSlash = function(sUrl) {
		// append the missing trailing slash
		if (sUrl.length > 0 && sUrl.slice(-1) !== "/") {
			sUrl += "/";
		}
		return sUrl;
	};

	// internal registration function (with SyncPoint usage)
	var fnRegister = function(sBaseUrl, oSyncPoint) {

		// determine the index
		var mIndex = oSession.index;

		// the request object
		var oRequest;
		var sUrl;
		var sAbsoluteBaseUrl;

		// in case of an incoming array we register each base url on its own
		// except in case of the batch mode => there we pass all URLs in a POST request.
		if (Array.isArray(sBaseUrl) && !bBatch) {

			sBaseUrl.forEach(function(sBaseUrlEntry) {
				fnRegister(sBaseUrlEntry, oSyncPoint);
			});

		} else if (Array.isArray(sBaseUrl) && bBatch) {

			// BATCH MODE: send all base urls via POST request to the server
			//   -> server returns a JSON object for containing the index for
			//      different base urls.
			//
			// returns e.g.:
			// {
			//    "<absolute_url>": { ...<index>... },
			//    ...
			// }
			var sRootUrl = fnEnsureTrailingSlash(sBaseUrl[0]);
			var sContent = [];

			// log
			jQuery.sap.log.debug("sap.ui.core.AppCacheBuster.register(\"" + sRootUrl + "\"); // BATCH MODE!");

			// determine the base URL
			var sAbsoluteRootUrl = AppCacheBuster.normalizeURL(sRootUrl); // "./" removes the html doc from path

			// log
			jQuery.sap.log.debug("  --> normalized to: \"" + sAbsoluteRootUrl + "\"");

			// create the list of absolute base urls
			sBaseUrl.forEach(function(sUrlEntry) {
				sUrl = fnEnsureTrailingSlash(sUrlEntry);
				var sAbsoluteUrl = AppCacheBuster.normalizeURL(sUrl);
				if (!mIndex[sAbsoluteBaseUrl]) {
					sContent.push(sAbsoluteUrl);
				}
			});

			// if we need to fetch some base urls we trigger the request otherwise
			// we gracefully ignore the function call
			if (sContent.length > 0) {

				// create the URL for the index file
				var sUrl = sAbsoluteRootUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;

				// configure request; check how to execute the request (sync|async)
				oRequest = {
						url: sUrl,
						type: "POST",
						async: !bSync && !!oSyncPoint,
						dataType: "json",
						contentType: "text/plain",
						data: sContent.join("\n"),
						success: function(data) {
							// notify that the content has been loaded
							AppCacheBuster.onIndexLoaded(sUrl, data);
							// add the index file to the index map
							jQuery.extend(mIndex, data);
						},
						error: function() {
							jQuery.sap.log.error("Failed to batch load AppCacheBuster index file from: \"" + sUrl + "\".");
						}
				};

			}

		} else {

			// ensure the trailing slash
			sBaseUrl = fnEnsureTrailingSlash(sBaseUrl);

			// log
			jQuery.sap.log.debug("sap.ui.core.AppCacheBuster.register(\"" + sBaseUrl + "\");");

			// determine the base URL
			sAbsoluteBaseUrl = AppCacheBuster.normalizeURL(sBaseUrl); // "./" removes the html doc from path

			// log
			jQuery.sap.log.debug("  --> normalized to: \"" + sAbsoluteBaseUrl + "\"");

			// if the index file has not been loaded yet => load!
			if (!mIndex[sAbsoluteBaseUrl]) {

				// create the URL for the index file
				var sUrl = sAbsoluteBaseUrl + "sap-ui-cachebuster-info.json?sap-ui-language=" + sLanguage;

				// configure request; check how to execute the request (sync|async)
				oRequest = {
						url: sUrl,
						async: !bSync && !!oSyncPoint,
						dataType: "json",
						success: function(data) {
							// notify that the content has been loaded
							AppCacheBuster.onIndexLoaded(sUrl, data);
							// add the index file to the index map
							mIndex[sAbsoluteBaseUrl] = data;
						},
						error: function() {
							jQuery.sap.log.error("Failed to load AppCacheBuster index file from: \"" + sUrl + "\".");
						}
				};

			}

		}

		// only request in case of having a correct request object!
		if (oRequest) {

			// hook to onIndexLoad to allow to inject the index file manually
			var mIndexInfo = AppCacheBuster.onIndexLoad(oRequest.url);
			// if anything else than undefined or null is returned we will use this
			// content as data for the cache buster index
			if (mIndexInfo != null) {
				jQuery.sap.log.info("AppCacheBuster index file injected for: \"" + sUrl + "\".");
				oRequest.success(mIndexInfo);
			} else {

				// use the syncpoint only during boot => otherwise the syncpoint
				// is not given because during runtime the registration needs to
				// be done synchrously.
				if (oRequest.async) {
					var iSyncPoint = oSyncPoint.startTask("load " + sUrl);
					var fnSuccess = oRequest.success, fnError = oRequest.error;
					jQuery.extend(oRequest, {
						success: function(data) {
							fnSuccess.apply(this, arguments);
							oSyncPoint.finishTask(iSyncPoint);
						},
						error: function() {
							fnError.apply(this, arguments);
							oSyncPoint.finishTask(iSyncPoint, false);
						}
					});
				}

				// load it
				jQuery.sap.log.info("Loading AppCacheBuster index file from: \"" + sUrl + "\".");
				jQuery.ajax(oRequest);

			}

		}

	};

	/**
	 * The AppCacheBuster is used to hook into URL relevant functions in jQuery
	 * and SAPUI5 and rewrite the URLs with a timestamp segment. The timestamp
	 * information is fetched from the server and used later on for the URL
	 * rewriting.
	 *
	 * @namespace
	 * @public
	 * @alias sap.ui.core.AppCacheBuster
	 */
	var AppCacheBuster = /** @lends sap.ui.core.AppCacheBuster */ {

			/**
			 * Boots the AppCacheBuster by initializing and registering the
			 * base URLs configured in the UI5 bootstrap.
			 *
			 * @param {jQuery.sap.syncPoint} [oSyncPoint] the sync point
			 *
			 * @private
			 */
			boot: function(oSyncPoint) {

				// application cachebuster mechanism (copy of array for later modification)
				var oConfig = oConfiguration.getAppCacheBuster();

				if (oConfig && oConfig.length > 0) {

					oConfig = oConfig.slice();

					// flag to activate the cachebuster
					var bActive = true;

					// fallback for old boolean configuration (only 1 string entry)
					// restriction: the values true, false and x are reserved as fallback values
					//              and cannot be used as base url locations
					var sValue = String(oConfig[0]).toLowerCase();
					if (oConfig.length === 1) {
						if (sValue === "true" || sValue === "x") {
							// register the current base URL (if it is a relative URL)
							// hint: if UI5 is referenced relative on a server it might be possible
							//       with the mechanism to register another base URL.
							var oUri = URI(sOrgBaseUrl);
							oConfig = oUri.is("relative") ? [oUri.toString()] : [];
						} else if (sValue === "false") {
							bActive = false;
						}
					}

					// activate the cachebuster
					if (bActive) {

						// initialize the AppCacheBuster
						AppCacheBuster.init();

						// register the components
						fnRegister(oConfig, oSyncPoint);

					}

				}

			},

			/**
			 * Initializes the AppCacheBuster. Hooks into the relevant functions
			 * in the Core to intercept the code which are dealing with URLs and
			 * converts those URLs into cachebuster URLs.
			 *
			 * The intercepted functions are:
			 * <ul>
			 * <li><code>XMLHttpRequest.prototype.open</code></li>
			 * <li><code>jQuery.sap.includeScript</code></li>
			 * <li><code>jQuery.sap.includeStyleSheet</code></li>
			 * <li><code>sap.ui.base.ManagedObject.prototype.validateProperty</code></li>
			 * </ul>
			 *
			 * @private
			 */
			init: function() {

				// activate the session (do not create the session for compat reasons with mIndex previously)
				oSession.active = true;

				// store the original function / property description to intercept
				fnValidateProperty = ManagedObject.prototype.validateProperty;
				descScriptSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src");
				descLinkHref = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "href");

				// function shortcuts (better performance when used frequently!)
				var fnConvertUrl = AppCacheBuster.convertURL;
				var fnNormalizeUrl = AppCacheBuster.normalizeURL;

				// resources URL's will be handled via standard
				// UI5 cachebuster mechanism (so we simply ignore them)
				var fnIsACBUrl = function(sUrl) {
					if (this.active === true && sUrl && typeof (sUrl) === "string") {
						sUrl = fnNormalizeUrl(sUrl);
						return !sUrl.match(oFilter);
					}
					return false;
				}.bind(oSession);

				// enhance xhr with appCacheBuster functionality
				fnXhrOpenOrig = XMLHttpRequest.prototype.open;
				XMLHttpRequest.prototype.open = function(sMethod, sUrl) {
					if (sUrl && fnIsACBUrl(sUrl)) {
						arguments[1] = fnConvertUrl(sUrl);
					}
					fnXhrOpenOrig.apply(this, arguments);
				};
				fnEnhancedXhrOpen = XMLHttpRequest.prototype.open;

				// enhance the validateProperty function to intercept URI types
				//  test via: new sap.ui.commons.Image({src: "acctest/img/Employee.png"}).getSrc()
				//            new sap.ui.commons.Image({src: "./acctest/../acctest/img/Employee.png"}).getSrc()
				ManagedObject.prototype.validateProperty = function(sPropertyName, oValue) {
					var oMetadata = this.getMetadata(),
						oProperty = oMetadata.getProperty(sPropertyName),
						oArgs;
					if (oProperty && oProperty.type === "sap.ui.core.URI") {
						oArgs = Array.prototype.slice.apply(arguments);
						try {
							if (fnIsACBUrl(oArgs[1] /* oValue */)) {
								oArgs[1] = fnConvertUrl(oArgs[1] /* oValue */);
							}
						} catch (e) {
							// URI normalization or conversion failed, fall back to normal processing
						}
					}
					// either forward the modified or the original arguments
					return fnValidateProperty.apply(this, oArgs || arguments);
				};

				// create an interceptor description which validates the value
				// of the setter whether to rewrite the URL or not
				var fnCreateInterceptorDescriptor = function(descriptor) {
					var newDescriptor = {
						get: descriptor.get,
						set: function(val) {
							if (fnIsACBUrl(val)) {
								val = fnConvertUrl(val);
							}
							descriptor.set.call(this, val);
						},
						enumerable: descriptor.enumerable,
						configurable: descriptor.configurable
					};
					newDescriptor.set._sapUiCoreACB = true;
					return newDescriptor;
				};

				// try to setup the property descriptor interceptors (not supported on all browsers, e.g. iOS9)
				var bError = false;
				try {
					Object.defineProperty(HTMLScriptElement.prototype, "src", fnCreateInterceptorDescriptor(descScriptSrc));
				} catch (ex) {
					jQuery.sap.log.error("Your browser doesn't support redefining the src property of the script tag. Disabling AppCacheBuster as it is not supported on your browser!\nError: " + ex);
					bError = true;
				}
				try {
					Object.defineProperty(HTMLLinkElement.prototype, "href", fnCreateInterceptorDescriptor(descLinkHref));
				} catch (ex) {
					jQuery.sap.log.error("Your browser doesn't support redefining the href property of the link tag. Disabling AppCacheBuster as it is not supported on your browser!\nError: " + ex);
					bError = true;
				}

				// in case of setup issues we stop the AppCacheBuster support
				if (bError) {
					this.exit();
				}

			},

			/**
			 * Terminates the AppCacheBuster and removes the hooks from the URL
			 * specific functions. This will also clear the index which is used
			 * to prefix matching URLs.
			 *
			 * @private
			 */
			exit: function() {

				// remove the function interceptions
				ManagedObject.prototype.validateProperty = fnValidateProperty;

				// only remove xhr interception if xhr#open was not modified meanwhile
				if (XMLHttpRequest.prototype.open === fnEnhancedXhrOpen) {
					XMLHttpRequest.prototype.open = fnXhrOpenOrig;
				}

				// remove the property descriptor interceptions (but only if not overridden again)
				var descriptor;
				if ((descriptor = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, "src")) && descriptor.set && descriptor.set._sapUiCoreACB === true) {
					Object.defineProperty(HTMLScriptElement.prototype, "src", descScriptSrc);
				}
				if ((descriptor = Object.getOwnPropertyDescriptor(HTMLLinkElement.prototype, "href")) && descriptor.set && descriptor.set._sapUiCoreACB === true) {
					Object.defineProperty(HTMLLinkElement.prototype, "href", descLinkHref);
				}

				// clear the session (disables URL rewrite for session)
				oSession.index = {};
				oSession.active = false;

				// create a new session for the next initialization
				oSession = {
					index: {},
					active: false
				};

			},

			/**
			 * Registers an application. Loads the cachebuster index file from this
			 * locations. All registered files will be considered by the cachebuster
			 * and the URLs will be prefixed with the timestamp of the index file.
			 *
			 * @param {string} base URL of an application providing a cachebuster index file
			 *
			 * @public
			 */
			register: function(sBaseUrl) {
				fnRegister(sBaseUrl);
			},

			/**
			 * Converts the given URL if it matches a URL in the cachebuster index.
			 * If not then the same URL will be returned. To prevent URLs from being
			 * modified by the application cachebuster you can implement the function
			 * <code>sap.ui.core.AppCacheBuster.handleURL</code>.
			 *
			 * @param {string} sUrl any URL
			 * @return {string} modified URL when matching the index or unmodified when not
			 *
			 * @public
			 */
			convertURL: function(sUrl) {

				jQuery.sap.log.debug("sap.ui.core.AppCacheBuster.convertURL(\"" + sUrl + "\");");

				var mIndex = oSession.index;

				// modify the incoming url if found in the appCacheBuster file
				if (mIndex && sUrl) {

					// normalize the URL
					// local resources are registered with "./" => we remove the leading "./"!
					// (code location for this: sap/ui/Global.js:sap.ui.localResources)
					var sNormalizedUrl = AppCacheBuster.normalizeURL(sUrl);
					jQuery.sap.log.debug("  --> normalized to: \"" + sNormalizedUrl + "\"");

					// should the URL be handled?
					if (sNormalizedUrl && AppCacheBuster.handleURL(sNormalizedUrl)) {

						// scan for a matching base URL (by default we use the default index)
						// we lookup the base url in the index list and if found we split the
						// url into the base and path where the timestamp is added in between
						jQuery.each(mIndex, function(sBaseUrl, mBaseUrlIndex) {
							var sUrlPath;
							if (sBaseUrl && sNormalizedUrl.length >= sBaseUrl.length && sNormalizedUrl.slice(0, sBaseUrl.length) === sBaseUrl ) {
								sUrlPath = sNormalizedUrl.slice(sBaseUrl.length);
								if (mBaseUrlIndex[sUrlPath]) {
									// return the normalized URL only if found in the index
									sUrl = sBaseUrl + "~" + mBaseUrlIndex[sUrlPath] + "~/" + sUrlPath;
									jQuery.sap.log.debug("  ==> rewritten to \"" + sUrl + "\";");
									return false;
								}
							}
						});

					}

				}
				return sUrl;

			},

			/**
			 * Normalizes the given URL and make it absolute.
			 *
			 * @param {string} sUrl any URL
			 * @return {string} normalized URL
			 *
			 * @public
			 */
			normalizeURL: function(sUrl) {

				// local resources are registered with "./" => we remove the leading "./"!
				// (code location for this: sap/ui/Global.js:sap.ui.localResources)
				// we by default normalize all relative URLs for a common base
				var oUri = URI(sUrl || "./");
				if (oUri.is("relative")) { //(sUrl.match(/^\.\/|\..\//g)) {
					oUri = oUri.absoluteTo(sLocation);
				}
				//return oUri.normalize().toString();
				// prevent to normalize the search and hash to avoid "+" in the search string
				// because for search strings the space will be normalized as "+"
				return oUri.normalizeProtocol().normalizeHostname().normalizePort().normalizePath().toString();

			},

			/**
			 * Callback function which can be overwritten to programmatically decide
			 * whether to rewrite the given URL or not.
			 *
			 * @param {string} sUrl any URL
			 * @return {boolean} <code>true</code> to rewrite or <code>false</code> to ignore
			 *
			 * @public
			 */
			handleURL: function(sUrl) {
				// API function to be overridden by apps
				// to exclude URLs from being manipulated
				return true;
			},

			/**
			 * Hook to intercept the load of the cache buster info. Returns either the
			 * JSON object with the cache buster info or null/undefined if the URL should
			 * be handled.
			 * <p>
			 * The cache buster info object is a map which contains the relative
			 * paths for the resources as key and a timestamp/etag as string as
			 * value for the entry. The value is used to be added as part of the
			 * URL to create a new URL if the resource has been changed.
			 * @param {string} sUrl URL from where to load the cachebuster info
			 * @return {object} cache buster info object or null/undefined
			 * @private
			 */
			onIndexLoad: function(sUrl) {
				return null;
			},

			/**
			 * Hook to intercept the result of the cache buster info request. It will pass
			 * the loaded cache buster info object to this function to do something with that
			 * information.
			 * @param {string} sUrl URL from where to load the cachebuster info
			 * @param {object} mIndexInfo cache buster info object
			 * @private
			 */
			onIndexLoaded: function(sUrl, mIndexInfo) {
			}

	};

	// check for pre-defined callback handlers and register the callbacks
	var mHooks = oConfiguration.getAppCacheBusterHooks();
	if (mHooks) {
		["handleURL", "onIndexLoad", "onIndexLoaded"].forEach(function(sFunction) {
			if (typeof mHooks[sFunction] === "function") {
				AppCacheBuster[sFunction] = mHooks[sFunction];
			}
		});
	}

	return AppCacheBuster;

}, /* bExport= */ true);
