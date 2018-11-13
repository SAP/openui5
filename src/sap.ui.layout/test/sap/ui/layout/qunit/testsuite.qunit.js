sap.ui.define([
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(Log, jQuery) {

	"use strict";

	// check whether sap.ui.comp is available
	var bSapUiCompAvailable = false;
	jQuery.ajax({
		type: "HEAD",
		url: sap.ui.require.toUrl("sap/ui/comp/library.js"),
		async: false,
		success: function() {
			bSapUiCompAvailable = true;
		}
	});

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
					paths: {
						"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
					}
				},
				runAfterLoader: "sap/ui/demo/mock/qunit/SampleTesterErrorHandler",
				qunit: {
					version: 2
				},
				sinon: {
					version: 1 // because MockServer is used by samples
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
			"ColumnLayout": {
				group: "Form",
				module: "./form/ColumnLayout.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"Form": {
				group: "Form",
				module: "./form/Form.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"FormContainer": {
				group: "Form",
				module: "./form/FormContainer.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"FormElement": {
				group: "Form",
				module: "./form/FormElement.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"GridLayout": {
				group: "Form",
				module: "./form/GridLayout.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"ResponsiveGridLayout": {
				group: "Form",
				module: "./form/ResponsiveGridLayout.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"ResponsiveLayout": {
				group: "Form",
				module: "./form/ResponsiveLayout.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},

			"SimpleForm": {
				group: "Form",
				module: "./form/SimpleForm.qunit",
				coverage: {
					only: "[sap/ui/layout/form]"
				}
			},


			// --------------------------
			// Demokti Samples
			// --------------------------

			"demokit/Form354": {
				group: "Demokit",
				page: "test-resources/sap/ui/layout/demokit/sample/Form354/test/FormSampleJourney.qunit.html"
			},

			"demokit/SimpleForm354": {
				group: "Demokit",
				page: "test-resources/sap/ui/layout/demokit/sample/SimpleForm354/test/FormSampleJourney.qunit.html"
			},

			"demokit/SimpleForm354wide": {
				group: "Demokit",
				page: "test-resources/sap/ui/layout/demokit/sample/SimpleForm354wide/test/FormSampleJourney.qunit.html"
			},

			"demokit/SimpleForm354wideDual": {
				group: "Demokit",
				page: "test-resources/sap/ui/layout/demokit/sample/SimpleForm354wideDual/test/FormSampleJourney.qunit.html"
			},

			"demokit/SimpleForm471": {
				group: "Demokit",
				page: "test-resources/sap/ui/layout/demokit/sample/SimpleForm471/test/FormSampleJourney.qunit.html"
			},

			// --------------------------
			// Design Time & RTA Enabling
			// --------------------------

			//complete libraries dt files general json data
			"designtime/Library": {
				group: "Designtime",
				page: "test-resources/sap/ui/layout/qunit/designtime/Library.qunit.html"
			},

			//individual controls
			"designtime/form/Form": {
				group: "Designtime",
				page: "test-resources/sap/ui/layout/qunit/designtime/form/Form.qunit.html"
			},
			"designtime/form/FormContainer": {
				group: "Designtime",
				page: "test-resources/sap/ui/layout/qunit/designtime/form/FormContainer.qunit.html"
			},
			"designtime/form/FormElement": {
				group: "Designtime",
				page: "test-resources/sap/ui/layout/qunit/designtime/form/FormElement.qunit.html"
			},
			"designtime/form/SimpleForm": {
				group: "Designtime",
				page: "test-resources/sap/ui/layout/qunit/designtime/form/SimpleForm.qunit.html"
			},

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
			},
			"designtime/form/AddODataFormField": {
				skip: !bSapUiCompAvailable,
				page: "test-resources/sap/ui/layout/qunit/designtime/form/AddODataFormField.qunit.html"
			},

			// change handlers
			"flex/RenameSimpleForm": {
				group: "Change Handler",
				page: "test-resources/sap/ui/layout/qunit/form/changes/RenameSimpleForm.qunit.html"
			},

			"flex/HideSimpleForm": {
				group: "Change Handler",
				page: "test-resources/sap/ui/layout/qunit/form/changes/HideSimpleForm.qunit.html"
			},

			"flex/AddSimpleFormGroup": {
				group: "Change Handler",
				page: "test-resources/sap/ui/layout/qunit/form/changes/AddSimpleFormGroup.qunit.html"
			},

			"flex/UnhideSimpleForm": {
				group: "Change Handler",
				page: "test-resources/sap/ui/layout/qunit/form/changes/UnhideSimpleForm.qunit.html"
			},

			"flex/AddSimpleFormField": {
				group: "Change Handler",
				skip: !bSapUiCompAvailable,
				page: "test-resources/sap/ui/layout/qunit/form/changes/AddSimpleFormField.qunit.html"
			}

		}
	};
});
