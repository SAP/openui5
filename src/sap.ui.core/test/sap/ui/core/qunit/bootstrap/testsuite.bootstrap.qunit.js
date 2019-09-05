sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/BOOTSTRAP",
		defaults: {
			ui5: {
				theme: "sap_belize"
			},
			loader:{
				paths:{
					"polyfill": "test-resources/sap/ui/core/qunit/polyfill"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4,
				qunitBridge: true,
				useFakeServer: false,
				useFakeTimers: false
			}
		},
		tests: {
			/*
			 * DebugMode.qunit.html is still an HTML page of its own as the debug mode code
			 * wouldn't recognize the bootstrap script in the (dynamically enriched) Test.qunit.html
			 */
			"DebugMode (off, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugMode.qunit.html?sap-ui-debug=false",
				title: "Test Page for Debug Mode ({{mode}}, sync)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			"DebugMode (partial, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugMode.qunit.html?sap-ui-debug=sap%2Fm%2FListBase,fixture%2Fdebug-mode%2F",
				title: "Test Page for Debug Mode ({{mode}}, sync)",
				ui5: {
					libs: "sap.m"
				},
				qunit: {
					reorder: false
				}
			},
			"DebugMode (full, sync)": {
				group: "DebugMode",
				page: "test-resources/sap/ui/core/qunit/bootstrap/DebugMode.qunit.html?sap-ui-debug=true",
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
			"Bootstrap": {
				group: "Bootstrap",
				title: "Test Page for the SAPUI5 Bootstrap functionality"
			},
			"BootstrapCustomBootTaskPreloadCss": {
				group: "Bootstrap",
				title: "Test Page for the SAPUI5 Bootstrap functionality with custom boot task and preload lib css",
				qunit: {
					version: 1
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
						"sap/ui/test/RecorderHotkeyListener": "resources/sap/ui/test/RecorderHotkeyListener"
					}
				}
			},
			"BootstrapMinimal": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapMinimal.qunit.html",
				title: "Minimal Bootstrap Code",
				ui5: {
					libs: "sap.m,sap.ui.layout"
				}
			},
			"BootstrapPreload": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap with preload=sync",
				ui5: {
					libs: ["sap.ui.layout", "sap.m", "sap.ui.table"],
					preload: "sync"
				},
				qunit: {
					reorder: false
				},
				module: "./BootstrapPreload.qunit"
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
			"BootstrapWithCustomBootTask": {
				group: "Bootstrap",
				title: "Test Page for Bootstrap with a Custom Boot Task",
				ui5: {
					libs: "sap.ui.core"
				},
				beforeBootstrap: "./BootstrapWithCustomBootTask.beforeBootstrap.qunit"
			},
			"BootstrapWithCustomScript": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithCustomScript.qunit.html",
				title: "Custom Bootstrap Code",
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
			"BootstrapWithNoJQuery": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithNoJQuery.qunit.html",
				title: "Custom Bootstrap Code",
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
			"BootstrapWithinHead": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/BootstrapWithinHead.qunit.html",
				title: "Test Page for Bootstrap within Head",
				ui5: {
					libs: "sap.m"
				}
			},
			"CfgDefaults": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/CfgDefaults.qunit.html"
			},
			"CfgFromConfigAttribute": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/CfgFromConfigAttribute.qunit.html"
			},
			"CfgFromGlobalObject": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/CfgFromGlobalObject.qunit.html"
			},
			"CfgFromTagAttributes": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/CfgFromTagAttributes.qunit.html",
				ui5: {
					libs: "sap.m",
					theme: "fantasy",
					language: "klingon"
				}
			},
			"Configuration": {
				group: "Configuration",
				ui5: {
					language: "en",
					calendarType: "islamic",
					logLevel: "WARNING",
					noConflict: "true",
					libs: "sap.ui.core"
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
			"PreloadCfg-debug-ui5loader-sync": {
				group: "Configuration",
				page: "test-resources/sap/ui/core/qunit/bootstrap/PreloadCfg-debug-sync.qunit.html"
			},
			"PegasusEnvironment": {
				group: "Bootstrap",
				page: "test-resources/sap/ui/core/qunit/bootstrap/PegasusEnvironment.qunit.html",
				title: "Test Page that boots SAPUI5 dynamically using XHR",
				qunit: {
					version: 1
				}
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
			"ThemeVersion-off-async": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - off - async",
				ui5: {
					theme: "base",
					language: "en",
					preload: "async"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-off-sync": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - off - sync",
				ui5: {
					theme: "base",
					language: "en",
					preload: "sync"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-on-async-customcss": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - async (with custom.css)",
				ui5: {
					theme: "customcss",
					language: "en",
					preload: "async"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-on-async": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - async",
				ui5: {
					theme: "base",
					language: "en",
					preload: "async"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-on-sync-customcss": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - sync (with custom.css)",
				ui5: {
					theme: "customcss",
					language: "en",
					preload: "sync"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"ThemeVersion-on-sync": {
				group: "Theme Versioning",
				title: "QUnit Page for Theme Version Parameter - on - sync",
				ui5: {
					theme: "base",
					language: "en",
					preload: "sync"
				},
				beforeBootstrap: "./ThemeVersion.beforeBootstrap.qunit",
				module: "./ThemeVersion.qunit"
			},
			"polyfill/ComputedStyle": {
				group: "Polyfills",
				title: "Test Page for the getComputedStyle polyfill functionality",
				module: "polyfill/ComputedStyle.qunit"
			},
			"polyfill/es6-object-assign": {
				group: "Polyfills",
				title: "Test Page for shallow object extension using Object.assign (polyfill)",
				module: "polyfill/es6-object-assign.qunit"
			}
		}
	};
});
