sap.ui.define(['../util/EnvHelper', "sap/base/util/merge"], function(EnvHelper, merge) {

	"use strict";

	var mConfig = {
		name: "Library 'sap.ui.mdc' - Testsuite ValueHelp",	/* Just for a nice title on the pages */
		defaults: {
			group: "ValueHelp",
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
				only: "[sap/ui/mdc]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
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
			"ValueHelp": {
				module: "./ValueHelp.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"Container": {
				module: "./Container.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"Content": {
				module: "./Content.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"Conditions": {
				module: "./Conditions.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"ListContent": {
				module: "./ListContent.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FilterableListContent": {
				module: "./FilterableListContent.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"FixedList": {
				module: "./FixedList.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				},
				coverage: {
					only: "[sap/ui/mdc/valuehelp]"
				}
			},
			"Bool": {
				module: "./Bool.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				},
				coverage: {
					only: "[sap/ui/mdc/valuehelp]"
				}
			},
			"MTable": {
				module: "./MTable.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				},
				coverage: {
					only: "[sap/ui/mdc/valuehelp]"
				}
			},
			"MDCTable": {
				module: "./MDCTable.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				},
				coverage: {
					only: "[sap/ui/mdc/valuehelp]"
				}
			},
			"Popover": {
				module: "./Popover.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			},
			"Dialog": {
				module: "./Dialog.qunit",
				ui5: {
					animationMode: "none"
				},
				sinon: {
					qunitBridge: true
				}
			}
		}
	};

//	if (EnvHelper.isSapUI5) {
//		mConfig = merge({}, mConfig, {
//			tests: {
//				"FieldValueHelpOPATests": {
//					loader: {
//						paths: {
//							"mdc/qunit/util": "test-resources/sap/ui/mdc/qunit/util",
//							"sap/ui/v4demo": "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp"
//						}
//					},
//					qunit: {
//						reorder: false
//					},
//					autostart: false, // tests are added asynchronously because the V4 server needs to be found first
//					module: "test-resources/sap/ui/mdc/qunit/field/opa/valuehelp/opaTests.qunit"
//				}
//			}
//		});
//	}

	return mConfig;
});
