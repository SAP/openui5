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
	"sap/base/i18n/Localization",
	"sap/ui/Device",
	"sap/ui/dom/_ready"
], (
	Log,
	Localization,
	Device,
	_ready
) => {
	"use strict";

	const pLoaded = new Promise((resolve, reject) => {
		sap.ui.require(["sap/ui/core/util/_LocalizationHelper"], (_LocalizationHelper) => {
			_LocalizationHelper.init();
			resolve();
		}, reject);
	});

	/**
	 * Set the document's dir property
	 * @private
	 */
	function _setupContentDirection() {
		const sDir = Localization.getRTL() ? "rtl" : "ltr";
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
		const html = document.documentElement;
		const b = Device.browser;
		let id = b.name;
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
		const html = document.documentElement;
		html.dataset.sapUiOs = Device.os.name + Device.os.versionStr;
		let osCSS = null;
		if (Device.os.name === Device.os.OS.IOS) {
			osCSS = "sap-ios";
		} else if (Device.os.name === Device.os.OS.ANDROID) {
			osCSS = "sap-android";
		}
		if (osCSS) {
			html.classList.add(osCSS);
		}
	}

	// adapt DOM when document is ready
	return {
		run: () => {
			return Promise.all([
				_ready().then(() => {
					_setupContentDirection();
					_setupBrowser();
					_setupOS();
				}),
				pLoaded
			]);
		}
	};
});