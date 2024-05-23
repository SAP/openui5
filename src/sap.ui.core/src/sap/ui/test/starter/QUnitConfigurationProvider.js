
/*!
 * ${copyright}
 */
sap.ui.define([
	"sap/base/config/camelize",
	"sap/ui/test/starter/_utils"
], (camelize, utils) => {
	"use strict";
	const oConfig = Object.create(null);
	const rAlias = /^(sapUiXx|sapUi|sap)((?:[A-Z0-9][a-z]*)+)$/; //for getter
	const oParams = new URLSearchParams(window.location.search),
	sSuiteName = utils.getAttribute('data-sap-ui-testsuite') || oParams.get("testsuite"),
	sTestName = utils.getAttribute('data-sap-ui-test') || oParams.get("test");
	const pLoaded = utils.getSuiteConfig(sSuiteName).then(function(oSuiteConfig) {
		const mOriginalTestParams = {};
		const oTestConfig = Object.assign({}, oSuiteConfig.tests[sTestName].ui5);
		for (const sKey in oTestConfig) {
			const sNormalizedKey = camelize("sapUi-" + sKey);
			if (!sNormalizedKey) {
				sap.ui.loader._.logger.error("Invalid configuration option '" + sKey + "' in global['sap-ui-config']!");
			} else if (Object.hasOwn(oConfig, sNormalizedKey)) {
				sap.ui.loader._.logger.error("Configuration option '" + sKey + "' was already set by '" + mOriginalTestParams[sNormalizedKey] + "' and will be ignored!");
			} else {
				oConfig[sNormalizedKey] = oTestConfig[sKey];
				mOriginalTestParams[sNormalizedKey] = sKey;
			}
		}
		oConfig['sapUiTestSuiteConfig'] = oSuiteConfig.tests;
	});
	function get(sKey) {
		let vValue = oConfig[sKey];
		if (!Object.hasOwn(oConfig, sKey)) {
			const vMatch = sKey.match(rAlias);
			const sLowerCaseAlias = vMatch ? vMatch[1] + vMatch[2][0] + vMatch[2].slice(1).toLowerCase() : undefined;
			if (sLowerCaseAlias) {
				vValue = oConfig[sLowerCaseAlias];
			}
		}
		return vValue;
	}
	const URLConfigurationProvider = {
		external: false,
		get: get,
		loaded: () => {
			return pLoaded;
		}
	};
	return URLConfigurationProvider;
});