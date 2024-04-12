sap.ui.define(function() {
	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Testsuite Table", /* Just for a nice title on the pages */
		defaults: {
			qunit: {
				version: 2, // Whether QUnit should be loaded and if so, which version
				reorder: false
			},
			sinon: {
				version: 4 // Whether Sinon should be loaded and if so, which version
			},
			ui5: {
				theme: "sap_horizon",
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
				group: "Controls"
			},
			"Column": {
				group: "Controls"
			},
			"CreationRow": {
				group: "Controls"
			},
			"Menu": {
				group: "Controls"
			},
			"RowActionItem": {
				group: "Controls"
			},
			"TableTypeBase": {
				group: "Table types"
			},
			"GridTableType": {
				group: "Table types"
			},
			"ResponsiveTableType": {
				group: "Table types"
			},
			"TreeTableType": {
				group: "Table types"
			},
			"TableDelegate": {
				group: "Delegates"
			},
			"TableDelegate for ODataV4": {
				group: "Delegates",
				module: "test-resources/sap/ui/mdc/qunit/odata/v4/TableDelegate.qunit",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
			},
			"PropertyHelper": {
				group: "PropertyHelper"
			},
			"PropertyHelper for ODataV4": {
				group: "PropertyHelper",
				module: "./PropertyHelper.ODataV4.qunit"
			},
			"Personalization": {
				group: "Utils",
				module: "./utils/{name}.qunit"
			},
			"TableSettings": {
				group: "Utils"
			},
			"Table - Common (ODataV4)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4Flat",
					journey: "TableJourney"
				},
				autostart: false
			},
			"Table - GridTableType (ODataV4)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4Flat",
					journey: "GridTableJourney"
				},
				autostart: false
			},
			"Table - ResponsiveTableType (ODataV4)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4Flat",
					journey: "ResponsiveTableJourney"
				},
				autostart: false
			},
			"Table - TreeTableType (ODataV4, Hierarchy)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4Hierarchy",
					journey: "TableJourney"
				},
				autostart: false
			},
			"Table - GridTableType (ODataV4, DataAggregation)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4DataAggregation",
					journey: "TableJourney"
				},
				autostart: false
			},
			"Export (ODataV4)": {
				group: "OPA",
				module: "./OpaTests/start",
				uriParams: {
					app: "appODataV4Flat",
					journey: "ExportJourney"
				},
				autostart: false
			},
			"Flexibility": {
				group: "Flexibility",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.mdc"
					]
				}
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