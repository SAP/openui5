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
				libs: "sap.m, sap.ui.support"
			}
		},
		tests: {
			/**
			 * @deprecated As of version 1.119
			 */
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
			/**
			 * @deprecated As of version 1.111
			 */
			"app/globalApiUsage": {
				title: "QUnit Tests for 'global api usage' rules"
			},
			/**
			 * @deprecated As of version 1.119
			 */
			"app/jquerySapUsage": {
				title: "QUnit Tests for 'jquery sap usage' rules"
			},
			/**
			 * @deprecated As of version 1.119
			 */
			"app/syncFactoryLoading": {
				title: "QUnit Tests for 'sync fragment loading' rules"
			},
			/**
			 * @deprecated As of version 1.119
			 */
			"app/syncXHR": {
				title: "QUnit Tests for 'sync XHR' rules",
				qunit: {
					reorder: false
				}
			},
			/**
			 * @deprecated As of version 1.119
			 */
			"app/syncXHRBootstrap": {
				title: "QUnit Tests for 'sync XHR bootstrap' rules",
				bootCore: false,
				page: "test-resources/sap/ui/core/qunit/rule/app/syncXHRBootstrap.qunit.html?sap-language=en"
			},
			/**
			 * @deprecated As of version 1.119
			 */
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
			/**
			 * @deprecated
			 */
			"app/controllerExtension": {
				title: "QUnit Tests for controller extensions",
				loader: {
					paths: {
						"mvc": "test-resources/sap/ui/core/qunit/mvc"
					}
				}
			},
			/**
			 * @deprecated As of version 1.111
			 */
			"app/controllerExtension_legacyAPIs": {
				title: "QUnit Tests for controller extensions - legacy APIs",
				loader: {
					paths: {
						"mvc": "test-resources/sap/ui/core/qunit/mvc"
					}
				}
			},
			/**
			 * @deprecated As of version 1.111
			 */
			"app/deprecatedJSViewUsage": {
				title: "QUnit Tests for 'deprecated JSView usage' rule"
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
			"model/bindingPathSyntaxValidation": {
				ui5: {
					debug: false
				},
				title: "QUnit Tests for model rule: bindingPathSyntaxValidation"
			},
			"model/selectUsedInBoundAggregation": {
				ui5: {
					debug: false
				},
				title: "QUnit Tests for model rule: selectUsedInBoundAggregation"
			}
		}
	};
});
