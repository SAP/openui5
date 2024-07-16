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

			"jquery-mobile-custom": {
				title: "jquery-mobile-custom",

				sinon: {
					qunitBridge: true
				},

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
