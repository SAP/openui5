sap.ui.define(function () {
	"use strict";

	return {
		name: "Opa samples for FormSamples",
		defaults: {
			page: "ui5://test-resources/sap/ui/layout/sample/SimpleForm/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"sap/ui/layout/sample" : "../",
					"sap/ui/demo/mock": "../../../../../../../test-resources/sap/ui/documentation/sdk/"
				}
			}
		},
		tests: {
			"formTests": {
				title: "Opa sample for Form354",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.Form354"
			},
			"SimpleForm354": {
				title: "Opa sample for SimpleForm354",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.SimpleForm354"
			},
			"SimpleForm354wide": {
				title: "Opa sample for SimpleForm354wide",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.SimpleForm354wide"
			},
			"SimpleForm354wideDual": {
				title: "Opa sample for SimpleForm354wideDual",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.SimpleForm354wideDual"
			},
			"SimpleForm471": {
				title: "Opa sample for SimpleForm471",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.SimpleForm471"
			},
			"SimpleForm480": {
				title: "Opa sample for SimpleForm480",
				page: "test-resources/sap/ui/layout/demokit/sample/tests/Test.qunit.html?testsuite=test-resources/sap/ui/layout/sample/SimpleForm/testsuite.qunit&test=formTests&component=sap.ui.layout.sample.SimpleForm480"
			}
		}
	};
});