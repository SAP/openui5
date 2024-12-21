sap.ui.define(function () {
	"use strict";

	return {
		name: "Using Gherkin with OPA5",
		defaults: {
			page: "ui5://test-resources/sap/ui/core/sample/gherkin/GherkinWithOPA5/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"GherkinWithOPA5": "./"
				}
			}
		},
		tests: {
			"GherkinTestRunner": {
				title: "Using Gherkin with OPA5",
				ui5: {
					animation: false
				}
			}
		}
	};
});