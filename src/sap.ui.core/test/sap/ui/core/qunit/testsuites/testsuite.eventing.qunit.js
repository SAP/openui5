sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Events",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			CoreEvents: {
				title: "Test Page for the SAPUI5 Core Events [sap.ui.core.Core]",
				ui5: {
					libs: "sap.ui.testlib"
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
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
				title: "Test Page for EventProvider Class"
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
			IntervalTrigger: {
				title: "Test Page for IntervalTrigger Class"
			},
			"jquery.sap.events": {
				/* own page kept because of custom styles and DOM (but uses runTest.js) */
				page: "test-resources/sap/ui/core/qunit/jquery.sap.events.qunit.html",
				title: "QUnit tests: jquery.sap.events.js, Core Event Handling"
			},
			"events/PasteEventFix": {
				title: "sap.ui.events.PasteEventFix"
			}
		}
	};
});
