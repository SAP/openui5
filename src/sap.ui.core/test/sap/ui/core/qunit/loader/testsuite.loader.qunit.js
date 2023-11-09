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
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeTimers: false
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
				bootCore: false
			},
			/*
			 * asyncMode.qunit.html is still an HTML page of its own as it wants to test the loader
			 * without using the loader itself to setup the test.
			 * (The generic starter Test.qunit.html and runTest.js script both use the loader internally)
			 */
			asyncMode: {
				/* separate test page as it only wants the loader, no core */
				page: "test-resources/sap/ui/core/qunit/loader/asyncMode.qunit.html",
				title: "Test Page for Module Loading (ui5loader)",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				},
				bootCore: false,
				autostart: false
			},
			/*
			 * legacy-relevant:
			 * Test-cases for...
			 *   - conflict behavior of requireSync when in loader is configured async-mode.
			 *   - Error-handling
			 *
			 * asyncMode_unavoidablySync.qunit.html is still an HTML page of its own as it wants to test the loader
			 * without using the loader itself to setup the test.
			 * (The generic starter Test.qunit.html and runTest.js script both use the loader internally)
			 */
			"asyncMode_legacyAPIs": {
				/* separate test page as it only wants the loader, no core */
				page: "test-resources/sap/ui/core/qunit/loader/asyncMode_legacyAPIs.qunit.html",
				title: "Test Page for Module Loading (ui5loader)",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				},
				bootCore: false,
				autostart: false
			},
			/*
			 * asyncMode_unmanagedDefine.qunit.html is still an HTML page of its own as it wants to test the loader
			 * without using the loader itself to setup the test.
			 * (The generic starter Test.qunit.html and runTest.js script both use the loader internally)
			 */
			"asyncMode_unmanagedDefine": {
				/* separate test page as it only wants the loader, no core */
				page: "test-resources/sap/ui/core/qunit/loader/asyncMode_unmanagedDefine.qunit.html",
				title: "Test Page for Module Loading (ui5loader)",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				},
				bootCore: false,
				autostart: false
			},

			/**
			 * @deprecated As of version 1.111
			 */
			asyncModeUsingCoreFeatures: {
				title: "Test Page for Module Loading (ui5loader), using Core features",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				},
				ui5: {
					preload: "async"
				}
			},
			config: {
				page: "test-resources/sap/ui/core/qunit/loader/config.qunit.html",
				title: "QUnit tests: Multiple AMD loaders"
			},
			conflictWithRequire: {
				title: "QUnit tests: conflict between require.js and ui5loader",
				bootCore: false,
				qunit: {
					reorder: false
				},
				sinon: false
			},
			// legacy-relevant: sync path tests
			"conflictWithRequire_unavoidablySync": {
				page: "test-resources/sap/ui/core/qunit/loader/conflictWithRequire_unavoidablySync.qunit.html",
				title: "QUnit tests: conflict between require.js and ui5loader (sync)"
			},
			exposeAsAMDLoaderByURL: {
				page: "test-resources/sap/ui/core/qunit/loader/exposeAsAMDLoader.qunit.html?sap-ui-amd=true&sap-ui-debug=true",
				title: "Test Page for ui5loader config option 'amd' with activated debug mode"
			},
			exposeAsAMDLoaderByAPI: {
				page: "test-resources/sap/ui/core/qunit/loader/exposeAsAMDLoader.qunit.html?sap-ui-debug=true",
				title: "Test Page for ui5loader config option 'amd' with activated debug mode"
			},
			privateAPIs: {
				bootCore: false
			},
			/*
			 * legacy-relevant:
			 * syncMode_unavoidablySync.qunit.html is still an HTML page of its own as it tests sync loading.
			 * The generic starter Test.qunit.html only supports async loading.
			 */
			"syncMode_unavoidablySync": {
				page: "test-resources/sap/ui/core/qunit/loader/syncMode_unavoidablySync.qunit.html",
				title: "Test Page for ui5loader (sync mode)",
				loader: {
					paths: {
						'fixture': 'test-resources/sap/ui/core/qunit/loader/fixture/'
					}
				}
			},
			// legacy-relevant: sync path tests
			"syncModuleDefinition_unavoidablySync": {
				page: "test-resources/sap/ui/core/qunit/loader/syncModuleDefinition_unavoidablySync.qunit.html",
				title: "Test Page for ui5loader synchronous module definition"
			}
		}
	};
});
