/*!
 * ${copyright}
 */

// Provides class sap.ui.core.ThemeCheck
sap.ui.define(['jquery.sap.global', 'sap/ui/Device', 'sap/ui/Global', 'sap/ui/base/Object', 'sap/ui/thirdparty/URI', 'jquery.sap.script'],
	function (jQuery, Device, Global, BaseObject, URI/* , jQuerySap */) {
		"use strict";


		var maxThemeCheckCycles = 150;

		/**
		 * Creates a new ThemeCheck object.
		 *
		 * @class Helper class used by the UI5 Core to check whether the themes are applied correctly.
		 *
		 * It could happen that e.g. in onAfterRendering not all themes are available. In these cases the
		 * check waits until the CSS is applied and fires an onThemeChanged event.
		 *
		 * @extends sap.ui.base.Object
		 * @since 1.10.0
		 * @author SAP SE
		 * @private
		 * @alias sap.ui.core.ThemeCheck
		 */
		var ThemeCheck = BaseObject.extend("sap.ui.core.ThemeCheck", /** @lends sap.ui.core.ThemeCheck.prototype */ {

			constructor: function (oCore) {
				this._oCore = oCore;
				this._iCount = 0; // Prevent endless loop
				this._CUSTOMCSSCHECK = /\.sapUiThemeDesignerCustomCss/i;
				this._CUSTOMID = "sap-ui-core-customcss";
				this._customCSSAdded = false;
				this._themeCheckedForCustom = null;
				this._sFallbackTheme = null;
				this._mThemeFallback = {};
			},

			getInterface: function () {
				return this;
			},

			fireThemeChangedEvent: function (bOnlyOnInitFail) {
				clear(this);

				delayedCheckTheme.apply(this, [true]);

				if (!bOnlyOnInitFail && !this._sThemeCheckId) {
					this._oCore.fireThemeChanged({ theme: this._oCore.getConfiguration().getTheme() });
				}

			}

		});

		ThemeCheck.themeLoaded = false;

		ThemeCheck.checkStyle = function (sId, bLog) {
			var oStyle = document.getElementById(sId);

			try {

				var bNoLinkElement = false,
					bLinkElementFinishedLoading = false,
					bSheet = false,
					bInnerHtml = false;

				// Check if <link> element is missing (e.g. misconfigured library)
				bNoLinkElement = !!oStyle;

				// Check if <link> element has finished loading (see jQuery.sap.includeStyleSheet)
				bLinkElementFinishedLoading = !!(oStyle && (oStyle.getAttribute("data-sap-ui-ready") === "true" || oStyle.getAttribute("data-sap-ui-ready") === "false"));

				// Check for "sheet" object and if rules are available
				try {
					bSheet = !!(oStyle && oStyle.sheet && oStyle.sheet.href === oStyle.href && oStyle.sheet.cssRules && oStyle.sheet.cssRules.length > 0);
				} catch (e) {
					// Firefox throws a SecurityError or InvalidAccessError if "oStyle.sheet.cssRules"
					// is accessed on a stylesheet with 404 response code or from a different origin (CORS).
					// Only rethrow if the error is different
					if (e.name !== 'SecurityError' && e.name !== 'InvalidAccessError') {
						throw e;
					}
				}

				// Check for "innerHTML" content
				bInnerHtml = !!(oStyle && oStyle.innerHTML && oStyle.innerHTML.length > 0);

				// One of the previous four checks need to be successful
				var bResult = bNoLinkElement || bSheet || bInnerHtml || bLinkElementFinishedLoading;

				if (bLog) {
					jQuery.sap.log.debug("ThemeCheck: " + sId + ": " + bResult + " (noLinkElement: " + bNoLinkElement + ", sheet: " + bSheet + ", innerHtml: " + bInnerHtml + ", linkElementFinishedLoading: " + bLinkElementFinishedLoading + ")");
				}

				return bResult;

			} catch (e) {
				if (bLog) {
					jQuery.sap.log.error("ThemeCheck: " + sId + ": Error during check styles '" + sId + "'", e);
				}
			}

			return false;
		};

		function clear(oThemeCheck) {
			ThemeCheck.themeLoaded = false;
			if (oThemeCheck._sThemeCheckId) {
				jQuery.sap.clearDelayedCall(oThemeCheck._sThemeCheckId);
				oThemeCheck._sThemeCheckId = null;
				oThemeCheck._iCount = 0;
				oThemeCheck._sFallbackTheme = null;
				oThemeCheck._mThemeFallback = {};
			}
		}

		function checkTheme(oThemeCheck) {
			var mLibs = oThemeCheck._oCore.getLoadedLibraries();
			var sThemeName = oThemeCheck._oCore.getConfiguration().getTheme();
			var sPath = oThemeCheck._oCore._getThemePath("sap.ui.core", sThemeName) + "custom.css";
			var res = true;

			var aFailedLibs = [];

			if (!!oThemeCheck._customCSSAdded && oThemeCheck._themeCheckedForCustom === sThemeName) {
				// include custom style sheet here because it has already been added using jQuery.sap.includeStyleSheet
				// hence, needs to be checked for successful inclusion, too
				mLibs[oThemeCheck._CUSTOMID] = {};
			}

			function checkLib(lib) {
				var sStyleId = "sap-ui-theme-" + lib;
				var currentRes = ThemeCheck.checkStyle(sStyleId, true);
				res = res && currentRes;
				if (res) {

					/* as soon as css has been loaded, look if there is a flag for custom css inclusion inside, but only
					 * if this has not been checked successfully before for the same theme
					 */
					if (oThemeCheck._themeCheckedForCustom != sThemeName) {
						if (checkCustom(oThemeCheck, lib)) {
							// load custom css available at sap/ui/core/themename/custom.css
							var sCustomCssPath = sPath;

							// check for configured query parameters and add them if available
							var sLibCssQueryParams = oThemeCheck._oCore._getLibraryCssQueryParams(mLibs["sap.ui.core"]);
							if (sLibCssQueryParams) {
								sCustomCssPath += sLibCssQueryParams;
							}

							jQuery.sap.includeStyleSheet(sCustomCssPath, oThemeCheck._CUSTOMID);
							oThemeCheck._customCSSAdded = true;
							jQuery.sap.log.warning("ThemeCheck delivered custom CSS needs to be loaded, Theme not yet applied");
							oThemeCheck._themeCheckedForCustom = sThemeName;
							res = false;
							return false;
						} else {
							// remove stylesheet once the particular class is not available (e.g. after theme switch)
							/*check for custom theme was not successful, so we need to make sure there are no custom style sheets attached*/
							var customCssLink = jQuery("LINK[id='" + oThemeCheck._CUSTOMID + "']");
							if (customCssLink.length > 0) {
								customCssLink.remove();
								jQuery.sap.log.debug("Custom CSS removed");
							}
							oThemeCheck._customCSSAdded = false;
						}
					}
				}

				// Collect all libs that failed to load and no fallback has been applied, yet
				if (currentRes && !oThemeCheck._mThemeFallback[lib]) {
					var oStyle = document.getElementById(sStyleId);
					if (oStyle && oStyle.getAttribute("data-sap-ui-ready") === "false") {
						aFailedLibs.push(lib);
					}
				}

			}

			jQuery.each(mLibs, checkLib);

			// Try to load a fallback theme for all libs that couldn't be loaded
			if (aFailedLibs.length > 0) {

				// Only retrieve the fallback theme once per ThemeCheck cycle
				if (!oThemeCheck._sFallbackTheme) {
					oThemeCheck._sFallbackTheme = getFallbackTheme(mLibs);
				}

				if (oThemeCheck._sFallbackTheme) {
					aFailedLibs.forEach(function (lib) {
						var sStyleId = "sap-ui-theme-" + lib;
						var oStyle = document.getElementById(sStyleId);

						jQuery.sap.log.warning(
							"Custom theme '" + sThemeName + "' could not be loaded for library '" + lib + "'. " +
							"Falling back to its base theme '" + oThemeCheck._sFallbackTheme + "'."
						);

						// Change the URL to load the fallback theme
						oThemeCheck._oCore._updateThemeUrl(oStyle, oThemeCheck._sFallbackTheme);

						// remember the lib to prevent doing the fallback multiple times
						// (if the fallback also can't be loaded)
						oThemeCheck._mThemeFallback[lib] = true;
					});

					// Make sure to wait for the fallback themes to be loaded
					res = false;
				}
			}

			if (!res) {
				jQuery.sap.log.warning("ThemeCheck: Theme not yet applied.");
			} else {
				oThemeCheck._themeCheckedForCustom = sThemeName;
			}
			return res;
		}

		function getFallbackTheme(mLibs) {
			function getThemeMetaDataForLibrary(sLibraryName) {
				var sThemeMetaDataClassName = "sapThemeMetaData-UI5-" + sLibraryName.replace(/\./g, "-");

				// Applying the class to the <html> element to be able to get the "background-image"
				var html = document.documentElement;
				html.classList.add(sThemeMetaDataClassName);
				var sDataUri = window.getComputedStyle(html).getPropertyValue("background-image");
				html.classList.remove(sThemeMetaDataClassName);

				var aDataUriMatch = /\(["']?data:text\/plain;utf-8,(.*?)['"]?\)/i.exec(sDataUri);
				if (!aDataUriMatch || aDataUriMatch.length < 2) {
					return null;
				}

				var sMetaData = aDataUriMatch[1];

				// decode only if necessary
				if (sMetaData.charAt(0) !== "{" && sMetaData.charAt(sMetaData.length - 1) !== "}") {
					try {
						sMetaData = decodeURI(sMetaData);
					} catch (ex) {
						// ignore
					}
				}

				// Remove superfluous escaping of double quotes
				sMetaData = sMetaData.replace(/\\"/g, '"');

				// Replace encoded spaces
				sMetaData = sMetaData.replace(/%20/g, " ");

				try {
					return JSON.parse(sMetaData);
				} catch (ex) {
					return null;
				}
			}

			for (var sLibraryName in mLibs) {
				if (mLibs.hasOwnProperty(sLibraryName)) {
					var oThemeMetaData = getThemeMetaDataForLibrary(sLibraryName);
					if (oThemeMetaData && oThemeMetaData.Extends && oThemeMetaData.Extends[0]) {
						// Just return the first match as all libraries extend the same theme.
						return oThemeMetaData.Extends[0];
					}
				}
			}

			return null;
		}

		/* checks if a particular class is available
		 */
		function checkCustom(oThemeCheck, lib) {

			var cssFile = jQuery.sap.domById("sap-ui-theme-" + lib);

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
					jQuery.sap.log.error("Custom check: Error parsing JSON string for custom.css indication.", e);
				}
			}

			//***********************************
			// Fallback legacy customcss check
			//***********************************

			/*
			 * checks if a particular class is available at the beginning of the stylesheet
			*/

			var aRules;

			try {
				if (cssFile.sheet && cssFile.sheet.cssRules) {
					aRules = cssFile.sheet.cssRules;
				}
			} catch (e) {
				// Firefox throws a SecurityError or InvalidAccessError if "cssFile.sheet.cssRules"
				// is accessed on a stylesheet with 404 response code or from a different origin (CORS).
				// Only rethrow if the error is different
				if (e.name !== 'SecurityError' && e.name !== 'InvalidAccessError') {
					throw e;
				}
			}

			if (!aRules || aRules.length == 0) {
				jQuery.sap.log.warning("Custom check: Failed retrieving a CSS rule from stylesheet " + lib);
				return false;
			}

			// we should now have some rule name ==> try to match against custom check
			for (var i = 0; (i < 2 && i < aRules.length); i++) {
				if (oThemeCheck._CUSTOMCSSCHECK.test(aRules[i].selectorText)) {
					return true;
				}
			}

			return false;
		}

		function delayedCheckTheme(bFirst) {
			this._iCount++;

			var bEmergencyExit = this._iCount > maxThemeCheckCycles;

			if (!checkTheme(this) && !bEmergencyExit) {
				// Use dynamic delay to have a fast check for most use cases
				// but not cause too much CPU usage for long running css requests
				var iDelay;
				if (this._iCount <= 100) {
					iDelay = 2; // 1. Initial interval
				} else if (this._iCount <= 110) {
					iDelay = 500; // 2. After 100 cycles
				} else {
					iDelay = 1000; // 3. After another 10 cycles (about 5 seconds)
				}
				this._sThemeCheckId = jQuery.sap.delayedCall(iDelay, this, delayedCheckTheme);
			} else if (!bFirst) {
				clear(this);
				ThemeCheck.themeLoaded = true;
				this._oCore.fireThemeChanged({ theme: this._oCore.getConfiguration().getTheme() });
				if (bEmergencyExit) {
					jQuery.sap.log.warning("ThemeCheck: max. check cycles reached.");
				}
			} else {
				ThemeCheck.themeLoaded = true;
			}
		}


		return ThemeCheck;

	});
