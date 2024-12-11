sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Worklist Tutorial",
		defaults: {
			page: "ui5://test-resources/mycompany/myapp/MyWorklistApp/Test.qunit.html?testsuite={suite}&test={name}",
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
					"mycompany/myapp/MyWorklistApp": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Worklist Tutorial"
			},
			"integration/opaTests": {
				title: "Integration tests for Worklist Tutorial"
			}
		}
	};
});