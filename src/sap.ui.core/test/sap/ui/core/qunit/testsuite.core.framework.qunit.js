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
				/**
				 * Due to several tests (e.g. 'loadLibraries: multiple libraries (async, preloads are deactivated)') a separate HTML page is needed.
				 * The root cause is related to async loading behavior via script tags of the ui5 loader.
				 */
				page: "test-resources/sap/ui/core/qunit/Core.qunit.html"
			},
			CoreLock: {
				title: "sap.ui.core.Core: Core unlocks unconditionally itself upon load/init",
				ui5: {
					libs: "sap.m"
				}
			},
			/**
			 * The tests for the preload files all share the same test configuration.
			 * There is only one HTML test page, which is opened with different URL parameters.
			 * The HTML test page then points to this general configuration.
			 */
			Core_libraryPreloadFiles: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both",
				loader: {
					paths: {
						testlibs: "testdata/libraries/"
					}
				}
			},
			Core_libraryPreloadFiles2: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles3: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=both,testlibs.scenario7.lib4:none,testlibs.scenario8.lib4:none,testlibs.scenario7.lib5:none,testlibs.scenario8.lib5:none"
			},
			Core_libraryPreloadFiles4: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js"
			},
			Core_libraryPreloadFiles5: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=js,testlibs.scenario7.lib2:json,testlibs.scenario8.lib2:json,testlibs.scenario7.lib3:none,testlibs.scenario8.lib3:none"
			},
			Core_libraryPreloadFiles6: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=json"
			},
			Core_libraryPreloadFiles7: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=json,testlibs.scenario7.lib2:none,testlibs.scenario8.lib2:none,testlibs.scenario7.lib3:js,testlibs.scenario8.lib3:js"
			},
			Core_libraryPreloadFiles8: {
				title: "sap.ui.core: library preload with libraryPreloadFiles=",
				page: "test-resources/sap/ui/core/qunit/Core_libraryPreloadFiles.qunit.html?sap-ui-xx-libraryPreloadFiles=none"
			},
			Core_repeatedExecution: {
				title: "sap.ui.core.Core: Repeated execution",
				bootCore: false
			}
		}
	};
});
