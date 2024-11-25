sap.ui.define(function () {
	"use strict";

	return {
		name: "Integration tests for Routing Nested Component",
		defaults: {
			page: "ui5://test-resources/sap/ui/core/sample/RoutingNestedComponent/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/core/sample/RoutingNestedComponent": "../../"
				}
			}
		},
		tests: {
			"opaTests": {
				title: "Integration tests for Routing Nested Component"
			}
		}
	};
});