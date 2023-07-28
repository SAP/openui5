/*!
 * copyright
 */

/* global globalThis */
sap.ui.define([
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Event",
	"sap/base/Eventing",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/deepEqual"
], function(
	assert,
	BaseConfig,
	BaseEvent,
	Eventing,
	Log,
	Localization,
	deepEqual
) {
	"use strict";

	var oWritableConfig = BaseConfig.getWritableInstance();
	var mChanges;
	var oThemeManager;

	/**
	 * Provides theming related API
	 *
	 * @alias module:sap/ui/core/Theming
	 * @namespace
	 * @private
	 * @ui5-restricted sap.ui.core
	 */
	var Theming = {
		/**
		 * Returns the theme name
		 * @return {string} the theme name
		 * @public
		 */
		getTheme: function() {
			// analyze theme parameter
			var sTheme = oWritableConfig.get({
				name: "sapTheme",
				type: oWritableConfig.Type.String,
				defaultValue: oWritableConfig.get({
					name: "sapUiTheme",
					type: oWritableConfig.Type.String,
					external: true
				}),
				external: true
			});

			// empty string is a valid value wrt. the <String> type
			// this is a semantic check if we need to default to a valid theme
			if (sTheme === "") {
				sTheme = "base";
			}

			// It's only possible to provide a themeroot via theme parameter using
			// the initial config provider such as Global-, Bootstrap-, Meta- and
			// URLConfigurationProvider. The themeroot is also only validated against
			// allowedThemeOrigin in this case.
			var iIndex = sTheme.indexOf("@");
			if (iIndex >= 0) {
				var sThemeRoot = validateThemeRoot(sTheme.slice(iIndex + 1));
				sTheme = iIndex > 0 ? sTheme.slice(0, iIndex) : sTheme;
				if (sThemeRoot !== Theming.getThemeRoot(sTheme)) {
					Theming.setThemeRoot(sTheme, sThemeRoot);
				}
			}
			return normalizeTheme(sTheme, Theming.getThemeRoot(sTheme));
		},

		/**
		 * Allows setting the theme name
		 * @param {string} sTheme the theme name
		 * @return {this} <code>this</code> to allow method chaining
		 * @public
		 */
		setTheme: function(sTheme) {
			if (sTheme) {
				if (sTheme.indexOf("@") !== -1) {
					throw new TypeError("Providing a theme root as part of the theme parameter is not allowed.");
				}
				var bFireChange = !mChanges;
				mChanges = mChanges || {};
				var sOldTheme = Theming.getTheme();
				oWritableConfig.set("sapTheme", sTheme);
				var sNewTheme = Theming.getTheme();
				var bThemeChanged = sOldTheme !== sNewTheme;
				if (bThemeChanged) {
					mChanges.theme = {
						"new": sNewTheme,
						"old": sOldTheme
					};
				} else {
					mChanges = undefined;
				}
				if (bFireChange) {
					fireChange(mChanges);
				}
				if (!oThemeManager && bThemeChanged) {
					fireApplied({theme: sNewTheme});
				}
			}
			return this;
		},

		/**
		 * Returns true, if the styles of the current theme are already applied, false otherwise.
		 *
		 * If the styles are not yet applied a theme changed event will follow when the styles will be applied.
		 *
		 * @return {boolean} whether the styles of the current theme are already applied
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		isApplied: function() {
			return !oThemeManager || oThemeManager.themeLoaded;
		},

		/**
		 *
		 * @param {string} sTheme The Theme
		 * @param {string} [sLib] An optional library name
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @returns {string} The themeRoot if configured
		 */
		getThemeRoot: function(sTheme, sLib) {
			var oThemeRoots = oWritableConfig.get({
				name: "sapUiThemeRoots",
				type: oWritableConfig.Type.Object
			});
			var sThemeRoot;

			sTheme = sTheme || Theming.getTheme();

			if (oThemeRoots[sTheme] && typeof oThemeRoots[sTheme] === "string") {
				sThemeRoot = oThemeRoots[sTheme];
			} else if (oThemeRoots[sTheme] && typeof oThemeRoots[sTheme] === "object") {
				sThemeRoot = oThemeRoots[sTheme][sLib] || oThemeRoots[sTheme][""];
			}

			return sThemeRoot;
		},

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
		 * @param {string} sThemeBaseUrl Base URL below which the CSS file(s) will be loaded from
		 * @param {string[]} [aLibraryNames] Optional library names to which the configuration should be restricted
		 * @param {boolean} [bForceUpdate=false] Force updating URLs of currently loaded theme
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		setThemeRoot: function(sThemeName, sThemeBaseUrl, aLibraryNames, bForceUpdate) {
			assert(typeof sThemeName === "string", "sThemeName must be a string");
			assert(typeof sThemeBaseUrl === "string", "sThemeBaseUrl must be a string");

			var bFireChange = !mChanges;
			mChanges = mChanges || {};

			var oThemeRootConfigParam = {
				name: "sapUiThemeRoots",
				type: oWritableConfig.Type.Object
			};

			// Use get twice, for a deep copy of themeRoots object
			// we add a new default "empty object" with each call, so we don't accidentally share it
			var mOldThemeRoots = oWritableConfig.get(Object.assign(oThemeRootConfigParam, {defaultValue: {}}));
			var mNewThemeRoots = oWritableConfig.get(Object.assign(oThemeRootConfigParam, {defaultValue: {}}));

			// normalize parameters
			if (typeof aLibraryNames === "boolean") {
				bForceUpdate = aLibraryNames;
				aLibraryNames = undefined;
			}

			mNewThemeRoots[sThemeName] = mNewThemeRoots[sThemeName] || {};

			// Normalize theme-roots to an object in case it was initially given as a string.
			// We only check newThemeRoots, since both old and new are identical at this point.
			if (typeof mNewThemeRoots[sThemeName] === "string") {
				mNewThemeRoots[sThemeName] = { "": mNewThemeRoots[sThemeName]};
				mOldThemeRoots[sThemeName] = { "": mOldThemeRoots[sThemeName]};
			}

			if (aLibraryNames) {
				// registration of URL for several libraries
				for (var i = 0; i < aLibraryNames.length; i++) {
					var lib = aLibraryNames[i];
					mNewThemeRoots[sThemeName][lib] = sThemeBaseUrl;
				}

			} else {
				// registration of theme default base URL
				mNewThemeRoots[sThemeName][""] = sThemeBaseUrl;
			}
			if (!deepEqual(mOldThemeRoots, mNewThemeRoots)) {
				oWritableConfig.set("sapUiThemeRoots", mNewThemeRoots);
				if (aLibraryNames) {
					mChanges.themeRoots = {
						"new": Object.assign({}, mNewThemeRoots[sThemeName]),
						"old": Object.assign({}, mOldThemeRoots[sThemeName])
					};
				} else {
					mChanges.themeRoots = {
						"new": sThemeBaseUrl,
						"old": mOldThemeRoots[sThemeName] && mOldThemeRoots[sThemeName][""]
					};
				}
				mChanges.themeRoots.forceUpdate = bForceUpdate && sThemeName === Theming.getTheme();
			} else {
				mChanges = undefined;
			}
			if (bFireChange) {
				fireChange();
			}
		},

		/**
		 * Fired after a theme has been applied.
		 *
		 * More precisely, this event is fired when any of the following conditions is met:
		 * <ul>
		 *   <li>the initially configured theme has been applied after core init</li>
		 *   <li>the theme has been changed and is now applied (see {@link #applyTheme})</li>
		 *   <li>a library has been loaded dynamically after core init (e.g. with
		 *       <code>sap.ui.core.Lib.load(...)</code> and the current theme
		 *       has been applied for it</li>
		 * </ul>
		 *
		 * @name sap.ui.core.Theming#applied
		 * @event
		 * @param {module:sap/base/Event} oEvent
		 * @param {sap.ui.base.EventProvider} oEvent.target
		 * @param {string} oEvent.theme Theme name
		 * @public
		 */

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:applied applied} event
		 *
		 * @param {function} fnFunction The function to be called, when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		attachAppliedOnce: function(fnFunction) {
			var sId = "applied";
			if (oThemeManager) {
				Theming.attachEventOnce(sId, fnFunction);
			} else {
				fnFunction.call(Theming, new BaseEvent(sId, Theming, {theme: Theming.getTheme()}));
			}
		},

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:applied applied} event
		 *
		 * @param {function} fnFunction The function to be called, when the event occurs
		 * @public
		 */
		attachApplied: function(fnFunction) {
			var sId = "applied";
			Theming.attachEvent(sId, fnFunction);
			if (!oThemeManager) {
				fnFunction.call(Theming, new BaseEvent(sId, Theming, {theme: Theming.getTheme()}));
			}
		},
		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:applied applied} event
		 *
		 * The passed function must match the one used for event registration.
		 *
		 * @param {function} fnFunction The function to be called, when the event occurs
		 * @public
		 */
		detachApplied: function(fnFunction) {
			Theming.detachEvent("applied", fnFunction);
		},

		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/ui/core/Theming.change
		 * @event
		 * @param {module:sap/base/Event} oEvent
		 * @param {sap.ui.base.EventProvider} oEvent.target
		 * @param {object} oEvent.theme theme object
		 * @param {string} oEvent.theme.new new theme name
		 * @param {string} oEvent.theme.old old theme name
		 * @param {object} oEvent.themeroots themeroots object
		 * @param {object} oEvent.themeroots.new new themeroots
		 * @param {object} oEvent.themeroots.old old themeroots
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function} fnFunction The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 */
		attachChange: function(fnFunction) {
			Theming.attachEvent("change", fnFunction);
		},
		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 */
		detachChange: function(fnFunction) {
			Theming.detachEvent("change", fnFunction);
		},


		/**
		 * Notify content density changes
		 *
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		notifyContentDensityChanged: function() {
			fireApplied({theme: Theming.getTheme()});
		},

		/** Register a ThemeManager instance
		 * @param {sap.ui.core.theming.ThemeManager} oManager The ThemeManager to register.
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		*/
		registerThemeManager: function(oManager) {
			oThemeManager = oManager;
			oThemeManager.attachEvent("ThemeChanged", function(oEvent) {
				fireApplied(BaseEvent.getParameters(oEvent));
			});
			// handle RTL changes
			Localization.attachChange(function(oEvent){
				var bRTL = oEvent.rtl;
				if (bRTL !== undefined) {
					oThemeManager._updateThemeUrls(Theming.getTheme());
				}
			});
		}
	};

	function fireChange() {
		if (mChanges) {
			Theming.fireEvent("change", mChanges);
			mChanges = undefined;
		}
	}

	function fireApplied(oTheme) {
		Theming.fireEvent("applied", oTheme);
	}

	function validateThemeOrigin(sOrigin, bNoProtocol) {
		var sAllowedOrigins = oWritableConfig.get({name: "sapAllowedThemeOrigins", type: oWritableConfig.Type.String});
		return !!sAllowedOrigins && sAllowedOrigins.split(",").some(function(sAllowedOrigin) {
			try {
				sAllowedOrigin = bNoProtocol && !sAllowedOrigin.startsWith("//") ? "//" + sAllowedOrigin : sAllowedOrigin;
				return sAllowedOrigin === "*" || sOrigin === new URL(sAllowedOrigin.trim(), globalThis.location.href).origin;
			} catch (error) {
				Log.error("sapAllowedThemeOrigin provides invalid theme origin: " + sAllowedOrigin);
				return false;
			}
		});
	}

	function validateThemeRoot(sThemeRoot) {
		var bNoProtocol = sThemeRoot.startsWith("//"),
			oThemeRoot,
			sPath;

		try {
			// Remove search query as they are not supported for themeRoots/resourceRoots
			oThemeRoot = new URL(sThemeRoot, globalThis.location.href);
			oThemeRoot.search = "";

			// If the URL is absolute, validate the origin
			if (oThemeRoot.origin && validateThemeOrigin(oThemeRoot.origin, bNoProtocol)) {
				sPath = oThemeRoot.toString();
			} else {
				// For relative URLs or not allowed origins
				// ensure same origin and resolve relative paths based on origin
				oThemeRoot = new URL(oThemeRoot.pathname, globalThis.location.href);
				sPath = oThemeRoot.toString();
			}

			// legacy compatibility: support for "protocol-less" urls (previously handled by URI.js)
			if (bNoProtocol) {
				sPath = sPath.replace(oThemeRoot.protocol, "");
			}
			return sPath + (sPath.endsWith('/') ? '' : '/') + "UI5/";
		} catch (e) {
			// malformed URL are also not accepted
		}
	}

	function normalizeTheme(sTheme, sThemeBaseUrl) {
		if ( sTheme && sThemeBaseUrl == null && sTheme.match(/^sap_corbu$/i) ) {
			return "sap_fiori_3";
		}
		return sTheme;
	}

	Eventing.apply(Theming);
	return Theming;
});