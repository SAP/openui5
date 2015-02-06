/*!
 * ${copyright}
 */

// Provides a polyfill for the String.prototype.normalize function for older browsers
sap.ui.define(function() {
	"use strict";
	
	/*global UNorm *///declare unusual global vars for JSLint/SAPUI5 validation

	// apply polyfill if needed and when not in a mobile browser
	if (String.prototype.normalize != undefined || sap.ui.Device.browser.mobile == true) {
		return;
	} else {
		jQuery.sap.require("sap.ui.thirdparty.unorm");
		jQuery.sap.require("sap.ui.thirdparty.unormdata");

		/*eslint-disable no-extend-native */
		String.prototype.normalize = function(str) {
		/*eslint-enable no-extend-native */
			switch (str) {
				case 'NFC':
					return UNorm.nfc(this);
				case 'NFD':
					return UNorm.nfd(this);
				case 'NFKC':
					return UNorm.nfkc(this);
				case 'NFKD':
					return UNorm.nfkd(this);
				default:
					return UNorm.nfc(this);
			}
		};
	}
	return;
}, /* bExport= */false);
