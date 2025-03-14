sap.ui.define(["sap/ui/Device"], function (Device) {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/SUPPORT",
		defaults: {
			loader: {
				map: {
					// Opa _XHRWaiter requires sap/ui/thirdparty/sinon, redirect to sinon-4
					'sap/ui/test/autowaiter': {
						'sap/ui/thirdparty/sinon': 'sap/ui/thirdparty/sinon-4'
					}
				}
			},
			qunit: {
				version: 2,
				reorder: false
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
			},
			ui5: {
				"xx-waitForTheme": "init"
			}
		},
		tests: {
			"RuleEngineOpaExtension": {
				title: "Rule Engine OPA Extension"
			},
			"SupportTool": {},
			"plugins/ControlTree": {
				title: "Control Tree Support Plugin"
			},
			"techinfo/moduleTreeHelper": {
				title: "Module Tree Helper for Technical Information Dialog"
			},
			"techinfo/TechnicalInfo": {},
			"techinfo/TechnicalInfo.opa": {
				ui5: {
					libs: "sap.m",
					language: "EN"
				}
			},
			"techinfo/TechnicalInfoDebugModules.opa": {
				ui5: {
					libs: "sap.m",
					language: "EN"
				}
			},
			"usage/EventBroadcaster": {
				title: "Event Broadcaster"
			}
		}
	};
});
