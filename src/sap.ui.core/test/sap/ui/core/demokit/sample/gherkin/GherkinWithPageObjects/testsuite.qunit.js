sap.ui.define(function () {
	"use strict";

	return {
		name: "Using Gherkin with OPA5 Page Objects",
		defaults: {
			page: "ui5://test-resources/sap/ui/core/sample/gherkin/GherkinWithPageObjects/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"GherkinWithPageObjects": "./"
				}
			}
		},
		tests: {
			"GherkinTestRunner": {
				title: "Using Gherkin with OPA5 Page Objects",
				ui5: {
					animation: false
				}
			}
		}
	};
});