sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/BOOTSTRAP",
		defaults: {
			loader:{
				paths:{
					"polyfill": "test-resources/sap/ui/core/qunit/polyfill"
				}
			},
			qunit: {
				version: 2
			},
			coverage: {
				instrumenter: "istanbul"
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeServer: false,
				useFakeTimers: false
			}
		},
		tests: {
			/**
			 * @deprecated As of version 1.120
			 *
			 * DebugModeSync.qunit.html is still an HTML page of its own as the debug mode code
			 * wouldn't recognize the bootstrap script in the (dynamically enriched) Test.qunit.html
			 */
			"DebugMode (off, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeSync.qunit.html?sap-ui-debug=false",
				title: "Test Page for Debug Mode ({{mode}}, sync)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated As of version 1.120
			 */
			"DebugMode (partial, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeSync.qunit.html?sap-ui-debug=sap%2Fm%2FListBase,fixture%2Fdebug-mode%2F",
				title: "Test Page for Debug Mode ({{mode}}, sync)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated As of version 1.120
			 */
			"DebugMode (full, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeSync.qunit.html?sap-ui-debug=true",
				title: "Test Page for Debug Mode ({{mode}}, sync)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			/*
			 * DebugModeAsync.qunit.html is still an HTML page of its own as the debug mode code
			 * wouldn't recognize the bootstrap script in the (dynamically enriched) Test.qunit.html
			 */
			"DebugMode (off, async)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeAsync.qunit.html?sap-ui-debug=false",
				title: "Test Page for Debug Mode ({{mode}}, async)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			"DebugMode (partial, async)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeAsync.qunit.html?sap-ui-debug=sap%2Fm%2FListBase,fixture%2Fdebug-mode%2F",
				title: "Test Page for Debug Mode ({{mode}}, async)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			"DebugMode (full, async)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugModeAsync.qunit.html?sap-ui-debug=true",
				title: "Test Page for Debug Mode ({{mode}}, async)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"Bootstrap_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				title: "Test Page for the SAPUI5 Bootstrap functionality (legacy APIs)"
			},
			"BootstrapCustomBootTaskPreloadCss": {
				group: "Bootstrap",
				title: "Test Page for the SAPUI5 Bootstrap functionality with custom boot task and preload lib css",
				qunit: {
					version: 1,
					reorder: false
				},
				loader: {
					paths: {
						"fantasyLib": "test-resources/sap/ui/core/qunit/bootstrap/preloadedCss"
					}
				},
				beforeBootstrap: "./BootstrapCustomBootTaskPreloadCss.beforeBootstrap.qunit"
			},
			"BootstrapMainModule": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap within Head",
				bootCore: false,
				ui5: {
					onInit: "module:sap/ui/test/BootstrapMainModule"
				},
				loader: {
					paths: {
						"sap/ui/test": "test-resources/sap/ui/core/qunit/bootstrap/",
						"sap/ui/test/qunitPause": "resources/sap/ui/test/qunitPause",
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				},
				beforeBootstrap: "./BootstrapMainModule.beforeBootstrap"
			},
			"BootstrapMinimal": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapMinimal.qunit.html",
				title: "Minimal Bootstrap Code",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapMinimal_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapMinimal_legacyAPIs.qunit.html",
				title: "Minimal Bootstrap Code (legacy APIs)",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapPreloadSync_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				title: "Test Page for Bootstrap with preload=sync (legacy APIs)",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"],
					preload: "sync"
				},
				qunit: {
					reorder: false
				},
				module: "./BootstrapPreload_legacyAPIs.qunit"
			},
			"BootstrapPreloadAsync": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap with preload=async",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"]
				},
				qunit: {
					reorder: false
				},
				module: "./BootstrapPreload.qunit"
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapPreloadAsync_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				title: "Test Page for Bootstrap with preload=async (legacy APIs)",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"]
				},
				qunit: {
					reorder: false
				},
				module: "./BootstrapPreload_legacyAPIs.qunit"
			},
			"BootstrapPreloadAuto": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap with preload=auto",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"]
				},
				qunit: {
					reorder: false
				},
				beforeBootstrap: "./BootstrapPreloadAuto.beforeBootstrap.qunit",
				module: "./BootstrapPreload.qunit"
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapPreloadAuto_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				title: "Test Page for Bootstrap with preload=auto (legacy APIs)",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"]
				},
				qunit: {
					reorder: false
				},
				beforeBootstrap: "./BootstrapPreloadAuto.beforeBootstrap.qunit",
				module: "./BootstrapPreload_legacyAPIs.qunit"
			},
			"BootstrapWithCustomBootTask": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					theme: "SapSampleTheme1",
					libs: "sap.ui.core"
				},
				beforeBootstrap: "./BootstrapWithCustomBootTask.beforeBootstrap.qunit"
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapWithCustomScript_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithCustomScript_legacyAPIs.qunit.html",
				title: "Custom Bootstrap Code (legacy APIs)",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			"BootstrapWithNoJQuery-without-jquery-ui-position": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithNoJQuery-without-jquery-ui-position.qunit.html",
				title: "Custom Bootstrap Code",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapWithNoJQuery-without-jquery-ui-position_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithNoJQuery-without-jquery-ui-position_legacyAPIs.qunit.html",
				title: "Custom Bootstrap Code (legacy APIs)",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			"BootstrapWithNoJQuery": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithNoJQuery.qunit.html",
				title: "Custom Bootstrap Code",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapWithNoJQuery_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithNoJQuery_legacyAPIs.qunit.html",
				title: "Custom Bootstrap Code (legacy APIs)",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			"BootstrapWithinBody": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithinBody.qunit.html",
				title: "Test Page for Bootstrap within Body",
				ui5: {
					libs: "sap.m"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapWithinBody_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithinBody_legacyAPIs.qunit.html",
				title: "Test Page for Bootstrap within Body (legacy APIs)",
				ui5: {
					libs: "sap.m"
				}
			},
			"BootstrapWithinHead": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithinHead.qunit.html",
				title: "Test Page for Bootstrap within Head",
				ui5: {
					libs: "sap.m"
				}
			},
			/**
			 * @deprecated As of version 1.110
			 */
			"BootstrapWithinHead_legacyAPIs": {
				group: "Bootstrap (legacy APIs)",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithinHead_legacyAPIs.qunit.html",
				title: "Test Page for Bootstrap within Head (legacy APIs)",
				ui5: {
					libs: "sap.m"
				}
			},
			"CalendarClassLoading": {
				group: "Calendar Class",
				ui5: {
					language: "en",
					calendarType: "islamic",
					logLevel: "WARNING",
					noConflict: "true",
					libs: "sap.ui.core"
				}
			},
			"CalendarClassLoadingWithCustomBootTask": {
				group: "Calendar Class",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					libs: "sap.ui.core"
				},
				beforeBootstrap: "./CalendarClassLoadingWithCustomBootTask.beforeBootstrap.qunit"
			},
			/**
			 * @deprecated
			 */
			"CalendarClassLoadingWithCustomBootTask_legacyAPIs": {
				group: "Calendar Class",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					libs: "sap.ui.core"
				},
				beforeBootstrap: "./CalendarClassLoadingWithCustomBootTask.beforeBootstrap_legacy.qunit",
				module: "./CalendarClassLoadingWithCustomBootTask.qunit"
			},
			"CalendarClassLoadingWithCustomBootTaskAndPreload": {
				group: "Calendar Class",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					libs: "sap.ui.core",
					preload: "async"
				},
				beforeBootstrap: "./CalendarClassLoadingWithCustomBootTask.beforeBootstrap.qunit"
			},
			/**
			 * @deprecated
			 */
			"CalendarClassLoadingWithCustomBootTaskAndPreload_legacyAPIs": {
				group: "Calendar Class",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					libs: "sap.ui.core",
					preload: "async"
				},
				beforeBootstrap: "./CalendarClassLoadingWithCustomBootTask.beforeBootstrap_legacy.qunit",
				module: "./CalendarClassLoadingWithCustomBootTaskAndPreload.qunit"
			},
			"ControlBehavior": {
				title: "Test Page for ControlBehavior",
				group: "Configuration",
				coverage: {
					only: ["sap/ui/core/ControlBehavior"]
				}
			},
			/**
			 * @deprecated
			 */
			"Configuration": {
				autostart: false,
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/Configuration.qunit.html",
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated
			 */
			"ConfigurationFlexibility_LibLoaded_legacyAPIs": {
				autostart: false,
				group: "Configuration",
				qunit: {
					reorder: false
				},
				ui5: {
					"flexibilityservices": '[{"connector": "KeyUser", "url": "/some/url", "laverFilters": []}]'
				}
			},
			/**
			 * @deprecated
			 */
			"ConfigurationFlexibility_LoadLibUrl_legacyAPIs": {
				autostart: false,
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ConfigurationFlexibility_LibLoaded_legacyAPIs.qunit.html?sapUiFlexibilityServices=" + encodeURI('[{"connector":"KeyUser","url": "/some/url","laverFilters":[]}]'),
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated
			 */
			"ConfigurationFlexibility_LoadLibUrl_SkipAutomatic_legacyAPIs": {
				autostart: false,
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ConfigurationFlexibility_LibNotLoaded_legacyAPIs.qunit.html?sapUiXxSkipAutomaticFlLibLoading=true&sapUiFlexibilityServices=" + encodeURI('[{"connector":"KeyUser","url": "/some/url","laverFilters":[]}]'),
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated
			 */
			"ConfigurationFlexibility_DefaultDoesNotLoadLib_legacyAPIs": {
				autostart: false,
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ConfigurationFlexibility_LibNotLoaded_legacyAPIs.qunit.html",
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated
			 */
			"ConfigurationFlexibility_LibConfigured_legacyAPIs": {
				autostart: false,
				group: "Configuration",
				qunit: {
					reorder: false
				},
				ui5: {
					"libs": 'sap.ui.fl'
				}
			},
			/**
			 * @deprecated
			 */
			"Configuration_language_via_URL": {
				group: "Configuration",
				qunit: {
					reorder: false
				}
			},
			"PreloadCfg-optimized-ui5loader-async": {
				group: "Configuration",
				loader: {
					async: true
				},
				ui5: {

				},
				beforeBootstrap: "./PreloadCfg.beforeBootstrap.qunit",
				module: "./PreloadCfg.qunit"
			},

			/**
			 * @deprecated
			 */
			"PreloadCfg-optimized-ui5loader-sync": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/PreloadCfg-optimized-sync.qunit.html"
			},
			"PreloadCfg-debug-ui5loader-async": {
				group: "Configuration",
				loader: {
					async: true
				},
				ui5: {
					debug: true
				},
				module: "./PreloadCfg.qunit"
			},
			/**
			 * @deprecated
			 */
			"PreloadCfg-debug-ui5loader-sync": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/PreloadCfg-debug-sync.qunit.html"
			},
			"ResourceRoot_ResourcesURL_ResOnly": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_ResourcesURL_ResOnly.qunit.html",
				title: "Test Page for Resource Root when 'src' starts with 'resources/'"
			},
			"ResourceRoot_ResourcesURL_Standard": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_ResourcesURL_Standard.qunit.html",
				title: "Test Page for Resource Root when 'src' starts with 'resources/'"
			},
			"ResourceRoot_SapUiBootURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiBootURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-boot.js' but no 'resources/'"
			},
			"ResourceRoot_SapUiBootWithExtURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiBootWithExtURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-boot-some-ext.js' but no 'resources/'"
			},
			"ResourceRoot_SapUiCoreURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiCoreURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-core.js' but no 'resources/'"
			},
			"ResourceRoot_SapUiCoreWithExtURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiCoreWithExtURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-core-some-ext.js' but no 'resources/'"
			},
			"ResourceRoot_SapUiCustomURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiCustomURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-custom.js' but no 'resources/'"
			},
			"ResourceRoot_SapUiCustomWithExtURL": {
				group: "Resource Root Determination",
				page: "test-resources/sap/ui/core/qunit/bootstrap/ResourceRoot_SapUiCustomWithExtURL.qunit.html",
				title: "Test Page for Resource Root when 'src' contains 'sap-ui-custom-some-ext.js' but no 'resources/'"
			},
			"SyncBootstrapWithCustomBootTask_unavoidablySync": {
				page: "test-resources/sap/ui/core/qunit/bootstrap/SyncBootstrapWithCustomBootTask_unavoidablySync.qunit.html",
				group: "Bootstrap",
				bootCore: false
			},
			"ThemeVersion-off-async": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - off - async",
				ui5: {
					libs: ["sap.ui.core"],
					language: "en",
					preload: "async",
					theme: "base",
					versionedLibCss: false,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			/**
			 * @deprecated
			 */
			"ThemeVersion-off-sync": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - off - sync",
				ui5: {
					language: "en",
					preload: "sync",
					theme: "base",
					versionedLibCss: false,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-on-async-customcss": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - async (with custom.css)",
				ui5: {
					libs: ["sap.ui.core"],
					language: "en",
					preload: "async",
					theme: "customcss",
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					},
					versionedLibCss: true,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit",
				qunit: {
					reorder: false
				}
			},
			"ThemeVersion-on-async": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - async",
				ui5: {
					libs: ["sap.ui.core"],
					language: "en",
					theme: "base",
					preload: "async",
					versionedLibCss: true,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			/**
			 * @deprecated As of version 1.111
			 */
			"ThemeVersion-on-sync-customcss": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - sync (with custom.css)",
				ui5: {
					language: "en",
					preload: "sync",
					theme: "customcss",
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					},
					versionedLibCss: true,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			/**
			 * @deprecated As of version 1.111
			 */
			"ThemeVersion-on-sync": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - sync",
				ui5: {
					theme: "base",
					language: "en",
					preload: "sync",
					versionedLibCss: true,
					XxWaitForTheme: "init"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"polyfill/ComputedStyle": {
				group: "Polyfills",
				title: "Test Page for the getComputedStyle polyfill functionality",
				module: "polyfill/ComputedStyle.qunit"
			},
			/**
			 * @deprecated since 1.85
			 */
			"polyfill/es6-object-assign": {
				group: "Polyfills",
				title: "Test Page for shallow object extension using Object.assign (polyfill)",
				module: "polyfill/es6-object-assign.qunit"
			}
		}
	};
});
