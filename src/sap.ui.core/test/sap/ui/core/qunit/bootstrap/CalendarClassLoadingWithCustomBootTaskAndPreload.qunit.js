/*global QUnit*/
sap.ui.define([

], function() {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
		var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

		assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
		assert.ok(JapaneseClass, "The calendar class is loaded");

		var bLibraryRequestExists = !!document.querySelector("head > script[src*='sap/ui/core/library.js']");
		var bCalendarClassRequestExists = !!document.querySelector("head > script[src*='sap/ui/core/date/Japanese.js']");

		// When a single request is sent for loading sap/ui/core/library.js, it means that the
		// sap/ui/core/library-preload.js doesn't exist or it has empty content. Therefore the existence of the request
		// which loads the calendar class should be the same as the existence of sap/ui/core/library.js. This means that
		// when library-preload.js exists, both of library.js and calendar class should be loaded within the
		// library-preload.js. When library-preload.js doesn't exists, both of them are loaded with single requests.
		assert.ok(bLibraryRequestExists ? bCalendarClassRequestExists : !bCalendarClassRequestExists, "calendar class is loaded within library-preload.js when it exists");
	});

});
