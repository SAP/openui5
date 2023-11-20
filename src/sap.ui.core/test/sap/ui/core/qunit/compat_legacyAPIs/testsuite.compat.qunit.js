sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for jquery.sap.global, jquery.sap.stubs and jquery-compat layer",
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
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs-jquery-ui-core_unavoidablySync": {
				bootCore: false
			},

			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: lazy-loading, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=1"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: lazy-loading, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=2"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: lazy-loading, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=lazy-loading&chunk=3"
			},

			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: stub-replacement, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=1"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: stub-replacement, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=2"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: stub-replacement, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?test-mode=stub-replacement&chunk=3"
			},

			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, lazy-loading, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=1"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, lazy-loading, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=2"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, lazy-loading, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=lazy-loading&chunk=3"
			},

			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, stub-replacement, chunk 1": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=1"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, stub-replacement, chunk 2": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=2"
			},
			/**
			 * @deprecated since 1.58
			 */
			"jquery.sap.stubs: async, stub-replacement, chunk 3": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery.sap.stubs.qunit.html?sap-ui-async=true&test-mode=stub-replacement&chunk=3"
			},
			"jquery-compat": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jquery-compat.qunit.html?sap-ui-log-level=warning"
			},
			"jQueryCompatExcludeInBootstrap": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/ExcludeJQueryCompatInBootstrap.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			},
			"jQueryCompatExcludeWithURLParameter": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/ExcludeJQueryCompat.qunit.html?sap-ui-excludeJQueryCompat=true",
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
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jQueryCompatWithVersion3xx.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			},
			"jQueryCompatWithOtherMajorVersion": {
				page: "test-resources/sap/ui/core/qunit/compat_legacyAPIs/jQueryCompatWithOtherMajorVersion.qunit.html",
				title: "Exclude jQuery Compat with data attribute in bootstrap"
			}
		}
	};
});
