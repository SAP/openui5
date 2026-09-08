sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/TOOLTIP",
		defaults: {
			sinon: {
				versions: {
					"14.0": {
						module: "test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0",
						bridge: "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				version: "14.0",
				useFakeTimers: true
			},
			loader: {
				shim: {
					"test-resources/sap/ui/core/qunit/thirdparty/sinon-14.0": {
						amd: true,
						exports: "sinon"
					}
				}
			}
		},
		tests: {
			Tooltip: {
				title: "QUnit Page for sap.ui.core.tooltip.Tooltip",
				ui5: {
					libs: "sap.m"
				}
			},
			TooltipEnablement: {
				title: "QUnit Page for sap.ui.core.tooltip.TooltipEnablement"
			},
			TooltipEventTrigger: {
				title: "QUnit Page for sap.ui.core.tooltip.TooltipEventTrigger"
			},
			TooltipFocusGuard: {
				title: "QUnit Page for sap.ui.core.tooltip.TooltipFocusGuard"
			},
			TooltipManager: {
				title: "QUnit Page for sap.ui.core.tooltip.TooltipManager"
			}
		}
	};
});
