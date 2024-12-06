sap.ui.define(function () {
	"use strict";

	return {
		name: "Opa sample for triggering actions on controls",
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
					"appUnderTest" : "./"
				}
			}
		},
		tests: {
			"OpaMatchers": {
				title: "Opa sample for matchers"
			}
		}
	};
});