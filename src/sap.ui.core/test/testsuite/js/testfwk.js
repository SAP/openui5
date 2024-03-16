/*!
 * ${copyright}
 */

// Provides helper functions for the testsuite
sap.ui.define([
	"sap/base/util/deepEqual"
], function(deepEqual) {

	"use strict";

	const THEMES = {
		"base": "Base",
		"sap_horizon": "Morning Horizon",
		"sap_horizon_dark": "Evening Horizon",
		"sap_horizon_hcb": "High Contrast Black Horizon",
		"sap_horizon_hcw": "High Contrast White Horizon",
		"sap_fiori_3": "Quartz Light",
		"sap_fiori_3_dark": "Quartz Dark",
		"sap_fiori_3_hcb": "Quartz High Contrast Black",
		"sap_fiori_3_hcw": "Quartz High Contrast White",
		/**
		 * @deprecated As of version 1.120.2
		 */
		"sap_belize": "Belize",
		/**
		 * @deprecated As of version 1.120.2
		 */
		"sap_belize_plus": "Belize Plus",
		/**
		 * @deprecated As of version 1.120.2
		 */
		"sap_belize_hcb": "Belize High Contrast Black",
		/**
		 * @deprecated As of version 1.120.2
		 */
		"sap_belize_hcw": "Belize High Contrast White",
		/**
		 * @deprecated As of version 1.40
		 */
		"sap_bluecrystal": "Blue Crystal",
		/**
		 * @deprecated As of version 1.48
		 */
		"sap_hcb": "High Contrast Black"
	};

	const THEME_NAMES_WITHOUT_BASE = Object.keys(THEMES).filter((name) => name != "base");

	const TestFWK = {

		sLanguage: (window.navigator.languages && window.navigator.languages[0]) || window.navigator.language || window.navigator.userLanguage,
		sTheme: "sap_horizon",
		bContrastMode: false,
		bRTL: false,
		bAccessibilityMode: true,
		oContentWindow: null,
		oThemeConstraints: null,
		sContentURL: null,

		LANGUAGES : {
			"en_US": "English (US)",
			"de": "Deutsch"
		},

		THEMES,

		// the themes supported by each library
		LIBRARY_THEMES: {
			/**
			 * @deprecated As of version 1.120
			 */
			"sap.ui.dev" : {
				"default" : "sap_bluecrystal",
				"supports" : [
					"sap_bluecrystal","sap_hcb"
				]
			},
			"all" : {
				"default" : "sap_horizon",
				"supports": THEME_NAMES_WITHOUT_BASE
			}
		},


		init: function(oContentWindow) {
			this.oContentWindow = oContentWindow;
			this.updateContent();
		},

		getAllowedThemes: function() {
			if (this.oThemeConstraints) {
				var aSupportedThemes = this.oThemeConstraints.supports;
				return aSupportedThemes.reduce(function(result, sThemeName) {
					result[sThemeName] = TestFWK.THEMES[sThemeName];
					return result;
				}, {});
			} else {
				return TestFWK.THEMES;
			}
		},

		getContentURL: function() {
			return this.sContentURL;
		},

		/**
		 * Sets a new URL as content, using the current settings, but considering the given constraints for the theme.
		 * If this causes a theme change, the themeConfigurationChanged event will be fired.
		 *
		 * @private
		 *
		 * @param {string} sURL New content URL
		 * @param {object} [oThemeConstraints] Object with theme constraints
		 * @param {string} [sLibName] Name of the library hat provides the URL
		 */
		setContentURL: function(sURL, oThemeConstraints, sLibName) {
			this.sContentURL = sURL;

			var newTheme = this.getEffectiveTheme(this.sTheme, oThemeConstraints);
			var bSomethingChanged = false;

			if (this.sTheme !== newTheme) {
				this.sTheme = newTheme;
				bSomethingChanged = true;
			}

			if (!deepEqual(oThemeConstraints, this.oThemeConstraints)) {
				this.oThemeConstraints = oThemeConstraints;
				bSomethingChanged = true;
			}

			// update settings ComboBox and selection in this ComboBox
			if (bSomethingChanged) {
				this.fireThemeConfigurationChanged();
			}

			this.updateContent(sLibName);
		},

		/**
		 * Updates the content according to the current settings
		 *
		 * @private
		 *
		 * @param {string} sLibName optional
		 */
		updateContent: function(sLibName) {
			if ( !this.oContentWindow || !this.sContentURL ) {
				return;
			}
			this.fireContentWillChange(sLibName);
			var sURL = this.addSettingsToURL(this.sContentURL, null, true);
			this.oContentWindow.document.location.replace(sURL); // do not create a new history entry for the inner frame (back button should only address top frame)
		},

		getLanguage: function() {
			return this.sLanguage;
		},

		setLanguage: function(sLanguage) {
			if ( this.sLanguage !== sLanguage ) {
				this.sLanguage = sLanguage;
				this.applySettings();
			}
		},

		getTheme: function() {
			return this.sTheme;
		},

		setTheme: function(sTheme) {
			if ( this.sTheme !== sTheme ) {
				this.sTheme = sTheme;
				if ( this.oContentWindow
					 && this.oContentWindow.sap
					 && this.oContentWindow.sap.ui
					 && this.oContentWindow.sap.ui.getCore ) {
					this.oContentWindow.sap.ui.getCore().applyTheme(sTheme);
					return;
				}
				this.applySettings();
			}
		},

		getRTL: function() {
			return this.bRTL;
		},

		setRTL: function(bRTL) {
			if ( this.bRTL !== bRTL ) {
				this.bRTL = bRTL;
				this.applySettings();
			}
		},

		getAccessibilityMode: function() {
			return this.bAccessibilityMode;
		},

		setAccessibilityMode: function(bAccessibilityMode) {
			if ( this.bAccessibilityMode !== bAccessibilityMode ) {
				this.bAccessibilityMode = bAccessibilityMode;
				this.applySettings();
			}
		},

		getContrastMode: function() {
			return this.bContrastMode;
		},

		setContrastMode: function(bContrastMode) {
			if ( this.bContrastMode !== bContrastMode ) {
				var frameDocument = this.oContentWindow.document;
				var frameDocumentBody = frameDocument.querySelector("body");
				if ( frameDocumentBody ) {
					frameDocumentBody.classList.remove("sapContrast");
					frameDocumentBody.classList.remove("sapContrastPlus");
					if (this.sTheme == "sap_belize" && bContrastMode) {
						frameDocumentBody.classList.add("sapContrast");
					} else if (this.sTheme == "sap_belize_plus" && bContrastMode) {
						frameDocumentBody.classList.add("sapContrastPlus");
					}
				}
				this.bContrastMode = bContrastMode;
			}
		},

		/**
		 * Returns the appropriate theme, considering the requested theme and the configuration of allowed themes.
		 * If allowed, the requested theme will be returned, otherwise the default theme will be returned.
		 * If either parameter is null, the other will be returned; if both are null, null will be returned.
		 *
		 * @private
		 * @param {string} sRequestedTheme
		 * @param {object} oThemeConstraints
		 * @returns {string}
		 */
		getEffectiveTheme: function(sRequestedTheme, oThemeConstraints) {
			if (sRequestedTheme) { // let's check whether this theme is okay
				if (oThemeConstraints) {
					for (var i = 0; i < oThemeConstraints.supports.length; i++) {
						if (oThemeConstraints.supports[i] === sRequestedTheme) { // theme is among the allowed ones, so return it
							return sRequestedTheme;
						}
					}
					return oThemeConstraints["default"]; // requested theme is not allowed, return the default one

				} else {
					return sRequestedTheme; // no constraints configuration given, so it's okay to use the requested theme
				}

			} else { // no theme requested: return the default from the configuration, if available
				return oThemeConstraints ? oThemeConstraints["default"] : null;
			}
		},

		applySettings: function() {
			this.updateContent();
		},

		addSettingsToURL: function(sURL, oThemeConstraints, bActualNavigation) {

			if (bActualNavigation) { // this method is called twice on navigation: once to modify the link, once when actual navigation occurs
				var hash = sURL.replace(/\?/g, "_");
				var sUrlToDisplay = top.window.document.location.href.split("#")[0];
				if (sURL.endsWith("testsuite/welcome.html")) { // looks better not to see a hash on the initial page
					top.window.history.replaceState(sURL, null, sUrlToDisplay); // the browser already saves a history state for the initial page
				} else {
					sUrlToDisplay = sUrlToDisplay + "#" + hash;
					top.window.history.pushState(sURL, null, sUrlToDisplay);
				}
			}

			function add(sParam, vValue) {
				if (sURL.indexOf("?") != -1) {
					sURL += "&";
				} else {
					sURL += "?";
				}
				sURL += sParam + "=" + vValue;
			}

			add("sap-ui-debug", true);
			if ( this.sLanguage ) {
				add("sap-ui-language", this.sLanguage);
			}
			var theme = this.getEffectiveTheme(this.sTheme, oThemeConstraints);
			if ( theme ) {
				add("sap-ui-theme", theme);
			}
			if ( this.bRTL ) {
				add("sap-ui-rtl", this.bRTL);
			}
			add("sap-ui-accessibility", this.bAccessibilityMode);

			return sURL;
		},

		onContentLoad: function() {
		//	this.injectDebug();
		},

		//----

		mThemeConfigListeners: [],

		attachThemeConfigurationChanged: function(fnCallback) {
			this.mThemeConfigListeners.push(fnCallback);
		},

		detachThemeConfigurationChanged: function(fnCallback) {
			for (var i = 0; i < this.mThemeConfigListeners.length; ) {
				if ( this.mThemeConfigListeners[i] === fnCallback ) {
					this.mThemeConfigListeners.splice(i,1);
				} else {
					i++;
				}
			}
		},

		fireThemeConfigurationChanged: function() { // this is also called by testframe.html!
			for (var i = 0; i < this.mThemeConfigListeners.length; i++) {
				this.mThemeConfigListeners[i]();
			}
		},

		// ----

		mContentListeners: [],

		attachContentWillChange: function(fnCallback) {
			this.mContentListeners.push(fnCallback);
		},

		detachContentWillChange: function(fnCallback) {
			for (var i = 0; i < this.mContentListeners.length; ) {
				if ( this.mContentListeners[i] === fnCallback ) {
					this.mContentListeners.splice(i,1);
				} else {
					i++;
				}
			}
		},

		fireContentWillChange: function(sLibName) {
			for (var i = 0; i < this.mContentListeners.length; i++) {
				try {
					this.mContentListeners[i](this.getContentURL(), this.getTheme(), sLibName); // sLibName may be null if library is not known
				} catch (ex) {
					// somehow the settings registers twice
					// to prevent errors we catch them!
				}
			}
		}

	};

	if ( !sap.ui.testfwk ) {
		sap.ui.testfwk = {};
	}

	 // export to global
	window.testfwk = sap.ui.testfwk.TestFWK = TestFWK;

	return TestFWK;
});
