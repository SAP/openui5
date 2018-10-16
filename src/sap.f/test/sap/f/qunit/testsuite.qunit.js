sap.ui.define(function () {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.f",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.f"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/f"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/f/qunit/"
				}
			},
			page: "test-resources/sap/f/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"Avatar": {
				coverage: {
					only: ["sap/f/Avatar"]
				}
			},
			"DynamicPage": {
				coverage: {
					only: ["sap/f/DynamicPage"]
				}
			},
			"ExploredSamples": {
				coverage: {
					only: ["sap/f/ExploredSamples"]
				},
				ui5: {
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"]
				},
				sinon: false,
				autostart: false
			},
			"FlexibleColumnLayout": {
				coverage: {
					only: ["sap/f/FlexibleColumnLayout"]
				}
			},
			"GridList": {
				coverage: {
					only: ["sap/f/GridList"]
				}
			},
			"Router": {
				coverage: {
					only: ["sap/f/Router"]
				}
			},
			"SemanticContainer": {
				coverage: {
					only: ["sap/f/SemanticContainer"]
				}
			},
			"SemanticPage": {
				coverage: {
					only: ["sap/f/SemanticPage"]
				}
			},

			// -------------------------------------------------------------------------------
			// Designtime tests:
			// -------------------------------------------------------------------------------

			"Designtime-DynamicPage": {
				group: "Designtime",
				module: "./designtime/DynamicPage.qunit"
			},
			"Designtime-DynamicPageHeader": {
				group: "Designtime",
				module: "./designtime/DynamicPageHeader.qunit"
			},
			"Designtime-DynamicPageTitle": {
				group: "Designtime",
				module: "./designtime/DynamicPageTitle.qunit"
			},
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit",
				qunit: 1,
				autostart: false
			},
			"Designtime-SemanticPage": {
				group: "Designtime",
				module: "./designtime/SemanticPage.qunit"
			}
		}
	};
});