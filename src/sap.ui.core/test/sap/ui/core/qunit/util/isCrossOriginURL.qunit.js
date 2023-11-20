/* global QUnit */
sap.ui.define(["sap/ui/util/isCrossOriginURL"], function(isCrossOriginURL) {
	"use strict";
	QUnit.module("sap/ui/util/isCrossOriginURL");

	QUnit.test("When called with the URL of the current page...", function(assert) {
		var testUrl = window.location.href;
		assert.strictEqual(isCrossOriginURL(testUrl), false, "...it should return 'false'");
	});

	QUnit.test("When called with an absolute URL from the same origin...", function(assert) {
		var testUrl = window.location.origin + "/index.html";
		assert.strictEqual(isCrossOriginURL(testUrl), false, "...it should return 'false'");
	});

	QUnit.test("When called with a server-absolute URL...", function(assert) {
		var testUrl = "/assets/main.css";
		assert.strictEqual(isCrossOriginURL(testUrl), false, "...it should return 'false'");
	});

	QUnit.test("When called with a relative URL...", function(assert) {
		var testUrl = "assets/main.css";
		assert.strictEqual(isCrossOriginURL(testUrl), false, "...it should return 'false'");
	});

	QUnit.test("When called with a URL from a different origin...", function(assert) {
		var testUrl = "https://example.org/index.html";
		assert.strictEqual(isCrossOriginURL(testUrl), true, "...it should return 'true'");
	});

	QUnit.test("When called with a URL with an opaque origin...", function(assert) {
		var testUrl = "blob:some-blob-url";
		assert.strictEqual(isCrossOriginURL(testUrl), true, "...it should return 'true'");
	});

	QUnit.test("When called with a URL that is cross-origin to the page, but same origin to the baseURI...", function(assert) {
		var baseUrl = "https://example.org/";
		this.stub(Node.prototype, "baseURI").value(baseUrl);
		assert.strictEqual(document.baseURI, baseUrl, "[precondition] ...then document.baseURI should be mocked");

		var testUrl = "https://example.org/index.html";
		assert.strictEqual(isCrossOriginURL(testUrl), true, "...isCrossOriginURL should return 'true'");
	});

	// not possible as location / origin can't be redefined
	QUnit.skip("When called while the current page has an opaque origin...", function(assert) {
		this.stub(window, "origin").value("null");
		var testUrl = "https://example.org/index.html";

		assert.strictEqual(isCrossOriginURL(testUrl), true, "...it should return 'true'");
	});

	// not possible as location / origin can't be redefined
	QUnit.skip("When both, current page and test URL have an opaque origin...", function(assert) {
		this.stub(window.location, "origin").value("null");
		var testUrl = "blob:some-blob-url";

		assert.strictEqual(isCrossOriginURL(testUrl), true, "...it should return 'true'");
	});
});