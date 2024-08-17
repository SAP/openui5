sap.ui.define(function () {
	"use strict";
	return {
		name: "QUnit TestSuite for sap.f",
		defaults: {
			group: "Default",
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en",
				rtl: false,
				libs: ["sap.f"],
				"xx-waitForTheme": "init"
			},
			coverage: {
				only: ["sap/f"]
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/f/qunit/testsandbox.qunit.html?test={name}",
			autostart: true
		},
		tests: {
			"AvatarGroup": {
				coverage: {
					only: ["sap/f/AvatarGroup"]
				}
			},

			"AvatarGroupItem": {
				coverage: {
					only: ["sap/f/AvatarGroupItem"]
				}
			},

			"CalendarInCard": {},

			"Card": {
				coverage: {
					only: ["sap/f/Card"]
				},
				sinon: {
					useFakeTimers: true
				}
			},

			"cards/util/addTooltipIfTruncated": {},

			"cards/CardBadgeCustomData": {
				sinon: {
					useFakeTimers: true
				}
			},

			"DynamicPage": {
				coverage: {
					only: ["sap/f/DynamicPage"]
				}
			},

			"DynamicPageHeader": {
				coverage: {
					only: ["sap/f/DynamicPageHeader"]
				}
			},

			"DynamicPageTitle": {
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				},
				coverage: {
					only: ["sap/f/DynamicPageTitle"]
				}
			},

			"DynamicPageWithStickySubheader": {
				coverage: {
					only: ["sap/f/DynamicPage"]
				}
			},

			"ExploredSamples": {
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
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
					libs: ["sap.ui.unified", "sap.ui.documentation", "sap.ui.layout", "sap.m"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			"FlexibleColumnLayout": {
				coverage: {
					only: ["sap/f/FlexibleColumnLayout"]
				}
			},

			"GridContainer": {
				ui5: {
					compatVersion: "edge"
				},
				coverage: {
					only: [
						"sap/f/GridContainer",
						"sap/f/GridContainerRenderer",
						"sap/f/GridContainerSettings",
						"sap/f/GridContainerItemLayoutData"
					]
				}
			},

			"GridContainerUtils": {},

			"GridDropInfo": {
				coverage: {
					only: [
						"sap/f/dnd/GridKeyboardDragAndDrop",
						"sap/f/dnd/GridDropInfo",
						"sap/f/dnd/GridDragOver"
					]
				},
				module: [
					'./dnd/GridKeyboardDragAndDrop.qunit',
					'./dnd/GridDropInfo.qunit',
					'./dnd/GridDragOver.qunit'
				],
				sinon: {
					useFakeTimers: true
				}
			},

			"GridContainerItemNavigation": {
				coverage: {
					only: [
						"sap/f/delegate/GridContainerItemNavigation"
					]
				},
				module: [
					'./delegate/GridContainerItemNavigation.qunit'
				]
			},

			"GridItemNavigation": {
				coverage: {
					only: [
						"sap/f/delegate/GridContainerItemNavigation"
					]
				},
				module: './delegate/GridItemNavigation.qunit',
				sinon: {
					version: "edge"
				}
			},

			"GridList": {
				coverage: {
					only: ["sap/f/GridList"]
				},
				sinon: {
					useFakeTimers: true
				}
			},

			"GridListItem": {
				coverage: {
					only: ["sap/f/GridListItem"]
				}
			},

			"GridNavigationMatrix": {
				coverage: {
					only: ["sap/f/GridNavigationMatrix"]
				}
			},

			"ProductSwitchItem": {
				coverage: {
					only: ["sap/f/ProductSwitchItem"]
				}
			},

			"ProductSwitch": {
				coverage: {
					only: ["sap/f/ProductSwitch"]
				}
			},

			"Router": {
				coverage: {
					only: ["sap/f/Router"]
				},
				ui5: {
					resourceroots: {
						"f.test": "test-resources/sap/f/qunit/"
					}
				}
			},

			"SearchManager": {
				coverage: {
					only: ["sap/f/SearchManager"]
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

			"ShellBar": {
				title: "QUnit Test Page for sap.f.ShellBar",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				coverage: {
					only: [
						"sap/f/ShellBar",
						"sap/f/shellBar/Factory",
						"sap/f/shellBar/ResponsiveHandler",
						"sap/f/shellBar/AdditionalContentSupport",
						"sap/f/shellBar/ControlSpacer",
						"sap/f/shellBar/ToolbarSpacer"
					]
				},
				ui5: {
					language: "en"
				}
			},

			"SidePanel": {
				sinon: {
					version: "edge"
				},
				coverage: {
					only: ["sap/f/SidePanel"]
				}
			},

			"TargetHandler": {
				coverage: {
					only: ["sap/f/routing/TargetHanlder"]
				}
			},

			"Designtime-DynamicPage": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/DynamicPage.qunit"
			},

			"Designtime-DynamicPageHeader": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/DynamicPageHeader.qunit"
			},

			"Designtime-DynamicPageTitle": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/DynamicPageTitle.qunit"
			},

			"Designtime-GridContainer": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/GridContainer.qunit"
			},

			"Designtime-Library": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/Library.qunit"
			},

			"Designtime-SemanticPage": {
				group: "Designtime",
				sinon: false,
				module: "./designtime/SemanticPage.qunit"
			},

			"Generic Testsuite": {
				page: "test-resources/sap/f/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});