/*!
 * ${copyright}
 */

sap.ui.define([
	"sap/ui/core/Core"
], function(
	Core
) {
	"use strict";

	/**
	 * Utility used for changing the themes inside applications.
	 *
	 */
	var ThemePicker = {};

	var CONFIGURATION_APPEARANCE = "appearance",
	APPEARANCE_KEY_LIGHT = "light",
	APPEARANCE_KEY_DARK = "dark",
	APPEARANCE_KEY_HCB = "hcb",
	APPEARANCE_KEY_HCW = "hcw",
	APPEARANCE_KEY_AUTO = "auto",
	APPEARANCE = Object.create(null);

	APPEARANCE[APPEARANCE_KEY_LIGHT] = "sap_horizon";
	APPEARANCE[APPEARANCE_KEY_DARK] = "sap_horizon_dark";
	APPEARANCE[APPEARANCE_KEY_HCB] = "sap_horizon_hcb";
	APPEARANCE[APPEARANCE_KEY_HCW] = "sap_horizon_hcw";
	APPEARANCE[APPEARANCE_KEY_AUTO] = "sap_horizon"; // fallback if window.matchMedia is not supported


	ThemePicker.init = function(oComponent) {
		this.oComponent = oComponent;

		this._oConfigUtil = oComponent.getOwnerComponent().getConfigUtil();
		this._oCookieNames = this._oConfigUtil.COOKIE_NAMES;

		this.bus = Core.getEventBus();

		this._createConfigurationBasedOnURIInput();

		this._bSupportsPrefersColorScheme = !!(window.matchMedia &&
			(window.matchMedia('(prefers-color-scheme: dark)').matches ||
			window.matchMedia('(prefers-color-scheme: light)').matches));

		if (this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1" && this._aConfiguration.length > 0) {
			ThemePicker._applyCookiesConfiguration(this._aConfiguration);
		} else {
			ThemePicker._applyDefaultConfiguration(this._aConfiguration);
		}

	};

	/**
	 * Stores and returns the available themes.
	 * @private
	 */

	ThemePicker._getTheme = function() {
		return APPEARANCE;
	};

	/**
	 * Updates the appearance of the Demo Kit depending of the incoming appearance keyword.
	 * If the keyword is "auto" the appearance will be updated to light or dark depending on the
	 * user's OS settings.
	 * @param {string} sKey the appearance keyword
	 * @private
	 */
	ThemePicker._updateAppearance = function(sKey) {
		var bIsAutoSettingActive = this._bSupportsPrefersColorScheme && sKey === APPEARANCE_KEY_AUTO,
			bIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (bIsAutoSettingActive) {
			this._toggleLightOrDarkAppearance(bIsDark);
			this._attachPrefersColorSchemeChangeListener();
		} else {
			Core.applyTheme(this._getTheme()[sKey]);
		}

		this._sLastKnownAppearanceKey = sKey;

		// I've added this check because there was a mismatch between the selected theme
		// and the theme that was sent as event data when the user had selected the 'Auto' setting.
		if (bIsAutoSettingActive) {
			this.bus.publish("themeChanged", "onThemeChanged", {sThemeActive: APPEARANCE[bIsDark ? APPEARANCE_KEY_DARK : APPEARANCE_KEY_LIGHT]});
		} else {
			this.bus.publish("themeChanged", "onThemeChanged", {sThemeActive: this._getTheme()[sKey]});
		}

		if (this._oConfigUtil.getCookieValue(this._oCookieNames.ALLOW_REQUIRED_COOKIES) === "1") {
			this._oConfigUtil.setCookie(CONFIGURATION_APPEARANCE, sKey);
		}
	};

	/**
	 * Toggles the appearance of the Demo Kit to light or dark depending on the incoming argument.
	 * @param {boolean} bIsDark whether the new appearance should be dark
	 * @private
	 */
	ThemePicker._toggleLightOrDarkAppearance = function (bIsDark) {
		if (bIsDark) {
			// dark mode
			Core.applyTheme(this._getTheme().dark);
		} else {
			// light mode or unsupported prefers-color-scheme
			Core.applyTheme(this._getTheme().light);
		}
	};

	/**
	 * Attaches an event listener to the 'change' event of the prefers-color-scheme media.
	 * Depending on the change and the last known appearance, the appearance of the Demo Kit is changed to light, dark, hcb or hcw.
	 * @private
	 */
	ThemePicker._attachPrefersColorSchemeChangeListener = function() {
		var that = this,
			oQuery,
			toggleAppearance;

		if (!this._bAttachedPrefersColorSchemeChangeListener) {
			oQuery = window.matchMedia('(prefers-color-scheme: dark)');

			toggleAppearance = function(e) {
				if (that._sLastKnownAppearanceKey === APPEARANCE_KEY_AUTO) {
					this._toggleLightOrDarkAppearance(e.matches);
					that.bus.publish("themeChanged", "onThemeChanged", {
						sThemeActive: APPEARANCE[e.matches ? APPEARANCE_KEY_DARK : APPEARANCE_KEY_LIGHT]
					});
				}
			};

			if (oQuery.addEventListener) {
				oQuery.addEventListener('change', toggleAppearance);
			} else { // Safari 13 and older only supports deprecated MediaQueryList.addListener
				oQuery.addListener(toggleAppearance);
			}
			this._bAttachedPrefersColorSchemeChangeListener = true;
		}
	};

	/**
	 * Applies configuration for the application regarding the cookies.
	 * @private
	 */
	ThemePicker._applyCookiesConfiguration = function () {
		var sCookieValue, sConf, i;

		for (i = 0; i < this._aConfiguration.length; i++) {
			sConf = this._aConfiguration[i];
			sCookieValue = this._oConfigUtil.getCookieValue(sConf);

			if (sCookieValue !== "") {
				if (sConf === CONFIGURATION_APPEARANCE) {
					this._updateAppearance(sCookieValue, this.oComponent);
				}

				// If we have available value for the given cookie we remove it from the configuration array.
				this._aConfiguration.splice(i, 1);
				i--;
			}
		}

		// If we still have configurations which are not set by their cookie values, we apply their default values.
		if (this._aConfiguration.length > 0) {
			this._applyDefaultConfiguration();
		}
	};

	/**
	 * Applies configuration for the application regarding the default values.
	 * @private
	 */
	ThemePicker._applyDefaultConfiguration = function () {
		this._aConfiguration.forEach(function(sConf){
		if (sConf === CONFIGURATION_APPEARANCE) {
				this._updateAppearance(APPEARANCE_KEY_AUTO);
			}
		}, this);

	};

	/**
	* Creates configuration for the application regarding the URI input.
	* @private
	*/
	ThemePicker._createConfigurationBasedOnURIInput = function () {
	   var oUriParams = new URLSearchParams(window.location.search);
	   this._aConfiguration = [];

	   if (!(oUriParams.has('sap-ui-theme') || oUriParams.has('sap-theme'))) {
		   this._aConfiguration.push(CONFIGURATION_APPEARANCE);
	   }
   };

	return ThemePicker;

});