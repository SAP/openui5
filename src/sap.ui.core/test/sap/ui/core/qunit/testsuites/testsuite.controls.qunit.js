sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Controls",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"

		},
		tests: {
			FieldGroup: {
				title: "QUnit page for FieldGroup",
				ui5: {
					libs: "sap.ui.layout,sap.ui.commons",
					theme: "sap_bluecrystal"
				}
			},
			HTML: {
				title: "QUnit Page for HTML control",
				loader: {
					paths : {
						"sap/ui/testlib" : "test-resources/sap/ui/core/qunit/testdata/uilib/"
					}
				},
				ui5: {
					libs: "sap.ui.core,sap.ui.testlib,sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
				}
			},
			HTMLinGWT: {
				title: "QUnit Page for HTML Container in GWT Usage",
				ui5: {
					libs: "sap.ui.core,sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
				}
			},
			Icon: {
				title: "sap.ui.core.Icon",
				ui5: {
					libs: "sap.ui.core"
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			InvisibleText: {
				title: "sap.ui.core.InvisibleText",
				ui5: {
					libs: "sap.ui.core",
					language: "en"
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			LocalBusyIndicator: {
				title: "sap.ui.core.LocalBusyIndicator",
				ui5: {
					libs: "sap.ui.commons, sap.m"
				},
				sinon: {
					version: 4,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			ScrollBar: {
				title: "sap.ui.core.ScrollBar",
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			TooltipBase: {
				title: "sap.ui.core.TooltipBase"
			},
			"util/SelectionModel": {
				title: "sap.ui.core.SelectionModel"
			}
		}
	};
});
