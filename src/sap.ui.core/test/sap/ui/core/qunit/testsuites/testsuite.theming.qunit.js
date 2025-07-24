sap.ui.define([], function() {

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
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/libraries/customCss/",
							"testlibs.customCss.lib2": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				loader: {
					paths: {
							"sap/ui/customthemefallback/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-custom-theme-fallback/",
							"sap/ui/failingcssimport/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-failing-css-import/",
							"testlibs/customCss/lib1" : "test-resources/sap/ui/core/qunit/testdata/libraries/customCss/lib1/",
							"testlibs/customCss/lib2" : "test-resources/sap/ui/core/qunit/testdata/libraries/customCss/lib2/"
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

			"Theming_default_and_fallback": {
				title: "sap.ui.core.Theming - defaulting and fallbacks",
				ui5: {// Note: deprecated and deleted theme: used for fallback test!
				},
				qunit: {
					reorder: false
				}
			},

			ThemeManagerPreloadCss: {
				page: "test-resources/sap/ui/core/qunit/Theming_preloadedCss.qunit.html"
			}
		}
	};
});
