/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Core"
], function(Core) {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		return Core.ready(function() {
			var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
			var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

			assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
			assert.ok(JapaneseClass, "The calendar class is loaded");

			var bLibraryPreloadLoaded = !!document.querySelector("head > script[src*='sap/ui/core/library-preload.js']");
			var bCalendarLoaded = !!document.querySelector("head > script[src*='sap/ui/core/date/Japanese.js']");

			// If the Core is loaded and booted the correct calendar class must be loaded.
			assert.ok(bLibraryPreloadLoaded ? !bCalendarLoaded : bCalendarLoaded, "calendar class is loaded within library-preload.js when it exists");
		});
	});

});
