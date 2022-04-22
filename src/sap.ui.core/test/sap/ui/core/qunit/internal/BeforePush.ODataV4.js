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

	var mTests = {
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&realOData=true' : 'full',
			// realOData=true is appended so that the module is run in variant "POC verification'
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.integration&realOData=true' : 'integration',
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.realOData&realOData=true' : 'integration'
		};

	function addOPATests(oSuite) {
		Object.keys(oSuite.tests).forEach(function (sTest) {
			if (sTest.startsWith("OPA.")) {
				var sFile = oSuite.tests[sTest].module[0].replace("sap/ui/core/", "demokit/")
					+ ".html";
				mTests[sFile + "?supportAssistant=true"] = "both";
				if (oSuite.tests[sTest].realOData !== false) {
					mTests[sFile + "?realOData=true"] = "both";
				}
			}
		});
	}

	addOPATests(oODataSuite);
	addOPATests(oFeatureSuite);

	return mTests;
});
