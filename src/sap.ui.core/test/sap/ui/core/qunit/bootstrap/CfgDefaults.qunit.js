/*global QUnit */
(function() {
	"use strict";

	/* activate the following to check the behavior for browsers with obscure language settings
	Object.defineProperty(navigator, "languages", {
		value: [ 'c' ]
	});
	*/

	/*
	 * Note: this is basically a copy of the logic from Configuration.js.
	 * Therefore the test below can't test the correctness of this logic
	 * but only that the defaulting in Configuration.js works as expected.
	 */
	function defaultLocale() {
		function navigatorLanguage() {
			if ( sap.ui.Device.os.android ) {
				// on Android, navigator.language is hardcoded to 'en', so check UserAgent string instead
				var match = navigator.userAgent.match(/\s([a-z]{2}-[a-z]{2})[;)]/i);
				if ( match ) {
					return match[1];
				}
				// okay, we couldn't find a language setting. It might be better to fallback to 'en' instead of having no language
			}
			return navigator.language;
		}

		function convertToLocaleOrNull(sLanguage) {
			try {
				if ( sLanguage && typeof sLanguage === 'string' ) {
					return new sap.ui.core.Locale( sLanguage );
				}
			} catch (e) {
				// ignore
			}
		}

		return convertToLocaleOrNull( (navigator.languages && navigator.languages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage ) || new sap.ui.core.Locale("en");
	}

	function toLower(str) {
		return str == null ? str : String(str).toLowerCase();
	}

	QUnit.module("Configuration Defaults");

	QUnit.test("Settings", function(assert) {
		var oCfg = new sap.ui.core.Configuration();

		// compare values where possible
		assert.equal(oCfg.theme, "base", "theme");
		assert.equal(toLower(oCfg.language), toLower(defaultLocale()), "language");
		assert.equal(oCfg.accessibility, true, "accessibility");
		assert.equal(oCfg.animation, true, "animation");
		assert.equal(oCfg.animationMode, sap.ui.core.Configuration.AnimationMode.full, "animationMode");
		assert.equal(oCfg.getRTL(), false, "rtl");
		assert.equal(oCfg.debug, false, "debug");
		assert.equal(oCfg.noConflict, false, "noConflict");
		assert.equal(oCfg.trace, false, "trace");
		assert.deepEqual(oCfg.modules, [], "modules");
		assert.deepEqual(oCfg.areas, null, "areas");
		assert.equal(oCfg.onInit, undefined, "onInit");
		assert.equal(oCfg.ignoreUrlParams, false, "ignoreUrlParams");
	});

	// in the default case, noConflict must not have been called -> $ is available
	QUnit.test("jQuery and $", function(assert) {
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(window.$, "window.$ is available");
		assert.equal(window.jQuery, window.$, "$ is a synonym for jQuery");
	});

}());