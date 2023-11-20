sap.ui.define(function() {

	"use strict";
	return {
		defaults: {
			name: "PlanningCalendar Opa tests",	/* Just for a nice title on the pages */
			group: "",
			ui5: {
				libs: "",
				theme: "sap_belize",
				noConflict: true,
				preload: "auto",
				"xx-waitForTheme": true			// Whether the start of the test should be delayed until the theme is applied
			},
			qunit: {
				version: "edge",				// Whether QUnit should be loaded and if so, what version
				reorder: false
			},
			sinon: null,
			module: "./{name}",
			page: "test-resources/sap/m/qunit/planningcalendar/test/integration/opaTest.qunit.html?test={name}",
			autostart: true						// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			AllJourneys: {
				ui5: {
					resourceroots: {
						"sap.ui.demo.PlanningCalendar.test": "test-resources/sap/m/qunit/planningcalendar/test"
					},
					frameOptions: "deny"
				},
				coverage: {
					only: ["test-resources/sap/m/qunit/planningcalendar/test/integration/AllJourneys"]
				}
			}
		}
	};
});