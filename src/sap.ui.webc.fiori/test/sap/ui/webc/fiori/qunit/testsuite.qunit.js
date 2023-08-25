sap.ui.define(function() {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.ui.webc.fiori",
		defaults: {
			group: "Default",
			qunit: {
				version: "edge"
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.ui.webc.main, sap.ui.webc.fiori"],
				"xx-waitForTheme": true
			},
			coverage: {
				only: ["sap/ui/webc/fiori"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"qunit": "test-resources/sap/ui/webc/fiori/qunit/"
				}
			},
			runAfterLoader: "qunit/ResizeObserverErrorHandler",
			page: "test-resources/sap/ui/webc/fiori/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {

			"Bar": {
				coverage: {
					only: ["sap/ui/webc/fiori/Bar"]
				}
			},

			"BarcodeScannerDialog": {
				coverage: {
					only: ["sap/ui/webc/fiori/BarcodeScannerDialog"]
				}
			},

			"FlexibleColumnLayout": {
				coverage: {
					only: ["sap/ui/webc/fiori/FlexibleColumnLayout"]
				}
			},

			"IllustratedMessage": {
				coverage: {
					only: ["sap/ui/webc/fiori/IllustratedMessage"]
				}
			},

			"NotificationListItem": {
				coverage: {
					only: ["sap/ui/webc/fiori/NotificationListItem"]
				}
			},

			"Page": {
				coverage: {
					only: ["sap/ui/webc/fiori/Page"]
				}
			},

			"ProductSwitch": {
				coverage: {
					only: ["sap/ui/webc/fiori/ProductSwitch"]
				}
			},

			"ShellBar": {
				coverage: {
					only: ["sap/ui/webc/fiori/ShellBar"]
				}
			},

			"SideNavigation": {
				coverage: {
					only: ["sap/ui/webc/fiori/SideNavigation"]
				}
			},

			"Timeline": {
				coverage: {
					only: ["sap/ui/webc/fiori/Timeline"]
				}
			},

			"UploadCollection": {
				coverage: {
					only: ["sap/ui/webc/fiori/UploadCollection"]
				}
			},

			"ViewSettingsDialog": {
				coverage: {
					only: ["sap/ui/webc/fiori/ViewSettingsDialog"]
				}
			}
			// Prevent the test from running prior webc 1.114.2 update because of ResizeHandler error
			// "Wizard": {
			// 	coverage: {
			// 		only: ["sap/ui/webc/fiori/Wizard"]
			// 	}
			// },
		}
	};
});