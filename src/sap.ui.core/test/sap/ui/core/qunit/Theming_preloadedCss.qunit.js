/* globals QUnit */
sap.ui.require([], () => {
	"use strict";

	QUnit.module("Theming - Preloaded CSS");

	QUnit.test("Add preloaded CSS to theming lifecycle", (assert) => {
		assert.expect(5);
		// Simulate a preloaded CSS file here, to ensure it did not
		// finish loading before ThemeManager is loaded
		// Note: It's not supported to dynamically adding library CSS with JS coding
		// bypassing ThemeManager. This can lead to issues detecting the current state
		// of the request e.g. in case of 404.
		const oLink = document.createElement("link");
		oLink.rel = "stylesheet";
		oLink.href = "../../../../../resources/sap/m/themes/sap_horizon/library.css";
		oLink.setAttribute("id", "sap-ui-theme-sap.m");
		oLink.setAttribute("data-sap-ui-ready", "true");
		document.head.appendChild(oLink);

		return new Promise((res, rej) => {
			sap.ui.require([
				"sap/ui/core/theming/ThemeManager"
			], (ThemeManager) => {
				const oLinkSapM = document.getElementById("sap-ui-theme-sap.m");
				const oLinkFailingLib = document.getElementById("sap-ui-theme-sap.failing.lib");
				let aLinkElements = document.querySelectorAll("link[id^=sap-ui-theme-]");

				if (ThemeManager.themeLoaded) {
					assert.strictEqual(oLinkSapM.hasAttribute("data-sap-ui-ready"), "true", "'data-sap-ui-ready' is correct for lib 'sap.m' since theme is already loaded.");
					assert.strictEqual(oLinkFailingLib.getAttribute("data-sap-ui-ready"), "false", "'data-sap-ui-ready' is correct for lib 'sap.failing.lib' since theme is already loaded.");
				} else {
					assert.notOk(oLinkSapM.hasAttribute("data-sap-ui-ready"), "'data-sap-ui-ready' flag has been removed from link tag.");
					// Depending on CORS settings, we either detect immediately, that the CSS request failed or we need to wait for a second CSS request.
					assert.notOk(oLinkFailingLib.hasAttribute("data-sap-ui-ready") || oLinkFailingLib.getAttribute("data-sap-ui-ready") === "false", "'data-sap-ui-ready' flag has been removed from link tag.");
				}

				const themeApplied = function() {
					aLinkElements = document.querySelectorAll("link[id^=sap-ui-theme-]");
					assert.strictEqual(aLinkElements.length, 2, "Exact two library CSS link tags found.");
					assert.strictEqual(oLinkSapM.getAttribute("data-sap-ui-ready"), "true", "'data-sap-ui-ready' with value 'true' has been added again after CSS finished loading.");
					assert.strictEqual(oLinkFailingLib.getAttribute("data-sap-ui-ready"), "false", "'data-sap-ui-ready' with value 'false' has been added again after CSS finished loading.");
					ThemeManager._detachThemeApplied(themeApplied);
					res();
				};
				ThemeManager._attachThemeApplied(themeApplied);
			}, rej);
		});
	});
});
