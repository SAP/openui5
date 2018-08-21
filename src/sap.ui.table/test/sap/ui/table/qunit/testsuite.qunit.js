sap.ui.define(function() {

	"use strict";

	return {
		name: "Library 'sap.ui.table'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Control",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
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
				ui5: {
					libs: ["sap.ui.table", "sap.m", "sap.ui.layout", "sap.ui.documentation"]
				},
				sinon: false,
				autostart: false
			},

			/* Control */
			"Table": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"Column": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},
			"RowAction": {
			},
			"RowSettings": {
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
			"ControlsUsedInTable": {
				ui5: {
					libs: ["sap.ui.table", "sap.m"]
				}
			},

			// Utils
			"TableUtils": {
				group: "Utils"
			},
			"TableRendererUtils": {
				group: "Utils"
			},
			"TableColumnUtils": {
				group: "Utils"
			},
			"TableMenuUtils": {
				group: "Utils"
			},
			"TableGrouping": {
				group: "Utils"
			},
			"TableBindingUtils": {
				group: "Utils",
				sinon: false /*uses Mockserver*/
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

			// Design Time & RTA Enabling
			"Designtime-Library": {
				group: "Designtime",
				module: "./designtime/Library.qunit",
				qunit: {
					version: 1
				},
				autostart: false
			}
		}
	};

});