sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for app",
		defaults: {
			beforeBootstrap: "./beforeBootstrap"
		},
		tests: {
			MessageListBinding: {
				title: "Tests for sap/ui/model/message/MessageListBinding"
			},
			DesignMode: {
				title: "Tests for sap/ui/core/Configuration: DesignMode",
				ui5: {
					noConflict: true,
					"xx-designMode": true,
					resourceroots: {
						"example.designmode": "test-resources/sap/ui/core/qunit/testdata/designmode/"
					}
				}
			},
			DesignModeSupressedDeactivation: {
				title: "Tests for sap/ui/core/Configuration: DesignMode",
				ui5: {
					noConflict: true,
					"xx-designMode": true,
					"xx-suppressDeactivationOfControllerCode": true,
					resourceroots: {
						"example.designmode": "test-resources/sap/ui/core/qunit/testdata/designmode/"
					}
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
			"ThemeClassParameters(sap_hcb)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_hcb): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_hcb",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_bluecrystal)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_bluecrystal): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_bluecrystal",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_belize)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_belize): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_belize",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_belize_plus)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_belize_plus): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_belize_plus",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_belize_hcb)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_belize_hcb): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_belize_hcb",
					"xx-waitForTheme": "init"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_belize_hcw)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_belize_hcw): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_belize_hcw",
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
			}
		}
	};
});
