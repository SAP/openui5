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
			 * legacy-relevant
			 * Test cases for:
			 *   - Loading of library resource bundle (sync)
			 *   - Loading of library resource bundle (mixture of sync and async)
			 *   - Loading of library (sync)
			 *   - Loading of library (mixture of sync and async)
			 *   - Loading of library with library preload in JSON format
			 */
			Core_unavoidablyUsingEval: {
				title: "sap.ui.core.Core - Tests using eval",
				/**
				 * Due to several tests using MockServer (e.g. 'loadLibraries: multiple libraries (async, preloads are
				 * deactivated)') a separate HTML page is needed.
				 *
				 * Running with the central test runner without using a separate HTML page, ui5loader works in the async
				 * mode where JavaScript dependencies are loaded with "script" tag which can't be intercepted by the
				 * mock server. Therefore a separate HTML page with ui5loader working in sync mode is needed.
				 */
				page: "test-resources/sap/ui/core/qunit/Core_unavoidablyUsingEval.qunit.html"
			},
			/**
			 * legacy-relevant:
			 * The following tests covers the different combinations of the legacy configuration to allow libraries to
			 * configure whether they use the JS or JSON format for their library preload.
			 *
			 * The tests for the preload files all share the same test configuration.
			 * There is only one HTML test page, which is opened with different URL parameters.
			 * The HTML test page then points to this general configuration.
			 */
			Core_libraryPreloadFiles_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=both",
				loader: {
					paths: {
						testlibs: "testdata/libraries/"
					}
				}
			},
			Core_libraryPreloadFiles2_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles3_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib4:none,testlibs.scenario8.lib4:none,testlibs.scenario7.lib5:none,testlibs.scenario8.lib5:none"
			},
			Core_libraryPreloadFiles4_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=js"
			},
			Core_libraryPreloadFiles5_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=js,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:none,testlibs.scenario8.lib3:none"
			},
			Core_libraryPreloadFiles6_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=json"
			},
			Core_libraryPreloadFiles7_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=json,testlibs.scenario7.lib2:none,testlibs.scenario8.lib2:none,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles8_unavoidablyUsingEval: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles_unavoidablyUsingEval.qunit.html?sap-ui-xx-libraryPreloadFiles=none"
			},

			/**
			 * @deprecated As of version 1.119, together with Core#getLibraryResourceBundle
			 */
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

			Core_libraryTerminologies_unavoidablySync: {
				title: "sap.ui.core: (sync) library preload with Terminologies=",
				loader: {
					paths: {
						testlibs: "test-resources/sap/ui/core/qunit/testdata/libraries/"
					}
				},
				ui5: {
					language: "en",
					preload: "sync",
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

			/**
			 * @deprecated As of version 1.120
			 */
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
			},

			Lib_terminologies: {
				title: "sap.ui.core: library preload with Terminologies",
				loader: {
					paths: {
						testlibs: "test-resources/sap/ui/core/qunit/testdata/libraries/"
					}
				},
				ui5: {
					preload: "async", // required to enforce preloads in local dev scenario
					language: "en",
					activeterminologies: "oil,retail"
				}
			},

			/**
			 * The tests for the preload files all share the same test configuration.
			 * There is only one HTML test page, which is opened with different URL parameters.
			 * The HTML test page then points to this general configuration.
			 */
			Lib_preloadFiles: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Lib_preloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=none",
				loader: {
					paths: {
						testlibs: "testdata/libraries/"
					}
				}
			},
			Lib_preloadFiles2: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Lib_preloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js"
			}
		}
	};
});
