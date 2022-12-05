/*!
 * ${copyright}
 */

// Provides class sap.ui.core.theming.ThemeManager
sap.ui.define([
	'sap/ui/Global',
	"sap/ui/core/Element",
	"sap/ui/core/Configuration",
	"sap/ui/Device",
	"sap/ui/base/EventProvider",
	"sap/base/Log",
	"sap/base/assert",
	"sap/base/util/each",
	'sap/base/util/LoaderExtensions',
	"sap/ui/util/ActivityDetection",
	"sap/ui/dom/includeStylesheet",
	"./ThemeHelper"
],
	function(Global, Element, Configuration, Device, EventProvider, Log, assert, each, LoaderExtensions, ActivityDetection, includeStylesheet, ThemeHelper) {
	"use strict";


	var oThemeManager;

	var maxThemeCheckCycles = 150;
	var mAllLoadedLibraries = {};
	var CUSTOMCSSCHECK = /\.sapUiThemeDesignerCustomCss/i;

	/**
	 * Creates a new ThemeManager object.
	 *
	 * @class Helper class used by the UI5 Core to check whether the themes are applied correctly.
	 *
	 * It could happen that e.g. in onAfterRendering not all themes are available. In these cases the
	 * check waits until the CSS is applied and fires an onThemeChanged event.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @since 1.10.0
	 * @author SAP SE
	 * @private
	 * @alias sap.ui.core.theming.ThemeManager
	 */
	var ThemeManager = EventProvider.extend("sap.ui.core.theming.ThemeManager", /** @lends sap.ui.core.theming.ThemeManager.prototype */ {

		constructor : function() {
			EventProvider.apply(this, arguments);
			this._iCount = 0; // Prevent endless loop
			this._CUSTOMID = "sap-ui-core-customcss";
			this._customCSSAdded = false;
			this._themeCheckedForCustom = null;
			this._sFallbackTheme = null;
			this._mThemeFallback = {};

			setupThemes(this);
			this.themeLoaded = true;
		},

		metadata: {
			events: {
				"ThemeChanged": {}
			}
		},

		/**
		 * Trigger ThemeManager
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		checkThemeChanged : function() {
			this.reset();
			delayedCheckTheme(true);
			if (!this._sThemeCheckId) {
				this.fireThemeChanged();
			}
		}

	});

	ThemeManager.prototype.themeLoaded = false;

	/**
	 * Resets the internal bookkeeping
	 *
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	ThemeManager.prototype.reset = function() {
		this.themeLoaded = false;
		if (this._sThemeCheckId) {
			clearTimeout(this._sThemeCheckId);
			this._sThemeCheckId = null;
			this._iCount = 0;
			this._sFallbackTheme = null;
			this._mThemeFallback = {};
		}
	};

	function checkTheme() {
		var sThemeName = Configuration.getTheme();
		var sPath = oThemeManager._getThemePath("sap.ui.core", sThemeName) + "custom.css";
		var bIsStandardTheme = sThemeName.indexOf("sap_") === 0 || sThemeName === "base";
		var res = true;

		var aFailedLibs = [];

		if (oThemeManager._customCSSAdded && oThemeManager._themeCheckedForCustom === sThemeName) {
			// include custom style sheet here because it has already been added using sap/ui/dom/includeStyleSheet
			// hence, needs to be checked for successful inclusion, too
			mAllLoadedLibraries[oThemeManager._CUSTOMID] = {};
		}

		function checkAndRemoveStyle(sPrefix, sLib) {
			var currentRes = ThemeHelper.checkStyle(sPrefix + sLib, true);
			if (currentRes) {

				// removes all old stylesheets (multiple could exist if theme change was triggered
				// twice in a short timeframe) once the new stylesheet has been loaded
				var aOldStyles = document.querySelectorAll("link[data-sap-ui-foucmarker='" + sPrefix + sLib + "']");
				if (aOldStyles.length > 0) {
					for (var i = 0, l = aOldStyles.length; i < l; i++) {
						aOldStyles[i].remove();
					}
					Log.debug("ThemeManager: Old stylesheets removed for library: " + sLib);
				}

			}
			return currentRes;
		}

		function checkLib(lib) {
			var sStyleId = "sap-ui-theme-" + lib;
			var currentRes = checkAndRemoveStyle("sap-ui-theme-", lib);
			if (currentRes && document.getElementById("sap-ui-themeskeleton-" + lib)) {
				// remove also the skeleton if present in the DOM
				currentRes = checkAndRemoveStyle("sap-ui-themeskeleton-", lib);
			}
			res = res && currentRes;
			if (res) {

				/* as soon as css has been loaded, look if there is a flag for custom css inclusion inside, but only
				 * if this has not been checked successfully before for the same theme
				 */
				if (oThemeManager._themeCheckedForCustom != sThemeName) {
					// custom css is supported for custom themes, so this check is skipped for standard themes
					if (!bIsStandardTheme && checkCustom(lib)) {
						// load custom css available at sap/ui/core/themename/custom.css
						var sCustomCssPath = sPath;

						// check for configured query parameters and add them if available
						var sLibCssQueryParams = getLibraryCssQueryParams(mAllLoadedLibraries["sap.ui.core"]);
						if (sLibCssQueryParams) {
							sCustomCssPath += sLibCssQueryParams;
						}

						includeStylesheet(sCustomCssPath, oThemeManager._CUSTOMID);
						oThemeManager._customCSSAdded = true;
						Log.debug("ThemeManager: delivered custom CSS needs to be loaded, Theme not yet applied");
						oThemeManager._themeCheckedForCustom = sThemeName;
						res = false;
						return false;
					}	else {
						// remove stylesheet once the particular class is not available (e.g. after theme switch)
						/*check for custom theme was not successful, so we need to make sure there are no custom style sheets attached*/
						var oCustomCssLink = document.querySelector("LINK[id='" +  oThemeManager._CUSTOMID + "']");
						if (oCustomCssLink) {
							oCustomCssLink.remove();
							Log.debug("ThemeManager: Custom CSS removed");
						}
						oThemeManager._customCSSAdded = false;
					}
				}
			}

			// Collect all libs that failed to load and no fallback has been applied, yet.
			// The fallback relies on custom theme metadata, so it is not done for standard themes
			if (!bIsStandardTheme && currentRes && !oThemeManager._mThemeFallback[lib]) {
				var oStyle = document.getElementById(sStyleId);
				// Check for error marker (data-sap-ui-ready=false) and that there are no rules
				// to be sure the stylesheet couldn't be loaded at all.
				// E.g. in case an @import within the stylesheet fails, the error marker will
				// also be set, but in this case no fallback should be done as there is a (broken) theme
				if (oStyle && oStyle.getAttribute("data-sap-ui-ready") === "false" &&
					!(oStyle.sheet && ThemeHelper.hasSheetCssRules(oStyle.sheet))
				) {
					aFailedLibs.push(lib);
				}
			}

		}

		each(mAllLoadedLibraries, checkLib);

		// Try to load a fallback theme for all libs that couldn't be loaded
		if (aFailedLibs.length > 0) {

			// Only retrieve the fallback theme once per ThemeManager cycle
			if (!oThemeManager._sFallbackTheme) {
				for (var sLib in mAllLoadedLibraries) {
					var oThemeMetaData = ThemeHelper.getMetadata(sLib);
					if (oThemeMetaData && oThemeMetaData.Extends && oThemeMetaData.Extends[0]) {
						oThemeManager._sFallbackTheme = oThemeMetaData.Extends[0];
						break;
					}
				}
			}

			if (oThemeManager._sFallbackTheme) {
				aFailedLibs.forEach(function(lib) {
					var sStyleId = "sap-ui-theme-" + lib;
					var oStyle = document.getElementById(sStyleId);

					Log.warning(
						"ThemeManager: Custom theme '" + sThemeName + "' could not be loaded for library '" + lib + "'. " +
						"Falling back to its base theme '" + oThemeManager._sFallbackTheme + "'."
					);

					// Change the URL to load the fallback theme
					updateThemeUrl(oStyle, oThemeManager._sFallbackTheme);

					// remember the lib to prevent doing the fallback multiple times
					// (if the fallback also can't be loaded)
					oThemeManager._mThemeFallback[lib] = true;
				});

				// Make sure to wait for the fallback themes to be loaded
				res = false;
			}
		}

		if (!res) {
			Log.debug("ThemeManager: Theme not yet applied.");
		} else {
			oThemeManager._themeCheckedForCustom = sThemeName;
		}
		return res;
	}

	/* checks if a particular class is available
	 */
	 function checkCustom(lib) {

		var cssFile = window.document.getElementById("sap-ui-theme-" + lib);

		if (!cssFile) {
			return false;
		}

		/*
		Check if custom.css indication rule is applied to <link> element
		The rule looks like this:

			link[id^="sap-ui-theme-"]::after,
			.sapUiThemeDesignerCustomCss {
			  content: '{"customcss" : true}';
			}

		First selector is to apply it to the <link> elements,
		the second one for the Safari workaround (see below).
		*/
		var style = window.getComputedStyle(cssFile, ':after');
		var content = style ? style.getPropertyValue('content') : null;

		if (!content && Device.browser.safari) {

			// Safari has a bug which prevents reading properties of hidden pseudo elements
			// As a workaround: Add "sapUiThemeDesignerCustomCss" class on html element
			// in order to get the computed "content" value and remove it again.
			var html = document.documentElement;

			html.classList.add("sapUiThemeDesignerCustomCss");
			content = window.getComputedStyle(html, ":after").getPropertyValue("content");
			html.classList.remove("sapUiThemeDesignerCustomCss");
		}

		if (content && content !== "none") {
			try {

				// Strip surrounding quotes (single or double depending on browser)
				if (content[0] === "'" || content[0] === '"') {
					content = content.substring(1, content.length - 1);
				}

				// Cast to boolean (returns true if string equals "true", otherwise false)
				return content === "true";

			} catch (e) {
				// parsing error
				Log.error("Custom check: Error parsing JSON string for custom.css indication.", e);
			}
		}

		//***********************************
		// Fallback legacy customcss check
		//***********************************

		/*
		 * checks if a particular class is available at the beginning of the stylesheet
		*/

		var aRules = cssFile.sheet ? ThemeHelper.safeAccessSheetCssRules(cssFile.sheet) : null;

		if (!aRules || aRules.length === 0) {
			Log.warning("Custom check: Failed retrieving a CSS rule from stylesheet " + lib);
			return false;
		}

		// we should now have some rule name ==> try to match against custom check
		for (var i = 0; (i < 2 && i < aRules.length) ; i++) {
			if (CUSTOMCSSCHECK.test(aRules[i].selectorText)) {
				return true;
			}
		}

		return false;
	}

	function delayedCheckTheme(bFirst) {
		oThemeManager._iCount++;

		var bEmergencyExit = oThemeManager._iCount > maxThemeCheckCycles;

		if (!checkTheme() && !bEmergencyExit) {
			// Use dynamic delay to have a fast check for most use cases
			// but not cause too much CPU usage for long running css requests
			var iDelay;
			if (oThemeManager._iCount <= 100) {
				iDelay = 2; // 1. Initial interval
			} else if (oThemeManager._iCount <= 110) {
				iDelay = 500; // 2. After 100 cycles
			} else {
				iDelay = 1000; // 3. After another 10 cycles (about 5 seconds)
			}
			oThemeManager._sThemeCheckId = setTimeout(delayedCheckTheme, iDelay);
		} else if (!bFirst) {
			oThemeManager.reset();
			oThemeManager.themeLoaded = true;
			oThemeManager.fireThemeChanged();
			if (bEmergencyExit) {
				Log.error("ThemeManager: max. check cycles reached.");
			}
		} else {
			oThemeManager.themeLoaded = true;
		}
	}

	// helper to add the FOUC marker to the CSS for the given id
	function fnAddFoucmarker(sLinkId) {
		var oLink = document.getElementById(sLinkId);
		if (oLink) {
			oLink.dataset.sapUiFoucmarker = sLinkId;
		}
	}

	/**
	 * Includes a library theme into the current page (if a variant is specified it
	 * will include the variant library theme) and ensure theme root
	 * @param {object} [oLibThemingInfo] to be used only by the Core
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ThemeManager.prototype._includeLibraryThemeAndEnsureThemeRoot = function(oLibThemingInfo) {
		var sLibName = oLibThemingInfo.name;
		// ensure to register correct library theme module path even when "preloadLibCss" prevents
		// including the library theme as controls might use it to calculate theme-specific URLs
		_ensureThemeRoot(sLibName, Configuration.getTheme());

		// also ensure correct theme root for the library's base theme which might be relevant in some cases
		// (e.g. IconPool which includes font files from sap.ui.core base theme)
		_ensureThemeRoot(sLibName, "base");

		mAllLoadedLibraries[sLibName] = oLibThemingInfo;
		if (Configuration.getValue('preloadLibCss').indexOf(sLibName) < 0) {
			this.includeLibraryTheme(sLibName, oLibThemingInfo.variant, oLibThemingInfo);
		}
	};

	/**
	 * Includes a library theme into the current page (if a variant is specified it
	 * will include the variant library theme)
	 * @param {string} sLibName the name of the UI library
	 * @param {string} [sVariant] the variant to include (optional)
	 * @param {string|object} [vQueryOrLibInfo] to be used only by the Core
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	ThemeManager.prototype.includeLibraryTheme = function(sLibName, sVariant, vQueryOrLibInfo) {
		assert(typeof sLibName === "string", "sLibName must be a string");
		assert(sVariant === undefined || typeof sVariant === "string", "sVariant must be a string or undefined");
		var sQuery = vQueryOrLibInfo;

		if (typeof sQuery === "object") {
			// check for configured query parameters and use them
			sQuery = getLibraryCssQueryParams(vQueryOrLibInfo);
		}

		/*
		* by specifying a library name containing a colon (":") you can specify
		* the file name of the CSS file to include (ignoring RTL)
		*/

		// include the stylesheet for the library (except for "classic" and "legacy" lib)
		if ((sLibName != "sap.ui.legacy") && (sLibName != "sap.ui.classic")) {

			// no variant?
			if (!sVariant) {
				sVariant = "";
			}
			// determine CSS Variables / RTL
			var sCssVars = (/^(true|x)$/i.test(Configuration.getValue('xx-cssVariables')) ? "_skeleton" : "");
			var sRtl = (Configuration.getRTL() ? "-RTL" : "");

			// create the library file name
			var sLibFileName,
				sLibId = sLibName + (sVariant.length > 0 ? "-[" + sVariant + "]" : sVariant);
			if (sLibName && sLibName.indexOf(":") == -1) {
				sLibFileName = "library" + sVariant + sCssVars + sRtl;
			} else {
				sLibFileName = sLibName.substring(sLibName.indexOf(":") + 1) + sVariant;
				sLibName = sLibName.substring(0, sLibName.indexOf(":"));
			}

			var sLinkId = "sap-ui-theme-" + sLibId;
			var sOldCssUri = document.getElementById(sLinkId) && document.getElementById(sLinkId).href;
			var sCssBasePath = new URL(this._getThemePath(sLibName, this.sTheme), document.baseURI).toString();
			var sCssPathAndName = sCssBasePath + sLibFileName + ".css" + (sQuery ? sQuery : "");
			var sCssVariablesPathAndName = sCssBasePath + "css_variables.css" + (sQuery ? sQuery : "");
			// includeStylesheet takes care of adding link tag for library only once but we need to take care to skip
			// checkThemeChanged in case the link tag does not change in order to avoid fireThemeChanged
			if (!(sCssPathAndName === sOldCssUri || sCssVariablesPathAndName === sOldCssUri)) {
				// use the special FOUC handling for initially existing stylesheets
				// to ensure that they are not just replaced when using the
				// includeStyleSheet API and to be removed later
				fnAddFoucmarker(sLinkId);

				// include the css variables
				if (/^(true|x|additional)$/i.test(Configuration.getValue('xx-cssVariables'))) {
					Log.info("Including " + sCssVariablesPathAndName + " -  sap.ui.core.theming.ThemeManager.includeLibraryTheme()");
					includeStylesheet(sCssVariablesPathAndName, sLinkId);
					// include the skeleton css next to the css variables
					sLinkId = "sap-ui-themeskeleton-" + sLibId;
					fnAddFoucmarker(sLinkId);
				}

				// log and include
				Log.info("Including " + sCssPathAndName + " -  sap.ui.core.theming.ThemeManager.includeLibraryTheme()");
				includeStylesheet(sCssPathAndName, sLinkId);

				// if parameters have been used, update them with the new style sheet
				var Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
				if (Parameters) {
					Parameters._addLibraryTheme(sLibId);
				}
				this.checkThemeChanged();
			}
		}
	};

	/**
	 * Returns the URL of the folder in which the CSS file for the given theme and the given library is located.
	 *
	 * @param {string} sLibName Library name (dot separated)
	 * @param {string} sThemeName Theme name
	 * @returns {string} module path URL (ends with a slash)
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core,sap.ui.support.supportRules.report.DataCollector
	 */
	ThemeManager.prototype._getThemePath = function(sLibName, sThemeName) {

		// make sure to register correct theme module path in case themeRoots are defined
		_ensureThemeRoot(sLibName, sThemeName);

		// use the library location as theme location
		return sap.ui.require.toUrl((sLibName + ".themes." + sThemeName).replace(/\./g, "/") + "/");
	};

	/**
	 * Makes sure to register the correct module path for the given library and theme
	 * in case a themeRoot has been defined.
	 *
	 * @param {string} sLibName Library name (dot separated)
	 * @param {string} sThemeName Theme name
	 * @private
	 */
	function _ensureThemeRoot(sLibName, sThemeName) {
		if (oThemeManager._mThemeRoots) {
			var path =  oThemeManager._mThemeRoots[sThemeName + " " + sLibName] || oThemeManager._mThemeRoots[sThemeName];
			// check whether for this combination (theme+lib) a URL is registered or for this theme a default location is registered
			if (path) {
				path = path + sLibName.replace(/\./g, "/") + "/themes/" + sThemeName + "/";
				LoaderExtensions.registerResourcePath((sLibName + ".themes." + sThemeName).replace(/\./g, "/"), path);
			}
		}
	}

	/**
	 * Defines the root directory from below which UI5 should load the theme with the given name.
	 * Optionally allows restricting the setting to parts of a theme covering specific control libraries.
	 *
	 * Example:
	 * <pre>
	 *   sap.ui.getCore().setThemeRoot("my_theme", "https://mythemeserver.com/allThemes");
	 *   sap.ui.getCore().applyTheme("my_theme");
	 * </pre>
	 *
	 * will cause the following file to be loaded (assuming that the bootstrap is configured to load
	 *  libraries <code>sap.m</code> and <code>sap.ui.layout</code>):
	 * <pre>
	 *   https://mythemeserver.com/allThemes/sap/ui/core/themes/my_theme/library.css
	 *   https://mythemeserver.com/allThemes/sap/ui/layout/themes/my_theme/library.css
	 *   https://mythemeserver.com/allThemes/sap/m/themes/my_theme/library.css
	 * </pre>
	 *
	 * If parts of the theme are at different locations (e.g. because you provide a standard theme
	 * like "sap_belize" for a custom control library and this self-made part of the standard theme is at a
	 * different location than the UI5 resources), you can also specify for which control libraries the setting
	 * should be used, by giving an array with the names of the respective control libraries as second parameter:
	 * <pre>
	 *   sap.ui.getCore().setThemeRoot("sap_belize", ["my.own.library"], "https://mythemeserver.com/allThemes");
	 * </pre>
	 *
	 * This will cause the Belize theme to be loaded from the UI5 location for all standard libraries.
	 * Resources for styling the <code>my.own.library</code> controls will be loaded from the configured
	 * location:
	 * <pre>
	 *   https://openui5.hana.ondemand.com/resources/sap/ui/core/themes/sap_belize/library.css
	 *   https://openui5.hana.ondemand.com/resources/sap/ui/layout/themes/sap_belize/library.css
	 *   https://openui5.hana.ondemand.com/resources/sap/m/themes/sap_belize/library.css
	 *   https://mythemeserver.com/allThemes/my/own/library/themes/sap_belize/library.css
	 * </pre>
	 *
	 * If the custom theme should be loaded initially (via bootstrap attribute), the <code>themeRoots</code>
	 * property of the <code>window["sap-ui-config"]</code> object must be used instead of calling
	 * <code>sap.ui.getCore().setThemeRoot(...)</code> in order to configure the theme location early enough.
	 *
	 * @param {string} sThemeName Name of the theme for which to configure the location
	 * @param {string[]} [aLibraryNames] Optional library names to which the configuration should be restricted
	 * @param {string} sThemeBaseUrl Base URL below which the CSS file(s) will be loaded from
	 * @param {boolean} [bForceUpdate=false] Force updating URLs of currently loaded theme
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	ThemeManager.prototype.setThemeRoot = function(sThemeName, aLibraryNames, sThemeBaseUrl, bForceUpdate) {
		assert(typeof sThemeName === "string", "sThemeName must be a string");
		assert((Array.isArray(aLibraryNames) && typeof sThemeBaseUrl === "string") || (typeof aLibraryNames === "string" && sThemeBaseUrl === undefined), "either the second parameter must be a string (and the third is undefined), or it must be an array and the third parameter is a string");

		if (!this._mThemeRoots) {
			this._mThemeRoots = {};
		}

		// normalize parameters
		if (typeof aLibraryNames === "string") {
			bForceUpdate = sThemeBaseUrl;
			sThemeBaseUrl = aLibraryNames;
			aLibraryNames = undefined;
		}
		sThemeBaseUrl = sThemeBaseUrl + (sThemeBaseUrl.slice( -1) == "/" ? "" : "/");

		if (aLibraryNames) {
			// registration of URL for several libraries
			for (var i = 0; i < aLibraryNames.length; i++) {
				var lib = aLibraryNames[i];
				this._mThemeRoots[sThemeName + " " + lib] = sThemeBaseUrl;
			}

		} else {
			// registration of theme default base URL
			this._mThemeRoots[sThemeName] = sThemeBaseUrl;
		}

		// Update theme urls when theme roots of currently loaded theme have changed
		if (bForceUpdate && sThemeName === this.sTheme) {
			this._updateThemeUrls(this.sTheme);
		}
	};

	/**
	 * Modify style sheet URLs to point to the given theme, using the current RTL mode
	 *
	 * @param {string} sThemeName The name of the theme to update
	 * @param {boolean} bSuppressFOUC If FOUC-Marker should be added or not
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	ThemeManager.prototype._updateThemeUrls = function(sThemeName, bSuppressFOUC) {
		// select "our" stylesheets
		var oQueryResult = document.querySelectorAll("link[id^=sap-ui-theme-],link[id^=sap-ui-themeskeleton-]");

		Array.prototype.forEach.call(oQueryResult, function(oHTMLElement) {
			updateThemeUrl(oHTMLElement, sThemeName, bSuppressFOUC);
		});

	};

	// this function is also used by "sap.ui.core.theming.ThemeManager" to load a fallback theme for a single library
	function updateThemeUrl(oLink, sThemeName, bSuppressFOUC) {
		var sLibName,
		    iQueryIndex = oLink.href.search(/[?#]/),
		    sLibFileName,
		    sQuery,
		    sStandardLibFilePrefix = "library",
		    sRTL = Configuration.getRTL() ? "-RTL" : "",
		    sHref,
		    pos;

		// derive lib name from id via regex
		var mLinkId = /^sap-ui-theme(?:skeleton)?-(.*)$/i.exec(oLink.id);
		if (Array.isArray(mLinkId)) {
			sLibName = mLinkId[1];
		} else {
			// fallback to legacy logic
			sLibName = oLink.id.slice(13); // length of "sap-ui-theme-"
		}

		mAllLoadedLibraries[sLibName] = mAllLoadedLibraries[sLibName] || {};

		if (iQueryIndex > -1) {
			// Split href on query and/or fragment to check for the standard lib file prefix
			sLibFileName = oLink.href.substring(0, iQueryIndex);
			sQuery = oLink.href.substring(iQueryIndex);
		} else {
			sLibFileName = oLink.href;
			sQuery = "";
		}

		// Get basename of stylesheet (e.g. "library.css")
		sLibFileName = sLibFileName.substring(sLibFileName.lastIndexOf("/") + 1);

		// handle 'variants'
		if ((pos = sLibName.indexOf("-[")) > 0) { // assumes that "-[" does not occur as part of a library name
			sStandardLibFilePrefix += sLibName.slice(pos + 2, -1); // 2=length of "-]"
			sLibName = sLibName.slice(0, pos);
		}

		// try to distinguish "our" library css from custom css included with the ':' notation in includeLibraryTheme
		if ( sLibFileName === (sStandardLibFilePrefix + ".css") || sLibFileName === (sStandardLibFilePrefix + "-RTL.css") ) {
			sLibFileName = sStandardLibFilePrefix + sRTL + ".css";
		}

		sHref = oThemeManager._getThemePath(sLibName, sThemeName) + sLibFileName + sQuery;
		if ( sHref != oLink.href ) {
			// sap/ui/dom/includeStylesheet has a special FOUC handling
			// which is activated once the attribute data-sap-ui-foucmarker is
			// present on the link to be replaced (usage of the Promise
			// API is not sufficient as it will change the sync behavior)
			if (bSuppressFOUC) {
				oLink.dataset.sapUiFoucmarker =  oLink.id;
			}
			// Replace the current <link> tag with a new one.
			// Changing "oLink.href" would also trigger loading the new stylesheet but
			// the load/error handlers would not get called which causes issues with the ThemeManager
			// as the "data-sap-ui-ready" attribute won't be set.
			includeStylesheet(sHref, oLink.id);
		}
	}

	/**
	 * Applies the theme with the given name (by loading the respective style sheets, which does not disrupt the application).
	 *
	 * By default, the theme files are expected to be located at path relative to the respective control library ([libraryLocation]/themes/[themeName]).
	 * Different locations can be configured by using the method setThemePath() or by using the second parameter "sThemeBaseUrl" of applyTheme().
	 * Usage of this second parameter is a shorthand for setThemePath and internally calls setThemePath, so the theme location is then known.
	 *
	 * sThemeBaseUrl is a single URL to specify the default location of all theme files. This URL is the base folder below which the control library folders
	 * are located. E.g. if the CSS files are not located relative to the root location of UI5, but instead they are at locations like
	 *    http://my.server/myapp/resources/sap/ui/core/themes/my_theme/library.css
	 * then the URL that needs to be given is:
	 *    http://my.server/myapp/resources
	 * All theme resources are then loaded from below this folder - except if for a certain library a different location has been registered.
	 *
	 * If the theme resources are not all either below this base location or  with their respective libraries, then setThemePath must be
	 * used to configure individual locations.
	 *
	 * @param {string} sThemeName The name of the theme to be loaded
	 * @param {string} [sThemeBaseUrl] The (optional) base location of the theme
	 * @param {boolean} [bForce] Apply theme even if theme hasn't changed.
	 * 							<code>sap.ui.core.Core</code> does a lazy require of
	 * 							ThemeManager. Loading could be already done, but no change
	 * 							was fired.
	 * @since 1.108
	 * @private
	 */
	ThemeManager.prototype.applyTheme = function(sThemeName, sThemeBaseUrl, bForce) {
		assert(typeof sThemeName === "string", "sThemeName must be a string");
		assert(typeof sThemeBaseUrl === "string" || typeof sThemeBaseUrl === "undefined", "sThemeBaseUrl must be a string or undefined");

		sThemeName = Configuration.normalizeTheme(sThemeName, sThemeBaseUrl);

		if (sThemeBaseUrl) {
			this.setThemeRoot(sThemeName, sThemeBaseUrl);
		}

		// only apply the theme if it is different from the active one
		if ((sThemeName && this.sTheme != sThemeName) || bForce) {
			var sCurrentTheme = this.sTheme;
			var html = document.documentElement;
			this._updateThemeUrls(sThemeName, /* bSuppressFOUC */ true);
			this.sTheme = sThemeName;
			Configuration.setTheme(sThemeName);

			// modify the <html> tag's CSS class with the theme name
			html.classList.remove("sapUiTheme-" + sCurrentTheme);
			html.classList.add("sapUiTheme-" + sThemeName);

			// notify the listeners
			this.checkThemeChanged();
		}
	};

	/**
	 * Returns a string containing query parameters for theme specific files.
	 *
	 * Used in Core#initLibrary and ThemeManager#checkStyle.
	 *
	 * @param {object} oLibInfo Library info object (containing a "version" property)
	 * @returns {string|undefined} query parameters or undefined if "versionedLibCss" config is "false"
	 * @private
	 */
	function getLibraryCssQueryParams(oLibInfo) {
		var sQuery;
		if (Configuration.getValue("versionedLibCss") && oLibInfo) {
			sQuery = "?version=" + oLibInfo.version;

			// distribution version may not be available (will be loaded in Core constructor syncpoint2)
			if (Global.versioninfo) {
				sQuery += "&sap-ui-dist-version=" + Global.versioninfo.version;
			}
		}
		return sQuery;
	}

	/**
	 * Initializes the window "sap-ui-config" property, sets theme roots, initializes sTheme, sets theme CSS classes
	 * @private
	 */
	function setupThemes(oThemeManager) {
		var mThemeRoots = Configuration.getValue("themeRoots");
		// read themeRoots configuration
		if (mThemeRoots) {
			for (var themeName in mThemeRoots) {
				var themeRoot = mThemeRoots[themeName];
				if (typeof themeRoot === "string") {
					oThemeManager.setThemeRoot(themeName, themeRoot);
				} else {
					for (var lib in themeRoot) {
						if (lib.length > 0) {
							oThemeManager.setThemeRoot(themeName, [lib], themeRoot[lib]);
						} else {
							oThemeManager.setThemeRoot(themeName, themeRoot[lib]);
						}
					}
				}
			}
		}

		// set CSS class for the theme name
		oThemeManager.sTheme = Configuration.getTheme();
		document.documentElement.classList.add("sapUiTheme-" + oThemeManager.sTheme);
		Log.info("Declared theme " + oThemeManager.sTheme,null);
	}

	/**
	 * Notify content density changes
	 *
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	ThemeManager.prototype.notifyContentDensityChanged = function () {
		this.fireThemeChanged();
	};

	/**
	 * Notify theme change
	 *
	 * @param {object} oParameters The event parameters
	 * @since 1.108
	 * @private
	 * @ui5-restricted sap.ui.core.Core
	 */
	ThemeManager.prototype.fireThemeChanged = function (oParameters) {
		// special hook for resetting theming parameters before the controls get
		// notified (lightweight coupling to static Parameters module)
		var ThemeParameters = sap.ui.require("sap/ui/core/theming/Parameters");
		if (ThemeParameters) {
			ThemeParameters._reset(/* bOnlyWhenNecessary= */ true);
		}

		oParameters = oParameters || {};
		// set the current theme name as default if omitted
		if (!oParameters.theme) {
			oParameters.theme = Configuration.getTheme();
		}

		// notify all elements/controls via a pseudo browser event
		var sEventId = "ThemeChanged";
		var oEvent = jQuery.Event(sEventId);
		oEvent.theme = oParameters.theme;
		Element.registry.forEach(function(oElement) {
			oElement._handleEvent(oEvent);
		});

		ActivityDetection.refresh();
		this.fireEvent(sEventId, oParameters);
	};

	oThemeManager = new ThemeManager();

	return oThemeManager;

});
