sap.ui.define(function () {

	"use strict";
	return {
		name: "TestSuite for Support Assistant Rules",
		defaults: {
			qunit: {
				version: 2
			},
			ui5: {
				support: "silent",
				noConflict: true,
				debug: true,
				libs: "sap.m, sap.ui.support"
			}
		},
		tests: {
			"config/asynchronousXMLViews": {
				title: "QUnit Tests for async XML Views rules",
				loader: {
					paths: {
						"samples/components/routing": "test-resources/sap/ui/core/samples/components/routing/"
					}
				}
			},
			"app/globalApiUsage": {
				title: "QUnit Tests for global api usage rules"
			},
			"app/jquerySapUsage": {
				title: "QUnit Tests for jquery sap usage rules"
			},
			"misc/silentEventBus": {
				title: "QUnit Tests for silent event bus usage rules"
			}
		}
	};
});
