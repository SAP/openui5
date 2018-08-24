sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for jquery.sap.global-compat and jquery.sap.stubs",
		defaults: {
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			autostart: false
		},
		tests: {
			"jquery.sap.global": {
				"title": "QUnit Page for jquery.sap.global",
				autostart: true
			},
			"jquery.sap.stubs: lazy-loading, chunk 1": {
				title: "Tests for jquery.sap.stubs: lazy-loading, chunk 1",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "lazy-loading",
					chunk: 1
				}
			},
			"jquery.sap.stubs: lazy-loading, chunk 2": {
				title: "Tests for jquery.sap.stubs: lazy-loading, chunk 2",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "lazy-loading",
					chunk: 2
				}
			},
			"jquery.sap.stubs: lazy-loading, chunk 3": {
				title: "Tests for jquery.sap.stubs: lazy-loading, chunk 3",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "lazy-loading",
					chunk: 3
				}
			},
			"jquery.sap.stubs: stub-replacement, chunk 1": {
				title: "Tests for jquery.sap.stubs: stub-replacement, chunk 1",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "stub-replacement",
					chunk: 1
				}
			},
			"jquery.sap.stubs: stub-replacement, chunk 2": {
				title: "Tests for jquery.sap.stubs: stub-replacement, chunk 2",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "stub-replacement",
					chunk: 2
				}
			},
			"jquery.sap.stubs: stub-replacement, chunk 3": {
				title: "Tests for jquery.sap.stubs: stub-replacement, chunk 3",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"test-mode": "stub-replacement",
					chunk: 3
				}
			},
			"jquery.sap.stubs: xx-async, lazy-loading, chunk 1": {
				title: "Tests for jquery.sap.stubs: xx-async, lazy-loading, chunk 1",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "lazy-loading",
					chunk: 1
				}
			},
			"jquery.sap.stubs: xx-async, lazy-loading, chunk 2": {
				title: "Tests for jquery.sap.stubs: xx-async, lazy-loading, chunk 2",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "lazy-loading",
					chunk: 2
				}
			},
			"jquery.sap.stubs: xx-async, lazy-loading, chunk 3": {
				title: "Tests for jquery.sap.stubs: xx-async, lazy-loading, chunk 3",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "lazy-loading",
					chunk: 3
				}
			},
			"jquery.sap.stubs: xx-async, stub-replacement, chunk 1": {
				title: "Tests for jquery.sap.stubs: xx-async, stub-replacement, chunk 1",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "stub-replacement",
					chunk: 1
				}
			},
			"jquery.sap.stubs: xx-async, stub-replacement, chunk 2": {
				title: "Tests for jquery.sap.stubs: xx-async, stub-replacement, chunk 2",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "stub-replacement",
					chunk: 2
				}
			},
			"jquery.sap.stubs: xx-async, stub-replacement, chunk 3": {
				title: "Tests for jquery.sap.stubs: xx-async, stub-replacement, chunk 3",
				module: "./jquery.sap.stubs.qunit",
				ui5: {
					"xx-async": true,
					"test-mode": "stub-replacement",
					chunk: 3
				}
			}
		}
	};
});
