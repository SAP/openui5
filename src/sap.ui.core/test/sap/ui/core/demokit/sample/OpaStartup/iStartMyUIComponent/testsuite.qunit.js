sap.ui.define(function () {
	"use strict";

	return {
		name: "OPA sample for starting an app with a component",
		defaults: {
			page: "ui5://test-resources/appUnderTest/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/sample/appUnderTest" : "./applicationUnderTest",
					"sap/ui/demo/mock" : "../../../../../../../sap/ui/documentation/sdk/"
				}
			}
		},
		tests: {
			"iStartMyUIComponent": {
				title: "OPA sample for starting an app with a component"
			}
		}
	};
});