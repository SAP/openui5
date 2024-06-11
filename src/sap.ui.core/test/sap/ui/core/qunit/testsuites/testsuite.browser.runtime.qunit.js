sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Browser Runtime",
		defaults: {
			loader:{
				paths:{
					"testdata/core": "test-resources/sap/ui/core/qunit/"
				}
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"dom/getComputedStyleFix": {
				title: "sap.ui.dom.getComputedStyleFix"
			},
			"dom/includeScript": {
				title: "sap.ui.dom.includeScript"
			},
			"dom/includeStylesheet": {
				title: "sap.ui.dom.includeStylesheet"
			},
			"ui/Device": {
				title: "sap.ui.Device"
			},
			"util/ActivityDetection": {
				title: "sap.ui.util.ActivityDetection"
			},
			"util/Mobile": {
				title: "sap.ui.util.Mobile"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.mobile": {
				title: "jquery.sap.mobile: 1",
				ui5: {
					theme: "base"
				}
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.mobile2": {
				title: "jquery.sap.mobile: 2",
				ui5: {
					theme: "base"
				}
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.mobile3": {
				title: "jquery.sap.mobile: 3",
				ui5: {
					theme: "base"
				}
			},
			"jquery-mobile-custom": {
				title: "jquery-mobile-custom",
				sinon: {
					qunitBridge: true
				},
				/**
				 * @deprecated
				 */
				bootCore: false,
				beforeBootstrap: "test-resources/sap/ui/core/qunit/jquery-mobile-custom.beforeBootstrap"
			},
			"util/isCrossOriginURL": {
				title: "sap/ui/util/isCrossOriginURL"
			},
			"util/openWindow": {
				title: "sap/ui/util/openWindow"
			}
		}
	};
});
