sap.ui.define(() => {
	"use strict";

	return {
		name: "Test suite for Order Browser",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/orderbrowser/Test.qunit.html?testsuite={suite}&test={name}",
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
					"sap/ui/demo/orderbrowser": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Browse Orders"
			},
			"integration/opaTestsNavigation": {
				title: "Integration tests for Browse Orders Navigation scenario"
			},
			"integration/opaTests": {
				title: "Integration tests for Browse Orders"
			},
			"integration/opaTestsPhone": {
				title: "Integration tests for Browse Orders on phone",
				skip: true
			}
		}
	};
});