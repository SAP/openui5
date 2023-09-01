/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Core"
], function(Core) {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		var isResourceLoaded = (sResourcePath) => {
			return window.performance.getEntriesByType("resource").filter( (oResource) => {
				return oResource.name.endsWith(sResourcePath) && oResource.initiatorType === "script" && oResource.responseStatus === 200;
			}).length !== 0;
		};

		return Core.ready(function() {
			var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
			var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

			assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
			assert.ok(JapaneseClass, "The calendar class is loaded");
			var bLibraryPreloadLoaded = isResourceLoaded("sap/ui/core/library-preload.js");
			var bCalendarLoaded = isResourceLoaded("sap/ui/core/date/Japanese.js");

			// If the Core is loaded and booted the correct calendar class must be loaded.
			assert.ok(bLibraryPreloadLoaded !== bCalendarLoaded, "calendar class is loaded within library-preload.js when it exists");
		});
	});

});
