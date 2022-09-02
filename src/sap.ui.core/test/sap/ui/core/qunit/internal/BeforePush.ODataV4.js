/*!
 * ${copyright}
 */
/*
 * This is the OData V4 configuration file for BeforePush.js. It adds 1Ring, analyzes the team's
 * testsuites and adds all OPA tests therein.
 */
sap.ui.define([
	"sap/ui/core/qunit/internal/testsuite.feature-odata-v4.qunit",
	"sap/ui/core/qunit/odata/v4/testsuite.odatav4.qunit"
], function (oFeatureSuite, oODataSuite) {
	"use strict";

	var mApps = {},
		mTests = {
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true' : 'full',
			// realOData=true is appended so that the module is run in variant "POC verification'
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.integration&realOData=true' : 'integration',
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.realOData&realOData=true' : 'integration'
		};

	function addAppsAndTests(oSuite, sName) {
		var sSuite = "Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/" + sName
				+ "&test=";

		Object.keys(oSuite.tests).forEach(function (sTest) {
			if (sTest.startsWith("OPA.")) {
				var sName = sTest.slice(4),
					sApp = "demokit/sample/common/index.html?component=odata.v4." + sName,
					sOpa = sSuite + sTest,
					aLinks = [sApp, sApp + "&realOData=true", sOpa + "&supportAssistant=true"];

				mApps[sName] = aLinks;
				mTests[sOpa + "&supportAssistant=true"] = "both";
				if (oSuite.tests[sTest].realOData !== false) {
					mTests[sOpa + "&realOData=true"] = "both";
					aLinks.push(sOpa + "&realOData=true");
				}
			}
		});
	}

	addAppsAndTests(oODataSuite, "odata/v4/testsuite.odatav4.qunit");
	addAppsAndTests(oFeatureSuite, "internal/testsuite.feature-odata-v4.qunit");

	return {
		apps : mApps,
		tests: mTests
	};
});
