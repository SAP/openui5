sap.ui.define(function() {

	"use strict";

	return {
		name: "TestSuite for Topic: Control Framework",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"jquery.sap.ui": {
				page: "test-resources/sap/ui/core/qunit/jquery.sap.ui.qunit.html",
				title: "jquery.sap.ui",
				ui5: {
					libs: "sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			BlockLayerUtils: {
				title: "sap.ui.core.BlockLayerUtils",
				ui5: {
					libs: "sap.ui.commons, sap.m"
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			"util/BusyIndicator": {
				title: "sap.ui.core.BusyIndicator"
			},
			"util/BusyIndicatorNoCore": {
				title: "sap.ui.core.BusyIndicator (no core)",
				bootCore: false
			},
			"util/BusyIndicatorRTL": {
				title: "sap.ui.core.BusyIndicator (RTL)",
				ui5: {
					rtl: true
				}
			},
			ControlDefinition: {
				title: "sap.ui.core.Control (ControlDefinition)",
				ui5: {
					libs: "sap.m"
				},
				loader: {
					paths: {
						"testdata/core": "test-resources/sap/ui/core/qunit/"
					}
				}
			},
			ControlRenderer: {
				title: "sap.ui.core.Control (ControlRenderer)"
			},
			CustomStyleClassSupport: {
				title: "sap.ui.core.CustomStyleClassSupport",
				ui5: {
					libs: "sap.ui.testlib,sap.ui.legacy.testlib",
					theme: "sap_hcb"
				},
				loader: {
					paths: {
						"sap/ui/testlib": "test-resources/sap/ui/core/qunit/testdata/uilib/",
						"sap/ui/legacy/testlib": "test-resources/sap/ui/core/qunit/testdata/legacy-uilib/"
					}
				}
			},
			Element: {
				title: "sap.ui.core.Element",
				loader:{
					paths:{
						"testdata/core": "test-resources/sap/ui/core/qunit/"
					}
				},
				module: [
					"testdata/core/Element_base.qunit",
					"testdata/core/Element_contextualSettings.qunit",
					"testdata/core/Element_data.qunit",
					"testdata/core/Element_delegates.qunit",
					"testdata/core/Element_dependents.qunit",
					"testdata/core/Element_destroy.qunit",
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
					libs: "sap.ui.commons",
					language: "en"
				}
			},
			"util/Popup": {
				title: "sap.ui.core.Popup",
				page: "test-resources/sap/ui/core/qunit/util/Popup.qunit.html"
			},
			RenderManager: {
				title: "sap.ui.core.RenderManager"
			},
			ResizeHandler: {
				title: "sap.ui.core.ResizeHandler",
				/* own page kept because of custom styles and DOM (but uses runTest.js) */
				page: "test-resources/sap/ui/core/qunit/ResizeHandler.qunit.html",
				ui5: {
					theme: "base"
				}
			},
			StashedControlSupport: {
				sinon: {
					version: 4
				},
				title: "sap.ui.core.StashedControlSupport",
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
					libs: "sap.ui.commons"
				}
			}
		}
	};
});
