sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: NOT-YET-GTP testcase CORE/GHERKIN",
		defaults: {
			title: "QUnit Page for sap.ui.test.gherkin.{name}",
			/*
			 * Note: technically, all tests here work with qunit-2 and sinon-4.
			 * But the two test-harnesses have hard-coded dependencies to qunit-1, so we stick to
			 * the older versions until the behavior of the harnesses has been clarified
			 */
			qunit: {
				version: 1,
				noglobals: true
			},
			sinon: {
				version: 1
			},
			coverage: {
				branchTracking: true
			},
			ui5: {
				animation: false,
				compatVersion: "edge"
			}
		},
		tests: {
			"dataTableUtils": {},
			"GherkinTestGenerator": {},
			"opa5TestHarness": {
				page: "test-resources/sap/ui/core/qunit/gherkin/opa5TestHarness.qunit.html?sap-ui-log-level=info&sap-ui-animation=false",
				qunit: {
					noglobals: false
				}
			},
			"qUnitTestHarness": {
				page: "test-resources/sap/ui/core/qunit/gherkin/qUnitTestHarness.qunit.html?sap-ui-log-level=info&sap-ui-animation=false",
				qunit: {
					noglobals: false
				}
			},
			"simpleGherkinParser": {},
			"StepDefinitions": {},

			/*
			 * Note: Tests that are part of demokit samples have not been migrates as long as the test starter is not a public offering
			 */
			"GherkinWithOPA5": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithOPA5/GherkinTestRunner.html?sap-ui-animation=false"
			},
			"GherkinWithPageObjects": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithPageObjects/GherkinTestRunner.html?sap-ui-animation=false"
			},
			"GherkinWithQUnit": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithQUnit/GherkinTestRunner.html?sap-ui-animation=false&noglobals=true"
			},
			"GherkinWithUIComponent": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithUIComponent/GherkinTestRunner.html?sap-ui-animation=false"
			}
		}
	};
});
