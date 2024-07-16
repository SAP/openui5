sap.ui.define(function() {

	"use strict";
	return {
		name: "TestSuite for Topic: Foundation Enablement",
		defaults: {
			module: "test-resources/sap/ui/core/qunit/{name}.qunit"
		},
		tests: {
			"base/assert": {
				title: "QUnit Page for assert"
			},

			"base/Log": {
				title: "QUnit Page for Log"
			},

			"base/strings/camelize": {
				title: "QUnit Page for camelize"
			},

			"base/strings/capitalize": {
				title: "QUnit Page for capitalize"
			},

			"base/strings/whitespaceReplacer": {
				title: "QUnit Page for whitespaceReplacer"
			},

			"base/strings/escapeRegExp": {
				title: "QUnit Page for escapeRegExp"
			},

			"base/strings/formatMessage": {
				title: "QUnit Page for formatMessage"
			},

			"base/strings/hash": {
				title: "QUnit Page for hash"
			},

			"base/strings/hyphenate": {
				title: "QUnit Page for hyphenate"
			},

			"base/strings/toHex": {
				title: "QUnit Page for toHex"
			},

			"base/util/array/diff": {
				title: "QUnit Page for diff"
			},

			"base/util/array/uniqueSort": {
				title: "QUnit Page for uniqueSort"
			},

			"base/util/deepClone": {
				title: "QUnit Page for deepClone"
			},

			"base/util/deepEqual": {
				title: "QUnit Page for deepEqual"
			},

			"base/util/deepExtend": {
				title: "QUnit Page for deepExtend"
			},

			"base/util/Deferred": {
				title: "QUnit Page for Deferred"
			},

			"base/util/defineLazyProperty": {
				title: "QUnit Page for defineLazyProperty"
			},

			"base/util/each": {
				title: "QUnit Page for each"
			},

			"base/util/extend": {
				title: "QUnit Page for extend"
			},

			"base/util/fetch": {
				title: "QUnit Page for fetch"
			},

			"base/util/isEmptyObject": {
				title: "QUnit Page for isEmptyObject"
			},

			"base/util/isPlainObject": {
				title: "QUnit Page for isPlainObject"
			},

			"base/util/JSTokenizer": {
				title: "QUnit Page for JSTokenizer"
			},

			"base/util/merge": {
				title: "QUnit Page for merge"
			},

			"base/util/now": {
				title: "QUnit Page for now"
			},

			"base/util/ObjectPath": {
				title: "QUnit Page for ObjectPath"
			},

			"base/util/resolveReference": {
				title: "QUnit Page for resolveReference",
				loader: {
					paths: {
						"util": "test-resources/sap/ui/core/qunit/base/util/"
					}
				}
			},

			"base/util/uid": {
				title: "QUnit Page for uid"
			},

			"ui/base/syncXHRFix-error-handling": {
				title: "QUnit Page for syncXHRFix (error handling)"
			},

			"util/Storage": {
				title: "QUnit Page for Storage"
			},

			"util/SapPcpWebSocket": {
				title: "QUnit Page for SapPcpWebSocket"
			},

			"util/WebSocket": {
				title: "QUnit Page for WebSocket"
			}
		}
	};
});
