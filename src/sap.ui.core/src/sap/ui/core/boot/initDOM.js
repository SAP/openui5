/*!
 * ${copyright}
 */

/**
 * init DOM
 *
 * @private
 * @ui5-restricted sap.ui.core
 */
sap.ui.define([
	"sap/base/Log",
	'sap/ui/Device',
	"sap/base/i18n/Localization",
	"sap/ui/dom/_ready"
], function(
	Log,
	Device,
	Localization,
	_ready
) {
	"use strict";

	/**
	 * Set the document's dir property
	 * @private
	 */
	function _setupContentDirection() {
		var sDir = Localization.getRTL() ? "rtl" : "ltr";
		document.documentElement.setAttribute("dir", sDir); // webkit does not allow setting document.dir before the body exists
		Log.info("Content direction set to '" + sDir + "'", null, "sap.ui.core.boot");
	}
	/**
	 * Set the body's browser-related attributes.
	 * @private
	 */
	function _setupBrowser() {
		//set the browser for CSS attribute selectors. do not move this to the onload function because Safari does not
		//use the classes
		var html = document.documentElement;
		var b = Device.browser;
		var id = b.name;
		if (id) {
			if (id === b.BROWSER.SAFARI && b.mobile) {
				id = "m" + id;
			}
			id = id + (b.version === -1 ? "" : Math.floor(b.version));
			html.dataset.sapUiBrowser = id;
			Log.debug("Browser-Id: " + id, null, "sap.ui.core.boot");
		}
	}
	/**
	 * Set the body's OS-related attribute and CSS class
	 * @private
	 */
	function _setupOS() {
		var html = document.documentElement;
		html.dataset.sapUiOs = Device.os.name + Device.os.versionStr;
		var osCSS = null;
		if (Device.os.name === Device.os.OS.IOS) {
			osCSS = "sap-ios";
		} else if (Device.os.name === Device.os.OS.ANDROID) {
			osCSS = "sap-android";
		}
		if (osCSS) {
			html.classList.add(osCSS);
		}
	}
	/**
	 * Paint splash
	 * @param {sap.ui.core.boot} boot The boot facade
	 * @private
	 */
	function _splash(boot) {
		var splash = document.createElement("div");
        splash.textContent = "bootstrapping UI5...";
        splash.style.color = "transparent";
        document.body.append(splash);
		boot.ready().then(function() {
			document.body.removeChild(splash);
		});
	}
	// adapt DOM when ready
	return {
		run: function(boot) {
			return _ready().then(function() {
				_setupContentDirection();
				_setupBrowser();
				_setupOS();
				_splash(boot);
			});
		}
	};
});