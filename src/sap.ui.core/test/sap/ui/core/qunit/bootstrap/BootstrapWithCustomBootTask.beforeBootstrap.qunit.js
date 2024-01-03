/*global testresults */
(function() {
	"use strict";

	window.testresults = {
		bHookCalled : false,
		bSapUiCoreLoaded : false,
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
		testresults.bIconPoolLoaded = !!sap.ui.require("sap/ui/core/IconPool");

		sap.ui.require([
			"sap/ui/core/Theming"
		], function(Theming) {
			testresults.bHookCalled = true;
			testresults.bSapUiCoreLoaded = !!sap.ui.require("sap/ui/core/Core");
			if ( testresults.bSapUiCoreLoaded ) {
				testresults.sThemeBefore = Theming.getTheme();
				testresults.oLinksBefore = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
				try {
					Theming.setTheme("SapSampleTheme2");
					testresults.oLinksAfter = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
					testresults.sThemeAfter = Theming.getTheme();
					testresults.bApplyThemeFails = false;
				} catch (e) {
					testresults.bApplyThemeFails = true;
				}
			}
			sap.ui.require([
				"sap/ui/core/IconPool"
			], function() {
				callback();
			});
		});
	};
})();