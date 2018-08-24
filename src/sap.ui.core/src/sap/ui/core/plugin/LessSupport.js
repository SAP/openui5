/*!
 * ${copyright}
 */

/**
 * FEATURE TO INCREASE DEVELOPMENT EXPERIENCE! NO PRODUCTIVE USAGE ALLOWED!
 */
(function() {
	"use strict";

	/**
	 * wraps the definition of the LessSupport in order to be able to delay
	 * the definition until the body is loaded and sap.ui.define is available
	 */
	function defineLessSupport() {

		// Provides class sap.ui.core.plugin.LessSupport
		sap.ui.define('sap/ui/core/plugin/LessSupport', [
			'sap/ui/thirdparty/jquery',
			'sap/ui/core/Core',
			'sap/ui/core/ThemeCheck',
			'sap/base/Log',
			'sap/base/util/UriParameters'],
			function(jQuery, Core, ThemeCheck, Log, UriParameters) {

			var LESS_FILENAME = "library.source";
			var CSS_FILENAME = "library";

			/**
			 * Creates an instance of the class <code>sap.ui.core.plugin.LessSupport</code>
			 *
			 * @class Core plugin for the enabling less support for SAPUI5 which can be
			 *        used for development scenarios to avoid the generation of the CSS
			 *        files (increases the dev experience!). This is an experimental
			 *        feature - DO NOT USE IN PRODUCTIVE SCENARIOS!!
			 *
			 * @author Peter Muessig
			 * @version ${version}
			 * @private
			 * @alias sap.ui.core.plugin.LessSupport
			 */
			var LessSupport = function() {
			};

			/**
			 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start.
			 *
			 * @param {sap.ui.core.Core} oCore reference to the Core
			 * @param {boolean} [bOnInit] whether the hook is called during core initialization
			 * @public
			 */
			LessSupport.prototype.startPlugin = function(oCore, bOnInit) {

				Log.info("Starting LessSupport plugin.");
				Log.warning("  NOT FOR PRODUCTIVE USAGE! LessSupport is an experimental feature which might change in future!");

				// get the URI parameters
				var oUriParams = UriParameters.fromQuery(window.location.search);
				var sNoLess = oUriParams.get("sap-ui-xx-noless");
				if (sNoLess) {
					sNoLess = sNoLess.toLowerCase();
				}

				// LessSupport is disabled for the testrunner
				try {
					if (sNoLess !== "false" && (window.top.JsUnit || (window.sap.ui.test && window.sap.ui.test.qunit))) {
						Log.info("  LessSupport has been deactivated for JSUnit Testrunner or QUnit.");
						return;
					}
				} catch (oExp) {
					// In a domain relaxation scenario, it is possible, that the browser prevents access to window.top.*, and a SecurityError is thrown.
					// The Testrunner check fails in this case and we can assume a multi-frame scenario with different document.domain settings.
				}

				// check the URI parameters to disable LessSupport
				if (sNoLess && sNoLess !== "false") {
					Log.info("  LessSupport has been deactivated by URL parameter.");
					return;
				} else {
					Log.info("  LessSupport can be deactivated by adding the following parameter to your URL: \"sap-ui-xx-noless=X\".");
				}

				// configure LESS (development mode + error handling)
				window.less = window.less || {
					env: "development",
					relativeUrls: true,
					errorReporting: function(sMethod, ex, sRootHref) {
						/*eslint-disable no-console */
						if (sMethod === "add" && window.console) {
							window.console.error("Failed to parse: " + sRootHref, ex);
						}
						/*eslint-enable no-console */
					}
				};

				// include LESS
				sap.ui.requireSync("sap/ui/thirdparty/less");

				this.oCore = oCore;
				this.bActive = true;

				// overwrite the includeLibraryTheme/applyTheme function to inject LESS
				this.oCore.includeLibraryTheme = jQuery.proxy(this.includeLibraryTheme, this);
				this.oCore.applyTheme = jQuery.proxy(this.applyTheme, this);

				// update the themes (only when LESS files are newer than the CSS files)
				var that = this, bUseLess = false;
				var aLibs = [];
				jQuery("link[id^=sap-ui-theme-]").each(function() {
					var _bUseLess = that.initLink(this);
					bUseLess = _bUseLess || bUseLess;
					if (_bUseLess){
						aLibs.push(this.id.substr(13)); // length of "sap-ui-theme-"
					}
				});

				// refresh less styles or remove notifier
				this.refreshLess(bUseLess);

				// notify that the theme has been changed!

				var counter = 0;

				function checkThemeApplied(){
					var ok = true;
					var check;
					for (var i = 0; i < aLibs.length; i++) {
						check = ThemeCheck.checkStyle("less:" + aLibs[i], true);
						if (check) {
							jQuery(document.getElementById("sap-ui-theme-" + aLibs[i])).attr("data-sap-ui-ready", "true");
						}
						ok = ok && check;
					}

					counter++;
					if (counter > 100) {
						ok = true;
						Log.warning("LessSupport: Max theme check cycles reached.");
					}

					if (ok) {
						ThemeCheck.themeLoaded = true;
						setTimeout(function () {
							oCore.fireThemeChanged({theme: oCore.sTheme});
						}, 0);
					} else {
						that.iCheckThemeAppliedTimeout = setTimeout(checkThemeApplied, 100);
					}
				}

				if (bUseLess) {
					this.iCheckThemeAppliedTimeout = setTimeout(checkThemeApplied, 100);
				}

			};

			/**
			 * Will be invoked by <code>sap.ui.core.Core</code> to notify the plugin to start
			 * @public
			 */
			LessSupport.prototype.stopPlugin = function() {
				Log.info("Stopping LessSupport plugin.");
				if (this.bActive) {
					// clear delayed call for theme-check
					clearTimeout(this.iCheckThemeAppliedTimeout);
					delete this.iCheckThemeAppliedTimeout;
					// remove the content of the LESS style element
					jQuery("link[id^=sap-ui-theme-]").each(function() {
						var sLibName = this.id.substr(13); // length of "sap-ui-theme-"
						jQuery(document.getElementById("less:" + sLibName)).remove();
					});
					// remove the hooks from the Core
					delete this.oCore.includeLibraryTheme;
					delete this.oCore.applyTheme;
					// release the Core
					this.oCore = null;
				}
			};

			/**
			 * initialize a link element by preparing the LESS style element directly
			 * after the link (to keep the order of the stylesheets how the rules are
			 * finally applied)
			 * @param {LinkElement} oLink ref to a link element
			 * @private
			 */
			LessSupport.prototype.initLink = function(oLink) {

				var bUseLess = this.updateLink(oLink);

				// add the section for the generated CSS code
				jQuery("<style>").
					attr("id", "less:" + oLink.id.substr(13)).
					attr("type", "text/css").
					attr("media", this.media || "screen").
					insertAfter(oLink);

				return bUseLess;

			};

			/**
			 * updates a link element by quering the LESS and CSS file, checking which
			 * one is the latest version and updates the link with the most current
			 * LESS or CSS file.
			 * after the link (to keep the order of the stylesheets how the rules are
			 * finally applied)
			 * @param {LinkElement} oLink ref to a link element
			 * @private
			 */
			LessSupport.prototype.updateLink = function(oLink) {

				// modify style sheet URL to point to the new theme
				// be aware of custom css included with the colon (see includeLibraryTheme) // TODO: what is this??
				var sLibName = oLink.id.substr(13); // length of "sap-ui-theme-"
				var pos;
				if ((pos = sLibName.indexOf("-[")) > 0) { // assumes that "-[" does not occur as part of a library name
					sLibName = sLibName.substr(0, pos);
				}
				var sBaseUrl = this.oCore._getThemePath(sLibName, this.oCore.sTheme);

				// check if the less file of the current theme is more up-to-date than the css file
				// or if the last modified of the less file is 0 (no last modified) we assume that it is newer
				var iLessLastModified = this.getLastModified(sBaseUrl + LESS_FILENAME + ".less");
				var iCssLastModified = this.getLastModified(sBaseUrl + CSS_FILENAME + ".css");
				var bUseLess = (iLessLastModified == 0 && iCssLastModified > 0) || iLessLastModified > iCssLastModified;

				if (!bUseLess) {
					var sBaseThemeUrl = this.oCore._getThemePath(sLibName, "base");

					// also check if the less file of the base theme is more up-to-date than the css file
					// or if the last modified of the less file is 0 (no last modified) we assume that it is newer
					var iBaseLessLastModified = this.getLastModified(sBaseThemeUrl + LESS_FILENAME + ".less");
					var iBaseCssLastModified = this.getLastModified(sBaseThemeUrl + CSS_FILENAME + ".css");
					bUseLess = (iBaseLessLastModified == 0 && iBaseCssLastModified > 0) || iBaseLessLastModified > iBaseCssLastModified;
				}

				var sFileName = (bUseLess) ? LESS_FILENAME : CSS_FILENAME;

				// info log
				Log.debug("LessSupport.updateLink: " + sBaseUrl + sFileName + ": " + (bUseLess ? "LESS" : "CSS"));

				// use the CSS file when the CSS file is newer or equal!
				if (!bUseLess) {
					if (oLink.title) {
						delete oLink.title;
					}
					oLink.rel = "stylesheet";
					oLink.href = sBaseUrl + sFileName + ".css";
					this.unregisterLink(oLink);
					return false;
				}

				// cleanup the local storage cache of less to avoid caching issues
				// INFO: necessary when running in production mode
				/*
				if (window.localStorage) {
					var sHref = oLink.href.replace(/.css$/i, ".less");
					delete window.localStorage[sHref];
					delete window.localStorage[sHref + ":timestamp"];
				}
				*/

				// use the LESS file!
				oLink.title = sLibName;
				// "rel" has to be changed BEFORE "href" to prevent the browser from interpreting the less file
				oLink.rel = "stylesheet/less";
				oLink.href = sBaseUrl + sFileName + ".less";

				this.registerLink(oLink);
				return true;

			};

			/**
			 * retrieves the last modified timestamp of the resource for the given url.
			 * @param {string} sUrl URL to a resource
			 * @return {number} timestamp (0 if no last-modified header is present / -1 if file is not available)
			 * @private
			 */
			LessSupport.prototype.getLastModified = function(sUrl) {

				// HEAD request to retrieve the last modified header
				var iLastModified;
				jQuery.ajax({
					url: sUrl,
					type: "HEAD",
					async: false,
					success : function(data, textStatus, xhr) {
						var sLastModified = xhr.getResponseHeader("Last-Modified");
						iLastModified = sLastModified ? Date.parse(sLastModified) : 0;
					},
					error : function(xhr, textStatus, error) {
						iLastModified = -1;
					}
				});
				// convert the string into a timestamp or return the -1 value
				Log.debug("CSS/LESS head-check: " + sUrl + "; last-modified: " + iLastModified);
				return iLastModified;

			};

			/**
			 * hook into the <code>Core.applyTheme</code> function to update the created
			 * links for the less support
			 * @param {string} sThemeName name of the theme
			 * @param {string} sThemeBaseUrl base URL of the theme
			 * @private
			 */
			LessSupport.prototype.applyTheme = function(sThemeName, sThemeBaseUrl) {
				// execute the default behavior (referenced via global name as the local 'Core' only exposes the public API)
				sap.ui.core.Core.prototype.applyTheme.apply(this.oCore, arguments);
				// update the created links for less support
				var that = this, bUseLess = false;
				jQuery("link[id^=sap-ui-theme-]").each(function() {
					bUseLess = that.updateLink(this) || bUseLess;
				});
				// refresh less styles or remove notifier
				this.refreshLess(bUseLess);
			};

			/**
			 * hook into the <code>Core.includeLibraryTheme</code> function to initialize
			 * the created links for the less support.
			 * @param {string} sLibName name of the library
			 * @private
			 */
			LessSupport.prototype.includeLibraryTheme = function(sLibName) {
				// execute the default behavior (referenced via global name as the local 'Core' only exposes the public API)
				sap.ui.core.Core.prototype.includeLibraryTheme.apply(this.oCore, arguments);
				// initialize the created link for less support
				var that = this, bUseLess = false;
				jQuery("link[id='sap-ui-theme-" + sLibName + "']").each(function() {
					bUseLess = that.initLink(this) || bUseLess;
				});
				// refresh less styles or remove notifier
				this.refreshLess(bUseLess);
			};

			/**
			 * registers a link element in less to be observed when calling refresh()
			 * @param {LinkElement} oLink ref to the link element
			 * @private
			 */
			LessSupport.prototype.registerLink = function(oLink) {
				if (window.less && window.less.sheets) {
					var iIndex = window.less.sheets.indexOf(oLink);
					if (iIndex === -1) {
						window.less.sheets.push(oLink);
					}
				}
			};

			/**
			 * unregisters a link element in less
			 * @param {LinkElement} oLink ref to the link element
			 * @private
			 */
			LessSupport.prototype.unregisterLink = function(oLink) {
				if (window.less && window.less.sheets) {
					var sLibName = oLink.id.substr(13);
					var iIndex = window.less.sheets.indexOf(oLink);
					if (iIndex >= 0) {
						window.less.sheets.splice(iIndex, 1);
						// clear the content of the LESS style element
						jQuery(document.getElementById("less:" + sLibName)).html("");
					}
				}
			};

			/**
			 * refreshes the less files / generates the css and injects it into the
			 * styles section which has been created in the <code>initLink</code>
			 * function.
			 * <br>
			 * additionally it shows or hides a notifier if the less mode is active
			 * @param {boolean} bUseLess flag whether less or css mode
			 * @private
			 */
			LessSupport.prototype.refreshLess = function(bUseLess) {

				// add the less mode indicator
				if (bUseLess) {
					if (!document.getElementById("sap-ui-ide-less-mode")) {
						jQuery("<span>").
						attr("id", "sap-ui-ide-less-mode").
						css("position", "absolute").
						css("right", "10px").
						css("bottom", "10px").
						css("padding", "10px").
						css("border", "3px solid red").
						css("border-radius", "10px").
						css("opacity", "0.75").
						css("color", "black").
						css("background-color", "white").
						css("font-weight", "bold").
						css("z-index", "99999").
						append(
							jQuery("<span>").
							text("LESS MODE").
							css({
								"display": "block",
								"text-align": "center"
							})
						).
						append(
							jQuery("<a>").
							attr("href", "#").
							text("Deactivate").
							attr("title", "Less mode is active. Click to deactivate it (requires page refresh).").
							css({
								"float": "left",
								"clear": "left",
								"font-size": "0.75em",
								"text-decoration": "underline",
								"margin-right": "0.5em"
							}).
							bind("click", function(oEvent) {
								oEvent.preventDefault();
								/*eslint-disable no-alert*/
								if (window.confirm("Deactivating the Less Mode refreshes the page. Do you want to proceed?")) {
									var sSearch = window.location.search;
									window.location.search = (sSearch.charAt(0) === "?" ? (sSearch + "&") : "?") + "sap-ui-xx-noless=true";
								}
								/*eslint-enable no-alert*/
							})
						).
						append(
							jQuery("<a>").
							attr("href", "#").
							text("Hide").
							attr("title", "Less mode is active. Click to hide this information.").
							css({
								"float": "right",
								"font-size": "0.75em",
								"text-decoration": "underline"
							}).
							bind("click", function(oEvent) {
								oEvent.preventDefault();
								jQuery(this).parent().css("display", "none");
							})
						).
						appendTo(window.document.body);
					}
				} else {
					jQuery("#sap-ui-ide-less-mode").remove();
				}

				// do only refresh less if it is loaded and at least one stylesheet was added
				if (window.less && window.less.refresh && window.less.sheets.length > 0) {

					// Keeps the less varables for each library
					var mLibVariables = {};

					// href to library name mapping (perf-opt)
					var mLessHrefToLib = {};

					// fill the href - lib map using less stylesheets
					jQuery(window.less.sheets).each(function() {
						mLessHrefToLib[this.href] = jQuery(this).attr("id").substr(13);
					});

					// Save original function
					var fnLessTreeRuleEval = window.less.tree.Rule.prototype.eval;
					// Override Rule.eval to collect all variable values on-the-fly
					window.less.tree.Rule.prototype.eval = function(env) {
						if (this.variable && typeof this.name === "string" && this.name.indexOf("@_PRIVATE_") !== 0) {
							// this.currentFileInfo.rootFilename is one of the stylesheets in less.sheets
							var sLibName = mLessHrefToLib[this.currentFileInfo.rootFilename]; // get lib name from map
							if (!sLibName) {
								Log.warning("LessSupport: could not find libary (" + this.currentFileInfo.rootFilename + ")");
							}
							var mVariables = mLibVariables[sLibName]; // get library-parameters map
							if (!mVariables) {
								mVariables = mLibVariables[sLibName] = {};
							}
							try {
								mVariables[this.name.substr(1)] = this.value.eval(env).toCSS(env);
							} catch (ex) {
								// causes an exception when variable is not defined. ignore it here, less will take care of it
							}
						}
						return fnLessTreeRuleEval.apply(this, arguments);
					};

					// Run less build
					window.less.refresh();

					// Update Theming Parameters without triggering a library-parameters.json request
					var Parameters = sap.ui.requireSync('sap/ui/core/theming/Parameters');
					Parameters._setOrLoadParameters(mLibVariables);

					// Restore original function
					window.less.tree.Rule.prototype.eval = fnLessTreeRuleEval;
				}

			};

			/**
			 * Create the <code>sap.ui.core.plugin.LessSupport</code> plugin and
			 * register it within the <code>sap.ui.core.Core</code>.
			 */
			var oThis = new LessSupport();
			sap.ui.getCore().registerPlugin(oThis);

			/**
			 * Triggers a less refresh and updates the theming parameters.
			 *
			 * @private
			 */
			LessSupport.refresh = function() {
				oThis.refreshLess(true);
				if (oThis.oCore.oThemeCheck) {
					oThis.oCore.oThemeCheck.fireThemeChangedEvent(false);
				}
			};

			return LessSupport;

		}, /* bExport= */ true);

	}

	// check for "sap.ui.define" being already available
	//  - when available immediately define the LessSupport
	//  - if not we delay the definition till the body is loaded
	if (!(window.sap && window.sap.ui && window.sap.ui.define)) {
		var fnHandler = function() {
			document.removeEventListener("DOMContentLoaded", fnHandler, false);
			defineLessSupport();
		};
		document.addEventListener("DOMContentLoaded", fnHandler, false);
	} else {
		defineLessSupport();
	}

}());
