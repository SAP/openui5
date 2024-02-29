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
			EnabledPropagator: {
				title: "sap.ui.core.EnabledPropagator",
				qunit: {
					reorder: false
				}
			},
			FieldGroup: {
				qunit: {
					reorder: false
				},
				title: "QUnit page for FieldGroup",
				ui5: {
					libs: "sap.ui.layout,sap.m"
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
					libs: "sap.ui.core,sap.ui.testlib,sap.ui.layout",
					theme: "sap_bluecrystal"
				},
				qunit: {
					reorder: false
				}
			},
			HTMLinGWT: {
				title: "QUnit Page for HTML Container in GWT Usage",
				ui5: {
					libs: "sap.ui.core,sap.m"
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
					libs: "sap.m"
				},
				sinon: {
					version: 4,
					qunitBridge: true,
					useFakeTimers: false
				}
			},
			/**
			 * @deprecated as of version 1.56
			 */
			ScrollBar: {
				title: "sap.ui.core.ScrollBar",
				sinon: {
					version: 4,
					qunitBridge: true
				}
			},
			/* Commented out until unstable voter issue are fixed.
			TooltipBase: {
				title: "sap.ui.core.TooltipBase"
			},*/
			"util/SelectionModel": {
				title: "sap.ui.core.SelectionModel"
			}
		}
	};
});
