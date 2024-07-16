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
			CustomFastNavigation: {
				autostart: false
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

			"events/PasteEventFix": {
				title: "sap.ui.events.PasteEventFix"
			}
		}
	};
});
