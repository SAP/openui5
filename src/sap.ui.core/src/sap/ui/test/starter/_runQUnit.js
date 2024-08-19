/*!
 * ${copyright}
 */
/*
 * IMPORTANT: This is a private module, its API must not be used and is subject to change.
 * Code other than the UI5 core library must not introduce direct dependencies to this module,
 * not even in bundle configurations.
 */
sap.ui.define([
	"sap/ui/test/starter/_utils"
], function(utils) {
	"use strict";
	const oParams = new URLSearchParams(window.location.search),
		sSuiteName = utils.getAttribute('data-sap-ui-testsuite') || oParams.get("testsuite"),
		sTestName = utils.getAttribute('data-sap-ui-test') || oParams.get("test");
	utils.getSuiteConfig(sSuiteName).then(function(oSuiteConfig) {
		const oTestConfig = Object.assign({}, oSuiteConfig.tests[sTestName]);
		const bootManifest = oTestConfig.bootManifest;
		globalThis["sap-ui-config"] = Object.assign({}, globalThis["sap-ui-config"]);
		globalThis["sap-ui-config"].bootManifest = bootManifest || globalThis["sap-ui-config"].bootManifest;

		// first configure the loader if needed
		if (oTestConfig.loader) {
			sap.ui.loader.config(oTestConfig.loader);
		}
	}).then(() => {
		sap.ui.require([
			"sap/ui/core/Core"
		], function() {});
	});
});
