sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: NOT-YET-GTP testcase CORE/GHERKIN",
		defaults: {
			title: "QUnit Page for sap.ui.test.gherkin.{name}",
			qunit: {
				version: 2,
				noglobals: true
			},
			sinon: {
				version: 1
			},
			coverage: {
				branchTracking: true
			},
			ui5: {
				animationMode: "minimal"
			}
		},
		tests: {
			"dataTableUtils": {},
			"GherkinTestGenerator": {},
			"opa5TestHarness": {
				uriParams: {
					// required as the test wants to check log messages of level INFO
					"sap-ui-log-level": "INFO"
				}
			},
			"qUnitTestHarness": {
				uriParams: {
					// required as the test wants to check log messages of level INFO
					"sap-ui-log-level": "INFO"
				}
			},
			"simpleGherkinParser": {},
			"StepDefinitions": {},

			"GherkinWithOPA5": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithOPA5/testsuite.qunit.html"
			},
			"GherkinWithPageObjects": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithPageObjects/testsuite.qunit.html"
			},
			"GherkinWithQUnit": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithQUnit/testsuite.qunit.html"
			},
			"GherkinWithUIComponent": {
				group: "Demokit Samples",
				page: "test-resources/sap/ui/core/demokit/sample/gherkin/GherkinWithUIComponent/testsuite.qunit.html"
			}
		}
	};
});
