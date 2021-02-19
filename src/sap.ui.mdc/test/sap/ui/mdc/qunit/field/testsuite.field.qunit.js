sap.ui.define(['../util/EnvHelper'], function(EnvHelper) {

	"use strict";

	return {
		name: "Library 'sap.ui.mdc' - Testsuite Field",	/* Just for a nice title on the pages */
		defaults: {
			group: "Field",
			qunit: {
				version: 2					// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: 4					// Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.mdc"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.mdc), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true
		},
		tests: {
            "FieldContent Testsuite" : {
				title: "FieldContent Testsuite",
                group: "Testsuite",
                page: "test-resources/sap/ui/mdc/qunit/field/content/testsuite.fieldcontent.qunit.html"
            },
            "BoolFieldHelp": {
                module: "./BoolFieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"ConditionFieldHelp": {
                module: "./ConditionFieldHelp.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: {
					qunitBridge: true
				}
			},
            "ConditionType": {
                module: "./ConditionType.qunit"
			},
			"ConditionsType": {
				module: "./ConditionsType.qunit"
			},
			"DefineConditionPanel": {
				module: "./DefineConditionPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: true
			},
			"Field": {
				module: "./Field.qunit",
				sinon: true
			},
			"FieldBase": {
				module: "./FieldBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FieldHelp": {
				module: "./FieldHelp.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FieldInfoBase": {
				module: "./FieldInfoBase.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				}
			},
			"FieldInfo": {
				module: "./FieldInfo.qunit",
				sinon: false
			},
			"FieldValueHelp": {
				module: "./FieldValueHelp.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FieldValueHelpMTableWrapper": {
				module: "./FieldValueHelpMTableWrapper.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FieldValueHelpUITableWrapper": {
				group: "Field",
				module: "./FieldValueHelpUITableWrapper.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FieldValueHelpMdcTableWrapper": {
				group: "Field",
				module: "./FieldValueHelpMdcTableWrapper.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FilterField": {
				module: "./FilterField.qunit",
				sinon: true
			},
			"ListFieldHelp": {
				module: "./ListFieldHelp.qunit",
				sinon: {
					qunitBridge: true
				}
			},
			"ValueHelpPanel": {
				module: "./ValueHelpPanel.qunit",
				coverage: {
					only: "[sap/ui/mdc/field]"
				}
			},
			"FieldValueHelpOPATests": {
				loader: {
					paths: {
						"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
						"sap/ui/v4demo": "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp"
					}
				},
				qunit: {
					reorder: false
				},
				autostart: false, // tests are added asynchronously because the V4 server needs to be found first
				module: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/opaTests.qunit"
			}
		}
	};
});
