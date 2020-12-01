sap.ui.define(["sap/ui/Device"], function(Device) {

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

			"LiveEditorOutput": {
				coverage: {
					only : ["sap/ui/documentation/sdk/util/LiveEditorOutput.html"]
				},
				skip: Device.browser.msie
			},

			"Resources": {
				coverage: {
					only : ["sap/ui/documentation/sdk/util/Resources"]
				}
			},

			"Formatting": {
				coverage: {
					only : ["sap/ui/documentation/sdk/model/formatter"]
				}
			}
			,

			"Search": {
				coverage: {
					only : ["sap/ui/documentation/sdk/model/Search"]
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