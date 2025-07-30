/* globals QUnit */
/* ui5lint-disable prefer-test-starter -- test scenario needs to control the bootstrap */
sap.ui.require([], () => {
	"use strict";

	QUnit.module("Theming - Preloaded CSS");

	QUnit.test("Add preloaded CSS to theming lifecycle", (assert) => {
		assert.expect(6);
		// Simulate a preloaded CSS file here, to ensure it did not
		// finish loading before ThemeManager is loaded
		// Note: It's not supported to dynamically adding library CSS with JS coding
		// bypassing ThemeManager. This can lead to issues detecting the current state
		// of the request e.g. in case of 404.
		const oLink = document.createElement("link");
		oLink.rel = "stylesheet";
		oLink.href = "../../../../../resources/sap/m/themes/sap_horizon/library.css";
		oLink.setAttribute("id", "sap-ui-theme-sap.m");
		document.head.appendChild(oLink);

		return new Promise((res, rej) => {
			sap.ui.require([
				/**
				 * To ensure preload detection works correctly, you must either load the ThemeManager directly
				 * or import a module that depends on ThemeManager. This guarantees that preloaded CSS files
				 * are properly registered and handled by the theming lifecycle.
				 */
				"sap/ui/core/theming/Parameters"
			], (Parameters) => {
				const themeApplied = (sParam) => {
					const aLinkElements = document.querySelectorAll("link[id^=sap-ui-theme-]");

					assert.strictEqual(aLinkElements.length, 2, "There should be two link elements for library 'sap.failing.lib' and 'sap.m'");
					assert.strictEqual(aLinkElements[0].getAttribute("id"), "sap-ui-theme-sap.failing.lib", "First link element should be for 'sap.failing.lib' since it was added first as part of the HTML page.");
					assert.ok((aLinkElements[0].sheet.href === aLinkElements[0].href), "There should be at least a 'sheet'property available for HTMLLinkElement of 'sap.failing.lib' to indicate, that the CSS request finished loading (should be 'null' in case the request is still pending).");
					assert.strictEqual(aLinkElements[1].getAttribute("id"), "sap-ui-theme-sap.m", "Second link element should be for 'sap.m' since it was added later as part of the test setup.");
					assert.ok((aLinkElements[1].sheet.href === aLinkElements[1].href && aLinkElements[1].sheet.cssRules.length > 0), "CSS for 'sap.m' should finished loading with CSS rules since the request was successful.");
					assert.strictEqual(sParam, "decline", "The requested param should have the expected value.");
					res();
				};
				const sParam = Parameters.get({
					name: "_sap_m_ListItemBase_DeleteIcon",
					callback: themeApplied
				});
				if (sParam) {
					themeApplied(sParam);
				}
			}, rej);
		});
	});
});
