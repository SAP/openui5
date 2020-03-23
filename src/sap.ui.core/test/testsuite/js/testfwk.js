/*!
 * ${copyright}
 */

/* eslint strict: [2, "global"] */
/* exported readCookie, eraseCookie */
/* global jQuery */

"use strict";

// Provides helper functions for the testsuite
jQuery.sap.declare("testsuite.js.testfwk", false);

function setCookie(name, value, days) {
	var expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	}
	document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1, c.length);
		}
		if (c.indexOf(nameEQ) == 0) {
			return c.substring(nameEQ.length, c.length);
		}
	}
	return null;
}

function eraseCookie(name) {
	setCookie(name, "", -1);
}

if ( !window.sap ) {
	sap = {};
}
if ( !sap.ui ) {
	sap.ui = {};
}
if ( !sap.ui.testfwk ) {
	sap.ui.testfwk = {};
}

sap.ui.testfwk.TestFWK = {
	sLanguage: (navigator.languages && navigator.languages[0]) || navigator.language || navigator.userLanguage,
	sTheme: "sap_belize",
	bContrastMode: false,
	bRTL: false,
	bAccessibilityMode: true,
	bSimulateTouch: false

};

sap.ui.testfwk.TestFWK.LANGUAGES = {
	"en_US": "English (US)",
	"de": "Deutsch"
};

sap.ui.testfwk.TestFWK.THEMES = {
	"base": "Base",
	"sap_fiori_3": "Quartz Light",
	"sap_fiori_3_dark": "Quartz Dark",
	"sap_fiori_3_hcb": "Quartz High Contrast Black",
	"sap_fiori_3_hcw": "Quartz High Contrast White",
	"sap_belize": "Belize",
	"sap_belize_plus": "Belize Plus",
	"sap_belize_hcb": "Belize High Contrast Black",
	"sap_belize_hcw": "Belize High Contrast White",
	"sap_bluecrystal": "Blue Crystal",
	"sap_goldreflection": "Gold Reflection",
	"sap_hcb": "High Contrast Black",
	"sap_platinum": "Platinum",
	"sap_ux": "Ux Target Design",
	"edding": "Edding (EXPERIMENTAL!)"
};

// the themes supported by each library
sap.ui.testfwk.TestFWK.LIBRARY_THEMES = {
	"sap.m" : {"default":"sap_fiori_3", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_hcb"]},
	"sap.me" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_hcb"]},
	"sap.service.visualization" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum"]},
	"sap.ui.commons" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum","sap_ux","edding"]},
	"sap.ui.composite" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum","sap_ux","edding"]},
	"sap.ui.dev" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum","sap_ux","edding"]},
	"sap.ui.richtexteditor" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum","sap_ux","edding"]},
	"sap.ui.suite" : {"default":"sap_goldreflection", "supports":["sap_goldreflection","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_hcb","sap_bluecrystal"]},
	"sap.ui.ux3" : {"default":"sap_bluecrystal", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb"]},
	"all" : {"default":"sap_fiori_3", "supports":["sap_bluecrystal","sap_fiori_3","sap_fiori_3_dark","sap_fiori_3_hcb","sap_fiori_3_hcw","sap_belize","sap_belize_plus","sap_belize_hcb","sap_belize_hcw","sap_goldreflection","sap_hcb","sap_platinum","sap_ux","edding"]}
};

sap.ui.testfwk.TestFWK.init = function(oContentWindow) {
	this.oContentWindow = oContentWindow;
	this.oThemeConstraints = null;
	this.updateContent();
};

sap.ui.testfwk.TestFWK.getAllowedThemes = function() {
	if (!this.oThemeConstraints) {
		return this.THEMES;

	} else {
		var result = {};
		var aThemeNames = this.oThemeConstraints.supports, l = aThemeNames.length;
		for (var i = 0; i < l; i++) {
			result[aThemeNames[i]] = this.THEMES[aThemeNames[i]];
		}
		return result;
	}
};

sap.ui.testfwk.TestFWK.getContentURL = function() {
	return this.sContentURL;
};

/**
 * Sets a new URL as content, using the current settings, but considering the given constraints for the theme.
 * If this causes a theme change, the themeConfigurationChanged event will be fired.
 *
 * @private
 *
 * @param sURL
 * @param {object} [oThemeConstraints]
 * @param {string} [sLibName]
 * @returns {sap.ui.testfwk.TestFWK.setContentURL}
 */
sap.ui.testfwk.TestFWK.setContentURL = function(sURL, oThemeConstraints, sLibName) {
	this.sContentURL = sURL;

	var newTheme = this.getEffectiveTheme(this.sTheme, oThemeConstraints);
	var bSomethingChanged = false;

	if (this.sTheme !== newTheme) {
		this.sTheme = newTheme;
		bSomethingChanged = true;
	}

	if (!jQuery.sap.equal(oThemeConstraints, this.oThemeConstraints)) {
		this.oThemeConstraints = oThemeConstraints;
		bSomethingChanged = true;
	}

	// update settings ComboBox and selection in this ComboBox
	if (bSomethingChanged) {
		this.fireThemeConfigurationChanged();
	}

	this.updateContent(sLibName);
};

/**
 * Updates the content according to the current settings
 *
 * @private
 *
 * @param {string} sLibName optional
 */
sap.ui.testfwk.TestFWK.updateContent = function(sLibName) {
	if ( !this.oContentWindow || !this.sContentURL ) {
		return;
	}
	this.fireContentWillChange(sLibName);
	var sURL = this.addSettingsToURL(this.sContentURL, null, true);
	this.oContentWindow.document.location.replace(sURL); // do not create a new history entry for the inner frame (back button should only address top frame)
};

sap.ui.testfwk.TestFWK.getLanguage = function() {
	return this.sLanguage;
};

sap.ui.testfwk.TestFWK.setLanguage = function(sLanguage) {
	if ( this.sLanguage !== sLanguage ) {
		this.sLanguage = sLanguage;
		this.applySettings();
	}
};

sap.ui.testfwk.TestFWK.getTheme = function() {
	return this.sTheme;
};

sap.ui.testfwk.TestFWK.setTheme = function(sTheme) {
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
};

sap.ui.testfwk.TestFWK.getRTL = function() {
	return this.bRTL;
};

sap.ui.testfwk.TestFWK.setRTL = function(bRTL) {
	if ( this.bRTL !== bRTL ) {
		this.bRTL = bRTL;
		this.applySettings();
	}
};

sap.ui.testfwk.TestFWK.getAccessibilityMode = function() {
	return this.bAccessibilityMode;
};

sap.ui.testfwk.TestFWK.setAccessibilityMode = function(bAccessibilityMode) {
	if ( this.bAccessibilityMode !== bAccessibilityMode ) {
		this.bAccessibilityMode = bAccessibilityMode;
		this.applySettings();
	}
};

sap.ui.testfwk.TestFWK.getSimulateTouch = function() {
	return this.bSimulateTouch;
};

sap.ui.testfwk.TestFWK.setSimulateTouch = function(bSimulateTouch) {
	if ( this.bSimulateTouch !== bSimulateTouch ) {
		this.bSimulateTouch = bSimulateTouch;
		this.applySettings();
	}
};

sap.ui.testfwk.TestFWK.getContrastMode = function() {
	return this.bContrastMode;
};

sap.ui.testfwk.TestFWK.setContrastMode = function(bContrastMode) {
	if ( this.bContrastMode !== bContrastMode ) {
		var frameDocument = jQuery('frame[name="sap-ui-ContentWindow"]');
		var frameDocumentBody = frameDocument.contents().find("body");
		frameDocumentBody.removeClass("sapContrast");
		frameDocumentBody.removeClass("sapContrastPlus");
		if (this.sTheme == "sap_belize" && bContrastMode) {
			frameDocumentBody.addClass("sapContrast");
		} else if (this.sTheme == "sap_belize_plus" && bContrastMode) {
			frameDocumentBody.addClass("sapContrastPlus");
		}
		this.bContrastMode = bContrastMode;
	}
};

/**
 * Returns the appropriate theme, considering the requested theme and the configuration of allowed themes.
 * If allowed, the requested theme will be returned, otherwise the default theme will be returned.
 * If either parameter is null, the other will be returned; if both are null, null will be returned.
 *
 * @private
 * @param {string} sRequestedTheme
 * @param {object} oThemeConstraints
 * @returns
 */
sap.ui.testfwk.TestFWK.getEffectiveTheme = function(sRequestedTheme, oThemeConstraints) {
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
};

sap.ui.testfwk.TestFWK.applySettings = function() {
	this.fireSettingsChanged();
	this.updateContent();
};

sap.ui.testfwk.TestFWK.addSettingsToURL = function(sURL, oThemeConstraints, bActualNavigation) {

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
	if ( this.bSimulateTouch ) {
		add("sap-ui-xx-test-mobile", this.bSimulateTouch);
	}
	add("sap-ui-accessibility", this.bAccessibilityMode);

	return sURL;
};

sap.ui.testfwk.TestFWK.onContentLoad = function() {
//	this.injectDebug();
};

//// if not present, adds the debug.js script to the content page and initializes the debug mode in core
//sap.ui.testfwk.TestFWK.injectDebug = function() {
//
//	if ( !this.oContentWindow )
//		return;
//
//	var oContentWindow = this.oContentWindow;
//
//	// the following check relies on the fact that injectDebug() is called earliest in the onload event handler
//	var bDebugExists = oContentWindow.sap && oContentWindow.sap.ui && oContentWindow.sap.ui.debug && oContentWindow.sap.ui.debug.DebugEnv;
//	/* alternatively, the following code could be used
//	var allScripts = contentDocument.getElementsByTagName("script");
//	var bDebugExists = false;
//	for (var i = 0; i < allScripts.length; i++) {
//		var oneScript = allScripts[i];
//		if (oneScript.getAttribute("src") && (oneScript.getAttribute("src").indexOf("/debug.js") > -1)) {
//			bDebugExists = true;
//			break;
//		}
//	}*/
//
//	if (!bDebugExists && oContentWindow.document &&
//			oContentWindow.jQuery && oContentWindow.jQuery.sap &&
//			oContentWindow.jQuery.sap.getModulePath ) {
//		var scriptTag = oContentWindow.document.createElement("script");
//		scriptTag.setAttribute("type", "text/javascript");
//		var sDebugJsUrl = oContentWindow.jQuery.sap.getModulePath("", "/") + "sap-ui-debug.js";//normalizeResourceUrl(contentDocument.location.href, "sap.ui.core/js/debug.js");
//		scriptTag.setAttribute("src", sDebugJsUrl);
//		oContentWindow.document.getElementsByTagName("head")[0].appendChild(scriptTag);
//	}
//};


// ----

sap.ui.testfwk.TestFWK.mSettingsListeners = [];

sap.ui.testfwk.TestFWK.attachSettingsChanged = function(fnCallback) {
	this.mSettingsListeners.push(fnCallback);
};

sap.ui.testfwk.TestFWK.detachSettingsChanged = function(fnCallback) {
	for (var i = 0; i < this.mSettingsListeners.length; ) {
		if ( this.mSettingsListeners[i] === fnCallback ) {
			this.mSettingsListeners.splice(i,1);
		} else {
			i++;
		}
	}
};

sap.ui.testfwk.TestFWK.fireSettingsChanged = function() {
	for (var i = 0; i < this.mSettingsListeners.length; i++) {
		this.mSettingsListeners[i]();
	}
};

//----

sap.ui.testfwk.TestFWK.mThemeConfigListeners = [];

sap.ui.testfwk.TestFWK.attachThemeConfigurationChanged = function(fnCallback) {
	this.mThemeConfigListeners.push(fnCallback);
};

sap.ui.testfwk.TestFWK.detachThemeConfigurationChanged = function(fnCallback) {
	for (var i = 0; i < this.mThemeConfigListeners.length; ) {
		if ( this.mThemeConfigListeners[i] === fnCallback ) {
			this.mThemeConfigListeners.splice(i,1);
		} else {
			i++;
		}
	}
};

sap.ui.testfwk.TestFWK.fireThemeConfigurationChanged = function() { // this is also called by testframe.html!
	for (var i = 0; i < this.mThemeConfigListeners.length; i++) {
		this.mThemeConfigListeners[i]();
	}
};

// ----

sap.ui.testfwk.TestFWK.mContentListeners = [];

sap.ui.testfwk.TestFWK.attachContentWillChange = function(fnCallback) {
	this.mContentListeners.push(fnCallback);
};

sap.ui.testfwk.TestFWK.detachContentWillChange = function(fnCallback) {
	for (var i = 0; i < this.mContentListeners.length; ) {
		if ( this.mContentListeners[i] === fnCallback ) {
			this.mContentListeners.splice(i,1);
		} else {
			i++;
		}
	}
};

sap.ui.testfwk.TestFWK.fireContentWillChange = function(sLibName) {
	for (var i = 0; i < this.mContentListeners.length; i++) {
		try {
			this.mContentListeners[i](this.getContentURL(), this.getTheme(), sLibName); // sLibName may be null if library is not known
		} catch (ex) {
			// somehow the settings registers twice
			// to prevent errors we catch them!
		}
	}
};

/*
 * layout
 * libraries=[...]
 * customTests=[string,...]
 * customThemes[string,...]
 * selectedTheme:string
 * trace toolbar expanded
 * trace selected tab
 * traceFilter
 * traceLevel
 * selected test case
 */
