sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Icon Explorer",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/iconexplorer/Test.qunit.html?testsuite={suite}&test={name}",
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
					"sap/ui/demo/iconexplorer": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Icon Explorer"
			},
			"integration/opaTests1": {
				title: "Integration tests for Icon Explorer, part 1"
			},
			"integration/opaTests2": {
				title: "Integration tests for Icon Explorer, part 2"
			}
		}
	};
});