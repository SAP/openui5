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
						"samples/components/routing": "test-resources/sap/ui/core/samples/components/routing/",
						"testdata": "test-resources/sap/ui/core/qunit/rule/testdata"
					}
				}
			},

			"config/modelPreloadAndEarlyRequests": {
				title: "QUnit Tests for 'modelPreloadAndEarlyRequests' rules",
				ui5 : {
					language : "en"
				},
				loader: {
					paths: {
						"samples/components/config/modelPreloadAndEarlyRequests":
							"test-resources/sap/ui/core/samples/components/config/"
							+ "modelPreloadAndEarlyRequests/"
					}
				}
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
				page: "test-resources/sap/ui/core/qunit/rule/app/syncXHRBootstrap.qunit.html?sap-language=en"
			},

			"app/syncXHRBootstrapDebug": {
				/*
				 * Test never worked as expected as the debug mode could not be activated via window["sap-ui-config"].
				 * Now, after introduction of sap/base/config, this works, but then the debug mode fails as it can't
				 * handle a bootstrap that uses separate script tags for ui5loader and ui5loader-autoconfig.
				 * The debug mode only re-runs a single script (ui5loader), but not the second one. Therefore, the
				 * ui5loader-dbg is missing important configuration (baseURI) and the test therefore fails.
				 */
				skip: true,
				title: "QUnit Tests for 'sync XHR bootstrap debug' rules",
				bootCore: false,
				page: "test-resources/sap/ui/core/qunit/rule/app/syncXHRBootstrapDebug.qunit.html?sap-language=en"
			},

			"app/controllerExtension": {
				title: "QUnit Tests for controller extensions",
				loader: {
					paths: {
						"mvc": "test-resources/sap/ui/core/qunit/mvc"
					}
				}
			},

			"app/lowerCaseControlsInViews": {
				title: "QUnit Tests for 'xmlViewLowerCaseControl' rule",
				loader: {
					paths: {
						"testdata": "test-resources/sap/ui/core/qunit/rule/testdata"
					}
				}
			},

			"misc/silentEventBus": {
				title: "QUnit Tests for 'silent event bus usage' rules"
			},

			"model/modelSupport": {
				title: "QUnit Tests for model rules"
			}
		}
	};
});
