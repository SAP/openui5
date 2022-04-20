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
			},

			"Wizard": {
				coverage: {
					only: ["sap/ui/webc/fiori/Wizard"]
				}
			},
			"designtime/NotificationListItem": {
				title: "QUnit Page for sap.ui.webc.fiori.NotificationListItem design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori","sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/Page": {
				title: "QUnit Page for sap.ui.webc.fiori.Page design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/SideNavigation": {
				title: "QUnit Page for sap.ui.webc.fiori.SideNavigation design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/SideNavigationItem": {
				title: "QUnit Page for sap.ui.webc.fiori.SideNavigationItem design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/SideNavigationSubItem": {
				title: "QUnit Page for sap.ui.webc.fiori.SideNavigationSubItem design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"designtime/UploadCollection": {
				title: "QUnit Page for sap.ui.webc.fiori.UploadCollection design time and rta enabling",
				ui5: {
					libs: ["sap.ui.webc.fiori", "sap.ui.rta"]
				},
				sinon: false,
				group: "Designtime"
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/webc/fiori/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});
