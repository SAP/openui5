sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for sap.ui.core: GTP testcase CORE/CONTROLS",
		defaults: {
			qunit: {
				version: 2
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			BlockLayerUtils: {
				title: "QUnit Page for sap.ui.core.BlockLayerUtils",
				ui5: {
					libs: "sap.ui.commons, sap.m"
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			FieldGroup: {
				title: "QUnit page for FieldGroup",
				ui5: {
					libs: "sap.ui.layout,sap.ui.commons",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
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
				title: "QUnit Page for Icon control",
				ui5: {
					libs: "sap.ui.core"
				},
				qunit: {
					reorder: false
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			InvisibleText: {
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
				title: "QUnit Page for sap.ui.core.LocalBusyIndicator",
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
				title: "QUnit tests: sap.ui.core.ScrollBar",
				qunit: {
					reorder: false
				},
				sinon: {
					version: 4,
					qunitBridge: true
				}
			}
		}
	};
});
