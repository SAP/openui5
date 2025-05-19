sap.ui.define(() => {
	"use strict";

	return {
		name: "QUnit test suite for Shopping Cart",
		defaults: {
			page: "ui5://test-resources/sap/ui/demo/cart/Test.qunit.html?testsuite={suite}&test={name}",
			qunit : {
				versions : {
					"2.18" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
						css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
					}
				},
				version : "2.18"
			},
			sinon : {
				versions : {
					"14.0" : {
						module : "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge : "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version : "14.0"
			},
			ui5: {
				language: "en",
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/demo/cart": "../",
					"sap/ui/demo/mock": "./../localService/mockdata"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for Shopping Cart"
			},
			"integration/opaTestsPhone": {
				title: "Opa tests for cart on phone",
				skip: true
			},
			"integration/opaTestsComponent": {
				title: "Opa tests for Shopping Cart Journeys with Component"
			},
			"integration/opaTestsIFrame": {
				title: "Integration tests for Shopping Cart Journeys with IFrame"
			},
			"integration/opaTestsGherkinComponent": {
				title: "Opa tests for Shopping Cart written in Gherkin using a Component"
			},
			"integration/opaTestsGherkinIFrame": {
				title: "Opa tests for Shopping Cart written in Gherkin"
			}
		}
	};
});