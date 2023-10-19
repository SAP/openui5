sap.ui.define(function() {
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
			"Table": {
				group: "Controls",
				module: "./{name}.qunit"
			},
			"Column": {
				group: "Controls",
				module: "./{name}.qunit"
			},
			"CreationRow": {
				group: "Controls",
				module: "./{name}.qunit"
			},
			"Menu": {
				group: "Controls",
				module: "./{name}.qunit"
			},
			"TableTypeBase": {
				group: "Table types",
				module: "./{name}.qunit"
			},
			"GridTableType": {
				group: "Table types",
				module: "./{name}.qunit"
			},
			"ResponsiveTableType": {
				group: "Table types",
				module: "./{name}.qunit"
			},
			"TreeTableType": {
				group: "Table types",
				module: "./{name}.qunit"
			},
			"TableDelegate": {
				group: "Delegates",
				module: "./{name}.qunit"
			},
			"TableDelegate for ODataV4": {
				group: "Delegates",
				module: "test-resources/sap/ui/mdc/qunit/odata/v4/TableDelegate.qunit"
			},
			"PropertyHelper": {
				group: "Helper",
				module: "./{name}.qunit"
			},
			"PropertyHelper for ODataV4": {
				group: "Helper",
				module: "./V4AnalyticsPropertyHelper.qunit"
			},
			"Personalization": {
				group: "Utils",
				module: "./utils/{name}.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"TableSettings": {
				group: "Utils",
				module: "./{name}.qunit"
			},
			"Table Journey": {
				group: "OPA",
				module: "./OpaTests/TableJourney.qunit",
				autostart: false
			},
			"TableFlex": {
				group: "Flexibility",
				module: "./{name}.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"MDCTreeTableV4OPA": {
				group: "Table UI Test",
				module: "./OpaTests/MDCTreeTableV4Opa.qunit",
				ui5: {
					libs: [
						"sap.ui.mdc"
					]
				},
				autostart: false
			},
			"ChangeCondenser": {
				group: "Flexibility",
				module: "./Condenser.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				},
				loader: {
					paths: {
						"sap/ui/mdc/qunit": "test-resources/sap/ui/mdc/qunit"
					}
				},
				sinon: false
			},
			"DragDropConfig": {
				group: "DragAndDrop",
				module: "./DragDropConfig.qunit",
				ui5: {
					libs: ["sap.m", "sap.ui.table", "sap.ui.mdc"]
				},
				coverage: {
					only: ["sap/ui/mdc/table/DragDropConfig"]
				}
			}
		}
	};
});