sap.ui.define([], function() {

	"use strict";

	return {
		name: "Library 'sap.ui.documentation'",	/* Just for a nice title on the pages */
		defaults: {
			group: "Library",
			qunit: {
				version: "edge"				// Whether QUnit should be loaded and if so, what version
			},
			sinon: {
				version: "edge"			    // Whether Sinon should be loaded and if so, what version
			},
			ui5: {
				language: "en-US",
				rtl: false,					// Whether to run the tests in RTL mode
				libs: ["sap.ui.documentation"],		// Libraries to load upfront in addition to the library which is tested (sap.ui.documentation), if null no libs are loaded
				"xx-waitForTheme": true		// Whether the start of the test should be delayed until the theme is applied
			},
			coverage: {
				only:	"[sap/ui/documentation/sdk]",	// Which files to show in the coverage report, if null, no files are excluded from coverage
				branchCoverage: true		// Whether to enable standard branch coverage
			},
			loader: {
				paths: {
					"sap/ui/demo/mock": "test-resources/sap/ui/documentation/sdk/"
				}
			},
			page: "test-resources/sap/ui/documentation/sdk/qunit/testsandbox.qunit.html?test={name}",
			autostart: true					// Whether to call QUnit.start() when the test setup is done
		},
		tests: {
			"ApiDetailIndexDeprecatedExperimentalController": {
				coverage: {
					only : ["sap/ui/documentation/sdk/controller/ApiDetailIndexDeprecatedExperimental.controller"]
				}
			},

			"TopicDetailController": {
				coverage: {
					only : ["sap/ui/documentation/sdk/controller/TopicDetail.controller"]
				}
			},

			"SampleController": {
				coverage: {
					only : ["sap/ui/documentation/sdk/controller/Sample.controller"]
				}
			},

			"LiveEditorOutput": {
				coverage: {
					only : ["sap/ui/documentation/sdk/util/LiveEditorOutput.html"]
				}
			},

			"Resources": {
				coverage: {
					only : ["sap/ui/documentation/sdk/util/Resources"]
				}
			},

			"Highlighter": {
				coverage: {
					only : ["sap/ui/documentation/sdk/controller/util/Highlighter"]
				}
			},

			"Formatting": {
				coverage: {
					only : ["sap/ui/documentation/sdk/model/formatter"]
				}
			},

			"Search": {
				coverage: {
					only : ["sap/ui/documentation/sdk/Search"]
				}
			},

			"ObjectPageSubSection": {
				coverage: {
					only : ["sap/ui/documentation/sdk/ObjectPageSubSection"]
				}
			},
			"Generic Testsuite": {
				page: "test-resources/sap/ui/documentation/sdk/qunit/testsuite.generic.qunit.html"
			},

			"Demokit Testsuite": {
				page: "test-resources/sap/ui/documentation/sdk/qunit/testsuite.demokit.qunit.html"
			},

			"URLUtil": {
				coverage: {
					only : ["sap/ui/documentation/sdk/util/URLUtil"]
				}
			},
			"LoadingSamples": {
				coverage: {
					only : ["sap/ui/documentation/sdk/index"]
				}
			},
			"XML2JSONUtils": {
				coverage: {
					only : ["sap/ui/documentation/sdk/controller/util/XML2JSONUtils"]
				}
			}
			// "Forwarding": {
			// 	coverage: {
			// 		only : ["sap/ui/documentation/sdk/Forwarding"]
			// 	}
			// }
		}
	};

});