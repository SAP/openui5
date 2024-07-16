sap.ui.define([
], function() {
	"use strict";

	return {
		name: "Library 'sap.ui.table'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Control",
			qunit: {
				version: 2,					// Whether QUnit should be loaded and if so, what version
				reorder: false
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				theme: "sap_horizon",
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.table"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.table), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/table]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				map: {
					"*": {
						"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
						"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
					}
				},
				paths: {
					"sap/ui/table/qunit": "test-resources/sap/ui/table/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/",
					"sap/ui/core/sample": "test-resources/sap/ui/core/demokit/sample/"
				}
			},
			page: "test-resources/sap/ui/table/qunit/teststarter.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			/* Library */
			"TableLib": {
				group: "Library",
				ui5: {
					libs: []
				}
			},

			"ExploredSamples": {
				group: "Library",
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				ui5: {
					libs: ["sap.ui.table", "sap.m", "sap.ui.layout", "sap.ui.documentation"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			/* Control */
			"Table": {
				ui5: {
					// Test has dependencies to sap.ui.unified and sap.m modules
					libs: ["sap.ui.table", "sap.ui.unified", "sap.m"]
				}
			},

			"Table-RTL": {
				ui5: {
					// Test has dependencies to sap.ui.unified and sap.m modules
					libs: ["sap.ui.table", "sap.ui.unified", "sap.m"],
					rtl: true,
					"xx-waitForTheme": "init"
				}
			},

			"Table with ODataV2": {
				module: "./Table.ODataV2.qunit"
			},

			"Column": {
				ui5: {
					// Test has dependencies to sap.ui.unified and sap.m modules
					libs: ["sap.ui.table", "sap.ui.unified", "sap.m"],
					"xx-waitForTheme": "init"
				}
			},

			// Menus
			"ColumnHeaderMenuAdapter": {
				group: "Menus",
				module: "./menus/{name}.qunit"
			},

			"MobileColumnHeaderMenuAdapter": {
				group: "Menus",
				module: "./menus/{name}.qunit",
				ui5: {
					// Test has dependencies to sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"Row": {},
			"RowAction": {},
			"RowSettings": {},

			"CreationRow": {
				ui5: {
					// The test and sap.ui.table.CreationRow have dependencies to sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"TreeTable": {
			},

			"TreeTable with ODataV2": {
				module: "./TreeTable.ODataV2.qunit",
				coverage: {
					only: null /*full report*/
				}
			},

			"AnalyticalTable": {},
			"AnalyticalColumn": {},
			"TableColumnHeaders": {},

			// Utils
			"TableUtils": {
				group: "Utils",
				module: "./utils/{name}.qunit",
				ui5: {
					// Test has indirect dependencies to sap.m modules through sap.ui.table.CreationRow
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"ColumnUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
			},

			"MenuUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit",
				ui5: {
					// Test has dependencies to sap.ui.unified and sap.m modules
					libs: ["sap.ui.table", "sap/ui/unified", "sap.m"]
				}
			},

			"GroupingUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
			},

			"BindingUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
			},

			"HookUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
			},

			// Extensions
			"ExtensionBase": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"Accessibility": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"Keyboard": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"KeyboardDelegate": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"KeyboardDelegate-RTL": {
				group: "Extensions",
				module: "./extensions/KeyboardDelegate.qunit",
				ui5: {
					rtl: true,
					"xx-waitForTheme": "init"
				}
			},

			"Pointer": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"Scrolling": {
				group: "Extensions",
				module: "./extensions/{name}.qunit",
				ui5: {
					// Test has dependencies to sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"Scrolling-RTL": {
				group: "Extensions",
				module: "./extensions/{name}.qunit",
				ui5: {
					rtl: true,
					"xx-waitForTheme": "init"
				}
			},

			"ScrollingIOS": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"DragAndDrop": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			"Synchronization": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit"
			},

			// Row modes
			"RowMode": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			"Fixed": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			"Fixed with ODataV2": {
				group: "Row Mode",
				module: "./rowmodes/Fixed.ODataV2.qunit"
			},

			"Interactive": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			"Interactive with ODataV2": {
				group: "Row Mode",
				module: "./rowmodes/Interactive.ODataV2.qunit"
			},

			"Auto": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			"Auto with ODataV2": {
				group: "Row Mode",
				module: "./rowmodes/Auto.ODataV2.qunit"
			},

			"Variable": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			// Plugins
			"PluginBase": {
				group: "Plugins",
				module: "./plugins/{name}.qunit"
			},

			"SelectionModelSelection": {
				group: "Plugins",
				module: "./plugins/{name}.qunit"
			},

			"SelectionModelSelection with ODataV2": {
				group: "Plugins",
				module: "./plugins/SelectionModelSelection.ODataV2.qunit"
			},

			"BindingSelection (TreeBinding)": {
				group: "Plugins",
				module: "./plugins/BindingSelection.TreeBinding.qunit"
			},

			"MultiSelectionPlugin": {
				group: "Plugins",
				module: "./plugins/{name}.qunit",
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"MultiSelectionPlugin with ODataV2 (ListBinding)": {
				group: "Plugins",
				module: "./plugins/MultiSelectionPlugin.ODataV2.ListBinding.qunit",
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"MultiSelectionPlugin with ODataV2 (TreeBinding)": {
				group: "Plugins",
				module: "./plugins/MultiSelectionPlugin.ODataV2.TreeBinding.qunit",
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"MultiSelectionPlugin with ODataV2 (AnalyticalBinding)": {
				group: "Plugins",
				module: "./plugins/MultiSelectionPlugin.ODataV2.AnalyticalBinding.qunit",
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"MultiSelectionPlugin with ODataV4": {
				group: "Plugins",
				module: "./plugins/MultiSelectionPlugin.ODataV4.qunit",
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"ODataV4Selection Flat": {
				group: "Plugins",
				module: "./plugins/ODataV4Selection.Flat.qunit",
				ui5: {
					// sap.ui.table.plugins.ODataV4Selection requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"ODataV4Selection Hierarchy": {
				group: "Plugins",
				module: "./plugins/ODataV4Selection.Hierarchy.qunit",
				ui5: {
					// sap.ui.table.plugins.ODataV4Selection requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"ODataV4Selection DataAggregation": {
				group: "Plugins",
				module: "./plugins/ODataV4Selection.DataAggregation.qunit",
				ui5: {
					// sap.ui.table.plugins.ODataV4Selection requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"ODataV4Selection with V4Aggregation plugin": {
				group: "Plugins",
				module: "./plugins/ODataV4Selection.V4Aggregation.qunit",
				ui5: {
					// sap.ui.table.plugins.ODataV4Selection requires sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"Support of external plugins": {
				group: "Plugins",
				module: "./plugins/SupportOfExternalPlugins.qunit",
				ui5: {
					// Test has dependencies to sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			"V4Aggregation": {
				group: "Plugins",
				module: "./plugins/{name}.qunit"
			},

			"Generic Testsuite": {
				page: "test-resources/sap/ui/table/qunit/testsuite.generic.qunit.html"
			}
		}
	};
});