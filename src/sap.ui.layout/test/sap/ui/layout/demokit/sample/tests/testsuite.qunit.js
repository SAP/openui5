sap.ui.define(function () {
	"use strict";

	return {
		name: "Opa samples for FormSamples",
		defaults: {
			page: "ui5://test-resources/sap/ui/layout/demokit/sample/tests/formTests.qunit.html?testsuite={suite}&test={name}&component=sap.ui.layout.sample.{name}",
			title: "Opa sample for {name}",
			module: "./formTests.qunit",
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
			"Form354": {},
			"SimpleForm354": {},
			"SimpleForm354wide": {},
			"SimpleForm354wideDual": {},
			"SimpleForm471": {},
			"SimpleForm480": {}
		}
	};
});