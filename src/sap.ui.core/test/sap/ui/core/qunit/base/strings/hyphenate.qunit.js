/*global QUnit */
sap.ui.define(["sap/base/strings/hyphenate"], function(hyphenate) {
	"use strict";

	QUnit.module("hyphenate");

	QUnit.test("hyphenate", function(assert) {
		assert.expect(2);
		var sHyphen = hyphenate("thisIsAnCamelCaseString");
		assert.equal(sHyphen, "this-is-an-camel-case-string", "hyphen function returns the right value");

		sHyphen = hyphenate("thisIsAn1amelCaseÜtring");
		assert.equal(sHyphen, "this-is-an1amel-caseÜtring", "hyphen function returns the right value for numeric and umlauts chars");
	});
});
