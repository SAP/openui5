/* globals QUnit */
/* ui5lint-disable prefer-test-starter -- test scenario needs to control the bootstrap */
sap.ui.require([], () => {
	"use strict";

	QUnit.module("Theming - Preloaded CSS");

	QUnit.test("Add preloaded CSS to theming lifecycle", (assert) => {
		assert.expect(4);
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
				"sap/ui/core/Theming"
			], (Theming) => {
				const themeApplied = () => {
					const aLinkElements = document.querySelectorAll("link[id^=sap-ui-theme-]");
					const filterResourceTimings = (resourceTiming) => resourceTiming.initiatorType === "link" && (resourceTiming.name === aLinkElements[0].href || resourceTiming.name === aLinkElements[1].href);
					const checkResourceTimings = (resourceTiming) => resourceTiming.responseStatus === 0 && resourceTiming.name === aLinkElements[0].href || resourceTiming.responseStatus === 200 && resourceTiming.name === aLinkElements[1].href;
					const aResourceTimings = performance.getEntriesByType("resource").filter(filterResourceTimings);

					assert.strictEqual(aLinkElements.length, 2, "There should be two link elements for library 'sap.failing.lib' and 'sap.m'");
					assert.strictEqual(aLinkElements[0].getAttribute("id"), "sap-ui-theme-sap.failing.lib", "First link element should be for 'sap.failing.lib' since it was added first as part of the HTML page.");
					assert.strictEqual(aLinkElements[1].getAttribute("id"), "sap-ui-theme-sap.m", "Second link element should be for 'sap.m' since it was added later as part of the test setup.");
					assert.ok(aResourceTimings.every(checkResourceTimings), "There should be requests for each library CSS. The requests for 'sap.failing.lib' should all fail, the request for 'sap.m' should succeed.");
					res();
				};
				Theming.attachAppliedOnce(themeApplied);
			}, rej);
		});
	});
});
