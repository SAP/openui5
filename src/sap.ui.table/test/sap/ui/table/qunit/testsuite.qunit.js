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
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"Column": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"Row": {
			},
			"RowAction": {
			},
			"RowSettings": {
			},
			"CreationRow": {
			},
			"TablePersoController": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"TreeTable": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"TreeTableOData": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				},
				sinon: false, /*uses Mockserver*/
				coverage: {
					only: null /*full report*/
				}
			},
			"AnalyticalTable": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"TableColumnHeaders": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			/*"ControlsUsedInTable": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},*/

			// Utils
			"TableUtils": {
				group: "Utils",
				module: "./utils/{name}.qunit"
			},
			"ColumnUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
			},
			"MenuUtils": {
				group: "Utils",
				module: "./utils/_{name}.qunit"
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
			"TableExtension": {
				group: "Extensions"
			},
			"TableAccExtension": {
				group: "Extensions"
			},
			"TableKeyboardExtension": {
				group: "Extensions"
			},
			"TableKeyboardDelegate": {
				group: "Extensions"
			},
			"TableKeyboardDelegate-RTL": {
				group: "Extensions",
				module: "./TableKeyboardDelegate.qunit",
				ui5: {
					rtl: true
				}
			},
			"TablePointerExtension": {
				group: "Extensions"
			},
			"TableScrollExtension": {
				group: "Extensions"
			},
			"TableDragAndDropExtension": {
				group: "Extensions"
			},
			"TableSyncExtension": {
				group: "Extensions"
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
				sinon: false /*uses Mockserver*/
			}
		}
	};

});