sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for app",
		defaults: {
			qunit: {
				version: 2
			},
			beforeBootstrap: "./beforeBootstrap"
		},
		tests: {
			Application: {
				page: "test-resources/sap/ui/core/qunit/Application.qunit.html",
				title: "Tests for Application.js"
			},
			MessageListBinding: {
				title: "Tests for sap/ui/model/message/MessageListBinding"
			},
			MockServer: {
				title: "Tests for sap/ui/core/util/MockServer",
				ui5: {
					libs: ["sap.ui.commons"]
				},
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/testdata/"
					}
				}
			},
			MockServerFeature: {
				title: "Tests for sap/ui/core/util/Mockserver: given data and complex filter features"
			},
			MockServerAPF: {
				title: "Tests for sap/ui/core/util/MockServer: APF model"
			},
			DraftEnabledMockServer: {
				title: "Tests for sap/ui/core/util/DraftEnabledMockServer"
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
					theme: "base"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_hcb)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_hcb): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_hcb"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_bluecrystal)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_bluecrystal): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_bluecrystal"
				},
				module: "./ThemeClassParameters.qunit"
			},
			"ThemeClassParameters(sap_belize)": {
				title: "Tests for sap/ui/core/theming/Parameters (sap_belize): Theme-Dependent CSS Classes",
				ui5: {
					theme: "sap_belize"
				},
				module: "./ThemeClassParameters.qunit"
			}
		}
	};
});
