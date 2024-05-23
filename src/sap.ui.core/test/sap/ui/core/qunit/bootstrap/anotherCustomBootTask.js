/*!
 * ${copyright}
 */
sap.ui.define([
], (
) => {
	"use strict";
	globalThis.testresults = {
		bHookCalled : false,
		bSapUiCoreLoaded : false,
		bApplyThemeExists : false,
		bThemeBeforeAsExpected : false,
		bThemeAfterAsExpected : false,
		bApplyThemeFails : true,
		bIconPoolLoaded: !!sap.ui.require("sap/ui/core/IconPool"),
		oLinksBefore : null,
		oLinksAfter : null
	};
	const pLoaded = new Promise((res, rej) => {
		sap.ui.require([
			"sap/ui/core/Theming"
		], function(Theming) {
			globalThis.testresults.bHookCalled = true;
			globalThis.testresults.bSapUiCoreLoaded = !!sap.ui.require("sap/ui/core/Core");
			if ( globalThis.testresults.bSapUiCoreLoaded ) {
				globalThis.testresults.sThemeBefore = Theming.getTheme();
				globalThis.testresults.oLinksBefore = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
				try {
					Theming.setTheme("SapSampleTheme2");
					globalThis.testresults.oLinksAfter = document.querySelectorAll('head > link[id^="sap-ui-theme-"]');
					globalThis.testresults.sThemeAfter = Theming.getTheme();
					globalThis.testresults.bApplyThemeFails = false;
				} catch (e) {
					globalThis.testresults.bApplyThemeFails = true;
				}
			}
			sap.ui.require([
				"sap/ui/core/IconPool"
			], function() {
				res();
			});
		}, rej);
	});
	return {
		run: () => {
			return pLoaded;
		}
	};
});
