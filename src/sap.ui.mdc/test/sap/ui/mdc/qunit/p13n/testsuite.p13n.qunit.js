sap.ui.define(["sap/ui/Device"], function (Device) {
	"use strict";

	return {
		name: "P13n related tests", /* Just for a nice title on the pages */
		defaults: {
			group: "Personalization",
			qunit: {
				version: 2
				// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4
				// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc"
				], // Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true
				// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true
				// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true,
			module: "./{name}.qunit"
			// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"BasePanel": {
				group: "UI Panels",
				module: "./BasePanel.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"GroupPanelBase": {
				group: "UI Panels",
				module: "./GroupPanelBase.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"AdaptFiltersPanel": {
				group: "UI Panels",
				module: "./AdaptFiltersPanel.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"SelectionPanel": {
				group: "UI Panels",
				module: "./SelectionPanel.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"SortPanel": {
				group: "UI Panels",
				module: "./SortPanel.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"ChartItemPanel": {
				group: "UI Panels",
				module: "./ChartItemPanel.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"AdaptationController": {
				group: "P13n logic",
				module: "./AdaptationController.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"P13nBuilder": {
				group: "P13n logic",
				module: "./P13nBuilder.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"FlexUtil": {
				group: "P13n logic",
				module: "./FlexUtil.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"StateUtil": {
				group: "P13n logic",
				module: "./StateUtil.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc", "sap.ui.fl"
					]
				}
			},
			"PersonalizationChart": {
				group: "Chart UI Test",
				module: "./OpaTests/PersonalizationChart.opa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationChartVariants": {
				group: "Chart UI Test",
				module: "./OpaTests/PersonalizationChartVariants.opa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationTable": {
				group: "Table UI Test",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationTableRTA": {
				group: "Table UI Test",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationTableVariants": {
				group: "Table UI Test",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationFilterBar": {
				group: "FilterBar UI Test",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationFilterBarVariants": {
				group: "FilterBar UI Test - variant based",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PersonalizationFilterBarRTA": {
				group: "FilterBar UI Test",
				autostart: false,
				module: "./OpaTests/P13nOpa.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"SortFlex": {
				group: "SortFlex change handler tests",
				module: "./SortFlex.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			}
		}
	};
});
