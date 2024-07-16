/*!
 * ${copyright}
 */
sap.ui.define([
	'sap/ui/core/Lib',
	'sap/ui/core/Theming',
	'sap/ui/thirdparty/URI',
	'../Element',
	'sap/base/future',
	'sap/base/Log',
	'sap/base/util/extend',
	'sap/base/util/syncFetch',
	'sap/ui/core/theming/ThemeManager',
	'./ThemeHelper'
], function(Library, Theming, URI, Element, future, Log, extend, syncFetch, ThemeManager, ThemeHelper) {
	"use strict";

	var syncCallBehavior = sap.ui.loader._.getSyncCallBehavior();

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

	var aCallbackRegistry = [];

	var sBootstrapOrigin = new URI(sap.ui.require.toUrl(""), document.baseURI).origin();
	var mOriginsNeedingCredentials = {};

	// match a CSS url
	var rCssUrl = /url[\s]*\('?"?([^\'")]*)'?"?\)/;

	var bUseInlineParameters = new URLSearchParams(window.location.search).get("sap-ui-xx-no-inline-theming-parameters") !== "true";

	/**
	 * Resolves relative URLs in parameter values.
	 * Only for inline-parameters.
	 *
	 * Parameters containing CSS URLs will automatically be resolved to the theme-specific location they originate from.
	 *
	 * Example:
	 * A parameter for the "sap_horizon" theme will be resolved to a libraries "[library path...]/themes/sap_horizon" folder.
	 * Relative URLs can resolve backwards, too, so given the sample above, a parameter value of <code>url('../my_logo.jpeg')</code>
	 * will resolve to the "[library path...]/themes" folder.
	 *
	 * @param {string} sUrl the relative URL to resolve
	 * @param {string} sThemeBaseUrl the theme base URL, pointing to the library that contains the parameter
	 * @returns {string} the resolved URL in CSS URL notation
	 */
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

		// normalize parameter maps
		// scoped themes like sap_belize already provide nested objects:
		if (typeof mNewParameters["default"] !== "object") {
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
		document.querySelectorAll("link[id^=sap-ui-theme-]").forEach(function(linkNode) {
			fnCallback(linkNode.getAttribute("id"));
		});
	}

	function parseParameters(sId, bAsync) {
		var oUrl = getThemeBaseUrlForId(sId);

		var bThemeApplied = ThemeHelper.checkAndRemoveStyle({ id: sId });

		if (!bThemeApplied && !bAsync) {
			Log.warning("Parameters have been requested but theme is not applied, yet.", "sap.ui.core.theming.Parameters");
		}

		// In some browsers (e.g. Safari) it might happen that after switching the theme or adopting the <link>'s href,
		// the parameters from the previous stylesheet are taken. This can be prevented by checking whether the theme is applied.
		if (bThemeApplied && bUseInlineParameters) {
			var oLink = document.getElementById(sId);
			var sDataUri = window.getComputedStyle(oLink).getPropertyValue("background-image");
			var aParams = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)$/i.exec(sDataUri);
			if (aParams && aParams.length >= 2) {
				var sParams = aParams[1];
				// decode only if necessary
				if (sParams.charAt(0) !== "{" && sParams.charAt(sParams.length - 1) !== "}") {
					try {
						sParams = decodeURIComponent(sParams);
					} catch (ex) {
						future.warningThrows("Could not decode theme parameters URI from " + oUrl.styleSheetUrl);
					}
				}
				try {
					var oParams = JSON.parse(sParams);
					mergeParameters(oParams, oUrl.themeBaseUrl);
					return true; // parameters successfully parsed
				} catch (ex) {
					future.warningThrows("Could not parse theme parameters from " + oUrl.styleSheetUrl + ". Loading library-parameters.json as fallback solution.");
				}
			}
		}
		// sync: return false if parameter could not be parsed OR theme is not applied OR library has no parameters
		//       For sync path this triggers a sync library-parameters.json request as fallback
		// async: always return bThemeApplied. Issues during parsing are not relevant for further processing because
		//        there is no fallback as in the sync case
		return bAsync ? bThemeApplied : false;
	}

	/**
	 * Load parameters for a library/theme combination as identified by the URL of the library.css
	 * @param {string} sId the library name for which parameters might be loaded
	 */
	function loadParameters(sId) {
		var oUrl = getThemeBaseUrlForId(sId);

		// try to parse the inline-parameters for the given library
		// this may fail for a number of reasons, see below
		if (!parseParameters(sId)) {
			// derive parameter file URL from CSS file URL
			// $1: name of library (incl. variants)
			// $2: additional parameters, e.g. for sap-ui-merged, version/sap-ui-dist-version
			var sUrl = oUrl.styleSheetUrl.replace(/\/(?:css_variables|library)([^\/.]*)\.(?:css|less)($|[?#])/, function($0, $1, $2) {
				return "/library-parameters.json" + ($2 ? $2 : "");
			});

			if (syncCallBehavior === 2) {
				Log.error("[nosync] Loading library-parameters.json ignored", sUrl, "sap.ui.core.theming.Parameters");
				return;
			} else if (syncCallBehavior === 1) {
				Log.error("[nosync] Loading library-parameters.json with sync XHR", sUrl, "sap.ui.core.theming.Parameters");
			}

			// check if we need to send credentials
			var sThemeOrigin = new URI(oUrl.themeBaseUrl).origin();
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
			loadParametersJSON(sUrl, oUrl.themeBaseUrl, aWithCredentials);
		}
	}

	function getThemeBaseUrlForId (sId) {
		// read inline parameters from css style rule
		// (can be switched off for testing purposes via private URI parameter "sap-ui-xx-no-inline-theming-parameters=true")
		var oLink = document.getElementById(sId);

		if (!oLink) {
			future.warningThrows("Could not find stylesheet element with ID", sId, "sap.ui.core.theming.Parameters");
			return undefined;
		}

		var sStyleSheetUrl = oLink.href;

		// Remove CSS file name and query to create theme base url (to resolve relative urls)
		return {
			themeBaseUrl: new URI(sStyleSheetUrl).filename("").query("").toString(),
			styleSheetUrl : sStyleSheetUrl
		};
	}

	/**
	 * Loads a parameters.json file from given URL.
	 * @param {string} sUrl URL
	 * @param {string} sThemeBaseUrl Base URL
	 * @param {boolean[]} aWithCredentials probing values for requesting with or without credentials
	 */
	function loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials) {
		var oHeaders = {
			Accept: syncFetch.ContentTypes.JSON
		};

		var bCurrentWithCredentials = aWithCredentials.shift();
		if (bCurrentWithCredentials) {
			// the X-Requested-With Header is essential for the Theming-Service to determine if a GET request will be handled
			// This forces a preflight request which should give us valid Allow headers:
			//   Access-Control-Allow-Origin: ... fully qualified requestor origin ...
			//   Access-Control-Allow-Credentials: true
			oHeaders["X-Requested-With"] = "XMLHttpRequest";
		}

		function fnErrorCallback(error) {
			// ignore failure at least temporarily as long as there are libraries built using outdated tools which produce no json file
			future.errorThrows("Could not load theme parameters from: " + sUrl, error); // could be an error as well, but let's avoid more CSN messages...

			if (aWithCredentials.length > 0) {
				// In a CORS scenario, IF we have sent credentials on the first try AND the request failed,
				// we expect that a service could have answered with the following Allow header:
				//     Access-Control-Allow-Origin: *
				// In this case we must not send credentials, otherwise the service would have answered with:
				//     Access-Control-Allow-Origin: https://...
				//     Access-Control-Allow-Credentials: true
				// Due to security constraints, the browser does not hand out any more information in a CORS scenario,
				// so now we try again without credentials.
				Log.warning("Initial library-parameters.json request failed ('withCredentials=" + bCurrentWithCredentials + "'; sUrl: '" + sUrl + "').\n" +
							"Retrying with 'withCredentials=" + !bCurrentWithCredentials + "'.", "sap.ui.core.theming.Parameters");
				loadParametersJSON(sUrl, sThemeBaseUrl, aWithCredentials);
			}
		}

		// load and evaluate parameter file
		try {
			var response = syncFetch(sUrl, {
				credentials: bCurrentWithCredentials ? "include" : "omit",
				headers: oHeaders
			});
			if (response.ok) {
				var data = response.json();
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
			} else {
				throw new Error(response.statusText || response.status);
			}

		} catch (error) {
			fnErrorCallback(error);
		}
	}

	/**
	 * Retrieves a map containing all inline-parameters.
	 *
	 * @param {boolean} bAsync=undefined whether to load and parse the parameters asynchronously, default sync
	 * @returns {object} a map of all parameters
	 */
	function getParameters(bAsync) {
		// Inital loading
		if (!mParameters) {
			// Merge an empty parameter set to initialize the internal object
			mergeParameters({}, "");

			forEachStyleSheet(function (sId) {
				if (bAsync) {
					if (!parseParameters(sId, bAsync)) {
						aParametersToLoad.push(sId);
					}
				} else {
					loadParameters(sId);
				}
			});
		}

		return mParameters;
	}

	function parsePendingLibraryParameters() {
		var aPendingThemes = [];

		aParametersToLoad.forEach(function (sId) {
			// Try to parse parameters (in case theme is already applied). Else keep parameter ID for later
			if (!parseParameters(sId, /*bAsync=*/true)) {
				aPendingThemes.push(sId);
			}
		});

		// Keep theme IDs which are not ready for later
		aParametersToLoad = aPendingThemes;
	}

	/**
	 * Loads library-parameters.json files if some libraries are missing.
	 */
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
	 * @param {boolean} mOptions.async whether the parameter value should be retrieved asynchronous
	 * @returns {string|undefined} parameter value or undefined
	 * @private
	 */
	function getParam(mOptions) {
		var bAsync = mOptions.async, oParams = getParameters(bAsync);
		if (mOptions.scopeName) {
			oParams = oParams["scopes"][mOptions.scopeName];
		} else {
			oParams = oParams["default"];
		}

		var sParamValue = oParams[mOptions.parameterName];

		// [Compatibility]: if a parameter contains a prefix, we cut off the ":" and try again
		// e.g. "my.lib:paramName"
		if (!sParamValue) {
			var iIndex = mOptions.parameterName.indexOf(":");
			if (iIndex != -1) {
				var sParamNameWithoutColon = mOptions.parameterName.substr(iIndex + 1);
				sParamValue = oParams[sParamNameWithoutColon];
			}
		}

		// Sync: Fallback path for when parameter could not be found so far, library.css MIGHT be not loaded
		if (mOptions.loadPendingParameters && typeof sParamValue === "undefined" && !bAsync) {
			// Include library theme in case it's not already done, since link tag for library
			// is added asynchronous after initLibrary has been executed
			var aAllLibrariesRequireCss = Library.getAllInstancesRequiringCss();
			aAllLibrariesRequireCss.forEach(function (oLibThemingInfo) {
				ThemeManager._includeLibraryThemeAndEnsureThemeRoot(oLibThemingInfo);
			});

			loadPendingLibraryParameters();
			sParamValue = getParam({
				parameterName: mOptions.parameterName,
				scopeName: mOptions.scopeName,
				loadPendingParameters: false // prevent recursion
			});
		}

		return sParamValue;
	}

	function getParamForActiveScope(sParamName, oElement, bAsync) {
		// check for scopes and try to find the classes in Control Tree
		var aScopeChain = Parameters.getActiveScopesFor(oElement, bAsync);

		var aFilteredScopeChain = aScopeChain.flat().reduce(function (aResult, sScope) {
			if (aResult.indexOf(sScope) === -1) {
				aResult.push(sScope);
			}
			return aResult;
		}, []);

		for (var i = 0; i < aFilteredScopeChain.length; i++) {
			var sScopeName = aFilteredScopeChain[i];

			var sParamValue = getParam({
				parameterName: sParamName,
				scopeName: sScopeName,
				async: bAsync
			});

			if (sParamValue) {
				return sParamValue;
			}
		}
		// if no matching scope was found return the default parameter
		return getParam({
			parameterName: sParamName,
			async: bAsync
		});
	}

	/**
	 * Returns the scopes from current theming parameters.
	 *
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @param {boolean} [bAvoidLoading] Whether loading of parameters should be avoided
	 * @param {boolean} [bAsync] Whether loading of parameters should be asynchronous
	 * @return {string[]|undefined} Scope names
	 */
	Parameters._getScopes = function(bAvoidLoading, bAsync) {
		if ( bAvoidLoading && !mParameters ) {
			return;
		}
		var oParams = getParameters(bAsync);
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
	 * @param {boolean} bAsync Whether the scope should be retrieved asynchronous
	 * @return {Array.<Array.<string>>} Two dimensional array with scopes in bottom up order
	 */
	Parameters.getActiveScopesFor = function(oElement, bAsync) {
		var aScopeChain = [];

		if (oElement instanceof Element) {
			var domRef = oElement.getDomRef();

			// make sure to first load all pending parameters
			// doing it later (lazy) might change the behavior in case a scope is initially not defined
			if (bAsync) {
				parsePendingLibraryParameters();
			} else {
				loadPendingLibraryParameters();
			}

			// check for scopes and try to find the classes in parent chain
			var aScopes = this._getScopes(undefined, bAsync);

			if (aScopes.length) {
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
		}
		return aScopeChain;
	};

	/**
	 *
	 * Theming Parameter Value
	 *
	 * @typedef {(string|Object<string,string>|undefined)} sap.ui.core.theming.Parameters.Value
	 * @public
	 */

	/**
	 * <p>
	 * Returns the current value for one or more theming parameters, depending on the given arguments.
	 * The synchronous usage of this API has been deprecated and only the asynchronous usage should still be used
	 * (see the 4th bullet point and the code examples below).
	 * </p>
	 *
	 * <p>
	 * The theming parameters are immutable and cannot be changed at runtime.
	 * Multiple <code>Parameters.get()</code> API calls for the same parameter name will always result in the same parameter value.
	 * </p>
	 *
	 * <p>
	 * The following API variants are available (see also the below examples):
	 * <ul>
	 * <li> <b>(deprecated since 1.92)</b> If no parameter is given a key-value map containing all parameters is returned</li>
	 * <li> <b>(deprecated since 1.94)</b> If a <code>string</code> is given as first parameter the value is returned as a <code>string</code></li>
	 * <li> <b>(deprecated since 1.94)</b> If an <code>array</code> is given as first parameter a key-value map containing all parameters from the <code>array</code> is returned</li>
	 * <li>If an <code>object</code> is given as first parameter the result is returned immediately in case all parameters are loaded and available or within the callback in case not all CSS files are already loaded.
	 * This is the <b>only asynchronous</b> API variant. This variant is the preferred way to retrieve theming parameters.
	 * The structure of the return value is the same as listed above depending on the type of the name property within the <code>object</code>.</li>
	 * </ul>
	 * </p>
	 *
	 * <p>The returned key-value maps are a copy so changing values in the map does not have any effect</p>
	 *
	 * <p>
	 * Please see the examples below for a detailed guide on how to use the <b>asynchronous variant</b> of the API.
	 * </p>
	 *
	 * @example <caption>Scenario 1: Parameters are already available</caption>
	 *  // "sapUiParam1", "sapUiParam2", "sapUiParam3" are already available
	 *  Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // callback is not called, since all Parameters are available synchronously
	 *     }
	 *  });
	 *  // As described above, returns a map with key-value pairs corresponding to the parameters:
	 *  // mParams = {sapUiParam1: '...value...', sapUiParam2: '...value...', sapUiParam3: '...value...'}
	 *
	 * @example <caption>Scenario 2: Some Parameters are missing </caption>
	 *  // "sapUiParam1", "sapUiParam2" are already available
	 *  // "sapUiParam3" is not yet available
	 *  Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // Parameters.get() callback gets the same map with key-value pairs as in "Scenario 1".
	 *        // mParams = {sapUiParam1: '...value...', sapUiParam2: '...value...', sapUiParam3: '...value...'}
	 *     }
	 *  });
	 *  // return-value is undefined, since not all Parameters are yet available synchronously
	 *
	 * @example <caption>Scenario 3: Default values</caption>
	 *  // Scenario 1 (all parameters are available): the returned parameter map can be used to merge with a map of default values.
	 *  // Scenario 2 (one or more parameters are missing): the returned undefined value does not change the default parameters
	 *  // This allows you to always retrieve a consistent set of parameters, either synchronously via the return-value or asynchronously via the provided callback.
	 *  var mMyParams = Object.assign({
	 *     sapUiParam1: "1rem",
	 *     sapUiParam2: "#FF0000",
	 *     sapUiParam3: "16px"
	 *  }, Parameters.get({
	 *     name: ["sapUiParam1", "sapUiParam2", "sapUiParam3"],
	 *     callback: function(mParams) {
	 *        // merge the current parameters with the actual parameters in case they are retrieved asynchronously
	 *        Object.assign(mMyParams, mParams);
	 *     }
	 *  });
	 *
	 * @param {string | string[] | object} vName the (array with) CSS parameter name(s) or an object containing the (array with) CSS parameter name(s),
	 *     the scopeElement and a callback for async retrieval of parameters.
	 * @param {string | string[]} vName.name the (array with) CSS parameter name(s)
	 * @param {sap.ui.core.Element} [vName.scopeElement]
	 *                           Element / control instance to take into account when looking for a parameter value.
	 *                           This can make a difference when a parameter value is overridden in a theme scope set via a CSS class.
	 * @param {function(sap.ui.core.theming.Parameters.Value)} [vName.callback] If given, the callback is only executed in case there are still parameters pending and one or more of the requested parameters is missing.
	 * @param {sap.ui.core.Element} [oElement]
	 *                           Element / control instance to take into account when looking for a parameter value.
	 *                           This can make a difference when a parameter value is overridden in a theme scope set via a CSS class.
	 * @returns {sap.ui.core.theming.Parameters.Value} the CSS parameter value(s) or <code>undefined</code> if the parameters could not be retrieved.
	 *
	 * @public
	 */
	Parameters.get = function(vName, oElement) {
		let sParamName, fnAsyncCallback, bAsync, aNames, iIndex;

		// Whether parameters containing CSS URLs should be parsed into regular URL strings,
		// e.g. a parameter value of url('https://myapp.sample/image.jpeg') will be returned as "https://myapp.sample/image.jpeg".
		// Empty strings as well as the special CSS value 'none' will be parsed to null.
		let bParseUrls;

		var findRegisteredCallback = function (oCallbackInfo) { return oCallbackInfo.callback === fnAsyncCallback; };

		if (!sTheme) {
			sTheme = Theming.getTheme();
		}

		// Parameters.get() without arguments returns
		// copy of complete default parameter set
		if (arguments.length === 0) {
			Log.warning(
				"[FUTURE FATAL] Legacy variant usage of sap.ui.core.theming.Parameters.get API detected. Do not use the Parameters.get() API to retrieve ALL theming parameters, " +
				"as this will lead to unwanted synchronous requests. " +
				"Use the asynchronous API variant instead and retrieve a fixed set of parameters.",
				"LegacyParametersGet",
				"sap.ui.support",
				function() { return { type: "LegacyParametersGet" }; }
			);

			// first try to load all pending parameters
			loadPendingLibraryParameters();

			// retrieve parameters
			// optionally might also trigger a sync JSON request, if a library was loaded but not parsed yet
			var oParams = getParameters();
			return Object.assign({}, oParams["default"]);
		}

		if (!vName) {
			return undefined;
		}

		if (vName instanceof Object && !Array.isArray(vName)) {
			// async variant of Parameters.get
			if (!vName.name) {
				future.warningThrows("sap.ui.core.theming.Parameters.get was called with an object argument without one or more parameter names.");
				return undefined;
			}
			oElement = vName.scopeElement;
			fnAsyncCallback = vName.callback;
			bParseUrls = vName._restrictedParseUrls || false;
			aNames = typeof vName.name === "string" ? [vName.name] : vName.name;
			bAsync = true;
		} else {
			// legacy variant
			if (typeof vName === "string") {
				aNames = [vName];
			} else { // vName is Array
				aNames = vName;
			}

			Log.warning(
				"[FUTURE FATAL] Legacy variant usage of sap.ui.core.theming.Parameters.get API detected for parameter(s): '" + aNames.join(", ") +
				"'. This could lead to bad performance and additional synchronous XHRs, as parameters might not be available yet. Use asynchronous variant instead.",
				"LegacyParametersGet",
				"sap.ui.support",
				function() { return { type: "LegacyParametersGet" }; }
			);
		}

		var resolveWithParameter;
		var lookForParameter = function (sName) {
			if (oElement instanceof Element) {
				return getParamForActiveScope(sName, oElement, bAsync);
			} else {
				if (bAsync) {
					parsePendingLibraryParameters();
				}
				return getParam({
					parameterName: sName,
					loadPendingParameters: !bAsync,
					async: bAsync
				});
			}
		};

		const mResult = {};

		for (var i = 0; i < aNames.length; i++) {
			sParamName = aNames[i];
			var sParamValue = lookForParameter(sParamName);
			if (!bAsync || sParamValue) {
				mResult[sParamName] = sParamValue;
			}
		}

		if (bAsync && fnAsyncCallback && Object.keys(mResult).length !== aNames.length) {
			resolveWithParameter = function () {
				Theming.detachApplied(resolveWithParameter);
				var vParams = this.get({ // Don't pass callback again
					name: vName.name,
					scopeElement: vName.scopeElement
				});

				if (!vParams || (typeof vParams === "object" && (Object.keys(vParams).length !== aNames.length))) {
					future.errorThrows("One or more parameters could not be found.", "sap.ui.core.theming.Parameters");
				}

				fnAsyncCallback(vParams);
				aCallbackRegistry.splice(aCallbackRegistry.findIndex(findRegisteredCallback), 1);
			}.bind(this);

			// Check if identical callback is already registered and reregister with current parameters
			iIndex = aCallbackRegistry.findIndex(findRegisteredCallback);
			if (iIndex >= 0) {
				Theming.detachApplied(aCallbackRegistry[iIndex].eventHandler);
				aCallbackRegistry[iIndex].eventHandler = resolveWithParameter;
			} else {
				aCallbackRegistry.push({ callback: fnAsyncCallback, eventHandler: resolveWithParameter });
			}
			Theming.attachApplied(resolveWithParameter);
			return undefined; // Don't return partial result in case we expect applied event.
		}

		// parse CSS URL strings
		// The URLs itself have been resolved at this point
		if (bParseUrls) {
			parseUrls(mResult);
		}

		// if only 1 parameter is requests we unwrap the results array
		return aNames.length === 1 ? mResult[aNames[0]] : mResult;
	};

	/**
	 * Checks the given map of parameters for CSS URLs and parses them to a regular string.
	 * Modifies the mParams argument in place.
	 *
	 * In order to only retrieve resolved URL strings and not the CSS URL strings, we expose a restricted Parameters.get() option <code>_restrictedParseUrls</code>.
	 *
	 * A URL parameter value of '' (empty string) or "none" (standard CSS value) will result in <code>null</code>.
	 * As with any other <code>Parameters.get()</code> call, a non-existent parameter will result in <code>undefined</code>.
	 *
	 * Usage in controls:
	 *
	 * @example <caption>Scenario 4: Parsing CSS URLs</caption>
	 *   const sUrl = Parameters.get({
	 *      name: ["sapUiUrlParam"],
	 *      _restrictedParseUrls: true
	 *   }) ?? "https://my.bootstrap.url/resource/my/lib/images/fallback.jpeg"; // fallback via nullish coalescing operator
	 *
	 * @param {object<string,string|undefined>} mParams a set of parameters that should be parsed for CSS URLs
	 */
	function parseUrls(mParams) {
		for (const sKey in mParams) {
			if (Object.hasOwn(mParams, sKey)) {
				let sValue = mParams[sKey];
				const match = rCssUrl.exec(sValue);
				if (match) {
					sValue = match[1];
				} else if (sValue === "''" || sValue === "none") {
					sValue = null;
				}
				mParams[sKey] = sValue;
			}
		}
	}

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
		sTheme = Theming.getTheme();
		forEachStyleSheet(function(sId) {
			var sLibname = sId.substr(13); // length of sap-ui-theme-
			if (mLibraryParameters[sLibname]) {
				// if parameters are already provided for this lib, use them (e.g. from LessSupport)
				extend(mParameters["default"], mLibraryParameters[sLibname]);
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
	 * @private
	 * @ui5-restricted sap.ui.core.theming
	 */
	Parameters._reset = function() {
		// hidden parameter {boolean} bOnlyWhenNecessary
		var bOnlyWhenNecessary = arguments[0] === true;
		if ( !bOnlyWhenNecessary || Theming.getTheme() !== sTheme ) {
			sTheme = Theming.getTheme();
			aParametersToLoad = [];
			mParameters = null;
		}
	};

	return Parameters;
});
