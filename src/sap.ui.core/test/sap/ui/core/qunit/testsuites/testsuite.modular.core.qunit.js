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
			"jquery.sap.global-config": {
				title: "jquery.sap.global: External configuration",
				beforeBootstrap: "test-resources/sap/ui/core/qunit/jquery.sap.global-config_beforeBootstrap.qunit"
			},
			"jquery.sap.global": {
				title: "jQuery.sap.global",
				ui5: {
					libs: "sap.ui.core"
				}
			},
			"sap.ui.Global": {
				title: "sap.ui.Global"
			},
			"util/jquery.sap.dom": {
				title: "QUnit Page for jquery.sap.dom",
				group: "jQuery plugins",
				qunit: {
					reorder: false
				},
				loader: {
					paths: {
						"static": "test-resources/sap/ui/core/qunit/util/static/"
					}
				}
			},
			"util/jquery.sap.encoder": {
				title: "QUnit Page for jquery.sap.encoder",
				group: "jQuery plugins"
			},
			"util/jquery.sap.script": {
				title: "QUnit Page for jquery.sap.script",
				group: "jQuery plugins"
			},
			"util/jquery.sap.storage": {
				title: "QUnit Page for jquery.sap.storage",
				group: "jQuery plugins"
			},
			"util/jquery.sap.strings": {
				title: "QUnit Page for jquery.sap.strings",
				group: "jQuery plugins"
			},
			"util/jquery.sap.unicode": {
				title: "QUnit Page for jquery.sap.unicode",
				group: "jQuery plugins"
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
