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
				title: "QUnit Tests for 'async XML Views' rules",
				loader: {
					paths: {
						"samples/components/routing": "test-resources/sap/ui/core/samples/components/routing/"
					}
				}
			},
			"app/globalApiUsage": {
				title: "QUnit Tests for 'global api usage' rules"
			},
			"app/jquerySapUsage": {
				title: "QUnit Tests for 'jquery sap usage' rules"
			},
			"app/syncFactoryLoading": {
				title: "QUnit Tests for 'sync fragment loading' rules"
			},
			"app/syncXHR": {
				title: "QUnit Tests for 'sync XHR' rules",
				qunit: {
					reorder: false
				}
			},
			"app/syncXHRBootstrap": {
				title: "QUnit Tests for 'sync XHR bootstrap' rules",
				bootCore: false,
				page: "test-resources/sap/ui/core/qunit/rule/app/syncXHRBootstrap.qunit.html"
			},
			"app/syncXHRBootstrapDebug": {
				title: "QUnit Tests for 'sync XHR bootstrap debug' rules",
				bootCore: false,
				page: "test-resources/sap/ui/core/qunit/rule/app/syncXHRBootstrapDebug.qunit.html"
			},
			"app/controllerExtension": {
				title: "QUnit Tests for controller extensions",
				loader: {
					paths: {
						"mvc": "test-resources/sap/ui/core/qunit/mvc"
					}
				}
			},
			"misc/silentEventBus": {
				title: "QUnit Tests for 'silent event bus usage' rules"
			},
			"model/bindingPathSyntaxValidation": {
				title: "QUnit Tests for 'bindingPathSyntaxValidation' rules"
			}
		}
	};
});
