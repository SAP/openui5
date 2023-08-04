sap.ui.define(["sap/ui/Device"], function(Device) {

	"use strict";
	return {
		name: "TestSuite for Topic: Theming",
		defaults: {
			loader: {
				paths: {
					"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/",
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
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
						}
					}
				}
			},
			ThemeCheck: {
				title: "sap.ui.core.ThemeCheck",
				ui5: {
					libs: "sap.ui.core,sap.ui.testlib",
					themeRoots: {
						"legacy": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				},
				loader: {
					paths: {
							"sap/ui/customthemefallback/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-custom-theme-fallback/",
							"sap/ui/failingcssimport/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib-failing-css-import/"
					}
				}
			},
			ThemeParameters: {
				title: "sap.ui.core.theming.Parameters",
				ui5: {
					libs: "sap.ui.legacy.testlib",
					theme: "sap_hcb"
				},
				loader: {
					paths: {
						"sap/ui/legacy/testlib": "test-resources/sap/ui/core/qunit/testdata/legacy-uilib/"
					}
				}
			},
			"Theming_default_and_fallback": {
				title: "Theming - defaulting and fallbacks",
				ui5: {
					theme: "sap_goldreflection" // Note: deprecated and deleted theme: used for fallback test!
				},
				qunit: {
					reorder: false
				}
			}
		}
	};
});
