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

	var s1Ring = "qunit/internal/1Ring.qunit.html?hidepassed&realOData=true",
		mApps = {
			"1Ring" : [
				"qunit/internal/1Ring.qunit.html?hidepassed&coverage",
				// no coverage for single module
				s1Ring + "&module=sap.ui.model.odata.v4.ODataModel.realOData"
			]
		},
		mTests = {
			[s1Ring] : "full", // the test runs in IFrames where no coverage is checked
			[s1Ring + "&module=sap.ui.model.odata.v4.ODataModel.realOData"] : "integration",
			// realOData=true is used so that this module is run in variant "POC verification"
			[s1Ring + "&module=sap.ui.model.odata.v4.ODataModel.integration"] : "integration"
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
				if (oTest.$app === null) {
					aLinks[0] = aLinks[1] = null;
				} else if (sName.startsWith("Tutorial")) { // cannot run w/o its mock server!
					aLinks[1] = null;
				}
				mTests[sOpa + "&supportAssistant=true"] = "both";
				if (oTest.realOData !== false) {
					mTests[sOpa + "&realOData=true"] = "both";
					aLinks.push(sOpa + "&realOData=true");
				}
				mApps[sName] = aLinks;
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
			headers : {"X-CSRF-Token" : oHeaderResponse.headers.get("X-CSRF-Token")}
		});
		fnSetStatus(oActionResponse.ok
			? "\u2714 SalesOrders data reset"
			: failed("Reset", oActionResponse)
		);
	}

	addAppsAndTests(oODataSuite, "odata/v4/testsuite.odatav4.qunit");
	addAppsAndTests(oFeatureSuite, "internal/testsuite.feature-odata-v4.qunit");
	const mName2Sandbox = {
		"Ancestry" : false,
		"ConsumeV2Service" : true,
		"DataAggregation_CAP" : false,
		"DataAggregation_RAP" : false,
		"FlatDataAggregation" : false,
		"GridTable" : true,
		"HierarchyBindAction" : false,
		"MultiLevelExpand" : true,
		"MusicArtists" : true,
		"Travel_CAP" : true
	};
	for (const sName in mName2Sandbox) {
		mApps[sName] = [
			mName2Sandbox[sName]
			 ? "demokit/sample/common/index.html?component=odata.v4." + sName
			 : null,
			"demokit/sample/common/index.html?component=odata.v4." + sName + "&realOData=true"
		];
	}
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
