/*global QUnit */
sap.ui.define(["sap/ui/documentation/sdk/controller/util/URLUtil"], function (URLUtil) {
	"use strict";

	QUnit.module("API");

	var BASE_URL = "https://domain.com/",
		URLS = {
			"DOCUMENTATION_SECTION": {
				"NON_SEO_FORMAT": {
					"NON_VERSIONED": BASE_URL + "#/topic/99ac68a5b1c3416ab5c84c99fefa250d",
					"VERSIONED": BASE_URL + "1.71.0/#/topic/99ac68a5b1c3416ab5c84c99fefa250d"
				},
				"SEO_FORMAT": {
					"NON_VERSIONED": BASE_URL + "topic/99ac68a5b1c3416ab5c84c99fefa250d",
					"VERSIONED": BASE_URL + "1.71.0/topic/99ac68a5b1c3416ab5c84c99fefa250d"
				}
			},
			"APIREF_SECTION": {
				"NON_SEO_FORMAT": {
					"NON_VERSIONED_V1": BASE_URL  + "#/api/sap.ui.core.routing.Targets/methods/display",
					"NON_VERSIONED_V2": BASE_URL  + "#/api/sap.ui.core.routing.Targets%23methods/display"
				},
				"SEO_FORMAT": {
					"NON_VERSIONED_V1": BASE_URL + "api/sap.ui.core.routing.Targets/methods/display",
					"NON_VERSIONED_V2": BASE_URL + "api/sap.ui.core.routing.Targets#methods/display"
				}
			},
			"LIBRARY_RESOURCE": BASE_URL + "resources/sap/ui/core/library.js"
		};

	QUnit.test("parseVersion", function (assert) {
		assert.strictEqual(URLUtil.parseVersion(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.VERSIONED), "1.71.0");
		assert.strictEqual(URLUtil.parseVersion(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.VERSIONED), "1.71.0");
	});

	QUnit.test("removeVersion", function (assert) {
		assert.strictEqual(URLUtil.removeVersion(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.VERSIONED),
			URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED);
		assert.strictEqual(URLUtil.removeVersion(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.VERSIONED),
			URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED);

		assert.strictEqual(URLUtil.removeVersion(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED),
			URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED);
		assert.strictEqual(URLUtil.removeVersion(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED),
			URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED);
	});

	QUnit.test("requestsDemokitView", function (assert) {
		assert.ok(URLUtil.requestsDemokitView(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED));
		assert.ok(URLUtil.requestsDemokitView(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.VERSIONED));

		assert.ok(URLUtil.requestsDemokitView(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED));
		assert.ok(URLUtil.requestsDemokitView(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.VERSIONED));

		assert.notOk(URLUtil.requestsDemokitView(URLS.LIBRARY_RESOURCE));
	});

	QUnit.test("hasSEOOptimizedFormat", function (assert) {
		assert.ok(URLUtil.hasSEOOptimizedFormat(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED));
		assert.ok(URLUtil.hasSEOOptimizedFormat(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.VERSIONED));

		assert.notOk(URLUtil.hasSEOOptimizedFormat(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED));
		assert.notOk(URLUtil.hasSEOOptimizedFormat(URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.VERSIONED));

		assert.notOk(URLUtil.hasSEOOptimizedFormat(URLS.LIBRARY_RESOURCE));
	});

	QUnit.test("convertToNonSEOFormat documentation section", function (assert) {
		assert.strictEqual(URLUtil.convertToNonSEOFormat(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.NON_VERSIONED),
			URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.NON_VERSIONED);

		assert.strictEqual(URLUtil.convertToNonSEOFormat(URLS.DOCUMENTATION_SECTION.SEO_FORMAT.VERSIONED),
			URLS.DOCUMENTATION_SECTION.NON_SEO_FORMAT.VERSIONED);
	});

	QUnit.test("convertToNonSEOFormat apiref section", function (assert) {
		/* assert.strictEqual(URLUtil.convertToNonSEOFormat(URLS.APIREF_SECTION.SEO_FORMAT.NON_VERSIONED_V1),
			URLS.APIREF_SECTION.NON_SEO_FORMAT.NON_VERSIONED_V1); */

		assert.strictEqual(URLUtil.convertToNonSEOFormat(URLS.APIREF_SECTION.SEO_FORMAT.NON_VERSIONED_V2),
			URLS.APIREF_SECTION.NON_SEO_FORMAT.NON_VERSIONED_V2);
	});

});
