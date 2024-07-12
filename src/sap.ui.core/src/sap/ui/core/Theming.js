/*!
 * copyright
 */

sap.ui.define([
	"sap/base/assert",
	"sap/base/config",
	"sap/base/Event",
	"sap/base/Eventing",
	"sap/base/future",
	"sap/base/Log",
	"sap/base/i18n/Localization",
	"sap/base/util/deepEqual",
	"sap/ui/core/theming/ThemeHelper"
], function(
	assert,
	BaseConfig,
	BaseEvent,
	Eventing,
	future,
	Log,
	Localization,
	deepEqual,
	ThemeHelper
) {
	"use strict";

	const oWritableConfig = BaseConfig.getWritableInstance();
	const oEventing = new Eventing();
	let oThemeManager;

	/**
	 * Provides theming related API
	 *
	 * @alias module:sap/ui/core/Theming
	 * @namespace
	 * @public
	 * @since 1.118
	 */
	const Theming = {
		/**
		 * Returns the theme name
		 * @return {string} the theme name
		 * @public
		 * @since 1.118
		 */
		getTheme: () => {
			// analyze theme parameter
			let sTheme = oWritableConfig.get({
				name: "sapTheme",
				type: oWritableConfig.Type.String,
				defaultValue: oWritableConfig.get({
					name: "sapUiTheme",
					type: oWritableConfig.Type.String,
					external: true
				}),
				external: true
			});

			// Empty string is a valid value wrt. the <String> type.
			// An empty string is equivalent to "no theme given" here.
			// We apply the default, but also automatically detect the dark mode.
			if (sTheme === "") {
				const mDefaultThemeInfo = ThemeHelper.getDefaultThemeInfo();
				sTheme = `${mDefaultThemeInfo.DEFAULT_THEME}${mDefaultThemeInfo.DARK_MODE ? "_dark" : ""}`;
			}

			// It's only possible to provide a themeroot via theme parameter using
			// the initial config provider such as Global-, Bootstrap-, Meta- and
			// URLConfigurationProvider. The themeroot is also only validated against
			// allowedThemeOrigin in this case.
			const iIndex = sTheme.indexOf("@");
			if (iIndex >= 0) {
				const sThemeRoot = validateThemeRoot(sTheme.slice(iIndex + 1));
				sTheme = iIndex > 0 ? sTheme.slice(0, iIndex) : sTheme;
				if (sThemeRoot !== Theming.getThemeRoot(sTheme)) {
					Theming.setThemeRoot(sTheme, sThemeRoot);
				}
			}

			// validate theme and fallback to the fixed default, in case the configured theme is not valid
			sTheme = ThemeHelper.validateAndFallbackTheme(sTheme, Theming.getThemeRoot(sTheme));

			return sTheme;
		},

		/**
		 * Allows setting the theme name
		 * @param {string} sTheme the theme name
		 * @public
		 * @since 1.118
		 */
		setTheme: (sTheme) => {
			if (sTheme) {
				if (sTheme.indexOf("@") !== -1) {
					throw new TypeError("Providing a theme root as part of the theme parameter is not allowed.");
				}

				const sOldTheme = Theming.getTheme();
				oWritableConfig.set("sapTheme", sTheme);
				const sNewTheme = Theming.getTheme();
				const bThemeChanged = sOldTheme !== sNewTheme;
				if (bThemeChanged) {
					const mChanges = {
						theme: {
							"new": sNewTheme,
							"old": sOldTheme
						}
					};
					fireChange(mChanges);
				}
				if (!oThemeManager && bThemeChanged) {
					fireApplied({theme: sNewTheme});
				}
			}
		},

		/**
		 *
		 * @param {string} sTheme The Theme
		 * @param {string} [sLib] An optional library name
		 * @returns {string} The themeRoot if configured
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118
		 */
		getThemeRoot: (sTheme, sLib) => {
			const oThemeRoots = oWritableConfig.get({
				name: "sapUiThemeRoots",
				type: oWritableConfig.Type.MergedObject
			});
			let sThemeRoot;

			sTheme ??= Theming.getTheme();

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
		 *   Theming.setThemeRoot("my_theme", "https://mythemeserver.com/allThemes");
		 *   Theming.setTheme("my_theme");
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
		 *   Theming.setThemeRoot("sap_belize", ["my.own.library"], "https://mythemeserver.com/allThemes");
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
		 * <code>Theming.setThemeRoot(...)</code> in order to configure the theme location early enough.
		 *
		 * @param {string} sThemeName Name of the theme for which to configure the location
		 * @param {string} sThemeBaseUrl Base URL below which the CSS file(s) will be loaded from
		 * @param {string[]} [aLibraryNames] Optional library names to which the configuration should be restricted
		 * @param {boolean} [bForceUpdate=false] Force updating URLs of currently loaded theme
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 * @since 1.118
		 */
		setThemeRoot: (sThemeName, sThemeBaseUrl, aLibraryNames, bForceUpdate) => {
			assert(typeof sThemeName === "string", "sThemeName must be a string");
			assert(typeof sThemeBaseUrl === "string", "sThemeBaseUrl must be a string");

			const oThemeRootConfigParam = {
				name: "sapUiThemeRoots",
				type: oWritableConfig.Type.MergedObject
			};

			// Use get twice, for a deep copy of themeRoots object
			// we add a new default "empty object" with each call, so we don't accidentally share it
			const mOldThemeRoots = oWritableConfig.get(Object.assign(oThemeRootConfigParam, {defaultValue: {}}));
			const mNewThemeRoots = oWritableConfig.get(Object.assign(oThemeRootConfigParam, {defaultValue: {}}));

			// normalize parameters
			if (typeof aLibraryNames === "boolean") {
				bForceUpdate = aLibraryNames;
				aLibraryNames = undefined;
			}

			mNewThemeRoots[sThemeName] ??= {};

			// Normalize theme-roots to an object in case it was initially given as a string.
			// We only check newThemeRoots, since both old and new are identical at this point.
			if (typeof mNewThemeRoots[sThemeName] === "string") {
				mNewThemeRoots[sThemeName] = { "": mNewThemeRoots[sThemeName]};
				mOldThemeRoots[sThemeName] = { "": mOldThemeRoots[sThemeName]};
			}

			if (aLibraryNames) {
				// registration of URL for several libraries
				for (let i = 0; i < aLibraryNames.length; i++) {
					const lib = aLibraryNames[i];
					mNewThemeRoots[sThemeName][lib] = sThemeBaseUrl;
				}

			} else {
				// registration of theme default base URL
				mNewThemeRoots[sThemeName][""] = sThemeBaseUrl;
			}
			if (!deepEqual(mOldThemeRoots, mNewThemeRoots)) {
				const mChanges = {};
				oWritableConfig.set("sapUiThemeRoots", mNewThemeRoots);
				if (aLibraryNames) {
					mChanges["themeRoots"] = {
						"new": Object.assign({}, mNewThemeRoots[sThemeName]),
						"old": Object.assign({}, mOldThemeRoots[sThemeName])
					};
				} else {
					mChanges["themeRoots"] = {
						"new": sThemeBaseUrl,
						"old": mOldThemeRoots[sThemeName]?.[""]
					};
				}
				mChanges["themeRoots"].forceUpdate = bForceUpdate && sThemeName === Theming.getTheme();
				fireChange(mChanges);
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
		 * For the event parameters please refer to {@link module:sap/ui/core/Theming$AppliedEvent}.
		 *
		 * @name module:sap/ui/core/Theming.applied
		 * @event
		 * @param {module:sap/ui/core/Theming$AppliedEvent} oEvent
		 * @public
		 * @since 1.118.0
		 */

		/**
		 * The theme applied Event.
		 *
		 * @typedef {object} module:sap/ui/core/Theming$AppliedEvent
		 * @property {string} theme The newly set theme.
		 * @public
		 * @since 1.118.0
		 */

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:applied applied} event
		 *
		 * The given handler is called when the the applied event is fired. If the theme is already applied
		 * the handler will be called immediately.
		 *
		 * @param {function(module:sap/ui/core/Theming$AppliedEvent)} fnFunction The function to be called, when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 * @since 1.118.0
		 */
		attachAppliedOnce: (fnFunction) => {
			const sId = "applied";
			if (oThemeManager) {
				if (oThemeManager.themeLoaded) {
					fnFunction.call(null, new BaseEvent(sId, {theme: Theming.getTheme()}));
				} else {
					oEventing.attachEventOnce(sId, fnFunction);
				}
			} else {
				fnFunction.call(null, new BaseEvent(sId, {theme: Theming.getTheme()}));
			}
		},

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link #event:applied applied} event.
		 *
		 * The given handler is called when the the applied event is fired. If the theme is already applied
		 * the handler will be called immediately. The handler stays attached to the applied event for future
		 * theme changes.
		 *
		 * @param {function(module:sap/ui/core/Theming$AppliedEvent)} fnFunction The function to be called, when the event occurs
		 * @public
		 * @since 1.118.0
		 */
		attachApplied: (fnFunction) => {
			const sId = "applied";
			oEventing.attachEvent(sId, fnFunction);
			if (oThemeManager) {
				if (oThemeManager.themeLoaded) {
					fnFunction.call(null, new BaseEvent(sId, {theme: Theming.getTheme()}));
				}
			} else {
				fnFunction.call(null, new BaseEvent(sId, {theme: Theming.getTheme()}));
			}
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:applied applied} event
		 *
		 * The passed function must match the one used for event registration.
		 *
		 * @param {function(module:sap/ui/core/Theming$AppliedEvent)} fnFunction The function to be called, when the event occurs
		 * @public
		 * @since 1.118.0
		 */
		detachApplied: (fnFunction) => {
			oEventing.detachEvent("applied", fnFunction);
		},

		/**
		 * The <code>change</code> event is fired, when the configuration options are changed.
		 *
		 * @name module:sap/ui/core/Theming.change
		 * @event
		 * @param {module:sap/ui/core/Theming$ChangeEvent} oEvent
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		 */

		/**
		 * The theme applied Event.
		 *
		 * @typedef {object} module:sap/ui/core/Theming$ChangeEvent
		 * @property {Object<string,string>} [theme] Theme object containing the old and the new theme
		 * @property {string} [theme.new] The new theme.
		 * @property {string} [theme.old] The old theme.
		 * @property {Object<string,Object<string,string>|boolean>} [themeRoots] ThemeRoots object containing the old and the new ThemeRoots
		 * @property {object} [themeRoots.new] The new ThemeRoots.
		 * @property {object} [themeRoots.old] The old ThemeRoots.
		 * @property {boolean} [themeRoots.forceUpdate] Whether an update of currently loaded theme URLS should be forced
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:change change} event
		 * of <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function(module:sap/ui/core/Theming$ChangeEvent)} fnFunction The function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		 */
		attachChange: (fnFunction) => {
			oEventing.attachEvent("change", fnFunction);
		},
		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:change change} event of
		 * this <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function(module:sap/ui/core/Theming$ChangeEvent)} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		 */
		detachChange: (fnFunction) => {
			oEventing.detachEvent("change", fnFunction);
		},

		/**
		 * Fired when a scope class has been added or removed on a control/element
		 * by using the custom style class API <code>addStyleClass</code>,
		 * <code>removeStyleClass</code> or <code>toggleStyleClass</code>.
		 *
		 * Scope classes are defined by the library theme parameters coming from the
		 * current theme.
		 *
		 * <b>Note:</b> The event will only be fired after the
		 * <code>sap.ui.core.theming.Parameters</code> module has been loaded.
		 * By default this is not the case.
		 *
		 * @name module:sap/ui/core/Theming.themeScopingChanged
		 * @event
		 * @param {module:sap/ui/core/Theming$ThemeScopingChangedEvent} oEvent
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 * @since 1.118.0
		 */

		/**
		 * The theme scoping change Event.
		 *
		 * @typedef {object} module:sap/ui/core/Theming$ThemeScopingChangedEvent
		 * @property {array} scopes An array containing all changed scopes.
		 * @property {boolean} added Whether the scope was added or removed.
		 * @property {sap.ui.core.Element} element The UI5 element the scope has changed for.
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		 */

		/**
		 * Attaches the <code>fnFunction</code> event handler to the {@link #event:themeScopingChanged change} event
		 * of <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function(module:sap/ui/core/Theming$ThemeScopingChangedEvent)} fnFunction The function to be called when the event occurs
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 * @since 1.118.0
		 */
		attachThemeScopingChanged: (fnFunction) => {
			oEventing.attachEvent("themeScopingChanged", fnFunction);
		},

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link #event:themeScopingChanged change} event of
		 * this <code>sap.ui.core.Theming</code>.
		 *
		 * @param {function(module:sap/ui/core/Theming$ThemeScopingChangedEvent)} fnFunction Function to be called when the event occurs
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 * @since 1.118.0
		 */
		detachThemeScopingChanged: (fnFunction) => {
			oEventing.detachEvent("themeScopingChanged", fnFunction);
		},

		/**
		 * Fire themeScopingChanged event.
		 *
		 * @param {Object<string,array|boolean|sap.ui.core.Element>} mParameters Function to be called when the event occurs
		 * @private
		 * @ui5-restricted SAPUI5 Distribution Layer Libraries
		 * @since 1.118.0
		 */
		fireThemeScopingChanged: (mParameters) => {
			oEventing.fireEvent("themeScopingChanged", mParameters);
		},

		/**
		 * Notify content density changes
		 *
		 * @public
		 * @since 1.118.0
		 */
		notifyContentDensityChanged: () => {
			fireApplied({theme: Theming.getTheme()});
		},

		/** Register a ThemeManager instance
		 * @param {sap.ui.core.theming.ThemeManager} oManager The ThemeManager to register.
		 * @private
		 * @ui5-restricted sap.ui.core.theming.ThemeManager
		 * @since 1.118.0
		*/
		registerThemeManager: (oManager) => {
			oThemeManager = oManager;
			oThemeManager._attachThemeApplied(function(oEvent) {
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

	function fireChange(mChanges) {
		if (mChanges) {
			oEventing.fireEvent("change", mChanges);
		}
	}

	function fireApplied(oTheme) {
		oEventing.fireEvent("applied", oTheme);
	}

	function validateThemeOrigin(sOrigin, bNoProtocol) {
		const sAllowedOrigins = oWritableConfig.get({name: "sapAllowedThemeOrigins", type: oWritableConfig.Type.String});
		return !!sAllowedOrigins?.split(",").some((sAllowedOrigin) => {
			try {
				sAllowedOrigin = bNoProtocol && !sAllowedOrigin.startsWith("//") ? "//" + sAllowedOrigin : sAllowedOrigin;
				return sAllowedOrigin === "*" || sOrigin === new URL(sAllowedOrigin.trim(), window.location.href).origin;
			} catch (error) {
				future.errorThrows("sapAllowedThemeOrigins provides invalid theme origin: " + sAllowedOrigin, {cause: error});
				return false;
			}
		});
	}

	function validateThemeRoot(sThemeRoot) {
		const bNoProtocol = sThemeRoot.startsWith("//");
		let oThemeRoot,
			sPath;

		try {
			// Remove search query as they are not supported for themeRoots/resourceRoots
			oThemeRoot = new URL(sThemeRoot, window.location.href);
			oThemeRoot.search = "";

			// If the URL is absolute, validate the origin
			if (oThemeRoot.origin && validateThemeOrigin(oThemeRoot.origin, bNoProtocol)) {
				sPath = oThemeRoot.toString();
			} else {
				// For relative URLs or not allowed origins
				// ensure same origin and resolve relative paths based on origin
				oThemeRoot = new URL(oThemeRoot.pathname, window.location.href);
				sPath = oThemeRoot.toString();
			}

			// legacy compatibility: support for "protocol-less" urls (previously handled by URI.js)
			if (bNoProtocol) {
				sPath = sPath.replace(oThemeRoot.protocol, "");
			}
			sPath += (sPath.endsWith('/') ? '' : '/') + "UI5/";
		} catch (e) {
			// malformed URL are also not accepted
		}
		return sPath;
	}

	return Theming;
});