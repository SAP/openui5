sap.ui.define(function () {
	"use strict";

	return {
		name: "Using Gherkin with UIComponent",
		defaults: {
			page: "ui5://test-resources/sap/ui/core/sample/gherkin/GherkinWithUIComponent/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"GherkinWithUIComponent": "./",
					"samples" : "../../../../samples/"
				}
			}
		},
		tests: {
			"GherkinTestRunner": {
				title: "Using Gherkin with UIComponent",
				ui5: {
					animation: false
				}
			}
		}
	};
});