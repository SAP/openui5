/*global QUnit */
sap.ui.define(["sap/base/strings/hyphen"], function(hyphen) {
	"use strict";

	QUnit.test("hyphen", function(assert) {
		assert.expect(2);
		var sHyphen = hyphen("thisIsAnCamelCaseString");
		assert.equal(sHyphen, "this-is-an-camel-case-string", "hyphen function returns the right value");

		sHyphen = hyphen("thisIsAn1amelCaseÜtring");
		assert.equal(sHyphen, "this-is-an1amel-caseÜtring", "hyphen function returns the right value for numeric and umlauts chars");
	});
});
