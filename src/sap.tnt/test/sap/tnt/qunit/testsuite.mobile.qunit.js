sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit TestSuite for sap.tnt",
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
				libs: ["sap.tnt"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/tnt"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/tnt/qunit/"
				}
			},
			page: "test-resources/sap/tnt/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"InfoLabel": {
				coverage: {
					only : ["sap/tnt/InfoLabel"]
				}
			},
			"NavigationList": {
				coverage: {
					only : ["sap/tnt/NavigationList"]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"SideNavigation": {
				coverage: {
					only : ["sap/tnt/SideNavigation"]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"ToolHeader": {
				coverage: {
					only : ["sap/tnt/ToolHeader"]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"ToolPage": {
				coverage: {
					only : ["sap/tnt/ToolPage"]
				},
				sinon: {
					useFakeTimers: true
				}
			},
			"ExploredSamples": {
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.tnt", "sap.ui.documentation"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			// -------------------------------------------------------------------------------
			// Designtime tests:
			// -------------------------------------------------------------------------------

			"Designtime-NavigationListItem": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/NavigationListItem.qunit"
			},
			"Designtime-Library": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/Library.qunit"
			}
		}
	};
});