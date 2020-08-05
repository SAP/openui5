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
			"dom/activeElementFix": {
				title: "sap.ui.dom.activeElementFix"
			},
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
			"jquery.sap.mobile": {
				title: "jquery.sap.mobile: 1",
				ui5: {
					theme: "base"
				}
			},
			"jquery.sap.mobile2": {
				title: "jquery.sap.mobile: 2",
				ui5: {
					theme: "base"
				}
			},
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
				bootCore: false
			},
			"jquery-mobile-custom_msie": {
				title: "jquery-mobile-custom_msie",
				sinon: {
					qunitBridge: true
				},
				bootCore: false
			},
			"jquery-mobile-custom_edge": {
				title: "jquery-mobile-custom_edge",
				sinon: {
					qunitBridge: true
				},
				bootCore: false
			}
		}
	};
});
