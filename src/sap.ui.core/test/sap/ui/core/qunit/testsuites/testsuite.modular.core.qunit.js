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
			/**
			 * @deprecated As of version 1.111
			 */
			"jquery.sap.global-config": {
				title: "jquery.sap.global: External configuration",
				page: "test-resources/sap/ui/core/qunit/jquery.sap.global-config.qunit.html"
			},
			"jquery.sap.global_unavoidablyUsingEval": {
				title: "jQuery.sap.global",
				ui5: {
					libs: "sap.ui.core"
				}
			},
			/**
			 * @deprecated As of version 1.111
			 */
			"sap.ui.Global_legacyAPIs": {
				title: "sap.ui.Global"
			},
			"VersionInfo": {
				title: "VersionInfo"
			},
			/**
			 * @deprecated since 1.58
			 */
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
			/**
			 * @deprecated since 1.58
			 */
			"util/jquery.sap.encoder": {
				title: "QUnit Page for jquery.sap.encoder",
				group: "jQuery plugins"
			},
			/**
			 * @deprecated since 1.58
			 */
			"util/jquery.sap.script": {
				title: "QUnit Page for jquery.sap.script",
				group: "jQuery plugins"
			},
			/**
			 * @deprecated since 1.108
			 */
			"util/jquery.sap.storage": {
				title: "QUnit Page for jquery.sap.storage",
				group: "jQuery plugins"
			},
			/**
			 * @deprecated since 1.58
			 */
			"util/jquery.sap.strings": {
				title: "QUnit Page for jquery.sap.strings",
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
