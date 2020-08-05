/*global testresults */
(function() {
	"use strict";

	window.testresults = {
		bHookCalled : false,
		bSapUiCoreExists : false,
		bApplyThemeExists : false,
		bThemeBeforeAsExpected : false,
		bThemeAfterAsExpected : false,
		bApplyThemeFails : true,
		bIconPoolLoaded: false,
		oLinksBefore : null,
		oLinksAfter : null
	};

	window["sap-ui-config"] = window["sap-ui-config"] || {};
	window["sap-ui-config"]["xx-bootTask"] = function(callback) {
		testresults.bHookCalled = true;
		testresults.bSapUiCoreExists = window.sap && sap.ui && typeof sap.ui.getCore === "function";
		if ( testresults.bSapUiCoreExists ) {
			testresults.bApplyThemeExists = typeof sap.ui.getCore().applyTheme === "function";
			testresults.sThemeBefore = sap.ui.getCore().getConfiguration().getTheme();
			testresults.oLinksBefore = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
			try {
				sap.ui.getCore().applyTheme("sap_bluecrystal");
				testresults.oLinksAfter = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
				testresults.sThemeAfter = sap.ui.getCore().getConfiguration().getTheme();
				testresults.bApplyThemeFails = false;
			} catch (e) {
				testresults.bApplyThemeFails = true;
			}
		}

		testresults.bIconPoolLoaded = !!sap.ui.require("sap/ui/core/IconPool");

		sap.ui.require([
			"sap/ui/core/IconPool"
		], function() {
			callback();
		});

	};

}());