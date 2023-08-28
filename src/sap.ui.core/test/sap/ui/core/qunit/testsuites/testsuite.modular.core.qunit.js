sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Modular Core",
		defaults: {
			module: "test-resources/sap/ui/core/qunit/{name}.qunit",
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			}
		},
		tests: {
			"VersionInfo": {
				title: "VersionInfo"
			},

			"util/LibraryInfo": {
				title: "QUnit Page for LibraryInfo",
				ui5: {
					libs: "sap.ui.testlib",
					theme: "customcss",
					resourceRoots: {
						"sap.ui.testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					},
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				coverage: {
					only: "sap/ui/core/util/LibraryInfo"
				}
			},

			"base/util/LoaderExtensions": {
				title: "sap.base.util.LoaderExtensions"
			},

			"jqueryCompatibilityCheck": {
				page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test={name}&sap-ui-xx-self-closing-check=true",
				title: "jqueryCompatibilityCheck",
				qunit: {
					version: "edge",
					reorder: false
				},
				sinon: {
					version: "edge",
					qunitBridge: true
				}
			},

			"jqueryCompatibilityCheckDisabled": {
				page: "resources/sap/ui/test/starter/Test.qunit.html?testsuite={suite}&test=jqueryCompatibilityCheck",
				title: "jqueryCompatibility",
				qunit: {
					version: "edge",
					reorder: false
				},
				sinon: {
					version: "edge",
					qunitBridge: true
				}
			}
		}
	};
});
