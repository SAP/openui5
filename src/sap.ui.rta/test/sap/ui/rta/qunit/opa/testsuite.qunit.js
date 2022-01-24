sap.ui.define(function () {
	"use strict";
	return {
		name: "Opa sap.ui.rta",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: false,
			ui5: {
				language: "en",
				libs: ["sap.ui.core", "sap.m", "sap.ui.fl", "sap.ui.dt", "sap.ui.rta", "sap.ui.layout"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/ui/rta"],
				branchTracking: true
			},
			page: "test-resources/sap/ui/rta/qunit/opa/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			// AppContexts
			"appContext/integration/AllJourneys": {
				group: "AppContexts",
				ui5: {
					resourceroots: {
						"sap.ui.rta.appcontext.integration": "test-resources/sap/ui/rta/qunit/opa/appContext/integration"
					},
					frameOptions: "deny"
				},
				coverage: {
					only: ["test-resources/sap/ui/rta/qunit/opa/appContext/integration/AllJourneys"]
				}
			}
		}
	};
});