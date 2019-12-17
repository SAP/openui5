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
		name: "Package 'sap.ui.layout.form'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Form",
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
				only: "[sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/layout/qunit": "test-resources/sap/ui/layout/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/"
				}
			},
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"ColumnLayout": {
				group: "Form"
			},

			"Form": {
				group: "Form"
			},

			"FormContainer": {
				group: "Form"
			},

			"FormElement": {
				group: "Form"
			},

			"SemanticFormElement": {
				group: "Form"
			},

			"GridLayout": {
				group: "Form"
			},

			"ResponsiveGridLayout": {
				group: "Form"
			},

			"ResponsiveLayout": {
				group: "Form"
			},

			"SimpleForm": {
				group: "Form"
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

			//individual controls
			"Designtime-Form-AddODataFormField": {
				skip: !bSapUiCompAvailable,
				group: "Designtime",
				title: "QUnit Page for sap.ui.layout.form.AddODataFormField design time and rta enabling",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta", "sap.ui.comp"],
					language: "en"
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/AddODataFormField.qunit",
				sinon: false
			},
			"Designtime-Form-Form": {
				group: "Designtime",
				title: "QUnit Page for sap.ui.layout.form.Form design time and rta enabling",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta"],
					language: "en"
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/Form.qunit",
				sinon: false
			},
			"Designtime-Form-FormContainer": {
				group: "Designtime",
				title: "QUnit Page for sap.ui.layout.form.FormContainer design time and rta enabling",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/FormContainer.qunit",
				sinon: false
			},
			"Designtime-Form-FormElement": {
				group: "Designtime",
				title: "QUnit Page for sap.ui.layout.form.FormElement design time and rta enabling",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/FormElement.qunit",
				sinon: false
			},
			"Designtime-Form-SimpleForm": {
				group: "Designtime",
				title: "QUnit Page for sap.ui.layout.form.SimpleForm design time",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta"],
					language: "en"
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/SimpleForm.qunit",
				sinon: false
			},

			// change handlers
			"flex/AddSimpleFormField": {
				skip: !bSapUiCompAvailable,
				group: "Change Handler",
				title: "Test Page for sap.ui.layout.qunit.form.changes.AddSimpleFormField",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.dt", "sap.ui.rta", "sap.ui.comp"],
					language: "en"
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./changes/AddSimpleFormField.qunit"
			},

			"flex/AddSimpleFormGroup": {
				group: "Change Handler",
				title: "QUnit - sap.ui.layout.changes.AddSimpleFormGroup",
				ui5: {
					libs: ["sap.ui.layout", "sap.m"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./changes/AddSimpleFormGroup.qunit"
			},

			"flex/HideSimpleForm": {
				group: "Change Handler",
				title: "QUnit - sap.ui.layout.changes.HideSimpleForm",
				ui5: {
					libs: ["sap.ui.layout", "sap.m"]
				},
				module: "./changes/HideSimpleForm.qunit"
			},

			"flex/RenameSimpleForm": {
				group: "Change Handler",
				title: "QUnit - sap.ui.layout.changes.RenameSimpleForm",
				ui5: {
					libs: ["sap.ui.layout", "sap.m"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./changes/RenameSimpleForm.qunit"
			},

			"flex/UnhideSimpleForm": {
				group: "Change Handler",
				title: "QUnit - sap.ui.layout.changes.UnhideSimpleForm",
				ui5: {
					libs: ["sap.ui.layout", "sap.m"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./changes/UnhideSimpleForm.qunit"
			},

			"flex/AddFormContainer": {
				skip: !bSapUiCompAvailable,
				group: "Change Handler",
				title: "QUnit - sap.ui.layout.changes.AddFormContainer",
				ui5: {
					libs: ["sap.ui.layout", "sap.ui.rta", "sap.ui.comp"]
				},
				coverage: {
					only: "[sap/ui/layout/changeHandlers, sap/ui/layout/form]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
					branchCoverage: true		// Whether to enable standard branch coverage
				},
				module: "./../designtime/form/AddFormContainer.qunit",
				sinon: false
			}

		}
	};
});
