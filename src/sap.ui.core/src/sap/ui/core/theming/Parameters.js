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

		function resetParameters() {
			mParameters = null;
		}

		function mergeParameterSet(mCurrent, mNew) {
			for (var sParam in mNew) {
				if (typeof mCurrent[sParam] === "undefined") {
					mCurrent[sParam] = mNew[sParam];
				}
			}
			return mCurrent;
		}

		function mergeParameters(mNewParameters) {

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
			mergeParameterSet(mParameters["default"], mNewParameters["default"]);

			// merge scopes
			if (typeof mNewParameters["scopes"] === "object") {
				for (var sScopeName in mNewParameters["scopes"]) {
					// ensure scope object
					mParameters["scopes"][sScopeName] = mParameters["scopes"][sScopeName] || {};
					// merge scope set
					mergeParameterSet(mParameters["scopes"][sScopeName], mNewParameters["scopes"][sScopeName]);
				}
			}
		}

		function checkAndResolveUrls(mParams, sResourceUrl){
			//only resolve relative urls
			var rRelativeUrl = /^url\(['|"]{1}(?!https?:\/\/|\/)(.*)['|"]{1}\)$/,
				sAbsolutePath = sResourceUrl.replace(/library-parameters\.json.*/, "");

			/*eslint-disable no-loop-func */
			for (var sId in mParams){
				if (rRelativeUrl.test(mParams[sId])){
					mParams[sId] = mParams[sId].replace(rRelativeUrl, function($0, $1, $2){
						var sNormalizedPath = new URI(sAbsolutePath + $1).normalize().path();
						return "url('" + sNormalizedPath + "')";
					});
				}
			}
			/*eslint-enable no-loop-func */
			return mParams;
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
		function loadParameters(sId, sUrl) {

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
							sParams = decodeURI(sParams);
						} catch (ex) {
							jQuery.sap.log.warning("Could not decode theme parameters URI from " + sUrl);
						}
					}
					try {
						var oParams = jQuery.parseJSON(sParams);
						mergeParameters(oParams);
						return;
					} catch (ex) {
						jQuery.sap.log.warning("Could not parse theme parameters from " + sUrl + ". Loading library-parameters.json as fallback solution.");
					}
				}
			}

			// load library-parameters.json (as fallback solution)
			var oResponse,
					oResult;

			// derive parameter file URL from CSS file URL
			// $1: name of library (incl. variants)
			// $2: additional parameters, e.g. for sap-ui-merged use case
			sUrl = sUrl.replace(/\/library([^\/.]*)\.(?:css|less)($|[?#])/, function($0,$1,$2) {
				return "/library-parameters.json" + ($2 ? $2 : "");
			});

			// load and evaluate parameter file
			oResponse = jQuery.sap.sjax({url:sUrl,dataType:'json'});
			if (oResponse.success) {
				oResult = oResponse.data;

				if ( jQuery.isArray(oResult) ) {
					// in the sap-ui-merged use case, multiple JSON files are merged into and transfered as a single JSON array
					for (var j = 0; j < oResult.length; j++) {
						var oParams = oResult[j];
						oParams = checkAndResolveUrls(oParams, sUrl);
						mergeParameters(oParams);
					}
				} else {
					oResult = checkAndResolveUrls(oResult, sUrl);
					mergeParameters(oResult);
				}
			} else {
				// ignore failure at least temporarily as long as there are libraries built using outdated tools which produce no json file
				jQuery.sap.log.error("Could not load theme parameters from: " + sUrl, oResponse.error); // could be an error as well, but let's avoid more CSN messages...
			}
		}

		function getParameters() {

			// Inital loading
			if (!mParameters) {

				mergeParameters({});
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
		 * @sap-restricted sap.ui.core
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
		 * @sap-restricted sap.viz
		 * @param {object} oElement element/control instance
		 * @return {array<array<string>>} Two dimensional array with scopes in bottom up order
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
				var match = /url[\s]*\('?"?([^\'")]*)'?"?\)/.exec(logo);
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
