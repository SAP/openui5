sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for Topic: Control Framework",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.ui": {
				page: "test-resources/sap/ui/core/qunit/jquery.sap.ui.qunit.html",
				title: "jquery.sap.ui"
			},
			BlockLayerUtils: {
				title: "sap.ui.core.BlockLayerUtils",
				ui5: {
					libs: "sap.m"
				}
			},
			"util/BusyIndicator": {
				title: "sap.ui.core.BusyIndicator"
			},
			"util/BusyIndicatorRTL": {
				title: "sap.ui.core.BusyIndicator (RTL)",
				ui5: {
					rtl: true,
					"xx-waitForTheme": "init"
				}
			},
			ControlDefinition: {
				title: "sap.ui.core.Control (ControlDefinition)",
				qunit: {
					reorder: false // tests are depending on each other
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				ui5: {
					libs: "sap.m"
				}
			},
			/**
			 * @deprecated since 1.120
			 */
			ControlRenderer: {
				title: "sap.ui.core.Control (ControlRenderer)"
			},
			CustomStyleClassSupport: {
				title: "sap.ui.core.CustomStyleClassSupport",
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				ui5: {
					libs: "sap.ui.testlib", // only required to establish a CSS scope 'sapTestScope'
					theme: "test_theme_scoped"
				}
			},
			DuplicateIds: {
				title: "sap.ui.core: Duplicate ID checks"
			},
			/**
			 * @deprecated As of Version 1.120
			 */
			DuplicateIds_noError: {
				title: "sap.ui.core: Duplicate ID checks (with errors disabled)",
				ui5: {
					noDuplicateIds: false
				}
			},
			Element: {
				title: "sap.ui.core.Element",
				loader:{
					paths:{
						"testdata/core": "test-resources/sap/ui/core/qunit/"
					}
				},
				qunit: {
					versions : {
						"2.18" : {
							module : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18",
							css : "test-resources/sap/ui/core/qunit/thirdparty/qunit-2.18.css"
						}
					},
					version : "2.18",
					reorder : false
				},
				module: [
					"testdata/core/Element_base.qunit",
					"testdata/core/Element_base_legacyAPIs.qunit",
					"testdata/core/Element_contextualSettings.qunit",
					"testdata/core/Element_data.qunit",
					"testdata/core/Element_delegates.qunit",
					"testdata/core/Element_dependents.qunit",
					"testdata/core/Element_destroy.qunit",
					"testdata/core/Element_closestTo.qunit",
					"testdata/core/Element_focus.qunit",
					"testdata/core/Element_layoutData.qunit",
					"testdata/core/Element_metadata_dnd.qunit",
					"testdata/core/Element_metadata_renderer.qunit",
					"testdata/core/Element_metadata_selector.qunit",
					"testdata/core/Element_sourceInfo.qunit"
				]
			},
			IconPool: {
				title: "sap.ui.core.IconPool",
				ui5: {
					libs: "sap.ui.core,sap.m"
				},
				loader: {
					paths: {
						"testdata/iconfonts": "test-resources/sap/ui/core/qunit/testdata"
					}
				}
			},
			"IconPool-custom-theme": {
				title: "sap.ui.core.IconPool: Custom theme",
				ui5: {
					theme: "customcss",
					themeRoots: {
						"base": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						},
						"customcss": {
							"sap.ui.core": "test-resources/sap/ui/core/qunit/testdata/customcss/"
						}
					}
				}
			},
			"util/InvisibleMessage": {
				title : "sap.ui.core.InvisibleMessage"
			},
			"util/LabelEnablement": {
				title: "sap.ui.core.LabelEnablement"
			},
			Patcher: {
				title: "sap.ui.core.Patcher"
			},
			PlaceAt: {
				title: "sap.ui.core: Control.placeAt / Core.setRoot",
				ui5: {
					libs: "sap.m",
					language: "en"
				}
			},
			"util/Popup": {
				title: "sap.ui.core.Popup",
				page: "test-resources/sap/ui/core/qunit/util/Popup.qunit.html",
				qunit: {
					reorder: false
				}
			},
			"util/Popup-rtl": {
				title: "sap.ui.core.Popup",
				page: "test-resources/sap/ui/core/qunit/util/Popup.qunit.html?sap-ui-rtl=true",
				qunit: {
					reorder: false
				}
			},
			Rendering: {
				title: "sap.ui.core.Rendering",
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				qunit: {
					"reorder": false // one test expects to run without any previous rendering action
				},
				ui5: {
					libs: "sap.ui.testlib"
				}
			},
			RenderManager: {
				title: "sap.ui.core.RenderManager"
			},
			ResizeHandler: {
				title: "sap.ui.core.ResizeHandler",
				qunit: {
					reorder: false
				},
				ui5: {
					theme: "base"
				}
			},
			StashedControlSupport: {
				title: "sap.ui.core.StashedControlSupport",
				loader: {
					paths: {
						"testdata/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by async tests
						test: "test-resources/sap/ui/core/qunit/"
					}
				}
			},
			StashedControlSupport_unavoidablySync: {
				title: "sap.ui.core.StashedControlSupport_unavoidablySync",
				loader: {
					paths: {
						"testdata/mvc": "test-resources/sap/ui/core/qunit/mvc/testdata", // used by async tests
						test: "test-resources/sap/ui/core/qunit/"
					}
				}
			},
			UIArea: {
				title: "sap.ui.core.UIArea",
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				}
			},
			"util/ValueStateSupport": {
				ui5: {
					libs: "sap.m"
				}
			}
		}
	};
});
