/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.theming
 * @public
 */

sap.ui.define(['jquery.sap.global', 'sap/ui/thirdparty/URI', '../Element'],
	function(jQuery, URI, Element) {
	"use strict";
		/**
		 * A helper used for (read-only) access to CSS parameters at runtime.
		 *
		 * @class A helper used for (read-only) access to CSS parameters at runtime
		 * @author SAP SE
		 * @static
		 *
		 * @public
		 * @alias sap.ui.core.theming.Parameters
		 */
		var Parameters = {};

		var mParameters = null;
		var sTheme = null;

		var aParametersToLoad = [];

		var sBootstrapOrigin = new URI(jQuery.sap.getResourcePath(""), document.baseURI).origin();
		var mOriginsNeedingCredentials = {};

		// match a CSS url
		var rCssUrl = /url[\s]*\('?"?([^\'")]*)'?"?\)/;

		function resetParameters() {
			mParameters = null;
		}

		function checkAndResolveRelativeUrl(sUrl, sThemeBaseUrl) {

			var aMatch = rCssUrl.exec(sUrl);
			if (aMatch) {
				var oUri = new URI(aMatch[1]);
				if (oUri.is("relative")) {
					// Rewrite relative URLs based on the theme base url
					// Otherwise they would be relative to the HTML page which is incorrect
					var sNormalizedUrl = oUri.absoluteTo(sThemeBaseUrl).normalize().path();
					sUrl = "url('" + sNormalizedUrl + "')";
				}
			}

			return sUrl;
		}

		function mergeParameterSet(mCurrent, mNew, sThemeBaseUrl) {
			for (var sParam in mNew) {
				if (typeof mCurrent[sParam] === "undefined") {
					mCurrent[sParam] = checkAndResolveRelativeUrl(mNew[sParam], sThemeBaseUrl);
				}
			}
			return mCurrent;
		}

		function mergeParameters(mNewParameters, sThemeBaseUrl) {

			// check for old format:
			// {
			//   "param1": "value1",
			//   "param2": "value2"
			// }
			if (typeof mNewParameters["default"] !== "object") {
				// migrate to new format
				mNewParameters = {
					"default": mNewParameters,
					"scopes": {}
				};
			}

			// ensure parameters objects
			mParameters = mParameters || {};
			mParameters["default"] = mParameters["default"] || {};
			mParameters["scopes"] = mParameters["scopes"] || {};

			// merge default parameters
			mergeParameterSet(mParameters["default"], mNewParameters["default"], sThemeBaseUrl);

			// merge scopes
			if (typeof mNewParameters["scopes"] === "object") {
				for (var sScopeName in mNewParameters["scopes"]) {
					// ensure scope object
					mParameters["scopes"][sScopeName] = mParameters["scopes"][sScopeName] || {};
					// merge scope set
					mergeParameterSet(mParameters["scopes"][sScopeName], mNewParameters["scopes"][sScopeName], sThemeBaseUrl);
				}
			}
		}

		function forEachStyleSheet(fnCallback) {
			jQuery("link[id^=sap-ui-theme-]").each(function() {
				fnCallback(this.getAttribute("id"), this.href);
			});
			// also check for additional imported stylesheets (IE9 limit, see jQuery.sap.includeStyleSheet)
			if (jQuery.sap._mIEStyleSheets) {
				for (var sId in jQuery.sap._mIEStyleSheets) {
					if (sId.indexOf("sap-ui-theme-") === 0) {
						var oStyleSheet = jQuery.sap._mIEStyleSheets[sId];
						if (typeof oStyleSheet.href === "string") {
							fnCallback(sId, oStyleSheet.href);
						}
					}
				}
			}
		}

		/*
		 * Load parameters for a library/theme combination as identified by the URL of the library.css
		 */
		function loadParameters(sId, sStyleSheetUrl) {

			// Remove CSS file name and query to create theme base url (to resolve relative urls)
			var sThemeBaseUrl = new URI(sStyleSheetUrl).filename("").query("").toString();

			// read inline parameters from css style rule
			// (can be switched off for testing purposes via private URI parameter "sap-ui-xx-no-inline-theming-parameters=true")
			var $link = jQuery.sap.byId(sId);
			if ($link.length > 0 && jQuery.sap.getUriParameters().get("sap-ui-xx-no-inline-theming-parameters") !== "true") {
				var sDataUri = $link.css("background-image");
				var aParams = /\(["']data:text\/plain;utf-8,(.*)["']\)$/i.exec(sDataUri);
				if (aParams && aParams.length >= 2) {
					var sParams = aParams[1];
					// decode only if necessary
					if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
						try {
							sParams = decodeURIComponent(sParams);
						} catch (ex) {
							jQuery.sap.log.warning("Could not decode theme parameters URI from " + sUrl);
						}
					}
					try {
						var oParams = jQuery.parseJSON(sParams);
						mergeParameters(oParams, sThemeBaseUrl);
						return;
					} catch (ex) {
						jQuery.sap.log.warning("Could not parse theme parameters from " + sUrl + ". Loading library-parameters.json as fallback solution.");
					}
				}
			}

			// load library-parameters.json (as fallback solution)
			// derive parameter file URL from CSS file URL
			// $1: name of library (incl. variants)
			// $2: additional parameters, e.g. for sap-ui-merged, version/sap-ui-dist-version
			var sUrl = sStyleSheetUrl.replace(/\/library([^\/.]*)\.(?:css|less)($|[?#])/, function($0, $1, $2) {
				return "/library-parameters.json" + ($2 ? $2 : "");
			});

			// check if we need to send credentials
			var sThemeOrigin = new URI(sThemeBaseUrl).origin();
			var bWithCredentials = mOriginsNeedingCredentials[sThemeOrigin];
			var aWithCredentials = [];

			// initially we don't have any information if the target origin needs credentials or not ...
			if (bWithCredentials === undefined) {
				// ... so we assume that for all cross-origins except the UI5 bootstrap we need credentials.
				// Setting the XHR's "withCredentials" flag does not do anything for same origin requests.
				if (sUrl.startsWith(sBootstrapOrigin)) {
					aWithCredentials = [false, true];
				} else {
					aWithCredentials = [true, false];
				}
			} else {
				aWithCredentials = [bWithCredentials];
			}

			// trigger a sync. loading of the parameters.json file
			loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials);
		}

		/**
		 * Loads a parameters.json file from given URL.
		 * @param {string} sUrl URL
		 * @param {string} sThemeBaseUrl Base URL
		 * @param {boolean[]} aWithCredentials probing values for requesting with or without credentials
		 */
		function loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials) {
			var bCurrentWithCredentials = aWithCredentials.shift();

			var mHeaders = bCurrentWithCredentials ? {
				// the X-Requested-With Header is essential for the Theming-Service to determine if a GET request will be handled
				// This forces a preflight request which should give us valid Allow headers:
				//   Access-Control-Allow-Origin: ... fully qualified requestor origin ...
				//   Access-Control-Allow-Credentials: true
				"X-Requested-With": "XMLHttpRequest"
			} : {};

			// load and evaluate parameter file
			jQuery.ajax({
				url: sUrl,
				dataType: 'json',
				async: false,
				xhrFields: {
					// default is false
					withCredentials: bCurrentWithCredentials
				},
				headers: mHeaders,
				success: function(data, textStatus, xhr) {
					// Once we have a successful request we track the credentials setting for this origin
					var sThemeOrigin = new URI(sThemeBaseUrl).origin();
					mOriginsNeedingCredentials[sThemeOrigin] = bCurrentWithCredentials;

					if (Array.isArray(data)) {
						// in the sap-ui-merged use case, multiple JSON files are merged into and transfered as a single JSON array
						for (var j = 0; j < data.length; j++) {
							var oParams = data[j];
							mergeParameters(oParams, sThemeBaseUrl);
						}
					} else {
						mergeParameters(data, sThemeBaseUrl);
					}
				},
				error: function(xhr, textStatus, error) {
					// ignore failure at least temporarily as long as there are libraries built using outdated tools which produce no json file
					jQuery.sap.log.error("Could not load theme parameters from: " + sUrl, error); // could be an error as well, but let's avoid more CSN messages...

					if (aWithCredentials.length > 0) {
						// In a CORS scenario, IF we have sent credentials on the first try AND the request failed,
						// we expect that a service could have answered with the following Allow header:
						//     Access-Control-Allow-Origin: *
						// In this case we must not send credentials, otherwise the service would have answered with:
						//     Access-Control-Allow-Origin: https://...
						//     Access-Control-Allow-Credentials: true
						// Due to security constraints, the browser does not hand out any more information in a CORS scenario,
						// so now we try again without credentials.
						jQuery.sap.log.warning("Initial library-parameters.json request failed ('withCredentials=" + bCurrentWithCredentials + "'; sUrl: '" + sUrl + "').\n" +
									"Retrying with 'withCredentials=" + !bCurrentWithCredentials + "'.", "sap.ui.core.theming.Parameters");
						loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials);
					}
				}
			});
		}

		function getParameters() {

			// Inital loading
			if (!mParameters) {

				mParameters = {};
				sTheme = sap.ui.getCore().getConfiguration().getTheme();

				forEachStyleSheet(loadParameters);
			}

			return mParameters;
		}

		function loadPendingLibraryParameters() {
			// lazy loading of further library parameters
			aParametersToLoad.forEach(function(oInfo) {
				loadParameters("sap-ui-theme-" + oInfo.id, oInfo.url);
			});

			// clear queue
			aParametersToLoad = [];
		}

		/**
		 * Called by the Core when a new library and its stylesheet have been loaded.
		 * Must be called AFTER a link-tag (with id: "sap-ui-theme" + sLibName) for the theme has been created.
		 * @param {string} sThemeId id of theme link-tag
		 * @param {string} sCssUrl href of css file
		 * @private
		 */
		Parameters._addLibraryTheme = function(sThemeId, sCssUrl) {
			// only queue new libraries if some have been loaded already
			// otherwise they will be loaded when the first one requests a parameter
			// see "Parameters.get" for lazy loading of queued library parameters
			if (mParameters) {
				aParametersToLoad.push({ id: sThemeId, url: sCssUrl });
			}
		};

		/**
		 * Returns parameter value from given map and handles legacy parameter names
		 *
		 * @param {object} mOptions options map
		 * @param {string} mOptions.parameterName Parameter name / key
		 * @param {string} mOptions.scopeName Scope name
		 * @param {boolean} mOptions.loadPendingParameters If set to "true" and no parameter value is found,
		 *                                                 all pending parameters will be loaded (see Parameters._addLibraryTheme)
		 * @returns {string} parameter value or undefined
		 * @private
		 */
		function getParam(mOptions) {
			var oParams = getParameters();
			if (mOptions.scopeName) {
				oParams = oParams["scopes"][mOptions.scopeName];
			} else {
				oParams = oParams["default"];
			}

			var sParam = oParams[mOptions.parameterName];

			if (typeof sParam === "undefined" && typeof mOptions.parameterName === "string") {
				// compatibility for theming parameters with colon
				var iIndex = mOptions.parameterName.indexOf(":");
				if (iIndex !== -1) {
					mOptions.parameterName = mOptions.parameterName.substr(iIndex + 1);
				}
				sParam = oParams[mOptions.parameterName];
			}

			if (mOptions.loadPendingParameters && typeof sParam === "undefined") {
				loadPendingLibraryParameters();
				sParam = getParam({
					parameterName: mOptions.parameterName,
					scopeName: mOptions.scopeName,
					loadPendingParameters: false // prevent recursion
				});
			}

			return sParam;
		}

		/**
		 * Returns the current value for the given CSS parameter.
		 * If no parameter is given, a map containing all parameters is returned. This map is a copy, so changing values in the map does not have any effect.
		 * For any other input or an undefined parameter name, the result is undefined.
		 *
		 * @param {string} sName the CSS parameter name
		 * @param {object} [oControl] optional the control instance
		 * @returns {any} the CSS parameter value
		 *
		 * @public
		 */
		Parameters.get = function(sName, oControl) {
			var sParam, oParams;

			// Parameters.get() without arugments returns
			// copy of complete default parameter set
			if (arguments.length === 0) {
				loadPendingLibraryParameters();
				oParams = getParameters();
				return jQuery.extend({}, oParams["default"]);
			}

			if (typeof sName === "string") {

				if (oControl instanceof Element) {
					// make sure to first load all pending parameters
					// doing it later (lazy) might change the behavior in case a scope is initially not defined
					loadPendingLibraryParameters();

					// check for scopes and try to find the classes in Control Tree
					oParams = getParameters();
					var aScopes = Object.keys(oParams["scopes"]);

					var fnControlHasStyleClass = function(sScopeName) {
						return typeof oControl.hasStyleClass === "function" && oControl.hasStyleClass(sScopeName);
					};

					while (oControl) {
						var aFoundScopeClasses = aScopes.filter(fnControlHasStyleClass);
						if (aFoundScopeClasses.length > 0) {
							for (var i = 0; i < aFoundScopeClasses.length; i++) {
								var sFoundScopeClass = aFoundScopeClasses[i];
								sParam = getParam({
									parameterName: sName,
									scopeName: sFoundScopeClass
								});
								if (sParam) {
									// return first matching scoped parameter
									return sParam;
								}
							}
						}
						oControl = typeof oControl.getParent === "function" && oControl.getParent();
					}

					// if no matching scope was found return the default parameter (see below)
				}

				return getParam({
					parameterName: sName,
					loadPendingParameters: true
				});
			}

		};

		/**
		 *
		 * Uses the parameters provide to re-set the parameters map or
		 * reloads them as usually.
		 *
		 * @param {Object} mLibraryParameters
		 * @private
		 */
		Parameters._setOrLoadParameters = function(mLibraryParameters) {

			// don't use this.reset(), as it will set the variable to null
			mParameters = {
				"default": {},
				"scopes": {}
			};
			sTheme = sap.ui.getCore().getConfiguration().getTheme();
			forEachStyleSheet(function(sId, sHref) {
				var sLibname = sId.substr(13); // length of sap-ui-theme-
				if (mLibraryParameters[sLibname]) {
					// if parameters are already provided for this lib, use them (e.g. from LessSupport)
					jQuery.extend(mParameters["default"], mLibraryParameters[sLibname]);
				} else {
					// otherwise use inline-parameters or library-parameters.json
					loadParameters(sId, sHref);
				}
			});
		};

		/**
		 * Resets the CSS parameters which finally will reload the parameters
		 * the next time they are queried via the method <code>get</code>.
		 *
		 * @public
		 */
		Parameters.reset = function() {
			// hidden parameter {boolean} bOnlyWhenNecessary
			var bOnlyWhenNecessary = arguments[0] === true;
			if ( !bOnlyWhenNecessary || sap.ui.getCore().getConfiguration().getTheme() !== sTheme ) {
				resetParameters();
			}
		};

		/**
		 * Helper function to get an image URL based on a given theme parameter.
		 *
		 * @private
		 * @param {string} sParamName the theme parameter which contains the logo definition. If nothing is defined the parameter 'sapUiGlobalLogo' is used.
		 * @param {boolean} bForce whether a valid URL should be returned even if there is no logo defined.
		 */
		Parameters._getThemeImage = function(sParamName, bForce) {
			sParamName = sParamName || "sapUiGlobalLogo";
			var logo = Parameters.get(sParamName);
			if (logo) {
				var match = rCssUrl.exec(logo);
				if (match) {
					logo = match[1];
				} else if (logo === "''" || logo === "none") {
					logo = null;
				}
			}

			if (!!bForce && !logo) {
				return sap.ui.resource('sap.ui.core', 'themes/base/img/1x1.gif');
			}

			return logo;
		};


	return Parameters;

}, /* bExport= */ true);
