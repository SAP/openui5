sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Troubleshooting Tutorial",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/HeapOfShards/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/demo/HeapOfShards": "../"
				}
			}
		},
		tests: {
			"integration/opaTests": {
				title: "Integration tests for Troubleshooting Tutorial"
			}
		}
	};
});