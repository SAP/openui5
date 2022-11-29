/*global QUnit */
sap.ui.define([
	"sap/ui/core/Configuration",
	"sap/ui/core/Locale",
	"sap/ui/Device"
], function(Configuration, Locale, Device) {
	"use strict";

	/*
	 * Note: this is basically a copy of the logic from Configuration.js.
	 * Therefore the test below can't test the correctness of this logic
	 * but only that the defaulting in Configuration.js works as expected.
	 */
	function defaultLocale() {
		function navigatorLanguage() {
			if ( Device.os.android ) {
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
					return new Locale( sLanguage );
				}
			} catch (e) {
				// ignore
			}
		}

		return convertToLocaleOrNull( (navigator.languages && navigator.languages[0]) || navigatorLanguage() || navigator.userLanguage || navigator.browserLanguage ) || new Locale("en");
	}

	function toLower(str) {
		return str == null ? str : String(str).toLowerCase();
	}

	QUnit.module("Configuration Defaults");

	QUnit.test("Settings", function(assert) {
		// compare values where possible
		assert.equal(Configuration.getTheme(), "base", "theme");
		assert.equal(toLower(Configuration.getLanguage()), toLower(defaultLocale()), "language");
		assert.equal(Configuration.getAccessibility(), true, "accessibility");
		assert.equal(Configuration.getAnimationMode(), Configuration.AnimationMode.full, "animationMode");
		assert.equal(Configuration.getRTL(), false, "rtl");
		assert.equal(Configuration.getDebug(), false, "debug");
		assert.equal(Configuration.getValue("noConflict"), false, "noConflict");
		assert.equal(Configuration.getTrace(), false, "trace");
		assert.deepEqual(Configuration.getValue("modules"), [], "modules");
		assert.deepEqual(Configuration.getValue("areas"), null, "areas");
		assert.equal(Configuration.getValue("onInit"), undefined, "onInit");
		assert.equal(Configuration.getValue("ignoreUrlParams"), false, "ignoreUrlParams");
	});

	// in the default case, noConflict must not have been called -> $ is available
	QUnit.test("jQuery and $", function(assert) {
		assert.ok(window.jQuery, "window.jQuery is available");
		assert.ok(window.$, "window.$ is available");
		assert.equal(window.jQuery, window.$, "$ is a synonym for jQuery");
	});

});