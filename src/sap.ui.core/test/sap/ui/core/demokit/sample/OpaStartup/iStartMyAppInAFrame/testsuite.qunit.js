sap.ui.define(function () {
	"use strict";

	return {
		name: "Opa sample for starting an app with a frame",
		defaults: {
			page: "ui5://test-resources/appUnderTest/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"appUnderTest": "./"
				}
			}
		},
		tests: {
			"iStartMyAppInAFrame": {
				title: "Opa sample for starting an app with a frame"
			},
			"iStartMyAppInAFrameDebug": {
				title: "Opa sample for starting an app with a frame",
				page: "test-resources/sap/ui/core/demokit/sample/OpaStartup/iStartMyAppInAFrame/Test.qunit.html?testsuite=test-resources/appUnderTest/testsuite.qunit&test=iStartMyAppInAFrame&sap-ui-debug=true"
			}
		}
	};
});