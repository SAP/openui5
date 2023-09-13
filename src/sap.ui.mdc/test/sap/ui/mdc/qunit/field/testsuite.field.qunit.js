sap.ui.define(['../util/EnvHelper', "sap/base/util/merge"], function(EnvHelper, merge) {

	"use strict";

	const mConfig = {
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
				never: "[sap/ui/mdc/qunit]",
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"delegates": "test-resources/sap/ui/mdc/delegates"
				}
			},
			page: "test-resources/sap/ui/mdc/qunit/teststarter.qunit.html?testsuite={suite}&test={name}",
			autostart: true
		},
		tests: {
            "FieldContent Testsuite" : {
				title: "FieldContent Testsuite",
                group: "Testsuite",
                page: "test-resources/sap/ui/mdc/qunit/field/content/testsuite.fieldcontent.qunit.html"
            },
            "ConditionType": {
                module: "./ConditionType.qunit"
			},
			"ConditionsType": {
				module: "./ConditionsType.qunit"
			},
			"DynamicDateRangeConditionsType": {
				module: "./DynamicDateRangeConditionsType.qunit"
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
			"FilterField": {
				module: "./FilterField.qunit",
				sinon: true
			},
			"MultiValueField": {
				module: "./MultiValueField.qunit",
				sinon: true
			}
		}
	};

	// if (EnvHelper.isSapUI5) {
	// 	mConfig = merge({}, mConfig, {
	// 		tests: {
	// 		}
	// 	});
	// }

	return mConfig;
});
