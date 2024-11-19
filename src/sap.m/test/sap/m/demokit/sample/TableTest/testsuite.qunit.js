sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for TableTest",
		defaults: {
			page: "ui5://test-resources/sap/m/demokit/sample/TableTest/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/m/demokit/sample/TableTest": "./"
				}
			}
		},
		tests: {
			"OpaTableTest": {
				title: "Retrieving message toast elements with OPA5"
			}
		}
	};
});