sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for ui5loader: GTP testcase CORE/LOADER",
		defaults: {
			ui5: {
				theme: "sap_belize"
			},
			qunit: {
				version: 2
			}
		},
		tests: {
			"amd/base_tag/requirejs": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/base_tag/requirejs.qunit.html",
				title: "QUnit test: AMD"
			},
			"amd/base_tag/ui5loader": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/base_tag/ui5loader.qunit.html",
				title: "QUnit test: AMD"
			},
			"amd/config_paths/requirejs": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/config_paths/requirejs.qunit.html",
				title: "QUnit test: AMD"
			},
			"amd/config_paths/ui5loader": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/config_paths/ui5loader.qunit.html",
				title: "QUnit test: AMD"
			},
			"amd/config_paths_relative/requirejs": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/config_paths_relative/requirejs.qunit.html",
				title: "QUnit test: AMD"
			},
			"amd/config_paths_relative/ui5loader": {
				page: "test-resources/sap/ui/core/qunit/loader/amd/config_paths_relative/ui5loader.qunit.html",
				title: "QUnit test: AMD"
			},
			amdAPIs: {
				page: "test-resources/sap/ui/core/qunit/loader/amdAPIs.qunit.html",
				title: "QUnit tests: ui5loader AMD APIs (global define/require)",
				sinon: {
					version: 4,
					qunitBridge: true
				},
				bootCore: false
			},
			/*
			 * asyncMode.qunit.html is still an HTML page of its own as it wants to test the loader
			 * without using the loader itself to setup the test.
			 * (The generic starter Test.qunit.html and runTest.js script both use the loader internally)
			 */
			asyncMode: {
				page: "test-resources/sap/ui/core/qunit/loader/asyncMode.qunit.html",
				title: "Test Page for Module Loading (ui5loader)",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				},
				sinon: {
					version: 1,
					qunitBridge: false
				},
				bootCore: false,
				autostart: false
			},
			config: {
				page: "test-resources/sap/ui/core/qunit/loader/config.qunit.html",
				title: "QUnit tests: Multiple AMD loaders"
			},
			exposeAsAMDLoaderByURL: {
				page: "test-resources/sap/ui/core/qunit/loader/exposeAsAMDLoader.qunit.html?sap-ui-amd=true&sap-ui-debug=true",
				title: "Test Page for ui5loader config option 'amd' with activated debug mode"
			},
			exposeAsAMDLoaderByAPI: {
				page: "test-resources/sap/ui/core/qunit/loader/exposeAsAMDLoader.qunit.html?sap-ui-debug=true",
				title: "Test Page for ui5loader config option 'amd' with activated debug mode"
			},
			/*
			 * syncMode.qunit.html is still an HTML page of its own as it tests sync loading.
			 * The generic starter Test.qunit.html only supports async loading.
			 */
			syncMode: {
				page: "test-resources/sap/ui/core/qunit/loader/syncMode.qunit.html",
				title: "Test Page for ui5loader (sync mode)",
				loader: {
					paths: {
						fixture: "fixture/"
					}
				},
				sinon: {
					version: 1,
					qunitBridge: true
				}
			}
		}
	};
});
