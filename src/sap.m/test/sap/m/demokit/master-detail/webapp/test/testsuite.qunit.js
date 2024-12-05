sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Master-Detail",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/masterdetail/Test.qunit.html?testsuite={suite}&test={name}",
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
					"sap/ui/demo/masterdetail": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Master-Detail"
			},
			"integration/opaTestsNavigation": {
				title: "Integration tests for navigation in Master-Detail"
			},
			"integration/opaTests": {
				title: "Integration tests for Master-Detail"
			},
			"integration/opaTestsPhone": {
				title: "Integration tests for Master-Detail on Phone",
				skip: true
			}
		}
	};
});