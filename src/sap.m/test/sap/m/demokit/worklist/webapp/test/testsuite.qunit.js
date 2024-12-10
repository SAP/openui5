sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Worklist",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/worklist/Test.qunit.html?testsuite={suite}&test={name}",
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
					"sap/ui/demo/worklist": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Worklist"
			},
			"integration/opaTests": {
				title: "Integration tests for Worklist"
			}
		}
	};
});