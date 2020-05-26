sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for jquery.sap.global and jquery.sap.stubs",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			}
		},
		tests: {

			"jquery.sap.global": {
				title: "QUnit Page for jquery.sap.global"
			},
			"jquery.sap.stubs-jquery-ui-core": {
				bootCore: false
			},

			"jquery.sap.stubs: lazy-loading, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=1"
			},
			"jquery.sap.stubs: lazy-loading, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=2"
			},
			"jquery.sap.stubs: lazy-loading, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=3"
			},

			"jquery.sap.stubs: stub-replacement, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=1"
			},
			"jquery.sap.stubs: stub-replacement, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=2"
			},
			"jquery.sap.stubs: stub-replacement, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=3"
			},

			"jquery.sap.stubs: async, lazy-loading, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=1"
			},
			"jquery.sap.stubs: async, lazy-loading, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=2"
			},
			"jquery.sap.stubs: async, lazy-loading, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=3"
			},

			"jquery.sap.stubs: async, stub-replacement, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=1"
			},
			"jquery.sap.stubs: async, stub-replacement, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=2"
			},
			"jquery.sap.stubs: async, stub-replacement, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=3"
			},
			"jquery-compat": {
				title: "Compatibility Layer for jQuery 3",
				ui5: {
					loglevel: "warning"
				}
			},
			"jQueryCompatExcludeInBootstrap": {
				page: "test-resources/sap/ui/core/qunit/compat/ExcludeJQueryCompatInBootstrap.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			},
			"jQueryCompatExcludeWithURLParameter": {
				page: "test-resources/sap/ui/core/qunit/compat/ExcludeJQueryCompat.qunit.html?sap-ui-excludeJQueryCompat=true",
				title: "Exclude jQuery Compat with url parameter"
			},
			"jQueryCompatExcludeWithGlobalConfig": {
				title: "Exclude jQuery Compat with global config",
				module: "./ExcludeJQueryCompat.qunit",
				ui5: {
					"excludeJQueryCompat": true
				}
			},
			"jQueryCompatWithVersion3xx": {
				page: "test-resources/sap/ui/core/qunit/compat/jQueryCompatWithVersion3xx.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			},
			"jQueryCompatWithOtherMajorVersion": {
				page: "test-resources/sap/ui/core/qunit/compat/jQueryCompatWithOtherMajorVersion.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			}
		}
	};
});
