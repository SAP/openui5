sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";
	return {
		name: "TestSuite for Topic: Theming",
		defaults: {
			loader: {
				paths: {
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/",
					"testlibs/themeParameters": "test-resources/sap/ui/core/qunit/testdata/libraries/themeParameters",
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			coverage: {
				instrumenter: "istanbul",
				only: ["sap/ui/core/Theming", "sap/ui/core/theming"]
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit",
			ui5: {
				libs: ["sap.ui.core"]
			}
		},
		tests: {
			CustomThemeFallback: {
				title: "sap.ui.core: Custom Theme Fallback",
				ui5: {
					theme: "customcss",
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"extendedfallback": ""
					}
				}
			},
			CustomThemeFallbackFromURL: {
				title: "sap.ui.core: Custom Theme Fallback extracted from URL",
				ui5: {
					libs: ["sap.ui.core", "sap.m"],
					theme: "fallbackfromurl",
					themeRoots: {
						"fallbackfromurl": {
							"sap.ui.core": "themeroot/v1/~v=Base:11.1.41,*.*.opensap(sap_fiori_3):20220407T073020Z/UI5"
						},
						"2nd_tier_fallback_from_url": {
							"sap.ui.core": "themeroot/v1/~v=Base:11.1.41,*.*.opensap(sap_unsupported_hcw):20220407T073020Z/UI5"
						}
					}
				}
			},
			CustomThemeFallback_unavoidablySync: {
				title: "sap.ui.core: Custom Theme Fallback",
				ui5: {
					theme: "customcss",
					themeRoots: {
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				}
			},
			ThemeManager: {
				title: "sap.ui.core.theming.ThemeManager",
				ui5: {
					libs: "sap.ui.core,sap.ui.testlib",
					themeRoots: {
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customTheme": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/libraries/customCss/"
						}
					}
				},
				loader: {
					paths: {
							"sap/ui/customthemefallback/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-custom-theme-fallback/",
							"sap/ui/failingcssimport/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-failing-css-import/",
							"testlibs/customCss/lib1" : "test-resources/sap/ui/core/qunit/testdata/libraries/customCss/lib1/"
					}
				}
			},
			/**
			 * Note: Contains tests for sync and async APIs, combined with legacy Core#loadLibrary.
			 */
			"ThemeParameters_legacyAPIs": {
				title: "sap.ui.core.theming.Parameters",
				ui5: {
					theme: "sap_horizon_hcb"
				},
				qunit: {
					reorder: false
				},
				loader: {
					paths: {
						"sap/ui/legacy/testlib": "test-resources/sap/ui/core/qunit/testdata/legacy-uilib_legacyAPIs/",
						"testlibs/themeParameters": "test-resources/sap/ui/core/qunit/testdata/libraries/themeParameters"
					}
				}
			},
			/**
			 * Note: Only contains modern non-deprecated APIs.
			 */
			ThemeParameters: {
				title: "sap.ui.core.theming.Parameters - Async Only",
				ui5: {
					theme: "sap_horizon_hcb"
				},
				qunit: {
					reorder: false
				},
				loader: {
					paths: {
						"testlibs/themeParameters": "test-resources/sap/ui/core/qunit/testdata/libraries/themeParameters"
					}
				}
			},
			"ThemeHelper": {
				title: "sap.ui.core.theming.ThemeHelper",
				ui5: {
					theme: "sap_horizon_hcb"
				},
				qunit: {
					reorder: false
				},
				loader: {
					paths: {
						"testlibs/themeParameters": "test-resources/sap/ui/core/qunit/testdata/libraries/themeParameters"
					}
				}
			},
			"Theming": {
				title: "sap.ui.core.Theming",
				ui5: {
					theme: "", // Note: this is intentionally an empty string, regression test for theme defaulting
					themeRoots: {
						"theme_with_initial_themeRoot": "/somewhere/outside"
					}
				},
				qunit: {
					reorder: false
				}
			},
			"ThemingWoThemeManager": {
				title: "sap.ui.core.Theming w/o sap.ui.core.theming.ThemeManager",
				ui5: {
					theme: "", // Note: this is intentionally an empty string, regression test for theme defaulting
					themeRoots: {
						"theme_with_initial_themeRoot": "/somewhere/outside"
					}
				},
				testConfig: {
					themeManagerNotActive: true
				},
				qunit: {
					reorder: false
				},
				beforeBootstrap: "testdata/core/Theming.beforeBootstrap.qunit",
				module: "testdata/core/Theming.qunit"
			},
			"Theming_default_and_fallback": {
				title: "sap.ui.core.Theming - defaulting and fallbacks",
				ui5: {
					theme: "sap_goldreflection" // Note: deprecated and deleted theme: used for fallback test!
				},
				qunit: {
					reorder: false
				}
			},
			"Theming_default_and_fallback_wo_ThemeManager": {
				title: "sap.ui.core.Theming - defaulting and fallbacks",
				ui5: {
					theme: "sap_goldreflection" // Note: deprecated and deleted theme: used for fallback test!
				},
				testConfig: {
					themeManagerNotActive: true
				},
				qunit: {
					reorder: false
				},
				beforeBootstrap: "testdata/core/Theming.beforeBootstrap.qunit",
				module: "testdata/core/Theming_default_and_fallback.qunit"
			},
			ThemeManagerPreloadCss: {
				page: "test-resources/sap/ui/core/qunit/Theming_preloadedCss.qunit.html"
			}
		}
	};
});
