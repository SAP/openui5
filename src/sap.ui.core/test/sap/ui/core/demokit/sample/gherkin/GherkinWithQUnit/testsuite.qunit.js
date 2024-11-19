sap.ui.define(function () {
	"use strict";

	return {
		name: "Using Gherkin with QUnit",
		defaults: {
			page: "ui5://test-resources/sap/ui/core/sample/gherkin/GherkinWithQUnit/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2,
				noglobals: true
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"GherkinWithQUnit": "./"
				}
			}
		},
		tests: {
			"GherkinTestRunner": {
				title: "Using Gherkin with QUnit",
				ui5: {
					animation: false
				}
			}
		}
	};
});