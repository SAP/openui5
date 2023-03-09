sap.ui.define(function () {
	"use strict";

	return {
		name: "MDCTable related tests", /* Just for a nice title on the pages */
		defaults: {
			group: "Personalization",
			qunit: {
				version: 2, // Whether QUnit should be loaded and if so, which version
				reorder: false
			},
			sinon: {
				version: 4 // Whether Sinon should be loaded and if so, which version
			},
			ui5: {
				rtl: false, // Whether to run the tests in RTL mode
				libs: [
					"sap.ui.mdc"
				], // Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true // Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only: "[sap/ui/mdc]",
				never: "[sap/ui/mdc/qunit]", // Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true // Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"delegates": "test-resources/sap/ui/mdc/delegates",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"sap/ui/mdc/integration": "test-resources/sap/ui/mdc/integration"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true, // Whether to call QUnit.start() when the test setup is done
			module: "./{name}.qunit"
		},
		tests: {
			"Column": {
				group: "Control element",
				module: "./Column.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"CreationRow": {
				group: "Column logic",
				module: "./CreationRow.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"Menu": {
				group: "UI panels",
				module: "./Menu.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"PropertyHelper": {
				group: "Control helper",
				module: "./PropertyHelper.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"ResponsiveTableType": {
				group: "Control element",
				module: "./ResponsiveTableType.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"Table": {
				group: "MDCTable control",
				module: "./Table.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"TableDelegate": {
				group: "Control helper",
				module: "./TableDelegate.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"v4.TableDelegate": {
				group: "Delegates",
				module: "test-resources/sap/ui/mdc/qunit/odata/v4/TableDelegate.qunit",
				qunit: {
					reorder: false
				}
			},
			"TableFlex": {
				group: "Control logic",
				module: "./TableFlex.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"TableSettings": {
				group: "Control helper",
				module: "./TableSettings.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"TreeTableType": {
				group: "Control element",
				module: "./TreeTableType.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"GridTableType": {
				group: "Control element",
				module: "./GridTableType.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"V4AnalyticsPropertyHelper": {
				group: "Control helper",
				module: "./V4AnalyticsPropertyHelper.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				}
			},
			"MDCTableOPA": {
				group: "Table UI Test",
				module: "./OpaTests/MDCTableOPA.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				},
				autostart: false
			}
//			,"ChangeCondenser": {
//				module: "./Condenser.qunit",
//				ui5: {
//					libs: [
//						"sap.ui.fl", "sap.ui.mdc"
//					]
//				},
//				loader: {
//					paths: {
//						"sap/ui/mdc/qunit": "test-resources/sap/ui/mdc/qunit"
//					}
//				},
//				sinon: false
//			}
		}
	};
});