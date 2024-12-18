sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Card Explorer",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/cardExplorer/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/demo/cardExplorer": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Card Explorer"
			},
			"integration/opaTests": {
				title: "Integration tests for Card Explorer"
			}
		}
	};
});