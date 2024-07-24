/*!
 * ${copyright}
 */

// Provides class sap.ui.core.theming.ThemeManager
sap.ui.define([
	"sap/base/assert",
	"sap/base/Eventing",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/config",
	"sap/base/i18n/Localization",
	"sap/base/util/each",
	"sap/base/util/LoaderExtensions",
	"sap/ui/Device",
	"sap/ui/VersionInfo",
	"sap/ui/core/Lib",
	"sap/ui/core/Theming",
	"sap/ui/core/theming/ThemeHelper",
	"sap/ui/dom/includeStylesheet"
], function(
	assert,
	Eventing,
	future,
	Log,
	BaseConfig,
	Localization,
	each,
	LoaderExtensions,
	Device,
	VersionInfo,
	Library,
	Theming,
	ThemeHelper,
	includeStylesheet
) {
	"use strict";

	const oEventing = new Eventing();
	var maxThemeCheckCycles = 150;
	var mAllLoadedLibraries = {};
	var CUSTOMCSSCHECK = /\.sapUiThemeDesignerCustomCss/i;

	var _iCount = 0; // Prevent endless loop
	var _CUSTOMID = "sap-ui-core-customcss";
	var _customCSSAdded = false;
	var _themeCheckedForCustom = null;
	var _sFallbackTheme = null;
	var _mThemeFallback = {};
	var _sThemeCheckId;

	/**
	 * Helper class used by the UI5 Core to check whether the themes are applied correctly.
	 *
	 * It could happen that e.g. in onAfterRendering not all themes are available. In these cases the
	 * check waits until the CSS is applied and fires an onThemeApplied event.
	 *
	 * @namespace
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.core
	 * @alias sap.ui.core.theming.ThemeManager
	 */
	var ThemeManager = {
		/**
		 * Wether theme is already loaded or not
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		themeLoaded: true,

		/**
		 * Trigger ThemeManager
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		checkThemeApplied : function() {
			ThemeManager.reset();
			delayedCheckTheme(true);
			if (!_sThemeCheckId) {
				ThemeManager.fireThemeApplied();
			}
		},

		/**
		 * Resets the internal bookkeeping
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		reset: function() {
			ThemeManager.themeLoaded = false;
			if (_sThemeCheckId) {
				clearTimeout(_sThemeCheckId);
				_sThemeCheckId = null;
				_iCount = 0;
				_sFallbackTheme = null;
				_mThemeFallback = {};
			}
		},

		/**
		 * Includes a library theme into the current page (if a variant is specified it
		 * will include the variant library theme) and ensure theme root
		 * @param {object} [oLibThemingInfo] to be used only by the Core
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		_includeLibraryThemeAndEnsureThemeRoot: function(oLibThemingInfo) {
			var sLibName = oLibThemingInfo.name;
			// ensure to register correct library theme module path even when "preloadLibCss" prevents
			// including the library theme as controls might use it to calculate theme-specific URLs
			_ensureThemeRoot(sLibName, Theming.getTheme());

			// also ensure correct theme root for the library's base theme which might be relevant in some cases
			// (e.g. IconPool which includes font files from sap.ui.core base theme)
			_ensureThemeRoot(sLibName, "base");

			mAllLoadedLibraries[sLibName] = oLibThemingInfo;
			if (!oLibThemingInfo.preloadedCss) {
				ThemeManager.includeLibraryTheme(sLibName, oLibThemingInfo.variant, oLibThemingInfo);
			}
		},

		/**
		 * Includes a library theme into the current page (if a variant is specified it
		 * will include the variant library theme)
		 * @param {string} sLibName the name of the UI library
		 * @param {string} [sVariant] the variant to include (optional)
		 * @param {string|object} [vQueryOrLibInfo] to be used only by the Core
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		includeLibraryTheme: function(sLibName, sVariant, vQueryOrLibInfo) {
			assert(typeof sLibName === "string", "sLibName must be a string");
			assert(sVariant === undefined || typeof sVariant === "string", "sVariant must be a string or undefined");
			var sQuery = vQueryOrLibInfo;

			if (typeof sQuery === "object") {
				// check for configured query parameters and use them
				sQuery = getLibraryCssQueryParams(vQueryOrLibInfo);
			}

			// no variant?
			if (!sVariant) {
				sVariant = "";
			}

			// determine RTL
			var sRtl = (Localization.getRTL() ? "-RTL" : "");


			/*
			 * Create the library file name.
			 * By specifying a library name containing a colon (":") you can specify
			 * the file name of the CSS file to include (ignoring RTL).
			 */
			var sLibFileName,
				sLibId = sLibName + (sVariant.length > 0 ? "-[" + sVariant + "]" : sVariant);
			if (sLibName && sLibName.indexOf(":") == -1) {
				sLibFileName = "library" + sVariant + sRtl;
			} else {
				sLibFileName = sLibName.substring(sLibName.indexOf(":") + 1) + sVariant;
				sLibName = sLibName.substring(0, sLibName.indexOf(":"));
			}

			var sLinkId = "sap-ui-theme-" + sLibId;
			if (!document.querySelector("LINK[id='" + sLinkId + "']")) {
				var sCssBasePath = new URL(ThemeManager._getThemePath(sLibName, Theming.getTheme()), document.baseURI).toString();
				// Create a link tag and set the URL as href in order to ensure AppCacheBuster handling.
				// AppCacheBuster ID is added to the href by defineProperty for the "href" property of
				// HTMLLinkElement in AppCacheBuster.js
				// Note: Considered to use AppCacheBuster.js#convertURL for adding the AppCachebuster ID
				//       but there would be a dependency to AppCacheBuster as trade-off
				var oTmpLink = document.createElement("link");
				oTmpLink.href = sCssBasePath + sLibFileName + ".css" + (sQuery ? sQuery : "");
				var sCssPathAndName = oTmpLink.href;

				// use the special FOUC handling for initially existing stylesheets
				// to ensure that they are not just replaced when using the
				// includeStyleSheet API and to be removed later
				fnAddFoucmarker(sLinkId);

				// log and include
				Log.info("Including " + sCssPathAndName + " -  sap.ui.core.theming.ThemeManager.includeLibraryTheme()");
				includeStylesheet(sCssPathAndName, sLinkId);

				// if parameters have been used, update them with the new style sheet
				var Parameters = sap.ui.require("sap/ui/core/theming/Parameters");
				if (Parameters) {
					Parameters._addLibraryTheme(sLibId);
				}
				ThemeManager.checkThemeApplied();
			}
		},

		/**
		 * Returns the URL of the folder in which the CSS file for the given theme and the given library is located.
		 *
		 * @param {string} sLibName Library name (dot separated)
		 * @param {string} sThemeName Theme name
		 * @returns {string} module path URL (ends with a slash)
		 * @private
		 * @ui5-restricted sap.ui.core,sap.ui.support.supportRules.report.DataCollector
		 */
		_getThemePath: function(sLibName, sThemeName) {

			// make sure to register correct theme module path in case themeRoots are defined
			_ensureThemeRoot(sLibName, sThemeName);

			// use the library location as theme location
			return sap.ui.require.toUrl((sLibName + ".themes." + sThemeName).replace(/\./g, "/") + "/");
		},

		/**
		 * Modify style sheet URLs to point to the given theme, using the current RTL mode
		 *
		 * @param {string} sThemeName The name of the theme to update
		 * @param {boolean} bSuppressFOUC If FOUC-Marker should be added or not
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		_updateThemeUrls: function(sThemeName, bSuppressFOUC) {
			// select "our" stylesheets
			var oQueryResult = document.querySelectorAll("link[id^=sap-ui-theme-]");

			Array.prototype.forEach.call(oQueryResult, function(oHTMLElement) {
				updateThemeUrl(oHTMLElement, sThemeName, bSuppressFOUC);
			});
		},
		/**
		 * Attach to the theme applied event
		 *
		 * @param {function(module:sap/ui/core/Theming.$appliedEvent)} fnCallback The event handler
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		_attachThemeApplied: function (fnCallback) {
			oEventing.attachEvent("applied", fnCallback);
		},
		/**
		 * Detach from the theme applied event
		 *
		 * @param {function(module:sap/ui/core/Theming.$appliedEvent)} fnCallback The event handler
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		_detachThemeApplied: function (fnCallback) {
			oEventing.detachEvent("applied", fnCallback);
		},
		/**
		 * Notify theme change
		 *
		 * @private
		 * @ui5-restricted sap.ui.core
		 */
		fireThemeApplied: function () {
			ThemeHelper.reset();
			// special hook for resetting theming parameters before the controls get
			// notified (lightweight coupling to static Parameters module)
			var ThemeParameters = sap.ui.require("sap/ui/core/theming/Parameters");
			if (ThemeParameters) {
				ThemeParameters._reset(/* bOnlyWhenNecessary= */ true);
			}

			oEventing.fireEvent("applied", {
				theme: Theming.getTheme()
			});
		}
	};


	function checkTheme() {
		var sThemeName = Theming.getTheme();
		var sPath = ThemeManager._getThemePath("sap.ui.core", sThemeName) + "custom.css";
		var bIsStandardTheme = sThemeName.indexOf("sap_") === 0 || sThemeName === "base";
		var res = true;

		var aFailedLibs = [];

		if (_customCSSAdded && _themeCheckedForCustom === sThemeName) {
			// include custom style sheet here because it has already been added using sap/ui/dom/includeStyleSheet
			// hence, needs to be checked for successful inclusion, too
			mAllLoadedLibraries[_CUSTOMID] = {};
		}

		function checkLib(lib) {
			var sStyleId = "sap-ui-theme-" + lib;
			var currentRes = ThemeHelper.checkAndRemoveStyle({ prefix: "sap-ui-theme-", id: lib });

			res = res && currentRes;
			if (res) {

				/* as soon as css has been loaded, look if there is a flag for custom css inclusion inside, but only
				 * if this has not been checked successfully before for the same theme
				 */
				// Only need to adjust custom css in case the theme changed or we have no custom.css yet
				if (!_customCSSAdded || _themeCheckedForCustom != sThemeName) {
					// custom css is only supported for custom themes
					if (!bIsStandardTheme && checkCustom(lib)) {
						// load custom css available at sap/ui/core/themename/custom.css
						var sCustomCssPath = sPath;

						// check for configured query parameters and add them if available
						var sLibCssQueryParams = getLibraryCssQueryParams(mAllLoadedLibraries["sap.ui.core"]);
						if (sLibCssQueryParams) {
							sCustomCssPath += sLibCssQueryParams;
						}

						includeStylesheet(sCustomCssPath, _CUSTOMID);
						_customCSSAdded = true;
						Log.debug("ThemeManager: delivered custom CSS needs to be loaded, Theme not yet applied");
						_themeCheckedForCustom = sThemeName;
						res = false;
						return false;
					// only remove custom css in case a custom.css was added
					} else if (_customCSSAdded) {
						// remove stylesheet once the particular class is not available (e.g. after theme switch)
						/*check for custom theme was not successful, so we need to make sure there are no custom style sheets attached*/
						var oCustomCssLink = document.querySelector("LINK[id='" +  _CUSTOMID + "']");
						if (oCustomCssLink) {
							oCustomCssLink.remove();
							Log.debug("ThemeManager: Custom CSS removed");
						}
						_customCSSAdded = false;
					}

				}
			}

			// Collect all libs that failed to load and no fallback has been applied, yet.
			// The fallback relies on custom theme metadata, so it is not done for standard themes
			if (!bIsStandardTheme && currentRes && !_mThemeFallback[lib]) {
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
			if (!_sFallbackTheme) {
				for (var sLib in mAllLoadedLibraries) {
					var oThemeMetaData = ThemeHelper.getMetadata(sLib);
					if (oThemeMetaData && oThemeMetaData.Extends && oThemeMetaData.Extends[0]) {
						_sFallbackTheme = oThemeMetaData.Extends[0];
						break;
					}
				}
			}

			if (_sFallbackTheme) {
				aFailedLibs.forEach(function(lib) {
					var sStyleId = "sap-ui-theme-" + lib;
					var oStyle = document.getElementById(sStyleId);

					Log.warning(
						"ThemeManager: Custom theme '" + sThemeName + "' could not be loaded for library '" + lib + "'. " +
						"Falling back to its base theme '" + _sFallbackTheme + "'."
					);

					// Change the URL to load the fallback theme
					updateThemeUrl(oStyle, _sFallbackTheme);

					// remember the lib to prevent doing the fallback multiple times
					// (if the fallback also can't be loaded)
					_mThemeFallback[lib] = true;
				});

				// Make sure to wait for the fallback themes to be loaded
				res = false;
			}
		}

		if (!res) {
			Log.debug("ThemeManager: Theme not yet applied.");
		} else {
			_themeCheckedForCustom = sThemeName;
		}
		return res;
	}

	/**
	 * checks if a particular class is available
	 *
	 * @param {string} lib The library name
	 * @returns {boolean} Wether lib has custom css or not
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
				future.errorThrows("Custom check: Error parsing JSON string for custom.css indication.", e);
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
		_iCount++;

		var bEmergencyExit = _iCount > maxThemeCheckCycles;

		if (!checkTheme() && !bEmergencyExit) {
			// Use dynamic delay to have a fast check for most use cases
			// but not cause too much CPU usage for long running css requests
			var iDelay;
			if (_iCount <= 100) {
				iDelay = 2; // 1. Initial interval
			} else if (_iCount <= 110) {
				iDelay = 500; // 2. After 100 cycles
			} else {
				iDelay = 1000; // 3. After another 10 cycles (about 5 seconds)
			}
			_sThemeCheckId = setTimeout(delayedCheckTheme, iDelay);
		} else if (!bFirst) {
			ThemeManager.reset();
			ThemeManager.themeLoaded = true;
			ThemeManager.fireThemeApplied();
			if (bEmergencyExit) {
				future.errorThrows("ThemeManager: max. check cycles reached.");
			}
		} else {
			ThemeManager.themeLoaded = true;
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
	 * Applies the theme with the given name (by loading the respective style sheets, which does not disrupt the application).
	 *
	 * By default, the theme files are expected to be located at path relative to the respective control library ([libraryLocation]/themes/[themeName]).
	 *
	 * Different locations can be configured by using the method setThemePath().
	 * sThemeBaseUrl is a single URL to specify the default location of all theme files. This URL is the base folder below which the control library folders
	 * are located. E.g. if the CSS files are not located relative to the root location of UI5, but instead they are at locations like
	 *    http://my.server/myapp/resources/sap/ui/core/themes/my_theme/library.css
	 * then the URL that needs to be given is:
	 *    http://my.server/myapp/resources
	 * All theme resources are then loaded from below this folder - except if for a certain library a different location has been registered.
	 *
	 * If the theme resources are not all either below this base location or  with their respective libraries, then setThemePath must be
	 * used to configure individual locations.
	 * @param {object} oTheme Theme object containing the old and the new theme
	 * @param {string} oTheme.new Name of the new theme
	 * @param {string} oTheme.old Name of the previous theme
	 *
	 * @private
	 */
	function applyTheme(oTheme) {
		var html = document.documentElement;
		var sTheme = oTheme.new;
		ThemeManager._updateThemeUrls(sTheme, /* bSuppressFOUC */ true);

		// modify the <html> tag's CSS class with the theme name
		html.classList.remove("sapUiTheme-" + oTheme.old);
		html.classList.add("sapUiTheme-" + sTheme);

		// notify the listeners
		ThemeManager.checkThemeApplied();
	}


	/**
	 * Makes sure to register the correct module path for the given library and theme
	 * in case a themeRoot has been defined.
	 *
	 * @param {string} sLibName Library name (dot separated)
	 * @param {string} sThemeName Theme name
	 * @private
	 */
	function _ensureThemeRoot(sLibName, sThemeName) {
		var sThemeRoot = Theming.getThemeRoot(sThemeName, sLibName);
		if (sThemeRoot) {
			// check whether for this combination (theme+lib) a URL is registered or for this theme a default location is registered
			sThemeRoot = sThemeRoot + (sThemeRoot.slice( -1) == "/" ? "" : "/") + sLibName.replace(/\./g, "/") + "/themes/" + sThemeName + "/";
			LoaderExtensions.registerResourcePath((sLibName + ".themes." + sThemeName).replace(/\./g, "/"), sThemeRoot);
		}
	}

	// this function is also used by "sap.ui.core.theming.ThemeManager" to load a fallback theme for a single library
	function updateThemeUrl(oLink, sThemeName, bSuppressFOUC) {
		var sLibName,
		    iQueryIndex = oLink.href.search(/[?#]/),
		    sLibFileName,
		    sQuery,
		    sStandardLibFilePrefix = "library",
		    sRTL = Localization.getRTL() ? "-RTL" : "",
		    sHref,
		    pos;

		// derive lib name from id via regex
		var mLinkId = /^sap-ui-theme-(.*)$/i.exec(oLink.id);
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

		// Transform to URL in order to ensure comparison against the fully resolved URL
		sHref = new URL(ThemeManager._getThemePath(sLibName, sThemeName) + sLibFileName + sQuery, document.baseURI).toString();
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
		if (Library.getVersionedLibCss() && oLibInfo) {
			sQuery = "?version=" + oLibInfo.version;

			// distribution version may not be available (will be loaded in Core constructor syncpoint2)
			if (VersionInfo._content) {
				sQuery += "&sap-ui-dist-version=" + VersionInfo._content.version;
			}
		}
		return sQuery;
	}

	// set CSS class for the theme name
	document.documentElement.classList.add("sapUiTheme-" + Theming.getTheme());
	Log.info("Declared theme " + Theming.getTheme(), null);

	Theming.attachChange(function(oEvent) {
		var mThemeRoots = oEvent.themeRoots;
		var oTheme = oEvent.theme;
		if (mThemeRoots && mThemeRoots.forceUpdate) {
			ThemeManager._updateThemeUrls(Theming.getTheme());
		}
		if (oTheme) {
			applyTheme(oTheme);
		}
	});

	Theming.registerThemeManager(ThemeManager);

	return ThemeManager;
});
