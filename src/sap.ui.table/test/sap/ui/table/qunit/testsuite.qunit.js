sap.ui.define([
	"sap/ui/Device"
], function(Device) {
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
				version: 1					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
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
				paths: {
					"sap/ui/table/qunit": "test-resources/sap/ui/table/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/",
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/table/qunit/teststarter.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			/* Bindings */
			"ODataTreeBindingAdapter": {
				group: "Binding",
				sinon: false /*uses Mockserver*/,
				coverage: {
					only: null /*full report*/
				}
			},
			"ClientTreeBindingAdapter": {
				group: "Binding",
				coverage: {
					only: null /*full report*/
				}
			},

			/* Library */
			"TableLib": {
				group: "Library",
				ui5: {
					libs: []
				}
			},
			"ExploredSamples": {
				group: "Library",
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 4
				},
				ui5: {
					libs: ["sap.ui.table", "sap.m", "sap.ui.layout", "sap.ui.documentation"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			/* Control */
			"Table": {
				qunit: {
					testTimeout: Device.browser.msie ? 90000 : undefined /*default*/ // BCP: 1880602291
				},
				sinon: false, /*uses Mockserver*/
				ui5: {
					// Test has dependencies to sap.ui.unified and sap.m modules
					libs: ["sap.ui.table", "sap.ui.unified", "sap.m"]
				}
			},
			"Column": {
				ui5: {
					// Test has dependencies to sap.ui.unified modules
					libs: ["sap.ui.table", "sap.ui.unified"]
				}
			},
			"Row": {
			},
			"RowAction": {
			},
			"RowSettings": {
			},
			"CreationRow": {
				ui5: {
					// The test and sap.ui.table.CreationRow have dependencies to sap.m modules
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"TablePersoController": {
				ui5: {
					// sap.ui.table.TablePersoController requires sap.m.TablePersoDialog
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"TreeTable": {
			},
			"TreeTableOData": {
				sinon: false, /*uses Mockserver*/
				coverage: {
					only: null /*full report*/
				}
			},
			"AnalyticalTable": {
			},
			"TableColumnHeaders": {
			},

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
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				},
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
				module: "./utils/_{name}.qunit",
				sinon: false /*uses Mockserver*/
			},
			"HookUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit",
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				}
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
				module: "./extensions/{name}.qunit",
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				}
			},
			"KeyboardDelegate-RTL": {
				group: "Extensions",
				module: "./extensions/KeyboardDelegate.qunit",
				ui5: {
					rtl: true
				},
				qunit: {
					version: "edge"
				},
				sinon: {
					version: "edge"
				}
			},
			"Pointer": {
				group: "Extensions",
				module: "./extensions/{name}.qunit"
			},
			"Scrolling": {
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
			"FixedRowMode": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},
			"InteractiveRowMode": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},
			"AutoRowMode": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},
			"VariableRowMode": {
				group: "Row Mode",
				module: "./rowmodes/{name}.qunit"
			},

			// Plugins
			"MultiSelectionPlugin": {
				group: "Plugins",
				module: "./plugins/{name}.qunit",
				sinon: false, /*uses Mockserver*/
				ui5: {
					// sap.ui.table.plugins.MultiSelectionPlugin requires sap.m modules
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
			}
		}
	};
});