sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/EVENTING",
		defaults: {
			loader: {
				paths: {
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			CoreEvents: {
				title: "Test Page for the SAPUI5 Core Events [sap.ui.core.Core]",
				ui5: {
					libs: "sap.ui.testlib"
				},
				qunit: {
					reorder: false
				}
			},
			CustomFastNavigation: {
				/* own page kept because of custom styles and DOM (but uses runTest.js) */
				page: "test-resources/sap/ui/core/qunit/CustomFastNavigation.qunit.html",
				autostart: false
			},
			ElementFocusWhenMissing: {
				title: "QUnit Page for sap.ui.core.Element.focus() when called on missing Elements",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			EventBus: {
				title: "Test Page for EventBus Class"
			},
			EventProvider: {
				title: "Test Page for EventProvider Class",
				qunit: {
					reorder: false
				}
			},
			FastNavigation: {
				title: "QUnit page for Fast Keyboard Navigation (F6)",
				autostart: false
			},
			FocusHandler: {
				ui5: {
					libs: "sap.m"
				}
			},
			"jquery.sap.events": {
				/* own page kept because of custom styles and DOM (but uses runTest.js) */
				page: "test-resources/sap/ui/core/qunit/jquery.sap.events.qunit.html",
				title: "QUnit tests: jquery.sap.events.js, Core Event Handling"
			},
			ResizeHandler: {
				/* own page kept because of custom styles and DOM (but uses runTest.js) */
				page: "test-resources/sap/ui/core/qunit/ResizeHandler.qunit.html",
				title: "QUnit tests: sap.ui.core.ResizeHandler",
				ui5: {
					theme: "base"
				}
			}
		}
	};
});
