sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for app",
		defaults: {
			ui5: {
				resourceroots: {
					"test": "test-resources/sap/ui/core/qunit/app/fixture/"
				},
				libs: ["sap.ui.core"]
			}
		},
		tests: {
			MessageListBinding: {
				title: "Tests for sap/ui/model/message/MessageListBinding"
			},

			DesignMode_controllerDeactivated: {
				title: "Tests for sap/ui/base/Designtime: DesignMode (XMLView) - DesignMode on, Controller Deactivated",
				ui5: {
					"xx-designMode": true,
					"xx-suppressDeactivationOfControllerCode": false
				}
			},

			DesignMode_suppressedDeactivation: {
				title: "Tests for sap/ui/base/Designtime: DesignMode (XMLView) - DesignMode on, Suppress Deactivation of Controller Code",
				ui5: {
					"xx-designMode": true,
					"xx-suppressDeactivationOfControllerCode": true
				}
			},

			"ThemeClassParameters(base)": {
				title: "Tests for sap/ui/core/theming/Parameters (base): Theme-Dependent CSS Classes",
				ui5: {
					theme: "base",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_fiori_3)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_fiori_3): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_fiori_3",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_fiori_3_dark)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_fiori_3_dark): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_fiori_3_dark",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_fiori_3_hcb)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_fiori_3_hcb): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_fiori_3_hcb",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_fiori_3_hcw)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_fiori_3_hcw): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_fiori_3_hcw",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_horizon)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_horizon): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_horizon",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_horizon_dark)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_horizon_dark): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_horizon_dark",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_horizon_hcb)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_horizon_hcb): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_horizon_hcb",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},

			"ThemeClassParameters(sap_horizon_hcw)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_horizon_hcw): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_horizon_hcw",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			}
		}
	};
});
