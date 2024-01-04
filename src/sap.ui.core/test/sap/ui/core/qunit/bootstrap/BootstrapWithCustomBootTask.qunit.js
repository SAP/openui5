/*global QUnit, testresults */
sap.ui.define([
	"sap/ui/core/Theming"
], function(Theming) {
	"use strict";

	/**
	 * Tests whether basic classes are available that together can be considered the SAPUI5 Core
	 */
	QUnit.test("BasicClassesAvailable", function(assert) {
		var done = assert.async();
		var checkBootstrap = function () {
			assert.ok(testresults.bHookCalled, "boottask should be called");
			assert.ok(testresults.bSapUiCoreLoaded, "sap/ui/core/Core should be loaded in the boot task");
			assert.equal(testresults.sThemeBefore, "SapSampleTheme1", "theme before applyTheme should be as configured");
			assert.equal(testresults.sThemeAfter, "SapSampleTheme2", "theme should have changed after apply theme");
			assert.equal(testresults.oLinksBefore && testresults.oLinksBefore.length, 0, "there should be no link tags for theme styles when the hook is called");
			assert.equal(testresults.oLinksAfter && testresults.oLinksAfter.length, 0, "there should be no link tags for theme styles after the hook has been called");
			assert.ok(document.querySelectorAll('head > link[id^="sap-ui-theme-"]').length > 0, "there should be some link tags for theme styles after the hook has been called");
			assert.notOk(testresults.bIconPoolLoaded, "IconPool module should not have been loaded on entry into bootTask");
			assert.ok(sap.ui.require("sap/ui/core/IconPool"), "IconPool module should have been loaded by bootTask");

			Theming.detachApplied(checkBootstrap);
			done();
		};

		Theming.attachApplied(checkBootstrap);

	});

});