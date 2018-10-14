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
			}

		}
	};
});
