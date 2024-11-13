sap.ui.define(() => {
	"use strict";

	return {
		name: "QUnit test suite for UI5 Walkthrough",
		defaults: {
			page: "ui5://test-resources/ui5/walkthrough/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"ui5/walkthrough": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "UI5 Walkthrough - Unit Tests"
			},
			"integration/opaTests": {
				title: "UI5 Walkthrough - Integration Tests"
			}
		}
	};
});
