sap.ui.define([
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(Log, jQuery) {

	"use strict";

	return {
		name: "Library 'sap.ui.layout'",	/* Just for a nice title on the pages */
		defaults: {
			group: "",
			qunit: {
				version: "edge"				// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: "edge"				// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.layout"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.layout), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/layout]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/layout/qunit/testsandbox.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {

			AlignedFlowLayout: {
				page: "test-resources/sap/ui/layout/qunit/AlignedFlowLayout.qunit.html"
			},

			"AlignedFlowLayout (RTL)": {
				page: "test-resources/sap/ui/layout/qunit/AlignedFlowLayout.qunit.html?sap-ui-rtl=true"
			},

			"ExploredSamples": {
				loader: {
					map: {
						"*": {
							"sap/ui/thirdparty/sinon": "sap/ui/thirdparty/sinon-4",
							"sap/ui/thirdparty/sinon-qunit": "sap/ui/qunit/sinon-qunit-bridge"
						}
					},
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
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
					libs: ["sap.ui.layout", "sap.m", "sap.tnt", "sap.ui.documentation"],
					"xx-componentPreload": "off"
				},
				autostart: false
			},

			"Grid": {
				coverage: {
					only : ["sap/ui/layout/Grid"]
				}
			},
			"CSSGrid-CSSGrid": {
				group: "CSSGrid",
				module: "./cssgrid/CSSGrid.qunit",
				sinon: 1
			},
			"CSSGrid-GridTypes": {
				group: "CSSGrid",
				module: "./cssgrid/GridTypes.qunit",
				sinon: false
			},
			"CSSGrid-GridLayouts": {
				group: "CSSGrid",
				module: "./cssgrid/GridLayouts.qunit",
				sinon: 1
			},
			"CSSGrid-VirtualGrid": {
				group: "CSSGrid",
				module: "./cssgrid/VirtualGrid.qunit",
				sinon: 1
			},
			"Splitter": {
				coverage: {
					only: [
						"sap/ui/layout/Splitter",
						"sap/ui/layout/SplitPane",
						"sap/ui/layout/PaneContainer",
						"sap/ui/layout/SplitLayoutData"
					]
				}
			},
			"ResponsiveSplitter": {
				sinon: {
					version: 1, // because the bridge for sinon-4 doesn't support fake timers yet
					useFakeTimers: true
				},
				coverage: {
					only: [
						"sap/ui/layout/ResponsiveSplitter",
						"sap/ui/layout/SplitPane",
						"sap/ui/layout/PaneContainer",
						"sap/ui/layout/SplitLayoutData"
					]
				}
			},
			"VerticalLayout": {
				coverage: {
					only: ["sap/ui/layout/VerticalLayout"]
				},
				ui5: {
					libs: ["sap.ui.commons"]
				}
			},
			"AssociativeSplitter": {
				coverage: {
					only: ["sap/ui/layout/AssociativeSplitter"]
				}
			},
			"FixFlex": {
				coverage: {
					only: ["sap/ui/layout/FixFlex"]
				}
			},
			"BlockLayout": {
				coverage: {
					only: [
						"sap/ui/layout/BlockLayout",
						"sap/ui/layout/BlockLayoutCell",
						"sap/ui/layout/BlockLayoutRow"
					]
				}
			},
			"HorizontalLayout": {
				group: "HorizontalLayout",
				ui5: {
					noConflict: true,
					theme: "sap_belize"
				},
				coverage: {
					only: ["sap/ui/layout/HorizontalLayout"]
				}
			},
			"DynamicSideContent": {
				group: "DynamicSideContent",
				ui5: {
					noConflict: true,
					theme: "sap_belize"
				},
				coverage: {
					only: ["sap/ui/layout/DynamicSideContent"]
				}
			},
			"ResponsiveFlowLayout": {
				group: "ResponsiveFlowLayout",
				ui5: {
					noConflict: true,
					theme: "sap_belize"
				},
				coverage: {
					only: ["sap/ui/layout/ResponsiveFlowLayout"]
				}
			},

			// Form
			"Form": {
				group: "Form testsuite",
				page: "test-resources/sap/ui/layout/qunit/form/testsuite.form.qunit.html"
			},

			// --------------------------
			// Design Time & RTA Enabling
			// --------------------------

			//complete libraries dt files general json data
			"designtime/Library": {
				group: "Designtime"
			},

			// Form tests in Form-testsuite

			//individual controls
			"Designtime-Grid": {
				group: "Designtime",
				module: "./designtime/Grid.qunit",
				sinon: false
			},
			"Designtime-BlockLayout": {
				group: "Designtime",
				module: "./designtime/BlockLayout.qunit",
				sinon: false
			},
			"Designtime-BlockLayoutCell": {
				group: "Designtime",
				module: "./designtime/BlockLayoutCell.qunit",
				sinon: false
			},
			"Designtime-BlockLayoutRow": {
				group: "Designtime",
				module: "./designtime/BlockLayoutRow.qunit",
				sinon: false
			},
			"Designtime-FixFlex": {
				group: "Designtime",
				module: "./designtime/FixFlex.qunit",
				sinon: false
			},
			"Designtime-Splitter": {
				group: "Designtime",
				module: "./designtime/Splitter.qunit",
				sinon: false
			},
			"Designtime-VerticalLayout": {
				group: "Designtime",
				module: "./designtime/VerticalLayout.qunit",
				sinon: false
			},
			"Designtime-HorizontalLayout": {
				group: "Designtime",
				module: "./designtime/HorizontalLayout.qunit",
				sinon: false
			},
			"Designtime-DynamicSideContent": {
				group: "Designtime",
				module: "./designtime/DynamicSideContent.qunit",
				sinon: false
			}

		}
	};
});
