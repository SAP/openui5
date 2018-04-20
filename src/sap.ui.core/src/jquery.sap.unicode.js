/*!
 * ${copyright}
 */

/**
 * Provides Unicode related functionality. This module is not public, as the feature may only be temporarily and
 * could removed as soon as the thirdparty lib unorm offers a quickcheck for normalization forms.
 *
 * <strong>Note</strong>: This module does not support mobile browsers
 */
sap.ui.define([
	'jquery.sap.global',
	'sap/ui/Device'
], function(jQuery, Device) {
	'use strict';

	var fnIsStringNFC,
		NormalizePolyfill;

	// only use unorm and apply polyfill if needed and when not in a mobile browser
	if (!String.prototype.normalize && !Device.browser.mobile) {
		NormalizePolyfill = sap.ui.requireSync('sap/base/strings/normalize-polyfill');
		NormalizePolyfill.apply();
		fnIsStringNFC = NormalizePolyfill.isStringNFC;
	} else {
		// make use of native functionality or polyfill, if applied
		fnIsStringNFC = function (s) {
			return s.normalize("NFC") === s;
		};
	}

	/**
	 * Checks whether a string should be normalized or not. It evaluates NO and MAYBE entries of the exclusion table
	 * NFC_QC to false. This means it is not a definitive statement, but an indicator for normalization.
	 *
	 * So please be aware that the result may differ in different browsers.
	 *
	 * @param s the string to be checked
	 * @return {boolean} indicating whether s is or maybe NFC
	 * @private
	 * @static
	 */
	jQuery.sap.isStringNFC = fnIsStringNFC;

	return jQuery;

});
