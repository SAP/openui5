sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for Team Calendar Demo Application",
		defaults: {
			page: "ui5://test-resources/sap/m/demokit/teamCalendar/webapp/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			ui5: {
				theme: "sap_horizon"
			},
			loader: {
				paths: {
					"model": "../model/",
					"teamCalendar": "../"
				}
			}
		},
		tests: {
			"integration/opaTests": {
				title: "Integration tests for Team Calendar Demo Application"
			}
		}
	};
});