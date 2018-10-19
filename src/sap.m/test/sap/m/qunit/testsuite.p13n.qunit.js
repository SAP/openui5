sap.ui.define([
	"./testsuite.mobile.qunit"
], function(oSuiteConfig) {
	"use strict";

	// remove all tests that are not P13n related
	Object.keys(oSuiteConfig.tests).forEach(function(sTestName) {
		if ( !/^(P13n|TablePerso)/.test(sTestName) ) {
			delete oSuiteConfig.tests[sTestName];
		}
	});

	return oSuiteConfig;
});
