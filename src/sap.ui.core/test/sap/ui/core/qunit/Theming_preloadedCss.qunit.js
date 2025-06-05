/* globals QUnit */
sap.ui.require(["sap/base/Log"], (Log) => {
	"use strict";

	Log.setLevel(Log.Level.DEBUG);

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
					// Depending on CORS settings, we either detect immediately, that the CSS request failed or we need to wait for a second CSS request.
					assert.ok(!oLinkSapM.hasAttribute("data-sap-ui-ready") || oLinkSapM.getAttribute("data-sap-ui-ready") === "true", !oLinkSapM.hasAttribute("data-sap-ui-ready") ? "'data-sap-ui-ready' flag has been removed from link tag." : "'data-sap-ui-ready' is set to false for lib 'sap.failing.lib' since CSS does not exist.");
					assert.ok(!oLinkFailingLib.hasAttribute("data-sap-ui-ready") || oLinkFailingLib.getAttribute("data-sap-ui-ready") === "false", !oLinkFailingLib.hasAttribute("data-sap-ui-ready") ? "'data-sap-ui-ready' flag has been removed from link tag." : "'data-sap-ui-ready' is set to false for lib 'sap.failing.lib' since CSS does not exist.");
				}

				const themeApplied = function() {
					aLinkElements = document.querySelectorAll("link[id^=sap-ui-theme-]");
					assert.strictEqual(aLinkElements.length, 2, "Exact two library CSS link tags found.");

					// we should be able to detach immediately, as a single themeApplied is expected
					ThemeManager._detachThemeApplied(themeApplied);

					// Assert the 'data-sap-ui-ready' attribute is set to 'true', can be delayed (see below)
					const fnAssertDataAttributes = function() {
						assert.strictEqual(oLinkSapM.getAttribute("data-sap-ui-ready"), "true", "'data-sap-ui-ready' with value 'true' has been added again after CSS finished loading.");
						assert.strictEqual(oLinkFailingLib.getAttribute("data-sap-ui-ready"), "false", "'data-sap-ui-ready' with value 'false' has been added again after CSS finished loading.");
						res();
					};

					/**
					 * Note: This is just a strange testing issue that apparently can happen in remote cases only.
					 * In the nightly voters, the test failed because the 'data-sap-ui-ready' attribute was not set to 'true' for the 'sap.m' lib.
					 * I suspect the following nightmare scenario:
					 *    - the CSS file was in fact loaded correctly (the server log does not say otherwise!)
					 *    - the sap-ui-ready attribute was not yet(!) set to "true" from within the async "load" event handler in the ThemeManager
					 *    - the 'themeApplied' event was already fired though, because the "ThemeHelper.checkAndRemoveStyle()" method has a disjunction between multiple checks:
					 *        - "bSheet" chould report true (cssRules available!), even if "bLinkElementFinishedLoading" reports false (data-sap-ui-ready attribute not set yet)
					 *          This seems to happen if the setTimeout from the ThemeHelper is executed before the "load" event handler of the CSS file.
					 *        - The "load" handler is asynchronous, the internally used timeout might be scheduled earlier and then lead to a sync execution of the themeApplied event
					 *          (fire* functions always trigger their listeners sync!)
					 *          This leads to an early execution of the asserts, before the exepected data-sap-ui-ready could be set to "true".
					 */
					if (oLinkSapM.getAttribute("data-sap-ui-ready") !== "true") {
						Log.debug("MutationObserver: Waiting for 'data-sap-ui-ready' to be set to 'true'...");

						const observer = new MutationObserver((mutations) => {
							// still an array even if we filter only for one attribute (see "attributeFilter" in the observer options);
							for (const mu of mutations) {
								if (mu.type === "attributes" && mu.attributeName === "data-sap-ui-ready") {
									const newReadyValue = oLinkSapM.getAttribute("data-sap-ui-ready");
									Log.debug(`MutationObserver: 'data-sap-ui-ready' for 'sap.m' before: ${mu.oldValue} (<null> expected)`);
									Log.debug(`MutationObserver: 'data-sap-ui-ready' for 'sap.m' after : ${newReadyValue} (<true> expected)`);

									// I decided against explicitly checking for "true" before executing the asserts, so that we see all test failures (should be easier to debug)
									fnAssertDataAttributes();
									observer.disconnect();
									res();
								}
							}
						});
						observer.observe(oLinkSapM, { attributes: true, attributeOldValue: true, attributeFilter: ["data-sap-ui-ready"] });
					} else {
						Log.debug("'data-sap-ui-ready' is already available, performing assertions directly.");
						fnAssertDataAttributes();
					}
				};
				if (ThemeManager.themeLoaded) {
					themeApplied();
				} else {
					ThemeManager._attachThemeApplied(themeApplied);
				}
			}, rej);
		});
	});
});
