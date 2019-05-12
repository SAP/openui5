sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/GENERIC",
		defaults: {
			qunit: {
				version: 2,
				reorder: false
			}
		},
		tests: {
			ControlIterator: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator",
				ui5: {
					"xx-supportedLanguages": "en"
				},
				qunit: {
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are created async with the ControlIterator, so the test has to start QUnit
				autostart: false
			},
			ControlIteratorExample: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator - most basic usage (example 1: one test per control)",
				qunit: {
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			ControlIteratorExample2: {
				title: "QUnit Page for sap.ui.qunit.utils.ControlIterator - most basic usage (example 2: all controls within one test)",
				qunit: {
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				}
			},
			ControlMemoryLeaks: {
				title: "QUnit Page for memory leak detection in UI5 controls",
				ui5: {
					libs: "sap.m,sap.ui.commons,sap.ui.unified",
					bindingSyntax: "complex"
				},
				qunit: {
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			ControlRenderer: {
				title: "QUnit Page for memory leak detection in UI5 controls",
				ui5: {
					bindingSyntax: "complex"
				},
				qunit: {
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				}
			},
			ControlMemoryLeaksUsingIterator: {
				title: "QUnit Page for memory leak detection in UI5 controls",
				ui5: {
					libs: "sap.m,sap.ui.commons,sap.ui.unified",
					bindingSyntax: "complex"
				},
				qunit: {
					// MemoryLeakCheck loads qunit-1
					version: 1,
					// make sure results are consistent/stable and the "statistics" test in the end is actually run in the end
					reorder: false
				},
				// tests are added asynchronously, hence autostart is disabled and QUnit.start is called later
				autostart: false
			},
			DuplicateIdCheck: {
				title: "QUnit Page for duplicate ID issues detection in UI5 controls",
				ui5: {
					libs: "sap.m,sap.ui.commons,sap.ui.unified"
				}
			},
			SettersContextReturn: {
				title: "All setters should return correct context (Reason: https://github.com/SAP/openui5/blob/master/docs/guidelines.md#creating-classes)"
			}
		}
	};
});
