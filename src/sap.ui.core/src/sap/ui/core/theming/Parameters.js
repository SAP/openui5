/*!
 * ${copyright}
 */

/**
 * @namespace
 * @name sap.ui.core.theming
 * @public
 */

sap.ui.define([
	'sap/ui/thirdparty/URI',
	'../Element',
	'sap/base/util/UriParameters',
	'sap/base/Log',
	'sap/ui/thirdparty/jquery'
],
	function(URI, Element, UriParameters, Log, jQuery) {
	"use strict";

	var oCfgData = window["sap-ui-config"] || {};

	var syncCallBehavior = 0; // ignore
	if (oCfgData['xx-nosync'] === 'warn' || /(?:\?|&)sap-ui-xx-nosync=(?:warn)/.exec(window.location.search)) {
		syncCallBehavior = 1;
	}
	if (oCfgData['xx-nosync'] === true || oCfgData['xx-nosync'] === 'true' || /(?:\?|&)sap-ui-xx-nosync=(?:x|X|true)/.exec(window.location.search)) {
		syncCallBehavior = 2;
	}

		/**
		 * A helper used for (read-only) access to CSS parameters at runtime.
		 *
		 * @author SAP SE
		 * @namespace
		 *
		 * @public
		 * @alias sap.ui.core.theming.Parameters
		 */
		var Parameters = {};

		var mParameters = null;
		var sTheme = null;

		var aParametersToLoad = [];

		// match a CSS url
		var rCssUrl = /url[\s]*\('?"?([^\'")]*)'?"?\)/;

		var bUseInlineParameters = UriParameters.fromQuery(window.location.search).get("sap-ui-xx-no-inline-theming-parameters") !== "true";

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
					var sNormalizedUrl = oUri.absoluteTo(sThemeBaseUrl).normalize().toString();
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
				fnCallback(this.getAttribute("id"));
			});
		}

		/*
		 * Load parameters for a library/theme combination as identified by the URL of the library.css
		 */
		function loadParameters(sId) {

			// read inline parameters from css style rule
			// (can be switched off for testing purposes via private URI parameter "sap-ui-xx-no-inline-theming-parameters=true")
			var oLink = document.getElementById(sId);

			if (!oLink) {
				Log.warning("Could not find stylesheet element with ID", sId, "sap.ui.core.theming.Parameters");
				return;
			}

			var sStyleSheetUrl = oLink.href;

			// Remove CSS file name and query to create theme base url (to resolve relative urls)
			var sThemeBaseUrl = new URI(sStyleSheetUrl).filename("").query("").toString();

			var bThemeApplied = sap.ui.getCore().isThemeApplied();

			if (!bThemeApplied) {
				Log.warning("Parameters have been requested but theme is not applied, yet.", "sap.ui.core.theming.Parameters");
			}

			// In some browsers (Safari / Edge) it might happen that after switching the theme or adopting the <link>'s href,
			// the parameters from the previous stylesheet are taken. This can be prevented by checking whether the theme is applied.
			if (bThemeApplied && bUseInlineParameters) {
				var $link = jQuery(oLink);
				var sDataUri = $link.css("background-image");
				var aParams = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(sDataUri);
				if (aParams && aParams.length >= 2) {
					var sParams = aParams[1];
					// decode only if necessary
					if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
						try {
							sParams = decodeURIComponent(sParams);
						} catch (ex) {
							Log.warning("Could not decode theme parameters URI from " + sStyleSheetUrl);
						}
					}
					try {
						var oParams = jQuery.parseJSON(sParams);
						mergeParameters(oParams, sThemeBaseUrl);
						return;
					} catch (ex) {
						Log.warning("Could not parse theme parameters from " + sStyleSheetUrl + ". Loading library-parameters.json as fallback solution.");
					}
				}
			}

			// load library-parameters.json (as fallback solution)

			// derive parameter file URL from CSS file URL
			// $1: name of library (incl. variants)
			// $2: additional parameters, e.g. for sap-ui-merged, version/sap-ui-dist-version
			var sUrl = sStyleSheetUrl.replace(/\/(?:css-variables|library)([^\/.]*)\.(?:css|less)($|[?#])/, function($0, $1, $2) {
				return "/library-parameters.json" + ($2 ? $2 : "");
			});

			if (syncCallBehavior === 2) {
				Log.error("[nosync] Loading library-parameters.json ignored", sUrl, "sap.ui.core.theming.Parameters");
				return;
			} else if (syncCallBehavior === 1) {
				Log.error("[nosync] Loading library-parameters.json with sync XHR", sUrl, "sap.ui.core.theming.Parameters");
			}

			// load and evaluate parameter file
			jQuery.ajax({
				url: sUrl,
				dataType: 'json',
				async: false,
				success: function(data, textStatus, xhr) {
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
					Log.error("Could not load theme parameters from: " + sUrl, error); // could be an error as well, but let's avoid more CSN messages...
				}
			});
		}

		function getParameters() {

			// Inital loading
			if (!mParameters) {

				// Merge an empty parameter set to initialize the internal object
				mergeParameters({}, "");

				sTheme = sap.ui.getCore().getConfiguration().getTheme();

				forEachStyleSheet(loadParameters);
			}

			return mParameters;
		}

		function loadPendingLibraryParameters() {
			// lazy loading of further library parameters
			aParametersToLoad.forEach(loadParameters);

			// clear queue
			aParametersToLoad = [];
		}

		/**
		 * Called by the Core when a new library and its stylesheet have been loaded.
		 * Must be called AFTER a link-tag (with id: "sap-ui-theme" + sLibName) for the theme has been created.
		 * @param {string} sLibId id of theme link-tag
		 * @private
		 */
		Parameters._addLibraryTheme = function(sLibId) {
			// only queue new libraries if some have been loaded already
			// otherwise they will be loaded when the first one requests a parameter
			// see "Parameters.get" for lazy loading of queued library parameters
			if (mParameters) {
				aParametersToLoad.push("sap-ui-theme-" + sLibId);
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

		function getParamForActiveScope(sParamName, aScopeChain) {
			for (var i = 0; i < aScopeChain.length; i++) {
				var aCurrentScopes = aScopeChain[i];

				for (var k = 0; k < aCurrentScopes.length; k++) {
					var sScopeName = aCurrentScopes[k];

					var sParamValue = getParam({
						parameterName: sParamName,
						scopeName: sScopeName
					});

					if (sParamValue) {
						return sParamValue;
					}
				}
			}
			// if no matching scope was found return the default parameter
			return getParam({
				parameterName: sParamName
			});
		}

		/**
		 * Returns the scopes from current theming parameters.
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 * @param {boolean} [bAvoidLoading] Whether loading of parameters should be avoided
		 * @return {array} Scope names
		 */
		Parameters._getScopes = function(bAvoidLoading) {
			if ( bAvoidLoading && !mParameters ) {
				return;
			}
			var oParams = getParameters();
			var aScopes = Object.keys(oParams["scopes"]);
			return aScopes;
		};

		/**
		 * Returns the active scope(s) for a given control by looking up the hierarchy.
		 *
		 * The lookup navigates the DOM hierarchy if it's available. Otherwise if controls aren't rendered yet,
		 * it navigates the control hierarchy. By navigating the control hierarchy, inner-html elements
		 * with the respective scope classes can't get recognized as the Custom Style Class API does only for
		 * root elements.
		 *
		 * @private
		 * @ui5-restricted sap.viz
		 * @param {object} oElement element/control instance
		 * @return {Array.<Array.<string>>} Two dimensional array with scopes in bottom up order
		 */
		Parameters.getActiveScopesFor = function(oElement) {
			var aScopeChain = [];

			if (oElement instanceof Element) {
				var domRef = oElement.getDomRef();

				// make sure to first load all pending parameters
				// doing it later (lazy) might change the behavior in case a scope is initially not defined
				loadPendingLibraryParameters();

				// check for scopes and try to find the classes in parent chain
				var aScopes = this._getScopes();

				if (domRef) {
					var fnNodeHasStyleClass = function(sScopeName) {
						var scopeList = domRef.classList;
						return scopeList && scopeList.contains(sScopeName);
					};

					while (domRef) {
						var aFoundScopeClasses = aScopes.filter(fnNodeHasStyleClass);
						if (aFoundScopeClasses.length > 0) {
							aScopeChain.push(aFoundScopeClasses);
						}
						domRef = domRef.parentNode;
					}
				} else {
					var fnControlHasStyleClass = function(sScopeName) {
						return typeof oElement.hasStyleClass === "function" && oElement.hasStyleClass(sScopeName);
					};

					while (oElement) {
						var aFoundScopeClasses = aScopes.filter(fnControlHasStyleClass);
						if (aFoundScopeClasses.length > 0) {
							aScopeChain.push(aFoundScopeClasses);
						}
						oElement = typeof oElement.getParent === "function" && oElement.getParent();
					}
				}
			}
			return aScopeChain;
		};

		/**
		 * Returns the current value for one or more theming parameters, depending on the given arguments.
		 * <ul>
		 * <li>If no parameter is given a key-value map containing all parameters is returned</li>
		 * <li>If a <code>string</code> is given as first parameter the value is returned as a <code>string</code></li>
		 * <li>If an <code>array</code> is given as first parameter a key-value map containing all parameters from the <code>array</code> is returned</li>
		 * </ul>
		 * <p>The returned key-value maps are a copy so changing values in the map does not have any effect</p>
		 *
		 * @param {string | string[]} vName the (array with) CSS parameter name(s)
		 * @param {sap.ui.core.Element} [oElement]
		 *                           Element / control instance to take into account when looking for a parameter value.
		 *                           This can make a difference when a parameter value is overridden in a theme scope set via a CSS class.
		 * @returns {string | object | undefined} the CSS parameter value(s)
		 *
		 * @public
		 */
		Parameters.get = function(vName, oElement) {
			var sParam;

			if (!sap.ui.getCore().isInitialized()) {
				Log.warning("Called sap.ui.core.theming.Parameters.get() before core has been initialized. " +
					"This could lead to bad performance and sync XHR as inline parameters might not be available, yet. " +
					"Consider using the API only when required, e.g. onBeforeRendering.");
			}

			// Parameters.get() without arugments returns
			// copy of complete default parameter set
			if (arguments.length === 0) {
				loadPendingLibraryParameters();
				var oParams = getParameters();
				return jQuery.extend({}, oParams["default"]);
			}

			if (!vName) {
				return undefined;
			}

			if (oElement instanceof Element) {
				// make sure to first load all pending parameters
				// doing it later (lazy) might change the behavior in case a scope is initially not defined
				loadPendingLibraryParameters();

				// check for scopes and try to find the classes in Control Tree
				var aScopeChain = this.getActiveScopesFor(oElement);

				if (typeof vName === "string") {

					return getParamForActiveScope(vName, aScopeChain);

				} else if (Array.isArray(vName)) {
					var mParams = {};

					for (var j = 0; j < vName.length; j++) {
						var sParamName = vName[j];

						mParams[sParamName] = getParamForActiveScope(sParamName, aScopeChain);
					}

					return mParams;
				}
			} else {
				if (typeof vName === "string") {
					sParam = getParam({
						parameterName: vName,
						loadPendingParameters: true
					});
					return sParam;
				} else if (Array.isArray(vName)) {

					var mParams = {};

					for (var i = 0; i < vName.length; i++) {
						var sParamName = vName[i];
						mParams[sParamName] = Parameters.get(sParamName);
					}

					return mParams;
				}
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
			forEachStyleSheet(function(sId) {
				var sLibname = sId.substr(13); // length of sap-ui-theme-
				if (mLibraryParameters[sLibname]) {
					// if parameters are already provided for this lib, use them (e.g. from LessSupport)
					jQuery.extend(mParameters["default"], mLibraryParameters[sLibname]);
				} else {
					// otherwise use inline-parameters or library-parameters.json
					loadParameters(sId);
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