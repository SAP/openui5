sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CORE",
		defaults: {
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {
			Core: {
				title: "sap.ui.core.Core",
				loader: {
					paths: {
						testlibs: "test-resources/sap/ui/core/qunit/testdata/libraries/"
					}
				},
				ui5: {
					language: "en_US",
					theme: "test_theme",
					themeRoots: {
						"my_preconfigured_theme" : "http://preconfig.com/ui5-themes",
						"my_second_preconfigured_theme" : {
							"sap.m" : "http://mobile.preconfig.com/ui5-themes",
							"" : "http://preconfig.com/ui5-themes",
							"sap.ui.core" : "http://core.preconfig.com/ui5-themes"
						},
						"my_third_preconfigured_theme": "http://third.preconfig.com/ui5-themes"
					}
				}
			},

			/**
			 * The tests for the preload files all share the same test configuration.
			 * There is only one HTML test page, which is opened with different URL parameters.
			 * The HTML test page then points to this general configuration.
			 */
			Core_libraryPreloadFiles: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=none",
				loader: {
					paths: {
						testlibs: "testdata/libraries/"
					}
				}
			},

			Core_libraryPreloadFiles2: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js"
			},

			Core_libraryTerminologies: {
				title: "sap.ui.core: library preload with Terminologies=",
				loader: {
					paths: {
						testlibs: "test-resources/sap/ui/core/qunit/testdata/libraries/"
					}
				},
				ui5: {
					preload: "async",
					language: "en",
					activeterminologies: "oil,retail"
				}
			},

			Core_libraryTerminologies_integration: {
				title: "sap.ui.core: Integration Test with Library Terminologies=",
				loader: {
					paths: {
						"terminologies/sample": "test-resources/sap/ui/core/qunit/testdata/libraries/terminologies/integration"
					}
				},
				ui5: {
					async: true,
					language: "en",
					preload: "async",
					activeterminologies: "transportation"
				}
			},

			Core_repeatedExecution: {
				title: "sap.ui.core.Core: Repeated execution",
				bootCore: false
			},

			Lib: {
				title: "sap.ui.core: Unit tests for class sap/ui/core/Lib",
				loader: {
					paths: {
						testlibs: "test-resources/sap/ui/core/qunit/testdata/libraries/"
					}
				},
				ui5: {
					preload: "async"
				}
			}
		}
	};
});
