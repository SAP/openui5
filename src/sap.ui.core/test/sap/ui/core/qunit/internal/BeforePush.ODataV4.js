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
			// realOData=true is appended so that the module is run in variant "POC verification"
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.integration&realOData=true' : 'integration',
			'qunit/internal/1Ring.qunit.html?hidepassed&coverage&module=sap.ui.model.odata.v4.ODataModel.realOData&realOData=true' : 'integration'
		};

	function addAppsAndTests(oSuite, sName) {
		var sSuite = "Test.qunit.html?testsuite=test-resources/sap/ui/core/qunit/" + sName
				+ "&test=";

		Object.keys(oSuite.tests).forEach(function (sTest) {
			if (sTest.startsWith("OPA.")) {
				var aLinks,
					sName = sTest.slice(4),
					sOpa = sSuite + sTest,
					oTest = oSuite.tests[sTest],
					sApp = oTest.$app
						? oTest.$app.replace("test-resources/sap/ui/core/", "")
						: "demokit/sample/common/index.html?component=odata.v4." + sName;


				aLinks = [
					sApp,
					sApp + (sApp.includes("?") ? "&" : "?") + "realOData=true",
					sOpa + "&supportAssistant=true"
				];
				// hide OPAs w/o corresponding app
				aLinks.$hidden = oTest.$app === "";

				mApps[sName] = aLinks;
				mTests[sOpa + "&supportAssistant=true"] = "both";
				if (oTest.realOData !== false) {
					mTests[sOpa + "&realOData=true"] = "both";
					aLinks.push(sOpa + "&realOData=true");
				}
			}
		});
	}

	function failed(sDesc, oResponse) {
		return `\u2716 ${sDesc} request failed: ${oResponse.status} ${oResponse.statusText}`;
	}

	async function resetSalesOrders(fnSetStatus) {
		fnSetStatus("Resetting SalesOrders data...");
		const sService = "/sap/opu/odata4/sap/zui5_testv4/default/sap/zui5_epm_sample/0002/";
		const oHeaderResponse = await fetch(sService, {
			method : "HEAD",
			headers : {"X-CSRF-Token" : "Fetch"}
		});
		if (!oHeaderResponse.ok) {
			fnSetStatus(failed("Head", oHeaderResponse));
			return;
		}
		const oActionResponse = await fetch(`${sService}RegenerateEPMData`, {
			method : "POST",
			headers : {"X-CSRF-Token" : oHeaderResponse.headers.get('X-CSRF-Token')}
		});
		fnSetStatus(oActionResponse.ok
			? "\u2714 SalesOrders data reset"
			: failed("Reset", oActionResponse)
		);
	}

	addAppsAndTests(oODataSuite, "odata/v4/testsuite.odatav4.qunit");
	addAppsAndTests(oFeatureSuite, "internal/testsuite.feature-odata-v4.qunit");
	[
		"Ancestry", "ConsumeV2Service", "DataAggregation_CAP", "DataAggregation_RAP",
		"FlatDataAggregation", "GridTable", "HierarchyBindAction", "MusicArtists"
	].forEach((sName) => {
			mApps[sName] = [
				"demokit/sample/common/index.html?component=odata.v4." + sName
			];
		});
	mApps["DataAggregation_CAP"][4] = "//snippix#303638";
	mApps["DataAggregation_RAP"][4] = "//snippix#909737";

	return {
		actions : {
			"Reset SalesOrders Data" : resetSalesOrders
		},
		apps : mApps,
		tests: mTests
	};
});
