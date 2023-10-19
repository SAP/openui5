/*global QUnit*/
sap.ui.define([
	"sap/ui/core/Core"
], function(Core) {
	"use strict";

	QUnit.test("Calendar Class Loading", function(assert) {
		var isScriptIncluded = (sResourcePath) => {
			return [...document.scripts].filter((oScript) => {
				return oScript.src.endsWith(sResourcePath);
			}).length !== 0;
		};

		const isLoaded = (sResourcePath) => {
			const state = sap.ui.loader._.getModuleState(sResourcePath);
			return state === 4;
		};

		return Core.ready(function() {
			var GregorianClass = sap.ui.require("sap/ui/core/date/Gregorian");
			var JapaneseClass = sap.ui.require("sap/ui/core/date/Japanese");

			assert.notOk(GregorianClass, "The calendar class shouldn't be loaded");
			assert.ok(JapaneseClass, "The calendar class is loaded");

			const japaneseCalendarIsIncludedAsSingleRequest = isScriptIncluded("sap/ui/core/date/Japanese.js");
			const coreLibraryPreloadIsLoaded = isLoaded("sap/ui/core/library-preload.js");

			if (coreLibraryPreloadIsLoaded) {
				assert.notOk(japaneseCalendarIsIncludedAsSingleRequest, "calendar class is not loaded when library-preload.js exists");
			} else {
				assert.ok(japaneseCalendarIsIncludedAsSingleRequest, "calendar class is loaded standalone");
			}

		});
	});

});
