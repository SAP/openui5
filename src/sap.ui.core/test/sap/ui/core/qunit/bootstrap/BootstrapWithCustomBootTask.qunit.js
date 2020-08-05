/*global QUnit, testresults */
sap.ui.define([

], function() {
	"use strict";

	/**
	 * Tests whether basic classes are available that together can be considered the SAPUI5 Core
	 */
	QUnit.test("BasicClassesAvailable", function(assert) {

		assert.ok(testresults.bHookCalled, "boottask should be called");
		assert.ok(testresults.bSapUiCoreExists, "sap.ui.getCore() should exist in the boor task");
		assert.ok(testresults.bApplyThemeExists, "sap.ui.getCore().applyTheme() should exist when the boot task is executed");
		assert.equal(testresults.sThemeBefore, "sap_belize", "theme before applyTheme should be as configured in bootstrap tag");
		assert.ok(!testresults.bApplyThemeFails, "applyTheme should not fail");
		assert.equal(testresults.sThemeAfter, "sap_bluecrystal", "theme should have changed after apply theme");
		assert.equal(testresults.oLinksBefore && testresults.oLinksBefore.length, 0, "there should be no link tags for theme styles when the hook is called");
		assert.equal(testresults.oLinksAfter && testresults.oLinksBefore.length, 0, "there should be no link tags for theme styles after the hook has been called");
		assert.ok(document.querySelectorAll('head > link[id^="sap-ui-theme-"]').length > 0, "there should be some link tags for theme styles after the hook has been called");
		assert.notOk(testresults.bIconPoolLoaded, "IconPool module should not have been loaded on entry into bootTask");
		assert.ok(sap.ui.require("sap/ui/core/IconPool"), "IconPool module should have been loaded by bootTask");

	});

});